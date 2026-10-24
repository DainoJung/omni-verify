// The main flow: draft → compile → Kane → (repair → Kane)* → Verified for launch | Needs a human.

import { mkdir, writeFile } from "node:fs/promises";
import { draftCampaign, MODEL, repairCampaign, type Campaign, type DraftInput, type Repair } from "./agent";
import { compileCampaign, evaluateCampaign, overall, type ClaimVerdict } from "./claims";
import { runKane, type KaneEvent } from "./kane";
import { logRun } from "./runlog";

export const MAX_ATTEMPTS = 3;

export type Attempt = {
  n: number;
  campaign: Campaign;
  compiled: { url: string; objective: string };
  kaneRunId: string;
  kane: { status: string | null; exitCode: number; summary: string | null; credits: number | null; testUrl: string | null; evidencePath: string | null; recorder: string | null };
  verdicts: ClaimVerdict[];
  overall: ClaimVerdict["status"];
  repair?: Repair;
};

export type CampaignRecord = {
  id: string;
  model: string;
  input: DraftInput;
  draft: Campaign;
  attempts: Attempt[];
  status: "running" | "verified" | "needs_human";
  final?: Campaign;
};

export type Emit = (event: string, data: unknown) => void;

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d+Z$/, "Z");

async function save(rec: CampaignRecord) {
  await mkdir("runs", { recursive: true });
  await writeFile(`runs/${rec.id}.json`, JSON.stringify(rec, null, 2));
}

export async function runCampaign(input: DraftInput, emit: Emit): Promise<CampaignRecord> {
  const draft = await draftCampaign(input);
  const rec: CampaignRecord = { id: `c-${stamp()}`, model: MODEL, input, draft, attempts: [], status: "running" };
  await save(rec);
  emit("draft", { id: rec.id, model: MODEL, campaign: draft });

  let campaign = draft;
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const compiled = compileCampaign(campaign);
    emit("attempt_start", { n, ...compiled });

    const run = await runKane({ ...compiled, onEvent: (ev: KaneEvent) => ev.kind !== "end" && emit("kane", { n, ev }) });
    const verdicts = evaluateCampaign(campaign, run.result);
    const status = overall(verdicts);
    const kaneRunId = `${rec.id}-a${n}`;
    await logRun(kaneRunId, run, { status, reason: verdicts.map((v) => v.reason).join(" ") });

    const r = run.result;
    const attempt: Attempt = {
      n, campaign, compiled, kaneRunId, verdicts, overall: status,
      kane: {
        status: r.status, exitCode: run.exitCode, summary: r.summary, credits: r.credits, testUrl: r.testUrl,
        evidencePath: r.evidencePath, recorder: [run.recorder.runId, run.recorder.verdict].filter(Boolean).join(" ") || null,
      },
    };
    rec.attempts.push(attempt);
    await save(rec);
    emit("attempt_end", attempt);

    if (status === "PASS") {
      rec.status = "verified";
      rec.final = campaign;
      break;
    }
    if (n === MAX_ATTEMPTS) break;

    const failing = verdicts.filter((v) => v.status !== "PASS");
    const repair = await repairCampaign(campaign, failing, r);
    attempt.repair = repair;
    await save(rec);
    emit("repair", { n, action: repair.action, reason: repair.reason, before: campaign, after: repair.campaign });
    campaign = repair.campaign;
  }

  if (rec.status !== "verified") rec.status = "needs_human";
  await save(rec);
  emit("result", rec);
  return rec;
}
