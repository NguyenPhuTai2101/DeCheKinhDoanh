import { create } from 'zustand';
import {
  GameSaveState,
  IngredientId,
  RecipeId,
  DailySummary,
  CustomerInstance,
  Employee,
  ShopThemeId,
  CareerTier,
} from '../../../shared/types';
import {
  INITIAL_GAME_STATE,
  INGREDIENTS,
  RECIPES,
  SHOP_UPGRADES,
  EMPLOYEES,
  SHOP_THEMES,
  DECORATION_ITEMS,
} from '../../../shared/gameData';

const LOCAL_STORAGE_KEY = 'cozy_empire_save_v3';

export type ModalType =
  | 'cooking'
  | 'market'
  | 'upgrades'
  | 'employees'
  | 'decor'
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

  // Actions cơ bản
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
  
  // V0.2: Deep HR & Nhân sự
  hireEmployee: (employeeId: string) => boolean;
  fireEmployee: (employeeId: string) => void;
  trainEmployee: (employeeId: string) => boolean;
  promoteEmployee: (employeeId: string) => boolean;
  giveBonusEmployee: (employeeId: string, amount: number) => boolean;
  
  // V0.3: Trang trí & Themes
  updateShopName: (name: string) => void;
  buyTheme: (themeId: ShopThemeId) => boolean;
  setTheme: (themeId: ShopThemeId) => void;
  buyDecoration: (decorId: string) => boolean;
  toggleEquipDecoration: (decorId: string) => void;
  
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

    for (const ingId of recipe.requiredIngredients) {
      if ((gameState.inventory[ingId] || 0) <= 0) {
        get().showToast(`❌ Hết ${INGREDIENTS[ingId]?.name}! Cần đi chợ mua thêm.`);
        return false;
      }
    }

    if (!consumeEnergy(3)) return false;

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

    get().showToast(`🎉 Đã nâng cấp thành công: ${upgrade.name}!`);
    get().saveLocal();
    return true;
  },

  // V0.2: Tuyển dụng & Quản lý nhân sự
  hireEmployee: (employeeId) => {
    const { gameState } = get();
    const defaultEmp = EMPLOYEES.find((e) => e.id === employeeId);
    if (!defaultEmp) return false;

    if (gameState.hiredEmployees.includes(employeeId)) {
      get().showToast('ℹ️ Nhân viên này đã được tuyển dụng!');
      return false;
    }

    const empDetail: Employee = {
      ...defaultEmp,
      hired: true,
      mood: 95,
      stress: 10,
      loyalty: 80,
    };

    set({
      gameState: {
        ...gameState,
        hiredEmployees: [...gameState.hiredEmployees, employeeId],
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: empDetail,
        },
      },
    });

    get().showToast(`👩‍🍳 Đã chào đón ${defaultEmp.name} gia nhập tiệm!`);
    get().saveLocal();
    return true;
  },

  fireEmployee: (employeeId) => {
    const { gameState } = get();
    const emp = gameState.employeeDetails[employeeId] || EMPLOYEES.find((e) => e.id === employeeId);

    const updatedHired = gameState.hiredEmployees.filter((id) => id !== employeeId);
    const updatedDetails = { ...gameState.employeeDetails };
    delete updatedDetails[employeeId];

    set({
      gameState: {
        ...gameState,
        hiredEmployees: updatedHired,
        employeeDetails: updatedDetails,
      },
    });

    get().showToast(`👋 Đã cho nghỉ việc nhân viên ${emp?.name || ''}.`);
    get().saveLocal();
  },

  trainEmployee: (employeeId) => {
    const { gameState } = get();
    const trainCost = 25000;
    if (gameState.money < trainCost) {
      get().showToast('❌ Cần 25,000 đ chi phí đào tạo chuyên môn!');
      return false;
    }

    const emp = gameState.employeeDetails[employeeId];
    if (!emp) return false;

    const newSpeed = +(emp.speed + 0.05).toFixed(2);
    const newSkill = Math.min(100, emp.cookingSkill + 8);
    const newExp = emp.experience + 50;

    set({
      gameState: {
        ...gameState,
        money: gameState.money - trainCost,
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: {
            ...emp,
            speed: newSpeed,
            cookingSkill: newSkill,
            experience: newExp,
            mood: Math.min(100, emp.mood + 5),
          },
        },
      },
    });

    get().showToast(`🎓 ${emp.name} đã hoàn thành khóa đào tạo! Tốc độ & Kỹ năng tăng vượt bậc.`);
    get().saveLocal();
    return true;
  },

  promoteEmployee: (employeeId) => {
    const { gameState } = get();
    const emp = gameState.employeeDetails[employeeId];
    if (!emp) return false;

    const careerLadder: CareerTier[] = ['intern', 'junior', 'senior', 'shift_leader', 'store_manager'];
    const currentIdx = careerLadder.indexOf(emp.careerTier);
    if (currentIdx >= careerLadder.length - 1) {
      get().showToast('⭐ Nhân viên đã đạt cấp bậc cao nhất (Quản lý cửa hàng)!');
      return false;
    }

    const nextTier = careerLadder[currentIdx + 1];
    const newSalary = Math.round(emp.salaryPerDay * 1.35);

    set({
      gameState: {
        ...gameState,
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: {
            ...emp,
            careerTier: nextTier,
            salaryPerDay: newSalary,
            loyalty: 100,
            mood: 100,
            stress: 0,
            speed: +(emp.speed + 0.1).toFixed(2),
          },
        },
      },
    });

    get().showToast(`🎉 Chúc mừng ${emp.name} đã được thăng chức lên ${nextTier.toUpperCase()}! Lòng trung thành đạt 100%.`);
    get().saveLocal();
    return true;
  },

  giveBonusEmployee: (employeeId, amount) => {
    const { gameState } = get();
    if (gameState.money < amount) {
      get().showToast('❌ Không đủ tiền để thưởng nóng!');
      return false;
    }

    const emp = gameState.employeeDetails[employeeId];
    if (!emp) return false;

    set({
      gameState: {
        ...gameState,
        money: gameState.money - amount,
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: {
            ...emp,
            mood: 100,
            stress: Math.max(0, emp.stress - 40),
            loyalty: Math.min(100, emp.loyalty + 15),
          },
        },
      },
    });

    get().showToast(`💖 Đã thưởng nóng ${amount.toLocaleString('vi-VN')} đ cho ${emp.name}! Nhân viên vô cùng hạnh phúc.`);
    get().saveLocal();
    return true;
  },

  // V0.3: Trang trí & Themes
  updateShopName: (name) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        shopName: name,
      },
    }));
    get().showToast(`🌸 Đã đổi tên tiệm thành: "${name}"`);
    get().saveLocal();
  },

  buyTheme: (themeId) => {
    const { gameState } = get();
    const theme = SHOP_THEMES[themeId];
    if (!theme) return false;

    if (gameState.ownedThemes.includes(themeId)) {
      get().setTheme(themeId);
      return true;
    }

    if (gameState.money < theme.cost) {
      get().showToast(`❌ Cần ${theme.cost.toLocaleString('vi-VN')} đ để mở khóa chủ đề này!`);
      return false;
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - theme.cost,
        ownedThemes: [...gameState.ownedThemes, themeId],
        activeTheme: themeId,
      },
    });

    get().showToast(`✨ Đã mở khóa và kích hoạt chủ đề: ${theme.name}!`);
    get().saveLocal();
    return true;
  },

  setTheme: (themeId) => {
    const { gameState } = get();
    if (!gameState.ownedThemes.includes(themeId)) return;

    set({
      gameState: {
        ...gameState,
        activeTheme: themeId,
      },
    });

    const theme = SHOP_THEMES[themeId];
    get().showToast(`🎨 Đã đổi diện mạo quán sang: ${theme?.name || themeId}`);
    get().saveLocal();
  },

  buyDecoration: (decorId) => {
    const { gameState } = get();
    const decor = DECORATION_ITEMS.find((d) => d.id === decorId);
    if (!decor) return false;

    if (gameState.ownedDecorations.includes(decorId)) {
      get().toggleEquipDecoration(decorId);
      return true;
    }

    if (gameState.money < decor.cost) {
      get().showToast(`❌ Cần ${decor.cost.toLocaleString('vi-VN')} đ để mua đồ trang trí này!`);
      return false;
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - decor.cost,
        ownedDecorations: [...gameState.ownedDecorations, decorId],
        equippedDecorations: [...gameState.equippedDecorations, decorId],
      },
    });

    get().showToast(`💐 Đã mua và trang hoàng: ${decor.name}! (+${decor.cozyPoints} điểm Thẩm Mỹ Cozy)`);
    get().saveLocal();
    return true;
  },

  toggleEquipDecoration: (decorId) => {
    const { gameState } = get();
    const isEquipped = gameState.equippedDecorations.includes(decorId);
    const updated = isEquipped
      ? gameState.equippedDecorations.filter((id) => id !== decorId)
      : [...gameState.equippedDecorations, decorId];

    set({
      gameState: {
        ...gameState,
        equippedDecorations: updated,
      },
    });

    get().showToast(isEquipped ? '📦 Đã cất đồ trang trí vào kho.' : '✨ Đã trưng bày đồ trang trí lên quán!');
    get().saveLocal();
  },

  endDayAndSleep: () => {
    const { gameState, dailyRevenue, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();

    // Tính lương nhân viên
    let totalSalaries = 0;
    const updatedEmployees = { ...gameState.employeeDetails };

    // Kiểm tra có tranh mèo giảm stress không
    const hasCatPainting = gameState.equippedDecorations.includes('deco_cat_painting');

    for (const empId of gameState.hiredEmployees) {
      const emp = updatedEmployees[empId] || EMPLOYEES.find((e) => e.id === empId);
      if (emp) {
        totalSalaries += emp.salaryPerDay;

        // Cập nhật độ stress & mood sau ngày làm việc
        const stressDelta = hasCatPainting ? 4 : 8;
        const newStress = Math.min(100, (emp.stress || 15) + stressDelta);
        const newMood = Math.max(10, (emp.mood || 85) - Math.floor(newStress / 10));

        updatedEmployees[empId] = {
          ...emp,
          stress: newStress,
          mood: newMood,
          experience: (emp.experience || 0) + 20,
        };
      }
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
        energy: gameState.player.maxEnergy, // Hồi phục 100% năng lượng
      },
      employeeDetails: updatedEmployees,
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

    get().showToast(`☀️ Chào buổi sáng Ngày ${nextDayState.day}! Đã trả lương nhân viên (-${totalSalaries.toLocaleString('vi-VN')} đ).`);
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
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local) as GameSaveState;
        // Merge with safe initial fallback values
        set({
          gameState: {
            ...INITIAL_GAME_STATE,
            ...parsed,
            ownedThemes: parsed.ownedThemes || ['sakura_pink'],
            ownedDecorations: parsed.ownedDecorations || [],
            equippedDecorations: parsed.equippedDecorations || [],
            employeeDetails: parsed.employeeDetails || {},
            shopName: parsed.shopName || 'Tiệm Bánh Mì Của Tôi 🌸',
          },
        });
      }

      const res = await fetch('/api/save/player_default');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const cloudState = json.data as GameSaveState;
          const currentLocal = get().gameState;
          if (
            new Date(cloudState.lastSavedAt).getTime() >
            new Date(currentLocal.lastSavedAt || 0).getTime()
          ) {
            set({
              gameState: {
                ...INITIAL_GAME_STATE,
                ...cloudState,
                ownedThemes: cloudState.ownedThemes || ['sakura_pink'],
                ownedDecorations: cloudState.ownedDecorations || [],
                equippedDecorations: cloudState.equippedDecorations || [],
                employeeDetails: cloudState.employeeDetails || {},
                shopName: cloudState.shopName || 'Tiệm Bánh Mì Của Tôi 🌸',
              },
            });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudState));
          }
        }
      }
    } catch (e) {
      console.warn('Sử dụng Local save do Cloud offline:', e);
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
    } catch (e) {
      console.warn('Lỗi đồng bộ Cloud:', e);
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
