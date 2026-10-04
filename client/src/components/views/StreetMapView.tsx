import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  SHOP_THEMES,
  RESTAURANT_TYPES,
} from '../../../../shared/gameData';
import { BusinessStageId, RestaurantTypeId } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
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
  Award,
  ArrowRight,
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
    switchActiveRestaurant,
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

  // Cấu hình cấp bậc vỉa hè & quán ăn hiện tại
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);

  // Kiểm tra điều kiện mua thêm bàn tiếp theo
  const nextTableType: 'extra_1' | 'extra_2' | 'stage_upgrade' | 'max' = !upgrades['extra_table_1']
    ? 'extra_1'
    : !upgrades['extra_table_2']
    ? 'extra_2'
    : gameState.businessStage !== 'empire'
    ? 'stage_upgrade'
    : 'max';

  // Xác định thông tin nâng cấp tiếp theo
  const nextCost =
    nextTableType === 'extra_1'
      ? 150000
      : nextTableType === 'extra_2'
      ? 350000
      : nextTableType === 'stage_upgrade'
      ? (() => {
          const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
          const nextStageId = stageOrder[stageOrder.indexOf(gameState.businessStage) + 1];
          return BUSINESS_STAGES[nextStageId]?.cost || 0;
        })()
      : 0;

  const nextRequiredRep =
    nextTableType === 'stage_upgrade'
      ? (() => {
          const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
          const nextStageId = stageOrder[stageOrder.indexOf(gameState.businessStage) + 1];
          return BUSINESS_STAGES[nextStageId]?.requiredReputation || 0;
        })()
      : 0;

  const isAffordable = gameState.money >= nextCost && gameState.reputation >= nextRequiredRep;

  // Lấy visual decor cho cấp bậc hiện tại
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;

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

  // Hỗ trợ con lăn chuột
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

  // Kéo thả chuột mượt mà trên Desktop
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
    setTimeout(() => {
      hasMoved.current = false;
    }, 120);
  };

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

  const handleSwitchToBranch = (id: RestaurantTypeId) => {
    soundManager.playClick();
    switchActiveRestaurant(id);
    setCurrentView('shop');
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

  // HÀM VẼ TỪNG QUÁN / CHI NHÁNH TRÊN ĐƯỜNG PHỐ
  const renderStorefrontLot = (restKey: RestaurantTypeId, width = 450) => {
    const rest = RESTAURANT_TYPES[restKey];
    if (!rest) return null;
    const isUnlocked = gameState.unlockedRestaurants?.includes(restKey);
    const isActive = (gameState.activeRestaurantId || 'banh_mi') === restKey;

    // TRƯỜNG HỢP 1: QUÁN ĐANG ĐỨNG BẾP CHÍNH (ACTIVE)
    if (isActive) {
      return (
        <div
          key={restKey}
          style={{
            width: `${width}px`,
            backgroundColor: stageVisual.storefront.facadeBg,
            borderColor: stageVisual.storefront.facadeBorder,
          }}
          className={`h-64 border-4 rounded-t-3xl relative flex flex-col justify-between p-2 shadow-md shrink-0 transition-all ${
            stageVisual.storefront.hasNeonGlow ? 'ring-2 ring-amber-300 shadow-amber-200/50' : ''
          }`}
        >
          {/* Mái hiên theo cấp */}
          <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
            <div className={`h-4 w-full flex overflow-hidden shadow-2xs ${stageVisual.storefront.roofRounds}`}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full"
                  style={{
                    backgroundColor:
                      i % 2 === 0
                        ? stageVisual.storefront.roofColors[0]
                        : stageVisual.storefront.roofColors[1],
                  }}
                />
              ))}
            </div>

            {/* Huy hiệu Quán Đang Quản Lý */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black px-2.5 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-1 border border-amber-500 whitespace-nowrap z-10">
              <span>👑</span>
              <span>TRỤ SỞ ĐANG ĐỨNG BẾP</span>
            </div>
          </div>

          {/* Biển hiệu tiệm chính */}
          <div
            className="rounded-2xl p-2 flex items-center justify-between border-2 shadow-xs transition-all"
            style={{
              backgroundColor: stageVisual.storefront.signboardBg,
              borderColor: stageVisual.storefront.signboardBorder,
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-2xl animate-bounce-short shrink-0">{rest.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3
                    className="font-black text-xs sm:text-sm leading-tight drop-shadow-2xs truncate"
                    style={{ color: stageVisual.storefront.signboardTextColor }}
                  >
                    {rest.name}
                  </h3>
                  <span
                    style={{
                      backgroundColor: stageVisual.storefront.tagBg,
                      color: stageVisual.storefront.tagColor,
                    }}
                    className="text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black/10 shrink-0"
                  >
                    {stageVisual.storefront.tagText}
                  </span>
                </div>
                <div className="text-[9.5px] font-bold text-rose-600 flex items-center gap-1 truncate">
                  <span>{currentStage.name}</span>
                  <span>·</span>
                  <span>⭐ Uy tín: {gameState.reputation}</span>
                </div>
              </div>
            </div>

            <button
              onClick={safeClick(() => setCurrentView('shop'))}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl text-xs font-black text-rose-700 shadow-2xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <Utensils className="w-3 h-3" />
              <span>Vào Bếp 🍳</span>
            </button>
          </div>

          {/* Quầy chế biến của quán chính */}
          <div
            onClick={safeClick(() => setCurrentView('shop'))}
            className="bg-white/95 rounded-2xl border-2 p-1.5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all shadow-sm group relative"
            style={{ borderColor: stageVisual.storefront.signboardBorder }}
            title={`Chạm vào quầy ${rest.shortName} để chuẩn bị món ăn`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-14 h-16 rounded-xl border flex flex-col justify-around items-center p-1 shadow-inner shrink-0"
                style={{
                  backgroundColor: stageVisual.storefront.tagBg,
                  borderColor: stageVisual.storefront.signboardBorder,
                }}
              >
                <span className="text-xl animate-bounce-short">
                  {rest.equipmentIcon}
                </span>
                <span
                  style={{
                    backgroundColor: stageVisual.storefront.cartBadgeBg,
                    color: stageVisual.storefront.tagColor,
                  }}
                  className="text-[7px] font-black px-0.5 rounded truncate max-w-[50px]"
                >
                  {rest.shortName}
                </span>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-800 flex items-center gap-1 truncate">
                  <span className="truncate">{rest.equipmentName}</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded-full font-bold shrink-0">
                    Đang Mở
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-500 font-medium truncate max-w-[170px]">
                  {rest.tagline}
                </div>
                {/* Đạo cụ trang trí */}
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {stageVisual.storefront.decorativeProps.map((prop, idx) => (
                    <span
                      key={idx}
                      className="text-[7.5px] bg-slate-100 border border-slate-200 text-slate-700 px-1 py-0.2 rounded-md font-bold"
                      title={prop.name}
                    >
                      {prop.icon} {prop.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Đầu bếp & Nhân viên */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative">
                <ChibiAvatar type="player" emotion="happy" size={38} />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[7px] font-black px-1 rounded-full">
                  Bếp
                </span>
              </div>
              {gameState.hiredEmployees.includes('emp_linh') && (
                <ChibiAvatar type="emp_linh" emotion="happy" size={34} />
              )}
              {gameState.hiredEmployees.includes('emp_mai') && (
                <ChibiAvatar type="emp_mai" emotion="happy" size={34} />
              )}
            </div>
          </div>

          {/* Thảm đỏ đế chế */}
          {stageVisual.storefront.hasRedCarpet && (
            <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-rose-500 to-red-700 border-t border-yellow-300 rounded-b-lg shadow-xs flex items-center justify-center">
              <span className="text-[6px] text-yellow-200 font-black tracking-widest uppercase">
                ⭐ KHÁCH VIP - THẢM ĐỎ HOÀNG GIA ⭐
              </span>
            </div>
          )}
        </div>
      );
    }

    // TRƯỜNG HỢP 2: CHI NHÁNH ĐÃ MỞ TRONG CHUỖI (UNLOCKED BRANCH)
    if (isUnlocked) {
      return (
        <div
          key={restKey}
          style={{
            width: `${width}px`,
            backgroundColor: rest.accentColor,
            borderColor: rest.themeColor,
          }}
          className="h-64 border-4 rounded-t-3xl relative flex flex-col justify-between p-2 shadow-md shrink-0 transition-all hover:brightness-102"
        >
          {/* Mái hiên thương hiệu chi nhánh */}
          <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
            <div className="h-4 w-full flex overflow-hidden shadow-2xs rounded-t-2xl">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full"
                  style={{
                    backgroundColor: i % 2 === 0 ? rest.themeColor : '#FFFFFF',
                  }}
                />
              ))}
            </div>

            {/* Huy hiệu Chi Nhánh Hoạt Động */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black px-2.5 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-1 border border-emerald-400 whitespace-nowrap z-10">
              <span className="animate-pulse">🟢</span>
              <span>CHI NHÁNH HOẠT ĐỘNG</span>
            </div>
          </div>

          {/* Biển hiệu chi nhánh */}
          <div
            className="rounded-2xl p-2 flex items-center justify-between border-2 bg-white/95 shadow-xs"
            style={{ borderColor: rest.themeColor }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-2xl animate-bounce-short shrink-0">{rest.icon}</span>
              <div className="min-w-0">
                <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-tight truncate">
                  {rest.name}
                </h3>
                <div className="text-[9px] font-bold text-emerald-800 flex items-center gap-1 truncate mt-0.5">
                  <Award className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{rest.badge}</span>
                </div>
              </div>
            </div>

            <button
              onClick={safeClick(() => handleSwitchToBranch(restKey))}
              className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
              title={`Chuyển sang quản lý đứng bếp ${rest.shortName}`}
            >
              <span>Đổi Quán 🔀</span>
            </button>
          </div>

          {/* Quầy trưng bày & Món đặc trưng của chi nhánh */}
          <div
            onClick={safeClick(() => handleSwitchToBranch(restKey))}
            className="bg-white/95 rounded-2xl border-2 p-1.5 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-xs"
            style={{ borderColor: rest.themeColor }}
            title={`Bấm để chuyển sang quản lý ${rest.shortName}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-14 h-16 rounded-xl border flex flex-col justify-around items-center p-1 shadow-inner shrink-0"
                style={{ backgroundColor: rest.accentColor, borderColor: rest.themeColor }}
              >
                <span className="text-xl animate-bounce-short">{rest.equipmentIcon}</span>
                <span className="text-[7px] font-black px-1 rounded truncate text-slate-800 bg-white/80">
                  {rest.shortName}
                </span>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-800 flex items-center gap-1 truncate">
                  <span className="truncate">{rest.equipmentName}</span>
                </div>
                <div className="text-[9px] text-slate-500 italic truncate max-w-[180px]">
                  "{rest.tagline}"
                </div>

                {/* Thực đơn bán chạy */}
                <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar">
                  {rest.primaryRecipeIds.slice(0, 2).map((rId) => {
                    const r = RECIPES[rId];
                    return (
                      <span
                        key={rId}
                        className="text-[7.5px] bg-slate-100 border border-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold shrink-0"
                      >
                        {r?.icon} {r?.name.split(' ')[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Đầu bếp chi nhánh */}
            <div className="flex flex-col items-center shrink-0 pr-1">
              <span className="text-2xl animate-bounce-short">🧑‍🍳</span>
              <span className="text-[7.5px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded mt-0.5 border border-emerald-200">
                Chi Nhánh
              </span>
            </div>
          </div>
        </div>
      );
    }

    // TRƯỜNG HỢP 3: MẶT BẰNG QUY HOẠCH SẮP MỞ (UPCOMING / LOCKED)
    return (
      <div
        key={restKey}
        style={{
          width: `${width}px`,
        }}
        className="h-64 border-4 border-dashed border-amber-400 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] rounded-t-3xl relative flex flex-col justify-between p-2 shadow-sm shrink-0 transition-all opacity-95"
      >
        {/* Rào chắn công trình chuẩn bị khai trương */}
        <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
          <div className="h-4 w-full flex overflow-hidden shadow-2xs rounded-t-2xl">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{
                  backgroundColor: i % 2 === 0 ? '#F59E0B' : '#78350F',
                }}
              />
            ))}
          </div>

          {/* Huy hiệu Dự Án */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black px-2.5 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-1 border border-amber-600 whitespace-nowrap z-10">
            <span>🏗️</span>
            <span>MẶT BẰNG QUY HOẠCH CHI NHÁNH</span>
          </div>
        </div>

        {/* Biển báo dự án sắp mở */}
        <div className="rounded-2xl p-2 flex items-center justify-between border-2 border-amber-400 bg-white/95 shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-2xl shrink-0 opacity-80">{rest.icon}</span>
            <div className="min-w-0">
              <h3 className="font-black text-xs sm:text-sm text-slate-800 leading-tight truncate">
                Dự Án: {rest.name}
              </h3>
              <div className="text-[9px] font-bold text-amber-800 flex items-center gap-1 truncate mt-0.5">
                <span>Cần:</span>
                <span className="font-black text-rose-600">
                  {rest.unlockCost.toLocaleString('vi-VN')} đ
                </span>
                <span>·</span>
                <span className="font-black text-amber-700">{rest.requiredReputation}⭐</span>
              </div>
            </div>
          </div>

          <button
            onClick={safeClick(() => openModal('franchise'))}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
            title="Mở chi nhánh mới này"
          >
            <Sparkles className="w-3 h-3" />
            <span>Mở Quán 🚀</span>
          </button>
        </div>

        {/* Khu vực chuẩn bị mặt bằng & đạo cụ */}
        <div
          onClick={safeClick(() => openModal('franchise'))}
          className="bg-white/80 rounded-2xl border-2 border-dashed border-amber-300 p-2 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-2xs"
          title="Chạm để xem điều kiện mở chi nhánh"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-14 h-16 rounded-xl border border-dashed border-amber-400 bg-amber-50 flex flex-col justify-around items-center p-1 shrink-0">
              <span className="text-xl opacity-60">{rest.equipmentIcon}</span>
              <span className="text-[7px] font-black text-amber-900 bg-amber-200/60 px-1 rounded truncate">
                Sắp Nhập
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-[10.5px] font-black text-slate-800 flex items-center gap-1 truncate">
                <span>Thiết bị: {rest.equipmentName}</span>
              </div>
              <div className="text-[9px] text-slate-600 font-medium line-clamp-2 mt-0.5">
                {rest.starterDescription}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-1">
            <span
              className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-lg whitespace-nowrap border ${
                gameState.money >= rest.unlockCost && gameState.reputation >= rest.requiredReputation
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                  : 'bg-orange-100 text-orange-800 border-orange-200'
              }`}
            >
              {gameState.money >= rest.unlockCost && gameState.reputation >= rest.requiredReputation
                ? 'ĐỦ ĐIỀU KIỆN! ✨'
                : 'ĐANG TÍCH VỐN ⏳'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none bg-[#EBF4FA] relative">
      {/* 1. THANH TRẠNG THÁI PHỐ XÁ & PHÍM NHẢY NHANH ĐẾN TỪNG QUÁN */}
      <div className="relative z-30 shrink-0 bg-white/95 backdrop-blur-xs border-b border-amber-200/80 shadow-2xs px-2.5 py-1.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs font-black text-amber-950 shrink-0">
            <span>📍</span>
            <span className="truncate">Đại Lộ Ẩm Thực</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            <span>🪑 Bàn:</span>
            <span className="text-rose-600 font-extrabold">
              {activeOrders.length}/{maxTables}
            </span>
          </div>

          {/* Quick jump chips đến từng quán và hàng xóm */}
          <div className="flex items-center gap-1 text-[10px] font-bold shrink-0">
            <button
              onClick={() => scrollToLandmark(0)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🔧 Sửa xe
            </button>
            <button
              onClick={() => scrollToLandmark(260)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🍬 Tạp hóa
            </button>
            <button
              onClick={() => scrollToLandmark(520)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              <span>🥖 Bánh mì</span>
              {gameState.unlockedRestaurants?.includes('banh_mi') && <span className="text-[8px]">🟢</span>}
            </button>
            <button
              onClick={() => scrollToLandmark(990)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              <span>🍜 Phở bò</span>
              {gameState.unlockedRestaurants?.includes('pho') && <span className="text-[8px]">🟢</span>}
            </button>
            <button
              onClick={() => scrollToLandmark(1460)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🌳 Cây me
            </button>
            <button
              onClick={() => scrollToLandmark(1740)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              <span>🍲 Bún bò</span>
              {gameState.unlockedRestaurants?.includes('bun') && <span className="text-[8px]">🟢</span>}
            </button>
            <button
              onClick={() => scrollToLandmark(2210)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              ☕ Bác Ba
            </button>
            <button
              onClick={() => scrollToLandmark(2480)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              <span>🥩 Bò né</span>
              {gameState.unlockedRestaurants?.includes('beefsteak') && <span className="text-[8px]">🟢</span>}
            </button>
            <button
              onClick={() => scrollToLandmark(2950)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-300 text-rose-950 font-black active:scale-95 transition-all flex items-center gap-0.5"
            >
              <span>🍛 Cơm tấm</span>
              {gameState.unlockedRestaurants?.includes('com_tam') && <span className="text-[8px]">🟢</span>}
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

      {/* 2. KHÔNG GIAN TOÀN CẢNH PHỐ XÁ CHÂN THỰC (PANORAMA CUỘN NGANG ~3400PX) */}
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
        {/* CONTAINER PANORAMA TOÀN PHỐ (Rộng 3400px cố định, chứa trọn vẹn 5 quán) */}
        <div
          style={{ width: '3400px', minWidth: '3400px' }}
          className="shrink-0 h-full flex flex-col justify-between relative overflow-hidden"
        >
          {/* LỚP 1: BẦU TRỜI & DÃY NHÀ CAO ỐC XA XĂM (Skyline) */}
          <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-45 overflow-hidden flex items-end justify-between px-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-24 sm:w-32 rounded-t-md opacity-50 flex flex-col justify-around p-1 shrink-0"
                style={{
                  height: `${60 + (i % 5) * 15}px`,
                  backgroundColor: ['#90CAF9', '#CE93D8', '#80DEEA', '#FFE082', '#A5D6A7'][i % 5],
                }}
              />
            ))}
          </div>

          {/* DÂY ĐIỆN VÀ CỘT ĐIỆN CHẰNG CHỊT ĐẶC TRƯNG ĐƯỜNG PHỐ VIỆT NAM */}
          <div className="absolute top-9 left-0 right-0 h-8 pointer-events-none z-10">
            <svg viewBox="0 0 3400 40" className="w-full h-full opacity-65">
              <path d="M 0 10 Q 500 28 1000 14 Q 2000 32 3400 12" stroke="#263238" strokeWidth="1.4" fill="none" />
              <path d="M 0 16 Q 600 32 1300 18 Q 2300 35 3400 18" stroke="#37474F" strokeWidth="1.0" fill="none" />
              <path d="M 0 22 Q 800 36 1600 20 Q 2600 30 3400 24" stroke="#455A64" strokeWidth="0.8" fill="none" />
              <circle cx="260" cy="21" r="2.5" fill="#3E2723" />
              <circle cx="990" cy="22" r="2.5" fill="#3E2723" />
              <circle cx="1740" cy="23" r="2.5" fill="#3E2723" />
              <circle cx="2480" cy="24" r="2.5" fill="#3E2723" />
              <circle cx="2950" cy="22" r="2.5" fill="#3E2723" />
            </svg>
          </div>

          {/* LỚP 2: DÃY NHÀ PHỐ & MẶT TIỀN THỰC TẾ (PHỐ XÁ ĐỜI THƯỜNG VỚI ĐỦ 5 QUÁN) */}
          <div className="flex-1 flex items-end pt-10 pb-1 px-4 relative z-10 gap-3">
            {/* ZONE 1: TIỆM SỬA XE MÁY & BƠM VÁ CHÚ NĂM (~250px) */}
            <div
              style={{ width: '250px' }}
              className="h-56 bg-[#D7CCC8]/90 border-2 border-[#8D6E63] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              {/* Mái che & Biển hiệu tiệm */}
              <div className="bg-[#FFA000] border border-[#FF8F00] text-amber-950 font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                🔧 SỬA XE MÁY CHÚ NĂM
                <div className="text-[9px] font-bold text-amber-900 tracking-tight">
                  Bơm Vá Săm Lốp · Thay Nhớt · Rửa Xe
                </div>
              </div>

              {/* Vách tường & Chú Năm Biker */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-xl leading-none" title="Vỏ lốp xe dự phòng">
                    🛞
                  </span>
                  <div className="bg-[#FFF8E1] border border-amber-300 rounded px-1 text-[8px] font-black text-amber-900 text-center">
                    Xăng Lẻ<br />25k/chai
                  </div>
                </div>

                <div
                  onClick={safeClick(() => openModal('delivery'))}
                  className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
                  title="Chạm để mở Đội Xe Giao Hàng & Nhận Cuốc"
                >
                  <div className="bg-sky-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-0.5 animate-bounce shadow-2xs">
                    Nổ Cuốc 🛵
                  </div>
                  <ChibiAvatar type="chu_nam" emotion="happy" size={48} />
                  <span className="text-[9px] font-black text-sky-950 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200 mt-0.5">
                    Chú Năm (Biker)
                  </span>
                </div>
              </div>

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

            {/* ZONE 2: TẠP HÓA CÔ BA - ĐẠI LÝ BÁNH KẸO NƯỚC NGỌT (~260px) */}
            <div
              style={{ width: '260px' }}
              className="h-56 bg-[#FFF9C4] border-2 border-[#FBC02D] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#E53935] text-white font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                🍬 TẠP HÓA CÔ BA
                <div className="text-[9px] font-medium text-amber-100">
                  Đại lý bánh kẹo · Nước giải khát sỉ & lẻ
                </div>
              </div>

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
                  <span className="text-xl group-hover:scale-110 transition-transform">🪭</span>
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

            {/* LOT 1: 🥖 TIỆM BÁNH MÌ SÀI GÒN & CÀ PHÊ (~450px) */}
            {renderStorefrontLot('banh_mi', 450)}

            {/* LOT 2: 🍜 QUÁN PHỞ BÒ GIA TRUYỀN (~450px) */}
            {renderStorefrontLot('pho', 450)}

            {/* ZONE 3: GỐC CÂY ME & QUẦY VÉ SỐ CÔ BẢY (~260px) */}
            <div
              style={{ width: '260px' }}
              className="h-60 relative flex flex-col justify-end items-center shrink-0"
            >
              <div className="absolute top-1 left-2 w-40 h-40 rounded-full bg-emerald-600/90 border-4 border-emerald-700 shadow-md flex items-center justify-center text-4xl z-10">
                🌳
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

              <div className="w-6 h-28 bg-[#5D4037] rounded-t-sm z-0 mb-6" />

              <div className="absolute bottom-1 flex items-end gap-2 z-20">
                <div className="bg-white border-2 border-sky-400 rounded-xl p-1 text-center shadow-xs">
                  <span className="text-base">🧊</span>
                  <div className="text-[7.5px] font-black text-sky-800 leading-tight">
                    TRÀ ĐÁ<br />MIỄN PHÍ
                  </div>
                </div>

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

            {/* LOT 3: 🍲 QUÁN BÚN BÒ HUẾ & BÚN RIÊU CUA (~450px) */}
            {renderStorefrontLot('bun', 450)}

            {/* ZONE 4: CÀ PHÊ CÓC & BÀN CỜ TƯỚNG BÁC BA (~250px) */}
            <div
              style={{ width: '250px' }}
              className="h-56 bg-[#FFE0B2] border-2 border-[#FFA726] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#E65100] text-white font-black text-center text-xs py-1 rounded-lg shadow-2xs">
                ☕ CÀ PHÊ CÓC VỈA HÈ
                <div className="text-[9px] font-medium text-amber-100">
                  Cà phê phin · Bàn cờ tướng Bác Ba
                </div>
              </div>

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

            {/* LOT 4: 🥩 BÒ NÉ & BEEFSTEAK CHẢO GANG (~450px) */}
            {renderStorefrontLot('beefsteak', 450)}

            {/* LOT 5: 🍛 QUÁN CƠM TẤM SƯỜN BÌ CHẢ (~450px) */}
            {renderStorefrontLot('com_tam', 450)}
          </div>

          {/* LỚP 3: VỈA HÈ LÁT GẠCH CHỮ NHẬT & DÃY BÀN GHẾ NHỰA ĐỎ SONG LONG (LIỀN MẠCH) */}
          <div className="relative z-20 bg-[#F4E4D0] border-t-4 border-[#D7CCC8] shadow-inner pt-2 pb-2 px-4">
            {/* Header vỉa hè */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: stageVisual.table.badgeBg }}
                  className="text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>{stageVisual.table.tableTypeIcon}</span>
                  <span>{stageVisual.table.headerTitle} ({activeOrders.length}/{maxTables})</span>
                </span>
                <span className="text-[10px] text-[#7C5C55] font-extrabold hidden sm:inline">
                  👉 Bàn khách của {currentRest.name} · Chạm vào bàn để phục vụ món
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs opacity-75">
                <span title="Cột đèn">🚦</span>
                <span title="Đại Lộ Ẩm Thực">🚏 Đại Lộ Ẩm Thực</span>
                <span title="Trụ nước cứu hỏa">🚒</span>
              </div>
            </div>

            {/* DÃY BÀN GHẾ THAY ĐỔI CHẤT LIỆU THEO CẤP */}
            <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-0.5">
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
                        ? `${stageVisual.table.tableCardBg} ${stageVisual.table.tableCardBorder} hover:border-amber-400`
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

                    {/* Khung cảnh bàn ăn: Ghế + Khách chibi + Bàn theo cấp */}
                    <div className="h-16 bg-[#FFF9F2] rounded-xl border border-[#F7D7BA] flex items-center justify-around px-1 relative overflow-hidden">
                      {order ? (
                        <>
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

                          <div className="flex flex-col items-center">
                            <div className="text-base animate-bounce-short leading-none" title={recipe?.name}>
                              {recipe?.icon || currentRest.icon}
                            </div>
                            <div
                              style={{
                                background: stageVisual.table.topHighlight || stageVisual.table.topBg,
                                borderColor: stageVisual.table.topBorder,
                              }}
                              className="w-9 h-2.5 rounded-2xs border shadow-2xs flex items-center justify-center my-0.5"
                            >
                              <span
                                style={{ color: stageVisual.table.labelColor }}
                                className="text-[5px] font-black leading-none tracking-tighter truncate max-w-[32px]"
                              >
                                {stageVisual.table.label}
                              </span>
                            </div>
                            <div className="w-8 flex justify-between px-0.5">
                              <div
                                style={{ backgroundColor: stageVisual.table.legColor }}
                                className="w-0.5 h-2"
                              />
                              <div
                                style={{ backgroundColor: stageVisual.table.legColor }}
                                className="w-0.5 h-2"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <span className="text-xl opacity-60">🪑</span>
                          <span className="text-[8px] font-bold mt-0.5">Bàn trống</span>
                        </div>
                      )}
                    </div>

                    {/* Footer bàn: Nút bưng món nhanh ngay ngoài đường */}
                    {order && order.state === 'ready' ? (
                      <button
                        onClick={safeClick(() => handleServeOnStreet(order.id))}
                        className="mt-1 w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black flex items-center justify-center gap-1 animate-bounce-short shadow-2xs"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>BƯNG MÓN 💰</span>
                      </button>
                    ) : order ? (
                      <div className="mt-1 text-center text-[8px] text-slate-600 font-bold truncate">
                        {recipe?.name}
                      </div>
                    ) : (
                      <div className="mt-1 text-center text-[7.5px] text-slate-400 italic">
                        Đang đợi khách
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐIỀU HƯỚNG CUỘN VÀ CHỈ BÁO VỊ TRÍ PHỐ */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xs border-t border-amber-200 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-amber-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScrollBy(-300)}
            disabled={!canScrollLeft}
            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 border border-amber-200 transition-all active:scale-95"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScrollBy(300)}
            disabled={!canScrollRight}
            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 border border-amber-200 transition-all active:scale-95"
            title="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-amber-900">
            Kéo lướt để tham quan 5 Quán & Hàng Xóm ➔
          </span>
        </div>

        {/* Thanh tiến độ cuộn đường phố */}
        <div className="flex items-center gap-2">
          <div className="w-24 bg-amber-100 h-1.5 rounded-full overflow-hidden border border-amber-200">
            <div
              className="bg-amber-500 h-full transition-all duration-150"
              style={{ width: `${scrollPercent}%` }}
            />
          </div>
          <span className="text-[9.5px] text-amber-800 font-black">
            {gameState.unlockedRestaurants?.length || 1}/5 Quán Mở
          </span>
        </div>
      </div>
    </div>
  );
};
