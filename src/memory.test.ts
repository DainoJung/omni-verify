import { expect, test } from "bun:test";
import { mergeAudit, mergeCampaign, retiredTerms, type ProductFacts } from "./memory";
import type { AuditRecord } from "./audit";
import type { CampaignRecord } from "./loop";

// The real audit of @scribo.voca's past posts (3 of 6 promises FAIL on today's site).
const audit = (await Bun.file("runs/a-2026-10-24T20-46-49Z.json").json()) as AuditRecord;
const empty = (): ProductFacts => ({ product: "Scribo", updated_at: "", confirmed: [], retired: [], unverified: [] });

test("the audit's FAILs become retired promises with Kane's evidence, its PASSes confirmed facts", () => {
  const f = empty();
  expect(mergeAudit(f, audit, audit.verdicts, audit.checks, "t", "audit")).toEqual({ confirmed: 3, retired: 3, unverified: 0 });
  expect(f.retired.map((r) => r.original)).toEqual(["손으로 적어서 저장하는 단어장!", "손글씨로 한번 더 써보면서 복습하는 거지", "요즘 Scribo 손글씨 단어장으로 쓰고 있는데"]);
  expect(f.retired[0].evidence).toContain("neither says this any more");
  expect(f.retired[0].post.permalink).toBe("https://www.threads.com/@scribo.voca/post/DddN67NlHjn");
  expect(f.confirmed.find((c) => c.claim === "Scribo has a review feature.")?.sentence).toBe("Words you saved come back in your quiz just before you'd forget them.");
});

test("a Re-audit's UNVERIFIED never un-retires a promise", () => {
  const f = empty();
  mergeAudit(f, audit, audit.verdicts, audit.checks, "t", "audit");
  const ra = audit.reaudits[0]; // promise 5 (review by writing again by hand) came back UNVERIFIED
  expect(ra.verdicts[4].status).toBe("UNVERIFIED");
  mergeAudit(f, audit, ra.verdicts, ra.checks, "t2", "re-audit");
  expect(f.retired.length).toBe(3);
  expect(f.unverified.length).toBe(0);
});

test("a later PASS moves a retired promise to confirmed", () => {
  const f = empty();
  mergeAudit(f, audit, audit.verdicts, audit.checks, "t", "audit");
  const passAll = audit.verdicts.map((v) => ({ ...v, status: "PASS" as const, en: { ...v.en, value: "true" } }));
  mergeAudit(f, audit, passAll, audit.checks, "t2", "re-audit");
  expect(f.retired.length).toBe(0);
  expect(f.confirmed.length).toBe(6);
});

test("launch-gate PASSes add the sentences Kane found; failed campaigns add nothing", async () => {
  const rec = (await Bun.file("runs/c-2026-10-24T19-41-41Z.json").json()) as CampaignRecord;
  const f = empty();
  expect(mergeCampaign(f, rec)).toBe(2);
  expect(f.confirmed.map((c) => c.sentence)).toContain("in sections you can finish");
  expect(mergeCampaign(empty(), { ...rec, status: "needs_human" })).toBe(0);
});

test("retired wording is caught without the model", async () => {
  const f = (await Bun.file("memory/product-facts.json").json()) as ProductFacts;
  expect(retiredTerms("Miss your handwriting vocabulary notebook?", f)).toEqual(["handwriting vocabulary"]);
  expect(retiredTerms("요즘 Scribo 손글씨 단어장", f)).toEqual(["손글씨 단어장"]);
  expect(retiredTerms("Learn from the videos, articles and PDFs you care about.", f)).toEqual([]);
});
