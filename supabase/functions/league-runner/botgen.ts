// Bot gyms that manage themselves: plan "genes" that learn from results, scouting from public records,
// retirement of washed-up bots and new signings so every big bot gym (b4-bb) keeps five active fighters in every
// division in both regions. Bots only ever use public information (records), never a manager's plan text.
export const FIRST: string[] = ["Abel", "Ade", "Alonzo", "Amos", "Arlo", "Arturo", "August", "Bastian", "Beau", "Bennett", "Boris", "Brady", "Bram", "Cade", "Calvin", "Cecil", "Chance", "Cliff", "Colton", "Cyrus", "Dale", "Dante", "Darnell", "Deacon", "Dexter", "Dimitri", "Donnie", "Dorian", "Earl", "Efrain", "Elias", "Emeka", "Emmett", "Enzo", "Ernesto", "Ezra", "Felix", "Garrett", "Gideon", "Grady", "Hank", "Harlan", "Hollis", "Hugo", "Ignacio", "Isaiah", "Jabari", "Jalen", "Jasper", "Joaquin", "Jonah", "Judd", "Kareem", "Kendrick", "Kofi", "Lamar", "Lance", "Leland", "Lorenzo", "Lucius", "Malik", "Mateo", "Mason", "Mitch", "Monty", "Nestor", "Nico", "Noel", "Obi", "Orlando", "Otis", "Pablo", "Percy", "Quentin", "Quincy", "Ramon", "Rhett", "Roman", "Rufus", "Saul", "Silas", "Stefan", "Thad", "Tobias", "Tyrell", "Ulysses", "Vaughn", "Virgil", "Wade", "Walker", "Xavier", "Yusuf", "Zane"];
export const LAST: string[] = ["Abernathy", "Acosta", "Ambrose", "Arceneaux", "Ashby", "Barlow", "Beckett", "Bellamy", "Blackwood", "Boudreaux", "Bramwell", "Calloway", "Cantrell", "Carrasco", "Chatman", "Colfax", "Crenshaw", "Dabney", "Delacroix", "Draper", "Dunmore", "Easton", "Echols", "Fairbanks", "Falcone", "Fenwick", "Galloway", "Garland", "Gentry", "Gutierrez", "Halloran", "Harrow", "Hastings", "Hightower", "Holloway", "Ingram", "Jarvis", "Kessler", "Kingsley", "Lachance", "Landry", "Larkin", "Lockhart", "Maddox", "Mancini", "Marchetti", "McCrae", "Mendez", "Merriweather", "Nakamura", "Northcutt", "Obuya", "Okafor", "Oyelaran", "Pembrook", "Pettigrew", "Quintero", "Radcliffe", "Rainwater", "Rasheed", "Reinholt", "Rocha", "Rutledge", "Salcedo", "Santangelo", "Shackleford", "Slade", "Stroud", "Tamayo", "Thibodeaux", "Treadwell", "Underhill", "Valdez", "Vasquez", "Voss", "Wakefield", "Whitaker", "Winslow", "Yarbrough", "Zamora", "Zeller"];
export const NICK: string[] = ["Brick House", "The Mechanic", "Quicksilver", "Sandman", "The Mailman", "Big Train", "Thunder", "The Undertaker", "Lockjaw", "Night Train", "The Bull", "Mojo", "Showtime", "Ice Water", "The Tailor", "Gravedigger", "Little Hands", "The Freight", "Rawhide", "Hammerhand", "Easy Money", "The Prospector", "Dynamo", "Sweet Feet", "Ironside", "Copperhead", "The Anvil", "Cyclone", "Tank", "Velvet", "", "", "", "", "", "", ""];
export const GYMS: Record<string, { temper: number; towns: string[]; short: string; regions?: string[] }> = {"b4": {"temper": 0, "towns": ["New Orleans, Louisiana", "Baton Rouge, Louisiana", "Lafayette, Louisiana", "Houston, Texas", "Mobile, Alabama", "Biloxi, Mississippi", "Kingston, Jamaica", "Havana, Cuba"], "short": "Bayou"}, "b5": {"temper": 1, "towns": ["Pittsburgh, Pennsylvania", "Youngstown, Ohio", "Buffalo, New York", "Erie, Pennsylvania", "Wheeling, West Virginia", "Gary, Indiana", "Glasgow, Scotland", "Cardiff, Wales"], "short": "Steel"}, "b6": {"temper": -1, "towns": ["Phoenix, Arizona", "Tucson, Arizona", "El Paso, Texas", "Albuquerque, New Mexico", "Hermosillo, Mexico", "Mexicali, Mexico", "Reno, Nevada", "Las Cruces, New Mexico"], "short": "Desert"}, "b7": {"temper": 0, "towns": ["Baltimore, Maryland", "Norfolk, Virginia", "Boston, Massachusetts", "Providence, Rhode Island", "Liverpool, England", "Dublin, Ireland", "Lagos, Nigeria", "San Juan, Puerto Rico"], "short": "Harbor"}, "b8": {"temper": 1, "towns": ["Detroit, Michigan", "Flint, Michigan", "Toledo, Ohio", "Akron, Ohio", "Milwaukee, Wisconsin", "Windsor, Ontario", "Sheffield, England", "Leeds, England"], "short": "Rust"}, "b9": {"temper": -1, "towns": ["San Diego, California", "Los Angeles, California", "Oxnard, California", "Tijuana, Mexico", "Ensenada, Mexico", "Honolulu, Hawaii", "Cebu, Philippines", "Auckland, New Zealand"], "short": "Pacific"}, "ba": {"temper": 0, "towns": ["San Antonio, Texas", "Dallas, Texas", "Fort Worth, Texas", "Corpus Christi, Texas", "Laredo, Texas", "Monterrey, Mexico", "Oklahoma City, Oklahoma", "Tulsa, Oklahoma"], "short": "Lone"}, "bb": {"temper": 1, "towns": ["Atlantic City, New Jersey", "Camden, New Jersey", "Trenton, New Jersey", "Philadelphia, Pennsylvania", "Wilmington, Delaware", "Bronx, New York", "Kingston, Jamaica", "Santo Domingo, Dominican Republic"], "short": "Atlantic"}, "r0": {"temper": 0, "towns": ["Tulsa, Oklahoma", "Wichita, Kansas", "Springfield, Missouri", "Fort Smith, Arkansas"], "short": "First Bell"}, "r1": {"temper": 1, "towns": ["Toledo, Ohio", "Flint, Michigan", "Gary, Indiana", "Erie, Pennsylvania"], "short": "Riverbend"}, "r2": {"temper": 0, "towns": ["Fresno, California", "Bakersfield, California", "Stockton, California", "Reno, Nevada"], "short": "Valley Starters"}, "r3": {"temper": -1, "towns": ["Savannah, Georgia", "Augusta, Georgia", "Macon, Georgia", "Columbia, South Carolina"], "short": "Sunrise"}, "r4": {"temper": 1, "towns": ["Worcester, Massachusetts", "Providence, Rhode Island", "Hartford, Connecticut", "Lowell, Massachusetts"], "short": "Mill Town"}, "r5": {"temper": 0, "towns": ["El Paso, Texas", "Las Cruces, New Mexico", "Albuquerque, New Mexico", "Tucson, Arizona"], "short": "Border Line"}, "r6": {"temper": -1, "towns": ["Boise, Idaho", "Spokane, Washington", "Billings, Montana", "Salt Lake City, Utah"], "short": "High Country"}, "r7": {"temper": 0, "towns": ["Memphis, Tennessee", "Jackson, Mississippi", "Little Rock, Arkansas", "Shreveport, Louisiana"], "short": "Delta"}, "bc": {"temper": -1, "towns": ["Denver, Colorado", "Colorado Springs, Colorado", "Pueblo, Colorado", "Salt Lake City, Utah", "Albuquerque, New Mexico", "Cheyenne, Wyoming", "Boise, Idaho", "Mexico City, Mexico"], "short": "Mile High", "regions": [""]}, "bd": {"temper": 1, "towns": ["Minneapolis, Minnesota", "St. Paul, Minnesota", "Duluth, Minnesota", "Milwaukee, Wisconsin", "Madison, Wisconsin", "Fargo, North Dakota", "Des Moines, Iowa", "Winnipeg, Canada"], "short": "Twin Cities", "regions": [""]}};
const TW: Record<string, { w: number[]; dh: number; train: string[] }> = {"Slugger": {"w": [0.21, 0.03, 0.19, 0.15, 0.2, 0.22], "dh": 0, "train": ["str", "cnd"]}, "KO Puncher": {"w": [0.21, 0.05, 0.18, 0.17, 0.19, 0.2], "dh": 0, "train": ["str", "kp"]}, "Dancer": {"w": [0.15, 0.02, 0.23, 0.24, 0.16, 0.2], "dh": 1, "train": ["agl", "spd"]}, "Counterpuncher": {"w": [0.19, 0.03, 0.2, 0.17, 0.19, 0.22], "dh": -1, "train": ["spd", "agl"]}, "Clincher": {"w": [0.18, 0.02, 0.19, 0.16, 0.2, 0.25], "dh": 0, "train": ["cnd", "chn"]}};
// Pro fighters (owner, Nov 23, 2026: "make the opponents a little bit harder", "harder as they climb"): efficient builds
// (cut 1, little or no KP) signed by the big gyms only to meet managers' fighters rated PRO_RATING or more.
Object.assign(TW, {"Pro Slugger": {"w": [0.30, 0, 0.19, 0.19, 0.14, 0.18], "dh": 0, "train": ["str", "spd"]},
  "Pro KO Puncher": {"w": [0.31, 0.03, 0.18, 0.18, 0.13, 0.17], "dh": 0, "train": ["str", "agl"]},
  "Pro Dancer": {"w": [0.27, 0, 0.2, 0.21, 0.14, 0.18], "dh": 1, "train": ["agl", "str"]},
  "Pro Counterpuncher": {"w": [0.28, 0, 0.21, 0.19, 0.14, 0.18], "dh": -1, "train": ["spd", "str"]},
  "Pro Clincher": {"w": [0.23, 0, 0.19, 0.19, 0.15, 0.24], "dh": 0, "train": ["str", "cnd"]}});
