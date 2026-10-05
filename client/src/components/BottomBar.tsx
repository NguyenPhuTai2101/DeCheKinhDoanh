import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/soundManager';
import {
  BookOpen,
  ShoppingBag,
  Utensils,
  ArrowUpCircle,
  LayoutGrid,
  Store,
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { openModal, gameState, deliveryOrders, currentView, setCurrentView } = useGameStore();

  const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
  const pendingDeliveries = deliveryOrders.filter((d) => d.status !== 'delivering').length;
  const hasEvent = !!gameState.currentEvent;
  const hasMoreAlert = hasEvent || pendingDeliveries > 0;

  return (
    <nav className="w-full bg-gradient-to-t from-[#FFEBF2] via-[#FFF5F8]/95 to-[#FFF8FA]/90 backdrop-blur-md border-t-2 border-[#FFCCD9] shadow-[0_-4px_16px_rgba(255,168,197,0.18)] z-30 shrink-0 relative px-2 pt-1.5 pb-2.5 sm:pb-3.5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.65rem)' }}>
      <div className="w-full grid grid-cols-5 items-center gap-1 sm:gap-2">
        {/* NÚT 1: CÔNG THỨC NẤU ĂN (SỔ TAY MÓN ĂN & MENU) */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('cooking');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-2xl active:scale-95 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#FFF0F5] border-2 border-[#FFCCD9] text-[#E91E63] flex items-center justify-center transition-all shadow-2xs group-hover:bg-white group-hover:scale-105 group-hover:border-[#FF8EA3]">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#5C3A33] group-hover:text-[#E91E63] leading-tight transition-colors">
            Công Thức
          </span>
        </button>

        {/* NÚT 2: CHỢ NGUYÊN LIỆU */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('market');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-2xl active:scale-95 transition-all group relative cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#FFF9E6] border-2 border-[#FFE082] text-amber-700 flex items-center justify-center transition-all shadow-2xs group-hover:bg-white group-hover:scale-105">
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#5C3A33] group-hover:text-amber-700 leading-tight flex items-center gap-0.5 transition-colors">
            <span>Chợ</span>
            <span className="text-[7.5px] bg-gradient-to-r from-[#FF6584] to-[#F43F5E] text-white px-1 py-0.2 rounded-full font-black shadow-2xs">
              {currentStock}
            </span>
          </span>
        </button>

        {/* NÚT 3: VÀO BẾP / RA PHỐ (TRỌNG TÂM - TO VÀ NỔI BẬT NHẤT Ở GIỮA) */}
        <button
          onClick={() => {
            soundManager.playClick();
            setCurrentView(currentView === 'street' ? 'shop' : 'street');
          }}
          className="flex flex-col items-center justify-center -mt-3 sm:-mt-3.5 active:scale-90 transition-all group cursor-pointer"
          title={currentView === 'street' ? 'Bấm để vào bếp chuẩn bị món' : 'Bấm để ra đường quan sát'}
        >
          <div
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full text-white flex items-center justify-center shadow-[0_4px_16px_rgba(255,101,132,0.4)] border-2 sm:border-3 border-white ring-3 sm:ring-4 transition-all group-hover:brightness-105 animate-bounce-short ${
              currentView === 'street'
                ? 'bg-gradient-to-tr from-[#FF5E86] via-[#FF7597] to-[#FFA07A] ring-[#FFD0DE]'
                : 'bg-gradient-to-tr from-[#FF6B8B] via-[#FFA07A] to-[#FFD166] ring-[#FFE0CC]'
            }`}
          >
            {currentView === 'street' ? (
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.6] drop-shadow-xs" />
            ) : (
              <Store className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.6] drop-shadow-xs" />
            )}
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-black mt-0.5 leading-tight tracking-tight drop-shadow-2xs ${
              currentView === 'street' ? 'text-[#E91E63]' : 'text-[#D97706]'
            }`}
          >
            {currentView === 'street' ? 'Vào Bếp 🍳' : 'Ra Phố 🛵'}
          </span>
        </button>

        {/* NÚT 4: NÂNG CẤP QUÁN */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('upgrades');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-2xl active:scale-95 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#E8F8F0] border-2 border-[#A7F3D0] text-emerald-700 flex items-center justify-center transition-all shadow-2xs group-hover:bg-white group-hover:scale-105">
            <ArrowUpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#5C3A33] group-hover:text-emerald-700 leading-tight transition-colors">
            Nâng Cấp
          </span>
        </button>

        {/* NÚT 5: MENU THÊM */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('menuMore');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-2xl active:scale-95 transition-all group relative cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#F5EEFB] border-2 border-[#DDD6FE] text-purple-700 flex items-center justify-center transition-all shadow-2xs group-hover:bg-white group-hover:scale-105 relative">
            <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
            {hasMoreAlert && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
            {hasMoreAlert && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#5C3A33] group-hover:text-purple-700 leading-tight transition-colors">
            Thêm ✨
          </span>
        </button>
      </div>
    </nav>
  );
};
