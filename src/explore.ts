// Kane Explore: map the app's real funnel once, then draft campaigns from that map.
//
// `kane-cli explore run --agent` streams lifecycle events only; map_delta events carry no content.
// The map itself is written to <run_dir>/pending-deltas.ndjson: one {op:"delta", delta:{junctions, findings, ...}}
// per lease. A junction is a screen; its affordances are the controls on it, links with an href_pattern
// whose query values are stripped (e.g. apps.apple.com/app/apple-store/{slug}?ct&mt&pt).
// Every Kane command still goes through the kanehack recorder.

import { mkdir, writeFile } from "node:fs/promises";
import { expandHome, redact } from "./kane";

export type ExploreMap = {
  exploration_id: string;
  run_id: string;
  url: string;
  explored_at: string;
  stop: string | null; // done.remark from Kane, e.g. budget / completed
  screens: { name: string; url: string; heading: string | null; links: { name: string; href_pattern: string }[]; notes: string[] }[];
  handoffs: { screen: string; name: string; href_pattern: string }[]; // links that leave the site for an app store
  findings: { kind: string; severity: string; title: string }[];
};

const STORE_HOSTS = /^(apps\.apple\.com|play\.google\.com|itunes\.apple\.com)\//;

export function summarizeDeltas(ndjson: string): Pick<ExploreMap, "screens" | "handoffs" | "findings"> {
  const junctions = new Map<string, any>();
  const findings = new Map<string, any>();
  for (const line of ndjson.split("\n")) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    if (o.op !== "delta" || !o.delta) continue;
    for (const j of o.delta.junctions ?? []) junctions.set(j.id, j); // later deltas carry the fuller screen
    for (const f of o.delta.findings ?? []) findings.set(f.id, f);
  }
  const screens = [...junctions.values()].map((j) => {
    const seen = new Set<string>();
    const links = (j.affordances ?? [])
      .filter((a: any) => a.role === "link" && a.href_pattern)
      .map((a: any) => ({ name: String(a.name), href_pattern: String(a.href_pattern) }))
      .filter((l: any) => !seen.has(l.name + l.href_pattern) && seen.add(l.name + l.href_pattern));
    return { name: String(j.name), url: String(j.url), heading: j.heading ?? null, links, notes: (j.notes ?? []).map((n: any) => String(n.text)) };
  });
  // A hand-off leaves the app's own site for a store; links between store pages are not hand-offs.
  const onStore = (url: string) => STORE_HOSTS.test(url.replace(/^https?:\/\//, ""));
  const handoffs = screens
    .filter((s) => !onStore(s.url))
    .flatMap((s) => s.links.filter((l) => STORE_HOSTS.test(l.href_pattern)).map((l) => ({ screen: s.url, ...l })));
  return {
    screens,
    handoffs,
    findings: [...findings.values()].map((f) => ({ kind: String(f.kind), severity: String(f.severity), title: String(f.title) })),
  };
}

export function mapPath(appUrl: string): string {
  return `explore/${new URL(appUrl).hostname}.json`;
}

export async function loadMap(appUrl: string): Promise<ExploreMap | null> {
  const f = Bun.file(mapPath(appUrl));
  return (await f.exists()) ? ((await f.json()) as ExploreMap) : null;
}

async function configuredProject(): Promise<string> {
  const out = await new Response(Bun.spawn(["kane-cli", "config", "show", "--agent"], { stdout: "pipe" }).stdout).text();
  const id = JSON.parse(out).project_id;
  if (!id) throw new Error("No Kane project configured: run kane-cli config set-project");
  return id;
}

// Read-only exploration from this machine, capped, through the recorder. Saves the stream and the summary.
export async function runExplore(appUrl: string, opts: { prompt: string; maxLeases?: number; onLine?: (ev: any) => void }): Promise<ExploreMap> {
  const host = new URL(appUrl).hostname;
  const proc = Bun.spawn(
    [
      "kanehack", "report", "--",
      "kane-cli", "explore", "run", "--project", await configuredProject(), "--url", appUrl, "--prompt", opts.prompt,
      "--policy", "read_only", "--allow-domain", "apps.apple.com", "--max-leases", String(opts.maxLeases ?? 12),
      "--local-orchestration", "--headless", "--agent",
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const raw = await new Response(proc.stdout).text();
  await proc.exited;
  const events = raw.split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));
  for (const ev of events) opts.onLine?.(ev);
  return saveMap(appUrl, raw, events, host);
}

export async function saveMap(appUrl: string, raw: string, events: any[], host = new URL(appUrl).hostname): Promise<ExploreMap> {
  const started = events.find((e) => e.type === "explore_run_started");
  const done = events.findLast((e) => e.type === "done");
  if (!started) throw new Error("Kane Explore did not start a run");
  const deltas = await Bun.file(`${expandHome(redact(started.run_dir))}/pending-deltas.ndjson`).text();
  const map: ExploreMap = {
    exploration_id: started.exploration_id,
    run_id: started.run_id,
    url: appUrl,
    explored_at: started.ts,
    stop: done ? (typeof done.remark === "string" ? done.remark : JSON.stringify(done.remark ?? done.state ?? null)) : null,
    ...summarizeDeltas(deltas),
  };
  await mkdir("explore", { recursive: true });
  await writeFile(`explore/${host}.ndjson`, redact(raw));
  await writeFile(mapPath(appUrl), JSON.stringify(map, null, 2));
  return map;
}

// bun run explore <url>  → map the app once; drafts then use explore/<host>.json
// bun run explore <url> --from <stream.ndjson>  → summarize an exploration that already ran
if (import.meta.main) {
  const url = process.argv[2] ?? "https://scribo.cc";
  const from = process.argv.indexOf("--from");
  const map = from > 0
    ? await (async () => {
        const raw = await Bun.file(process.argv[from + 1]).text();
        return saveMap(url, raw, raw.split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l)));
      })()
    : await runExplore(url, {
        prompt: "Map how a new visitor gets from the homepage to installing the app: every call to action that leads to the App Store or a download, the exact link (href) each one uses, the pricing section, and any free-trial or price text. Do not sign in, subscribe or buy anything.",
      });
  console.log(`${map.screens.length} screens, ${map.handoffs.length} app-store hand-off links, ${map.findings.length} findings → ${mapPath(url)}`);
  for (const h of map.handoffs) console.log(`  ${h.screen}  "${h.name}" → ${h.href_pattern}`);
}
