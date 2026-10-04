import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  SHOP_THEMES,
} from '../../../../shared/gameData';
import { BusinessStageId } from '../../../../shared/types';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Plus,
  ShoppingBag,
  Ticket,
  Bike,
  Coffee,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export const StreetMapView: React.FC = () => {
  const {
    gameState,
    activeOrders,
    setCurrentView,
    serveDishOrder,
    openModal,
    purchaseUpgrade,
    upgradeBusinessStage,
    employeeActionStatus,
  } = useGameStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Trạng thái điều hướng cuộn ngang (Scroll & Drag)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Quản lý kéo chuột trên Desktop (Mouse drag-to-scroll)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const initialScrollLeft = useRef(0);
  const hasMoved = useRef(false);

  // Cấu hình cấp bậc vỉa hè
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;

  // Xác định gói nâng cấp bàn tiếp theo
  let nextTableType: 'extra_1' | 'extra_2' | 'stage_upgrade' | 'max' = 'max';
  let nextTableCost = 0;
  let nextTableTitle = 'Tối Đa';
  let canAffordNextTable = false;

  if (!upgrades['extra_table_1']) {
    nextTableType = 'extra_1';
    nextTableCost = 50000;
    nextTableTitle = 'Kê Bàn Phụ 1';
    canAffordNextTable = gameState.money >= 50000;
  } else if (!upgrades['extra_table_2']) {
    nextTableType = 'extra_2';
    nextTableCost = 120000;
    nextTableTitle = 'Kê Bàn Phụ 2';
    canAffordNextTable = gameState.money >= 120000;
  } else {
    const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
    const currentIdx = stageOrder.indexOf(gameState.businessStage);
    if (currentIdx < stageOrder.length - 1) {
      const nextStage = BUSINESS_STAGES[stageOrder[currentIdx + 1]];
      nextTableType = 'stage_upgrade';
      nextTableCost = nextStage.cost;
      nextTableTitle = `Lên: ${nextStage.name.split('/')[0].trim()}`;
      canAffordNextTable =
        gameState.money >= nextStage.cost && gameState.reputation >= nextStage.requiredReputation;
    }
  }

  // Cập nhật trạng thái cuộn ngang (Progress & Can scroll)
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollPercent(Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100)));
    }
  };

  // 1. Hỗ trợ con lăn chuột (Mouse Wheel Delta Y -> Scroll Left/Right)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
        e.preventDefault();
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        el.scrollLeft += delta * 1.2;
        updateScrollState();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    updateScrollState();
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  // 2. Kéo thả chuột mượt mà trên Desktop (Click & Drag to Scroll)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    initialScrollLeft.current = el.scrollLeft;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    el.scrollLeft = initialScrollLeft.current - walk;
    updateScrollState();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsGrabbing(false);
    // Độ trễ 120ms ngăn chặn click nhầm vào các nút khi vừa kéo xong
    setTimeout(() => {
      hasMoved.current = false;
    }, 120);
  };

  // Hàm click an toàn (không kích hoạt nếu người dùng đang kéo lướt phố)
  const safeClick = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMoved.current) return;
    fn();
  };

  const handleScrollBy = (offset: number) => {
    if (!scrollRef.current) return;
    soundManager.playClick();
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollState, 250);
  };

  const scrollToLandmark = (x: number) => {
    if (!scrollRef.current) return;
    soundManager.playClick();
    scrollRef.current.scrollTo({ left: x, behavior: 'smooth' });
    setTimeout(updateScrollState, 250);
  };

  const handleBuyNextTable = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMoved.current) return;
    soundManager.playClick();
    if (nextTableType === 'extra_1') {
      const ok = purchaseUpgrade('extra_table_1');
      if (ok) {
        soundManager.playCoin();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#EC4899'],
        });
      }
    } else if (nextTableType === 'extra_2') {
      const ok = purchaseUpgrade('extra_table_2');
      if (ok) {
        soundManager.playCoin();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#EC4899'],
        });
      }
    } else if (nextTableType === 'stage_upgrade') {
      const ok = upgradeBusinessStage();
      if (ok) {
        soundManager.playCoin();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#6366F1'],
        });
      }
    }
  };

  const handleServeOnStreet = (orderId: string) => {
    if (hasMoved.current) return;
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
      {/* 1. THANH TRẠNG THÁI PHỐ XÁ TINH GIẢN */}
      <div className="relative z-30 shrink-0 bg-white/95 backdrop-blur-xs border-b border-amber-200/80 shadow-2xs px-2.5 py-1.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs font-black text-amber-950 shrink-0">
            <span>📍</span>
            <span className="truncate">Phố Hoa Đào</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            <span>🪑 Bàn:</span>
            <span className="text-rose-600 font-extrabold">
              {activeOrders.length}/{maxTables}
            </span>
          </div>

          {/* Quick jump chips tinh gọn */}
          <div className="flex items-center gap-1 text-[10px] font-bold shrink-0">
            <button
              onClick={() => scrollToLandmark(0)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🔧 Sửa xe
            </button>
            <button
              onClick={() => scrollToLandmark(280)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🍬 Tạp hóa
            </button>
            <button
              onClick={() => scrollToLandmark(560)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all"
            >
              🥖 Quán mình
            </button>
            <button
              onClick={() => scrollToLandmark(1050)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🌳 Cây me
            </button>
            <button
              onClick={() => scrollToLandmark(1350)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              ☕ Bác Ba
            </button>
          </div>
        </div>

        {gameState.currentEvent && (
          <button
            onClick={() => {
              soundManager.playClick();
              openModal('streetEvents');
            }}
            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-[10px] font-black flex items-center gap-1 animate-bounce shadow-xs shrink-0"
          >
            <span>🚨 CÓ BIẾN!</span>
          </button>
        )}
      </div>

      {/* 2. KHÔNG GIAN TOÀN CẢNH PHỐ XÁ CHÂN THỰC (PANORAMA CUỘN NGANG) */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex-1 w-full overflow-x-auto overflow-y-hidden relative no-scrollbar touch-pan-x flex flex-col justify-between bg-gradient-to-b from-[#CDE4F7] via-[#EBF4FA] to-[#F5ECE0] ${
          isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* CONTAINER PANORAMA TOÀN PHỐ (Rộng 1550px cố định, đảm bảo không bị nén) */}
        <div
          style={{ width: '1550px', minWidth: '1550px' }}
          className="shrink-0 h-full flex flex-col justify-between relative overflow-hidden"
        >
          {/* LỚP 1: BẦU TRỜI & DÃY NHÀ CAO ỐC XA XĂM (Skyline) */}
          <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-45 overflow-hidden flex items-end justify-between px-6">
            <div className="w-24 h-24 bg-[#90CAF9] rounded-t-md opacity-60 flex flex-col justify-around p-1">
              <div className="grid grid-cols-3 gap-0.5 opacity-60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-2 bg-white rounded-2xs" />
                ))}
              </div>
            </div>
            <div className="w-32 h-18 bg-[#CE93D8] rounded-t-md opacity-40" />
            <div className="w-28 h-26 bg-[#80DEEA] rounded-t-md opacity-50" />
            <div className="w-36 h-20 bg-[#FFE082] rounded-t-md opacity-40" />
            <div className="w-28 h-24 bg-[#B0BEC5] rounded-t-md opacity-40" />
            <div className="w-32 h-22 bg-[#A5D6A7] rounded-t-md opacity-40" />
            <div className="w-28 h-26 bg-[#90CAF9] rounded-t-md opacity-50" />
          </div>

          {/* DÂY ĐIỆN VÀ CỘT ĐIỆN CHẰNG CHỊT ĐẶC TRƯNG ĐƯỜNG PHỐ VIỆT NAM */}
          <div className="absolute top-9 left-0 right-0 h-8 pointer-events-none z-10">
            <svg viewBox="0 0 1550 40" className="w-full h-full opacity-65">
              <path d="M 0 10 Q 300 28 600 14 Q 1050 32 1550 12" stroke="#263238" strokeWidth="1.4" fill="none" />
              <path d="M 0 16 Q 400 32 750 18 Q 1200 35 1550 18" stroke="#37474F" strokeWidth="1.0" fill="none" />
              <path d="M 0 22 Q 350 36 900 20 Q 1350 30 1550 24" stroke="#455A64" strokeWidth="0.8" fill="none" />
              <circle cx="280" cy="21" r="2.5" fill="#3E2723" />
              <circle cx="286" cy="22" r="2" fill="#3E2723" />
              <circle cx="860" cy="23" r="2.5" fill="#3E2723" />
              <circle cx="866" cy="24" r="2" fill="#3E2723" />
            </svg>
          </div>

          {/* LỚP 2: DÃY NHÀ PHỐ & MẶT TIỀN THỰC TẾ (PHỐ XÁ ĐỜI THƯỜNG) */}
          <div className="flex-1 flex items-end pt-10 pb-1 px-4 relative z-10 gap-3">
            {/* ZONE 1: TIỆM SỬA XE MÁY & BƠM VÁ CHÚ NĂM (~270px) */}
            <div
              style={{ width: '270px' }}
              className="h-56 bg-[#D7CCC8]/90 border-2 border-[#8D6E63] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              {/* Mái che & Biển hiệu tiệm */}
              <div className="bg-[#FFA000] border border-[#FF8F00] text-amber-950 font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                🔧 SỬA XE MÁY CHÚ NĂM
                <div className="text-[9px] font-bold text-amber-900 tracking-tight">
                  Bơm Vá Săm Lốp · Thay Nhớt · Rửa Xe
                </div>
              </div>

              {/* Vách tường: Lốp xe cũ treo lủng lẳng + Chai xăng lẻ */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-xl leading-none" title="Vỏ lốp xe dự phòng">
                    🛞
                  </span>
                  <div className="bg-[#FFF8E1] border border-amber-300 rounded px-1 text-[8px] font-black text-amber-900 text-center">
                    Xăng Lẻ<br />25k/chai
                  </div>
                </div>

                {/* Chú Năm Biker ngồi trên chiếc Wave đỏ */}
                <div
                  onClick={safeClick(() => openModal('delivery'))}
                  className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
                  title="Chạm để mở Đội Xe Giao Hàng & Nhận Cuốc"
                >
                  <div className="bg-sky-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-0.5 animate-bounce shadow-2xs">
                    Nổ Cuốc 🛵
                  </div>
                  <ChibiAvatar type="chu_nam" emotion="happy" size={50} />
                  <span className="text-[9px] font-black text-sky-950 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200 mt-0.5">
                    Chú Năm (Biker)
                  </span>
                </div>
              </div>

              {/* Thanh footer tiệm */}
              <div className="bg-white/80 rounded-lg py-0.5 text-center text-[9px] font-bold text-stone-600 border border-stone-300">
                👉 Chạm Chú Năm để ship đơn mang về
              </div>
            </div>

            {/* Cột điện bê tông phân cách hẻm */}
            <div className="w-5 h-64 bg-[#B0BEC5] rounded-t-sm flex flex-col justify-between items-center py-2 shrink-0 border border-[#90A4AE] relative">
              <span className="text-[8px] font-black text-slate-700 writing-vertical-lr rotate-180 opacity-70">
                KHOAN CẮT BÊ TÔNG
              </span>
              <div className="w-7 h-2 bg-[#78909C] rounded-xs" />
            </div>

            {/* ZONE 2: TẠP HÓA CÔ BA - ĐẠI LÝ BÁNH KẸO NƯỚC NGỌT (~270px) */}
            <div
              style={{ width: '270px' }}
              className="h-56 bg-[#FFF9C4] border-2 border-[#FBC02D] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              {/* Biển hiệu bạt Hiflex đỏ tươi */}
              <div className="bg-[#E53935] text-white font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                🍬 TẠP HÓA CÔ BA
                <div className="text-[9px] font-medium text-amber-100">
                  Đại lý bánh kẹo · Nước giải khát sỉ & lẻ
                </div>
              </div>

              {/* Tủ kính bày bim bim Oishi & Nước lon */}
              <div
                onClick={safeClick(() => openModal('market'))}
                className="flex items-center justify-between px-2 py-1 bg-white/80 rounded-xl border border-amber-300 cursor-pointer hover:border-amber-500 transition-all group"
                title="Chạm để vào Chợ Đầu Mối mua nguyên liệu"
              >
                <div className="space-y-0.5 text-xs">
                  <div>🥫 🧃 🍼 (Nước ngọt)</div>
                  <div>🍪 🍭 🍫 (Bánh kẹo)</div>
                  <div className="text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded inline-block">
                    🧊 THÙNG ĐÁ LẠNH
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    🪭
                  </span>
                  <ChibiAvatar type="chi_lan" emotion="happy" size={44} />
                  <span className="text-[9px] font-black text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 mt-0.5">
                    Cô Ba Tạp Hóa
                  </span>
                </div>
              </div>

              <div className="bg-amber-100/90 rounded-lg py-0.5 text-center text-[9px] font-black text-amber-900 border border-amber-200">
                🛒 Chạm mua sỉ rau thịt, pate, trứng
              </div>
            </div>

            {/* ZONE 3: TIỆM BÁNH MÌ CỦA BẠN (TRỌNG TÂM CON PHỐ ~480px) */}
            <div
              style={{
                width: '480px',
                backgroundColor: activeTheme.bgColor,
                borderColor: activeTheme.primaryColor,
              }}
              className="h-64 border-4 rounded-t-3xl relative flex flex-col justify-between p-2.5 shadow-md shrink-0 transition-all"
            >
              {/* Biển hiệu tiệm bánh mì neon rực rỡ */}
              <div
                className="rounded-2xl p-2 flex items-center justify-between border-2 shadow-xs"
                style={{
                  backgroundColor: activeTheme.accentColor,
                  borderColor: activeTheme.primaryColor,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl animate-bounce-short">🥖</span>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-[#7C5C55] leading-tight drop-shadow-2xs">
                      {gameState.shopName}
                    </h3>
                    <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <span>{currentStage.icon}</span>
                      <span>{currentStage.name}</span>
                      <span>·</span>
                      <span>⭐ Uy tín: {gameState.reputation}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={safeClick(() => setCurrentView('shop'))}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl text-xs font-black text-rose-700 shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                >
                  <Utensils className="w-3 h-3" />
                  <span>Vào Bếp 🍳</span>
                </button>
              </div>

              {/* Xe Inox Bánh Mì Đời Thực & Nhân Viên Nấu Nướng */}
              <div
                onClick={safeClick(() => setCurrentView('shop'))}
                className="bg-white/95 rounded-2xl border-2 p-2 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all shadow-sm group"
                style={{ borderColor: activeTheme.primaryColor }}
                title="Chạm vào xe bánh mì để chuẩn bị món ăn"
              >
                {/* Tủ kính bánh mì và khay pate bốc khói */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-18 bg-amber-50 rounded-xl border border-amber-300 flex flex-col justify-around items-center p-1 shadow-inner">
                    <span className="text-base animate-bounce-short">♨️🥖</span>
                    <span className="text-[8px] font-black text-amber-900 bg-amber-200 px-1 rounded">
                      Pate Bơ Tỏi
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>Xe Đẩy Bánh Mì Inox</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded-full font-bold">
                        Đang Nấu
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Bánh mì giòn · Cà phê phin · Trà đào
                    </div>
                    <div className="text-[9px] font-extrabold text-rose-600 mt-1">
                      👉 Chạm để vào quầy nướng bánh 🍳
                    </div>
                  </div>
                </div>

                {/* Đội ngũ đầu bếp Player & Nhân viên */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="relative">
                    <ChibiAvatar type="player" emotion="happy" size={44} />
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[7px] font-black px-1 rounded-full">
                      Bếp
                    </span>
                  </div>

                  {/* Bác Linh (Bếp chính) */}
                  {gameState.hiredEmployees.includes('emp_linh') && (
                    <div className="relative">
                      <div className={employeeActionStatus.linh === 'cooking' ? 'animate-bounce' : ''}>
                        <ChibiAvatar
                          type="emp_linh"
                          emotion={employeeActionStatus.linh === 'cooking' ? 'love' : 'happy'}
                          size={40}
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[7px] font-black px-1 rounded-full">
                        Linh
                      </span>
                      {employeeActionStatus.linh === 'cooking' && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[7px] font-black px-1 rounded-full animate-bounce whitespace-nowrap shadow-2xs">
                          Nấu ♨️
                        </span>
                      )}
                    </div>
                  )}

                  {/* Em Tuấn (Phụ bếp) */}
                  {gameState.hiredEmployees.includes('emp_tuan') && (
                    <div className="relative">
                      <div className={employeeActionStatus.tuan === 'assisting' ? 'animate-bounce' : ''}>
                        <ChibiAvatar type="emp_tuan" emotion="happy" size={38} />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[7px] font-black px-1 rounded-full">
                        Tuấn
                      </span>
                    </div>
                  )}

                  {/* Em Mai (Phục vụ) */}
                  {gameState.hiredEmployees.includes('emp_mai') && (
                    <div className="relative">
                      <div className={employeeActionStatus.mai === 'serving' ? 'animate-bounce' : ''}>
                        <ChibiAvatar
                          type="emp_mai"
                          emotion={employeeActionStatus.mai === 'serving' ? 'love' : 'happy'}
                          size={40}
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[7px] font-black px-1 rounded-full">
                        Mai
                      </span>
                      {employeeActionStatus.mai === 'serving' && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[7px] font-black px-1 rounded-full animate-bounce whitespace-nowrap shadow-2xs">
                          Bưng món 🏃‍♀️
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ZONE 4: GỐC CÂY ME & QUẦY VÉ SỐ CÔ BẢY (~260px) */}
            <div
              style={{ width: '260px' }}
              className="h-60 relative flex flex-col justify-end items-center shrink-0"
            >
              {/* Tán cây me cổ thụ xòe bóng râm */}
              <div className="absolute top-1 left-2 w-40 h-40 rounded-full bg-emerald-600/90 border-4 border-emerald-700 shadow-md flex items-center justify-center text-4xl z-10">
                🌳
                {/* Loa Phường cảnh báo biến phố xá */}
                <div
                  onClick={safeClick(() => openModal('streetEvents'))}
                  className={`absolute -top-1 -right-2 px-2.5 py-1 rounded-full text-[9px] font-black shadow-md cursor-pointer flex items-center gap-1 z-30 transition-all active:scale-95 ${
                    gameState.currentEvent
                      ? 'bg-rose-600 text-white animate-bounce ring-2 ring-yellow-300'
                      : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Loa phường phố: Xem tin tức & biến cố phố xá"
                >
                  <span>📢</span>
                  <span>{gameState.currentEvent ? 'CÓ BIẾN! 🚨' : 'Loa Phường'}</span>
                </div>
              </div>

              {/* Thân cây me */}
              <div className="w-6 h-28 bg-[#5D4037] rounded-t-sm z-0 mb-6" />

              {/* Quầy Vé Số & Bình Trà Đá Miễn Phí Dưới Gốc Cây */}
              <div className="absolute bottom-1 flex items-end gap-2 z-20">
                {/* Bình Trà Đá Miễn Phí */}
                <div
                  className="bg-white border-2 border-sky-400 rounded-xl p-1 text-center shadow-xs"
                  title="Trà đá miễn phí ấm lòng bà con vỉa hè"
                >
                  <span className="text-base">🧊</span>
                  <div className="text-[7.5px] font-black text-sky-800 leading-tight">
                    TRÀ ĐÁ<br />MIỄN PHÍ
                  </div>
                </div>

                {/* Quầy Vé Số & Số Đề Cô Bảy */}
                <div
                  onClick={safeClick(() => openModal('lotteryDraw'))}
                  className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-1.5 flex flex-col items-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                  title="Chạm để tra sổ mơ, mua vé số hoặc ghi đề x70"
                >
                  <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full mb-0.5 animate-pulse">
                    Đề x70 🎟️
                  </span>
                  <ChibiAvatar type="co_bay" emotion="happy" size={44} />
                  <span className="text-[8.5px] font-black text-amber-950 mt-0.5">
                    Cô Bảy Vé Số
                  </span>
                </div>
              </div>
            </div>

            {/* ZONE 5: CÀ PHÊ CÓC & BÀN CỜ TƯỚNG BÁC BA (~240px) */}
            <div
              style={{ width: '240px' }}
              className="h-56 bg-[#FFE0B2] border-2 border-[#FFA726] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#E65100] text-white font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                ☕ CÀ PHÊ CÓC VỈA HÈ
                <div className="text-[9px] font-medium text-amber-100">
                  Cà phê phin · Bàn cờ tướng Bác Ba
                </div>
              </div>

              {/* Bác Ba & Bé Bông */}
              <div
                onClick={safeClick(() => openModal('neighbors'))}
                className="flex items-center justify-around px-1 py-1 bg-white/80 rounded-xl border border-amber-300 cursor-pointer hover:border-amber-500 transition-all"
                title="Bác Ba Tổ Trưởng & Bé Bông: Chạm để trò chuyện"
              >
                <div className="flex flex-col items-center">
                  <ChibiAvatar type="bac_ba" emotion="happy" size={42} />
                  <span className="text-[8px] font-black text-amber-950 bg-amber-100 px-1 rounded mt-0.5">
                    Bác Ba
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-lg">♟️☕</span>
                  <div className="text-[7.5px] font-bold text-slate-600">
                    Chiếu Tướng!
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <ChibiAvatar type="be_bong" emotion="love" size={38} />
                  <span className="text-[8px] font-black text-rose-800 bg-rose-100 px-1 rounded mt-0.5">
                    Bé Bông
                  </span>
                </div>
              </div>

              <div className="bg-amber-100 rounded-lg py-0.5 text-center text-[9px] font-bold text-amber-900 border border-amber-200">
                💬 Giao lưu tình làng nghĩa xóm
              </div>
            </div>
          </div>

          {/* LỚP 3: VỈA HÈ LÁT GẠCH CHỮ NHẬT & DÃY BÀN GHẾ NHỰA ĐỎ SONG LONG (LIỀN MẠCH) */}
          <div className="relative z-20 bg-[#F4E4D0] border-t-4 border-[#D7CCC8] shadow-inner pt-2 pb-2 px-4">
            {/* Header vỉa hè: Biển hiệu vỉa hè & Hướng dẫn phục vụ */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <span>🪑</span> BÀN GHẾ NHỰA VỈA HÈ ĐÓN KHÁCH ({activeOrders.length}/{maxTables})
                </span>
                <span className="text-[10px] text-[#7C5C55] font-extrabold hidden sm:inline">
                  👉 Chạm vào bàn để bưng món hoặc xem khách đợi
                </span>
              </div>

              {/* Phụ kiện vỉa hè: Nắp cống & Cột đèn */}
              <div className="flex items-center gap-3 text-xs opacity-75">
                <span title="Cột đèn">🚦</span>
                <span title="Đường Hoa Đào">🚏 Phố Hoa Đào</span>
                <span title="Trụ nước cứu hỏa">🚒</span>
              </div>
            </div>

            {/* DÃY BÀN GHẾ NHỰA ĐỎ SONG LONG & Ô THÊM BÀN */}
            <div className="flex items-stretch gap-2.5">
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
                    onClick={safeClick(() => {
                      soundManager.playClick();
                      setSelectedTable(tableNum);
                    })}
                    className={`relative shrink-0 w-32 sm:w-36 rounded-2xl p-1.5 transition-all cursor-pointer border-2 shadow-2xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-300'
                        : order
                        ? 'bg-white border-[#F2E8E5] hover:border-amber-400'
                        : 'bg-white/70 border-dashed border-amber-300'
                    }`}
                  >
                    {/* Header bàn: Số bàn & Trạng thái */}
                    <div className="flex items-center justify-between text-[9px] font-black text-[#7C5C55] mb-1">
                      <span className="bg-[#FFE082] px-1.5 py-0.2 rounded-md">
                        Bàn {tableNum}
                      </span>
                      {order && (
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                            order.state === 'ready'
                              ? 'bg-emerald-100 text-emerald-700 animate-pulse font-extrabold'
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

                    {/* Khung cảnh bàn ăn: Ghế nhựa Song Long + Khách chibi + Món ăn */}
                    <div className="h-16 bg-[#FFF9F2] rounded-xl border border-[#F7D7BA] flex items-center justify-around px-1 relative overflow-hidden">
                      {order ? (
                        <>
                          {/* Khách Chibi ngồi trên ghế đẩu nhựa */}
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
                              size={34}
                            />
                            <span className="text-[7.5px] font-black text-[#7C5C55] truncate max-w-[48px] leading-tight mt-0.5">
                              {order.neighborId
                                ? NEIGHBORS_DATA[order.neighborId].name
                                : cType?.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Chiếc Bàn Nhựa Đỏ Song Long ở giữa */}
                          <div className="flex flex-col items-center">
                            <div className="text-base animate-bounce-short leading-none" title={recipe?.name}>
                              {recipe?.icon || '🥖'}
                            </div>
                            <div className="w-8 h-2 bg-[#E53935] rounded-2xs border border-[#B71C1C] shadow-2xs flex items-center justify-center my-0.5">
                              <span className="text-[5px] text-white font-black leading-none tracking-tighter">
                                SLONG
                              </span>
                            </div>
                            <div className="w-7 flex justify-between">
                              <div className="w-0.5 h-2 bg-[#C62828]" />
                              <div className="w-0.5 h-2 bg-[#C62828]" />
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Bàn trống */
                        <div className="flex flex-col items-center justify-center text-center py-1 opacity-75">
                          <div className="w-8 h-2 bg-[#E53935] rounded-2xs border border-[#B71C1C] shadow-2xs mb-1" />
                          <span className="text-[8.5px] font-bold text-slate-500">
                            Bàn Trống 🪑
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nút hành động trực tiếp */}
                    <div className="mt-1">
                      {order ? (
                        order.state === 'ready' ? (
                          <button
                            onClick={safeClick(() => handleServeOnStreet(order.id))}
                            className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg text-[9px] font-black shadow-xs flex items-center justify-center gap-1 animate-bounce"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>BƯNG MÓN 💰</span>
                          </button>
                        ) : order.state === 'eating' ? (
                          <div className="w-full py-0.5 text-center text-[8.5px] font-bold text-amber-700 bg-amber-50 rounded-lg">
                            Đang thưởng thức
                          </div>
                        ) : (
                          <button
                            onClick={safeClick(() => setCurrentView('shop'))}
                            className="w-full py-0.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 rounded-lg text-[8.5px] font-black flex items-center justify-center gap-0.5"
                          >
                            <Utensils className="w-2.5 h-2.5" />
                            <span>Vào Nấu 🍳</span>
                          </button>
                        )
                      ) : (
                        <div className="text-center text-[8px] text-slate-400 py-0.5">
                          Chờ khách ghé
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Ô 'THÊM BÀN' TRỰC TIẾP TRÊN VỈA HÈ */}
              <div
                onClick={handleBuyNextTable}
                className={`relative shrink-0 w-32 sm:w-36 rounded-2xl p-1.5 transition-all cursor-pointer border-2 border-dashed flex flex-col justify-between shadow-2xs active:scale-95 ${
                  canAffordNextTable
                    ? 'bg-amber-50/90 border-amber-400 hover:bg-amber-100 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[9px] font-black text-amber-950 mb-1">
                  <span className="flex items-center gap-0.5 text-amber-700">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" /> Thêm Bàn
                  </span>
                  <span className="bg-amber-200 text-amber-900 px-1 py-0.2 rounded text-[8px] font-black">
                    {nextTableCost > 0 ? `${(nextTableCost / 1000).toFixed(0)}k` : 'MAX'}
                  </span>
                </div>

                {/* Khung cảnh thêm bàn */}
                <div className="h-16 rounded-xl border border-dashed border-amber-300 bg-white/70 flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-xl">🪑➕</span>
                  <div className="text-[8.5px] font-black text-amber-900 truncate max-w-full">
                    {nextTableTitle}
                  </div>
                  <div className="text-[7.5px] text-slate-500 font-medium">
                    {nextTableType === 'max'
                      ? 'Đạt số bàn tối đa'
                      : '+1 Bàn Nhựa Đón Khách'}
                  </div>
                </div>

                {/* Nút bấm mua bàn */}
                <div className="mt-1">
                  {nextTableType === 'max' ? (
                    <div className="w-full py-0.5 text-center text-[8px] font-bold text-slate-400 bg-slate-100 rounded-lg">
                      Đã Tối Đa
                    </div>
                  ) : canAffordNextTable ? (
                    <button
                      onClick={handleBuyNextTable}
                      className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[8.5px] font-black shadow-xs flex items-center justify-center gap-0.5 active:scale-95"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Kê Thêm Bàn</span>
                    </button>
                  ) : (
                    <div
                      onClick={safeClick(() => openModal('upgrades'))}
                      className="w-full py-0.5 bg-slate-200 text-slate-600 rounded-lg text-[8px] font-bold text-center truncate"
                    >
                      Thiếu {nextTableCost.toLocaleString('vi-VN')} đ
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LỚP 4: LÒNG ĐƯỜNG XE CHẠY (ASPHALT ROADWAY CHÂN THỰC) */}
          <div className="h-7 bg-[#2E373B] border-t-2 border-[#1E2528] flex items-center justify-around px-8 relative overflow-hidden">
            {/* Vạch sơn vàng nét đứt tim đường */}
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />
            <div className="w-16 h-1 bg-[#FFD54F] rounded-full opacity-80" />

            {/* Nắp cống tròn trên đường */}
            <div className="absolute right-40 top-1.5 w-4 h-4 rounded-full border border-stone-500 bg-[#37474F] opacity-70" />
            <div className="absolute left-60 top-1.5 w-4 h-4 rounded-full border border-stone-500 bg-[#37474F] opacity-70" />
          </div>
        </div>
      </div>

      {/* 3. NÚT ĐIỀU HƯỚNG CUỘN NGANG (MŨI TÊN NỔI 2 BÊN) */}
      {canScrollLeft && (
        <button
          onClick={() => handleScrollBy(-300)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border-2 border-amber-300 flex items-center justify-center z-40 active:scale-90 transition-all hover:scale-105"
          title="Cuộn sang trái"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScrollBy(300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border-2 border-amber-300 flex items-center justify-center z-40 active:scale-90 transition-all hover:scale-105"
          title="Cuộn sang phải"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* 4. THANH TIẾN ĐỘ VỊ TRÍ PHỐ (STREET MINIMAP TRACK DƯỚI CÙNG) */}
      <div className="shrink-0 h-1.5 w-full bg-amber-200/60 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 rounded-full transition-all duration-75"
          style={{
            width: '25%',
            transform: `translateX(${(scrollPercent / 100) * 300}%)`,
          }}
        />
      </div>
    </div>
  );
};
