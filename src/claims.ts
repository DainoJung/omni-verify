// Claim → Kane objective, and Kane result → per-assertion verdict.
//
// param_preserved: "the link that hands the user off to the App Store carries the campaign's own ct value."
// One check for both paths:
//   - post links to a landing page → Kane reads the main CTA's href before clicking it, then clicks through.
//   - post links straight to the App Store → that link is the hand-off; Kane opens it and confirms the page.
// We check the href, not Kane's final URL: the App Store page drops the query string after it loads,
// so the final URL never shows ct= (seen in fixtures/kane-sample.ndjson).

import type { KaneResult } from "./kane";

export type Assertion = { type: "param_preserved"; value: string }; // value: "ct=threads-oct24"

export type Verdict = {
  status: "PASS" | "FAIL" | "UNVERIFIED";
  reason: string;
  evidence: {
    handoffHref: string | null;
    handoffSource: "post link" | "Kane read CTA href" | null;
    handoffStep: number | null;
    landingUrl: string | null;
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
