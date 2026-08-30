# AI Critique (Task 10)

*(238 words)*

Across this assignment the AI was a fast but literal collaborator, and its failures clustered in
one place: **assumptions it made instead of reading the source of truth.** When generating the
JMeter workflow it guessed the coupon endpoint as `/api/coupons/apply` from REST convention, when
the SUT's `api_specification.md` clearly defines `POST /api/apply-coupon`. It also extracted only
the JWT `token` from the login response and missed that the coupon call needs `user_id`, because it
reasoned about each request in isolation rather than tracing data dependencies across the workflow.
It defaulted to reusing a single seed account for every virtual user — technically runnable, but it
would have produced unrealistic cache locality and risked the account-lockout rule, which the model
never surfaced on its own. Finally, its instinct was to report *average* latency; it took an
explicit correction to make it report p95/p99, the metrics that actually expose a transactional
tail.

Why did it miss these? The common thread is that the AI optimizes for a plausible, runnable
artifact, not a *faithful* one: it fills gaps with convention and prior probability instead of
verifying against the concrete spec, and it has a bias toward flattering numbers (high throughput,
low average). It cannot tell when a guess is cheap versus load-bearing.

The principle I take away: **the AI drafts, the specification decides.** Every AI-produced value —
an endpoint, a payload field, a threshold — must be checked against the raw artifact (the API doc,
the seed data, the `.jtl`), because that is precisely where the model is confidently wrong.
