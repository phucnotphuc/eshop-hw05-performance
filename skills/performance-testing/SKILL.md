---
name: performance-testing
description: Use when asked to design and run Load/Stress/Spike performance tests against a REST API with JMeter and analyse the .jtl results. Drives an AI step-by-step to build a CSV-driven end-to-end workflow test plan covering auth/read/transactional endpoint groups, run it headless, generate HTML dashboards, and extract p50/p95/throughput/error-rate for a misinterpretation-checked analysis. Triggers: "load test", "stress test", "spike test", "JMeter test plan", "performance test this API", "analyse .jtl", "find the endurance threshold".
---

# Performance Testing (JMeter, API)

Reusable workflow to performance-test a REST API end to end. Do NOT issue one generic
"load test this" prompt — drive each step.

## Step 1 — Map endpoints to the three groups
From the API spec, pick ONE end-to-end workflow that touches all three:
- **auth-heavy** — login (note any account-lockout rule).
- **read-heavy** — list/search + detail (GET).
- **transactional** — create/mutate (cart → coupon → checkout / order).
Confirm exact paths, ports, request bodies, auth header, and seed credentials from the repo
before writing any test plan. Never assume paths.

## Step 2 — Make it data-driven
Create CSV files (credentials, product IDs, coupon codes). Pre-seed a **user pool** (e.g. register
50 accounts) so concurrent virtual users don't collide or trip lockout. Valid logins usually do
NOT lock; only wrong-password attempts do — keep the auth step using valid creds unless lockout is
the thing under test.

## Step 3 — Build ONE base plan, parameterize the rest
Generate a single `.jmx` with: CSV Data Set Configs, HTTP Header Manager (Content-Type +
`Authorization: Bearer ${token}`), the samplers in workflow order, a **JSON Extractor** on login
(pull `token` AND any `user.id` needed downstream), a **Response Assertion** per step, and a
**Uniform Random Timer** (think-time) between steps. Expose threads/ramp/duration via
`${__P(NAME,default)}` so scenarios differ only by properties, not by hand-edited XML.
See `references/jmx-template.md` for the exact element structure.

Scenario matrix (tune to hardware):

| Scenario | Threads | Ramp | Duration | Think | Listener (must differ) |
|---|---|---|---|---|---|
| Load | 50 | 60s | 10 min | 1–2s | Summary Report |
| Stress | ramp→300 | 180s | 6 min | 0.3–0.7s | Aggregate Report |
| Spike | 200 burst | 3s | 90s | 0.1–0.3s | View Results Tree |
| Soak | ~40 stable | 30s | 12–15 min | 1–2s | (reuse) |

Name plans `{StudentID}_{Scenario}_{YYYYMMDD}.jmx`.

## Step 4 — Human review the AI's plan
Check for: unrealistic ramp/think-time, wrong thread counts, weak/missing assertions, missing
lockout handling, hard-coded IDs that should be CSV. Record what the AI missed and *why*
(prompt gap, model limitation, or endpoint-specific behaviour).

## Step 5 — Run headless + evidence
`jmeter -n -t plan.jmx -l out.jtl -e -o html_dir -JTHREADS=.. -JDURATION=..`
Capture, in the same frame, the tool + the backend process resource usage (Task Manager/htop).
Reset lockout between stress/spike runs if triggered (wait the demo window or re-seed DB).

## Step 6 — Endurance threshold
Run a 10–15 min sustained soak. Report concrete numbers: max stable RPS (JMeter `/s`), memory
ceiling of the backend process, error rate.

## Step 7 — Analyse .jtl, hunt misinterpretations
Parse the raw `.jtl` (CSV): compute per-label count, error%, avg, p50, **p95**, p99, throughput.
See `references/analyse-jtl.md` for a ready parser. When an AI analyses the log, verify every
claimed number against the raw `.jtl` — cite the correct value for each misread. Classify each AI
optimization (DB index, connection pool, SQLite WAL, caching) as **feasible or hallucinated**
against the actual stack.

## Anti-patterns
- One generic prompt instead of step-by-step driving.
- Repeating the same listener type across plans.
- Averages only — always report p95/p99 for tail latency.
- Trusting AI metric claims without checking the raw log.
