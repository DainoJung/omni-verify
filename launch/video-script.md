# Omni Verify demo video script

Narration and shot list for a 3:00 screen recording. Record real screens. Start on a Kane run report, as the video rules ask. Replace [VIDEO_URL] in the other drafts once it is uploaded.

## 0:00-0:15 | Kane catches it

**Picture:** The Kane run 1 card in the timeline: FAIL, with the href Kane read (ct=site-en-hero).

**On-screen text:** My agent never clicked its own link. Kane did.

**Narration:** This is Kane catching my growth agent about to ship a post whose tracking would die at the first click.

## 0:15-0:40 | Who I am and the problem

**Picture:** scribo.cc, then zoom to the App Store button.

**Narration:** I'm Dain, a solo founder. Building my app, Scribo, was easy. Getting users isn't, so I'm building a growth agent. But growth agents write for clicks and never click their own links. On my own site, every App Store button hard-codes ct=site-en-hero. A Threads post that links here with its own tag loses it at the button, and the install is credited to the website.

## 0:40-1:20 | The loop

**Picture:** Press "Draft and verify" on the campaign page. Show the draft card with its claims, Kane run 1 steps streaming, FAIL, then the repair diff, Kane run 2 PASS and the Verified card.

**On-screen text:** Draft → Kane → FAIL → repair → Kane → PASS

**Narration:** The agent, gpt-5.4-mini, drafts the post and turns every claim into an assertion: the link keeps the post's tag, and every sentence is on the page. Kane walks the real funnel in Chrome. It reads the button's href before clicking: site-en-hero. FAIL. The agent rebuilds the link from the URL Kane saw, with the post's own tag. Kane runs again: PASS. Verified for launch.

## 1:20-1:50 | Features are checked by doing them

**Picture:** /features.html, the TestMu AI JSON Prettify run: Prettify PASS, Validate PASS, "Convert JSON to YAML" FAIL with the JSON output, the repair, Minify PASS.

**On-screen text:** Stretch mode: one planted false claim

**Narration:** For a post about a tool, Kane doesn't just read the page. It does the feature. Here I told the agent to slip in one capability TestMu's JSON tool doesn't have: converting to YAML. Kane clicked it and the output was still JSON. FAIL. The agent swapped in Minify, and Kane minified the sample. PASS.

## 1:50-2:20 | Re-verify and publish

**Picture:** Back on the Verified campaign card. Press Re-verify, show the replay passing in seconds. Then the Publish to Threads button unlocked and its confirm panel.

**Narration:** Kane records every passing run as a test, so Re-verify replays it in about ten seconds and judges every claim again. Publishing stays locked unless Kane's latest result passed this exact version, and it still needs my confirm.

**Note:** Only say the post went live if the live publish has happened by recording time. Until then: "tested in dry-run".

## 2:20-2:45 | Honest limits

**Picture:** README, Known limits, and RUNS.md.

**Narration:** Kane also caught me trusting it too much. "Verify the text is visible" said no to text that is on the page, so now I ask Kane to store true or false instead. And a PASS means the funnel keeps the post's promises today. It doesn't mean installs went up. Every run, failures included, is in the repo.

## 2:45-3:00 | Close

**Picture:** End card: Omni Verify, Dain Jung, https://github.com/DainoJung/omni-verify.

**On-screen text:** Built with OpenAI. Tested with Kane CLI.

**Narration:** Agents can write the promise. Kane checks whether the funnel keeps it.
