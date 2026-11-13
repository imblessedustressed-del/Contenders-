// Small sparring gyms that look like ordinary managers' gyms: 2-3 fighters each, spread over ten divisions.
// Usage: deno run -A bots/gen_small.ts > bots/bots_small.json   (needs a fresh engine-core.js from build.sh)
import * as G from "../supabase/functions/league-runner/botgen.ts";
const code = Deno.readTextFileSync(new URL("../engine-core.js", import.meta.url));
const C = new Function(code + "\nreturn {minWeight,natWeight,DIVS,parsePlan};")();
const GYMS: [string, string, string][] = [
  ["Southpaw Kings", "Memphis, Tennessee", "Lefties run this gym. Good luck finding the angle."],
  ["Third Shift Boxing", "Toledo, Ohio", "We train after work. Still tougher than you."],
  ["Big Mike's Fight Shack", "Birmingham, Alabama", "Small gym, big punches. Mike says hi."],
  ["Rope-A-Dope Inc", "Louisville, Kentucky", "Let 'em punch themselves out."],
  ["Glass Jaw Gym", "Fresno, California", "The name is a joke. Mostly."],
  ["Uppercut Union", "Cleveland, Ohio", "Blue collar boxing. Every fighter earns his spot."],
  ["Lefty's Corner", "Tampa, Florida", "Old school gym, old school plans."],
  ["Back Alley Brawlers", "Newark, New Jersey", "No frills. Just fights."],
  ["Iron Will Boxing", "Omaha, Nebraska", "Patience, conditioning and a good right hand."],
  ["KO Kings", "Las Vegas, Nevada", "We don't go to the cards."],
  ["Ringside Rascals", "Spokane, Washington", "A couple of guys and a dream."],
  ["The Sweet Science Club", "Providence, Rhode Island", "Hit and don't get hit. That's the whole plan."],
];
const DIV10 = ["Fly", "Bantam", "Feather", "Light", "Welter", "Super Welter", "Middle", "Light Heavy", "Cruiser", "Heavy"];
const PN = ["main plan", "my plan", "plan A", "go time", "basic plan", "the usual", "early pressure", "late surge"];
const taken = new Set<string>(JSON.parse(Deno.readTextFileSync("/tmp/taken.json")));
const out: any[] = [];
const rnd = <X,>(a: X[]) => a[Math.floor(Math.random() * a.length)];
for (const [gym, loc, desc] of GYMS) {
  const n = 2 + (Math.random() < 0.5 ? 1 : 0);
  const divs = [...DIV10].sort(() => Math.random() - 0.5).slice(0, n);
  const fighters: any[] = [];
  for (const div of divs) {
    const bk = Math.random() < 0.2;
    const t = bk ? rnd(G.BK_TYPES) : rnd(G.REG_TYPES);
    const di = C.DIVS.findIndex((d: any) => d[0] === div);
    const g = { a: rnd([-1, 0, 0, 1]), d: rnd([-1, 0, 0, 1]) };
    const F: any = G.makeFighter(C, t, div, C.DIVS[di][1], di ? C.DIVS[di - 1][1] : 0, "", taken, loc, g);
    if (!F) continue;
    F.planName = rnd(PN);
    const key = "f" + (Date.now() + Math.floor(Math.random() * 1e9)).toString(36) + Math.floor(Math.random() * 36).toString(36);
    fighters.push({ key, ...F, w: C.natWeight(F), mw: C.minWeight(F) });
  }
  const hoursAgo = 20 + Math.floor(Math.random() * 70);
  out.push({ id: crypto.randomUUID(), gym, loc, desc, created: new Date(Date.now() - hoursAgo * 3600e3).toISOString(), fighters });
}
console.log(JSON.stringify(out));
