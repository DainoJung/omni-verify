# Omni Verify launch drafts

Drafts for review. Nothing here has been posted.

## Links

- Repo: https://github.com/DainoJung/omni-verify
- Final submitted SHA: [FINAL_SUBMITTED_SHA]. Fill in after the last commit before 18:00.
- Ship Page: https://kaneclihack.sh/ship/omni. Check that it is public and loads before posting anything that links to it.
- Demo video: [VIDEO_URL]
- Run locally: `bun install && bun run dev`, then open http://localhost:3000 (campaign links) and http://localhost:3000/features.html (feature claims).
- Proof: [RUNS.md](../RUNS.md) lists every Kane run. The kanehack recorder logged KR-46, KR-77 and KR-85 as PASSED (VERIFIED source).

## Drafts

- brief.md: shared source brief and ten-line digest.
- x-thread.md: launch thread. Tags @kane_cli, ends with #KaneCLIHackDay.
- linkedin.md: post that tags TestMu AI (select the company page from the dropdown when pasting).
- team-posts.md: Dain's own variant. I built this alone, so there are no teammate variants.
- hackernews.md: title, submission URL and first comment.
- blog.md: long-form write-up.
- deck-outline.md: slide outline for the Studio deck.
- video-script.md: narration and shot list for the demo video.

## Posting order

1. Push the final commit and fill in [FINAL_SUBMITTED_SHA].
2. Confirm the Ship Page is public and links to the repo.
3. Record the video, upload it, and replace [VIDEO_URL] everywhere.
4. Review every screenshot before attaching it (they are real captures from docs/).
5. Post X, then LinkedIn, then the blog. HN only once the repo and video are live and I can answer comments.
6. Add the live links to the Submit tab.

## Accuracy notes

What is shipped and shown with real Kane runs:

- **Campaign link check (Scribo).** Draft links to scribo.cc with ct=threads-oct24. Kane reads the App Store button's href: ct=site-en-hero. FAIL (KR-63). The agent rebuilds the link from the URL Kane saw, with ct=threads-oct24. PASS (KR-68). Same result in all five full loops.
- **Text claim checks.** Every sentence of the post must be backed by a phrase Kane finds on the app's page. A draft with an unbacked sentence is rejected before Kane runs.
- **Feature claims verified by action** on TestMu AI's free JSON Prettify tool (/features.html). Kane performs each promised feature. In stretch mode I tell the agent to add one capability the page does not show, so the gate has a false promise to catch. "Convert JSON to YAML" FAIL (KR-100: Kane clicked, the output was still JSON). The agent swapped in Minify. PASS (KR-102).
- **Re-verify.** Kane records the passing run as a _test.md; the button replays it in about 10 seconds and re-judges every claim (KR-77, KR-85 PASSED, VERIFIED source).
- **Publish to Threads, gated by Kane.** Locked unless the latest Kane result is a PASS for that exact campaign version, then a click and a confirm. Tested in dry-run mode only. The live publish has not happened yet; do not say it has until it does.

Wording to keep straight:

- The stretch-mode false claim was induced on purpose. Never say the agent invented YAML on its own.
- Kane's own browser run passed in the FAIL attempts too. The FAIL is Omni Verify's verdict on what Kane saw (the href, the result text).
- Most plain runs show ERRORED (UNVERIFIED) in the recorder because of an rc.3 event-order bug (help ticket H-0007). KR-46, KR-77 and KR-85 are the recorder PASSes.
- A PASS means the funnel keeps the post's promises today. It is not a claim that installs went up. Install credit itself is unmeasurable from a browser (the 25% gap in Kane's coverage).
- The repo includes sealed Kane evidence packs, unedited, by my choice.

## Approval checklist

- [ ] Repo URL and submitted SHA are correct.
- [ ] Ship Page is public and links to the repo.
- [ ] [VIDEO_URL] is replaced everywhere.
- [ ] Screenshots reviewed.
- [ ] Publish to Threads described as dry-run tested unless the live publish has happened.
- [ ] Each post approved before it goes out.
