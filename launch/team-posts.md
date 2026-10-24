# Teammate post variants

## Dain Jung

I built Omni Verify around a mistake I found in Scribo's own funnel. A Threads link arrived with ct=threads-oct24, but Scribo's App Store button handed off ct=site-en-hero. Omni Verify's campaign assertion caught the mismatch, and the agent repaired the CTA to the App Store listing with the campaign tag intact. The rerun passed the assertion.

The browser runs themselves completed successfully; the failed result was the campaign's tracking assertion. That distinction is in the demo because I want the proof to be accurate.

Built with OpenAI and tested with Kane CLI at Kane CLI Hack Day. Ship Page: https://kaneclihack.sh/ship/omni
Repo: [REPO_URL]

AI can write the promise. Kane checks if the funnel keeps it.
