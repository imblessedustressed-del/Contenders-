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
    const mgr = [f.rounds.map((R) => (R.mgr || [])[0] || ""), f.rounds.map((R) => (R.mgr || [])[1] || "")];
    f.rounds.forEach((R) => {
      delete R.mgr;
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
    const result = B.bot_only ? null : { f, b: { rounds: B.rounds || 12, belt, div, gym: "", gyms: [red.gym, blue.gym], recs: [FA.rec.slice(), FB.rec.slice()], date } };
    return { summary, result, mgr: B.bot_only ? null : mgr, after };
  }

  // ../supabase/functions/league-runner/botgen.ts
  var FIRST = ["Abel", "Ade", "Alonzo", "Amos", "Arlo", "Arturo", "August", "Bastian", "Beau", "Bennett", "Boris", "Brady", "Bram", "Cade", "Calvin", "Cecil", "Chance", "Cliff", "Colton", "Cyrus", "Dale", "Dante", "Darnell", "Deacon", "Dexter", "Dimitri", "Donnie", "Dorian", "Earl", "Efrain", "Elias", "Emeka", "Emmett", "Enzo", "Ernesto", "Ezra", "Felix", "Garrett", "Gideon", "Grady", "Hank", "Harlan", "Hollis", "Hugo", "Ignacio", "Isaiah", "Jabari", "Jalen", "Jasper", "Joaquin", "Jonah", "Judd", "Kareem", "Kendrick", "Kofi", "Lamar", "Lance", "Leland", "Lorenzo", "Lucius", "Malik", "Mateo", "Mason", "Mitch", "Monty", "Nestor", "Nico", "Noel", "Obi", "Orlando", "Otis", "Pablo", "Percy", "Quentin", "Quincy", "Ramon", "Rhett", "Roman", "Rufus", "Saul", "Silas", "Stefan", "Thad", "Tobias", "Tyrell", "Ulysses", "Vaughn", "Virgil", "Wade", "Walker", "Xavier", "Yusuf", "Zane"];
  var LAST = ["Abernathy", "Acosta", "Ambrose", "Arceneaux", "Ashby", "Barlow", "Beckett", "Bellamy", "Blackwood", "Boudreaux", "Bramwell", "Calloway", "Cantrell", "Carrasco", "Chatman", "Colfax", "Crenshaw", "Dabney", "Delacroix", "Draper", "Dunmore", "Easton", "Echols", "Fairbanks", "Falcone", "Fenwick", "Galloway", "Garland", "Gentry", "Gutierrez", "Halloran", "Harrow", "Hastings", "Hightower", "Holloway", "Ingram", "Jarvis", "Kessler", "Kingsley", "Lachance", "Landry", "Larkin", "Lockhart", "Maddox", "Mancini", "Marchetti", "McCrae", "Mendez", "Merriweather", "Nakamura", "Northcutt", "Obuya", "Okafor", "Oyelaran", "Pembrook", "Pettigrew", "Quintero", "Radcliffe", "Rainwater", "Rasheed", "Reinholt", "Rocha", "Rutledge", "Salcedo", "Santangelo", "Shackleford", "Slade", "Stroud", "Tamayo", "Thibodeaux", "Treadwell", "Underhill", "Valdez", "Vasquez", "Voss", "Wakefield", "Whitaker", "Winslow", "Yarbrough", "Zamora", "Zeller"];
  var NICK = ["Brick House", "The Mechanic", "Quicksilver", "Sandman", "The Mailman", "Big Train", "Thunder", "The Undertaker", "Lockjaw", "Night Train", "The Bull", "Mojo", "Showtime", "Ice Water", "The Tailor", "Gravedigger", "Little Hands", "The Freight", "Rawhide", "Hammerhand", "Easy Money", "The Prospector", "Dynamo", "Sweet Feet", "Ironside", "Copperhead", "The Anvil", "Cyclone", "Tank", "Velvet", "", "", "", "", "", "", ""];
  var GYMS = { "b4": { "temper": 0, "towns": ["New Orleans, Louisiana", "Baton Rouge, Louisiana", "Lafayette, Louisiana", "Houston, Texas", "Mobile, Alabama", "Biloxi, Mississippi", "Kingston, Jamaica", "Havana, Cuba"], "short": "Bayou" }, "b5": { "temper": 1, "towns": ["Pittsburgh, Pennsylvania", "Youngstown, Ohio", "Buffalo, New York", "Erie, Pennsylvania", "Wheeling, West Virginia", "Gary, Indiana", "Glasgow, Scotland", "Cardiff, Wales"], "short": "Steel" }, "b6": { "temper": -1, "towns": ["Phoenix, Arizona", "Tucson, Arizona", "El Paso, Texas", "Albuquerque, New Mexico", "Hermosillo, Mexico", "Mexicali, Mexico", "Reno, Nevada", "Las Cruces, New Mexico"], "short": "Desert" }, "b7": { "temper": 0, "towns": ["Baltimore, Maryland", "Norfolk, Virginia", "Boston, Massachusetts", "Providence, Rhode Island", "Liverpool, England", "Dublin, Ireland", "Lagos, Nigeria", "San Juan, Puerto Rico"], "short": "Harbor" }, "b8": { "temper": 1, "towns": ["Detroit, Michigan", "Flint, Michigan", "Toledo, Ohio", "Akron, Ohio", "Milwaukee, Wisconsin", "Windsor, Ontario", "Sheffield, England", "Leeds, England"], "short": "Rust" }, "b9": { "temper": -1, "towns": ["San Diego, California", "Los Angeles, California", "Oxnard, California", "Tijuana, Mexico", "Ensenada, Mexico", "Honolulu, Hawaii", "Cebu, Philippines", "Auckland, New Zealand"], "short": "Pacific" }, "ba": { "temper": 0, "towns": ["San Antonio, Texas", "Dallas, Texas", "Fort Worth, Texas", "Corpus Christi, Texas", "Laredo, Texas", "Monterrey, Mexico", "Oklahoma City, Oklahoma", "Tulsa, Oklahoma"], "short": "Lone" }, "bb": { "temper": 1, "towns": ["Atlantic City, New Jersey", "Camden, New Jersey", "Trenton, New Jersey", "Philadelphia, Pennsylvania", "Wilmington, Delaware", "Bronx, New York", "Kingston, Jamaica", "Santo Domingo, Dominican Republic"], "short": "Atlantic" } };
  var TW = { "Slugger": { "w": [0.21, 0.03, 0.19, 0.15, 0.2, 0.22], "dh": 0, "train": ["str", "cnd"] }, "KO Puncher": { "w": [0.21, 0.05, 0.18, 0.17, 0.19, 0.2], "dh": 0, "train": ["str", "kp"] }, "Dancer": { "w": [0.15, 0.02, 0.23, 0.24, 0.16, 0.2], "dh": 1, "train": ["agl", "spd"] }, "Counterpuncher": { "w": [0.19, 0.03, 0.2, 0.17, 0.19, 0.22], "dh": -1, "train": ["spd", "agl"] }, "Clincher": { "w": [0.18, 0.02, 0.19, 0.16, 0.2, 0.25], "dh": 0, "train": ["cnd", "chn"] } };
  var REG_TYPES = ["Slugger", "KO Puncher", "Dancer", "Counterpuncher", "Clincher"];
  var BK_TYPES = ["BK Grinder", "BK Clincher", "BK Flasher"];
  var PER_DIV = 5;
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
    g.a = clamp(g.a, -3, 3);
    g.d = clamp(g.d, -3, 4);
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
    if ((F.aploss || 0) >= 3) return "worn down by too many wars";
    if (n >= 8 && r[1] - r[0] >= 4) return "the losses piled up";
    if (n >= 40) return "a long career";
    return null;
  }
  var K = ["str", "kp", "spd", "agl", "chn", "cnd"];
  function regStats(t, hgt, cut) {
    const pool = 70 - hgt - cut, w = TW[t].w;
    const st = w.map((x) => Math.max(1, Math.round(pool * x)));
    st[1] = Math.min(st[1], Math.max(0, Math.floor(st[0] / 2)));
    const order = [5, 2, 3, 4, 0];
    let i = 0;
    const sum = () => st.reduce((a, b) => a + b, 0);
    while (sum() !== pool && i < 500) {
      const k = order[i % 5];
      if (sum() < pool) st[k]++;
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
  function makeFighter(C, t, div, lim, prevLim, gymKey, taken, home, gene) {
    const bk = t.startsWith("BK "), builds = ["very heavy", "heavy", "normal", "light", "very light"];
    let best = null;
    const heavy = div === "Heavy", target = bk ? 204 : 210 + Math.floor(Math.random() * 66);
    for (let h = 60; h <= 81; h++) {
      const cut = bk ? 1 : rnd([1, 2, 2, 3]);
      const st = bk ? bkStats(t, 70 - (h - 60) - cut) : regStats(t, h - 60, cut);
      if (st.spd < 1 || K.reduce((a, k) => a + st[k], 0) + (h - 60) + cut !== 70) continue;
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
      ...bk ? { region: "bk" } : {},
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
  function nextNight(C, div, today) {
    const night = C.FIGHT_NIGHT[div];
    if (!night) return null;
    for (let n = 1; n <= 7; n++) {
      const d = addDays(today, n);
      if (weekday(d) === night) return n === 1 ? addDays(d, 7) : d;
    }
    return null;
  }
  function humanNight(C, div, today, mins) {
    const night = C.FIGHT_NIGHT[div];
    if (!night) return null;
    for (let n = 1; n <= 8; n++) {
      const d = addDays(today, n);
      if (weekday(d) === night && n * 1440 + 22 * 60 + 45 - mins >= HUMAN_LEAD) return d;
    }
    return null;
  }
  var pk = (u, f) => u + ":" + f;
  async function freeHumans() {
    const hs = (await sb.from("profiles").select("id").eq("is_bot", false)).data || [];
    if (!hs.length) return [];
    const st = (await sb.from("gym_state").select("user_id,data").in("user_id", hs.map((h) => h.id))).data || [];
    const open = (await sb.from("bouts").select("red_user,red_fid,blue_user,blue_fid").eq("status", "scheduled").eq("bot_only", false)).data || [];
    const busy = /* @__PURE__ */ new Set();
    open.forEach((b) => {
      busy.add(pk(b.red_user, b.red_fid));
      busy.add(pk(b.blue_user, b.blue_fid));
    });
    const out = [];
    st.forEach((r) => (r.data?.roster || []).forEach((k) => {
      const F = r.data[k];
      if (F && F.div && !F.deleteAfter && !busy.has(pk(r.user_id, k))) out.push(pk(r.user_id, k));
    }));
    return out;
  }
  var gk = (u) => /^00000000-0000-0000-0000-0000000000b[0-9a-f]$/.test(u) ? u.slice(-2) : "small";
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
    hist: (F.hist || []).slice(0, 25).map((h) => Object.fromEntries(["opp", "oh", "div", "belt", "date", "week", "res", "score", "icon", "plan", "ogym", "bout", "earned"].map((k) => [k, h[k] ?? null])))
  });
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
    const { date: today, mins } = chicago();
    const force = url.searchParams.get("force") === "1";
    const bookOnly = url.searchParams.get("book") === "1";
    const quick = !force && mins < 22 * 60 + 40;
    if (quick) {
      const fh = await freeHumans();
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
        const due = await all(() => sb.from("bouts").select("*").eq("status", "scheduled").lte("fight_date", today).order("fight_date").order("id"));
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
              tonight.push({ B, o, FA, FB });
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
      if (leftDue === 0 && (quick || bookOnly || mins >= 23 * 60 + 50)) {
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
              d.retired = [{ ...F, fid: k, retiredOn: today, why }, ...d.retired || []];
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
                plan: NF.planName,
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
          for (const reg of ["", "bk"]) for (let di = 0; di < C.DIVS.length; di++) {
            const [div, lim] = C.DIVS[di], prev = di ? C.DIVS[di - 1][1] : 0;
            const mine = () => (d.roster || []).filter((k) => d[k] && d[k].div === div && (d[k].region === "bk" ? "bk" : "") === reg);
            for (const k of mine()) {
              const F = d[k], why = busy.has(pk(u, k)) ? null : shouldRetire(F);
              if (!why) continue;
              d.roster = d.roster.filter((x) => x !== k);
              delete d[k];
              d.retired = [{ ...F, fid: k, div, retiredOn: today, why }, ...d.retired || []];
              card.fighters = (card.fighters || []).filter((f) => f.id !== k);
              card.retired = [{ id: "r0", name: F.name, div, region: F.region || null, rec: F.rec, rating: F.rating || 0, status: F.status || 0, earn: F.earn || 0, fans: F.fans || 0, ppv: F.ppv || 0, hgt: F.hgt, home: F.home || "", titles: [], active: false, hist: [] }, ...card.retired || []].map((x, i) => ({ ...x, id: "r" + i }));
              changed = true;
              retiredN++;
            }
            const types = reg ? BK_TYPES : REG_TYPES;
            let guard = 0;
            while (mine().length < PER_DIV && guard++ < 10) {
              const have = mine().map((k) => typeOf(d[k]));
              const t = [...types].sort((a, b) => have.filter((x) => x === a).length - have.filter((x) => x === b).length)[0];
              const peers = allBots.filter((x) => x.F.div === div && (x.F.region === "bk" ? "bk" : "") === reg && typeOf(x.F) === t && x.F.rec[0] + x.F.rec[1] + x.F.rec[2] >= 3).sort((a, b) => b.F.rec[0] - b.F.rec[1] - (a.F.rec[0] - a.F.rec[1]));
              const g = { ...peers[0] ? defaultGene(peers[0].F, gk(peers[0].u)) : defaultGene({}, key2) };
              if (Math.random() < 0.5) g[Math.random() < 0.5 ? "a" : "d"] += rnd([-1, 1]);
              const home = rnd(GYMS[key2].towns);
              const NF = makeFighter(C, t, div, lim, prev, key2, taken, home, g);
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
                plan: NF.planName,
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
        const free = (bot) => {
          const out = [];
          for (const [u, d] of Object.entries(S)) {
            if (!P[u] || !!P[u].is_bot !== bot) continue;
            for (const k of d.roster || []) {
              const F = d[k];
              if (F && F.div && !busy.has(pk(u, k))) out.push({ u, k, F, gym: P[u].gym, reg: F.region === "bk" ? "bk" : "" });
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
          if (F && F.div) allBotList.push({ u, k, F, gym: P[u].gym, reg: F.region === "bk" ? "bk" : "" });
        }
        const AP = (F) => ["str", "kp", "spd", "agl", "chn", "cnd", "hgt", "cut"].reduce((t, k) => t + (+F[k] || 0), 0);
        const fair = (a, b) => Math.abs(AP(a.F) - AP(b.F)) <= 1;
        const gap = (a, b) => Math.abs((a.F.status || 0) - (b.F.status || 0)) * 100 + Math.abs((a.F.rating || 0) - (b.F.rating || 0));
        unmatched = [];
        for (const h of free(false)) {
          if (h.F.deleteAfter) continue;
          const date = humanNight(C, h.F.div, today, mins);
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
        if (midnight) free(true).filter((b) => !busy.has(pk(b.u, b.k))).forEach((b) => (byDiv[b.F.div + "|" + b.reg] ||= []).push(b));
        for (const [dk, list] of Object.entries(byDiv)) {
          const div = dk.split("|")[0];
          const date = nextNight(C, div, today);
          if (!date) continue;
          list.forEach((b) => b.r = Math.random());
          list.sort((x, y) => (y.F.status || 0) - (x.F.status || 0) || (y.F.rating || 0) - (x.F.rating || 0) || x.r - y.r);
          while (list.length > 1) {
            const a = list.shift();
            const recent = new Set((a.F.hist || []).slice(0, 3).map((x) => x.opp + "|" + x.ogym));
            let best = -1, bs = Infinity;
            list.forEach((b2, j) => {
              if (b2.gym === a.gym || !fair(a, b2)) return;
              const sc = gap(a, b2) * 10 + (recent.has(b2.F.name + "|" + b2.gym) ? 3 : 0) + Math.random() * 0.5;
              if (sc < bs) {
                bs = sc;
                best = j;
              }
            });
            if (best < 0) continue;
            const [b] = list.splice(best, 1);
            book(a, b, date, true);
          }
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
      }
    } catch (e) {
      log.push("error: " + e.message);
    }
    await sb.from("league_runs").update({ finished_at: (/* @__PURE__ */ new Date()).toISOString(), ran, booked, vacated, left_due: leftDue, unmatched, note: log.join("\n").slice(0, 4e3) || null }).eq("id", rid);
    return Response.json({ today, ran, booked, vacated, leftDue, log });
  }
  return __toCommonJS(lib_exports);
})();
