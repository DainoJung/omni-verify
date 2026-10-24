// Feature-claim flow: draft → one Kane run per claim → (repair the failing claims → Kane on the new ones)*
// → Verified for launch | Needs a human. Records go to runs/f-<time>.json; each Kane run is logged in RUNS.md.

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import {
  claimKey, compileFeatureClaim, draftFeaturePost, evaluateFeatureClaim, fetchToolText, MODEL, repairFeaturePost,
  type FeatureClaim, type FeatureInput, type FeaturePost, type FeatureRepair, type FeatureVerdict,
} from "./features";
import { runKane, type KaneEvent } from "./kane";
import { logRun } from "./runlog";

export const MAX_ATTEMPTS = 3;

export type FeatureCheck = {
  claim: FeatureClaim;
  objective: string;
  kaneRunId: string;
  kane: { status: string | null; exitCode: number; summary: string | null; credits: number | null; testUrl: string | null; evidencePath: string | null; recorder: string | null };
  steps: { step: number; remark: string }[];
  verdict: FeatureVerdict;
};

export type FeatureAttempt = {
  n: number;
  post: FeaturePost;
  checks: FeatureCheck[]; // Kane runs made in this attempt
  carried: string[]; // claim texts whose PASS carried over unchanged from an earlier attempt
  overall: FeatureVerdict["status"];
  repair?: FeatureRepair;
};

export type FeatureRecord = {
  id: string;
  kind: "feature_claims";
  model: string;
  input: FeatureInput;
  draft: FeaturePost;
  attempts: FeatureAttempt[];
  status: "running" | "verified" | "needs_human";
  final?: FeaturePost;
  error?: string; // why the loop stopped early, e.g. a repair the validator rejected twice
};

type Emit = (event: string, data: unknown) => void;

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d+Z$/, "Z");

async function save(rec: FeatureRecord) {
  await mkdir("runs", { recursive: true });
  await writeFile(`runs/${rec.id}.json`, JSON.stringify(rec, null, 2));
}

export async function runFeatureClaims(input: FeatureInput, emit: Emit): Promise<FeatureRecord> {
  const text = await fetchToolText(input.tool_url);
  const draft = await draftFeaturePost(input, text);
  const rec: FeatureRecord = { id: `f-${stamp()}`, kind: "feature_claims", model: MODEL, input, draft, attempts: [], status: "running" };
  await save(rec);
  emit("draft", { id: rec.id, model: MODEL, input, post: draft });
  try {
    await loop(rec, input, text, emit);
  } catch (err) {
    rec.status = "needs_human";
    rec.error = err instanceof Error ? err.message : String(err);
    await save(rec);
    throw err;
  }
  return rec;
}

