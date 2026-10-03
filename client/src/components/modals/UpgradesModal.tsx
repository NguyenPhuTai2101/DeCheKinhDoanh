import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { SHOP_UPGRADES } from '../../../../shared/gameData';
import { gameBridge } from '../../game/gameBridge';
import { X, Sparkles, Check, ArrowUpRight } from 'lucide-react';

export const UpgradesModal: React.FC = () => {
  const { closeModal, gameState, purchaseUpgrade } = useGameStore();

  const handleBuyUpgrade = (upgradeId: string) => {
    const success = purchaseUpgrade(upgradeId);
    if (success) {
      // Cập nhật lại các bàn hoặc nội thất trên Phaser Scene
      gameBridge.syncStaff();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Nâng Cấp Cơ Sở Vật Chất</h2>
              <p className="text-xs text-[#9C7C75]">
                Đầu tư trang thiết bị để quán phục vụ nhanh hơn, đông khách hơn
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

        {/* Danh sách nâng cấp */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {SHOP_UPGRADES.map((upgrade) => {
            const currentLevel = gameState.purchasedUpgrades[upgrade.id] || 0;
            const isMax = currentLevel >= upgrade.maxLevel;
            const canAfford = gameState.money >= upgrade.cost;

            return (
              <div
                key={upgrade.id}
                className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#FFD6E5] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F6] border border-[#FFD6E5] flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {upgrade.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-[#7C5C55]">{upgrade.name}</h4>
                      <span className="text-[10px] bg-[#FFF7ED] text-[#7C5C55] border border-[#F7D7BA] px-2 py-0.5 rounded-full font-bold">
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
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Đã Tối Đa</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className={`px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-md transition-all ${
                        canAfford
                          ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white active:scale-95 shadow-pink-200'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Nâng Cấp' : 'Chưa Đủ Tiền'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
