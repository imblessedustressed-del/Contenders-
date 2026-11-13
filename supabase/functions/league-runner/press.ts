// Press releases (forum 'press'), WeBL style: one fighter talking, one or two lines. The topic title is the speaking
// fighter's name (the site links it to his page), the post is what he says, the author is his gym.
// Trash talk only (owner, Nov 12, 2026): results and fight call-outs. Boxing trash talk; no slurs, no real people.
import { rnd } from "./botgen.ts";

export type Release = { author: string; title: string; body: string };
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

const BEAT_HUMAN = [
  "Told you, {L}. Go back to the gym.",
  "{L} was tougher than I thought. Still wasn't enough.",
  "Next time bring a plan, {LG}.",
  "{how}. Who's next?",
  "Tell {LG} I said thanks for the work.",
  "I don't lose to new gyms. Write that down.",
];
const LOST_HUMAN = [
  "Good fight, {W}. I want the rematch.",
  "{W} got lucky. Run it back.",
  "I needed one more round.",
  "Back to the gym. {W}, enjoy it while it lasts.",
  "Respect to {W}. Won't happen twice.",
];
const KO = [
  "{L} didn't see that coming.",
  "Lights out. Who else wants some?",
  "I said it wouldn't go the distance. {how}.",
  "{LG}, send me somebody who can take a punch.",
];
const UPSET = [
  "Underdog? Not anymore.",
  "Everybody picked {L}. Everybody was wrong.",
  "Rankings don't fight. I do.",
];
const CHALLENGE = [
  "{H}, I've watched your fights. See you {day}.",
  "{day} is going to be a long night for {H}.",
  "{HG} can keep {H} home if they're scared.",
  "Hope {H} has been in camp. I have.",
  "{H} vs me, {day} at {venue}. Bring a better plan.",
];

export function resultRelease(o: { botWon: boolean; vsHuman: boolean; ko: boolean; upset: boolean; W: string; WG: string; L: string; LG: string; how: string; authorWin: string; authorLose: string }): Release | null {
  const v = { W: o.W, WG: o.WG, L: o.L, LG: o.LG, how: o.how.charAt(0).toUpperCase() + o.how.slice(1) };
  if (o.vsHuman && o.botWon) return { author: o.authorWin, title: o.W, body: fill(rnd(BEAT_HUMAN), v) };
  if (o.vsHuman && !o.botWon) return { author: o.authorLose, title: o.L, body: fill(rnd(LOST_HUMAN), v) };
  if (o.upset) return { author: o.authorWin, title: o.W, body: fill(rnd(UPSET), v) };
  if (o.ko) return { author: o.authorWin, title: o.W, body: fill(rnd(KO), v) };
  return null;
}
export function challengeRelease(author: string, v: { B: string; BG: string; H: string; HG: string; day: string; venue: string }): Release {
  return { author, title: v.B, body: fill(rnd(CHALLENGE), v) };
}
