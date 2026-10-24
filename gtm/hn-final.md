# Show HN

Go to https://news.ycombinator.com/submit

**Title** (80 chars max)
Show HN: Omni Verify, my AI agent can't post until Kane checks every promise

**URL**
https://github.com/DainoJung/omni-verify

(Leave the text box empty when there's a URL. Post the comment below right after submitting.)

---

**First comment**

Hi HN, I'm Dain. I build a small iOS app by myself, and I let an AI agent write my marketing posts.

Today I found two ways that goes wrong.

First, the link. My agent linked a Threads post to my website. The App Store button on my site replaces the campaign tag (ct=threads-oct24 becomes ct=site-en-hero). So installs from Threads would have been counted as website installs. No error, just a wrong number. An agent that learns from that number would stop posting on Threads.

Second, time. I rebuilt the app this month. Old posts still describe the old app, and people still find them.

Omni Verify sits between the agent and the publish button. The agent turns every promise in a post into a check, Kane CLI runs it in a real browser, and the agent fixes what fails. Publish stays locked until that exact version passes. For old posts, Kane checks each promise against today's site, and failed ones go into a "retired" list the agent can't use again.

Built today at Kane CLI Hack Day. Bun + Hono, OpenAI for the agent, Kane CLI for the browser checks. Every Kane run is logged in RUNS.md, including the one where Kane gave a false negative.

Demo (2 min): https://www.loom.com/share/428499f73e57490c818743d7e2de3d77

Happy to answer questions. I'd especially like to hear how others keep marketing copy in sync with a product that changes fast.
