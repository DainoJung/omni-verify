# LinkedIn post

Marketing promises and the real product drift apart silently. AI growth agents make it worse: they write promises at scale, and they learn from the numbers.

I'm a solo founder. I let an agent write and post marketing for my app, Scribo, and I judge what works from tracking tags. At Kane CLI Hack Day I found two ways that goes wrong, both on my own app.

Drift 1, the link lies. Every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero. Every install from my Threads posts would have been credited to the website. No error, just a wrong number, and my agent would have concluded Threads doesn't work and stopped posting there.

Drift 2, the product moves on. Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app. My older posts still promise a handwriting vocabulary notebook, and they keep bringing people in, who then find a different product.

So I built Omni Verify. The agent drafts a post and turns every promise in it into a check: the link's tag, every sentence against the page, every promised feature. Kane CLI checks each one in a real browser before the post ships, and again after every release. Failed promises are repaired from what Kane saw. Only a campaign that passes can publish.

It's real: this Threads post went out through the gate today, and the Publish button stayed locked until Kane's re-check passed that exact version.
https://www.threads.com/@scribo.voca/post/De4-yPnATF5

A supporting example on @TestMu AI's free JSON tool: I seeded a false "convert JSON to YAML" claim to show the repair. Kane clicked it and the output was still JSON, so it failed. The agent swapped in Minify, and Kane passed it.

What a PASS doesn't mean: it doesn't mean installs went up, and I haven't checked App Store Connect numbers. It means the post's promises are true when it ships.

Before my agent learns from a post, Kane proves the funnel tells the truth.

Repo and every Kane run: https://github.com/DainoJung/omni-verify
Demo: [VIDEO_URL]

AI can write the promise. Kane checks if the product keeps it.

#KaneCLIHackDay #KaneCLI #BuildInPublic

Note for pasting: type @ and select the TestMu AI company page from the dropdown so the tag is real.
