# Show HN draft

Title:

Show HN: Omni Verify checks campaign tracking through a real app funnel

Submission URL:

https://kaneclihack.sh/ship/omni

The Ship Page is currently a draft. Publish it and confirm it loads before submitting to HN.

First comment:

Hi HN, I'm Dain Jung. I built Omni Verify at Kane CLI Hack Day because my own app, Scribo, was losing campaign attribution at the last click.

The prototype takes an app URL, a growth goal, and an audience. gpt-5.4-mini through the Chat Completions API drafts a post and a campaign tag. Kane CLI opens the real page in a browser and records the App Store CTA href and destination. Omni Verify compares that handoff with the tag the campaign promised.

In one recorded two-attempt loop, the campaign used ct=threads-oct24, but Scribo's website button handed visitors to the App Store with ct=site-en-hero. Omni Verify marked the assertion FAIL. The agent changed the CTA to the observed App Store listing with ct=threads-oct24, and the assertion passed on the next attempt.

The Kane browser runs themselves reported passed both times; the campaign assertion is what failed and passed. The event recorder showed ERRORED (UNVERIFIED) on the rc.3 run, so the app keeps those statuses separate. Today's prototype checks tracking parameters only. It does not yet verify price or trial claims.

The rough parts are real: the demo is tied to Scribo, the public repo and Ship Page still need publishing, and we have not checked broader claim types. The code uses bun install && bun run dev to start locally; it expects OpenAI and Kane CLI credentials in the environment.

Source: [REPO_URL] at [FINAL_SUBMITTED_SHA]

I'd value feedback on two things: what is the best way to model attribution across redirects and deep links, and which campaign claims would you want a launch gate to check next?

Timing: Submit only after the Ship Page is public and the repository link and SHA are filled in. The author should stay available to answer comments.
