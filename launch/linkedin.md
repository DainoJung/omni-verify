# LinkedIn post draft

AI growth agents publish campaigns without ever clicking their own links. I built Omni Verify to check the funnel before a solo founder posts.

My own app, Scribo, made the problem concrete. The Threads campaign link carried ct=threads-oct24 into scribo.cc, but the site's App Store button handed visitors off with ct=site-en-hero. App Store Connect would credit those installs to the website instead of the post.

Omni Verify drafts a campaign from the app page and checks its tracking claim in a real browser. The first campaign assertion failed when Kane CLI recorded the App Store CTA's existing tag. The agent then linked straight to Scribo's App Store listing with ct=threads-oct24. The assertion passed on the rerun.

One detail matters: Kane's browser run completed successfully both times. Omni Verify's campaign assertion was the part that went from FAIL to PASS. The event recorder showed an rc.3 status discrepancy, so we kept the browser result and campaign verdict separate in the demo.

The prototype uses gpt-5.4-mini through Chat Completions to draft and repair a campaign. Today it checks the tracking tag. Price, trial, and feature claims are next.

Built with OpenAI and tested with Kane CLI at Kane CLI Hack Day, supported by TestMu AI. The project is for solo founders who want to catch attribution breaks before a post goes live.

Ship Page: https://kaneclihack.sh/ship/omni
Repo: [REPO_URL] at [FINAL_SUBMITTED_SHA]
Run locally: bun install && bun run dev

AI can write the promise. Kane checks if the funnel keeps it.

#KaneCLIHackDay #KaneCLI #MarketingOps

Note for pasting: LinkedIn tags are not embedded in plain text. Type @ before TestMu AI and OpenAI and select their company pages from the dropdown.
