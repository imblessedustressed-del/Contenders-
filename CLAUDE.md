# Contenders — maintainer notes

Contenders is a text-based boxing strategy game modeled on the old Web Boxing League (WeBL, webl.vivi.com). The owner is the GitHub user imblessedustressed-del. Claude acts as league commissioner and maintainer.

## Where things live
- **Live site:** https://imblessedustressed-del.github.io/Contenders-/ (GitHub Pages, served from the `main` branch root).
- **Source:** `src/shell.html` (all pages, styles and UI code; contains the placeholder `%%SIM%%`), `src/plan.js` (WeBL fight plan language parser), `src/sim4.js` (round-based fight engine).
- **Build:** `sh build.sh` writes `index.html` = shell with plan.js + sim4.js inlined. Always edit `src/`, rebuild, then commit both `src/` and `index.html`.
- **Backend:** Supabase project `ojsphhzgzbxmnfcbitqb` (organization "Contenders", free plan). Email/password auth with email confirmation turned off. Site URL is set to the live site.

## Database (public schema, RLS on every table)
- `profiles(id → auth.users, gym unique, description)`. Created automatically at sign-up by the `handle_new_user` trigger from the `gym` user metadata.
- `gym_state(user_id, data jsonb)`. Each manager's saved fighters, records and plans. Private to the owner.
- `topics(forum, title, author → profiles, last_at, post_count)` and `posts(topic_id, author, body)`. Readable by anyone; members insert their own. A post trigger bumps `last_at` and `post_count`. Authors are set to null when a gym retires.
- `messages(sender, recipient, body, read)`. Only the sender and recipient can see a message. The `mark_messages_read()` RPC marks your inbox read.
- `gym_public(user_id, data jsonb)`. Each gym's public card (fighter names, records, rating/status, titles, recent fight results; never stats or plan text). Readable by anyone, written by the owner when his gym saves. Powers Gym Rankings and public gym pages.
- `bouts(fight_date, div, red_user/red_fid, blue_user/blue_fid, belt, purse, rounds, status, summary, result)`. Every Contenders bout is 12 rounds (owner rule, Nov 2026); bouts 1-2 were 10-round tests. Commissioner runs a bout by simulating it with the real engine, writing `result` (report data, fighter stats stripped), `summary` and status 'done', and updating the bot side directly; a manager's own client applies the result to his fighters once (`state.applied`). Scheduled league bouts. Readable by anyone; no write policies, so only the commissioner (SQL/service role) schedules or records them. Your Fighters, fighter pages and Fight Cards read the Next Bout from here.
- `profiles.location` is the gym's location shown in Gym Rankings.
- `retire_gym()` RPC deletes the caller's account.
- **Bot gyms:** four computer-run gyms (profiles.is_bot = true, ids 00000000-0000-0000-0000-0000000000b0..b3, no password so nobody can log in as them). Their gym_state is readable by everyone so players can spar with them in Practice Fights. Generator: `bots/gen.py`. Weight formula: (160 + 9.2*(height_in - 68)) * build + 1.5*(STR-12) - 1.0*(AGL-12).
- **Engine source of truth:** WeBL's published rules page https://webl.vivi.com/eko/gory-details.html (owner-approved Nov 9, 2026). Energy points enter the damage formula raw (there is no separate table). Remaining ambiguity: landing constant k = 12 + (average of the two ratings)/3 is our reading of "1/3 of the two fighters' rating". Training and rating follow WeBL (glossary/FAQ): rating +1 per win (+2 on a winning streak), -1 per loss with exceptions (beaten by higher rating; split/majority decision unless title fight vs equal/lower rating); status = highest rating ever; 1 trained AP per status point gained, plus a random STR/SPD/AGL/CND point at status 6 and every even status after. League runner must pass pre-fight ratings in `summary.ratings` = [red, blue].
- **Purses (owner-approved Nov 9, 2026):** pot = $2,000 x 1.35^(higher rating), x4 for title fights; even ratings split 50/50, otherwise 60/40 to the higher-rated fighter; a defending champion takes 65%. Debut 0-vs-0 pays $1,000 each. Star power multiplies the pot: (1 + 0.1 x career title-fight wins, max 20) x (holds 2 belts in a division 1.5, all 3 2.5); the bigger star in the bout sets it (`starPower()`/`boutStar()`; runner passes it as `window.STAR`). `boutPurses()` in shell.html; the runner stores `summary.purse` = [red, blue]; clients add it to `F.earn`.
- **Venues (owner-approved Nov 9, 2026):** `bouts.venue` {name, city, cap, tier} is picked when a bout is scheduled with `pickVenue(venueTier(...))`: star power 2x+ = stadium, title fight or a top-10 contender (rating 3+) = big arena, else club. The runner stores attendance in `summary.att` via `attendanceFor()`.
- League bouts are run with `prepFighter()` + `simulate()` from the built index.html; the result's `ip` (injury points per corner) goes into `bouts.summary.ip`.

## Rules for maintenance
- **Transparency rule (owner, Nov 9, 2026):** every owner-approved change to the simulator, rules or any major gameplay change is posted to Contenders News (forum `announce`, topic and post with author NULL, shown as "The Commissioner") the moment it goes live. Say it was approved by the owner, and that the owner has no access to anyone's plans, gyms or fighters.
- Bot gyms only use public information (records, fight reports) to plan against a manager's fighter, never his plan text.
- The owner approves anything that changes gameplay, rules, the simulator, the schedule, titles, or a manager's fighters or records.
- The scheduled commissioner check is REPORT-ONLY: it reads and reports, and never changes code, the database or settings. Bug fixes are made only after the owner approves them.
- Never copy WeBL's text or graphics. Match its layout and mechanics in original wording.
- League fights are **not** scheduled yet. Do not start weekly fights without the owner's approval.

## Open questions waiting on the WeBL forum
Answered by the rules page except: the prime penalty when rating and status differ, build weight rules, the exact meaning of the rating constant, and stun thresholds beyond three.
