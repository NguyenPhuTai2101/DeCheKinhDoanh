import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import { X, Sparkles, Award, Trophy, Ticket } from 'lucide-react';

export const LotteryDrawModal: React.FC = () => {
  const { lotteryDrawResult, closeLotteryDrawModal } = useGameStore();
  const [isSpinning, setIsSpinning] = useState(true);
  const [displayNumber, setDisplayNumber] = useState('??');

  useEffect(() => {
    if (!lotteryDrawResult) return;

    soundManager.playDoorBell();
    let count = 0;
    const timer = setInterval(() => {
      count++;
      const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      setDisplayNumber(rand);

      if (count > 20) {
        clearInterval(timer);
        setDisplayNumber(lotteryDrawResult.drawnNumber);
        setIsSpinning(false);

        if (lotteryDrawResult.prizeAmount > 0) {
          soundManager.playFanfare();
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#8B5CF6'],
          });
        } else {
          soundManager.playBuzzer();
        }
      }
    }, 90);

    return () => clearInterval(timer);
  }, [lotteryDrawResult]);

  if (!lotteryDrawResult) return null;

  const { drawnNumber, prizeType, prizeAmount, userTicket } = lotteryDrawResult;

  const isJackpot = prizeType === 'jackpot';
  const isPrize2 = prizeType === 'prize2';
  const isPrize3 = prizeType === 'prize3';
  const isWin = prizeAmount > 0;

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#FAF5EE] rounded-3xl border-4 border-amber-400 w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-slide-up text-center relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-4 text-white relative">
          <div className="text-3xl animate-bounce-short">🎟️</div>
          <h3 className="text-lg font-black tracking-wide mt-1">XỔ SỐ & ĐÁNH ĐỀ VỈA HÈ</h3>
          <p className="text-xs text-amber-100 font-medium">Lồng Cầu Quay Thưởng Cô Bảy 16:30 Chiều</p>

          <button aria-label="Đóng cửa sổ"
            onClick={closeLotteryDrawModal}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thân quay số */}
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-inner">
            <div className="text-xs font-bold text-[#9C7C75] mb-2 uppercase tracking-wider">
              LỒNG CẦU QUAY SỐ
            </div>

            {/* Quả cầu quay số */}
            <div className="flex items-center justify-center gap-3 my-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-white">
                {displayNumber[0]}
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-white">
                {displayNumber[1]}
              </div>
            </div>

            <div className="text-xs text-[#7C5C55] font-semibold mt-2">
              Vé của bạn: <strong className="text-pink-600 text-sm">[{userTicket}]</strong>
            </div>
          </div>

          {/* Kết quả */}
          {!isSpinning && (
            <div className="space-y-3 animate-fade-in">
              {isWin ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-black text-base">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>
                      {isJackpot
                        ? '🎉 TRÚNG GIẢI ĐỘC ĐẮC!'
                        : isPrize2
                        ? '✨ TRÚNG GIẢI NHÌ!'
                        : '⭐ TRÚNG GIẢI AN ỦI!'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    +{prizeAmount.toLocaleString('vi-VN')} đ
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Cô Bảy tươi cười chúc mừng bạn buôn may bán đắt!
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-xs text-rose-700">
                  <p className="font-bold">Chưa trúng thưởng hôm nay rồi!</p>
                  <p className="text-[11px] text-[#9C7C75] mt-0.5">
                    Đừng buồn nha, ngày mai ủng hộ Cô Bảy lấy hên tiếp nhé!
                  </p>
                </div>
              )}

              <button
                onClick={closeLotteryDrawModal}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
              >
                Xác Nhận & Cất Tiền Vào Sổ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
