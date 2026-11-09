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
- `bouts(fight_date, div, red_user/red_fid, blue_user/blue_fid, belt, purse, status, result)`. Scheduled league bouts. Readable by anyone; no write policies, so only the commissioner (SQL/service role) schedules or records them. Your Fighters, fighter pages and Fight Cards read the Next Bout from here.
- `profiles.location` is the gym's location shown in Gym Rankings.
- `retire_gym()` RPC deletes the caller's account.
- **Bot gyms:** four computer-run gyms (profiles.is_bot = true, ids 00000000-0000-0000-0000-0000000000b0..b3, no password so nobody can log in as them). Their gym_state is readable by everyone so players can spar with them in Practice Fights. Generator: `bots/gen.py`. Weight formula: (160 + 9.2*(height_in - 68)) * build + 1.5*(STR-12) - 1.0*(AGL-12).
- Known balance issue (owner aware): in the current engine SPD/AGL builds dominate STR/CHN builds; waiting on the real energy point table before changing the engine.

## Rules for maintenance
- The owner approves anything that changes gameplay, rules, the simulator, the schedule, titles, or a manager's fighters or records.
- The scheduled commissioner check is REPORT-ONLY: it reads and reports, and never changes code, the database or settings. Bug fixes are made only after the owner approves them.
- Never copy WeBL's text or graphics. Match its layout and mechanics in original wording.
- League fights are **not** scheduled yet. Do not start weekly fights without the owner's approval.

## Open questions waiting on the WeBL forum
Energy point (AGG/POW/DEF) effect table, the prime penalty when rating and status differ, weight/build rules, the "rating" constant in the punch formula, stuns beyond three, and the full injury location list.
