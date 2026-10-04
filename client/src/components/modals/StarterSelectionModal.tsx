import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, RECIPES } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import { Sparkles, Utensils, CheckCircle2, ChevronRight, Award, Flame } from 'lucide-react';

export const StarterSelectionModal: React.FC = () => {
  const { chooseStarterRestaurant, closeModal } = useGameStore();
  const [selectedId, setSelectedId] = useState<RestaurantTypeId>('banh_mi');

  const restaurants = Object.values(RESTAURANT_TYPES);
  const currentSelected = RESTAURANT_TYPES[selectedId];

  const handleConfirm = () => {
    soundManager.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
    });
    chooseStarterRestaurant(selectedId);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-400 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]">
        {/* Header Flashscreen */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 p-4 text-white text-center shrink-0 relative shadow-md">
          <div className="inline-block bg-white/20 backdrop-blur-xs px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase mb-1">
            ✨ KHỞI ĐẦU HÀNH TRÌNH ẨM THỰC ✨
          </div>
          <h2 className="text-lg sm:text-2xl font-black drop-shadow-md">
            Chọn Mô Hình Quán Khởi Nghiệp!
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-medium max-w-md mx-auto mt-0.5">
            Hãy chọn thương hiệu bạn yêu thích để bắt đầu gầy dựng đế chế. Sau này có nhiều tiền bạn có thể mở thêm toàn bộ các quán khác!
          </p>
        </div>

        {/* Nội dung danh sách 5 quán */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
          {/* Lưới chọn 5 thương hiệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {restaurants.map((rest) => {
              const isPicked = rest.id === selectedId;

              return (
                <div
                  key={rest.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedId(rest.id);
                  }}
                  className={`rounded-2xl p-3 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isPicked
                      ? 'bg-white border-amber-500 ring-3 ring-amber-300 shadow-md scale-[1.01]'
                      : 'bg-white/80 border-[#F0E6D8] hover:border-amber-300 opacity-90'
                  }`}
                >
                  {/* Top card */}
                  <div className="flex items-start gap-2.5">
                    <div
                      style={{ backgroundColor: rest.accentColor }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 border border-black/5"
                    >
                      {rest.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-xs sm:text-sm text-slate-800 leading-tight">
                          {rest.name}
                        </h4>
                        {isPicked && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Đã Chọn
                          </span>
                        )}
                      </div>

                      <div
                        style={{ color: rest.themeColor }}
                        className="text-[9.5px] font-extrabold mt-0.5 flex items-center gap-1"
                      >
                        <Award className="w-2.5 h-2.5" />
                        <span>{rest.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="text-[10px] text-slate-600 font-medium italic mt-2 line-clamp-2">
                    "{rest.tagline}"
                  </div>

                  {/* Dụng cụ nấu & Món chính */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px]">
                    <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                      <span>{rest.equipmentIcon}</span>
                      <span>{rest.equipmentName.split('&')[0].trim()}</span>
                    </span>

                    <span className="text-slate-500 font-bold">
                      {rest.primaryRecipeIds.length} Món Thực Đơn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chi tiết quán đang chọn */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-3 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
              <span className="text-2xl">{currentSelected.icon}</span>
              <div>
                <h3 className="font-black text-sm text-amber-950">
                  {currentSelected.name}
                </h3>
                <div className="text-[10.5px] text-slate-600 font-medium">
                  {currentSelected.starterDescription}
                </div>
              </div>
            </div>

            {/* Xem trước thực đơn quán này */}
            <div className="mt-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Các món best-seller sẽ bán:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentSelected.primaryRecipeIds.map((rId) => {
                  const recipe = RECIPES[rId];
                  if (!recipe) return null;
                  return (
                    <div
                      key={rId}
                      className="bg-amber-50/80 border border-amber-200 rounded-xl px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-slate-800"
                    >
                      <span>{recipe.icon}</span>
                      <span>{recipe.name}</span>
                      <span className="text-[9px] text-rose-600 font-black">
                        {(recipe.basePrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer nút xác nhận */}
        <div className="p-3 bg-white border-t border-amber-200 shrink-0 flex items-center justify-between gap-3">
          <div className="text-left">
            <div className="text-[10px] text-slate-500 font-bold">Thương hiệu khởi đầu:</div>
            <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1">
              <span>{currentSelected.icon}</span>
              <span>{currentSelected.name}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Khai Trương Ngay 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
