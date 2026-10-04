import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  SHOP_THEMES,
  RESTAURANT_TYPES,
  EMPLOYEES,
} from '../../../../shared/gameData';
import { BusinessStageId, RestaurantTypeId, Employee } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  ShoppingBag,
  Bike,
  Coffee,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Award,
  ArrowRight,
  UserPlus,
  Map,
  Footprints,
  X,
  Building2,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export const StreetMapView: React.FC = () => {
  const {
    gameState,
    activeOrders,
    setCurrentView,
    serveDishOrder,
    openModal,
    switchActiveRestaurant,
  } = useGameStore();

  // Chế độ xem: 'town_map' (Bản đồ 2D bao quát toàn khu phố) hoặc 'street_walk' (Dạo phố cận cảnh 2D cuộn ngang)
  const [viewMode, setViewMode] = useState<'town_map' | 'street_walk'>('town_map');

  // Quán / Địa điểm đang chọn để mở bảng tương tác nhanh 2D
  const [selectedLotKey, setSelectedLotKey] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Trạng thái cuộn ngang chế độ cận cảnh
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Đèn giao thông 2D chuyển màu tự động
  const [trafficLight, setTrafficLight] = useState<'green' | 'yellow' | 'red'>('green');

  useEffect(() => {
    const timer = setInterval(() => {
      setTrafficLight((prev) => (prev === 'green' ? 'yellow' : prev === 'yellow' ? 'red' : 'green'));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Cấu hình cấp bậc & thương hiệu quán hiện tại
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
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

  const handleScrollBy = (offset: number) => {
    soundManager.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollToLandmark = (targetX: number) => {
    soundManager.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: targetX, behavior: 'smooth' });
    }
  };

  const handleSwitchToBranch = (id: RestaurantTypeId) => {
    soundManager.playClick();
    switchActiveRestaurant(id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
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

  // Helper đếm nhân viên được phân công cho quán
  const getBranchStaff = (restKey: RestaurantTypeId): Employee[] => {
    return gameState.hiredEmployees
      .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e) && (e.assignedRestaurantId || 'banh_mi') === restKey);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none bg-[#EBF4FA] relative">
      {/* CSS KEYFRAMES CHO HOẠT HỌA 2D (Xe máy chạy, khói bếp bay, bước chân người) */}
      <style>{`
        @keyframes driveEast {
          0% { transform: translateX(-120px); }
          100% { transform: translateX(1100px); }
        }
        @keyframes driveWest {
          0% { transform: translateX(1100px) scaleX(-1); }
          100% { transform: translateX(-120px) scaleX(-1); }
        }
        @keyframes smokeRise {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.8; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.5; }
          100% { transform: translateY(-20px) scale(1.4); opacity: 0; }
        }
        @keyframes walkerBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      {/* 1. THANH ĐIỀU KHIỂN & CHUYỂN ĐỔI CHẾ ĐỘ 2D */}
      <div className="relative z-30 shrink-0 bg-white/95 backdrop-blur-xs border-b border-amber-200/90 shadow-2xs px-2.5 py-1.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1 text-xs font-black text-amber-950 shrink-0">
            <span className="text-base">🛵</span>
            <span className="truncate">Phố Xá 2D</span>
          </div>

          {/* Nút chuyển đổi góc nhìn 2D */}
          <div className="flex items-center bg-amber-100/70 p-0.5 rounded-xl border border-amber-300 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('town_map');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                viewMode === 'town_map'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-white/60'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>Bản Đồ 2D</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('street_walk');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                viewMode === 'street_walk'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-rose-900 hover:bg-white/60'
              }`}
            >
              <Footprints className="w-3 h-3" />
              <span>Dạo Phố 2D</span>
            </button>
          </div>
        </div>

        {/* Thông tin nhanh & Sự kiện đường phố */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <span>🪑 Bàn: </span>
            <span className="text-rose-600 font-black">
              {activeOrders.length}/{maxTables}
            </span>
          </div>

          {gameState.currentEvent && (
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('streetEvents');
              }}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-[10px] font-black flex items-center gap-1 animate-bounce shadow-xs"
            >
              <span>🚨 CÓ BIẾN!</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2A. CHẾ ĐỘ 1: BẢN ĐỒ KHU PHỐ 2D TOÀN CẢNH (TOP-DOWN ANIMATED TOWN MAP) */}
      {/* ========================================================================= */}
      {viewMode === 'town_map' ? (
        <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden p-2 sm:p-3 bg-[#E8F1F5] flex flex-col justify-between">
          {/* BẦU TRỜI & NẮNG NHẸ SÀI GÒN */}
          <div className="w-full bg-gradient-to-b from-[#BEE3F8] to-[#E2E8F0] rounded-2xl border-2 border-slate-300 p-2.5 shadow-inner relative overflow-hidden flex flex-col gap-2.5">
            {/* Hàng 1: DÃY QUÁN ẨM THỰC 2D TRỌNG ĐIỂM (Bắc Phố) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                  <span>🏪</span>
                  <span>DÃY PHỐ ẨM THỰC ĐẾ CHẾ ({gameState.unlockedRestaurants?.length || 1}/5 QUÁN)</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500">Chạm quán để quản lý 👆</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(RESTAURANT_TYPES) as RestaurantTypeId[]).map((restKey) => {
                  const rest = RESTAURANT_TYPES[restKey];
                  const isCurrent = restKey === activeRestId;
                  const isUnlocked = gameState.unlockedRestaurants?.includes(restKey);
                  const staff = getBranchStaff(restKey);
                  const isStaffed = staff.length > 0;

                  return (
                    <div
                      key={restKey}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedLotKey(restKey);
                      }}
                      className={`relative rounded-xl p-2 border-2 transition-all cursor-pointer shadow-xs active:scale-98 flex flex-col justify-between h-28 ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 shadow-md'
                          : isUnlocked
                          ? 'bg-white border-emerald-300 hover:border-emerald-400'
                          : 'bg-slate-100/90 border-dashed border-slate-300 opacity-75'
                      }`}
                    >
                      {/* Mái hiên 2D */}
                      <div className="h-2 w-full rounded-t-lg -mt-1 -mx-0.5 mb-1 flex overflow-hidden">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full"
                            style={{
                              backgroundColor:
                                i % 2 === 0 ? rest.themeColor : isCurrent ? '#F59E0B' : '#FFFFFF',
                            }}
                          />
                        ))}
                      </div>

                      {/* Thông tin quán */}
                      <div className="flex items-start gap-1.5 min-w-0">
                        <div className="relative shrink-0 text-2xl">
                          <span>{rest.icon}</span>
                          {/* Khói nghi ngút nếu là quán đang mở */}
                          {isUnlocked && (
                            <span
                              style={{ animation: 'smokeRise 2s infinite ease-out' }}
                              className="absolute -top-2 left-2 text-[10px] pointer-events-none"
                            >
                              ♨️
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-black text-slate-900 leading-tight truncate">
                            {rest.name}
                          </h4>
                          <div className="text-[8.5px] font-bold text-slate-500 truncate mt-0.5">
                            {rest.equipmentName}
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái hoạt động 2D */}
                      <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between">
                        {isCurrent ? (
                          <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <span>👑</span> Trụ Sở
                          </span>
                        ) : isUnlocked ? (
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                              isStaffed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800 animate-pulse'
                            }`}
                          >
                            <span>{isStaffed ? '🟢' : '⚠️'}</span>
                            <span>{isStaffed ? `${staff.length} NV` : 'Cần NV'}</span>
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-500 bg-slate-200 px-1 rounded">
                            🏗️ Chưa mở
                          </span>
                        )}

                        <span className="text-[8.5px] font-black text-slate-700">
                          {isUnlocked ? `${rest.primaryRecipeIds.length} món` : `${(rest.unlockCost / 1000).toFixed(0)}k đ`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hàng 2: LÒNG ĐƯỜNG NHỰA 2D & XE CỘ HOẠT HỌA CHẠY QUA LẠI */}
            <div className="h-18 bg-[#374151] rounded-xl border-y-2 border-slate-600 relative overflow-hidden shadow-inner flex flex-col justify-between p-1">
              {/* Làn đường phía trên (Xe chạy từ Trái sang Phải) */}
              <div className="relative h-7 flex items-center overflow-hidden">
                {/* Vạch kẻ đường đứt nét */}
                <div className="absolute top-0 left-0 right-0 border-t border-dashed border-amber-300 opacity-60" />

                {/* Xe Dream chở bánh mì */}
                <div
                  style={{ animation: 'driveEast 14s infinite linear' }}
                  className="absolute flex items-center gap-0.5 text-base"
                >
                  <span title="Xe chở bánh mì">🛵</span>
                  <span className="text-[10px] -ml-1">🥖</span>
                  <span className="text-[8px] opacity-70">💨</span>
                </div>

                {/* Xe Shipper nổ cuốc */}
                <div
                  style={{ animation: 'driveEast 10s infinite linear 5s' }}
                  className="absolute flex items-center gap-0.5 text-base"
                >
                  <span className="text-emerald-400 text-xs">🛵</span>
                  <span className="text-[8px] bg-emerald-500 text-white px-1 rounded-full font-black text-[6px]">
                    SHIP
                  </span>
                </div>
              </div>

              {/* Vạch ngựa vằn qua đường (Zebra Crossing) & Cột đèn giao thông 2D */}
              <div className="absolute right-12 top-0 bottom-0 w-8 flex justify-around opacity-40 pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-1 h-full bg-white" />
                ))}
              </div>

              {/* Cột đèn tín hiệu giao thông 2D */}
              <div className="absolute right-2 top-2 z-10 bg-slate-900 border border-slate-700 rounded-md p-0.5 flex flex-col gap-0.5 shadow-md">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    trafficLight === 'red' ? 'bg-red-500 shadow-red-500 shadow-xs' : 'bg-red-950'
                  }`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    trafficLight === 'yellow' ? 'bg-amber-400 shadow-amber-400 shadow-xs' : 'bg-amber-950'
                  }`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    trafficLight === 'green' ? 'bg-emerald-400 shadow-emerald-400 shadow-xs' : 'bg-emerald-950'
                  }`}
                />
              </div>

              {/* Làn đường phía dưới (Xe chạy từ Phải sang Trái) */}
              <div className="relative h-7 flex items-center overflow-hidden">
                {/* Xe Vespa của Bác Ba */}
                <div
                  style={{ animation: 'driveWest 16s infinite linear 2s' }}
                  className="absolute flex items-center gap-0.5 text-base"
                >
                  <span>🛵</span>
                  <span className="text-[8px] opacity-60">💨</span>
                </div>

                {/* Xe xích lô dạo phố */}
                <div
                  style={{ animation: 'driveWest 22s infinite linear 8s' }}
                  className="absolute flex items-center gap-0.5 text-base"
                >
                  <span>🚲</span>
                  <span className="text-[9px]">🎈</span>
                </div>
              </div>
            </div>

            {/* Hàng 3: DÃY ĐỊA ĐIỂM DÂN CƯ & HÀNG XÓM VỈA HÈ (Nam Phố) */}
            <div>
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                  <span>🏘️</span>
                  <span>KHU TIỆN ÍCH DÂN CƯ & GIAO THƯƠNG</span>
                </span>
                <span className="text-[9.5px] font-bold text-amber-800">Bấm điểm đến để ghé thăm</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {/* 1. Chợ Đầu Mối / Mua Sỉ */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('market');
                  }}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group"
                  title="Vào Chợ Sỉ Mua Nguyên Liệu"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🛒</span>
                  <span className="text-[9.5px] font-black text-amber-950 mt-0.5">Chợ Sỉ</span>
                  <span className="text-[7.5px] font-bold text-amber-700">Rau thịt bơ trứng</span>
                </div>

                {/* 2. Cà phê Bác Ba & Cây Me */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('neighbors');
                  }}
                  className="bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group"
                  title="Trò Chuyện Hàng Xóm Bác Ba"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">☕</span>
                  <span className="text-[9.5px] font-black text-orange-950 mt-0.5">Bác Ba</span>
                  <span className="text-[7.5px] font-bold text-orange-700">Cà phê vợt & cờ</span>
                </div>

                {/* 3. Đội Xe Giao Hàng */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('delivery');
                  }}
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group"
                  title="Nhận Cuốc Giao Hàng Siêu Tốc"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🛵</span>
                  <span className="text-[9.5px] font-black text-sky-950 mt-0.5">Đội Ship</span>
                  <span className="text-[7.5px] font-bold text-sky-700">Đơn mang về</span>
                </div>

                {/* 4. Tiệm Sửa Xe Chú Năm */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('delivery');
                  }}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group"
                  title="Sửa Xe & Bơm Vá Chú Năm"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🔧</span>
                  <span className="text-[9.5px] font-black text-stone-900 mt-0.5">Chú Năm</span>
                  <span className="text-[7.5px] font-bold text-stone-600">Bơm vá thay nhớt</span>
                </div>

                {/* 5. Đại Lý Vé Số Cô Bảy */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('lotteryDraw');
                  }}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group"
                  title="Mua Vé Số & Ghi Đề x70"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🎟️</span>
                  <span className="text-[9.5px] font-black text-rose-950 mt-0.5">Cô Bảy</span>
                  <span className="text-[7.5px] font-bold text-rose-700">Vé số & đề x70</span>
                </div>

                {/* 6. Loa Phường & Sự Kiện */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    openModal('streetEvents');
                  }}
                  className={`rounded-xl p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs active:scale-95 transition-all group ${
                    gameState.currentEvent
                      ? 'bg-red-500 text-white animate-bounce'
                      : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                  }`}
                  title="Xem Tin Tức & Biến Cố Phố Xá"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🌳</span>
                  <span
                    className={`text-[9.5px] font-black mt-0.5 ${
                      gameState.currentEvent ? 'text-white' : 'text-emerald-950'
                    }`}
                  >
                    {gameState.currentEvent ? 'Có Biến!' : 'Cây Me'}
                  </span>
                  <span
                    className={`text-[7.5px] font-bold ${
                      gameState.currentEvent ? 'text-amber-200' : 'text-emerald-700'
                    }`}
                  >
                    Loa phố xá
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2B. CHẾ ĐỘ 2: PHỐ ĐI BỘ 2D HOẠT HỌA CẬN CẢNH (SIDE-SCROLLING PANORAMA)   */
        /* ========================================================================= */
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex-1 w-full overflow-x-auto overflow-y-hidden relative no-scrollbar touch-pan-x flex flex-col justify-between bg-gradient-to-b from-[#CDE4F7] via-[#EBF4FA] to-[#F5ECE0]"
        >
          {/* CONTAINER PHỐ XÁ 2D RỘNG 2600PX */}
          <div
            style={{ width: '2600px', minWidth: '2600px' }}
            className="shrink-0 h-full flex flex-col justify-between relative overflow-hidden"
          >
            {/* LỚP 1: BẦU TRỜI & DÃY NHÀ CAO ỐC XA XĂM */}
            <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none opacity-40 overflow-hidden flex items-end justify-between px-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="w-24 sm:w-32 rounded-t-md opacity-50 flex flex-col justify-around p-1 shrink-0"
                  style={{
                    height: `${50 + (i % 4) * 15}px`,
                    backgroundColor: ['#90CAF9', '#CE93D8', '#80DEEA', '#FFE082'][i % 4],
                  }}
                />
              ))}
            </div>

            {/* DÂY ĐIỆN VÀ CHIM ĐẬU ĐẶC TRƯNG VIỆT NAM */}
            <div className="absolute top-8 left-0 right-0 h-8 pointer-events-none z-10">
              <svg viewBox="0 0 2600 35" className="w-full h-full opacity-60">
                <path d="M 0 10 Q 600 28 1300 12 Q 2000 30 2600 14" stroke="#263238" strokeWidth="1.2" fill="none" />
                <path d="M 0 16 Q 700 32 1500 18 Q 2200 32 2600 20" stroke="#37474F" strokeWidth="0.8" fill="none" />
              </svg>
            </div>

            {/* LỚP 2: DÃY CỬA TIỆM 2D SÁT MẶT ĐƯỜNG */}
            <div className="flex-1 flex items-end pt-8 pb-1 px-4 relative z-10 gap-3">
              {/* Tiệm sửa xe Chú Năm */}
              <div
                onClick={() => openModal('delivery')}
                style={{ width: '240px' }}
                className="h-52 bg-[#D7CCC8] border-2 border-[#8D6E63] rounded-t-2xl p-2 flex flex-col justify-between shadow-sm shrink-0 cursor-pointer hover:brightness-105 transition-all"
              >
                <div className="bg-amber-400 text-amber-950 font-black text-xs text-center py-1 rounded-lg">
                  🔧 SỬA XE CHÚ NĂM
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-2xl">🛞</span>
                  <ChibiAvatar type="chu_nam" emotion="happy" size={44} />
                </div>
                <div className="bg-white/90 text-center py-0.5 rounded text-[9px] font-bold text-stone-700">
                  Bơm vá · Nhận ship mang về 🛵
                </div>
              </div>

              {/* Tạp hóa Cô Ba */}
              <div
                onClick={() => openModal('market')}
                style={{ width: '240px' }}
                className="h-52 bg-[#FFF9C4] border-2 border-[#FBC02D] rounded-t-2xl p-2 flex flex-col justify-between shadow-sm shrink-0 cursor-pointer hover:brightness-105 transition-all"
              >
                <div className="bg-rose-500 text-white font-black text-xs text-center py-1 rounded-lg">
                  🍬 TẠP HÓA CÔ BA
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-xl">🥫🍪🧃</span>
                  <ChibiAvatar type="chi_lan" emotion="happy" size={44} />
                </div>
                <div className="bg-amber-100 text-center py-0.5 rounded text-[9px] font-black text-amber-900">
                  Chợ sỉ rau thịt bơ trứng 🛒
                </div>
              </div>

              {/* 5 Quán ẩm thực chính */}
              {(Object.keys(RESTAURANT_TYPES) as RestaurantTypeId[]).map((restKey) => {
                const rest = RESTAURANT_TYPES[restKey];
                const isCurrent = restKey === activeRestId;
                const isUnlocked = gameState.unlockedRestaurants?.includes(restKey);
                const staff = getBranchStaff(restKey);

                return (
                  <div
                    key={restKey}
                    style={{
                      width: '380px',
                      backgroundColor: rest.accentColor,
                      borderColor: rest.themeColor,
                    }}
                    className={`h-56 border-4 rounded-t-3xl relative flex flex-col justify-between p-2 shadow-md shrink-0 transition-all ${
                      isCurrent ? 'ring-2 ring-amber-400 shadow-amber-200' : ''
                    }`}
                  >
                    {/* Mái hiên sọc 2D */}
                    <div className="h-4 w-full flex overflow-hidden rounded-t-xl -mt-2 -mx-2 mb-1">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full"
                          style={{
                            backgroundColor:
                              i % 2 === 0 ? rest.themeColor : isCurrent ? '#F59E0B' : '#FFFFFF',
                          }}
                        />
                      ))}
                    </div>

                    {/* Biển hiệu quán */}
                    <div className="rounded-xl p-2 bg-white/95 border flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-2xl animate-bounce-short shrink-0">{rest.icon}</span>
                        <div className="min-w-0">
                          <h3 className="font-black text-xs text-slate-900 truncate">{rest.name}</h3>
                          <div className="text-[9px] text-emerald-800 font-bold">{rest.badge}</div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <button
                          onClick={() => setCurrentView('shop')}
                          className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black shadow-xs active:scale-95"
                        >
                          Vào Bếp 🍳
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleSwitchToBranch(restKey)}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black shadow-xs active:scale-95"
                        >
                          Đổi Quán 🔀
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal('franchise')}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black shadow-xs active:scale-95"
                        >
                          Mở Quán 🚀
                        </button>
                      )}
                    </div>

                    {/* Mặt trước quầy & Trạng thái nhân sự */}
                    <div className="bg-white/90 rounded-xl p-1.5 flex items-center justify-between border border-black/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{rest.equipmentIcon}</span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-black text-slate-800 truncate">
                            {rest.equipmentName}
                          </div>
                          <div className="text-[8.5px] text-slate-500 italic truncate">
                            {rest.tagline}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isUnlocked ? (
                          <span
                            className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full ${
                              staff.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {staff.length > 0 ? `🟢 ${staff.length} NV Trực` : '⚠️ Cần Nhân Viên'}
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-500">
                            Cần {(rest.unlockCost / 1000).toFixed(0)}k đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Cà phê cọc Bác Ba & Cây Me */}
              <div
                onClick={() => openModal('neighbors')}
                style={{ width: '240px' }}
                className="h-52 bg-[#FFE0B2] border-2 border-[#FFA726] rounded-t-2xl p-2 flex flex-col justify-between shadow-sm shrink-0 cursor-pointer hover:brightness-105 transition-all"
              >
                <div className="bg-orange-600 text-white font-black text-xs text-center py-1 rounded-lg">
                  ☕ CÀ PHÊ BÁC BA & CÂY ME
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-2xl">🌳</span>
                  <ChibiAvatar type="bac_ba" emotion="happy" size={44} />
                </div>
                <div className="bg-white/90 text-center py-0.5 rounded text-[9px] font-bold text-amber-900">
                  Giao lưu bà con lối xóm 💬
                </div>
              </div>
            </div>

            {/* LỚP 3: VỈA HÈ LÁT GẠCH & DÃY BÀN GHẾ NGOÀI TRỜI */}
            <div className="relative z-20 bg-[#F4E4D0] border-t-4 border-[#D7CCC8] shadow-inner py-2 px-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-[#7C5C55] bg-amber-200/80 px-2 py-0.5 rounded-full">
                  🪑 BÀN ĂN VỈA HÈ CỦA {currentRest.name.toUpperCase()} ({activeOrders.length}/{maxTables})
                </span>
                <span className="text-[9px] text-[#7C5C55] font-bold">Chạm bàn để bưng món & thu tiền</span>
              </div>

              {/* Dãy bàn ghế */}
              <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-0.5">
                {Array.from({ length: maxTables }).map((_, idx) => {
                  const tableNum = idx + 1;
                  const order = activeOrders.find((o) => o.tableIndex === tableNum);
                  const recipe = order ? RECIPES[order.recipeId] : null;

                  return (
                    <div
                      key={tableNum}
                      onClick={() => setSelectedTable(tableNum)}
                      className={`w-28 sm:w-32 rounded-xl p-1.5 border-2 shadow-2xs flex flex-col justify-between shrink-0 cursor-pointer ${
                        order
                          ? 'bg-white border-amber-400'
                          : 'bg-white/70 border-dashed border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between text-[8px] font-black text-stone-700">
                        <span>Bàn {tableNum}</span>
                        {order && (
                          <span className={order.state === 'ready' ? 'text-emerald-600 font-black animate-pulse' : 'text-slate-500'}>
                            {order.state === 'ready' ? '✨ Có Món' : order.state === 'eating' ? '😋 Đang Ăn' : '⏳ Chờ'}
                          </span>
                        )}
                      </div>

                      <div className="h-12 bg-amber-50/60 rounded-lg flex items-center justify-center my-0.5">
                        {order ? (
                          <div className="flex items-center gap-1">
                            <ChibiAvatar type={order.neighborId || order.typeId} emotion="happy" size={26} />
                            <span className="text-sm">{recipe?.icon || '🍲'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-lg">🪑</span>
                        )}
                      </div>

                      {order && order.state === 'ready' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServeOnStreet(order.id);
                          }}
                          className="w-full py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[8.5px] font-black animate-bounce shadow-2xs"
                        >
                          Bưng Món 💰
                        </button>
                      ) : (
                        <div className="text-[7.5px] text-center text-slate-500 truncate">
                          {recipe?.name || 'Trống'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. THẺ TƯƠNG TÁC 2D KHI CHẠM VÀO QUÁN ĂN (INTERACTIVE LOT SHEET)          */}
      {/* ========================================================================= */}
      {selectedLotKey && RESTAURANT_TYPES[selectedLotKey as RestaurantTypeId] && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-300 w-full max-w-md overflow-hidden shadow-2xl p-4 flex flex-col gap-3 animate-slide-up">
            {(() => {
              const rest = RESTAURANT_TYPES[selectedLotKey as RestaurantTypeId];
              const isCurrent = selectedLotKey === activeRestId;
              const isUnlocked = gameState.unlockedRestaurants?.includes(selectedLotKey as RestaurantTypeId);
              const staff = getBranchStaff(selectedLotKey as RestaurantTypeId);

              return (
                <>
                  {/* Header thẻ quán */}
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: rest.accentColor }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-xs border border-black/5"
                      >
                        {rest.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-base text-slate-900 leading-tight">{rest.name}</h3>
                          {isCurrent && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.2 rounded-full">
                              Đang Quản Lý ⭐
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-emerald-800 mt-0.5">{rest.badge}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedLotKey(null)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thiết bị & Giới thiệu */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-700 flex items-center gap-1">
                        <span>{rest.equipmentIcon}</span>
                        <span>{rest.equipmentName}</span>
                      </span>
                      <span className="font-bold text-slate-500">{rest.primaryRecipeIds.length} món đặc sản</span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{rest.tagline}"</p>
                  </div>

                  {/* Tình trạng nhân sự & Doanh thu tự động */}
                  {isUnlocked && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        staff.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div>
                        <div className="font-black text-slate-800 flex items-center gap-1">
                          <span>{staff.length > 0 ? '🟢 TỰ ĐỘNG BÁN HÀNG' : '⚠️ CHƯA CÓ NHÂN VIÊN'}</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          {staff.length > 0
                            ? `Đang trực: ${staff.map((s) => s.name).join(', ')}`
                            : 'Cần phân công nhân viên để tự động kinh doanh'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedLotKey(null);
                          openModal('employees');
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[10px] font-black text-slate-700 shadow-2xs active:scale-95 flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3 text-amber-600" />
                        <span>Giao Việc</span>
                      </button>
                    </div>
                  )}

                  {/* Các nút hành động chính */}
                  <div className="pt-1 flex items-center gap-2">
                    {isCurrent ? (
                      <button
                        onClick={() => {
                          setSelectedLotKey(null);
                          setCurrentView('shop');
                        }}
                        className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>VÀO BẾP QUÁN NÀY 🍳</span>
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          handleSwitchToBranch(selectedLotKey as RestaurantTypeId);
                          setSelectedLotKey(null);
                        }}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>CHUYỂN QUẢN LÝ QUÁN NÀY 🔀</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedLotKey(null);
                          openModal('franchise');
                        }}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>MỞ CHI NHÁNH NÀY ({(rest.unlockCost / 1000).toFixed(0)}k đ) 🚀</span>
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
