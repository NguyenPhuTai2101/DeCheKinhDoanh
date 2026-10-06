# Quy tắc nâng cấp

- Mỗi đời quán lưu cấp thiết bị riêng trong `stageUpgrades`. Khi lên đời, trang bị mới bắt đầu cấp 0; giá mua được tính từ bộ trang bị hiện tại.
- Hiệu quả nền của đời mới là giá trị lớn hơn giữa nền mới và hiệu quả đã đạt ở đời cũ. Nâng cấp mua ở đời mới cộng thêm vào giá trị này. Lịch sử từng đời được giữ trong bản lưu.
- Các bản lưu chưa có `stageUpgrades` được chuyển cấp thiết bị cũ vào đời quán đang chơi. Không dùng cấp thiết bị của đời trước làm cấp mua cho đời mới.
- Kho không bị thu nhỏ khi mua trang bị hoặc chuyển đời. Số bàn tối đa toàn game là 8; khi đạt giới hạn không thể mua thêm bàn.
- Nấu ở quầy bánh mì: chọn nguyên liệu rồi hoàn thành sẽ bắt đầu chế biến. Nguyên liệu được trừ một lần. Thời gian cơ bản chia cho `1 + hệ số bếp`; mô phỏng chuyển món sang sẵn sàng trước khi phục vụ. Tạm dừng thời gian cũng dừng chế biến.
- Bếp tự động dùng cùng hệ số trang bị và thêm hệ số nhân viên. Giao diện dùng món mẫu 10 giây để giải thích tác động của trang bị, không bao gồm kỹ năng nhân viên.
- Âm thanh thưởng thêm danh tiếng theo kỳ vọng trên số điểm dương nhận từ phục vụ tốt; phần lẻ được tính bằng xác suất. Không giảm mức phạt của món sai hoặc dị ứng.
- Màn hình hiển thị lợi ích trước–sau, giá, số vốn thiếu hoặc còn lại. Lên đời hiển thị giới hạn chi nhánh/nhân viên, kho/bàn và chi phí mặt bằng hằng ngày; tiền mua chi nhánh, lương và nguyên liệu là các khoản riêng.

Kiểm chứng: các ca hồi quy trong `client/src/__tests__/upgradeProgression.test.ts` và toàn bộ bộ kiểm thử của client. Thay đổi này sửa tính nhất quán của hiệu quả và giao diện; cân bằng thời gian hoàn vốn dài hạn cần được đánh giá thêm qua các lượt mô phỏng kinh doanh.
