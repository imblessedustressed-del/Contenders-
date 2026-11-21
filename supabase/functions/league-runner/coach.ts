// The Corner Coach (owner, Nov 15, 2026): after every fight with a manager's fighter, a private message that reads the fight
// (his private tactics and damage lines, punch stats, endurance, his abilities and weight) and says what went wrong and what to try.
// Built-in rules only: free, no outside AI. The coach never sees or quotes the other gym's plan; only public facts about the opponent.
export const COACH_ID = "00000000-0000-0000-0000-0000000000d0";

const num = (s: string, k: string) => { const m = new RegExp(k + " = ([0-9.]+)").exec(s || ""); return m ? +m[1] : null; };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export function coachNote(C: any, B: any, o: any, i: number, F: any, O: any): string | null {
  const f = (o.result || o.full || {}).f; if (!f || !f.rounds || !f.rounds.length) return null;
  const R = f.rounds as any[], j = 1 - i, n = R.length;
  const mgr: any[] = (o.mgr && o.mgr[i]) || [];
  const s = o.summary, won = s.w === i, lost = s.w === j, name = String(F.name || "Your fighter").trim(), opp = String(O.name || "his opponent").trim();
  const tips: string[] = [];
  const thrown = (x: any) => (x.pt || 0) + (x.rt || 0) + (x.jt || 0), landed = (x: any) => (x.pl || 0) + (x.rl || 0) + (x.jl || 0);
  const myT = sum(R.map((r) => r.st ? thrown(r.st[i]) : 0)), myL = sum(R.map((r) => r.st ? landed(r.st[i]) : 0));
  const hisT = sum(R.map((r) => r.st ? thrown(r.st[j]) : 0)), hisL = sum(R.map((r) => r.st ? landed(r.st[j]) : 0));
  const en = (r: any, k: number) => (r.en ? r.en[k] : 1);
  const tac = mgr.map((m: any) => (typeof m === "string" ? m : m?.pre) || "");
  const dmg = mgr.map((m: any) => (m && typeof m === "object" ? m.post : null)).filter(Boolean);
  const defs = tac.map((t: string) => num(t, "defense")).filter((x: any) => x != null) as number[];
  const aggs = tac.map((t: string) => num(t, "aggressiveness")).filter((x: any) => x != null) as number[];
  const lines: string[] = [];
  lines.push(`Coach's notes on ${name} vs ${opp} (${B.div}${B.region === "rk" ? ", Rookies" : B.region === "bk" ? ", Bare Knuckles" : ""}): he ${won ? "won" : lost ? "lost" : "drew"} by ${s.how}.`);
  lines.push(`Punches: he landed ${myL} of ${myT} (${myT ? Math.round(100 * myL / myT) : 0}%), ${opp} landed ${hisL} of ${hisT} (${hisT ? Math.round(100 * hisL / hisT) : 0}%).`);

  // 1) gas tank
  const lowAt = R.findIndex((r) => en(r, i) < 0.35);
  const fat = sum(dmg.map((d: any) => d.f || 0)), hurt = sum(dmg.map((d: any) => d.d || 0));
  if (lowAt >= 0 && lowAt + 1 <= Math.min(9, n - 1)) tips.push(`He was running on fumes by round ${lowAt + 1} (under 35% endurance). Every ability but chin and KP shrinks as he tires. Add a rest line near the bottom of the plan, e.g. "if endurance_percent < 45 then 4/5/9", or lower AGG early.`);
  if (dmg.length && (!won || lowAt >= 0) && fat > hurt * 1.2 && fat > 15) tips.push(`His own work cost him more endurance (${Math.round(fat)} points of fatigue) than the other man's punches did (${Math.round(hurt)}). Fatigue each round is AGG + POW/2, and CND/2 of it is free, so trim AGG or POW a point, or train conditioning.`);
  // 2) getting hurt
  const myStuns = sum(R.map((r) => r.st ? (r.st[j].stun || 0) + 2 * (r.st[j].kd || 0) : 0));
  const lowDef = defs.length ? Math.min(...defs) : null;
  if ((myStuns > 0 || (lost && !s.decision)) && lowDef != null && lowDef <= 7) tips.push(`He got hurt with DEF as low as ${lowDef}. Damage taken is divided by DEF, so raise it to 8 or more, and add a line like "if mystuns > 0 then 5/5/10" so he covers up once he's been rocked.`);
  else if (myStuns > 0 && lowDef != null) tips.push(`He was stunned or dropped ${myStuns > 1 ? "more than once" : "once"}. A safety line such as "if mystuns > hisstuns then 5/5/10" helps him survive a bad round.`);
  // 3) landing and volume
  if (myT >= 60 && myL / myT < 0.3 && hisT && hisL / hisT > myL / myT + 0.1) tips.push(`Only ${Math.round(100 * myL / myT)}% of his punches landed. ${opp} was harder to hit (more agility or defense). Jabs land more easily than power shots, so a little less POW and more AGG helps, and "(feint)" helps if he's the faster man.`);
  const closeLost = R.filter((r) => r.cards && r.cards.length && r.cards.filter((c: number[]) => c[i] < c[j]).length >= 2 && !(r.st[j].stun || r.st[j].kd) && thrown(r.st[i]) < thrown(r.st[j])).length;
  if (closeLost >= 3) tips.push(`He lost ${closeLost} rounds while throwing less than ${opp}. Judges reward punches landed (power 2, regular 1.5, jab 1), so a point or two more AGG in close rounds steals them, e.g. "if score <= 0 and round >= 4 then 7/6/7".`);
  // 4) finishing a spent opponent
  const spent = R.filter((r) => en(r, j) < 0.3).length;
  if (spent >= 2 && s.decision && !lost) tips.push(`${opp} was spent for ${spent} rounds and still heard the final bell. Add a finishing line: "if opp = 0 then 6H/9/5" (or "if hisstuns > 0 then 6H/10/4") to go to the head once he's done.`);
  // 5) a plan that never changes
  if (aggs.length >= 4 && new Set(tac.map((t: string) => (t.match(/aggressiveness = [0-9.]+, power = [0-9.]+, defense = [0-9.]+/) || [""])[0])).size === 1 && n >= 6) tips.push(`He fought every round with the same tactic. Conditions let him adapt: rest when tired, push when behind late ("if score < 0 and round >= 9 then 7H/8/5"), protect a lead ("if score >= 6 and round >= 9 then 3/4/11").`);
  // 6) styles and rules
  if (tac.some((t: string) => /backfires/.test(t))) tips.push(`His counter-punching backfired: counters only work when his speed plus height beats the other man's. Drop "(counter)" against faster or taller men.`);
  if (R.some((r) => (r.post || []).some((p: string) => p.includes(F.name?.split(" ").pop() || "@@") && /refusing to break/.test(p)))) tips.push(`He lost a point for holding. Clinching with DEF over 10 risks that; keep clinch lines at DEF 10 or less.`);
  if (/doctor/.test(s.how || "") && lost) tips.push(`The doctor stopped it on his injuries. Higher DEF in the middle rounds, or more cut resistance next time you build, keeps cuts from piling up.`);
  // 7) the fighter himself: weight and KP math
  try {
    const lim = ((C.DIVS || []).find((d: any) => d[0] === B.div) || [0, 999])[1], mw = C.minWeight ? C.minWeight(F) : 0;
    if (lim < 1000 && mw > lim) tips.push(`He weighs in over the ${B.div} limit (lightest safe weight ${mw} lb vs ${lim}), so drying out cut his gas tank before the first bell. Move him up a division, or train agility or conditioning to bring his weight down.`);
  } catch (_) { /* weight check is optional */ }
  if ((F.kp || 0) > Math.floor((F.str || 0) / 3)) tips.push(`His KP (${F.kp}) is more than his strength supports (${F.str} STR allows ${Math.floor((F.str || 0) / 3)}). Each KP point needs 3 STR; train STR before more KP.`);
  else if ((F.kp || 0) > 0 && (F.str || 0) % 3 === 2) tips.push(`One more point of STR (to ${F.str + 1}) lets him carry another KP point, since every 3 STR supports 1 KP.`);

  if (!tips.length) tips.push(won ? `Clean work. Keep the plan, and scout his next opponent's public reports before fight night.` : `No single big mistake. Test small changes in Simbot (run it 100 times) against the same style before his next fight.`);
  lines.push(...tips.slice(0, 4).map((t, k) => `${k + 1}. ${t}`));
  lines.push(`Read the full report (with your private tactics and damage lines) from Recent Fight Cards. For more help: Help Pages > Fight Plan Strategy, or the "Ask your own AI" button on the fight plan page. (This is an automatic note; replies aren't read. Don't want these notes? Open this conversation and click \"Turn off coach notes\", or reply STOP.)`);
  return lines.join("\n\n").slice(0, 3500);
}
