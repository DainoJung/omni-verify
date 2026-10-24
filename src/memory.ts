// Agent memory from Kane: what the product promises today, as Kane last saw it.
// memory/product-facts.json (committed) holds
//   confirmed: promises Kane found on today's site, with the sentence it relied on
//   retired:   promises from old posts that Kane found the site no longer makes
//   unverified: promises Kane gave no answer for; neither confirmed nor retired
// The audit and Re-audit merge their verdicts in after Kane finishes; launch-gate PASSes add confirmed facts.
// The drafting agent may only promise confirmed facts and must never repeat a retired one.

import { mkdir, writeFile } from "node:fs/promises";
import { callJson, type Campaign } from "./agent";
import type { AuditRecord, AuditVerdict, KaneCheck } from "./audit";
import type { CampaignRecord } from "./loop";

export const FACTS_PATH = "memory/product-facts.json";

type Run = { id: string; recorder: string | null; test_url: string | null };
export type ConfirmedFact = { claim: string; sentence: string; page: string; run: Run; date: string; source: string };
export type RetiredPromise = {
  claim: string; original: string; post: { id: string; permalink: string; date: string };
  evidence: string; run: Run; date: string; source: string; avoid_terms: string[];
};
export type UnverifiedPromise = { claim: string; original: string; post: { id: string; permalink: string; date: string }; reason: string; run: Run; date: string; source: string };
export type ProductFacts = { product: string; updated_at: string; confirmed: ConfirmedFact[]; retired: RetiredPromise[]; unverified: UnverifiedPromise[] };

const key = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const runOf = (c: KaneCheck | undefined): Run => ({ id: c?.kaneRunId ?? "", recorder: c?.kane.recorder ?? null, test_url: c?.kane.testUrl ?? null });

export async function loadFacts(path = FACTS_PATH): Promise<ProductFacts> {
  const f = Bun.file(path);
  if (await f.exists()) return (await f.json()) as ProductFacts;
  return { product: "Scribo (scribo.cc)", updated_at: new Date(0).toISOString(), confirmed: [], retired: [], unverified: [] };
}

export async function saveFacts(facts: ProductFacts, path = FACTS_PATH) {
  await mkdir("memory", { recursive: true });
  await writeFile(path, JSON.stringify(facts, null, 2) + "\n");
}

// Merge one audit's verdicts (the audit's own, or a Re-audit's) into the store.
// PASS confirms, FAIL retires, UNVERIFIED never overrides an earlier PASS or FAIL.
export function mergeAudit(facts: ProductFacts, rec: AuditRecord, verdicts: AuditVerdict[], checks: KaneCheck[], at: string, source: string): { confirmed: number; retired: number; unverified: number } {
  const counts = { confirmed: 0, retired: 0, unverified: 0 };
  rec.promises.forEach((p, i) => {
    const v = verdicts[i];
    if (!v) return;
    const post = rec.posts.find((x) => x.id === p.post_id);
    const postRef = { id: p.post_id, permalink: post?.permalink ?? "", date: post?.timestamp ?? "" };
    const k = key(p.en);
    const drop = <T extends { claim: string }>(xs: T[]) => xs.filter((x) => key(x.claim) !== k);
    if (v.status === "PASS") {
      const lang = v.en.value === "true" ? "en" : "ko";
      const s = v[lang];
      facts.retired = drop(facts.retired);
      facts.unverified = drop(facts.unverified);
      facts.confirmed = [...drop(facts.confirmed), {
        claim: p.en, sentence: s.quote ?? "", page: lang === "en" ? "https://scribo.cc" : "https://scribo.cc/ko/",
        run: runOf(checks.find((c) => c.lang === lang)), date: at, source,
      }];
      counts.confirmed++;
    } else if (v.status === "FAIL") {
      const prior = facts.retired.find((x) => key(x.claim) === k);
      const closest = [v.ko.quote && `scribo.cc/ko closest: "${v.ko.quote}"`, v.en.quote && `scribo.cc closest: "${v.en.quote}"`].filter(Boolean).join("; ");
      facts.confirmed = drop(facts.confirmed);
      facts.unverified = drop(facts.unverified);
      facts.retired = [...drop(facts.retired), {
        claim: p.en, original: p.ko, post: postRef, evidence: `${v.reason}${closest ? ` ${closest}` : ""}`,
        run: runOf(checks.find((c) => c.lang === "en") ?? checks[0]), date: at, source, avoid_terms: prior?.avoid_terms ?? [],
      }];
      counts.retired++;
    } else {
      const known = facts.confirmed.some((x) => key(x.claim) === k) || facts.retired.some((x) => key(x.claim) === k);
      if (!known) {
        facts.unverified = [...drop(facts.unverified), { claim: p.en, original: p.ko, post: postRef, reason: v.reason, run: runOf(checks[0]), date: at, source }];
        counts.unverified++;
      }
    }
  });
  facts.updated_at = at;
  return counts;
}

