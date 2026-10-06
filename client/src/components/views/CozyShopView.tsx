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
  Zap,
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

  // Khay nguyên liệu đang chọn trên thớt
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});

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

  // Chạm khay nguyên liệu để thêm/bỏ trên thớt
  const toggleIngredient = (ingId: string) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
  };

  // Nút Nấu Nhanh 1 Chạm: tự động cho đủ nguyên liệu theo công thức kèm yêu cầu tùy biến của khách
  const handleQuickFill = () => {
    if (!currentRecipe) return;
    soundManager.playClick();
    const newPicked: Record<string, boolean> = {};
    const removed = activeOrder?.removedIngredients || [];
    const extra = activeOrder?.extraIngredients || [];

    for (const req of currentRecipe.requiredIngredients) {
      if (!removed.includes(req)) {
        newPicked[req] = true;
      }
    }
    for (const ex of extra) {
      newPicked[ex] = true;
    }

    setSelectedIngredients(newPicked);
  };

  const clearCuttingBoard = () => {
    soundManager.playClick();
    setSelectedIngredients({});
  };

  const hasMatchedRecipe = () => {
    if (!currentRecipe) return false;
    const removed = activeOrder?.removedIngredients || [];
    const extra = activeOrder?.extraIngredients || [];
    const expected = currentRecipe.requiredIngredients
      .filter((id) => !removed.includes(id))
      .concat(extra);

    if (Object.values(selectedIngredients).filter(Boolean).length === 0) return false;
    return expected.every((req) => selectedIngredients[req]);
  };

  const isStockAvailable = () => {
    if (!currentRecipe) return false;
    const extra = activeOrder?.extraIngredients || [];
    const checkList = [...currentRecipe.requiredIngredients, ...extra];
    for (const req of checkList) {
      if ((gameState.inventory[req] || 0) <= 0) return false;
    }
    return true;
  };

  // Nấu xong món trên thớt
  const handleCookCurrent = () => {
    if (!activeOrder || !currentRecipe) return;

    const prepList = Object.keys(selectedIngredients).filter(
      (k) => selectedIngredients[k]
    ) as IngredientId[];

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

  // Đếm số nguyên liệu cần đã chọn
  const requiredCount = currentRecipe?.requiredIngredients.length || 0;
  const pickedRequiredCount =
    currentRecipe?.requiredIngredients.filter((id) => selectedIngredients[id]).length || 0;

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
                  <span className="bg-[#FF6584] text-white text-[7.5px] sm:text-[8px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                    Bàn {activeOrder.tableIndex}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-[#5C3A33] truncate">
                    {currentRecipe.name}
                  </span>
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-black text-[#E91E63] shrink-0">
                  {currentRecipe.basePrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Hàng 2: Hình món & Lời thoại + Biến tấu đặc biệt */}
              <div className="flex items-center gap-1.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFF0F5] border border-[#FFCCD9] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {activeDishImage ? (
                    <img
                      src={activeDishImage}
                      alt={currentRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{currentRecipe.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-[8.5px] sm:text-[9.5px] leading-tight">
                  {(activeOrder.customTag || (activeOrder.orderNotes && activeOrder.orderNotes.length > 0)) && (
                    <div className="mb-0.5 flex flex-wrap gap-1">
                      {activeOrder.customTag && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                          🏷️ {activeOrder.customTag}
                        </span>
                      )}
                      {activeOrder.orderNotes?.map((note, idx) => (
                        <span key={idx} className="bg-rose-100 text-rose-800 border border-rose-300 text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                          {note}
                        </span>
                      ))}
                    </div>
                  )}

                  {activeOrder.state === 'eating' ? (
                    <div className="text-emerald-700 font-bold italic line-clamp-2">
                      "Ngon quá trời luôn! Nóng sốt vừa miệng quá chú quán ơi~ 😋"
                    </div>
                  ) : activeOrder.state === 'paying' ? (
                    <div className="text-amber-800 font-bold line-clamp-2">
                      "Bữa ăn ngon lắm! Cho mình gửi tiền thanh toán nha chú quán ⭐"
                    </div>
                  ) : (
                    <div className="italic text-[#8C6258] line-clamp-2">
                      "{activeOrder.dialogue || 'Nóng giòn, vừa miệng nha chủ quán!'}"
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
      <div className="flex-1 min-h-[140px] max-h-[220px] rounded-2xl sm:rounded-3xl border-2 border-[#FFCCD9] p-2 sm:p-2.5 shadow-[0_4px_16px_rgba(255,168,197,0.14)] relative flex flex-col justify-between bg-white/95 overflow-hidden">
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
            {currentRecipe && (
              <button
                onClick={handleQuickFill}
                className="px-2 py-0.5 bg-gradient-to-r from-amber-300 to-amber-400 hover:brightness-105 text-amber-950 rounded-xl text-[9px] font-black shadow-2xs flex items-center gap-0.5 active:scale-95 transition-all border border-amber-200 cursor-pointer"
                title="Tự động cho đủ nguyên liệu món đang gọi"
              >
                <Zap className="w-2.5 h-2.5 fill-current text-amber-800" />
                <span>Nấu Nhanh ⚡</span>
              </button>
            )}
            {Object.values(selectedIngredients).some(Boolean) && (
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-white via-[#FFF8FA] to-[#FFEBF2] border-2 border-[#FFCCD9] shadow-[0_3px_12px_rgba(255,168,197,0.22)] flex items-center justify-center relative overflow-hidden group">
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

                  {/* Topping nhảy vào quanh đĩa */}
                  <div className="absolute top-0.5 right-0.5 flex flex-wrap gap-0.5 max-w-[70px] pointer-events-none z-10">
                    {Object.keys(selectedIngredients)
                      .filter((k) => selectedIngredients[k])
                      .map((k) => (
                        <span
                          key={k}
                          className="bg-white/95 p-0.5 rounded-md border border-[#FFCCD9] shadow-2xs animate-fade-in flex items-center justify-center"
                        >
                          <IngredientIcon id={k} size={15} fallbackIcon={INGREDIENTS[k as IngredientId]?.icon} />
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Nhãn tiến độ & Tên món */}
              <div className="text-[10px] sm:text-[10.5px] font-black text-[#5C3A33] flex items-center gap-1 mt-0.5 max-w-full truncate">
                <span className="truncate">{currentRecipe.name}</span>
                {activeOrder?.customTag && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2 rounded-md text-[7.5px] sm:text-[8px] font-black shrink-0 shadow-2xs">
                    🏷️ {activeOrder.customTag}
                  </span>
                )}
                <span className="text-[#D81B60] bg-[#FFF0F5] border border-[#FFCCD9] px-1.5 py-0.2 rounded-full text-[8.5px] sm:text-[9px] font-black shrink-0 shadow-2xs">
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
                  BẤM THU TIỀN: {((currentRecipe?.basePrice || 0) + (activeOrder.calculatedTip || 0)).toLocaleString('vi-VN')}đ (Tip: {(activeOrder.calculatedTip || 0).toLocaleString('vi-VN')}đ) ✨
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
                disabled={!hasMatchedRecipe() || !isStockAvailable()}
                className={`w-full py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(255,101,132,0.3)] transition-all active:scale-95 border cursor-pointer ${
                  hasMatchedRecipe() && isStockAvailable()
                    ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] hover:brightness-105 text-white border-white/60 animate-pulse'
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
                    : `HOÀN THÀNH MÓN ${currentRecipe?.name.toUpperCase()} (3 ⚡)`}
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
              className={`px-2.5 py-0.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
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
              className={`px-2.5 py-0.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
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

        {/* Khay topping dạng cuộn ngang (Nhỏ gọn, chiều cao ~62-66px, không làm vỡ giao diện) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x px-0.5 scroll-smooth">
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
                className={`min-w-[62px] sm:min-w-[68px] h-[62px] sm:h-[66px] rounded-xl border-2 flex flex-col items-center justify-between p-1 cursor-pointer transition-all active:scale-95 relative shrink-0 select-none shadow-[0_2px_8px_rgba(255,168,197,0.12)] ${
                  isPicked
                    ? 'bg-gradient-to-b from-[#FFF0F5] to-[#FFE4EC] border-[#FF6584] ring-2 ring-[#FFA8C5] shadow-xs scale-102'
                    : isNeeded
                    ? 'bg-white border-amber-400 ring-2 ring-amber-200/90 shadow-2xs'
                    : 'bg-white border-[#FFCCD9] hover:border-[#FFA8C5]'
                }`}
              >
                {/* Badge Trạng thái: CẦN ⭐ hoặc ĐÃ CHỌN ✓ */}
                {isPicked ? (
                  <span className="absolute top-0.5 left-0.5 bg-emerald-500 text-white text-[6.5px] font-black px-1 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Check className="w-1.5 h-1.5 stroke-[3]" /> Cho
                  </span>
                ) : isNeeded ? (
                  <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white text-[6.5px] font-black px-1 rounded-full animate-pulse shadow-2xs">
                    Cần ⭐
                  </span>
                ) : null}

                {/* Huy hiệu số lượng kho */}
                <span
                  className={`absolute top-0.5 right-0.5 text-[7px] font-black px-1 rounded-full border shadow-2xs ${
                    stock > 0
                      ? 'bg-[#FFF0F5] text-[#D81B60] border-[#FFCCD9]'
                      : 'bg-rose-500 text-white border-white animate-bounce'
                  }`}
                >
                  {stock > 0 ? stock : 'Hết ❌'}
                </span>

                {/* Icon nguyên liệu vector sắc nét */}
                <div className="mt-0.5 flex items-center justify-center shrink-0 drop-shadow-2xs">
                  <IngredientIcon id={item.id} size={24} fallbackIcon={item.icon} />
                </div>

                {/* Tên nguyên liệu */}
                <div className="text-[9.5px] font-black text-[#5C3A33] text-center truncate max-w-full leading-none">
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
