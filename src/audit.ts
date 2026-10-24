// Audit past posts: old posts keep promising a product that has since changed.
// The agent pulls each product promise out of @scribo.voca's posts (Korean original + English gloss);
// Kane reads today's site (scribo.cc/ko/ and scribo.cc) and stores, per promise, whether the page
// still makes it and the sentence that does. The code judges: either page says it = PASS, both say
// no = FAIL, anything missing = UNVERIFIED. For each FAIL the agent proposes one action. Nothing is
// edited, deleted or published on Threads.
//
// Same store-a-boolean pattern as text_visible (claims.ts): scroll once, then store true/false per item.

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { homedir } from "node:os";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { callJson, MODEL } from "./agent";
import { replayTest, runKane, type KaneEvent, type KaneResult, type KaneRun } from "./kane";
import { logRun } from "./runlog";
import { updateFromAudit } from "./memory";

export type AuditPost = { id: string; text: string; timestamp: string; permalink: string };
export type Promise_ = { post_id: string; ko: string; en: string };
export type SiteCheck = { value: string | null; quote: string | null; step: number | null };
export type AuditVerdict = { status: "PASS" | "FAIL" | "UNVERIFIED"; reason: string; ko: SiteCheck; en: SiteCheck };
export type Proposal = { post_id: string; action: "rewrite" | "archive"; text_ko: string; gloss_en: string; reason: string };

export const SITES = { ko: "https://scribo.cc/ko/", en: "https://scribo.cc" } as const;
type Lang = keyof typeof SITES;

export type KaneCheck = {
  lang: Lang; url: string; kaneRunId: string; objective: string; test: string | null;
  kane: { status: string | null; exitCode: number; summary: string | null; credits: number | null; testUrl: string | null; recorder: string | null };
  steps: { step: number; remark: string }[];
};

export type MemoryUpdate = Awaited<ReturnType<typeof updateFromAudit>>;
export type Reaudit = { k: number; at: string; checks: KaneCheck[]; verdicts: AuditVerdict[]; memory?: MemoryUpdate };

export type AuditRecord = {
  id: string;
  kind: "audit";
  model: string;
  account: string;
  posts_source: string;
  posts: AuditPost[];
  promises: Promise_[];
  checks: KaneCheck[];
  verdicts: AuditVerdict[]; // same order as promises
  proposals: Proposal[];
  reaudits: Reaudit[];
  memory?: MemoryUpdate; // what this audit (or its latest Re-audit) wrote to memory/product-facts.json
  status: "running" | "done";
  error?: string;
};

const POSTS_FIXTURE = "fixtures/scribo-posts.json";

export async function loadPosts(): Promise<{ source: string; posts: AuditPost[] }> {
  const j = await Bun.file(POSTS_FIXTURE).json();
  return Array.isArray(j) ? { source: "threads-api", posts: j } : { source: j.source ?? "fixture", posts: j.posts };
}

// The account's own posts through the Threads API, read-only. Runs the operator's script; its token
// files are never read or printed here. /usr/bin/python3: the framework python fails SSL.
export async function fetchPostsFromApi(): Promise<AuditPost[]> {
  const proc = Bun.spawn(["/usr/bin/python3", `${homedir()}/.hermes/scripts/threads_api.py`, "--profile", "scribo", "my-posts", "--count", "100"], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) throw new Error("threads_api.py my-posts failed");
  const j = JSON.parse(out);
  const posts: AuditPost[] = (Array.isArray(j) ? j : j.posts ?? j.data).map((p: any) => ({ id: String(p.id), text: String(p.text ?? ""), timestamp: String(p.timestamp ?? ""), permalink: String(p.permalink ?? "") }));
  await writeFile(POSTS_FIXTURE, JSON.stringify(posts, null, 2));
  return posts;
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

const EXTRACT_SCHEMA = {
  type: "object", additionalProperties: false, required: ["promises"],
  properties: {
    promises: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["post_id", "ko", "en"],
        properties: { post_id: { type: "string" }, ko: { type: "string" }, en: { type: "string" } },
      },
    },
  },
};

const EXTRACT_SYSTEM = `You audit an app's old social posts. You get the account's posts (Korean).
Pick only the posts that make a promise about what the product is or does (a feature, what kind of app it is). Skip posts that only ask questions, share feelings or tips.
For each such post, list each distinct product promise:
- ko: the words of the post that make the promise, copied exactly from the post text (one line or part of a line).
- en: a short English statement of the promise about the product, as a fact that a product website could confirm or not, e.g. "Scribo is a vocabulary notebook where you save words by writing them by hand".
At most three promises per post. Do not invent promises the post does not make.`;

