---
assurance:
  id: t-1
  base: sha256:b38b5e06f3c8cddf1b80690e2d7fb55ff530aecfce847ac5ce8e7d46126bed0f
---
# Threads link opens Scribo App Store with campaign token

> Follow the post's direct App Store link and observe the threads-oct24 token at handoff and Scribo's app page.

## Step 1 @verifies ac-1

At {{threads_post_url}}, locate the published Scribo Threads campaign post for second-language learners who journal or write daily, then assert its direct App Store link contains ct=threads-oct24.

## Step 2 @verifies ac-2, ac-4

From that Threads post, follow its direct App Store link, then assert the opened App Store URL contains ct=threads-oct24 and the destination is Scribo's App Store page for id6794793715.
