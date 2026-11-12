// Bot gyms that manage themselves: plan "genes" that learn from results, scouting from public records,
// retirement of washed-up bots and new signings so every big bot gym (b4-bb) keeps five active fighters in every
// division in both regions. Bots only ever use public information (records), never a manager's plan text.
export const FIRST: string[] = ["Abel", "Ade", "Alonzo", "Amos", "Arlo", "Arturo", "August", "Bastian", "Beau", "Bennett", "Boris", "Brady", "Bram", "Cade", "Calvin", "Cecil", "Chance", "Cliff", "Colton", "Cyrus", "Dale", "Dante", "Darnell", "Deacon", "Dexter", "Dimitri", "Donnie", "Dorian", "Earl", "Efrain", "Elias", "Emeka", "Emmett", "Enzo", "Ernesto", "Ezra", "Felix", "Garrett", "Gideon", "Grady", "Hank", "Harlan", "Hollis", "Hugo", "Ignacio", "Isaiah", "Jabari", "Jalen", "Jasper", "Joaquin", "Jonah", "Judd", "Kareem", "Kendrick", "Kofi", "Lamar", "Lance", "Leland", "Lorenzo", "Lucius", "Malik", "Mateo", "Mason", "Mitch", "Monty", "Nestor", "Nico", "Noel", "Obi", "Orlando", "Otis", "Pablo", "Percy", "Quentin", "Quincy", "Ramon", "Rhett", "Roman", "Rufus", "Saul", "Silas", "Stefan", "Thad", "Tobias", "Tyrell", "Ulysses", "Vaughn", "Virgil", "Wade", "Walker", "Xavier", "Yusuf", "Zane"];
export const LAST: string[] = ["Abernathy", "Acosta", "Ambrose", "Arceneaux", "Ashby", "Barlow", "Beckett", "Bellamy", "Blackwood", "Boudreaux", "Bramwell", "Calloway", "Cantrell", "Carrasco", "Chatman", "Colfax", "Crenshaw", "Dabney", "Delacroix", "Draper", "Dunmore", "Easton", "Echols", "Fairbanks", "Falcone", "Fenwick", "Galloway", "Garland", "Gentry", "Gutierrez", "Halloran", "Harrow", "Hastings", "Hightower", "Holloway", "Ingram", "Jarvis", "Kessler", "Kingsley", "Lachance", "Landry", "Larkin", "Lockhart", "Maddox", "Mancini", "Marchetti", "McCrae", "Mendez", "Merriweather", "Nakamura", "Northcutt", "Obuya", "Okafor", "Oyelaran", "Pembrook", "Pettigrew", "Quintero", "Radcliffe", "Rainwater", "Rasheed", "Reinholt", "Rocha", "Rutledge", "Salcedo", "Santangelo", "Shackleford", "Slade", "Stroud", "Tamayo", "Thibodeaux", "Treadwell", "Underhill", "Valdez", "Vasquez", "Voss", "Wakefield", "Whitaker", "Winslow", "Yarbrough", "Zamora", "Zeller"];
export const NICK: string[] = ["Brick House", "The Mechanic", "Quicksilver", "Sandman", "The Mailman", "Big Train", "Thunder", "The Undertaker", "Lockjaw", "Night Train", "The Bull", "Mojo", "Showtime", "Ice Water", "The Tailor", "Gravedigger", "Little Hands", "The Freight", "Rawhide", "Hammerhand", "Easy Money", "The Prospector", "Dynamo", "Sweet Feet", "Ironside", "Copperhead", "The Anvil", "Cyclone", "Tank", "Velvet", "", "", "", "", "", "", ""];
export const GYMS: Record<string, { temper: number; towns: string[]; short: string }> = {"b4": {"temper": 0, "towns": ["New Orleans, Louisiana", "Baton Rouge, Louisiana", "Lafayette, Louisiana", "Houston, Texas", "Mobile, Alabama", "Biloxi, Mississippi", "Kingston, Jamaica", "Havana, Cuba"], "short": "Bayou"}, "b5": {"temper": 1, "towns": ["Pittsburgh, Pennsylvania", "Youngstown, Ohio", "Buffalo, New York", "Erie, Pennsylvania", "Wheeling, West Virginia", "Gary, Indiana", "Glasgow, Scotland", "Cardiff, Wales"], "short": "Steel"}, "b6": {"temper": -1, "towns": ["Phoenix, Arizona", "Tucson, Arizona", "El Paso, Texas", "Albuquerque, New Mexico", "Hermosillo, Mexico", "Mexicali, Mexico", "Reno, Nevada", "Las Cruces, New Mexico"], "short": "Desert"}, "b7": {"temper": 0, "towns": ["Baltimore, Maryland", "Norfolk, Virginia", "Boston, Massachusetts", "Providence, Rhode Island", "Liverpool, England", "Dublin, Ireland", "Lagos, Nigeria", "San Juan, Puerto Rico"], "short": "Harbor"}, "b8": {"temper": 1, "towns": ["Detroit, Michigan", "Flint, Michigan", "Toledo, Ohio", "Akron, Ohio", "Milwaukee, Wisconsin", "Windsor, Ontario", "Sheffield, England", "Leeds, England"], "short": "Rust"}, "b9": {"temper": -1, "towns": ["San Diego, California", "Los Angeles, California", "Oxnard, California", "Tijuana, Mexico", "Ensenada, Mexico", "Honolulu, Hawaii", "Cebu, Philippines", "Auckland, New Zealand"], "short": "Pacific"}, "ba": {"temper": 0, "towns": ["San Antonio, Texas", "Dallas, Texas", "Fort Worth, Texas", "Corpus Christi, Texas", "Laredo, Texas", "Monterrey, Mexico", "Oklahoma City, Oklahoma", "Tulsa, Oklahoma"], "short": "Lone"}, "bb": {"temper": 1, "towns": ["Atlantic City, New Jersey", "Camden, New Jersey", "Trenton, New Jersey", "Philadelphia, Pennsylvania", "Wilmington, Delaware", "Bronx, New York", "Kingston, Jamaica", "Santo Domingo, Dominican Republic"], "short": "Atlantic"}};
const TW: Record<string, { w: number[]; dh: number; train: string[] }> = {"Slugger": {"w": [0.21, 0.03, 0.19, 0.15, 0.2, 0.22], "dh": 0, "train": ["str", "cnd"]}, "KO Puncher": {"w": [0.21, 0.05, 0.18, 0.17, 0.19, 0.2], "dh": 0, "train": ["str", "kp"]}, "Dancer": {"w": [0.15, 0.02, 0.23, 0.24, 0.16, 0.2], "dh": 1, "train": ["agl", "spd"]}, "Counterpuncher": {"w": [0.19, 0.03, 0.2, 0.17, 0.19, 0.22], "dh": -1, "train": ["spd", "agl"]}, "Clincher": {"w": [0.18, 0.02, 0.19, 0.16, 0.2, 0.25], "dh": 0, "train": ["cnd", "chn"]}};
export const REG_TYPES = ["Slugger", "KO Puncher", "Dancer", "Counterpuncher", "Clincher"];
export const BK_TYPES = ["BK Grinder", "BK Clincher", "BK Flasher"];
export const PER_DIV = 5;
const LATE = "score + 12 - round < 0 and endurance_percent >= 40", AHEAD = "score > 2*(1 + 12 - round)";
// [condition, AGG, target, POW, DEF, style, fixed]  fixed lines are safety lines the gene never touches
type L = [string | null, number, string, number, number, string, boolean?];
const T: Record<string, { head: string; lines: L[] }> = {
  "Slugger": { head: "# Slugger: walk him down and break the body", lines: [[null, 6, "B", 6, 8, "inside"], ["opponent >= tired", 7, "", 7, 6, "inside"], ["hisstuns > 0", 7, "H", 8, 5, ""], [LATE, 8, "H", 8, 4, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true]] },
  "KO Puncher": { head: "# KO Puncher: set it up, then go for the chin", lines: [[null, 6, "", 6, 8, ""], ["opponent >= tired", 7, "", 8, 5, ""], ["hisstuns > 0", 7, "H", 9, 4, ""], [LATE, 8, "H", 9, 3, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 5, 11, "clinch", true]] },
  "Dancer": { head: "# Dancer: stick, move and never stand still", lines: [[null, 5, "H", 4, 11, "ring"], ["round <= 3", 4, "H", 3, 13, "ring"], ["opponent = exhausted", 7, "H", 7, 6, ""], ["score < 0 and round >= 7", 6, "H", 5, 9, "ring"], [AHEAD, 2, "", 2, 16, "ring", true], ["endurance_percent < 45", 4, "", 3, 13, "ring", true]] },
  "Counterpuncher": { head: "# Counterpuncher: make him miss, make him pay", lines: [[null, 6, "", 6, 8, "counter"], ["score < 1", 7, "", 6, 7, "counter"], ["opponent >= tired", 6, "H", 6, 8, "counter"], [LATE, 7, "", 7, 6, ""], [AHEAD, 2, "", 2, 16, "", true], ["endurance_percent < 45", 4, "", 4, 12, "counter", true]] },
  "Clincher": { head: "# Clincher: tie him up and drown him late", lines: [[null, 5, "B", 5, 10, "clinch"], ["opponent >= tired", 7, "B", 6, 7, "inside"], ["opponent = exhausted", 7, "H", 8, 5, "inside"], [LATE, 8, "", 7, 5, "inside"], [AHEAD, 2, "", 2, 16, "clinch", true], ["endurance_percent < 40", 3, "", 3, 14, "clinch", true]] },
  "BK Grinder": { head: "# BK Grinder: win the endurance war, then open up", lines: [[null, 3, "B", 9, 8, "ropes"], ["round >= 6 and opponent >= tired", 3, "B", 10, 7, "ropes"], ["round >= 12 and opponent >= tired", 4, "B", 10, 6, "ropes"], ["round >= 18 and opponent = exhausted", 4, "", 11, 5, "ropes"], ["round = 25", 4, "H", 11, 5, "ropes"], ["endurance_percent < 35", 2, "", 4, 14, "clinch", true]] },
  "BK Clincher": { head: "# BK Clincher: lean on him for 25 rounds", lines: [[null, 4, "B", 8, 8, "clinch"], ["opponent >= tired", 4, "B", 9, 7, "clinch"], ["opponent = exhausted", 4, "B", 10, 6, "clinch"], ["round >= 20 and opponent = exhausted", 5, "B", 10, 5, "clinch"], ["round = 25", 5, "H", 10, 5, "clinch"], ["endurance_percent < 30", 2, "", 3, 15, "clinch", true]] },
  "BK Flasher": { head: "# BK Flasher: one big shot can end a long night", lines: [[null, 3, "", 8, 9, ""], ["round <= 2", 4, "H", 9, 7, ""], ["hisstuns > 0", 6, "H", 10, 4, ""], ["round >= 20 and opponent >= tired", 4, "H", 10, 6, ""], ["endurance_percent < 40", 2, "", 4, 14, "clinch", true]] },
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rnd = <X,>(a: X[]): X => a[Math.floor(Math.random() * a.length)];
export type Gene = { a: number; d: number };
// the bot's type, from its saved tag or its plan name
export function typeOf(F: any): string | null {
  if (F.bt && T[F.bt]) return F.bt;
  const n = (F.planName || "").replace(/ \(.*\)$/, "").replace(/ plan$/, "");
  const t = F.region === "bk" ? (n.startsWith("BK ") ? n : "BK " + n) : n;
  return T[t] ? t : null;
}
export function planFor(t: string, g: Gene, scout = 0): string {
  const S = T[t]; if (!S) return "6/6/8";
  return [S.head + (g.a || g.d ? ` (tuned ${g.a >= 0 ? "+" : ""}${g.a}/${g.d >= 0 ? "+" : ""}${g.d})` : ""), ...S.lines.map(([c, A, tg, P, D, st, fixed]) => {
    let a = A, p = P, d = D;
    if (!fixed) { a = clamp(A + g.a, 1, 12); d = clamp(D + g.d + scout, 2, 16); p = clamp(P, 1, 12); while (a + p + d > 20) { if (p > 3) p--; else if (a > 2) a--; else d--; } }
    const tac = `${a}${tg}/${p}/${d}${st ? ` (${st})` : ""}`;
    return c ? `if ${c} then ${tac}` : tac;
  })].join("\n");
}
export function defaultGene(F: any, gymKey: string): Gene {
  if (F.gene) return F.gene;
  const t = (GYMS[gymKey] || { temper: 0 }).temper; return { a: t, d: -t };
}
// learn from a result: stopped = get more careful, outpointed = get busier, draw = push a little
export function learn(F: any, gymKey: string, won: boolean | null, stopped: boolean) {
  const t = typeOf(F); if (!t || won === true) return;
  const g = { ...defaultGene(F, gymKey) };
  if (won === null) g.a += 1;
  else if (stopped) { g.d += 1; g.a -= 1; }
  else { g.a += 1; g.d -= 1; }
  g.a = clamp(g.a, -3, 3); g.d = clamp(g.d, -3, 4);
  F.bt = t; F.gene = g; F.plan = planFor(t, g);
}
// scouting (public record only): a puncher across the ring means more defense tonight
export function scoutedPlan(F: any, gymKey: string, opp: any): string | null {
  const t = typeOf(F); if (!t) return null;
  const r = opp.rec || [0, 0, 0, 0], fights = r[0] + r[1] + r[2];
  const koRate = fights ? r[3] / fights : 0;
  const scout = fights >= 2 && koRate >= 0.5 ? 2 : fights >= 2 && koRate >= 0.3 ? 1 : 0;
  return planFor(t, defaultGene(F, gymKey), scout);
}
export function shouldRetire(F: any): string | null {
  const r = F.rec || [0, 0, 0, 0], n = r[0] + r[1] + r[2];
  if ((F.aploss || 0) >= 3) return "worn down by too many wars";
  if (n >= 8 && r[1] - r[0] >= 4) return "the losses piled up";
  if (n >= 40) return "a long career";
  return null;
}
// ---------- new fighters ----------
const K = ["str", "kp", "spd", "agl", "chn", "cnd"];
function regStats(t: string, hgt: number, cut: number) {
  const pool = 70 - hgt - cut, w = TW[t].w;
  const st = w.map((x) => Math.max(1, Math.round(pool * x)));
  st[1] = Math.min(st[1], Math.max(0, Math.floor(st[0] / 2)));
  const order = [5, 2, 3, 4, 0]; let i = 0;
  const sum = () => st.reduce((a, b) => a + b, 0);
  while (sum() !== pool && i < 500) { const k = order[i % 5]; if (sum() < pool) st[k]++; else if (st[k] > 3) st[k]--; i++; }
  return Object.fromEntries(K.map((k, j) => [k, Math.min(30, st[j])]));
}
function bkStats(t: string, pool: number) {
  let cnd: number, chn: number, kp: number;
  if (t === "BK Grinder") { cnd = rnd([14, 15, 15]); chn = rnd([8, 9]); kp = 0; }
  else if (t === "BK Clincher") { cnd = rnd([15, 16]); chn = rnd([8, 9]); kp = 0; }
  else { cnd = rnd([13, 14]); kp = rnd([3, 4]); chn = rnd([8, 9]); }
  const rest = pool - cnd - chn - kp; let s: number, a: number;
  if (t === "BK Clincher") { s = Math.round(rest * .46); a = Math.round(rest * .36); }
  else if (t === "BK Flasher") { s = Math.round(rest * .44); a = Math.round(rest * .36); }
  else { s = Math.round(rest * 3 / 7); a = s; }
  s = Math.max(s, 3 * kp); const sp = rest - s - a;
  return { str: s, kp, spd: sp, agl: a, chn, cnd };
}
export function makeFighter(C: any, t: string, div: string, lim: number, prevLim: number, gymKey: string, taken: Set<string>, home: string, gene: Gene) {
  const bk = t.startsWith("BK "), builds = ["very heavy", "heavy", "normal", "light", "very light"];
  let best: any = null;
  for (let h = 60; h <= 85; h++) {
    const cut = bk ? 1 : rnd([1, 2, 2, 3]);
    const st: any = bk ? bkStats(t, 70 - (h - 60) - cut) : regStats(t, h - 60, cut);
    if (st.spd < 1 || K.reduce((a, k) => a + st[k], 0) + (h - 60) + cut !== 70) continue;
    for (const b of builds) {
      const F = { ...st, hgt: h - 60, cut, build: b };
      const m = C.minWeight(F);
      const ok = lim >= 1000 ? (bk ? m >= 196 && m <= 212 : m >= 200 && m <= 250) : m <= lim && m > prevLim - 2;
      if (!ok) continue;
      const sc = (lim < 1000 ? lim - m : Math.abs(m - (bk ? 205 : 225))) + (bk && b !== "very heavy" ? 3 : 0) + Math.random();
      if (!best || sc < best.sc) best = { sc, F };
    }
  }
  if (!best) return null;
  let name = ""; for (let i = 0; i < 200; i++) { name = rnd(FIRST) + " " + rnd(LAST); if (!taken.has(name)) break; }
  taken.add(name);
  const tr: any = bk ? ({ "BK Grinder": ["agl", "cnd"], "BK Clincher": ["str", "cnd"], "BK Flasher": ["str", "chn"] } as any)[t] : TW[t].train;
  const short = (GYMS[gymKey] || { short: "" }).short;
  return { ...best.F, name, nick: rnd(NICK), home, div, ...(bk ? { region: "bk" } : {}), bt: t, gene,
    plan: planFor(t, gene), planName: bk ? t : `${t} (${short})`, train: tr[0], train2: tr[1],
    rec: [0, 0, 0, 0], hist: [], rating: 0, status: 0, streak: 0, ip: 0, earn: 0, fans: 0, ppv: 0, locked: true };
}
