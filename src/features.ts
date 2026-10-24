// Feature claims: verify what a post promises a tool can do by doing it, not by finding the words.
// Each sentence of the post is one promise. The agent writes the action that would prove it and the
// result a user should then see; Kane performs the action on the tool page in real Chrome and stores
// what happened. The code judges from Kane's stored values, as in claims.ts.
//
// Kane store format learned from a real run (fixtures/kane-feature-probe.ndjson, KR-79): asked to
// "store ... as {{name}}", Kane returns context.memory[name].extracted_value. It read the Output
// textarea's full value (newlines intact) and answered the true/false questions with "true"/"false".

import { callJson, MODEL } from "./agent";
import type { KaneResult } from "./kane";

export { MODEL };

export type FeatureClaim = {
  text: string; // the sentence of the post, copied exactly
  control: string; // visible label of the control the action uses, e.g. "Json Prettify"
  action: string; // what Kane does on the page, with the exact sample input
  expected: string; // what the user sees if the promise is true, answerable true/false
};
// stretch_sentence: in stretch mode, the sentence the agent was told to overreach with ("" otherwise).
// Recorded so the UI can show it; the verdict never reads it.
export type FeaturePost = { tool_name: string; post_copy: string; claims: FeatureClaim[]; stretch_sentence: string };
export type FeatureInput = { tool_url: string; channel: string; stretch: boolean };

export type FeatureVerdict = {
  status: "PASS" | "FAIL" | "UNVERIFIED";
  reason: string;
  evidence: { actionAvailable: string | null; observed: string | null; resultMatches: string | null; step: number | null };
};

const CLAIM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["text", "control", "action", "expected"],
  properties: { text: { type: "string" }, control: { type: "string" }, action: { type: "string" }, expected: { type: "string" } },
};

const POST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tool_name", "post_copy", "claims", "stretch_sentence"],
  properties: {
    tool_name: { type: "string" }, post_copy: { type: "string" }, claims: { type: "array", items: CLAIM_SCHEMA }, stretch_sentence: { type: "string" },
  },
};

