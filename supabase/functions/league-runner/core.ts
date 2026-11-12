// Loads the fight engine the site uses (engine-core.js, generated from src/ by tools/mkcore.js) at run time.
const NAMES = ["simulate","fmt","prepFighter","applyResult","boutPurses","attendanceFor","fightFans","broadcastResult","venueTier","pickVenue","broadcastTier","ht","DIVS","FIGHT_NIGHT"];
let core: any = null;
export async function loadCore(): Promise<any> {
  if (core) return core;
  const r = await fetch("https://contendersboxingleague.com/engine-core.js?v=" + Date.now());
  if (!r.ok) throw new Error("engine download failed: " + r.status);
  const code = await r.text();
  core = new Function(code + "\nreturn {" + NAMES.join(",") + "};")();
  return core;
}
