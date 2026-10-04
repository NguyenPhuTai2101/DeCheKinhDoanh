import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BUSINESS_STAGES } from '../../../shared/gameData';
import { Play, Pause, FastForward, Clock, Zap, Award, Store, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const TopBar: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    setShopOpen,
    timeSpeed,
    setTimeSpeed,
    openModal,
    currentView,
    setCurrentView,
  } = useGameStore();
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const energyPercent = Math.round((gameState.player.energy / gameState.player.maxEnergy) * 100);
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;

  return (
    <header className="w-full bg-[#FAF5EE] border-b-2 border-[#FFD6E5] px-3 py-2 flex flex-col gap-1.5 shadow-sm z-30 shrink-0">
      {/* Hàng 1: Tên quán, Tiền mặt, Nút Mở/Đóng cửa */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Tên & Cấp độ */}
        <div
          onClick={() => {
            soundManager.playClick();
            openModal('ledger');
          }}
          className="flex items-center gap-1.5 min-w-0 cursor-pointer group"
          title="Bấm để xem Sổ Sách & Cơ Nghiệp Vỉa Hè"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-sm shadow-inner shrink-0 group-hover:scale-105 transition-all">
            {currentStage.icon}
          </div>
          <div className="leading-tight truncate">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[#7C5C55] text-xs truncate group-hover:text-pink-600 transition-colors">
                {gameState.shopName}
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold shrink-0 border border-amber-200">
                {currentStage.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#9C7C75] font-semibold">
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-[#F7A8C4]" />
                N{gameState.day} · {formatTime(gameState.gameTimeMinutes)}
              </span>
              <span className="flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5 text-amber-500" />
                {gameState.reputation}⭐
              </span>
            </div>
          </div>
        </div>


        {/* Tiền mặt & Nút Mở Cửa */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#FFF1F6] px-2.5 py-1 rounded-full border border-[#F7A8C4] shadow-sm">
            <span className="text-xs">💰</span>
            <span className="font-black text-xs text-[#7C5C55]">
              {gameState.money.toLocaleString('vi-VN')} <span className="text-[9px] font-bold">đ</span>
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setShopOpen(!isShopOpen);
            }}
            className={`px-3 py-1 rounded-full font-black text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
              isShopOpen
                ? 'bg-rose-400 text-white hover:bg-rose-500'
                : 'bg-[#F7A8C4] text-white hover:bg-[#f28bb1] animate-pulse'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>{isShopOpen ? 'Nghỉ' : 'Mở Cửa'}</span>
          </button>
        </div>
      </div>

      {/* Hàng 2: Năng lượng, Tốc độ thời gian, Âm thanh */}
      <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-[#F2E8E5] text-[10px]">
        {/* Năng lượng (Sức lực) */}
        <div className="flex items-center gap-1.5 bg-[#FFF7ED] px-2 py-0.5 rounded-full border border-[#F7D7BA]">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
          <span className="font-bold text-[#7C5C55]">Sức lực</span>
          <div className="w-16 h-1.5 bg-[#FFE6A7]/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                energyPercent > 30 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
          <span className="font-extrabold text-[#7C5C55] text-[9px]">{energyPercent}%</span>
        </div>

        {/* Tốc độ & Âm thanh */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-[#FFF1F6] p-0.5 rounded-full border border-[#FFD6E5]">
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(0);
              }}
              className={`p-1 rounded-full text-xs transition-all ${
                timeSpeed === 0 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55]'
              }`}
              title="Tạm dừng"
            >
              <Pause className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(1);
              }}
              className={`p-1 rounded-full text-xs font-bold transition-all ${
                timeSpeed === 1 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55]'
              }`}
              title="1x"
            >
              <Play className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(2);
              }}
              className={`p-1 rounded-full text-xs font-bold transition-all ${
                timeSpeed === 2 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55]'
              }`}
              title="2x"
            >
              <FastForward className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Âm thanh */}
          <button
            onClick={toggleSound}
            className="p-1 rounded-full bg-[#FFF1F6] border border-[#FFD6E5] text-[#7C5C55] hover:bg-white transition-all shadow-sm"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-[#F7A8C4]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