const decode = (s: string) => s
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// The tool's own section of the page: from its <h1> to the "More Tools" list or the footer.
// The site's navigation would otherwise fill the prompt.
export function toolText(html: string, max = 7000): string {
  let body = html;
  const h1 = body.search(/<h1[\s>]/i);
  if (h1 >= 0) body = body.slice(h1);
  const more = body.search(/>\s*More Tools\s*</i);
  const end = more > 0 ? body.lastIndexOf("<", more) : -1;
  const foot = body.search(/<footer[\s>]/i);
  const cut = [end, foot].filter((i) => i > 0);
  if (cut.length) body = body.slice(0, Math.min(...cut));
  return decode(body
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function fetchToolText(url: string): Promise<string> {
  return toolText(await (await fetch(url, { redirect: "follow" })).text());
}

const DRAFT_SYSTEM = `You draft one launch post for a free online tool, for the channel you are given.
Every sentence of the post promises one thing a user can do with the tool. Each promise will be checked by Kane, a browser agent that performs it on the tool's page in real Chrome. So for each sentence you also write the action that proves it and the result the user should then see.

Rules:
- tool_name: the tool's name as the page shows it.
- post_copy: a launch post for developers, not a how-to: two or three complete, natural sentences in a confident marketing voice, each promising one thing the tool does for the reader, then the tool URL as the last thing. Under 400 characters. No hashtags, no prices, no numbers the page text does not show, no sentence that promises nothing.
- claims: exactly one per sentence of post_copy.
  - text: the sentence copied exactly.
  - control: the visible label of the button or control that performs exactly this promise, written as on the page (e.g. Json Prettify). Never a control for a different feature: a promise to convert to CSV needs a CSV control.
  - action: plain-English steps on this page only: which box to type into, the exact sample input to type, which control to click. Keep the sample input short and on one line. Never put two braces next to each other (write {"a": {"b": 1} } with a space before the last brace).
  - expected: what the user sees right after the action if the promise is true, phrased so it can be answered true or false by looking at the page (e.g. the Output box shows the same JSON spread over several indented lines).
- stretch_sentence: "" unless stretch mode is on.`;

const STRETCH = `
Stretch mode is on. This is a test of the checker: write exactly three sentences, and make exactly one of them promise converting the input to another data format (such as CSV, YAML or XML) that this page's text does not show a control for. Write it as confidently as the others, with its own control, action and expected result, and copy it exactly into stretch_sentence. Kane will decide whether it is true.`;

export async function draftFeaturePost(input: FeatureInput, text: string): Promise<FeaturePost> {
  const user = [
    `Tool URL: ${input.tool_url}`,
    `Channel: ${input.channel}`,
    `Visible text of the tool page:\n${text}`,
  ].join("\n");
  const system = DRAFT_SYSTEM + (input.stretch ? STRETCH : "");
  let lastError = "";
  // One retry, telling the model which rule it broke.
  for (let i = 0; i < 2; i++) {
    const p = await callJson<FeaturePost>(system, lastError ? `${user}\n\nYour previous draft was rejected: ${lastError}` : user, POST_SCHEMA, "feature_post");
    try {
      validateFeaturePost(p, input.tool_url);
      if (input.stretch && !p.claims.some((c) => norm(c.text) === norm(p.stretch_sentence))) {
        throw new Error("Stretch mode is on: stretch_sentence must copy exactly one of the post's sentences");
      }
      return p;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Draft rejected twice: ${lastError}`);
}

const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

export function sentences(postCopy: string, url: string): string[] {
  return postCopy.split(url).join(" ").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => /[a-z]/i.test(s));
}

// Reject posts that break the contract instead of quietly fixing them.
export function validateFeaturePost(p: FeaturePost, url: string): void {
  if (!p.post_copy.includes(url)) throw new Error(`post_copy does not contain the tool URL ${url}`);
  if (!p.claims.length) throw new Error("The post has no claims");
  for (const c of p.claims) {
    for (const k of ["control", "action", "expected"] as const) {
      if (!c[k].trim()) throw new Error(`Claim "${c.text}" has an empty ${k}`);
    }
    // {{name}} is Kane's variable syntax; a nested JSON sample would be read as one.
    if (/\{\{|\}\}/.test(c.action + c.expected)) throw new Error(`Claim "${c.text}": action and expected must not contain two braces in a row`);
  }
  const claimed = p.claims.map((c) => norm(c.text));
  const sents = sentences(p.post_copy, url).map(norm);
  const unbacked = sents.filter((s) => !claimed.includes(s));
  if (unbacked.length) throw new Error(`These sentences have no claim (claim text must copy the sentence exactly): ${unbacked.map((s) => JSON.stringify(s)).join(", ")}`);
  const orphan = claimed.filter((c) => !sents.includes(c));
  if (orphan.length) throw new Error(`These claims are not sentences of post_copy: ${orphan.map((s) => JSON.stringify(s)).join(", ")}`);
}

// One claim → one Kane objective. Kane first stores whether the control exists, so an invented
// feature is answered on this page instead of Kane searching the site for it.
// No "if it does not exist ... stop" branch: with one, Kane stored only {{action_available}} and ended
// before storing the result (runs/f-2026-10-24T19-53-00Z-a1-c1, -c2: true claims left UNVERIFIED).
export function compileFeatureClaim(c: FeatureClaim): string {
  return `Check one promise about this page: ${c.text} ` +
    `First, look on this page for a control labeled or clearly meaning "${c.control}", and store whether it exists, true or false, as {{action_available}}. ` +
    `Only if it exists, do this: ${c.action.trim().replace(/([^.!?])$/, "$1.")} ` +
    `Finally, store the full text of the result area as {{observed_result}} (store none if nothing changed), and ` +
    `store whether ${c.expected.trim().replace(/[.!?]$/, "").replace(/^[A-Z](?=[a-z])/, (ch) => ch.toLowerCase())}, true or false, as {{result_matches}}.`;
}

function stored(kane: KaneResult, key: string): { value: string | null; step: number | null } {
  const m = kane.memory[key];
  const v = (m?.value ?? kane.finalState[key] ?? "").trim();
  return { value: v || null, step: m?.step ?? null };
}

const clip = (s: string, n = 160) => (s.length > n ? s.slice(0, n) + "…" : s);

export function evaluateFeatureClaim(c: FeatureClaim, kane: KaneResult): FeatureVerdict {
  const avail = stored(kane, "action_available");
  const obs = stored(kane, "observed_result");
  const match = stored(kane, "result_matches");
  const evidence = { actionAvailable: avail.value, observed: obs.value, resultMatches: match.value, step: match.step ?? avail.step };
  const at = evidence.step != null ? ` (Kane step ${evidence.step})` : "";
  if (!kane.completed) return { status: "UNVERIFIED", reason: "Kane ended without a run_end event.", evidence };

  const a = avail.value?.toLowerCase();
  const m = match.value?.toLowerCase();
  if (a === "false") return { status: "FAIL", reason: `Kane found no "${c.control}" control on the page${at}.`, evidence };
  // "none" was Kane's answer for "nothing changed"; a matching result needs something to match
  // (runs/f-2026-10-24T19-58-22Z-a1-c3 stored none and true).
  if (a === "true" && m === "true" && obs.value?.toLowerCase() === "none") {
    return { status: "UNVERIFIED", reason: `Kane said the result matched but stored no result after "${c.control}"${at}.`, evidence };
  }
  if (a === "true" && m === "true") {
    return { status: "PASS", reason: `Kane used "${c.control}" and saw the expected result${at}.`, evidence };
  }
  if (a === "true" && m === "false") {
    return { status: "FAIL", reason: `Kane used "${c.control}", but the result was not what the post promises${at}: ${clip(obs.value ?? "nothing")}`, evidence };
  }
  return { status: "UNVERIFIED", reason: `Kane did not report whether "${c.control}" exists and works.`, evidence };
}

const REPAIR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["action", "reason", "post"],
  properties: {
    action: { type: "string", enum: ["rewrite_claim", "remove_claim"] },
    reason: { type: "string" },
    post: POST_SCHEMA,
  },
};

const REPAIR_SYSTEM = `You repair a launch post for a free online tool. Kane, a browser agent, performed the action behind each sentence on the tool's page in real Chrome, and some sentences failed.
You get the post, the failing claims with what Kane saw (whether the control existed, the result it read, its summary and steps), and the tool page's text.

Only FAIL claims are given to you; a claim Kane could not judge is re-run, not rewritten. For each failing claim, either:
- rewrite_claim: replace the sentence with a different promise that the page text shows the tool can keep, with its own control, action and expected result (same rules as before: exact short sample input on one line, never two braces next to each other, expected answerable true or false). Do not restate the failed promise in other words.
- remove_claim: drop the sentence and its claim, when the post reads fine without it.
Keep every passing sentence and its claim exactly as they are, word for word. The post keeps at least one sentence and ends with the tool URL. Set stretch_sentence to "" (the repaired post makes no stretch claims).
action: rewrite_claim if you rewrote any sentence, else remove_claim.
reason: one line a marketer understands, citing what Kane saw.`;

export type FeatureRepair = { action: "rewrite_claim" | "remove_claim"; reason: string; post: FeaturePost };

export async function repairFeaturePost(
  post: FeaturePost,
  url: string,
  failing: { claim: FeatureClaim; verdict: FeatureVerdict; kaneSummary: string | null; kaneSteps: string[] }[],
  text: string,
): Promise<FeatureRepair> {
  const user = JSON.stringify({ tool_url: url, post, failing_claims: failing, tool_page_text: text }, null, 2);
  let lastError = "";
  // One retry, telling the model which rule it broke.
  for (let i = 0; i < 2; i++) {
    const r = await callJson<FeatureRepair>(REPAIR_SYSTEM, lastError ? `${user}\n\nYour previous repair was rejected: ${lastError}` : user, REPAIR_SCHEMA, "feature_repair");
    try {
      validateFeaturePost(r.post, url);
      const kept = new Set(r.post.claims.map(claimKey));
      const failed = new Set(failing.map((f) => norm(f.claim.text)));
      for (const c of post.claims.filter((c) => !failed.has(norm(c.text)))) {
        if (!kept.has(claimKey(c))) throw new Error(`The claim "${c.text}" did not fail and was changed or dropped; keep it exactly`);
      }
      const still = r.post.claims.filter((c) => failed.has(norm(c.text)));
      if (still.length) throw new Error(`The failing sentence "${still[0].text}" is still in the post`);
      return r;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Repair rejected twice: ${lastError}`);
}

// Same sentence, same action, same expectation: a PASS for it carries over to the next attempt.
export const claimKey = (c: FeatureClaim) => JSON.stringify([norm(c.text), c.control.trim(), c.action.trim(), c.expected.trim()]);
