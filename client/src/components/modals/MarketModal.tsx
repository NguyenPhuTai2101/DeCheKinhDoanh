import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { INGREDIENTS, RESTAURANT_TYPES, EMPLOYEES } from '../../../../shared/gameData';
import { IngredientId, ShopperPolicy } from '../../../../shared/types';
import { getIngredientCurrentPrice } from '../../../../shared/economy/pricing';
import { soundManager } from '../../utils/soundManager';
import { IngredientIcon } from '../common/IngredientIcon';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Package,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Bot,
  Truck,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Save,
} from 'lucide-react';

export const MarketModal: React.FC = () => {
  const { closeModal, gameState, buyIngredients, setShopperPolicy } = useGameStore();

  const [mainTab, setMainTab] = useState<'market' | 'shopper'>('market');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filterTab, setFilterTab] = useState<'current' | 'all' | 'protein' | 'carb' | 'veggie' | 'drink'>('current');

  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

  // Cấu hình Shopper Policy nội bộ
  const [policyForm, setPolicyForm] = useState<ShopperPolicy>(() => ({
    autoRestock: gameState.shopperPolicy?.autoRestock ?? true,
    autoBuyEnabled: gameState.shopperPolicy?.autoRestock ?? true,
    minStock: gameState.shopperPolicy?.minStock ?? 10,
    targetStock: gameState.shopperPolicy?.targetStock ?? 30,
    maxPriceMultiplier: gameState.shopperPolicy?.maxPriceMultiplier ?? 1.25,
  }));

  const [savedPolicyToast, setSavedPolicyToast] = useState(false);

  // Tìm nhân sự có thể làm Shopper (vai trò shopper hoặc manager)
  const hiredShoppers = gameState.hiredEmployees
    .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
    .filter((e) => e && (e.role === 'shopper' || e.role === 'manager'));

  const updateCartItem = (id: IngredientId, delta: number) => {
    soundManager.playClick();
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const getIngredientUnitPrice = (ingId: IngredientId) => {
    return getIngredientCurrentPrice(ingId, gameState.marketPrices, gameState.marketSpecial);
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

  const handleSavePolicy = () => {
    soundManager.playCoin();
    setShopperPolicy(policyForm);
    setSavedPolicyToast(true);
    setTimeout(() => setSavedPolicyToast(false), 2000);
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
                Mua nguyên liệu sỉ & cấu hình đội ngũ đi chợ tự động
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

        {/* Tab Switcher: Đi Chợ Trực Tiếp vs Tự Động Đi Chợ */}
        <div className="flex items-center bg-[#FFF9FA] border-b border-[#FFD6E5] px-3 py-1.5 gap-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              setMainTab('market');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              mainTab === 'market'
                ? 'bg-[#8D6E63] text-white shadow-xs'
                : 'bg-white text-[#7C5C55] border border-[#FFD6E5] hover:bg-amber-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đi Chợ Trực Tiếp</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setMainTab('shopper');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              mainTab === 'shopper'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chính Sách Tự Đi Chợ 🛵</span>
            {policyForm.autoRestock && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        {mainTab === 'market' ? (
          <>
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
                const basePrice = ing.cost;
                const priceDiffPercent = Math.round(((unitPrice - basePrice) / basePrice) * 100);

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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#7C5C55] truncate">
                            {ing.name}
                          </h4>
                          {/* Tag biến động giá thị trường */}
                          {priceDiffPercent < 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <TrendingDown className="w-2.5 h-2.5" />
                              {priceDiffPercent}% Rẻ
                            </span>
                          ) : priceDiffPercent > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              <TrendingUp className="w-2.5 h-2.5" />
                              +{priceDiffPercent}% Đắt
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                              Bình ổn
                            </span>
                          )}
                        </div>

                        {/* Giá và so sánh */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className={`text-xs font-black ${priceDiffPercent < 0 ? 'text-emerald-600' : priceDiffPercent > 0 ? 'text-rose-600' : 'text-[#7C5C55]'}`}>
                            {unitPrice.toLocaleString('vi-VN')} đ
                          </span>
                          {unitPrice !== basePrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {basePrice.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {isSpecial && (
                            <span className="bg-rose-500 text-white text-[8px] font-black px-1 rounded-full">
                              Giờ vàng -{gameState.marketSpecial?.discountPercent}%
                            </span>
                          )}
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
          </>
        ) : (
          /* TAB CẤU HÌNH SHOPPER POLICY (Mục 33) */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Banner giới thiệu Shopper Policy */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <span>Chính Sách Tiếp Tế & Đi Chợ Tự Động</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                      Mục 33 V2
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Shopper (nhân viên đi chợ) hoặc Quản Lý sẽ tự động theo dõi kho nguyên liệu. Khi món nào sắp hết, họ sẽ tự đến chợ đầu mối gom hàng với giá sỉ chiết khấu tốt nhất.
                  </p>
                </div>
              </div>

              {/* Trạng thái nhân sự phụ trách */}
              <div className="mt-3 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-emerald-900 font-bold">Nhân sự phụ trách:</span>
                {hiredShoppers.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hiredShoppers.map((s) => (
                      <span
                        key={s?.id}
                        className="bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-lg font-black text-[11px] shadow-2xs flex items-center gap-1"
                      >
                        <span>{s?.avatar}</span>
                        <span>{s?.name} ({s?.role === 'shopper' ? 'Đi chợ' : 'Quản lý'})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Chưa có Shopper (Hãy tuyển Tuấn Shipper ở mục Nhân Sự)
                  </span>
                )}
              </div>
            </div>

            {/* Cài đặt Bật / Tắt tự động đi chợ */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div>
                <h4 className="text-sm font-black text-slate-800">Bật Chế Độ Tự Động Đi Chợ</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cho phép nhân viên tự động trích quỹ mua bù nguyên liệu khi cạn kho
                </p>
              </div>
              <button
                onClick={() =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    autoRestock: !prev.autoRestock,
                    autoBuyEnabled: !prev.autoRestock,
                  }))
                }
                className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                  policyForm.autoRestock ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Cài đặt 1: Ngưỡng tồn kho kích hoạt mua (minStock) */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">
                    Ngưỡng Tồn Kho Tối Thiểu (minStock)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tự động đi chợ khi tồn kho của nguyên liệu giảm xuống dưới mức này
                  </p>
                </div>
                <span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {policyForm.minStock} cái
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {[5, 10, 15, 20, 30].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPolicyForm((prev) => ({ ...prev, minStock: val }))}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      policyForm.minStock === val
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Cài đặt 2: Mức tồn kho mục tiêu (targetStock) */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">
                    Mức Tồn Kho Mục Tiêu (targetStock)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Số lượng gom về kho cho mỗi đợt đi tiếp tế
                  </p>
                </div>
                <span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {policyForm.targetStock} cái
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {[20, 30, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPolicyForm((prev) => ({ ...prev, targetStock: val }))}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      policyForm.targetStock === val
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Cài đặt 3: Giá trần chấp nhận mua (maxPriceMultiplier) */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">
                    Giá Trần Thị Trường (Tránh Chém Giá)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Từ chối mua tự động nếu giá chợ bị đẩy lên vượt quá tỷ lệ này so với giá gốc
                  </p>
                </div>
                <span className="text-base font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  +{Math.round((policyForm.maxPriceMultiplier - 1) * 100)}% ({policyForm.maxPriceMultiplier}x)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {[
                  { mult: 1.0, label: '1.0x (Chỉ giá gốc/rẻ)' },
                  { mult: 1.15, label: '1.15x (Tăng tối đa +15%)' },
                  { mult: 1.25, label: '1.25x (Khuyên dùng +25%)' },
                  { mult: 1.5, label: '1.5x (Mua bằng mọi giá)' },
                ].map((item) => (
                  <button
                    key={item.mult}
                    onClick={() => setPolicyForm((prev) => ({ ...prev, maxPriceMultiplier: item.mult }))}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                      policyForm.maxPriceMultiplier === item.mult
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút Lưu Cài Đặt */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {savedPolicyToast && (
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã lưu chính sách thành công!
                </span>
              )}
              <div className="flex-1" />
              <button
                onClick={handleSavePolicy}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình Đi Chợ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketModal;
