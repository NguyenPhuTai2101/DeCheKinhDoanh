import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, RECIPES, INGREDIENTS } from '../../../../shared/gameData';
import { RecipeId } from '../../../../shared/types';
import { calculateDishCOGS, calculateGrossProfit, calculateGrossMargin } from '../../../../shared/economy/pricing';
import { calculateDishDemand } from '../../../../shared/economy/demand';
import { getRecipeLearningCost } from '../../../../shared/progression/recipes';
import { soundManager } from '../../utils/soundManager';
import { X, CheckCircle, XCircle, TrendingUp, DollarSign, ChefHat, Tag, Info, AlertTriangle } from 'lucide-react';

export const MenuPricingModal: React.FC = () => {
  const { closeModal, gameState, setDishPrice, toggleActiveRecipe, learnRecipe } = useGameStore();

  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const menuSettings = gameState.menuSettings?.[activeRestId] || {
    activeRecipes: currentRest.primaryRecipeIds,
    prices: {},
  };

  const activeRecipes = menuSettings.activeRecipes || currentRest.primaryRecipeIds;
  const [selectedRecipeId, setSelectedRecipeId] = useState<RecipeId>(currentRest.primaryRecipeIds[0]);

  const selectedRecipe = RECIPES[selectedRecipeId];
  const basePrice = selectedRecipe?.basePrice || 30000;
  const playerPrice = menuSettings.prices?.[selectedRecipeId] ?? basePrice;
  const cogs = calculateDishCOGS(selectedRecipeId, gameState.marketPrices);
  const grossProfit = calculateGrossProfit(playerPrice, cogs);
  const grossMargin = calculateGrossMargin(playerPrice, cogs);

  const demandAnalysis = calculateDishDemand({
    recipeId: selectedRecipeId,
    playerPrice,
    rating: gameState.rating ?? 75,
    weather: gameState.weather ?? 'sunny',
    fame: gameState.fame ?? gameState.reputation ?? 10,
  });

  const isDishActive = activeRecipes.includes(selectedRecipeId);
  const learning = getRecipeLearningCost(activeRestId, selectedRecipeId);
  const learned = gameState.unlockedRecipes.includes(selectedRecipeId);

  const handleAdjustPrice = (delta: number) => {
    soundManager.playClick();
    const newPrice = Math.max(1000, playerPrice + delta);
    setDishPrice(activeRestId, selectedRecipeId, newPrice);
  };

  const handleToggleActive = (rId: RecipeId) => {
    soundManager.playClick();
    toggleActiveRecipe(activeRestId, rId);
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50 animate-fade-in select-none">
      <div role="dialog" aria-modal="true" aria-label="MenuPricing" className="game-modal-panel bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-rose-300 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[88vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight drop-shadow-2xs">
                Thực Đơn & Giá Bán
              </h2>
              <p className="text-[11px] text-pink-100 font-medium">
                Chọn món, xem giá vốn và lợi nhuận cho {currentRest.name}
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          {/* Lời khuyên thị trường */}
          <div className="bg-white p-3 rounded-2xl border border-pink-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <div className="text-[11px] text-[#6D4C41]">
                <strong className="text-[#E91E63]">Nguyên lý kinh doanh:</strong> Giá cao tăng biên lợi nhuận nhưng làm giảm nhu cầu của học sinh & dân văn phòng; giá thấp bán chạy nhưng coi chừng lỗ vốn nếu nguyên liệu tăng!
              </div>
            </div>
          </div>

          {/* Danh mục chọn món (Recipe Catalog -> Active Menu) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#5C3A33] flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#FF6584]" />
                <span>Danh Mục Món Ăn ({currentRest.shortName})</span>
              </span>
              <span className="text-[10.5px] font-bold text-[#8C6258]">
                Đang mở bán: <strong className="text-[#E91E63]">{activeRecipes.length}</strong>/{currentRest.primaryRecipeIds.length} món
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentRest.primaryRecipeIds.map((rId) => {
                const r = RECIPES[rId];
                if (!r) return null;
                const isActive = activeRecipes.includes(rId);
                const isSelected = selectedRecipeId === rId;
                const currentP = menuSettings.prices?.[rId] ?? r.basePrice;
                const dishCost = calculateDishCOGS(rId, gameState.marketPrices);
                const profit = currentP - dishCost;

                return (
                  <div
                    key={rId}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedRecipeId(rId);
                    }}
                    className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-400 shadow-sm'
                        : isActive
                        ? 'bg-white border-[#FFCCD9] hover:border-pink-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-lg">{r.icon}</span>
                        <span className="font-black text-xs text-[#5C3A33] truncate">{r.name}</span>
                      </div>
                      <button
                        disabled={!gameState.unlockedRecipes.includes(rId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(rId);
                        }}
                        title={!gameState.unlockedRecipes.includes(rId) ? 'Chưa học công thức' : isActive ? 'Đang bán (bấm để ngưng)' : 'Đang ngưng (bấm để bán)'}
                        className="cursor-pointer"
                      >
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] font-bold mt-1">
                      <span className="text-pink-600 font-black">{currentP.toLocaleString('vi-VN')}đ</span>
                      <span className={profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        Lãi: {profit.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chi tiết định giá của món đang chọn */}
          {selectedRecipe && (
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-rose-300 shadow-sm space-y-3">
              {!learned && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm"><p>Món mới · Cần tay nghề cấp {learning.requiredLevel}. Học xong, món sẽ xuất hiện trong đơn tại bàn và giao hàng.</p><button className="mt-2 rounded-xl bg-pink-500 text-white p-2 font-bold" disabled={gameState.player.cookingLevel < learning.requiredLevel || gameState.money < learning.cost} onClick={() => learnRecipe(activeRestId,selectedRecipeId)}>Học món · {learning.cost.toLocaleString('vi-VN')}đ</button></div>}
              <div className="flex items-center justify-between pb-2 border-b border-[#FFEBF0]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedRecipe.icon}</span>
                  <div>
                    <h3 className="font-black text-sm text-[#5C3A33]">{selectedRecipe.name}</h3>
                    <p className="text-[10px] text-[#8C6258]">{selectedRecipe.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-black bg-pink-100 text-pink-700">
                    {demandAnalysis.badge}
                  </span>
                  <button
                    onClick={() => handleToggleActive(selectedRecipeId)}
                    disabled={!learned}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      isDishActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {isDishActive ? 'Đang Mở Bán' : 'Tạm Dừng Bán'}
                  </button>
                </div>
              </div>

              {/* Bảng tính toán kinh tế F&B của món */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {/* Giá bán hiện tại */}
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-amber-800">Giá Bán Cửa Hàng</span>
                  <span className="font-black text-sm text-amber-950 mt-0.5">
                    {playerPrice.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[9px] text-amber-700">Gốc: {basePrice.toLocaleString('vi-VN')}đ</span>
                </div>

                {/* Giá vốn COGS */}
                <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-rose-800">Giá Vốn (COGS)</span>
                  <span className="font-black text-sm text-rose-950 mt-0.5">
                    {cogs.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[9px] text-rose-700">Nguyên liệu thị trường</span>
                </div>

                {/* Lợi nhuận gộp */}
                <div className={`p-2 rounded-xl border flex flex-col justify-center ${
                  grossProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <span className="text-[10px] font-bold text-emerald-800">Lợi Nhuận Gộp</span>
                  <span className={`font-black text-sm mt-0.5 ${
                    grossProfit >= 0 ? 'text-emerald-950' : 'text-red-700'
                  }`}>
                    {grossProfit.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[9px] text-emerald-700">Giá bán - Giá vốn</span>
                </div>

                {/* Biên lợi nhuận */}
                <div className="bg-purple-50 p-2 rounded-xl border border-purple-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-purple-800">Biên Lợi Nhuận</span>
                  <span className="font-black text-sm text-purple-950 mt-0.5">
                    {(grossMargin * 100).toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-purple-700">Gross Margin</span>
                </div>
              </div>

              {/* Công cụ điều chỉnh giá bán */}
              <div className="bg-[#FFF9FA] p-3 rounded-xl border border-[#FFD0DE] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#5C3A33] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-pink-500" />
                    <span>Điều Chỉnh Giá Bán:</span>
                  </span>
                  <span className="text-[11px] text-[#8C6258]">{demandAnalysis.description}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleAdjustPrice(-5000)}
                    className="flex-1 py-1 px-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-black border border-rose-200 active:scale-95 cursor-pointer"
                  >
                    -5.000đ
                  </button>
                  <button
                    onClick={() => handleAdjustPrice(-1000)}
                    className="flex-1 py-1 px-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-black border border-rose-200 active:scale-95 cursor-pointer"
                  >
                    -1.000đ
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setDishPrice(activeRestId, selectedRecipeId, basePrice);
                    }}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black active:scale-95 cursor-pointer"
                  >
                    Giá Gốc ({basePrice.toLocaleString('vi-VN')}đ)
                  </button>
                  <button
                    onClick={() => handleAdjustPrice(1000)}
                    className="flex-1 py-1 px-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black border border-emerald-200 active:scale-95 cursor-pointer"
                  >
                    +1.000đ
                  </button>
                  <button
                    onClick={() => handleAdjustPrice(5000)}
                    className="flex-1 py-1 px-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black border border-emerald-200 active:scale-95 cursor-pointer"
                  >
                    +5.000đ
                  </button>
                </div>
              </div>

              {/* Thành phần nguyên liệu và giá chợ thực tế */}
              <div className="text-[11px]">
                <span className="font-extrabold text-[#7C5046] block mb-1">Nguyên Liệu Cấu Thành Giá Vốn:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecipe.requiredIngredients.map((ingId) => {
                    const ing = INGREDIENTS[ingId];
                    if (!ing) return null;
                    const marketP = gameState.marketPrices?.[ingId] ?? ing.cost;
                    const diff = marketP - ing.cost;

                    return (
                      <span
                        key={ingId}
                        className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] text-slate-700 font-bold"
                      >
                        <span>{ing.icon}</span>
                        <span>{ing.name}:</span>
                        <span className="font-black">{marketP.toLocaleString('vi-VN')}đ</span>
                        {diff !== 0 && (
                          <span className={diff > 0 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                            ({diff > 0 ? '+' : ''}{diff.toLocaleString('vi-VN')}đ)
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
