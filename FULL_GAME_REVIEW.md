# Review chức năng, liên kết nghiệp vụ và trải nghiệm game

Ngày review: 06/10/2026. Bản đang chạy tại localhost:3000.

## Kết luận

Game đã có nền tảng chơi được và bản sắc quán ăn Việt Nam rõ. Tuy nhiên, các chức năng **chưa liên kết hoàn chỉnh**, giao diện **chưa đồng bộ toàn bộ**, và thử thách kinh doanh **chưa đáng tin cậy** vì một số nguồn tiền, chi phí và trạng thái phục vụ vận hành khác nhau.

Nên sửa tính đúng đắn của vòng chơi trước khi thêm món, sự kiện hoặc tăng giá nâng cấp. Hiện tăng độ khó bằng giá tiền sẽ không giải quyết được những đường kiếm tiền vượt qua hệ thống phục vụ và kho.

## Phạm vi và bằng chứng

- Đọc store, vòng mô phỏng, dữ liệu dùng chung, mô hình giá/cầu, tài chính, nhân sự và các màn hình liên quan.
- Đối chiếu với tài liệu góp ý người dùng cung cấp: cầu – năng lực – tồn kho; áp lực dòng tiền; biến cố công bằng; tùy biến đơn; rủi ro theo quy mô. Đây là tiêu chí thiết kế, không phải hướng dẫn thao tác hệ thống.
- Quan sát trình duyệt ở khung điện thoại 390×844 và khung mặc định: quầy, phố, nâng cấp, công thức, nhân sự, trang trí, giao hàng, sổ sách, xóm giềng, sự kiện, chuỗi quán, chợ và cài đặt. Đối với các nhánh mua bán, phá sản, vé số và kết ngày, chủ yếu kiểm tra code và fixture độc lập để bảo vệ bản lưu người chơi.
- Bộ kiểm thử hiện có: **70/70 test đạt, 7 file**.
- Bổ sung **11 kiểm chứng độc lập xác nhận hành vi lỗi hiện tại**. Những kiểm chứng này đạt vì kỳ vọng của chúng mô tả lỗi, không phải vì lỗi đã được sửa. Fixture dùng localStorage/fetch giả và không chạm bản lưu trình duyệt.
- Không chỉnh cơ chế sản phẩm trong lượt review này. Không thể kết luận retention thực tế hoặc mọi kích thước màn hình đều ổn chỉ từ code và một lượt kiểm tra.

Fixture lưu tại `.audit/review-probes.test.ts`, ngoài bộ test thường xuyên. Khi tái chạy bằng cấu hình Vitest hiện tại, cần chép vào `client/src/__tests__`, đổi import store thành `../store/gameStore`, shared thành `../../../shared/`, chạy riêng rồi gỡ bản chép.

## Ma trận liên kết chức năng

