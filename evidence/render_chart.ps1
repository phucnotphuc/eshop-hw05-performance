# Renders resource_timeline.csv -> resource_timeline.png (CPU% + RAM MB over time)
Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot
$rows = Import-Csv (Join-Path $dir "resource_timeline.csv")
if (-not $rows) { Write-Error "no data"; exit 1 }
$W=1100; $H=460; $mL=60; $mR=60; $mT=40; $mB=50
$bmp = New-Object System.Drawing.Bitmap $W,$H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::White)
$fMem = [double]($rows | Measure-Object mem_mb -Maximum).Maximum
$memMax = [math]::Max(100, [math]::Ceiling($fMem/50)*50)
$n = $rows.Count
$pw = $W-$mL-$mR; $ph = $H-$mT-$mB
$penGrid = New-Object System.Drawing.Pen ([System.Drawing.Color]::LightGray),1
$penCpu  = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220,50,50)),2
$penMem  = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40,90,200)),2
$font = New-Object System.Drawing.Font "Segoe UI",9
$fontB = New-Object System.Drawing.Font "Segoe UI",11,([System.Drawing.FontStyle]::Bold)
$black = [System.Drawing.Brushes]::Black
# axes grid (0-100 cpu left, 0-memMax right)
for ($i=0;$i -le 10;$i++){
  $y = $mT + $ph - ($ph*$i/10)
  $g.DrawLine($penGrid,$mL,$y,$W-$mR,$y)
  $g.DrawString("$($i*10)",$font,$black,2,$y-8)                       # CPU %
  $g.DrawString("$([int]($memMax*$i/10))",$font,$black,$W-$mR+4,$y-8) # MEM MB
}
function XY($idx,$val,$max){
  $x = $mL + ($pw * $idx / [math]::Max(1,$n-1))
  $y = $mT + $ph - ($ph * [math]::Min($val,$max) / $max)
  New-Object System.Drawing.PointF($x,$y)
}
$cpuPts=@(); $memPts=@()
for ($i=0;$i -lt $n;$i++){
  $cpuPts += XY $i ([double]$rows[$i].cpu_pct) 100
  $memPts += XY $i ([double]$rows[$i].mem_mb) $memMax
}
if ($cpuPts.Count -gt 1){ $g.DrawLines($penCpu,[System.Drawing.PointF[]]$cpuPts) }
if ($memPts.Count -gt 1){ $g.DrawLines($penMem,[System.Drawing.PointF[]]$memPts) }
$g.DrawString("EShop backend (node.exe) resource timeline - Stress/Spike/Soak",$fontB,$black,$mL,8)
$g.DrawString("CPU %  (red, left)",$font,(New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220,50,50))),$mL,$H-20)
$g.DrawString("RAM MB (blue, right)",$font,(New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40,90,200))),$mL+160,$H-20)
$g.DrawString("t0=$($rows[0].timestamp)  t_end=$($rows[$n-1].timestamp)  samples=$n",$font,$black,$mL+360,$H-20)
$bmp.Save((Join-Path $dir "resource_timeline.png"),[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
$peakCpu=($rows|Measure-Object cpu_pct -Maximum).Maximum
$peakMem=($rows|Measure-Object mem_mb -Maximum).Maximum
"rendered resource_timeline.png  peakCPU=$peakCpu%  peakMem=$peakMem MB  samples=$n"