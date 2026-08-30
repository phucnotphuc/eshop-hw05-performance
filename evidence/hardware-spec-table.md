# Hardware Report — 23127249

> Anti-cheat: hostname **must match** your previous HW deployments. Attach a `dxdiag` screenshot showing the same hostname.

| Field | Value |
|---|---|
| Hostname | `ThieuNagg` |
| OS | Windows 11 Home Single Language, Version 10.0.26200.9168 |
| CPU | 12th Gen Intel Core i5-12500H (12 cores / 16 threads) |
| RAM | 16 GB (15.7 GB usable) |
| JDK | OpenJDK 25.0.2 LTS |
| Tool | Apache JMeter 5.6.3 |
| SUT | EShop backend (Node.js + SQLite) on `http://localhost:3000` |

## How to capture the dxdiag evidence
1. Press `Win + R`, type `dxdiag`, Enter.
2. On the **System** tab, confirm *Machine name* = `ThieuNagg`.
3. Click **Save All Information…** → save `dxdiag.txt` into this `evidence/` folder.
4. Screenshot the System tab (hostname visible) → `evidence/hardware-dxdiag.png`.
