import React from 'react';
import { useGameStore } from '../store/gameStore';

export const ToastNotification: React.FC = () => {
  const toastMessage = useGameStore((state) => state.toastMessage);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce-short">
      <div className="bg-white/95 border-2 border-[#F7A8C4] text-[#7C5C55] px-5 py-2.5 rounded-full shadow-xl backdrop-blur-md font-bold text-xs flex items-center gap-2">
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
