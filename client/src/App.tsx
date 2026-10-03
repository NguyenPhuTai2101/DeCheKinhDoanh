import React, { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { CozyShopView } from './components/views/CozyShopView';
import { GameCanvas } from './components/GameCanvas';
import { CookingModal } from './components/modals/CookingModal';
import { MarketModal } from './components/modals/MarketModal';
import { UpgradesModal } from './components/modals/UpgradesModal';
import { EmployeesModal } from './components/modals/EmployeesModal';
import { DailySummaryModal } from './components/modals/DailySummaryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ToastNotification } from './components/ToastNotification';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const { activeModal, loadGame, saveLocal } = useGameStore();
  const [viewMode, setViewMode] = useState<'cozy_mobile' | 'pixel_2d'>('cozy_mobile');

  useEffect(() => {
    loadGame();

    const interval = setInterval(() => {
      saveLocal();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadGame, saveLocal]);

  return (
    <div className="w-full h-[100dvh] bg-[#FFF1F6] flex justify-center items-center overflow-hidden">
      {/* Container chuẩn phong cách Mobile-First (như Tiệm Trà Nhỏ) */}
      <div className="w-full max-w-md sm:max-w-lg h-full bg-[#FAF5EE] sm:shadow-2xl sm:border-x-2 border-[#FFD6E5] flex flex-col justify-between overflow-hidden relative">
        {/* 1. Thanh Header HUD */}
        <TopBar />

        {/* Nút chuyển đổi giao diện linh hoạt nếu muốn */}
        <div className="bg-[#FFF1F6] px-3 py-1 flex items-center justify-between border-b border-[#FFD6E5] text-[10px] text-[#7C5C55] font-bold shrink-0">
          <span className="flex items-center gap-1">
            🌸 Giao diện: <strong className="text-[#F7A8C4]">{viewMode === 'cozy_mobile' ? 'Tiệm Trà Nhỏ Mobile (Sắc nét)' : '2D Pixel Art Canvas'}</strong>
          </span>
          <button
            onClick={() => setViewMode(viewMode === 'cozy_mobile' ? 'pixel_2d' : 'cozy_mobile')}
            className="px-2 py-0.5 bg-white rounded-full border border-[#FFD6E5] text-[#7C5C55] hover:bg-[#FFD6E5] transition-all active:scale-95"
          >
            Đổi sang {viewMode === 'cozy_mobile' ? '🕹️ 2D Canvas' : '📱 Giao diện Sắc Nét'}
          </button>
        </div>

        {/* 2. Khu vực hiển thị trò chơi chính */}
        <main className="flex-1 w-full relative overflow-hidden flex flex-col min-h-0 bg-[#FAF5EE]">
          {viewMode === 'cozy_mobile' ? <CozyShopView /> : <GameCanvas />}
        </main>

        {/* 3. Thanh điều hướng dưới cùng */}
        <BottomBar />

        {/* 4. Các Popup & Cửa sổ tương tác */}
        {activeModal === 'cooking' && <CookingModal />}
        {activeModal === 'market' && <MarketModal />}
        {activeModal === 'upgrades' && <UpgradesModal />}
        {activeModal === 'employees' && <EmployeesModal />}
        {activeModal === 'dailySummary' && <DailySummaryModal />}
        {activeModal === 'settings' && <SettingsModal />}

        {/* 5. Thông báo nhẹ */}
        <ToastNotification />
      </div>
    </div>
  );
};

export default App;
