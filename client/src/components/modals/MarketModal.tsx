import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { INGREDIENTS, RESTAURANT_TYPES } from '../../../../shared/gameData';
import { IngredientId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { IngredientIcon } from '../common/IngredientIcon';
import { X, ShoppingBag, Plus, Minus, Package, CheckCircle2, Filter } from 'lucide-react';

export const MarketModal: React.FC = () => {
  const { closeModal, gameState, buyIngredients } = useGameStore();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [filterTab, setFilterTab] = useState<'current' | 'all' | 'protein' | 'carb' | 'veggie' | 'drink'>('current');

  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

  const updateCartItem = (id: IngredientId, delta: number) => {
    soundManager.playClick();
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const getIngredientUnitPrice = (ingId: IngredientId) => {
    const ing = INGREDIENTS[ingId];
    if (!ing) return 0;
    if (gameState.marketSpecial && gameState.marketSpecial.ingredientId === ingId) {
      const discount = gameState.marketSpecial.discountPercent;
      return Math.round(ing.cost * (100 - discount) / 100);
    }
    return ing.cost;
  };

  const totalItemsInCart = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCost = Object.entries(cart).reduce((sum, [key, qty]) => {
    const unitPrice = getIngredientUnitPrice(key as IngredientId);
    return sum + unitPrice * qty;
  }, 0);

  const currentStorageUsed = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
  const futureStorage = currentStorageUsed + totalItemsInCart;
  const isOverStorage = futureStorage > gameState.storageCapacity;
  const isAffordable = gameState.money >= totalCost;

  const handleCheckout = () => {
    if (totalItemsInCart === 0) return;
    const itemsToBuy: Record<IngredientId, number> = {} as any;
    for (const [key, qty] of Object.entries(cart)) {
      if (qty > 0) itemsToBuy[key as IngredientId] = qty;
    }
    const success = buyIngredients(itemsToBuy, totalCost);
    if (success) {
      soundManager.playCoin();
      closeModal();
    }
  };

  // Lọc nguyên liệu theo Tab
  const displayedIngredients = Object.values(INGREDIENTS).filter((ing) => {
    if (filterTab === 'current') {
      return (
        currentRest.allowedIngredientIds.includes(ing.id) ||
        ing.category === 'beverage'
      );
    }
    if (filterTab === 'all') return true;
    if (filterTab === 'protein') return ing.category === 'meat';
    if (filterTab === 'carb') return ing.category === 'bakery';
    if (filterTab === 'veggie') return ing.category === 'veg';
    if (filterTab === 'drink') return ing.category === 'beverage';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-4 sm:px-6 py-3 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#7C5C55]">Chợ Đầu Mối Nông Sản</h2>
              <p className="text-[11px] text-[#9C7C75]">
                Mua nguyên liệu sỉ cho {currentRest.name} & chuỗi quán
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Khuyến Mãi Giờ Vàng Chợ Đầu Mối */}
        {gameState.marketSpecial && (
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-black shadow-xs shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base animate-bounce-short">🔥</span>
              <span className="truncate">{gameState.marketSpecial.newsText}</span>
            </div>
            <span className="bg-white text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ml-2 shadow-2xs">
              Giảm -{gameState.marketSpecial.discountPercent}%
            </span>
          </div>
        )}

        {/* Thanh trạng thái kho & tiền */}
        <div className="bg-[#FFF7ED] px-4 py-2 border-b border-[#F7D7BA] flex items-center justify-between text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1.5 text-[#7C5C55]">
            <Package className="w-4 h-4 text-amber-600" />
            <span>
              Kho: {currentStorageUsed}/{gameState.storageCapacity}
            </span>
            {totalItemsInCart > 0 && (
              <span className={isOverStorage ? 'text-rose-500 font-black' : 'text-emerald-600 font-bold'}>
                (+{totalItemsInCart})
              </span>
            )}
          </div>
          <div className="text-[#7C5C55]">
            Ví: <span className="text-[#F7A8C4] font-black">{gameState.money.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Thanh lọc phân loại nguyên liệu */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px] font-bold">
          <button
            onClick={() => setFilterTab('current')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              filterTab === 'current'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            <span>{currentRest.icon}</span>
            <span>{currentRest.shortName}</span>
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 ${
              filterTab === 'all'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            Tất Cả ({Object.keys(INGREDIENTS).length})
          </button>
          <button
            onClick={() => setFilterTab('protein')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 ${
              filterTab === 'protein'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            🥩 Thịt & Topping
          </button>
          <button
            onClick={() => setFilterTab('carb')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 ${
              filterTab === 'carb'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            🍜 Bánh & Bún Phở
          </button>
          <button
            onClick={() => setFilterTab('veggie')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 ${
              filterTab === 'veggie'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            🥬 Rau & Sốt
          </button>
          <button
            onClick={() => setFilterTab('drink')}
            className={`px-2.5 py-1 rounded-xl transition-all shrink-0 ${
              filterTab === 'drink'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            🧋 Đồ Uống
          </button>
        </div>

        {/* Danh sách nguyên liệu */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {displayedIngredients.map((ing) => {
            const stock = gameState.inventory[ing.id] || 0;
            const inCart = cart[ing.id] || 0;

            const isSpecial = gameState.marketSpecial?.ingredientId === ing.id;
            const unitPrice = getIngredientUnitPrice(ing.id);

            return (
              <div
                key={ing.id}
                className={`bg-white border-2 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all ${
                  isSpecial
                    ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-200'
                    : 'border-[#F2E8E5] hover:border-[#FFD6E5]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-12 bg-[#FFF1F6] rounded-2xl border border-[#FFD6E5] flex items-center justify-center shrink-0 shadow-inner relative">
                    <IngredientIcon id={ing.id} size={34} fallbackIcon={ing.icon} />
                    {isSpecial && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black px-1 rounded-full shadow-2xs">
                        🔥 SỈ
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#7C5C55] truncate">
                      {ing.name}
                    </h4>
                    {isSpecial ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-rose-600">
                          {unitPrice.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {ing.cost.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="bg-rose-500 text-white text-[8px] font-black px-1 rounded-full">
                          -{gameState.marketSpecial?.discountPercent}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs font-black text-[#F7A8C4]">
                        {ing.cost.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                    <div className="text-[10px] text-[#9C7C75]">
                      Hiện có: <span className="font-bold text-[#7C5C55]">{stock}</span>
                    </div>
                  </div>
                </div>

                {/* Bộ nút tăng giảm to dễ bấm trên mobile */}
                <div className="flex items-center gap-1 bg-[#FFF7ED] p-1 rounded-2xl border border-[#F7D7BA] shrink-0">
                  <button
                    onClick={() => updateCartItem(ing.id, -1)}
                    disabled={inCart <= 0}
                    className="w-8 h-8 rounded-xl bg-white border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] disabled:opacity-30 active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-[#7C5C55]">
                    {inCart}
                  </span>
                  <button
                    onClick={() => updateCartItem(ing.id, 1)}
                    className="w-8 h-8 rounded-xl bg-[#F7A8C4] flex items-center justify-center text-white active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateCartItem(ing.id, 5)}
                    className="px-2 py-1 text-[10px] font-extrabold rounded-xl bg-white text-[#7C5C55] border border-[#F7D7BA] active:scale-90"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer thanh toán dính ở đáy */}
        <div className="bg-[#FFF1F6] px-4 py-3 border-t-2 border-[#FFD6E5] flex items-center justify-between gap-2 shrink-0">
          <div>
            <div className="text-[10px] text-[#9C7C75] font-bold">Tổng ({totalItemsInCart} món):</div>
            <div className="text-base sm:text-lg font-black text-[#7C5C55]">
              {totalCost.toLocaleString('vi-VN')} <span className="text-xs">đ</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={totalItemsInCart === 0 || !isAffordable || isOverStorage}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
              totalItemsInCart > 0 && isAffordable && !isOverStorage
                ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-pink-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isOverStorage
                ? 'Kho Bị Đầy!'
                : !isAffordable
                ? 'Thiếu Tiền!'
                : 'Thanh Toán'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
