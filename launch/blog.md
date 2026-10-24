---
title: "Omni Verify checks campaign links through the real funnel"
description: "Omni Verify uses OpenAI to draft campaign links and Kane CLI to check tracking through a real app funnel."
date: 2026-10-24
authors: [Dain Jung]
tags: [kane-cli, openai, hackathon, marketing]
canonical: TODO
hero: Use a reviewed screenshot of the Omni Verify campaign result; none is attached to this draft.
---

# Omni Verify checks campaign links through the real funnel

AI can write the promise. Kane checks if the funnel keeps it. Omni Verify is a launch gate for campaign links, built with [OpenAI](https://openai.com) and tested with [Kane CLI](https://github.com/LambdaTest/kane-cli). In a captured Scribo run, the campaign assertion failed when its App Store button handed off the site's tag, then passed after the agent changed the link. The Ship Page is still a draft: https://kaneclihack.sh/ship/omni.

## What we built

AI growth agents can write a decent post in a few seconds. They can also produce a post with a link they have never followed. That leaves the person publishing it to find out later whether the campaign tag survived, whether the call to action landed in the right place, and whether the destination matched what the copy promised.

This happened on my own app, Scribo. I prepared a Threads campaign link with ct=threads-oct24. Scribo's home page has an App Store button whose URL includes ct=site-en-hero. Clicking the button sent a visitor to Scribo's App Store listing, but credited the site hero rather than the Threads post. The page loaded. The attribution was wrong.

Omni Verify checks a campaign by following the link in a real browser. It takes an app URL, a growth goal, and an audience. An OpenAI model drafts one campaign and a campaign-specific link. Kane CLI opens the app, clicks its main call to action, and records where the browser goes. Omni Verify compares the observed handoff with the tracking promise in the campaign. If the promise is broken, the agent can repair the URL and ask Kane to check it again.

The first user is a solo founder using AI to write and publish campaigns for their own app. The gap is small but expensive: a link can look correct in the post and still route attribution to a different campaign after one more click. This first build focuses on the App Store handoff in Scribo. It is not yet a general marketing analytics platform, and it does not yet verify price, trial length, or feature claims.

To run the current project locally, the README says to use:

~~~sh
bun install && bun run dev
~~~

There is no public Omni Verify demo URL in this draft. The public Ship Page is also not published yet. The source URL and submitted commit need to be added before this post is ready to publish.

## Use cases

### A solo founder launching from Threads

A founder asks an agent to draft a Threads post for Scribo. The agent includes the campaign's own ct value in its link. Omni Verify opens the post link, follows Scribo's App Store button, and checks the value on the handoff. This is the flow we exercised.

### A founder sharing a campaign from a landing page

A founder could use the same pattern for a campaign page whose primary CTA leads to an app store or signup page. The product would compare the tag at the start with the tag the visitor reaches after the CTA. We have not tried this on a second app or a second campaign path yet.

### A team checking claims in the copy

The broader product idea is to turn every statement in a generated post into an assertion, then verify each one along the path. For example, a price or free-trial claim might need to appear on the destination page. Today's implementation checks the tracking parameter claim only. Price, trial, and feature checks remain future work.

## How we built it

The project has three pieces: the campaign draft, the browser run, and the campaign verdict. The app sends visible page text and a short goal and audience description to the model. The model drafts a post, a CTA URL, a campaign tag, and a claim that installs from that post should preserve the tag. The app then compiles that claim into the tracking check it knows how to evaluate.

The recorded campaign used gpt-5.4-mini through the Chat Completions API. The model wrote the initial post and selected the Scribo home page with the campaign tag. After Kane's observation showed that the page button handed visitors to the App Store with ct=site-en-hero, the app sent the failed assertion and the browser observations back to the model. The model chose a small repair: use the observed App Store listing directly and replace the ct value with the post's own tag. It kept the campaign tag unchanged.

That constraint matters. A repair should not silently change which campaign the test is checking. The model can change the link when the browser evidence supports the change, but the expected campaign tag remains the same. If the model cannot produce a valid repair, the product can leave the campaign unverified instead of inventing a pass.

The first version deliberately has a narrow claim vocabulary. The campaign says the App Store handoff keeps ct=threads-oct24. The browser observation supplies the actual href. Omni Verify compares them. It does not infer that all marketing copy is true, and a successful page load alone does not prove attribution is correct.

One tradeoff is that the test follows the live site. That is what exposed the Scribo button's hard-coded tag, but it also means the same app can change after the run. A passing result should describe the path Kane saw at that time, with the run report attached in the team's private workflow. The public drafts do not link to private run material.

The prototype was built around one app and one path rather than a configurable matrix of channels, destinations, and claim types. The next extension should follow the same rule: add one assertion only when the app can show the evidence it needs to pass or fail it.

## Where Kane CLI changed the build

The project runs Kane through the hackathon recorder and asks Kane CLI to use its agent output:

~~~sh
kanehack report -- kane-cli run "Find the main call to action that sends the user to the App Store. Before clicking it, read the full href attribute of that link exactly as written, including its query string, and save it as {{handoff_href}}. Then click it, wait for the App Store page to finish loading, and save the current page URL as {{landing_url}}." --url "https://scribo.cc?ct=threads-oct24" --agent --headless --timeout 300
~~~

The first recorded campaign attempt started at Scribo with ct=threads-oct24. Kane read the main App Store call-to-action href, clicked it, and recorded the App Store destination. The observed href carried ct=site-en-hero. Omni Verify's campaign assertion marked that attempt FAIL because the link did not preserve the campaign's own ct value.

The agent used Kane's observation to repair the campaign. It changed the CTA from the Scribo homepage to the observed Scribo App Store listing and set ct=threads-oct24. The next browser run opened that listing, and Omni Verify marked the campaign assertion PASS. In the captured two-attempt loop, the campaign moved from FAIL to PASS.

There is a status distinction in the local run log. Kane's own run_end event reported passed for both browser executions because the browser steps completed. Omni Verify's separate campaign assertion produced FAIL on the first attempt and PASS on the second. The event recorder displayed ERRORED (UNVERIFIED) for the rc.3 runs, so the project keeps the recorder label, Kane's run status, and the campaign verdict separate.

This changed the build from a link that looked right in generated copy to a launch decision based on the destination the browser actually reached. The agent no longer treats the input URL as proof that attribution is correct. It reads the observed CTA result, repairs the link, and waits for a new check before marking the campaign Verified.

No .evidence pack or reviewed screenshot is present in the workspace, so this draft describes the proof in words and does not embed an image. Before publication, add a screenshot only after checking that the visible page text contains no private data. Do not attach or link the evidence pack itself; it can contain private network and console data.

The prototype has limits. The current assertion checks a tracking parameter and the destination app listing. It has not yet tested prices, trial terms, other marketing claims, or a second product. The recorder's rc.3 status discrepancy is another rough edge. We used the Kane run's own result and Omni Verify's campaign assertion as separate signals rather than calling a completed browser run a failure.

## What is next, how to try it, and credits

The next steps are to publish the source and Ship Page with the exact submitted commit, record and review a short screen capture of the failed and passing campaign assertions, and add one more claim type only after it has a reliable browser check.

To try the current code locally, use bun install && bun run dev. The project expects OpenAI and Kane CLI credentials in the local environment. Do not paste keys into this post or commit them.

Omni Verify was built by Dain Jung at Kane CLI Hack Day in San Francisco. It was built with OpenAI and tested with Kane CLI. [TestMu AI](https://www.testmuai.com) supports Kane CLI Hack Day. The public project links are not ready yet:

- Ship Page: https://kaneclihack.sh/ship/omni (draft)
- Repository: [REPO_URL] at [FINAL_SUBMITTED_SHA]
- Demo: run locally with bun install && bun run dev
- Deck: not published

AI can write the promise. Kane checks if the funnel keeps it.
