# Omni Verify deck outline

Slide outline for the Studio deck. Every visual is a real capture from docs/ or the running app.

## Slide 1: Omni Verify

**Headline:** Agents can write the promise. Kane checks whether the funnel keeps it.

**Subhead:** A launch gate for AI-written growth posts.

**Footer:** Dain Jung · solo · Kane CLI Hack Day · 24 October 2026

**Visual:** docs/verified-card.png

## Slide 2: My agent never clicked its own link

**Headline:** The link loaded. The tracking died at the button.

**Copy:** My Threads post carried ct=threads-oct24. Every App Store button on scribo.cc hard-codes ct=site-en-hero, so the install would be credited to the website.

**Visual:** The two URLs side by side, cropped to the ct parameter.

## Slide 3: Every claim becomes an assertion

**Headline:** Link, words, features.

**Copy:** The link keeps the post's own campaign tag. Every sentence is backed by text Kane finds on the page. Every promised feature is performed by Kane on the real tool.

**Visual:** The draft card with its claims and assertions.

## Slide 4: Kane FAIL, repair, Kane PASS

**Headline:** The agent fixes the post from what Kane saw.

**Copy:** Kane read the button's href: ct=site-en-hero. FAIL (KR-63). The agent rebuilt the link from that URL with ct=threads-oct24. PASS (KR-68). Same result in all five full loops.

**Visual:** docs/live-run.png, cropped to Kane run 1, the repair diff and Kane run 2.

## Slide 5: Features are checked by doing them

**Headline:** "Converts JSON to YAML." Kane clicked it. Still JSON.

**Copy:** On TestMu AI's free JSON Prettify tool, stretch mode makes the agent add one capability the page doesn't show. Kane performed it: FAIL (KR-100). The agent swapped in Minify: PASS (KR-102). Prettify and Validate passed first try.

**Visual:** docs/feature-claims.jpg

## Slide 6: Kane, end to end

**Headline:** Explore, run, design, replay.

**Copy:** Explore mapped scribo.cc and showed every App Store button sets its own tag. Kane designed tests from the verified campaign: 2/2 passed (KR-46), 75% coverage; the other 25%, install credit, Kane marked unmeasurable from a browser. Every passing run is recorded as a test, and Re-verify replays it in about 10 seconds (KR-77, KR-85).

**Visual:** docs/reverify.png

## Slide 7: Nothing ships without a PASS

**Headline:** Publish to Threads unlocks only for the version Kane passed.

**Copy:** Locked unless the latest Kane result passed that exact version of the post. Then a click and a confirm showing the account, the text and the Kane run it rests on. Dry-run tested; the first live post is next.

**Visual:** docs/publish-confirm.png

## Slide 8: Where Kane was wrong, and what I changed

**Headline:** A false negative, caught and worked around.

**Copy:** "Verify the text is visible" said no to text that is on the page (KR-51). Asking Kane to store true or false per phrase got every answer right (KR-58). A PASS means the funnel keeps the promises today, not that installs went up.

**Visual:** The phrasing table from the README.

## Slide 9: Links

**Headline:** Try it, read the runs.

**Copy:** Repo: https://github.com/DainoJung/omni-verify · Demo: [VIDEO_URL] · Ship Page: https://kaneclihack.sh/ship/omni

**Credits:** Built with OpenAI. Tested with Kane CLI by TestMu AI.
