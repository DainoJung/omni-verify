# Omni Verify three-minute demo video script

Draft for a 3:00 screen-recorded video. This is narration and a shot list only, not a rendered video. Record real screens; no reviewed screenshots or evidence pack were found in the workspace. Keep the Kane browser result and Omni Verify campaign verdict distinct: Kane's run_end passed on both runs, while the campaign assertion went FAIL then PASS.

## 0:00–0:20 | Hook

**Picture:** Start on the actual Omni Verify campaign screen. Show the campaign name and the app URL field.

**On-screen text:** AI can write the promise. Kane checks if the funnel keeps it.

**Narration:** AI growth agents publish campaigns without ever clicking their own links. I built Omni Verify to make that click part of the launch process. It checks the link a person will actually follow, then holds the campaign until its tracking promise matches the destination.

## 0:20–0:43 | The problem

**Picture:** Show the real Scribo home page, then zoom to the App Store button. Keep the address bar visible.

**On-screen text:** Campaign link: ct=threads-oct24

**Narration:** I found the problem on my own app, Scribo. I was preparing a Threads post with ct=threads-oct24. The post's link opened the Scribo website, but the App Store button on that page had its own tag, ct=site-en-hero. The page loaded. Attribution would point at the website instead of the post.

## 0:43–1:05 | What Omni Verify does

**Picture:** Show entering scribo.cc, a growth goal, and an audience. Show the generated campaign and its CTA.

**On-screen text:** Draft → follow the CTA → check the campaign claim

**Narration:** Omni Verify takes an app URL, a growth goal, and an audience. It reads the visible page text and asks an OpenAI model to draft one campaign post and its tagged link. It turns the promise about the campaign tag into an assertion the browser can check.

## 1:05–1:28 | The OpenAI piece

**Picture:** Show the campaign post and the claim card. Do not show environment files or keys.

**On-screen text:** gpt-5.4-mini · Chat Completions

**Narration:** The recorded campaign used gpt-5.4-mini through Chat Completions. The model drafts the copy and link. After a failed assertion, it gets the exact browser observation and chooses a repair. The campaign tag stays fixed, so the agent cannot turn a wrong result into a pass by changing what it was supposed to check.

## 1:28–1:57 | Kane follows the real link

**Picture:** Show the Kane run progress in the app. Cut to the actual captured CTA href, with only the relevant query parameter visible.

**On-screen text:** Expected: ct=threads-oct24
**On-screen text:** Observed: ct=site-en-hero

**Narration:** Kane CLI opened Scribo, read the main App Store button's full href, clicked it, and recorded the destination. The observed link carried ct=site-en-hero. Kane's browser run completed, but Omni Verify's campaign assertion failed because the campaign's own tag did not survive the handoff.

## 1:57–2:20 | The agent repairs the campaign

**Picture:** Show the repair reason and the changed CTA. Keep the URL readable, with ct=threads-oct24.

**On-screen text:** Repair: use the observed App Store listing and keep the campaign tag

**Narration:** The agent used the URL Kane observed. It changed the CTA to the Scribo App Store listing and set its ct value to threads-oct24. It did not change the campaign tag or claim that the first attempt had passed.

## 2:20–2:42 | The rerun

**Picture:** Show the second browser run landing on Scribo's App Store listing, then the Omni Verify PASS state.

**On-screen text:** Campaign assertion: PASS

**Narration:** Kane ran the browser path again. The destination was the Scribo App Store listing, and the campaign assertion found ct=threads-oct24 on the handoff. The browser run reported passed, and Omni Verify marked the campaign Verified.

## 2:42–2:53 | Scope and limits

**Picture:** Show the campaign report, then a simple note on screen.

**On-screen text:** Today: App Store tracking tag. Next: more claim types.

**Narration:** Today's prototype checks this tracking claim. It does not yet verify prices, free trials, or every feature in the copy. That is the next part to build and test.

## 2:53–3:00 | Close

**Picture:** End card with Omni Verify, Dain Jung, the published Ship Page URL, and repository URL once available.

**On-screen text:** Built with OpenAI. Tested with Kane CLI.

**Narration:** AI can write the promise. Kane checks if the funnel keeps it.

**Links to insert after publishing:** https://kaneclihack.sh/ship/omni · [REPO_URL]
