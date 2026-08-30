/*
 * analyze_jtl.js — parse a JMeter .jtl (CSV) and print per-label + overall stats.
 * Usage: node analyze_jtl.js <file.jtl> [file2.jtl ...]
 * Reports: count, error%, avg, min, max, p50, p90, p95, p99, throughput(req/s).
 * These are the AUTHORITATIVE numbers to check any AI analysis against.
 */
const fs = require('fs');

function pct(sorted, p){
  if (!sorted.length) return 0;
  const idx = Math.ceil(p/100 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length-1))];
}

function analyze(file){
  const lines = fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines[0].split(',');
  const ci = n => head.indexOf(n);
  const iTs=ci('timeStamp'), iEl=ci('elapsed'), iLbl=ci('label'), iOk=ci('success');
  const groups = {}; let all=[];
  let tMin=Infinity, tMax=-Infinity;
  for (let k=1;k<lines.length;k++){
    // naive CSV split is fine: our labels have no commas
    const c = lines[k].split(',');
    const lbl=c[iLbl], el=+c[iEl], ok=c[iOk]==='true', ts=+c[iTs];
    if (Number.isNaN(el)) continue;
    (groups[lbl] ??= []).push({el,ok});
    all.push({el,ok});
    if (ts<tMin) tMin=ts; if (ts>tMax) tMax=ts;
  }
  const rows=[];
  const stat = (name, arr) => {
    const els = arr.map(x=>x.el).sort((a,b)=>a-b);
    const errs = arr.filter(x=>!x.ok).length;
    const sum = els.reduce((a,b)=>a+b,0);
    return {
      label:name, n:arr.length, errPct:(100*errs/arr.length).toFixed(2),
      avg:Math.round(sum/arr.length), min:els[0], max:els[els.length-1],
      p50:pct(els,50), p90:pct(els,90), p95:pct(els,95), p99:pct(els,99),
    };
  };
  for (const [lbl,arr] of Object.entries(groups)) rows.push(stat(lbl,arr));
  rows.sort((a,b)=>a.label.localeCompare(b.label));
  const overall = stat('ALL', all);
  const durSec = (tMax - tMin)/1000 || 1;
  overall.tput = (all.length/durSec).toFixed(2);

  console.log(`\n=== ${file} ===`);
  console.log(`window: ${durSec.toFixed(1)}s   samples: ${all.length}   throughput: ${overall.tput} req/s`);
  const cols=['label','n','errPct','avg','min','max','p50','p90','p95','p99'];
  const w=[26,6,7,6,5,6,6,6,6,6];
  const line = r => cols.map((c,i)=>String(r[c]??'').padEnd(w[i])).join(' ');
  console.log(line(Object.fromEntries(cols.map(c=>[c,c]))));
  rows.forEach(r=>console.log(line(r)));
  console.log(line({...overall, label:'ALL'}));
  return {file, overall, rows};
}

const files = process.argv.slice(2);
if (!files.length){ console.error('usage: node analyze_jtl.js <file.jtl> ...'); process.exit(1); }
const out = files.map(analyze);
fs.writeFileSync('analyze_summary.json', JSON.stringify(out,null,2));
console.log('\nwrote analyze_summary.json');
