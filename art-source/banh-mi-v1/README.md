# Bộ minh họa riêng cho quầy bánh mì — phiên bản 1

Các PNG trong thư mục này được tạo mới bằng ImageGen cho dự án, không lấy từ ảnh giao diện tham chiếu. Mỗi nguyên liệu, món ăn và khách hàng là một hình độc lập trên nền alpha, không kèm chữ, ô giao diện hoặc thanh trạng thái.

## Quy ước mỹ thuật

Minh họa 2D có chất liệu màu nước, viền nâu ấm, ánh sáng mềm; nguyên liệu giữ màu tự nhiên, nhân vật dùng bảng màu hồng, kem và pastel. Đồ ăn nhìn từ trên chếch xuống; khách là chân dung đầu và vai nhìn về người chơi.

## File

- 15 nguyên liệu: bread, egg, pork, pate, cha-lua, cucumber, pickles, herbs, chili, mayo, pepper-sauce, tea, milk, condensed-milk, coffee.
- 2 món hoàn chỉnh: banh-mi, milk-tea.
- 5 khách: customer-1 đến customer-5.

Đây là file gốc có độ phân giải cao. Phiên bản phục vụ trên web nằm tại `client/public/art/banh-mi/v1`. Chạy `scripts/prepare-banhmi-art.ps1` để xuất lại PNG nhỏ hơn, giữ toàn bộ canvas và nền trong suốt. Script chỉ thu nhỏ theo tỷ lệ; không cắt hình, xóa nền hoặc chèn chi tiết.

Mapping hình trong giao diện nằm tại `client/src/assets/banhMiArt.ts`. Tên nguyên liệu, tồn kho, khung ô và hiệu ứng chọn được vẽ riêng bằng React/CSS. Khi thay PNG, giữ tên file hoặc cập nhật mapping tương ứng.
