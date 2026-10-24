# Show HN draft

Title:

Show HN: Omni Verify, a launch gate that makes AI-written posts pass a real browser test

Submission URL:

https://github.com/DainoJung/omni-verify

First comment:

Hi HN, I'm Dain. I'm a solo founder building a growth agent for my own app, Scribo. Growth agents write for clicks and never click their own links, so I built Omni Verify at Kane CLI Hack Day: every claim in an AI-written post becomes an assertion, and Kane CLI (a browser testing agent) checks it in real Chrome before the post can ship.

What it caught on my own site: every App Store button on scribo.cc hard-codes ct=site-en-hero. A Threads post that links to the site with ct=threads-oct24 loses its tag at the button, and App Store Connect credits the install to the website. Kane read the href before clicking, Omni Verify marked the claim FAIL, the agent (gpt-5.4-mini) rebuilt the link from the URL Kane observed, and Kane passed it.

Three claim types today:

- Link: the hand-off to the App Store carries the post's own campaign tag.
- Text: every sentence is backed by a phrase Kane finds on the page.
- Feature: Kane performs each promised feature on the real tool. On TestMu AI's free JSON Prettify tool I made the agent add one feature the page doesn't show ("convert JSON to YAML"). Kane clicked it, got JSON back, FAIL; the agent swapped in Minify, PASS.

Kane only extracts (the href, true or false per phrase, the feature's output) and my code judges, so the verdict is the same check every run. Kane records each passing run as a test, and a Re-verify button replays it in about 10 seconds. Publishing to Threads is locked unless Kane's latest result passed that exact version of the post, plus a human confirm. That path is tested in dry-run; I haven't done a live post yet.

Rough edges, honestly: one app and one channel for links, one tool for features. Kane's "verify the text is visible" gave me a false negative on below-the-fold text, so I ask it to store true or false instead. A PASS says the funnel keeps the post's promises today; install credit itself isn't observable from a browser. Every run, including the failures, is in RUNS.md.

Run it: `bun install && bun run dev` (needs an OpenAI key and kane-cli). Demo video: [VIDEO_URL]

I'd like feedback on two things: which claims you'd want a gate like this to check next, and how you'd test attribution past a redirect you can't observe.

Timing: submit once the video is up, and stay around to answer comments.