async function loop(rec: FeatureRecord, input: FeatureInput, text: string, emit: Emit) {

  const passed = new Map<string, FeatureCheck>(); // claimKey → the check that passed it
  let post = rec.draft;
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const todo = post.claims.filter((c) => !passed.has(claimKey(c)));
    const carried = post.claims.filter((c) => passed.has(claimKey(c))).map((c) => c.text);
    const attempt: FeatureAttempt = { n, post, checks: [], carried, overall: "UNVERIFIED" };
    rec.attempts.push(attempt);
    emit("attempt_start", { n, carried, claims: todo.length });

    for (const [i, claim] of todo.entries()) {
      const objective = compileFeatureClaim(claim);
      const kaneRunId = `${rec.id}-a${n}-c${i + 1}`;
      emit("check_start", { n, i, claim, objective, url: input.tool_url });
      const run = await runKane({
        objective, url: input.tool_url, timeoutSec: 240,
        onEvent: (ev: KaneEvent) => ev.kind === "step" && emit("kane", { n, i, ev }),
      });
      const verdict = evaluateFeatureClaim(claim, run.result);
      await logRun(kaneRunId, run, verdict);
      const r = run.result;
      const check: FeatureCheck = {
        claim, objective, kaneRunId, verdict,
        steps: r.steps.map((s) => ({ step: s.step, remark: s.remark })),
        kane: {
          status: r.status, exitCode: run.exitCode, summary: r.summary, credits: r.credits, testUrl: r.testUrl,
          evidencePath: r.evidencePath, recorder: [run.recorder.runId, run.recorder.verdict].filter(Boolean).join(" ") || null,
        },
      };
      attempt.checks.push(check);
      if (verdict.status === "PASS") passed.set(claimKey(claim), check);
      await save(rec);
      emit("check_end", { n, i, ...check });
    }

    const failing = attempt.checks.filter((c) => c.verdict.status !== "PASS");
    attempt.overall = failing.some((c) => c.verdict.status === "FAIL") ? "FAIL" : failing.length ? "UNVERIFIED" : "PASS";
    await save(rec);
    emit("attempt_end", { n, overall: attempt.overall });

    if (attempt.overall === "PASS") {
      rec.status = "verified";
      rec.final = post;
      break;
    }
    if (n === MAX_ATTEMPTS) break;
    // Only a FAIL is evidence the copy is wrong; an UNVERIFIED claim runs again unchanged.
    const failed = failing.filter((c) => c.verdict.status === "FAIL");
    if (!failed.length) continue;

    const repair = await repairFeaturePost(post, input.tool_url, failed.map((c) => ({
      claim: c.claim, verdict: c.verdict, kaneSummary: c.kane.summary, kaneSteps: c.steps.map((s) => s.remark),
    })), text);
    attempt.repair = repair;
    await save(rec);
    emit("repair", { n, action: repair.action, reason: repair.reason, before: post, after: repair.post });
    post = repair.post;
  }

  if (rec.status !== "verified") rec.status = "needs_human";
  await save(rec);
  emit("result", { ...rec, verdicts: verdictsFor(rec) });
}

// The latest Kane check for each claim of the record's final (or last) post.
export function verdictsFor(rec: FeatureRecord): FeatureCheck[] {
  const post = rec.final ?? rec.attempts.at(-1)?.post ?? rec.draft;
  const all = rec.attempts.flatMap((a) => a.checks);
  return post.claims.map((c) => all.filter((x) => claimKey(x.claim) === claimKey(c)).at(-1)).filter((x): x is FeatureCheck => !!x);
}

export const featureRoutes = new Hono();
let busy = false; // one run at a time: Kane drives one browser

featureRoutes.post("/api/features/run", async (c) => {
  const body = await c.req.json<Partial<FeatureInput>>();
  if (!body.tool_url || !body.channel) return c.json({ error: "tool_url and channel are required" }, 400);
  if (busy) return c.json({ error: "A feature check is already in progress" }, 409);
  const input: FeatureInput = { tool_url: body.tool_url, channel: body.channel, stretch: body.stretch === true };

  busy = true;
  return streamSSE(c, async (stream) => {
    // Writes are chained so the last event is flushed before the stream closes.
    let pending = Promise.resolve();
    const emit = (event: string, data: unknown) => {
      pending = pending.then(() => stream.writeSSE({ event, data: JSON.stringify(data) }));
    };
    try {
      await runFeatureClaims(input, emit);
    } catch (err) {
      emit("error", { message: err instanceof Error ? err.message : String(err) });
    } finally {
      await pending;
      busy = false;
    }
  });
});

// Recorded feature-claim runs (runs/f-<time>.json), newest first.
featureRoutes.get("/api/features", async (c) => {
  const files = (await readdir("runs").catch(() => [])).filter((f) => /^f-[\w-]+Z\.json$/.test(f)).sort().reverse();
  const recs = await Promise.all(files.map((f) => Bun.file(`runs/${f}`).json() as Promise<FeatureRecord>));
  return c.json(recs.filter((r) => r.attempts?.length).map((r) => ({
    id: r.id, status: r.status, tool: r.draft.tool_name, kane_runs: r.attempts.reduce((s, a) => s + a.checks.length, 0),
  })));
});

featureRoutes.get("/api/features/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^f-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.json({ error: "not found" }, 404);
  const rec = (await f.json()) as FeatureRecord;
  return c.json({ ...rec, verdicts: verdictsFor(rec) });
});
