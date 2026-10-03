import React from 'react';
import { useGameStore, ModalType } from '../store/gameStore';
import { Utensils, ShoppingBag, ArrowUpCircle, Users, Moon, Settings } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const BottomBar: React.FC = () => {
  const { openModal, gameState } = useGameStore();

  const handleOpen = (modal: ModalType) => {
    soundManager.playClick();
    openModal(modal);
  };

  const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);

  return (
    <nav className="w-full bg-[#FAF5EE] border-t-2 border-[#FFD6E5] py-1.5 px-2 flex items-center justify-around gap-1 shadow-lg z-30 shrink-0">
      {/* 1. Nấu ăn */}
      <button
        onClick={() => handleOpen('cooking')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-[#F7A8C4] group-hover:bg-[#F7A8C4] group-hover:text-white transition-all shadow-sm">
          <Utensils className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">Nấu Ăn</span>
      </button>

      {/* 2. Đi chợ */}
      <button
        onClick={() => handleOpen('market')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90 relative"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF7ED] border-2 border-[#F7D7BA] flex items-center justify-center text-amber-600 group-hover:bg-amber-400 group-hover:text-white transition-all shadow-sm">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">
          Chợ <span className="hidden sm:inline">({currentStock})</span>
        </span>
      </button>

      {/* 3. Nâng cấp */}
      <button
        onClick={() => handleOpen('upgrades')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8F5E9] border-2 border-[#A5D6A7] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-400 group-hover:text-white transition-all shadow-sm">
          <ArrowUpCircle className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">Nâng Cấp</span>
      </button>

      {/* 4. Nhân sự */}
      <button
        onClick={() => handleOpen('employees')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EDE7F6] border-2 border-[#D1C4E9] flex items-center justify-center text-purple-600 group-hover:bg-purple-400 group-hover:text-white transition-all shadow-sm">
          <Users className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">Nhân Sự</span>
      </button>

      {/* 5. Đi ngủ */}
      <button
        onClick={() => handleOpen('dailySummary')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E0F2FE] border-2 border-[#BAE6FD] flex items-center justify-center text-sky-600 group-hover:bg-sky-400 group-hover:text-white transition-all shadow-sm">
          <Moon className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">Đi Ngủ</span>
      </button>

      {/* 6. Cài đặt */}
      <button
        onClick={() => handleOpen('settings')}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF1F6] border-2 border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] group-hover:bg-[#7C5C55] group-hover:text-white transition-all shadow-sm">
          <Settings className="w-4 h-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold">Cài Đặt</span>
      </button>
    </nav>
  );
};
