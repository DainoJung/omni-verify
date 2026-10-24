// Publish a verified campaign to Threads, through the existing Hermes script (~/.hermes/scripts/threads_api.py).
// The script reads its own token file (~/.hermes/threads_token[_<profile>].json); this code never reads,
// logs or stores a token.
//
// Gate: the campaign is Verified, not yet published, and the latest Kane result (last attempt, or last
// Re-verify) is PASS for this exact campaign version. The client must echo that version and confirm.
// PUBLISH_MODE defaults to dry-run: nothing is posted unless .env says PUBLISH_MODE=live.

import { createHash } from "node:crypto";
import { homedir } from "node:os";
import type { Campaign } from "./agent";
import type { CampaignRecord } from "./loop";

export const PUBLISH_MODE: "live" | "dry-run" = process.env.PUBLISH_MODE === "live" ? "live" : "dry-run";
const SCRIPT = process.env.THREADS_SCRIPT ?? `${homedir()}/.hermes/scripts/threads_api.py`;
const PROFILE = process.env.THREADS_PROFILE ?? "scribo";

export type Published = { url: string; id: string; account: string; version: string; at: string; kane: string };
export type DryRun = { account: string; version: string; at: string; kane: string; text: string };

export function campaignVersion(c: Campaign): string {
  const canonical = JSON.stringify({ post_copy: c.post_copy, cta_url: c.cta_url, campaign_tag: c.campaign_tag, claims: c.claims });
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

export type Gate = {
  ok: boolean;
  reason: string;
  version: string | null;
  latest: { source: string; overall: string; version: string; at: string | null } | null;
};

export function publishGate(rec: CampaignRecord): Gate {
  if (rec.published) return { ok: false, reason: `Already published: ${rec.published.url}`, version: rec.published.version, latest: null };
  if (rec.status !== "verified" || !rec.final) return { ok: false, reason: "Only a Verified campaign can be published.", version: null, latest: null };
  const version = campaignVersion(rec.final);
  const rv = rec.reverifications?.at(-1);
  const last = rec.attempts.at(-1)!;
  const latest = rv
    ? { source: `Re-verify ${rv.k} (${rv.kane.recorder ?? rv.kaneRunId})`, overall: rv.overall, version: rv.version ?? "unknown", at: rv.at }
    : { source: `Kane run ${last.n} (${last.kane.recorder ?? last.kaneRunId})`, overall: last.overall, version: campaignVersion(last.campaign), at: null };
  if (latest.overall !== "PASS") return { ok: false, reason: `The latest Kane result is ${latest.overall} (${latest.source}). Re-verify before publishing.`, version, latest };
  if (latest.version === "unknown") return { ok: false, reason: `${latest.source} predates version stamps, so it can't prove this version. Re-verify before publishing.`, version, latest };
  if (latest.version !== version) return { ok: false, reason: `The latest Kane PASS was for a different version of this campaign (${latest.version}, now ${version}).`, version, latest };
  return { ok: true, reason: `${latest.source} passed this exact version.`, version, latest };
}

// Run the Hermes script. Its stdout is JSON without tokens; it is parsed here and never logged.
async function threads(args: string[]): Promise<{ code: number; out: string }> {
  // THREADS_PROFILE=default means the script's own default token file (no --profile).
  const profile = PROFILE && PROFILE !== "default" ? ["--profile", PROFILE] : [];
  const proc = Bun.spawn(["python3", "-I", SCRIPT, ...profile, ...args], { stdout: "pipe", stderr: "ignore" });
  const out = await new Response(proc.stdout).text();
  return { code: await proc.exited, out };
}

let cachedAccount: string | null = null;
export async function threadsAccount(): Promise<string> {
  if (cachedAccount) return cachedAccount;
  const { code, out } = await threads(["check"]);
  const lines = out.trim().split("\n");
  if (code !== 0 || lines[0] !== "AUTHENTICATED") throw new Error(`Threads profile "${PROFILE}" is not authenticated`);
  const username = JSON.parse(lines[1] ?? "{}").username;
  if (!username) throw new Error("Threads check returned no username");
  return (cachedAccount = String(username));
}

const inFlight = new Set<string>();

export async function publishCampaign(rec: CampaignRecord, req: { version?: string; confirm?: boolean }): Promise<{ mode: "live"; published: Published } | { mode: "dry-run"; dryRun: DryRun }> {
  if (req.confirm !== true) throw new Error("Publishing needs an explicit confirm.");
  const gate = publishGate(rec);
  if (!gate.ok) throw new Error(gate.reason);
  if (req.version !== gate.version) throw new Error(`Version mismatch: you confirmed ${req.version}, the verified version is ${gate.version}. Reload before publishing.`);
  if (inFlight.has(rec.id)) throw new Error("This campaign is already being published.");

  inFlight.add(rec.id);
  try {
    const account = await threadsAccount();
    const text = rec.final!.post_copy;
    const base = { account, version: gate.version!, at: new Date().toISOString(), kane: gate.latest!.source };
    if (PUBLISH_MODE !== "live") return { mode: "dry-run", dryRun: { ...base, text } };

    const { code, out } = await threads(["post", text]);
    let res: any = {};
    try {
      res = JSON.parse(out.trim().split("\n").at(-1) ?? "{}");
    } catch {}
    if (code !== 0 || res.status !== "published" || !res.id) {
      throw new Error(`Threads did not publish: ${res.error?.message ?? res.error ?? "no response"}`);
    }
    // The script's permalink falls back to @unknown with a numeric id; read the real one back.
    const url = (await permalinkFor(String(res.id))) ?? `https://www.threads.net/@${account}`;
    return { mode: "live", published: { ...base, url, id: String(res.id) } };
  } finally {
    inFlight.delete(rec.id);
  }
}

async function permalinkFor(id: string): Promise<string | null> {
  const { code, out } = await threads(["my-posts", "--count", "5"]);
  if (code !== 0) return null;
  try {
    const post = (JSON.parse(out).data ?? []).find((p: any) => String(p.id) === id);
    return post?.permalink ?? null;
  } catch {
    return null;
  }
}
