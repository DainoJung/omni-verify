# Ship Studio > Story (paste field by field)

## One clear function
Omni Verify makes Kane CLI check every promise in an AI-written post, before the post ships and again after every release. Failed promises are repaired from what Kane saw. Only campaigns that pass can publish.

## The problem
Marketing promises and the real product drift apart silently. AI growth agents make it worse: they write promises at scale, and they learn from the numbers those promises produce. A wrong number teaches the agent the wrong lesson.

## Who it's for
Solo founders who let an AI agent write and post their marketing, and judge what works from tracking tags.

## When it breaks (both on my own app, Scribo)
- **Drift 1, the link lies (at publish time).** Every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero. Every install from my Threads posts would have been credited to the website. No error, just a wrong number, and my agent would have concluded Threads doesn't work and stopped posting there. I haven't checked App Store Connect numbers; this is what the tags say would happen.
- **Drift 2, the product moves on (after every release).** Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app. Old @scribo.voca posts still promise a handwriting vocabulary notebook and keep bringing people in, who then find a different product and may leave.

## The fix
1. The OpenAI agent (gpt-5.4-mini) drafts a post from the app's real page and a Kane Explore map of the site, and turns every promise into a check: the link's campaign tag, every sentence against the page, every promised feature.
2. Kane runs headless with --agent in real Chrome and stores what it sees: the hand-off href before clicking, true or false per phrase, a feature's output. My code judges those values.
3. On FAIL, the agent repairs the promise from what Kane saw (for drift 1: the App Store link with the campaign's own ct), and Kane checks again.
4. Only a campaign that passes can publish. Publish to Threads stays locked unless Kane's latest result passed that exact version, then needs a human confirm.
5. After every release Kane checks again: Re-verify replays Kane's own recording of each passing campaign in about 5 to 10 seconds, and Audit past posts checks old posts against today's product.

## Proof
- A real post went out through the gate: https://www.threads.com/@scribo.voca/post/De4-yPnATF5. The button unlocked only because Re-verify KR-85 passed that exact version.
- Drift 1, caught: Kane read ct=site-en-hero on the button, FAIL (KR-63). The agent rebuilt the link from what Kane saw, PASS (KR-68). The same in all five full loops.
- Recorder PASSED runs: KR-46 (Kane-designed tests from the campaign copy), KR-77 and KR-85 (Re-verify).
- Kane Explore mapped scribo.cc: 7 screens, and every App Store button sets its own ct.
- Assurance loop: Kane designed 2 tests from the campaign, both passed, coverage 75%. The other 25% (installs credited to the campaign) is unmeasurable from a browser, and Kane marked it so.
- Supporting example: on TestMu AI's free JSON tool I seeded a false "convert JSON to YAML" claim to show the repair. Kane got JSON back, FAIL (KR-100). The agent swapped in Minify, PASS (KR-102).
- Every real run is in RUNS.md; sealed evidence packs are committed unedited.

## Known limits
- Checks stop at the App Store page; they don't follow the user into the app.
- A PASS means the promises are true when the post ships. It doesn't mean installs went up.
- A sentence is backed by a phrase Kane finds on the page, which can cover only part of a long sentence.
- Kane gave one false negative on visible text ("Try Pro free for 7 days" is on the page). Asking for true or false per phrase fixed it.
- The event recorder logs kane-cli 0.10.0-rc.3 runs as ERRORED even when Kane passed (help ticket H-0007). Kane's own status is in RUNS.md.

## Close
Before my agent learns from a post, Kane proves the funnel tells the truth.
AI can write the promise. Kane checks if the product keeps it.

## What's next
Run the audit automatically on every release, follow the user into the app on the iOS Simulator to check the paywall matches the post, and ship this as the launch gate inside Omni, my open-source growth agent.

## Links
- Repo: https://github.com/DainoJung/omni-verify
- Live post through the gate: https://www.threads.com/@scribo.voca/post/De4-yPnATF5
- Run command: bun install && bun run dev, then open http://localhost:3000
- Demo video: [VIDEO_URL]
- Scribo: https://scribo.cc
- Omni: https://omnigrowth.app
