# Kane run log

Every real Kane run, appended by the server as it finishes. The kanehack recorder currently marks
kane-cli 0.10.0-rc.3 runs as ERRORED even when Kane passed (help ticket H-0007), so the Kane status
column comes from Kane's own `run_end` event.

| Time (UTC) | kanehack | Kane status | Exit | Omni verdict | Credits | Start URL | Evidence |
|---|---|---|---|---|---|---|---|
| 2026-10-24T18:28:25Z | KR-5 ERRORED (UNVERIFIED) | passed | 0 | - (Step 0 schema probe, no assertion) | 22.0 | https://scribo.cc | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QJN737CN27XNPPRY9DB23Z/dashboard/share/US_NOYLCUL5QZKOXIUT89Z73N07MRH6NJCIL5JQ3PP52E1UQMJXBBDYPK984YTNP282?type=summary&agentView=true&fqdn=summary-page) · [ndjson](fixtures/kane-sample.ndjson) |
| 2026-10-24T18:36:57Z | KR-6 ERRORED (UNVERIFIED) | passed | 0 | FAIL: The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 3). | 23.7 | https://scribo.cc/?ct=threads-oct24 | [LambdaTest](https://test-manager.lambdatest.com/projects/01M5QFK845A9PX95YRENJ1Z5XD/test-cases/01M5QK5M9707JQ3YX2CWYYZ8EN/dashboard/share/US_RF1K5D2V9Z8KPC0WAXSIIS7W2T716SQC05TIKB5MBAQ8J7U9N6R4LVW6M3YO6BUU?type=summary&agentView=true&fqdn=summary-page) · [run](runs/2026-10-24T18-36-01Z.json) |
