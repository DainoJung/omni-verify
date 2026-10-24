import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { streamSSE } from "hono/streaming";
import { readdir } from "node:fs/promises";
import type { DraftInput } from "./agent";
import { runCampaign, type CampaignRecord } from "./loop";

const app = new Hono();
let busy = false; // one campaign at a time: Kane drives one browser

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

// Recorded campaign runs (runs/c-<time>.json), newest first.
app.get("/api/campaigns", async (c) => {
  const files = (await readdir("runs").catch(() => [])).filter((f) => /^c-[^]*Z\.json$/.test(f)).sort().reverse();
  const recs = await Promise.all(files.map((f) => Bun.file(`runs/${f}`).json() as Promise<CampaignRecord>));
  return c.json(recs.filter((r) => r.attempts?.length).map((r) => ({
    id: r.id, status: r.status, attempts: r.attempts.length, final_url: (r.final ?? r.attempts.at(-1)!.campaign).cta_url,
  })));
});

// One record, with each attempt's Kane steps from its own run file.
app.get("/api/campaigns/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^c-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.json({ error: "not found" }, 404);
  const rec = (await f.json()) as CampaignRecord;
  const steps = await Promise.all(rec.attempts.map(async (a) => {
    const run = Bun.file(`runs/${a.kaneRunId}.json`);
    return (await run.exists()) ? ((await run.json()).result?.steps ?? []) : [];
  }));
  return c.json({ ...rec, steps });
});

app.use("/*", serveStatic({ root: "./public" }));

export default { port: 3000, fetch: app.fetch, idleTimeout: 0 };
