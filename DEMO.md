# Table demo (2 minutes)

One problem: marketing promises and the real product drift apart silently, and AI growth agents make it worse. The demo shows the two drifts on my own app and the gate that catches them. Order: drift 1 (the link lies), the live post on the phone, drift 2 (the audit page), feature claims only if time is left.

Most of it replays recorded runs, because a live Kane loop takes longer than the whole demo. The live parts are fast: Re-verify and the audit page's own checks.

## Before judges arrive

1. Server running on main after the audit merge: `bun run dev`. kane-cli signed in (Re-verify and the audit call Kane).
2. **Publish mode is dry run.** `PUBLISH_MODE=live` must not be in `.env` (restart after removing it). The live post is already out; nothing else should post from the table.
3. Phone: Threads open on https://www.threads.com/@scribo.voca/post/De4-yPnATF5, screen on.
4. Browser tabs:
   - Tab A: http://localhost:3000 (1 · Launch gate). Click the recorded run **VERIFIED 2026-10-24T19-41 · 2 runs** once to check it loads.
   - Tab B: http://localhost:3000/audit.html (Audit past posts). Open it once after the merge and note the exact button and post names; update this file if they differ from below.
   - Tab C: http://localhost:3000/features.html (2 · Feature claims), only if time.
   - Tab D: https://github.com/DainoJung/omni-verify (README, RUNS.md).

## Click path

| Time | Where | Do | Live or replay | Say |
|---|---|---|---|---|
| 0:00 | Tab A | Nothing yet. | | "I let an AI agent write my app's marketing and I judge it by tracking tags. Promises and the product drift apart silently, and the agent learns from the numbers." |
| 0:15 | Tab A | Click **VERIFIED 2026-10-24T19-41 · 2 runs**. Scroll to **Kane run 1 FAIL**; point at the hand-off link `ct=site-en-hero`. | Replay | "Drift 1: the link lies. Every App Store button on my site overwrites the campaign tag. Every Threads install would have been credited to the website, and my agent would have decided Threads doesn't work." |
| 0:35 | Tab A | Scroll to **Repair** (link diff) and **Kane run 2 PASS**, then the Verified card. Press **Re-verify**. | Replay, then Re-verify **live, 5 to 10 s** | "The agent rebuilt the link from what Kane saw, and Kane passed it. Kane recorded that run as a test, so after any release it re-checks in seconds." |
| 0:50 | Tab A, then phone | On the Verified card, point at **Published: Posted to Threads as @scribo.voca** and its URL. Hand over the phone. | Live post | "Only a campaign that passes can publish. The button stayed locked until Kane's re-check passed this exact version. This is the post that went out." |
| 1:10 | Tab B | Open **Audit past posts**. Point at an old @scribo.voca post that promises a handwriting vocabulary notebook and its result against today's scribo.cc. Then scroll to the **Agent memory updated: 3 promises retired** card. | As the page runs it | "Drift 2: the product moves on. Scribo 2.0 turned a handwriting vocabulary app into a content learning app. My old posts still promise the old app and still bring people in. The audit checks them against today's product, and the three it retired go into the agent's memory, so it never writes them again." |
| 1:40 | Tab C (if time) | Click **2 · Feature claims (TestMu)**, then the recorded run dated **2026-10-24T20-04**. Point at **Convert JSON to YAML: FAIL**, then **Minify PASS**. | Replay | "For a tool, Kane does the feature. I seeded one false claim here to show the repair: YAML came back as JSON, so the agent swapped in Minify." |
| 1:50 | | Close. | | "Before my agent learns from a post, Kane proves the funnel tells the truth. AI can write the promise. Kane checks if the product keeps it." |

If a judge wants to try their own goal: after the click path, in Tab A, edit the goal and press **Draft and verify**. It takes about 2.5 minutes (two Kane runs). While it runs, Re-verify and Publish answer "A Kane run is in progress".

## Live vs replay

| Part | Mode | Takes | Kane credits |
|---|---|---|---|
| Drift 1 loop (draft, FAIL, repair, PASS) | Replay of `runs/c-2026-10-24T19-41-41Z.json` | instant | none |
| Re-verify | Live (`kane-cli testmd run` replay of the saved test) | 5 to 10 s | not reported by the replay stream |
| Live post | Already published (KR-85 gate) | phone | none |
| Audit past posts | As built on the audit-past-posts branch; check after the merge whether it runs Kane live or shows recorded results | check after merge | check after merge |
| Feature claims (YAML FAIL, Minify PASS) | Replay of `runs/f-2026-10-24T20-04-05Z.json` | instant | none |
| A judge's own goal | Live, full loop | about 2.5 min (136 to 148 s measured) | 18 to 60 measured |

Replays are labeled on the page: "Recorded run …, replayed from runs/. Not live."

## If Kane is slow or fails

- **Re-verify takes more than 30 s** or errors: point at the **Re-verify 1** and **Re-verify 2** cards already under the Verified card (both PASS; Re-verify 2 is KR-85, the one that unlocked the live post). Reload the page if the button stays on "Replaying…".
- **The audit page is slow**: show its recorded results if it has them, or skip to the phone and the close. Drift 2 is also told in the README.
- **A live loop drags**: keep talking over the streamed steps, or switch to a recorded run. A running loop can't be cancelled from the page; it finishes on its own (max 3 attempts).
- **Kane or the network is down**: drift 1 and the feature demo still work from recorded runs, and the live post is on the phone. Each Kane card links to its run in Test Manager; RUNS.md lists every run.
- **The server is down**: `bun run dev` again. Runs are files in `runs/`.
