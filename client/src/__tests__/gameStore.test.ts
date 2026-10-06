import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, EMPLOYEES } from '../../../shared/gameData';

// Polyfill localStorage in test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
    key: (i: number) => Object.keys(store)[i] || null,
    length: 0,
  } as Storage;
}

describe('Module: Game Store & Lifecycle Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      gameState: JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),
      isShopOpen: false,
      activeModal: null,
      activeOrders: [],
      dailyRevenue: 0,
      dailyCost: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      isDailySummaryShown: false,
    });
  });

  describe('1. Chu kỳ 3 Pha Vận Hành (Day Phases Lifecycle)', () => {
    it('TC_STR_01: Khởi đầu ở pha morning_prep, quán đóng cửa và đồng hồ ở 06:00', () => {
      const state = useGameStore.getState();
      expect(state.gameState.dayPhase).toBe('morning_prep');
      expect(state.isShopOpen).toBe(false);
      expect(state.gameState.gameTimeMinutes).toBe(360); // 06:00
    });

    it('TC_STR_02: Mở cửa quán chuyển sang operating, cho phép đón khách và đồng hồ chạy', () => {
      const { openStoreForDay } = useGameStore.getState();
      openStoreForDay();

      const state = useGameStore.getState();
      expect(state.isShopOpen).toBe(true);
      expect(state.gameState.dayPhase).toBe('operating');
    });

    it('TC_STR_03: Chạm mốc 22:00 (1320 phút) tự động đóng quán và chuyển sang night_audit', () => {
      const { openStoreForDay, tickTime } = useGameStore.getState();
      openStoreForDay();

      // Giả lập thời gian trôi qua đến 22:00
      useGameStore.setState((s) => ({
        gameState: { ...s.gameState, gameTimeMinutes: 1315 },
      }));

      tickTime(10); // 1325 phút -> quá 1320

      const state = useGameStore.getState();
      expect(state.isShopOpen).toBe(false);
      expect(state.gameState.dayPhase).toBe('night_audit');
      expect(state.activeModal).toBe('dailySummary');
    });

    it('TC_STR_04: Đi ngủ (endDayAndSleep) kết toán ngày, trừ chi phí cố định và hồi phục thể lực', () => {
      const store = useGameStore.getState();
      
      // Thiết lập ngày 1 đang có 5.000.000đ, năng lượng giảm còn 20/100
      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          day: 1,
          money: 5000000,
          player: { ...s.gameState.player, energy: 20 },
          hiredEmployees: ['emp_linh'],
        },
        dailyRevenue: 1000000,
        dailyCost: 300000,
        dailyCustomersServed: 15,
        dailyCustomersLost: 2,
      }));

      store.endDayAndSleep();

      const nextState = useGameStore.getState();
      // Sang ngày 2
      expect(nextState.gameState.day).toBe(2);
      expect(nextState.gameState.gameTimeMinutes).toBe(360);
      expect(nextState.gameState.dayPhase).toBe('morning_prep');
      expect(nextState.isShopOpen).toBe(false);
      // Năng lượng hồi phục đầy 100%
      expect(nextState.gameState.player.energy).toBe(nextState.gameState.player.maxEnergy);
      // Lịch sử kết toán được ghi lại
      expect(nextState.gameState.historySummaries.length).toBe(1);
      expect(nextState.gameState.historySummaries[0].day).toBe(1);
      expect(nextState.gameState.historySummaries[0].bottleneckAnalysis).toBeDefined();
    });
  });

  describe('2. Cứu Trợ Khẩn Cấp & Di Sản Kế Thừa (Emergency & Legacy)', () => {
    it('TC_STR_05: Vay Bác Ba hàng xóm nhận 1.000.000đ và ghi nhận dư nợ', () => {
      const { takeEmergencyLoan } = useGameStore.getState();
      const initialMoney = useGameStore.getState().gameState.money;

      const success = takeEmergencyLoan('neighbor');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(initialMoney + 1000000);
      expect(state.gameState.loanDebt).toBe(1000000);
      expect(state.gameState.consecutiveCrisisDays).toBe(0);
    });

    it('TC_STR_06: Vay Ngân hàng nhận 5.000.000đ kèm lãi vay', () => {
      const { takeEmergencyLoan } = useGameStore.getState();
      const initialMoney = useGameStore.getState().gameState.money;

      takeEmergencyLoan('bank');

      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(initialMoney + 5000000);
      expect(state.gameState.loanDebt).toBe(5500000); // 5M + 10% lãi
    });

    it('TC_STR_07: Thanh lý đồ nghề thu hồi 2.000.000đ tiền mặt', () => {
      const { liquidateEquipment } = useGameStore.getState();
      const initialMoney = useGameStore.getState().gameState.money;

      const success = liquidateEquipment();
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(initialMoney + 2000000);
    });

    it('TC_STR_08: Phá sản & Làm lại với Điểm Di Sản (Legacy Points)', () => {
      const { resetGameWithLegacy } = useGameStore.getState();
      
      // Giả lập chơi đến ngày 10 rồi vỡ nợ
      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          day: 10,
          money: -200000,
          consecutiveCrisisDays: 3,
          financialHealth: 'bankrupt',
        },
      }));

      resetGameWithLegacy();

      const newState = useGameStore.getState();
      expect(newState.gameState.day).toBe(1);
      expect(newState.gameState.legacyPoints).toBeGreaterThan(0);
      expect(newState.gameState.money).toBeGreaterThan(500000); // Vốn khởi đầu tăng theo di sản
      expect(newState.gameState.dayPhase).toBe('morning_prep');
    });
  });

  describe('3. Tự Động Hóa Chi Nhánh Phụ (Multi-Branch Automation)', () => {
    it('TC_STR_09: Phân công nhân viên sang quản lý chi nhánh', () => {
      const { assignEmployeeToRestaurant } = useGameStore.getState();
      
      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          hiredEmployees: ['emp_huy'],
          employeeDetails: {
            emp_huy: {
              ...EMPLOYEES[0],
              assignedRestaurantId: 'banh_mi',
              hired: true,
            },
          },
        },
      }));

      assignEmployeeToRestaurant('emp_huy', 'pho');

      const state = useGameStore.getState();
      expect(state.gameState.employeeDetails['emp_huy']?.assignedRestaurantId).toBe('pho');
    });

    it('TC_STR_10: Thêm doanh thu tự động từ chi nhánh phụ vào hệ thống tài chính', () => {
      const { addBranchRevenue } = useGameStore.getState();
      const initialMoney = useGameStore.getState().gameState.money;

      addBranchRevenue('pho', 120000, 'Phở Bò Tái Lăn');

      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(initialMoney + 120000);
      expect(state.gameState.branchFinances?.['pho']).toBeDefined();
      expect(state.gameState.branchFinances?.['pho']?.revenue).toBe(120000);
      expect(state.gameState.branchFinances?.['pho']?.customersServed).toBe(1);
    });
  });

  describe('4. Nấu Ăn, Tiêu Hao Năng Lượng & Nguyên Liệu', () => {
    it('TC_STR_11: Nấu ăn trừ chính xác nguyên liệu trong kho', () => {
      const { completeCooking } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          inventory: { bread: 5, pork: 5, cucumber: 5, herb: 5 },
          player: { ...s.gameState.player, energy: 50 },
        },
      }));

      const success = completeCooking('banh_mi_thit', 0, ['bread', 'pork', 'cucumber', 'herb']);
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.inventory.bread).toBe(4);
      expect(state.gameState.inventory.pork).toBe(4);
      expect(state.gameState.inventory.cucumber).toBe(4);
      expect(state.gameState.inventory.herb).toBe(4);
      expect(state.gameState.player.energy).toBe(47); // Tiêu hao 3 energy
    });

    it('TC_STR_12: Từ chối nấu ăn khi kho thiếu nguyên liệu', () => {
      const { completeCooking } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          inventory: { bread: 0, pork: 5 }, // Hết bánh mì!
        },
      }));

      const success = completeCooking('banh_mi_thit', 0);
      expect(success).toBe(false);
    });

    it('TC_STR_13: Từ chối nấu ăn khi người chơi kiệt sức (energy = 0)', () => {
      const { completeCooking } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          inventory: { bread: 5, pork: 5, cucumber: 5, herb: 5 },
          player: { ...s.gameState.player, energy: 0 },
        },
      }));

      const success = completeCooking('banh_mi_thit', 0);
      expect(success).toBe(false);
    });
  });
});
