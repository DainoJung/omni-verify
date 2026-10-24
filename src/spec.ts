// A verified campaign → a requirements document for Kane's assurance loop
// (context ingest → design tests → testrun → cover). Kane designs the tests from the marketing copy;
// we never write them by hand.

import { mkdir, writeFile } from "node:fs/promises";
import type { CampaignRecord } from "./loop";

export function campaignSpec(rec: CampaignRecord): string {
  const c = rec.final ?? rec.attempts.at(-1)!.campaign;
  const first = rec.attempts[0];
  const firstFail = first?.overall === "FAIL" ? first.verdicts.find((v) => v.status === "FAIL") : null;
  const lines = [
    `# Campaign ${c.campaign_tag}: ${rec.input.goal}`,
    "",
    `Audience: ${rec.input.audience}`,
    "",
    "## The post",
    "",
    ...c.post_copy.split("\n").map((l) => `> ${l}`),
    "",
    "## The link in the post",
    "",
    "`" + c.cta_url + "`",
    "",
    "## Claims the post makes",
    "",
    "Every claim below must hold when a new visitor opens the link in a real browser.",
    "",
    ...c.claims.map((cl, i) => {
      const a = cl.assertion;
      const how = a.type === "param_preserved"
        ? `The link that hands the visitor off to the App Store carries \`${a.value}\`, and opening it lands on the app's App Store page.`
        : `${a.type}: ${a.value}`;
      return `${i + 1}. ${cl.text} ${how}`;
    }),
  ];
  if (firstFail) {
    lines.push(
      "",
      "## Background",
      "",
      `An earlier draft linked the post to \`${first.campaign.cta_url}\`. Kane opened it and read the main call to action's link: ` +
        `\`${firstFail.evidence.handoffHref}\`. ${firstFail.reason} That is why the post links straight to the App Store.`,
    );
  }
  return lines.join("\n") + "\n";
}

export async function writeSpec(rec: CampaignRecord): Promise<string> {
  const c = rec.final ?? rec.attempts.at(-1)!.campaign;
  const path = `requirements/campaign-${c.campaign_tag}.md`;
  await mkdir("requirements", { recursive: true });
  await writeFile(path, campaignSpec(rec));
  return path;
}

// bun run src/spec.ts runs/c-<id>.json
if (import.meta.main) {
  const rec = (await Bun.file(process.argv[2]).json()) as CampaignRecord;
  console.log(await writeSpec(rec));
}
