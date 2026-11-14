// Contenders sparring (Practice Fights against other gyms), run on the server (owner, Nov 14, 2026: nobody sees anyone
// else's plans). Other gyms' fighters (abilities and plans) never leave the database: the page gets a list of names and
// records, sends its own fighter, and gets back the fight with the other corner's stats and per-round tactics removed.
// Downloads the engine from the live site like the league runner, so engine changes need no redeploy.
import { createClient } from "npm:@supabase/supabase-js@2";
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

let C: any = null, cAt = 0;
async function engine() {
  if (C && Date.now() - cAt < 10 * 60e3) return C;
  const r = await fetch(`https://contendersboxingleague.com/engine-core.js?v=${Date.now()}`);
  if (!r.ok) throw new Error("engine download failed: " + r.status);
  C = new Function((await r.text()) + "\nreturn {simulate,prepFighter,natWeight,minWeight,parsePlan,DIVS};")();
  cAt = Date.now();
  return C;
}
let POOL: Map<string, any> | null = null, pAt = 0;
async function pool() {
  if (POOL && Date.now() - pAt < 120e3) return POOL;
  const p = await admin.from("profiles").select("id,gym").eq("is_bot", true);
  if (p.error) throw p.error;
  const gym = Object.fromEntries((p.data || []).map((r: any) => [r.id, r.gym]));
  const st = await admin.from("gym_state").select("user_id,data").in("user_id", Object.keys(gym));
  if (st.error) throw st.error;
  const m = new Map<string, any>();
  for (const r of st.data || []) {
    const d = r.data || {};
    for (const k of d.roster || []) { const F = d[k]; if (F && F.div && F.plan != null) m.set(`bot:${r.user_id}:${k}`, { uid: r.user_id, fid: k, gym: gym[r.user_id], F }); }
  }
  POOL = m; pAt = Date.now();
  return m;
}
const hits = new Map<string, number[]>();
function limited(uid: string) {
  const now = Date.now(), a = (hits.get(uid) || []).filter((t) => now - t < 60e3);
  a.push(now); hits.set(uid, a);
  return a.length > 40;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /i, "");
    let uid = "";
    const rk = req.headers.get("x-runner-key"); // commissioner tests (same private key as the league runner)
    if (rk) { const { data: key } = await admin.from("runner_key").select("k").eq("id", 1).maybeSingle(); if (key?.k && rk === key.k) uid = "commissioner"; }
    if (!uid) { const { data: u } = await admin.auth.getUser(jwt); uid = u?.user?.id || ""; }
    if (!uid) return out({ error: "Log in to spar." }, 401);
    const body = await req.json().catch(() => ({}));
    const Cx = await engine(), P = await pool();
    if (body.action === "list") {
      const fighters = [...P.entries()].map(([k, e]) => {
        const F = e.F;
        return { k, gymName: e.gym, name: F.name, nick: F.nick || "", home: F.home || "", div: F.div, region: F.region || null, rec: F.rec || [0, 0, 0, 0],
          rating: F.rating || 0, status: F.status || 0, hgt: F.hgt, w: Cx.natWeight(F), mw: Cx.minWeight(F) };
      });
      return out({ fighters });
    }
    if (body.action !== "fight") return out({ error: "unknown action" }, 400);
    if (limited(uid)) return out({ error: "Slow down a little: too many practice fights in the last minute." }, 429);
    const side = (c: any) => {
      if (c && typeof c.k === "string") {
        const e = P.get(c.k); if (!e) throw new Error("That fighter isn't available for sparring any more. Reload the page.");
        const F = structuredClone(e.F);
        if (typeof c.plan === "string" && c.plan.length < 20000) { F.plan = c.plan; F.planName = ""; }
        return { F, hidden: true };
      }
      if (c && c.F && typeof c.F === "object" && typeof c.F.plan === "string") return { F: c.F, hidden: false };
      throw new Error("Pick two fighters.");
    };
    const A = side(body.red), B = side(body.blue);
    for (const s of [A, B]) if (Cx.parsePlan(s.F.plan).errors.length) return out({ error: "A fight plan has lines the parser didn't recognize." }, 400);
    const div = (Cx.DIVS as any[]).some((d) => d[0] === body.div) ? body.div : A.F.div;
    const bk = A.F.region === "bk" && B.F.region === "bk";
    const f: any = Cx.simulate(Cx.prepFighter(A.F, A.F, B.F, div), Cx.prepFighter(B.F, A.F, B.F, div), bk ? 25 : 12);
    [A, B].forEach((s, i) => {
      if (!s.hidden) return;
      const x = f.S[i];
      f.S[i] = { n: x.n, F: { name: x.F.name, nick: x.F.nick, home: x.F.home, hgt: x.F.hgt, fightW: x.F.fightW } };
      f.rounds.forEach((R: any) => { if (R.mgr) R.mgr[i] = ""; });
    });
    return out({ f });
  } catch (e) {
    return out({ error: (e as Error).message }, 500);
  }
});