| Chức năng | Liên kết đã có | Phần còn thiếu hoặc sai | Đánh giá |
|---|---|---|---|
| Làm món thủ công | Phiếu gọi món → chọn nguyên liệu → nấu → ăn → thu tiền; có chấm mức khớp món | Các action chưa bảo vệ đầy đủ thứ tự trạng thái; năng lượng bị ẩn ở quầy mới | Có lõi tốt, cần củng cố |
| Khách và đánh giá | Kiên nhẫn, thời tiết, đánh giá ảnh hưởng bán hàng; giá ảnh hưởng hài lòng | Giá chưa điều chỉnh lượng cầu trực tiếp; thiếu nhịp khách theo giờ/phân khúc | Liên kết một phần |
| Công thức và thực đơn | Có danh mục món theo thương hiệu và dữ liệu menu | Quầy bánh mì mới thiếu đường vào chỉnh menu/giá; lượt sinh khách không ràng buộc đầy đủ món đã mở khóa | Chưa thống nhất |
| Chợ và kho | Mua trừ tiền, giới hạn kho, tiêu hao nguyên liệu khi làm món | Hao hụt bị trừ thêm tiền; kho bản sao theo quán không cập nhật cùng lúc; bổ sung hàng chưa tối ưu menu | Cần sửa nghiệp vụ |
| Nâng cấp thiết bị | Bếp, bàn, kho, kiên nhẫn, tip; giữ lợi ích cấp trước | Tủ mát chưa nối với mức chống hỏng; chưa thể đánh giá cân bằng giá khi kinh tế sai | Tốt hơn trước, chưa khép kín |
| Thăng tiến sự nghiệp | Điều kiện tiền/uy tín và chi phí cố định theo cấp | Rủi ro và chi phí chuỗi chưa tăng đầy đủ theo quy mô | Có tiến trình, thiếu chiều sâu |
| Nhân sự | Tuyển, lương, kỹ năng, phân công, phát triển nhân viên | Mood/stress chưa tác động đúng vào năng suất thực chạy; tự nấu bỏ qua yêu cầu riêng | Liên kết một phần |
| Đi chợ tự động | Ngưỡng tồn, mục tiêu nhập, giá trần, kỹ năng đi chợ | Nhãn chiết khấu sai; quản lý có thể kiêm nhiệm không có đánh đổi thời gian rõ | Cần chỉnh |
| Giao hàng | Có đơn, kiểm tra và trừ kho, thưởng tiền, quan hệ Chú Năm | Không đếm ngược thực tế, không chế biến/vận chuyển, lệch giá menu và sổ sách | Chưa thành một vòng gameplay |
| Chi nhánh | Mở quán, phân công, cấp chi nhánh, thu nền | Không kiểm tra kho/chi tiền nguyên liệu; giá tăng không giảm khách; nhân sự thời vụ không có chi phí tương ứng | Lỗ hổng lớn |
| Phố phường | Đường tới quán và các tiện ích | Vào lại chính quán đang quản lý cũng xóa khách | Giao diện tốt, lỗi chuyển trạng thái |
| Trang trí | Điểm Cozy ảnh hưởng hài lòng; có dữ liệu theme/trang trí | Quầy mới chưa thể hiện theme/tên/trang trí; hiệu quả chống stress chưa tới năng suất thực | Mua chưa thấy đủ giá trị |
| Xóm giềng | Trò chuyện, tặng món, XP, mở bí mật, khách quen | Bữa thủ công tăng quan hệ ở hai điểm; perk hiển thị chưa chứng minh được tác động tương ứng trong sự kiện | Có chất riêng, cần nối sâu hơn |
| Chuyện xóm | Có lựa chọn với chi phí và kết quả | Tick thời gian có thể xóa sự kiện vừa sinh; pool ngẫu nhiên ít phụ thuộc tình trạng quán | Chưa ổn định |
| Biến cố bất ngờ | Có thưởng/phạt tiền và danh tiếng | Chủ yếu xác nhận kết quả, ít phòng ngừa/lựa chọn; thưởng bị cộng hai lần trong lợi nhuận | Chưa đạt tiêu chí công bằng |
| Sổ sách/kết ngày | Có lương, thuê, điện nước, giá vốn, insights, lịch sử | Nhiều nguồn tổng riêng; ba nơi có thể cho số khác nhau; nguyên nhân mất khách bị gom thành thiếu năng lực | Chưa đáng tin |
| Cứu trợ/phá sản/di sản | Có mức sức khỏe tài chính, vay, thanh lý, chơi lại | Thanh lý lặp vô hạn; nợ chưa có lịch trả; thưởng di sản dựa ngày chưa đo thành tích thật | Có khung, chưa có sức ép thật |
| Vé số | Mua vé, quay thưởng, lịch sử; kết nối Cô Bảy | Dòng tiền phải vào cùng sổ chung; nên là nội dung phụ, tránh lấn át kinh doanh | Cần cân bằng sau lõi kinh tế |
| Lưu/cài đặt | Tự lưu local, thao tác lưu cloud, tải save | Không lưu đủ ca bán đang chạy; thông báo cloud thành công chưa phụ thuộc kết quả; nhãn âm thanh không có điều khiển tương ứng | Chưa bảo đảm tiếp tục ca |

## Các lỗi cần ưu tiên

### P0 — có thể phá cân bằng hoặc làm mất tiến độ

**1. Thanh lý tạo tiền mà không mất tài sản.** `gameStore.ts:2542` luôn cộng 2.000.000đ, không chọn thiết bị, không giảm cấp và không kiểm tra tài sản đã thanh lý. Fixture gọi hai lần nhận 4.000.000đ ngay cả trạng thái ban đầu. Nút cứu trợ không có giới hạn tương ứng. Vay cứu trợ cũng thiếu lịch trả và chặn lặp hợp lý. Cần tài sản có giá trị còn lại, giao dịch một lần, hậu quả giảm năng lực và lịch trả nợ.

