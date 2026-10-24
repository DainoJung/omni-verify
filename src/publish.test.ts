import { expect, test } from "bun:test";
import { campaignVersion, publishCampaign, publishGate } from "./publish";
import type { CampaignRecord } from "./loop";

// A real verified record (FAIL -> repair -> PASS), without its Re-verify history.
const base = async (): Promise<CampaignRecord> => {
  const rec = (await Bun.file("runs/c-2026-10-24T19-41-41Z.json").json()) as CampaignRecord;
  return { ...rec, reverifications: [], published: undefined, publishDryRuns: [] };
};

test("open when the last Kane result passed this exact version", async () => {
  const g = publishGate(await base());
  expect(g.ok).toBe(true);
  expect(g.version).toBe(campaignVersion((await base()).final!));
});

test("locked when the copy changed after Kane passed it", async () => {
  const rec = await base();
  rec.final = { ...rec.final!, post_copy: rec.final!.post_copy.replace("Scribo", "Scribo, the best app,") };
  const g = publishGate(rec);
  expect(g.ok).toBe(false);
  expect(g.reason).toContain("different version");
});

test("locked when the latest Re-verify failed", async () => {
  const rec = await base();
  const rv = { ...(await Bun.file("runs/c-2026-10-24T19-41-41Z.json").json()).reverifications[0], overall: "FAIL", version: campaignVersion(rec.final!) };
  rec.reverifications = [rv];
  expect(publishGate(rec).ok).toBe(false);
  expect(publishGate(rec).reason).toContain("FAIL");
});

test("a Re-verify with no version stamp does not count as proof", async () => {
  const rec = await base();
  rec.reverifications = [{ ...(await Bun.file("runs/c-2026-10-24T19-41-41Z.json").json()).reverifications[0], version: undefined }];
  expect(publishGate(rec).ok).toBe(false);
});

test("locked for a campaign that never verified, and after it was published", async () => {
  const rec = await base();
  expect(publishGate({ ...rec, status: "needs_human" }).ok).toBe(false);
  const pub = { url: "https://www.threads.net/@x/post/abc", id: "1", account: "x", version: "v", at: "t", kane: "k" };
  expect(publishGate({ ...rec, published: pub }).reason).toContain("Already published");
});

test("publishing needs confirm: true and the exact verified version (rejected before any Threads call)", async () => {
  const rec = await base();
  await expect(publishCampaign(rec, { version: publishGate(rec).version! })).rejects.toThrow("explicit confirm");
  await expect(publishCampaign(rec, { version: "stale", confirm: true })).rejects.toThrow("Version mismatch");
});
