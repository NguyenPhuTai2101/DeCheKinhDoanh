import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BUSINESS_STAGES, RESTAURANT_TYPES, EMPLOYEES } from '../../../shared/gameData';
import { STAGE_VISUALS } from '../utils/stageVisuals';
import { Employee } from '../../../shared/types';
import { Play, Pause, FastForward, Clock, Zap, Store, Volume2, VolumeX, Users } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const TopBar: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    setShopOpen,
    timeSpeed,
    setTimeSpeed,
    openModal,
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
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;

  // Tính số nhân viên được xếp ca tại quán hiện tại
  const hiredList = gameState.hiredEmployees.map(
    (id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id)
  ).filter(Boolean) as Employee[];
  const assignedStaff = hiredList.filter(
    (e) => (e.assignedRestaurantId || 'banh_mi') === activeRestId
  );

  const weather = gameState.weather || 'sunny';
  const weatherConfig = {
    sunny: { icon: '☀️', label: 'Nắng', title: 'Trời nắng: Đồ uống mát lạnh được chuộng, tip +20%!' },
    rainy: { icon: '🌧️', label: 'Mưa', title: 'Trời mưa: Khách ngồi lại ít hơn, đơn ship hàng nổ liên tục!' },
    breezy: { icon: '🍃', label: 'Mát', title: 'Gió mát: Khách kiên nhẫn hơn, tip +25%!' },
  }[weather];

  return (
    <header className="w-full bg-gradient-to-b from-[#FFF5F8] to-[#FFEBF1] border-b-2 border-[#FFCCD9] px-2 sm:px-3 py-1.5 sm:py-2 flex flex-col gap-1.5 shadow-[0_2px_12px_rgba(255,168,197,0.15)] z-30 shrink-0">
      {/* Hàng 1: Quán ăn & Cấp độ, Tiền mặt & Nút Mở Cửa - Chuẩn Mobile Responsive */}
      <div className="w-full flex items-center justify-between gap-1.5">
        {/* Tên Quán, Cấp Độ, Danh Tiếng (Fame) & Điểm Đánh Giá (Rating) */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('franchise');
          }}
          className="flex items-center gap-1.5 bg-white/95 hover:bg-white px-2 py-1 rounded-2xl border-2 border-[#FFA8C5] shadow-2xs active:scale-95 transition-all text-left shrink-0 group cursor-pointer"
          title="Bấm để Quản lý Chuỗi Nhà Hàng & Đổi Quán Ăn"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF0F5] border border-[#FFCCD9] flex items-center justify-center text-base sm:text-lg shadow-2xs shrink-0 group-hover:scale-105 transition-all">
            {currentRest.icon}
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-black text-[#5C3A33] text-xs sm:text-sm group-hover:text-[#E91E63] transition-colors truncate max-w-[70px] sm:max-w-[100px]">
                {currentRest.shortName}
              </span>
              <span className="text-[7.5px] sm:text-[8px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded-full font-black shrink-0">
                Lv.{stageVisual.levelNumber}
              </span>
              <span className="text-[9px] text-[#E91E63] font-black">▾</span>
            </div>
            <div className="text-[8.5px] sm:text-[9.5px] text-amber-800 font-extrabold flex items-center gap-1.5 mt-0.5">
              <span title="Điểm Đánh Giá Chất Lượng Dịch Vụ (0 - 100)">
                ⭐ {(gameState.rating ?? 75).toFixed(0)}
              </span>
              <span className="text-[#FFA8C5]">|</span>
              <span title="Điểm Danh Tiếng Doanh Nghiệp (Fame)">
                🏆 {gameState.fame ?? gameState.reputation}
              </span>
            </div>
          </div>
        </button>

        {/* Nút Thực Đơn & Định Giá Món */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('menuPricing');
          }}
          className="flex items-center gap-1 bg-white/90 hover:bg-white px-2 py-1 rounded-2xl border border-[#FFA8C5] shadow-2xs active:scale-95 transition-all text-xs font-black text-[#6D4C41] cursor-pointer"
          title="Chọn Món Bán & Thiết Lập Giá Bán Hôm Nay"
        >
          <span className="text-sm">📋</span>
          <span className="hidden sm:inline">Menu & Giá</span>
        </button>

        {/* Tiền mặt - To, Nổi Bật Ở Giữa */}
        <div className="flex items-center gap-1 bg-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border-2 border-[#FFA8C5] shadow-[0_2px_8px_rgba(255,168,197,0.2)] shrink-0">
          <span className="text-sm sm:text-base">🪙</span>
          <span className={`font-black text-xs sm:text-sm tracking-tight ${gameState.money < 0 ? 'text-rose-600' : 'text-[#5C3A33]'}`}>
            {gameState.money.toLocaleString('vi-VN')} <span className="text-[9px] sm:text-[10px] font-black text-[#E91E63]">đ</span>
          </span>
        </div>

        {/* Nút Mở Cửa / Nghỉ Bán - Nút To, Dễ Chạm Bấm */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShopOpen(!isShopOpen);
          }}
          className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full font-black text-[11px] sm:text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1 border border-white/70 shrink-0 cursor-pointer ${
            isShopOpen
              ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] text-white hover:brightness-105'
              : 'bg-gradient-to-r from-[#FFA8BC] to-[#FF85A2] text-white hover:brightness-105 animate-pulse'
          }`}
        >
          <Store className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isShopOpen ? 'Nghỉ Bán' : 'Mở Cửa ✨'}</span>
        </button>
      </div>

      {/* Hàng 2: Nhân Sự, Sức Lực, Lịch Ngày Giờ, Thời Tiết & Cụm Nút Điều Khiển */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-[#FFDCE5]">
        {/* Nhân sự trực quán (Nhấn mở xếp ca) */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('employees');
          }}
          className="flex items-center gap-1 bg-white/95 hover:bg-white px-2 py-0.5 rounded-full border border-[#FFD0DE] shadow-2xs shrink-0 active:scale-95 transition-all cursor-pointer group"
          title="Nhân sự trực quán: Nhấn để xem & xếp ca"
        >
          <Users className="w-3 h-3 text-[#FF6584]" />
          <span className="text-[10px] sm:text-[11px] font-black text-[#6D4C41]">{assignedStaff.length} NV</span>
          <span className="text-[7.5px] text-[#E91E63] font-bold">▾</span>
        </button>

        {/* Năng lượng (Sức lực) */}
        <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-[#FFD0DE] shadow-2xs shrink-0">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
          <span className="font-black text-[#6D4C41] text-[10px] sm:text-[11px]">Sức</span>
          <div className="w-10 sm:w-14 h-1.5 bg-[#FFE6EE] rounded-full overflow-hidden p-0.2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                energyPercent > 30 ? 'bg-gradient-to-r from-amber-400 to-[#FF8EA3]' : 'bg-rose-500'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
          <span className="font-black text-[#6D4C41] text-[9px]">{energyPercent}%</span>
        </div>

        {/* Lịch Ngày, Giờ & Thời Tiết */}
        <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-[#FFD0DE] shadow-2xs text-[10px] sm:text-[11px] font-black text-[#6D4C41] shrink-0">
          <Clock className="w-3 h-3 text-[#FF6584] shrink-0" />
          <span>N{gameState.day} · {formatTime(gameState.gameTimeMinutes)}</span>
          <span
            className="ml-0.5 px-1 py-0.2 rounded-full text-[9px] bg-[#FFF0F5] border border-[#FFCCD9] cursor-help flex items-center gap-0.5"
            title={weatherConfig.title}
          >
            <span>{weatherConfig.icon}</span>
          </span>
        </div>

        {/* Tốc độ & Âm thanh */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-white p-0.5 rounded-full border border-[#FFCCD9] shadow-2xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(0);
              }}
              className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                timeSpeed === 0 ? 'bg-[#FF6584] text-white shadow-2xs' : 'text-[#8C6258] hover:text-[#5C3A33]'
              }`}
              title="Tạm dừng"
            >
              <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(1);
              }}
              className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                timeSpeed === 1 ? 'bg-[#FF6584] text-white shadow-2xs' : 'text-[#8C6258] hover:text-[#5C3A33]'
              }`}
              title="Tốc độ 1x"
            >
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTimeSpeed(2);
              }}
              className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                timeSpeed === 2 ? 'bg-[#FF6584] text-white shadow-2xs' : 'text-[#8C6258] hover:text-[#5C3A33]'
              }`}
              title="Tốc độ 2x"
            >
              <FastForward className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            </button>
          </div>

          <button
            onClick={toggleSound}
            className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white border border-[#FFCCD9] flex items-center justify-center text-[#8C6258] hover:text-[#FF6584] transition-all shadow-2xs active:scale-95"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3 text-[#FF6584]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
