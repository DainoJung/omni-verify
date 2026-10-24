import { expect, test } from "bun:test";
import { parseNdjson } from "./kane";
import { compileFeatureClaim, evaluateFeatureClaim, toolText, validateFeaturePost, type FeatureClaim } from "./features";

// KR-79: Kane typed JSON into "Enter Value", clicked Json Prettify and stored the three values.
const probe = parseNdjson(await Bun.file("fixtures/kane-feature-probe.ndjson").text());
const URL_ = "https://www.testmuai.com/free-online-tools/json-prettify/";

const prettify: FeatureClaim = {
  text: "Paste messy JSON and get it formatted.",
  control: "Json Prettify",
  action: 'Type {"name":"kane","tags":["a","b"],"ok":true} into the Enter Value box, then click Json Prettify.',
  expected: "the Output box shows the same JSON spread over several indented lines",
};

test("the real probe run passes the prettify claim from Kane's stored values", () => {
  const v = evaluateFeatureClaim(prettify, probe);
  expect(v.status).toBe("PASS");
  expect(v.evidence.actionAvailable).toBe("true");
  expect(v.evidence.observed).toContain('\n\t "name"');
});

test("no control on the page is a FAIL, a false result is a FAIL", () => {
  const no = { ...probe, memory: { ...probe.memory, action_available: { ...probe.memory.action_available, value: "false" } } };
  expect(evaluateFeatureClaim(prettify, no).status).toBe("FAIL");
  const wrong = { ...probe, memory: { ...probe.memory, result_matches: { ...probe.memory.result_matches, value: "false" } } };
  expect(evaluateFeatureClaim(prettify, wrong).status).toBe("FAIL");
});

test("a match with no stored result is UNVERIFIED", () => {
  const none = { ...probe, memory: { ...probe.memory, observed_result: { ...probe.memory.observed_result, value: "none" } } };
  expect(evaluateFeatureClaim(prettify, none).status).toBe("UNVERIFIED");
});

test("no run_end or no stored value is UNVERIFIED, never PASS", () => {
  expect(evaluateFeatureClaim(prettify, { ...probe, completed: false }).status).toBe("UNVERIFIED");
  expect(evaluateFeatureClaim(prettify, { ...probe, memory: {}, finalState: {} }).status).toBe("UNVERIFIED");
});

test("the objective asks Kane to check the control first and store all three values", () => {
  const o = compileFeatureClaim(prettify);
  expect(o).toContain('"Json Prettify"');
  for (const k of ["action_available", "observed_result", "result_matches"]) expect(o).toContain(`{{${k}}}`);
  expect(o.indexOf("{{action_available}}")).toBeLessThan(o.indexOf("Type {"));
});

test("every sentence needs its own claim, and samples can't look like Kane variables", () => {
  const post = { tool_name: "JSON Prettify", post_copy: `Paste messy JSON and get it formatted. It also converts JSON to CSV. ${URL_}`, claims: [prettify], stretch_sentence: "" };
  expect(() => validateFeaturePost(post, URL_)).toThrow(/no claim/);
  const nested = { ...post, post_copy: `Paste messy JSON and get it formatted. ${URL_}`, claims: [{ ...prettify, action: 'Type {"a":{"b":1}}' }] };
  expect(() => validateFeaturePost(nested, URL_)).toThrow(/braces/);
  expect(() => validateFeaturePost({ ...nested, claims: [prettify] }, URL_)).not.toThrow();
});

test("toolText keeps the tool's own section, not the site navigation", () => {
  const html = `<nav>Pricing Login</nav><h1>Free JSON Formatter &amp; Prettifier</h1><p>Paste your JSON</p><button>Json Prettify</button><h2>More Tools</h2><a>Other</a><footer>x</footer>`;
  expect(toolText(html)).toBe("Free JSON Formatter & Prettifier Paste your JSON Json Prettify");
});
