# LinkedIn post

My AI growth agent was about to ship a post with a broken link. It never clicked it. Kane CLI did.

I'm a solo founder. Building my app was the easy part; getting users is not, so I'm building a growth agent. The problem with growth agents is that they write for clicks and never click their own links. So at Kane CLI Hack Day I built Omni Verify, a launch gate where every claim in an AI-written post has to pass a real browser check before it can ship.

What it caught on my own app, Scribo: every App Store button on scribo.cc hard-codes ct=site-en-hero. A Threads post that links to the site with its own tag loses it at the click, and App Store Connect credits the install to the website. The post looks right, the link works, the numbers are wrong. Kane read the button's href, Omni Verify marked the claim FAIL, the agent rebuilt the link from what Kane saw, and Kane passed it.

It checks more than links:

- Every sentence of the post must be backed by text Kane finds on the page.
- For a post about a tool, Kane performs each promised feature. On @TestMu AI's free JSON Prettify tool, I had the agent add one feature the page doesn't show, "convert JSON to YAML". Kane clicked it, the output was still JSON, FAIL. The agent swapped in Minify, and Kane passed it.
- Kane records each passing run as a test, and Re-verify replays it in about 10 seconds.
- Publish to Threads stays locked unless Kane's latest result passed that exact version, and it needs a human confirm. Tested in dry-run mode so far; the first live post is next.

What a PASS means, and what it doesn't: the funnel keeps the post's promises today. It doesn't prove installs went up, and Kane itself marked install credit as unmeasurable from a browser.

Built with OpenAI (gpt-5.4-mini) and tested with Kane CLI.

Repo, Kane runs and evidence: https://github.com/DainoJung/omni-verify
Demo: [VIDEO_URL]

Agents can write the promise. Kane checks whether the funnel keeps it.

#KaneCLIHackDay #KaneCLI #BuildInPublic

Note for pasting: type @ and select the TestMu AI company page from the dropdown so the tag is real.
