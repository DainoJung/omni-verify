project: Omni Verify
pitch: A launch gate for AI-written growth posts. Every claim in the post is checked by Kane in a real browser before it can ship.
hook: My AI growth agent was about to ship a post with a broken link. It never clicked it. Kane did.
problem: AI growth agents write for clicks and never click their own links. A post can look right while its tracking tag dies at the CTA, or promise a feature the product does not do.
who: Solo founders who let an agent write and post their marketing.
solution: The agent drafts the post and turns every claim into an assertion: the link keeps its campaign tag, every sentence is on the page, every promised feature works. Kane walks the funnel or performs the feature. Failed claims are repaired from what Kane saw and checked again. Only a post Kane passes can be published, after a human confirm.
demo: Scribo campaign: Kane FAIL on the tracking tag, repair, Kane PASS, Verified, Re-verify replay, Publish to Threads unlocks. Then feature claims on TestMu AI's JSON Prettify tool: the YAML claim FAILs, the agent swaps in Minify, PASS.
demo_narration: Kane reads the App Store button on scribo.cc and finds ct=site-en-hero, so the Threads post's ct=threads-oct24 would be lost. The agent rebuilds the link from what Kane saw, and Kane passes it. On the TestMu tool, Kane clicks the button the post promises converts to YAML and the output is still JSON, so that sentence is replaced with Minify, which Kane then performs.
why: Agents can write the promise. Kane checks whether the funnel keeps it.
openai: gpt-5.4-mini via Chat Completions drafts the post, writes each claim as a checkable assertion, and repairs failed claims from Kane's observations.
fix: The agent replaced the scribo.cc link with the App Store URL Kane observed, set to ct=threads-oct24. On the feature demo it replaced the YAML sentence with Minify.
hero: docs/verified-card.png
ship_url: https://kaneclihack.sh/ship/omni
repo: https://github.com/DainoJung/omni-verify
video: [VIDEO_URL]
credits: Dain Jung, solo. Built with OpenAI, tested with Kane CLI by TestMu AI.

## Ten-line digest

1. Omni Verify is a launch gate for AI-written growth posts, built solo at Kane CLI Hack Day.
2. The agent drafts a post and turns every claim into an assertion before anything ships.
3. Kane CLI checks each assertion in real Chrome: it reads links, finds text on the page, and performs promised features.
4. On my app Scribo, every App Store button hard-codes ct=site-en-hero, so a Threads post's ct=threads-oct24 is lost at the click.
5. Kane read that href, Omni Verify marked the claim FAIL (KR-63), the agent rebuilt the link from what Kane saw, and Kane passed it (KR-68).
6. Every sentence of the post is backed by a phrase Kane finds on the app's page.
7. On TestMu AI's free JSON Prettify tool, a planted "Convert JSON to YAML" claim FAILed (KR-100) and the agent swapped in Minify, which PASSed (KR-102).
8. Re-verify replays Kane's own recording of the passing run in about 10 seconds (KR-77, KR-85 PASSED, VERIFIED source).
9. Publish to Threads stays locked unless the latest Kane result passed that exact version; dry-run tested, live publish not done yet.
10. Repo: https://github.com/DainoJung/omni-verify. Ship Page: https://kaneclihack.sh/ship/omni.

## Description

Omni Verify is a launch gate for AI growth posts. I give it an app URL, a growth goal and an audience. An OpenAI agent drafts the post and turns every claim in it into something a browser can check. Kane CLI then walks the real funnel. If a claim fails, the agent reads what Kane saw, repairs the post, and Kane checks again. Only a post Kane passes is marked Verified for launch, and only a Verified post can be published.

It checks three kinds of claims:

- **The link.** The link that hands a visitor to the App Store must carry the post's own campaign tag. On scribo.cc it did not: every App Store button hard-codes ct=site-en-hero, so a Threads post's tag dies at the click.
- **The words.** Every sentence must be backed by a phrase Kane finds on the app's page.
- **The features.** For a post about a tool, Kane performs each promised feature and checks the result. On TestMu AI's JSON Prettify tool, the YAML claim failed because the output was still JSON.

## How I used OpenAI

gpt-5.4-mini through Chat Completions, with strict JSON schemas. It drafts the post grounded in the page text and a Kane Explore map of the site, writes one claim per sentence, and repairs failed claims. Repairs are constrained: the link can only be rebuilt from URLs Kane observed, the campaign tag cannot change, and every repair is validated before Kane runs again.

## How I used Kane CLI

- `kane-cli run --agent` for every check, through `kanehack report`. Kane stores what it sees (the href, true or false per phrase, the feature result) and my code judges it.
- `kane-cli explore` mapped scribo.cc: every App Store button links to `?ct&mt&pt`, so each sets its own tag.
- The assurance loop: the verified campaign became a requirement, Kane designed the tests, they passed (KR-46), and coverage is 75%. The other 25% is install credit, which Kane marked unmeasurable from a browser.
- `--name` and `testmd run`: Kane records each passing run as a test, and Re-verify replays it.
- Kane also caught me trusting it too much: "verify the text is visible" gave a false negative on below-the-fold text (KR-51). Asking Kane to store true or false per phrase fixed it (KR-58).

## Links

- Repo: https://github.com/DainoJung/omni-verify at [FINAL_SUBMITTED_SHA]
- Ship Page: https://kaneclihack.sh/ship/omni
- Video: [VIDEO_URL]
- Run locally: `bun install && bun run dev`

## Team

| Name | Role | X | LinkedIn |
|---|---|---|---|
| Dain Jung | Solo builder | @daino0416 | linkedin.com/in/daino-jung |

## Voice notes

First person, plain, specific. Keep the real Scribo and TestMu details and the KR run numbers. Say the YAML claim was planted in stretch mode. Say the live Threads publish has not happened until it has. Close with "Agents can write the promise. Kane checks whether the funnel keeps it."
