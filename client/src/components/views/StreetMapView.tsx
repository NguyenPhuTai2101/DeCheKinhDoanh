import React, { useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  SHOP_THEMES,
} from '../../../../shared/gameData';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  ShoppingBag,
  Ticket,
  Bike,
  HeartHandshake,
  Store,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Heart,
  Coffee,
} from 'lucide-react';

export const StreetMapView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    setShopOpen,
    activeOrders,
    setCurrentView,
    serveDishOrder,
    openModal,
    buyLotteryTicket,
  } = useGameStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Cấu hình cấp bậc vỉa hè
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;

  // Lăn chuột hoặc bấm nút để cuộn ngang phố xá
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const handleServeOnStreet = (orderId: string) => {
    soundManager.playClick();
    const success = serveDishOrder(orderId);
    if (success) {
      soundManager.playCoin();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#0284C7'],
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none bg-[#EBF4FA] relative">
      {/* 1. MÁI HIÊN & HEADER "ĐẾ CHẾ VỈA HÈ" (THEO ẢNH MẪU CỦA BẠN) */}
      <div className="relative z-20 shrink-0 bg-white border-b-2 border-amber-200 shadow-sm">
        {/* Mái hiên sọc đỏ - trắng uốn lượn đặc trưng quán phố */}
        <div className="h-4 w-full bg-repeat-x flex overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{
                backgroundColor: i % 2 === 0 ? '#E53935' : '#FFFFFF',
              }}
            />
          ))}
        </div>

        {/* Bảng hiệu chính & Thanh công cụ quan sát */}
        <div className="px-3 py-1.5 flex items-center justify-between gap-2 bg-[#FFFDF8]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-lg shrink-0">
              🛵
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-amber-950 truncate flex items-center gap-1.5">
                <span>ĐẾ CHẾ VỈA HÈ</span>
                <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.2 rounded-full border border-rose-200 shrink-0">
                  Phố Hoa Đào
                </span>
              </h2>
              <p className="text-[10px] text-amber-800/80 truncate">
                Từ gánh vé số góc ngã tư đến chuỗi ẩm thực
              </p>
            </div>
          </div>

          {/* Phím điều hướng nhanh về quầy bán */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setCurrentView('shop');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all animate-bounce-short"
            >
              <Utensils className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Vào Quầy Bán</span>
            </button>
          </div>
        </div>

        {/* Thanh trạng thái nhanh ngoài đường */}
        <div className="px-3 py-1 bg-amber-50/80 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span>🪑</span> Bàn ngoài trời: <b className="text-rose-600">{activeOrders.length}/{maxTables}</b>
            </span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <span>{currentStage.icon}</span> {currentStage.name}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 italic">
            👉 Vuốt hoặc bấm mũi tên để dạo phố
          </div>
        </div>
      </div>

      {/* 2. KHÔNG GIAN TOÀN CẢNH PHỐ PHƯỜNG & VỈA HÈ (PANORAMA CUỘN NGANG) */}
      <div
        ref={scrollRef}
        className="flex-1 w-full overflow-x-auto overflow-y-hidden relative no-scrollbar flex items-stretch touch-pan-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Container chiều rộng panorama cố định để cuộn mượt */}
        <div className="min-w-[1250px] h-full flex flex-col justify-between relative bg-gradient-to-b from-[#D4E8F8] via-[#EBF4FA] to-[#F7EDE2] overflow-hidden">
          {/* LỚP 1: BẦU TRỜI & CAO ỐC PHỐ XÁ XA XĂM (Skyline) */}
          <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-40 overflow-hidden flex items-end justify-between px-4">
            {/* Tòa nhà chung cư xa xa phong cách pastel */}
            <div className="w-20 h-24 bg-[#90CAF9] rounded-t-md opacity-50 flex flex-col justify-around p-1">
              <div className="grid grid-cols-3 gap-0.5 opacity-60">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-2 bg-white rounded-xs" />
                ))}
              </div>
            </div>
            <div className="w-28 h-20 bg-[#CE93D8] rounded-t-md opacity-40" />
            <div className="w-24 h-26 bg-[#80DEEA] rounded-t-md opacity-50" />
            <div className="w-32 h-18 bg-[#FFE082] rounded-t-md opacity-40" />
            <div className="w-24 h-24 bg-[#B0BEC5] rounded-t-md opacity-40" />
            <div className="w-28 h-22 bg-[#A5D6A7] rounded-t-md opacity-40" />
            <div className="w-24 h-26 bg-[#90CAF9] rounded-t-md opacity-50" />
          </div>

          {/* DÂY ĐIỆN VÀ CỘT ĐIỆN ĐẶC TRƯNG VIỆT NAM */}
          <div className="absolute top-12 left-0 right-0 h-4 pointer-events-none z-10">
            <svg viewBox="0 0 1250 30" className="w-full h-full opacity-60">
              <path d="M 0 10 Q 300 25 600 12 Q 900 26 1250 10" stroke="#37474F" strokeWidth="1.2" fill="none" />
              <path d="M 0 16 Q 320 28 650 15 Q 950 29 1250 16" stroke="#455A64" strokeWidth="0.8" fill="none" />
              {/* Chim sẻ đậu trên dây điện */}
              <circle cx="340" cy="18" r="2.5" fill="#3E2723" />
              <circle cx="346" cy="19" r="2" fill="#3E2723" />
              <circle cx="820" cy="21" r="2.5" fill="#3E2723" />
            </svg>
          </div>

          {/* LỚP 2: DÃY NHÀ PHỐ 2 TẦNG ĐA MÀU SẮC (SHOPHOUSES) */}
          <div className="flex-1 flex items-end pt-8 pb-0 px-2 relative z-10 gap-2">
            {/* NHÀ 1: NGÃ BA & TIỆM SỬA XE (Bên trái) */}
            <div className="w-56 h-60 bg-[#D7CCC8] border-2 border-[#8D6E63] rounded-t-xl relative flex flex-col justify-between p-2 shadow-sm shrink-0">
              {/* Tầng 2 */}
              <div className="h-20 bg-white/70 rounded-lg border border-[#A1887F] p-1.5 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#5D4037]">
                  <span>2F · Hộ Dân Cư</span>
                  <span>🏠</span>
                </div>
                <div className="h-10 bg-[#BCAAA4]/40 rounded border border-[#8D6E63] flex items-center justify-around px-2">
                  <div className="w-6 h-8 bg-sky-200/60 rounded border border-white" />
                  <div className="w-6 h-8 bg-sky-200/60 rounded border border-white" />
                </div>
              </div>

              {/* Tầng 1: Tiệm Sửa Xe Máy Chú Bảy & Chú Năm */}
              <div className="flex-1 mt-2 bg-[#EFEBE9] rounded-lg border-2 border-[#8D6E63] p-1.5 flex flex-col justify-between relative overflow-hidden">
                <div className="bg-[#FFA000] text-white text-center font-black text-[11px] py-0.5 rounded shadow-sm">
                  🔧 SỬA XE MÁY & VÁ LỐP
                </div>

                {/* Phụ kiện tiệm sửa xe */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm" title="Lốp xe dự phòng">⚫</span>
                    <span className="text-sm" title="Lốp xe">⚫</span>
                  </div>

                  {/* Chú Năm đứng cạnh xe ôm */}
                  <div
                    onClick={() => {
                      soundManager.playClick();
                      openModal('delivery');
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Bấm để mở Đội Xe Giao Hàng Chú Năm"
                  >
                    <div className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full mb-0.5 animate-bounce-short">
                      Nổ Cuốc! 🛵
                    </div>
                    <ChibiAvatar type="chu_nam" emotion="happy" size={44} />
                    <span className="text-[9px] font-black text-sky-900 bg-sky-100 px-1 rounded">
                      Chú Năm
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-center font-bold text-slate-500 bg-white/80 rounded py-0.5">
                  Bơm xe · Thay nhớt · Ship đồ ăn
                </div>
              </div>
            </div>

            {/* NHÀ 2: TIỆM TẠP HÓA CÔ BA */}
            <div className="w-56 h-60 bg-[#FFF59D] border-2 border-[#FBC02D] rounded-t-xl relative flex flex-col justify-between p-2 shadow-sm shrink-0">
              {/* Tầng 2 */}
              <div className="h-20 bg-white/80 rounded-lg border border-[#FBC02D] p-1.5 flex flex-col justify-between">
                <div className="flex justify-between text-[9px] font-bold text-[#F57F17]">
                  <span>2F · Ban Công Hoa</span>
                  <span>💐</span>
                </div>
                <div className="h-10 bg-amber-50 rounded border border-[#FBC02D] flex items-center justify-center">
                  <span className="text-xs">🌱 🌺 🌿</span>
                </div>
              </div>

              {/* Tầng 1: Quầy Tạp Hóa Rực Rỡ */}
              <div
                onClick={() => {
                  soundManager.playClick();
                  openModal('market');
                }}
                className="flex-1 mt-2 bg-white rounded-lg border-2 border-[#FBC02D] p-1.5 flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all shadow-xs"
                title="Bấm để vào Chợ Đầu Mối mua nguyên liệu"
              >
                <div className="bg-[#E53935] text-white text-center font-black text-[11px] py-0.5 rounded shadow-sm">
                  🍬 TẠP HÓA CÔ BA
                </div>

                {/* Kệ hàng bánh kẹo lon nước */}
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] space-y-0.5 leading-none">
                    <div>🥫 🧃 🍼</div>
                    <div>🍪 🍭 🍫</div>
                    <div>🥚 🥒 🧈</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs animate-pulse">🙋‍♀️</span>
                    <span className="text-[9px] font-black text-amber-900 bg-amber-100 px-1 rounded">
                      Cô Ba
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-center font-extrabold text-amber-800 bg-amber-50 rounded py-0.5">
                  Chạm để mua nguyên liệu sỉ 🛒
                </div>
              </div>
            </div>

            {/* NHÀ 3: TIỆM BÁNH MÌ CỦA BẠN (TRỌNG TÂM CON PHỐ) */}
            <div
              className="w-72 h-68 border-4 rounded-t-2xl relative flex flex-col justify-between p-2.5 shadow-md shrink-0 transition-all"
              style={{
                backgroundColor: activeTheme.bgColor,
                borderColor: activeTheme.primaryColor,
              }}
            >
              {/* Tầng 2: Biển hiệu to & Phòng sinh hoạt */}
              <div
                className="h-22 rounded-xl p-2 flex flex-col justify-between border-2 shadow-inner"
                style={{
                  backgroundColor: activeTheme.accentColor,
                  borderColor: activeTheme.primaryColor,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#7C5C55]">
                    ⭐ {currentStage.name}
                  </span>
                  <span className="text-xs">✨ 🥖 ☕</span>
                </div>
                <div className="text-center">
                  <h3 className="font-black text-xs sm:text-sm text-[#7C5C55] truncate drop-shadow-xs">
                    {gameState.shopName}
                  </h3>
                  <div className="text-[9px] font-bold text-[#F7A8C4]">
                    Ngon Giòn Nóng Hổi · Bánh Mì Ba Miền
                  </div>
                </div>
              </div>

              {/* Tầng 1: Quầy Xe Đẩy & Nhân Viên Đang Nấu */}
              <div
                onClick={() => {
                  soundManager.playClick();
                  setCurrentView('shop');
                }}
                className="flex-1 mt-2 bg-white/90 rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer hover:brightness-105 transition-all shadow-sm group"
                style={{ borderColor: activeTheme.primaryColor }}
                title="Bấm để vào quầy chuẩn bị món ăn"
              >
                {/* Mái hiên tiệm theo theme */}
                <div
                  className="text-white text-center font-black text-[11px] py-0.5 rounded shadow-sm flex items-center justify-center gap-1"
                  style={{ backgroundColor: activeTheme.primaryColor }}
                >
                  <Utensils className="w-3 h-3" />
                  <span>QUẦY BẾP VỈA HÈ</span>
                </div>

                {/* Các nhân vật làm bếp */}
                <div className="flex items-center justify-around py-1">
                  <div className="relative">
                    <ChibiAvatar type="player" emotion="happy" size={46} />
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-full">
                      Bếp
                    </span>
                  </div>

                  {gameState.hiredEmployees.includes('emp_mai') && (
                    <div className="relative">
                      <ChibiAvatar type="emp_mai" emotion="love" size={40} />
                      <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[7px] font-black px-1 rounded-full">
                        Mai
                      </span>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-xl animate-bounce-short">♨️🥖</div>
                    <div className="text-[9px] font-black text-emerald-600">
                      Đang phục vụ
                    </div>
                  </div>
                </div>

                <div className="bg-[#FFF1F6] text-[#7C5C55] text-center text-[9px] font-black py-0.5 rounded group-hover:bg-[#F7A8C4] group-hover:text-white transition-all">
                  👉 Chạm để vào quầy nấu món 🍳
                </div>
              </div>
            </div>

            {/* CÂY ME VỈA HÈ & QUẦY VÉ SỐ CÔ BẢY */}
            <div className="w-44 h-60 relative flex flex-col justify-end items-center shrink-0">
              {/* Cây me râm mát xòe bóng */}
              <div className="absolute top-2 left-4 w-32 h-32 rounded-full bg-emerald-500/90 border-2 border-emerald-600 shadow-md flex items-center justify-center text-3xl z-10 opacity-95">
                🌳
              </div>
              <div className="w-4 h-28 bg-[#795548] rounded-t-sm z-0 mb-8" />

              {/* Bình Trà Đá Miễn Phí & Quầy Vé Số */}
              <div className="absolute bottom-1 flex items-end gap-2 z-20">
                {/* Bình trà đá inox miễn phí */}
                <div
                  className="bg-white border-2 border-sky-400 rounded-lg p-1 text-center shadow-xs cursor-pointer"
                  title="Trà đá miễn phí ấm lòng bà con"
                >
                  <span className="text-xs">🧊</span>
                  <div className="text-[7px] font-black text-sky-800 leading-tight">
                    TRÀ ĐÁ<br />FREE
                  </div>
                </div>

                {/* Quầy Vé Số Cô Bảy */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    if (!gameState.activeLotteryTicket) {
                      buyLotteryTicket();
                    } else {
                      openModal('neighbors');
                    }
                  }}
                  className="bg-amber-50 border-2 border-amber-300 rounded-xl p-1 flex flex-col items-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                  title="Bấm để mua vé số may mắn 16h30"
                >
                  <span className="text-[8px] bg-red-600 text-white font-black px-1 rounded-full mb-0.5">
                    Vé Số 🎟️
                  </span>
                  <ChibiAvatar type="co_bay" emotion="happy" size={40} />
                  <span className="text-[8px] font-extrabold text-amber-900 mt-0.5">
                    Cô Bảy (10k)
                  </span>
                </div>
              </div>
            </div>

            {/* NHÀ 4: TIỆM VĂN PHÒNG PHẨM & ĐIỆN THOẠI */}
            <div className="w-56 h-60 bg-[#C8E6C9] border-2 border-[#81C784] rounded-t-xl relative flex flex-col justify-between p-2 shadow-sm shrink-0">
              {/* Tầng 2 */}
              <div className="h-20 bg-white/70 rounded-lg border border-[#81C784] p-1.5 flex flex-col justify-between">
                <div className="flex justify-between text-[9px] font-bold text-[#2E7D32]">
                  <span>2F · Cư Xá Phố</span>
                  <span>📻</span>
                </div>
                <div className="h-10 bg-emerald-50 rounded border border-[#81C784] flex items-center justify-around px-2">
                  <div className="w-6 h-8 bg-sky-200/50 rounded border border-white" />
                  <div className="w-6 h-8 bg-sky-200/50 rounded border border-white" />
                </div>
              </div>

              {/* Tầng 1: Văn Phòng Phẩm */}
              <div className="flex-1 mt-2 bg-white rounded-lg border-2 border-[#81C784] p-1.5 flex flex-col justify-between">
                <div className="bg-[#2E7D32] text-white text-center font-black text-[11px] py-0.5 rounded shadow-sm">
                  📚 VĂN PHÒNG PHẨM
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="text-xs">📖 ✏️ 🎒 📐</div>
                  {/* Bé Bông đứng xem truyện tranh */}
                  <div
                    onClick={() => {
                      soundManager.playClick();
                      openModal('neighbors');
                    }}
                    className="flex flex-col items-center cursor-pointer"
                    title="Bé Bông học sinh trong xóm"
                  >
                    <ChibiAvatar type="be_bong" emotion="love" size={38} />
                    <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-1 rounded">
                      Bé Bông
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-center font-bold text-emerald-800 bg-emerald-50 rounded py-0.5">
                  Sách vở · Bút mực · Truyện tranh
                </div>
              </div>
            </div>

            {/* NHÀ 5: CỬA HÀNG GẠO & NÔNG SẢN (Bên phải cùng) */}
            <div className="w-52 h-60 bg-[#FFE0B2] border-2 border-[#FFB74D] rounded-t-xl relative flex flex-col justify-between p-2 shadow-sm shrink-0">
              <div className="h-20 bg-white/70 rounded-lg border border-[#FFB74D] p-1.5 flex flex-col justify-between">
                <div className="text-[9px] font-bold text-[#E65100]">2F · Kho Gạo Sạch</div>
                <div className="h-10 bg-amber-50 rounded border border-[#FFB74D] flex items-center justify-center">
                  <span>🍚 🌾 🌾</span>
                </div>
              </div>

              <div className="flex-1 mt-2 bg-white rounded-lg border-2 border-[#FFB74D] p-1.5 flex flex-col justify-between">
                <div className="bg-[#EF6C00] text-white text-center font-black text-[11px] py-0.5 rounded shadow-sm">
                  🌾 ĐẠI LÝ GẠO SẠCH
                </div>
                <div className="flex items-center justify-around py-1">
                  <span className="text-sm">🌾</span>
                  <div className="text-[9px] font-extrabold text-amber-900">
                    Bao Gạo ST25<br />Nếp Cái Hoa Vàng
                  </div>
                </div>
                <div className="text-[9px] text-center font-bold text-amber-800 bg-amber-50 rounded py-0.5">
                  Gạo ngon mỗi ngày
                </div>
              </div>
            </div>
          </div>

          {/* LỚP 3: VỈA HÈ LÁT GẠCH & DÃY BÀN GHẾ NHỰA ĐÓN KHÁCH (TRỌNG TÂM USER YÊU CẦU) */}
          <div className="relative z-20 bg-[#F5E6D3] border-t-4 border-[#D7CCC8] shadow-inner pt-2 pb-3 px-4">
            {/* Hàng gạch lát vỉa hè hoa văn caro nhẹ */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                  <span>🪑</span> BÀN GHẾ NHỰA VỈA HÈ ĐÓN KHÁCH
                </span>
                <span className="text-[10px] text-[#7C5C55] font-bold">
                  (Chạm vào bàn để bưng món hoặc vào bếp)
                </span>
              </div>

              {/* Vật phẩm trang trí vỉa hè: Trụ cứu hỏa & Biển tên đường */}
              <div className="flex items-center gap-3 text-xs opacity-80">
                <span title="Cột đèn giao thông">🚦</span>
                <span title="Biển tên đường phố">🚏 Đường Hoa Đào</span>
                <span title="Trụ nước cứu hỏa">🚒</span>
                <span title="Thùng rác công cộng">🗑️</span>
              </div>
            </div>

            {/* DÃY BÀN GHẾ NHỰA ĐỎ SONG LONG TRẢI DÀI TRÊN VỈA HÈ */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {Array.from({ length: maxTables }).map((_, idx) => {
                const tableNum = idx + 1;
                const order = activeOrders.find((o) => o.tableIndex === tableNum);
                const isSelected = selectedTable === tableNum;
                const recipe = order ? RECIPES[order.recipeId] : null;
                const cType = order ? CUSTOMER_TYPES[order.typeId] : null;
                const patiencePercent = order
                  ? Math.max(0, order.patienceRemaining / order.maxPatience)
                  : 1;

                return (
                  <div
                    key={tableNum}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedTable(tableNum);
                    }}
                    className={`relative shrink-0 w-44 rounded-2xl p-2 transition-all cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-300 shadow-md'
                        : order
                        ? 'bg-white border-[#F2E8E5] hover:border-amber-400 shadow-sm'
                        : 'bg-white/60 border-dashed border-amber-300'
                    }`}
                  >
                    {/* Số bàn */}
                    <div className="flex items-center justify-between text-[10px] font-black text-[#7C5C55] mb-1">
                      <span className="bg-[#FFE082] px-1.5 py-0.2 rounded-md">
                        Bàn {tableNum}
                      </span>
                      {order && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            order.state === 'ready'
                              ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                              : order.state === 'eating'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {order.state === 'ready'
                            ? '✨ Có Món'
                            : order.state === 'eating'
                            ? '😋 Đang Ăn'
                            : '⏳ Đang Đợi'}
                        </span>
                      )}
                    </div>

                    {/* Khung cảnh bàn ăn: Ghế nhựa + Khách + Đĩa món ăn */}
                    <div className="h-20 bg-[#FFF9F2] rounded-xl border border-[#F7D7BA] flex items-center justify-around px-1 relative overflow-hidden">
                      {order ? (
                        <>
                          {/* Khách Chibi ngồi trên ghế đẩu */}
                          <div className="flex flex-col items-center">
                            <ChibiAvatar
                              type={order.neighborId || order.typeId}
                              emotion={
                                order.state === 'eating'
                                  ? 'eating'
                                  : order.state === 'ready'
                                  ? 'love'
                                  : patiencePercent > 0.4
                                  ? 'waiting'
                                  : 'angry'
                              }
                              size={44}
                            />
                            <span className="text-[8px] font-black text-[#7C5C55] truncate max-w-[60px]">
                              {order.neighborId
                                ? NEIGHBORS_DATA[order.neighborId].name
                                : cType?.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Chiếc Bàn Nhựa Đỏ ở giữa */}
                          <div className="flex flex-col items-center">
                            {/* Món ăn trên bàn */}
                            <div className="text-xl animate-bounce-short" title={recipe?.name}>
                              {recipe?.icon || '🥖'}
                            </div>

                            {/* Mặt bàn nhựa đỏ Song Long */}
                            <div className="w-10 h-3 bg-[#E53935] rounded-xs border border-[#B71C1C] shadow-xs flex items-center justify-center">
                              <span className="text-[6px] text-white font-black">SONG LONG</span>
                            </div>
                            {/* 2 chân bàn */}
                            <div className="w-8 flex justify-between">
                              <div className="w-1 h-3 bg-[#C62828]" />
                              <div className="w-1 h-3 bg-[#C62828]" />
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Bàn trống sẵn sàng đón khách */
                        <div className="flex flex-col items-center justify-center text-center py-1 opacity-75">
                          <div className="w-10 h-3 bg-[#E53935] rounded-xs border border-[#B71C1C] shadow-xs mb-1" />
                          <span className="text-xs">🪑</span>
                          <span className="text-[9px] font-bold text-slate-500">Bàn Trống</span>
                        </div>
                      )}
                    </div>

                    {/* Nút hành động trực tiếp ngoài vỉa hè */}
                    <div className="mt-1.5">
                      {order ? (
                        order.state === 'ready' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServeOnStreet(order.id);
                            }}
                            className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-sm flex items-center justify-center gap-1 animate-bounce-short active:scale-95"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>BƯNG MÓN (THU TIỀN 💰)</span>
                          </button>
                        ) : order.state === 'eating' ? (
                          <div className="w-full py-0.5 text-center text-[9px] font-bold text-amber-700 bg-amber-50 rounded-lg">
                            Khách đang thưởng thức...
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentView('shop');
                            }}
                            className="w-full py-1 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Utensils className="w-3 h-3" />
                            <span>Vào Bếp Nấu {recipe?.name.split(' ')[0]}</span>
                          </button>
                        )
                      ) : (
                        <div className="text-center text-[9px] text-slate-400 py-0.5">
                          Đang chờ khách ghé
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LỚP 4: LÒNG ĐƯỜNG XE CHẠY (ASPHALT ROADWAY) */}
          <div className="h-6 bg-[#37474F] border-t-2 border-[#263238] flex items-center justify-around px-8 relative overflow-hidden">
            {/* Vạch sơn vàng tim đường nét đứt */}
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full" />
          </div>
        </div>
      </div>

      {/* 3. MŨI TÊN ĐIỀU HƯỚNG CUỘN NGANG TRÊN MÀN HÌNH */}
      <button
        onClick={() => handleScroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center z-30 active:scale-90 transition-all opacity-80 hover:opacity-100"
        title="Cuộn sang trái"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => handleScroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center z-30 active:scale-90 transition-all opacity-80 hover:opacity-100"
        title="Cuộn sang phải"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 4. NÚT NỔI CHUYỂN NHANH VỀ BẾP TRÊN MOBILE */}
      <div className="absolute bottom-16 right-3 z-30">
        <button
          onClick={() => {
            soundManager.playClick();
            setCurrentView('shop');
          }}
          className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl shadow-xl font-black text-xs flex items-center gap-1.5 border-2 border-white active:scale-95 transition-all animate-bounce-short"
        >
          <Utensils className="w-4 h-4" />
          <span>Vào Bếp 🍳</span>
        </button>
      </div>
    </div>
  );
};