export const PRO_TYPES = ["Pro Slugger", "Pro KO Puncher", "Pro Dancer", "Pro Counterpuncher", "Pro Clincher"];
export const REG_TYPES = ["Slugger", "KO Puncher", "Dancer", "Counterpuncher", "Clincher"];
export const BK_TYPES = ["BK Grinder", "BK Clincher", "BK Flasher"];
export const PER_DIV = 5;
// Rookies region (owner, Nov 15, 2026): 8 gyms (ids ...0000000000c0-c7, keys r0-r7) with 5 rookies in every division. They only fight
// managers' rookies. "Not a sure win but easy enough to learn": rookie plans start with a handicap (less defense, a little less
// aggression) and their learning can only win part of it back (RK_GENE caps).
export const RK_GYMS = ["r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7"];
export const RK_START = { a: -2, d: -3 };
export const RK_GENE = { aMin: -4, aMax: -1, dMin: -5, dMax: -2 };
export const isRkKey = (k: string) => k.startsWith("r");
const LATE = "score + 12 - round < 0 and endurance_percent >= 40", AHEAD = "score > 2*(1 + 12 - round)";
// [condition, AGG, target, POW, DEF, style, fixed]  fixed lines are safety lines the gene never touches
type L = [string | null, number, string, number, number, string, boolean?];
const T: Record<string, { head: string; lines: L[] }> = {
  "Slugger": { head: "# Slugger: walk him down and break the body", lines: [[null, 6, "B", 6, 8, "inside"], ["opponent <= tired", 7, "", 7, 6, "inside"], ["hisstuns > 0", 7, "H", 8, 5, ""], [LATE, 8, "H", 8, 4, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true]] },
  "KO Puncher": { head: "# KO Puncher: set it up, then go for the chin", lines: [[null, 6, "", 6, 8, ""], ["opponent <= tired", 7, "", 8, 5, ""], ["hisstuns > 0", 7, "H", 9, 4, ""], [LATE, 8, "H", 9, 3, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 5, 11, "clinch", true]] },
  "Dancer": { head: "# Dancer: stick, move and never stand still", lines: [[null, 5, "H", 4, 11, "ring"], ["round <= 3", 4, "H", 3, 13, "ring"], ["opponent = exhausted", 7, "H", 7, 6, ""], ["score < 0 and round >= 7", 6, "H", 5, 9, "ring"], [AHEAD, 2, "", 2, 16, "ring", true], ["endurance_percent < 45", 4, "", 3, 13, "ring", true]] },
  "Counterpuncher": { head: "# Counterpuncher: make him miss, make him pay", lines: [[null, 6, "", 6, 8, "counter"], ["score < 1", 7, "", 6, 7, "counter"], ["opponent <= tired", 6, "H", 6, 8, "counter"], [LATE, 7, "", 7, 6, ""], [AHEAD, 2, "", 2, 16, "", true], ["endurance_percent < 45", 4, "", 4, 12, "counter", true]] },
  "Clincher": { head: "# Clincher: tie him up and drown him late", lines: [[null, 5, "B", 5, 10, "clinch"], ["opponent <= tired", 7, "B", 6, 7, "inside"], ["opponent = exhausted", 7, "H", 8, 5, "inside"], [LATE, 8, "", 7, 5, "inside"], [AHEAD, 2, "", 2, 16, "clinch", true], ["endurance_percent < 40", 3, "", 3, 14, "clinch", true]] },
  "Pro Slugger": { head: "# Slugger: walk him down, break the body, finish what you start", lines: [[null, 6, "B", 6, 8, "inside"], ["opponent <= tired", 7, "", 7, 6, "inside"], ["hisstuns > 0 or opponent = exhausted", 7, "", 8, 5, ""], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true], ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]] },
  "Pro KO Puncher": { head: "# KO Puncher: pressure first, the big shot comes", lines: [[null, 6, "B", 6, 8, "inside"], ["opponent <= tired", 7, "", 7, 6, "inside"], ["hisstuns > 0 or opponent = exhausted", 7, "H", 8, 5, ""], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true], ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]] },
  "Pro Dancer": { head: "# Dancer: move, pick him apart, then step on the gas", lines: [[null, 6, "", 5, 9, "ring"], ["round >= 4", 7, "", 6, 7, "ring"], ["hisstuns > 0 or opponent = exhausted", 7, "", 8, 5, ""], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true], ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]] },
  "Pro Counterpuncher": { head: "# Counterpuncher: crowd him, then make him pay", lines: [[null, 6, "", 6, 8, "inside"], ["opponent <= tired", 7, "", 7, 6, "counter"], ["hisstuns > 0 or opponent = exhausted", 7, "", 8, 5, ""], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true], ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]] },
  "Pro Clincher": { head: "# Clincher: lean, tie him up, drown him late", lines: [[null, 5, "B", 5, 10, "clinch"], ["opponent <= tired", 7, "", 6, 7, "inside"], ["hisstuns > 0 or opponent = exhausted", 7, "", 8, 5, ""], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true], ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]] },
  "BK Grinder": { head: "# BK Grinder: win the endurance war, then open up", lines: [[null, 3, "B", 9, 8, "ropes"], ["round >= 6 and opponent <= tired", 3, "B", 10, 7, "ropes"], ["round >= 12 and opponent <= tired", 4, "B", 10, 6, "ropes"], ["round >= 18 and opponent = exhausted", 4, "", 11, 5, "ropes"], ["round = 25", 4, "H", 11, 5, "ropes"], ["endurance_percent < 35", 2, "", 4, 14, "clinch", true]] },
  "BK Clincher": { head: "# BK Clincher: lean on him for 25 rounds", lines: [[null, 4, "B", 8, 8, "clinch"], ["opponent <= tired", 4, "B", 9, 7, "clinch"], ["opponent = exhausted", 4, "B", 10, 6, "clinch"], ["round >= 20 and opponent = exhausted", 5, "B", 10, 5, "clinch"], ["round = 25", 5, "H", 10, 5, "clinch"], ["endurance_percent < 30", 2, "", 3, 15, "clinch", true]] },
  "BK Flasher": { head: "# BK Flasher: one big shot can end a long night", lines: [[null, 3, "", 8, 9, ""], ["round <= 2", 4, "H", 9, 7, ""], ["hisstuns > 0", 6, "H", 10, 4, ""], ["round >= 20 and opponent <= tired", 4, "H", 10, 6, ""], ["endurance_percent < 40", 2, "", 4, 14, "clinch", true]] },
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rnd = <X,>(a: X[]): X => a[Math.floor(Math.random() * a.length)];
export type Gene = { a: number; d: number; p?: number }; // p = pace: + saves gas in the early rounds, - starts fast
// the bot's type, from its saved tag or its plan name
export function typeOf(F: any): string | null {
  if (F.bt && T[F.bt]) return F.bt;
  const n = (F.planName || "").replace(/ \(.*\)$/, "").replace(/ plan$/, "");
  const t = F.region === "bk" ? (n.startsWith("BK ") ? n : "BK " + n) : n;
  return T[t] ? t : null;
}
// Pro plans (owner, Nov 23, 2026: "make the opponents a little bit harder"; chose "harder as they climb"): against an
// opponent rated PRO_RATING or more, a bot fights smarter: it jumps on a hurt or spent man and covers up when it's the one
// hurt. Newcomers (rating under PRO_RATING) still meet the plain plans. Contenders only (not BK or rookie bots).
export const PRO_RATING = 3;
export function proLines(t: string, S: { lines: L[] }): L[] {
  const m = S.lines[0], st = t === "Dancer" ? "" : m[5] === "ring" || m[5] === "counter" ? "" : m[5];
  return [["hisstuns > 0 or opponent = exhausted", Math.min(m[1] + 1, 9), "", Math.min(m[3] + 3, 10), Math.max(m[4] - 3, 4), st],
          ["mystuns > hisstuns", 3, "", 4, 13, "clinch", true]];
}
export function planFor(t: string, g: Gene, scout = 0, pro = false): string {
  const S = T[t]; if (!S) return "6/6/8";
  const pc = g.p || 0;
  // pace (learned from endurance, Nov 21, 2026): an early-rounds copy of the main line, AGG -pace and DEF +pace
  let lines: L[] = pc ? [S.lines[0], [`round <= ${t.startsWith("BK ") ? 10 : 5}`, S.lines[0][1] - pc, S.lines[0][2], S.lines[0][3], S.lines[0][4] + pc, S.lines[0][5]], ...S.lines.slice(1)] : S.lines;
  if (pro && !t.startsWith("BK ") && !t.startsWith("Pro ")) { const fx = lines.filter(l => l[6]), nf = lines.filter(l => !l[6]); const pl = proLines(t, S); lines = [...nf, pl[0], ...fx, pl[1]]; }
  const tune = g.a || g.d || pc ? ` (tuned ${g.a >= 0 ? "+" : ""}${g.a}/${g.d >= 0 ? "+" : ""}${g.d}${pc ? `, pace ${pc > 0 ? "+" : ""}${pc}` : ""})` : "";
  return [S.head + tune, ...lines.map(([c, A, tg, P, D, st, fixed]) => {
    let a = A, p = P, d = D;
    if (!fixed) { a = clamp(A + g.a, 1, 12); d = clamp(D + g.d + scout, 2, 16); p = clamp(P, 1, 12); while (a + p + d > 20) { if (p > 3) p--; else if (a > 2) a--; else d--; } }
    const tac = `${a}${tg}/${p}/${d}${st ? ` (${st})` : ""}`;
    return c ? `if ${c} then ${tac}` : tac;
  })].join("\n");
}
export function defaultGene(F: any, gymKey: string): Gene {
  if (F.gene) return F.gene;
  if (isRkKey(gymKey)) return { ...RK_START };
  const t = (GYMS[gymKey] || { temper: 0 }).temper; return { a: t, d: -t };
}
// learn from a result: stopped = get more careful, outpointed = get busier, draw = push a little.
// Pace (owner, Nov 21, 2026: "bot gyms should be learning about endurance"): lost and finished with 20+ points less
// endurance than the other man = save more gas early; lost a decision with 20+ points more = start faster.
// en/oe = his and his opponent's endurance left at the end (0-1). Rookie bots don't learn pace.
export function learn(F: any, gymKey: string, won: boolean | null, stopped: boolean, en?: number, oe?: number) {
  const t = typeOf(F); if (!t || won === true) return;
  const g = { ...defaultGene(F, gymKey) };
  if (won === null) g.a += 1;
  else if (stopped) { g.d += 1; g.a -= 1; }
  else { g.a += 1; g.d -= 1; }
  if (won === false && F.region !== "rk" && en != null && oe != null) {
    if (oe - en > 0.2 && (!stopped || en < 0.25)) g.p = (g.p || 0) + 1;
    else if (!stopped && en - oe > 0.2) g.p = (g.p || 0) - 1;
  }
  if (F.region === "rk") { g.a = clamp(g.a, RK_GENE.aMin, RK_GENE.aMax); g.d = clamp(g.d, RK_GENE.dMin, RK_GENE.dMax); delete g.p; }
  else { g.a = clamp(g.a, -3, 3); g.d = clamp(g.d, -3, 4); if (g.p != null) g.p = F.region === "bk" ? clamp(g.p, 0, 1) : clamp(g.p, -2, 3); } // BK: a fast start loses 25-rounders, so pace 0..1 there
  F.bt = t; F.gene = g; F.plan = planFor(t, g);
}
// scouting (public record only): a puncher across the ring means more defense tonight
export function scoutedPlan(F: any, gymKey: string, opp: any): string | null {
  const t = typeOf(F); if (!t) return null;
  const r = opp.rec || [0, 0, 0, 0], fights = r[0] + r[1] + r[2];
  const koRate = fights ? r[3] / fights : 0;
  const scout = fights >= 2 && koRate >= 0.5 ? 2 : fights >= 2 && koRate >= 0.3 ? 1 : 0;
  const pro = !isRkKey(gymKey) && F.region !== "rk" && (opp.rating || 0) >= PRO_RATING;
  return planFor(t, defaultGene(F, gymKey), scout, pro);
}
export function shouldRetire(F: any): string | null {
  const r = F.rec || [0, 0, 0, 0], n = r[0] + r[1] + r[2];
  if (F.region === "rk" && ((F.status || 0) >= 18 || n >= 100)) return "graduated from the rookie ranks";
  if ((F.aploss || 0) >= 3) return "worn down by too many wars";
  if (n >= 8 && r[1] - r[0] >= 4) return "the losses piled up";
  if (n >= 40) return "a long career";
  return null;
}
// ---------- new fighters ----------
const K = ["str", "kp", "spd", "agl", "chn", "cnd"];
function regStats(t: string, hgt: number, cut: number, total = 70) {
  const pool = total - hgt - cut, w = TW[t].w;
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
export function makeFighter(C: any, t: string, div: string, lim: number, prevLim: number, gymKey: string, taken: Set<string>, home: string, gene: Gene, rk = false, total = 70) {
  const bk = t.startsWith("BK "), builds = ["very heavy", "heavy", "normal", "light", "very light"];
  let best: any = null;
  const heavy = div === "Heavy", target = bk ? 204 : 210 + Math.floor(Math.random() * 66); // heavyweights: a spread of sizes up to the 280 limit
  for (let h = 60; h <= 81; h++) { // Tyson Fury rule: 6'9" max
    const cut = bk || t.startsWith("Pro ") ? 1 : rnd([1, 2, 2, 3]);
    const st: any = bk ? bkStats(t, 70 - (h - 60) - cut) : regStats(t, h - 60, cut, total);
    if (st.spd < 1 || K.reduce((a, k) => a + st[k], 0) + (h - 60) + cut !== (bk ? 70 : total)) continue;
    for (const b of builds) {
      const F = { ...st, hgt: h - 60, cut, build: b };
      const m = C.minWeight(F);
      const ok = heavy ? (bk ? m >= 196 && m <= 212 : m >= 200 && m <= 280) : m <= lim && m > prevLim - 2;
      if (!ok) continue;
      const sc = (heavy ? Math.abs(m - target) : lim - m) + (bk && b !== "very heavy" ? 3 : 0) + Math.random();
      if (!best || sc < best.sc) best = { sc, F };
    }
  }
  if (!best) return null;
  let name = ""; for (let i = 0; i < 200; i++) { name = rnd(FIRST) + " " + rnd(LAST); if (!taken.has(name)) break; }
  taken.add(name);
  const tr: any = bk ? ({ "BK Grinder": ["agl", "cnd"], "BK Clincher": ["str", "cnd"], "BK Flasher": ["str", "chn"] } as any)[t] : TW[t].train;
  const short = (GYMS[gymKey] || { short: "" }).short;
  return { ...best.F, name, nick: rnd(NICK), home, div, ...(bk ? { region: "bk" } : rk ? { region: "rk" } : {}), ...(t.startsWith("Pro ") ? { pro: true } : {}), bt: t, gene,
    plan: planFor(t, gene), planName: bk ? t : `${t} (${short})`, train: tr[0], train2: tr[1],
    rec: [0, 0, 0, 0], hist: [], rating: 0, status: 0, streak: 0, ip: 0, earn: 0, fans: 0, ppv: 0, locked: true };
}
