import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Pause, FastForward, Clock, Zap, Award, Sparkles, Store, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const TopBar: React.FC = () => {
  const { gameState, isShopOpen, setShopOpen, timeSpeed, setTimeSpeed, endDayAndSleep } = useGameStore();
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Đổi số phút sang định dạng hh:mm
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const energyPercent = Math.round((gameState.player.energy / gameState.player.maxEnergy) * 100);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b-2 border-[#FFD6E5] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm z-30">
      {/* Tiêu đề & Cấp độ */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-xl shadow-inner">
          🌸
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#7C5C55] text-base leading-tight">
              {gameState.player.name}
            </span>
            <span className="text-xs bg-[#FFD6E5] text-[#7C5C55] px-2 py-0.5 rounded-full font-bold">
              Bếp Cấp {gameState.player.cookingLevel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#9C7C75] mt-0.5 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F7A8C4]" />
              Ngày {gameState.day} • {formatTime(gameState.gameTimeMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {gameState.reputation} Uy tín
            </span>
          </div>
        </div>
      </div>

      {/* Thông số Tài chính & Năng lượng */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Năng lượng */}
        <div className="flex items-center gap-2 bg-[#FFF7ED] px-3 py-1.5 rounded-full border border-[#F7D7BA]">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
          <div className="flex flex-col">
            <div className="flex justify-between text-[11px] font-bold text-[#7C5C55] gap-2">
              <span>Sức lực</span>
              <span>{energyPercent}%</span>
            </div>
            <div className="w-20 h-2 bg-[#FFE6A7]/40 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  energyPercent > 30 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tiền mặt */}
        <div className="flex items-center gap-2 bg-[#FFF1F6] px-4 py-1.5 rounded-full border-2 border-[#F7A8C4] shadow-sm">
          <span className="text-lg">💰</span>
          <span className="font-black text-base text-[#7C5C55]">
            {gameState.money.toLocaleString('vi-VN')} <span className="text-xs font-bold text-[#9C7C75]">đ</span>
          </span>
        </div>
      </div>

      {/* Điều khiển Cửa hàng & Tốc độ thời gian */}
      <div className="flex items-center gap-2">
        {/* Nút Tốc độ */}
        <div className="flex items-center bg-[#FFF1F6] p-1 rounded-full border border-[#FFD6E5]">
          <button
            onClick={() => setTimeSpeed(0)}
            className={`p-1.5 rounded-full text-xs transition-all ${
              timeSpeed === 0 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55] hover:bg-white'
            }`}
            title="Tạm dừng thời gian"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTimeSpeed(1)}
            className={`p-1.5 rounded-full text-xs font-bold transition-all ${
              timeSpeed === 1 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55] hover:bg-white'
            }`}
            title="Tốc độ bình thường (1x)"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTimeSpeed(2)}
            className={`p-1.5 rounded-full text-xs font-bold transition-all ${
              timeSpeed === 2 ? 'bg-[#F7A8C4] text-white shadow-sm' : 'text-[#7C5C55] hover:bg-white'
            }`}
            title="Tăng tốc (2x)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nút Âm Thanh */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-[#FFF1F6] border border-[#FFD6E5] text-[#7C5C55] hover:bg-white transition-all shadow-sm"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#F7A8C4]" />}
        </button>

        {/* Nút Mở / Đóng cửa */}
        <button
          onClick={() => setShopOpen(!isShopOpen)}
          className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
            isShopOpen
              ? 'bg-rose-400 text-white hover:bg-rose-500 shadow-rose-200'
              : 'bg-[#F7A8C4] text-white hover:bg-[#f28bb1] shadow-pink-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{isShopOpen ? 'Tạm Nghỉ Đón Khách' : 'Mở Cửa Đón Khách'}</span>
        </button>
      </div>
    </header>
  );
};
