// OpenAI agent: drafts the campaign and turns its claims into assertions.
// The key comes from OPENAI_API_KEY in .env and is never logged.

import type { Assertion } from "./claims";

export type Claim = { text: string; assertion: Assertion };
export type Campaign = { post_copy: string; cta_url: string; campaign_tag: string; claims: Claim[] };
export type DraftInput = { app_url: string; goal: string; audience: string };

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

// Today's scope: one claim type. text_visible (price / trial) is the stretch goal.
const CAMPAIGN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["post_copy", "cta_url", "campaign_tag", "claims"],
  properties: {
    post_copy: { type: "string" },
    cta_url: { type: "string" },
    campaign_tag: { type: "string" },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "assertion"],
        properties: {
          text: { type: "string" },
          assertion: {
            type: "object",
            additionalProperties: false,
            required: ["type", "value"],
            properties: { type: { type: "string", enum: ["param_preserved"] }, value: { type: "string" } },
          },
        },
      },
    },
  },
};

async function callJson<T>(system: string, user: string, schema: object, name: string): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set in .env");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "low",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    }),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body.error?.message ?? "request failed"}`);
  const msg = body.choices?.[0]?.message;
  if (msg?.refusal) throw new Error(`OpenAI refused: ${msg.refusal}`);
  return JSON.parse(msg.content) as T;
}

// Visible text of the app's page, so the copy describes the real product.
export async function pageText(url: string, max = 6000): Promise<string> {
  const html = await (await fetch(url, { redirect: "follow" })).text();
  return html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const DRAFT_SYSTEM = `You draft one social post for a growth campaign. Every claim in it must be testable in a real browser.

Rules:
- campaign_tag: the App Store campaign token for this post, lowercase letters, digits and hyphens, at most 40 characters, naming the channel and date (e.g. threads-oct24).
- cta_url: the app URL you are given, with ?ct=<campaign_tag> added (keep any existing query parameters).
- post_copy: fits the channel named in the goal, under 400 characters, ends with the cta_url. Describe only what the page text supports. Do not state prices, discounts, trial lengths, ratings or user counts: today we can only verify the tracking link, so those would be unverified claims.
- claims: exactly one claim, that installs from this post are credited to this campaign. Its assertion is {"type":"param_preserved","value":"ct=<campaign_tag>"}: the link that hands the user off to the App Store must carry this post's own ct value.`;

export async function draftCampaign(input: DraftInput, today = new Date()): Promise<Campaign> {
  const text = await pageText(input.app_url);
  const user = [
    `App URL: ${input.app_url}`,
    `Growth goal: ${input.goal}`,
    `Audience: ${input.audience}`,
    `Today: ${today.toISOString().slice(0, 10)}`,
    `Visible text of the app URL:\n${text}`,
  ].join("\n");
  const c = await callJson<Campaign>(DRAFT_SYSTEM, user, CAMPAIGN_SCHEMA, "campaign");
  validateCampaign(c);
  return c;
}

// Reject drafts that break the contract instead of quietly fixing them.
export function validateCampaign(c: Campaign): void {
  if (!/^[a-z0-9-]{1,40}$/.test(c.campaign_tag)) throw new Error(`Bad campaign_tag: ${c.campaign_tag}`);
  let url: URL;
  try {
    url = new URL(c.cta_url);
  } catch {
    throw new Error(`cta_url is not a URL: ${c.cta_url}`);
  }
  if (url.searchParams.get("ct") !== c.campaign_tag) throw new Error(`cta_url does not carry ct=${c.campaign_tag}: ${c.cta_url}`);
  const pp = c.claims.filter((x) => x.assertion.type === "param_preserved");
  if (pp.length !== 1) throw new Error(`Expected exactly one param_preserved claim, got ${pp.length}`);
  if (pp[0].assertion.value !== `ct=${c.campaign_tag}`) throw new Error(`Claim value ${pp[0].assertion.value} does not match ct=${c.campaign_tag}`);
}
