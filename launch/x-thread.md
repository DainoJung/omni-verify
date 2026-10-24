# X launch thread

Replace [VIDEO_URL] before posting. Character counts count each URL as 23 and keep every post under 280.

1. My AI growth agent was about to ship a post with a broken link. It never clicked it. @kane_cli did.

So I built Omni Verify at #KaneCLIHackDay: a launch gate where every claim in an AI-written post has to pass a real browser check before it ships.

2. The link loaded fine. The tracking didn't survive. Every App Store button on my app's site (scribo.cc) hard-codes ct=site-en-hero, so my Threads post's ct=threads-oct24 dies at the click and the install is credited to the website.

3. Kane read the button's href before clicking: ct=site-en-hero. FAIL. My agent (gpt-5.4-mini) read what Kane saw and rebuilt the link: same App Store URL, ct=threads-oct24. Kane ran it again: PASS. Verified for launch.

4. Links aren't the only claim. Every sentence of the post has to be backed by text Kane finds on the page. And when the post is about a tool, Kane performs each promised feature in real Chrome.

5. On TestMu AI's free JSON Prettify tool, I had the agent slip in one feature the page doesn't show: "converts JSON to YAML". Kane clicked it. The output was still JSON. FAIL. The agent swapped in Minify. Kane ran it: PASS.

6. Kane records every passing run as a test, so Re-verify replays it in about 10 seconds. Publish to Threads stays locked unless Kane's latest result passed that exact version, then needs my confirm. Dry-run tested; the live post is next.

7. Agents can write the promise. @kane_cli checks whether the funnel keeps it.

Code, Kane runs and evidence: https://github.com/DainoJung/omni-verify
Demo: [VIDEO_URL]

#KaneCLIHackDay

## Attachments

- Post 1: docs/verified-card.png
- Post 3: docs/live-run.png, cropped to Kane run 1 FAIL and the repair diff
- Post 5: docs/feature-claims.jpg
