# Omni Verify launch drafts

These are drafts for review. Nothing has been posted or published.

## Current known links

- Ship Page: https://kaneclihack.sh/ship/omni, currently draft and unpublished.
- Repo: [REPO_URL]. The workspace has no Git remote configured.
- Final submitted SHA: [FINAL_SUBMITTED_SHA]. The checked-out workspace has uncommitted changes, so its current HEAD is not treated as the submission SHA.
- Demo: no public Omni Verify URL is known. Local command from the project README: bun install && bun run dev.
- Deck page: not published.
- Kane run records: local redacted files in RUNS.md and runs/. Do not publish raw run logs, LambdaTest share URLs, or evidence packs.
- Screenshots/evidence packs: none found in the workspace. Review any screenshot text before adding an image to a public asset.

## Drafts

- brief.md: shared source brief.
- x-thread.md: launch thread. Publish the Ship Page and add the repo link first.
- linkedin.md: captain's post. LinkedIn tags must be selected from the platform dropdown when pasting.
- team-posts.md: Dain variant only. Add no other teammate without their name and handles.
- hackernews.md: title, submission URL, and first comment. Wait until the Ship Page is public and the repo link is live.
- blog.md: long-form draft. Add reviewed screenshots and final links before publishing.
- deck-outline.md: outline only, as requested. Reuse slide text in Studio after reviewing proof images.
- video-script.md: three-minute narration and shot list, as requested. It is not a rendered video.

## Posting order

1. Publish the Ship Page in Studio and confirm it loads.
2. Add the repo URL, final submitted SHA, and runnable demo instructions.
3. Replace placeholders in the blog, HN comment, X thread, LinkedIn post, deck outline, and video script.
4. Review any screenshots and all spoken/on-screen text.
5. Approve each piece before posting. Dain posts from their own accounts; do not tag teammates who have not confirmed.
6. Add live asset links to the Submit tab.

## Accuracy notes

- In the captured loop, Omni Verify's campaign assertion was FAIL on the initial Scribo CTA and PASS after the agent changed the CTA.
- Kane's browser run_end reported passed on both runs. The event recorder showed ERRORED (UNVERIFIED) on the rc.3 run. Copy distinguishes browser-run status from the campaign assertion.
- The current prototype validates the App Store campaign tag. Price, trial, and feature claim checks are future work, not demonstrated results.
- The workspace has redacted run records but no .evidence pack or reviewed screenshots. The raw evidence remains private and should not be attached to posts.

## Approval checklist

- [ ] Repo URL and submitted SHA are correct.
- [ ] Ship Page is public and links to the submitted repo.
- [ ] Screenshots are real and reviewed.
- [ ] OpenAI model/API description matches the submitted build.
- [ ] Kane run and campaign assertion statuses are described separately.
- [ ] Every teammate name and handle is correct and approved.
- [ ] Each social post, blog, HN comment, deck text, and video narration is approved before publication.
