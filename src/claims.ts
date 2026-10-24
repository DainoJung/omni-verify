// Claim → Kane objective, and Kane result → per-assertion verdict.
//
// param_preserved: "the link that hands the user off to the App Store carries the campaign's own ct value."
// One check for both paths:
//   - post links to a landing page → Kane reads the main CTA's href before clicking it, then clicks through.
//   - post links straight to the App Store → that link is the hand-off; Kane opens it and confirms the page.
// We check the href, not Kane's final URL: the App Store page drops the query string after it loads,
// so the final URL never shows ct= (seen in fixtures/kane-sample.ndjson).
//
// text_visible: "the app page shows this exact phrase", one per sentence of the post.
// Kane scrolls the page once and stores true/false per phrase. Asserting instead ("verify the text ... is
// visible") gave a false negative on below-the-fold text and got stuck on absent text
// (fixtures/kane-verify-sample.ndjson, kane-verify-scroll.ndjson); storing a boolean did neither
// (fixtures/kane-store-sample.ndjson).

import type { KaneResult } from "./kane";

export type Assertion =
  | { type: "param_preserved"; value: string } // value: "ct=threads-oct24"
  | { type: "text_visible"; value: string }; // value: a short exact phrase from the app page

export type Verdict = {
  status: "PASS" | "FAIL" | "UNVERIFIED";
  reason: string;
  evidence: {
    handoffHref?: string | null;
    handoffSource?: "post link" | "Kane read CTA href" | null;
    handoffStep?: number | null;
    landingUrl?: string | null;
    textKey?: string;
    textFound?: string | null;
    textStep?: number | null;
  };
};

export function isAppStore(url: string): boolean {
  try {
    return new URL(url).hostname === "apps.apple.com";
  } catch {
    return false;
  }
}

export function compileObjective(ctaUrl: string): string {
  if (isAppStore(ctaUrl)) {
    return "Wait for the App Store page to finish loading. " +
      "Save the current page URL as {{landing_url}}. " +
      "Save the app name shown on the page as {{app_name}}.";
  }
  return "Find the main call to action that sends the user to the App Store. " +
    "Before clicking it, read the full href attribute of that link exactly as written, including its query string, " +
    "and save it as {{handoff_href}}. " +
    "Then click it, wait for the App Store page to finish loading, and save the current page URL as {{landing_url}}.";
}

function textObjective(phrases: string[]): string {
  return "Scroll down through the whole page once, to the bottom. " +
    "Then, for each text below, check whether it appears anywhere on the page and store the answer, true or false, without searching further: " +
    phrases.map((p, i) => `store whether the text "${p}" appears as 'claim_${i + 1}'`).join("; ") + ".";
}

// All of a campaign's assertions → one plain-English Kane objective.
// Text claims are checked on the app's own page; the link claim from the post's link.
export function compileCampaign(c: { cta_url: string; claims: { assertion: Assertion }[] }, appUrl: string): { url: string; objective: string } {
  const texts = c.claims.filter((x) => x.assertion.type === "text_visible").map((x) => x.assertion.value);
  const direct = isAppStore(c.cta_url);
  if (!texts.length) return { url: c.cta_url, objective: compileObjective(c.cta_url) };
  if (direct) {
    return { url: appUrl, objective: `${textObjective(texts)} Then go to ${c.cta_url}. ${compileObjective(c.cta_url)}` };
  }
  return { url: c.cta_url, objective: `${textObjective(texts)} Then scroll back to the top of the page. ${compileObjective(c.cta_url)}` };
}

export type ClaimVerdict = { text: string; assertion: Assertion } & Verdict;

