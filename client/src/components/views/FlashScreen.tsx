import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import { Play } from 'lucide-react';

export const FlashScreen: React.FC = () => {
  const { setShowFlashScreen, openModal, showToast, gameState } = useGameStore();

  const handleStart = () => {
    soundManager.playFanfare();
    setShowFlashScreen(false);

    // Kiểm tra: nếu đã chơi trước đó và đã có quán rồi -> vào thẳng luôn
    // Nếu chưa có quán -> chuyển tới màn hình chọn quán khởi nghiệp
    if (gameState.hasChosenStarter) {
      showToast(`👋 Chào mừng bạn trở lại tiệm ${gameState.shopName || 'ẩm thực'}!`);
    } else {
      openModal('starterSelection');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none flex flex-col justify-end items-center animate-fade-in bg-[#FAF5EE]">
      {/* 1. Hình nền Full Màn Hình tràn viền cực đẹp (Concept Ẩm Thực Vỉa Hè Chibi) */}
      <img
        src="/splash_art.jpg"
        alt="Đế Chế Kinh Doanh Vỉa Hè"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* 2. Lớp phủ gradient mờ nhẹ ở đáy để nút Bắt Đầu nổi bật sắc nét */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

      {/* 3. Một nút Bắt Đầu duy nhất nổi trên nền tranh */}
      <div className="relative z-10 w-full max-w-sm px-6 pb-8 sm:pb-10 flex flex-col items-center gap-2.5">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF5C8A] via-[#F43F5E] to-[#FF758F] hover:from-[#E11D48] hover:to-[#FF5C8A] text-white font-black text-xl shadow-[0_8px_25px_rgba(244,63,94,0.65)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-white/90 animate-pulse tracking-wider"
        >
          <span>BẮT ĐẦU</span>
          <Play className="w-5 h-5 fill-white stroke-none" />
        </button>

        {gameState.hasChosenStarter ? (
          <div className="bg-black/55 backdrop-blur-sm px-4 py-1.2 rounded-full border border-white/20 shadow-sm">
            <p className="text-xs font-bold text-amber-200 text-center leading-tight">
              Tiếp tục: <span className="text-white font-black">{gameState.shopName}</span> 🌟
            </p>
          </div>
        ) : (
          <div className="bg-black/55 backdrop-blur-sm px-4 py-1.2 rounded-full border border-white/20 shadow-sm">
            <p className="text-xs font-bold text-white/95 text-center leading-tight tracking-wide">
              Chạm để chọn thương hiệu khởi nghiệp ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
