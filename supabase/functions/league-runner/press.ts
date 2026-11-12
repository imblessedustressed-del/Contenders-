// Press releases from the bot gyms (forum 'press'): trash talk after results, challenges when they're booked
// against a manager's fighter, retirements and new signings. Boxing trash talk only: no slurs, no real people.
import { rnd } from "./botgen.ts";

export type Release = { author: string; title: string; body: string };
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

const BEAT_HUMAN_T = ["{W} sends a message to {LG}", "{WG}: that's how it's done", "{W} spoils the night for {LG}", "Another one for {WG}"];
const BEAT_HUMAN_B = [
  "{W} beat {L} by {how}. We told {LG} all week this was coming. Tell your fighter to keep his head up, he'll need it for the next one.",
  "Nice try, {LG}. {W} did exactly what we trained him to do: {how}. We'll be here when you want a rematch.",
  "{L} came in with a plan. {W} came in with a better one. {how}. Next.",
  "Respect to {L} for showing up, but {W} was the better man tonight ({how}). {WG} doesn't lose to new gyms.",
];
const LOST_HUMAN_T = ["{WG} got the better of us", "Congratulations to {WG}", "{L} wants it back"];
const LOST_HUMAN_B = [
  "Credit where it's due: {W} beat {L} by {how}. We'll go back to the gym, fix what went wrong, and we want him again.",
  "{L} had an off night against {W} ({how}). It won't happen twice. {WG}, enjoy it while it lasts.",
  "Good fight from {W}. {L} learned something tonight. Check back in a few weeks and see who's laughing.",
];
const KO_T = ["{W} puts {L} to sleep", "Lights out for {LG}", "{W} by knockout!", "Statement win for {WG}"];
const KO_B = [
  "{W} stopped {L} by {how}. {LG}, send us someone who can take a punch.",
  "Did anybody at {LG} see that coming? We did. {W} by {how}.",
  "{W} said it would end early and it did: {how}. Who's next?",
];
const UPSET_T = ["Upset! {W} shocks {L}", "Nobody gave {W} a chance"];
const UPSET_B = ["They had {W} as the underdog. {L} is rated higher, and it didn't matter: {how}. {WG} is coming up the rankings.",
  "{LG} looked past {W}. Big mistake. {how}."];
const CHALLENGE_T = ["{B} is coming for {H}", "{BG} accepts the fight with {H}", "{H}, we'll see you {day}"];
const CHALLENGE_B = [
  "{B} will fight {H} of {HG} on {day} at {venue}. We've watched his fights. We know what he does. Bring a better plan.",
  "{HG} thinks {H} is a contender. {B} thinks otherwise. {day}, {venue}. Don't be late.",
  "Fight's signed: {B} vs {H}, {day}. {B} has been in camp all week. Hope {H} has too.",
  "{B} doesn't know much about {H} except his record, and that's all he needs. See you {day} at {venue}.",
];
const RETIRE_T = ["{N} hangs up the gloves", "Farewell to {N}"];
const RETIRE_B = ["{N} ({rec}) has retired from {G}. Reason: {why}. Thanks for every round.",
  "After {rec}, {N} is done. {why}. {G} will have a new fighter in the {div} division right away."];
const SIGN_T = ["{G} signs {N}", "New blood at {G}: {N}"];
const SIGN_B = ["{G} has signed {N}, a {type} out of {home}, to fight at {div}weight{bk}. The rest of the division has been warned.",
  "Welcome {N} to {G}. {type}, {div}weight{bk}, out of {home}. First fight coming soon."];

export function resultRelease(o: { botWon: boolean; vsHuman: boolean; ko: boolean; upset: boolean; W: string; WG: string; L: string; LG: string; how: string; authorWin: string; authorLose: string }): Release | null {
  const v = { W: o.W, WG: o.WG, L: o.L, LG: o.LG, how: o.how };
  if (o.vsHuman && o.botWon) return { author: o.authorWin, title: fill(rnd(BEAT_HUMAN_T), v), body: fill(rnd(BEAT_HUMAN_B), v) };
  if (o.vsHuman && !o.botWon) return { author: o.authorLose, title: fill(rnd(LOST_HUMAN_T), v), body: fill(rnd(LOST_HUMAN_B), v) };
  if (o.upset) return { author: o.authorWin, title: fill(rnd(UPSET_T), v), body: fill(rnd(UPSET_B), v) };
  if (o.ko) return { author: o.authorWin, title: fill(rnd(KO_T), v), body: fill(rnd(KO_B), v) };
  return null;
}
export function challengeRelease(author: string, v: { B: string; BG: string; H: string; HG: string; day: string; venue: string }): Release {
  return { author, title: fill(rnd(CHALLENGE_T), v), body: fill(rnd(CHALLENGE_B), v) };
}
export function retireRelease(author: string, v: { N: string; G: string; rec: string; why: string; div: string }): Release {
  return { author, title: fill(rnd(RETIRE_T), v), body: fill(rnd(RETIRE_B), v) };
}
export function signRelease(author: string, v: { N: string; G: string; type: string; home: string; div: string; bk: string }): Release {
  return { author, title: fill(rnd(SIGN_T), v), body: fill(rnd(SIGN_B), v) };
}
