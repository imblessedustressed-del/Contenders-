// Contenders nightly league runner (Supabase edge function).
// Called every 15 minutes by pg_cron; it only acts during fight night (10:40-11:59 PM Central) unless ?force=1.
// Fights run from 10:40 PM; booking happens at the midnight pass (11:50 PM on), after that night's fights (owner, Nov 12).
// Each pass: 1) vacate belts of retired champions, 2) fight every scheduled bout dated today or earlier,
// 3) book next bouts: each human fighter vs a bot in his division and region (Contenders or Bare Knuckles, 25 rounds), and the remaining bots against each other,
// on the division's next fight night: tonight's fighters get next week's night; a night less than 24 hours away (tomorrow) skips to the week after.
// This file is bundled by build.sh into /runner-lib.js on the site; the deployed edge function (index.ts) downloads it
// and the engine (/engine-core.js) on every run, so pushing the site updates the runner. No redeploy needed.
import { fightOne } from "./fight.ts";
import { BK_TYPES, GYMS, makeFighter, PER_DIV, REG_TYPES, rnd, scoutedPlan, shouldRetire, learn, typeOf, defaultGene } from "./botgen.ts";
import { challengeRelease, Release, resultRelease, retireRelease, signRelease } from "./press.ts";

let sb: any; // set by handle()
const MAX_FIGHTS = 250; // per pass; the next pass picks up the rest
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const chicago = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute };
};
const addDays = (d: string, n: number) => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const weekday = (d: string) => DAYS[new Date(d + "T12:00:00Z").getUTCDay()];
function nextNight(C: any, div: string, today: string) {
  const night = (C.FIGHT_NIGHT as Record<string, string>)[div];
  if (!night) return null;
  for (let n = 1; n <= 7; n++) { const d = addDays(today, n); if (weekday(d) === night) return n === 1 ? addDays(d, 7) : d; }
  return null;
}
const pk = (u: string, f: string) => u + ":" + f;
const gk = (u: string) => "b" + u.slice(-2).replace(/^b/, ""); // bot gym key: ...00b4 -> b4
const nm = (F: any) => String(F?.name || "?").trim();
async function postReleases(list: Release[], log: string[]) {
  for (const r of list) {
    const t = await sb.from("topics").insert({ forum: "press", title: r.title.slice(0, 120), author: r.author }).select("id").single();
    if (t.error) { log.push("press: " + t.error.message); return; }
    const p = await sb.from("posts").insert({ topic_id: t.data.id, author: r.author, body: r.body });
    if (p.error) { log.push("press: " + p.error.message); return; }
  }
}
const cardEntry = (F: any) => ({
  region: F.region || null, rec: F.rec, rating: F.rating || 0, status: F.status || 0, streak: F.streak || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0,
  hist: (F.hist || []).slice(0, 25).map((h: any) => Object.fromEntries(["opp", "oh", "div", "belt", "date", "week", "res", "score", "icon", "plan", "ogym", "bout", "earned"].map((k) => [k, h[k] ?? null]))),
});
async function all(q: () => any) { // page through a select
  const out: any[] = [];
  for (let from = 0; ; from += 1000) { const { data, error } = await q().range(from, from + 999); if (error) throw error; out.push(...data); if (data.length < 1000) return out; }
}