**2. Lưu giữa ca thiếu trạng thái vận hành.** `gameStore.ts:2579` lưu gameState và đơn giao hàng nhưng không lưu khách đang phục vụ, doanh thu/chi phí runtime, số khách phục vụ/mất và cờ vận hành ngày. Sau tải lại, các bộ đếm này về mặc định; nguyên liệu đã dùng vẫn có thể bị trừ trong save. Cần snapshot ca bán đầy đủ hoặc một chính sách đóng ca rõ ràng và có bù trừ. Không nên âm thầm bỏ khách.

**3. Chi nhánh nền không bị giới hạn bởi nguyên liệu.** `shared/simulation/branches.ts` không nhận kho; `recordBranchSales` tại `gameStore.ts:1132` cộng toàn bộ doanh thu vào tiền nhưng chỉ ghi giá vốn trên báo cáo. Fixture doanh thu 30.000đ, giá vốn 10.000đ: tiền tăng 30.000đ, kho không đổi. Nếu muốn mô phỏng chi nhánh theo tiền ròng, phải tính và khấu trừ đầy đủ chi phí; nếu dùng kho, phải dùng cùng luồng tiêu hao/nhập hàng. Không cộng giá vốn vào báo cáo mà không có giao dịch nguồn tương ứng.

### P1 — làm sai nghiệp vụ hoặc gây thất bại khó hiểu

**4. Báo cáo lợi nhuận không có một nguồn tính chung.** `endDayAndSleep` tại `gameStore.ts:2273`, `DailySummaryModal.tsx:63–77`, `LedgerModal.tsx:48` dùng công thức và nguồn số khác nhau. Biến cố thưởng 100.000đ với kho rỗng: tiền sau ngày tăng 85.000đ, nhưng lịch sử ghi lợi nhuận 185.000đ vì thưởng đi vào cả dailyRevenue và otherIncome. Giao hàng lại không ghi revenue/COGS vào dailyFinance. Nhánh fallback COGS còn có thể coi toàn bộ dailyCost là giá vốn. Cần một sổ giao dịch phân loại bán món, tip, nguyên liệu, giá vốn tiêu thụ, sự kiện, đầu tư và vay; mọi màn đọc cùng kết quả kết toán.

**5. Hao hụt bị tính hai lần về tiền.** Nguyên liệu mua đã trừ tiền; cuối ngày vừa xóa hàng hỏng vừa trừ thêm giá trị hàng hỏng khỏi ví. Hàng hỏng nên tạo tổn thất hàng tồn/chi phí, không tự tạo thêm khoản chi tiền nếu không có phí xử lý thực tế. Fixture cũng xác nhận kho active giảm nhưng `restaurantInventories.banh_mi` giữ nguyên. Bảng preview còn gọi random hao hụt riêng, nên có thể khác kết quả thật. Cần chốt một kết toán duy nhất rồi hiển thị nó.

**6. Vào bếp qua phố làm mất khách.** `switchActiveRestaurant` tại `gameStore.ts:2079` xóa activeOrders kể cả ID quán không đổi. Fixture một khách chờ → vào lại bánh mì → không còn khách. Cần giữ nguyên ca của cùng quán; khi chuyển quán khác, mô phỏng/lưu hàng đợi từng quán hoặc giải quyết chuyển giao có quy tắc.

**7. Giao hàng bỏ qua phần lớn thử thách.** `fulfillDeliveryOrder` tại `gameStore.ts:1792` trừ nguyên liệu và trả tiền ngay. Trường thời gian còn lại được tạo nhưng không chạy đếm ngược; có thể gọi thêm đơn bằng nút. Giá đơn theo basePrice thay vì giá menu. Cần nhận đơn → chuẩn bị dùng chung bếp → đóng gói → giao → hoàn thành/thất bại; có hạn chót, phí, người phụ trách và giá vốn vào sổ chung.

**8. Định giá chưa tạo đánh đổi thật.** Giá có ảnh hưởng chấm hài lòng, nhưng hàm nhạy giá chưa được nối vào lượng khách thực sinh. Fixture chi nhánh tăng giá 100 lần: khách không giảm, doanh thu tăng 100 lần. UI chỉnh giá hiện chỉ có ở CozyShopView, không ở quầy bánh mì mới. Cần giá → xác suất mua/lượng cầu theo phân khúc và cùng một menu cho tại bàn, ship, chi nhánh.

