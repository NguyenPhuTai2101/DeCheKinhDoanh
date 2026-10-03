import React, { useState } from 'react';
import { gameBridge } from '../game/gameBridge';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';

export const MobileDPad: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const startMove = (vx: number, vy: number) => {
    gameBridge.sendMoveInput(vx, vy);
  };

  const stopMove = () => {
    gameBridge.sendMoveInput(0, 0);
  };

  return (
    <div className="absolute bottom-16 left-3 z-20 flex flex-col items-center select-none pointer-events-auto">
      {/* Nút bật/tắt D-Pad */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-8 h-8 rounded-full bg-white/90 border border-[#FFD6E5] text-[#7C5C55] flex items-center justify-center shadow-md mb-2 hover:bg-[#FFF1F6] active:scale-95"
        title="Bật/Tắt phím di chuyển trên màn hình"
      >
        <Gamepad2 className="w-4 h-4 text-[#F7A8C4]" />
      </button>

      {/* Cụm 4 phím điều hướng */}
      {isVisible && (
        <div className="grid grid-cols-3 gap-1 bg-white/80 p-2 rounded-3xl border-2 border-[#FFD6E5] shadow-xl backdrop-blur-md">
          <div />
          {/* Lên */}
          <button
            onPointerDown={() => startMove(0, -1)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] active:bg-[#F7A8C4] active:text-white shadow-sm transition-transform active:scale-90"
          >
            <ChevronUp className="w-6 h-6 stroke-[3]" />
          </button>
          <div />

          {/* Trái */}
          <button
            onPointerDown={() => startMove(-1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] active:bg-[#F7A8C4] active:text-white shadow-sm transition-transform active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Trung tâm */}
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1F6] border border-[#FFD6E5] flex items-center justify-center text-xs font-bold text-[#F7A8C4]">
            🌸
          </div>

          {/* Phải */}
          <button
            onPointerDown={() => startMove(1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] active:bg-[#F7A8C4] active:text-white shadow-sm transition-transform active:scale-90"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>

          <div />
          {/* Xuống */}
          <button
            onPointerDown={() => startMove(0, 1)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#F7D7BA] flex items-center justify-center text-[#7C5C55] active:bg-[#F7A8C4] active:text-white shadow-sm transition-transform active:scale-90"
          >
            <ChevronDown className="w-6 h-6 stroke-[3]" />
          </button>
          <div />
        </div>
      )}
    </div>
  );
};
