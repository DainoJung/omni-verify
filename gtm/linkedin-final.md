# LinkedIn (final)

(Type "@TestMu" and pick the TestMu AI company page from the dropdown. Attach 1-verified-card.png and 2-old-posts-fail.png.)

---

I let an AI agent write marketing posts for my app, Scribo. It's fast. But today I found out it never checks if what it says is true.

I spent the day at Kane CLI Hack Day by @TestMu AI, and I tested my own posts.

The first problem was a link. The App Store button on my website quietly changes the campaign tag. So every install from my Threads posts would have looked like it came from my website. There was no error. Just a wrong number. If my agent learned from that number, it would have decided Threads doesn't work and stopped posting there.

The second problem was time. I rebuilt Scribo this month. It used to be a handwriting vocabulary app, and now it's an app for learning from videos and articles. My old posts still describe the old app, and people still find them.

So I built Omni Verify. Before a post goes out, Kane CLI opens it in a real browser and checks every promise in it. If something is wrong, the agent fixes it and Kane checks again. I can only publish after it passes. When my app changes, Kane checks the old posts too, and the agent remembers which promises aren't true anymore.

This post went out through that gate today.
https://www.threads.com/@scribo.voca/post/De4-yPnATF5

A pass doesn't mean more installs. It means the post tells the truth when it goes out.

AI can write the promise. Kane checks if the product keeps it.

Demo (2 min) https://www.loom.com/share/428499f73e57490c818743d7e2de3d77
Code and every Kane run https://github.com/DainoJung/omni-verify

#KaneCLIHackDay #KaneCLI #BuildInPublic
