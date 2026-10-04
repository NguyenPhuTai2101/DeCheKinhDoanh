import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  CUSTOMER_TYPES,
  RECIPES,
  INGREDIENTS,
  SHOP_THEMES,
  BUSINESS_STAGES,
  NEIGHBORS_DATA,
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

  // Tab phân loại khay nguyên liệu ('bread' | 'drink')
  const [activeIngredientTab, setActiveIngredientTab] = useState<'bread' | 'drink'>('bread');

  // Khay nguyên liệu đang chọn trên thớt
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});

  // Cấu hình cấp bậc
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;

  // Đơn hàng đang được chọn chế biến
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  // Tự động chuyển tab nguyên liệu phù hợp với món khách gọi
  useEffect(() => {
    if (currentRecipe) {
      if (currentRecipe.category === 'drink') {
        setActiveIngredientTab('drink');
      } else {
        setActiveIngredientTab('bread');
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

  // Danh mục nguyên liệu bánh mì (6 món chính, gọn gàng, to rõ)
  const breadIngredients: Array<{ id: IngredientId; name: string; icon: string }> = [
    { id: 'bread', name: 'Bánh Mì', icon: '🥖' },
    { id: 'pate', name: 'Patê Gan', icon: '🧈' },
    { id: 'pork', name: 'Thịt Nướng', icon: '🥩' },
    { id: 'egg', name: 'Trứng Ốp La', icon: '🍳' },
    { id: 'cucumber', name: 'Dưa Leo', icon: '🥒' },
    { id: 'herb', name: 'Rau Thơm', icon: '🌿' },
  ];

  // Danh mục nguyên liệu đồ uống (4 món chính to rõ)
  const drinkIngredients: Array<{ id: IngredientId; name: string; icon: string }> = [
    { id: 'tea', name: 'Trà Lài', icon: '🍃' },
    { id: 'coffee', name: 'Cà Phê Phin', icon: '☕' },
    { id: 'milk', name: 'Sữa Tươi', icon: '🥛' },
    { id: 'condensed_milk', name: 'Sữa Đặc', icon: '🍯' },
  ];

  const currentIngredientsList =
    activeIngredientTab === 'bread' ? breadIngredients : drinkIngredients;

  // Đếm số nguyên liệu cần đã chọn
  const requiredCount = currentRecipe?.requiredIngredients.length || 0;
  const pickedRequiredCount =
    currentRecipe?.requiredIngredients.filter((id) => selectedIngredients[id]).length || 0;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto select-none bg-[#FDF8F3] text-[#5D4037] pb-2">
      {/* 1. MÁI HIÊN THAY ĐỔI THEO CẤP BẬC CƠ NGHIỆP TRÊN CÙNG */}
      <div className="relative shrink-0">
        <div className="h-4.5 w-full flex overflow-hidden shadow-2xs">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full rounded-b-xs"
              style={{
                backgroundColor:
                  i % 2 === 0
                    ? stageVisual.kitchen.awningColors[0]
                    : stageVisual.kitchen.awningColors[1],
              }}
            />
          ))}
        </div>
      </div>

      {/* 1.5. ĐỘI NGŨ NHÂN SỰ BẾP & PHỤC VỤ (HIỂN THỊ TRỰC QUAN NHÂN VIÊN ĐANG LÀM VIỆC) */}
      <div className="px-3 pt-1.5 shrink-0">
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-pink-200 p-1.5 shadow-2xs flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {/* Chủ quán (Bạn) */}
            <div className="flex items-center gap-1 bg-pink-50/90 border border-pink-200 rounded-xl px-2 py-1 shrink-0">
              <ChibiAvatar type="player" emotion="happy" size={30} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-black text-[#5D4037]">Bạn</div>
                <div className="text-[8px] font-bold text-pink-600">Bếp trưởng</div>
              </div>
            </div>

            {/* Em Mai (Phục vụ) */}
            {gameState.hiredEmployees.includes('emp_mai') && (
              <div
                onClick={() => openModal('employees')}
                className={`flex items-center gap-1 rounded-xl px-2 py-1 shrink-0 border cursor-pointer transition-all active:scale-95 ${
                  employeeActionStatus.mai === 'serving'
                    ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-200 animate-pulse'
                    : 'bg-rose-50/90 border-rose-200'
                }`}
                title="Em Mai (Phục vụ): Tự động bưng món ra bàn"
              >
                <div className={employeeActionStatus.mai === 'serving' ? 'animate-bounce' : ''}>
                  <ChibiAvatar type="emp_mai" emotion={employeeActionStatus.mai === 'serving' ? 'love' : 'happy'} size={30} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-black text-rose-950 flex items-center gap-1">
                    <span>Mai</span>
                    {employeeActionStatus.mai === 'serving' && <span className="text-[7.5px] bg-rose-500 text-white px-1 rounded-full">Bưng món 🏃‍♀️</span>}
                  </div>
                  <div className="text-[8px] font-bold text-rose-600">
                    {employeeActionStatus.mai === 'serving' ? 'Đang bưng món...' : 'Chạy bàn 🍱'}
                  </div>
                </div>
              </div>
            )}

            {/* Bác Linh (Bếp chính) */}
            {gameState.hiredEmployees.includes('emp_linh') && (
              <div
                onClick={() => openModal('employees')}
                className={`flex items-center gap-1 rounded-xl px-2 py-1 shrink-0 border cursor-pointer transition-all active:scale-95 ${
                  employeeActionStatus.linh === 'cooking'
                    ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-200 animate-pulse'
                    : 'bg-amber-50/90 border-amber-200'
                }`}
                title="Bác Linh (Bếp chính): Tự động chế biến món"
              >
                <div className={employeeActionStatus.linh === 'cooking' ? 'animate-bounce' : ''}>
                  <ChibiAvatar type="emp_linh" emotion={employeeActionStatus.linh === 'cooking' ? 'love' : 'happy'} size={30} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-black text-amber-950 flex items-center gap-1">
                    <span>Bác Linh</span>
                    {employeeActionStatus.linh === 'cooking' && <span className="text-[7.5px] bg-amber-500 text-white px-1 rounded-full">Nấu ♨️</span>}
                  </div>
                  <div className="text-[8px] font-bold text-amber-700">
                    {employeeActionStatus.linh === 'cooking' ? 'Đang nấu bánh...' : 'Bếp chính 👨‍🍳'}
                  </div>
                </div>
              </div>
            )}

            {/* Em Tuấn (Phụ bếp) */}
            {gameState.hiredEmployees.includes('emp_tuan') && (
              <div
                onClick={() => openModal('employees')}
                className={`flex items-center gap-1 rounded-xl px-2 py-1 shrink-0 border cursor-pointer transition-all active:scale-95 ${
                  employeeActionStatus.tuan === 'assisting'
                    ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-200 animate-pulse'
                    : 'bg-purple-50/90 border-purple-200'
                }`}
                title="Em Tuấn (Phụ bếp): Giảm 40% thời gian nấu & +15% tip"
              >
                <div className={employeeActionStatus.tuan === 'assisting' ? 'animate-bounce' : ''}>
                  <ChibiAvatar type="emp_tuan" emotion="happy" size={30} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-black text-purple-950 flex items-center gap-1">
                    <span>Tuấn</span>
                    <span className="text-[7.5px] bg-purple-200 text-purple-800 px-1 rounded-full">+15% tip</span>
                  </div>
                  <div className="text-[8px] font-bold text-purple-600">Phụ bếp 🧑‍🍳</div>
                </div>
              </div>
            )}

            {/* Ô tuyển thêm nhân viên nếu chưa đủ người */}
            {gameState.hiredEmployees.length < 3 && (
              <button
                onClick={() => openModal('employees')}
                className="px-2 py-1 border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-100/60 rounded-xl text-[9.5px] font-black text-pink-700 flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                title="Thuê thêm nhân viên phụ bếp hoặc chạy bàn"
              >
                <span>➕</span>
                <span>Tuyển Người</span>
              </button>
            )}

            {/* Huy hiệu Cấp độ hiện tại */}
            <div
              onClick={() => openModal('upgrades')}
              className="flex items-center gap-1 bg-amber-50/90 border border-amber-300 rounded-xl px-2 py-1 shrink-0 cursor-pointer hover:bg-amber-100 transition-all active:scale-95 shadow-2xs ml-auto"
              title="Chạm để xem Lộ trình 5 Cấp Cơ Nghiệp"
            >
              <span className="text-sm">{stageVisual.icon}</span>
              <div className="text-left leading-tight">
                <div className="text-[9.5px] font-black text-amber-950 flex items-center gap-1">
                  <span>{stageVisual.badge}</span>
                  <span className="text-[7.5px] bg-amber-400 text-amber-950 px-1 rounded-full font-black">
                    Lv.{stageVisual.levelNumber}
                  </span>
                </div>
                <div className="text-[8px] font-bold text-amber-700 truncate max-w-[85px]">
                  {stageVisual.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHUNG ĐƠN HÀNG CỦA KHÁCH (ORDER TICKET TO RÕ RÀNG) */}
      <div className="px-3 pt-1.5 shrink-0">
        <div className="bg-white rounded-2xl border-2 border-[#8D6E63] p-2.5 shadow-xs relative flex flex-col gap-1.5">
          {activeOrder && currentRecipe ? (
            <div>
              {/* Header khách hàng & Tabs chọn bàn */}
              <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-[#F2E8E5]">
                <div className="flex items-center gap-2 min-w-0">
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
                      size={44}
                    />
                    {activeOrder.neighborId && (
                      <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#5D4037] truncate flex items-center gap-1">
                      <span>Bàn {activeOrder.tableIndex}:</span>
                      <span className="text-pink-600 font-extrabold truncate">
                        {activeOrder.neighborId
                          ? NEIGHBORS_DATA[activeOrder.neighborId].name
                          : CUSTOMER_TYPES[activeOrder.typeId]?.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate italic">
                      "{activeOrder.dialogue || 'Cho mình gọi món nha chủ quán!'}"
                    </div>
                  </div>
                </div>

                {/* Danh sách tabs bàn khách đang ngồi */}
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
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-0.5 ${
                          o.tableIndex === activeOrder.tableIndex
                            ? 'bg-[#F48FB1] text-white shadow-xs scale-105'
                            : 'bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA]'
                        }`}
                      >
                        <span>B{o.tableIndex}</span>
                        {isReady && <span className="text-[9px] animate-bounce">✨</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tên món khách gọi & Danh sách nguyên liệu cần */}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                    {currentRecipe.icon}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#5D4037]">
                      {currentRecipe.name}
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold mt-0.5 flex items-center gap-1 flex-wrap">
                      <span className="text-pink-600 font-bold">Cần có:</span>
                      {currentRecipe.requiredIngredients.map((ingId) => {
                        const ing = INGREDIENTS[ingId];
                        const isPicked = !!selectedIngredients[ingId];
                        return (
                          <span
                            key={ingId}
                            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold flex items-center gap-0.5 border ${
                              isPicked
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span>{ing?.icon}</span>
                            <span>{ing?.name.split(' ')[0]}</span>
                            {isPicked && <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-600" />}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Giá món ăn */}
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-amber-700">
                    {currentRecipe.basePrice.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold">+ Tip tiền boa</div>
                </div>
              </div>

              {/* Thanh độ kiên nhẫn */}
              <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    activeOrder.patienceRemaining / activeOrder.maxPatience > 0.4
                      ? 'bg-emerald-400'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      (activeOrder.patienceRemaining / activeOrder.maxPatience) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            /* Khi chưa có khách gọi món */
            <div className="py-3 text-center flex flex-col items-center justify-center">
              <span className="text-2xl animate-bounce-short">🥖☕</span>
              <div className="text-xs sm:text-sm font-black text-[#5D4037] mt-1">
                Quầy bếp sạch sẽ, sẵn sàng phục vụ!
              </div>
              <div className="text-[10px] text-[#9C7C75] mt-0.5">
                {isShopOpen
                  ? 'Bà con khu phố đang ghé tới. Món ăn của khách sẽ hiện ở đây!'
                  : 'Quán đang đóng cửa nghỉ ngơi. Chạm nút [Mở Cửa] ở góc trên để đón khách nha!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. THỚT CHẾ BIẾN TRUNG TÂM (LỘT XÁC CHẤT LIỆU THEO CẤP ĐỘ) */}
      <div className="px-3 py-2 flex-1 min-h-[140px] flex flex-col justify-center">
        <div
          style={{
            backgroundColor: stageVisual.kitchen.workbenchBg,
            borderColor: stageVisual.kitchen.workbenchBorder,
          }}
          className="rounded-3xl border-3 p-3 shadow-md relative flex flex-col justify-between h-full transition-all"
        >
          {/* Header trên thớt */}
          <div
            style={{ borderColor: stageVisual.kitchen.workbenchBorder }}
            className="flex items-center justify-between text-[10px] font-black pb-1 border-b border-opacity-30"
          >
            <div className="min-w-0 pr-1">
              <span
                style={{ color: stageVisual.kitchen.workbenchHeaderColor }}
                className="flex items-center gap-1 font-black truncate"
              >
                <span>{stageVisual.kitchen.toolIcon}</span>
                <span className="truncate">{stageVisual.kitchen.workbenchTitle}</span>
              </span>
              <div className="text-[8px] text-slate-500 font-medium italic mt-0.5 truncate">
                {stageVisual.kitchen.workbenchTagline}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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

          {/* Mặt thớt trưng bày món đang chế biến */}
          <div className="flex-1 my-1.5 flex flex-col items-center justify-center relative">
            {activeOrder && currentRecipe ? (
              <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                {/* Ổ Bánh Mì hoặc Ly Nước to ở giữa */}
                <div className="relative flex items-center justify-center">
                  <div className="text-5xl drop-shadow-sm select-none animate-bounce-short">
                    {currentRecipe.category === 'drink' ? '🥤' : '🥖'}
                  </div>

                  {/* Topping bay vào quanh món */}
                  <div className="absolute -top-1 -right-3 flex flex-wrap gap-0.5 max-w-[70px]">
                    {Object.keys(selectedIngredients)
                      .filter((k) => selectedIngredients[k])
                      .map((k) => (
                        <span
                          key={k}
                          className="text-lg bg-white/90 p-0.5 rounded-md shadow-xs animate-fade-in"
                        >
                          {INGREDIENTS[k as IngredientId]?.icon || '✨'}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Nhãn tiến độ topping */}
                <div className="text-[11px] font-black text-[#5D4037] flex items-center gap-1">
                  <span>{currentRecipe.name}</span>
                  <span className="text-pink-600 bg-pink-100 px-1.5 py-0.2 rounded-full text-[10px]">
                    {pickedRequiredCount}/{requiredCount} nguyên liệu
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 font-medium py-3">
                <span>Chạm các khay nguyên liệu bên dưới để cho lên thớt nha! 👆</span>
              </div>
            )}
          </div>

          {/* Nút hành động lớn ngay dưới thớt */}
          <div className="pt-1">
            {activeOrder ? (
              activeOrder.state === 'ready' ? (
                <button
                  onClick={() => handleServeDish(activeOrder)}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-95 animate-bounce-short transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>BƯNG RA BÀN {activeOrder.tableIndex} (THU TIỀN + TIP 💰)</span>
                </button>
              ) : (
                <button
                  onClick={handleCookCurrent}
                  disabled={!hasMatchedRecipe() || !isStockAvailable()}
                  className={`w-full py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                    hasMatchedRecipe() && isStockAvailable()
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 animate-pulse'
                      : !isStockAvailable()
                      ? 'bg-slate-200 text-rose-600 border border-rose-300 cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>
                    {!hasMatchedRecipe()
                      ? `Chạm thêm nguyên liệu bên dưới (${pickedRequiredCount}/${requiredCount})`
                      : !isStockAvailable()
                      ? 'Kho thiếu nguyên liệu! Bấm vào Chợ mua sỉ 🛒'
                      : `HOÀN THÀNH MÓN ${currentRecipe?.name.toUpperCase()} (3 ⚡)`}
                  </span>
                </button>
              )
            ) : (
              <div className="py-2 text-center text-xs font-bold text-amber-800 bg-amber-50 rounded-xl border border-dashed border-amber-300">
                Chờ khách ghé bàn để chuẩn bị món...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. KHAY NGUYÊN LIỆU TO RÕ, ĐÃ TAY (MOBILE-FIRST TOPPING STATION) */}
      <div className="px-3 shrink-0 space-y-1.5">
        {/* Header chuyển Tab: Bánh Mì vs Đồ Uống */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveIngredientTab('bread');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeIngredientTab === 'bread'
                  ? 'bg-[#8D6E63] text-white shadow-xs'
                  : 'bg-white border border-[#D7CCC8] text-[#5D4037] hover:bg-amber-50'
              }`}
            >
              <span>🥖</span>
              <span>Nhân Bánh Mì</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveIngredientTab('drink');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeIngredientTab === 'drink'
                  ? 'bg-[#8D6E63] text-white shadow-xs'
                  : 'bg-white border border-[#D7CCC8] text-[#5D4037] hover:bg-amber-50'
              }`}
            >
              <span>🧋</span>
              <span>Pha Đồ Uống</span>
            </button>
          </div>

          <div
            onClick={() => {
              soundManager.playClick();
              openModal('market');
            }}
            className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-xl cursor-pointer flex items-center gap-1"
            title="Mở chợ mua sỉ nguyên liệu"
          >
            <ShoppingBag className="w-3 h-3 text-amber-700" />
            <span>Chợ Sỉ 🛒</span>
          </div>
        </div>

        {/* Lưới các thẻ nguyên liệu to bản, icon rõ ràng */}
        <div
          className={`grid gap-2 ${
            activeIngredientTab === 'bread' ? 'grid-cols-3' : 'grid-cols-2'
          }`}
        >
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
                className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-between cursor-pointer transition-all active:scale-95 relative select-none ${
                  isPicked
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                    : isNeeded
                    ? 'bg-white border-amber-400 ring-2 ring-amber-200/80 shadow-xs'
                    : 'bg-white border-[#D7CCC8] hover:border-pink-300'
                }`}
                style={{ minHeight: '68px' }}
              >
                {/* Huy hiệu CẦN ⭐ hoặc ĐÃ CHỌN ✓ */}
                {isPicked ? (
                  <span className="absolute top-1 left-1.5 bg-emerald-500 text-white text-[7.5px] font-black px-1 rounded-full flex items-center gap-0.5">
                    <Check className="w-2 h-2 stroke-[3]" /> Cho
                  </span>
                ) : isNeeded ? (
                  <span className="absolute top-1 left-1.5 bg-amber-500 text-white text-[7.5px] font-black px-1 rounded-full animate-pulse">
                    Cần ⭐
                  </span>
                ) : null}

                {/* Huy hiệu tồn kho */}
                <span
                  className={`absolute top-1 right-1.5 text-[8px] font-black px-1.5 py-0.2 rounded-full border ${
                    stock > 0
                      ? 'bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-rose-500 text-white border-white'
                  }`}
                >
                  {stock > 0 ? stock : 'Hết ❌'}
                </span>

                {/* Icon nguyên liệu to 32px */}
                <div className="text-2xl sm:text-3xl mt-2 leading-none">{item.icon}</div>

                {/* Tên nguyên liệu to rõ ràng */}
                <div className="text-[11px] font-black text-[#5D4037] mt-1 text-center truncate max-w-full">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PHÍM TẮT ĐIỀU HƯỚNG DƯỚI CÙNG: RA PHỐ QUAN SÁT */}
      <div className="px-3 pt-2 shrink-0 flex items-center gap-2">
        <button
          onClick={() => {
            soundManager.playClick();
            setCurrentView('street');
          }}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-xs border border-amber-500 flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>Ra Đường Quan Sát (Bàn Ghế Vỉa Hè) 🚶</span>
        </button>

        {deliveryOrders.length > 0 && (
          <button
            onClick={() => {
              soundManager.playClick();
              openModal('delivery');
            }}
            className="py-2.5 px-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all animate-pulse"
            title="Có đơn giao hàng Chú Năm"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Ship ({deliveryOrders.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
