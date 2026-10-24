// Kane CLI runner and NDJSON parser.
// Schema was learned from a real run (fixtures/kane-sample.ndjson, kane-cli 0.10.0-rc.3):
//   stream_start → recording_state → bifurcation → step lines (no `type`) → coverage → run_end
// The verdict lives in run_end; step lines only drive the live timeline.

import { homedir } from "node:os";

export type KaneEvent =
  | { kind: "start"; cliVersion: string }
  | { kind: "plan"; flows: string[] }
  | { kind: "step"; step: number; status: string; remark: string; ts: string }
  | { kind: "coverage"; status: string; reason: string | null; pack: string | null }
  | { kind: "end"; raw: Record<string, any> }
  | { kind: "other"; type: string };

export type KaneMemory = {
  value: string;
  step: number | null;
  operator: string | null;
  expected: string | null;
  reasoning: string | null;
};

export type KaneResult = {
  completed: boolean; // saw run_end
  status: string | null; // run_end.status: "passed" | "failed" | ...
  resultCode: number | null;
  reasonCode: string | null;
  summary: string | null;
  oneLiner: string | null;
  reason: string | null;
  finalState: Record<string, string>;
  memory: Record<string, KaneMemory>;
  credits: number | null;
  durationSec: number | null;
  testUrl: string | null;
  evidencePath: string | null;
  steps: { step: number; status: string; remark: string; ts: string }[];
};

export function parseLine(line: string): KaneEvent | null {
  const s = line.trim();
  if (!s.startsWith("{")) return null;
  let ev: any;
  try {
    ev = JSON.parse(s);
  } catch {
    return null;
  }
  if (typeof ev.type !== "string") {
    // Step lines carry no `type` field.
    if (typeof ev.step === "number") {
      return { kind: "step", step: ev.step, status: String(ev.status ?? ""), remark: String(ev.remark ?? ""), ts: String(ev.ts ?? "") };
    }
    return null;
  }
  switch (ev.type) {
    case "stream_start":
      return { kind: "start", cliVersion: String(ev.cli_version ?? "") };
    case "bifurcation":
      return { kind: "plan", flows: Array.isArray(ev.flows) ? ev.flows.map(String) : [] };
    case "coverage":
      return { kind: "coverage", status: String(ev.status ?? ""), reason: ev.reason ?? null, pack: ev.pack ?? null };
    case "run_end":
      return { kind: "end", raw: ev };
    default:
      return { kind: "other", type: ev.type };
  }
}

export function emptyResult(): KaneResult {
  return {
    completed: false, status: null, resultCode: null, reasonCode: null, summary: null, oneLiner: null,
    reason: null, finalState: {}, memory: {}, credits: null, durationSec: null, testUrl: null,
    evidencePath: null, steps: [],
  };
}

export function applyEvent(r: KaneResult, ev: KaneEvent): KaneResult {
  if (ev.kind === "step") {
    // Each step arrives as "running" then "done"; keep the latest status per step.
    const i = r.steps.findIndex((s) => s.step === ev.step);
    const row = { step: ev.step, status: ev.status, remark: ev.remark, ts: ev.ts };
    if (i >= 0) r.steps[i] = row;
    else r.steps.push(row);
  } else if (ev.kind === "coverage") {
    r.evidencePath ??= ev.pack;
  } else if (ev.kind === "end") {
    const e = ev.raw;
    r.completed = true;
    r.status = e.status ?? null;
    r.resultCode = e.result_code ?? null;
    r.reasonCode = e.reason_code ?? null;
    r.summary = e.summary ?? null;
    r.oneLiner = e.one_liner ?? null;
    r.reason = e.reason ?? null;
    r.finalState = Object.fromEntries(Object.entries(e.final_state ?? {}).map(([k, v]) => [k, String(v)]));
    r.memory = Object.fromEntries(
      Object.entries(e.context?.memory ?? {}).map(([k, m]: [string, any]) => [
        k,
        {
          value: String(m?.extracted_value ?? ""),
          step: typeof m?.step === "number" ? m.step : null,
          operator: m?.operator ?? null,
          expected: m?.expected_value || null,
          reasoning: m?.reasoning ?? null,
        },
      ]),
    );
    r.credits = typeof e.credits_consumed === "number" ? e.credits_consumed : null;
    r.durationSec = typeof e.duration === "number" ? e.duration : null;
    r.testUrl = e.test_url ?? null;
  }
  return r;
}

export function parseNdjson(text: string): KaneResult {
  let r = emptyResult();
  for (const line of text.split(/\r?\n/)) {
    const ev = parseLine(line);
    if (ev) r = applyEvent(r, ev);
  }
  return r;
}

// The repo is public: never write the local username into saved files.
export function redact(s: string): string {
  return s.split(homedir()).join("~");
}

export function expandHome(p: string): string {
  return p.startsWith("~/") ? homedir() + p.slice(1) : p;
}

export type KaneRun = {
  objective: string;
  url: string;
  startedAt: string;
  endedAt: string;
  exitCode: number;
  result: KaneResult;
  ndjson: string; // raw stdout, redacted
  recorder: { runId: string | null; verdict: string | null; proofUrl: string | null };
};

// kanehack prints e.g. "Kane run KR-5: ERRORED (UNVERIFIED). Details: ..." and "→ Open Proof tab: https://..."
export function parseRecorder(stderr: string): KaneRun["recorder"] {
  const m = /Kane run (KR-\d+):\s*([^.]+)\./.exec(stderr);
  const p = /Open Proof tab:\s*(\S+)/.exec(stderr);
  return { runId: m?.[1] ?? null, verdict: m?.[2]?.trim() ?? null, proofUrl: p?.[1] ?? null };
}

// Every Kane run goes through the kanehack event recorder. Never call kane-cli directly.
export async function runKane(opts: {
  objective: string;
  url: string;
  timeoutSec?: number;
  onEvent?: (ev: KaneEvent) => void;
}): Promise<KaneRun> {
  const startedAt = new Date().toISOString();
  const proc = Bun.spawn(
    [
      "kanehack", "report", "--",
      "kane-cli", "run", opts.objective, "--url", opts.url, "--agent", "--headless",
      "--timeout", String(opts.timeoutSec ?? 300),
    ],
    { stdout: "pipe", stderr: "pipe" },
  );

  let result = emptyResult();
  let raw = "";
  let buf = "";
  const decoder = new TextDecoder();
  const handle = (line: string) => {
    if (!line.trim()) return;
    raw += line + "\n";
    const ev = parseLine(line);
    if (!ev) return;
    if (ev.kind === "coverage" && ev.pack) ev.pack = redact(ev.pack);
    result = applyEvent(result, ev);
    opts.onEvent?.(ev);
  };

  const stderrP = new Response(proc.stderr).text();
  for await (const chunk of proc.stdout) {
    buf += decoder.decode(chunk, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      handle(buf.slice(0, nl));
      buf = buf.slice(nl + 1);
    }
  }
  handle(buf);
  const exitCode = await proc.exited;
  const stderr = await stderrP;

  if (result.evidencePath) result.evidencePath = redact(result.evidencePath);
  return {
    objective: opts.objective,
    url: opts.url,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode,
    result,
    ndjson: redact(raw),
    recorder: parseRecorder(stderr),
  };
}
