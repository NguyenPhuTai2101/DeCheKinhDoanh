import React from 'react';
import { useGameStore } from '../store/gameStore';
import { RESTAURANT_TYPES, EMPLOYEES } from '../../../shared/gameData';
import { STAGE_VISUALS } from '../utils/stageVisuals';
import { Employee } from '../../../shared/types';
import { Play, Pause, FastForward, Clock, Store, Users, Zap } from 'lucide-react';
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

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;
  const energyPercent = Math.round((gameState.player.energy / gameState.player.maxEnergy) * 100);

  const hiredList = gameState.hiredEmployees
    .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
    .filter(Boolean) as Employee[];

  const assignedStaff = hiredList.filter(
    (e) => (e.assignedRestaurantId || 'banh_mi') === activeRestId
  );

  const weather = gameState.weather || 'sunny';
  const weatherConfig = {
    sunny: { icon: '☀️', label: 'Nắng' },
    rainy: { icon: '🌧️', label: 'Mưa' },
    breezy: { icon: '🍃', label: 'Mát' },
  }[weather];

  const clickSpeed = (speed: 0 | 1 | 2) => {
    soundManager.playClick();
    setTimeSpeed(speed);
  };

  return (
    <header className="w-full bg-gradient-to-b from-[#FFF7FA] to-[#FFEDF3] border-b-2 border-[#FFCCD9] px-2.5 py-2 flex flex-col gap-1.5 shadow-[0_2px_12px_rgba(255,168,197,0.14)] z-30 shrink-0">
      {/* Hàng chính: thương hiệu, tiền, trạng thái cửa hàng */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('franchise');
          }}
          className="min-w-0 min-h-11 flex items-center gap-2 bg-white/95 px-2.5 rounded-2xl border-2 border-[#FFA8C5] shadow-2xs active:scale-[0.98] transition-transform text-left"
          aria-label="Quản lý chuỗi nhà hàng"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] border border-[#FFCCD9] flex items-center justify-center text-xl shrink-0">
            {currentRest.icon}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-black text-[#5C3A33] text-sm truncate">{currentRest.shortName}</span>
              <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-black shrink-0">
                Lv.{stageVisual.levelNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-extrabold">
              <span className="text-amber-700">⭐ {(gameState.rating ?? 75).toFixed(0)}</span>
              <span className="text-rose-700">🏆 {gameState.fame ?? gameState.reputation}</span>
            </div>
          </div>
        </button>

        <div className="min-h-11 flex items-center gap-1.5 bg-white px-2.5 rounded-2xl border-2 border-[#FFA8C5] shadow-2xs shrink-0">
          <span className="text-base">🪙</span>
          <span className={`font-black text-[12px] tracking-tight whitespace-nowrap ${gameState.money < 0 ? 'text-rose-600' : 'text-[#5C3A33]'}`}>
            {gameState.money.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            setShopOpen(!isShopOpen);
          }}
          className={`min-h-11 px-3 rounded-2xl font-black text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1.5 border border-white/70 shrink-0 ${
            isShopOpen
              ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
          }`}
        >
          <Store className="w-4 h-4 stroke-[2.5]" />
          <span>{isShopOpen ? 'Nghỉ' : 'Mở Cửa'}</span>
        </button>
      </div>

      {/* Hàng phụ: ngày giờ + cảnh báo tình trạng + tốc độ */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="min-w-0 flex items-center gap-1.5 overflow-hidden">
          <div className="h-9 flex items-center gap-1.5 bg-white/90 px-2.5 rounded-xl border border-[#FFD0DE] text-[11px] font-black text-[#6D4C41] shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#FF6584]" />
            <span>N{gameState.day} · {formatTime(gameState.gameTimeMinutes)}</span>
            <span title={weatherConfig.label}>{weatherConfig.icon}</span>
          </div>

          {assignedStaff.length === 0 && isShopOpen && (
            <button
              onClick={() => openModal('employees')}
              className="h-9 px-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 flex items-center gap-1 text-[10px] font-black shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thiếu NV</span>
            </button>
          )}

          {energyPercent < 40 && (
            <div className="h-9 px-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 flex items-center gap-1 text-[10px] font-black shrink-0">
              <Zap className="w-3.5 h-3.5" />
              <span>{energyPercent}%</span>
            </div>
          )}
        </div>

        <div className="h-9 flex items-center gap-1 bg-white p-1 rounded-xl border border-[#FFCCD9] shadow-2xs shrink-0">
          <button
            onClick={() => clickSpeed(0)}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-colors ${timeSpeed === 0 ? 'bg-[#FF6584] text-white' : 'text-[#8C6258]'}`}
            aria-label="Tạm dừng"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => clickSpeed(1)}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-colors ${timeSpeed === 1 ? 'bg-[#FF6584] text-white' : 'text-[#8C6258]'}`}
            aria-label="Tốc độ 1"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={() => clickSpeed(2)}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-colors ${timeSpeed === 2 ? 'bg-[#FF6584] text-white' : 'text-[#8C6258]'}`}
            aria-label="Tốc độ 2"
          >
            <FastForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </header>
  );
};
