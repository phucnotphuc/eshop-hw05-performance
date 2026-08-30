# AI Audit Report (Mandatory Appendix)

**Declaration:** *I use AI tools for the following tasks.*

- **AI tool:** Claude (Opus 4.8) via Claude Code CLI.
- **Session date:** 2026-08-30.
- **Role of AI:** designed and generated the JMeter test plans, the CSV data, the analyzer and
  runner scripts, the CPT proposal, and the agent skill; drove test execution; analysed the raw
  `.jtl` logs. **All output was reviewed and corrected by the student** (see Main Report §3).

Human-only work (NOT AI-generated, per anti-cheat §11): the demo video + narration, the
resource-monitor screenshots, the `dxdiag` hardware report, and the GitHub issue filings.

---

## Interaction log

### [1] 2026-08-30 — Master plan + endpoint mapping
- **Prompt:** "read the HW05 requirements … the previous features I chose in hw2/test-cases. Create
  a master plan step by step and guide me to install things."
- **AI output (summary):** Read the requirements + HW02 test cases; mapped FR20/FR05-15/FR07-09 to
  auth/read/transactional; produced `MASTER-PLAN.md`; guided JMeter install and SUT startup.
- **Human review:** Accepted mapping; confirmed tool = JMeter, SUT already local.

### [2] 2026-08-30 — Setup (install + run)
- **Prompt:** "installing and running the backend for me."
- **AI output:** Installed backend deps, seeded DB, started `node server.js` (port 3000),
  downloaded + unzipped JMeter 5.6.3, verified login + products endpoints, registered a 50-user
  pool via `POST /api/register`.
- **Human review:** Verified server reachable; confirmed seed accounts.

### [3] 2026-08-30 — Generate + validate test plans
- **Prompt:** "continue full workflow, make sure commit step by step."
- **AI output:** Wrote `generate_plans.js`; produced Load/Stress/Spike `.jmx`; smoke-tested the
  workflow (all 6 samplers HTTP 200); parameterized threads via `${__P(...)}`; committed each plan
  separately.
- **AI mistakes caught (Main Report §3):** wrong coupon path; missing `user_id` extraction; single
  user vs pool; missing auth header; averages-only. All corrected before final plans.

### [4] 2026-08-30 — Execute + generate reports
- **AI output:** `run_all.sh` ran Load/Stress/Spike/Soak headless, produced raw `.jtl` +
  HTML dashboards under `results/`.

### [5] 2026-08-30 — Analyse logs (Task 2)
- **AI output:** `analyze_jtl.js` computed p50/p95/p99/throughput/error% from the raw logs; AI drew
  conclusions; student verified each number against the raw `.jtl` (see AI-Analysis-Critique.md).

### [6] 2026-08-30 — CPT proposal + agent skill
- **AI output:** `CPT-Proposal.md` (flow chart + trade-offs); `performance-testing` skill + refs.

> Verbatim prompts are the four user messages above; full assistant outputs are the committed
> artifacts in this repository (see `git_commit_log.txt` for the step-by-step trail).
