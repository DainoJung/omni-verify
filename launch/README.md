# Omni Verify launch drafts

Drafts for review. Nothing here has been posted.

## The story in one line

Marketing promises and the real product drift apart silently, and AI growth agents make it worse. Kane checks every promise before a post ships and again after every release. Only campaigns that pass can publish.

## Links

- Repo: https://github.com/DainoJung/omni-verify
- Final submitted SHA: [FINAL_SUBMITTED_SHA]. Fill in after the last commit before 18:00.
- Live post through the gate: https://www.threads.com/@scribo.voca/post/De4-yPnATF5
- Ship Page: https://kaneclihack.sh/ship/omni. Check that it is public before posting anything that links to it.
- Demo video: [VIDEO_URL]
- Run locally: `bun install && bun run dev`, then http://localhost:3000.
- Proof: [RUNS.md](../RUNS.md) lists every Kane run. The kanehack recorder logged KR-46, KR-77 and KR-85 as PASSED (VERIFIED source).

## Drafts

- brief.md: shared source brief and ten-line digest.
- x-thread.md: launch thread. Tags @kane_cli, ends with #KaneCLIHackDay.
- linkedin.md: tags TestMu AI (select the company page from the dropdown when pasting).
- team-posts.md: my own variant. I built this alone.
- hackernews.md: title, submission URL and first comment.
- blog.md: long-form write-up.
- deck-outline.md: slide outline for the Studio deck.
- video-script.md: narration and shot list for the demo video.

## Posting order

1. Push the final commit and fill in [FINAL_SUBMITTED_SHA].
2. Confirm the Ship Page is public and links to the repo.
3. Record the video, upload it, and replace [VIDEO_URL] everywhere.
4. Post X, then LinkedIn, then the blog. HN only once the video is live and I can answer comments.
5. Add the live links to the Submit tab.

## Accuracy notes

- **Drift 1, the link lies.** Every App Store button on scribo.cc overwrites the tag with ct=site-en-hero. Say installs "would have been" credited to the website. I have not checked App Store Connect numbers.
- **Drift 2, the product moves on.** Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app; old @scribo.voca posts still promise a handwriting vocabulary notebook. Say people "may" leave. Never give churn numbers.
- **Audit past posts** is the page that checks old posts against today's product. It ships from the audit-past-posts branch. Don't quote audit results in a post unless they are in the repo.
- **The live post** is real: https://www.threads.com/@scribo.voca/post/De4-yPnATF5, published through the gate, unlocked by Re-verify 2 (KR-85 PASSED) for version a9480fade25c1e68.
- **The YAML claim on TestMu's JSON tool was seeded** (stretch mode) to show the repair. It's a supporting example, not the headline.
- Kane's own browser run passed in the FAIL attempts too; the FAIL is Omni Verify's verdict on what Kane saw.
- Most plain runs show ERRORED (UNVERIFIED) in the recorder because of an rc.3 event-order bug (help ticket H-0007). KR-46, KR-77 and KR-85 are the recorder PASSes.
- A PASS means the post's promises are true at ship time. It does not mean installs went up.

## Approval checklist

- [ ] Repo URL and submitted SHA are correct.
- [ ] Ship Page is public and links to the repo.
- [ ] [VIDEO_URL] is replaced everywhere.
- [ ] "would have" and "may" wording kept for install credit and churn.
- [ ] Each post approved before it goes out.
