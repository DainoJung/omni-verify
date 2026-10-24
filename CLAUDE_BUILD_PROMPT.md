# Claude Code build prompt: Omni Verify (Kane CLI Hack Day)

Open Claude Code in `~/Desktop/hackathon/kane-hackday` and paste everything below the line.

---

We are building **Omni Verify** today at Kane CLI Hack Day. All code must be written today in this folder, and the repo will be public. Submissions lock at 18:00, and judges try it at my table from 16:00.

## What it is
Omni Verify is a launch gate for AI growth campaigns. You give it an app's URL and a growth goal. An OpenAI agent drafts a campaign and turns every claim in it into a testable assertion. Kane CLI then walks the real funnel in a browser. If a claim fails, the agent reads Kane's result, rewrites the copy or fixes the link, and Kane runs again. Only campaigns that pass are marked **Verified for launch**, with the Kane evidence attached.

## Hard rules
- OpenAI is required: the agent uses the OpenAI API through `OPENAI_API_KEY` from `.env`. Never print, log or commit the key. `.env` must be in `.gitignore`.
- Every Kane run goes through the event recorder:
  `kanehack report -- kane-cli run "<objective>" --url <url> --agent --headless`
  (`kanehack consent yes` has already been run.) Never call kane-cli directly from product code.
- Commit often, with honest messages. When a Kane run changes what you do, say so in the commit message (e.g. `Kane FAIL: CTA dropped ct param -> agent rewrote link`). Judges score "the agent and Kane talked" from the commit history and run history.
- Scope honesty: build only what works end to end. No fake data, no mocked Kane results in the main flow.

## Step 0: learn Kane's real output first (before writing the parser)
Run this once and save the raw output to `fixtures/kane-sample.ndjson`:
`kanehack report -- kane-cli run "Open the page, click the main call to action, and report the destination URL and any price or free-trial text visible" --url https://scribo.cc --agent --headless`
Read the actual NDJSON event types and the final status, exit code and evidence path. Write the parser against what you actually see, not against assumptions. Tell me what the schema looks like before moving on.

## Stack (keep it small, runs locally, judges use it at my table)
- Bun + Hono server, one static HTML/JS page (no framework needed). Run command: `bun install && bun run dev`, then open http://localhost:3000.
- Kane runs as a child process spawned by the server. Stream each step to the page with Server-Sent Events.
- Storage: a JSON file per campaign run in `runs/`. No database.
- Model name comes from `OPENAI_MODEL` in `.env`. Check which models this key can use with the models list endpoint, and pick a fast one.

## The loop (main flow)
1. **Input:** app URL, growth goal (e.g. "Get new learners to install Scribo from a Threads post"), audience.
2. **Draft (OpenAI):** returns structured JSON: `post_copy`, `cta_url` (with a campaign tracking parameter such as `ct=` or `utm_campaign=`), and `claims[]`. Each claim has `{ text, assertion: { type: "destination_matches" | "param_preserved" | "text_visible", value } }`.
3. **Compile:** turn the assertions into one plain-English Kane objective, e.g. "Open the link, click the main call to action, verify the destination is the App Store page for Scribo, verify the URL still contains ct=..., verify the text '7-day free trial' is visible". Show the objective on screen.
4. **Verify (Kane):** run it through `kanehack report`. Parse the NDJSON into PASS/FAIL per assertion, plus the failing step and Kane's own explanation. Keep the evidence path.
5. **Repair (OpenAI):** on FAIL, send the agent the campaign, the failing assertions and Kane's explanation. It returns a revised campaign plus a one-line reason. Allowed repairs: remove or rewrite an unverifiable claim, or fix the CTA link or the tracking parameter. Then go back to step 4. At most 3 attempts.
6. **Result:** PASS gives a "Verified for launch" card showing the final copy, a diff from the first draft, every assertion with its status, and the evidence link. Three FAILs give "Needs a human" with the failing step and the evidence.
7. **Regression test:** for each verified campaign, write a Kane test file to `tests/<campaign-id>_test.md` (check the kane-cli skill or docs for the exact _test.md format) and add a "Re-verify" button that replays it.

## UI (one page, clean)
- Left: the input form. Right: a live timeline of Draft → Kane run 1 (FAIL, red, with the reason) → Repair (diff) → Kane run 2 (PASS, green) → Verified card.
- Style: black background, white text, monospace for assertions and URLs. One accent color for PASS (green) and one for FAIL (red). No gradients, no emojis.

## Real case to demo (verified from the live site's HTML, re-check with Kane)
Scribo (https://scribo.cc). The site's App Store buttons have hard-coded tracking tags (`ct=site-en-hero`, `ct=site-en-nav`, `ct=site-en-get`), and the site JS never reads the incoming URL's query string. So a Threads post that links to `https://scribo.cc/?ct=threads-oct24` loses its tag at the CTA, and App Store Connect credits the install to "site-en-hero" instead of the Threads post. That's attribution silently breaking.
- Main demo: the agent drafts a post that links to scribo.cc with its own campaign tag. The `param_preserved` assertion FAILs because Kane clicks the CTA and the App Store URL has `ct=site-en-hero`. The agent repairs it by linking the post straight to the App Store URL with its own `ct=` (keeping `pt=126975132`, `mt=8`, app id 6794793715), and Kane PASSes.
- Second assertion type: the page DOES show "Try Pro free for 7 days" in the pricing section (below the fold), but prices are "shown in the App Store for your country". So a draft claiming a specific dollar price must FAIL `text_visible` and be rewritten. A draft claiming the 7-day free trial should PASS. Do not claim the trial is missing.
## Use the features the Kane team launched today (judges built them)
- `kane-cli explore` (new in the RC, launched today): point it at the app URL first to map the real funnel (pages, CTAs, flows). The agent drafts the campaign from what Explore found, so claims and links come from the real site. Check `kane-cli explore --help` and the kane-cli skill for exact usage.
- Assurance loop with the campaign as the spec: write the campaign (post copy, link, claims) to a markdown file, then `kane-cli context ingest` it → `context extract` → `design tests` so Kane itself designs the acceptance criteria and tests from the marketing copy. Then `testmd run`, then `cover` for coverage. The evidence pack goes in `evidence/` in the repo. The team said they prefer that Kane designs the tests rather than us writing them by hand.
- If the assurance commands are too slow or flaky for the live demo, keep the direct `kane-cli run --agent` path as the live loop and run the assurance loop once, recording its evidence pack and coverage for the README and video.

## Order of work (stop and show me after each)
1. Step 0 (Kane schema) + repo setup (`git init`, `.gitignore` with `.env`, README skeleton) → commit
2. Kane runner + NDJSON parser + one end-to-end Kane run from the server → commit
3. OpenAI draft + compile objective → commit
4. Repair loop (FAIL → repair → PASS on Scribo) → commit
5. UI timeline with SSE → commit
6. `_test.md` export + Re-verify button → commit
7. README: what it is, who it's for, run command, the Scribo finding, screenshots, where the evidence packs are → commit

Feature freeze at 15:30. After that, fix bugs only.
