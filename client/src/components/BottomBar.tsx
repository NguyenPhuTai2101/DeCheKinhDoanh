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
  Bike,
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { openModal, gameState, deliveryOrders, currentView, setCurrentView } = useGameStore();

  const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
  const pendingDeliveries = deliveryOrders.filter((d) => d.status !== 'delivering').length;
  const hasEvent = !!gameState.currentEvent;
  const hasMoreAlert = hasEvent || pendingDeliveries > 0;

  return (
    <nav className="w-full bg-[#FAF5EE] border-t-2 border-[#FFD6E5] shadow-lg z-30 shrink-0 relative px-2 py-1.5 sm:py-2">
      <div className="w-full grid grid-cols-5 items-center gap-1 sm:gap-2">
        {/* NÚT 1: CÔNG THỨC NẤU ĂN (SỔ TAY MÓN ĂN & MENU) */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('cooking');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center transition-all shadow-xs group-hover:bg-rose-100">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-[#7C5C55] leading-tight">
            Công Thức
          </span>
        </button>

        {/* NÚT 2: CHỢ NGUYÊN LIỆU */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('market');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl active:scale-95 transition-all group relative"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center transition-all shadow-xs group-hover:bg-amber-100">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-[#7C5C55] leading-tight flex items-center gap-0.5">
            <span>Chợ</span>
            <span className="text-[8px] bg-amber-200 text-amber-900 px-1 rounded-full font-bold">
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
          className="flex flex-col items-center justify-center -mt-3 active:scale-90 transition-all group"
          title={currentView === 'street' ? 'Bấm để vào bếp chuẩn bị món' : 'Bấm để ra đường quan sát'}
        >
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 group-hover:brightness-110 animate-bounce-short transition-all ${
              currentView === 'street'
                ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 ring-pink-300'
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-400 ring-amber-300'
            }`}
          >
            {currentView === 'street' ? (
              <Utensils className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            ) : (
              <Store className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-black mt-0.5 leading-tight ${
              currentView === 'street' ? 'text-rose-600' : 'text-amber-700'
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
          className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl active:scale-95 transition-all group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center transition-all shadow-xs group-hover:bg-emerald-100">
            <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-[#7C5C55] leading-tight">
            Nâng Cấp
          </span>
        </button>

        {/* NÚT 5: MENU THÊM (GOM TIỆN ÍCH PHỤ: NHÂN SỰ, DECOR, GIAO HÀNG, SỰ KIỆN...) */}
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('menuMore');
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl active:scale-95 transition-all group relative"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center transition-all shadow-xs group-hover:bg-purple-100 relative">
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            {hasMoreAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
            {hasMoreAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-black text-[#7C5C55] leading-tight">
            Thêm ✨
          </span>
        </button>
      </div>
    </nav>
  );
};
