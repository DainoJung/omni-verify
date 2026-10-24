import { expect, test } from "bun:test";
import { validateCampaign, type Campaign } from "./agent";
import { compileCampaign, compileObjective } from "./claims";

// Shape of the real gpt-5.4-mini draft saved in runs/c-2026-10-24T18-45-09Z.json
const draft: Campaign = {
  post_copy: "If you journal or write daily in a second language, Scribo ... https://scribo.cc?ct=threads-oct24",
  cta_url: "https://scribo.cc?ct=threads-oct24",
  campaign_tag: "threads-oct24",
  claims: [{ text: "Installs from this post are credited to this campaign.", assertion: { type: "param_preserved", value: "ct=threads-oct24" } }],
};

test("accepts a well-formed draft", () => {
  expect(() => validateCampaign(draft)).not.toThrow();
});

test("rejects a cta_url that does not carry the campaign tag", () => {
  expect(() => validateCampaign({ ...draft, cta_url: "https://scribo.cc" })).toThrow("does not carry ct=threads-oct24");
});

test("rejects a claim whose value disagrees with the tag", () => {
  const claims = [{ text: "x", assertion: { type: "param_preserved" as const, value: "ct=other" } }];
  expect(() => validateCampaign({ ...draft, claims })).toThrow("does not match");
});

test("rejects tags App Store Connect would not accept", () => {
  expect(() => validateCampaign({ ...draft, campaign_tag: "Threads Oct 24" })).toThrow("Bad campaign_tag");
});

test("compiles a landing-page link into a read-the-href objective", () => {
  const c = compileCampaign(draft);
  expect(c.url).toBe(draft.cta_url);
  expect(c.objective).toContain("{{handoff_href}}");
});

test("compiles a direct App Store link into a landing check", () => {
  const url = "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8";
  expect(compileObjective(url)).not.toContain("{{handoff_href}}");
  expect(compileObjective(url)).toContain("{{landing_url}}");
});
