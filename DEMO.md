# Table demo (2 minutes)

Two demos, one server: http://localhost:3000 (1 · Campaign links, Scribo) and http://localhost:3000/features.html (2 · Feature claims, TestMu). The header nav on both pages switches between them.

Most of the 2 minutes replays recorded runs, because a live Kane loop takes longer than the whole demo. The two live parts are fast: Re-verify and the publish confirm.

## Before judges arrive

1. Server running: `bun run dev` in the repo. kane-cli signed in (Re-verify calls Kane).
2. **Publish mode back to dry run after the 14:30 rehearsal.** Remove `PUBLISH_MODE=live` from `.env` and restart the server. With live mode on, any Verified campaign whose last Kane result passed can be published from the table. The confirm panel says "This posts publicly" in live mode and "Dry run: nothing will be posted" in dry run: check which one it says before the first judge.
3. Open three tabs:
   - Tab A: http://localhost:3000
   - Tab B: http://localhost:3000/features.html
   - Tab C: https://github.com/DainoJung/omni-verify (README, RUNS.md)
4. In Tab A, click the recorded run **VERIFIED 2026-10-24T19-41 · 2 runs** once to make sure it loads.

## Click path

| Time | Tab | Do | Live or replay | Say |
|---|---|---|---|---|
| 0:00 | A | Nothing yet. | | "My growth agent writes posts. It never clicks its own links. Kane does." |
| 0:10 | A | Click **VERIFIED 2026-10-24T19-41 · 2 runs** in Recorded runs. Scroll to **Kane run 1 FAIL**. Point at the hand-off link `ct=site-en-hero`. | Replay | "Kane read the App Store button on my site. It carries the website's tag, so my Threads post's `ct=threads-oct24` dies at the click." |
| 0:30 | A | Scroll to **Repair** (link diff), then **Kane run 2 PASS**, then **Verified for launch**. | Replay | "The agent rebuilt the link from the URL Kane saw. Kane ran it again: pass. Every sentence of the post is checked too." |
| 0:45 | A | On the Verified card, press **Re-verify**. | **Live, 5 to 10 s** | "Kane recorded the passing run as a test. This replays it right now and judges every claim again." |
| 0:55 | A | Under **Publish**, point at the reason ("Re-verify N … passed this exact version"). Press **Publish to Threads**. The confirm panel shows @scribo.voca, the exact text and the Kane result. | **Live, 1 to 3 s** (account check) | "Publishing stays locked unless Kane's latest result passed this exact version. Then it still needs my confirm." |
| 1:05 | A | Dry run: press **Confirm dry run** (nothing is posted). If the rehearsal post went live on this campaign, the card shows **Published** with the post URL instead: click the URL. | Live | "In dry run nothing goes out." / "This is the post that went out after Kane passed it." |
| 1:15 | B | Click nav **2 · Feature claims (TestMu)**. Click the recorded run **VERIFIED … 2026-10-24T20-04**. Point at **Convert JSON to YAML: FAIL** and Kane's output. | Replay | "For a tool, Kane does the feature. I told the agent to slip in one the page doesn't have. Kane clicked YAML and got JSON back." |
| 1:35 | B | Scroll to **Repair** (YAML sentence replaced with Minify) and the **Minify PASS**, then **Verified**. | Replay | "The agent swapped in a real feature, and Kane performed it." |
| 1:50 | B or C | Close. Optionally show RUNS.md in Tab C. | | "Agents can write the promise. Kane checks whether the funnel keeps it." |

If a judge wants to type their own goal: do it **after** Re-verify and Publish. In Tab A, edit the goal and press **Draft and verify**. It takes about 2.5 minutes (two Kane runs) and streams live. While it runs, Re-verify and Publish on the campaign page answer "A Kane run is in progress".

## Live vs replay

| Part | Mode | Takes | Kane credits |
|---|---|---|---|
| Campaign loop (draft, FAIL, repair, PASS) | Replay of `runs/c-2026-10-24T19-41-41Z.json` | instant | none |
| Re-verify | Live (`kane-cli testmd run` replay of the saved test) | 5 to 10 s | not reported by the replay stream |
| Publish to Threads confirm | Live (read-only account check; posts only in live mode) | 1 to 3 s | none |
| Feature claims (YAML FAIL, Minify PASS) | Replay of `runs/f-2026-10-24T20-04-05Z.json` | instant | none |
| A judge's own campaign goal | Live, full loop | about 2.5 min (136 to 148 s measured) | 18 to 60 measured |
| A new feature-claims run | Live, one Kane run per claim plus the repair | about 5 min (3 claims) | about 136 measured (4 Kane runs) |

Replays are labeled on the page: "Recorded run …, replayed from runs/. Not live."

## If Kane is slow or fails

- **Re-verify takes more than 30 s**, or shows an error: say "this replays live, here's the one from earlier", and point at the **Re-verify 1** and **Re-verify 2** cards already shown under the Verified card (both PASS, recorder KR-77 and KR-85). Reload the page if the button stays on "Replaying…".
- **Publish button locked**: the reason line says why. "Re-verify before publishing" means press Re-verify. "A Kane run is in progress" means a live loop is running.
- **A live loop drags**: keep talking over the streamed steps, or switch to the recorded run (left panel). A running loop can't be cancelled from the page; it finishes on its own (max 3 attempts).
- **Kane or the network is down**: everything except Re-verify and the publish account check still works from recorded runs. Each Kane card links to its run in Test Manager, and RUNS.md lists every run with time, result and credits.
- **The server is down**: `bun run dev` again; nothing is lost, runs are files in `runs/`.