**9. Nhân viên bỏ qua yêu cầu tùy biến.** Vòng tự nấu trong `useGameSimulation.ts` dùng requiredIngredients của recipe nền, không dùng remove/extra của đơn và không chấm mức khớp giống người chơi. Đây là hai luật phục vụ khác nhau. Cần bộ lập nguyên liệu/chấm món chung; tay nghề/stress quyết định tốc độ và xác suất sai có giải thích.

**10. Vòng ngày và đồng hồ chưa nhất quán.** Tick đóng cửa tự động không dọn khách như đóng cửa thủ công; `endDayAndSleep` không xóa activeOrders, fixture xác nhận khách còn ở ngày sau. Tốc độ 2× thay cả tần suất interval và lượng thời gian tiến mỗi tick, khiến đồng hồ tăng 4×; nấu còn chia thời gian bởi speed. Cần delta thời gian dùng một lần, state machine ca bán và quy tắc chốt khách/đơn chưa hoàn tất.

**11. Tick ghi đè sự kiện vừa sinh.** `tickTime` tại `gameStore.ts:406` gọi triggerStreetEvent rồi ghi lại gameState từ snapshot cũ. Fixture xác nhận bộ đếm sự kiện tăng nhưng currentEvent trở về null. Tương tự cần kiểm tra các mutation cùng tick để tránh ghi đè kết quả. Dùng cập nhật từ state mới nhất và tách trình tự mô phỏng rõ ràng.

**12. Người chơi bị phạt khi đang đọc màn quản trị.** Vòng mô phỏng chỉ dừng theo cửa mở/timeSpeed, không theo modal. Khách tiếp tục mất kiên nhẫn sau cửa sổ toàn màn hình; sự kiện có thể mở đè màn khác. Quầy mới lại thiếu hiển thị năng lượng dù chế biến tiêu hao năng lượng. Cần chọn rõ chế độ: tạm dừng khi quản trị hoặc cung cấp trạng thái ca/khách đủ rõ và thao tác nhanh. Thể lực phải luôn nhìn thấy trước khi cạn.

### P2 — giảm giá trị tính năng và chất lượng giao diện

- **Stress/mood chưa ảnh hưởng đủ năng suất thực:** helper tính hiệu quả nhân viên tồn tại nhưng vòng chạy không sử dụng. Thưởng/nghỉ/trang trí phải có hiệu quả đo được, đồng thời tránh quản lý đi chợ và đứng bếp cùng lúc không có chi phí thời gian.
- **Nhãn chiết khấu sai:** `EmployeesModal.tsx:271,555` hiển thị marketSkill như phần trăm giảm giá 75–98%; công thức thực tại `gameStore.ts:906` chỉ khoảng 25–35%. Dùng cùng helper cho UI và nghiệp vụ.
- **Đổi theme/trang trí chưa hiện lên quầy mới:** ReferenceShopView không dùng tên quán/theme/trang trí để render tương ứng. Kho lớn và chống hỏng cần tách thành lợi ích thật; `fridgeUpgradeLevel` đang không được nâng bởi mua tủ.
- **Quan hệ hàng xóm có thể tăng hai lần cho một bữa thủ công:** serveDishOrder gọi serveNeighborGuest, hook gọi lại khi khách ăn xong. Đặc quyền được hiển thị như đang có nhưng cơ chế chọn/phạt biến cố chưa sử dụng quan hệ tương ứng rõ ràng.
- **Báo cáo nút cổ chai chưa chỉ đúng nguyên nhân:** mất khách hiện truyền vào capacityBottleneckCount chung; thiếu phân loại hết nguyên liệu, đầy bàn, chậm bếp, giá cao. Số khách chi nhánh ghi tăng 1/lượt dù simulator có thể bán 2–3 suất.
- **Uy tín và danh tiếng có nhiều trường cập nhật khác nhau:** rolling reputation được tính để báo cáo nhưng không thay nguồn uy tín thực dùng mở rộng. Cần phân biệt rõ sao chất lượng gần đây và điểm thành tích lâu dài, tránh tích điểm thắng vĩnh viễn.
- **Luồng khởi nghiệp bị bỏ qua:** App tắt FlashScreen lúc vào, Reference mode không render FlashScreen; nút mở lại trong cài đặt không khắc phục điều kiện này. Cần onboarding riêng thay vì công cụ demo lộ trên sản phẩm.
- **Store thiếu guard trạng thái:** fixture collectPayment cho khách còn waiting vẫn nhận tiền. UI thường chặn thao tác này, nên đây là lỗi invariant nội bộ, không phải đã chứng minh người chơi bình thường bấm được nút trả tiền sớm. Action vẫn cần tự xác thực trạng thái để bảo vệ mọi đường gọi.
- **Cài đặt báo lưu cloud thành công chưa phụ thuộc phản hồi thật:** manual save chờ syncCloud rồi toast thành công; syncCloud tự bắt lỗi. Cần trả kết quả, hiện “local đã lưu / cloud chưa đồng bộ” chính xác. Nhãn menu âm thanh chưa có điều khiển âm thanh trong màn này.