export async function handle(req: Request, client: any, C: any): Promise<Response> {
  sb = client;
  const url = new URL(req.url);
  // the caller must send the key kept in the private runner_key table (only pg_cron and the service role can read it)
  const { data: key } = await sb.from("runner_key").select("k").eq("id", 1).maybeSingle();
  if (!key?.k || req.headers.get("x-runner-key") !== key.k) return new Response("no", { status: 401 });
  const { date: today, mins } = chicago();
  const force = url.searchParams.get("force") === "1";
  const bookOnly = url.searchParams.get("book") === "1";
  if (!force && mins < 22 * 60 + 40) return Response.json({ skipped: "not fight time", today });
  const { data: rid } = await sb.rpc("runner_begin");
  if (!rid) return Response.json({ skipped: "another pass is running" });
  const log: string[] = [];
  let ran = 0, booked = 0, vacated = 0, leftDue = 0;
  const tonight: any[] = [];
  try {
    // 1) retired champions lose their belts
    const vac = await sb.rpc("vacate_retired_champs");
    if (vac.error) log.push("vacate: " + vac.error.message); else vacated = (vac.data || []).length;

    // load gyms
    const profs = await all(() => sb.from("profiles").select("id,gym,is_bot"));
    const P: Record<string, any> = Object.fromEntries(profs.map((p) => [p.id, p]));
    const states = await all(() => sb.from("gym_state").select("user_id,data"));
    const S: Record<string, any> = Object.fromEntries(states.map((s) => [s.user_id, s.data || {}]));

    // 2) fight due bouts
    if (!bookOnly) {
      const due = await all(() => sb.from("bouts").select("*").eq("status", "scheduled").lte("fight_date", today).order("fight_date").order("id"));
      for (const B of due) {
        if (ran >= MAX_FIGHTS) { leftDue++; continue; }
        if (B.belt) { log.push(`bout ${B.id}: title fight, left for the commissioner`); continue; }
        const FA = S[B.red_user]?.[B.red_fid], FB = S[B.blue_user]?.[B.blue_fid];
        if (!FA || !FB) { log.push(`bout ${B.id}: fighter missing`); continue; }
        try {
          // bots scout the opponent's public record and adjust tonight's plan
          const FA2 = P[B.red_user]?.is_bot ? { ...FA, plan: scoutedPlan(FA, gk(B.red_user), FB) || FA.plan } : FA;
          const FB2 = P[B.blue_user]?.is_bot ? { ...FB, plan: scoutedPlan(FB, gk(B.blue_user), FA) || FB.plan } : FB;
          const o = fightOne(C, B, { F: FA2, gym: P[B.red_user]?.gym || "" }, { F: FB2, gym: P[B.blue_user]?.gym || "" });
          [[B.red_user, FA, 0], [B.blue_user, FB, 1]].forEach(([u, F0, i]: any) => {
            if (!P[u]?.is_bot) return;
            const A = o.after[i]; A.plan = F0.plan; // keep his own plan, then learn from the result
            const w = o.summary.w; learn(A, gk(u), w == null ? null : w === i, !o.summary.decision);
          });
          const { data, error } = await sb.rpc("commit_bout", { p_bout: B.id, p_summary: o.summary, p_result: o.result, p_mgr: o.mgr, p_after: o.after, p_cards: o.after.map(cardEntry) });
          if (error) { log.push(`bout ${B.id}: ${error.message}`); continue; }
          if (data === "done") {
            ran++;
            tonight.push({ B, o, FA, FB });
            // keep our in-memory copy current (retired fighters leave the roster)
            [[B.red_user, B.red_fid, o.after[0]], [B.blue_user, B.blue_fid, o.after[1]]].forEach(([u, k, F]: any) => {
              if (F.retireAfter) { S[u].roster = (S[u].roster || []).filter((x: string) => x !== k); delete S[u][k]; } else S[u][k] = F;
            });
          }
        } catch (e) { log.push(`bout ${B.id}: ${(e as Error).message}`); }
      }
    }

    // press releases about tonight's results: every fight with a manager's fighter, plus a few big bot results
    if (tonight.length) {
      const rel: Release[] = []; let botPosts = 0;
      for (const { B, o, FA, FB } of tonight) {
        const w = o.summary.w; if (w == null) continue;
        const Wu = w === 0 ? B.red_user : B.blue_user, Lu = w === 0 ? B.blue_user : B.red_user;
        const WF = w === 0 ? FA : FB, LF = w === 0 ? FB : FA;
        const vsHuman = !P[B.red_user]?.is_bot || !P[B.blue_user]?.is_bot;
        const ko = !o.summary.decision, rt = o.summary.ratings, upset = rt[w] <= rt[1 - w] - 2;
        if (!vsHuman && !(ko || upset)) continue;
        if (!vsHuman && (botPosts >= 4 || Math.random() < 0.5)) continue;
        const r = resultRelease({ botWon: !!P[Wu]?.is_bot, vsHuman, ko, upset, W: nm(WF), WG: P[Wu]?.gym || "", L: nm(LF), LG: P[Lu]?.gym || "", how: o.summary.how, authorWin: Wu, authorLose: Lu });
        if (r && P[r.author]?.is_bot) { rel.push(r); if (!vsHuman) botPosts++; }
      }
      await postReleases(rel, log);
    }

    // 3) book next bouts at the midnight pass (only once every due fight is done)
    if (leftDue === 0 && (bookOnly || mins >= 23 * 60 + 50)) {
      const open = await all(() => sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid").neq("status", "done"));
      const busy = new Set<string>(); open.forEach((b) => { busy.add(pk(b.red_user, b.red_fid)); busy.add(pk(b.blue_user, b.blue_fid)); });
      // bot gyms keep PER_DIV active fighters per division in each region: retire the washed up, sign replacements
      const pubs = await all(() => sb.from("gym_public").select("user_id,data").in("user_id", Object.keys(S).filter((u) => P[u]?.is_bot && GYMS[gk(u)])));
      const PUB: Record<string, any> = Object.fromEntries(pubs.map((r) => [r.user_id, r.data || {}]));
      const taken = new Set<string>(); Object.values(S).forEach((d: any) => (d.roster || []).forEach((k: string) => d[k]?.name && taken.add(nm(d[k]))));
      const allBots: any[] = []; Object.entries(S).forEach(([u, d]: any) => { if (P[u]?.is_bot) (d.roster || []).forEach((k: string) => d[k] && allBots.push({ u, k, F: d[k] })); });
      const mgmt: Release[] = []; let signed = 0, retiredN = 0;
      for (const [u, d] of Object.entries(S) as any) {
        const key = gk(u); if (!P[u]?.is_bot || !GYMS[key] || !PUB[u]) continue;
        let changed = false; const card = PUB[u];
        for (const reg of ["", "bk"]) for (let di = 0; di < C.DIVS.length; di++) {
          const [div, lim] = C.DIVS[di], prev = di ? C.DIVS[di - 1][1] : 0;
          const mine = () => (d.roster || []).filter((k: string) => d[k] && d[k].div === div && (d[k].region === "bk" ? "bk" : "") === reg);
          for (const k of mine()) {
            const F = d[k], why = busy.has(pk(u, k)) ? null : shouldRetire(F); if (!why) continue;
            d.roster = d.roster.filter((x: string) => x !== k); delete d[k];
            d.retired = [{ ...F, fid: k, div, retiredOn: today, why }, ...(d.retired || [])];
            card.fighters = (card.fighters || []).filter((f: any) => f.id !== k);
            card.retired = [{ id: "r0", name: F.name, div, region: F.region || null, rec: F.rec, rating: F.rating || 0, status: F.status || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0, hgt: F.hgt, home: F.home || "", titles: [], active: false, hist: [] }, ...(card.retired || [])].map((x: any, i: number) => ({ ...x, id: "r" + i }));
            changed = true; retiredN++;
            if (retiredN <= 3) mgmt.push(retireRelease(u, { N: nm(F), G: P[u].gym, rec: `${F.rec[0]}-${F.rec[1]}-${F.rec[2]}`, why, div }));
          }
          const types = reg ? BK_TYPES : REG_TYPES;
          let guard = 0;
          while (mine().length < PER_DIV && guard++ < 10) {
            const have = mine().map((k: string) => typeOf(d[k]));
            const t = [...types].sort((a, b) => have.filter((x: any) => x === a).length - have.filter((x: any) => x === b).length)[0];
            // inherit the plan gene of the best fighter of this type in this division and region, with a small mutation
            const peers = allBots.filter((x) => x.F.div === div && (x.F.region === "bk" ? "bk" : "") === reg && typeOf(x.F) === t && (x.F.rec[0] + x.F.rec[1] + x.F.rec[2]) >= 3)
              .sort((a, b) => (b.F.rec[0] - b.F.rec[1]) - (a.F.rec[0] - a.F.rec[1]));
            const g = { ...(peers[0] ? defaultGene(peers[0].F, gk(peers[0].u)) : defaultGene({}, key)) };
            if (Math.random() < 0.5) g[Math.random() < 0.5 ? "a" : "d"] += rnd([-1, 1]);
            const home = rnd(GYMS[key].towns);
            const NF = makeFighter(C, t, div, lim, prev, key, taken, home, g);
            if (!NF) { log.push(`could not build a ${t} for ${P[u].gym} at ${div}`); break; }
            const nk = "n" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
            d[nk] = NF; d.roster = [...(d.roster || []), nk];
            card.fighters = [...(card.fighters || []), { id: nk, region: NF.region || null, name: NF.name, nick: NF.nick, home, div, hgt: NF.hgt, w: C.natWeight ? C.natWeight(NF) : 0, mw: C.minWeight(NF),
              rec: [0, 0, 0, 0], hist: [], plan: NF.planName, train: NF.train, active: true, rating: 0, status: 0, streak: 0, titles: [], earn: 0, fans: 0, ppv: 0 }];
            allBots.push({ u, k: nk, F: NF });
            changed = true; signed++;
            if (signed <= 3) mgmt.push(signRelease(u, { N: NF.name, G: P[u].gym, type: t.replace("BK ", ""), home, div, bk: reg ? " in the Bare Knuckles region" : "" }));
          }
        }
        if (changed) {
          const a = await sb.from("gym_state").update({ data: d }).eq("user_id", u);
          const b = await sb.from("gym_public").update({ data: card }).eq("user_id", u);
          if (a.error || b.error) log.push(`roster ${P[u].gym}: ${(a.error || b.error)!.message}`);
        }
      }
      if (signed || retiredN) log.push(`bots: ${retiredN} retired, ${signed} signed`);
      const free = (bot: boolean) => {
        const out: any[] = [];
        for (const [u, d] of Object.entries(S)) {
          if (!P[u] || !!P[u].is_bot !== bot) continue;
          for (const k of (d.roster || [])) { const F = d[k]; if (F && F.div && !busy.has(pk(u, k))) out.push({ u, k, F, gym: P[u].gym, reg: F.region === "bk" ? "bk" : "" }); }
        }
        return out;
      };
      const rows: any[] = [];
      const book = (a: any, b: any, date: string, botOnly: boolean) => {
        const ra = a.F.rating || 0, rb = b.F.rating || 0, contender = Math.max(ra, rb) >= 3;
        const v: any = C.pickVenue(C.venueTier(a.F.div, ra, rb, null, 1, contender));
        v.tv = C.broadcastTier(null, 1, contender);
        rows.push({ fight_date: date, div: a.F.div, red_user: a.u, red_fid: a.k, blue_user: b.u, blue_fid: b.k, belt: null, rounds: a.reg === "bk" ? 25 : 12, region: a.reg || null, status: "scheduled", venue: v, bot_only: botOnly });
        busy.add(pk(a.u, a.k)); busy.add(pk(b.u, b.k));
      };
      const bots = free(true);
      // humans first: closest-rated bot in his division, preferring bots he hasn't fought and a different gym than last time
      for (const h of free(false)) {
        const date = nextNight(C, h.F.div, today); if (!date) continue;
        const seen = new Set((h.F.hist || []).filter((x: any) => x.bout).map((x: any) => x.opp + "|" + x.ogym));
        const lastGym = ((h.F.hist || []).find((x: any) => x.bout) || {}).ogym;
        const cands = bots.filter((b) => b.F.div === h.F.div && b.reg === h.reg && !busy.has(pk(b.u, b.k))); // same division and region
        if (!cands.length) { log.push(`no bot free for ${h.F.name} (${h.F.div})`); continue; }
        const score = (b: any) => Math.abs((b.F.rating || 0) - (h.F.rating || 0)) + (seen.has(b.F.name + "|" + b.gym) ? 3 : 0) + (b.gym === lastGym ? 1 : 0) + Math.random() * 0.9;
        cands.sort((x, y) => score(x) - score(y));
        book(h, cands[0], date, false);
      }
      // then the bots against each other: same division, different gyms, closest rating
      const byDiv: Record<string, any[]> = {};
      bots.filter((b) => !busy.has(pk(b.u, b.k))).forEach((b) => (byDiv[b.F.div + "|" + b.reg] ||= []).push(b));
      for (const [dk, list] of Object.entries(byDiv)) {
        const div = dk.split("|")[0];
        const date = nextNight(C, div, today); if (!date) continue;
        list.forEach((b) => (b.r = (b.F.rating || 0) + Math.random() * 0.9));
        list.sort((x, y) => x.r - y.r);
        while (list.length > 1) {
          const a = list.shift();
          const recent = new Set((a.F.hist || []).slice(0, 3).map((x: any) => x.opp + "|" + x.ogym));
          let j = list.findIndex((b) => b.gym !== a.gym && !recent.has(b.F.name + "|" + b.gym) && Math.abs(b.r - a.r) <= 3);
          if (j < 0) j = list.findIndex((b) => b.gym !== a.gym);
          if (j < 0) continue;
          const [b] = list.splice(j, 1);
          book(a, b, date, true);
        }
      }
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await sb.from("bouts").insert(rows.slice(i, i + 200));
        if (error) { log.push("booking: " + error.message); break; } else booked += Math.min(200, rows.length - i);
      }
      // bot gyms call out the managers' fighters they were just booked against
      for (const r of rows.filter((x) => !x.bot_only)) {
        const [hu, hk, bu, bk] = P[r.red_user]?.is_bot ? [r.blue_user, r.blue_fid, r.red_user, r.red_fid] : [r.red_user, r.red_fid, r.blue_user, r.blue_fid];
        const day = new Date(r.fight_date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
        mgmt.push(challengeRelease(bu, { B: nm(S[bu][bk]), BG: P[bu].gym, H: nm(S[hu][hk]), HG: P[hu].gym, day, venue: r.venue?.name || "the arena" }));
      }
      await postReleases(mgmt, log);
    }
  } catch (e) {
    log.push("error: " + (e as Error).message);
  }
  await sb.from("league_runs").update({ finished_at: new Date().toISOString(), ran, booked, vacated, left_due: leftDue, note: log.join("\n").slice(0, 4000) || null }).eq("id", rid);
  return Response.json({ today, ran, booked, vacated, leftDue, log });
}
