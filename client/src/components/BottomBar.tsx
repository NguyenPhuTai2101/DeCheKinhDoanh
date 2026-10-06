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

  const navButtonClass =
    'min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-transform group cursor-pointer';

  return (
    <nav
      className="w-full bg-gradient-to-t from-[#FFEBF2] via-[#FFF5F8]/98 to-[#FFF8FA]/95 backdrop-blur-md border-t-2 border-[#FFCCD9] shadow-[0_-4px_16px_rgba(255,168,197,0.16)] z-30 shrink-0 relative px-2 pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.65rem)' }}
    >
      <div className="w-full grid grid-cols-5 items-end gap-1">
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('cooking');
          }}
          className={navButtonClass}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border-2 border-[#FFCCD9] text-[#E91E63] flex items-center justify-center shadow-2xs">
            <BookOpen className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span className="text-[11px] font-black text-[#5C3A33] leading-none">Công Thức</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            openModal('market');
          }}
          className={`${navButtonClass} relative`}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] border-2 border-[#FFE082] text-amber-700 flex items-center justify-center shadow-2xs relative">
            <ShoppingBag className="w-5 h-5 stroke-[2.4]" />
            {currentStock <= 10 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-rose-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                !
              </span>
            )}
          </div>
          <span className="text-[11px] font-black text-[#5C3A33] leading-none">
            Chợ <span className="text-[9px] text-rose-600">({currentStock})</span>
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setCurrentView(currentView === 'street' ? 'shop' : 'street');
          }}
          className="min-h-[62px] flex flex-col items-center justify-end -mt-4 active:scale-95 transition-transform group cursor-pointer"
          aria-label={currentView === 'street' ? 'Vào bếp' : 'Ra phố'}
        >
          <div
            className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-[0_5px_18px_rgba(255,101,132,0.36)] border-3 border-white ring-4 transition-colors ${
              currentView === 'street'
                ? 'bg-gradient-to-tr from-[#FF5E86] via-[#FF7597] to-[#FFA07A] ring-[#FFD0DE]'
                : 'bg-gradient-to-tr from-[#FF6B8B] via-[#FFA07A] to-[#FFD166] ring-[#FFE0CC]'
            }`}
          >
            {currentView === 'street' ? (
              <Utensils className="w-6 h-6 stroke-[2.6]" />
            ) : (
              <Store className="w-6 h-6 stroke-[2.6]" />
            )}
          </div>
          <span
            className={`text-[11px] font-black mt-1 leading-none ${
              currentView === 'street' ? 'text-[#E91E63]' : 'text-[#D97706]'
            }`}
          >
            {currentView === 'street' ? 'Vào Bếp' : 'Ra Phố'}
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            openModal('upgrades');
          }}
          className={navButtonClass}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E8F8F0] border-2 border-[#A7F3D0] text-emerald-700 flex items-center justify-center shadow-2xs">
            <ArrowUpCircle className="w-5 h-5 stroke-[2.4]" />
          </div>
          <span className="text-[11px] font-black text-[#5C3A33] leading-none">Nâng Cấp</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            openModal('menuMore');
          }}
          className={`${navButtonClass} relative`}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F5EEFB] border-2 border-[#DDD6FE] text-purple-700 flex items-center justify-center shadow-2xs relative">
            <LayoutGrid className="w-5 h-5 stroke-[2.4]" />
            {hasMoreAlert && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                {pendingDeliveries > 0 ? pendingDeliveries : '!'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-black text-[#5C3A33] leading-none">Thêm</span>
        </button>
      </div>
    </nav>
  );
};