## Giao diện: đồng bộ một phần, chưa ổn định toàn bộ

Quầy bánh mì, phố và nâng cấp đã hình thành phong cách minh họa pastel tốt, bố cục có chủ đích và thành phần sửa được bằng code. Các màn mở trong lượt kiểm tra không gặp crash. Tuy vậy, “không crash khi mở” không đồng nghĩa mọi tình huống tương tác và mọi độ rộng đã ổn định.

| Nhóm màn | Quan sát | Hướng chỉnh |
|---|---|---|
| Quầy/phố/nâng cấp | Nhất quán hơn; nguyên liệu minh họa riêng, phân cấp thao tác rõ | Bổ sung thể lực, menu/giá, trạng thái ca; dùng cùng HUD/điều hướng |
| Nhân sự | Header/badge tranh không gian; bộ lọc chật; nhiều chữ nhỏ | Header gọn, tab cuộn có chỉ dẫn, thẻ ưu tiên năng suất–lương–trạng thái |
| Giao hàng | Màu cyan/icon emoji khác quầy, header dài, thiếu hạn giao có ý nghĩa | Dùng cùng modal/thẻ; hiển thị đơn theo giai đoạn và thời hạn |
| Chuỗi quán | Cam đỏ rực, thẻ dày, nhiều nhãn kỹ thuật; khác phong cách quầy | Tách quán hiện có và quán mở tiếp theo; ưu tiên tình trạng kho/người/lãi |
| Trang trí/xóm giềng | Tông gần nhau nhưng dùng emoji và kiểu thẻ cũ; tên dài làm header chật | Avatar cùng phong cách; preview lợi ích/trang trí thật |
| Chợ/sổ sách | Nhiều tab/nút nhỏ; báo cáo có P&L, COGS, F&B và thuật ngữ triển khai | Nhãn dễ hiểu, giải thích sâu khi cần; nhóm số tiền/cảnh báo rõ |
| Cài đặt | Mô tả Cloud/Node.js/DB như nội dung kỹ thuật; tên FlashScreen lộ ra người chơi | Hiển thị trạng thái lưu thực, âm thanh, hướng dẫn chơi, sao lưu/khôi phục |

Các lỗi chung: một số chữ 8–11px, tương phản pastel thấp, nhiều nút đóng không có tên accessibility; clickable banner thiếu ngữ nghĩa nút; cách hiển thị tiền/giờ khác nhau. Sổ sách đã quan sát giờ `08:11.25`, cần làm tròn phút khi render. Một số tab cuộn đã có nút mũi tên, nên không kết luận chúng không thể sử dụng; vẫn cần cải thiện khả năng nhận biết phần còn ở ngoài màn.

Nên có bộ thành phần dùng chung cho modal, tab, thẻ, nút, badge, số tiền và tooltip. Màu nhấn có thể khác theo chức năng nhưng kích thước chữ, khoảng cách, trạng thái lỗi/khóa và cách đóng phải giống nhau. Kiểm tra tiếp 320/360/390/430px, desktop, tên dài, thiếu tiền, kho đầy, tất cả cấp quán và save cũ sau khi sửa logic.

## Thử thách và sức hút

**Điểm đáng giữ:** đọc phiếu và ráp món là vòng thao tác có phản hồi; khách quen, câu thoại, thời tiết và phố Việt tạo bản sắc; nâng cấp thấy ngay bếp nhanh/bàn nhiều; nhiều thương hiệu tạo mục tiêu dài hạn.

