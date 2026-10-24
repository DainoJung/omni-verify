// OpenAI agent: drafts the campaign and turns its claims into assertions.
// The key comes from OPENAI_API_KEY in .env and is never logged.

import type { Assertion } from "./claims";
import type { ExploreMap } from "./explore";
import { checkDraft, checkError, memoryForPrompt, type MemoryCheck, type ProductFacts } from "./memory";

export type Claim = { text: string; assertion: Assertion };
export type Campaign = { post_copy: string; cta_url: string; campaign_tag: string; claims: Claim[] };
export type DraftInput = { app_url: string; goal: string; audience: string };

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

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
            properties: { type: { type: "string", enum: ["param_preserved", "text_visible"] }, value: { type: "string" } },
          },
        },
      },
    },
  },
};

export async function callJson<T>(system: string, user: string, schema: object, name: string): Promise<T> {
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

You get the app page's visible text and, when available, a map of the real site made by Kane Explore, a browser agent that walked it: its screens, the links on each (query values are hidden, only the parameter names show) and the links that hand off to an app store. Describe and link only what the map and page text show.

Rules:
- campaign_tag: the App Store campaign token for this post, lowercase letters, digits and hyphens, at most 40 characters, naming the channel and date (e.g. threads-oct24).
- cta_url: the app URL you are given, with ?ct=<campaign_tag> added (keep any existing query parameters).
- post_copy: fits the channel named in the goal, under 400 characters. One to three complete, natural sentences written for the audience, each stating one fact about the app that the page text shows, then the cta_url as the last thing. No other sentences: no filler, no hashtags, no call to action without a fact. Never state a price, discount, rating or number the page text does not show word for word.
- claims, so that no line of the post is unverified:
  - exactly one claim that installs from this post are credited to this campaign: {"type":"param_preserved","value":"ct=<campaign_tag>"}. The link that hands the user off to the App Store must carry this post's own ct value.
  - one claim per sentence of post_copy: its text is that sentence copied exactly, and its assertion is {"type":"text_visible","value":"<phrase>"}, where the phrase is 3 to 12 words copied exactly from the page text that prove the sentence. No double quotes in the phrase.
- Product memory, when given, is what Kane last confirmed about the product. Every sentence must state one confirmed fact. Never promise, hint at or invite people back to a retired promise, in any wording or language, even when the goal or audience points at it: the product no longer does it.`;

// The parts of an Explore map a copywriter needs, kept small.
export function mapForPrompt(m: ExploreMap): string {
  return JSON.stringify({
    explored_at: m.explored_at,
    site_screens: m.screens.filter((x) => new URL(x.url).hostname === new URL(m.url).hostname)
      .map((x) => ({ url: x.url, heading: x.heading, links: x.links.map((l) => `${l.name} -> ${l.href_pattern}`), notes: x.notes })),
    other_screens_reached: m.screens.filter((x) => new URL(x.url).hostname !== new URL(m.url).hostname).map((x) => `${x.url} (${x.heading})`),
    app_store_handoffs: m.handoffs.map((h) => `${h.screen}: "${h.name}" -> ${h.href_pattern}`),
  }, null, 1);
}

// What the draft was grounded in, for the Draft step: memory counts, the final check, and earlier rejections.
export type DraftMemory = { path: string; confirmed: number; retired: number; unverified: number; check: MemoryCheck | null; rejected: string[] };

export async function draftCampaign(input: DraftInput, map: ExploreMap | null, facts: ProductFacts | null = null, today = new Date()): Promise<{ campaign: Campaign; memory: DraftMemory | null }> {
  const text = await pageText(input.app_url);
  const user = [
    `App URL: ${input.app_url}`,
    `Growth goal: ${input.goal}`,
    `Audience: ${input.audience}`,
    `Today: ${today.toISOString().slice(0, 10)}`,
    facts ? `Product memory from Kane:\n${memoryForPrompt(facts)}` : "Product memory: none yet.",
    map ? `Kane Explore map of the site:\n${mapForPrompt(map)}` : "Kane Explore map: none yet for this app.",
    `Visible text of the app URL:\n${text}`,
  ].join("\n");
  const memory: DraftMemory | null = facts && {
    path: "memory/product-facts.json", confirmed: facts.confirmed.length, retired: facts.retired.length, unverified: facts.unverified.length, check: null, rejected: [],
  };
  let lastError = "";
  // One retry, telling the model which rule it broke (contract or product memory).
  for (let i = 0; i < 2; i++) {
    const c = await callJson<Campaign>(DRAFT_SYSTEM, lastError ? `${user}\n\nYour previous draft was rejected: ${lastError}` : user, CAMPAIGN_SCHEMA, "campaign");
    try {
      validateCampaign(c);
      if (facts && memory) {
        memory.check = await checkDraft(c, facts);
        const slip = checkError(memory.check);
        if (slip) throw new Error(`Product memory: ${slip}`);
      }
      return { campaign: c, memory };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      memory?.rejected.push(lastError);
    }
  }
  throw new Error(`Draft rejected twice: ${lastError}`);
}

const REPAIR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["action", "reason", "campaign"],
  properties: {
    action: { type: "string", enum: ["fix_link", "rewrite_claim", "remove_claim", "no_change"] },
    reason: { type: "string" },
    campaign: CAMPAIGN_SCHEMA,
  },
};

const REPAIR_SYSTEM = `You repair a growth campaign that failed a real-browser check by Kane, a browser testing agent.
You get the campaign, the failing assertions, what Kane actually saw, and Kane's own summary.

Allowed repairs, smallest first:
- fix_link: change cta_url (and the link inside post_copy) so the claim becomes true. Build the link only from URLs Kane actually observed. Keep every query parameter Kane saw, except set ct to this post's campaign_tag: a link carrying another campaign's ct credits installs to that campaign.
- rewrite_claim / remove_claim: change or drop a claim that cannot be made true. For a text_visible claim, rewrite or drop its sentence in post_copy too, so every remaining sentence still has its own text_visible claim (text = the sentence copied exactly, value = 3 to 12 words copied exactly from what the page shows). Never keep a sentence whose phrase Kane did not find. The param_preserved claim about this post's own campaign_tag must stay: attribution is the point of the campaign.
- no_change: Kane could not gather evidence (UNVERIFIED) for the link claim, and nothing in the campaign is wrong. An UNVERIFIED text claim is an unverified sentence: rewrite or remove it.

Keep campaign_tag unchanged. Keep post_copy otherwise as close to the original as possible, and it must contain the new cta_url.
reason: one line a marketer understands, citing what Kane saw.`;

export type Repair = { action: "fix_link" | "rewrite_claim" | "remove_claim" | "no_change"; reason: string; campaign: Campaign };

export async function repairCampaign(c: Campaign, failures: unknown, kane: { summary: string | null; steps: { step: number; remark: string }[] }): Promise<Repair> {
  const user = JSON.stringify({ campaign: c, failing_assertions: failures, kane_summary: kane.summary, kane_steps: kane.steps.map((s) => s.remark) }, null, 2);
  let lastError = "";
  // One retry, telling the model which rule it broke.
  for (let i = 0; i < 2; i++) {
    const r = await callJson<Repair>(REPAIR_SYSTEM, lastError ? `${user}\n\nYour previous repair was rejected: ${lastError}` : user, REPAIR_SCHEMA, "repair");
    try {
      if (r.campaign.campaign_tag !== c.campaign_tag) throw new Error(`Repair changed the campaign tag from ${c.campaign_tag} to ${r.campaign.campaign_tag}`);
      validateCampaign(r.campaign);
      return r;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Repair rejected twice: ${lastError}`);
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
  if (!c.post_copy.includes(c.cta_url)) throw new Error(`post_copy does not contain the cta_url ${c.cta_url}`);
  const pp = c.claims.filter((x) => x.assertion.type === "param_preserved");
  if (pp.length !== 1) throw new Error(`Expected exactly one param_preserved claim, got ${pp.length}`);
  if (pp[0].assertion.value !== `ct=${c.campaign_tag}`) throw new Error(`Claim value ${pp[0].assertion.value} does not match ct=${c.campaign_tag}`);
  for (const t of c.claims.filter((x) => x.assertion.type === "text_visible")) {
    const v = t.assertion.value.trim();
    if (!v || v.length > 120 || v.includes('"')) throw new Error(`text_visible phrase must be 1-120 characters with no double quotes: ${v}`);
  }
  // Every sentence of the post is backed by its own text_visible claim.
  const backed = new Set(c.claims.filter((x) => x.assertion.type === "text_visible").map((x) => norm(x.text)));
  const unbacked = postSentences(c).filter((s) => !backed.has(norm(s)));
  if (unbacked.length) throw new Error(`These sentences have no text_visible claim (claim text must copy the sentence exactly): ${unbacked.map((s) => JSON.stringify(s)).join(", ")}`);
}

const norm = (s: string) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, " ").trim();

// The post's sentences, without the link.
export function postSentences(c: Pick<Campaign, "post_copy" | "cta_url">): string[] {
  return c.post_copy.split(c.cta_url).join(" ").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => /[a-z]/i.test(s));
}
