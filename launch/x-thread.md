# X launch thread

Replace [VIDEO_URL] before posting. Counts treat every URL (and scribo.cc, which X may auto-link) as 23 characters; every post is under 280.

1. My AI growth agent was about to ship a post with a broken link. It never clicked it. @kane_cli did.

At #KaneCLIHackDay I built Omni Verify: a gate that makes every promise in an AI-written post pass a real browser check, before it ships and after every release.

2. The problem: marketing promises and the real product drift apart silently. Growth agents make it worse. They write promises at scale, and they learn from the numbers.

3. Drift 1, the link lies. Every App Store button on my site (scribo.cc) overwrites the campaign tag with ct=site-en-hero. Every Threads install would have been credited to the website, and my agent would have decided Threads doesn't work.

4. Drift 2, the product moves on. Scribo 2.0 turned a handwriting vocabulary app into a content learning app. My old posts still promise a handwriting notebook and still bring people in, who then find a different product.

5. The fix: Kane checks every promise before a post ships (the link's tag, every sentence, every feature) and again after every release. Failed promises are repaired from what Kane saw. Only a campaign that passes can publish.

6. A real post went out through that gate today. The Publish button stayed locked until Kane's re-check (KR-85) passed that exact version: https://www.threads.com/@scribo.voca/post/De4-yPnATF5

7. Supporting example: on TestMu AI's free JSON tool I seeded a false "convert to YAML" claim to show the repair. Kane clicked it and got JSON back: FAIL. The agent swapped in Minify: PASS.

8. Before my agent learns from a post, Kane proves the funnel tells the truth.

AI can write the promise. Kane checks if the product keeps it.

Code and every Kane run: https://github.com/DainoJung/omni-verify
Demo: [VIDEO_URL]
#KaneCLIHackDay

## Attachments

- Post 3: docs/live-run.png, cropped to Kane run 1 FAIL (the href with ct=site-en-hero)
- Post 6: a screenshot of the live post on the phone
- Post 7: docs/feature-claims.jpg
