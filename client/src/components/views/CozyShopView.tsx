import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  CUSTOMER_TYPES,
  RECIPES,
  INGREDIENTS,
  SHOP_THEMES,
  BUSINESS_STAGES,
  NEIGHBORS_DATA,
  RESTAURANT_TYPES,
} from '../../../../shared/gameData';
import { CustomerTypeId, RecipeId, IngredientId, NeighborId, ActiveOrder } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Check,
  ShoppingBag,
  Eye,
  RotateCcw,
  Bike,
  Zap,
  Coffee,
  Flame,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

export const CozyShopView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    timeSpeed,
    tickTime,
    completeCooking,
    finishServing,
    handleCustomerLeaveAngry,
    openModal,
    deliveryOrders,
    serveNeighborGuest,
    activeOrders,
    setActiveOrders,
    setCurrentView,
    employeeActionStatus,
  } = useGameStore();

  const orders = activeOrders;
  const setOrders = setActiveOrders;
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  // Tab phân loại khay nguyên liệu ('food' | 'drink')
  const [activeIngredientTab, setActiveIngredientTab] = useState<'food' | 'drink'>('food');

  // Khay nguyên liệu đang chọn trên thớt
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});

  // Cấu hình cấp bậc & thương hiệu quán hiện tại
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

  // Đơn hàng đang được chọn chế biến
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  // Tự động chuyển tab nguyên liệu phù hợp với món khách gọi
  useEffect(() => {
    if (currentRecipe) {
      if (currentRecipe.category === 'drink') {
        setActiveIngredientTab('drink');
      } else {
        setActiveIngredientTab('food');
      }
      setSelectedIngredients({});
    }
  }, [activeOrder?.id, currentRecipe?.id]);

  // Chạm khay nguyên liệu để thêm/bỏ trên thớt
  const toggleIngredient = (ingId: string) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
  };

  // Nút Nấu Nhanh 1 Chạm: tự động cho đủ nguyên liệu cần của món
  const handleQuickFill = () => {
    if (!currentRecipe) return;
    soundManager.playClick();
    const newPicked: Record<string, boolean> = {};
    for (const req of currentRecipe.requiredIngredients) {
      newPicked[req] = true;
    }
    setSelectedIngredients(newPicked);
  };

  const clearCuttingBoard = () => {
    soundManager.playClick();
    setSelectedIngredients({});
  };

  const hasMatchedRecipe = () => {
    if (!currentRecipe) return false;
    for (const req of currentRecipe.requiredIngredients) {
      if (!selectedIngredients[req]) return false;
    }
    for (const [key, val] of Object.entries(selectedIngredients)) {
      if (val && !currentRecipe.requiredIngredients.includes(key as IngredientId)) {
        return false;
      }
    }
    return true;
  };

  const isStockAvailable = () => {
    if (!currentRecipe) return false;
    for (const req of currentRecipe.requiredIngredients) {
      if ((gameState.inventory[req] || 0) <= 0) return false;
    }
    return true;
  };

  // Nấu xong món trên thớt
  const handleCookCurrent = () => {
    if (!activeOrder || !currentRecipe) return;

    const success = completeCooking(activeOrder.recipeId, activeOrder.tableIndex);
    if (success) {
      soundManager.playDishComplete();
      setSelectedIngredients({});
      setOrders((prev) =>
        prev.map((o) => (o.id === activeOrder.id ? { ...o, state: 'ready' } : o))
      );
    }
  };

  // Bưng món ra bàn khách
  const handleServeDish = (order: ActiveOrder) => {
    const recipe = RECIPES[order.recipeId];
    const cType = CUSTOMER_TYPES[order.typeId];
    const patiencePercent = order.patienceRemaining / order.maxPatience;
    let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

    if (order.neighborId) {
      tip += Math.round(recipe.basePrice * 0.2);
      serveNeighborGuest(order.neighborId);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, state: 'eating' } : o))
    );

    setTimeout(() => {
      soundManager.playCoin();
      finishServing(order.tableIndex, recipe.basePrice, tip);

      confetti({
        particleCount: order.neighborId ? 45 : 30,
        spread: 50,
        origin: { y: 0.65 },
        colors: order.neighborId
          ? ['#F43F5E', '#FB7185', '#FBBF24', '#38BDF8']
          : ['#F7A8C4', '#FFD6E5', '#FFE6A7'],
      });

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }, 1800);
  };

  // Danh mục nguyên liệu món chính theo thương hiệu quán đang mở
  const foodIngredients: Array<{ id: IngredientId; name: string; icon: string }> = currentRest.allowedIngredientIds
    .filter((id) => INGREDIENTS[id]?.category !== 'beverage')
    .map((id) => ({
      id,
      name: INGREDIENTS[id]?.name.split(' ')[0] || id,
      icon: INGREDIENTS[id]?.icon || '✨',
    }));

  // Danh mục nguyên liệu đồ uống (4 món chính)
  const drinkIngredients: Array<{ id: IngredientId; name: string; icon: string }> = [
    { id: 'tea', name: 'Trà Lài', icon: '🍃' },
    { id: 'coffee', name: 'Cà Phê', icon: '☕' },
    { id: 'milk', name: 'Sữa Tươi', icon: '🥛' },
    { id: 'condensed_milk', name: 'Sữa Đặc', icon: '🍯' },
  ];

  const currentIngredientsList =
    activeIngredientTab === 'food' ? foodIngredients : drinkIngredients;

  // Đếm số nguyên liệu cần đã chọn
  const requiredCount = currentRecipe?.requiredIngredients.length || 0;
  const pickedRequiredCount =
    currentRecipe?.requiredIngredients.filter((id) => selectedIngredients[id]).length || 0;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#FDF8F3] text-[#5D4037] p-2 gap-1.5">
      {/* 1. THANH HEADER BẾP & NHÂN SỰ TINH GỌN (ULTRA-COMPACT MOBILE HUD) */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xs rounded-2xl border border-amber-200/80 p-1.5 shadow-2xs flex items-center justify-between gap-1.5">
        {/* Nút Chuỗi Quán / Đổi Quán */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('franchise');
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border border-amber-300 px-2 py-1 rounded-xl shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs"
          title="Quản lý Chuỗi Quán Ăn / Mở Chi Nhánh Mới"
        >
          <span className="text-base">{currentRest.icon}</span>
          <div className="text-left leading-tight">
            <div className="text-[10px] font-black flex items-center gap-1">
              <span className="truncate max-w-[90px]">{currentRest.shortName}</span>
              <span className="text-[7.5px] bg-white/30 text-white px-1 rounded-full font-black">
                {gameState.unlockedRestaurants?.length || 1} Quán
              </span>
            </div>
            <div className="text-[8px] text-amber-100 font-medium">Đổi Quán ▾</div>
          </div>
        </button>

        {/* Nhân sự trực bếp (Avatar nhỏ gọn) */}
        <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
          {/* Bạn (Bếp trưởng) */}
          <div className="relative shrink-0">
            <ChibiAvatar type="player" emotion="happy" size={26} />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[6.5px] font-black px-0.5 rounded-full">
              Bếp
            </span>
          </div>

          {/* Em Mai (Phục vụ) */}
          {gameState.hiredEmployees.includes('emp_mai') && (
            <div
              onClick={() => openModal('employees')}
              className="relative shrink-0 cursor-pointer"
              title="Mai: Chạy bàn"
            >
              <div className={employeeActionStatus.mai === 'serving' ? 'animate-bounce' : ''}>
                <ChibiAvatar type="emp_mai" emotion={employeeActionStatus.mai === 'serving' ? 'love' : 'happy'} size={26} />
              </div>
              {employeeActionStatus.mai === 'serving' && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[6px] font-black px-1 rounded-full animate-pulse">
                  Bưng
                </span>
              )}
            </div>
          )}

          {/* Bác Linh (Bếp chính) */}
          {gameState.hiredEmployees.includes('emp_linh') && (
            <div
              onClick={() => openModal('employees')}
              className="relative shrink-0 cursor-pointer"
              title="Bác Linh: Bếp chính"
            >
              <div className={employeeActionStatus.linh === 'cooking' ? 'animate-bounce' : ''}>
                <ChibiAvatar type="emp_linh" emotion={employeeActionStatus.linh === 'cooking' ? 'love' : 'happy'} size={26} />
              </div>
              {employeeActionStatus.linh === 'cooking' && (
                <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[6px] font-black px-1 rounded-full animate-pulse">
                  Nấu
                </span>
              )}
            </div>
          )}

          {/* Em Tuấn (Phụ bếp) */}
          {gameState.hiredEmployees.includes('emp_tuan') && (
            <div
              onClick={() => openModal('employees')}
              className="relative shrink-0 cursor-pointer"
              title="Tuấn: Phụ bếp"
            >
              <div className={employeeActionStatus.tuan === 'assisting' ? 'animate-bounce' : ''}>
                <ChibiAvatar type="emp_tuan" emotion="happy" size={26} />
              </div>
            </div>
          )}

          {gameState.hiredEmployees.length < 3 && (
            <button
              onClick={() => openModal('employees')}
              className="w-6 h-6 rounded-full border border-dashed border-pink-400 bg-pink-50 flex items-center justify-center text-[10px] text-pink-600 font-black shrink-0 active:scale-95"
              title="Tuyển thêm nhân viên"
            >
              +
            </button>
          )}
        </div>

        {/* Cấp độ vỉa hè */}
        <button
          onClick={() => openModal('upgrades')}
          className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-2 py-1 rounded-xl text-left shrink-0 active:scale-95"
          title="Xem lộ trình cấp độ"
        >
          <span className="text-sm">{stageVisual.icon}</span>
          <div className="leading-tight">
            <div className="text-[8.5px] font-black text-amber-950">Lv.{stageVisual.levelNumber}</div>
            <div className="text-[7.5px] text-amber-700 font-bold truncate max-w-[55px]">{stageVisual.badge}</div>
          </div>
        </button>
      </div>

      {/* 2. KHUNG ĐƠN HÀNG CỦA KHÁCH (ORDER TICKET GỌN GÀNG, DỄ NHÌN) */}
      <div className="shrink-0 bg-white rounded-2xl border-2 border-[#8D6E63] p-2 shadow-2xs flex flex-col gap-1">
        {activeOrder && currentRecipe ? (
          <div>
            {/* Hàng 1: Khách hàng, lời thoại & Bàn phục vụ */}
            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-stone-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="relative shrink-0">
                  <ChibiAvatar
                    type={activeOrder.neighborId || activeOrder.typeId}
                    emotion={
                      activeOrder.state === 'eating'
                        ? 'eating'
                        : activeOrder.state === 'ready'
                        ? 'love'
                        : activeOrder.patienceRemaining / activeOrder.maxPatience > 0.4
                        ? 'waiting'
                        : 'angry'
                    }
                    size={32}
                  />
                  {activeOrder.neighborId && (
                    <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[7px] font-black px-0.5 rounded-full">
                      VIP
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-[#5D4037] truncate flex items-center gap-1">
                    <span>Bàn {activeOrder.tableIndex}:</span>
                    <span className="text-pink-600 truncate">
                      {activeOrder.neighborId
                        ? NEIGHBORS_DATA[activeOrder.neighborId].name
                        : CUSTOMER_TYPES[activeOrder.typeId]?.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate italic">
                    "{activeOrder.dialogue || 'Cho mình gọi món nha chủ quán!'}"
                  </div>
                </div>
              </div>

              {/* Bàn khách tabs */}
              <div className="flex items-center gap-1 shrink-0">
                {orders.map((o) => {
                  const isReady = o.state === 'ready';
                  return (
                    <button
                      key={o.id}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedOrderIndex(o.tableIndex);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 ${
                        o.tableIndex === activeOrder.tableIndex
                          ? 'bg-[#F48FB1] text-white shadow-2xs scale-105'
                          : 'bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA]'
                      }`}
                    >
                      <span>B{o.tableIndex}</span>
                      {isReady && <span className="text-[8px] animate-bounce">✨</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hàng 2: Tên món, Nguyên liệu cần & Giá bán */}
            <div className="pt-1 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xl bg-amber-50 p-1 rounded-lg border border-amber-200 shrink-0">
                  {currentRecipe.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-black text-[#5D4037] truncate">
                    {currentRecipe.name}
                  </div>
                  {/* Chips nguyên liệu cần */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                    {currentRecipe.requiredIngredients.map((ingId) => {
                      const ing = INGREDIENTS[ingId];
                      const isPicked = !!selectedIngredients[ingId];
                      return (
                        <span
                          key={ingId}
                          className={`px-1.5 py-0.2 rounded-md text-[8.5px] font-black flex items-center gap-0.5 shrink-0 border ${
                            isPicked
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>{ing?.icon}</span>
                          <span>{ing?.name.split(' ')[0]}</span>
                          {isPicked && <Check className="w-2 h-2 stroke-[3] text-emerald-600" />}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Giá & Tiến độ kiên nhẫn */}
              <div className="text-right shrink-0">
                <div className="text-[11.5px] font-black text-amber-700">
                  {currentRecipe.basePrice.toLocaleString('vi-VN')} đ
                </div>
                <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5 border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeOrder.patienceRemaining / activeOrder.maxPatience > 0.4
                        ? 'bg-emerald-400'
                        : 'bg-rose-500 animate-pulse'
                    }`}
                    style={{
                      width: `${Math.round(
                        (activeOrder.patienceRemaining / activeOrder.maxPatience) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-slate-400 font-medium">
            Chưa có khách ngồi bàn. Mở cửa quán để đón khách nhé! ✨
          </div>
        )}
      </div>

      {/* 3. BÀN CHẾ BIẾN & THIẾT BỊ NẤU ĐẶC TRƯNG (ADAPTIVE WORKBENCH) */}
      <div className="flex-1 min-h-[140px] max-h-[220px] rounded-3xl border-3 border-[#D7CCC8] p-2.5 shadow-xs relative flex flex-col justify-between bg-white/95">
        {/* Header trên thớt */}
        <div className="flex items-center justify-between text-[10.5px] font-black pb-1 border-b border-stone-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base animate-bounce-short">{currentRest.equipmentIcon}</span>
            <span className="font-black text-[#5D4037] truncate">{currentRest.equipmentName}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {currentRecipe && (
              <button
                onClick={handleQuickFill}
                className="px-2 py-0.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-lg text-[9.5px] font-black shadow-2xs flex items-center gap-0.5 active:scale-95 transition-all"
                title="Tự động cho đủ nguyên liệu món đang gọi"
              >
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>Nấu Nhanh ⚡</span>
              </button>
            )}
            {Object.values(selectedIngredients).some(Boolean) && (
              <button
                onClick={clearCuttingBoard}
                className="text-rose-600 hover:text-rose-700 px-1.5 py-0.5 rounded-lg border border-rose-200 bg-rose-50 text-[9px] font-bold flex items-center gap-0.5 active:scale-95"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Làm lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Trung tâm thớt: Món ăn & Topping nhảy vào */}
        <div className="flex-1 flex flex-col items-center justify-center relative my-1">
          {activeOrder && currentRecipe ? (
            <div className="flex flex-col items-center justify-center gap-1 w-full">
              <div className="relative flex items-center justify-center">
                {/* Món ăn to ở giữa */}
                <div className="text-4xl sm:text-5xl drop-shadow-sm select-none animate-bounce-short">
                  {currentRecipe.category === 'drink' ? '🥤' : currentRecipe.icon}
                </div>

                {/* Topping nhảy vào quanh đĩa */}
                <div className="absolute -top-1 -right-4 flex flex-wrap gap-0.5 max-w-[80px]">
                  {Object.keys(selectedIngredients)
                    .filter((k) => selectedIngredients[k])
                    .map((k) => (
                      <span
                        key={k}
                        className="text-base bg-white/95 p-0.5 rounded-md shadow-xs animate-fade-in"
                      >
                        {INGREDIENTS[k as IngredientId]?.icon || '✨'}
                      </span>
                    ))}
                </div>
              </div>

              {/* Nhãn tiến độ & Trạng thái */}
              <div className="text-[10.5px] font-black text-[#5D4037] flex items-center gap-1.5">
                <span>{currentRecipe.name}</span>
                <span className="text-pink-600 bg-pink-100 px-1.5 py-0.2 rounded-full text-[9.5px]">
                  {pickedRequiredCount}/{requiredCount} nguyên liệu
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 font-medium flex flex-col items-center gap-0.5">
              <span className="text-2xl animate-bounce-short">{currentRest.equipmentIcon}</span>
              <span className="text-[10.5px]">Chạm khay nguyên liệu bên dưới để cho lên thớt nha! 👆</span>
            </div>
          )}
        </div>

        {/* Nút hành động chính: HOÀN THÀNH HOẶC BƯNG RA BÀN */}
        <div className="pt-0.5">
          {activeOrder ? (
            activeOrder.state === 'ready' ? (
              <button
                onClick={() => handleServeDish(activeOrder)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-95 animate-bounce-short transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>BƯNG RA BÀN {activeOrder.tableIndex} (THU TIỀN + TIP 💰)</span>
              </button>
            ) : (
              <button
                onClick={handleCookCurrent}
                disabled={!hasMatchedRecipe() || !isStockAvailable()}
                className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                  hasMatchedRecipe() && isStockAvailable()
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 animate-pulse'
                    : !isStockAvailable()
                    ? 'bg-slate-200 text-rose-600 border border-rose-300 cursor-pointer'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="truncate">
                  {!hasMatchedRecipe()
                    ? `Chạm nguyên liệu bên dưới (${pickedRequiredCount}/${requiredCount})`
                    : !isStockAvailable()
                    ? 'Kho thiếu nguyên liệu! Bấm vào Chợ mua sỉ 🛒'
                    : `HOÀN THÀNH MÓN ${currentRecipe?.name.toUpperCase()} (3 ⚡)`}
                </span>
              </button>
            )
          ) : (
            <div className="py-1.5 text-center text-xs font-bold text-amber-800 bg-amber-50 rounded-xl border border-dashed border-amber-300">
              Chờ khách ghé bàn để chuẩn bị món...
            </div>
          )}
        </div>
      </div>

      {/* 4. KHAY NGUYÊN LIỆU CUỘN NGANG TIỆN TAY (MOBILE-OPTIMIZED HORIZONTAL TOPPING TRAY) */}
      <div className="shrink-0 space-y-1">
        {/* Header Tab: Món chính vs Đồ uống */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveIngredientTab('food');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeIngredientTab === 'food'
                  ? 'bg-[#8D6E63] text-white shadow-2xs'
                  : 'bg-white border border-[#D7CCC8] text-[#5D4037] hover:bg-amber-50'
              }`}
            >
              <span>{currentRest.icon}</span>
              <span>{currentRest.shortName}</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveIngredientTab('drink');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeIngredientTab === 'drink'
                  ? 'bg-[#8D6E63] text-white shadow-2xs'
                  : 'bg-white border border-[#D7CCC8] text-[#5D4037] hover:bg-amber-50'
              }`}
            >
              <span>🧋</span>
              <span>Đồ Uống</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {deliveryOrders.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  openModal('delivery');
                }}
                className="py-1 px-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all animate-pulse"
                title="Đơn giao hàng Chú Năm"
              >
                <Bike className="w-3 h-3" />
                <span>Ship ({deliveryOrders.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                openModal('market');
              }}
              className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-xl cursor-pointer flex items-center gap-1"
              title="Mở chợ mua sỉ nguyên liệu"
            >
              <ShoppingBag className="w-3 h-3 text-amber-800" />
              <span>Chợ Sỉ 🛒</span>
            </button>
          </div>
        </div>

        {/* Khay topping dạng cuộn ngang (Horizontal scroll container - chuẩn Game nấu ăn Mobile) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x px-0.5">
          {currentIngredientsList.map((item) => {
            const stock = gameState.inventory[item.id] ?? 0;
            const isPicked = !!selectedIngredients[item.id];
            const isNeeded = currentRecipe?.requiredIngredients.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (stock <= 0) {
                    openModal('market');
                  } else {
                    toggleIngredient(item.id);
                  }
                }}
                className={`min-w-[68px] sm:min-w-[74px] h-[72px] sm:h-[76px] rounded-2xl border-2 flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all active:scale-95 relative shrink-0 select-none ${
                  isPicked
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-xs'
                    : isNeeded
                    ? 'bg-white border-amber-400 ring-2 ring-amber-200/90 shadow-2xs'
                    : 'bg-white border-[#D7CCC8] hover:border-pink-300'
                }`}
              >
                {/* Badge Trạng thái: CẦN ⭐ hoặc ĐÃ CHỌN ✓ */}
                {isPicked ? (
                  <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[7px] font-black px-1 rounded-full flex items-center gap-0.5">
                    <Check className="w-1.5 h-1.5 stroke-[3]" /> Cho
                  </span>
                ) : isNeeded ? (
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[7px] font-black px-1 rounded-full animate-pulse">
                    Cần ⭐
                  </span>
                ) : null}

                {/* Huy hiệu số lượng kho */}
                <span
                  className={`absolute top-1 right-1 text-[7.5px] font-black px-1 rounded-full border ${
                    stock > 0
                      ? 'bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-rose-500 text-white border-white'
                  }`}
                >
                  {stock > 0 ? stock : 'Hết ❌'}
                </span>

                {/* Icon nguyên liệu to bản */}
                <div className="text-2xl mt-1.5 leading-none">{item.icon}</div>

                {/* Tên nguyên liệu */}
                <div className="text-[10px] font-black text-[#5D4037] text-center truncate max-w-full">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
