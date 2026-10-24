import { expect, test } from "bun:test";
import { parseNdjson, parseRecorder } from "./kane";
import { evaluateParamPreserved } from "./claims";

const fixture = await Bun.file("fixtures/kane-sample.ndjson").text();
const kane = parseNdjson(fixture);

test("parses run_end from the real Step 0 run", () => {
  expect(kane.completed).toBe(true);
  expect(kane.status).toBe("passed");
  expect(kane.resultCode).toBe(100);
  expect(kane.reasonCode).toBe("success.complete");
  expect(kane.finalState.url).toBe("https://apps.apple.com/us/app/scribo-ai-language-learning/id6794793715");
  expect(kane.memory.price_or_free_trial_text.value).toBe("Free");
  expect(kane.memory.destination_url.step).toBe(5);
  expect(kane.credits).toBeCloseTo(22.0, 1);
  expect(kane.testUrl).toStartWith("https://test-manager.lambdatest.com/");
  expect(kane.evidencePath).toEndWith(".evidence");
});

test("collapses running/done step lines into one row per step", () => {
  expect(kane.steps.map((s) => s.step)).toEqual([2, 3, 4, 5, 6, 7]);
  expect(kane.steps.every((s) => s.status === "done")).toBe(true);
  expect(kane.steps[2].remark).toBe("click: Clicking Download Scribo on the App Store");
});

test("a stream without run_end is not completed", () => {
  const cut = fixture.split("\n").filter((l) => !l.includes('"run_end"')).join("\n");
  expect(parseNdjson(cut).completed).toBe(false);
});

test("reads the kanehack recorder line", () => {
  const r = parseRecorder("Kane run KR-5: ERRORED (UNVERIFIED). Details: /t/omni/proof#run-5\n→ Open Proof tab: https://kaneclihack.sh/t/omni/proof#run-5");
  expect(r).toEqual({ runId: "KR-5", verdict: "ERRORED (UNVERIFIED)", proofUrl: "https://kaneclihack.sh/t/omni/proof#run-5" });
});

// param_preserved against the real Step 0 result
const ct = { type: "param_preserved" as const, value: "ct=threads-oct24" };

test("landing-page path without a Kane-read href is UNVERIFIED, never PASS", () => {
  // Step 0's objective did not ask Kane for the href.
  expect(evaluateParamPreserved(ct, "https://scribo.cc/?ct=threads-oct24", kane).status).toBe("UNVERIFIED");
});

test("direct App Store link with the campaign ct passes when Kane lands on the app", () => {
  const v = evaluateParamPreserved(ct, "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8", kane);
  expect(v.status).toBe("PASS");
  expect(v.evidence.handoffSource).toBe("post link");
});

test("direct App Store link with the wrong ct fails", () => {
  const v = evaluateParamPreserved(ct, "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=site-en-hero&mt=8", kane);
  expect(v.status).toBe("FAIL");
  expect(v.reason).toContain("ct=site-en-hero");
});

test("real broken-path run: Kane read scribo.cc's CTA href and the campaign ct did not survive", async () => {
  const broken = parseNdjson(await Bun.file("fixtures/kane-broken-cta.ndjson").text());
  const v = evaluateParamPreserved(ct, "https://scribo.cc/?ct=threads-oct24", broken);
  expect(v.status).toBe("FAIL");
  expect(v.evidence.handoffHref).toBe("https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=site-en-hero&mt=8");
  expect(v.reason).toBe("The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 3).");
});

test("Kane-read CTA href with the site's hard-coded ct fails, citing the step", () => {
  const withHref = {
    ...kane,
    memory: {
      ...kane.memory,
      handoff_href: { value: "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&amp;ct=site-en-hero&amp;mt=8", step: 3, operator: null, expected: null, reasoning: null },
    },
  };
  const v = evaluateParamPreserved(ct, "https://scribo.cc/?ct=threads-oct24", withHref);
  expect(v.status).toBe("FAIL");
  expect(v.reason).toBe("The App Store link carries ct=site-en-hero; the campaign expects ct=threads-oct24 (Kane step 3).");
});
