# Runbook — Human Capture Evidence (23127249)

These items **cannot be AI-generated** (anti-cheat §11). You must capture them yourself.
The `.jtl` logs + HTML reports are already produced by `run_all.sh`; this runbook is for the
**resource-monitor screenshots**, the **hardware report**, and the **demo video**.

---

## 0. Prep (once)
- Keep the backend running: `node server.js` in `D:\23127249\QA\hw4\eshop-sut\backend` (port 3000).
- Hardware report: follow `evidence/hardware-spec-table.md` → save `dxdiag.txt` + `hardware-dxdiag.png`.
- Open **Task Manager** → Details tab → find `node.exe` (the backend). Add columns CPU + Memory.

## 1. Per-scenario screenshot (Load / Stress / Spike) — 3 shots minimum
For each scenario, take **one screenshot that shows BOTH** in the same frame:
1. The JMeter window (GUI listener or the console summary line), **and**
2. Task Manager with the backend `node.exe` CPU/RAM.

Save as:
- `evidence/resource-load.png`
- `evidence/resource-stress.png`
- `evidence/resource-spike.png`

> Tip: to re-run a single scenario while you watch, in Git Bash:
> `bash 23127249_HW05_AI_Performance_XXX/test-plans/run_all.sh stress`
> (Use the GUI — `jmeter.bat -t <plan>` — if you prefer live graphs on screen for the video.)

## 2. Account-lockout reset (Stress/Spike only, if triggered)
The workflow logs in with valid pooled users, so lockout should NOT trigger. If you deliberately
test wrong-password load and hit the 3-fail / 30-second lockout:
- **Reset option A:** wait 30 seconds (demo lockout auto-clears).
- **Reset option B:** re-seed DB: `node database.js` in the backend folder.
- Screenshot the lockout response + the reset step → `evidence/lockout-reset.png`, and document
  the steps in the main report.

## 3. Endurance / soak threshold
`run_all.sh soak` runs 12 minutes sustained (40 VU). While it runs, watch Task Manager and note:
- Max stable RPS (from JMeter summary `=` line, the `/s` value).
- Memory ceiling of `node.exe` (peak MB).
- Whether error rate stays 0%.
Record the numbers in the report §Endurance. Screenshot → `evidence/resource-soak.png`.

## 4. Demo video (≥ 6 minutes, unlisted YouTube, YOUR Vietnamese voice)
Must show **the tool and the resource monitor in the same frame**. Suggested structure (VN narration):

| Time | Show | Say (VN, outline) |
|---|---|---|
| 0:00–0:45 | Màn hình desktop, hostname `ThieuNagg`, mở dxdiag | Giới thiệu máy, MSSV, cấu hình phần cứng |
| 0:45–1:15 | api_specification.md + workflow diagram | Giải thích workflow E2E: login → search → detail → cart → coupon → checkout, và 3 nhóm endpoint |
| 1:15–3:00 | JMeter chạy **Load**, Task Manager cạnh bên | Giải thích 50 VU, ramp 60s, think-time, chỉ số throughput/latency/error |
| 3:00–4:30 | JMeter chạy **Stress**, quan sát CPU/RAM tăng | Điểm gãy, error rate tăng ở đâu |
| 4:30–5:30 | JMeter chạy **Spike** | Burst 200 VU, khả năng phục hồi |
| 5:30–6:30 | Soak + HTML report (p95, throughput) | Ngưỡng chịu tải của phần cứng, kết luận |

- Record with OBS / Xbox Game Bar (`Win+G`). Export, upload to YouTube as **Unlisted**.
- Paste the link into `README.md` and `report/Main-Report.md`.

## 5. Bugs → GitHub Issues
If any genuine bug appears (error responses, crash, functional regression), file it on the SUT's
GitHub Issues with a screenshot. Copy the issue link + screenshot into `evidence/` and the Bug Report.
(Pure latency / high error-rate perf issues are optional to log.)

---

**Checklist**
- [ ] `hardware-dxdiag.png` + `dxdiag.txt`
- [ ] `resource-load.png` / `resource-stress.png` / `resource-spike.png` / `resource-soak.png`
- [ ] `lockout-reset.png` (only if triggered)
- [ ] Demo video ≥6 min uploaded (unlisted) + link in README
- [ ] Bug issues filed (if any)
