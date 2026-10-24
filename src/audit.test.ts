import { expect, test } from "bun:test";
import { compileAudit, evaluateAudit, type Promise_ } from "./audit";
import { emptyResult, type KaneResult } from "./kane";

const promises: Promise_[] = [
  { post_id: "DddN67NlHjn", ko: "손으로 적어서 저장하는 단어장!", en: "Scribo is a vocabulary notebook where you save words by handwriting them." },
  { post_id: "DdnaDR8GxkH", ko: "저장한 단어 중에 안 본 거 알아서 띄워주고", en: "Scribo automatically surfaces saved words you have not reviewed." },
];

function kane(values: Record<string, string>, completed = true): KaneResult {
  const r = emptyResult();
  r.completed = completed;
  r.memory = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { value: v, step: 3, operator: null, expected: null, reasoning: null }]));
  return r;
}

test("either site saying it is a PASS; both saying no is a FAIL", () => {
  const ko = kane({ claim_1: "false", claim_2: "true", quote_2: "저장한 단어는 잊을 때쯤 퀴즈에 다시 나와요." });
  const en = kane({ claim_1: "false", claim_2: "false" });
  const [hand, review] = evaluateAudit(promises, ko, en);
  expect(hand.status).toBe("FAIL");
  expect(review.status).toBe("PASS");
  expect(review.ko.quote).toContain("퀴즈");
});

test("a missing value or a run without run_end is UNVERIFIED, never FAIL or PASS", () => {
  expect(evaluateAudit(promises, kane({ claim_1: "false" }), null)[0].status).toBe("UNVERIFIED");
  expect(evaluateAudit(promises, kane({ claim_1: "false" }), kane({ claim_1: "false" }, false))[0].status).toBe("UNVERIFIED");
  expect(evaluateAudit(promises, kane({ claim_1: "false" }), kane({ claim_1: "false" }))[0].status).toBe("FAIL");
});

test("a replay that answers Yes/No counts; any other value is not an answer", () => {
  // Seen in the Re-audit replays KR-129/KR-130: "No", "Yes", "iPhone과 iPad", "__not_visible__".
  expect(evaluateAudit(promises, kane({ claim_1: "No" }), kane({ claim_1: "false" }))[0].status).toBe("FAIL");
  expect(evaluateAudit(promises, kane({ claim_1: "iPhone과 iPad" }), kane({ claim_1: "Yes" }))[0].status).toBe("PASS");
  expect(evaluateAudit(promises, kane({ claim_1: "false" }), kane({ claim_1: "__not_visible__" }))[0].status).toBe("UNVERIFIED");
});

test("the objective stores a boolean and a quote per promise, after one scroll", () => {
  const o = compileAudit(promises, "ko");
  expect(o).toStartWith("Scroll down through the whole page once");
  for (const k of ["'claim_1'", "'claim_2'", "'quote_1'", "'quote_2'"]) expect(o).toContain(k);
  expect(o).toContain("Korean");
  expect(o).not.toContain("{{");
});
