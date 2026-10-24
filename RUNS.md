# Kane run log

Every real Kane run, appended by the server as it finishes. The kanehack recorder currently marks
kane-cli 0.10.0-rc.3 runs as ERRORED even when Kane passed (help ticket H-0007), so the Kane status
column comes from Kane's own `run_end` event.

| Time (UTC) | kanehack | Kane status | Exit | Omni verdict | Credits | Start URL | Evidence |
|---|---|---|---|---|---|---|---|
| 2026-10-24T18:28:25Z | KR-5 ERRORED (UNVERIFIED) | passed | 0 | - (Step 0 schema probe, no assertion) | 22.0 | https://scribo.cc | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QJN737CN27XNPPRY9DB23Z/dashboard/share/US_NOYLCUL5QZKOXIUT89Z73N07MRH6NJCIL5JQ3PP52E1UQMJXBBDYPK984YTNP282?type=summary&agentView=true&fqdn=summary-page) · [ndjson](fixtures/kane-sample.ndjson) |
| 2026-10-24T18:36:57Z | KR-6 ERRORED (UNVERIFIED) | passed | 0 | FAIL: The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 3). | 23.7 | https://scribo.cc/?ct=threads-oct24 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QK5M9707JQ3YX2CWYYZ8EN/dashboard/share/US_RF1K5D2V9Z8KPC0WAXSIIS7W2T716SQC05TIKB5MBAQ8J7U9N6R4LVW6M3YO6BUU?type=summary&agentView=true&fqdn=summary-page) · [run](runs/2026-10-24T18-36-01Z.json) |
| 2026-10-24T18:53:57Z | KR-13 ERRORED (UNVERIFIED) | passed | 0 | FAIL: The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 2). | 18.9 | https://scribo.cc?ct=threads-oct24 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QM4TWGKT4DKR776C326Y73/dashboard/share/US_MMIU1RL8I1PZ3I4EFRQ31J832929D0SB322CSYYH1TW41DCEQKYMELVA7PE4M876?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T18-53-04Z-a1.json) |
| 2026-10-24T18:54:40Z | KR-14 ERRORED (UNVERIFIED) | passed | 0 | PASS: The App Store link carries ct=threads-oct24, and Kane landed on App Store app id6794793715. | 15.8 | https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QM6H1KZ1YMEZ0BP210YEED/dashboard/share/US_0D0LBX70Y9919IO3K3CZFPKQK4XNZO1L9VWI9X2A8ZP2Y45HSMFSW9NT7Z2459DM?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T18-53-04Z-a2.json) |
| 2026-10-24T18:56:02Z | KR-15 ERRORED (UNVERIFIED) | passed | 0 | FAIL: The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 3). | 21.3 | https://scribo.cc?ct=threads-oct24 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QM8CTNZE4MTCQ3E2ZDJWH1/dashboard/share/US_LUE7OCJ7E5IK6UPR15TBMIHULLKO0RSHLM2CWO3LNXIBTZ1GAA8KA7DL9Z822G9D?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T18-55-01Z-a1.json) |
| 2026-10-24T18:56:43Z | KR-16 ERRORED (UNVERIFIED) | passed | 0 | PASS: The App Store link carries ct=threads-oct24, and Kane landed on App Store app id6794793715. | 3.9 | https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QMAAPEYJWXJWJXWPQPF9Y2/dashboard/share/US_VLYNN85TXQ2118JJ0VH5XPMNS2IZBJL7C4XAMDFJP3AL6A7LTAQX6WI0LUJXI9NM?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T18-55-01Z-a2.json) |
| 2026-10-24T19:04:08Z | KR-27 ERRORED (UNVERIFIED) | passed | 0 | FAIL: The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 2). | 13.1 | https://scribo.cc?ct=threads-oct24 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QMQBJJ5B85CSJ645N5BFJ5/dashboard/share/US_G57CP4NS96FJ4L757R0OTR2JWXDGTL1HN063YN4UCSCUGNH6PRACAWCTTLEH6M8J?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T19-03-11Z-a1.json) |
| 2026-10-24T19:04:49Z | KR-28 ERRORED (UNVERIFIED) | passed | 0 | PASS: The App Store link carries ct=threads-oct24, and Kane landed on App Store app id6794793715. | 5.4 | https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QMS4X7WMHSTKZJN61GVY1A/dashboard/share/US_SBVNQG9KYDJAE7MMKXNMJC8G6KTCZNNNSCX5SKDTU02DEYA47IBBTHXNTRQYCWCY?type=summary&agentView=true&fqdn=summary-page) · [run](runs/c-2026-10-24T19-03-11Z-a2.json) |

## Explore and the assurance loop

Run once each, through `kanehack report`. Streams are in `explore/` and `evidence/assurance/`.

| Time (UTC) | Command | kanehack | Kane result | What it produced | Credits |
|---|---|---|---|---|---|
| 2026-10-24T19:01:59Z | `explore run (read_only, 12 leases)` | KR-23 ERRORED (UNVERIFIED) | stopped: budget | 7 screens, 7 flows verified, 20 findings | 39.0 |
| 2026-10-24T19:01Z | `context ingest campaign spec` | KR-24 ERRORED (UNVERIFIED) | complete | 1 use case proposed (uc-1) | 2.23 |
| 2026-10-24T19:07Z | `design tests uc-1 --max 4` | - | complete | 5 criteria, 3 scenarios, 2 tests, 2 gaps | 13.21 |
| 2026-10-24T19:12Z | `design tests --force (before archive)` | - | nothing_to_change | ac-2 rejection only held | 6.62 |
| 2026-10-24T19:14Z | `design tests --force (after archive)` | - | nothing_to_change | t-1 not seen as stale | 5.5 |
| 2026-10-24T19:14Z | `maintain evolve t-1 --because …` | - | complete | t-1 superseded by t-3 (no ac-2 check) | 10.05 |
| 2026-10-24T19:17:11Z | `testrun run t-2 t-3 (post preview)` | KR-46 PASSED (VERIFIED source) | passed | 2/2 passed, coverage 75% | not in stream |
