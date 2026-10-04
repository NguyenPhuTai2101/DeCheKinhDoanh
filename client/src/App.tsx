import React, { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { CozyShopView } from './components/views/CozyShopView';
import { StreetMapView } from './components/views/StreetMapView';
import { CookingModal } from './components/modals/CookingModal';
import { MarketModal } from './components/modals/MarketModal';
import { UpgradesModal } from './components/modals/UpgradesModal';
import { EmployeesModal } from './components/modals/EmployeesModal';
import { DecorModal } from './components/modals/DecorModal';
import { DailySummaryModal } from './components/modals/DailySummaryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { NeighborsModal } from './components/modals/NeighborsModal';
import { StreetEventsModal } from './components/modals/StreetEventsModal';
import { LedgerModal } from './components/modals/LedgerModal';
import { DeliveryModal } from './components/modals/DeliveryModal';
import { LotteryDrawModal } from './components/modals/LotteryDrawModal';
import { StarterSelectionModal } from './components/modals/StarterSelectionModal';
import { FranchiseModal } from './components/modals/FranchiseModal';
import { MenuMoreDrawer } from './components/modals/MenuMoreDrawer';
import { ToastNotification } from './components/ToastNotification';
import { useGameStore } from './store/gameStore';
import { useGameSimulation } from './hooks/useGameSimulation';

export const App: React.FC = () => {
  const { activeModal, currentView, loadGame, saveLocal, gameState } = useGameStore();

  // Chạy vòng lặp mô phỏng & nhân viên tự động trên toàn bộ game
  useGameSimulation();

  useEffect(() => {
    loadGame();

    const interval = setInterval(() => {
      saveLocal();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadGame, saveLocal]);

  return (
    <div className="w-full h-[100dvh] bg-[#FFF1F6] flex justify-center items-center overflow-hidden">
      {/* Container chuẩn phong cách Mobile-First (Đế Chế Vỉa Hè & Tiệm Trà Nhỏ) */}
      <div className="w-full max-w-md sm:max-w-lg h-full bg-[#FAF5EE] sm:shadow-2xl sm:border-x-2 border-[#FFD6E5] flex flex-col justify-between overflow-hidden relative">
        {/* 1. Thanh Header HUD Vỉa Hè */}
        <TopBar />

        {/* 2. Khu vực hiển thị trò chơi chính: Quầy Hàng (Bếp) ⇄ Ra Đường Quan Sát (Phố Vỉa Hè) */}
        <main className="flex-1 w-full relative overflow-hidden flex flex-col min-h-0 bg-[#FAF5EE]">
          {currentView === 'street' ? <StreetMapView /> : <CozyShopView />}
        </main>

        {/* 3. Thanh điều hướng dưới cùng */}
        <BottomBar />

        {/* 4. Các Popup & Cửa sổ tương tác */}
        {(!gameState.hasChosenStarter || activeModal === 'starterSelection') && (
          <StarterSelectionModal />
        )}
        {activeModal === 'franchise' && <FranchiseModal />}
        {activeModal === 'cooking' && <CookingModal />}
        {activeModal === 'market' && <MarketModal />}
        {activeModal === 'upgrades' && <UpgradesModal />}
        {activeModal === 'employees' && <EmployeesModal />}
        {activeModal === 'decor' && <DecorModal />}
        {activeModal === 'dailySummary' && <DailySummaryModal />}
        {activeModal === 'settings' && <SettingsModal />}
        {activeModal === 'neighbors' && <NeighborsModal />}
        {activeModal === 'streetEvents' && <StreetEventsModal />}
        {activeModal === 'ledger' && <LedgerModal />}
        {activeModal === 'delivery' && <DeliveryModal />}
        {activeModal === 'lotteryDraw' && <LotteryDrawModal />}
        {activeModal === 'menuMore' && <MenuMoreDrawer />}

        {/* 5. Thông báo nổi (Toast & Floating feedback) */}
        <ToastNotification />
      </div>
    </div>
  );
};

export default App;
