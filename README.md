# Tiệm Nhỏ Của Tôi 🌸 Cozy Business Story (V0.1 Demo)

> **Game nhập vai kinh doanh – từ quán nhỏ đến tập đoàn đa ngành**
> Phiên bản Demo V0.1: Tiệm bánh mì & đồ uống nhỏ ấm cúng (Cozy Restaurant)

---

## 🌸 Giới Thiệu

Dự án được xây dựng dựa trên bản thiết kế **Game Design Document (GDD V0.1)**:
- **Phong cách thị giác:** 2D Top-down Pixel Art Cozy, bảng màu hồng pastel (`#F7A8C4`), kem sữa (`#FFF7ED`), mint (`#BFE3D0`) và nâu gỗ (`#7C5C55`).
- **Triết lý lối chơi:** Thay đổi vai trò người chơi theo thời gian — từ người tự tay chuẩn bị nguyên liệu, nấu nướng, phục vụ đến việc thuê nhân viên, nâng cấp cửa hàng và mở rộng chuỗi chi nhánh.
- **Cơ chế âm thanh:** Web Audio API native synthesizer, tự động phát âm thanh leng keng (coin), chuông cửa (door bell), xèo xèo nấu nướng mà không cần tải file ngoài.

---

## 🚀 Cấu Trúc Dự Án (Monorepo)

```text
DeCheKinhDoanh/
├── shared/              # Types, DTOs & Game balance (Công thức, Nguyên liệu, Khách hàng)
│   ├── types.ts
│   └── gameData.ts
│
├── server/              # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts     # REST API Endpoints (/api/catalog, /api/save, /api/health)
│   │   └── db.ts        # Database lưu trữ save game & audit log
│   └── data/saves.json  # Tệp dữ liệu người chơi
│
└── client/              # Frontend Web & PWA
    ├── src/
    │   ├── game/        # Phaser 3 Game Engine
    │   │   ├── RestaurantScene.ts    # Map quán, NPC khách hàng, di chuyển, order
    │   │   ├── assetGenerator.ts     # Tự động vẽ Pixel Texture chuẩn màu GDD
    │   │   └── gameBridge.ts         # Cầu nối giữa React và Phaser 60fps
    │   ├── store/
    │   │   └── gameStore.ts          # Zustand Vanilla State Management
    │   ├── components/               # React UI Pastel HUD
    │   │   ├── TopBar.tsx            # Header hiển thị Tiền, Uy tín, Năng lượng, Giờ
    │   │   ├── BottomBar.tsx         # Menu điều hướng
    │   │   ├── GameCanvas.tsx        # Khung Canvas Phaser
    │   │   └── modals/               # Nấu ăn, Đi chợ, Nâng cấp, Nhân sự, Tổng kết ngày
    │   └── utils/
    │       └── soundManager.ts       # Hiệu ứng âm thanh Cozy Web Audio
    └── vite.config.ts
```

---

## 🎮 Cách Chạy Game Demo V0.1

### 1. Cài đặt các dependencies (chỉ cần chạy lần đầu)
```bash
# Ở thư mục gốc:
npm install

# Cài đặt server:
cd server && npm install

# Cài đặt client:
cd ../client && npm install
```

### 2. Chạy Server Backend (API Port 4000)
```bash
npm run server
# Hoặc: cd server && npm run dev
```

### 3. Chạy Client Game (Vite Port 3000)
Mở một cửa sổ terminal khác:
```bash
npm run client
# Hoặc: cd client && npm run dev
```

Truy cập trên trình duyệt máy tính hoặc điện thoại: **http://localhost:3000**

---

## 🍲 Vòng Lặp Trò Chơi (Core Loop Demo V0.1)

1. **Khởi đầu ngày mới (06:00 sáng):**
   - Người chơi có **100,000 đ** vốn ban đầu và **100% Sức lực (Energy)**.
   - Bấm `🛒 Đi Chợ` để mua thêm Bánh mì, Trứng gà, Thịt nướng, Patê, Dưa leo, Trà sữa, Cà phê...
2. **Mở cửa tiệm đón khách:**
   - Bấm `[🌸 MỞ CỬA ĐÓN KHÁCH]` trên thanh công cụ trên cùng.
   - Các vị khách dễ thương (Học sinh, Dân văn phòng, Tín đồ ẩm thực, Bác hàng xóm) sẽ tự bước vào quán, ngồi vào bàn trống và hiện bong bóng gọi món (`Bubble Order`).
3. **Nấu món & Phục vụ:**
   - Bấm vào bàn ăn hoặc quầy bếp để mở giao diện `🍳 Nấu Ăn`.
   - Bấm chọn các nguyên liệu theo đúng công thức món khách yêu cầu (ví dụ: Bánh mì trứng = Bánh mì + Trứng + Dưa leo) rồi bấm **"HOÀN THÀNH MÓN ĂN"** (tiêu hao 3 điểm sức lực).
   - Món ăn sẵn sàng $\rightarrow$ Bấm vào bàn để bưng ra cho khách thưởng thức.
4. **Thu tiền & Nhận đánh giá:**
   - Khách ăn ngon miệng $\rightarrow$ trả tiền món ăn + tiền boa (Tip) dựa trên tốc độ phục vụ $\rightarrow$ Tiền bay lên `+35,000 đ 💰` kèm âm thanh leng keng và tăng điểm Uy tín quán.
5. **Tự động hóa nhân sự (Automation):**
   - Bấm `👥 Nhân Sự` để tuyển:
     - **Bé Mai (Phục vụ):** Tự động bưng món ra bàn khách khi bếp nấu xong.
     - **Bác Linh (Đầu bếp):** Tự động nấu món khi có order nếu kho còn nguyên liệu.
6. **Nâng cấp cơ sở vật chất:**
   - Mua thêm Bàn ăn số 3, Bàn ăn số 4 để đón thêm nhiều khách cùng lúc.
   - Mua Bếp nướng điện cao cấp để tăng tốc độ.
   - Nâng cấp Tủ kho lớn để trữ thêm nguyên liệu.
7. **Kết thúc ngày & Đi ngủ:**
   - Đến 22:00 (hoặc bấm `🌙 Đi Ngủ`), giao diện **Tổng Kết Ngày** sẽ hiện ra:
     - Báo cáo chi tiết: Doanh thu, Chi phí nguyên liệu, Lương nhân viên, Lợi nhuận ròng, Số khách phục vụ.
     - Bấm **"ĐI NGỦ"** $\rightarrow$ Hồi phục 100% sức lực $\rightarrow$ Bước sang ngày tiếp theo!
