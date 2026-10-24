project: Omni Verify
pitch: Kane checks every promise in an AI-written post before it ships and after every release. Only campaigns that pass can publish.
hook: My AI growth agent was about to ship a post with a broken link. It never clicked it. Kane did.
problem: Marketing promises and the real product drift apart silently. AI growth agents make it worse because they write promises at scale and learn from the numbers.
who: Solo founders who let an AI agent write and post their marketing, and judge what works from tracking tags.
when: At publish time the link lies (a CTA overwrites the campaign tag). After every release the product moves on (old posts promise what the app no longer is).
solution: The agent turns every promise in a post into a check. Kane CLI checks each one in a real browser before the post ships, and again after every release (Re-verify, Audit past posts). Failed promises are repaired from what Kane saw. Only a campaign that passes can publish.
proof: A real post went out through the gate, https://www.threads.com/@scribo.voca/post/De4-yPnATF5, unlocked by Re-verify KR-85 passing that exact version.
supporting: On TestMu AI's free JSON tool, a seeded false YAML claim FAILed (KR-100) and the agent swapped in Minify, which PASSed (KR-102).
close: Before my agent learns from a post, Kane proves the funnel tells the truth. AI can write the promise. Kane checks if the product keeps it.
openai: gpt-5.4-mini via Chat Completions drafts the post, writes each promise as a checkable claim, and repairs failed claims from Kane's observations.
hero: docs/verified-card.png
ship_url: https://kaneclihack.sh/ship/omni
repo: https://github.com/DainoJung/omni-verify
video: [VIDEO_URL]
credits: Dain Jung, solo. Built with OpenAI, tested with Kane CLI by TestMu AI.

## Ten-line digest

1. Marketing promises and the real product drift apart silently, and AI growth agents make it worse.
2. They write promises at scale and learn from the numbers, so a wrong number teaches them the wrong lesson.
3. Drift 1, the link lies: every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero.
4. Every Threads install would have been credited to the website, and my agent would have decided Threads doesn't work.
5. Drift 2, the product moves on: Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app, and old posts still promise the old one.
6. Omni Verify turns every promise into a check, and Kane CLI checks it in a real browser before a post ships.
7. Kane checks again after every release: Re-verify for campaigns, Audit past posts for old posts.
8. Failed promises are repaired from what Kane saw (the link lie: FAIL KR-63, PASS KR-68).
9. Only a campaign that passes can publish; a real post went out this way, gated on KR-85.
10. Repo: https://github.com/DainoJung/omni-verify.

## Description

Marketing promises and the real product drift apart silently. AI growth agents make it worse: they write promises at scale, and they learn from the numbers those promises produce. Omni Verify is a gate that makes every promise in an AI-written post pass a real browser check by Kane CLI, before the post ships and again after every release.

It catches two drifts, both found on my own app, Scribo:

- **The link lies (at publish time).** Every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero, so every Threads install would have been credited to the website. No error, just a wrong number, and my agent would have concluded Threads doesn't work and stopped posting there. I haven't checked App Store Connect numbers; this is what the tags say would happen.
- **The product moves on (after every release).** Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app. Old @scribo.voca posts still promise a handwriting vocabulary notebook and keep bringing people in, who then find a different product.

The agent drafts a post and turns each promise into a check: the link's campaign tag, every sentence against the page, every promised feature. Kane checks them. Failed promises are repaired from what Kane saw, then checked again. Only a campaign that passes can publish to Threads, and only after a human confirm. After a release, Re-verify replays Kane's recording of each passing campaign, and Audit past posts checks old posts against today's product.

## How I used OpenAI

gpt-5.4-mini through Chat Completions with strict JSON schemas. It drafts the post grounded in the page text and a Kane Explore map of the site, writes one checkable claim per promise, and repairs failed claims. Repairs are constrained: the link can only be rebuilt from URLs Kane observed, the campaign tag can't change, and every repair is validated before Kane runs again.

## How I used Kane CLI

- `kane-cli run --agent` for every check, through `kanehack report`. Kane stores what it sees (the href, true or false per phrase, a feature's output) and my code judges it.
- `kane-cli explore` mapped scribo.cc: every App Store button links to `?ct&mt&pt`, so each sets its own tag.
- The assurance loop: the verified campaign became a requirement, Kane designed the tests, they passed (KR-46), coverage 75%. The other 25% is install credit, which Kane marked unmeasurable from a browser.
- `--name` and `testmd run`: Kane records each passing run as a test, and Re-verify replays it after a release (KR-77, KR-85).
- Kane was wrong once and I worked around it: "verify the text is visible" gave a false negative on below-the-fold text (KR-51); storing true or false per phrase got every answer right (KR-58).

## Links

- Repo: https://github.com/DainoJung/omni-verify at [FINAL_SUBMITTED_SHA]
- Live post through the gate: https://www.threads.com/@scribo.voca/post/De4-yPnATF5
- Ship Page: https://kaneclihack.sh/ship/omni
- Video: [VIDEO_URL]

## Team

| Name | Role | X | LinkedIn |
|---|---|---|---|
| Dain Jung | Solo builder | @daino0416 | linkedin.com/in/daino-jung |

## Voice notes

First person, plain, specific. One problem: promises and product drift apart. Say "would have" about install credit. Never claim churn numbers. Say the YAML claim was seeded. Close with "Before my agent learns from a post, Kane proves the funnel tells the truth." and "AI can write the promise. Kane checks if the product keeps it."
