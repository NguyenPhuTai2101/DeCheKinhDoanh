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
  EMPLOYEES,
  calculateMaxTables,
} from '../../../../shared/gameData';
import { CustomerTypeId, RecipeId, IngredientId, NeighborId, ActiveOrder, Employee } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { ChibiAvatar } from '../chibi/ChibiAvatar';
import { IngredientIcon } from '../common/IngredientIcon';
import { soundManager } from '../../utils/soundManager';
import { getDishImage, WORKBENCH_BG_IMAGE } from '../../utils/dishAssets';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Check,
  ShoppingBag,
  RotateCcw,
  Bike,
} from 'lucide-react';

export const CozyShopView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    openStoreForDay,
    completeCooking,
    serveDishOrder,
    collectPayment,
    openModal,
    deliveryOrders,
    activeOrders,
    setActiveOrders,
  } = useGameStore();

  const orders = activeOrders;
  const setOrders = setActiveOrders;
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  // Tab phân loại khay nguyên liệu ('food' | 'drink')
  const [activeIngredientTab, setActiveIngredientTab] = useState<'food' | 'drink'>('food');

  // Khay nguyên liệu đang chọn trên thớt.
  // Lưu số lượng để hỗ trợ order kiểu "thêm 1 trứng", "2 phần thịt"...
  const [selectedIngredients, setSelectedIngredients] = useState<Partial<Record<IngredientId, number>>>({});

  // Cấu hình cấp bậc & thương hiệu quán hiện tại
  const stageId = gameState.businessStage || 'cart';
  const stageUpgrades = gameState.stageUpgrades?.[stageId] || gameState.purchasedUpgrades || {};
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

  // Danh sách nhân sự được phân công cho quán này
  const hiredList = gameState.hiredEmployees.map(
    (id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id)
  ).filter(Boolean) as Employee[];

  const assignedStaff = hiredList.filter(
    (e) => (e.assignedRestaurantId || 'banh_mi') === activeRestId
  );
  const activeServers = assignedStaff.filter((e) => e.role === 'server');

  // Đơn hàng đang được chọn chế biến
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;
  const activeDishImage = getDishImage(currentRecipe?.id);

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

  // Manual-first: người chơi phải đọc order rồi tự chọn nguyên liệu.
  const addIngredient = (ingId: IngredientId) => {
    const stock = gameState.inventory[ingId] || 0;
    const currentQty = selectedIngredients[ingId] || 0;

    if (currentQty >= stock) {
      soundManager.playClick();
      openModal('market');
      return;
    }

    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: (prev[ingId] || 0) + 1,
    }));
  };

  const removeIngredient = (ingId: IngredientId) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => {
      const currentQty = prev[ingId] || 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[ingId];
        return next;
      }

      return {
        ...prev,
        [ingId]: currentQty - 1,
      };
    });
  };

  const clearCuttingBoard = () => {
    soundManager.playClick();
    setSelectedIngredients({});
  };

  const getPreparedIngredients = (): IngredientId[] =>
    Object.entries(selectedIngredients).flatMap(([id, qty]) =>
      Array.from({ length: qty || 0 }, () => id as IngredientId)
    );

  const hasMatchedRecipe = () => {
    if (!currentRecipe) return false;

    const removed = activeOrder?.removedIngredients || [];
    const extra = activeOrder?.extraIngredients || [];
    const expected = currentRecipe.requiredIngredients
      .filter((id) => !removed.includes(id))
      .concat(extra);

    const expectedCounts = expected.reduce<Record<string, number>>((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const prepared = getPreparedIngredients();
    if (prepared.length !== expected.length) return false;

    const preparedCounts = prepared.reduce<Record<string, number>>((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(expectedCounts).every(
      ([id, qty]) => preparedCounts[id] === qty
    );
  };

  const isStockAvailable = () => {
    for (const [id, qty] of Object.entries(selectedIngredients)) {
      if ((gameState.inventory[id as IngredientId] || 0) < (qty || 0)) return false;
    }
    return true;
  };

  // Nấu xong món trên thớt
  const handleCookCurrent = () => {
    if (!activeOrder || !currentRecipe) return;

    const prepList = getPreparedIngredients();

    const success = completeCooking(activeOrder.recipeId, activeOrder.tableIndex, prepList);
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
    soundManager.playDishComplete();
    serveDishOrder(order.id);
  };

  // Thu tiền khi khách ăn uống xong
  const handleCollectPayment = (order: ActiveOrder) => {
    soundManager.playCoin();
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#F43F5E', '#FBBF24', '#38BDF8', '#34D399'],
    });
    collectPayment(order.id);
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

  // Đếm theo order thực tế, bao gồm cả số lượng topping khách gọi thêm.
  const removedIngredients = activeOrder?.removedIngredients || [];
  const extraIngredients = activeOrder?.extraIngredients || [];
  const expectedIngredients: IngredientId[] = currentRecipe
    ? currentRecipe.requiredIngredients
        .filter((id) => !removedIngredients.includes(id))
        .concat(extraIngredients)
    : [];

  const expectedCounts = expectedIngredients.reduce<Partial<Record<IngredientId, number>>>(
    (acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {}
  );

  const totalSelectedCount = getPreparedIngredients().length;
  const requiredCount = expectedIngredients.length;
  const pickedRequiredCount = Object.entries(expectedCounts).reduce((sum, [id, expectedQty]) => {
    const pickedQty = selectedIngredients[id as IngredientId] || 0;
    return sum + Math.min(pickedQty, expectedQty || 0);
  }, 0);

  const visibleOrderNotes =
    activeOrder?.orderNotes && activeOrder.orderNotes.length > 0
      ? activeOrder.orderNotes
      : activeOrder?.customTag
      ? [activeOrder.customTag]
      : [];

  const playerPrice =
    activeOrder && currentRecipe
      ? gameState.menuSettings?.[activeRestId]?.prices?.[activeOrder.recipeId] ?? currentRecipe.basePrice
      : currentRecipe?.basePrice || 0;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FA] to-[#FFF0F5] text-[#5C3A33] p-1.5 sm:p-2 gap-1.5 min-h-0">
      {/* 1. KHUNG ORDER & BÀN ĂN CỦA KHÁCH (QUẦY GỌI MÓN VỈA HÈ - COZY CANOPY) */}
      <div className="shrink-0 bg-white/95 rounded-2xl border-2 border-[#FFCCD9] shadow-[0_2px_12px_rgba(255,168,197,0.12)] flex flex-col relative overflow-hidden">
        {/* Mái hiên sọc hồng trắng kawaii */}
        <div className="w-full h-4 sm:h-4.5 bg-[repeating-linear-gradient(45deg,#FF6584,#FF6584_10px,#FFFFFF_10px,#FFFFFF_20px)] border-b-2 border-[#FFCCD9] shadow-2xs relative flex items-center justify-between px-2">
          <div className="text-[7.5px] sm:text-[8px] font-black text-white bg-[#FF6584]/95 px-1.5 py-0.2 rounded-full shadow-2xs flex items-center gap-1">
            <span>🌸 QUẦY GỌI MÓN</span>
            {activeOrder && (
              <span className="bg-white/30 text-white px-1 rounded-full">
                BÀN {activeOrder.tableIndex}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('market');
              }}
              className="text-[7.5px] sm:text-[8px] font-black text-[#5C3A33] bg-white/95 px-1.5 py-0.2 rounded-full border border-pink-200 flex items-center gap-0.5 hover:bg-pink-50 transition-all cursor-pointer shadow-2xs"
              title="Nhấn để Mở Chợ Đầu Mối"
            >
              <span>{gameState.weather === 'rainy' ? '🌧️ Mưa' : gameState.weather === 'breezy' ? '🍃 Mát' : '☀️ Nắng'}</span>
              <span className="text-[#FF6584] font-black">· 🛒 Chợ</span>
            </button>
            {orders.length > 0 && (
              <div className="text-[7.5px] sm:text-[8px] font-black text-[#5C3A33] bg-white/90 px-1.5 py-0.2 rounded-full border border-pink-200">
                {orders.length} Bàn
              </div>
            )}
          </div>
        </div>

        {/* Hàng tab các bàn ăn (Khi có từ 2 bàn khách trở lên) */}
        {orders.length > 1 && (
          <div className="flex items-center gap-1 px-2 pt-1 pb-1 overflow-x-auto no-scrollbar border-b border-[#FFEBF0] bg-[#FFF9FA]/70">
            {orders.map((o) => {
              const isSelected = o.tableIndex === activeOrder?.tableIndex;
              const isReady = o.state === 'ready';
              const isEating = o.state === 'eating';
              const isPaying = o.state === 'paying';

              return (
                <button
                  key={o.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedOrderIndex(o.tableIndex);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all active:scale-95 shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF6584] to-[#FFA07A] text-white border-transparent shadow-2xs font-black'
                      : isPaying
                      ? 'bg-amber-50 text-amber-900 border-amber-300 animate-bounce-short font-bold'
                      : isEating
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                      : isReady
                      ? 'bg-pink-50 text-[#D81B60] border-pink-300 animate-pulse font-bold'
                      : 'bg-white text-[#8C6258] border-[#FFCCD9] hover:bg-[#FFF5F8]'
                  }`}
                  title={`Bàn ${o.tableIndex}`}
                >
                  <ChibiAvatar
                    type={o.neighborId || o.typeId}
                    emotion={isEating ? 'eating' : isPaying ? 'happy' : isReady ? 'love' : 'waiting'}
                    size={16}
                  />
                  <span className="text-[8.5px] font-black">
                    Bàn {o.tableIndex}
                  </span>
                  {isPaying && <span className="text-[8px]">🪙</span>}
                  {isEating && <span className="text-[8px]">😋</span>}
                  {isReady && <span className="text-[8px]">✨</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Nội dung Order: Khách bên trái & Hộp thoại Order bên phải */}
        {activeOrder && currentRecipe ? (
          <div className="p-1.5 sm:p-2 flex items-center gap-2">
            {/* 1. Bên Trái: Chibi Khách Hàng (Tối ưu kích thước, không bị chật) */}
            <div className="w-12 sm:w-14 flex flex-col items-center justify-center shrink-0 select-none">
              <div className="relative flex items-center justify-center">
                <ChibiAvatar
                  type={activeOrder.neighborId || activeOrder.typeId}
                  emotion={
                    activeOrder.state === 'eating'
                      ? 'eating'
                      : activeOrder.state === 'paying'
                      ? 'happy'
                      : activeOrder.state === 'ready'
                      ? 'love'
                      : activeOrder.patienceRemaining / activeOrder.maxPatience > 0.4
                      ? 'waiting'
                      : 'angry'
                  }
                  size={38}
                />
                {/* Đĩa đồ ăn mini trước mặt khi đang ăn hoặc tính tiền */}
                {(activeOrder.state === 'eating' || activeOrder.state === 'paying') && (
                  <div className="absolute -bottom-1 w-4 h-4 rounded-full overflow-hidden border border-[#FFCCD9] shadow-xs bg-white flex items-center justify-center">
                    {activeDishImage ? (
                      <img
                        src={activeDishImage}
                        alt={currentRecipe.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px]">
                        {currentRecipe.category === 'drink' ? '🧋' : '🍜'}
                      </span>
                    )}
                  </div>
                )}
                {activeOrder.state === 'eating' && (
                  <span className="absolute -top-1 -right-1 text-[10px] animate-heart-float">💖</span>
                )}
              </div>
              <div className="text-center leading-tight mt-0.5 w-full">
                <div className="text-[9px] font-black text-[#5C3A33] truncate max-w-full">
                  {activeOrder.neighborId
                    ? NEIGHBORS_DATA[activeOrder.neighborId].name
                    : CUSTOMER_TYPES[activeOrder.typeId]?.name}
                </div>
                <div className="text-[7.5px] text-[#E91E63] font-bold">
                  {activeOrder.neighborId ? 'VIP Quen 🌸' : `Bàn ${activeOrder.tableIndex}`}
                </div>
              </div>
            </div>

            {/* 2. Bên Phải: Bong bóng thoại Order (Không bị cắt chữ, bố cục khoa học) */}
            <div className="flex-1 min-w-0 bg-[#FFFDFE] rounded-xl sm:rounded-2xl border-2 border-[#FFCCD9] p-1.5 sm:p-2 relative shadow-xs flex flex-col justify-between gap-1">
              {/* Đuôi thoại chỉ sang chibi khách */}
              <div className="absolute top-3.5 -left-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#FFCCD9]" />
              <div className="absolute top-3.5 -left-1.5 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-[#FFFDFE]" />

              {/* Hàng 1: Badge Bàn, Tên Món Rõ Ràng & Giá Tiền */}
              <div className="flex items-center justify-between gap-1 pb-0.5 border-b border-[#FFEBF0]">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="bg-[#FF6584] text-white text-[10px] font-black px-2 py-1 rounded-full shrink-0">
                    BÀN {activeOrder.tableIndex}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#5C3A33] truncate">
                    {currentRecipe.name}
                  </span>
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-black text-[#E91E63] shrink-0">
                  {playerPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Hàng 2: Món + yêu cầu khách. Custom order là thông tin quan trọng nhất. */}
              <div className="flex items-start gap-2.5 py-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF0F5] border-2 border-[#FFCCD9] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {activeDishImage ? (
                    <img
                      src={activeDishImage}
                      alt={currentRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{currentRecipe.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {visibleOrderNotes.length > 0 ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-2 py-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wide text-rose-700 mb-1">
                        ⚠️ Yêu cầu khách
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleOrderNotes.map((note, idx) => {
                          const lower = note.toLocaleLowerCase('vi-VN');
                          const icon =
                            lower.includes('không') || note.includes('❌')
                              ? '🚫'
                              : lower.includes('thêm') || note.includes('➕')
                              ? '➕'
                              : lower.includes('ít')
                              ? '➖'
                              : lower.includes('dị ứng')
                              ? '🚨'
                              : '✦';

                          return (
                            <span
                              key={`${note}-${idx}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2 py-1 text-[11px] sm:text-xs font-black text-rose-800 shadow-2xs"
                            >
                              <span aria-hidden>{icon}</span>
                              <span>{note.replace(/^[❌➕]\s*/, '')}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-2 py-1 text-[11px] font-bold text-emerald-800">
                      ✓ Order tiêu chuẩn — làm đúng công thức của quán
                    </div>
                  )}

                  <div className="mt-1 text-[10.5px] sm:text-[11px] leading-snug italic text-[#8C6258] line-clamp-2">
                    “{activeOrder.dialogue || 'Làm nóng giòn, vừa miệng nha chủ quán!'}”
                  </div>

                  {activeOrder.matchFeedback && activeOrder.state === 'ready' && (
                    <div
                      className={`mt-1 rounded-lg px-2 py-1 text-[10.5px] font-black ${
                        activeOrder.matchGrade === 'perfect'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeOrder.matchGrade === 'allergy'
                          ? 'bg-red-100 text-red-800'
                          : activeOrder.matchGrade === 'wrong'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeOrder.matchGrade === 'perfect'
                        ? '⭐⭐⭐⭐⭐ '
                        : activeOrder.matchGrade === 'minor'
                        ? '⭐⭐⭐ '
                        : '⭐⭐ '}
                      {activeOrder.matchFeedback}
                    </div>
                  )}
                </div>
              </div>
              {/* Hàng 3: NÚT THU TIỀN VÀNG HOẶC THANH TIẾN ĐỘ */}
              <div className="pt-0.5 border-t border-[#FFEBF0]">
                {activeOrder.state === 'paying' ? (
                  /* NÚT THU TIỀN VÀNG RỰC RỠ KHI KHÁCH XONG BỮA */
                  <button
                    onClick={() => handleCollectPayment(activeOrder)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 text-amber-950 font-black text-[11px] sm:text-xs shadow-md flex items-center justify-between active:scale-95 transition-all border border-amber-300 animate-bounce-short cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm animate-spin">🪙</span>
                      <span>THU TIỀN:</span>
                    </span>
                    <span className="bg-white/95 px-2 py-0.2 rounded-md text-amber-900 font-black shadow-2xs">
                      +{(currentRecipe.basePrice + (activeOrder.calculatedTip || 0)).toLocaleString('vi-VN')}đ (Tip: {(activeOrder.calculatedTip || 0).toLocaleString('vi-VN')}đ) ✨
                    </span>
                  </button>
                ) : activeOrder.state === 'eating' ? (
                  /* THANH TIẾN ĐỘ ĂN UỐNG */
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-black text-[#E91E63] shrink-0">
                      ĐANG ĂN 😋
                    </span>
                    <div className="flex-1 bg-[#FFE6EE] h-2 rounded-full overflow-hidden border border-[#FFCCD9] p-0.2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6584] to-[#FFA07A] transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((activeOrder.maxEatingTimer! - (activeOrder.eatingTimer ?? 0)) /
                                (activeOrder.maxEatingTimer || 10)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-black text-[#E91E63] shrink-0">
                      còn {Math.ceil(activeOrder.eatingTimer || 0)}s
                    </span>
                  </div>
                ) : (
                  /* THANH KIÊN NHẪN */
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-black text-[#5C3A33] shrink-0">
                      KIÊN NHẪN
                    </span>
                    <div className="flex-1 bg-[#E2E8F0] h-2 rounded-full overflow-hidden border border-[#CBD5E1] p-0.2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          activeOrder.patienceRemaining / activeOrder.maxPatience > 0.4
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                            : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{
                          width: `${Math.round(
                            (activeOrder.patienceRemaining / activeOrder.maxPatience) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    {activeOrder.state === 'cooking' && (
                      <span className="text-[7.5px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded-md font-black shrink-0 animate-pulse">
                        Nấu {Math.round(activeOrder.cookingProgress || 0)}%
                      </span>
                    )}
                    {activeOrder.state === 'ready' && (
                      <span className="text-[7.5px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-md font-black shrink-0 animate-bounce">
                        Chờ bưng 🍽️
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (!isShopOpen || gameState.dayPhase === 'morning_prep') ? (
          /* PHA 1: BẢN TIN SÁNG & CHUẨN BỊ MỞ CỬA */
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-50/90 via-[#FFF9FA] to-orange-50/70 border border-amber-200 rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5 font-black text-amber-950 text-xs">
                <span className="text-base animate-bounce-short">🌅</span>
                <span>BẢN TIN SÁNG - NGÀY {gameState.day} ({gameState.shopName})</span>
              </div>
              <span className="text-[9px] bg-white px-2 py-0.5 rounded-full font-bold border border-amber-200 text-amber-900 shadow-2xs">
                {gameState.weather === 'rainy' ? '🌧️ Mưa Rào' : gameState.weather === 'breezy' ? '🍃 Mát Mẻ' : '☀️ Nắng Ráo'}
              </span>
            </div>

            <p className="text-[10px] text-amber-900 leading-snug">
              {gameState.morningBriefing?.weatherHeadline || 'Trời nắng trong lành, buổi trưa oi bức.'}{' '}
              <strong className="text-rose-700">{gameState.morningBriefing?.marketHeadline}</strong>
            </p>

            {gameState.morningBriefing?.warningAlert && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 px-2 py-0.8 rounded-lg text-[9.5px] font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>{gameState.morningBriefing.warningAlert}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('market')}
                  className="px-2 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-50 text-[10px] shadow-2xs cursor-pointer active:scale-95"
                >
                  🛒 Đi Chợ Sỉ
                </button>
                <button
                  onClick={() => openModal('menuPricing')}
                  className="px-2 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-50 text-[10px] shadow-2xs cursor-pointer active:scale-95"
                >
                  📋 Chỉnh Giá
                </button>
              </div>

              <button
                onClick={openStoreForDay}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer animate-pulse"
              >
                <span>🚀 MỞ CỬA BÁN HÀNG</span>
              </button>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI CHỜ KHÁCH DỄ THƯƠNG */
          <div className="py-2.5 flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] border-2 border-[#FFCCD9] flex items-center justify-center text-xl shadow-inner shrink-0 animate-bubble-wiggle">
              🫖
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-black text-[#5C3A33] flex items-center gap-1">
                <span>Quán Đang Mở Cửa Đón Khách</span>
                <span className="text-pink-500 animate-bounce">🌸</span>
              </div>
              <div className="text-[9.5px] text-[#8C6258] mt-0.5">
                Khách đang kéo tới bàn, chuẩn bị phục vụ nhé chủ quán!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. BÀN CHẾ BIẾN & THIẾT BỊ NẤU ĐẶC TRƯNG (PORCELAIN WORKBENCH) */}
      <div className="flex-1 min-h-[180px] max-h-[270px] rounded-2xl sm:rounded-3xl border-2 border-[#FFCCD9] p-2 sm:p-2.5 shadow-[0_4px_16px_rgba(255,168,197,0.14)] relative flex flex-col justify-between bg-white/95 overflow-hidden">
        {/* Nền bàn gỗ ấm cúng */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${WORKBENCH_BG_IMAGE})` }}
        />

        {/* Header trên thớt */}
        <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-[10.5px] font-black pb-1 border-b border-[#FFEBF0]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base animate-bounce-short">{currentRest.equipmentIcon}</span>
            <span className="font-black text-[#5C3A33] truncate">{currentRest.equipmentName}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:inline text-[9px] font-bold text-[#9C7C75]">Đọc order → tự chọn</span>
            {Object.values(selectedIngredients).some((qty) => (qty || 0) > 0) && (
              <button
                onClick={clearCuttingBoard}
                className="text-rose-600 hover:text-rose-700 px-1.5 py-0.5 rounded-xl border border-[#FFCCD9] bg-[#FFF0F5] text-[8.5px] font-bold flex items-center gap-0.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Làm lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Trung tâm thớt: Đĩa sứ & Topping nhảy vào */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center my-0.5">
          {activeOrder && currentRecipe ? (
            <div className="flex flex-col items-center justify-center gap-0.5 w-full">
              <div className="relative flex items-center justify-center">
                {/* Đĩa sứ tròn xinh xắn */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-white via-[#FFF8FA] to-[#FFEBF2] border-2 border-[#FFCCD9] shadow-[0_5px_18px_rgba(255,168,197,0.22)] flex items-center justify-center relative overflow-hidden group">
                  {/* Món ăn minh họa chân thực ở giữa */}
                  {activeDishImage ? (
                    <img
                      src={activeDishImage}
                      alt={currentRecipe.name}
                      className="w-full h-full object-cover animate-fade-in transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-3xl sm:text-4xl drop-shadow-xs select-none animate-bounce-short">
                      {currentRecipe.category === 'drink' ? '🥤' : currentRecipe.icon}
                    </div>
                  )}

                  {/* Nguyên liệu đã chọn */}
                  <div className="absolute top-1 right-1 flex flex-wrap gap-0.5 max-w-[88px] pointer-events-none z-10">
                    {Object.entries(selectedIngredients)
                      .filter(([, qty]) => (qty || 0) > 0)
                      .map(([id, qty]) => (
                        <span
                          key={id}
                          className="relative bg-white/95 p-1 rounded-lg border border-[#FFCCD9] shadow-2xs animate-fade-in flex items-center justify-center"
                        >
                          <IngredientIcon
                            id={id}
                            size={17}
                            fallbackIcon={INGREDIENTS[id as IngredientId]?.icon}
                          />
                          {(qty || 0) > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-[#FF6584] text-white text-[8px] font-black flex items-center justify-center">
                              ×{qty}
                            </span>
                          )}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

                            {/* Nhãn tiến độ & Tên món */}
              <div className="text-[10px] sm:text-[10.5px] font-black text-[#5C3A33] flex items-center gap-1 mt-0.5 max-w-full truncate">
                <span className="truncate">{currentRecipe.name}</span>
                <span className="text-[#D81B60] bg-[#FFF0F5] border border-[#FFCCD9] px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 shadow-2xs">
                  {pickedRequiredCount}/{requiredCount} nguyên liệu
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-[#8C6258] font-medium flex flex-col items-center gap-0.5">
              <div className="text-2xl animate-bounce-short drop-shadow-2xs">🍳✨</div>
              <span className="text-[10px] font-bold">Chạm khay nguyên liệu bên dưới để chuẩn bị món ngon nhé! 👆</span>
            </div>
          )}
        </div>

        {/* Nút hành động chính: HOÀN THÀNH HOẶC BƯNG RA BÀN */}
        <div className="pt-0.5">
          {activeOrder ? (
            activeOrder.state === 'cooking' ? (
              <div className="w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 border border-amber-300 animate-pulse">
                <span className="animate-spin text-sm">🍳</span>
                <span>
                  {activeOrder.chefName || 'Đầu bếp'} ĐANG NẤU ({Math.round(activeOrder.cookingProgress || 0)}%)
                </span>
              </div>
            ) : activeOrder.state === 'ready' ? (
              <button
                onClick={() => handleServeDish(activeOrder)}
                className="w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-white font-black text-xs sm:text-sm shadow-[0_4px_14px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 active:scale-95 animate-bounce-short transition-all border border-white/60 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="truncate">
                  {activeServers.length > 0
                    ? `PHỤC VỤ ĐANG BƯNG (HOẶC BẤM BƯNG NGAY ⚡)`
                    : `BƯNG RA BÀN ${activeOrder.tableIndex} (THU TIỀN + TIP 💰)`}
                </span>
              </button>
            ) : activeOrder.state === 'paying' ? (
              <button
                onClick={() => handleCollectPayment(activeOrder)}
                className="w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 text-amber-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-95 animate-bounce-short transition-all border border-amber-300 cursor-pointer"
              >
                <span className="text-sm animate-spin">🪙</span>
                <span className="truncate">
                  BẤM THU TIỀN: {(playerPrice + (activeOrder.calculatedTip || 0)).toLocaleString('vi-VN')}đ (Tip: {(activeOrder.calculatedTip || 0).toLocaleString('vi-VN')}đ) ✨
                </span>
              </button>
            ) : activeOrder.state === 'eating' ? (
              <div className="w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FFF0F5] border-2 border-[#FFCCD9] text-[#D81B60] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs">
                <span className="text-sm animate-bounce-short">😋</span>
                <span className="truncate">Khách đang thưởng thức tại Bàn {activeOrder.tableIndex}... (còn {Math.ceil(activeOrder.eatingTimer || 0)}s)</span>
              </div>
            ) : (
              <button
                onClick={handleCookCurrent}
                disabled={totalSelectedCount === 0 || !isStockAvailable()}
                className={`w-full min-h-11 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(255,101,132,0.3)] transition-all active:scale-95 border cursor-pointer ${
                  totalSelectedCount > 0 && isStockAvailable()
                    ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] hover:brightness-105 text-white border-white/60'
                    : !isStockAvailable()
                    ? 'bg-[#FFF0F5] text-[#E91E63] border-[#FFCCD9]'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="truncate">
                  {!hasMatchedRecipe()
                    ? `Chạm nguyên liệu bên dưới (${pickedRequiredCount}/{requiredCount})`
                    : !isStockAvailable()
                    ? 'Kho thiếu nguyên liệu! Bấm Chợ mua sỉ 🛒'
                    : `HOÀN THÀNH MÓN ${currentRecipe?.name.toUpperCase()} · ${totalSelectedCount} phần`}
                </span>
              </button>
            )
          ) : (
            <div className="py-2 text-center text-[11px] font-bold text-[#8C6258] bg-[#FFF0F5] rounded-xl border border-dashed border-[#FFCCD9]">
              🌸 Bếp sạch sẽ, hãy mở cửa để phục vụ khách nhé!
            </div>
          )}
        </div>
      </div>

      {/* 3. KHAY NGUYÊN LIỆU CUỘN NGANG TIỆN TAY (PORCELAIN RAMEKINS TRAY - NHỎ GỌN, VỪA TẦM) */}
      <div className="shrink-0 space-y-1">
        {/* Header Tab: Món chính vs Đồ uống */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveIngredientTab('food');
              }}
              className={`min-h-9 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeIngredientTab === 'food'
                  ? 'bg-gradient-to-r from-[#FF6584] to-[#FF8EA3] text-white shadow-2xs border border-white/60'
                  : 'bg-white border-2 border-[#FFCCD9] text-[#8C6258] hover:bg-[#FFF0F5]'
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
              className={`min-h-9 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeIngredientTab === 'drink'
                  ? 'bg-gradient-to-r from-[#FF6584] to-[#FF8EA3] text-white shadow-2xs border border-white/60'
                  : 'bg-white border-2 border-[#FFCCD9] text-[#8C6258] hover:bg-[#FFF0F5]'
              }`}
            >
              <span>🧋</span>
              <span>Đồ Uống</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {deliveryOrders.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  openModal('delivery');
                }}
                className="py-0.5 px-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:brightness-105 text-white font-black text-[9.5px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all animate-pulse border border-white/60 cursor-pointer"
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
              className="text-[9.5px] font-black text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 hover:brightness-105 px-2 py-0.5 rounded-xl cursor-pointer flex items-center gap-1 border border-amber-300 shadow-2xs active:scale-95 transition-all"
              title="Mở chợ mua sỉ nguyên liệu"
            >
              <ShoppingBag className="w-3 h-3 text-amber-800" />
              <span>Chợ Sỉ 🛒</span>
            </button>
          </div>
        </div>

        {/* Khay nguyên liệu 5 cột — tối ưu mobile và thao tác một tay. */}
        <div className="grid grid-cols-5 gap-1.5 py-0.5 px-0.5 max-h-[166px] overflow-y-auto no-scrollbar">
          {currentIngredientsList.map((item) => {
            const stock = gameState.inventory[item.id] ?? 0;
            const selectedQty = selectedIngredients[item.id] || 0;
            const isPicked = selectedQty > 0;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (stock <= 0) {
                    openModal('market');
                  } else {
                    addIngredient(item.id);
                  }
                }}
                className={`h-[78px] sm:h-[84px] rounded-2xl border-2 flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all active:scale-95 relative select-none shadow-[0_2px_8px_rgba(255,168,197,0.12)] ${
                  isPicked
                    ? 'bg-gradient-to-b from-[#FFF0F5] to-[#FFE4EC] border-[#FF6584] ring-2 ring-[#FFA8C5] shadow-xs'
                    : 'bg-white border-[#FFCCD9] hover:border-[#FFA8C5]'
                }`}
              >
                {/* Không tiết lộ đáp án; chỉ báo nguyên liệu người chơi đã tự chọn. */}
                {isPicked && (
                  <div className="absolute top-0.5 left-0.5 z-10 flex items-center gap-0.5">
                    <span className="bg-emerald-500 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                      ✓ ×{selectedQty}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeIngredient(item.id);
                      }}
                      className="w-5 h-5 rounded-full bg-white border border-rose-300 text-rose-600 text-xs font-black flex items-center justify-center shadow-2xs active:scale-90"
                      aria-label={`Bớt 1 ${item.name}`}
                    >
                      −
                    </button>
                  </div>
                )}

                                {/* Huy hiệu số lượng kho */}
                <span
                  className={`absolute top-0.5 right-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-full border shadow-2xs ${
                    stock > 0
                      ? 'bg-[#FFF0F5] text-[#D81B60] border-[#FFCCD9]'
                      : 'bg-rose-500 text-white border-white animate-bounce'
                  }`}
                >
                  {stock > 0 ? stock : 'Hết ❌'}
                </span>

                {/* Icon nguyên liệu vector sắc nét */}
                <div className="mt-0.5 flex items-center justify-center shrink-0 drop-shadow-2xs">
                  <IngredientIcon id={item.id} size={30} fallbackIcon={item.icon} />
                </div>

                {/* Tên nguyên liệu */}
                <div className="text-[10.5px] sm:text-[11px] font-black text-[#5C3A33] text-center truncate max-w-full leading-none">
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
