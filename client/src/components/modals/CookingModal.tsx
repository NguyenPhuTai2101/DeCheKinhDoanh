import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RECIPES, INGREDIENTS } from '../../../../shared/gameData';
import { RecipeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import {
  X,
  BookOpen,
  Utensils,
  ShoppingBag,
  Sparkles,
  Clock,
  Coins,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CookingModal: React.FC = () => {
  const {
    closeModal,
    openModal,
    gameState,
    setCurrentView,
    showToast,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'all' | 'food' | 'drink'>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<RecipeId>('banh_mi_trung');

  const allRecipes = Object.values(RECIPES);
  const filteredRecipes = allRecipes.filter((r) => {
    if (activeTab === 'all') return true;
    return r.category === activeTab;
  });

  const selectedRecipe = RECIPES[selectedRecipeId] || allRecipes[0];

  // Tính chi phí nguyên liệu và kiểm tra tồn kho
  const calcIngredientCost = (recipe: typeof selectedRecipe) => {
    return recipe.requiredIngredients.reduce((total, ingId) => {
      const ing = INGREDIENTS[ingId];
      return total + (ing ? ing.cost : 0);
    }, 0);
  };

  const checkHasAllStock = (recipe: typeof selectedRecipe) => {
    return recipe.requiredIngredients.every((ingId) => (gameState.inventory[ingId] || 0) > 0);
  };

  const handleGoToKitchen = (recipeName: string) => {
    soundManager.playClick();
    closeModal();
    setCurrentView('shop');
    showToast(`🍳 Đã vào bếp! Bạn có thể chế biến món ${recipeName} ngay trên thớt.`);
  };

  const handleGoToMarket = () => {
    soundManager.playClick();
    openModal('market');
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up"
      >
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-4 sm:px-6 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#7C5C55] flex items-center gap-1.5">
                <span>Sổ Tay Công Thức Món Ăn</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                  {allRecipes.length} Món
                </span>
              </h2>
              <p className="text-[11px] text-[#9C7C75]">
                Thực đơn vỉa hè, định lượng nguyên liệu & biên lợi nhuận
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 active:scale-90 transition-all shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thanh Tab Danh Mục (Tất cả, Bánh mì, Đồ uống) */}
        <div className="px-4 py-2 bg-white/80 border-b border-[#F7D7BA]/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 ${
                activeTab === 'all'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-[#FFF7ED] text-[#7C5C55] hover:bg-rose-100'
              }`}
            >
              Tất Cả ({allRecipes.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('food');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 ${
                activeTab === 'food'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-[#FFF7ED] text-[#7C5C55] hover:bg-rose-100'
              }`}
            >
              🥖 Bánh Mì ({allRecipes.filter((r) => r.category === 'food').length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('drink');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 ${
                activeTab === 'drink'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-[#FFF7ED] text-[#7C5C55] hover:bg-rose-100'
              }`}
            >
              🧋 Đồ Uống ({allRecipes.filter((r) => r.category === 'drink').length})
            </button>
          </div>

          <button
            onClick={handleGoToMarket}
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
            <span>Chợ Sỉ 🛒</span>
          </button>
        </div>

        {/* Nội dung chính: Danh sách món ăn chi tiết */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 no-scrollbar">
          {filteredRecipes.map((r) => {
            const ingCost = calcIngredientCost(r);
            const profit = r.basePrice - ingCost;
            const profitMargin = Math.round((profit / r.basePrice) * 100);
            const hasAllIngredients = checkHasAllStock(r);

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border-2 border-[#FFD6E5] p-3 sm:p-4 shadow-2xs hover:shadow-sm transition-all"
              >
                {/* Dòng 1: Icon, Tên món, Giá bán & Lợi nhuận */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {r.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm sm:text-base text-[#7C5C55] truncate">
                        {r.name}
                      </h3>
                      <p className="text-[11px] text-[#9C7C75] line-clamp-1">
                        {r.description}
                      </p>
                    </div>
                  </div>

                  {/* Giá bán & EXP */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-rose-600 flex items-center justify-end gap-0.5">
                      <span>{r.basePrice.toLocaleString('vi-VN')}</span>
                      <span className="text-[10px] font-bold">đ</span>
                    </div>
                    <div className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-1">
                      <span>⭐ +{r.expGain} EXP</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-extrabold">Lời {profitMargin}%</span>
                    </div>
                  </div>
                </div>

                {/* Dòng 2: Danh sách nguyên liệu cần thiết & Trạng thái tồn kho */}
                <div className="bg-[#FFF9F2] rounded-xl p-2.5 border border-[#F7D7BA] mb-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#7C5C55] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-600" />
                      <span>Nguyên liệu cấu thành:</span>
                    </span>
                    <span className={hasAllIngredients ? 'text-emerald-600 font-extrabold flex items-center gap-0.5' : 'text-rose-500 font-extrabold flex items-center gap-0.5'}>
                      {hasAllIngredients ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đủ trong kho</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Thiếu đồ</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.requiredIngredients.map((ingId) => {
                      const ing = INGREDIENTS[ingId];
                      const stock = gameState.inventory[ingId] || 0;
                      const inStock = stock > 0;

                      return (
                        <div
                          key={ingId}
                          className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                            inStock
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          <span>{ing?.icon || '📦'}</span>
                          <span>{ing?.name || ingId}</span>
                          <span
                            className={`text-[10px] font-extrabold px-1 py-0.2 rounded-md ml-0.5 ${
                              inStock
                                ? 'bg-emerald-200/80 text-emerald-950'
                                : 'bg-rose-200/80 text-rose-950'
                            }`}
                          >
                            {stock > 0 ? `${stock}` : 'Hết'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dòng 3: Thống kê chi phí & Nút hành động */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span className="flex items-center gap-1" title="Chi phí nguyên liệu">
                      <Coins className="w-3 h-3 text-amber-500" />
                      Vốn: <b>{ingCost.toLocaleString('vi-VN')} đ</b>
                    </span>
                    <span className="flex items-center gap-1" title="Lợi nhuận mỗi món">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      Lãi: <b className="text-emerald-600">+{profit.toLocaleString('vi-VN')} đ</b>
                    </span>
                    <span className="hidden sm:flex items-center gap-1" title="Thời gian chế biến">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {r.cookingTimeMs / 1000}s
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!hasAllIngredients ? (
                      <button
                        onClick={handleGoToMarket}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Mua Đồ</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGoToKitchen(r.name)}
                        className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-105 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>Vào Bếp Nấu</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
