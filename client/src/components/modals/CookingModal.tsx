import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RECIPES, INGREDIENTS } from '../../../../shared/gameData';
import { RecipeId, IngredientId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { X, Check, Utensils, Sparkles } from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';


export const CookingModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    completeCooking,
    selectedTableForCooking,
  } = useGameStore();

  const [selectedRecipeId, setSelectedRecipeId] = useState<RecipeId>('banh_mi_trung');
  const [selectedIngredients, setSelectedIngredients] = useState<Record<IngredientId, boolean>>({
    bread: true,
    egg: true,
    cucumber: true,
    pork: false,
    pate: false,
    herb: false,
    tea: false,
    milk: false,
    condensed_milk: false,
    coffee: false,
  });

  const recipe = RECIPES[selectedRecipeId];

  const handleSelectRecipe = (id: RecipeId) => {
    soundManager.playClick();
    setSelectedRecipeId(id);
    const targetRecipe = RECIPES[id];
    const newSelected: Record<IngredientId, boolean> = {
      bread: false,
      egg: false,
      cucumber: false,
      pork: false,
      pate: false,
      herb: false,
      tea: false,
      milk: false,
      condensed_milk: false,
      coffee: false,
    };
    targetRecipe.requiredIngredients.forEach((ing) => {
      newSelected[ing] = true;
    });
    setSelectedIngredients(newSelected);
  };

  const toggleIngredient = (ingId: IngredientId) => {
    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
  };

  const hasMatchedRecipe = () => {
    for (const req of recipe.requiredIngredients) {
      if (!selectedIngredients[req]) return false;
    }
    for (const [key, val] of Object.entries(selectedIngredients)) {
      if (val && !recipe.requiredIngredients.includes(key as IngredientId)) {
        return false;
      }
    }
    return true;
  };

  const isStockAvailable = () => {
    for (const req of recipe.requiredIngredients) {
      if ((gameState.inventory[req] || 0) <= 0) return false;
    }
    return true;
  };

  const handleFinishCooking = () => {
    const tableIndex = selectedTableForCooking || 1;
    completeCooking(selectedRecipeId, tableIndex);
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍳</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#7C5C55]">Góc Bếp Nấu Ăn</h2>
              <p className="text-[11px] text-[#9C7C75]">
                {selectedTableForCooking
                  ? `Đang nấu cho Bàn số ${selectedTableForCooking}`
                  : 'Chọn nguyên liệu đúng theo công thức rồi bấm Hoàn thành'}
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

        {/* Thanh cuộn ngang chọn món trên Mobile */}
        <HorizontalScrollBox
          showArrows={true}
          className="px-3 py-2 bg-[#FFF7ED] border-b border-[#F7D7BA] flex items-center gap-2 shrink-0 scrollbar-none"
        >
          {Object.values(RECIPES).map((item) => {
            const isSelected = item.id === selectedRecipeId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectRecipe(item.id)}
                className={`px-3 py-1.5 rounded-2xl border-2 shrink-0 flex items-center gap-1.5 transition-all active:scale-95 text-xs font-bold ${
                  isSelected
                    ? 'bg-[#F7A8C4] text-white border-[#F7A8C4] shadow-sm'
                    : 'bg-white text-[#7C5C55] border-[#F2E8E5]'
                }`}
              >
                <span>{item.icon}</span>
                <span className="whitespace-nowrap">{item.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-[#F7A8C4]'}`}>
                  ({item.basePrice.toLocaleString('vi-VN')}đ)
                </span>
              </button>
            );
          })}
        </HorizontalScrollBox>


        {/* Khu vực chọn nguyên liệu */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          <div className="bg-[#FFF1F6] p-3 rounded-2xl border border-[#FFD6E5] flex items-center gap-3">
            <span className="text-3xl">{recipe.icon}</span>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-[#7C5C55]">{recipe.name}</h3>
              <p className="text-[11px] text-[#9C7C75] truncate">{recipe.description}</p>
            </div>
          </div>

          <div>
            <div className="text-xs font-black text-[#7C5C55] mb-2 flex items-center justify-between">
              <span>Chạm chọn nguyên liệu:</span>
              <span className="text-[11px] text-[#9C7C75]">
                Cần {recipe.requiredIngredients.length} loại
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(INGREDIENTS).map((ing) => {
                const isChecked = !!selectedIngredients[ing.id];
                const stock = gameState.inventory[ing.id] || 0;

                return (
                  <button
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 text-left transition-all active:scale-95 ${
                      isChecked
                        ? 'bg-[#FFD6E5] border-[#F7A8C4] text-[#7C5C55] font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xl">{ing.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{ing.name}</div>
                      <div
                        className={`text-[10px] ${
                          stock > 0 ? 'text-slate-400 font-medium' : 'text-rose-500 font-bold'
                        }`}
                      >
                        Kho: {stock} {stock <= 0 && '(Hết)'}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
                        isChecked ? 'bg-[#F7A8C4] text-white border-[#F7A8C4]' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer dính ở đáy cho thao tác ngón cái thuận tiện */}
        <div className="p-3 bg-[#FFF1F6] border-t-2 border-[#FFD6E5] shrink-0 flex flex-col gap-2">
          {!hasMatchedRecipe() && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl text-center border border-amber-200">
              ⚠️ Chọn đúng nguyên liệu của {recipe.name} nhé!
            </p>
          )}
          {hasMatchedRecipe() && !isStockAvailable() && (
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl text-center border border-rose-200">
              ❌ Kho đã hết nguyên liệu! Hãy vào Chợ mua thêm nhé.
            </p>
          )}
          {hasMatchedRecipe() && isStockAvailable() && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded-xl text-center border border-emerald-200 flex items-center justify-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Đầy đủ nguyên liệu! Bấm hoàn thành ngay nào.
            </p>
          )}

          <button
            onClick={handleFinishCooking}
            disabled={!hasMatchedRecipe() || !isStockAvailable()}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              hasMatchedRecipe() && isStockAvailable()
                ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-pink-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>HOÀN THÀNH MÓN ĂN (3 ⚡)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
