---
title: "Before my agent learns from a post, Kane proves the funnel tells the truth"
description: "Marketing promises and the real product drift apart silently. Omni Verify makes Kane CLI check every promise in an AI-written post before it ships and after every release."
date: 2026-10-24
authors: [Dain Jung]
tags: [kane-cli, openai, hackathon, growth]
canonical: TODO
hero: docs/verified-card.png
---

# Before my agent learns from a post, Kane proves the funnel tells the truth

Marketing promises and the real product drift apart silently. AI growth agents make it worse. They write promises at scale, and they learn from the numbers those promises produce. If the numbers are wrong, the agent learns the wrong lesson, and it keeps going.

I'm a solo founder. I let an agent write and post marketing for my app, Scribo, and I judge what works from tracking tags. At Kane CLI Hack Day I found two drifts on my own app, and built Omni Verify to catch them.

Repo, every Kane run and the evidence: https://github.com/DainoJung/omni-verify. Demo video: [VIDEO_URL].

## Drift 1: the link lies

Every App Store button on scribo.cc has a hard-coded tracking tag: ct=site-en-hero (and ct=site-en-nav, ct=site-en-get). The site never reads the incoming URL's query string. So when a Threads post links to scribo.cc with ct=threads-oct24, the tag is overwritten at the button. Every install from my Threads posts would have been credited to the website.

Nothing errors. The page loads, the button works, the install happens. Only the number is wrong. And my agent reads that number: it would have concluded Threads doesn't work for Scribo and stopped posting there. (I haven't checked App Store Connect; this is what the tags say would happen.)

Kane caught it by doing what the agent never does: clicking. It read the button's href before clicking, `...id6794793715?pt=126975132&ct=site-en-hero&mt=8`, and Omni Verify marked the claim FAIL (KR-63). The agent read what Kane saw and rebuilt the link from it, same App Store URL with ct=threads-oct24. Kane checked it again: PASS (KR-68). That loop came out the same in all five full runs.

## Drift 2: the product moves on

On October 1 I shipped Scribo 2.0. It turned a handwriting vocabulary app into a content learning app. My older @scribo.voca posts still promise a handwriting vocabulary notebook. They're still up, and they keep bringing people in, who then open the app and find a different product. Some of them may leave. I don't have numbers for that, and I'm not going to guess.

Nobody re-reads old posts after a release. So Omni Verify does it with Kane: the Audit past posts page checks old posts against today's product.

## The fix: check every promise, before shipping and after every release

The agent (gpt-5.4-mini) drafts a post and turns every promise in it into a check:

- **The link:** the link that hands the visitor to the App Store carries the post's own campaign tag. Kane extracts the href; my code checks the tag. (I check the href, not the final URL, because the App Store strips the query string from the address bar after the page loads. Kane's first run showed me that.)
- **The words:** every sentence is backed by a short phrase from the app's page, and Kane checks the phrase is there. A draft that leaves a sentence without a check is rejected before Kane runs.
- **The features:** for a post about a tool, Kane performs each promised feature and checks the result.

Failed promises are repaired from what Kane saw, then checked again. Repairs are constrained: the link can only be rebuilt from URLs Kane observed, and the campaign tag can't change.

Then the checks run again after a release. Kane records each passing run as a test, and Re-verify replays it in about 10 seconds and judges every claim again (KR-77, KR-85). For posts already published, the audit page does the same against the current product.

## Only campaigns that pass can publish

A Verified campaign has a Publish to Threads button. It stays locked unless Kane's latest result passed that exact version of the post, and then it takes a click and a confirm. One real post has gone out this way: https://www.threads.com/@scribo.voca/post/De4-yPnATF5. The button unlocked only because Re-verify KR-85 passed that version.

## A supporting example: features, checked by doing them

On TestMu AI's free JSON Prettify tool, the agent writes a control, an input and an expected result for every sentence, and Kane does each one in real Chrome. To show the repair, I seeded one false claim: "convert JSON to YAML". Kane clicked it and the output was still JSON: FAIL (KR-100). The agent replaced the sentence with Minify, and Kane minified the sample: PASS (KR-102).

## More Kane, and where Kane was wrong

- **Explore** mapped scribo.cc first: every App Store button links to `apps.apple.com/app/apple-store/{slug}?ct&mt&pt`. Each button sets its own tag; only a Kane run could say which.
- **The assurance loop:** I turned the verified campaign into a requirement and Kane designed the tests. Both passed (KR-46), coverage 75%. The other 25%, "installs are credited to this campaign", Kane marked unmeasurable from a browser. That's correct: install credit lives in App Store Connect.
- **A false negative:** asked to "verify 'Try Pro free for 7 days' is visible", Kane said no (KR-51), but the text is on the page, below the fold. Trusting it would have deleted a true sentence. Asking Kane to store true or false per phrase got every answer right (KR-58), so that's what Omni Verify sends.

## Limits

- One app and one channel for links, one tool for features.
- A phrase can back only part of a long sentence.
- Kane stops at the App Store; it doesn't install the app.
- A PASS means the promises are true when the post ships. It doesn't mean installs went up.
- The kanehack recorder marks most plain Kane runs ERRORED because of an event-order bug in kane-cli 0.10.0-rc.3 (help ticket H-0007). My own log of every run is in RUNS.md.

## Try it

```sh
bun install && bun run dev
```

You need an OpenAI key and kane-cli signed in. Recorded runs replay without spending Kane credits.

Built by Dain Jung at Kane CLI Hack Day. Built with OpenAI, tested with Kane CLI by [TestMu AI](https://www.testmuai.com).

Before my agent learns from a post, Kane proves the funnel tells the truth. AI can write the promise. Kane checks if the product keeps it.
