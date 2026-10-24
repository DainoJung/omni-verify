import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { DraftInput } from "./agent";
import { runCampaign } from "./loop";

const app = new Hono();
let busy = false; // one campaign at a time: Kane drives one browser

app.get("/", (c) => c.text("Omni Verify: UI arrives in step 5. POST /api/run { app_url, goal, audience } streams a campaign run."));

app.post("/api/run", async (c) => {
  const input = await c.req.json<Partial<DraftInput>>();
  if (!input.app_url || !input.goal || !input.audience) return c.json({ error: "app_url, goal and audience are required" }, 400);
  if (busy) return c.json({ error: "A campaign run is already in progress" }, 409);

  busy = true;
  return streamSSE(c, async (stream) => {
    // Writes are chained so the last event is flushed before the stream closes.
    let pending = Promise.resolve();
    const emit = (event: string, data: unknown) => {
      pending = pending.then(() => stream.writeSSE({ event, data: JSON.stringify(data) }));
    };
    try {
      await runCampaign(input as DraftInput, emit);
    } catch (err) {
      emit("error", { message: err instanceof Error ? err.message : String(err) });
    } finally {
      await pending;
      busy = false;
    }
  });
});

export default { port: 3000, fetch: app.fetch, idleTimeout: 0 };
