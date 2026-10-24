// Proof of every real Kane run, kept in the repo.
// The kanehack recorder marks rc.3 runs ERRORED (ticket H-0007), so RUNS.md is our own record.

import { appendFile, exists, mkdir, writeFile } from "node:fs/promises";
import type { KaneRun } from "./kane";
import type { Verdict } from "./claims";

const RUNS_MD = "RUNS.md";
const HEADER = `# Kane run log

Every real Kane run, appended by the server as it finishes. The kanehack recorder currently marks
kane-cli 0.10.0-rc.3 runs as ERRORED even when Kane passed (help ticket H-0007), so the Kane status
column comes from Kane's own \`run_end\` event.

| Time (UTC) | kanehack | Kane status | Exit | Omni verdict | Credits | Start URL | Evidence |
|---|---|---|---|---|---|---|---|
`;

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

export async function logRun(id: string, run: KaneRun, verdict: Verdict | null) {
  await mkdir("runs", { recursive: true });
  await writeFile(`runs/${id}.ndjson`, run.ndjson);
  await writeFile(`runs/${id}.json`, JSON.stringify({ id, ...run, ndjson: `runs/${id}.ndjson`, verdict }, null, 2));

  if (!(await exists(RUNS_MD))) await writeFile(RUNS_MD, HEADER);
  const r = run.result;
  const row = [
    run.endedAt.replace(/\.\d+Z$/, "Z"),
    `${run.recorder.runId ?? "?"} ${run.recorder.verdict ?? ""}`.trim(),
    r.status ?? "no run_end",
    String(run.exitCode),
    verdict ? `${verdict.status}: ${verdict.reason}` : "-",
    r.credits != null ? r.credits.toFixed(1) : "?",
    run.url,
    [r.testUrl ? `[LambdaTest](${r.testUrl})` : "", `[run](runs/${id}.json)`].filter(Boolean).join(" · "),
  ].map(cell);
  await appendFile(RUNS_MD, `| ${row.join(" | ")} |\n`);
}
