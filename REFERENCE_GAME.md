# Quầy bánh mì React

Chạy từ thư mục dự án bằng `npm run dev`, mở http://localhost:3000.

Quầy được dựng bằng React/CSS độc lập. Không dùng ảnh chụp toàn màn hình, tọa độ cố định hay nút trong suốt đặt đè lên ảnh.

`client/src/components/views/ReferenceShopView.tsx` chứa thanh thông tin, hàng khách, phiếu đơn, tab, khay nguyên liệu, bàn chế biến và điều hướng. `IngredientCard`, `IngredientArt` và `DishWorkbench` là các thành phần riêng. Kiểu dáng và các mốc responsive nằm trong `reference-shop.css`. Bộ 22 minh họa được tạo mới, nằm trong `client/public/art/banh-mi/v1`. File gốc nằm trong `art-source/banh-mi-v1`. Mapping tại `client/src/assets/banhMiArt.ts`. Không dùng ảnh cắt từ giao diện mẫu.

Để chỉnh bố cục, màu sắc hoặc kích thước, sửa CSS của thành phần tương ứng. Để đổi hình một nguyên liệu, thay `image` trong danh sách `PantryItem`. Không cần thay ảnh nền toàn màn hình. Hình món trên thớt được ghép từ bánh mì và những nguyên liệu đang chọn; mỗi nguyên liệu có nút bỏ riêng. Khay hiển thị số lượng còn lại sau phần đang chuẩn bị và chỉ trừ kho thật khi hoàn thành.

Cơ chế hiện có về tiền, tồn kho, đơn tùy biến, nhân sự, nâng cấp, uy tín, chi nhánh, kết toán và phá sản được giữ nguyên. Tiến trình lưu trên trình duyệt. Đồng bộ cloud cần máy chủ của dự án chạy riêng.

Chơi: Mở Cửa → chọn khách → đọc phiếu → chọn nguyên liệu → Hoàn thành món → thu tiền khi khách ăn xong. Chạm ngày/giờ để tạm dừng hoặc tiếp tục. Trên màn hình thấp, vùng giữa cuộn được, thanh thông tin và điều hướng luôn giữ lại.

Mỗi nguyên liệu và nhân vật là một PNG nền trong suốt riêng, không kèm viền ô, chữ hay thanh trạng thái. Bản web giữ nguyên canvas của hình; chỉ thu nhỏ theo tỷ lệ bằng `scripts/prepare-banhmi-art.ps1`. Xem toàn bộ bộ hình tại `/art/banh-mi/v1/catalog.html`. Đây là bản thử giao diện thành phần, không cam kết khớp từng pixel với ảnh tham chiếu.

Kiểm tra: `npm run build --prefix client`, `npm run test --prefix client`.

