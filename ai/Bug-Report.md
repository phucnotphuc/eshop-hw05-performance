# Bug / Performance-Issue Report

**Scenarios:** Load, Stress, Spike, Soak (71 183 total samples). **GitHub Issues:** _<link if filed>_.

## Performance result: no functional failures
Across all four runs the error rate was **0.00 %** — no error responses, no crashes, no functional
regressions under load (up to 300 VU / 196 req/s burst). From a purely performance standpoint there
are **no bugs to file**: the backend was stable and fast (p95 ≤ 16 ms).

## Observations worth a GitHub issue (optional, not penalised)

| # | Observation | Type | Evidence |
|---|---|---|---|
| O-1 | **No rate limiting / throttling on `POST /api/login`.** The auth endpoint served ~2 998 logins during the 90 s spike with no back-pressure. The 3-fail lockout only counts *wrong-password* attempts per account; valid-credential floods are unthrottled — a brute-force / credential-stuffing surface. | Security / perf | Spike log: 2 998 login samples, 0 errors, p95 13 ms |
| O-2 | **SQLite runs in default rollback journal (no WAL).** Under a heavier write mix this serialises writers; enabling WAL would improve the checkout/register path. | Perf config | `database.js` opens `new sqlite3.Database` with no `PRAGMA journal_mode` |
| O-3 | **`users.email` is not indexed** although every login does `SELECT * FROM users WHERE email = ?`. Negligible at demo scale, but a real index gap. | Perf / schema | `server.js:35` query; no index in schema |

> These are performance-adjacent; per the brief, logging latency/error-rate issues is *encouraged
> but not required*. Functional/security bugs (e.g. plaintext password storage) are out of scope for
> this performance assignment and were covered in earlier homeworks.

## How to file (human)
For any issue above you choose to log: open the SUT GitHub Issues page, create an issue with the
evidence line + a screenshot, and paste the issue link here and in the README test summary.
