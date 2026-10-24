# Omni Verify

A launch gate for AI growth campaigns. An OpenAI agent drafts a campaign and turns each claim into a testable assertion. Kane CLI walks the real funnel in a browser. Failed claims get repaired and re-run. Only campaigns that pass are marked **Verified for launch**, with Kane evidence attached.

Built at Kane CLI Hack Day (2026-10-24).

## Run

```
bun install && bun run dev
# open http://localhost:3000
```

Needs `.env` with `OPENAI_API_KEY` and `OPENAI_MODEL`, plus `kane-cli` and `kanehack` on PATH.

## The Scribo finding

_TODO_

## Evidence

- `fixtures/kane-sample.ndjson`: raw NDJSON from the first Kane run (Step 0), used to write the parser.
- `evidence/`: _TODO_
