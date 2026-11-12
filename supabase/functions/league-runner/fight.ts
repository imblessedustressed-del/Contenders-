// One league bout with the real engine (same as tools/league.py).

export function fightOne(C: any, B: any, red: any, blue: any) {
  const FA = red.F, FB = blue.F, div = B.div, belt = B.belt || null, star = 1;
  const rR = FA.rating || 0, rB = FB.rating || 0;
  const f: any = (C as any).simulate(C.prepFighter(FA, FA, FB, div), C.prepFighter(FB, FA, FB, div), B.rounds || 12);
  const r = f.result, how = r.decision ? r.type.toLowerCase() : `${r.type} in round ${r.round} (${C.fmt(r.t)})`;
  const score = f.totals.map((t: number[]) => t.join("-")).join(", ");
  const purse = C.boutPurses(rR, rB, belt, null, star);
  const v = B.venue || { name: "", city: "", cap: 1000, tier: "club", tv: "stream" };
  const att = C.attendanceFor(v, Math.max(rR, rB), belt, star);
  const tier = v.tv || "stream";
  const fans = C.fightFans(f, belt, tier);
  const tv = C.broadcastResult(tier, [FA.fans || 0, FB.fans || 0], [rR, rB], [FA.home, FB.home], 0, purse);
  const d = new Date(B.fight_date + "T12:00:00");
  const date = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const sdate = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const mgr = [f.rounds.map((R: any) => (R.mgr || [])[0] || ""), f.rounds.map((R: any) => (R.mgr || [])[1] || "")];
  f.rounds.forEach((R: any) => { delete R.mgr; });
  f.S = f.S.map((x: any) => ({ n: x.n, F: { name: x.F.name, nick: x.F.nick, home: x.F.home, hgt: x.F.hgt } }));
  const after = [structuredClone(FA), structuredClone(FB)];
  [0, 1].forEach((i) => {
    const op = i ? FA : FB, opGym = i ? red.gym : blue.gym;
    C.applyResult(after[i], i, { w: r.w, decision: r.decision, type: r.type, how, score, ip: f.ip[i], purse: purse[i] + ((tv.pay || [0, 0])[i] || 0), fans: fans[i], buys: tv.buys || 0, oppRating: i ? rR : rB, belt },
      { id: "L" + B.id, bout: B.id, oid: null, oh: C.ht(60 + op.hgt), opp: op.name, ogym: opGym, div, belt, date: sdate, week: 1 });
  });
  const summary = { w: r.w, decision: !!r.decision, type: r.type, round: r.round, how, score, ip: f.ip, ratings: [rR, rB], purse, att, fans, tv };
  // Bot-vs-bot bouts keep the result line only; any bout with a human keeps the full report.
  const result = B.bot_only ? null : { f, b: { rounds: B.rounds || 12, belt, div, gym: "", gyms: [red.gym, blue.gym], recs: [FA.rec.slice(), FB.rec.slice()], date } };
  return { summary, result, mgr: B.bot_only ? null : mgr, after };
}

