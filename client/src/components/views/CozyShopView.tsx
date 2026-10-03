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
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Check,
  Store,
  ShoppingBag,
  Eye,
  RotateCcw,
  Flame,
  Clock,
  Bike,
  Plus,
  Heart,
  Coffee,
} from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';

export const CozyShopView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    setShopOpen,
    timeSpeed,
    tickTime,
    completeCooking,
    finishServing,
    handleCustomerLeaveAngry,
    openModal,
    deliveryOrders,
    serveNeighborGuest,
    buyLotteryTicket,
    activeOrders,
    setActiveOrders,
    setCurrentView,
  } = useGameStore();

  // Đồng bộ đơn hàng với store
  const orders = activeOrders;
  const setOrders = setActiveOrders;
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  // Khay nguyên liệu đang chọn trên thớt
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});

  // Cấu hình cấp bậc
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);
  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;

  // 1. Vòng lặp thời gian & tính kiên nhẫn của khách
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const interval = setInterval(() => {
      tickTime(2.5 * timeSpeed);

      setOrders((prev) => {
        const next = prev.map((order) => {
          if (order.state === 'waiting') {
            const newPatience = order.patienceRemaining - 1 * timeSpeed;
            if (newPatience <= 0) {
              handleCustomerLeaveAngry(order.tableIndex);
              return { ...order, state: 'leaving' as const };
            }
            return { ...order, patienceRemaining: newPatience };
          }
          return order;
        });
        return next.filter((o) => o.state !== 'leaving');
      });
    }, 1000 / timeSpeed);

    return () => clearInterval(interval);
  }, [isShopOpen, timeSpeed, tickTime, handleCustomerLeaveAngry, setOrders]);

  // 2. Vòng lặp đón khách mới
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hasSignboard = (gameState.purchasedUpgrades['flower_signboard'] || 0) > 0;
    const baseRate = currentStage.customerRateMs;
    const spawnRate = hasSignboard ? Math.round(baseRate * 0.85) : baseRate;

    const spawnInterval = setInterval(() => {
      setOrders((prev) => {
        if (prev.length >= maxTables) return prev;

        const occupiedIndices = prev.map((o) => o.tableIndex);
        let freeTable = 1;
        for (let i = 1; i <= maxTables; i++) {
          if (!occupiedIndices.includes(i)) {
            freeTable = i;
            break;
          }
        }

        const neighborKeys: NeighborId[] = ['bac_ba', 'co_bay', 'chu_nam', 'be_bong', 'chi_lan'];
        const seatedNeighbors = prev.map((o) => o.neighborId).filter(Boolean);
        const availableNeighbors = neighborKeys.filter((k) => !seatedNeighbors.includes(k));
        const isNeighborRoll = Math.random() < 0.28 && availableNeighbors.length > 0;
        const chosenNeighborId = isNeighborRoll
          ? availableNeighbors[Math.floor(Math.random() * availableNeighbors.length)]
          : undefined;

        let chosenType: CustomerTypeId = 'student';
        let chosenRecipe: RecipeId = 'banh_mi_trung';
        let dialogue: string | undefined = undefined;
        let patienceSeconds = 35;

        if (chosenNeighborId) {
          const nData = NEIGHBORS_DATA[chosenNeighborId];
          const nRel = gameState.neighbors[chosenNeighborId] || { level: 1 };
          chosenType = 'neighborhood';
          chosenRecipe = nData.favoriteDishId;
          dialogue = nData.dialogues[nRel.level] || nData.dialogues[1];
          patienceSeconds = 50;
        } else {
          const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
          chosenType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
          const cType = CUSTOMER_TYPES[chosenType];
          const favoriteList = cType.favoriteRecipeIds;
          chosenRecipe = favoriteList[Math.floor(Math.random() * favoriteList.length)];
          patienceSeconds = cType.patienceSeconds;
        }

        soundManager.playDoorBell();

        const newOrder: ActiveOrder = {
          id: Math.random().toString(36).substring(2, 9),
          tableIndex: freeTable,
          typeId: chosenType,
          neighborId: chosenNeighborId,
          dialogue,
          recipeId: chosenRecipe,
          patienceRemaining: patienceSeconds,
          maxPatience: patienceSeconds,
          state: 'waiting',
        };

        return [...prev, newOrder];
      });
    }, spawnRate / timeSpeed);

    return () => clearInterval(spawnInterval);
  }, [
    isShopOpen,
    timeSpeed,
    maxTables,
    currentStage.customerRateMs,
    gameState.purchasedUpgrades,
    gameState.neighbors,
    setOrders,
  ]);

  // 3. Tự động phục vụ nếu có nhân viên
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hired = gameState.hiredEmployees;

    if (hired.includes('emp_mai')) {
      const readyOrder = orders.find((o) => o.state === 'ready');
      if (readyOrder) {
        handleServeDish(readyOrder);
      }
    }

    if (hired.includes('emp_linh')) {
      const waitingOrder = orders.find((o) => o.state === 'waiting');
      if (waitingOrder) {
        const recipe = RECIPES[waitingOrder.recipeId];
        let canCook = true;
        for (const ing of recipe.requiredIngredients) {
          if ((gameState.inventory[ing] || 0) <= 0) {
            canCook = false;
            break;
          }
        }
        if (canCook) {
          completeCooking(waitingOrder.recipeId, waitingOrder.tableIndex);
          setOrders((prev) =>
            prev.map((o) => (o.id === waitingOrder.id ? { ...o, state: 'ready' } : o))
          );
          soundManager.playDishComplete();
        }
      }
    }
  }, [orders, isShopOpen, timeSpeed, gameState.hiredEmployees, gameState.inventory, setOrders]);

  // Đơn hàng đang được chọn chế biến
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  // Chạm khay nguyên liệu để thêm/bỏ trên thớt
  const toggleIngredient = (ingId: string) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
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

  // Danh sách 12 khay nhân chính xếp lưới 3x4 (Topping Bar)
  const toppingGrid = [
    { id: 'pate', name: 'Pate Gan', icon: '🥫', color: '#8D6E63' },
    { id: 'egg', name: 'Trứng Ốp La', icon: '🍳', color: '#FFF59D' },
    { id: 'pork', name: 'Thịt Xá Xíu', icon: '🥩', color: '#EF5350' },
    { id: 'cucumber', name: 'Dưa Leo Giòn', icon: '🥒', color: '#A5D6A7' },
    { id: 'herb', name: 'Rau Thơm Ngò', icon: '🌿', color: '#81C784' },
    { id: 'bread', name: 'Bánh Mì Giòn', icon: '🥖', color: '#FFE082' },
    { id: 'tea', name: 'Trà Lài Thơm', icon: '🧋', color: '#80CBC4' },
    { id: 'coffee', name: 'Cà Phê Phin', icon: '☕', color: '#6D4C41' },
    { id: 'milk', name: 'Sữa Tươi', icon: '🥛', color: '#ECEFF1' },
    { id: 'condensed_milk', name: 'Sữa Đặc', icon: '🍯', color: '#FFD54F' },
    { id: 'sauce', name: 'Sốt Cay', icon: '🌶️', color: '#FF7043' },
    { id: 'butter', name: 'Bơ Béo Ngậy', icon: '🧈', color: '#FFF176' },
  ];

  // Dãy 6 bình chứa cốt trên tầng 1 (Glass Dispenser Jars)
  const dispenserJars = [
    { id: 'tra_sua', name: 'TRÀ SỮA', color: '#D7CCC8', liquid: '#BCAAA4', icon: '🧋' },
    { id: 'cafe', name: 'CÀ PHÊ', color: '#5D4037', liquid: '#3E2723', icon: '☕' },
    { id: 'hong_tra', name: 'HỒNG TRÀ', color: '#EF9A9A', liquid: '#C62828', icon: '🍵' },
    { id: 'luc_tra', name: 'LỤC TRÀ', color: '#C8E6C9', liquid: '#388E3C', icon: '🍃' },
    { id: 'sot_dac', name: 'NƯỚC SỐT', color: '#FFCC80', liquid: '#E65100', icon: '🥫' },
    { id: 'bo_vang', name: 'BƠ BÉO', color: '#FFF59D', liquid: '#FBC02D', icon: '🧈' },
  ];

  // Dãy 6 khay sốt & foam có muỗng múc ở tầng 3
  const sauceFoamTubs = [
    { name: 'FOAM CHEESE', color: '#FFF9C4', icon: '🧀' },
    { name: 'FOAM MATCHA', color: '#C8E6C9', icon: '🍵' },
    { name: 'FOAM MUỐI', color: '#FFFFFF', icon: '🧂' },
    { name: 'SỐT MAYO', color: '#FFFDE7', icon: '🥚' },
    { name: 'ĐÁ VIÊN', color: '#E1F5FE', icon: '🧊' },
    { name: 'NƯỚC ĐƯỜNG', color: '#FFE082', icon: '🍯' },
  ];

  // Dãy chai siro bơm vòi ở tầng dưới cùng (Syrup Pump Bottles)
  const syrupBottles = [
    { name: 'Vải', color: '#FCE4EC', liquid: '#F48FB1' },
    { name: 'Đào', color: '#FFF3E0', liquid: '#FFB74D' },
    { name: 'Dâu', color: '#FFEBEE', liquid: '#E57373' },
    { name: 'Nho', color: '#F3E5F5', liquid: '#BA68C8' },
    { name: 'Xoài', color: '#FFFDE7', liquid: '#FFF176' },
    { name: 'Táo', color: '#FFEBEE', liquid: '#EF5350' },
    { name: 'Chuối', color: '#FFF8E1', liquid: '#FFE082' },
    { name: 'Dưa Lưới', color: '#E8F5E9', liquid: '#81C784' },
    { name: 'Cacao', color: '#EFEBE9', liquid: '#8D6E63' },
  ];

  const formatGameTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto select-none bg-[#FDF7EE] text-[#5D4037] relative pb-2">
      {/* 1. MÁI HIÊN CONG SỌC HỒNG TRẮNG CUTE (TIỆM TRÀ NHỎ FORMAT) */}
      <div className="relative shrink-0">
        <div className="h-6 w-full flex overflow-hidden shadow-xs">
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full rounded-b-md"
              style={{
                backgroundColor: i % 2 === 0 ? '#F48FB1' : '#FFFFFF',
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. KHUNG BONG BÓNG KHÁCH GỌI MÓN (SPEECH BUBBLE TO RÕ) */}
      <div className="p-2 shrink-0">
        <div className="bg-white rounded-3xl border-3 border-[#8D6E63] p-2.5 shadow-sm relative flex flex-col gap-1.5">
          {activeOrder && currentRecipe ? (
            <div>
              {/* Header khách & Tabs chuyển bàn */}
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
                    <div className="text-[11px] font-black text-[#5D4037] truncate flex items-center gap-1">
                      <span>Bàn {activeOrder.tableIndex}:</span>
                      <span className="text-pink-600 font-extrabold truncate">
                        {activeOrder.neighborId
                          ? NEIGHBORS_DATA[activeOrder.neighborId].name
                          : CUSTOMER_TYPES[activeOrder.typeId]?.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate italic">
                      "{activeOrder.dialogue || 'Cho mình gọi món nha chủ quán!'}"
                    </div>
                  </div>
                </div>

                {/* Tabs chuyển đổi giữa các bàn khách */}
                <div className="flex items-center gap-1 shrink-0">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedOrderIndex(o.tableIndex);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                        o.tableIndex === activeOrder.tableIndex
                          ? 'bg-[#F48FB1] text-white shadow-xs'
                          : 'bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA]'
                      }`}
                    >
                      B{o.tableIndex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tên món khách gọi & Thành phần cần */}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl bg-pink-50 p-1 rounded-xl border border-pink-200">
                    {currentRecipe.icon}
                  </span>
                  <div>
                    <div className="text-xs font-black text-[#5D4037]">
                      {currentRecipe.name}
                    </div>
                    <div className="text-[10px] text-pink-600 font-bold flex items-center gap-1 flex-wrap">
                      <span>Cần:</span>
                      {currentRecipe.requiredIngredients.map((ingId) => {
                        const ing = INGREDIENTS[ingId];
                        const isPicked = !!selectedIngredients[ingId];
                        return (
                          <span
                            key={ingId}
                            className={`px-1 rounded ${
                              isPicked
                                ? 'bg-emerald-100 text-emerald-800 font-black'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ing?.icon} {ing?.name.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Giá tiền */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-amber-700">
                    {currentRecipe.basePrice.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold">
                    + Tip tùy tốc độ
                  </div>
                </div>
              </div>

              {/* Thanh kiên nhẫn */}
              <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
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
            /* Khi chưa có khách */
            <div className="py-2.5 text-center flex flex-col items-center justify-center">
              <span className="text-xl">🌸</span>
              <div className="text-xs font-black text-[#5D4037] mt-0.5">
                Đang chờ khách ghé quán...
              </div>
              <div className="text-[10px] text-[#9C7C75]">
                {isShopOpen
                  ? 'Ngồi chơi xíu đi, bà con xóm sắp ghé mua bánh mì & trà sữa rồi nè!'
                  : 'Quán đang đóng cửa. Bấm [Mở Quán] để đón khách nha!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. TẦNG 1: QUẦY CỐT TRÀ & CÀ PHÊ & MÁY ÉP (DISPENSER JARS) */}
      <div className="px-2 mb-1.5 shrink-0">
        <div className="bg-[#EFEBE9] rounded-2xl border-2 border-[#8D6E63] p-2 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black uppercase text-[#6D4C41] bg-white px-1.5 py-0.2 rounded border border-[#8D6E63]">
              QUẦY CỐT NƯỚC & NƯỚNG
            </span>
            <span className="text-[9px] font-bold text-slate-500">
              Vòi rót tự động
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5">
            {/* Chồng ly / Bánh mì bên trái */}
            <div className="flex items-center gap-1 shrink-0">
              <div
                onClick={() => toggleIngredient('bread')}
                className={`p-1 bg-white rounded-xl border border-[#8D6E63] flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
                  selectedIngredients['bread'] ? 'ring-2 ring-pink-400 bg-pink-50' : ''
                }`}
                title="Bánh Mì Giòn"
              >
                <span className="text-xl">🥖</span>
                <span className="text-[7px] font-black">BÁNH MÌ</span>
              </div>
              <div
                className="p-1 bg-white rounded-xl border border-[#8D6E63] flex flex-col items-center opacity-85"
                title="Ly M / L"
              >
                <span className="text-xl">🥤</span>
                <span className="text-[7px] font-black">LY M/L</span>
              </div>
            </div>

            {/* Dãy 6 bình chứa cốt thủy tinh có vòi rót inox */}
            <div className="flex-1 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar px-1">
              {dispenserJars.map((jar) => (
                <div
                  key={jar.id}
                  onClick={() => {
                    if (jar.id === 'tra_sua') toggleIngredient('tea');
                    if (jar.id === 'cafe') toggleIngredient('coffee');
                    soundManager.playClick();
                  }}
                  className="flex flex-col items-center cursor-pointer active:scale-95 group shrink-0"
                >
                  {/* Bình thủy tinh */}
                  <div className="w-11 h-13 rounded-t-xl rounded-b-md border-2 border-[#795548] bg-white relative flex flex-col justify-end overflow-hidden shadow-xs">
                    {/* Nắp bình màu bạc */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#CFD8DC] border-b border-[#795548]" />
                    {/* Cốt nước bên trong */}
                    <div
                      className="w-full h-8 opacity-85"
                      style={{ backgroundColor: jar.color }}
                    />
                    {/* Vòi vặn rót bên dưới */}
                    <div className="w-2.5 h-1.5 bg-[#9E9E9E] rounded-xs mx-auto mb-0.5 border border-[#616161]" />
                  </div>
                  <span className="text-[7px] font-black text-[#5D4037] mt-0.5 truncate max-w-[44px]">
                    {jar.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Máy ép nắp / Lò nướng bên phải */}
            <div className="p-1.5 bg-[#455A64] rounded-xl border border-[#263238] text-white text-center shrink-0 flex flex-col items-center">
              <span className="text-base">♨️</span>
              <span className="text-[7px] font-black bg-emerald-500 px-1 rounded mt-0.5">
                READY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TẦNG 2: THỚT GỖ CHẾ BIẾN & KHAY INOX 12 Ô TOPPING (TRỌNG TÂM FORMAT) */}
      <div className="px-2 mb-1.5 shrink-0 flex gap-2">
        {/* Thớt gỗ chế biến (Bên trái) */}
        <div className="w-28 shrink-0 bg-[#D7CCC8] rounded-2xl border-2 border-[#6D4C41] p-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[8px] font-black text-[#5D4037]">
            <span>THỚT CHẾ BIẾN</span>
            {Object.values(selectedIngredients).some(Boolean) && (
              <button
                onClick={clearCuttingBoard}
                className="text-rose-600 hover:text-rose-700 p-0.5"
                title="Xóa làm lại"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Mặt thớt vân gỗ */}
          <div className="flex-1 my-1 bg-[#EFEBE9] rounded-xl border border-[#8D6E63] p-1.5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[90px]">
            {Object.keys(selectedIngredients).filter((k) => selectedIngredients[k]).length >
            0 ? (
              <div className="flex flex-col items-center gap-0.5">
                {/* Món đang hình thành trên thớt */}
                <span className="text-2xl animate-bounce-short">
                  {currentRecipe ? currentRecipe.icon : '🥖'}
                </span>
                <div className="flex flex-wrap justify-center gap-0.5 max-w-[90px]">
                  {Object.keys(selectedIngredients)
                    .filter((k) => selectedIngredients[k])
                    .map((k) => (
                      <span key={k} className="text-xs" title={k}>
                        {INGREDIENTS[k as IngredientId]?.icon || '✨'}
                      </span>
                    ))}
                </div>
                <span className="text-[8px] font-black text-[#5D4037] mt-0.5 truncate max-w-[85px]">
                  {currentRecipe?.name || 'Món Đang Làm'}
                </span>
              </div>
            ) : (
              <div className="text-center text-[8px] text-slate-400 font-medium">
                Chạm khay chọn nguyên liệu
              </div>
            )}
          </div>

          {/* Ca đong inox */}
          <div className="text-[8px] text-center font-bold text-slate-500 bg-white/70 rounded py-0.5">
            🥛 Ca đong inox
          </div>
        </div>

        {/* Khay Inox 12 Ô Topping / Nhân Bánh (Bên phải - Lưới 3x4 chuẩn hình mẫu) */}
        <div className="flex-1 bg-[#ECEFF1] rounded-2xl border-2 border-[#78909C] p-1.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-black text-[#37474F] mb-1">
            <span>KHAY NGUYÊN LIỆU & TOPPING INOX (12 KHAY)</span>
            <span>Chạm để cho vào thớt</span>
          </div>

          {/* Lưới 12 ô vuông inox */}
          <div className="grid grid-cols-4 gap-1.5">
            {toppingGrid.map((top) => {
              const stock = gameState.inventory[top.id as IngredientId] ?? 99;
              const isChecked = !!selectedIngredients[top.id];
              const isNeeded = currentRecipe?.requiredIngredients.includes(top.id as any);

              return (
                <div
                  key={top.id}
                  onClick={() => toggleIngredient(top.id)}
                  className={`relative rounded-xl border-2 p-1 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs ${
                    isChecked
                      ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300'
                      : isNeeded
                      ? 'bg-white border-[#B0BEC5] hover:border-pink-300'
                      : 'bg-white/80 border-[#CFD8DC]'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {/* Số lượng tồn kho badge tròn nhỏ góc trên */}
                  <span
                    className={`absolute top-0.5 right-0.5 text-[7px] font-black px-1 rounded-full border ${
                      stock > 0
                        ? 'bg-white text-slate-700 border-slate-300'
                        : 'bg-rose-500 text-white border-white'
                    }`}
                  >
                    {stock > 99 ? '99+' : stock}
                  </span>

                  {/* Icon nguyên liệu */}
                  <span className="text-base leading-none mb-0.5">{top.icon}</span>
                  <span className="text-[7px] font-black text-[#37474F] truncate max-w-full leading-tight">
                    {top.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. TẦNG 3: DÃY KHAY FOAM & SỐT CÓ MUỖNG MÚC (SAUCE TUBS) */}
      <div className="px-2 mb-1.5 shrink-0">
        <div className="bg-[#E0E0E0] rounded-2xl border-2 border-[#9E9E9E] p-1.5 shadow-xs">
          <div className="text-[8px] font-black uppercase text-[#424242] mb-1 flex items-center justify-between">
            <span>DÃY KHAY SỐT & FOAM & ĐÁ VIÊN</span>
            <span>Muỗng múc inox</span>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {sauceFoamTubs.map((tub, idx) => (
              <div
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  if (tub.name.includes('MUỐI') || tub.name.includes('SỐT')) {
                    toggleIngredient('pate');
                  }
                }}
                className="bg-white rounded-lg border border-[#BDBDBD] p-1 flex flex-col items-center relative cursor-pointer active:scale-95 hover:border-amber-400 shadow-2xs"
              >
                {/* Muỗng múc inox cán dài cắm trong khay */}
                <div className="w-1 h-3 bg-[#9E9E9E] rounded-xs -mt-2 mb-0.5 shadow-xs" />
                <span className="text-sm">{tub.icon}</span>
                <span className="text-[6.5px] font-black text-[#424242] text-center truncate max-w-full mt-0.5">
                  {tub.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. TẦNG 4: KỆ CHAI SIRO BƠM VÒI (SYRUP PUMP BOTTLES - NHƯ HÌNH MẪU) */}
      <div className="px-2 mb-2 shrink-0">
        <div className="bg-[#D7CCC8] rounded-xl border border-[#8D6E63] p-1 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {syrupBottles.map((bot, i) => (
            <div
              key={i}
              onClick={() => soundManager.playClick()}
              className="flex flex-col items-center cursor-pointer active:scale-90 shrink-0"
              title={`Siro hương ${bot.name}`}
            >
              {/* Vòi nhấn đen */}
              <div className="w-2 h-1 bg-[#424242] rounded-t-xs" />
              {/* Thân chai siro thủy tinh */}
              <div className="w-6 h-10 bg-white border border-[#8D6E63] rounded-t-sm rounded-b-md flex flex-col justify-end p-0.5 overflow-hidden shadow-2xs">
                {/* Nước siro màu tươi tắn */}
                <div
                  className="w-full h-5 rounded-b-xs opacity-90"
                  style={{ backgroundColor: bot.liquid }}
                />
              </div>
              <span className="text-[6.5px] font-bold text-[#5D4037] mt-0.5">
                {bot.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. NÚT HÀNH ĐỘNG CHÍNH (HOÀN THÀNH MÓN / BƯNG CHO KHÁCH / RA PHỐ) */}
      <div className="px-2 mt-auto shrink-0 space-y-1.5">
        {/* Nút Hoàn thành món hoặc Bưng món */}
        {activeOrder ? (
          activeOrder.state === 'ready' ? (
            <button
              onClick={() => handleServeDish(activeOrder)}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 active:scale-95 animate-bounce-short transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>BƯNG RA BÀN {activeOrder.tableIndex} (THU TIỀN + TIP 💰)</span>
            </button>
          ) : (
            <button
              onClick={handleCookCurrent}
              disabled={!hasMatchedRecipe() || !isStockAvailable()}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                hasMatchedRecipe() && isStockAvailable()
                  ? 'bg-[#F48FB1] hover:bg-[#ec407a] text-white shadow-pink-200 animate-pulse'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>
                {!hasMatchedRecipe()
                  ? `Chọn đủ nguyên liệu của ${currentRecipe?.name}`
                  : !isStockAvailable()
                  ? 'Kho đã hết nguyên liệu!'
                  : `HOÀN THÀNH MÓN ${currentRecipe?.name.toUpperCase()} (3 ⚡)`}
              </span>
            </button>
          )
        ) : (
          <div className="py-2.5 bg-white/70 rounded-2xl border border-dashed border-amber-300 text-center text-xs font-bold text-amber-800">
            Quầy pha chế sẵn sàng! Khách ghé sẽ hiện ở bong bóng trên.
          </div>
        )}

        {/* Thanh phím tắt dưới cùng: Ra Phố Quan Sát & Đơn Giao Hàng */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setCurrentView('street');
            }}
            className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs border border-amber-500 flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ra Đường Quan Sát (Bàn Ghế Vỉa Hè)</span>
          </button>

          {deliveryOrders.length > 0 && (
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('delivery');
              }}
              className="py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all animate-pulse"
              title="Có đơn giao hàng Chú Năm"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Đơn Ship ({deliveryOrders.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
