import React, { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
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

  useEffect(() => {
    // 1. Nạp save game lúc khởi động
    loadGame();

    // 2. Tự động lưu game định kỳ mỗi 30 giây (Theo chuẩn GDD mục 75)
    const interval = setInterval(() => {
      saveLocal();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadGame, saveLocal]);

  return (
    <div className="w-full h-screen flex flex-col justify-between bg-[#FFF1F6] overflow-hidden select-none">
      {/* 1. Header HUD */}
      <TopBar />

      {/* 2. Phaser Canvas Screen (Khuôn viên nhà hàng) */}
      <main className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
        <GameCanvas />
      </main>

      {/* 3. Bottom Navigation Bar */}
      <BottomBar />

      {/* 4. Modals */}
      {activeModal === 'cooking' && <CookingModal />}
      {activeModal === 'market' && <MarketModal />}
      {activeModal === 'upgrades' && <UpgradesModal />}
      {activeModal === 'employees' && <EmployeesModal />}
      {activeModal === 'dailySummary' && <DailySummaryModal />}
      {activeModal === 'settings' && <SettingsModal />}

      {/* 5. Toast Thông Báo */}
      <ToastNotification />
    </div>
  );
};

export default App;
