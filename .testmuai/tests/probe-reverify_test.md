---
mode: testing
max_steps: 50
timeout: 300
target: chrome
headless: true
variables:
  global.threads_post_url:
    value: http://localhost:3000/post/c-2026-10-24T18-55-01Z
    secret: false
    syntax: '{{threads_post_url}}'
    type: global
---

# Session: probe-reverify

## Step 1
Scroll down through the whole page once, to the bottom. Then, for each text below, check whether it appears anywhere on the page and store the answer, true or false, without searching further: store whether the text "videos, articles and PDFs" appears as 'claim_1'; store whether the text "rewrites them for the learner you are today" appears as 'claim_2'. Then go to https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8. Wait for the App Store page to finish loading. Save the current page URL as {{landing_url}}. Save the app name shown on the page as {{app_name}}.
