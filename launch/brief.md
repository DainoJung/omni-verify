project: Omni Verify
pitch: A launch gate that checks whether an AI-written campaign keeps its claims and tracking through the real app funnel.
hook: AI growth agents publish campaigns without ever clicking their own links.
problem: Solo founders lose attribution or mislead customers when a CTA changes the campaign tag or the page cannot support a claim.
who: Solo founders using AI to write and publish growth campaigns.
solution: Draft one campaign from the app's visible content. Turn its tracking promise into a browser assertion. Repair the link when the assertion fails, then verify the rerun.
demo: Record the Omni Verify campaign screen, the Scribo CTA result, the failed campaign assertion, the repaired App Store link, and the passing assertion. No screenshots or screen recording are in the workspace yet.
demo_narration: The campaign starts at Scribo with ct=threads-oct24. The home page CTA hands off ct=site-en-hero, so Omni's assertion fails. The agent links directly to the App Store with the campaign's own tag; the assertion passes.
why: AI can write the promise. Kane checks if the funnel keeps it.
openai: gpt-5.4-mini via Chat Completions drafts campaign copy and repairs a failed link.
fix: The agent changed the CTA from Scribo's homepage to the observed App Store URL with ct=threads-oct24.
hero: [Add a checked hero screenshot after reviewing the real app capture.]
ship_url: https://kaneclihack.sh/ship/omni (draft, not published)
deck_url: [No deck page published yet.]
credits: Dain Jung; built with OpenAI, tested with Kane CLI; TestMu AI is named as event/tooling credit.

## Ten-line digest

1. Omni Verify is a launch gate for AI-written growth campaigns.
2. Solo founders are the user; a broken CTA tag can misattribute installs or leave a promise unsupported.
3. The specific app is Scribo at https://scribo.cc.
4. The initial campaign used ct=threads-oct24 on the Scribo homepage link.
5. Kane recorded the page CTA handoff as ct=site-en-hero.
6. Omni Verify's campaign assertion failed on that mismatch; the Kane browser run itself completed with run_end passed.
7. The OpenAI model recorded for the verified campaign was gpt-5.4-mini using Chat Completions.
8. The agent repaired the CTA to the observed App Store listing with ct=threads-oct24.
9. On the rerun, Omni Verify's assertion passed and the Kane browser run completed with run_end passed.
10. The Ship Page is https://kaneclihack.sh/ship/omni (draft); repository URL, final SHA, deck, and reviewed screenshots remain placeholders.

## Description

Omni Verify is a launch gate for AI growth campaigns. A founder gives it an app URL, a growth goal, and an audience. The agent drafts a post and CTA link from the app's visible page content. Kane CLI follows the actual browser path. Omni Verify checks whether the campaign's own App Store campaign tag survives the CTA. When it does not, the agent can repair the link and request another check.

The first build centers on Scribo, a language-learning app whose website App Store button hard-codes ct=site-en-hero. A Threads campaign began with ct=threads-oct24, but the website button handed the visitor to the App Store with the site tag instead. The current prototype verifies this tracking claim. It does not yet verify prices, trial lengths, or every product feature claim.

## How we used OpenAI

The campaign record used gpt-5.4-mini. The code calls the Chat Completions API. The model drafts a post and its campaign link, then receives the failed assertion and Kane's observations to choose a small repair. The current prompt keeps the campaign tag fixed and allows the agent to repair the link; broader claim types are outside today's verified scope.

## How we used Kane CLI

- Command wrapper in the project: kanehack report -- kane-cli run <objective> --url <URL> --agent --headless --timeout 300.
- Assertion: the App Store handoff must contain ct=threads-oct24 and reach the Scribo App Store listing.
- Failure: Kane recorded the existing CTA handoff with ct=site-en-hero; Omni Verify marked the campaign assertion FAIL.
- Repair and pass: the agent changed the CTA to the observed App Store URL with ct=threads-oct24; the next assertion was PASS.
- Status nuance: Kane's run_end event reported passed on both browser runs. The separate campaign assertion was FAIL, then PASS. The event recorder displayed ERRORED (UNVERIFIED) for rc.3, as noted in the project run log.
- Local source of run details: RUNS.md and redacted runs/ records. No .evidence pack or reviewed screenshot is in this workspace.

## Links

- Repo and submitted SHA: [REPO_URL] at [FINAL_SUBMITTED_SHA]
- Demo URL: [No public Omni Verify URL known. Run locally with bun install && bun run dev.]
- Ship Page: https://kaneclihack.sh/ship/omni (draft)
- Deck: [Not published]
- Screenshots or screen recording: [Not present in workspace]

## Team

| Name | Role | X | LinkedIn | Posting |
|---|---|---|---|---|
| Dain Jung | Builder and captain | @daino0416 | linkedin.com/in/daino-jung | Captain draft only; confirm other teammates before crediting |

## Voice notes

Use the plain, direct language in Dain's brief: “AI growth agents publish campaigns without ever clicking their own links.” Keep the real Scribo details, avoid unsupported outcome claims, and close with “AI can write the promise. Kane checks if the funnel keeps it.”
