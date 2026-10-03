import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Pause, FastForward, Clock, Zap, Award, Store, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const TopBar: React.FC = () => {
  const { gameState, isShopOpen, setShopOpen, timeSpeed, setTimeSpeed } = useGameStore();
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

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-[#FFD6E5] px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm z-30 shrink-0">
      {/* Hàng 1 trên Mobile: Tên quán, Tiền mặt, Nút Mở/Đóng */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-lg shadow-inner">
            🌸
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#7C5C55] text-xs sm:text-sm">
                {gameState.player.name}
              </span>
              <span className="text-[10px] bg-[#FFD6E5] text-[#7C5C55] px-1.5 py-0.2 rounded-full font-bold">
                Cấp {gameState.player.cookingLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#9C7C75] font-semibold">
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-[#F7A8C4]" />
                N{gameState.day} • {formatTime(gameState.gameTimeMinutes)}
              </span>
              <span className="flex items-center gap-0.5">
                <Award className="w-3 h-3 text-amber-500" />
                {gameState.reputation}⭐
              </span>
            </div>
          </div>
        </div>

        {/* Tiền mặt & Nút Mở cửa trên Mobile */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <div className="flex items-center gap-1 bg-[#FFF1F6] px-2.5 py-1 rounded-full border border-[#F7A8C4]">
            <span className="text-xs">💰</span>
            <span className="font-black text-xs text-[#7C5C55]">
              {gameState.money.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setShopOpen(!isShopOpen);
            }}
            className={`px-3 py-1 rounded-full font-black text-[11px] shadow-sm transition-all active:scale-95 ${
              isShopOpen
                ? 'bg-rose-400 text-white'
                : 'bg-[#F7A8C4] text-white'
            }`}
          >
            {isShopOpen ? 'Nghỉ' : 'Mở Cửa'}
          </button>
        </div>
      </div>

      {/* Hàng 2 trên Mobile / Cụm giữa & phải trên Desktop */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
        {/* Năng lượng */}
        <div className="flex items-center gap-1.5 bg-[#FFF7ED] px-2.5 py-1 rounded-full border border-[#F7D7BA]">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#7C5C55]">
            <span>{energyPercent}%</span>
            <div className="w-12 sm:w-16 h-1.5 bg-[#FFE6A7]/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  energyPercent > 30 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tiền mặt trên Desktop */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#FFF1F6] px-3 py-1 rounded-full border-2 border-[#F7A8C4]">
          <span>💰</span>
          <span className="font-black text-sm text-[#7C5C55]">
            {gameState.money.toLocaleString('vi-VN')} <span className="text-[10px]">đ</span>
          </span>
        </div>

        {/* Bộ điều khiển tốc độ & Âm thanh */}
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
              <Pause className="w-3 h-3" />
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
              <Play className="w-3 h-3" />
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
              <FastForward className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-[#FFF1F6] border border-[#FFD6E5] text-[#7C5C55] hover:bg-white transition-all shadow-sm"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#F7A8C4]" />}
          </button>

          {/* Nút Mở/Đóng cửa trên Desktop */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShopOpen(!isShopOpen);
            }}
            className={`hidden sm:flex px-4 py-1.5 rounded-full font-bold text-xs items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
              isShopOpen
                ? 'bg-rose-400 text-white hover:bg-rose-500'
                : 'bg-[#F7A8C4] text-white hover:bg-[#f28bb1]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{isShopOpen ? 'Tạm Nghỉ' : 'Mở Cửa Đón Khách'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