// Launch-gate PASSes: every text_visible claim Kane found on the page in the passing attempt.
export function mergeCampaign(facts: ProductFacts, rec: CampaignRecord): number {
  if (rec.status !== "verified") return 0;
  const last = rec.attempts.at(-1);
  if (!last || last.overall !== "PASS") return 0;
  const date = rec.id.replace(/^c-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})Z$/, "$1T$2:$3:$4Z");
  let n = 0;
  for (const v of last.verdicts) {
    if (v.assertion.type !== "text_visible" || v.status !== "PASS") continue;
    if (facts.confirmed.some((x) => key(x.sentence) === key(v.assertion.value))) continue;
    facts.confirmed.push({
      claim: v.text, sentence: v.assertion.value, page: rec.input.app_url,
      run: { id: last.kaneRunId, recorder: last.kane.recorder, test_url: last.kane.testUrl }, date, source: `launch gate ${rec.id}`,
    });
    n++;
  }
  return n;
}

// After an audit or Re-audit: merge and save. Returns what changed, for the page.
export async function updateFromAudit(rec: AuditRecord, verdicts: AuditVerdict[], checks: KaneCheck[], source: string) {
  const facts = await loadFacts();
  const counts = mergeAudit(facts, rec, verdicts, checks, new Date().toISOString(), source);
  await saveFacts(facts);
  return { path: FACTS_PATH, ...counts, totals: { confirmed: facts.confirmed.length, retired: facts.retired.length, unverified: facts.unverified.length } };
}

// The part of memory the copywriter sees.
export function memoryForPrompt(facts: ProductFacts): string {
  return JSON.stringify({
    confirmed_facts: facts.confirmed.map((f) => ({ fact: f.claim, page_sentence: f.sentence, page: f.page })),
    retired_promises_never_use: facts.retired.map((r) => ({ promise: r.claim, old_wording: r.original })),
  }, null, 1);
}

const CHECK_SCHEMA = {
  type: "object", additionalProperties: false, required: ["retired", "unconfirmed"],
  properties: {
    retired: { type: "array", items: { type: "object", additionalProperties: false, required: ["sentence", "promise"], properties: { sentence: { type: "string" }, promise: { type: "string" } } } },
    unconfirmed: { type: "array", items: { type: "string" } },
  },
};

const CHECK_SYSTEM = `You check a draft social post against an app's product memory.
retired: every sentence of the post that promises, implies or invites people back to any retired promise (even reworded, in any language), with the retired promise it repeats.
unconfirmed: every sentence of the post that states something about the product that no confirmed fact supports.
Ignore the link. Return empty lists when the post is clean.`;

export type MemoryCheck = { retired: { sentence: string; promise: string }[]; unconfirmed: string[]; terms: string[] };

// Retired wording found in a post, case-insensitive (deterministic part of the check).
export function retiredTerms(post: string, facts: ProductFacts): string[] {
  const text = post.toLowerCase();
  return [...new Set(facts.retired.flatMap((r) => r.avoid_terms))].filter((t) => t && text.includes(t.toLowerCase()));
}

