import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { INGREDIENTS } from '../../../../shared/gameData';
import { IngredientId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { X, ShoppingBag, Plus, Minus, Package, CheckCircle2 } from 'lucide-react';

export const MarketModal: React.FC = () => {
  const { closeModal, gameState, buyIngredients } = useGameStore();

  const [cart, setCart] = useState<Record<IngredientId, number>>({
    bread: 0,
    egg: 0,
    pork: 0,
    pate: 0,
    cucumber: 0,
    herb: 0,
    tea: 0,
    milk: 0,
    condensed_milk: 0,
    coffee: 0,
  });

  const updateCartItem = (id: IngredientId, delta: number) => {
    soundManager.playClick();
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const totalItemsInCart = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCost = Object.entries(cart).reduce((sum, [key, qty]) => {
    const ing = INGREDIENTS[key as IngredientId];
    return sum + (ing ? ing.cost * qty : 0);
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
                Mua nguyên liệu bổ sung cho kho hàng
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

        {/* Danh sách nguyên liệu */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {Object.values(INGREDIENTS).map((ing) => {
            const stock = gameState.inventory[ing.id] || 0;
            const inCart = cart[ing.id] || 0;

            return (
              <div
                key={ing.id}
                className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 hover:border-[#FFD6E5] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl sm:text-3xl bg-[#FFF1F6] p-1.5 sm:p-2 rounded-xl border border-[#FFD6E5] shrink-0">
                    {ing.icon}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#7C5C55] truncate">
                      {ing.name}
                    </h4>
                    <div className="text-xs font-black text-[#F7A8C4]">
                      {ing.cost.toLocaleString('vi-VN')} đ
                    </div>
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
