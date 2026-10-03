import { create } from 'zustand';
import {
  GameSaveState,
  IngredientId,
  RecipeId,
  DailySummary,
  CustomerInstance,
} from '../../../shared/types';
import {
  INITIAL_GAME_STATE,
  INGREDIENTS,
  RECIPES,
  SHOP_UPGRADES,
  EMPLOYEES,
} from '../../../shared/gameData';

const LOCAL_STORAGE_KEY = 'cozy_empire_save_v1';

export type ModalType =
  | 'cooking'
  | 'market'
  | 'upgrades'
  | 'employees'
  | 'dailySummary'
  | 'settings'
  | null;

export interface FloatingFeedback {
  id: string;
  text: string;
  type: 'money' | 'heart' | 'warning' | 'star';
  x: number;
  y: number;
}

export interface GameStoreState {
  // Trạng thái lưu trữ chính
  gameState: GameSaveState;
  
  // Trạng thái runtime
  isShopOpen: boolean;
  timeSpeed: number; // 0: pause, 1: 1x, 2: 2x
  activeModal: ModalType;
  selectedTableForCooking: number | null;
  activeCustomers: CustomerInstance[];
  floatingFeedbacks: FloatingFeedback[];
  
  // Thống kê ngày hôm nay
  dailyRevenue: number;
  dailyCost: number;
  dailyCustomersServed: number;
  dailyCustomersLost: number;
  isDailySummaryShown: boolean;
  
  // UI Toast message
  toastMessage: string | null;

  // Actions
  setShopOpen: (open: boolean) => void;
  setTimeSpeed: (speed: number) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  addFloatingFeedback: (text: string, type: FloatingFeedback['type'], x: number, y: number) => void;
  removeFloatingFeedback: (id: string) => void;
  
  // Gameplay Actions
  tickTime: (deltaMinutes: number) => void;
  consumeEnergy: (amount: number) => boolean;
  buyIngredients: (items: Record<IngredientId, number>, totalCost: number) => boolean;
  completeCooking: (recipeId: RecipeId, tableIndex: number) => boolean;
  finishServing: (tableIndex: number, revenue: number, tip: number) => void;
  handleCustomerLeaveAngry: (tableIndex: number) => void;
  purchaseUpgrade: (upgradeId: string) => boolean;
  hireEmployee: (employeeId: string) => boolean;
  
  // Day Cycle
  endDayAndSleep: () => void;
  
  // Save & Sync
  saveLocal: () => void;
  loadGame: () => Promise<void>;
  syncCloud: () => Promise<void>;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: INITIAL_GAME_STATE,
  isShopOpen: false,
  timeSpeed: 1,
  activeModal: null,
  selectedTableForCooking: null,
  activeCustomers: [],
  floatingFeedbacks: [],
  dailyRevenue: 0,
  dailyCost: 0,
  dailyCustomersServed: 0,
  dailyCustomersLost: 0,
  isDailySummaryShown: false,
  toastMessage: null,

  setShopOpen: (open) => {
    set({ isShopOpen: open });
    get().showToast(open ? '🌸 Cửa hàng đã mở cửa đón khách!' : '🌙 Đã tạm đóng cửa nhận khách!');
  },

