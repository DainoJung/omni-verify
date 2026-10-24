import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { streamSSE } from "hono/streaming";
import { readdir } from "node:fs/promises";
import type { DraftInput } from "./agent";
import { reverifyCampaign, runCampaign, type CampaignRecord } from "./loop";
import { PUBLISH_MODE, publishCampaign, publishGate, threadsAccount } from "./publish";

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

app.post("/api/campaigns/:id/reverify", async (c) => {
  const id = c.req.param("id");
  if (!/^c-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  if (busy) return c.json({ error: "A Kane run is already in progress" }, 409);
  busy = true;
  return streamSSE(c, async (stream) => {
    let pending = Promise.resolve();
    const emit = (event: string, data: unknown) => {
      pending = pending.then(() => stream.writeSSE({ event, data: JSON.stringify(data) }));
    };
    try {
      await reverifyCampaign(id, emit);
    } catch (err) {
      emit("error", { message: err instanceof Error ? err.message : String(err) });
    } finally {
      await pending;
      busy = false;
    }
  });
});

// Publish state for the UI: the gate, the mode, and (with ?account=1) which Threads account would post.
app.get("/api/campaigns/:id/publish", async (c) => {
  const id = c.req.param("id");
  if (!/^c-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.json({ error: "not found" }, 404);
  const rec = (await f.json()) as CampaignRecord;
  let account: string | null = null;
  let accountError: string | null = null;
  if (c.req.query("account")) await threadsAccount().then((a) => (account = a), (e) => (accountError = String(e.message ?? e)));
  return c.json({ mode: PUBLISH_MODE, gate: publishGate(rec), published: rec.published ?? null, dryRuns: rec.publishDryRuns ?? [], account, accountError, text: rec.final?.post_copy ?? null });
});

// The only route that can post. Needs the gate, the confirmed version and confirm: true.
app.post("/api/campaigns/:id/publish", async (c) => {
  const id = c.req.param("id");
  if (!/^c-[\w-]+Z$/.test(id)) return c.json({ error: "bad id" }, 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.json({ error: "not found" }, 404);
  if (busy) return c.json({ error: "A Kane run is in progress" }, 409);
  const body = await c.req.json<{ version?: string; confirm?: boolean }>().catch(() => ({}));
  const rec = (await f.json()) as CampaignRecord;
  try {
    const r = await publishCampaign(rec, body);
    if (r.mode === "live") rec.published = r.published;
    else rec.publishDryRuns = [...(rec.publishDryRuns ?? []), r.dryRun];
    await Bun.write(`runs/${id}.json`, JSON.stringify(rec, null, 2));
    return c.json(r);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 403);
  }
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
  const rvSteps = await Promise.all((rec.reverifications ?? []).map(async (r) => {
    const run = Bun.file(`runs/${r.kaneRunId}.json`);
    return (await run.exists()) ? ((await run.json()).result?.steps ?? []) : [];
  }));
  return c.json({ ...rec, steps, rvSteps });
});

// Pre-launch preview of a campaign's post, with its real link. Kane's designed tests start here
// ({{threads_post_url}}) because nothing is published before the gate passes.
app.get("/post/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^c-[\w-]+Z$/.test(id)) return c.text("bad id", 400);
  const f = Bun.file(`runs/${id}.json`);
  if (!(await f.exists())) return c.text("not found", 404);
  const rec = (await f.json()) as CampaignRecord;
  const post = rec.final ?? rec.attempts.at(-1)?.campaign ?? rec.draft;
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const body = esc(post.post_copy).replace(esc(post.cta_url), `<a href="${esc(post.cta_url)}">${esc(post.cta_url)}</a>`);
  return c.html(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Post preview: ${esc(post.campaign_tag)}</title>
<style>body{margin:0;background:#000;color:#fff;font:16px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;display:grid;place-items:start center;padding:48px 16px}
article{max-width:560px;border:1px solid #262626;border-radius:12px;padding:20px 22px;background:#0b0b0b}
.label{font:12px ui-monospace,Menlo,monospace;color:#8a8a8a;margin-bottom:12px}a{color:#fff;word-break:break-all}</style></head>
<body><article><div class="label">Post preview, not published · campaign ${esc(post.campaign_tag)} · ${esc(rec.id)} · ${esc(rec.status)}</div>
<p>${body}</p></article></body></html>`);
});

app.use("/*", serveStatic({ root: "./public" }));

export default { port: 3000, fetch: app.fetch, idleTimeout: 0 };
