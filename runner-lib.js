var RunnerLib = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../supabase/functions/league-runner/lib.ts
  var lib_exports = {};
  __export(lib_exports, {
    handle: () => handle
  });

  // ../supabase/functions/league-runner/fight.ts
  function fightOne(C, B, red, blue) {
    const FA = red.F, FB = blue.F, div = B.div, belt = B.belt || null, star = 1;
    const rR = FA.rating || 0, rB = FB.rating || 0;
    const f = C.simulate(C.prepFighter(FA, FA, FB, div), C.prepFighter(FB, FA, FB, div), B.rounds || 12);
    const r = f.result, how = r.decision ? r.type.toLowerCase() : `${r.type} in round ${r.round} (${C.fmt(r.t)})`;
    const score = f.bk && r.decision && f.bkScore ? `knockdowns ${f.bkScore.kd.join("-")}, stuns ${f.bkScore.stuns.join("-")}` : f.totals.map((t) => t.join("-")).join(", ");
    const purse = C.boutPurses(rR, rB, belt, null, star);
    const v = B.venue || { name: "", city: "", cap: 1e3, tier: "club", tv: "stream" };
    const att = C.attendanceFor(v, Math.max(rR, rB), belt, star);
    const tier = v.tv || "stream";
    const fans = C.fightFans(f, belt, tier);
    const tv = C.broadcastResult(tier, [FA.fans || 0, FB.fans || 0], [rR, rB], [FA.home, FB.home], 0, purse);
    const d = /* @__PURE__ */ new Date(B.fight_date + "T12:00:00");
    const date = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const sdate = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const mgr = [0, 1].map((i) => f.rounds.map((R) => ({ pre: (R.mgr || [])[i] || "", post: (R.dmg || [])[i] || null })));
    f.rounds.forEach((R) => {
      delete R.mgr;
      delete R.dmg;
    });
    f.S = f.S.map((x) => ({ n: x.n, F: { name: x.F.name, nick: x.F.nick, home: x.F.home, hgt: x.F.hgt } }));
    const after = [structuredClone(FA), structuredClone(FB)];
    [0, 1].forEach((i) => {
      const op = i ? FA : FB, opGym = i ? red.gym : blue.gym;
      C.applyResult(
        after[i],
        i,
        { w: r.w, decision: r.decision, type: r.type, how, score, ip: f.ip[i], purse: purse[i] + ((tv.pay || [0, 0])[i] || 0), fans: fans[i], buys: tv.buys || 0, oppRating: i ? rR : rB, belt },
        { id: "L" + B.id, bout: B.id, oid: null, oh: C.ht(60 + op.hgt), opp: op.name, ogym: opGym, div, belt, date: sdate, week: 1 }
      );
    });
    const summary = { w: r.w, decision: !!r.decision, type: r.type, round: r.round, how, score, ip: f.ip, ratings: [rR, rB], purse, att, fans, tv };
    const full = { f, b: { rounds: B.rounds || 12, belt, div, gym: "", gyms: [red.gym, blue.gym], recs: [FA.rec.slice(), FB.rec.slice()], date } };
    const result = B.bot_only ? null : full;
    return { summary, result, full: B.bot_only ? full : null, mgr: B.bot_only ? null : mgr, after };
  }

  // ../supabase/functions/league-runner/botgen.ts
  var FIRST = ["Abel", "Ade", "Alonzo", "Amos", "Arlo", "Arturo", "August", "Bastian", "Beau", "Bennett", "Boris", "Brady", "Bram", "Cade", "Calvin", "Cecil", "Chance", "Cliff", "Colton", "Cyrus", "Dale", "Dante", "Darnell", "Deacon", "Dexter", "Dimitri", "Donnie", "Dorian", "Earl", "Efrain", "Elias", "Emeka", "Emmett", "Enzo", "Ernesto", "Ezra", "Felix", "Garrett", "Gideon", "Grady", "Hank", "Harlan", "Hollis", "Hugo", "Ignacio", "Isaiah", "Jabari", "Jalen", "Jasper", "Joaquin", "Jonah", "Judd", "Kareem", "Kendrick", "Kofi", "Lamar", "Lance", "Leland", "Lorenzo", "Lucius", "Malik", "Mateo", "Mason", "Mitch", "Monty", "Nestor", "Nico", "Noel", "Obi", "Orlando", "Otis", "Pablo", "Percy", "Quentin", "Quincy", "Ramon", "Rhett", "Roman", "Rufus", "Saul", "Silas", "Stefan", "Thad", "Tobias", "Tyrell", "Ulysses", "Vaughn", "Virgil", "Wade", "Walker", "Xavier", "Yusuf", "Zane"];
  var LAST = ["Abernathy", "Acosta", "Ambrose", "Arceneaux", "Ashby", "Barlow", "Beckett", "Bellamy", "Blackwood", "Boudreaux", "Bramwell", "Calloway", "Cantrell", "Carrasco", "Chatman", "Colfax", "Crenshaw", "Dabney", "Delacroix", "Draper", "Dunmore", "Easton", "Echols", "Fairbanks", "Falcone", "Fenwick", "Galloway", "Garland", "Gentry", "Gutierrez", "Halloran", "Harrow", "Hastings", "Hightower", "Holloway", "Ingram", "Jarvis", "Kessler", "Kingsley", "Lachance", "Landry", "Larkin", "Lockhart", "Maddox", "Mancini", "Marchetti", "McCrae", "Mendez", "Merriweather", "Nakamura", "Northcutt", "Obuya", "Okafor", "Oyelaran", "Pembrook", "Pettigrew", "Quintero", "Radcliffe", "Rainwater", "Rasheed", "Reinholt", "Rocha", "Rutledge", "Salcedo", "Santangelo", "Shackleford", "Slade", "Stroud", "Tamayo", "Thibodeaux", "Treadwell", "Underhill", "Valdez", "Vasquez", "Voss", "Wakefield", "Whitaker", "Winslow", "Yarbrough", "Zamora", "Zeller"];
  var NICK = ["Brick House", "The Mechanic", "Quicksilver", "Sandman", "The Mailman", "Big Train", "Thunder", "The Undertaker", "Lockjaw", "Night Train", "The Bull", "Mojo", "Showtime", "Ice Water", "The Tailor", "Gravedigger", "Little Hands", "The Freight", "Rawhide", "Hammerhand", "Easy Money", "The Prospector", "Dynamo", "Sweet Feet", "Ironside", "Copperhead", "The Anvil", "Cyclone", "Tank", "Velvet", "", "", "", "", "", "", ""];
  var GYMS = { "b4": { "temper": 0, "towns": ["New Orleans, Louisiana", "Baton Rouge, Louisiana", "Lafayette, Louisiana", "Houston, Texas", "Mobile, Alabama", "Biloxi, Mississippi", "Kingston, Jamaica", "Havana, Cuba"], "short": "Bayou" }, "b5": { "temper": 1, "towns": ["Pittsburgh, Pennsylvania", "Youngstown, Ohio", "Buffalo, New York", "Erie, Pennsylvania", "Wheeling, West Virginia", "Gary, Indiana", "Glasgow, Scotland", "Cardiff, Wales"], "short": "Steel" }, "b6": { "temper": -1, "towns": ["Phoenix, Arizona", "Tucson, Arizona", "El Paso, Texas", "Albuquerque, New Mexico", "Hermosillo, Mexico", "Mexicali, Mexico", "Reno, Nevada", "Las Cruces, New Mexico"], "short": "Desert" }, "b7": { "temper": 0, "towns": ["Baltimore, Maryland", "Norfolk, Virginia", "Boston, Massachusetts", "Providence, Rhode Island", "Liverpool, England", "Dublin, Ireland", "Lagos, Nigeria", "San Juan, Puerto Rico"], "short": "Harbor" }, "b8": { "temper": 1, "towns": ["Detroit, Michigan", "Flint, Michigan", "Toledo, Ohio", "Akron, Ohio", "Milwaukee, Wisconsin", "Windsor, Ontario", "Sheffield, England", "Leeds, England"], "short": "Rust" }, "b9": { "temper": -1, "towns": ["San Diego, California", "Los Angeles, California", "Oxnard, California", "Tijuana, Mexico", "Ensenada, Mexico", "Honolulu, Hawaii", "Cebu, Philippines", "Auckland, New Zealand"], "short": "Pacific" }, "ba": { "temper": 0, "towns": ["San Antonio, Texas", "Dallas, Texas", "Fort Worth, Texas", "Corpus Christi, Texas", "Laredo, Texas", "Monterrey, Mexico", "Oklahoma City, Oklahoma", "Tulsa, Oklahoma"], "short": "Lone" }, "bb": { "temper": 1, "towns": ["Atlantic City, New Jersey", "Camden, New Jersey", "Trenton, New Jersey", "Philadelphia, Pennsylvania", "Wilmington, Delaware", "Bronx, New York", "Kingston, Jamaica", "Santo Domingo, Dominican Republic"], "short": "Atlantic" }, "r0": { "temper": 0, "towns": ["Tulsa, Oklahoma", "Wichita, Kansas", "Springfield, Missouri", "Fort Smith, Arkansas"], "short": "First Bell" }, "r1": { "temper": 1, "towns": ["Toledo, Ohio", "Flint, Michigan", "Gary, Indiana", "Erie, Pennsylvania"], "short": "Riverbend" }, "r2": { "temper": 0, "towns": ["Fresno, California", "Bakersfield, California", "Stockton, California", "Reno, Nevada"], "short": "Valley Starters" }, "r3": { "temper": -1, "towns": ["Savannah, Georgia", "Augusta, Georgia", "Macon, Georgia", "Columbia, South Carolina"], "short": "Sunrise" }, "r4": { "temper": 1, "towns": ["Worcester, Massachusetts", "Providence, Rhode Island", "Hartford, Connecticut", "Lowell, Massachusetts"], "short": "Mill Town" }, "r5": { "temper": 0, "towns": ["El Paso, Texas", "Las Cruces, New Mexico", "Albuquerque, New Mexico", "Tucson, Arizona"], "short": "Border Line" }, "r6": { "temper": -1, "towns": ["Boise, Idaho", "Spokane, Washington", "Billings, Montana", "Salt Lake City, Utah"], "short": "High Country" }, "r7": { "temper": 0, "towns": ["Memphis, Tennessee", "Jackson, Mississippi", "Little Rock, Arkansas", "Shreveport, Louisiana"], "short": "Delta" } };
  var TW = { "Slugger": { "w": [0.21, 0.03, 0.19, 0.15, 0.2, 0.22], "dh": 0, "train": ["str", "cnd"] }, "KO Puncher": { "w": [0.21, 0.05, 0.18, 0.17, 0.19, 0.2], "dh": 0, "train": ["str", "kp"] }, "Dancer": { "w": [0.15, 0.02, 0.23, 0.24, 0.16, 0.2], "dh": 1, "train": ["agl", "spd"] }, "Counterpuncher": { "w": [0.19, 0.03, 0.2, 0.17, 0.19, 0.22], "dh": -1, "train": ["spd", "agl"] }, "Clincher": { "w": [0.18, 0.02, 0.19, 0.16, 0.2, 0.25], "dh": 0, "train": ["cnd", "chn"] } };
  var REG_TYPES = ["Slugger", "KO Puncher", "Dancer", "Counterpuncher", "Clincher"];
  var BK_TYPES = ["BK Grinder", "BK Clincher", "BK Flasher"];
  var PER_DIV = 5;
  var RK_START = { a: -2, d: -3 };
  var RK_GENE = { aMin: -4, aMax: -1, dMin: -5, dMax: -2 };
  var isRkKey = (k) => k.startsWith("r");
  var LATE = "score + 12 - round < 0 and endurance_percent >= 40";
  var AHEAD = "score > 2*(1 + 12 - round)";
  var T = {
    "Slugger": { head: "# Slugger: walk him down and break the body", lines: [[null, 6, "B", 6, 8, "inside"], ["opponent <= tired", 7, "", 7, 6, "inside"], ["hisstuns > 0", 7, "H", 8, 5, ""], [LATE, 8, "H", 8, 4, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 4, 12, "clinch", true]] },
    "KO Puncher": { head: "# KO Puncher: set it up, then go for the chin", lines: [[null, 6, "", 6, 8, ""], ["opponent <= tired", 7, "", 8, 5, ""], ["hisstuns > 0", 7, "H", 9, 4, ""], [LATE, 8, "H", 9, 3, ""], [AHEAD, 3, "", 3, 14, "", true], ["endurance_percent < 40", 4, "", 5, 11, "clinch", true]] },
    "Dancer": { head: "# Dancer: stick, move and never stand still", lines: [[null, 5, "H", 4, 11, "ring"], ["round <= 3", 4, "H", 3, 13, "ring"], ["opponent = exhausted", 7, "H", 7, 6, ""], ["score < 0 and round >= 7", 6, "H", 5, 9, "ring"], [AHEAD, 2, "", 2, 16, "ring", true], ["endurance_percent < 45", 4, "", 3, 13, "ring", true]] },
    "Counterpuncher": { head: "# Counterpuncher: make him miss, make him pay", lines: [[null, 6, "", 6, 8, "counter"], ["score < 1", 7, "", 6, 7, "counter"], ["opponent <= tired", 6, "H", 6, 8, "counter"], [LATE, 7, "", 7, 6, ""], [AHEAD, 2, "", 2, 16, "", true], ["endurance_percent < 45", 4, "", 4, 12, "counter", true]] },
    "Clincher": { head: "# Clincher: tie him up and drown him late", lines: [[null, 5, "B", 5, 10, "clinch"], ["opponent <= tired", 7, "B", 6, 7, "inside"], ["opponent = exhausted", 7, "H", 8, 5, "inside"], [LATE, 8, "", 7, 5, "inside"], [AHEAD, 2, "", 2, 16, "clinch", true], ["endurance_percent < 40", 3, "", 3, 14, "clinch", true]] },
    "BK Grinder": { head: "# BK Grinder: win the endurance war, then open up", lines: [[null, 3, "B", 9, 8, "ropes"], ["round >= 6 and opponent <= tired", 3, "B", 10, 7, "ropes"], ["round >= 12 and opponent <= tired", 4, "B", 10, 6, "ropes"], ["round >= 18 and opponent = exhausted", 4, "", 11, 5, "ropes"], ["round = 25", 4, "H", 11, 5, "ropes"], ["endurance_percent < 35", 2, "", 4, 14, "clinch", true]] },
    "BK Clincher": { head: "# BK Clincher: lean on him for 25 rounds", lines: [[null, 4, "B", 8, 8, "clinch"], ["opponent <= tired", 4, "B", 9, 7, "clinch"], ["opponent = exhausted", 4, "B", 10, 6, "clinch"], ["round >= 20 and opponent = exhausted", 5, "B", 10, 5, "clinch"], ["round = 25", 5, "H", 10, 5, "clinch"], ["endurance_percent < 30", 2, "", 3, 15, "clinch", true]] },
    "BK Flasher": { head: "# BK Flasher: one big shot can end a long night", lines: [[null, 3, "", 8, 9, ""], ["round <= 2", 4, "H", 9, 7, ""], ["hisstuns > 0", 6, "H", 10, 4, ""], ["round >= 20 and opponent <= tired", 4, "H", 10, 6, ""], ["endurance_percent < 40", 2, "", 4, 14, "clinch", true]] }
  };
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var rnd = (a) => a[Math.floor(Math.random() * a.length)];
  function typeOf(F) {
    if (F.bt && T[F.bt]) return F.bt;
    const n = (F.planName || "").replace(/ \(.*\)$/, "").replace(/ plan$/, "");
    const t = F.region === "bk" ? n.startsWith("BK ") ? n : "BK " + n : n;
    return T[t] ? t : null;
  }
  function planFor(t, g, scout = 0) {
    const S = T[t];
    if (!S) return "6/6/8";
    return [S.head + (g.a || g.d ? ` (tuned ${g.a >= 0 ? "+" : ""}${g.a}/${g.d >= 0 ? "+" : ""}${g.d})` : ""), ...S.lines.map(([c, A, tg, P, D, st, fixed]) => {
      let a = A, p = P, d = D;
      if (!fixed) {
        a = clamp(A + g.a, 1, 12);
        d = clamp(D + g.d + scout, 2, 16);
        p = clamp(P, 1, 12);
        while (a + p + d > 20) {
          if (p > 3) p--;
          else if (a > 2) a--;
          else d--;
        }
      }
      const tac = `${a}${tg}/${p}/${d}${st ? ` (${st})` : ""}`;
      return c ? `if ${c} then ${tac}` : tac;
    })].join("\n");
  }
  function defaultGene(F, gymKey) {
    if (F.gene) return F.gene;
    if (isRkKey(gymKey)) return { ...RK_START };
    const t = (GYMS[gymKey] || { temper: 0 }).temper;
    return { a: t, d: -t };
  }
  function learn(F, gymKey, won, stopped) {
    const t = typeOf(F);
    if (!t || won === true) return;
    const g = { ...defaultGene(F, gymKey) };
    if (won === null) g.a += 1;
    else if (stopped) {
      g.d += 1;
      g.a -= 1;
    } else {
      g.a += 1;
      g.d -= 1;
    }
    if (F.region === "rk") {
      g.a = clamp(g.a, RK_GENE.aMin, RK_GENE.aMax);
      g.d = clamp(g.d, RK_GENE.dMin, RK_GENE.dMax);
    } else {
      g.a = clamp(g.a, -3, 3);
      g.d = clamp(g.d, -3, 4);
    }
    F.bt = t;
    F.gene = g;
    F.plan = planFor(t, g);
  }
  function scoutedPlan(F, gymKey, opp) {
    const t = typeOf(F);
    if (!t) return null;
    const r = opp.rec || [0, 0, 0, 0], fights = r[0] + r[1] + r[2];
    const koRate = fights ? r[3] / fights : 0;
    const scout = fights >= 2 && koRate >= 0.5 ? 2 : fights >= 2 && koRate >= 0.3 ? 1 : 0;
    return planFor(t, defaultGene(F, gymKey), scout);
  }
  function shouldRetire(F) {
    const r = F.rec || [0, 0, 0, 0], n = r[0] + r[1] + r[2];
    if (F.region === "rk" && ((F.status || 0) >= 18 || n >= 100)) return "graduated from the rookie ranks";
    if ((F.aploss || 0) >= 3) return "worn down by too many wars";
    if (n >= 8 && r[1] - r[0] >= 4) return "the losses piled up";
    if (n >= 40) return "a long career";
    return null;
  }
  var K = ["str", "kp", "spd", "agl", "chn", "cnd"];
  function regStats(t, hgt, cut, total = 70) {
    const pool = total - hgt - cut, w = TW[t].w;
    const st = w.map((x) => Math.max(1, Math.round(pool * x)));
    st[1] = Math.min(st[1], Math.max(0, Math.floor(st[0] / 2)));
    const order = [5, 2, 3, 4, 0];
    let i = 0;
    const sum2 = () => st.reduce((a, b) => a + b, 0);
    while (sum2() !== pool && i < 500) {
      const k = order[i % 5];
      if (sum2() < pool) st[k]++;
      else if (st[k] > 3) st[k]--;
      i++;
    }
    return Object.fromEntries(K.map((k, j) => [k, Math.min(30, st[j])]));
  }
  function bkStats(t, pool) {
    let cnd, chn, kp;
    if (t === "BK Grinder") {
      cnd = rnd([14, 15, 15]);
      chn = rnd([8, 9]);
      kp = 0;
    } else if (t === "BK Clincher") {
      cnd = rnd([15, 16]);
      chn = rnd([8, 9]);
      kp = 0;
    } else {
      cnd = rnd([13, 14]);
      kp = rnd([3, 4]);
      chn = rnd([8, 9]);
    }
    const rest = pool - cnd - chn - kp;
    let s, a;
    if (t === "BK Clincher") {
      s = Math.round(rest * 0.46);
      a = Math.round(rest * 0.36);
    } else if (t === "BK Flasher") {
      s = Math.round(rest * 0.44);
      a = Math.round(rest * 0.36);
    } else {
      s = Math.round(rest * 3 / 7);
      a = s;
    }
    s = Math.max(s, 3 * kp);
    const sp = rest - s - a;
    return { str: s, kp, spd: sp, agl: a, chn, cnd };
  }
  function makeFighter(C, t, div, lim, prevLim, gymKey, taken, home, gene, rk = false, total = 70) {
    const bk = t.startsWith("BK "), builds = ["very heavy", "heavy", "normal", "light", "very light"];
    let best = null;
    const heavy = div === "Heavy", target = bk ? 204 : 210 + Math.floor(Math.random() * 66);
    for (let h = 60; h <= 81; h++) {
      const cut = bk ? 1 : rnd([1, 2, 2, 3]);
      const st = bk ? bkStats(t, 70 - (h - 60) - cut) : regStats(t, h - 60, cut, total);
      if (st.spd < 1 || K.reduce((a, k) => a + st[k], 0) + (h - 60) + cut !== (bk ? 70 : total)) continue;
      for (const b of builds) {
        const F = { ...st, hgt: h - 60, cut, build: b };
        const m = C.minWeight(F);
        const ok = heavy ? bk ? m >= 196 && m <= 212 : m >= 200 && m <= 280 : m <= lim && m > prevLim - 2;
        if (!ok) continue;
        const sc = (heavy ? Math.abs(m - target) : lim - m) + (bk && b !== "very heavy" ? 3 : 0) + Math.random();
        if (!best || sc < best.sc) best = { sc, F };
      }
    }
    if (!best) return null;
    let name = "";
    for (let i = 0; i < 200; i++) {
      name = rnd(FIRST) + " " + rnd(LAST);
      if (!taken.has(name)) break;
    }
    taken.add(name);
    const tr = bk ? { "BK Grinder": ["agl", "cnd"], "BK Clincher": ["str", "cnd"], "BK Flasher": ["str", "chn"] }[t] : TW[t].train;
    const short = (GYMS[gymKey] || { short: "" }).short;
    return {
      ...best.F,
      name,
      nick: rnd(NICK),
      home,
      div,
      ...bk ? { region: "bk" } : rk ? { region: "rk" } : {},
      bt: t,
      gene,
      plan: planFor(t, gene),
      planName: bk ? t : `${t} (${short})`,
      train: tr[0],
      train2: tr[1],
      rec: [0, 0, 0, 0],
      hist: [],
      rating: 0,
      status: 0,
      streak: 0,
      ip: 0,
      earn: 0,
      fans: 0,
      ppv: 0,
      locked: true
    };
  }

  // ../supabase/functions/league-runner/coach.ts
  var COACH_ID = "00000000-0000-0000-0000-0000000000d0";
  var num = (s, k) => {
    const m = new RegExp(k + " = ([0-9.]+)").exec(s || "");
    return m ? +m[1] : null;
  };
  var sum = (a) => a.reduce((x, y) => x + y, 0);
  function coachNote(C, B, o, i, F, O) {
    const f = (o.result || o.full || {}).f;
    if (!f || !f.rounds || !f.rounds.length) return null;
    const R = f.rounds, j = 1 - i, n = R.length;
    const mgr = o.mgr && o.mgr[i] || [];
    const s = o.summary, won = s.w === i, lost = s.w === j, name = String(F.name || "Your fighter").trim(), opp = String(O.name || "his opponent").trim();
    const tips = [];
    const thrown = (x) => (x.pt || 0) + (x.rt || 0) + (x.jt || 0), landed = (x) => (x.pl || 0) + (x.rl || 0) + (x.jl || 0);
    const myT = sum(R.map((r) => r.st ? thrown(r.st[i]) : 0)), myL = sum(R.map((r) => r.st ? landed(r.st[i]) : 0));
    const hisT = sum(R.map((r) => r.st ? thrown(r.st[j]) : 0)), hisL = sum(R.map((r) => r.st ? landed(r.st[j]) : 0));
    const en = (r, k) => r.en ? r.en[k] : 1;
    const tac = mgr.map((m) => (typeof m === "string" ? m : m?.pre) || "");
    const dmg = mgr.map((m) => m && typeof m === "object" ? m.post : null).filter(Boolean);
    const defs = tac.map((t) => num(t, "defense")).filter((x) => x != null);
    const aggs = tac.map((t) => num(t, "aggressiveness")).filter((x) => x != null);
    const lines = [];
    lines.push(`Coach's notes on ${name} vs ${opp} (${B.div}${B.region === "rk" ? ", Rookies" : B.region === "bk" ? ", Bare Knuckles" : ""}): he ${won ? "won" : lost ? "lost" : "drew"} by ${s.how}.`);
    lines.push(`Punches: he landed ${myL} of ${myT} (${myT ? Math.round(100 * myL / myT) : 0}%), ${opp} landed ${hisL} of ${hisT} (${hisT ? Math.round(100 * hisL / hisT) : 0}%).`);
    const lowAt = R.findIndex((r) => en(r, i) < 0.35);
    const fat = sum(dmg.map((d) => d.f || 0)), hurt = sum(dmg.map((d) => d.d || 0));
    if (lowAt >= 0 && lowAt + 1 <= Math.min(9, n - 1)) tips.push(`He was running on fumes by round ${lowAt + 1} (under 35% endurance). Every ability but chin and KP shrinks as he tires. Add a rest line near the bottom of the plan, e.g. "if endurance_percent < 45 then 4/5/9", or lower AGG early.`);
    if (dmg.length && (!won || lowAt >= 0) && fat > hurt * 1.2 && fat > 15) tips.push(`His own work cost him more endurance (${Math.round(fat)} points of fatigue) than the other man's punches did (${Math.round(hurt)}). Fatigue each round is AGG + POW/2, and CND/2 of it is free, so trim AGG or POW a point, or train conditioning.`);
    const myStuns = sum(R.map((r) => r.st ? (r.st[j].stun || 0) + 2 * (r.st[j].kd || 0) : 0));
    const lowDef = defs.length ? Math.min(...defs) : null;
    if ((myStuns > 0 || lost && !s.decision) && lowDef != null && lowDef <= 7) tips.push(`He got hurt with DEF as low as ${lowDef}. Damage taken is divided by DEF, so raise it to 8 or more, and add a line like "if mystuns > 0 then 5/5/10" so he covers up once he's been rocked.`);
    else if (myStuns > 0 && lowDef != null) tips.push(`He was stunned or dropped ${myStuns > 1 ? "more than once" : "once"}. A safety line such as "if mystuns > hisstuns then 5/5/10" helps him survive a bad round.`);
    if (myT >= 60 && myL / myT < 0.3 && hisT && hisL / hisT > myL / myT + 0.1) tips.push(`Only ${Math.round(100 * myL / myT)}% of his punches landed. ${opp} was harder to hit (more agility or defense). Jabs land more easily than power shots, so a little less POW and more AGG helps, and "(feint)" helps if he's the faster man.`);
    const closeLost = R.filter((r) => r.cards && r.cards.length && r.cards.filter((c) => c[i] < c[j]).length >= 2 && !(r.st[j].stun || r.st[j].kd) && thrown(r.st[i]) < thrown(r.st[j])).length;
    if (closeLost >= 3) tips.push(`He lost ${closeLost} rounds while throwing less than ${opp}. Judges reward punches landed (power 2, regular 1.5, jab 1), so a point or two more AGG in close rounds steals them, e.g. "if score <= 0 and round >= 4 then 7/6/7".`);
    const spent = R.filter((r) => en(r, j) < 0.3).length;
    if (spent >= 2 && s.decision && !lost) tips.push(`${opp} was spent for ${spent} rounds and still heard the final bell. Add a finishing line: "if opp = 0 then 6H/9/5" (or "if hisstuns > 0 then 6H/10/4") to go to the head once he's done.`);
    if (aggs.length >= 4 && new Set(tac.map((t) => (t.match(/aggressiveness = [0-9.]+, power = [0-9.]+, defense = [0-9.]+/) || [""])[0])).size === 1 && n >= 6) tips.push(`He fought every round with the same tactic. Conditions let him adapt: rest when tired, push when behind late ("if score < 0 and round >= 9 then 7H/8/5"), protect a lead ("if score >= 6 and round >= 9 then 3/4/11").`);
    if (tac.some((t) => /backfires/.test(t))) tips.push(`His counter-punching backfired: counters only work when his speed plus height beats the other man's. Drop "(counter)" against faster or taller men.`);
    if (R.some((r) => (r.post || []).some((p) => p.includes(F.name?.split(" ").pop() || "@@") && /refusing to break/.test(p)))) tips.push(`He lost a point for holding. Clinching with DEF over 10 risks that; keep clinch lines at DEF 10 or less.`);
    if (/doctor/.test(s.how || "") && lost) tips.push(`The doctor stopped it on his injuries. Higher DEF in the middle rounds, or more cut resistance next time you build, keeps cuts from piling up.`);
    try {
      const lim = ((C.DIVS || []).find((d) => d[0] === B.div) || [0, 999])[1], mw = C.minWeight ? C.minWeight(F) : 0;
      if (lim < 1e3 && mw > lim) tips.push(`He weighs in over the ${B.div} limit (lightest safe weight ${mw} lb vs ${lim}), so drying out cut his gas tank before the first bell. Move him up a division, or train agility or conditioning to bring his weight down.`);
    } catch (_) {
    }
    if ((F.kp || 0) > Math.floor((F.str || 0) / 3)) tips.push(`His KP (${F.kp}) is more than his strength supports (${F.str} STR allows ${Math.floor((F.str || 0) / 3)}). Each KP point needs 3 STR; train STR before more KP.`);
    else if ((F.kp || 0) > 0 && (F.str || 0) % 3 === 2) tips.push(`One more point of STR (to ${F.str + 1}) lets him carry another KP point, since every 3 STR supports 1 KP.`);
    if (!tips.length) tips.push(won ? `Clean work. Keep the plan, and scout his next opponent's public reports before fight night.` : `No single big mistake. Test small changes in Simbot (run it 100 times) against the same style before his next fight.`);
    lines.push(...tips.slice(0, 4).map((t, k) => `${k + 1}. ${t}`));
    lines.push(`Read the full report (with your private tactics and damage lines) from Recent Fight Cards. For more help: Help Pages > Fight Plan Strategy, or the "Ask your own AI" button on the fight plan page. (This is an automatic note; replies aren't read.)`);
    return lines.join("\n\n").slice(0, 3500);
  }

  // ../supabase/functions/league-runner/press.ts
  var fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
  var BEAT_HUMAN = [
    "Told you, {L}. Go back to the gym.",
    "{L} was tougher than I thought. Still wasn't enough.",
    "Next time bring a plan, {LG}.",
    "{how}. Who's next?",
    "Tell {LG} I said thanks for the work.",
    "I don't lose to new gyms. Write that down."
  ];
  var LOST_HUMAN = [
    "Good fight, {W}. I want the rematch.",
    "{W} got lucky. Run it back.",
    "I needed one more round.",
    "Back to the gym. {W}, enjoy it while it lasts.",
    "Respect to {W}. Won't happen twice."
  ];
  var KO = [
    "{L} didn't see that coming.",
    "Lights out. Who else wants some?",
    "I said it wouldn't go the distance. {how}.",
    "{LG}, send me somebody who can take a punch."
  ];
  var UPSET = [
    "Underdog? Not anymore.",
    "Everybody picked {L}. Everybody was wrong.",
    "Rankings don't fight. I do."
  ];
  var CHALLENGE = [
    "{H}, I've watched your fights. See you {day}.",
    "{day} is going to be a long night for {H}.",
    "{HG} can keep {H} home if they're scared.",
    "Hope {H} has been in camp. I have.",
    "{H} vs me, {day} at {venue}. Bring a better plan."
  ];
  function resultRelease(o) {
    const v = { W: o.W, WG: o.WG, L: o.L, LG: o.LG, how: o.how.charAt(0).toUpperCase() + o.how.slice(1) };
    if (o.vsHuman && o.botWon) return { author: o.authorWin, title: o.W, body: fill(rnd(BEAT_HUMAN), v) };
    if (o.vsHuman && !o.botWon) return { author: o.authorLose, title: o.L, body: fill(rnd(LOST_HUMAN), v) };
    if (o.upset) return { author: o.authorWin, title: o.W, body: fill(rnd(UPSET), v) };
    if (o.ko) return { author: o.authorWin, title: o.W, body: fill(rnd(KO), v) };
    return null;
  }
  function challengeRelease(author, v) {
    return { author, title: v.B, body: fill(rnd(CHALLENGE), v) };
  }

  // ../supabase/functions/league-runner/lib.ts
  var sb;
  var MAX_FIGHTS = 250;
  var HUMAN_LEAD = 3 * 24 * 60;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var chicago = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(/* @__PURE__ */ new Date()).map((x) => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute };
  };
  var addDays = (d, n) => {
    const t = /* @__PURE__ */ new Date(d + "T12:00:00Z");
    t.setUTCDate(t.getUTCDate() + n);
    return t.toISOString().slice(0, 10);
  };
  var weekday = (d) => DAYS[(/* @__PURE__ */ new Date(d + "T12:00:00Z")).getUTCDay()];
  function humanNight(C, div, today, mins) {
    const night = C.FIGHT_NIGHT[div];
    if (!night) return null;
    for (let n = 1; n <= 14; n++) {
      const d = addDays(today, n);
      if (weekday(d) === night && n * 1440 + 22 * 60 + 45 - mins >= HUMAN_LEAD) return d;
    }
    return null;
  }
  function anyNight(today, mins) {
    for (let n = 1; n <= 7; n++) if (n * 1440 + 22 * 60 + 45 - mins >= HUMAN_LEAD) return addDays(today, n);
    return null;
  }
  var pk = (u, f) => u + ":" + f;
  async function recentFights(today) {
    const r = (await sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid,fight_date").eq("status", "done").gte("fight_date", addDays(today, -1))).data || [];
    const m = /* @__PURE__ */ new Map();
    r.forEach((b) => [pk(b.red_user, b.red_fid), pk(b.blue_user, b.blue_fid)].forEach((k) => {
      if (!m.has(k) || m.get(k) < b.fight_date) m.set(k, b.fight_date);
    }));
    return m;
  }
  var restOk = (recent, k, today, mins) => {
    const d = recent.get(k);
    if (!d) return true;
    if (d >= today) return false;
    if (d === addDays(today, -1)) return mins >= 22 * 60 + 40;
    return true;
  };
  async function freeHumans(today, mins) {
    const hs = (await sb.from("profiles").select("id").eq("is_bot", false)).data || [];
    if (!hs.length) return [];
    const st = (await sb.from("gym_state").select("user_id,data").in("user_id", hs.map((h) => h.id))).data || [];
    const open = (await sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid").eq("status", "scheduled").eq("bot_only", false)).data || [];
    const busy = /* @__PURE__ */ new Set();
    open.forEach((b) => {
      busy.add(pk(b.red_user, b.red_fid));
      busy.add(pk(b.blue_user, b.blue_fid));
    });
    const recent = await recentFights(today);
    const out = [];
    st.forEach((r) => (r.data?.roster || []).forEach((k) => {
      const F = r.data[k];
      if (F && F.div && !F.deleteAfter && !rkDone(F) && !busy.has(pk(r.user_id, k)) && restOk(recent, pk(r.user_id, k), today, mins)) out.push(pk(r.user_id, k));
    }));
    return out;
  }
  var gk = (u) => /^00000000-0000-0000-0000-0000000000b[0-9a-f]$/.test(u) ? u.slice(-2) : /^00000000-0000-0000-0000-0000000000c[0-7]$/.test(u) ? "r" + u.slice(-1) : "small";
  var regOf = (F) => F?.region === "bk" ? "bk" : F?.region === "rk" ? "rk" : "";
  var rkDone = (F) => F?.region === "rk" && ((F.status || 0) >= 18 || (F.rec || [0, 0, 0])[0] + (F.rec || [0, 0, 0])[1] + (F.rec || [0, 0, 0])[2] >= 100);
  var nm = (F) => String(F?.name || "?").trim();
  async function postReleases(list, log) {
    for (const r of list) {
      const t = await sb.from("topics").insert({ forum: "press", title: r.title.slice(0, 120), author: r.author }).select("id").single();
      if (t.error) {
        log.push("press: " + t.error.message);
        return;
      }
      const p = await sb.from("posts").insert({ topic_id: t.data.id, author: r.author, body: r.body });
      if (p.error) {
        log.push("press: " + p.error.message);
        return;
      }
    }
  }
  var cardEntry = (F) => ({
    region: F.region || null,
    rec: F.rec,
    rating: F.rating || 0,
    status: F.status || 0,
    streak: F.streak || 0,
    earn: F.earn || 0,
    fans: F.fans || 0,
    ppv: F.ppv || 0,
    hist: (F.hist || []).slice(0, 25).map((h) => Object.fromEntries(["opp", "oh", "div", "belt", "date", "week", "res", "score", "icon", "ogym", "bout", "earned"].map((k) => [k, h[k] ?? null])))
  });
  async function gz(obj) {
    const st = new Blob([JSON.stringify(obj)]).stream().pipeThrough(new CompressionStream("gzip"));
    const buf = new Uint8Array(await new Response(st).arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode(...buf.subarray(i, i + 32768));
    return btoa(bin);
  }
  async function all(q) {
    const out = [];
    for (let from = 0; ; from += 1e3) {
      const { data, error } = await q().range(from, from + 999);
      if (error) throw error;
      out.push(...data);
      if (data.length < 1e3) return out;
    }
  }
  async function handle(req, client, C) {
    sb = client;
    const url = new URL(req.url);
    const { data: key } = await sb.from("runner_key").select("k").eq("id", 1).maybeSingle();
    if (!key?.k || req.headers.get("x-runner-key") !== key.k) return new Response("no", { status: 401 });
    const { date: realToday, mins } = chicago();
    const today = addDays(realToday, 1);
    const upto = url.searchParams.get("upto");
    const force = url.searchParams.get("force") === "1";
    const bookOnly = url.searchParams.get("book") === "1";
    const quick = !force && mins < 22 * 60 + 40;
    if (quick) {
      const fh = await freeHumans(today, mins);
      const last = (await sb.from("league_runs").select("unmatched").not("unmatched", "is", null).order("id", { ascending: false }).limit(1).maybeSingle()).data;
      const known = new Set(last?.unmatched || []);
      if (!fh.some((x) => !known.has(x))) return Response.json({ skipped: "not fight time, every manager's fighter is booked", today });
    }
    const { data: rid } = await sb.rpc("runner_begin");
    if (!rid) return Response.json({ skipped: "another pass is running" });
    const log = [];
    let ran = 0, booked = 0, vacated = 0, leftDue = 0, unmatched = null;
    const tonight = [];
    try {
      const vac = await sb.rpc("vacate_retired_champs");
      if (vac.error) log.push("vacate: " + vac.error.message);
      else vacated = (vac.data || []).length;
      const profs = await all(() => sb.from("profiles").select("id,gym,is_bot"));
      const P = Object.fromEntries(profs.map((p) => [p.id, p]));
      const states = await all(() => sb.from("gym_state").select("user_id,data"));
      const S = Object.fromEntries(states.map((s) => [s.user_id, s.data || {}]));
      if (!bookOnly && !quick) {
        const due = await all(() => sb.from("bouts").select("*").eq("status", "scheduled").lte("fight_date", upto && upto < today ? upto : today).order("fight_date").order("id"));
        for (const B of due) {
          if (ran >= MAX_FIGHTS) {
            leftDue++;
            continue;
          }
          if (B.belt) {
            log.push(`bout ${B.id}: title fight, left for the commissioner`);
            continue;
          }
          const FA = S[B.red_user]?.[B.red_fid], FB = S[B.blue_user]?.[B.blue_fid];
          if (!FA || !FB) {
            log.push(`bout ${B.id}: fighter missing`);
            continue;
          }
          try {
            const FA2 = P[B.red_user]?.is_bot ? { ...FA, plan: scoutedPlan(FA, gk(B.red_user), FB) || FA.plan } : FA;
            const FB2 = P[B.blue_user]?.is_bot ? { ...FB, plan: scoutedPlan(FB, gk(B.blue_user), FA) || FB.plan } : FB;
            const o = fightOne(C, B, { F: FA2, gym: P[B.red_user]?.gym || "" }, { F: FB2, gym: P[B.blue_user]?.gym || "" });
            [[B.red_user, FA, 0], [B.blue_user, FB, 1]].forEach(([u, F0, i]) => {
              if (!P[u]?.is_bot) return;
              const A = o.after[i];
              A.plan = F0.plan;
              const w = o.summary.w;
              learn(A, gk(u), w == null ? null : w === i, !o.summary.decision);
            });
            const { data, error } = await sb.rpc("commit_bout", { p_bout: B.id, p_summary: o.summary, p_result: o.result, p_mgr: o.mgr, p_after: o.after, p_cards: o.after.map(cardEntry) });
            if (error) {
              log.push(`bout ${B.id}: ${error.message}`);
              continue;
            }
            if (data === "done") {
              ran++;
              if (o.full) {
                try {
                  await sb.from("bouts").update({ result_z: await gz(o.full) }).eq("id", B.id);
                } catch (e) {
                  log.push(`bout ${B.id} report: ${e.message}`);
                }
              }
              tonight.push({ B, o, FA, FB });
              if (!B.bot_only) for (const [u, F, O, i] of [[B.red_user, FA, FB, 0], [B.blue_user, FB, FA, 1]]) {
                if (P[u]?.is_bot || !P[COACH_ID]) continue;
                try {
                  const body = coachNote(C, B, o, i, F, O);
                  if (body) {
                    const m = await sb.from("messages").insert({ sender: COACH_ID, recipient: u, body });
                    if (m.error) log.push(`coach ${B.id}: ${m.error.message}`);
                  }
                } catch (e) {
                  log.push(`coach ${B.id}: ${e.message}`);
                }
              }
              [[B.red_user, B.red_fid, o.after[0]], [B.blue_user, B.blue_fid, o.after[1]]].forEach(([u, k, F]) => {
                if (F.retireAfter) {
                  S[u].roster = (S[u].roster || []).filter((x) => x !== k);
                  delete S[u][k];
                } else S[u][k] = F;
              });
            }
          } catch (e) {
            log.push(`bout ${B.id}: ${e.message}`);
          }
        }
      }
      if (tonight.length) {
        const rel = [];
        let botPosts = 0;
        for (const { B, o, FA, FB } of tonight) {
          const w = o.summary.w;
          if (w == null) continue;
          const Wu = w === 0 ? B.red_user : B.blue_user, Lu = w === 0 ? B.blue_user : B.red_user;
          const WF = w === 0 ? FA : FB, LF = w === 0 ? FB : FA;
          const vsHuman = !P[B.red_user]?.is_bot || !P[B.blue_user]?.is_bot;
          const ko = !o.summary.decision, rt = o.summary.ratings, upset = rt[w] <= rt[1 - w] - 2;
          if (!vsHuman && !(ko || upset)) continue;
          if (!vsHuman && (botPosts >= 4 || Math.random() < 0.5)) continue;
          const r = resultRelease({ botWon: !!P[Wu]?.is_bot, vsHuman, ko, upset, W: nm(WF), WG: P[Wu]?.gym || "", L: nm(LF), LG: P[Lu]?.gym || "", how: o.summary.how, authorWin: Wu, authorLose: Lu });
          if (r && P[r.author]?.is_bot) {
            rel.push(r);
            if (!vsHuman) botPosts++;
          }
        }
        await postReleases(rel, log);
      }
      if (leftDue === 0 && (quick || bookOnly || mins >= 22 * 60 + 40)) {
        const midnight = !quick;
        const open = await all(() => sb.from("bouts").select("id,red_user,red_fid,blue_user,blue_fid,bot_only,fight_date").eq("status", "scheduled"));
        const busy = /* @__PURE__ */ new Set();
        open.forEach((b) => {
          busy.add(pk(b.red_user, b.red_fid));
          busy.add(pk(b.blue_user, b.blue_fid));
        });
        const bump = /* @__PURE__ */ new Map();
        const lastDate = /* @__PURE__ */ new Map();
        open.forEach((b) => {
          [pk(b.red_user, b.red_fid), pk(b.blue_user, b.blue_fid)].forEach((k) => {
            if (!lastDate.has(k) || lastDate.get(k) < b.fight_date) lastDate.set(k, b.fight_date);
          });
        });
        open.forEach((b) => {
          if (b.bot_only && b.fight_date > today) {
            bump.set(pk(b.red_user, b.red_fid), { id: b.id, partner: pk(b.blue_user, b.blue_fid), date: b.fight_date });
            bump.set(pk(b.blue_user, b.blue_fid), { id: b.id, partner: pk(b.red_user, b.red_fid), date: b.fight_date });
          }
        });
        const cancelIds = [];
        const pubs = await all(() => sb.from("gym_public").select("user_id,data").in("user_id", Object.keys(S).filter((u) => P[u]?.is_bot)));
        const PUB = Object.fromEntries(pubs.map((r) => [r.user_id, r.data || {}]));
        const taken = /* @__PURE__ */ new Set();
        Object.values(S).forEach((d) => (d.roster || []).forEach((k) => d[k]?.name && taken.add(nm(d[k]))));
        const allBots = [];
        Object.entries(S).forEach(([u, d]) => {
          if (P[u]?.is_bot) (d.roster || []).forEach((k) => d[k] && allBots.push({ u, k, F: d[k] }));
        });
        const mgmt = [];
        let signed = 0, retiredN = 0;
        for (const [u, d] of Object.entries(S)) {
          const key2 = gk(u);
          if (!midnight || !P[u]?.is_bot || !PUB[u]) continue;
          let changed = false;
          const card = PUB[u];
          if (!GYMS[key2]) {
            for (const k of [...d.roster || []]) {
              const F = d[k];
              if (!F || busy.has(pk(u, k))) continue;
              const why = shouldRetire(F);
              if (!why) continue;
              const di = C.DIVS.findIndex((x) => x[0] === F.div);
              if (di < 0) continue;
              d.roster = d.roster.filter((x) => x !== k);
              delete d[k];
              d.retired = [{ ...F, fid: k, retiredOn: realToday, why }, ...d.retired || []];
              card.fighters = (card.fighters || []).filter((f) => f.id !== k);
              card.retired = [{ id: "r0", name: F.name, div: F.div, region: F.region || null, rec: F.rec, rating: F.rating || 0, status: F.status || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0, hgt: F.hgt, home: F.home || "", titles: [], active: false, hist: [] }, ...card.retired || []].map((x, i) => ({ ...x, id: "r" + i }));
              retiredN++;
              changed = true;
              const t = typeOf(F) || (F.region === "bk" ? "BK Grinder" : "Slugger");
              const NF = makeFighter(C, t, F.div, C.DIVS[di][1], di ? C.DIVS[di - 1][1] : 0, key2, taken, F.home || "", { a: rnd([-1, 0, 1]), d: rnd([-1, 0, 1]) });
              if (!NF) continue;
              NF.planName = F.planName || NF.planName;
              const nk = "f" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
              d[nk] = NF;
              d.roster = [...d.roster, nk];
              card.fighters = [...card.fighters || [], {
                id: nk,
                region: NF.region || null,
                name: NF.name,
                nick: NF.nick,
                home: NF.home,
                div: NF.div,
                hgt: NF.hgt,
                w: C.natWeight(NF),
                mw: C.minWeight(NF),
                rec: [0, 0, 0, 0],
                hist: [],
                train: NF.train,
                active: true,
                rating: 0,
                status: 0,
                streak: 0,
                titles: [],
                earn: 0,
                fans: 0,
                ppv: 0
              }];
              signed++;
            }
            if (changed) {
              const a = await sb.from("gym_state").update({ data: d }).eq("user_id", u);
              const b = await sb.from("gym_public").update({ data: card }).eq("user_id", u);
              if (a.error || b.error) log.push(`roster ${P[u].gym}: ${(a.error || b.error).message}`);
            }
            continue;
          }
          for (const reg of isRkKey(key2) ? ["rk"] : ["", "bk"]) for (let di = 0; di < C.DIVS.length; di++) {
            const [div, lim] = C.DIVS[di], prev = di ? C.DIVS[di - 1][1] : 0;
            const mine = () => (d.roster || []).filter((k) => d[k] && d[k].div === div && regOf(d[k]) === reg);
            for (const k of mine()) {
              const F = d[k], why = busy.has(pk(u, k)) ? null : shouldRetire(F);
              if (!why) continue;
              d.roster = d.roster.filter((x) => x !== k);
              delete d[k];
              d.retired = [{ ...F, fid: k, div, retiredOn: realToday, why }, ...d.retired || []];
              card.fighters = (card.fighters || []).filter((f) => f.id !== k);
              card.retired = [{ id: "r0", name: F.name, div, region: F.region || null, rec: F.rec, rating: F.rating || 0, status: F.status || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0, hgt: F.hgt, home: F.home || "", titles: [], active: false, hist: [] }, ...card.retired || []].map((x, i) => ({ ...x, id: "r" + i }));
              changed = true;
              retiredN++;
            }
            const types = reg === "bk" ? BK_TYPES : REG_TYPES;
            let guard = 0;
            while (mine().length < PER_DIV && guard++ < 10) {
              const have = mine().map((k) => typeOf(d[k]));
              const t = [...types].sort((a, b) => have.filter((x) => x === a).length - have.filter((x) => x === b).length)[0];
              const peers = allBots.filter((x) => x.F.div === div && regOf(x.F) === reg && typeOf(x.F) === t && x.F.rec[0] + x.F.rec[1] + x.F.rec[2] >= 3).sort((a, b) => b.F.rec[0] - b.F.rec[1] - (a.F.rec[0] - a.F.rec[1]));
              const g = { ...peers[0] ? defaultGene(peers[0].F, gk(peers[0].u)) : defaultGene({}, key2) };
              if (Math.random() < 0.5) g[Math.random() < 0.5 ? "a" : "d"] += rnd([-1, 1]);
              const home = rnd(GYMS[key2].towns);
              const NF = makeFighter(C, t, div, lim, prev, key2, taken, home, g, reg === "rk");
              if (!NF) {
                log.push(`could not build a ${t} for ${P[u].gym} at ${div}`);
                break;
              }
              const nk = "n" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
              d[nk] = NF;
              d.roster = [...d.roster || [], nk];
              card.fighters = [...card.fighters || [], {
                id: nk,
                region: NF.region || null,
                name: NF.name,
                nick: NF.nick,
                home,
                div,
                hgt: NF.hgt,
                w: C.natWeight ? C.natWeight(NF) : 0,
                mw: C.minWeight(NF),
                rec: [0, 0, 0, 0],
                hist: [],
                train: NF.train,
                active: true,
                rating: 0,
                status: 0,
                streak: 0,
                titles: [],
                earn: 0,
                fans: 0,
                ppv: 0
              }];
              allBots.push({ u, k: nk, F: NF });
              changed = true;
              signed++;
            }
          }
          if (changed) {
            const a = await sb.from("gym_state").update({ data: d }).eq("user_id", u);
            const b = await sb.from("gym_public").update({ data: card }).eq("user_id", u);
            if (a.error || b.error) log.push(`roster ${P[u].gym}: ${(a.error || b.error).message}`);
          }
        }
        if (signed || retiredN) log.push(`bots: ${retiredN} retired, ${signed} signed`);
        const recent = await recentFights(today);
        const free = (bot) => {
          const out = [];
          for (const [u, d] of Object.entries(S)) {
            if (!P[u] || !!P[u].is_bot !== bot) continue;
            for (const k of d.roster || []) {
              const F = d[k];
              if (F && F.div && !rkDone(F) && !busy.has(pk(u, k)) && restOk(recent, pk(u, k), today, mins)) out.push({ u, k, F, gym: P[u].gym, reg: regOf(F) });
            }
          }
          return out;
        };
        const rows = [];
        const book = (a, b, date, botOnly) => {
          const ra = a.F.rating || 0, rb = b.F.rating || 0, contender = Math.max(ra, rb) >= 3;
          const v = C.pickVenue(C.venueTier(a.F.div, ra, rb, null, 1, contender));
          v.tv = C.broadcastTier(null, 1, contender);
          rows.push({ fight_date: date, div: a.F.div, red_user: a.u, red_fid: a.k, blue_user: b.u, blue_fid: b.k, belt: null, rounds: a.reg === "bk" ? 25 : 12, region: a.reg || null, status: "scheduled", venue: v, bot_only: botOnly });
          busy.add(pk(a.u, a.k));
          busy.add(pk(b.u, b.k));
        };
        const allBotList = [];
        for (const [u, d] of Object.entries(S)) if (P[u]?.is_bot) for (const k of d.roster || []) {
          const F = d[k];
          if (F && F.div && !rkDone(F)) allBotList.push({ u, k, F, gym: P[u].gym, reg: regOf(F) });
        }
        const rkGyms = Object.keys(S).filter((u) => P[u]?.is_bot && isRkKey(gk(u)) && PUB[u]);
        let rkTurn = 0;
        const signRookieFor = async (h, total) => {
          if (!rkGyms.length) return null;
          const u = rkGyms[rkTurn++ % rkGyms.length], key2 = gk(u), d = S[u], card = PUB[u];
          const di = C.DIVS.findIndex((x2) => x2[0] === h.F.div);
          if (di < 0) return null;
          const t = rnd(REG_TYPES), home = rnd(GYMS[key2].towns);
          const NF = makeFighter(C, t, h.F.div, C.DIVS[di][1], di ? C.DIVS[di - 1][1] : 0, key2, taken, home, defaultGene({}, key2), true, total);
          if (!NF) {
            log.push(`could not build a ${total}-point rookie for ${nm(h.F)}`);
            return null;
          }
          const nk = "n" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
          d[nk] = NF;
          d.roster = [...d.roster || [], nk];
          card.fighters = [...card.fighters || [], {
            id: nk,
            region: "rk",
            name: NF.name,
            nick: NF.nick,
            home,
            div: NF.div,
            hgt: NF.hgt,
            w: C.natWeight ? C.natWeight(NF) : 0,
            mw: C.minWeight(NF),
            rec: [0, 0, 0, 0],
            hist: [],
            train: NF.train,
            active: true,
            rating: 0,
            status: 0,
            streak: 0,
            titles: [],
            earn: 0,
            fans: 0,
            ppv: 0
          }];
          const a1 = await sb.from("gym_state").update({ data: d }).eq("user_id", u), b1 = await sb.from("gym_public").update({ data: card }).eq("user_id", u);
          if (a1.error || b1.error) {
            log.push(`rookie signing ${P[u].gym}: ${(a1.error || b1.error).message}`);
            return null;
          }
          const x = { u, k: nk, F: NF, gym: P[u].gym, reg: "rk" };
          allBotList.push(x);
          signed++;
          log.push(`${P[u].gym} signed ${NF.name} (${total} pts) to face ${nm(h.F)}`);
          return x;
        };
        const AP = (F) => ["str", "kp", "spd", "agl", "chn", "cnd", "hgt", "cut"].reduce((t, k) => t + (+F[k] || 0), 0);
        const fair = (a, b) => Math.abs(AP(a.F) - AP(b.F)) <= 1;
        const gap = (a, b) => Math.abs((a.F.status || 0) - (b.F.status || 0)) * 100 + Math.abs((a.F.rating || 0) - (b.F.rating || 0));
        unmatched = [];
        for (const h of free(false)) {
          if (h.F.deleteAfter) continue;
          const debut = h.reg === "rk" && !(h.F.rec || []).slice(0, 3).some((x) => x > 0) && !(h.F.hist || []).some((x) => x.bout);
          const date = debut ? mins <= 10 * 60 + 40 ? today : addDays(today, 1) : h.reg === "rk" ? anyNight(today, mins) : humanNight(C, h.F.div, today, mins);
          if (!date) continue;
          const seen = new Set((h.F.hist || []).filter((x) => x.bout).map((x) => x.opp + "|" + x.ogym));
          const lastGym = ((h.F.hist || []).find((x) => x.bout) || {}).ogym;
          const before = (b) => busy.has(pk(b.u, b.k)) && (lastDate.get(pk(b.u, b.k)) || "9999") <= addDays(date, -3);
          const bumpable = (b) => {
            const x = bump.get(pk(b.u, b.k));
            return !!x && x.date >= date && !before(b);
          };
          const open2 = (b) => !busy.has(pk(b.u, b.k)) || before(b) || bumpable(b);
          const cands = allBotList.filter((b) => b.F.div === h.F.div && b.reg === h.reg && open2(b) && fair(h, b));
          if (!cands.length && h.reg === "rk") {
            const nb = await signRookieFor(h, AP(h.F));
            if (nb) cands.push(nb);
          }
          if (!cands.length) {
            unmatched.push(pk(h.u, h.k));
            log.push(`no fair opponent free for ${nm(h.F)} (${h.F.div}, ${AP(h.F)} AP, ${h.F.rating || 0}/${h.F.status || 0})`);
            continue;
          }
          const score = (b) => gap(h, b) * 10 + (bumpable(b) ? 5 : before(b) ? 2 : 0) + (seen.has(b.F.name + "|" + b.gym) ? 3 : 0) + (b.gym === lastGym ? 1 : 0) + Math.random() * 0.9;
          cands.sort((x, y) => score(x) - score(y));
          const opp = cands[0], bm = bumpable(opp) ? bump.get(pk(opp.u, opp.k)) : void 0;
          if (bm) {
            cancelIds.push(bm.id);
            bump.delete(pk(opp.u, opp.k));
            bump.delete(bm.partner);
            busy.delete(bm.partner);
            log.push(`bout ${bm.id} (bot vs bot) cancelled to make room for ${nm(h.F)}`);
          }
          book(h, opp, date, false);
          lastDate.set(pk(opp.u, opp.k), date);
          lastDate.set(pk(h.u, h.k), date);
        }
        const byDiv = {};
        const left = [];
        if (midnight) free(true).filter((b) => !busy.has(pk(b.u, b.k)) && b.reg !== "rk").forEach((b) => (byDiv[b.F.div + "|" + b.reg] ||= []).push(b));
        for (const [dk, list] of Object.entries(byDiv)) {
          const div = dk.split("|")[0];
          const date = humanNight(C, div, today, mins);
          if (!date) continue;
          list.forEach((b) => b.r = Math.random());
          list.sort((x, y) => (y.F.status || 0) - (x.F.status || 0) || (y.F.rating || 0) - (x.F.rating || 0) || x.r - y.r);
          while (list.length > 1) {
            const a = list.shift();
            const recent2 = new Set((a.F.hist || []).slice(0, 3).map((x) => x.opp + "|" + x.ogym));
            let best = -1, bs = Infinity;
            list.forEach((b2, j) => {
              if (b2.gym === a.gym || !fair(a, b2)) return;
              const sc = gap(a, b2) * 10 + (recent2.has(b2.F.name + "|" + b2.gym) ? 3 : 0) + Math.random() * 0.5;
              if (sc < bs) {
                bs = sc;
                best = j;
              }
            });
            if (best < 0) {
              left.push({ a, date });
              continue;
            }
            const [b] = list.splice(best, 1);
            book(a, b, date, true);
            lastDate.set(pk(a.u, a.k), date);
            lastDate.set(pk(b.u, b.k), date);
          }
          if (list.length) left.push({ a: list[0], date });
        }
        for (const { a, date } of left) {
          if (busy.has(pk(a.u, a.k))) continue;
          const before = (b) => (lastDate.get(pk(b.u, b.k)) || "9999") <= addDays(date, -3);
          const c = allBotList.filter((b) => b.F.div === a.F.div && b.reg === a.reg && b.gym !== a.gym && fair(a, b) && (!busy.has(pk(b.u, b.k)) || before(b)));
          if (!c.length) {
            log.push(`no fair opponent for ${nm(a.F)} (${P[a.u]?.gym}, ${a.F.div}${a.reg ? " " + a.reg.toUpperCase() : ""})`);
            continue;
          }
          c.sort((x, y) => gap(a, x) - gap(a, y) || Math.random() - 0.5);
          book(a, c[0], date, true);
          lastDate.set(pk(a.u, a.k), date);
          lastDate.set(pk(c[0].u, c[0].k), date);
        }
        if (cancelIds.length) {
          const { error } = await sb.from("bouts").update({ status: "cancelled" }).in("id", cancelIds).eq("status", "scheduled").eq("bot_only", true);
          if (error) log.push("cancel: " + error.message);
        }
        for (let i = 0; i < rows.length; i += 200) {
          const { error } = await sb.from("bouts").insert(rows.slice(i, i + 200));
          if (error) {
            log.push("booking: " + error.message);
            break;
          } else booked += Math.min(200, rows.length - i);
        }
        for (const r of rows.filter((x) => !x.bot_only)) {
          const [hu, hk, bu, bk] = P[r.red_user]?.is_bot ? [r.blue_user, r.blue_fid, r.red_user, r.red_fid] : [r.red_user, r.red_fid, r.blue_user, r.blue_fid];
          const day = (/* @__PURE__ */ new Date(r.fight_date + "T12:00:00Z")).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
          mgmt.push(challengeRelease(bu, { B: nm(S[bu][bk]), BG: P[bu].gym, H: nm(S[hu][hk]), HG: P[hu].gym, day, venue: r.venue?.name || "the arena" }));
        }
        await postReleases(mgmt, log);
        if (midnight && P[COACH_ID]) {
          const eve = addDays(today, 1);
          const up = (await sb.from("bouts").select("id,red_user,red_fid,blue_user,blue_fid,div,region,fight_date,venue").eq("status", "scheduled").eq("fight_date", eve).eq("region", "rk").eq("bot_only", false)).data || [];
          if (up.length) {
            const fresh = (await sb.from("coach_reminders").upsert(up.map((b) => ({ bout_id: b.id })), { onConflict: "bout_id", ignoreDuplicates: true }).select("bout_id")).data || [];
            const go = new Set(fresh.map((r) => r.bout_id));
            for (const b of up.filter((x) => go.has(x.id))) for (const [u, k, ou, ok] of [[b.red_user, b.red_fid, b.blue_user, b.blue_fid], [b.blue_user, b.blue_fid, b.red_user, b.red_fid]]) {
              if (P[u]?.is_bot) continue;
              const F = S[u]?.[k], O = S[ou]?.[ok];
              if (!F || !O) continue;
              const r = O.rec || [0, 0, 0, 0], plan = String(F.plan || "").trim();
              const starter = !plan || plan === "6/6/8" || (F.planName || "Basic") === "Basic";
              const body = [
                `Fight tomorrow night! ${nm(F)} meets ${nm(O)} from ${P[ou]?.gym || "another gym"} (${b.div}weight, Rookies). The card runs at about 10:45 PM Central tomorrow${b.venue?.name ? " at " + b.venue.name : ""}.`,
                `Scouting: ${nm(O)} is ${r[0]}-${r[1]}-${r[2]} with ${r[3] || 0} KO${r[3] === 1 ? "" : "s"}, ${C.ht ? C.ht(60 + (O.hgt || 0)) : ""} tall. Click his name on your fighter's page to read his past fight reports.`,
                starter ? `Your fighter is still on the starter plan. Even two extra lines help: a rest line ("if endurance_percent < 45 then 4/5/9") and a late push ("if score < 0 and round >= 9 then 7H/8/5"). Test them in Simbot first.` : `Last chance to tune his plan. Run it 100 times in Simbot against a few different styles to check it.`,
                `Whatever plan is saved when the fights run is the one he uses. Good luck! (Automatic note; replies aren't read.)`
              ].join("\n\n");
              const m = await sb.from("messages").insert({ sender: COACH_ID, recipient: u, body });
              if (m.error) log.push(`reminder ${b.id}: ${m.error.message}`);
            }
          }
        }
      }
    } catch (e) {
      log.push("error: " + e.message);
    }
    await sb.from("league_runs").update({ finished_at: (/* @__PURE__ */ new Date()).toISOString(), ran, booked, vacated, left_due: leftDue, unmatched, note: log.join("\n").slice(0, 4e3) || null }).eq("id", rid);
    return Response.json({ today, ran, booked, vacated, leftDue, log });
  }
  return __toCommonJS(lib_exports);
})();
