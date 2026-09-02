# Knowledge Pack — JMeter + This Project (for understanding & oral defense)

Read this once. It explains the tool, the concepts, and exactly what *your* submission did.
30% of students get a 5–7 min oral defense — this is your cheat sheet.

---

## 1. What is JMeter?
Apache JMeter is a **load-testing tool**. It pretends to be many users hitting an API at once, then
measures how fast the server responds and whether it fails. It is a Java app (needs a JDK). You
build a **test plan** (`.jmx` file), run it, and it writes raw results to a `.jtl` file.

### Key building blocks (the pieces inside our `.jmx`)
| Element | What it does | In our plan |
|---|---|---|
| **Thread Group** | A pool of virtual users (VU). "Threads" = concurrent users. | 50 / 300 / 200 depending on scenario |
| **Ramp-up** | Time to start all threads (avoid all users hitting at t=0). | Load 60 s, Stress 180 s, Spike 3 s |
| **Loop / Duration** | How long / how many times each user repeats the workflow. | Scheduler with duration in seconds |
| **HTTP Sampler** | One API request (GET/POST + path + body). | 6 of them = the workflow |
| **CSV Data Set Config** | Feeds data from a file so each user uses different values. | users/products/coupons CSV |
| **JSON Extractor** (post-processor) | Pulls a value out of a response into a variable. | grabs `token` + `user.id` from login |
| **Header Manager** | Sets HTTP headers. | `Content-Type` + `Authorization: Bearer ${token}` |
| **Response Assertion** | Pass/fail check on a response. | status 200 / body contains text |
| **Uniform Random Timer** | "Think-time" — a pause between requests, like a real human. | 0.1–2 s depending on scenario |
| **Listener** | Collects/shows results (Summary / Aggregate / Tree). | one distinct type per plan |

---

## 2. The four test types (know the difference — common defense question)

| Type | Question it answers | How we set it |
|---|---|---|
| **Load** | "Does it work fine under *normal* expected traffic?" | 50 VU, realistic 1–2 s think-time, 10 min |
| **Stress** | "Where does it *break*? What's the ceiling?" | ramp up to 300 VU, tiny think-time, watch for errors/latency knee |
| **Spike** | "Can it survive a *sudden burst* and recover?" | 200 VU injected in 3 s, hold 90 s |
| **Soak / Endurance** | "Does it degrade or leak memory over *time*?" | steady 40 VU for 12 min, watch memory |

---

## 3. The metrics (what the numbers mean)

- **Throughput (req/s)** = requests completed per second = `samples ÷ time-window`. **NOT** thread
  count. Think-time lowers it.
- **Response time / latency (ms)** = time from sending request to getting the response.
- **avg** = mean. Misleading — a few slow requests barely move it.
- **p95 / p99 (percentiles)** = 95%/99% of requests were faster than this. **This is the real
  measure of user pain** (the slow tail). We report p95, not just avg.
- **Error %** = fraction of requests that failed (bad status OR failed assertion). 0% = healthy.
- **min / max** = fastest / slowest single request.

> Defense trap: "average is 3 ms so p95 is ~6 ms" is **wrong**. p95 is measured from the data, not
> a multiple of the average. Our real Stress p95 = 9 ms while avg = 3 ms.

---

## 4. What OUR test actually does (the workflow)

One end-to-end user journey, reused by all 3 scenarios, covering all 3 required endpoint groups:

```
1. POST /api/login            (AUTH group)  -> extract JWT token + user.id
2. GET  /api/products?search= (READ group)  -> search
3. GET  /api/products/:id     (READ group)  -> product detail
4. POST /api/cart             (TXN group)   -> add to cart (needs Bearer token)
5. POST /api/apply-coupon     (TXN group)   -> apply discount (needs user_id)
6. POST /api/checkout         (TXN group)   -> place order
```

- **Data-driven:** `users.csv` (50 pre-registered accounts so users don't collide), `products.csv`
  (5 items), `coupons.csv` (SAVE10/BIGBUY/VIP100).
- **SUT:** EShop backend = Node.js (Express) + **SQLite**, on `http://localhost:3000`.
- **Naming:** plans are `23127249_{Load|Stress|Spike}_20260830.jmx` (required format).
- **3 distinct report views:** Load=Summary Report, Stress=Aggregate Report, Spike=View Results Tree.

---

## 5. Our results (memorize the headline numbers)

| Scenario | VU | Throughput | Error % | p95 |
|---|---|---|---|---|
| Load | 50 | 6.37 req/s | 0.00 | 8 ms |
| Stress | →300 | 90.15 req/s | 0.00 | 9 ms |
| Spike | 200 burst | 195.8 req/s | 0.00 | 13 ms |
| Soak | 40 / 12 min | 5.25 req/s | 0.00 | 7 ms |

**Headline finding:** the backend **never broke** (0 errors up to 300 VU / 196 req/s burst, p95 ≤
16 ms). Backend memory capped ~72 MB, no leak over 12 min. The real limit we hit was the **JMeter
client + think-time on one machine**, not the server — because the SUT is a tiny SQLite demo (5
products, sub-millisecond queries). To truly saturate it you'd need distributed JMeter + a big
dataset. Saying this *is* the correct, honest conclusion.

---

## 6. How to read the HTML dashboard
Open `results/html-report-<scenario>/index.html`. Key spots:
- **APDEX** table (top): satisfaction score per request, PASS/FAIL.
- **Statistics** table: samples, error%, avg, min, max, **90%/95%/99% line**, throughput.
- **Charts → Response Times Over Time / Throughput**: visual trend.

---

## 7. Likely oral-defense questions (and your answers)

- **"Why these endpoints?"** They map to the three required groups (auth/read/transactional) and
  match my HW02 features (FR20 login, FR15 products, FR09 coupon); not duplicated with teammates.
- **"Why 50/300/200 threads?"** Load = normal; Stress ramps to 300 to find the ceiling; Spike is a
  200-VU burst to test recovery. Numbers tuned to what one machine can generate.
- **"Why think-time?"** Real users pause; without it, throughput is unrealistically inflated and you
  test the client, not the system.
- **"Did it break? What's the threshold?"** No functional break; ~90 req/s sustained, 196 burst, 0%
  errors, memory ~72 MB. Limit was the load generator, not the SUT — documented honestly.
- **"What did the AI get wrong?"** Guessed wrong coupon path, missed `user_id`, claimed p95≈2×avg,
  said throughput=threads, predicted overload/5xx that never happened. I verified every number
  against the raw `.jtl`. (Full list in `ai/AI-Analysis-Critique.md`.)
- **"Which AI fixes were real?"** SQLite WAL = feasible; email index = feasible-but-negligible;
  connection pool / Redis / sharding = hallucinated for a SQLite demo.
- **"What's p95?"** 95% of requests were faster than this value; it exposes the slow tail that the
  average hides.

---

## 8. Glossary
- **VU / thread** — one simulated user.
- **JTL** — JMeter's raw results log (CSV).
- **JMX** — the test-plan file.
- **JWT** — the login token; sent as `Authorization: Bearer <token>`.
- **Assertion** — automated pass/fail check on a response.
- **Ramp-up** — time to spin up all users.
- **Soak** — long steady-load test to catch leaks/degradation.
