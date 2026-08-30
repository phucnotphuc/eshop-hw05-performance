# Samples the EShop backend (node.exe) CPU% and RAM every 2s -> resource_timeline.csv
param([int]$Seconds = 1000)
$out = Join-Path $PSScriptRoot "resource_timeline.csv"
"timestamp,cpu_pct,mem_mb,threads" | Out-File -FilePath $out -Encoding utf8
$nCpu = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
$end = (Get-Date).AddSeconds($Seconds)
$prev = @{}
while ((Get-Date) -lt $end) {
  $p = Get-Process node -ErrorAction SilentlyContinue | Sort-Object WorkingSet64 -Descending | Select-Object -First 1
  if ($p) {
    $now = Get-Date
    $cpuTime = $p.TotalProcessorTime.TotalMilliseconds
    $cpuPct = 0
    if ($prev.ContainsKey($p.Id)) {
      $dt = ($now - $prev.time).TotalMilliseconds
      if ($dt -gt 0) { $cpuPct = [math]::Round((($cpuTime - $prev.cpu) / $dt) * 100 / $nCpu, 1) }
    }
    $prev = @{ Id = $p.Id; cpu = $cpuTime; time = $now }
    $mem = [math]::Round($p.WorkingSet64 / 1MB, 1)
    "$($now.ToString('HH:mm:ss')),$cpuPct,$mem,$($p.Threads.Count)" | Out-File -FilePath $out -Append -Encoding utf8
  }
  Start-Sleep -Seconds 2
}
