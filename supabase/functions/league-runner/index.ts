// Contenders nightly league runner (Supabase edge function).
// Called every 15 minutes by pg_cron; it only acts during fight night (10:40-11:59 PM Central) unless ?force=1.
// Each pass: 1) vacate belts of retired champions, 2) fight every scheduled bout dated today or earlier,
// 3) book next bouts: each human fighter vs a bot in his division, and the remaining bots against each other,
// on the division's fight night, never sooner than 24 hours after a fighter's last fight (tomorrow's night skips a week).
// Same engine as the site: core.js is generated from src/ by tools/mkcore.js.
import { createClient } from "npm:@supabase/supabase-js@2";
import { loadCore } from "./core.ts";
import { fightOne } from "./fight.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const BOT_START = "2026-11-15"; // bots join from next week's cycle (owner, Nov 2026)
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
const cardEntry = (F: any) => ({
  rec: F.rec, rating: F.rating || 0, status: F.status || 0, streak: F.streak || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0,
  hist: (F.hist || []).slice(0, 25).map((h: any) => Object.fromEntries(["opp", "oh", "div", "belt", "date", "week", "res", "score", "icon", "plan", "ogym", "bout", "earned"].map((k) => [k, h[k] ?? null]))),
});
async function all(q: () => any) { // page through a select
  const out: any[] = [];
  for (let from = 0; ; from += 1000) { const { data, error } = await q().range(from, from + 999); if (error) throw error; out.push(...data); if (data.length < 1000) return out; }
}

Deno.serve(async (req) => {
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
  try {
    const C = await loadCore();
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
          const o = fightOne(C, B, { F: FA, gym: P[B.red_user]?.gym || "" }, { F: FB, gym: P[B.blue_user]?.gym || "" });
          const { data, error } = await sb.rpc("commit_bout", { p_bout: B.id, p_summary: o.summary, p_result: o.result, p_mgr: o.mgr, p_after: o.after, p_cards: o.after.map(cardEntry) });
          if (error) { log.push(`bout ${B.id}: ${error.message}`); continue; }
          if (data === "done") {
            ran++;
            // keep our in-memory copy current (retired fighters leave the roster)
            [[B.red_user, B.red_fid, o.after[0]], [B.blue_user, B.blue_fid, o.after[1]]].forEach(([u, k, F]: any) => {
              if (F.retireAfter) { S[u].roster = (S[u].roster || []).filter((x: string) => x !== k); delete S[u][k]; } else S[u][k] = F;
            });
          }
        } catch (e) { log.push(`bout ${B.id}: ${(e as Error).message}`); }
      }
    }

    // 3) book next bouts (only once every due fight is done)
    if (leftDue === 0) {
      const open = await all(() => sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid").neq("status", "done"));
      const busy = new Set<string>(); open.forEach((b) => { busy.add(pk(b.red_user, b.red_fid)); busy.add(pk(b.blue_user, b.blue_fid)); });
      const todays = await all(() => sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid").eq("status", "done").eq("fight_date", today));
      todays.forEach((b) => { busy.add(pk(b.red_user, b.red_fid)); busy.add(pk(b.blue_user, b.blue_fid)); }); // 24-hour rest
      const free = (bot: boolean) => {
        const out: any[] = [];
        for (const [u, d] of Object.entries(S)) {
          if (!P[u] || !!P[u].is_bot !== bot) continue;
          for (const k of (d.roster || [])) { const F = d[k]; if (F && F.div && !busy.has(pk(u, k))) out.push({ u, k, F, gym: P[u].gym }); }
        }
        return out;
      };
      const rows: any[] = [];
      const book = (a: any, b: any, date: string, botOnly: boolean) => {
        const ra = a.F.rating || 0, rb = b.F.rating || 0, contender = Math.max(ra, rb) >= 3;
        const v: any = C.pickVenue(C.venueTier(a.F.div, ra, rb, null, 1, contender));
        v.tv = C.broadcastTier(null, 1, contender);
        rows.push({ fight_date: date, div: a.F.div, red_user: a.u, red_fid: a.k, blue_user: b.u, blue_fid: b.k, belt: null, rounds: 12, status: "scheduled", venue: v, bot_only: botOnly });
        busy.add(pk(a.u, a.k)); busy.add(pk(b.u, b.k));
      };
      const bots = free(true);
      // humans first: closest-rated bot in his division, preferring bots he hasn't fought and a different gym than last time
      for (const h of free(false)) {
        const date = nextNight(C, h.F.div, today); if (!date) continue;
        const seen = new Set((h.F.hist || []).filter((x: any) => x.bout).map((x: any) => x.opp + "|" + x.ogym));
        const lastGym = ((h.F.hist || []).find((x: any) => x.bout) || {}).ogym;
        const cands = bots.filter((b) => b.F.div === h.F.div && !busy.has(pk(b.u, b.k)));
        if (!cands.length) { log.push(`no bot free for ${h.F.name} (${h.F.div})`); continue; }
        const score = (b: any) => Math.abs((b.F.rating || 0) - (h.F.rating || 0)) + (seen.has(b.F.name + "|" + b.gym) ? 3 : 0) + (b.gym === lastGym ? 1 : 0) + Math.random() * 0.9;
        cands.sort((x, y) => score(x) - score(y));
        book(h, cands[0], date, false);
      }
      // then the bots against each other: same division, different gyms, closest rating
      const byDiv: Record<string, any[]> = {};
      bots.filter((b) => !busy.has(pk(b.u, b.k))).forEach((b) => (byDiv[b.F.div] ||= []).push(b));
      for (const [div, list] of Object.entries(byDiv)) {
        const date = nextNight(C, div, today); if (!date || date < BOT_START) continue;
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
    }
  } catch (e) {
    log.push("error: " + (e as Error).message);
  }
  await sb.from("league_runs").update({ finished_at: new Date().toISOString(), ran, booked, vacated, left_due: leftDue, note: log.join("\n").slice(0, 4000) || null }).eq("id", rid);
  return Response.json({ today, ran, booked, vacated, leftDue, log });
});
