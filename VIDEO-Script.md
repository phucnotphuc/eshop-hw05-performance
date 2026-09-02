# Demo Video Script — HW05 Performance Testing (23127249)

**Target:** ≥ 6 minutes, unlisted YouTube, **your Vietnamese voice**.
**Golden rule (anti-cheat):** the JMeter window AND Task Manager must be **visible in the same
frame** whenever a test runs. Keep Task Manager (Performance/Details tab, `node.exe` pinned) docked
on one side, JMeter/terminal on the other.

## Before you hit record
1. Start backend, keep the terminal visible:
   `cd D:\23127249\QA\hw4\eshop-sut\backend` then `node server.js`
2. Open **Task Manager** → Details → find `node.exe`, add CPU + Memory columns.
3. Open a terminal in `D:\23127249\QA\hw5\23127249_HW05_AI_Performance_XXX`.
4. Optional live graphs: launch GUI `D:\tools\apache-jmeter-5.6.3\bin\jmeter.bat` and open a `.jmx`.
5. Recorder: OBS or `Win+G`. Arrange windows side-by-side. Test your mic.

> Timings are a guide. Narrate naturally; don't read robotically. Total ≈ 6–7 min.

---

## 0:00 – 0:45 · Giới thiệu (show desktop + dxdiag System tab)
> "Xin chào thầy cô, em là [Họ tên], MSSV 23127249. Đây là bài HW05 – Performance Testing trên hệ
> thống EShop. Em dùng Apache JMeter 5.6.3. Máy của em tên `THIEUNAGG`, chip Intel i5-12500H, RAM 16
> GB, chạy Windows 11 — đúng với hostname em đã dùng ở các bài trước. Đây là màn hình dxdiag xác
> nhận cấu hình."

## 0:45 – 1:30 · Giải thích workflow (show api_specification.md + KNOWLEDGE file §4)
> "Em thiết kế một luồng end-to-end duy nhất, chạy chung cho cả ba kịch bản Load, Stress, Spike, và
> phủ đủ ba nhóm endpoint. Bước 1 là đăng nhập — nhóm auth — và em rút JWT token cùng user id. Bước
> 2 và 3 là tìm kiếm và xem chi tiết sản phẩm — nhóm read. Bước 4, 5, 6 là thêm giỏ hàng, áp mã giảm
> giá, và thanh toán — nhóm transactional. Dữ liệu được nạp từ file CSV: 50 tài khoản, 5 sản phẩm, 3
> mã giảm giá."

## 1:30 – 3:00 · Chạy LOAD (JMeter + Task Manager same frame)
Run: `bash test-plans/run_all.sh load` (or press Start in GUI). Point at the summariser lines.
> "Bây giờ em chạy kịch bản Load: 50 người dùng ảo, ramp-up 60 giây, kéo dài 10 phút, với think-time
> 1 đến 2 giây mô phỏng người dùng thật. Nhìn bên phải là Task Manager — tiến trình node.exe của
> backend. CPU rất thấp, RAM khoảng 45 đến 70 MB. Cột Err luôn bằng 0, tức không có lỗi. Throughput
> khoảng 6 request mỗi giây — thấp vì think-time chiếm phần lớn thời gian, đây là con số thực tế chứ
> không phải throughput tối đa."
(You can stop Load early after ~1 min of narration; you already have the full 10-min .jtl.)

## 3:00 – 4:15 · Chạy STRESS (same frame; watch CPU/RAM rise)
Run: `bash test-plans/run_all.sh stress`
> "Tiếp theo là Stress: tăng dần lên 300 người dùng trong 180 giây, think-time rút xuống còn 0.3–0.7
> giây để đẩy hệ thống tới giới hạn. Quan sát Task Manager: số luồng của node tăng, nhưng CPU vẫn
> thấp. Điều bất ngờ là error rate vẫn 0%, p95 chỉ 9 mili-giây. Nghĩa là ở 300 người dùng, backend
> vẫn chưa gãy. Throughput đạt khoảng 90 request mỗi giây."

## 4:15 – 5:15 · Chạy SPIKE (same frame; sudden burst)
Run: `bash test-plans/run_all.sh spike`
> "Kịch bản Spike: bắn 200 người dùng chỉ trong 3 giây, mô phỏng một cú tăng tải đột ngột, giữ trong
> 90 giây. Đây là lúc tải cao nhất — throughput đỉnh gần 196 request mỗi giây. Hệ thống hấp thụ được
> cú sốc, không có request nào thất bại, p95 khoảng 13 mili-giây. Nhóm đăng nhập chịu ảnh hưởng rõ
> nhất khi bùng nổ."

## 5:15 – 6:15 · Soak + đọc HTML report + kết luận ngưỡng
Open `results/html-report-stress/index.html` (Statistics + APDEX table).
> "Cuối cùng em chạy Soak — 40 người dùng liên tục trong 12 phút để kiểm tra rò rỉ bộ nhớ. RAM giữ
> ổn định quanh 72 MB, không tăng dần, không rò rỉ. Đây là báo cáo HTML của JMeter: bảng thống kê
> hiển thị p95, p99, throughput và error 0%. Kết luận: trên phần cứng này, backend chịu được tới 300
> người dùng và đỉnh 196 request/giây mà không gãy. Giới hạn thực sự em chạm tới là công cụ tạo tải
> JMeter trên một máy, chứ không phải server — vì SUT là ứng dụng SQLite nhỏ, truy vấn dưới 1 mili-
> giây."

## 6:15 – 7:00 · Agent Skill demo (Task 7 — bắt buộc cho phần skill)
Open `skills/performance-testing/SKILL.md`; scroll the 7 steps.
> "Em đóng gói toàn bộ quy trình này thành một Agent Skill tên `performance-testing`. Nó hướng dẫn AI
> đi từng bước: ánh xạ endpoint, tạo dữ liệu CSV, sinh file .jmx, chạy headless, rồi phân tích .jtl
> để lấy p95 và bắt các lỗi diễn giải của AI. Nhờ vậy có thể tái sử dụng cho các endpoint khác. Đây
> là file phân tích `analyze_jtl.js` cho ra các con số chuẩn mà em dùng để đối chiếu với AI. Em xin
> hết, cảm ơn thầy cô đã lắng nghe."

---

## Checklist before upload
- [ ] Length ≥ 6:00
- [ ] JMeter + Task Manager in same frame during every run
- [ ] Your voice, in Vietnamese, throughout
- [ ] Shows: dxdiag, all 3 scenarios, HTML report, agent skill
- [ ] Uploaded **Unlisted** → paste link into `README.md` + `report/Main-Report.md`

## If a run is too long on camera
You already have the full `.jtl` + HTML for every scenario. On camera you only need ~30–60 s of each
run to *show it happening live*; narrate over it, then stop. The graded data comes from the saved
logs, not the video.
