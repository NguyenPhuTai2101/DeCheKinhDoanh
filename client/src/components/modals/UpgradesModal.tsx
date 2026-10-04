import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SHOP_UPGRADES, BUSINESS_STAGES } from '../../../../shared/gameData';
import { BusinessStageId } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import { X, Sparkles, Check, ArrowUpRight, Crown, Store, Award, ChevronRight, Lock } from 'lucide-react';

export const UpgradesModal: React.FC = () => {
  const { closeModal, gameState, purchaseUpgrade, upgradeBusinessStage } = useGameStore();
  const [activeTab, setActiveTab] = useState<'stages' | 'facilities'>('stages');

  const stageKeys: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
  const currentStageIndex = stageKeys.indexOf(gameState.businessStage);

  const handleBuyUpgrade = (upgradeId: string) => {
    soundManager.playClick();
    purchaseUpgrade(upgradeId);
  };

  const handleUpgradeStage = () => {
    soundManager.playClick();
    const success = upgradeBusinessStage();
    if (success) {
      soundManager.playCoin();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-300 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-amber-50 px-5 py-3.5 border-b-2 border-amber-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Cơ Nghiệp Vỉa Hè & Nâng Cấp
              </h2>
              <p className="text-xs text-amber-700">
                Từ xe đẩy lề đường vươn mình thành Đế Chế Ẩm Thực Vỉa Hè
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-200 shadow-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-amber-100/50 p-1.5 px-3 flex gap-2 border-b border-amber-200 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('stages');
            }}
            className={`flex-1 py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'stages'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/80 text-amber-800 hover:bg-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Lộ Trình Cơ Nghiệp (5 Cấp)</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('facilities');
            }}
            className={`flex-1 py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'facilities'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/80 text-amber-800 hover:bg-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Thiết Bị & Tiện Ích Quán</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'stages' ? (
            /* TAB 1: LỘ TRÌNH 5 CẤP ĐỘ CƠ NGHIỆP VỈA HÈ */
            <div className="space-y-3">
              {stageKeys.map((stageKey, idx) => {
                const stage = BUSINESS_STAGES[stageKey];
                const isCurrent = gameState.businessStage === stageKey;
                const isPassed = idx < currentStageIndex;
                const isNext = idx === currentStageIndex + 1;
                const canAffordMoney = gameState.money >= stage.cost;
                const canAffordRep = gameState.reputation >= stage.requiredReputation;
                const canUpgrade = isNext && canAffordMoney && canAffordRep;

                return (
                  <div
                    key={stage.id}
                    className={`rounded-2xl p-3.5 border-2 transition-all relative ${
                      isCurrent
                        ? 'bg-white border-amber-400 ring-2 ring-amber-200 shadow-md'
                        : isPassed
                        ? 'bg-emerald-50/70 border-emerald-200 opacity-90'
                        : isNext
                        ? 'bg-white border-amber-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 border ${
                            isCurrent
                              ? 'bg-amber-100 border-amber-300'
                              : isPassed
                              ? 'bg-emerald-100 border-emerald-300'
                              : 'bg-slate-100 border-slate-200'
                          }`}
                        >
                          {stage.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm text-amber-950">
                              Cấp {idx + 1}: {stage.name}
                            </h4>
                            {isCurrent && (
                              <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.2 rounded-full">
                                Cấp Hiện Tại ⭐
                              </span>
                            )}
                            {isPassed && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Đã Đạt
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-800 font-medium italic mt-0.5">
                            "{stage.tagline}"
                          </p>
                          <p className="text-[11px] text-[#7C5C55] mt-1">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lợi ích của cấp bậc */}
                    <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-[10.5px] text-[#7C5C55] flex-wrap">
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                          🪑 {stage.maxTables} Bàn Đón Khách
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                          ⚡ Tốc Độ: {(stage.customerRateMs / 1000).toFixed(1)}s/khách
                        </span>
                        {STAGE_VISUALS[stageKey] && (
                          <span className="bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 font-extrabold flex items-center gap-1">
                            <span>🎨</span>
                            <span>{STAGE_VISUALS[stageKey].table.materialName}</span>
                          </span>
                        )}
                      </div>

                      {/* Hành động / Trạng thái nâng cấp */}
                      <div>
                        {isPassed ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Hoàn thành
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                            Đang kinh doanh tại đây
                          </span>
                        ) : isNext ? (
                          <div className="flex items-center gap-2">
                            <div className="text-right text-[10px] leading-tight">
                              <div
                                className={`font-black ${
                                  canAffordMoney ? 'text-amber-800' : 'text-rose-600'
                                }`}
                              >
                                {stage.cost.toLocaleString('vi-VN')} đ
                              </div>
                              <div
                                className={`font-bold ${
                                  canAffordRep ? 'text-emerald-700' : 'text-rose-600'
                                }`}
                              >
                                Cần: {stage.requiredReputation} Uy tín
                              </div>
                            </div>
                            <button
                              onClick={handleUpgradeStage}
                              disabled={!canUpgrade}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all ${
                                canUpgrade
                              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-bounce-short active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{canUpgrade ? 'Lên Đời Ngay' : 'Chưa Đạt Yêu Cầu'}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Cần mở khóa cấp trước
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB 2: TRANG THIẾT BỊ VÀ TIỆN ÍCH */
            <div className="space-y-3">
              {SHOP_UPGRADES.map((upgrade) => {
                const currentLevel = gameState.purchasedUpgrades[upgrade.id] || 0;
                const isMax = currentLevel >= upgrade.maxLevel;
                const canAfford = gameState.money >= upgrade.cost;

                return (
                  <div
                    key={upgrade.id}
                    className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-[#FFD6E5] transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#FFF1F6] border border-[#FFD6E5] flex items-center justify-center text-2xl shadow-sm shrink-0">
                        {upgrade.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xs sm:text-sm text-[#7C5C55]">
                            {upgrade.name}
                          </h4>
                          <span className="text-[10px] bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA] px-2 py-0.2 rounded-full font-bold">
                            Cấp {currentLevel} / {upgrade.maxLevel}
                          </span>
                        </div>
                        <p className="text-xs text-[#9C7C75] mt-0.5">{upgrade.description}</p>
                        <div className="text-xs font-black text-[#F7A8C4] mt-1">
                          {upgrade.cost.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>

                    {/* Nút nâng cấp */}
                    <div className="shrink-0">
                      {isMax ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Đã Tối Đa</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm transition-all ${
                            canAfford
                              ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white active:scale-95 shadow-pink-200'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{canAfford ? 'Nâng Cấp' : 'Thiếu Tiền'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
