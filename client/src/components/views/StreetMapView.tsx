import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  RESTAURANT_TYPES,
  EMPLOYEES,
  getBranchTierInfo,
} from '../../../../shared/gameData';
import { BusinessStageId, RestaurantTypeId, Employee } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  Coins,
  Store,
  ChefHat,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const StreetMapView: React.FC = () => {
  const {
    gameState,
    activeOrders,
    setCurrentView,
    serveDishOrder,
    openModal,
    switchActiveRestaurant,
    purchaseUpgrade,
  } = useGameStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Trạng thái cuộn ngang
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Kéo chuột trên Desktop (Mouse drag-to-scroll)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const initialScrollLeft = useRef(0);
  const hasMoved = useRef(false);

  // Chu kỳ xe cộ chạy ngang lòng đường
  const [trafficTick, setTrafficTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTrafficTick((prev) => (prev + 1) % 100);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Cấu hình cấp bậc vỉa hè & quán ăn hiện tại
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const upgrades = gameState.purchasedUpgrades;
  const extraTableCount =
    (upgrades['extra_tables'] || 0) +
    (upgrades['extra_table_1'] ? 1 : 0) +
    (upgrades['extra_table_2'] ? 1 : 0);
  const maxTables = currentStage.maxTables + extraTableCount;

  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;

  // Lấy danh sách nhân viên được phân công cho từng quán
  const getStaffForRest = (restKey: RestaurantTypeId): Employee[] => {
    return gameState.hiredEmployees
      .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e) && (e.assignedRestaurantId || 'banh_mi') === restKey);
  };

  // Cập nhật chỉ số thanh cuộn
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
    setTimeout(() => {
      hasMoved.current = false;
    }, 100);
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

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el && scrollRef.current) {
      soundManager.playClick();
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setTimeout(updateScrollState, 300);
    }
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

  // Render từng mặt tiền quán ẩm thực (Compact & Chân Thực)
  const renderStorefrontLot = (restKey: RestaurantTypeId, width = 280) => {
    const rest = RESTAURANT_TYPES[restKey];
    if (!rest) return null;
    const isUnlocked = gameState.unlockedRestaurants?.includes(restKey);
    const isActive = activeRestId === restKey;
    const assignedStaff = getStaffForRest(restKey);
    const isAutomated = assignedStaff.length > 0;

    // TRƯỜNG HỢP 1: QUÁN ĐANG ĐỨNG BẾP CHÍNH (ACTIVE)
    if (isActive) {
      return (
        <div
          id={`lot-${restKey}`}
          style={{
            width: `${width}px`,
            backgroundColor: stageVisual.storefront.facadeBg,
            borderColor: stageVisual.storefront.facadeBorder,
          }}
          className={`h-56 border-3 rounded-t-2xl relative flex flex-col justify-between p-2 shadow-md shrink-0 transition-all ${
            stageVisual.storefront.hasNeonGlow ? 'ring-2 ring-amber-300 shadow-amber-200/50' : ''
          }`}
        >
          {/* Mái hiên theo cấp bậc quán */}
          <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
            <div className={`h-4 w-full flex overflow-hidden shadow-2xs ${stageVisual.storefront.roofRounds}`}>
              {Array.from({ length: 16 }).map((_, i) => (
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

            {/* Huy hiệu Trụ Sở Chính */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black px-2 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-0.5 border border-amber-500 whitespace-nowrap z-10 animate-pulse">
              <span>👑</span>
              <span>TRỤ SỞ ĐỨNG BẾP</span>
            </div>
          </div>

          {/* Biển hiệu quán chính */}
          <div
            className="rounded-xl p-1.5 flex items-center justify-between border shadow-2xs"
            style={{
              backgroundColor: stageVisual.storefront.signboardBg,
              borderColor: stageVisual.storefront.signboardBorder,
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xl animate-bounce-short shrink-0">{rest.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3
                    className="font-black text-xs leading-tight truncate"
                    style={{ color: stageVisual.storefront.signboardTextColor }}
                  >
                    {rest.name}
                  </h3>
                </div>
                <div className="text-[8.5px] font-bold text-rose-600 flex items-center gap-1 truncate">
                  <span>{currentStage.name}</span>
                  <span>·</span>
                  <span>⭐ {gameState.reputation}</span>
                </div>
              </div>
            </div>

            <button
              onClick={safeClick(() => setCurrentView('shop'))}
              className="px-2 py-1 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg text-[10px] font-black text-rose-700 shadow-2xs active:scale-95 transition-all flex items-center gap-0.5 shrink-0"
            >
              <Utensils className="w-2.5 h-2.5" />
              <span>Vào Bếp 🍳</span>
            </button>
          </div>

          {/* Quầy bếp & Nhân sự quán chính */}
          <div
            onClick={safeClick(() => setCurrentView('shop'))}
            className="bg-white/95 rounded-xl border p-1.5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all shadow-xs group"
            style={{ borderColor: stageVisual.storefront.signboardBorder }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-11 h-13 rounded-lg border flex flex-col justify-around items-center p-0.5 shadow-inner shrink-0 relative"
                style={{
                  backgroundColor: stageVisual.storefront.tagBg,
                  borderColor: stageVisual.storefront.signboardBorder,
                }}
              >
                <span className="text-lg animate-bounce-short">{rest.equipmentIcon}</span>
                <span className="text-[6.5px] font-black px-0.5 rounded text-amber-900 bg-amber-200/80 truncate max-w-[40px]">
                  {rest.shortName}
                </span>
                {/* Khói nghi ngút */}
                <span className="absolute -top-1.5 -right-1 text-[9px] animate-pulse">♨️</span>
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-black text-slate-800 flex items-center gap-1 truncate">
                  <span className="truncate">{rest.equipmentName}</span>
                </div>
                <div className="text-[8.5px] text-slate-500 font-medium truncate max-w-[120px]">
                  {rest.tagline}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[7px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 rounded-md font-bold">
                    🟢 Đang đứng bếp
                  </span>
                </div>
              </div>
            </div>

            {/* Nhân sự đang đứng bếp */}
            <div className="flex items-center -space-x-1 shrink-0 pl-1">
              <div className="relative" title="Chủ quán">
                <ChibiAvatar type="player" emotion="happy" size={32} />
                <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white text-[6px] font-black px-0.5 rounded-full">
                  Bếp
                </span>
              </div>
              {assignedStaff.slice(0, 2).map((staff) => (
                <div key={staff.id} className="relative" title={`${staff.name} (${staff.role})`}>
                  <ChibiAvatar type={staff.id} emotion="happy" size={28} />
                  <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white text-[6px] font-black px-0.5 rounded-full">
                    {staff.role === 'cook' ? 'Nấu' : 'Bưng'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dải thảm chân tiệm */}
          <div className="h-1 w-full bg-amber-400 rounded-b-md opacity-80" />
        </div>
      );
    }

    // TRƯỜNG HỢP 2: CHI NHÁNH ĐÃ MỞ (UNLOCKED BRANCH)
    if (isUnlocked) {
      const branchLevels: Record<string, number> = gameState.branchLevels || {};
      const branchLvl = branchLevels[restKey] || 1;
      const branchTier = getBranchTierInfo(restKey, branchLvl);

      return (
        <div
          id={`lot-${restKey}`}
          style={{
            width: `${width}px`,
            backgroundColor: rest.accentColor,
            borderColor: rest.themeColor,
          }}
          className="h-56 border-3 rounded-t-2xl relative flex flex-col justify-between p-2 shadow-md shrink-0 transition-all hover:brightness-102"
        >
          {/* Mái hiên thương hiệu chi nhánh */}
          <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
            <div className="h-4 w-full flex overflow-hidden shadow-2xs rounded-t-xl">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full"
                  style={{
                    backgroundColor: i % 2 === 0 ? rest.themeColor : '#FFFFFF',
                  }}
                />
              ))}
            </div>

            {/* Huy hiệu Chi Nhánh */}
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 font-black px-2 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-0.5 border whitespace-nowrap z-10 ${
                isAutomated
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-amber-500 text-white border-amber-600 animate-pulse'
              }`}
            >
              <span>{isAutomated ? '🟢' : '⚠️'}</span>
              <span>
                {isAutomated
                  ? `TỰ ĐỘNG BÁN (${assignedStaff.length} NV · Cấp ${branchLvl})`
                  : 'CẦN NHÂN VIÊN'}
              </span>
            </div>
          </div>

          {/* Biển hiệu chi nhánh */}
          <div
            className="rounded-xl p-1.5 flex items-center justify-between border bg-white/95 shadow-2xs"
            style={{ borderColor: rest.themeColor }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xl animate-bounce-short shrink-0">{rest.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-black text-xs text-slate-900 leading-tight truncate">
                    {rest.name}
                  </h3>
                  <span className="text-[7.5px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-black shrink-0">
                    Cấp {branchLvl}
                  </span>
                </div>
                <div className="text-[8px] font-bold text-emerald-800 flex items-center gap-1 truncate">
                  <Award className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{branchTier.currentTier.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={safeClick(() => handleSwitchToBranch(restKey))}
              className="px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[9.5px] font-black shadow-2xs active:scale-95 transition-all flex items-center gap-0.5 shrink-0"
              title={`Chuyển sang quản lý ${rest.shortName}`}
            >
              <span>Đổi Quán 🔀</span>
            </button>
          </div>

          {/* Quầy thiết bị & Trạng thái hoạt động */}
          <div
            className="bg-white/95 rounded-xl border p-1.5 flex items-center justify-between shadow-2xs relative"
            style={{ borderColor: rest.themeColor }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-11 h-13 rounded-lg border flex flex-col justify-around items-center p-0.5 shadow-inner shrink-0 relative"
                style={{ backgroundColor: rest.accentColor, borderColor: rest.themeColor }}
              >
                <span className="text-lg animate-bounce-short">{rest.equipmentIcon}</span>
                <span className="text-[6.5px] font-black px-0.5 rounded text-slate-800 bg-white/80 truncate max-w-[40px]">
                  {rest.shortName}
                </span>
                {isAutomated && (
                  <span className="absolute -top-1.5 -right-1 text-[9px] animate-pulse">♨️</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-black text-slate-800 truncate">
                  {rest.equipmentName}
                </div>
                <div className="text-[8px] text-slate-500 italic truncate max-w-[120px]">
                  "{rest.tagline}"
                </div>

                {isAutomated ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 rounded-md font-bold flex items-center gap-0.5">
                      <Coins className="w-2 h-2 text-amber-500" />
                      <span>Thu lời tự động</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[7.5px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded-md font-bold">
                      ⚠️ Tạm ngưng (cần NV)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nhân sự chi nhánh */}
            <div className="flex flex-col items-center shrink-0 pl-1">
              {isAutomated ? (
                <div className="flex items-center -space-x-1.5">
                  {assignedStaff.slice(0, 2).map((staff) => (
                    <div key={staff.id} className="relative" title={`${staff.name} (${staff.role})`}>
                      <ChibiAvatar type={staff.id} emotion="happy" size={28} />
                      <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white text-[6px] font-black px-0.5 rounded-full">
                        {staff.role === 'cook' ? '♨️' : '🏃'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={safeClick(() => openModal('employees'))}
                  className="px-1.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-lg text-[8px] font-black flex flex-col items-center leading-tight active:scale-95 transition-all"
                  title="Giao nhân viên phụ trách"
                >
                  <Users className="w-3 h-3 text-amber-700" />
                  <span>+ Giao NV</span>
                </button>
              )}
            </div>
          </div>

          {/* Dải chân tiệm */}
          <div
            className="h-1 w-full rounded-b-md opacity-80"
            style={{ backgroundColor: rest.themeColor }}
          />
        </div>
      );
    }

    // TRƯỜNG HỢP 3: MẶT BẰNG QUY HOẠCH SẮP MỞ (UPCOMING / LOCKED)
    return (
      <div
        id={`lot-${restKey}`}
        style={{ width: `${width}px` }}
        className="h-56 border-3 border-dashed border-amber-400 bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0 transition-all opacity-95"
      >
        {/* Rào chắn công trình quy hoạch */}
        <div className="relative -mt-2 -mx-2 mb-1 shrink-0">
          <div className="h-4 w-full flex overflow-hidden shadow-2xs rounded-t-xl">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{
                  backgroundColor: i % 2 === 0 ? '#F59E0B' : '#78350F',
                }}
              />
            ))}
          </div>

          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white font-black px-2 py-0.2 rounded-full text-[8px] shadow-xs flex items-center gap-0.5 border border-amber-500 whitespace-nowrap z-10">
            <span>🏗️</span>
            <span>MẶT BẰNG QUY HOẠCH</span>
          </div>
        </div>

        {/* Biển báo dự án sắp mở */}
        <div className="rounded-xl p-1.5 flex items-center justify-between border border-amber-300 bg-white/95 shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xl shrink-0 opacity-70">{rest.icon}</span>
            <div className="min-w-0">
              <h3 className="font-black text-xs text-slate-800 leading-tight truncate">
                Dự Án: {rest.name}
              </h3>
              <div className="text-[8px] font-bold text-amber-800 flex items-center gap-1 truncate">
                <span className="text-rose-600 font-extrabold">
                  {rest.unlockCost.toLocaleString('vi-VN')} đ
                </span>
                <span>·</span>
                <span className="text-amber-700">{rest.requiredReputation}⭐</span>
                {(rest.requiredStaffCount || 0) > 0 && (
                  <>
                    <span>·</span>
                    <span
                      className={
                        gameState.hiredEmployees.length >= (rest.requiredStaffCount || 0)
                          ? 'text-emerald-700 font-extrabold'
                          : 'text-rose-600 font-extrabold'
                      }
                    >
                      {rest.requiredStaffCount} NV
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={safeClick(() => openModal('franchise'))}
            className={`px-2 py-1 text-white rounded-lg text-[9.5px] font-black shadow-2xs active:scale-95 transition-all flex items-center gap-0.5 shrink-0 ${
              gameState.money >= rest.unlockCost &&
              gameState.reputation >= rest.requiredReputation &&
              gameState.hiredEmployees.length >= (rest.requiredStaffCount || 0)
                ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600'
            }`}
            title="Mở chi nhánh mới này"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Mở Quán 🚀</span>
          </button>
        </div>

        {/* Khu vực chuẩn bị mặt bằng */}
        <div
          onClick={safeClick(() => openModal('franchise'))}
          className="bg-white/80 rounded-xl border border-dashed border-amber-300 p-1.5 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-2xs"
          title="Chạm để xem điều kiện mở chi nhánh"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-11 h-13 rounded-lg border border-dashed border-amber-400 bg-amber-50 flex flex-col justify-around items-center p-0.5 shrink-0">
              <span className="text-lg opacity-60">{rest.equipmentIcon}</span>
              <span className="text-[6.5px] font-black text-amber-900 bg-amber-200/60 px-0.5 rounded truncate">
                Sắp Nhập
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-[9.5px] font-black text-slate-800 truncate">
                Thiết bị: {rest.equipmentName}
              </div>
              <div className="text-[8px] text-slate-600 font-medium line-clamp-2 mt-0.5">
                {rest.starterDescription}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-1">
            <span
              className={`text-[8px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap border ${
                gameState.money >= rest.unlockCost && gameState.reputation >= rest.requiredReputation
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                  : 'bg-orange-100 text-orange-800 border-orange-200'
              }`}
            >
              {gameState.money >= rest.unlockCost && gameState.reputation >= rest.requiredReputation
                ? 'ĐỦ ĐIỀU KIỆN! ✨'
                : 'TÍCH VỐN ⏳'}
            </span>
          </div>
        </div>

        {/* Chân mặt bằng */}
        <div className="h-1 w-full bg-amber-400 rounded-b-md opacity-60" />
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none bg-[#FDF8F0] relative">
      {/* 1. THANH TRẠNG THÁI PHỐ XÁ & PHÍM NHẢY NHANH ĐẾN TỪNG QUÁN (STICKY QUICK JUMP) */}
      <div className="relative z-30 shrink-0 bg-white/95 backdrop-blur-xs border-b border-amber-200/80 shadow-2xs px-2.5 py-1.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs font-black text-amber-950 shrink-0">
            <span>📍</span>
            <span className="truncate">Phố Ẩm Thực</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            <span>🪑 Bàn:</span>
            <span className="text-rose-600 font-extrabold">
              {activeOrders.length}/{maxTables}
            </span>
          </div>

          {/* Quick jump chips đến từng quán và hàng xóm */}
          <div className="flex items-center gap-1 text-[10px] font-bold shrink-0">
            {/* 5 Quán ẩm thực */}
            <button
              onClick={() => scrollToElement('lot-banh_mi')}
              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-black active:scale-95 transition-all flex items-center gap-0.5 ${
                activeRestId === 'banh_mi'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
              }`}
            >
              <span>🥖 Bánh mì</span>
              {activeRestId === 'banh_mi' ? (
                <span className="text-[7.5px]">👑</span>
              ) : gameState.unlockedRestaurants?.includes('banh_mi') ? (
                <span className="text-[7.5px]">🟢</span>
              ) : null}
            </button>

            <button
              onClick={() => scrollToElement('lot-pho')}
              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-black active:scale-95 transition-all flex items-center gap-0.5 ${
                activeRestId === 'pho'
                  ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
              }`}
            >
              <span>🍜 Phở bò</span>
              {activeRestId === 'pho' ? (
                <span className="text-[7.5px]">👑</span>
              ) : gameState.unlockedRestaurants?.includes('pho') ? (
                <span className="text-[7.5px]">🟢</span>
              ) : (
                <span className="text-[7.5px] opacity-60">🏗️</span>
              )}
            </button>

            <button
              onClick={() => scrollToElement('lot-bun')}
              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-black active:scale-95 transition-all flex items-center gap-0.5 ${
                activeRestId === 'bun'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
              }`}
            >
              <span>🍲 Bún bò</span>
              {activeRestId === 'bun' ? (
                <span className="text-[7.5px]">👑</span>
              ) : gameState.unlockedRestaurants?.includes('bun') ? (
                <span className="text-[7.5px]">🟢</span>
              ) : (
                <span className="text-[7.5px] opacity-60">🏗️</span>
              )}
            </button>

            <button
              onClick={() => scrollToElement('lot-beefsteak')}
              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-black active:scale-95 transition-all flex items-center gap-0.5 ${
                activeRestId === 'beefsteak'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
              }`}
            >
              <span>🥩 Bò né</span>
              {activeRestId === 'beefsteak' ? (
                <span className="text-[7.5px]">👑</span>
              ) : gameState.unlockedRestaurants?.includes('beefsteak') ? (
                <span className="text-[7.5px]">🟢</span>
              ) : (
                <span className="text-[7.5px] opacity-60">🏗️</span>
              )}
            </button>

            <button
              onClick={() => scrollToElement('lot-com_tam')}
              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-black active:scale-95 transition-all flex items-center gap-0.5 ${
                activeRestId === 'com_tam'
                  ? 'bg-green-600 text-white border-green-700 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
              }`}
            >
              <span>🍛 Cơm tấm</span>
              {activeRestId === 'com_tam' ? (
                <span className="text-[7.5px]">👑</span>
              ) : gameState.unlockedRestaurants?.includes('com_tam') ? (
                <span className="text-[7.5px]">🟢</span>
              ) : (
                <span className="text-[7.5px] opacity-60">🏗️</span>
              )}
            </button>

            <span className="text-amber-300">|</span>

            {/* Các địa điểm hàng xóm */}
            <button
              onClick={() => scrollToElement('lot-sua_xe')}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🔧 Sửa xe
            </button>
            <button
              onClick={() => scrollToElement('lot-tap_hoa')}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🛒 Tạp hóa
            </button>
            <button
              onClick={() => scrollToElement('lot-cay_me')}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 text-amber-900 active:scale-95 transition-all"
            >
              🎟️ Vé số
            </button>
            <button
              onClick={() => scrollToElement('lot-ca_phe')}
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

      {/* 2. KHÔNG GIAN PHỐ XÁ VỈA HÈ SÀI GÒN (CUỘN NGANG ẤM CÚNG ~2100PX) */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex-1 overflow-x-auto overflow-y-hidden relative no-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ width: '2150px' }} className="h-full flex flex-col justify-between relative min-h-[430px]">
          {/* LỚP 1: BẦU TRỜI & DÃY NHÀ PHỐ XÁ XA XA */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#7DD3FC]/40 via-[#FED7AA]/30 to-transparent pointer-events-none z-0">
            {/* Đám mây trôi */}
            <div className="absolute top-2 left-20 text-3xl opacity-40 animate-pulse">☁️</div>
            <div className="absolute top-4 left-[600px] text-2xl opacity-40">☁️</div>
            <div className="absolute top-1 left-[1200px] text-3xl opacity-40">☁️</div>
            <div className="absolute top-3 left-[1800px] text-2xl opacity-40">☁️</div>

            {/* Dãy nhà phố xa xa */}
            <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end opacity-25 gap-2 px-2 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-20 rounded-t-sm shrink-0"
                  style={{
                    height: `${40 + (i % 4) * 12}px`,
                    backgroundColor: ['#90CAF9', '#CE93D8', '#80DEEA', '#FFE082', '#A5D6A7'][i % 5],
                  }}
                />
              ))}
            </div>

            {/* Dây điện chằng chịt đặc trưng đường phố Sài Gòn */}
            <div className="absolute top-8 left-0 right-0 h-6 pointer-events-none z-10">
              <svg viewBox="0 0 2150 30" className="w-full h-full opacity-60">
                <path d="M 0 8 Q 400 22 800 10 Q 1400 24 2150 8" stroke="#37474F" strokeWidth="1.2" fill="none" />
                <path d="M 0 14 Q 500 26 1100 12 Q 1700 26 2150 14" stroke="#455A64" strokeWidth="0.8" fill="none" />
                {/* Chim sẻ đậu trên dây điện */}
                <circle cx="280" cy="12" r="2" fill="#3E2723" />
                <circle cx="750" cy="11" r="2" fill="#3E2723" />
                <circle cx="1320" cy="14" r="2" fill="#3E2723" />
                <circle cx="1890" cy="12" r="2" fill="#3E2723" />
              </svg>
            </div>
          </div>

          {/* LỚP 2: DÃY MẶT TIỀN 5 QUÁN & HÀNG XÓM THÂN THƯƠNG */}
          <div className="flex-1 flex items-end pt-10 pb-1 px-3 relative z-10 gap-2.5">
            {/* 1. TIỆM SỬA XE MÁY CHÚ NĂM (~180px) */}
            <div
              id="lot-sua_xe"
              style={{ width: '180px' }}
              className="h-56 bg-[#D7CCC8]/90 border-2 border-[#8D6E63] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#FFA000] border border-[#FF8F00] text-amber-950 font-black text-center text-[10px] py-1 rounded-lg shadow-2xs">
                🔧 SỬA XE CHÚ NĂM
                <div className="text-[8px] font-bold text-amber-900">
                  Bơm Vá · Nhớt · Rửa Xe
                </div>
              </div>

              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex flex-col gap-0.5 items-center">
                  <span className="text-lg leading-none" title="Vỏ lốp xe">🛞</span>
                  <div className="bg-[#FFF8E1] border border-amber-300 rounded px-1 text-[7.5px] font-black text-amber-900 text-center leading-tight">
                    Xăng Lẻ<br />25k/chai
                  </div>
                </div>

                <div
                  onClick={safeClick(() => openModal('delivery'))}
                  className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
                  title="Chạm để mở Đội Xe Giao Hàng & Nhận Cuốc"
                >
                  <div className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full mb-0.5 animate-bounce shadow-2xs">
                    Nổ Cuốc 🛵
                  </div>
                  <ChibiAvatar type="chu_nam" emotion="happy" size={40} />
                  <span className="text-[8px] font-black text-sky-950 bg-sky-100 px-1 py-0.2 rounded border border-sky-200 mt-0.5">
                    Chú Năm
                  </span>
                </div>
              </div>

              <div
                onClick={safeClick(() => openModal('delivery'))}
                className="bg-white/90 rounded-lg py-0.5 text-center text-[8px] font-black text-sky-900 border border-sky-200 cursor-pointer hover:bg-sky-50 transition-all"
              >
                👉 Chạm ship đơn mang về
              </div>
            </div>

            {/* Cột điện bê tông */}
            <div className="w-4 h-60 bg-[#B0BEC5] rounded-t-xs flex flex-col justify-between items-center py-2 shrink-0 border border-[#90A4AE] relative opacity-85">
              <span className="text-[6.5px] font-black text-slate-700 writing-vertical-lr rotate-180 opacity-70">
                KHOAN CẮT BÊ TÔNG
              </span>
              <div className="w-5 h-1.5 bg-[#78909C] rounded-xs" />
            </div>

            {/* 2. TẠP HÓA CÔ BA (~180px) */}
            <div
              id="lot-tap_hoa"
              style={{ width: '180px' }}
              className="h-56 bg-[#FFF9C4] border-2 border-[#FBC02D] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#E53935] text-white font-black text-center text-[10px] py-1 rounded-lg shadow-2xs">
                🍬 TẠP HÓA CÔ BA
                <div className="text-[8px] font-medium text-amber-100">
                  Bánh kẹo · Nước giải khát
                </div>
              </div>

              <div
                onClick={safeClick(() => openModal('market'))}
                className="flex items-center justify-between px-1 py-1 bg-white/85 rounded-xl border border-amber-300 cursor-pointer hover:border-amber-500 transition-all group"
                title="Chạm để vào Chợ Đầu Mối mua nguyên liệu"
              >
                <div className="space-y-0.5 text-[10px]">
                  <div>🥫 🧃 🍼</div>
                  <div className="text-[7.5px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded inline-block">
                    🧊 THÙNG ĐÁ
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-base group-hover:scale-110 transition-transform">🪭</span>
                  <ChibiAvatar type="chi_lan" emotion="happy" size={38} />
                  <span className="text-[8px] font-black text-amber-950 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 mt-0.5">
                    Cô Ba
                  </span>
                </div>
              </div>

              <div
                onClick={safeClick(() => openModal('market'))}
                className="bg-amber-100/90 rounded-lg py-0.5 text-center text-[8px] font-black text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-200 transition-all"
              >
                🛒 Vào Chợ Sỉ nguyên liệu
              </div>
            </div>

            {/* LOT 1: 🥖 TIỆM BÁNH MÌ SÀI GÒN & CÀ PHÊ (~280px) */}
            {renderStorefrontLot('banh_mi', 280)}

            {/* LOT 2: 🍜 QUÁN PHỞ BÒ GIA TRUYỀN (~280px) */}
            {renderStorefrontLot('pho', 280)}

            {/* 3. CÂY ME CỔ THỤ & QUẦY VÉ SỐ CÔ BẢY (~200px) */}
            <div
              id="lot-cay_me"
              style={{ width: '200px' }}
              className="h-56 relative flex flex-col justify-end items-center shrink-0"
            >
              {/* Vòm cây me râm mát */}
              <div className="absolute top-0 left-2 w-32 h-32 rounded-full bg-emerald-600/90 border-3 border-emerald-700 shadow-md flex items-center justify-center text-3xl z-10">
                🌳
                <div
                  onClick={safeClick(() => openModal('streetEvents'))}
                  className={`absolute -top-1 -right-2 px-2 py-0.5 rounded-full text-[8px] font-black shadow-md cursor-pointer flex items-center gap-0.5 z-30 transition-all active:scale-95 ${
                    gameState.currentEvent
                      ? 'bg-rose-600 text-white animate-bounce ring-2 ring-yellow-300'
                      : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Loa phường phố: Xem sự kiện phố xá"
                >
                  <span>📢</span>
                  <span>{gameState.currentEvent ? 'CÓ BIẾN! 🚨' : 'Loa Phường'}</span>
                </div>
              </div>

              {/* Dưới bóng cây: Quầy vé số Cô Bảy */}
              <div className="w-full bg-[#E8F5E9] border-2 border-emerald-400 rounded-t-xl p-1.5 relative z-20 flex items-center justify-around shadow-sm">
                <div className="text-center">
                  <span className="text-xl">🪣</span>
                  <div className="text-[7px] font-black text-sky-800 leading-tight">
                    TRÀ ĐÁ<br />MIỄN PHÍ
                  </div>
                </div>

                <div
                  onClick={safeClick(() => openModal('lotteryDraw'))}
                  className="bg-amber-50 border border-amber-400 rounded-xl p-1 flex flex-col items-center cursor-pointer shadow-2xs hover:scale-105 active:scale-95 transition-all"
                  title="Chạm để tra sổ mơ, mua vé số hoặc ghi đề x70"
                >
                  <span className="text-[7.5px] bg-red-600 text-white font-black px-1 py-0.2 rounded-full mb-0.5 animate-pulse">
                    Đề x70 🎟️
                  </span>
                  <ChibiAvatar type="co_bay" emotion="happy" size={38} />
                  <span className="text-[8px] font-black text-amber-950 mt-0.5">
                    Cô Bảy Vé Số
                  </span>
                </div>
              </div>
            </div>

            {/* LOT 3: 🍲 QUÁN BÚN BÒ HUẾ & BÚN RIÊU CUA (~280px) */}
            {renderStorefrontLot('bun', 280)}

            {/* 4. CÀ PHÊ CÓC & BÀN CỜ TƯỚNG BÁC BA (~200px) */}
            <div
              id="lot-ca_phe"
              style={{ width: '200px' }}
              className="h-56 bg-[#FFE0B2] border-2 border-[#FFA726] rounded-t-2xl relative flex flex-col justify-between p-2 shadow-sm shrink-0"
            >
              <div className="bg-[#E65100] text-white font-black text-center text-[10px] py-1 rounded-lg shadow-2xs">
                ☕ CÀ PHÊ CÓC VỈA HÈ
                <div className="text-[8px] font-medium text-amber-100">
                  Cà phê phin · Bàn cờ tướng
                </div>
              </div>

              <div
                onClick={safeClick(() => openModal('neighbors'))}
                className="flex items-center justify-around px-1 py-1 bg-white/85 rounded-xl border border-amber-300 cursor-pointer hover:border-amber-500 transition-all"
                title="Bác Ba Tổ Trưởng & Bé Bông: Chạm để trò chuyện"
              >
                <div className="flex flex-col items-center">
                  <ChibiAvatar type="bac_ba" emotion="happy" size={38} />
                  <span className="text-[7.5px] font-black text-amber-950 bg-amber-100 px-1 rounded mt-0.5">
                    Bác Ba
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-base">♟️☕</span>
                  <div className="text-[7px] font-bold text-slate-600">
                    Chiếu Tướng!
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <ChibiAvatar type="be_bong" emotion="love" size={34} />
                  <span className="text-[7.5px] font-black text-rose-800 bg-rose-100 px-1 rounded mt-0.5">
                    Bé Bông
                  </span>
                </div>
              </div>

              <div
                onClick={safeClick(() => openModal('neighbors'))}
                className="bg-amber-100 rounded-lg py-0.5 text-center text-[8px] font-bold text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-200 transition-all"
              >
                💬 Tình làng nghĩa xóm
              </div>
            </div>

            {/* LOT 4: 🥩 BÒ NÉ & BEEFSTEAK CHẢO GANG (~280px) */}
            {renderStorefrontLot('beefsteak', 280)}

            {/* LOT 5: 🍛 QUÁN CƠM TẤM SƯỜN BÌ CHẢ (~280px) */}
            {renderStorefrontLot('com_tam', 280)}
          </div>

          {/* LỚP 3: VỈA HÈ LÁT GẠCH CHÂN THỰC & DÃY BÀN GHẾ NHỰA ĐỎ */}
          <div className="relative z-20 bg-[#F4E4D0] border-t-3 border-[#D7CCC8] shadow-inner pt-1.5 pb-2 px-3">
            {/* Header vỉa hè */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: stageVisual.table.badgeBg }}
                  className="text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>{stageVisual.table.tableTypeIcon}</span>
                  <span>
                    {stageVisual.table.headerTitle} ({activeOrders.length}/{maxTables} bàn)
                  </span>
                </span>
                <span className="text-[9px] text-[#7C5C55] font-extrabold hidden sm:inline">
                  👉 Bàn của {currentRest.name} · Bấm nút "Bưng Món" để nhận tiền
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-amber-900 font-bold opacity-80">
                <span>🚦 Đèn xanh</span>
                <span>·</span>
                <span>🚏 Trạm xe buýt</span>
                <span>·</span>
                <span>🚒 Trụ nước</span>
              </div>
            </div>

            {/* Dãy bàn ghế phục vụ khách */}
            <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-0.5">
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
                    className={`relative shrink-0 w-28 sm:w-32 rounded-xl p-1.5 transition-all cursor-pointer border-2 shadow-2xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-300'
                        : order
                        ? `${stageVisual.table.tableCardBg} ${stageVisual.table.tableCardBorder} hover:border-amber-400`
                        : 'bg-white/70 border-dashed border-amber-300'
                    }`}
                  >
                    {/* Header bàn: Số bàn & Trạng thái */}
                    <div className="flex items-center justify-between text-[8px] font-black text-[#7C5C55] mb-0.5">
                      <span className="bg-[#FFE082] px-1 py-0.2 rounded">
                        Bàn {tableNum}
                      </span>
                      {order && (
                        <span
                          className={`text-[7.5px] font-bold px-1 py-0.2 rounded-full ${
                            order.state === 'ready'
                              ? 'bg-emerald-100 text-emerald-700 animate-pulse font-black'
                              : order.state === 'eating'
                              ? 'bg-amber-100 text-amber-700 font-bold'
                              : order.state === 'cooking'
                              ? 'bg-blue-100 text-blue-700 font-bold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {order.state === 'ready'
                            ? '✨ Có Món'
                            : order.state === 'eating'
                            ? '😋 Đang Ăn'
                            : order.state === 'cooking'
                            ? '♨️ Đang Nấu'
                            : '⏳ Đang Đợi'}
                        </span>
                      )}
                    </div>

                    {/* Khung cảnh bàn ăn: Ghế + Khách chibi + Bàn theo cấp */}
                    <div className="h-14 bg-[#FFF9F2] rounded-lg border border-[#F7D7BA] flex items-center justify-around px-1 relative overflow-hidden">
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
                              size={30}
                            />
                            <span className="text-[7px] font-black text-[#7C5C55] truncate max-w-[42px] leading-tight mt-0.5">
                              {order.neighborId
                                ? NEIGHBORS_DATA[order.neighborId].name
                                : cType?.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-sm animate-bounce-short leading-none" title={recipe?.name}>
                              {recipe?.icon || currentRest.icon}
                            </div>
                            <div
                              style={{
                                background: stageVisual.table.topHighlight || stageVisual.table.topBg,
                                borderColor: stageVisual.table.topBorder,
                              }}
                              className="w-8 h-2 rounded-2xs border shadow-2xs flex items-center justify-center my-0.5"
                            >
                              <span
                                style={{ color: stageVisual.table.labelColor }}
                                className="text-[4.5px] font-black leading-none tracking-tighter truncate max-w-[28px]"
                              >
                                {stageVisual.table.label}
                              </span>
                            </div>
                            <div className="w-7 flex justify-between px-0.5">
                              <div
                                style={{ backgroundColor: stageVisual.table.legColor }}
                                className="w-0.5 h-1.5"
                              />
                              <div
                                style={{ backgroundColor: stageVisual.table.legColor }}
                                className="w-0.5 h-1.5"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <span className="text-base opacity-60">🪑</span>
                          <span className="text-[7.5px] font-bold mt-0.5">Bàn trống</span>
                        </div>
                      )}
                    </div>

                    {/* Nút bưng món nhanh ngay ngoài phố */}
                    {order && order.state === 'ready' ? (
                      <button
                        onClick={safeClick(() => handleServeOnStreet(order.id))}
                        className="mt-1 w-full py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-[8.5px] font-black flex items-center justify-center gap-0.5 animate-bounce-short shadow-2xs"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>BƯNG MÓN 💰</span>
                      </button>
                    ) : order ? (
                      <div className="mt-0.5 text-center text-[7.5px] text-slate-600 font-bold truncate">
                        {recipe?.name}
                      </div>
                    ) : (
                      <div className="mt-0.5 text-center text-[7px] text-slate-400 italic">
                        Đang đợi khách
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LỚP 4: LÒNG ĐƯỜNG NHỰA & XE CỘ SÀI GÒN QUA LẠI */}
          <div className="relative z-10 h-10 bg-[#37474F] border-t-2 border-[#263238] flex items-center overflow-hidden">
            {/* Vạch kẻ đường đứt quãng */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex justify-between px-4 pointer-events-none opacity-60">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-10 h-0.5 bg-yellow-300 shrink-0 mx-2" />
              ))}
            </div>

            {/* Xe cộ chạy trên đường phố */}
            <div
              className="absolute flex items-center gap-1 transition-all duration-300 pointer-events-none"
              style={{
                left: `${(trafficTick * 22) % 2150}px`,
              }}
            >
              <span className="text-xl -scale-x-100 filter drop-shadow">🛵</span>
              <span className="text-[8px] bg-emerald-500 text-white px-1 rounded-full font-bold">
                Shipper
              </span>
            </div>

            <div
              className="absolute flex items-center gap-1 transition-all duration-300 pointer-events-none"
              style={{
                left: `${((trafficTick * 18 + 700) % 2150)}px`,
              }}
            >
              <span className="text-xl -scale-x-100 filter drop-shadow">🛵</span>
              <span className="text-[8px] bg-sky-500 text-white px-1 rounded-full font-bold">
                Cub 50
              </span>
            </div>

            <div
              className="absolute flex items-center gap-1 transition-all duration-300 pointer-events-none"
              style={{
                left: `${((trafficTick * 14 + 1400) % 2150)}px`,
              }}
            >
              <span className="text-xl -scale-x-100 filter drop-shadow">🚲</span>
              <span className="text-[8px] bg-amber-500 text-white px-1 rounded-full font-bold">
                Xích lô
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐIỀU HƯỚNG CUỘN VÀ CHỈ BÁO VỊ TRÍ PHỐ */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xs border-t border-amber-200 px-3 py-1 flex items-center justify-between text-xs font-bold text-amber-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScrollBy(-280)}
            disabled={!canScrollLeft}
            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 border border-amber-200 transition-all active:scale-95"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleScrollBy(280)}
            disabled={!canScrollRight}
            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 border border-amber-200 transition-all active:scale-95"
            title="Cuộn sang phải"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9.5px] text-amber-900 hidden sm:inline">
            Vuốt ngang hoặc chọn nút trên để tham quan 5 Quán & Hàng Xóm ➔
          </span>
        </div>

        {/* Thanh tiến độ cuộn đường phố */}
        <div className="flex items-center gap-2">
          <div className="w-20 bg-amber-100 h-1.5 rounded-full overflow-hidden border border-amber-200">
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
