import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';

export const IncidentModal: React.FC = () => {
  const { activeIncident, resolveSurpriseIncident } = useGameStore();

  useEffect(() => {
    if (!activeIncident) return;

    if (activeIncident.type === 'reward') {
      soundManager.playFanfare();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'],
      });
    } else {
      soundManager.playBuzzer();
    }
  }, [activeIncident]);

  if (!activeIncident) return null;

  const isReward = activeIncident.type === 'reward';

  const handleResolve = () => {
    if (isReward) {
      soundManager.playCoin();
    } else {
      soundManager.playClick();
    }
    resolveSurpriseIncident();
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className={`bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-2 ${
          isReward ? 'border-emerald-100 shadow-emerald-500/10' : 'border-rose-100 shadow-rose-500/10'
        } animate-scale-up`}
      role="dialog" aria-modal="true" aria-label="Biến cố và lựa chọn xử lý">
        {/* 1. Icon Biểu Tượng Lớn Ở Đầu */}
        {!isReward && <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-[#643b3d]"><p>Tự khắc phục: dùng 10 thể lực, chỉ chịu 50% chi phí và giữ danh tiếng.</p><button className="mt-2 px-3 py-2 rounded-xl bg-pink-500 text-white font-bold disabled:opacity-40" disabled={useGameStore.getState().gameState.player.energy < 10} onClick={() => resolveSurpriseIncident('mitigate')}>Tự khắc phục · 10⚡</button></div>}
        <div className="flex items-center justify-center gap-2 mb-3 select-none">
          <span className="text-4xl sm:text-5xl drop-shadow-sm filter">
            {activeIncident.icon}
          </span>
        </div>

        {/* 2. Tiêu Đề In Hoa Giật Gân */}
        <h2
          className={`text-center font-black text-xl sm:text-2xl uppercase tracking-tight mb-2.5 leading-snug ${
            isReward ? 'text-emerald-600' : 'text-[#E11D48]'
          }`}
        >
          {activeIncident.title}
        </h2>

        {/* 3. Lời Dẫn Tình Huống Đời Thực */}
        <p className="text-gray-700 text-sm font-medium text-center mb-5 leading-relaxed px-1">
          {activeIncident.story}
        </p>

        {/* 4. Khung Chi Tiết Sự Cố / Biến Cố */}
        <div
          className={`rounded-2xl p-4 mb-6 border text-sm leading-relaxed ${
            isReward
              ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
              : 'bg-rose-50/75 border-rose-100 text-rose-950'
          }`}
        >
          {/* Hàng 1: Hành vi hoặc tình huống */}
          <div className="flex items-start gap-2 mb-2.5">
            <span className="shrink-0 text-base">{isReward ? '🎉' : '⚠️'}</span>
            <div>
              <span className="font-semibold text-gray-800">
                {isReward ? 'Tình huống: ' : 'Hành vi: '}
              </span>
              <span className="font-bold text-gray-900">
                {activeIncident.behaviorLabel}
              </span>
            </div>
          </div>

          {/* Hàng 2: Tiền phạt hoặc tiền thưởng */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="shrink-0 text-base">{isReward ? '💵' : '💸'}</span>
            <div>
              <span className="font-semibold text-gray-800">
                {isReward ? 'Thu nhập / Tiền thưởng đột xuất: ' : 'Phạt / Chi phí sự cố: '}
              </span>
              <span
                className={`font-black text-base ${
                  isReward ? 'text-emerald-600' : 'text-[#E11D48]'
                }`}
              >
                {activeIncident.moneyChange > 0 ? '+' : ''}
                {activeIncident.moneyChange.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Hàng 3: Đánh giá uy tín / Điểm sao */}
          <div className="flex items-start gap-2 mb-3">
            <span className="shrink-0 text-base">{isReward ? '📈' : '📉'}</span>
            <div>
              <span className="font-semibold text-gray-800">Đánh giá uy tín quán: </span>
              <span
                className={`font-bold ${
                  isReward ? 'text-emerald-700' : 'text-[#E11D48]'
                }`}
              >
                {activeIncident.reputationNote}
              </span>
            </div>
          </div>

          {/* Đường kẻ đứt nét ngăn cách */}
          <div
            className={`border-t border-dashed my-2.5 ${
              isReward ? 'border-emerald-200' : 'border-rose-200'
            }`}
          />

          {/* Chú thích trong ngoặc đơn dưới cùng */}
          <p className="text-xs italic text-gray-500 text-center leading-normal">
            {activeIncident.footerNote ||
              (isReward
                ? '(Tiền thưởng đã được cộng thẳng vào két sắt của quán)'
                : '(Tiền phạt đã trừ trực tiếp vào két tiền quán và ghi vào chi phí sự cố)')}
          </p>
        </div>

        {/* 5. Nút Bấm Hành Động: Chấp hành & Tiếp tục */}
        <button
          onClick={handleResolve}
          type="button"
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-white text-base shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            isReward
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-[#FF5C8A] to-[#F43F5E] hover:from-[#E11D48] hover:to-[#E11D48] shadow-rose-500/25'
          }`}
        >
          {activeIncident.actionButtonText || (isReward ? 'Hoan hỉ & Tiếp tục' : 'Chấp hành & Tiếp tục')}
        </button>
      </div>
    </div>
  );
};
