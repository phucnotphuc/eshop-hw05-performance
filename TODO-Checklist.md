# TODO — What YOU Must Do Now

Everything else is done + committed. These need your screen, voice, or accounts.
Do in order. Tick as you go.

---

## ☐ 1. Review the graded core (~15 min)
Read these and confirm they sound like your work:
- [ ] `report/Main-Report.md` — §3 (what AI got wrong) + §4 (result numbers)
- [ ] `ai/AI-Analysis-Critique.md` — Task 2 misinterpretation hunt
- [ ] `ai/AI-Critique.md` — 238-word critique (your voice?)
- [ ] `report/CPT-Proposal.md` — Task 3 flow chart + trade-offs
- [ ] `README.md` — self-assessment table (I set **86** — change if you disagree)
- [ ] Open the 4 dashboards: `results/html-report-{load,stress,spike,soak}/index.html`

> Background knowledge for all of this + oral defense: `KNOWLEDGE-JMeter-and-Project.md`.

## ☐ 2. Record the demo video (REQUIRED — biggest missing item)
- [ ] Full script: `VIDEO-Script.md`
- [ ] ≥ 6 minutes, **your Vietnamese voice**
- [ ] JMeter window **and** Task Manager **in the same frame**
- [ ] Include a short part showing the agent skill (Task 7)
- [ ] Upload to YouTube as **Unlisted**
- [ ] Copy the link (needed in step 4)

**Start the backend first** (paste in this chat with `!`):
```
! cd D:\23127249\QA\hw4\eshop-sut\backend && node server.js
```
Then, in a second terminal, run a scenario live while recording:
```
! bash D:/23127249/QA/hw5/23127249_HW05_AI_Performance_XXX/test-plans/run_all.sh stress
```
(Or open the `.jmx` in the JMeter GUI for live graphs: `D:\tools\apache-jmeter-5.6.3\bin\jmeter.bat`.)

## ☐ 3. Hardware screenshot
- [ ] `Win + R` → type `dxdiag` → **System** tab
- [ ] Confirm *Machine name* = `THIEUNAGG`
- [ ] Screenshot → save as `evidence/hardware-dxdiag.png`
- [ ] (`evidence/dxdiag.txt` already exists)

## ☐ 4. Paste your links
- [ ] YouTube unlisted link → into `README.md` and `report/Main-Report.md`
- [ ] Public GitHub repo URL → into `README.md`

## ☐ 5. Push repo public
No git remote is set yet. Easiest: **tell me your GitHub repo URL and I'll push.** Or do it:
```
! git remote add origin <your-repo-url>
! git push -u origin hw05-deliverables
```
- [ ] Repo is **public** (grader must open it)

## ☐ 6. (Optional) File bug observations
- [ ] `ai/Bug-Report.md` lists 3 performance-adjacent observations
- [ ] File any on the SUT GitHub Issues + paste links back into the Bug Report

## ☐ 7. Re-zip after edits
The zip goes stale once you change files/links.
- [ ] Say **"re-zip"** and I rebuild `23127249_HW05_AI_Performance_086.zip`
- [ ] If you changed the grade, tell me the new number for the filename

## ☐ 8. Submit
- [ ] Upload the final `.zip` to Moodle before the deadline (late = not accepted)

---

### Quick "who did what" (for honesty declaration)
- **AI (Claude):** designed/generated plans, ran tests, analysed logs, wrote docs.
- **You:** review, video + voice, dxdiag screenshot, GitHub, submission — the attributable parts.