export async function extractPromises(posts: AuditPost[]): Promise<Promise_[]> {
  const user = JSON.stringify(posts.map((p) => ({ post_id: p.id, date: p.timestamp, text: p.text })), null, 1);
  let lastError = "";
  for (let i = 0; i < 2; i++) {
    const r = await callJson<{ promises: Promise_[] }>(EXTRACT_SYSTEM, lastError ? `${user}\n\nYour previous answer was rejected: ${lastError}` : user, EXTRACT_SCHEMA, "promises");
    try {
      for (const p of r.promises) {
        const post = posts.find((x) => x.id === p.post_id);
        if (!post) throw new Error(`Unknown post_id ${p.post_id}`);
        if (!norm(post.text).includes(norm(p.ko))) throw new Error(`"${p.ko}" is not copied exactly from post ${p.post_id}`);
        if (!p.en.trim() || /["{}]/.test(p.en)) throw new Error(`en for "${p.ko}" must be non-empty, with no double quotes or braces`);
      }
      if (!r.promises.length) throw new Error("No promises found");
      return r.promises;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Promise extraction rejected twice: ${lastError}`);
}

// All promises → one objective per site. Kane decides per promise whether the page says the product
// does this today, and stores the sentence it relied on.
export function compileAudit(promises: Promise_[], lang: Lang): string {
  const page = lang === "ko" ? "This page is in Korean; judge its meaning, not exact words." : "";
  return `Scroll down through the whole page once, to the bottom. ${page} ` +
    "Then, for each statement below about the product, decide whether this page says the product does this today, and store the answer, true or false, without searching further or leaving the page: " +
    promises.map((p, i) => `store whether the page says that ${p.en.trim().replace(/[.!?]$/, "")} as 'claim_${i + 1}'`).join("; ") + ". " +
    "Then, for each statement, store the one sentence on the page closest to it, copied exactly, or none, as " +
    promises.map((_, i) => `'quote_${i + 1}'`).join(", ") + ".";
}

function siteCheck(kane: KaneResult | null, n: number): SiteCheck {
  if (!kane) return { value: null, quote: null, step: null };
  // A replayed test can answer the same question in words ("Yes", "No"); anything else is not an answer.
  const raw = (kane.memory[`claim_${n}`]?.value ?? kane.finalState[`claim_${n}`] ?? "").trim().toLowerCase();
  const v = raw === "yes" ? "true" : raw === "no" ? "false" : raw;
  const q = (kane.memory[`quote_${n}`]?.value ?? kane.finalState[`quote_${n}`] ?? "").trim();
  return { value: v === "true" || v === "false" ? v : null, quote: q && q.toLowerCase() !== "none" ? q : null, step: kane.memory[`claim_${n}`]?.step ?? null };
}

export function evaluateAudit(promises: Promise_[], ko: KaneResult | null, en: KaneResult | null): AuditVerdict[] {
  return promises.map((p, i) => {
    const k = siteCheck(ko?.completed ? ko : null, i + 1);
    const e = siteCheck(en?.completed ? en : null, i + 1);
    if (k.value === "true" || e.value === "true") {
      const where = [k.value === "true" ? "scribo.cc/ko" : "", e.value === "true" ? "scribo.cc" : ""].filter(Boolean).join(" and ");
      return { status: "PASS", reason: `Kane: ${where} still says this today.`, ko: k, en: e };
    }
    if (k.value === "false" && e.value === "false") {
      return { status: "FAIL", reason: "Kane read scribo.cc/ko and scribo.cc: neither says this any more.", ko: k, en: e };
    }
    return { status: "UNVERIFIED", reason: "Kane did not report a true/false for this on both pages.", ko: k, en: e };
  });
}

const PROPOSAL_SCHEMA = {
  type: "object", additionalProperties: false, required: ["proposals"],
  properties: {
    proposals: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["post_id", "action", "text_ko", "gloss_en", "reason"],
        properties: {
          post_id: { type: "string" }, action: { type: "string", enum: ["rewrite", "archive"] },
          text_ko: { type: "string" }, gloss_en: { type: "string" }, reason: { type: "string" },
        },
      },
    },
  },
};

const PROPOSAL_SYSTEM = `Old social posts by an app make promises the product no longer makes; Kane checked them against today's website.
For each post with a failing promise, propose exactly one action:
- rewrite: a replacement post in Korean, in the same casual voice and about the same length, that promises only what today's site text says (text_ko), plus an English gloss (gloss_en).
- archive: when the post is about the old product and cannot be saved by a rewrite; text_ko and gloss_en are "".
reason: one line citing what Kane found.
Never state a price, number or feature the site text does not show. Nothing is posted; this is a proposal for a human.`;

export async function proposeActions(posts: AuditPost[], promises: Promise_[], verdicts: AuditVerdict[], siteText: string): Promise<Proposal[]> {
  const failing = posts.map((p) => ({
    post_id: p.id, text: p.text,
    failed: promises.flatMap((x, i) => (x.post_id === p.id && verdicts[i].status === "FAIL" ? [{ ko: x.ko, en: x.en }] : [])),
    still_true: promises.flatMap((x, i) => (x.post_id === p.id && verdicts[i].status === "PASS" ? [{ ko: x.ko, en: x.en, quote: verdicts[i].ko.quote ?? verdicts[i].en.quote }] : [])),
  })).filter((p) => p.failed.length);
  if (!failing.length) return [];
  const r = await callJson<{ proposals: Proposal[] }>(PROPOSAL_SYSTEM, JSON.stringify({ posts: failing, todays_site_text: siteText }, null, 1), PROPOSAL_SCHEMA, "proposals");
  const ids = new Set(failing.map((p) => p.post_id));
  return r.proposals.filter((p) => ids.has(p.post_id));
}

export async function siteText(): Promise<string> {
  const strip = (h: string) => h.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  const ko = strip(await (await fetch(SITES.ko)).text()).slice(0, 5000);
  const en = strip(await (await fetch(SITES.en)).text()).slice(0, 3000);
  return `scribo.cc/ko:\n${ko}\n\nscribo.cc:\n${en}`;
}

type Emit = (event: string, data: unknown) => void;
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d+Z$/, "Z");

async function save(rec: AuditRecord) {
  await mkdir("runs", { recursive: true });
  await writeFile(`runs/${rec.id}.json`, JSON.stringify(rec, null, 2));
}

function toCheck(lang: Lang, kaneRunId: string, run: KaneRun, test: string | null): KaneCheck {
  const r = run.result;
  return {
    lang, url: SITES[lang], kaneRunId, objective: run.objective, test,
    kane: { status: r.status, exitCode: run.exitCode, summary: r.summary, credits: r.credits, testUrl: r.testUrl, recorder: [run.recorder.runId, run.recorder.verdict].filter(Boolean).join(" ") || null },
    steps: r.steps.map((s) => ({ step: s.step, remark: s.remark })),
  };
}

// RUNS.md line for one site's read: FAIL when this page no longer makes some past promise.
function siteLog(promises: Promise_[], lang: Lang, kane: KaneResult, prefix = ""): { status: AuditVerdict["status"]; reason: string } {
  const vals = promises.map((_, i) => siteCheck(kane.completed ? kane : null, i + 1).value);
  const no = vals.flatMap((v, i) => (v === "false" ? [i + 1] : []));
  const missing = vals.filter((v) => v == null).length;
  const status = missing ? "UNVERIFIED" : no.length ? "FAIL" : "PASS";
  return { status, reason: `${prefix}${SITES[lang]} no longer says ${no.length} of ${promises.length} past promises (#${no.join(", #") || "none"})${missing ? `; ${missing} not reported` : ""}.` };
}

export async function runAudit(emit: Emit): Promise<AuditRecord> {
  const { source, posts } = await loadPosts();
  const promises = await extractPromises(posts);
  const rec: AuditRecord = {
    id: `a-${stamp()}`, kind: "audit", model: MODEL, account: "@scribo.voca", posts_source: source, posts, promises,
    checks: [], verdicts: [], proposals: [], reaudits: [], status: "running",
  };
  await save(rec);
  emit("promises", { id: rec.id, posts, promises, source });

  try {
    const results: Partial<Record<Lang, KaneResult>> = {};
    for (const lang of ["ko", "en"] as Lang[]) {
      const kaneRunId = `${rec.id}-${lang}`;
      const objective = compileAudit(promises, lang);
      emit("kane_start", { lang, url: SITES[lang], objective, kaneRunId });
      const run = await runKane({ objective, url: SITES[lang], name: kaneRunId, timeoutSec: 300, onEvent: (ev: KaneEvent) => ev.kind === "step" && emit("kane", { lang, ev }) });
      results[lang] = run.result;
      const test = `.testmuai/tests/${kaneRunId}_test.md`;
      const check = toCheck(lang, kaneRunId, run, (await Bun.file(test).exists()) ? test : null);
      await logRun(kaneRunId, run, siteLog(promises, lang, run.result));
      rec.checks.push(check);
      await save(rec);
      emit("kane_end", check);
    }
    rec.verdicts = evaluateAudit(promises, results.ko ?? null, results.en ?? null);
    // Kane is done: what it confirmed and retired becomes the drafting agent's memory.
    rec.memory = await updateFromAudit(rec, rec.verdicts, rec.checks, `audit ${rec.id}`);
    await save(rec);
    emit("verdicts", { verdicts: rec.verdicts });
    rec.proposals = await proposeActions(posts, promises, rec.verdicts, await siteText());
  } catch (err) {
    rec.error = err instanceof Error ? err.message : String(err);
  }
  rec.status = "done";
  await save(rec);
  emit("result", rec);
  return rec;
}

// Re-audit after the next release: replay Kane's recorded tests (no new authoring) and judge again.
export async function reaudit(id: string, emit: Emit): Promise<Reaudit> {
  const rec = (await Bun.file(`runs/${id}.json`).json()) as AuditRecord;
  const tests = rec.checks.filter((c) => c.test);
  if (!tests.length) throw new Error("This audit has no recorded Kane tests to replay");
  const k = rec.reaudits.length + 1;
  const results: Partial<Record<Lang, KaneResult>> = {};
  const checks: KaneCheck[] = [];
  for (const c of tests) {
    const kaneRunId = `${rec.id}-ra${k}-${c.lang}`;
    emit("kane_start", { lang: c.lang, url: c.url, objective: `testmd run ${c.test}`, kaneRunId });
    const run = await replayTest({ path: c.test!, url: c.url, onEvent: (ev: KaneEvent) => ev.kind === "step" && emit("kane", { lang: c.lang, ev }) });
    results[c.lang] = run.result;
    await logRun(kaneRunId, run, siteLog(rec.promises, c.lang, run.result, `Re-audit replay of ${c.test}. `));
    const check = toCheck(c.lang, kaneRunId, run, c.test);
    checks.push(check);
    emit("kane_end", check);
  }
  const ra: Reaudit = { k, at: new Date().toISOString(), checks, verdicts: evaluateAudit(rec.promises, results.ko ?? null, results.en ?? null) };
  ra.memory = await updateFromAudit(rec, ra.verdicts, checks, `re-audit ${k} of ${rec.id}`);
  rec.memory = ra.memory;
  rec.reaudits.push(ra);
  await save(rec);
  emit("reaudit", ra);
  return ra;
}

export const auditRoutes = new Hono();
let busy = false; // one Kane job at a time

function sse(c: any, job: (emit: Emit) => Promise<unknown>) {
  if (busy) return c.json({ error: "An audit is already running" }, 409);
  busy = true;
  return streamSSE(c, async (stream) => {
    let pending = Promise.resolve();
    const emit: Emit = (event, data) => { pending = pending.then(() => stream.writeSSE({ event, data: JSON.stringify(data) })); };
    try {
      await job(emit);
    } catch (err) {
      emit("error", { message: err instanceof Error ? err.message : String(err) });
    } finally {
      await pending;
      busy = false;
    }
  });
}

auditRoutes.get("/api/audit/posts", async (c) => {
  if (c.req.query("refresh") === "1") {
    try {
      return c.json({ source: "threads-api", posts: await fetchPostsFromApi() });
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : String(err) }, 502);
    }
  }
  return c.json(await loadPosts());
});

auditRoutes.post("/api/audit/run", (c) => sse(c, runAudit));

auditRoutes.get("/api/audit", async (c) => {
  const files = (await readdir("runs").catch(() => [])).filter((f) => /^a-[\w-]+Z\.json$/.test(f)).sort().reverse();
  const recs = await Promise.all(files.map((f) => Bun.file(`runs/${f}`).json() as Promise<AuditRecord>));
  return c.json(recs.map((r) => ({
    id: r.id, status: r.status, posts: r.posts.length, promises: r.promises.length,
    fail: r.verdicts.filter((v) => v.status === "FAIL").length, pass: r.verdicts.filter((v) => v.status === "PASS").length, reaudits: r.reaudits.length,
  })));
});

auditRoutes.get("/api/audit/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^a-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.json({ error: "not found" }, 404);
  return c.json(await f.json());
});

auditRoutes.post("/api/audit/:id/reaudit", (c) => {
  const id = c.req.param("id");
  if (!/^a-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  return sse(c, (emit) => reaudit(id, emit));
});
