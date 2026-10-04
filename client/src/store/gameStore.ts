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
  BusinessStageId,
  NeighborId,
  StreetEvent,
  LotteryTicket,
  DeliveryOrder,
  ActiveOrder,
} from '../../../shared/types';
import {
  INITIAL_GAME_STATE,
  INGREDIENTS,
  RECIPES,
  CUSTOMER_TYPES,
  SHOP_UPGRADES,
  EMPLOYEES,
  SHOP_THEMES,
  DECORATION_ITEMS,
  BUSINESS_STAGES,
  NEIGHBORS_DATA,
  STREET_EVENTS,
} from '../../../shared/gameData';

const LOCAL_STORAGE_KEY = 'cozy_empire_save_v4';

export type ModalType =
  | 'cooking'
  | 'market'
  | 'upgrades'
  | 'employees'
  | 'decor'
  | 'dailySummary'
  | 'settings'
  | 'neighbors'
  | 'streetEvents'
  | 'ledger'
  | 'delivery'
  | 'lotteryDraw'
  | 'menuMore'
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
  
  // V0.4: Sự kiện & Xổ số & Giao hàng runtime
  hasEventTriggeredToday: boolean;
  dailyEventsCount: number;
  lastEventTimeMinutes: number;
  lastEventOutcome: {
    eventTitle: string;
    icon: string;
    tag?: string;
    choiceText: string;
    outcomeText: string;
    cost: number;
    gainMoney: number;
    gainReputation: number;
    gainEnergy?: number;
  } | null;
  isLotteryDrawnToday: boolean;
  deliveryOrders: DeliveryOrder[];
  lotteryDrawResult: {
    drawnNumber: string;
    prizeType: 'jackpot' | 'prize2' | 'prize3' | 'none';
    prizeAmount: number;
    userTicket: string;
  } | null;

  // V0.4 - V0.5: Chế độ quan sát (Quầy quán 'shop' ⇄ Ra đường vỉa hè 'street')
  currentView: 'shop' | 'street';
  activeOrders: ActiveOrder[];
  toastMessage: string | null;
  employeeActionStatus: {
    mai: string;
    linh: string;
    tuan: string;
  };

  // Actions cơ bản
  setEmployeeActionStatus: (status: Partial<{ mai: string; linh: string; tuan: string }>) => void;
  setCurrentView: (view: 'shop' | 'street') => void;
  setActiveOrders: (orders: ActiveOrder[] | ((prev: ActiveOrder[]) => ActiveOrder[])) => void;
  serveDishOrder: (orderId: string) => boolean;
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
  
  // V0.4 - V0.5: Đế Chế Vỉa Hè (decheviahe.com)
  interactNeighbor: (neighborId: NeighborId) => void;
  giveGiftToNeighbor: (neighborId: NeighborId, recipeId: RecipeId) => boolean;
  buyLotteryTicket: (chosenNum?: string, betAmount?: number, betType?: 'de' | 'lo') => boolean;
  playInstantLotteryDraw: (chosenNum?: string, betAmount?: number, betType?: 'de' | 'lo') => void;
  checkLotteryDraw: () => void;
  closeLotteryDrawModal: () => void;
  triggerStreetEvent: (event?: StreetEvent) => void;
  resolveStreetEventChoice: (choiceIndex: number) => void;
  closeStreetEventOutcome: () => void;
  upgradeBusinessStage: () => boolean;

  // V0.4: Giao hàng mang đi & Hàng xóm ghé bàn
  spawnDeliveryOrder: () => void;
  fulfillDeliveryOrder: (orderId: string) => boolean;
  cancelDeliveryOrder: (orderId: string) => void;
  serveNeighborGuest: (neighborId: NeighborId) => void;

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
  hasEventTriggeredToday: false,
  dailyEventsCount: 0,
  lastEventTimeMinutes: 0,
  lastEventOutcome: null,
  isLotteryDrawnToday: false,
  deliveryOrders: [],
  lotteryDrawResult: null,
  toastMessage: null,

  currentView: 'shop',
  activeOrders: [],
  employeeActionStatus: {
    mai: 'idle',
    linh: 'idle',
    tuan: 'idle',
  },

  setEmployeeActionStatus: (status) =>
    set((state) => ({
      employeeActionStatus: { ...state.employeeActionStatus, ...status },
    })),

  setCurrentView: (view) => {
    set({ currentView: view });
    if (view === 'street') {
      get().showToast('🚶 Đang ra đường quan sát phố xá vỉa hè!');
    } else {
      get().showToast('🍳 Đã trở về quầy bán hàng!');
    }
  },

  setActiveOrders: (orders) => {
    if (typeof orders === 'function') {
      set((state) => ({ activeOrders: orders(state.activeOrders) }));
    } else {
      set({ activeOrders: orders });
    }
  },

  serveDishOrder: (orderId) => {
    const { activeOrders } = get();
    const order = activeOrders.find((o) => o.id === orderId);
    if (!order) return false;

    const recipe = RECIPES[order.recipeId];
    if (!recipe) return false;

    const cType = CUSTOMER_TYPES[order.typeId];
    const patiencePercent = Math.max(0, order.patienceRemaining / order.maxPatience);
    let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

    if (order.neighborId) {
      tip += Math.round(recipe.basePrice * 0.2);
      get().serveNeighborGuest(order.neighborId);
    }

    set((state) => ({
      activeOrders: state.activeOrders.map((o) =>
        o.id === orderId ? { ...o, state: 'eating' } : o
      ),
    }));

    setTimeout(() => {
      get().finishServing(order.tableIndex, recipe.basePrice, tip);
      set((state) => ({
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
      }));
    }, 1800);

    return true;
  },

  setShopOpen: (open) => {
    set({ isShopOpen: open });
    get().showToast(open ? '🥖 Quán vỉa hè mở cửa đón bà con!' : '🌙 Đã tạm dọn bàn ghế nghỉ ngơi!');
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
    const { gameState, isShopOpen, isDailySummaryShown, hasEventTriggeredToday, isLotteryDrawnToday } = get();
    if (!isShopOpen || isDailySummaryShown) return;

    const newTime = gameState.gameTimeMinutes + deltaMinutes;

    // Kích hoạt sự kiện đường phố ngẫu nhiên theo nhịp điệu (cách nhau ít nhất 150 phút game)
    const timeSinceLastEvent = newTime - get().lastEventTimeMinutes;
    if (get().dailyEventsCount < 3 && timeSinceLastEvent >= 150 && Math.random() < 0.2) {
      get().triggerStreetEvent();
    }

    // Tự động xổ số lúc 16:30 (990 phút) nếu đã mua vé
    if (!isLotteryDrawnToday && newTime >= 990 && gameState.activeLotteryTicket) {
      get().checkLotteryDraw();
    }

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

  // === V0.4 - V0.5: ĐẾ CHẾ VỈA HÈ METHODS ===

  interactNeighbor: (neighborId) => {
    const { gameState } = get();
    const neighbor = gameState.neighbors[neighborId] || {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    };
    const data = NEIGHBORS_DATA[neighborId];

    const newExp = neighbor.intimacyExp + 20;
    let newLevel = neighbor.level;
    const newSecrets = [...neighbor.unlockedSecretIds];

    if (newExp >= 100 && newLevel < 5) {
      newLevel += 1;
      const secretToUnlock = data?.secrets.find((s) => s.level === newLevel);
      if (secretToUnlock && !newSecrets.includes(newLevel)) {
        newSecrets.push(newLevel);
      }
      get().showToast(`💖 Tình thân với ${data?.name || 'Hàng xóm'} đạt cấp ${newLevel}! Đã mở khóa tâm sự mới.`);
    } else {
      get().showToast(`💬 Đã trò chuyện cùng ${data?.name || 'Hàng xóm'} (+20 Thân thiết)`);
    }

    set({
      gameState: {
        ...gameState,
        neighbors: {
          ...gameState.neighbors,
          [neighborId]: {
            ...neighbor,
            level: newLevel,
            intimacyExp: newExp >= 100 && newLevel < 5 ? newExp - 100 : newExp,
            unlockedSecretIds: newSecrets,
            lastInteractedDay: gameState.day,
          },
        },
      },
    });
    get().saveLocal();
  },

  giveGiftToNeighbor: (neighborId, recipeId) => {
    const { gameState } = get();
    const neighbor = gameState.neighbors[neighborId] || {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    };
    const data = NEIGHBORS_DATA[neighborId];
    const recipe = RECIPES[recipeId];
    if (!recipe || !data) return false;

    // Chi phí làm quà tặng cho hàng xóm
    const giftCost = Math.round(recipe.basePrice * 0.5);
    if (gameState.money < giftCost) {
      get().showToast('❌ Không đủ tiền chuẩn bị món quà này!');
      return false;
    }

    const isFavorite = data.favoriteDishId === recipeId;
    const addedExp = isFavorite ? 45 : 25;
    const newExp = neighbor.intimacyExp + addedExp;
    let newLevel = neighbor.level;
    const newSecrets = [...neighbor.unlockedSecretIds];

    if (newExp >= 100 && newLevel < 5) {
      newLevel += 1;
      const secretToUnlock = data.secrets.find((s) => s.level === newLevel);
      if (secretToUnlock && !newSecrets.includes(newLevel)) {
        newSecrets.push(newLevel);
      }
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - giftCost,
        neighbors: {
          ...gameState.neighbors,
          [neighborId]: {
            ...neighbor,
            level: newLevel,
            intimacyExp: newExp >= 100 && newLevel < 5 ? newExp - 100 : newExp,
            unlockedSecretIds: newSecrets,
            lastInteractedDay: gameState.day,
          },
        },
      },
    });

    if (isFavorite) {
      get().showToast(`✨ ${data.name} vô cùng xúc động vì đây là món tủ yêu thích! (+${addedExp} Thân thiết)`);
    } else {
      get().showToast(`🎁 Đã tặng ${recipe.name} cho ${data.name}! (+${addedExp} Thân thiết)`);
    }

    get().saveLocal();
    return true;
  },

  buyLotteryTicket: (chosenNum, betAmount = 10000, betType = 'de') => {
    const { gameState } = get();

    if (gameState.money < betAmount) {
      get().showToast(`❌ Cần ${betAmount.toLocaleString('vi-VN')} đ để mua vé!`);
      return false;
    }

    if (gameState.activeLotteryTicket) {
      get().showToast('ℹ️ Bạn đã mua vé số hôm nay rồi! Đợi 16:30 chiều xem kết quả nhé.');
      return false;
    }

    const ticketNumber = chosenNum || Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // Tăng thiện cảm với Cô Bảy khi mua ủng hộ
    const coBay = gameState.neighbors.co_bay || {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    };
    const newExp = coBay.intimacyExp + 25;

    const newTicket: LotteryTicket = {
      ticketNumber,
      betType,
      boughtDay: gameState.day,
      cost: betAmount,
    };

    set({
      gameState: {
        ...gameState,
        money: gameState.money - betAmount,
        activeLotteryTicket: newTicket,
        neighbors: {
          ...gameState.neighbors,
          co_bay: {
            ...coBay,
            intimacyExp: newExp,
            lastInteractedDay: gameState.day,
          },
        },
      },
    });

    get().showToast(`🎟️ Đã ghi [${ticketNumber}] (${betType === 'de' ? 'Đề Đuôi x70' : 'Bao Lô'}) với Cô Bảy! Chiều 16h30 sẽ quay số.`);
    get().saveLocal();
    return true;
  },

  playInstantLotteryDraw: (chosenNum, betAmount = 10000, betType = 'de') => {
    const { gameState } = get();
    if (gameState.money < betAmount) {
      get().showToast(`❌ Cần ${betAmount.toLocaleString('vi-VN')} đ để thử vận may!`);
      return;
    }

    const ticketNumber = chosenNum || Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const drawnNumber = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    let prizeType: 'jackpot' | 'prize2' | 'prize3' | 'none' = 'none';
    let prizeAmount = 0;

    if (drawnNumber === ticketNumber) {
      prizeType = 'jackpot';
      prizeAmount = betType === 'de' ? betAmount * 70 : betAmount * 35;
    } else if (drawnNumber[1] === ticketNumber[1]) {
      prizeType = 'prize2';
      prizeAmount = betAmount * 4;
    } else if (Math.abs(parseInt(drawnNumber, 10) - parseInt(ticketNumber, 10)) === 1) {
      prizeType = 'prize3';
      prizeAmount = betAmount * 2;
    }

    const completedTicket: LotteryTicket = {
      ticketNumber,
      betType,
      boughtDay: gameState.day,
      cost: betAmount,
      drawnNumber,
      prizeType,
      prizeAmount,
    };

    set((state) => ({
      activeModal: 'lotteryDraw',
      lotteryDrawResult: {
        drawnNumber,
        prizeType,
        prizeAmount,
        userTicket: ticketNumber,
      },
      dailyRevenue: state.dailyRevenue + prizeAmount,
      dailyCost: state.dailyCost + betAmount,
      gameState: {
        ...state.gameState,
        money: state.gameState.money - betAmount + prizeAmount,
        lotteryHistory: [completedTicket, ...state.gameState.lotteryHistory].slice(0, 15),
      },
    }));

    get().saveLocal();
  },

  checkLotteryDraw: () => {
    const { gameState } = get();
    const ticket = gameState.activeLotteryTicket;
    if (!ticket) return;

    // Quay số ngẫu nhiên 2 chữ số
    const drawnNumber = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    let prizeType: 'jackpot' | 'prize2' | 'prize3' | 'none' = 'none';
    let prizeAmount = 0;

    const cost = ticket.cost || 10000;
    const isDe = ticket.betType !== 'lo';

    if (drawnNumber === ticket.ticketNumber) {
      prizeType = 'jackpot';
      prizeAmount = isDe ? cost * 70 : cost * 35;
    } else if (drawnNumber[1] === ticket.ticketNumber[1]) {
      prizeType = 'prize2';
      prizeAmount = cost * 4;
    } else if (Math.abs(parseInt(drawnNumber, 10) - parseInt(ticket.ticketNumber, 10)) === 1) {
      prizeType = 'prize3';
      prizeAmount = cost * 2;
    }

    const completedTicket: LotteryTicket = {
      ...ticket,
      drawnNumber,
      prizeType,
      prizeAmount,
    };

    set((state) => ({
      isLotteryDrawnToday: true,
      activeModal: 'lotteryDraw',
      lotteryDrawResult: {
        drawnNumber,
        prizeType,
        prizeAmount,
        userTicket: ticket.ticketNumber,
      },
      dailyRevenue: state.dailyRevenue + prizeAmount,
      gameState: {
        ...state.gameState,
        money: state.gameState.money + prizeAmount,
        activeLotteryTicket: null,
        lotteryHistory: [completedTicket, ...state.gameState.lotteryHistory].slice(0, 15),
      },
    }));

    get().saveLocal();
  },

  closeLotteryDrawModal: () => {
    set({ activeModal: null, lotteryDrawResult: null });
  },

  serveNeighborGuest: (neighborId) => {
    const { gameState } = get();
    const neighbor = gameState.neighbors[neighborId] || {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    };
    const data = NEIGHBORS_DATA[neighborId];
    if (!data) return;

    const addedExp = 25;
    const newExp = neighbor.intimacyExp + addedExp;
    let newLevel = neighbor.level;
    const newSecrets = [...neighbor.unlockedSecretIds];

    if (newExp >= 100 && newLevel < 5) {
      newLevel += 1;
      const secretToUnlock = data.secrets.find((s) => s.level === newLevel);
      if (secretToUnlock && !newSecrets.includes(newLevel)) {
        newSecrets.push(newLevel);
      }
      get().showToast(`💖 Tình làng nghĩa xóm: Thân thiết với ${data.name} đạt cấp ${newLevel}!`);
    } else {
      get().showToast(`✨ ${data.name} thưởng thức món ăn rất vui vẻ! (+${addedExp} Thân thiết)`);
    }

    set({
      gameState: {
        ...gameState,
        neighbors: {
          ...gameState.neighbors,
          [neighborId]: {
            ...neighbor,
            level: newLevel,
            intimacyExp: newExp >= 100 && newLevel < 5 ? newExp - 100 : newExp,
            unlockedSecretIds: newSecrets,
            lastInteractedDay: gameState.day,
          },
        },
      },
    });
    get().saveLocal();
  },

  spawnDeliveryOrder: () => {
    const { deliveryOrders } = get();
    if (deliveryOrders.length >= 3) return;

    const customers = [
      'Phòng Marketing Tầng 3',
      'Anh Tuấn Shipper Chạy Đêm',
      'Nhóm Học Sinh Trường Làng',
      'Chị Ngọc Kế Toán',
      'Đội Bảo Vệ Khu Phố',
    ];

    const recipesKeys: RecipeId[] = ['banh_mi_thit', 'banh_mi_trung', 'banh_mi_dac_biet', 'tra_sua', 'cafe_sua'];
    const chosenRecipeId = recipesKeys[Math.floor(Math.random() * recipesKeys.length)];
    const recipe = RECIPES[chosenRecipeId];
    const qty = Math.floor(Math.random() * 2) + 2; // 2 - 3 suất

    const baseRev = recipe.basePrice * qty;
    const tip = Math.round(baseRev * 0.25);

    const newOrder: DeliveryOrder = {
      id: Math.random().toString(36).substring(2, 9),
      customerName: customers[Math.floor(Math.random() * customers.length)],
      recipeId: chosenRecipeId,
      quantity: qty,
      rewardMoney: baseRev,
      rewardTip: tip,
      timeRemainingSeconds: 90,
      maxTimeSeconds: 90,
      status: 'pending',
    };

    set((state) => ({
      deliveryOrders: [...state.deliveryOrders, newOrder],
    }));
    get().showToast(`🛵 Có đơn giao hàng mang đi mới từ ${newOrder.customerName}!`);
  },

  fulfillDeliveryOrder: (orderId) => {
    const { deliveryOrders, gameState } = get();
    const order = deliveryOrders.find((o) => o.id === orderId);
    if (!order) return false;

    const recipe = RECIPES[order.recipeId];
    if (!recipe) return false;

    // Kiểm tra nguyên liệu
    for (const ingId of recipe.requiredIngredients) {
      if ((gameState.inventory[ingId] || 0) < order.quantity) {
        get().showToast(`❌ Không đủ nguyên liệu để giao ${order.quantity} suất ${recipe.name}!`);
        return false;
      }
    }

    // Trừ nguyên liệu
    const newInventory = { ...gameState.inventory };
    for (const ingId of recipe.requiredIngredients) {
      newInventory[ingId] -= order.quantity;
    }

    const totalEarned = order.rewardMoney + order.rewardTip;

    // Tăng thiện cảm Chú Năm
    const chuNam = gameState.neighbors.chu_nam || {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    };

    set((state) => ({
      dailyRevenue: state.dailyRevenue + totalEarned,
      deliveryOrders: state.deliveryOrders.filter((o) => o.id !== orderId),
      gameState: {
        ...state.gameState,
        inventory: newInventory,
        money: state.gameState.money + totalEarned,
        totalDeliveriesCompleted: (state.gameState.totalDeliveriesCompleted || 0) + 1,
        reputation: state.gameState.reputation + 2,
        neighbors: {
          ...state.gameState.neighbors,
          chu_nam: {
            ...chuNam,
            intimacyExp: chuNam.intimacyExp + 15,
            lastInteractedDay: state.gameState.day,
          },
        },
      },
    }));

    get().showToast(`🛵 Chú Năm đã giao thành công đơn hàng! (+${totalEarned.toLocaleString('vi-VN')} đ, +2 Uy tín)`);
    get().saveLocal();
    return true;
  },

  cancelDeliveryOrder: (orderId) => {
    set((state) => ({
      deliveryOrders: state.deliveryOrders.filter((o) => o.id !== orderId),
    }));
    get().showToast('Đã hủy đơn giao hàng.');
  },


  triggerStreetEvent: (event) => {
    const { gameState } = get();
    if (gameState.currentEvent) return;

    const chosen = event || STREET_EVENTS[Math.floor(Math.random() * STREET_EVENTS.length)];
    set((state) => ({
      hasEventTriggeredToday: true,
      dailyEventsCount: state.dailyEventsCount + 1,
      lastEventTimeMinutes: state.gameState.gameTimeMinutes,
      activeModal: 'streetEvents',
      lastEventOutcome: null,
      gameState: {
        ...gameState,
        currentEvent: chosen,
      },
    }));
  },

  resolveStreetEventChoice: (choiceIndex) => {
    const { gameState } = get();
    const event = gameState.currentEvent;
    if (!event || !event.choices[choiceIndex]) return;

    const choice = event.choices[choiceIndex];
    const cost = choice.cost || 0;
    const gain = choice.gainMoney || 0;
    const rep = choice.gainReputation || 0;
    const energy = choice.gainEnergy || 0;

    if (cost > 0 && gameState.money < cost) {
      get().showToast('❌ Không đủ tiền để thực hiện lựa chọn này!');
      return;
    }

    const currentEnergy = gameState.player.energy;
    const maxEnergy = gameState.player.maxEnergy;
    const newEnergy = Math.max(0, Math.min(maxEnergy, currentEnergy + energy));

    set((state) => ({
      dailyRevenue: state.dailyRevenue + gain,
      dailyCost: state.dailyCost + cost,
      lastEventOutcome: {
        eventTitle: event.title,
        icon: event.icon,
        tag: event.tag,
        choiceText: choice.text,
        outcomeText: choice.outcomeText,
        cost,
        gainMoney: gain,
        gainReputation: rep,
        gainEnergy: energy,
      },
      gameState: {
        ...state.gameState,
        money: state.gameState.money - cost + gain,
        reputation: Math.max(0, state.gameState.reputation + rep),
        player: {
          ...state.gameState.player,
          energy: newEnergy,
        },
        currentEvent: null,
      },
    }));

    get().saveLocal();
  },

  closeStreetEventOutcome: () => {
    set({ lastEventOutcome: null, activeModal: null });
  },

  upgradeBusinessStage: () => {
    const { gameState } = get();
    const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
    const currentIdx = stageOrder.indexOf(gameState.businessStage);

    if (currentIdx >= stageOrder.length - 1) {
      get().showToast('👑 Chúc mừng! Bạn đã đạt danh hiệu Chuỗi Đế Chế Vỉa Hè cao nhất!');
      return false;
    }

    const nextStageId = stageOrder[currentIdx + 1];
    const nextStage = BUSINESS_STAGES[nextStageId];

    if (!nextStage) return false;

    if (gameState.reputation < nextStage.requiredReputation) {
      get().showToast(`❌ Cần tối thiểu ${nextStage.requiredReputation} điểm Uy Tín để mở rộng lên ${nextStage.name}!`);
      return false;
    }

    if (gameState.money < nextStage.cost) {
      get().showToast(`❌ Cần ${nextStage.cost.toLocaleString('vi-VN')} đ để nâng cấp cơ nghiệp vỉa hè!`);
      return false;
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - nextStage.cost,
        businessStage: nextStageId,
      },
    });

    get().showToast(`🎉 Thăng cấp thành công! Chào mừng đến với "${nextStage.name}"!`);
    get().saveLocal();
    return true;
  },

  endDayAndSleep: () => {
    const { gameState, dailyRevenue, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();

    // Nếu còn vé số chưa quay trước khi ngủ, tự động quay thưởng
    if (gameState.activeLotteryTicket) {
      get().checkLotteryDraw();
    }

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
      currentEvent: null,
      lastSavedAt: new Date().toISOString(),
    };

    set({
      gameState: nextDayState,
      isShopOpen: false,
      isDailySummaryShown: false,
      hasEventTriggeredToday: false,
      dailyEventsCount: 0,
      lastEventTimeMinutes: 0,
      lastEventOutcome: null,
      isLotteryDrawnToday: false,
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
            shopName: parsed.shopName || 'Tiệm Bánh Mì Vỉa Hè Ba Miền 🥖',
            businessStage: parsed.businessStage || 'cart',
            neighbors: {
              ...INITIAL_GAME_STATE.neighbors,
              ...(parsed.neighbors || {}),
            },
            lotteryHistory: parsed.lotteryHistory || [],
            activeLotteryTicket: parsed.activeLotteryTicket || null,
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
                shopName: cloudState.shopName || 'Tiệm Bánh Mì Vỉa Hè Ba Miền 🥖',
                businessStage: cloudState.businessStage || 'cart',
                neighbors: {
                  ...INITIAL_GAME_STATE.neighbors,
                  ...(cloudState.neighbors || {}),
                },
                lotteryHistory: cloudState.lotteryHistory || [],
                activeLotteryTicket: cloudState.activeLotteryTicket || null,
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
      hasEventTriggeredToday: false,
      dailyEventsCount: 0,
      lastEventTimeMinutes: 0,
      lastEventOutcome: null,
      isLotteryDrawnToday: false,
      isDailySummaryShown: false,
    });
    get().showToast('🔄 Đã khởi động lại tiệm từ đầu!');
  },
}));

