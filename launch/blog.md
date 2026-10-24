---
title: "Growth agents need a launch gate"
description: "Omni Verify makes every claim in an AI-written post pass a real browser check with Kane CLI before it ships."
date: 2026-10-24
authors: [Dain Jung]
tags: [kane-cli, openai, hackathon, growth]
canonical: TODO
hero: docs/verified-card.png
---

# Growth agents need a launch gate

My AI growth agent was about to ship a post with a broken link. It never clicked it. Kane CLI did.

I'm a solo founder. Building my app, Scribo, was the easy part. Getting users is the hard part, so I'm building a growth agent. The trouble with growth agents is that they write for clicks and never click their own links. A human marketer opens the link before posting. An agent doesn't. So at Kane CLI Hack Day I built Omni Verify: a launch gate where every claim in an AI-written post has to pass a real browser check before it can ship.

Repo, every Kane run and the evidence: https://github.com/DainoJung/omni-verify. Demo video: [VIDEO_URL].

## What Kane caught on my own app

Every App Store button on scribo.cc has a hard-coded tracking tag: ct=site-en-hero, ct=site-en-nav, ct=site-en-get. The site never reads the incoming URL's query string. So when a Threads post links to scribo.cc with ct=threads-oct24, the tag dies at the button, and App Store Connect credits the install to the website instead of the post. The page loads. The click works. The numbers are wrong, and nothing tells you.

Here is the loop Omni Verify ran on it:

1. The agent (gpt-5.4-mini) drafted a Threads post linking to `https://scribo.cc?ct=threads-oct24`, with three claims: two sentences of copy and the tracking tag.
2. Kane opened the link, found both sentences on the page, and read the main App Store button's href before clicking: `...id6794793715?pt=126975132&ct=site-en-hero&mt=8`. Omni Verify marked the tag claim FAIL (KR-63).
3. The agent read what Kane saw and rebuilt the link from it: the same App Store URL, pt and mt kept, ct set to threads-oct24.
4. Kane ran again. Both sentences found, the link carries ct=threads-oct24, and it lands on Scribo's App Store page. PASS (KR-68). Verified for launch.

That loop came out the same in all five full runs I did today.

## Three kinds of claims

**The link.** The link that hands the visitor to the App Store must carry the post's own campaign tag. Kane extracts the href; my code checks the tag. I check the href, not the final URL, because the App Store strips the query string from the address bar after the page loads. Kane's very first run showed me that.

**The words.** Every sentence of the post must be backed by a short phrase copied from the app's page, and Kane checks that the phrase is there. A draft that leaves any sentence without a claim is rejected before Kane runs.

**The features.** Text on a page proves a sentence is there, not that the feature works. For a post about a tool, Kane performs each promised feature. I tested this on TestMu AI's free JSON Prettify tool. For every sentence the agent writes the control, the exact input and the expected result, and Kane does it in real Chrome. To give the gate something to catch, a stretch mode tells the agent to add one capability the page doesn't show. It wrote "convert JSON to YAML". Kane clicked the button and the output was still JSON: FAIL (KR-100). The agent replaced the sentence with Minify, and Kane minified the sample: PASS (KR-102). The true claims, Prettify and Validate, passed on the first try (KR-96, KR-98).

## How the agent and Kane talk

Kane extracts and my code judges. Every objective asks Kane to store what it sees (the href, the landing URL, true or false per phrase, a feature's output), and the evaluator compares those values to the assertions. So the verdict is the same check every time, and it cites the Kane step it came from. A value Kane didn't report is UNVERIFIED, never a pass.

Repairs are constrained. The agent can rebuild the link only from URLs Kane observed, and it can rewrite or drop a sentence Kane didn't find. It can't change the campaign tag or drop the attribution claim. In an early dry run the model copied Kane's href verbatim, still ct=site-en-hero. The validator rejected it, and the agent gets one retry with the reason.

## Using more of Kane

- **Explore** mapped scribo.cc before any drafting: 7 screens, and every App Store button links to `apps.apple.com/app/apple-store/{slug}?ct&mt&pt`. The map showed that each button sets its own tag; only a Kane run could say which.
- **The assurance loop.** I turned the verified campaign into a requirement and let Kane design the tests: a use case, acceptance criteria, scenarios and two tests. Both passed (KR-46). Coverage is 75%. The other 25% is "installs are credited to this campaign", which Kane itself marked as unmeasurable from a browser. That's the right call: install credit lives in App Store Connect, not on a page.
- **Re-verify.** Every check is a named run, so Kane records it as a `_test.md`. The passing one becomes the campaign's regression test, and a Re-verify button replays it in about 10 seconds and re-judges every claim (KR-77, KR-85).

## Publishing, gated by Kane

A Verified card has a Publish to Threads button. It stays locked unless the latest Kane result, the last attempt or the last Re-verify, is a PASS for that exact version of the post. Then it takes a click and a confirm that shows the account, the exact text and the Kane result it rests on. I've tested it in dry-run mode. The first live post hasn't happened yet.

## Where Kane got it wrong, and what I changed

Asked to "verify the text 'Try Pro free for 7 days' is visible", Kane said no (KR-51). The text is on scribo.cc, in the pricing section below the fold. Kane's generated check read the wrong element. If I'd trusted it, the repair agent would have deleted a true sentence. I tried three more phrasings and found one that got every answer right: scroll down once, then store whether each phrase appears as true or false (KR-58). That's what Omni Verify compiles to now.

## Limits

- One app and one channel for links (Scribo, Threads, App Store), and one tool for features.
- A phrase can back only part of a long sentence.
- Kane stops at the App Store. It doesn't install the app.
- A PASS means the funnel keeps the post's promises today. It doesn't mean installs went up.
- The kanehack recorder marks most plain Kane runs ERRORED because of an event-order bug in kane-cli 0.10.0-rc.3 (help ticket H-0007). My own log of every run is in RUNS.md.
- Re-verify hasn't caught a regression yet, because the site hasn't changed.

## Try it

```sh
bun install && bun run dev
```

You need an OpenAI key and kane-cli signed in. Open http://localhost:3000 for the campaign link demo and http://localhost:3000/features.html for feature claims. Recorded runs replay without spending Kane credits.

Built by Dain Jung at Kane CLI Hack Day. Built with OpenAI, tested with Kane CLI by [TestMu AI](https://www.testmuai.com).

Agents can write the promise. Kane checks whether the funnel keeps it.
