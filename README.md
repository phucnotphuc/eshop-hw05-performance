# HW05 — Performance Testing · 23127249

**Tool:** Apache JMeter 5.6.3 · **AI:** Claude (Opus 4.8) · **SUT:** EShop (Node.js + SQLite)
**Machine:** `ThieuNagg` (i5-12500H, 16 GB, Windows 11)
**GitHub repo:** https://github.com/phucnotphuc/eshop-hw05-performance
**Demo video (unlisted, ≥6 min):** https://youtu.be/TQvyZmTpIEE

## Self-Assessment

| No. | Criteria | Max | Self-Assessed |
|---|---|---|---|
| 1 | Task 1 — Load testing | 20 | 19 |
| 2 | Task 1 — Stress testing | 20 | 19 |
| 3 | Task 1 — Spike testing | 20 | 19 |
| 4 | Task 2 — AI analysis + misinterpretation hunt | 10 | 10 |
| 5 | Task 3 — Continuous Performance Testing proposal | 10 | 10 |
| 6 | Agent Skill | 10 | 9 |
| | **Total** | **100** | **86** |

> Self-assessed 86 assumes the **demo video** is recorded + linked (the one human-only deliverable
> still pending). Without it, Task 1 grades drop. Adjust after final review.

## Test summary

- **Scenarios run:** Load (50 VU/10 min, 6.37 req/s), Stress (→300 VU/6 min, 90.15 req/s), Spike
  (200 VU burst/90 s, 195.8 req/s), Soak (40 VU/12 min, 5.25 req/s). **0.00 % errors in all four**
  (71 183 total samples).
- **Endpoint groups covered:** auth-heavy (`/api/login`), read-heavy (`/api/products`,
  `/api/products/:id`), transactional (`/api/cart`, `/api/apply-coupon`, `/api/checkout`) — all in
  one E2E workflow.
- **Endurance threshold:** no functional breaking point up to 300 VU / 196 req/s burst (0 % errors,
  p95 ≤ 16 ms). Sustained ~90 req/s at 300 VU; backend memory ceiling **~72 MB** (no leak over
  12 min); CPU negligible. The limiter was the JMeter client + think-time, not the server.
- **Bugs / performance issues:** 0 functional/perf failures under load; 3 optional
  performance-adjacent observations logged (`ai/Bug-Report.md`).
- **Demo video:** https://youtu.be/TQvyZmTpIEE.

## Layout

```
report/     Main-Report.md/pdf, CPT-Proposal.md
test-plans/ 3 .jmx + generate_plans.js + run_all.sh + analyze_jtl.js
data/       users.csv (50), products.csv, coupons.csv
results/    3 .jtl + html-report-{load,stress,spike,soak}/  + analyze_summary.json
evidence/   resource-*.png, hardware-dxdiag.png, dxdiag.txt, spec table, runbook
ai/         AI-Audit-Report.md, AI-Analysis-Critique.md, AI-Critique.md, Bug-Report.md
skills/performance-testing/  SKILL.md + references/
git_commit_log.txt
```

## How to reproduce

```bash
# 1. start SUT
cd D:/23127249/QA/hw4/eshop-sut/backend && node database.js && node server.js
# 2. (re)generate plans
node 23127249_HW05_AI_Performance_XXX/test-plans/generate_plans.js
# 3. run all scenarios + HTML reports
bash 23127249_HW05_AI_Performance_XXX/test-plans/run_all.sh all
# 4. analyse
node 23127249_HW05_AI_Performance_XXX/test-plans/analyze_jtl.js results/*.jtl
```
