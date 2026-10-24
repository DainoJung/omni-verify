---
title: My AI agent writes my marketing. Today I made it prove every post is true.
tags: ai, testing, marketing, buildinpublic
---

I build an app called Scribo by myself. To save time, I let an AI agent write my marketing posts. It's fast. But today I noticed something. It never checks if what it says is true.

I spent the day at Kane CLI Hack Day by TestMu AI, so I tested my own posts with Kane CLI. I found two problems, and both were on my own app.

## The link that told the wrong story

My agent wrote a Threads post and linked it to my website. Looks fine. Kane opened the post in a real Chrome browser and clicked the link.

The App Store button on my website changes the campaign tag. The post sends people with `ct=threads-oct24`, and the button replaces it with `ct=site-en-hero`. So every install from Threads would have looked like it came from my website.

There was no error. Nothing crashed. The number was just wrong.

And that's the scary part. My agent learns from these numbers. With this bug, it would have decided Threads doesn't work and stopped posting there.

## The posts that got old

The second problem was time. I rebuilt Scribo this month. It used to be a handwriting vocabulary app. Now it's an app that rewrites videos and articles at your level.

My old posts are still online. They still say "a vocabulary notebook you write by hand." People still find them, open the App Store, and see a different app.

## What I built

So I built Omni Verify, a gate between my agent and the publish button.

1. The agent (OpenAI) drafts a post and turns every promise in it into a check. The link's tag, each sentence, each feature.
2. Kane CLI runs those checks in a real browser.
3. The agent reads Kane's result. If something fails, it fixes the post and Kane checks again.
4. Publish stays locked until Kane passes that exact version.

For the link bug, Kane failed the first draft (KR-63). The agent linked straight to the App Store with the right tag, and Kane passed it (KR-68). Then I clicked Re-verify, Kane replayed the test, and it passed again (KR-85). Only then did the publish button unlock.

This post went out through that gate today.
https://www.threads.com/@scribo.voca/post/De4-yPnATF5

For the old posts, Kane checked six promises from three of my old posts against my website today. Three passed. Three failed, all about handwriting. The agent suggests a new version of each post, or taking it down. It doesn't change anything on Threads by itself.

The agent also remembers. The three failed promises go into a memory file as "retired." When it writes the next post, it can't use them. I tested this by giving it two drafts with the old promise. It refused both.

## Where Kane surprised me

Kane didn't only run my checks. I gave it the campaign, and it designed its own tests, with me approving each step. It also mapped my site with Kane Explore before the agent wrote anything.

It wasn't perfect. Once, Kane said a sentence wasn't on the page when it was. Asking it a simple true or false for each phrase fixed it. I wrote that down in the repo too.

## What a pass doesn't mean

A pass doesn't mean more installs. I haven't checked App Store Connect yet. It means the post tells the truth when it goes out.

That's the point for me. Before my agent learns from a post, I want to know the post was honest and the numbers will be right.

AI can write the promise. Kane checks if the product keeps it.

Demo (2 min) https://www.loom.com/share/428499f73e57490c818743d7e2de3d77
Code and every Kane run https://github.com/DainoJung/omni-verify

#KaneCLIHackDay