**Điểm làm giảm sức hút:** kiếm tiền qua ship/chi nhánh/cứu trợ quá dễ so với đứng bếp; thất bại do mất state/ẩn thể lực không tạo cảm giác học được; biến cố ngẫu nhiên tiền phạt thiếu phòng ngừa; lên cấp chủ yếu tăng con số; NPC chủ yếu lặp thoại/pool, thiếu ký ức và câu chuyện dài; báo cáo sai không giúp chọn đầu tư tốt.

Không nên thêm mọi tính năng trong tài liệu cùng lúc. Bản thử nghiệm tiếp theo nên tập trung một vòng ngày khép kín:

1. **Đầu ngày:** bản tin thời tiết/giá, chọn mục tiêu, nhập hàng và bố trí người. Cho thấy tiền dự phòng đủ bao nhiêu ngày.
2. **Trong ca:** có đợt cao điểm nhìn thấy; quyết định ưu tiên khách bàn hay ship vì dùng chung bếp; lời gọi món tăng độ phức tạp theo tiến trình.
3. **Biến cố:** báo trước nguy cơ, cho phương án phòng ngừa và lựa chọn có giá; sự kiện phụ thuộc kho, nhân sự, quy mô, lịch sử. Có cooldown chống lặp.
4. **Cuối ca:** một bảng kết toán chỉ rõ mất khách do đâu, tiền thay đổi vì gì và một gợi ý đầu tư phù hợp.
5. **Tiến trình:** mục tiêu ngắn có phần thưởng, cột mốc tuần và khách quen có câu chuyện; mở thương hiệu mới phải đổi cách vận hành, không chỉ nhân doanh thu.
6. **Thua và chơi lại:** cứu trợ có hậu quả thật; di sản dựa thành tích/mốc đã đạt, không chỉ số ngày; khó hơn nhưng giải thích được.

Mục tiêu là người chơi phải chọn giữa các phương án đều có lợi và có giá: bếp hay bàn, hàng dự phòng hay tiền dự phòng, tăng giá hay giữ khách, nhận ship hay cứu hàng đợi. Đây mới là chiều sâu mô phỏng cần thiết.

## Thứ tự triển khai và tiêu chí nghiệm thu

| Đợt | Công việc | Khi nào xem là hoàn tất |
|---|---|---|
| 1. Tính đúng đắn | Chặn thanh lý/vay lặp; sổ giao dịch chung; snapshot ca; chuyển quán; tick sự kiện/thời gian/kết ngày | Reload không mất doanh thu/khách; không nhận tiền hai lần; một sự kiện chỉ ghi một lần; mọi màn có cùng kết toán |
| 2. Liên kết | Kho/chi phí chi nhánh; ship dùng bếp; giá tác động cầu; menu chung; nhân viên dùng cùng đơn tùy biến | Hết kho thì ngừng bán; giá cao giảm mua; bàn/ship tranh năng lực; nhân sự và thiết bị có hiệu quả quan sát được |
| 3. Trải nghiệm | Thể lực/cảnh báo; modal/HUD/asset chung; nhãn đúng; onboarding; nguyên nhân mất khách | Không có chữ/nút quan trọng bị che; người mới hiểu một ngày; lỗi có lý do và hành động khắc phục |
| 4. Chiều sâu và cân bằng | Cao điểm, nhiệm vụ, sự kiện có điều kiện, NPC nhớ, rủi ro chuỗi, di sản | Chơi thử nhiều ngày có quyết định mới; không có chiến thuật kiếm tiền áp đảo; thất bại có thể giải thích |

Sau đợt 1–2 mới đo các kịch bản 7–14 ngày: không thuê người, thuê bếp, ưu tiên ship, tăng giá mạnh, ngày mưa, nhiều chi nhánh, kho cạn và cứu trợ. Theo dõi lãi, ngày hòa vốn nâng cấp, khách mất theo nguyên nhân và tần suất khủng hoảng. Mức lãi 10–20% trong tài liệu là mục tiêu cân bằng tham khảo, không phải kết quả đã đạt.

Để đánh giá “cuốn hút”, cần chơi thử với người mới: họ có hiểu vì sao mất khách không, có đổi chiến thuật sau kết toán không, có muốn chơi ngày tiếp theo không, và tính năng nào họ bỏ qua. Hiện có tiềm năng rõ nhưng chưa đủ bằng chứng để nói đã giữ chân người chơi tốt.
