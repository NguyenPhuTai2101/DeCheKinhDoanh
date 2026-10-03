import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RECIPES, INGREDIENTS } from '../../../../shared/gameData';
import { RecipeId, IngredientId } from '../../../../shared/types';
import { gameBridge } from '../../game/gameBridge';
import { X, Check, Utensils, Zap, Sparkles } from 'lucide-react';

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

  // Khi chọn công thức khác -> reset các nguyên liệu cần thiết
  const handleSelectRecipe = (id: RecipeId) => {
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
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId],
    }));
  };

  // Kiểm tra xem người chơi đã chọn đúng tất cả nguyên liệu công thức chưa
  const hasMatchedRecipe = () => {
    for (const req of recipe.requiredIngredients) {
      if (!selectedIngredients[req]) return false;
    }
    // Không được chọn thừa nguyên liệu không liên quan
    for (const [key, val] of Object.entries(selectedIngredients)) {
      if (val && !recipe.requiredIngredients.includes(key as IngredientId)) {
        return false;
      }
    }
    return true;
  };

  // Kiểm tra kho còn đủ nguyên liệu không
  const isStockAvailable = () => {
    for (const req of recipe.requiredIngredients) {
      if ((gameState.inventory[req] || 0) <= 0) return false;
    }
    return true;
  };

  const handleFinishCooking = () => {
    const tableIndex = selectedTableForCooking || 1;
    const success = completeCooking(selectedRecipeId, tableIndex);
    if (success) {
      // Thông báo cho Phaser Scene cập nhật bàn ăn
      gameBridge.markFoodReady(tableIndex);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍳</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Góc Bếp Nấu Ăn</h2>
              <p className="text-xs text-[#9C7C75]">
                {selectedTableForCooking
                  ? `Đang chuẩn bị món cho Bàn số ${selectedTableForCooking}`
                  : 'Chọn công thức và chuẩn bị nguyên liệu đúng rồi bấm Hoàn thành'}
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

        {/* Thân Modal */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col md:flex-row gap-5">
          {/* Cột 1: Menu danh sách món */}
          <div className="w-full md:w-5/12 flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase text-[#9C7C75] px-1">Danh Mục Món Ăn</h3>
            <div className="flex flex-col gap-2">
              {Object.values(RECIPES).map((item) => {
                const isSelected = item.id === selectedRecipeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectRecipe(item.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#FFF1F6] border-[#F7A8C4] shadow-sm'
                        : 'bg-white border-[#F2E8E5] hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-[#7C5C55] truncate">
                        {item.name}
                      </div>
                      <div className="text-xs font-bold text-[#F7A8C4]">
                        {item.basePrice.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột 2: Chọn nguyên liệu & xác nhận */}
          <div className="w-full md:w-7/12 flex flex-col gap-4 bg-[#FFF7ED]/50 p-4 rounded-2xl border border-[#F7D7BA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{recipe.icon}</span>
                <div>
                  <h3 className="font-black text-base text-[#7C5C55]">{recipe.name}</h3>
                  <p className="text-xs text-[#9C7C75]">{recipe.description}</p>
                </div>
              </div>
            </div>

            {/* Danh sách nguyên liệu cần chọn */}
            <div>
              <div className="text-xs font-extrabold text-[#7C5C55] mb-2 flex items-center justify-between">
                <span>Chọn nguyên liệu đúng theo công thức:</span>
                <span className="text-[11px] text-[#9C7C75]">
                  Cần {recipe.requiredIngredients.length} nguyên liệu
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(INGREDIENTS).map((ing) => {
                  const isRequired = recipe.requiredIngredients.includes(ing.id);
                  const isChecked = !!selectedIngredients[ing.id];
                  const stock = gameState.inventory[ing.id] || 0;

                  return (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        isChecked
                          ? 'bg-[#FFD6E5] border-[#F7A8C4] font-bold text-[#7C5C55]'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">{ing.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{ing.name}</div>
                        <div
                          className={`text-[10px] ${
                            stock > 0 ? 'text-slate-400 font-semibold' : 'text-rose-500 font-bold'
                          }`}
                        >
                          Kho: {stock} {stock <= 0 && '(Hết)'}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-[#F7A8C4] text-white border-transparent' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thông báo tình trạng */}
            <div className="mt-auto pt-2 border-t border-[#F7D7BA]">
              {!hasMatchedRecipe() && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  ⚠️ Hãy bấm chọn đúng chính xác các nguyên liệu của món {recipe.name}!
                </p>
              )}
              {hasMatchedRecipe() && !isStockAvailable() && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  ❌ Kho đã hết một số nguyên liệu cần thiết! Hãy đi chợ mua thêm nhé.
                </p>
              )}
              {hasMatchedRecipe() && isStockAvailable() && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Đầy đủ nguyên liệu! Bấm hoàn thành để dọn món lên bàn.
                </p>
              )}
            </div>

            {/* Nút Hoàn thành */}
            <button
              onClick={handleFinishCooking}
              disabled={!hasMatchedRecipe() || !isStockAvailable()}
              className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                hasMatchedRecipe() && isStockAvailable()
                  ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white active:scale-98 shadow-pink-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>HOÀN THÀNH MÓN ĂN (Tiêu hao 3 ⚡)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
