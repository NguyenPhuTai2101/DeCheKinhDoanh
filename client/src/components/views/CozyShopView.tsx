import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CUSTOMER_TYPES, RECIPES, INGREDIENTS, SHOP_THEMES, DECORATION_ITEMS, BUSINESS_STAGES, NEIGHBORS_DATA } from '../../../../shared/gameData';
import { CustomerTypeId, RecipeId, IngredientId } from '../../../../shared/types';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import { Utensils, Sparkles, Check, Heart, Clock, Store, Plus, AlertCircle, ShoppingBag, HeartHandshake, Megaphone, Ticket } from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';


interface ActiveOrder {
  id: string;
  tableIndex: number;
  typeId: CustomerTypeId;
  recipeId: RecipeId;
  patienceRemaining: number;
  maxPatience: number;
  state: 'waiting' | 'ready' | 'eating' | 'leaving';
}

export const CozyShopView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    setShopOpen,
    timeSpeed,
    tickTime,
    consumeEnergy,
    completeCooking,
    finishServing,
    handleCustomerLeaveAngry,
    openModal,
  } = useGameStore();

  // Danh sách các bàn đang đón khách
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);
  
  // Khay nguyên liệu người chơi đang chọn cho đơn hiện tại
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});

  // 1. Quản lý số bàn tối đa từ Cơ Nghiệp Vỉa Hè (decheviahe.com)
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables = currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);

  // 2. Vòng lặp thời gian & sinh khách
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const interval = setInterval(() => {
      // 1 giây = 2.5 phút game
      tickTime(2.5 * timeSpeed);

      // Cập nhật thanh kiên nhẫn
      setOrders((prev) => {
        let updated = false;
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

        // Lọc bỏ khách đã rời đi
        return next.filter((o) => o.state !== 'leaving');
      });
    }, 1000 / timeSpeed);

    return () => clearInterval(interval);
  }, [isShopOpen, timeSpeed, tickTime, handleCustomerLeaveAngry]);

  // 3. Định kỳ sinh khách mới theo cấp độ vỉa hè
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hasSignboard = (gameState.purchasedUpgrades['flower_signboard'] || 0) > 0;
    const baseRate = currentStage.customerRateMs;
    const spawnRate = hasSignboard ? Math.round(baseRate * 0.85) : baseRate;

    const spawnInterval = setInterval(() => {
      setOrders((prev) => {
        if (prev.length >= maxTables) return prev;

        // Tìm bàn trống đầu tiên
        const occupiedIndices = prev.map((o) => o.tableIndex);
        let freeTable = 1;
        for (let i = 1; i <= maxTables; i++) {
          if (!occupiedIndices.includes(i)) {
            freeTable = i;
            break;
          }
        }

        const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
        const chosenType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const cType = CUSTOMER_TYPES[chosenType];
        const favoriteList = cType.favoriteRecipeIds;
        const chosenRecipe = favoriteList[Math.floor(Math.random() * favoriteList.length)];

        soundManager.playDoorBell();

        const newOrder: ActiveOrder = {
          id: Math.random().toString(36).substring(2, 9),
          tableIndex: freeTable,
          typeId: chosenType,
          recipeId: chosenRecipe,
          patienceRemaining: cType.patienceSeconds,
          maxPatience: cType.patienceSeconds,
          state: 'waiting',
        };

        return [...prev, newOrder];
      });
    }, spawnRate / timeSpeed);

    return () => clearInterval(spawnInterval);
  }, [isShopOpen, timeSpeed, maxTables, currentStage.customerRateMs, gameState.purchasedUpgrades]);


  // 4. Tự động phục vụ nếu có nhân viên
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hired = gameState.hiredEmployees;

    // Bé Mai tự bưng món
    if (hired.includes('emp_mai')) {
      const readyOrder = orders.find((o) => o.state === 'ready');
      if (readyOrder) {
        handleServeDish(readyOrder);
      }
    }

    // Bác Linh tự nấu nếu còn nguyên liệu
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
  }, [orders, isShopOpen, timeSpeed, gameState.hiredEmployees, gameState.inventory]);

  // Chọn một đơn để chuẩn bị
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  // Toggle chọn nguyên liệu cho đơn đang chọn
  const toggleIngredient = (ingId: string) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
  };

  // Kiểm tra người chơi đã chọn đúng nguyên liệu của công thức chưa
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

  // Bấm Hoàn thành món
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
    const tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

    // Chuyển sang trạng thái ăn
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, state: 'eating' } : o))
    );

    setTimeout(() => {
      soundManager.playCoin();
      finishServing(order.tableIndex, recipe.basePrice, tip);

      // Bắn confetti nhẹ
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#F7A8C4', '#FFD6E5', '#FFE6A7'],
      });

      // Khách rời đi
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }, 1800);
  };

  const activeTheme = SHOP_THEMES[gameState.activeTheme] || SHOP_THEMES.sakura_pink;

  // Tổng điểm Cozy từ đồ trang trí đã trưng bày
  const cozyScore = gameState.equippedDecorations.reduce((sum, decorId) => {
    const item = DECORATION_ITEMS.find((d) => d.id === decorId);
    return sum + (item ? item.cozyPoints : 0);
  }, 0);

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: activeTheme.bgColor }}
    >
      {/* 1. MÁI HIÊN & KHÔNG GIAN QUÁN CHIBI COZY */}
      <div
        className="relative border-b-2 pt-1 pb-3 px-3 shrink-0 shadow-sm overflow-hidden"
        style={{
          backgroundColor: activeTheme.accentColor,
          borderColor: activeTheme.primaryColor,
        }}
      >
        {/* Mái hiên sọc màu theo Theme phong cách Tiệm Trà Nhỏ */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-repeat-x flex opacity-90">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{
                backgroundColor: i % 2 === 0 ? activeTheme.primaryColor : '#FFFFFF',
              }}
            />
          ))}
        </div>

        {/* Đồ trang trí treo phía trên (Đèn chùm, Tranh mèo) */}
        <div className="absolute top-4 right-14 flex items-center gap-2 pointer-events-none opacity-80">
          {gameState.equippedDecorations.includes('deco_sun_lamp') && (
            <span className="text-xl animate-bounce-short" title="Đèn Chùm Giọt Nắng">💡</span>
          )}
          {gameState.equippedDecorations.includes('deco_cat_painting') && (
            <span className="text-lg" title="Tranh Mèo Thưởng Trà">🖼️</span>
          )}
        </div>

        {/* Khung cảnh quầy bán hàng */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Nhân viên / Chủ tiệm sau quầy */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <ChibiAvatar type="player" emotion="happy" size={54} />
              <span
                className="absolute -bottom-1 -right-1 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white"
                style={{ backgroundColor: activeTheme.primaryColor }}
              >
                Bếp
              </span>
            </div>

            {/* Trợ lý nếu đã thuê */}
            {gameState.hiredEmployees.includes('emp_mai') && (
              <div className="relative">
                <ChibiAvatar type="emp_mai" emotion="love" size={46} />
                <span className="absolute -bottom-1 -right-1 bg-[#FF80AB] text-white text-[8px] font-black px-1 rounded-full border border-white">
                  Mai
                </span>
              </div>
            )}
            {gameState.hiredEmployees.includes('emp_linh') && (
              <div className="relative">
                <ChibiAvatar type="emp_linh" emotion="happy" size={46} />
                <span className="absolute -bottom-1 -right-1 bg-[#455A64] text-white text-[8px] font-black px-1 rounded-full border border-white">
                  Linh
                </span>
              </div>
            )}

            {/* Đồ trang trí trên bàn quầy (Bình hoa, Menu phấn) */}
            {gameState.equippedDecorations.includes('deco_flower_vase') && (
              <span className="text-2xl animate-pulse" title="Bình Hoa Linh Lan">💐</span>
            )}
            {gameState.equippedDecorations.includes('deco_menu_chalk') && (
              <span className="text-xl" title="Bảng Menu Vẽ Phấn">📋</span>
            )}

            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-xs sm:text-sm text-[#7C5C55]">
                  {gameState.shopName || 'Tiệm Bánh Mì Của Tôi 🌸'}
                </h3>
                <button
                  onClick={() => openModal('decor')}
                  className="text-[#7C5C55]/60 hover:text-[#7C5C55] p-0.5"
                  title="Đổi tên quán / Trang trí"
                >
                  <Sparkles className="w-3 h-3 text-[#F7A8C4]" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#9C7C75]">
                <span>{activeTheme.name.split(' ')[0]}</span>
                {cozyScore > 0 && (
                  <span className="bg-[#FFE6A7] text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                    +{cozyScore} Cozy ✨
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lò nướng đang bốc khói ấm áp */}
          <div className="flex items-center gap-2 bg-[#FFF7ED] px-3 py-1.5 rounded-2xl border border-[#F7D7BA] shadow-sm">
            <div className="text-xl animate-bounce-short">♨️</div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#9C7C75]">Bếp Đang Nóng</div>
              <div className="text-[11px] font-black text-amber-700">
                {orders.filter((o) => o.state === 'ready').length > 0
                  ? '✨ Có Món Xong!'
                  : 'Sẵn Sàng Nấu'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HÀNG THẺ KHÁCH HÀNG & BÀ CON XÓM GIỀNG */}
      <div className="p-2.5 bg-white/70 border-b border-[#F2E8E5] shrink-0 space-y-2">
        {/* Thanh phím tắt xóm giềng vỉa hè nhanh */}
        <div className="flex items-center justify-between gap-1.5 text-[10px]">
          <HorizontalScrollBox className="flex items-center gap-1 scrollbar-none py-0.5">
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('neighbors');
              }}
              className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 hover:bg-rose-100 transition-all active:scale-95 shrink-0"
            >
              <span>👵</span>
              <span>Bà Con Xóm</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                openModal('streetEvents');
              }}
              className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold flex items-center gap-1 hover:bg-sky-100 transition-all active:scale-95 shrink-0"
            >
              <span>📢</span>
              <span>Chuyện Vỉa Hè</span>
              {gameState.currentEvent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
            </button>

            {gameState.activeLotteryTicket ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1 shrink-0">
                <span>🎟️</span>
                <span>Vé [{gameState.activeLotteryTicket.ticketNumber}]</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  openModal('neighbors');
                }}
                className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1 hover:bg-amber-100 transition-all active:scale-95 shrink-0"
              >
                <span>🎟️</span>
                <span>Mua Vé Số Cô Bảy</span>
              </button>
            )}
          </HorizontalScrollBox>

          {!isShopOpen && (
            <button
              onClick={() => {
                soundManager.playClick();
                setShopOpen(true);
              }}
              className="px-2.5 py-0.5 bg-[#F7A8C4] hover:bg-[#f28bb1] text-white rounded-full font-black shadow-sm flex items-center gap-1 active:scale-95 animate-pulse shrink-0"
            >
              <Store className="w-3 h-3" />
              <span>Mở Quán</span>
            </button>
          )}
        </div>

        {/* Header danh sách bàn */}
        <div className="flex items-center justify-between text-[11px] font-black text-[#7C5C55]">
          <span className="flex items-center gap-1">
            <span>🪑</span> Ghế Nhựa Đang Đón Khách ({orders.length}/{maxTables} Bàn)
          </span>
          <span className="text-[10px] text-[#9C7C75] font-semibold">
            {currentStage.name}
          </span>
        </div>

        {/* Danh sách thẻ khách hàng cuộn ngang siêu nét */}
        <HorizontalScrollBox showArrows={orders.length > 2} className="flex items-center gap-2.5 no-scrollbar pb-1">
          {orders.length === 0 ? (
            <div className="w-full py-3 bg-[#FFF9F2] rounded-2xl border-2 border-dashed border-[#F7D7BA] text-center flex flex-col items-center justify-center gap-0.5">
              <span className="text-xl">☕</span>
              <p className="text-xs font-bold text-[#7C5C55]">
                {isShopOpen
                  ? 'Bà con khu phố đang tạt qua mua món...'
                  : 'Quán đang dọn dẹp. Bấm [Mở Quán] để đón khách nhé!'}
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const recipe = RECIPES[order.recipeId];
              const cType = CUSTOMER_TYPES[order.typeId];
              const isSelected = (activeOrder?.id === order.id);
              const patiencePercent = Math.max(0, order.patienceRemaining / order.maxPatience);

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedOrderIndex(order.tableIndex);
                  }}
                  className={`relative shrink-0 w-44 bg-white rounded-2xl p-2.5 border-2 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#F7A8C4] ring-2 ring-[#FFD6E5] bg-[#FFF1F6]/30'
                      : 'border-[#F2E8E5] hover:border-[#F7D7BA]'
                  }`}
                >
                  {/* Avatar và thông tin khách */}
                  <div className="flex items-center gap-2">
                    <ChibiAvatar
                      type={order.typeId}
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
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-[#7C5C55] truncate">
                        Bàn {order.tableIndex} · {cType.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-bold text-[#F7A8C4] truncate flex items-center gap-1">
                        <span>{recipe.icon}</span>
                        <span>{recipe.name}</span>
                      </div>
                    </div>
                  </div>


                  {/* Thanh kiên nhẫn */}
                  {order.state === 'waiting' && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            patiencePercent > 0.5
                              ? 'bg-emerald-400'
                              : patiencePercent > 0.25
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${patiencePercent * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Nút hành động trực tiếp trên thẻ */}
                  <div className="mt-2">
                    {order.state === 'ready' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServeDish(order);
                        }}
                        className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-sm flex items-center justify-center gap-1 animate-bounce-short active:scale-95"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>BƯNG MÓN NGAY 🤲</span>
                      </button>
                    ) : order.state === 'eating' ? (
                      <div className="w-full py-1 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black text-center border border-amber-200">
                        😋 Đang thưởng thức...
                      </div>
                    ) : (
                      <div
                        className={`w-full py-1 rounded-xl text-[10px] font-black text-center ${
                          isSelected
                            ? 'bg-[#F7A8C4] text-white shadow-sm'
                            : 'bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA]'
                        }`}
                      >
                        {isSelected ? 'Đang Chuẩn Bị' : 'Chạm Để Làm Món'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </HorizontalScrollBox>
      </div>


      {/* 3. KHU VỰC QUẦY CHẾ BIẾN TRỰC QUAN (COOKING STATION - FORMAT TIỆM TRÀ NHỎ) */}
      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
        {activeOrder && currentRecipe ? (
          <div className="bg-white rounded-3xl p-3.5 border-2 border-[#FFD6E5] shadow-sm flex flex-col gap-3">
            {/* Header đơn đang chọn */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F2E8E5]">
              <div className="flex items-center gap-2">
                <span className="text-3xl bg-[#FFF1F6] p-2 rounded-2xl border border-[#FFD6E5]">
                  {currentRecipe.icon}
                </span>
                <div>
                  <h4 className="font-black text-sm text-[#7C5C55]">
                    Đơn Bàn {activeOrder.tableIndex}: {currentRecipe.name}
                  </h4>
                  <p className="text-[11px] text-[#9C7C75]">
                    Giá bán: <span className="font-extrabold text-[#F7A8C4]">{currentRecipe.basePrice.toLocaleString('vi-VN')} đ</span> · Cần {currentRecipe.requiredIngredients.length} nguyên liệu
                  </p>
                </div>
              </div>

              {activeOrder.state === 'ready' && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-xs rounded-full border border-emerald-200">
                  ✨ Đã Nấu Xong
                </span>
              )}
            </div>

            {/* Khay chọn nguyên liệu to rõ, sắc nét, chạm mượt */}
            <div>
              <div className="text-xs font-black text-[#7C5C55] mb-2 flex items-center justify-between">
                <span>Chạm khay chọn nguyên liệu:</span>
                <span className="text-[10px] text-[#9C7C75]">
                  (Bấm đúng theo công thức)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(INGREDIENTS).map((ing) => {
                  const isChecked = !!selectedIngredients[ing.id];
                  const stock = gameState.inventory[ing.id] || 0;
                  const isRequired = currentRecipe.requiredIngredients.includes(ing.id as any);

                  return (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 text-left transition-all active:scale-95 ${
                        isChecked
                          ? 'bg-[#FFD6E5] border-[#F7A8C4] font-bold text-[#7C5C55] shadow-sm'
                          : 'bg-[#FFF9F2] border-[#F2E8E5] text-[#7C5C55]'
                      }`}
                    >
                      <span className="text-2xl">{ing.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{ing.name}</div>
                        <div
                          className={`text-[10px] ${
                            stock > 0 ? 'text-[#9C7C75]' : 'text-rose-500 font-black'
                          }`}
                        >
                          Kho: {stock} {stock <= 0 && '(Hết hàng)'}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
                          isChecked
                            ? 'bg-[#F7A8C4] text-white border-[#F7A8C4]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nút nấu hoặc bưng món */}
            <div className="pt-2 border-t border-[#F2E8E5]">
              {activeOrder.state === 'ready' ? (
                <button
                  onClick={() => handleServeDish(activeOrder)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>BƯNG RA BÀN CHO KHÁCH (THU TIỀN + TIP 💰)</span>
                </button>
              ) : (
                <button
                  onClick={handleCookCurrent}
                  disabled={!hasMatchedRecipe() || !isStockAvailable()}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    hasMatchedRecipe() && isStockAvailable()
                      ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-pink-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>
                    {!hasMatchedRecipe()
                      ? `Chọn đúng nguyên liệu của ${currentRecipe.name}`
                      : !isStockAvailable()
                      ? 'Kho đã hết nguyên liệu!'
                      : 'HOÀN THÀNH MÓN ĂN (3 ⚡)'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Trạng thái chưa có đơn hoặc quán vắng */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white rounded-3xl border-2 border-[#FFD6E5]">
            <div className="w-16 h-16 rounded-full bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-3xl mb-2">
              🌸
            </div>
            <h4 className="font-black text-base text-[#7C5C55]">Quầy Pha Chế Sẵn Sàng</h4>
            <p className="text-xs text-[#9C7C75] max-w-xs mt-1">
              Khi khách đến và gọi món, hãy chạm vào thẻ của khách ở trên để bắt đầu chuẩn bị món ăn nhé!
            </p>
            <button
              onClick={() => openModal('market')}
              className="mt-4 px-4 py-2 bg-[#FFF7ED] text-[#7C5C55] border-2 border-[#F7D7BA] hover:bg-[#FFD6E5] rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Kiểm Tra Kho & Mua Thêm Nguyên Liệu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
