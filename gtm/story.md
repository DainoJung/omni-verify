# Ship Studio > Story (paste field by field)

## One clear function
Omni Verify is a launch gate for AI-written growth campaigns. Before a post goes out, Kane CLI clicks through the real funnel and checks every link and claim. The agent fixes what fails, and only campaigns that pass are marked Verified for launch.

## Who it's for / the problem
Solo founders and small teams who let AI agents write their marketing. The agents write good copy, but they never click their own links. So posts go out with a funnel that silently breaks, and the founder only finds out weeks later when the numbers make no sense.

## The real bug Kane found
I pointed Kane at my own app's site, scribo.cc. Every App Store button on the page hard-codes its own tracking tag (ct=site-en-hero). So when someone arrives from a Threads post tagged ct=threads-oct24 and taps Download, the tag is replaced, and App Store Connect credits the install to the website instead of the post. My growth agent's first draft linked to exactly that broken path on its own. I didn't plant the bug.

## Harness (how the agent and Kane talk)
1. The OpenAI agent (gpt-5.4-mini) drafts a Threads post and a tagged link from the app's real page, and turns its claims into assertions.
2. Kane runs headless with --agent and walks the funnel in real Chrome: open the post preview, read the hand-off link's href before clicking, follow it to the App Store page.
3. The server parses Kane's NDJSON (step lines for the timeline, run_end for the verdict and evidence).
4. On FAIL, the agent reads Kane's result, repairs the campaign (here: link straight to the App Store with the campaign's own ct), and Kane runs again.
5. On PASS, the campaign is Verified for launch with the evidence pack attached.
6. The campaign is also ingested as the spec for Kane's assurance loop. Kane designed the acceptance criteria and tests from the marketing copy. I rejected one criterion that couldn't be observed (the App Store strips the query string after load) and archived it with that reason, and Kane redesigned the tests.

## Proof
- Kane run KR-6 on scribo.cc/?ct=threads-oct24: the hand-off link carried ct=site-en-hero, so the result was FAIL. Evidence: LambdaTest link in RUNS.md.
- Repaired campaign: PASS (add the run ID and link once recorded).
- Assurance loop: designed tests, run results and coverage in evidence/.
- Every real run is logged in RUNS.md with time, status, credits and evidence link.

## Known limits
- Checks stop at the App Store page. They don't follow the user into the app (onboarding, paywall).
- Verification is not measurement. A PASS means the path works and attribution will be recorded. It does not mean the post will drive installs.
- Today only the tracking claim and (if shipped) the visible feature/price sentences are checked. Tone and images are not.
- The event recorder logs kane-cli 0.10.0-rc.3 runs as ERRORED even when Kane passed (help ticket H-0007). Kane's own run_end status is logged in RUNS.md.

## What's next
Check every sentence in the post, follow the user into the app on the iOS Simulator to check the paywall matches the post, and ship it as the launch gate inside Omni, my open-source growth agent.

## Links
- Repo: (GitHub URL)
- Run command: bun install && bun run dev, then open http://localhost:3000
- Demo video: (YouTube/Loom)
- Scribo: https://scribo.cc
- Omni: https://omnigrowth.app
