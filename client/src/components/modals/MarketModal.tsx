import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { INGREDIENTS } from '../../../../shared/gameData';
import { IngredientId } from '../../../../shared/types';
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
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-[#FFD6E5] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Chợ Đầu Mối Nông Sản & Tạp Hóa</h2>
              <p className="text-xs text-[#9C7C75]">
                Chọn nguyên liệu tươi ngon với giá sỉ tốt nhất cho tiệm
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tình trạng kho */}
        <div className="bg-[#FFF7ED] px-6 py-2.5 border-b border-[#F7D7BA] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#7C5C55] font-bold">
            <Package className="w-4 h-4 text-amber-600" />
            <span>
              Sức chứa kho: {currentStorageUsed} / {gameState.storageCapacity}
            </span>
            {totalItemsInCart > 0 && (
              <span className={isOverStorage ? 'text-rose-500 font-black' : 'text-emerald-600 font-bold'}>
                (+{totalItemsInCart} dự kiến = {futureStorage}/{gameState.storageCapacity})
              </span>
            )}
          </div>
          <div className="font-extrabold text-[#7C5C55]">
            Ví tiền hiện có: <span className="text-[#F7A8C4]">{gameState.money.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Danh sách nguyên liệu */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(INGREDIENTS).map((ing) => {
            const stock = gameState.inventory[ing.id] || 0;
            const inCart = cart[ing.id] || 0;

            return (
              <div
                key={ing.id}
                className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-[#FFD6E5] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl bg-[#FFF1F6] p-2 rounded-xl border border-[#FFD6E5]">
                    {ing.icon}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#7C5C55] truncate">{ing.name}</h4>
                    <div className="text-xs font-black text-[#F7A8C4]">
                      {ing.cost.toLocaleString('vi-VN')} đ / phần
                    </div>
                    <div className="text-[11px] text-[#9C7C75] mt-0.5 font-semibold">
                      Hiện có trong kho: <span className="font-bold text-[#7C5C55]">{stock}</span>
                    </div>
                  </div>
                </div>

                {/* Bộ điều khiển số lượng */}
                <div className="flex items-center gap-1.5 bg-[#FFF7ED] p-1 rounded-xl border border-[#F7D7BA]">
                  <button
                    onClick={() => updateCartItem(ing.id, -1)}
                    disabled={inCart <= 0}
                    className="w-7 h-7 rounded-lg bg-white border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] disabled:opacity-40 hover:bg-rose-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-black text-xs text-[#7C5C55]">
                    {inCart}
                  </span>
                  <button
                    onClick={() => updateCartItem(ing.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#F7A8C4] flex items-center justify-center text-white hover:bg-[#f28bb1]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateCartItem(ing.id, 5)}
                    className="px-1.5 py-1 text-[10px] font-extrabold rounded-md bg-white text-[#7C5C55] border border-[#F7D7BA] hover:bg-[#FFD6E5]"
                    title="Thêm 5"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer thanh toán */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-t-2 border-[#FFD6E5] flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-[#9C7C75] font-bold">Tổng giỏ hàng ({totalItemsInCart} món):</div>
            <div className="text-xl font-black text-[#7C5C55]">
              {totalCost.toLocaleString('vi-VN')} <span className="text-sm">đ</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setCart({
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
                })
              }
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#7C5C55] bg-white border border-[#FFD6E5] hover:bg-slate-50"
            >
              Xóa Giỏ Hàng
            </button>
            <button
              onClick={handleCheckout}
              disabled={totalItemsInCart === 0 || !isAffordable || isOverStorage}
              className={`px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
                totalItemsInCart > 0 && isAffordable && !isOverStorage
                  ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white active:scale-95 shadow-pink-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isOverStorage
                  ? 'Kho Chứa Bị Đầy!'
                  : !isAffordable
                  ? 'Không Đủ Tiền Mặt!'
                  : 'Thanh Toán & Nhập Kho'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
