// Simbot challenges (owner, Nov 15, 2026): two people each build a fighter and write a plan, everyone watches the fight
// together and chats. Plans and abilities never leave the server: they live in sb_seats (no policies); the public row in
// sb_challenges only carries names, ready flags and the fight report with both corners' stats and per-round tactics removed.
// Seats are claimed with a secret token (link "seat A" / "seat B"); guests can play, no sign-up needed.
// Downloads the engine from the live site like spar and the league runner, so engine changes need no redeploy.
import { createClient } from "npm:@supabase/supabase-js@2";
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
class UserErr extends Error {}
const fail = (m: string): never => { throw new UserErr(m); };

let C: any = null, cAt = 0;
async function engine() {
  if (C && Date.now() - cAt < 10 * 60e3) return C;
  const r = await fetch(`https://contendersboxingleague.com/engine-core.js?v=${Date.now()}`);
  if (!r.ok) throw new Error("engine download failed: " + r.status);
  C = new Function((await r.text()) + "\nreturn {simulate,prepFighter,natWeight,minWeight,parsePlan,DIVS};")();
  cAt = Date.now();
  return C;
}
const LEVELS: Record<string, { pool: number; max: number; rating: number }> = {
  title: { pool: 110, max: 45, rating: 28 }, // a status-28 fighter: 70 + 28 + 12 bonus points
  basic: { pool: 70, max: 30, rating: 0 },
};
const BUILDS = ["very light", "light", "normal", "heavy", "very heavy"];
const ABIL = ["str", "kp", "spd", "agl", "chn", "cnd"];
const ALNUM = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rnd = (n: number, set = ALNUM) => { const b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map((x) => set[x % set.length]).join(""); };
const sha = async (s: string) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("sbch:" + s)))].map((x) => x.toString(16).padStart(2, "0")).join("");
const SIMBOT = "Simbot (AI)"; // the house fighter for "Fight me" challenges
/* Simbot titles (owner, Nov 15, 2026): WBC/WBA/WBO belts inside Simbot only (a side game, nothing counts on Contenders records).
   Guests can win them. Defenses are live only. A belt is held by a key: u:<user id>, g:<hashed device id> or bot (Simbot AI). */
