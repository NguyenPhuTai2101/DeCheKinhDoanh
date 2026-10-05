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
import { IncidentModal } from './components/modals/IncidentModal';
import { FlashScreen } from './components/views/FlashScreen';
import { ToastNotification } from './components/ToastNotification';
import { useGameStore } from './store/gameStore';
import { useGameSimulation } from './hooks/useGameSimulation';

export const App: React.FC = () => {
  const {
    activeModal,
    activeIncident,
    currentView,
    loadGame,
    saveLocal,
    gameState,
    showFlashScreen,
  } = useGameStore();

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
    <div className="w-full h-[100dvh] bg-gradient-to-b from-[#FFF0F5] to-[#FFE6EE] flex justify-center items-center overflow-hidden">
      {/* Container chuẩn phong cách Mobile-First (Đế Chế Vỉa Hè & Tiệm Trà Nhỏ) */}
      <div className="w-full max-w-md sm:max-w-[430px] h-full sm:h-[96dvh] bg-[#FAF5EE] sm:shadow-[0_15px_50px_rgba(255,101,132,0.22)] sm:border-2 sm:border-[#FFCCD9] sm:rounded-3xl flex flex-col justify-between overflow-hidden relative">
        {showFlashScreen ? (
          <FlashScreen />
        ) : (
          <>
            {/* 1. Thanh Header HUD Vỉa Hè */}
            <TopBar />

            {/* 2. Khu vực hiển thị trò chơi chính: Quầy Hàng (Bếp) ⇄ Ra Đường Quan Sát (Phố Vỉa Hè) */}
            <main className="flex-1 w-full relative overflow-hidden flex flex-col min-h-0 bg-[#FAF5EE]">
              {currentView === 'street' ? <StreetMapView /> : <CozyShopView />}
            </main>

            {/* 3. Thanh điều hướng dưới cùng */}
            <BottomBar />

            {/* 4. Các Popup & Cửa sổ tương tác */}
            {activeModal === 'franchise' && <FranchiseModal />}
            {activeModal === 'starterSelection' && <StarterSelectionModal />}
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

            {/* 4.1. Pop-up Biến Cố Bất Ngờ Đời Thực (Surprise Incidents) */}
            {activeIncident && <IncidentModal />}
          </>
        )}

        {/* 5. Thông báo nổi (Toast & Floating feedback) */}
        <ToastNotification />
      </div>
    </div>
  );
};

export default App;
