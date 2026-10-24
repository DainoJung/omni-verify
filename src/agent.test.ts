import { expect, test } from "bun:test";
import { validateCampaign, type Campaign } from "./agent";
import { compileCampaign, compileObjective } from "./claims";

// A draft in the shape the model returns: one link claim plus one text claim per sentence.
const draft: Campaign = {
  post_copy: "Scribo rewrites articles for the learner you are today. Try Pro free for 7 days. https://scribo.cc?ct=threads-oct24",
  cta_url: "https://scribo.cc?ct=threads-oct24",
  campaign_tag: "threads-oct24",
  claims: [
    { text: "Installs from this post are credited to this campaign.", assertion: { type: "param_preserved", value: "ct=threads-oct24" } },
    { text: "Scribo rewrites articles for the learner you are today.", assertion: { type: "text_visible", value: "rewrites them for the learner you are today" } },
    { text: "Try Pro free for 7 days.", assertion: { type: "text_visible", value: "Try Pro free for 7 days" } },
  ],
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

test("rejects a post sentence with no text_visible claim", () => {
  const post_copy = "Scribo rewrites articles for the learner you are today. Try Pro free for 7 days. It is the best app. https://scribo.cc?ct=threads-oct24";
  expect(() => validateCampaign({ ...draft, post_copy })).toThrow('"It is the best app."');
});

test("compiles a landing-page link: text checks first, then read the href", () => {
  const c = compileCampaign(draft, "https://scribo.cc");
  expect(c.url).toBe(draft.cta_url);
  expect(c.objective).toContain(`store whether the text "Try Pro free for 7 days" appears as 'claim_2'`);
  expect(c.objective.indexOf("claim_1")).toBeLessThan(c.objective.indexOf("{{handoff_href}}"));
});

test("compiles a direct App Store link: text checks on the app page, then go to the link", () => {
  const url = "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8";
  const c = compileCampaign({ ...draft, cta_url: url }, "https://scribo.cc");
  expect(c.url).toBe("https://scribo.cc");
  expect(c.objective).toContain(`Then go to ${url}.`);
  expect(c.objective).toContain("{{landing_url}}");
});

test("compiles a direct App Store link into a landing check", () => {
  const url = "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8";
  expect(compileObjective(url)).not.toContain("{{handoff_href}}");
  expect(compileObjective(url)).toContain("{{landing_url}}");
});
