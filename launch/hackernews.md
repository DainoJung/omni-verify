# Show HN draft

Title:

Show HN: Omni Verify, Kane checks every promise in an AI-written post before it ships

Submission URL:

https://github.com/DainoJung/omni-verify

First comment:

Hi HN, I'm Dain, a solo founder. I let an AI agent write and post marketing for my app, Scribo, and I judge what works from tracking tags. The problem I kept running into: marketing promises and the real product drift apart silently, and an agent makes it worse, because it writes promises at scale and learns from the numbers.

Two drifts, both on my own app:

1. The link lies, at publish time. Every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero. Every install from my Threads posts would have been credited to the website. No error, just a wrong number, and the agent would have concluded Threads doesn't work. (I haven't checked App Store Connect; that's what the tags say would happen.)
2. The product moves on, after a release. Scribo 2.0 turned a handwriting vocabulary app into a content learning app. Older posts still promise a handwriting notebook and keep bringing people in.

Omni Verify turns every promise in a post into a check, and Kane CLI (a browser testing agent) checks it in real Chrome: the link's tag (Kane reads the button's href), every sentence against the page, and every promised feature (Kane performs it). Kane only extracts; my code judges, so the verdict is the same check every run. A failed promise is repaired by the agent (gpt-5.4-mini) from what Kane saw, then checked again. The same checks run again after a release: Re-verify replays Kane's recording of a campaign's passing run, and an audit page checks old posts against today's product.

Only a campaign that passes can publish. One real post has gone through the gate; the button unlocked only after Kane's re-check passed that exact version: https://www.threads.com/@scribo.voca/post/De4-yPnATF5

A supporting example, on TestMu AI's free JSON tool: I seeded a false "convert JSON to YAML" claim to show the repair. Kane clicked it and got JSON back (FAIL); the agent swapped in Minify (PASS).

Rough edges: one app and one channel for links, one tool for features. Kane's "verify the text is visible" gave me a false negative on below-the-fold text, so I ask it to store true or false instead. A PASS means the promises are true at ship time, not that installs went up. Every run, failures included, is in RUNS.md.

Run it: `bun install && bun run dev` (needs an OpenAI key and kane-cli). Demo: [VIDEO_URL]

I'd like feedback on how you'd catch drift 2 automatically: what should trigger a re-audit of old posts besides a release?

Timing: submit once the video is up, and stay around to answer comments.
