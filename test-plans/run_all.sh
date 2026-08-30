#!/usr/bin/env bash
# HW05 runner — 23127249. Runs each scenario, emits .jtl + HTML dashboard.
# Usage (Git Bash):  bash run_all.sh [load|stress|spike|soak|all]
set -u
JMW='D:\tools\apache-jmeter-5.6.3\bin\jmeter.bat'
PLANS='D:\23127249\QA\hw5\23127249_HW05_AI_Performance_XXX\test-plans'
RES='D:\23127249\QA\hw5\23127249_HW05_AI_Performance_XXX\results'
resu='/d/23127249/QA/hw5/23127249_HW05_AI_Performance_XXX/results'
SID=23127249; D=20260830

run(){ # name plan_scenario props...
  local name="$1"; local plan="$2"; shift 2
  local jtl="$RES\\${SID}_${name}_${D}.jtl"
  local html="$RES\\html-report-${name}"
  rm -f "$resu/${SID}_${name}_${D}.jtl"; rm -rf "$resu/html-report-${name}"
  echo "=== RUN $name ==="
  cmd //c "$JMW -n -t $PLANS\\${SID}_${plan}_${D}.jmx -l $jtl -e -o $html $* -j $RES\\jmeter_${name}.log" \
    2>&1 | tr -d '\r' | grep -aE "summary [=+]|Err:"
  echo "--- $name done: $jtl ---"
}

case "${1:-all}" in
  load)   run load   Load   -JTHREADS=50  -JRAMP=60  -JDURATION=600 ;;
  stress) run stress Stress -JTHREADS=300 -JRAMP=180 -JDURATION=360 ;;
  spike)  run spike  Spike  -JTHREADS=200 -JRAMP=3   -JDURATION=90  ;;
  soak)   run soak   Load   -JTHREADS=40  -JRAMP=30  -JDURATION=720 ;;  # 12-min sustained
  all)
    run load   Load   -JTHREADS=50  -JRAMP=60  -JDURATION=600
    run stress Stress -JTHREADS=300 -JRAMP=180 -JDURATION=360
    run spike  Spike  -JTHREADS=200 -JRAMP=3   -JDURATION=90
    run soak   Load   -JTHREADS=40  -JRAMP=30  -JDURATION=720 ;;
  *) echo "unknown: $1"; exit 1 ;;
esac