  setTimeSpeed: (speed) => set({ timeSpeed: speed }),

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null, selectedTableForCooking: null }),

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 2800);
  },

  addFloatingFeedback: (text, type, x, y) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      floatingFeedbacks: [...state.floatingFeedbacks, { id, text, type, x, y }],
    }));
    setTimeout(() => {
      get().removeFloatingFeedback(id);
    }, 1200);
  },

  removeFloatingFeedback: (id) => {
    set((state) => ({
      floatingFeedbacks: state.floatingFeedbacks.filter((f) => f.id !== id),
    }));
  },

  tickTime: (deltaMinutes) => {
    const { gameState, isShopOpen, isDailySummaryShown } = get();
    if (!isShopOpen || isDailySummaryShown) return;

    const newTime = gameState.gameTimeMinutes + deltaMinutes;

    // Giờ đóng cửa: 22:00 = 1320 phút
    if (newTime >= 1320 && !isDailySummaryShown) {
      set({
        isShopOpen: false,
        isDailySummaryShown: true,
        activeModal: 'dailySummary',
        gameState: {
          ...gameState,
          gameTimeMinutes: 1320,
        },
      });
      get().showToast('🌙 Đã đến 22:00! Đã kết thúc ngày kinh doanh.');
      get().saveLocal();
    } else {
      set({
        gameState: {
          ...gameState,
          gameTimeMinutes: newTime,
        },
      });
    }
  },

  consumeEnergy: (amount) => {
    const { gameState } = get();
    if (gameState.player.energy < amount) {
      get().showToast('💤 Bạn đã quá mệt mỏi! Hãy nghỉ ngơi để hồi phục sức lực.');
      return false;
    }
    set({
      gameState: {
        ...gameState,
        player: {
          ...gameState.player,
          energy: Math.max(0, gameState.player.energy - amount),
        },
      },
    });
    return true;
  },

  buyIngredients: (items, totalCost) => {
    const { gameState } = get();
    if (gameState.money < totalCost) {
      get().showToast('❌ Không đủ tiền để mua thêm nguyên liệu!');
      return false;
    }

    // Kiểm tra sức chứa kho
    const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
    const addedStock = Object.values(items).reduce((a, b) => a + b, 0);
    if (currentStock + addedStock > gameState.storageCapacity) {
      get().showToast(`❌ Kho hàng đã đầy! Sức chứa tối đa: ${gameState.storageCapacity}`);
      return false;
    }

    const updatedInventory = { ...gameState.inventory };
    for (const [key, qty] of Object.entries(items)) {
      const ingId = key as IngredientId;
      updatedInventory[ingId] = (updatedInventory[ingId] || 0) + qty;
    }

    set((state) => ({
      dailyCost: state.dailyCost + totalCost,
      gameState: {
        ...state.gameState,
        money: state.gameState.money - totalCost,
        inventory: updatedInventory,
      },
    }));

    get().showToast(`✅ Đã mua nguyên liệu (-${totalCost.toLocaleString('vi-VN')} đ)`);
    get().saveLocal();
    return true;
  },

  completeCooking: (recipeId, tableIndex) => {
    const { gameState, consumeEnergy } = get();
    const recipe = RECIPES[recipeId];
    if (!recipe) return false;

    // Kiểm tra đủ nguyên liệu
    for (const ingId of recipe.requiredIngredients) {
      if ((gameState.inventory[ingId] || 0) <= 0) {
        get().showToast(`❌ Hết ${INGREDIENTS[ingId]?.name}! Cần đi chợ mua thêm.`);
        return false;
      }
    }

    // Tiêu hao 3 năng lượng khi nấu
    if (!consumeEnergy(3)) return false;

    // Trừ nguyên liệu
    const newInventory = { ...gameState.inventory };
    for (const ingId of recipe.requiredIngredients) {
      newInventory[ingId] -= 1;
    }

    const newExp = gameState.player.cookingExp + recipe.expGain;
    const newLevel = Math.floor(newExp / 100) + 1;

    set({
      gameState: {
        ...gameState,
        inventory: newInventory,
        player: {
          ...gameState.player,
          cookingExp: newExp,
          cookingLevel: newLevel,
        },
      },
      activeModal: null,
      selectedTableForCooking: null,
    });

    get().showToast(`✨ Đã nấu xong: ${recipe.name}!`);
    return true;
  },

  finishServing: (tableIndex, revenue, tip) => {
    const totalEarned = revenue + tip;
    const { gameState } = get();

    set((state) => ({
      dailyRevenue: state.dailyRevenue + totalEarned,
      dailyCustomersServed: state.dailyCustomersServed + 1,
      gameState: {
        ...state.gameState,
        money: state.gameState.money + totalEarned,
        reputation: state.gameState.reputation + 1,
      },
    }));

    get().showToast(`💰 Khách thanh toán: +${totalEarned.toLocaleString('vi-VN')} đ (Boa: ${tip.toLocaleString('vi-VN')} đ)`);
    get().saveLocal();
  },

  handleCustomerLeaveAngry: (tableIndex) => {
    set((state) => ({
      dailyCustomersLost: state.dailyCustomersLost + 1,
      gameState: {
        ...state.gameState,
        reputation: Math.max(0, state.gameState.reputation - 2),
      },
    }));
    get().showToast('💔 Khách đã bỏ về vì chờ quá lâu! (-2 Uy tín)');
  },

  purchaseUpgrade: (upgradeId) => {
    const { gameState } = get();
    const upgrade = SHOP_UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLvl = gameState.purchasedUpgrades[upgradeId] || 0;
    if (currentLvl >= upgrade.maxLevel) {
      get().showToast('ℹ️ Nâng cấp này đã đạt cấp tối đa!');
      return false;
    }

    if (gameState.money < upgrade.cost) {
      get().showToast('❌ Không đủ tiền để mua nâng cấp này!');
      return false;
    }

    let extraCapacity = 0;
    if (upgrade.effect.type === 'storage_capacity') {
      extraCapacity = upgrade.effect.value;
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - upgrade.cost,
        storageCapacity: gameState.storageCapacity + extraCapacity,
        purchasedUpgrades: {
          ...gameState.purchasedUpgrades,
          [upgradeId]: currentLvl + 1,
        },
      },
    });

    get().showToast(`🎉 Đã mua thành công: ${upgrade.name}!`);
    get().saveLocal();
    return true;
  },

  hireEmployee: (employeeId) => {
    const { gameState } = get();
    const employee = EMPLOYEES.find((e) => e.id === employeeId);
    if (!employee) return false;

    if (gameState.hiredEmployees.includes(employeeId)) {
      get().showToast('ℹ️ Nhân viên này đã được tuyển dụng!');
      return false;
    }

    set({
      gameState: {
        ...gameState,
        hiredEmployees: [...gameState.hiredEmployees, employeeId],
      },
    });

    get().showToast(`👩‍🍳 Đã chào đón ${employee.name} gia nhập tiệm!`);
    get().saveLocal();
    return true;
  },

  endDayAndSleep: () => {
    const { gameState, dailyRevenue, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();

    // Tính lương nhân viên
    let totalSalaries = 0;
    for (const empId of gameState.hiredEmployees) {
      const emp = EMPLOYEES.find((e) => e.id === empId);
      if (emp) totalSalaries += emp.salaryPerDay;
    }

    const netProfit = dailyRevenue - dailyCost - totalSalaries;

    const summary: DailySummary = {
      day: gameState.day,
      totalRevenue: dailyRevenue,
      ingredientCost: dailyCost,
      salariesPaid: totalSalaries,
      netProfit,
      servedCustomers: dailyCustomersServed,
      lostCustomers: dailyCustomersLost,
      reputationChange: dailyCustomersServed - dailyCustomersLost * 2,
    };

    const nextDayState: GameSaveState = {
      ...gameState,
      day: gameState.day + 1,
      gameTimeMinutes: 360, // 06:00 sáng
      money: Math.max(0, gameState.money - totalSalaries),
      player: {
        ...gameState.player,
        energy: gameState.player.maxEnergy, // Hồi phục 100% năng lượng sau khi ngủ
      },
      historySummaries: [summary, ...gameState.historySummaries],
      lastSavedAt: new Date().toISOString(),
    };

    set({
      gameState: nextDayState,
      isShopOpen: false,
      isDailySummaryShown: false,
      activeModal: null,
      dailyRevenue: 0,
      dailyCost: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
    });

    get().showToast(`☀️ Chào buổi sáng Ngày ${nextDayState.day}! Năng lượng đã phục hồi 100%.`);
    get().saveLocal();
    get().syncCloud();
  },

  saveLocal: () => {
    try {
      const stateToSave = {
        ...get().gameState,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Không thể lưu LocalStorage:', e);
    }
  },

  loadGame: async () => {
    try {
      // 1. Thử load từ LocalStorage
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local) as GameSaveState;
        set({ gameState: parsed });
        console.log('✅ Đã nạp dữ liệu từ LocalStorage');
      }

      // 2. Thử fetch từ Backend API
      const res = await fetch('/api/save/player_default');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // So sánh phiên bản hoặc timestamp
          const cloudState = json.data as GameSaveState;
          const currentLocal = get().gameState;
          if (
            new Date(cloudState.lastSavedAt).getTime() >
            new Date(currentLocal.lastSavedAt || 0).getTime()
          ) {
            set({ gameState: cloudState });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudState));
            console.log('☁️ Đã đồng bộ save mới nhất từ Cloud Server');
          }
        }
      }
    } catch (e) {
      console.warn('Backend chưa sẵn sàng hoặc ngoại tuyến, sử dụng Local save:', e);
    }
  },

  syncCloud: async () => {
    try {
      const state = get().gameState;
      await fetch(`/api/save/${state.playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      console.log('☁️ Đã đồng bộ lên Cloud Server thành công');
    } catch (e) {
      console.warn('Không thể kết nối đến server backend để đồng bộ:', e);
    }
  },

  resetGame: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      gameState: { ...INITIAL_GAME_STATE, lastSavedAt: new Date().toISOString() },
      isShopOpen: false,
      dailyRevenue: 0,
      dailyCost: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      activeModal: null,
      isDailySummaryShown: false,
    });
    get().showToast('🔄 Đã khởi động lại tiệm từ đầu!');
  },
}));
