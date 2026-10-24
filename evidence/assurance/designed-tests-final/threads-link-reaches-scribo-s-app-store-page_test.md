---
assurance:
  id: t-3
  base: sha256:e14b7e8e595cbca4c032940e374371d555bf5a5aa01b0df1a111f1b2ad12b8bc
---
# Threads link reaches Scribo's App Store page

> Follow the post's direct App Store link and observe the threads-oct24 token at handoff and Scribo's app page.

## Step 1 @verifies ac-1

At {{threads_post_url}}, locate the published Scribo Threads campaign post for second-language learners who journal or write daily and inspect its direct App Store link, then assert that link contains ct=threads-oct24.

## Step 2 @verifies ac-4

From that Threads post, follow its direct App Store link, then assert the destination is Scribo's App Store page for id6794793715.
