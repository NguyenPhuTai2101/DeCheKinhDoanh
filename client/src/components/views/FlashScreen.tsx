import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, RECIPES } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Utensils,
  CheckCircle2,
  ChevronRight,
  Award,
  Play,
  RotateCcw,
  Store,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const FlashScreen: React.FC = () => {
  const { chooseStarterRestaurant, setShowFlashScreen, gameState } = useGameStore();
  const [selectedId, setSelectedId] = useState<RestaurantTypeId>(
    gameState.activeRestaurantId || 'banh_mi'
  );

  const restaurants = Object.values(RESTAURANT_TYPES);
  const currentSelected = RESTAURANT_TYPES[selectedId];
  const activeRest = RESTAURANT_TYPES[gameState.activeRestaurantId || 'banh_mi'];

  const handleStartChosen = () => {
    soundManager.playFanfare();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
    });
    chooseStarterRestaurant(selectedId);
  };

  const handleContinueExisting = () => {
    soundManager.playClick();
    setShowFlashScreen(false);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#2C1810] via-[#3E2723] to-[#1A0C08] text-white flex flex-col justify-between overflow-hidden relative select-none">
      {/* Hiệu ứng hạt trang trí nền (Floating culinary emojis) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <span className="absolute top-8 left-6 text-4xl animate-bounce-short">🥖</span>
        <span className="absolute top-20 right-10 text-4xl animate-pulse">🍜</span>
        <span className="absolute top-1/3 left-10 text-3xl animate-bounce">🍲</span>
        <span className="absolute top-1/2 right-8 text-4xl animate-bounce-short">🥩</span>
        <span className="absolute bottom-28 left-8 text-4xl animate-pulse">🍛</span>
        <span className="absolute bottom-16 right-12 text-3xl animate-bounce">☕</span>
        <div className="absolute top-0 inset-x-0 h-40 bg-radial from-amber-500/20 to-transparent pointer-events-none" />
      </div>

      {/* HEADER FLASHSCREEN: TỰA GAME & SLOGAN */}
      <div className="relative z-10 pt-5 px-4 text-center shrink-0">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/50 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider text-amber-300 shadow-sm backdrop-blur-xs mb-1.5 animate-pulse">
          <span>🏮</span>
          <span>GAME KINH DOANH ẨM THỰC VIỆT NAM</span>
          <span>🏮</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-rose-300 drop-shadow-md">
          ĐẾ CHẾ KINH DOANH
        </h1>
        <p className="text-[11.5px] text-amber-200/80 font-medium mt-0.5">
          Khởi nghiệp quán nhỏ vỉa hè & Phát triển chuỗi ẩm thực triệu đô 🇻🇳
        </p>

        {/* Nút tiếp tục quán cũ (nếu người chơi đã có dữ liệu quán) */}
        {gameState.hasChosenStarter && (
          <div className="mt-2.5 max-w-sm mx-auto">
            <button
              onClick={handleContinueExisting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2 rounded-2xl border border-emerald-400/60 shadow-lg shadow-emerald-950/40 flex items-center justify-between active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl p-1 bg-white/20 rounded-xl shrink-0">
                  {activeRest.icon}
                </span>
                <div className="text-left leading-tight truncate">
                  <div className="text-[10px] text-emerald-200 font-bold uppercase">Tiếp tục chơi:</div>
                  <div className="text-xs font-black truncate">{gameState.shopName}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black bg-white/20 px-2.5 py-1 rounded-xl shrink-0">
                <span>Vào Bếp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* BODY FLASHSCREEN: CHỌN QUÁN KHỞI NGHIỆP (5 MÔ HÌNH) */}
      <div className="relative z-10 flex-1 px-3 sm:px-4 py-2 overflow-y-auto no-scrollbar flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CHỌN MÔ HÌNH QUÁN KHỞI NGHIỆP</span>
          </div>
          <span className="text-[10px] text-amber-200/60 font-medium">5 Thương hiệu độc quyền</span>
        </div>

        {/* Danh sách thẻ 5 mô hình quán */}
        <div className="grid grid-cols-1 gap-2">
          {restaurants.map((rest) => {
            const isPicked = rest.id === selectedId;

            return (
              <div
                key={rest.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedId(rest.id);
                }}
                className={`rounded-2xl p-2.5 sm:p-3 border-2 transition-all cursor-pointer relative flex items-center justify-between gap-2.5 ${
                  isPicked
                    ? 'bg-gradient-to-r from-amber-950/90 to-orange-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/50 scale-[1.01]'
                    : 'bg-black/40 border-amber-900/40 hover:border-amber-600/60 hover:bg-black/60 opacity-80'
                }`}
              >
                {/* Icon & Thông tin quán */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    style={{ backgroundColor: rest.themeColor }}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 border border-white/20"
                  >
                    {rest.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-xs sm:text-sm text-amber-100 leading-tight truncate">
                        {rest.name}
                      </h3>
                      {isPicked && (
                        <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Chọn
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-amber-300/90 font-bold mt-0.5 truncate">
                      {rest.badge}
                    </div>

                    <div className="text-[9.5px] text-stone-300 line-clamp-1 italic">
                      "{rest.tagline}"
                    </div>
                  </div>
                </div>

                {/* Thiết bị nấu chuyên dụng */}
                <div className="text-right shrink-0 flex flex-col items-end justify-center">
                  <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <span>{rest.equipmentIcon}</span>
                    <span>{rest.equipmentName.split('&')[0].trim()}</span>
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium mt-1">
                    {rest.primaryRecipeIds.length} món
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* THẺ PREVIEW CHI TIẾT QUÁN ĐANG CHỌN */}
        <div className="bg-gradient-to-b from-amber-950/80 to-black/80 rounded-2xl border border-amber-500/40 p-2.5 text-stone-200 shadow-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentSelected.icon}</span>
              <div>
                <span className="text-xs font-black text-amber-300">
                  {currentSelected.name}
                </span>
                <div className="text-[10px] text-stone-300">
                  {currentSelected.starterDescription}
                </div>
              </div>
            </div>
          </div>

          {/* Dụng cụ & Món bán */}
          <div className="mt-1.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-200">
              <span>Thiết bị:</span>
              <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded">
                {currentSelected.equipmentIcon} {currentSelected.equipmentName}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[9.5px] font-bold text-stone-300 overflow-x-auto no-scrollbar">
              <span>Món chính:</span>
              {currentSelected.primaryRecipeIds.slice(0, 3).map((rId) => {
                const r = RECIPES[rId];
                return (
                  <span
                    key={rId}
                    className="bg-stone-800/80 border border-stone-700 px-1.5 py-0.2 rounded text-stone-200"
                  >
                    {r?.icon} {r?.name.split(' ')[0]}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER FLASHSCREEN: NÚT KHAI TRƯƠNG BẮT ĐẦU */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black via-black/95 to-black/70 border-t border-amber-500/30 shrink-0 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-amber-300/80 font-bold">Khởi sự kinh doanh:</div>
          <div className="text-xs sm:text-sm font-black text-amber-100 flex items-center gap-1 truncate">
            <span>{currentSelected.icon}</span>
            <span className="truncate">{currentSelected.name}</span>
          </div>
        </div>

        <button
          onClick={handleStartChosen}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-900/50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 animate-bounce-short border border-amber-300/50"
        >
          <Sparkles className="w-4 h-4 fill-current text-amber-200" />
          <span>KHAI TRƯƠNG NGAY 🚀</span>
        </button>
      </div>
    </div>
  );
};