export function evaluateTextVisible(a: Assertion, n: number, kane: KaneResult): Verdict {
  const key = `claim_${n}`;
  const mem = kane.memory[key];
  const got = (mem?.value || kane.finalState[key] || "").trim().toLowerCase();
  const evidence = { textKey: key, textFound: got || null, textStep: mem?.step ?? null };
  if (got === "true") return { status: "PASS", reason: `Kane found "${a.value}" on the page.`, evidence };
  if (got === "false") return { status: "FAIL", reason: `Kane scrolled the whole page and did not find "${a.value}".`, evidence };
  if (!kane.completed) return { status: "UNVERIFIED", reason: "Kane ended without a run_end event.", evidence };
  return { status: "UNVERIFIED", reason: `Kane did not report whether "${a.value}" is on the page.`, evidence };
}

export function evaluateCampaign(c: { cta_url: string; claims: { text: string; assertion: Assertion }[] }, kane: KaneResult): ClaimVerdict[] {
  let n = 0;
  return c.claims.map((claim) => ({
    ...claim,
    ...(claim.assertion.type === "text_visible"
      ? evaluateTextVisible(claim.assertion, ++n, kane)
      : evaluateParamPreserved(claim.assertion, c.cta_url, kane)),
  }));
}

export function overall(vs: Verdict[]): Verdict["status"] {
  if (vs.some((v) => v.status === "FAIL")) return "FAIL";
  if (vs.some((v) => v.status === "UNVERIFIED")) return "UNVERIFIED";
  return "PASS";
}

function splitParam(value: string): [string, string] {
  const i = value.indexOf("=");
  return i < 0 ? [value, ""] : [value.slice(0, i), value.slice(i + 1)];
}

function parseHref(href: string): URL | null {
  try {
    return new URL(href.trim().replace(/&amp;/g, "&"));
  } catch {
    return null;
  }
}

export function evaluateParamPreserved(a: Assertion, ctaUrl: string, kane: KaneResult): Verdict {
  const [key, want] = splitParam(a.value);
  const direct = isAppStore(ctaUrl);
  const mem = kane.memory.handoff_href;
  const handoffHref = direct ? ctaUrl : (mem?.value || kane.finalState.handoff_href || null);
  const landingUrl = kane.memory.landing_url?.value || kane.finalState.landing_url || kane.finalState.url || null;
  const evidence: Verdict["evidence"] = {
    handoffHref,
    handoffSource: handoffHref ? (direct ? "post link" : "Kane read CTA href") : null,
    handoffStep: direct ? null : (mem?.step ?? null),
    landingUrl,
  };
  const at = evidence.handoffStep != null ? ` (Kane step ${evidence.handoffStep})` : "";

  if (!kane.completed) {
    return { status: "UNVERIFIED", reason: "Kane ended without a run_end event.", evidence };
  }
  if (!handoffHref) {
    return { status: "UNVERIFIED", reason: "Kane did not return the CTA's href.", evidence };
  }
  const href = parseHref(handoffHref);
  if (!href) {
    return { status: "UNVERIFIED", reason: `Kane returned a value that is not a URL: ${handoffHref}`, evidence };
  }
  if (href.hostname !== "apps.apple.com") {
    return { status: "FAIL", reason: `The hand-off link goes to ${href.hostname}, not the App Store${at}.`, evidence };
  }
  const got = href.searchParams.get(key);
  if (got !== want) {
    const has = got == null ? `has no ${key}` : `carries ${key}=${got}`;
    return { status: "FAIL", reason: `The App Store link ${has}; the campaign expects ${key}=${want}${at}.`, evidence };
  }

  // The tag is right; now confirm Kane actually landed on that app's App Store page.
  const appId = /\/id(\d+)/.exec(href.pathname)?.[1];
  const landing = landingUrl ? parseHref(landingUrl) : null;
  if (!landing) {
    return { status: "UNVERIFIED", reason: "Kane did not report where the link landed.", evidence };
  }
  if (landing.hostname !== "apps.apple.com" || (appId && !landing.pathname.includes(`/id${appId}`))) {
    return { status: "FAIL", reason: `The link carries ${key}=${want}, but Kane landed on ${landingUrl}, not App Store app id${appId}.`, evidence };
  }
  return { status: "PASS", reason: `The App Store link carries ${key}=${want}, and Kane landed on App Store app id${appId}.`, evidence };
}
