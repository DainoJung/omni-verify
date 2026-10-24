import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { runKane } from "./kane";
import { compileObjective, evaluateParamPreserved, type Assertion } from "./claims";
import { logRun } from "./runlog";

const app = new Hono();
let busy = false; // one Kane run at a time: each costs ~22 credits

app.get("/", (c) => c.text("Omni Verify: UI arrives in step 5. POST /api/verify { cta_url, ct } streams a Kane run."));

app.post("/api/verify", async (c) => {
  const body = await c.req.json<{ cta_url?: string; ct?: string }>();
  if (!body.cta_url || !body.ct) return c.json({ error: "cta_url and ct are required" }, 400);
  if (busy) return c.json({ error: "A Kane run is already in progress" }, 409);

  const ctaUrl = body.cta_url;
  const assertion: Assertion = { type: "param_preserved", value: `ct=${body.ct}` };
  const objective = compileObjective(ctaUrl);
  const id = new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d+Z$/, "Z");

  busy = true;
  return streamSSE(c, async (stream) => {
    try {
      await stream.writeSSE({ event: "objective", data: JSON.stringify({ id, objective, url: ctaUrl, assertion }) });
      const run = await runKane({
        objective,
        url: ctaUrl,
        onEvent: (ev) => {
          if (ev.kind === "end") return; // the verdict event below carries the parsed result
          stream.writeSSE({ event: "kane", data: JSON.stringify(ev) });
        },
      });
      const verdict = evaluateParamPreserved(assertion, ctaUrl, run.result);
      await logRun(id, run, verdict);
      await stream.writeSSE({
        event: "verdict",
        data: JSON.stringify({ id, verdict, kane: run.result, exitCode: run.exitCode, recorder: run.recorder }),
      });
    } catch (err) {
      await stream.writeSSE({ event: "error", data: JSON.stringify({ message: String(err) }) });
    } finally {
      busy = false;
    }
  });
});

export default { port: 3000, fetch: app.fetch, idleTimeout: 0 };
