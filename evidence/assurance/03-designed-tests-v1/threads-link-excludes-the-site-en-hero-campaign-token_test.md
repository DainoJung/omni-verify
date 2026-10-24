---
assurance:
  id: t-2
  base: sha256:cfb2f84b74e0347da023bc6c89ad7debc5dd83d2ca38381436d4aa15c296676b
---
# Threads link excludes the site-en-hero campaign token

> Check the link in the Threads post against the documented wrong site-en-hero token without asserting any behavior for a modified URL.

## Step 1 @verifies ac-1, ac-5

At {{threads_post_url}}, inspect the direct App Store link in the published Scribo Threads campaign post for second-language learners who journal or write daily, then assert it contains ct=threads-oct24 and does not contain ct=site-en-hero.
