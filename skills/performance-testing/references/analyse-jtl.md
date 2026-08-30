# Reference — Analysing a `.jtl` log

A JMeter `.jtl` in CSV mode has a header row; the columns that matter for analysis:
`timeStamp, elapsed, label, responseCode, success, ...`.

Use `test-plans/analyze_jtl.js` (in this submission) to compute the authoritative numbers:

```
node analyze_jtl.js results/<StudentID>_Load_<date>.jtl
```

It prints, **per sampler label and overall**: count, error%, avg, min, max, p50, p90, **p95**, p99,
and throughput (req/s over the run window), and writes `analyze_summary.json`.

## Misinterpretation hunt (Task 2)
When an AI analyses the log, check each claim against this output:
- **"avg latency"** — AI often quotes the summariser's rolling average, not the true avg over all
  samples. Recompute from the raw `.jtl`.
- **"p95"** — AIs sometimes approximate p95 as `avg × k`. Always take the real percentile.
- **throughput** — must be `samples / (last_ts − first_ts)`, not `threads × loops`.
- **error%** — count `success=false` rows; a 200 with a failed assertion is still `success=false`.

## Classifying AI optimizations
For each proposed fix, judge against the real stack:
- **DB index / connection pool / SQLite WAL** — feasible only if the SUT actually uses that DB and
  the bottleneck is DB-bound (check whether latency scales with load or is flat).
- **"Add Redis cache", "shard the DB"** — usually hallucinated for a demo SQLite app; over-engineered
  relative to the measured bottleneck. Mark hallucinated with reasoning.
