# Team post variants

I built Omni Verify alone, so there is one variant.

## Dain Jung

I pointed Kane CLI at my own app's funnel, and it caught my growth agent about to ship a post whose tracking tag would die at the App Store button (ct=site-en-hero instead of the post's ct=threads-oct24). The agent rebuilt the link from what Kane saw, and Kane passed it.

Omni Verify now checks every claim in an AI-written post before it ships: the link, every sentence against the page, and every promised feature, performed by Kane. On TestMu AI's free JSON tool, a planted YAML claim failed and the agent swapped in Minify. Publish to Threads stays locked until Kane passes that exact version.

Repo: https://github.com/DainoJung/omni-verify
Demo: [VIDEO_URL]

Agents can write the promise. Kane checks whether the funnel keeps it.