// Exact terms first (deterministic), then one model check for rewordings and unconfirmed claims.
export async function checkDraft(c: Campaign, facts: ProductFacts): Promise<MemoryCheck> {
  const terms = retiredTerms(c.post_copy, facts);
  if (!facts.retired.length && !facts.confirmed.length) return { retired: [], unconfirmed: [], terms };
  const r = await callJson<Omit<MemoryCheck, "terms">>(CHECK_SYSTEM, JSON.stringify({ post: c.post_copy.split(c.cta_url).join(""), memory: JSON.parse(memoryForPrompt(facts)) }, null, 1), CHECK_SCHEMA, "memory_check");
  return { ...r, terms };
}

// Exact wording the deterministic guard rejects, per retired promise (the model check covers rewordings).
// Narrow on purpose: a post may mention that the audience used to write words by hand, not promise it,
// and today's site still says "notebook" ("Same account, same notebook.").
const HANDWRITING_TERMS = ["handwriting vocabulary", "handwritten vocabulary", "handwriting notebook", "handwritten notebook", "손글씨 단어장", "손으로 적어서 저장"];
const REWRITE_BY_HAND_TERMS = ["write them again by hand", "writing them again by hand", "손글씨로 한번 더"];

// bun run src/memory.ts seed   → build memory/product-facts.json from the recorded audit and verified campaigns
// bun run src/memory.ts draft "<goal>" "<audience>"   → OpenAI-only draft grounded in memory, saved for replay
if (import.meta.main) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "seed") {
    const { readdir } = await import("node:fs/promises");
    const auditId = args[0] ?? "a-2026-10-24T20-46-49Z";
    const audit = (await Bun.file(`runs/${auditId}.json`).json()) as AuditRecord;
    const at = auditId.replace(/^a-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})Z$/, "$1T$2:$3:$4Z");
    const facts: ProductFacts = { product: "Scribo (scribo.cc)", updated_at: at, confirmed: [], retired: [], unverified: [] };
    // The audit's own verdicts (its Re-audit later answered one FAIL with UNVERIFIED, which never un-retires).
    const counts = mergeAudit(facts, audit, audit.verdicts, audit.checks, at, `audit ${audit.id}`);
    for (const r of facts.retired) r.avoid_terms = /again by hand/i.test(r.claim) ? REWRITE_BY_HAND_TERMS : HANDWRITING_TERMS;
    let fromGate = 0;
    for (const f of (await readdir("runs")).filter((f) => /^c-[\w-]+Z\.json$/.test(f)).sort()) {
      fromGate += mergeCampaign(facts, (await Bun.file(`runs/${f}`).json()) as CampaignRecord);
    }
    await saveFacts(facts);
    audit.memory = { path: FACTS_PATH, ...counts, totals: { confirmed: facts.confirmed.length, retired: facts.retired.length, unverified: facts.unverified.length } };
    await writeFile(`runs/${audit.id}.json`, JSON.stringify(audit, null, 2));
    console.log(`audit: ${counts.retired} retired, ${counts.confirmed} confirmed, ${counts.unverified} unverified; launch gate: ${fromGate} confirmed`);
    console.log(`total: ${facts.confirmed.length} confirmed, ${facts.retired.length} retired, ${facts.unverified.length} unverified -> ${FACTS_PATH}`);
  } else if (cmd === "draft") {
    const { draftOnly } = await import("./loop");
    const rec = await draftOnly({ app_url: "https://scribo.cc", goal: args[0], audience: args[1] ?? "Korean learners of English" });
    console.log(JSON.stringify({ id: rec.id, post: rec.draft.post_copy, claims: rec.draft.claims.map((c) => [c.assertion.type, c.assertion.value, c.text]), memory: rec.memory }, null, 2));
  }
}

export function checkError(m: MemoryCheck): string | null {
  const parts = [
    m.terms.length ? `it uses retired wording (${m.terms.join(", ")})` : "",
    m.retired.length ? `it repeats retired promises: ${m.retired.map((x) => `"${x.sentence}" repeats "${x.promise}"`).join("; ")}` : "",
    m.unconfirmed.length ? `these sentences state things no confirmed fact supports: ${m.unconfirmed.map((s) => JSON.stringify(s)).join(", ")}` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(". ") : null;
}
