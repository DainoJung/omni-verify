# Omni Verify deck outline

Slide outline for the Studio deck. Every visual is a real capture.

## Slide 1: Omni Verify

**Headline:** AI can write the promise. Kane checks if the product keeps it.

**Subhead:** Every promise in an AI-written post is checked before it ships and after every release.

**Footer:** Dain Jung · solo · Kane CLI Hack Day · 24 October 2026

## Slide 2: The problem

**Headline:** Marketing promises and the real product drift apart silently.

**Copy:** AI growth agents make it worse. They write promises at scale, and they learn from the numbers. Who: solo founders who let an agent post their marketing and judge it by tracking tags.

## Slide 3: Drift 1, the link lies (at publish time)

**Headline:** Every Threads install would have been credited to the website.

**Copy:** Every App Store button on scribo.cc overwrites the campaign tag with ct=site-en-hero. No error, just a wrong number. My agent would have concluded Threads doesn't work and stopped posting there.

**Visual:** The two URLs side by side, cropped to the ct parameter.

## Slide 4: Drift 2, the product moves on (after every release)

**Headline:** My old posts promise an app I no longer ship.

**Copy:** Scribo 2.0 (October 1) turned a handwriting vocabulary app into a content learning app. Old @scribo.voca posts still promise a handwriting vocabulary notebook, and still bring people in.

**Visual:** An old post next to today's scribo.cc.

## Slide 5: The fix

**Headline:** Kane checks every promise, before shipping and after every release.

**Copy:** The agent turns each promise into a check: the link's tag, every sentence, every feature. Kane checks it in real Chrome. Failed promises are repaired from what Kane saw (FAIL KR-63, PASS KR-68). After a release: Re-verify for campaigns, Audit past posts for old posts.

**Visual:** docs/live-run.png, cropped to Kane run 1 FAIL, the repair diff, Kane run 2 PASS.

## Slide 6: Only campaigns that pass can publish

**Headline:** A real post, published through the gate.

**Copy:** Publish to Threads stayed locked until Kane's re-check (KR-85) passed that exact version, then needed my confirm. https://www.threads.com/@scribo.voca/post/De4-yPnATF5

**Visual:** The live post on the phone, next to the Verified card.

## Slide 7: Supporting example

**Headline:** Features are checked by doing them.

**Copy:** On TestMu AI's free JSON tool I seeded a false "convert JSON to YAML" claim. Kane clicked it and got JSON back: FAIL (KR-100). The agent swapped in Minify: PASS (KR-102).

**Visual:** docs/feature-claims.jpg

## Slide 8: Honest limits

**Headline:** What a PASS means.

**Copy:** The promises are true when the post ships. Not that installs went up: install credit is unmeasurable from a browser, and Kane's own test design marked it so (75% coverage). Kane had one false negative on below-the-fold text; storing true or false per phrase fixed it.

## Slide 9: Close

**Headline:** Before my agent learns from a post, Kane proves the funnel tells the truth.

**Copy:** Repo: https://github.com/DainoJung/omni-verify · Demo: [VIDEO_URL] · Ship Page: https://kaneclihack.sh/ship/omni

**Credits:** Built with OpenAI. Tested with Kane CLI by TestMu AI.