const ORGS = ["WBC", "WBA", "WBO"];
const NAME_RE = /^[\p{L}\p{N} .'&-]{1,40}$/u;
const clean = (s: unknown, n: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

const hits = new Map<string, number[]>();
function limited(key: string, n: number, ms: number) {
  const now = Date.now(), a = (hits.get(key) || []).filter((t) => now - t < ms);
  a.push(now); hits.set(key, a);
  return a.length > n;
}

async function who(uid: string, nick: unknown) {
  if (uid) {
    const { data } = await admin.from("profiles").select("gym").eq("id", uid).maybeSingle();
    if (data?.gym) return data.gym as string;
  }
  const n = clean(nick, 20);
  if (!/^[A-Za-z0-9 _.'-]{3,20}$/.test(n)) fail("Pick a nickname first (3-20 letters or numbers).");
  const { data: p } = await admin.rpc("gym_name_problem", { p_name: n });
  if (p) fail("That nickname is taken or reserved. Pick another one.");
  return n + " (guest)";
}

function checkFighter(Cx: any, F: any, level: string) {
  const L = LEVELS[level];
  if (!F || typeof F !== "object") fail("Build your fighter first.");
  const G: any = { name: clean(F.name, 40), nick: clean(F.nick, 40), home: clean(F.home, 60), build: BUILDS.includes(F.build) ? F.build : "normal" };
  if (!G.name || !NAME_RE.test(G.name)) fail("Give your fighter a name (letters, numbers, spaces).");
  for (const k of ABIL) { const v = Math.round(+F[k]); if (!Number.isFinite(v) || v < (k === "kp" ? 0 : 1) || v > L.max) fail(`${k.toUpperCase()} has to be between ${k === "kp" ? 0 : 1} and ${L.max}.`); G[k] = v; }
  G.hgt = Math.round(+F.hgt); if (!(G.hgt >= 0 && G.hgt <= 21)) fail("Height has to be between 5'0\" and 6'9\".");
  G.cut = Math.round(+F.cut); if (![1, 2, 3].includes(G.cut)) fail("Cut resistance has to be 1, 2 or 3.");
  if (G.kp > Math.floor(G.str / 3)) fail("Too much KO Punch for his Strength (3 Strength per point).");
  const used = ABIL.reduce((a, k) => a + G[k], 0) + G.hgt + G.cut;
  if (used !== L.pool) fail(`Your fighter has ${used} points. He needs exactly ${L.pool}.`);
  G.plan = String(F.plan ?? "");
  if (G.plan.length > 20000) fail("That fight plan is too long.");
  const e = Cx.parsePlan(G.plan).errors;
  if (e.length) fail(`Fight plan, line ${e[0].line}: ${e[0].msg}`);
  G.planName = clean(F.planName, 40);
  return G;
}

/* a guest champion keeps the name he won the belt under (owner, Nov 15, 2026: "they're locked into the title underneath that name") */
async function nameFor(uid: string, nick: unknown, me: string) {
  if (!uid) { const { data } = await admin.from("sb_titles").select("holder_who").eq("holder_key", me).limit(1); if (data && data.length && data[0].holder_who) return data[0].holder_who as string; }
  return who(uid, nick);
}
async function keyOf(uid: string, viewer: unknown, ip: string) {
  if (uid) return "u:" + uid;
  const v = clean(viewer, 60).replace(/[^A-Za-z0-9]/g, "");
  return "g:" + (await sha("v:" + (v || "ip" + ip))).slice(0, 32);
}
async function getTitle(org: unknown) {
  if (!ORGS.includes(String(org))) fail("Pick a belt: WBC, WBA or WBO.");
  const { data, error } = await admin.from("sb_titles").select("*").eq("org", org).single();
  if (error) throw error;
  return data;
}
async function aloneInSimbot(viewer: unknown) { // nobody else on the Simbot page or a challenge page in the last 45 s
  const v = clean(viewer, 60).replace(/[^A-Za-z0-9]/g, "") || "-";
  const { count } = await admin.from("sb_here").select("viewer", { count: "exact", head: true }).gte("seen", new Date(Date.now() - 45e3).toISOString()).neq("viewer", v);
  return !count;
}
async function awardTitle(row: any, res: any, sa: any, sb: any) {
  const T = await getTitle(row.title);
  if ((T.holder_key || null) !== (row.title_key || null)) return; // the belt changed hands while this fight was being set up
  const keys = [sa.who_key, sb.who_key], who = [row.a_who, row.b_who], fn = [sa.fighter?.name || "", sb.fighter?.name || ""];
  const how = res.w == null ? res.type : res.decision ? res.type : `${res.type} in round ${res.round}`;
  const log = (kind: string, w: number | null) => admin.from("sb_title_log").insert({ org: row.title, challenge_id: row.id, kind, how,
    winner_who: w == null ? who[0] : who[w], winner_fighter: w == null ? fn[0] : fn[w], loser_who: w == null ? who[1] : who[1 - w], loser_fighter: w == null ? fn[1] : fn[1 - w] });
  if (res.w == null) { await log("draw", null); return; } // a draw changes nothing: the champion keeps it, a vacant belt stays vacant
  const w = res.w;
  if (row.title_champ != null && w === row.title_champ) {
    const u = admin.from("sb_titles").update({ defenses: (T.defenses || 0) + 1, holder_fighter: fn[w], challenge_id: row.id }).eq("org", row.title).eq("holder_key", row.title_key);
    await u; await log("defended", w); return;
  }
  let u = admin.from("sb_titles").update({ holder_who: who[w], holder_key: keys[w], holder_fighter: fn[w], since: new Date().toISOString(), defenses: 0, challenge_id: row.id }).eq("org", row.title);
  u = row.title_key ? u.eq("holder_key", row.title_key) : u.is("holder_key", null);
  await u; await log("won", w);
}

async function titleGate(row: any, me: string) {
  if (!row.title) return;
  const T = await getTitle(row.title);
  if ((T.holder_key || null) !== (row.title_key || null)) fail(`The ${row.title} belt changed hands. This title fight is off.`);
  const { data: sa } = await admin.from("sb_seats").select("who_key").eq("challenge_id", row.id).eq("seat", "a").maybeSingle();
  if (sa?.who_key === me) fail("You can't fight yourself for the belt.");
  if (row.title_champ === 1 && me !== T.holder_key) fail(`This is a title shot: only the ${row.title} champion, ${T.holder_who}, can accept it.`);
}

async function getRow(id: string) {
  if (typeof id !== "string" || !/^[a-z0-9]{6,12}$/.test(id)) fail("That challenge doesn't exist.");
  const { data, error } = await admin.from("sb_challenges").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) fail("That challenge doesn't exist any more.");
  return data;
}
async function seatOk(id: string, seat: unknown, token: unknown) {
  if (seat !== "a" && seat !== "b") fail("Pick a corner.");
  if (typeof token !== "string" || token.length < 16 || token.length > 64) fail("That seat link isn't valid.");
  const { data } = await admin.from("sb_seats").select("*").eq("challenge_id", id).eq("seat", seat).maybeSingle();
  if (!data || data.token_hash !== (await sha(token as string))) fail("That seat link isn't valid (or someone else took the corner).");
  return data;
}

async function runFight(row: any) {
  const Cx = await engine();
  const { data: seats } = await admin.from("sb_seats").select("seat,fighter,who_key").eq("challenge_id", row.id);
  const sa = (seats || []).find((s: any) => s.seat === "a"), sb = (seats || []).find((s: any) => s.seat === "b");
  if (!sa?.fighter || !sb?.fighter) return null;
  const L = LEVELS[row.level], bk = row.rounds === 25;
  const mk = (F: any) => ({ ...F, rec: [0, 0, 0, 0], hist: [], rating: L.rating, status: L.rating, region: bk ? "bk" : undefined, streak: 0, ip: 0 });
  const A = mk(sa.fighter), B = mk(sb.fighter);
  const need = Math.max(Cx.minWeight(A), Cx.minWeight(B));
  const D = Cx.DIVS as [string, number][];
  const div = (D.find((d) => d[1] >= need) || D[D.length - 1])[0];
  const f: any = Cx.simulate(Cx.prepFighter(A, A, B, div), Cx.prepFighter(B, A, B, div), row.rounds);
  const mine: any[][] = [[], []];
  f.rounds.forEach((R: any) => {
    for (const i of [0, 1]) mine[i].push({ pre: R.mgr ? R.mgr[i] || "" : "", post: R.dmg ? R.dmg[i] || null : null });
    delete R.mgr; delete R.dmg;
  });
  f.S = f.S.map((x: any) => ({ n: x.n, F: { name: x.F.name, nick: x.F.nick || "", home: x.F.home || "", hgt: x.F.hgt, fightW: x.F.fightW } }));
  const fightAt = new Date(Date.now() + 10e3).toISOString(); // 10 s countdown so everyone watching starts together
  const { data: done } = await admin.from("sb_challenges").update({ status: "fought", div, fight_at: fightAt, result: { f }, updated_at: new Date().toISOString() })
    .eq("id", row.id).eq("status", "open").eq("a_ready", true).eq("b_ready", true).select("id");
  if (!done || !done.length) return null; // the other corner's request ran it first
  await admin.from("sb_seats").update({ mgr: mine[0] }).eq("challenge_id", row.id).eq("seat", "a");
  await admin.from("sb_seats").update({ mgr: mine[1] }).eq("challenge_id", row.id).eq("seat", "b");
  if (row.title) await awardTitle(row, f.result, sa, sb).catch((e) => console.error("title", e));
  return fightAt;
}

async function newChallenge(o: any) {
  for (let i = 0; i < 5; i++) {
    const id = rnd(8, "abcdefghijkmnpqrstuvwxyz23456789");
    const { error } = await admin.from("sb_challenges").insert({ id, ...o });
    if (!error) return id;
    if (!/duplicate/.test(error.message)) throw error;
  }
  throw new Error("could not make a challenge id");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
    let uid = "";
    if (jwt && jwt.split(".").length === 3) { const { data: u } = await admin.auth.getUser(jwt).catch(() => ({ data: null as any })); uid = u?.user?.id || ""; }
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "x";
    const caller = uid || "ip:" + ip;
    if (limited(caller, 90, 60e3)) fail("Slow down a little.");
    if (uid) { const { data: s } = await admin.rpc("is_sanctioned", { uid, k: "ban" }); if (s) fail("You can't do that right now."); }
    const body = await req.json().catch(() => ({}));
    const a = body.action;
    const me = await keyOf(uid, body.viewer, ip);

    if (a === "create") {
      if (limited("create:" + caller, 12, 3600e3)) fail("That's a lot of challenges for one hour. Finish a few first.");
      let level = body.level === "basic" ? "basic" : "title";
      let rounds = [3, 6, 12, 25].includes(+body.rounds) ? +body.rounds : 12;
      const name = await nameFor(uid, body.nick, me);
      let tt: any = {};
      if (body.title) { // title fight: always 28/28, 12 rounds. Vacant: anyone accepts. Champion: he defends (red). Anyone else: a title shot only the champion can accept (blue).
        const T = await getTitle(body.title);
        if (T.holder_key === "bot") fail(`Simbot AI holds the ${T.org} belt. Take it from him with "Fight me" when you're the only one in Simbot.`);
        const { data: open } = await admin.from("sb_challenges").select("id").eq("title", T.org).eq("status", "open").eq("b_taken", false).limit(1);
        if (open && open.length) fail(`There's already an open ${T.org} title fight on the board. Accept that one!`);
        level = "title"; rounds = 12;
        tt = { title: T.org, title_key: T.holder_key || null, title_champ: !T.holder_key ? null : T.holder_key === me ? 0 : 1 };
      }
      const ta = rnd(28), tb = rnd(28);
      const id = await newChallenge({ level, rounds, listed: body.listed !== false || !!tt.title, a_who: name, a_user: uid || null, ...tt });
      const { error } = await admin.from("sb_seats").insert([{ challenge_id: id, seat: "a", token_hash: await sha(ta), who_key: me }, { challenge_id: id, seat: "b", token_hash: await sha(tb) }]);
      if (error) throw error;
      return out({ id, a: ta, b: tb });
    }

    if (a === "vsbot") { // "Fight me": the player vs Simbot AI's fighter (a starter build sent by the page, checked like any fighter); Simbot is ready at once
      if (limited("create:" + caller, 12, 3600e3)) fail("That's a lot of challenges for one hour. Finish a few first.");
      const Cx = await engine();
      const level = body.level === "basic" ? "basic" : "title";
      const rounds = [3, 6, 12, 25].includes(+body.rounds) ? +body.rounds : 12;
      const name = await nameFor(uid, body.nick, me);
      let tt: any = {};
      if (body.title) { // only when he's the only one in Simbot, and only for a vacant belt or one Simbot holds
        const T = await getTitle(body.title);
        if (T.holder_key && T.holder_key !== "bot") fail(`${T.holder_who} holds the ${T.org} belt. Challenge him for it in the lobby!`);
        if (!(await aloneInSimbot(body.viewer))) fail("Title fights against me are only when you're the only one in Simbot. There are people here: challenge them for the belt!");
        tt = { title: T.org, title_key: T.holder_key || null, title_champ: T.holder_key === "bot" ? 1 : null };
      }
      const G = checkFighter(Cx, body.bot, tt.title ? "title" : level);
      const ta = rnd(28);
      const id = await newChallenge({ level: tt.title ? "title" : level, rounds: tt.title ? 12 : rounds, listed: true, a_who: name, a_user: uid || null, b_who: SIMBOT, b_taken: true, b_ready: true, b_name: G.name, ...tt });
      const { error } = await admin.from("sb_seats").insert([{ challenge_id: id, seat: "a", token_hash: await sha(ta), who_key: me }, { challenge_id: id, seat: "b", token_hash: await sha(rnd(28)), fighter: G, who_key: "bot" }]);
      if (error) throw error;
      return out({ id, a: ta });
    }

    if (a === "titles") { // belts + whether this visitor holds any (never reveals anyone's key)
      const { data } = await admin.from("sb_titles").select("org,holder_who,holder_key,holder_fighter,since,defenses");
      return out({ titles: (data || []).map((t: any) => ({ org: t.org, who: t.holder_who, fighter: t.holder_fighter, since: t.since, defenses: t.defenses, mine: !!t.holder_key && t.holder_key === me, bot: t.holder_key === "bot" })), alone: await aloneInSimbot(body.viewer) });
    }

    if (a === "take") { // accept an open challenge from the board
      const row = await getRow(body.id);
      if (row.status !== "open" || !row.listed || row.b_taken) fail("Someone already took that challenge.");
      const name = await nameFor(uid, body.nick, me);
      if (uid && row.a_user === uid) fail("You can't accept your own challenge. Send the blue corner link to a friend.");
      await titleGate(row, me);
      const tb = rnd(28);
      const { data: ok } = await admin.from("sb_challenges").update({ b_taken: true, b_who: name, b_user: uid || null, updated_at: new Date().toISOString() })
        .eq("id", row.id).eq("b_taken", false).eq("status", "open").select("id");
      if (!ok || !ok.length) fail("Someone already took that challenge.");
      await admin.from("sb_seats").update({ token_hash: await sha(tb), fighter: null, who_key: me }).eq("challenge_id", row.id).eq("seat", "b");
      return out({ id: row.id, seat: "b", token: tb });
    }

    if (a === "join") { // opened a seat link: put the player's name on that corner
      const row = await getRow(body.id);
      const s = await seatOk(row.id, body.seat, body.token);
      if (s.seat === "b" && !row.b_taken && row.status === "open") {
        const name = await nameFor(uid, body.nick, me);
        if (uid && row.a_user === uid) fail("That's your own challenge. Send the blue corner link to your opponent.");
        await titleGate(row, me);
        await admin.from("sb_seats").update({ who_key: me }).eq("challenge_id", row.id).eq("seat", "b");
        await admin.from("sb_challenges").update({ b_taken: true, b_who: name, b_user: uid || null, updated_at: new Date().toISOString() }).eq("id", row.id).eq("b_taken", false);
      }
      return out({ ok: true });
    }

    if (a === "mine") {
      const row = await getRow(body.id);
      const s = await seatOk(row.id, body.seat, body.token);
      return out({ fighter: s.fighter, mgr: row.status === "fought" ? s.mgr : null });
    }

    if (a === "submit") {
      const Cx = await engine();
      const row = await getRow(body.id);
      if (row.status !== "open") fail("This fight is already over.");
      const s = await seatOk(row.id, body.seat, body.token);
      if (s.seat === "b" && !row.b_taken) fail("Open your corner link first.");
      const G = checkFighter(Cx, body.fighter, row.level);
      await admin.from("sb_seats").update({ fighter: G }).eq("challenge_id", row.id).eq("seat", s.seat);
      const up: any = { updated_at: new Date().toISOString() };
      up[s.seat + "_ready"] = body.ready !== false; up[s.seat + "_name"] = G.name;
      await admin.from("sb_challenges").update(up).eq("id", row.id).eq("status", "open");
      const now = await getRow(row.id);
      let fightAt = null;
      if (now.a_ready && now.b_ready) fightAt = await runFight(now);
      return out({ ok: true, fight_at: fightAt });
    }

    if (a === "unready") {
      const row = await getRow(body.id);
      if (row.status !== "open") fail("Too late: the fight already started.");
      const s = await seatOk(row.id, body.seat, body.token);
      const up: any = { updated_at: new Date().toISOString() }; up[s.seat + "_ready"] = false;
      await admin.from("sb_challenges").update(up).eq("id", row.id).eq("status", "open");
      return out({ ok: true });
    }

    if (a === "cancel") {
      const row = await getRow(body.id);
      const s = await seatOk(row.id, body.seat, body.token);
      if (s.seat !== "a") fail("Only the red corner can call it off.");
      if (row.status !== "open") fail("This fight is already over.");
      await admin.from("sb_challenges").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", row.id).eq("status", "open");
      return out({ ok: true });
    }

    if (a === "rematch") { // same two corners, same tokens, fighters carried over (not ready) so they can tweak
      const row = await getRow(body.id);
      if (row.status !== "fought") fail("Finish this fight first.");
      await seatOk(row.id, body.seat, body.token);
      if (row.next_id) return out({ id: row.next_id });
      const { data: seats } = await admin.from("sb_seats").select("*").eq("challenge_id", row.id);
      let tt: any = {};
      if (row.title) { // a title rematch: the belt is on the line again if one of these two holds it (or it's still vacant)
        const T = await getTitle(row.title), ka = seats?.find((x: any) => x.seat === "a")?.who_key, kb = seats?.find((x: any) => x.seat === "b")?.who_key;
        const champ = !T.holder_key ? null : T.holder_key === ka ? 0 : T.holder_key === kb ? 1 : -1;
        const botOk = row.b_who !== SIMBOT || await aloneInSimbot(body.viewer);
        if (champ !== -1 && botOk) tt = { title: T.org, title_key: T.holder_key || null, title_champ: champ };
      }
      const id = await newChallenge({ level: row.level, rounds: row.rounds, listed: row.b_who === SIMBOT || !!tt.title, a_who: row.a_who, b_who: row.b_who, a_user: row.a_user, b_user: row.b_user,
        b_taken: true, a_name: row.a_name, b_name: row.b_name, b_ready: row.b_who === SIMBOT, ...tt });
      await admin.from("sb_seats").insert((seats || []).map((s: any) => ({ challenge_id: id, seat: s.seat, token_hash: s.token_hash, fighter: s.fighter, who_key: s.who_key })));
      const { data: ok } = await admin.from("sb_challenges").update({ next_id: id }).eq("id", row.id).is("next_id", null).select("id");
      if (!ok || !ok.length) { const again = await getRow(row.id); return out({ id: again.next_id }); }
      return out({ id });
    }

    return out({ error: "unknown action" }, 400);
  } catch (e) {
    if (e instanceof UserErr) return out({ error: e.message }, 400);
    console.error(e);
    return out({ error: "Something went wrong on our end. Try again in a moment." }, 500);
  }
});
