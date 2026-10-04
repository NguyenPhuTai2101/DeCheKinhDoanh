import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, RECIPES } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const FranchiseModal: React.FC = () => {
  const { closeModal, gameState, switchActiveRestaurant, unlockRestaurantFranchise } =
    useGameStore();

  const currentRestId = gameState.activeRestaurantId || 'banh_mi';
  const unlockedList = gameState.unlockedRestaurants || ['banh_mi'];
  const restaurants = Object.values(RESTAURANT_TYPES);

  const handleSwitch = (id: RestaurantTypeId) => {
    soundManager.playClick();
    switchActiveRestaurant(id);
    closeModal();
  };

  const handleUnlock = (id: RestaurantTypeId) => {
    soundManager.playCoin();
    const success = unlockRestaurantFranchise(id);
    if (success) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
      });
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-300 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 px-4 py-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏢</span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight drop-shadow-2xs">
                Chuỗi Đế Chế Ẩm Thực Đa Ngành
              </h2>
              <p className="text-[11px] text-amber-100 font-medium">
                Sở hữu chuỗi thương hiệu Phở, Bún Bò, Bò Né, Cơm Tấm, Bánh Mì
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thống kê chuỗi chi nhánh */}
        <div className="bg-amber-100/60 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-950 flex items-center gap-1">
              <span>🏪 Đã mở:</span>
              <span className="text-rose-600 font-black">
                {unlockedList.length}/{restaurants.length} Thương hiệu
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-900">
            <span>Ví: {gameState.money.toLocaleString('vi-VN')} đ</span>
            <span>·</span>
            <span>⭐ Uy tín: {gameState.reputation}</span>
          </div>
        </div>

        {/* Danh sách 5 thương hiệu ẩm thực */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
          {restaurants.map((rest) => {
            const isCurrent = rest.id === currentRestId;
            const isUnlocked = unlockedList.includes(rest.id);
            const canAffordMoney = gameState.money >= rest.unlockCost;
            const canAffordRep = gameState.reputation >= rest.requiredReputation;
            const canUnlock = !isUnlocked && canAffordMoney && canAffordRep;
            const branchStaff = gameState.hiredEmployees.filter(
              (id) => (gameState.employeeDetails[id]?.assignedRestaurantId || 'banh_mi') === rest.id
            );

            return (
              <div
                key={rest.id}
                className={`rounded-2xl p-3 sm:p-3.5 border-2 transition-all relative ${
                  isCurrent
                    ? 'bg-white border-amber-500 ring-2 ring-amber-200 shadow-md'
                    : isUnlocked
                    ? 'bg-white/90 border-emerald-200 shadow-2xs hover:border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon & Thông tin quán */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      style={{ backgroundColor: rest.accentColor }}
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 border border-black/5"
                    >
                      {rest.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-slate-800 leading-tight">
                          {rest.name}
                        </h4>
                        {isCurrent && (
                          <span className="bg-amber-500 text-white text-[8.5px] font-black px-2 py-0.2 rounded-full">
                            Đang Quản Lý ⭐
                          </span>
                        )}
                        {isUnlocked && !isCurrent && (
                          <span
                            className={`text-[8.5px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5 ${
                              branchStaff.length > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {branchStaff.length > 0
                              ? `Tự động bán (${branchStaff.length} NV)`
                              : 'Chưa có NV trực ⚠️'}
                          </span>
                        )}
                      </div>

                      <div
                        style={{ color: rest.themeColor }}
                        className="text-[10px] font-extrabold mt-0.5 flex items-center gap-1"
                      >
                        <Award className="w-2.5 h-2.5" />
                        <span>{rest.badge}</span>
                      </div>

                      <p className="text-[10.5px] text-slate-600 italic mt-0.5 font-medium line-clamp-1">
                        "{rest.tagline}"
                      </p>

                      {/* Dụng cụ nấu & Thực đơn */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[9.5px]">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-1">
                          <span>{rest.equipmentIcon}</span>
                          <span>{rest.equipmentName}</span>
                        </span>
                        <span className="text-slate-500 font-bold">
                          {rest.primaryRecipeIds.length} món đặc sản
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer nút hành động / mở khóa */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  {/* Thực đơn tiêu biểu */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {rest.primaryRecipeIds.slice(0, 3).map((rId) => {
                      const recipe = RECIPES[rId];
                      if (!recipe) return null;
                      return (
                        <span
                          key={rId}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold"
                        >
                          {recipe.icon} {recipe.name.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>

                  {/* Nút Chuyển Quán hoặc Mở Chi Nhánh */}
                  <div>
                    {isCurrent ? (
                      <span className="text-[10.5px] font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        Quán đang hoạt động
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleSwitch(rest.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span>Chuyển Quản Lý 🔀</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right text-[10px] leading-tight">
                          <div
                            className={`font-black ${
                              canAffordMoney ? 'text-slate-800' : 'text-rose-600'
                            }`}
                          >
                            {rest.unlockCost.toLocaleString('vi-VN')} đ
                          </div>
                          <div
                            className={`font-bold ${
                              canAffordRep ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            Cần: {rest.requiredReputation} ⭐
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnlock(rest.id)}
                          disabled={!canUnlock}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all ${
                            canUnlock
                              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-bounce-short active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{canUnlock ? 'Mở Chi Nhánh 🚀' : 'Chưa Đủ Tiền/Uy Tín'}</span>
                        </button>
                      </div>
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
