// Contenders league runner (Supabase edge function). Tiny on purpose: every run it downloads the fight engine
// (/engine-core.js) and the runner logic (/runner-lib.js, bundled from lib.ts + botgen.ts + press.ts by build.sh)
// from the live site, so a site push updates the runner without redeploying. See lib.ts for what a pass does.
import { createClient } from "npm:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const ENGINE = ["simulate", "fmt", "prepFighter", "applyResult", "boutPurses", "attendanceFor", "fightFans", "broadcastResult", "venueTier", "pickVenue", "broadcastTier", "ht", "DIVS", "FIGHT_NIGHT", "minWeight", "natWeight", "parsePlan"];
async function get(path: string) {
  const r = await fetch(`https://contendersboxingleague.com/${path}?v=${Date.now()}`);
  if (!r.ok) throw new Error(`${path} download failed: ${r.status}`);
  return await r.text();
}
Deno.serve(async (req) => {
  try {
    const C = new Function((await get("engine-core.js")) + "\nreturn {" + ENGINE.join(",") + "};")();
    const lib = new Function((await get("runner-lib.js")) + "\nreturn RunnerLib;")();
    return await lib.handle(req, sb, C);
  } catch (e) {
    return new Response("runner error: " + (e as Error).message, { status: 500 });
  }
});
