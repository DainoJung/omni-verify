import { expect, test } from "bun:test";
import { summarizeDeltas } from "./explore";

// Real Kane Explore output for scribo.cc (exploration 01a16f46…, read_only, 12 leases).
const m = summarizeDeltas(await Bun.file("fixtures/kane-explore-deltas.ndjson").text());

test("folds deltas into one row per screen", () => {
  expect(m.screens.length).toBe(7);
  expect(m.screens.map((s) => s.url)).toContain("https://scribo.cc/");
  expect(m.screens.map((s) => s.url)).toContain("https://apps.apple.com/us/app/scribo-ai-language-learning/id6794793715");
});

test("hand-offs are site links into the App Store, with their query keys but not values", () => {
  const home = m.handoffs.filter((h) => h.screen === "https://scribo.cc/").map((h) => h.name);
  expect(home).toEqual(["Get the app", "Download Scribo on the App Store"]);
  expect(m.handoffs.every((h) => h.href_pattern === "apps.apple.com/app/apple-store/{slug}?ct&mt&pt")).toBe(true);
  expect(m.handoffs.some((h) => h.screen.includes("apps.apple.com"))).toBe(false);
});

test("keeps Explore's findings", () => {
  expect(m.findings.length).toBe(20);
});
