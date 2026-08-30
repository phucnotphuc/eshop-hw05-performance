# Task 2 — AI Analysis + Misinterpretation Hunt

**AI tool:** Claude (Opus 4.8). **Method:** the raw `.jtl` files were handed to the AI with the
prompt *"Analyse these JMeter logs and suggest performance thresholds and optimizations."* Below is
the AI's analysis (its output), then my human review citing the **correct values from the raw
`.jtl`** (via `analyze_jtl.js`), then a feasibility ruling on its recommendations.

---

## A. The AI's analysis (raw AI output, verbatim summary)

> 1. "Under the **Stress** test the system is **overloaded at 300 users** — with that many
>    concurrent threads you should expect a rising error rate and failed checkouts."
> 2. "Average response time is around 3 ms, so **p95 is roughly 6 ms** (about twice the average)."
> 3. "**Throughput is ~300 requests/sec** in the stress run, since 300 threads each fire requests."
> 4. "**Checkout is the bottleneck** and shows *high latency* that will hurt users."
> 5. "The **Spike** test likely dropped requests during the burst; expect some 5xx responses."
> 6. Recommendations: add a **database index**, introduce a **connection pool**, enable **SQLite
>    WAL mode**, add a **Redis cache**, and **shard the database** to scale.

## B. Human review — misinterpretations vs the raw `.jtl`

| # | AI claim | Correct value (from raw `.jtl`) | The error |
|---|---|---|---|
| 1 | "Overloaded at 300 users, rising errors" | Stress **error % = 0.00** across **32 215** samples; overall **p95 = 9 ms** | No overload at all. The AI assumed high VU ⇒ failure; the log shows zero errors and flat latency. High concurrency ≠ saturation. |
| 2 | "p95 ≈ 2 × avg ≈ 6 ms" | Real Stress **p95 = 9 ms**, **p99 = 14 ms**, **max = 67 ms** | p95 is a measured percentile, not a multiple of the mean. The AI fabricated it from the average instead of reading the distribution — the real tail is 3× the mean, not 2×. |
| 3 | "Throughput ~300 req/s (threads × rate)" | Real Stress throughput = **90.15 req/s** (= 32 215 samples ÷ 357 s window) | Throughput is samples over the elapsed window, **not** the thread count. Think-time (0.3–0.7 s) between the 6 steps caps real RPS far below the VU number. |
| 4 | "Checkout is a bottleneck with high latency" | Checkout Stress **avg 7 ms, p95 12 ms** (Load: avg 8, p95 10) | Checkout *is* the slowest step relatively, but 12 ms is not "high latency". It's the slowest of six fast steps — a relative ranking mis-stated as an absolute problem. |
| 5 | "Spike dropped requests / 5xx expected" | Spike **error % = 0.00** across **17 453** samples; peak throughput **195.8 req/s** | Pure speculation contradicted by the log — every spike request succeeded. |
| 6 | (see optimizations below) | — | Mix of feasible and hallucinated (Section C). |

**Why the AI failed to catch these:** it pattern-matched on priors ("300 users = stress = errors",
"average ≈ p95", "threads = throughput") instead of computing from the actual samples. LLMs are
biased toward the *typical* narrative of a stress test and toward numbers that are easy to derive
(a multiple of the mean) rather than the real percentile in the data.

## C. Judging the AI's recommendations (feasible vs hallucinated)

Stack (verified from source): **Express + async `sqlite3`** (node-sqlite3), default rollback
journal, no WAL, `users.email` not indexed, `products.id` is the PK.

| Recommendation | Verdict | Reasoning |
|---|---|---|
| **Enable SQLite WAL** (`PRAGMA journal_mode=WAL`) | **Feasible** | Real, applicable improvement: WAL lets readers proceed during a write, which helps the write path (register/checkout) under concurrency. Cheap one-line change on this exact driver. Measured benefit would be small *here* because writes are already sub-ms, but the suggestion is technically sound. |
| **Add DB index** | **Feasible but negligible** | `users.email` (used by login) is genuinely unindexed → an index is valid engineering. But the table has ~52 rows, so at this data volume the planner scans in microseconds; no measurable p95 gain. Correct in principle, useless at current scale. |
| **Connection pool** | **Hallucinated (for this stack)** | SQLite is an embedded single-writer engine; node-sqlite3 serialises statements on one connection. A classic client-server "connection pool" does not apply — the AI transplanted a Postgres/MySQL pattern onto SQLite. |
| **Redis cache** | **Hallucinated / over-engineered** | Reads are already 2–4 ms from an in-process DB. Adding a network hop to Redis would likely *increase* latency and adds infra the demo doesn't warrant. No measured cache-miss problem exists to solve. |
| **Shard the database** | **Hallucinated** | Sharding addresses data-volume/write-scaling limits that a 5-product SQLite demo is nowhere near. Pure buzzword scaling with zero evidence in the logs. |
| *(my addition)* **Distributed JMeter / bigger dataset** | **Feasible & correct next step** | The real limit hit was the load generator + think-time, not the server. To find the server's true knee, generate load from multiple JMeter nodes and seed a realistic dataset. |

## D. Correct thresholds (derived from the raw logs)
- **No functional breaking point** observed up to 300 VU / 196 req/s burst (0 % errors).
- **Latency SLO suggestion:** p95 ≤ 20 ms, p99 ≤ 30 ms (current worst p99 = 19 ms in Spike) — a
  regression gate at p95 × 1.10 would flag any real slowdown.
- **Endurance:** stable for 12 min at 40 VU, memory capped ~72 MB, no leak.
