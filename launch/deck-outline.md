# Omni Verify deck outline

Draft only. This is a slide outline, not a published deck. The Ship Page is unpublished, screenshots have not been reviewed, and repository details remain placeholders. Reuse this wording in the event Studio deck after the visual proof is checked.

## Slide 1: Omni Verify

**Headline:** AI can write the promise. Kane checks if the funnel keeps it.

**Subhead:** A launch gate for AI-written campaign links.

**Footer:** Dain Jung · Kane CLI Hack Day · 24 October 2026

**Visual:** A real capture of Omni Verify's campaign screen. Do not use a mockup.

## Slide 2: The link looked right until the click

**Headline:** The campaign tag changed at Scribo's App Store button.

**Copy:** The post arrived with ct=threads-oct24. The website CTA handed off ct=site-en-hero.

**Visual:** Two actual URLs side by side, cropped to the relevant ct parameter. Review the screenshot before use.

## Slide 3: One campaign, one launch decision

**Headline:** Omni Verify checks the campaign claim through the real funnel.

**Copy:** Enter the app URL and growth goal. Draft the post. Follow the CTA. Mark the campaign Verified only when its tracking assertion passes.

**Visual:** Actual product screen showing the campaign and its status.

## Slide 4: The campaign promise becomes an assertion

**Headline:** This post promised ct=threads-oct24 would survive the App Store handoff.

**Copy:** Today's prototype checks that tracking parameter. Price, trial, and feature assertions are not implemented yet.

**Visual:** Show the actual assertion text and CTA tag from the run record.

## Slide 5: OpenAI drafts, then repairs

**Headline:** The agent used what the browser saw to change the link.

**Copy:** gpt-5.4-mini via Chat Completions drafted the campaign. After the assertion failed, it changed the CTA to the observed App Store listing with ct=threads-oct24.

**Visual:** A simple three-step diagram: campaign draft → Kane observation → repaired CTA.

## Slide 6: The first campaign check failed

**Headline:** Scribo handed off ct=site-en-hero.

**Copy:** Omni Verify marked the campaign assertion FAIL. Kane's browser run completed and recorded the actual App Store CTA URL.

**Visual:** Reserved for a reviewed screenshot of the failed assertion and its captured href. No evidence pack or screenshot was found in the workspace.

## Slide 7: The repaired campaign passed

**Headline:** The next assertion found ct=threads-oct24 on the handoff.

**Copy:** The agent linked directly to Scribo's App Store page with the campaign's own tag. Omni Verify marked the assertion PASS.

**Visual:** Reserved for a reviewed screenshot of the passing assertion and destination.

## Slide 8: Keep the verdicts distinct

**Headline:** The browser run passed; the campaign assertion first failed, then passed.

**Copy:** Kane's run_end event was passed for both runs. The campaign-level check produced FAIL, then PASS. The rc.3 recorder also reported ERRORED (UNVERIFIED), so the prototype did not treat that recorder label as the assertion result.

**Visual:** A small, readable status comparison using values from the local run log.

## Slide 9: What is working, and what is next

**Headline:** Start with the tracking handoff; add claim types after it is reliable.

**Copy:** Today: one campaign tag assertion for Scribo. Next: reviewed price and trial checks, more app paths, and a public repo and demo.

**Links:** Ship Page https://kaneclihack.sh/ship/omni (draft) · Repo [REPO_URL] · Deck [DECK_URL]

**Credits:** Built with OpenAI. Tested with Kane CLI.
