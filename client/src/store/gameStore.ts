import { create } from 'zustand';
import { getOperatingStatement, getLiquidationOffer, describeCashMovement, withBranchOperation } from '../../../shared/economy/operating';
import { migrateSave, restoreOperatingState } from './persistence';
import { getRecipeLearningCost } from '../../../shared/progression/recipes';
import { chooseContextualIncident } from '../../../shared/simulation/incidents';
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
  RestaurantTypeId,
  SurpriseIncident,
  DailyFinance,
  BranchDailyFinance,
  ShopperPolicy,
} from '../../../shared/types';
import { getRandomSurpriseIncident } from '../../../shared/simulationConfig';
import {
  calculateDishCOGS,
  generateDailyMarketPrices,
  getIngredientCurrentPrice,
} from '../../../shared/economy/pricing';
import {
  calculateCustomerSatisfaction,
  updateShopRating,
  calculateTipAmount,
} from '../../../shared/simulation/customers';
import {
  calculateEmployeeTrainingCost,
  checkTrainingCap,
  checkPromotionEligibility,
} from '../../../shared/simulation/employees';
import {
  createInitialDailyFinance,
  createInitialBranchFinance,
  calculateStageFixedCosts,
  generateDailyInsights,
  calculateBottleneck,
  calculate3DayCashflowForecast,
  evaluateFinancialHealth,
  calculateRollingReputation,
  calculateDailySpoilage,
  generateMorningBriefing,
} from '../../../shared/economy/finance';
import { calculateCookEfficiency } from '../../../shared/simulation/employees';
import { calculateCookSpeedBoost } from '../../../shared/gameData';
import { evaluateDishMatch, getOrderIngredients } from '../../../shared/simulation/orders';
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
  RESTAURANT_TYPES,
  getUpgradeTierInfo,
  getBranchTierInfo,
  getStageCatalog,
  getStageUpgrades,
  getStageUpgradeTierInfo,
  calculateStorageCapacity,
  calculateMaxTables,
  calculateDeliveryBonus,
  calculateReputationBonus,
  getStarterInventoryForRestaurant,
  getStarterRecipesForRestaurant,
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
  | 'franchise'
  | 'starterSelection'
  | 'menuPricing'
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
  lossReasons: { inventory: number; capacity: number; demand: number };
  recordLostCustomer: (reason: 'inventory' | 'capacity' | 'demand') => void;
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
  employeeActionStatus: Record<string, string>;
  showFlashScreen: boolean;

  // V0.6: Biến cố bất ngờ đời thực (Surprise Incident Pop-up)
  activeIncident: SurpriseIncident | null;
  hasIncidentTriggeredToday: boolean;

  // Actions cơ bản
  setShowFlashScreen: (show: boolean) => void;
  setEmployeeActionStatus: (status: Record<string, string>) => void;
  setCurrentView: (view: 'shop' | 'street') => void;
  setActiveOrders: (orders: ActiveOrder[] | ((prev: ActiveOrder[]) => ActiveOrder[])) => void;
  commitKitchenChanges: (inventory: GameSaveState['inventory'], cogs: number, shoppingCost: number) => void;
  serveDishOrder: (orderId: string) => boolean;
  collectPayment: (orderId: string) => boolean;
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
  completeCooking: (recipeId: RecipeId, tableIndex: number, preparedIngredients?: IngredientId[], timed?: boolean) => boolean;
  finishServing: (tableIndex: number, revenue: number, tip: number, order?: ActiveOrder) => void;
  handleCustomerLeaveAngry: (tableIndex: number) => void;
  purchaseUpgrade: (upgradeId: string) => boolean;

  // V3: 3 Pha Ngày & Cứu Trợ Khẩn Cấp / Di Sản
  openStoreForDay: () => void;
  takeEmergencyLoan: (source: 'neighbor' | 'bank') => boolean;
  liquidateEquipment: () => boolean;
  resetGameWithLegacy: () => void;
  
  // V0.2: Deep HR & Nhân sự
  hireEmployee: (employeeId: string) => boolean;
  fireEmployee: (employeeId: string) => void;
  trainEmployee: (employeeId: string) => boolean;
  promoteEmployee: (employeeId: string) => boolean;
  giveBonusEmployee: (employeeId: string, amount: number) => boolean;
  assignEmployeeToRestaurant: (employeeId: string, restaurantId: RestaurantTypeId) => void;
  addBranchRevenue: (restaurantId: RestaurantTypeId, amount: number, dishName: string) => void;
  dispatchShopperRun: (employeeId?: string) => boolean;
  
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

  // V0.6: Xử lý biến cố bất ngờ đời thực (Surprise Incident Pop-up)
  triggerSurpriseIncident: (incident?: SurpriseIncident) => void;
  resolveSurpriseIncident: (response?: 'accept' | 'mitigate') => void;

  // V0.4: Giao hàng mang đi & Hàng xóm ghé bàn
  spawnDeliveryOrder: () => void;
  fulfillDeliveryOrder: (orderId: string) => boolean;
  tickDeliveries: (seconds: number) => void;
  cancelDeliveryOrder: (orderId: string) => void;
  serveNeighborGuest: (neighborId: NeighborId) => void;

  // V0.6: Chuỗi Đa Thương Hiệu Ẩm Thực (Franchise Chain)
  chooseStarterRestaurant: (restaurantId: RestaurantTypeId) => void;
  switchActiveRestaurant: (restaurantId: RestaurantTypeId) => void;
  unlockRestaurantFranchise: (restaurantId: RestaurantTypeId) => boolean;
  upgradeBranch: (restaurantId: RestaurantTypeId) => boolean;

  // V2: Menu Catalog, Định giá Món Ăn & Vận Hành Kinh Tế
  setDishPrice: (restaurantId: RestaurantTypeId, recipeId: RecipeId, price: number) => void;
  toggleActiveRecipe: (restaurantId: RestaurantTypeId, recipeId: RecipeId) => boolean;
  learnRecipe: (restaurantId: RestaurantTypeId, recipeId: RecipeId) => boolean;
  setShopperPolicy: (policy: Partial<ShopperPolicy>) => void;
  recordBranchSales: (restaurantId: RestaurantTypeId, revenue: number, cogs: number, dishName: string, recipeId?: RecipeId, quantity?: number) => void;

  // Day Cycle
  endDayAndSleep: () => void;
  forceCloseStoreTonight: () => void;
  
  // Save & Sync
  saveLocal: () => void;
  loadGame: () => Promise<void>;
  syncCloud: () => Promise<boolean>;
  resetGame: () => void;
}



export const useGameStore = create<GameStoreState>((baseSet, get) => {
  const set = (update: Partial<GameStoreState> | ((state: GameStoreState) => Partial<GameStoreState>)) => baseSet(state => {
    const patch = typeof update === 'function' ? update(state) : update;
    if (patch.gameState && patch.gameState.money !== state.gameState.money && !('timeSpeed' in patch)) {
      const next = patch.gameState;
      const journal = next.day < state.gameState.day ? [] : state.gameState.cashJournal || [];
      return { ...patch, gameState: { ...next, cashJournal: [...journal, { day: next.day, minute: next.gameTimeMinutes,
        label: describeCashMovement(state.gameState, next), amount: next.money - state.gameState.money, balance: next.money }].slice(-300) } };
    }
    return patch;
  });
  return {
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
  lossReasons: { inventory:0, capacity:0, demand:0 },
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
  employeeActionStatus: {},
  showFlashScreen: true,
  activeIncident: null,
  hasIncidentTriggeredToday: false,

  setShowFlashScreen: (show) => set({ showFlashScreen: show }),

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

  commitKitchenChanges: (inventory, cogs, shoppingCost) => set(current => ({
    dailyCost: current.dailyCost + shoppingCost,
    gameState: { ...current.gameState, money: current.gameState.money - shoppingCost, inventory,
      branchFinances: withBranchOperation(current.gameState,current.gameState.activeRestaurantId || 'banh_mi',0,cogs),
      restaurantInventories: { ...current.gameState.restaurantInventories, [current.gameState.activeRestaurantId || 'banh_mi']: inventory },
      dailyFinance: { ...createInitialDailyFinance(), ...current.gameState.dailyFinance, cogs: (current.gameState.dailyFinance?.cogs || 0) + cogs } },
  })),

  recordLostCustomer: reason => set(current => ({ dailyCustomersLost: current.dailyCustomersLost + 1,
    lossReasons: { ...current.lossReasons, [reason]: current.lossReasons[reason] + 1 } })),

  serveDishOrder: (orderId) => {
    const { activeOrders } = get();
    const order = activeOrders.find((o) => o.id === orderId);
    if (!order || order.state !== 'ready') return false;

    const recipe = RECIPES[order.recipeId];
    if (!recipe) return false;

    const cType = CUSTOMER_TYPES[order.typeId];
    const patiencePercent = Math.max(0, order.patienceRemaining / order.maxPatience);
    let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

    if (order.neighborId) {
      tip += Math.round(recipe.basePrice * 0.2);
    }

    if (order.customTag) {
      // Khách gọi món có yêu cầu riêng hài lòng tip thêm
      tip += Math.round(recipe.basePrice * 0.15 * Math.max(0.5, patiencePercent));
    }

    const eatDuration = 10; // 10 giây ngồi ăn uống thưởng thức tại bàn

    set((state) => ({
      activeOrders: state.activeOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'eating',
              eatingTimer: eatDuration,
              maxEatingTimer: eatDuration,
              calculatedTip: tip,
            }
          : o
      ),
    }));

    get().showToast(`😋 Khách Bàn ${order.tableIndex} đang ăn ${recipe.name}${order.customTag ? ` [${order.customTag}]` : ''}!`);
    return true;
  },

  collectPayment: (orderId) => {
    const { activeOrders, gameState } = get();
    const order = activeOrders.find((o) => o.id === orderId);
    if (!order || order.state !== 'paying') return false;

    const recipe = RECIPES[order.recipeId];
    if (!recipe) return false;

    const restId = gameState.activeRestaurantId || 'banh_mi';
    const playerPrice = gameState.menuSettings?.[restId]?.prices?.[order.recipeId] ?? recipe.basePrice;
    const tip = order.calculatedTip ?? 0;

    get().finishServing(order.tableIndex, playerPrice, tip, order);

    set((state) => ({
      activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
    }));

    return true;
  },

  setShopOpen: (open) => {
    set({ isShopOpen: open });
    get().showToast(open ? '🥖 Quán vỉa hè mở cửa đón bà con!' : '🌙 Đã tạm dọn bàn ghế nghỉ ngơi!');
  },

  setTimeSpeed: (speed) => { if (Number.isFinite(speed)) set({ timeSpeed:Math.min(2,Math.max(0,Math.round(speed))) }); },

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
    const state = get();
    if (!state.isShopOpen || state.isDailySummaryShown || !Number.isFinite(deltaMinutes) || deltaMinutes <= 0) return;
    const newTime = Math.min(1320, state.gameState.gameTimeMinutes + deltaMinutes);
    set(current => ({ gameState: { ...current.gameState, gameTimeMinutes: newTime } }));
    if (newTime >= 1320) { get().forceCloseStoreTonight(); return; }
    if (!get().isLotteryDrawnToday && newTime >= 990 && get().gameState.activeLotteryTicket) get().checkLotteryDraw();
    if (!get().activeModal && !get().activeIncident && get().dailyEventsCount < 3 && newTime - get().lastEventTimeMinutes >= 150 && Math.random() < 0.2) get().triggerStreetEvent();
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
    if (!Object.keys(items).length || Object.entries(items).some(([id, count]) => !INGREDIENTS[id as IngredientId] || !Number.isInteger(count) || count <= 0)) return false;
    const calculatedCost = Object.entries(items).reduce((sum, [id,count]) => sum + count * getIngredientCurrentPrice(id as IngredientId, gameState.marketPrices, gameState.marketSpecial), 0);
    if (!Number.isFinite(totalCost) || totalCost !== calculatedCost) return false;
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

    set((state) => {
      const activeRestId = state.gameState.activeRestaurantId || 'banh_mi';
      return {
        dailyCost: state.dailyCost + totalCost,
        gameState: {
          ...state.gameState,
          money: state.gameState.money - totalCost,
          inventory: updatedInventory,
          restaurantInventories: {
            ...(state.gameState.restaurantInventories || {}),
            [activeRestId]: updatedInventory,
          },
        },
      };
    });

    get().showToast(`✅ Đã mua nguyên liệu (-${totalCost.toLocaleString('vi-VN')} đ)`);
    get().saveLocal();
    return true;
  },

  completeCooking: (recipeId, tableIndex, preparedIngredients, timed = false) => {
    const { gameState, consumeEnergy, activeOrders } = get();
    const recipe = RECIPES[recipeId];
    if (!recipe) return false;

    // Tìm order đang chờ tại bàn này
    const targetOrder = activeOrders.find((o) => o.tableIndex === tableIndex);
    if (targetOrder && (targetOrder.state !== 'waiting' || targetOrder.recipeId !== recipeId)) return false;
    if (get().deliveryOrders.some(o => o.status === 'cooking' && !o.chefId) || activeOrders.some(o => o.state === 'cooking' && o.chefName === 'Bạn')) {
      get().showToast('Bạn đang chế biến món khác. Hoàn tất trước khi nhận món mới.');
      return false;
    }
    if (timed && (!targetOrder || targetOrder.state !== 'waiting' || targetOrder.recipeId !== recipeId)) return false;

    // Xác định nguyên liệu thực tế cần trừ khỏi kho:
    const ingredientsToUse = (preparedIngredients && preparedIngredients.length > 0)
      ? preparedIngredients
      : recipe.requiredIngredients;

    // Kiểm tra đủ nguyên liệu trong kho
    const countNeeded: Record<string, number> = {};
    for (const ingId of ingredientsToUse) {
      countNeeded[ingId] = (countNeeded[ingId] || 0) + 1;
    }

    for (const [ingId, count] of Object.entries(countNeeded)) {
      if ((gameState.inventory[ingId as IngredientId] || 0) < count) {
        get().showToast(`❌ Hết ${INGREDIENTS[ingId as IngredientId]?.name || ingId}! Cần đi chợ mua thêm.`);
        return false;
      }
    }

    if (!consumeEnergy(3)) return false;

    // Trừ kho
    const newInventory = { ...gameState.inventory };
    for (const [ingId, count] of Object.entries(countNeeded)) {
      newInventory[ingId as IngredientId] = Math.max(0, (newInventory[ingId as IngredientId] || 0) - count);
    }

    // Đánh giá độ khớp (Match Grade) nếu có order
    let matchResult = {
      matchGrade: 'perfect' as any,
      feedback: 'Món ăn chuẩn vị thơm ngon! 😋',
      tipMultiplier: 1.0,
      ratingImpact: 0,
    };

    if (targetOrder) {
      matchResult = evaluateDishMatch({
        recipeId,
        order: targetOrder,
        preparedIngredients: ingredientsToUse,
      });
    }

    const newExp = gameState.player.cookingExp + recipe.expGain;
    const newLevel = Math.floor(newExp / 100) + 1;
    const activeRestId = gameState.activeRestaurantId || 'banh_mi';

    // Cập nhật lại order trong activeOrders
    const updatedOrders = activeOrders.map((o) => {
      if (o.tableIndex === tableIndex) {
        return {
          ...o,
          state: timed ? 'cooking' as const : 'ready' as const,
          ...(timed ? { chefId: undefined, chefName: 'Bạn', cookingProgress: 0 } : {}),
          preparedIngredients: ingredientsToUse,
          cogsBooked: true,
          matchGrade: matchResult.matchGrade,
          matchFeedback: matchResult.feedback,
        };
      }
      return o;
    });

    set({
      gameState: {
        ...gameState,
        inventory: newInventory,
        branchFinances: withBranchOperation(gameState,gameState.activeRestaurantId || 'banh_mi',0,ingredientsToUse.reduce((sum, id) => sum + getIngredientCurrentPrice(id, gameState.marketPrices), 0)),
        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, cogs: (gameState.dailyFinance?.cogs || 0) + ingredientsToUse.reduce((sum, id) => sum + getIngredientCurrentPrice(id, gameState.marketPrices), 0) },
        restaurantInventories: {
          ...(gameState.restaurantInventories || {}),
          [activeRestId]: newInventory,
        },
        player: {
          ...get().gameState.player,
          cookingExp: newExp,
          cookingLevel: newLevel,
        },
      },
      activeOrders: updatedOrders,
      activeModal: null,
      selectedTableForCooking: null,
    });

    if (matchResult.matchGrade === 'perfect') {
      get().showToast(`🌟 [HOÀN HẢO] Nấu đúng 100% yêu cầu cho ${recipe.name}! (+Tip cao)`);
    } else if (matchResult.matchGrade === 'minor') {
      get().showToast(`✨ Đã nấu xong ${recipe.name}!`);
    } else {
      get().showToast(`⚠️ [CHÚ Ý] Món ${recipe.name} có điểm chưa đúng với dặn dò của khách!`);
    }
    return true;
  },

  finishServing: (tableIndex: number, revenue: number, initialTip: number, order?: ActiveOrder) => {
    let tip = initialTip;
    const { gameState } = get();
    const recipeId = order?.recipeId;
    const currentRestId = gameState.activeRestaurantId || 'banh_mi';

    // 1. Tính toán COGS thực tế theo giá thị trường hôm nay
    const dishCOGS = order?.preparedIngredients ? order.preparedIngredients.reduce((sum, id) => sum + getIngredientCurrentPrice(id, gameState.marketPrices), 0) : recipeId ? calculateDishCOGS(recipeId, gameState.marketPrices) : Math.round(revenue * 0.4);

    // 2. Tính toán độ hài lòng của khách (Satisfaction: 0 - 100) & sao đánh giá (1 - 5)
    let reviewOutcome = {
      satisfaction: 80,
      stars: 4 as 1 | 2 | 3 | 4 | 5,
      icon: '😊',
      label: '4 Sao - Hài Lòng',
      comment: 'Ăn ngon miệng!',
      fameChange: 1,
    };

    if (order && recipeId) {
      const cookEmp = order.chefId ? gameState.employeeDetails[order.chefId] : undefined;
      const serverEmp = order.serverId ? gameState.employeeDetails[order.serverId] : undefined;
      const patienceRatio = order.maxPatience > 0 ? order.patienceRemaining / order.maxPatience : 0.8;

      // Tính tổng cozyPoints từ trang trí
      const cozyPoints = gameState.equippedDecorations.reduce((sum, dId) => {
        const item = DECORATION_ITEMS.find((d) => d.id === dId);
        return sum + (item?.cozyPoints || 0);
      }, 0);

      reviewOutcome = calculateCustomerSatisfaction({
        customerType: order.typeId,
        recipeId,
        playerPrice: revenue,
        cookSkill: cookEmp?.cookingSkill,
        serverSkill: serverEmp?.serviceSkill,
        cozyPoints,
        patienceRemainingRatio: patienceRatio,
        isCreativeDish: cookEmp?.personality === 'creative' && Math.random() < 0.2,
        hasFriendlyServer: serverEmp?.personality === 'friendly',
      });

      // Tác động trực tiếp từ độ khớp của món (Order Customization Match)
      if (order.matchGrade) {
        if (order.matchGrade === 'perfect') {
          reviewOutcome.satisfaction = Math.min(100, reviewOutcome.satisfaction + 15);
          reviewOutcome.fameChange += 1;
          tip = Math.round(tip * 1.35); // Thưởng tip 35%
        } else if (order.matchGrade === 'wrong') {
          reviewOutcome.satisfaction = Math.max(10, reviewOutcome.satisfaction - 25);
          reviewOutcome.fameChange = Math.min(0, reviewOutcome.fameChange - 1);
          tip = Math.round(tip * 0.4); // Khách trừ tip nặng
        } else if (order.matchGrade === 'allergy') {
          reviewOutcome.satisfaction = 10;
          reviewOutcome.fameChange = -2;
          tip = 0;
        }
      }
    }

    // Ambience rewards good service; it never cancels penalties for poor service.
    const stageId = gameState.businessStage || 'cart';
    const levels = gameState.stageUpgrades?.[stageId] ?? (gameState.stageUpgrades ? {} : gameState.purchasedUpgrades);
    const reputationBonus = calculateReputationBonus(stageId, levels, gameState.stageUpgrades);
    if (reviewOutcome.fameChange > 0) {
      const extra = reviewOutcome.fameChange * reputationBonus;
      reviewOutcome.fameChange += Math.floor(extra) + (Math.random() < extra % 1 ? 1 : 0);
    }
    if (order?.typeId === 'office_worker' && (gameState.neighbors.chi_lan?.level || 1) >= 2) tip = Math.round(tip * 1.25);
    reviewOutcome.stars = Math.max(1, Math.min(5, Math.ceil(reviewOutcome.satisfaction / 20))) as 1 | 2 | 3 | 4 | 5;
    const totalEarned = revenue + tip;

    // 3. Cập nhật Rating mượt mà (Weighted Moving Average)
    const currentRating = gameState.rating ?? 75;
    const newRating = updateShopRating(currentRating, reviewOutcome.satisfaction);

    // 4. Cập nhật Fame / Reputation (Không cap 100!)
    const currentReputation = gameState.reputation || 0;
    const newReputation = Math.max(0, currentReputation + reviewOutcome.fameChange);
    const newFame = Math.max(0, (gameState.fame ?? currentReputation) + reviewOutcome.fameChange);

    // 5. Cập nhật DailyFinance & BranchDailyFinance
    const currentFinance: DailyFinance = gameState.dailyFinance || createInitialDailyFinance();
    const updatedFinance: DailyFinance = {
      ...currentFinance,
      revenue: currentFinance.revenue + totalEarned,
      tips: (currentFinance.tips || 0) + tip,
      cogs: currentFinance.cogs + (order?.cogsBooked ? 0 : dishCOGS),
      grossProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + (order?.cogsBooked ? 0 : dishCOGS)),
      netProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + (order?.cogsBooked ? 0 : dishCOGS)) - currentFinance.payroll - currentFinance.rent - currentFinance.utilities,
    };

    const currentBranchFinances = gameState.branchFinances || {};
    const branchFin = currentBranchFinances[currentRestId] || createInitialBranchFinance(currentRestId);
    const updatedBranchFin: BranchDailyFinance = {
      ...branchFin,
      revenue: branchFin.revenue + totalEarned,
      cogs: branchFin.cogs + (order?.cogsBooked ? 0 : dishCOGS),
      grossProfit: (branchFin.revenue + totalEarned) - (branchFin.cogs + (order?.cogsBooked ? 0 : dishCOGS)),
      customersServed: branchFin.customersServed + 1,
      netProfit: (branchFin.revenue + totalEarned) - (branchFin.cogs + (order?.cogsBooked ? 0 : dishCOGS)) - branchFin.payroll - branchFin.rent,
    };

    // 6. Cập nhật Business Metrics
    const metrics = gameState.businessMetrics || {
      lifetimeRevenue: 0,
      lifetimeProfit: 0,
      totalCustomers: 0,
      fiveStarReviews: 0,
      averageRating: 75,
    };
    const updatedMetrics = {
      ...metrics,
      lifetimeRevenue: metrics.lifetimeRevenue + totalEarned,
      lifetimeProfit: metrics.lifetimeProfit + (totalEarned - dishCOGS),
      totalCustomers: metrics.totalCustomers + 1,
      fiveStarReviews: metrics.fiveStarReviews + (reviewOutcome.stars === 5 ? 1 : 0),
      averageRating: newRating,
    };

    set((state) => ({
      dailyRevenue: state.dailyRevenue + totalEarned,
      dailyCustomersServed: state.dailyCustomersServed + 1,
      gameState: {
        ...state.gameState,
        money: state.gameState.money + totalEarned,
        reputation: newReputation,
        fame: newFame,
        rating: newRating,
        dailyFinance: updatedFinance,
        branchFinances: {
          ...currentBranchFinances,
          [currentRestId]: updatedBranchFin,
        },
        businessMetrics: updatedMetrics,
      },
    }));

    get().addFloatingFeedback(`+${totalEarned.toLocaleString('vi-VN')} đ`, 'money', 60, 45);
    get().addFloatingFeedback(`${reviewOutcome.icon} ${reviewOutcome.stars}⭐`, 'star', 60, 20);
    get().showToast(`😋 Khách thanh toán: +${totalEarned.toLocaleString('vi-VN')} đ (Boa: ${tip.toLocaleString('vi-VN')} đ) · Đánh giá: ${reviewOutcome.label}`);
    get().saveLocal();
  },

  handleCustomerLeaveAngry: (tableIndex) => {
    const { gameState } = get();
    const customer = get().activeOrders.find(order => order.tableIndex === tableIndex);
    const ingredients = customer ? getOrderIngredients(customer) : [];
    const lackedStock = customer?.state === 'waiting' && ingredients.some(id => (gameState.inventory[id] || 0) < ingredients.filter(value => value === id).length);
    const reason = lackedStock ? 'inventory' : 'capacity';
    // Khách tức giận bỏ về xem như đánh giá 1 sao (satisfaction 20)
    const currentRating = gameState.rating ?? 75;
    const newRating = updateShopRating(currentRating, 20);
    const newReputation = Math.max(0, (gameState.reputation || 0) - 1);
    const newFame = Math.max(0, (gameState.fame ?? gameState.reputation ?? 0) - 1);

    set((state) => ({
      dailyCustomersLost: state.dailyCustomersLost + 1,
      lossReasons: { ...state.lossReasons, [reason]: state.lossReasons[reason] + 1 },
      gameState: {
        ...state.gameState,
        reputation: newReputation,
        fame: newFame,
        rating: newRating,
      },
    }));
    get().addFloatingFeedback('💔 1⭐', 'warning', 50, 40);
    get().showToast('💔 Khách đã giận dữ bỏ về vì chờ quá lâu! (Đánh giá 1⭐ làm giảm Rating)');
    get().saveLocal();
  },

  purchaseUpgrade: (upgradeId) => {
    const { gameState } = get();
    const stageId = gameState.businessStage || 'cart';
    const stageCatalog = getStageCatalog(stageId);
    const upgrade = stageCatalog.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const currentStageUpgrades = gameState.stageUpgrades?.[stageId] ?? (gameState.stageUpgrades ? {} : gameState.purchasedUpgrades || {});
    const currentLvl = currentStageUpgrades[upgradeId] ?? (gameState.stageUpgrades ? 0 : gameState.purchasedUpgrades[upgradeId] || 0);
    const tierInfo = getStageUpgradeTierInfo(stageId, upgradeId, currentLvl);

    if (upgradeId === 'extra_tables' && calculateMaxTables(stageId, currentStageUpgrades, gameState.stageUpgrades) >= 8) {
      get().showToast('Quán đã đạt giới hạn 8 bàn phục vụ.');
      return false;
    }

    if (tierInfo.isMax) {
      get().showToast('ℹ️ Trang bị này đã đạt cấp tối đa của kỷ nguyên!');
      return false;
    }

    if (gameState.money < tierInfo.cost) {
      get().showToast(`❌ Cần ${(tierInfo.cost - gameState.money).toLocaleString('vi-VN')} đ để nâng cấp lên ${tierInfo.title}!`);
      return false;
    }

    const updatedStageUpgrades = {
      ...(gameState.stageUpgrades || {}),
      [stageId]: {
        ...currentStageUpgrades,
        [upgradeId]: currentLvl + 1,
      },
    };

    // Tính toán lại dung tích kho chính xác theo sàn + tier
    const newStorageCapacity = Math.max(gameState.storageCapacity, calculateStorageCapacity(stageId, updatedStageUpgrades[stageId], updatedStageUpgrades));

    set({
      gameState: {
        ...gameState,
        money: gameState.money - tierInfo.cost,
        storageCapacity: newStorageCapacity,
        fridgeUpgradeLevel: Math.min(2, Object.values(updatedStageUpgrades).reduce((sum, levels) => sum + (levels?.cozy_storage || 0), 0)),
        purchasedUpgrades: {
          ...gameState.purchasedUpgrades,
          [upgradeId]: currentLvl + 1,
        },
        stageUpgrades: updatedStageUpgrades,
      },
    });

    get().showToast(`🎉 Đã nâng cấp thành công [${tierInfo.title}]!`);
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

    const currentStage = BUSINESS_STAGES[gameState.businessStage || 'cart'];
    const maxStaff = currentStage?.maxStaff ?? 2;
    if (gameState.hiredEmployees.length >= maxStaff) {
      get().showToast(`⚠️ Cấp bậc [${currentStage?.name || 'Hiện tại'}] chỉ cho phép quản lý tối đa ${maxStaff} nhân viên! Hãy thăng tiến sự nghiệp để mở rộng đội ngũ.`);
      return false;
    }

    const cost = defaultEmp.hiringCost || 0;
    if (gameState.money < cost) {
      get().showToast(`❌ Không đủ tiền! Cần ${cost.toLocaleString('vi-VN')}đ để ký hợp đồng tuyển dụng ${defaultEmp.name}!`);
      return false;
    }

    const empDetail: Employee = {
      ...defaultEmp,
      hired: true,
      mood: 95,
      stress: 10,
      loyalty: 80,
      assignedRestaurantId: gameState.activeRestaurantId || 'banh_mi',
    };

    set({
      gameState: {
        ...gameState,
        money: gameState.money - cost,
        hiredEmployees: [...gameState.hiredEmployees, employeeId],
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: empDetail,
        },
      },
    });

    if (cost > 0) {
      get().showToast(`🎉 Đã ký hợp đồng với ${defaultEmp.name}! (-${cost.toLocaleString('vi-VN')}đ)`);
    } else {
      get().showToast(`👩‍🍳 Đã chào đón ${defaultEmp.name} gia nhập tiệm!`);
    }
    get().saveLocal();
    return true;
  },

  // V0.6: Lệnh cho nhân viên đi chợ chạy mua hàng ngay lập tức
  dispatchShopperRun: (employeeId) => {
    const { gameState } = get();
    const hiredShoppers = gameState.hiredEmployees
      .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
      .filter((e) => e?.role === 'shopper') as Employee[];

    if (hiredShoppers.length === 0) {
      get().showToast('⚠️ Bạn chưa tuyển nhân viên đi chợ! Hãy vào Quản Lý Nhân Sự để tuyển Cô Ba hoặc Chú Bảy.');
      return false;
    }

    const shopper = (employeeId ? hiredShoppers.find((e) => e.id === employeeId) : hiredShoppers[0]) || hiredShoppers[0];
    const currentRestId = gameState.activeRestaurantId || 'banh_mi';
    const currentRest = RESTAURANT_TYPES[currentRestId];
    const neededIngs = currentRest?.allowedIngredientIds || [];

    const simStageId = gameState.businessStage || 'cart';
    const simStageUpgrades = gameState.stageUpgrades?.[simStageId] ?? (gameState.stageUpgrades ? {} : gameState.purchasedUpgrades || {});
    const capacity = calculateStorageCapacity(simStageId, simStageUpgrades, gameState.stageUpgrades);
    const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
    const freeSpace = capacity - currentStock;

    if (freeSpace <= 0) {
      get().showToast(`📦 Kho hàng đã đầy (${currentStock}/${capacity})! Hãy nâng cấp sức chứa kho.`);
      return false;
    }

    // Tỉ lệ giảm giá theo kỹ năng mặc cả của người đi chợ (10% - 30%)
    const discountRate = Math.min(0.35, ((shopper.marketSkill || 75) - 50) * 0.006 + 0.1);
    const itemsToBuy: Record<string, number> = {};
    let totalItems = 0;
    let rawTotalCost = 0;

    // Ưu tiên mua các nguyên liệu có số lượng tồn kho thấp nhất
    const sortedIngs = [...neededIngs].sort(
      (a, b) => (gameState.inventory[a] || 0) - (gameState.inventory[b] || 0)
    );

    const perItemTarget = Math.max(10, Math.floor(freeSpace / Math.max(1, sortedIngs.length)));

    for (const ingId of sortedIngs) {
      if (totalItems >= freeSpace) break;
      const ing = INGREDIENTS[ingId];
      if (!ing) continue;
      const buyQty = Math.min(perItemTarget, freeSpace - totalItems);
      if (buyQty > 0) {
        itemsToBuy[ingId] = buyQty;
        totalItems += buyQty;
        rawTotalCost += ing.cost * buyQty;
      }
    }

    if (totalItems === 0) {
      get().showToast('📦 Kho hàng đã dồi dào, chưa cần tiếp tế!');
      return false;
    }

    const finalCost = Math.round(rawTotalCost * (1 - discountRate));
    if (gameState.money < finalCost) {
      get().showToast(`❌ Không đủ tiền! Chuyến đi chợ này cần ${finalCost.toLocaleString('vi-VN')}đ.`);
      return false;
    }

    const updatedInventory = { ...gameState.inventory };
    for (const [id, qty] of Object.entries(itemsToBuy)) {
      const k = id as IngredientId;
      updatedInventory[k] = (updatedInventory[k] || 0) + qty;
    }

    set({
      gameState: {
        ...gameState,
        money: gameState.money - finalCost,
        inventory: updatedInventory,
      },
    });

    get().showToast(
      `🛵 ${shopper.name} đã đi chợ gom +${totalItems} nguyên liệu về kho! (-${finalCost.toLocaleString('vi-VN')}đ, tiết kiệm ${Math.round(discountRate * 100)}%)`
    );
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
    const emp = gameState.employeeDetails[employeeId];
    if (!emp) return false;

    // Kiểm tra Cap kỹ năng (BUG 6)
    const capCheck = checkTrainingCap(emp);
    if (!capCheck.canTrain) {
      get().showToast(`⚠️ ${capCheck.reason || 'Kỹ năng nhân viên đã đạt mức tối đa!'}`);
      return false;
    }

    const trainingCount = emp.trainingCount || 0;
    const trainCost = calculateEmployeeTrainingCost(trainingCount, 25000);
    if (gameState.money < trainCost) {
      get().showToast(`❌ Cần ${trainCost.toLocaleString('vi-VN')} đ chi phí đào tạo chuyên môn (lần ${trainingCount + 1})!`);
      return false;
    }

    const isCook = emp.role === 'cook';
    const newSpeed = +Math.min(1.6, emp.speed + 0.05).toFixed(2);
    const newCooking = isCook ? Math.min(100, (emp.cookingSkill || 50) + 10) : emp.cookingSkill;
    const newService = !isCook ? Math.min(100, (emp.serviceSkill || 50) + 10) : emp.serviceSkill;
    const newExp = (emp.experience || 0) + 60;

    set({
      gameState: {
        ...gameState,
        money: gameState.money - trainCost,
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: {
            ...emp,
            speed: newSpeed,
            cookingSkill: newCooking,
            serviceSkill: newService,
            experience: newExp,
            mood: Math.min(100, (emp.mood || 80) + 5),
            trainingCount: trainingCount + 1,
          },
        },
      },
    });

    get().showToast(`🎓 ${emp.name} đã hoàn thành khóa đào tạo chuyên sâu lần ${trainingCount + 1}! (-${trainCost.toLocaleString('vi-VN')} đ)`);
    get().saveLocal();
    return true;
  },

  promoteEmployee: (employeeId) => {
    const { gameState } = get();
    const emp = gameState.employeeDetails[employeeId];
    if (!emp) return false;

    // Kiểm tra điều kiện thăng chức (BUG 7)
    const eligibility = checkPromotionEligibility(emp);
    if (!eligibility.eligible) {
      get().showToast(`❌ Chưa đủ điều kiện: ${eligibility.reason}`);
      return false;
    }

    const req = eligibility.req!;
    const nextTier = req.nextTier;
    const newSalary = emp.salaryPerDay + req.salaryIncrease;

    set({
      gameState: {
        ...gameState,
        employeeDetails: {
          ...gameState.employeeDetails,
          [employeeId]: {
            ...emp,
            careerTier: nextTier,
            salaryPerDay: newSalary,
            loyalty: Math.min(100, (emp.loyalty || 60) + 20),
            mood: 100,
            stress: Math.max(0, (emp.stress || 20) - 25),
            speed: +Math.min(1.6, (emp.speed || 1.0) + 0.08).toFixed(2),
          },
        },
      },
    });

    get().showToast(`🎉 Chúc mừng ${emp.name} đã được thăng chức lên "${req.nextName}"! Lương mới: ${newSalary.toLocaleString('vi-VN')} đ/ngày.`);
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
        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, otherExpense:(gameState.dailyFinance?.otherExpense || 0) + amount },
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

  assignEmployeeToRestaurant: (employeeId, restaurantId) => {
    const { gameState } = get();
    const currentEmp = gameState.employeeDetails[employeeId] || EMPLOYEES.find((e) => e.id === employeeId);
    if (!currentEmp) return;

    const restName = RESTAURANT_TYPES[restaurantId]?.name || restaurantId;
    const updatedDetails = {
      ...gameState.employeeDetails,
      [employeeId]: {
        ...currentEmp,
        assignedRestaurantId: restaurantId,
      },
    };

    set((state) => ({
      gameState: {
        ...state.gameState,
        employeeDetails: updatedDetails,
      },
    }));

    get().showToast(`📍 Đã phân công ${currentEmp.name} sang ${restName}!`);
    get().saveLocal();
  },

  addBranchRevenue: (restaurantId, amount, dishName) => {
    // Gọi chuyển tiếp đến recordBranchSales với COGS ước lượng nếu không chỉ định
    const estimatedCOGS = Math.round(amount * 0.4);
    get().recordBranchSales(restaurantId, amount, estimatedCOGS, dishName);
  },

  recordBranchSales: (restaurantId, revenue, cogs, dishName, recipeId, quantity = 1) => {
    const rest = RESTAURANT_TYPES[restaurantId];
    const { gameState } = get();

    if (!Number.isFinite(revenue) || revenue < 0 || !Number.isFinite(cogs) || cogs < 0 || quantity <= 0) return;
    const inventory = { ...(restaurantId === gameState.activeRestaurantId ? gameState.inventory : gameState.restaurantInventories?.[restaurantId]) };
    if (recipeId) {
      const needs: Record<string, number> = {};
      RECIPES[recipeId].requiredIngredients.forEach(id => { needs[id] = (needs[id] || 0) + quantity; });
      if (Object.entries(needs).some(([id, count]) => (inventory[id as IngredientId] || 0) < count)) return;
      Object.entries(needs).forEach(([id, count]) => { inventory[id as IngredientId] = (inventory[id as IngredientId] || 0) - count; });
    }

    // Cập nhật DailyFinance
    const currentFinance: DailyFinance = gameState.dailyFinance || createInitialDailyFinance();
    const updatedFinance: DailyFinance = {
      ...currentFinance,
      revenue: currentFinance.revenue + revenue,
      branchRevenue: (currentFinance.branchRevenue || 0) + revenue,
      cogs: currentFinance.cogs + cogs,
      grossProfit: (currentFinance.revenue + revenue) - (currentFinance.cogs + cogs),
      netProfit: (currentFinance.revenue + revenue) - (currentFinance.cogs + cogs) - currentFinance.payroll - currentFinance.rent - currentFinance.utilities,
    };

    // Cập nhật BranchDailyFinance
    const currentBranchFinances = gameState.branchFinances || {};
    const branchFin = currentBranchFinances[restaurantId] || createInitialBranchFinance(restaurantId);
    const updatedBranchFin: BranchDailyFinance = {
      ...branchFin,
      revenue: branchFin.revenue + revenue,
      cogs: branchFin.cogs + cogs,
      grossProfit: (branchFin.revenue + revenue) - (branchFin.cogs + cogs),
      customersServed: branchFin.customersServed + quantity,
      netProfit: (branchFin.revenue + revenue) - (branchFin.cogs + cogs) - branchFin.payroll - branchFin.rent,
    };

    // Cập nhật Business Metrics
    const metrics = gameState.businessMetrics || {
      lifetimeRevenue: 0,
      lifetimeProfit: 0,
      totalCustomers: 0,
      fiveStarReviews: 0,
      averageRating: 75,
    };
    const updatedMetrics = {
      ...metrics,
      lifetimeRevenue: metrics.lifetimeRevenue + revenue,
      lifetimeProfit: metrics.lifetimeProfit + (revenue - cogs),
      totalCustomers: metrics.totalCustomers + quantity,
    };

    set((state) => ({
      dailyRevenue: state.dailyRevenue + revenue,
      dailyCustomersServed: state.dailyCustomersServed + quantity,
      gameState: {
        ...state.gameState,
        money: state.gameState.money + revenue - (recipeId ? 0 : cogs),
        ...(recipeId ? { restaurantInventories: { ...state.gameState.restaurantInventories, [restaurantId]: inventory }, ...(restaurantId === state.gameState.activeRestaurantId ? { inventory } : {}) } : {}),
        // BUG 3 FIXED: Chi nhánh chạy ngầm KHÔNG cộng Fame bừa bãi mỗi 8s!
        dailyFinance: updatedFinance,
        branchFinances: {
          ...currentBranchFinances,
          [restaurantId]: updatedBranchFin,
        },
        businessMetrics: updatedMetrics,
      },
    }));

    get().addFloatingFeedback(`+${revenue.toLocaleString('vi-VN')} đ (${rest?.shortName || 'Chi nhánh'})`, 'money', 50, 40);
  },

  // === V2: MENU CATALOG, PRICING & POLICIES ===
  setDishPrice: (restaurantId, recipeId, price) => {
    if (!Number.isFinite(price) || price < 1000 || !RESTAURANT_TYPES[restaurantId].primaryRecipeIds.includes(recipeId)) return;
    const { gameState } = get();
    const currentMenuSettings = gameState.menuSettings || {};
    const restSettings = currentMenuSettings[restaurantId] || {
      activeRecipes: RESTAURANT_TYPES[restaurantId]?.primaryRecipeIds || [],
      prices: {},
    };

    const updatedPrices = {
      ...restSettings.prices,
      [recipeId]: Math.max(1000, Math.round(price)),
    };

    set({
      gameState: {
        ...gameState,
        menuSettings: {
          ...currentMenuSettings,
          [restaurantId]: {
            ...restSettings,
            prices: updatedPrices,
          },
        },
      },
    });

    const recipe = RECIPES[recipeId];
    get().showToast(`🏷️ Đã cập nhật giá bán "${recipe?.name || recipeId}": ${price.toLocaleString('vi-VN')} đ`);
    get().saveLocal();
  },

  toggleActiveRecipe: (restaurantId, recipeId) => {
    const { gameState } = get();
    const rest = RESTAURANT_TYPES[restaurantId];
    if (!rest) return false;
    if (!gameState.unlockedRecipes.includes(recipeId) || !rest.primaryRecipeIds.includes(recipeId)) { get().showToast('Cần học công thức trước khi đưa món vào thực đơn.'); return false; }

    const currentMenuSettings = gameState.menuSettings || {};
    const restSettings = currentMenuSettings[restaurantId] || {
      activeRecipes: [...rest.primaryRecipeIds],
      prices: {},
    };

    const isActive = restSettings.activeRecipes.includes(recipeId);
    let newActiveList: RecipeId[] = [];

    if (isActive) {
      // Không được tắt hết toàn bộ món (tối thiểu 1 món)
      if (restSettings.activeRecipes.length <= 1) {
        get().showToast('⚠️ Quán phải duy trì ít nhất 1 món trong thực đơn phục vụ!');
        return false;
      }
      newActiveList = restSettings.activeRecipes.filter((r) => r !== recipeId);
    } else {
      newActiveList = [...restSettings.activeRecipes, recipeId];
    }

    set({
      gameState: {
        ...gameState,
        menuSettings: {
          ...currentMenuSettings,
          [restaurantId]: {
            ...restSettings,
            activeRecipes: newActiveList,
          },
        },
      },
    });

    const recipe = RECIPES[recipeId];
    get().showToast(
      isActive
        ? `⛔ Đã tạm ngưng bán món "${recipe?.name || recipeId}" hôm nay.`
        : `✅ Đã đưa món "${recipe?.name || recipeId}" vào thực đơn phục vụ!`
    );
    get().saveLocal();
    return true;
  },

  learnRecipe: (restaurantId, recipeId) => {
    const game = get().gameState;
    const info = getRecipeLearningCost(restaurantId, recipeId);
    if (!info.valid || !game.unlockedRestaurants?.includes(restaurantId) || game.unlockedRecipes.includes(recipeId)) return false;
    if (game.player.cookingLevel < info.requiredLevel || game.money < info.cost) { get().showToast(`Cần tay nghề cấp ${info.requiredLevel} và ${info.cost.toLocaleString('vi-VN')}đ để học món.`); return false; }
    const menu = game.menuSettings?.[restaurantId] || { activeRecipes: getStarterRecipesForRestaurant(restaurantId), prices:{} };
    set({ gameState:{ ...game, money:game.money - info.cost, unlockedRecipes:[...game.unlockedRecipes,recipeId],
      menuSettings:{ ...game.menuSettings, [restaurantId]:{ ...menu, activeRecipes:Array.from(new Set([...menu.activeRecipes,recipeId])) } } } });
    get().showToast(`Đã học ${RECIPES[recipeId].name} và đưa vào menu. Nhớ nhập nguyên liệu mới!`);
    get().saveLocal();
    return true;
  },

  setShopperPolicy: (policy) => {
    const { gameState } = get();
    const currentPolicy = gameState.shopperPolicy || {
      autoRestock: true,
      minStock: 5,
      targetStock: 25,
      maxPriceMultiplier: 1.3,
    };

    const updatedPolicy = {
      ...currentPolicy,
      ...policy,
    };

    set({
      gameState: {
        ...gameState,
        shopperPolicy: updatedPolicy,
      },
    });

    get().showToast('⚙️ Đã cập nhật chính sách nhập hàng cho nhân viên đi chợ!');
    get().saveLocal();
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

    // BUG 8 FIXED: Giới hạn 1 lần tương tác trò chuyện mỗi ngày
    if (neighbor.lastInteractedDay === gameState.day) {
      get().showToast(`💬 Hôm nay bạn đã trò chuyện cùng ${data?.name || 'Hàng xóm'} rồi! Hãy quay lại vào ngày mai nhé.`);
      return;
    }

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

    // BUG 8 FIXED: Giới hạn 1 lần tặng quà mỗi ngày
    if (neighbor.lastInteractedDay === gameState.day) {
      get().showToast(`🎁 Hôm nay bạn đã gửi quà cho ${data.name} rồi! Đừng tặng quá nhiều trong một ngày nhé.`);
      return false;
    }

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
    if (!Number.isFinite(betAmount) || betAmount <= 0) return false;
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
        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, otherExpense: (gameState.dailyFinance?.otherExpense || 0) + betAmount },
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
    if (!Number.isFinite(betAmount) || betAmount <= 0) return;
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
      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,
      gameState: {
        ...state.gameState,
        money: state.gameState.money - betAmount + prizeAmount,
        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance, otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + prizeAmount, otherExpense: (state.gameState.dailyFinance?.otherExpense || 0) + betAmount },
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
      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,
      gameState: {
        ...state.gameState,
        money: state.gameState.money + prizeAmount,
        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance, otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + prizeAmount },
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

          },
        },
      },
    });
    get().saveLocal();
  },

  spawnDeliveryOrder: () => {
    const { deliveryOrders, gameState } = get();
    if (!get().isShopOpen) return;
    if (gameState.businessStage === 'cart' && gameState.player.cookingLevel < 2) { get().showToast('Giao hàng mở khi tay nghề đạt cấp 2 hoặc quán lên cấp Góc Phố.'); return; }
    if (gameState.lastDeliveryRequestMinute !== undefined && gameState.gameTimeMinutes - gameState.lastDeliveryRequestMinute < 30) return;
    const activeRestId = gameState.activeRestaurantId || 'banh_mi';
    const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

    // Lọc bỏ bất kỳ đơn nào không thuộc thực đơn của quán hiện tại
    const validExistingOrders = deliveryOrders.filter((o) =>
      currentRest.primaryRecipeIds.includes(o.recipeId)
    );

    if (validExistingOrders.length >= 3) {
      if (validExistingOrders.length !== deliveryOrders.length) {
        set({ deliveryOrders: validExistingOrders });
      }
      return;
    }

    const customers = [
      'Phòng Marketing Tầng 3',
      'Anh Tuấn Shipper Chạy Đêm',
      'Nhóm Học Sinh Trường Làng',
      'Chị Ngọc Kế Toán',
      'Đội Bảo Vệ Khu Phố',
      'Công Ty Bất Động Sản',
      'Ngân Hàng Đối Diện',
      'Bệnh Viện Quận',
      'Ủy Ban Phường',
      'Xưởng May Gia Công',
    ];

    // Chỉ sinh món thuộc thực đơn của quán đang kinh doanh
    const availableRecipes = (currentRest.primaryRecipeIds || []).filter((rId) =>
      gameState.unlockedRecipes.includes(rId) && (gameState.menuSettings?.[activeRestId]?.activeRecipes || currentRest.primaryRecipeIds).includes(rId)
    );
    const candidateRecipes: RecipeId[] =
      availableRecipes;
    if (!candidateRecipes.length) return;

    const chosenRecipeId = candidateRecipes[Math.floor(Math.random() * candidateRecipes.length)];
    const recipe = RECIPES[chosenRecipeId];
    if (!recipe) return;

    const qty = Math.floor(Math.random() * 2) + 2; // 2 - 3 suất

    const stageId = gameState.businessStage || 'cart';
    const stageUpgrades = gameState.stageUpgrades?.[stageId] ?? (gameState.stageUpgrades ? {} : gameState.purchasedUpgrades || {});
    const deliveryBonus = calculateDeliveryBonus(stageId, stageUpgrades, gameState.stageUpgrades);

    const baseRev = (gameState.menuSettings?.[activeRestId]?.prices?.[chosenRecipeId] ?? recipe.basePrice) * qty;
    const tip = Math.round(baseRev * (0.2 + deliveryBonus) * ((gameState.neighbors.chu_nam?.level || 1) >= 2 ? 1.2 : 1));

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

    set({
      deliveryOrders: [...validExistingOrders, newOrder],
      gameState: { ...gameState, lastDeliveryRequestMinute:gameState.gameTimeMinutes },
    });
    get().showToast(`🛵 Có đơn ship [${recipe.name} x${qty}] mới từ ${newOrder.customerName}!`);
  },

  fulfillDeliveryOrder: (orderId) => {
    const state = get();
    const game = state.gameState;
    const order = state.deliveryOrders.find(o => o.id === orderId);
    if (!order || order.timeRemainingSeconds <= 0 || !state.isShopOpen) return false;
    if (order.status === 'ready') {
      set({ deliveryOrders: state.deliveryOrders.map(o => o.id === orderId ? { ...o, status: 'delivering', workRemainingSeconds: 12 } : o) });
      get().saveLocal();
      return true;
    }
    if (order.status !== 'pending') return false;
    const recipe = RECIPES[order.recipeId];
    const busy = new Set([...state.activeOrders.filter(o => o.state === 'cooking').map(o => o.chefId || 'player'), ...state.deliveryOrders.filter(o => o.status === 'cooking').map(o => o.chefId || 'player')]);
    const chef = game.hiredEmployees.map(id => game.employeeDetails[id] || EMPLOYEES.find(e => e.id === id)).find(e => e && ['cook','manager'].includes(e.role) && (e.assignedRestaurantId || 'banh_mi') === (game.activeRestaurantId || 'banh_mi') && !busy.has(e.id));
    if (!chef && busy.has('player')) { get().showToast('Bếp đang bận. Hoàn tất món hiện tại trước khi nhận đơn ship.'); return false; }
    const needs: Partial<Record<IngredientId, number>> = {};
    recipe.requiredIngredients.forEach(id => { needs[id] = (needs[id] || 0) + order.quantity; });
    if (Object.entries(needs).some(([id, count]) => (game.inventory[id as IngredientId] || 0) < count!)) { get().showToast('Không đủ nguyên liệu cho toàn bộ đơn giao.'); return false; }
    if (!chef && !get().consumeEnergy(order.quantity * 3)) return false;
    const inventory = { ...game.inventory };
    Object.entries(needs).forEach(([id, count]) => { inventory[id as IngredientId] = (inventory[id as IngredientId] || 0) - count!; });
    const cogs = recipe.requiredIngredients.reduce((sum, id) => sum + getIngredientCurrentPrice(id, game.marketPrices), 0) * order.quantity;
    const levels = game.stageUpgrades?.[game.businessStage] || game.purchasedUpgrades;
    const speed = chef ? calculateCookEfficiency(chef).speedMultiplier : 1;
    const work = recipe.cookingTimeMs / 1000 * order.quantity / speed / (1 + calculateCookSpeedBoost(game.businessStage, levels, game.stageUpgrades));
    set(current => ({ deliveryOrders: current.deliveryOrders.map(o => o.id === orderId ? { ...o, status: 'cooking', chefId: chef?.id, chefName: chef?.name || 'Bạn', workRemainingSeconds: work, cogs, shippingFee: Math.round(o.rewardMoney * 0.1) } : o),
      gameState: { ...current.gameState, inventory, restaurantInventories: { ...current.gameState.restaurantInventories, [game.activeRestaurantId || 'banh_mi']: inventory },
        branchFinances: withBranchOperation(current.gameState,game.activeRestaurantId || 'banh_mi',0,cogs),
        dailyFinance: { ...createInitialDailyFinance(), ...current.gameState.dailyFinance, cogs: (current.gameState.dailyFinance?.cogs || 0) + cogs } } }));
    get().showToast('Đã nhận đơn và đưa vào bếp. Đóng cửa sổ để tiếp tục ca bán.');
    get().saveLocal();
    return true;
  },

  tickDeliveries: (seconds) => {
    if (seconds <= 0 || !Number.isFinite(seconds) || !get().isShopOpen) return;
    for (const original of [...get().deliveryOrders]) {
      const state = get();
      const order = state.deliveryOrders.find(o => o.id === original.id);
      if (!order) continue;
      const timeRemainingSeconds = order.timeRemainingSeconds - seconds;
      const workRemainingSeconds = Math.max(0, (order.workRemainingSeconds || 0) - seconds);
      if (timeRemainingSeconds <= 0) {
        set(current => ({ deliveryOrders: current.deliveryOrders.filter(o => o.id !== order.id), dailyCustomersLost: current.dailyCustomersLost + 1,
          gameState: { ...current.gameState, reputation: Math.max(0, current.gameState.reputation - 1), fame: Math.max(0, (current.gameState.fame ?? current.gameState.reputation) - 1) } }));
        get().showToast(`Đơn ${order.customerName} quá hạn. Nguyên liệu đã chế biến không được hoàn lại.`);
        continue;
      }
      if (order.status === 'delivering' && workRemainingSeconds <= 0) {
        const revenue = order.rewardMoney + order.rewardTip;
        const fee = order.shippingFee || 0;
        set(current => ({ dailyRevenue: (current.gameState.dailyFinance?.revenue || 0) + revenue,
          dailyCustomersServed: current.dailyCustomersServed + order.quantity,
          deliveryOrders: current.deliveryOrders.filter(o => o.id !== order.id),
          gameState: { ...current.gameState, money: current.gameState.money + revenue - fee,
            branchFinances: withBranchOperation(current.gameState,current.gameState.activeRestaurantId || 'banh_mi',revenue,0,order.quantity,fee),
            businessMetrics: { ...current.gameState.businessMetrics!, lifetimeRevenue:(current.gameState.businessMetrics?.lifetimeRevenue || 0) + revenue, lifetimeProfit:(current.gameState.businessMetrics?.lifetimeProfit || 0) + revenue - (order.cogs || 0) - fee, totalCustomers:(current.gameState.businessMetrics?.totalCustomers || 0) + order.quantity },
            totalDeliveriesCompleted: (current.gameState.totalDeliveriesCompleted || 0) + 1,
            reputation: current.gameState.reputation + 1, fame: (current.gameState.fame ?? current.gameState.reputation) + 1,
            dailyFinance: { ...createInitialDailyFinance(), ...current.gameState.dailyFinance, revenue: (current.gameState.dailyFinance?.revenue || 0) + revenue,
              tips: (current.gameState.dailyFinance?.tips || 0) + order.rewardTip, deliveryFees: (current.gameState.dailyFinance?.deliveryFees || 0) + fee } } }));
        get().serveNeighborGuest('chu_nam');
        get().showToast(`Giao thành công: +${(revenue - fee).toLocaleString('vi-VN')}đ sau phí ship.`);
        get().saveLocal();
      } else {
        const status = order.status === 'cooking' && workRemainingSeconds <= 0 ? 'ready' as const : order.status;
        set(current => ({ deliveryOrders: current.deliveryOrders.map(o => o.id === order.id ? { ...o, timeRemainingSeconds, workRemainingSeconds, status } : o) }));
      }
    }
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

    if (!event && get().dailyEventsCount >= 3) { get().showToast('Hôm nay đã đủ chuyện xóm. Ghé lại vào ngày mai nhé.'); return; }
    const recent = gameState.streetEventHistory?.slice(-3) || [];
    const available = STREET_EVENTS.filter(item => !recent.includes(item.id));
    const pool = available.length ? available : STREET_EVENTS;
    const chosen = event || pool[Math.floor(Math.random() * pool.length)];
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
      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,
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
        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance,
          otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + gain,
          eventExpenses: (state.gameState.dailyFinance?.eventExpenses || 0) + cost },
        fame: Math.max(0, (state.gameState.fame ?? state.gameState.reputation) + rep),
        reputation: Math.max(0, state.gameState.reputation + rep),
        player: {
          ...state.gameState.player,
          energy: newEnergy,
        },
        currentEvent: null,
        streetEventHistory: [...(state.gameState.streetEventHistory || []), event.id].slice(-20),
      },
    }));

    get().saveLocal();
  },

  closeStreetEventOutcome: () => {
    set({ lastEventOutcome: null, activeModal: null });
  },

  triggerSurpriseIncident: (incident) => {
    if (!incident && get().hasIncidentTriggeredToday) { get().showToast('Hôm nay đã có một biến cố. Hãy tập trung hoàn tất ca bán.'); return; }
    const chosen = incident || chooseContextualIncident(get().gameState, get().deliveryOrders.some(o => o.status !== 'pending'));
    set({ activeIncident: chosen, hasIncidentTriggeredToday: true });
  },

  resolveSurpriseIncident: (response = 'accept') => {
    const { activeIncident, gameState } = get();
    if (!activeIncident) return;

    const mitigating = response === 'mitigate' && activeIncident.moneyChange < 0;
    if (mitigating && gameState.player.energy < 10) { get().showToast('Cần 10 thể lực để tự khắc phục sự cố.'); return; }
    const moneyDiff = mitigating ? Math.round(activeIncident.moneyChange * 0.5) : activeIncident.moneyChange;
    const repDiff = mitigating ? 0 : activeIncident.reputationChange;

    const newMoney = gameState.money + moneyDiff;
    // BUG 1 FIXED: Không giới hạn cap 100 điểm với uy tín / danh tiếng!
    const newReputation = Math.max(0, (gameState.reputation || 0) + repDiff * 4);
    const newFame = Math.max(0, (gameState.fame ?? gameState.reputation ?? 0) + repDiff * 4);

    const currentFinance: DailyFinance = gameState.dailyFinance || createInitialDailyFinance();
    const updatedFinance: DailyFinance = {
      ...currentFinance,
      eventExpenses: moneyDiff < 0 ? currentFinance.eventExpenses + Math.abs(moneyDiff) : currentFinance.eventExpenses,
      otherIncome: moneyDiff > 0 ? currentFinance.otherIncome + moneyDiff : currentFinance.otherIncome,
    };

    set((state) => ({
      activeIncident: null,
      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,
      gameState: {
        ...state.gameState,
        money: newMoney,
        incidentHistory: [...(gameState.incidentHistory || []), activeIncident.id].slice(-20),
        player: { ...state.gameState.player, energy:state.gameState.player.energy - (mitigating ? 10 : 0) },
        reputation: newReputation,
        fame: newFame,
        dailyFinance: updatedFinance,
      },
    }));

    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

    if (moneyDiff > 0) {
      get().addFloatingFeedback(`+${moneyDiff.toLocaleString('vi-VN')} đ`, 'money', centerX, centerY - 30);
      get().showToast(`🎉 Đã nhận +${moneyDiff.toLocaleString('vi-VN')} đ vào két sắt quán!`);
    } else if (moneyDiff < 0) {
      get().addFloatingFeedback(`${moneyDiff.toLocaleString('vi-VN')} đ`, 'warning', centerX, centerY - 30);
      get().showToast(`⚠️ Đã trừ ${moneyDiff.toLocaleString('vi-VN')} đ chi phí sự cố!`);
    }

    if (repDiff > 0) {
      get().addFloatingFeedback(`+${repDiff} ⭐`, 'star', centerX + 30, centerY);
    } else if (repDiff < 0) {
      get().addFloatingFeedback(`${repDiff} ⭐`, 'warning', centerX + 30, centerY);
    }

    get().saveLocal();
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

    const upgradeHistory = gameState.stageUpgrades || { [gameState.businessStage || 'cart']: gameState.purchasedUpgrades || {} };
    const nextStageUpgrades = upgradeHistory[nextStageId] || {};
    const newStorageCapacity = Math.max(
      gameState.storageCapacity,
      calculateStorageCapacity(nextStageId, nextStageUpgrades, upgradeHistory)
    );

    set({
      gameState: {
        ...gameState,
        money: gameState.money - nextStage.cost,
        businessStage: nextStageId,
        storageCapacity: newStorageCapacity,
        stageUpgrades: {
          ...upgradeHistory,
          [nextStageId]: nextStageUpgrades,
        },
      },
    });

    get().showToast(`🎉 Đột phá Kỷ Nguyên! Chào mừng đến với "${nextStage.name}"! Kho mở rộng đạt ${newStorageCapacity} ô!`);
    get().saveLocal();
    return true;
  },

  chooseStarterRestaurant: (restaurantId: RestaurantTypeId) => {
    const restaurant = RESTAURANT_TYPES[restaurantId];
    if (!restaurant) return;

    const starterInventory = getStarterInventoryForRestaurant(restaurantId);
    const starterRecipes = getStarterRecipesForRestaurant(restaurantId);

    set((state) => {
      const currentUnlocked = state.gameState.unlockedRestaurants || [];
      const updatedUnlocked = currentUnlocked.includes(restaurantId)
        ? currentUnlocked
        : [...currentUnlocked, restaurantId];

      const updatedRestaurantInventories = {
        ...(state.gameState.restaurantInventories || {}),
        [restaurantId]: starterInventory,
      };

      return {
        showFlashScreen: false,
        deliveryOrders: [], // Xóa sạch đơn giao hàng cũ khi bắt đầu chọn thương hiệu
        gameState: {
          ...state.gameState,
          activeRestaurantId: restaurantId,
          unlockedRestaurants: updatedUnlocked,
          hasChosenStarter: true,
          shopName: restaurant.name,
          inventory: starterInventory,
          restaurantInventories: updatedRestaurantInventories,
          unlockedRecipes: starterRecipes,
          deliveryOrders: [],
        },
        activeOrders: [],
      };
    });
    get().saveLocal();
    get().showToast(`Chúc mừng bạn đã khai trương ${restaurant.name}! 🚀`);
  },

  switchActiveRestaurant: (restaurantId: RestaurantTypeId) => {
    const restaurant = RESTAURANT_TYPES[restaurantId];
    const { gameState } = get();
    if (!restaurant || !gameState.unlockedRestaurants?.includes(restaurantId)) return;

    const currentRestId = gameState.activeRestaurantId || 'banh_mi';
    if (currentRestId === restaurantId) return;
    if (get().activeOrders.length || get().deliveryOrders.some(o => o.status !== 'pending')) {
      get().showToast('Hãy hoàn tất khách và đơn giao đang làm trước khi chuyển quán.');
      return;
    }

    set((state) => {
      // 1. Lưu kho của quán đang kích hoạt
      const updatedRestaurantInventories = {
        ...(state.gameState.restaurantInventories || {}),
        [currentRestId]: { ...state.gameState.inventory },
      };

      // 2. Lấy kho riêng của quán được chuyển tới
      const targetInventory =
        updatedRestaurantInventories[restaurantId] ||
        getStarterInventoryForRestaurant(restaurantId);
      updatedRestaurantInventories[restaurantId] = targetInventory;

      // 3. Mở khóa thêm các công thức cơ bản của quán này nếu chưa có
      const starterRecipes = getStarterRecipesForRestaurant(restaurantId);
      const updatedUnlockedRecipes = Array.from(
        new Set([...state.gameState.unlockedRecipes, ...starterRecipes])
      );

      // 4. Lọc đơn ship: chỉ giữ các đơn thuộc thực đơn quán mới
      const filteredDeliveries = state.deliveryOrders.filter((o) =>
        restaurant.primaryRecipeIds.includes(o.recipeId)
      );

      return {
        gameState: {
          ...state.gameState,
          activeRestaurantId: restaurantId,
          shopName: restaurant.name,
          inventory: targetInventory,
          restaurantInventories: updatedRestaurantInventories,
          unlockedRecipes: updatedUnlockedRecipes,
          deliveryOrders: filteredDeliveries,
        },
        activeOrders: [], // Xóa bàn chờ cũ để khách mới kéo vào gọi món của quán mới
        deliveryOrders: filteredDeliveries,
      };
    });
    get().saveLocal();
    get().showToast(`Đã chuyển tới quản lý: ${restaurant.name} ${restaurant.icon}`);
  },

  unlockRestaurantFranchise: (restaurantId: RestaurantTypeId) => {
    const restaurant = RESTAURANT_TYPES[restaurantId];
    const { gameState } = get();
    if (!restaurant) return false;

    if (gameState.unlockedRestaurants?.includes(restaurantId)) {
      get().showToast('Bạn đã sở hữu thương hiệu này rồi!');
      return false;
    }

    if (gameState.money < restaurant.unlockCost) {
      get().showToast(`Cần thêm ${(restaurant.unlockCost - gameState.money).toLocaleString('vi-VN')} đ để mở chi nhánh!`);
      return false;
    }

    if (gameState.reputation < restaurant.requiredReputation) {
      get().showToast(`Cần ${restaurant.requiredReputation}⭐ Uy tín để mở chi nhánh này!`);
      return false;
    }

    if (restaurant.requiredStaffCount && gameState.hiredEmployees.length < restaurant.requiredStaffCount) {
      get().showToast(`⚠️ Cần tuyển ít nhất ${restaurant.requiredStaffCount} nhân viên để quản lý chi nhánh ${restaurant.name}! (Hiện có ${gameState.hiredEmployees.length} NV)`);
      return false;
    }

    const currentUnlocked = gameState.unlockedRestaurants || ['banh_mi'];
    const currentStage = BUSINESS_STAGES[gameState.businessStage || 'cart'];
    const maxBranches = currentStage?.maxRestaurants ?? 1;

    if (currentUnlocked.length >= maxBranches) {
      get().showToast(`⚠️ Cấp bậc [${currentStage?.name || 'Hiện tại'}] chỉ cho phép vận hành tối đa ${maxBranches} quán! Nâng cấp sự nghiệp kinh doanh để mở thêm chi nhánh.`);
      return false;
    }

    const currentBranchLevels = gameState.branchLevels || {
      banh_mi: 1,
      pho: 1,
      bun: 1,
      beefsteak: 1,
      com_tam: 1,
    };

    const currentRestId = gameState.activeRestaurantId || 'banh_mi';
    const branchStarterInv = getStarterInventoryForRestaurant(restaurantId);
    const starterRecipes = getStarterRecipesForRestaurant(restaurantId);

    set((state) => {
      const updatedRestaurantInventories = {
        ...(state.gameState.restaurantInventories || {}),
        [currentRestId]: { ...state.gameState.inventory },
        [restaurantId]: branchStarterInv,
      };

      const updatedUnlockedRecipes = Array.from(
        new Set([...state.gameState.unlockedRecipes, ...starterRecipes])
      );

      return {
        gameState: {
          ...state.gameState,
          money: state.gameState.money - restaurant.unlockCost,
          unlockedRestaurants: [...currentUnlocked, restaurantId],
          branchLevels: {
            ...currentBranchLevels,
            [restaurantId]: 1,
          },
          activeRestaurantId: restaurantId,
          shopName: restaurant.name,
          inventory: branchStarterInv,
          restaurantInventories: updatedRestaurantInventories,
          unlockedRecipes: updatedUnlockedRecipes,
        },
        activeOrders: [],
      };
    });

    get().saveLocal();
    get().showToast(`Tưng bừng khai trương chi nhánh mới: ${restaurant.name}! 🎊`);
    return true;
  },

  upgradeBranch: (restaurantId: RestaurantTypeId) => {
    const { gameState } = get();
    const rest = RESTAURANT_TYPES[restaurantId];
    if (!rest) return false;

    const unlockedList = gameState.unlockedRestaurants || ['banh_mi'];
    if (!unlockedList.includes(restaurantId)) {
      get().showToast('❌ Quán ăn này chưa được mở khóa!');
      return false;
    }

    const currentBranchLevels = gameState.branchLevels || {
      banh_mi: 1,
      pho: 1,
      bun: 1,
      beefsteak: 1,
      com_tam: 1,
    };
    const currentLevel = currentBranchLevels[restaurantId] || 1;
    const tierInfo = getBranchTierInfo(restaurantId, currentLevel);

    if (tierInfo.isMax || !tierInfo.nextTier) {
      get().showToast(`👑 ${rest.name} đã đạt cấp độ Flagship tối đa!`);
      return false;
    }

    const nextTier = tierInfo.nextTier;

    if (gameState.money < nextTier.cost) {
      get().showToast(`❌ Cần thêm ${(nextTier.cost - gameState.money).toLocaleString('vi-VN')} đ để nâng cấp chi nhánh!`);
      return false;
    }

    if (gameState.reputation < nextTier.requiredReputation) {
      get().showToast(`❌ Cần ${nextTier.requiredReputation}⭐ Uy tín để nâng cấp lên [${nextTier.name}]!`);
      return false;
    }

    // Kiểm tra nhân sự phân công trực tiếp tại chi nhánh
    const branchStaff = gameState.hiredEmployees.filter(
      (id) => (gameState.employeeDetails[id]?.assignedRestaurantId || 'banh_mi') === restaurantId
    );
    if (branchStaff.length < nextTier.requiredStaff) {
      get().showToast(`⚠️ Cần ít nhất ${nextTier.requiredStaff} nhân viên phụ trách trực tiếp chi nhánh này để nâng cấp! (Hiện có: ${branchStaff.length} NV)`);
      return false;
    }

    set((state) => ({
      gameState: {
        ...state.gameState,
        money: state.gameState.money - nextTier.cost,
        reputation: state.gameState.reputation + 20,
        branchLevels: {
          ...currentBranchLevels,
          [restaurantId]: currentLevel + 1,
        },
      },
    }));

    get().showToast(`🎊 Nâng cấp thành công ${rest.name} lên [${nextTier.name}]! (+20⭐)`);
    get().saveLocal();
    return true;
  },

  endDayAndSleep: () => {
    if (!get().isShopOpen && !get().isDailySummaryShown && get().gameState.dayPhase !== 'night_audit') {
      get().showToast('Hãy mở và kết thúc ca bán trước khi kết toán ngày.');
      return;
    }
    if (get().gameState.settledDay === get().gameState.day) return;
    if (get().activeOrders.length || get().isShopOpen) get().forceCloseStoreTonight();
    if (get().gameState.activeLotteryTicket) get().checkLotteryDraw();
    const { gameState, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();
    const statement = getOperatingStatement(gameState);
    const dailyRevenue = statement.finance.revenue;

    // Nếu còn vé số chưa quay trước khi ngủ, tự động quay thưởng
    if (gameState.activeLotteryTicket) {
      get().checkLotteryDraw();
    }

    // 1. Tính lương nhân viên
    let totalSalaries = 0;
    const updatedEmployees = { ...gameState.employeeDetails };
    const hasCatPainting = gameState.equippedDecorations.includes('deco_cat_painting');

    for (const empId of gameState.hiredEmployees) {
      const emp = updatedEmployees[empId] || EMPLOYEES.find((e) => e.id === empId);
      if (emp) {
        totalSalaries += emp.salaryPerDay;

        // Cập nhật độ stress & mood sau ngày làm việc
        const stressDelta = hasCatPainting ? 4 : 8;
        const newStress = Math.min(100, (emp.stress ?? 15) + stressDelta);
        const newMood = Math.max(10, (emp.mood ?? 85) - Math.floor(newStress / 10));

        updatedEmployees[empId] = {
          ...emp,
          stress: newStress,
          mood: newMood,
          experience: (emp.experience || 0) + 25,
          daysWorked: (emp.daysWorked || 0) + 1,
          lastWorkedDay: gameState.day,
        };
      }
    }

    // 2. Tính chi phí cố định theo Business Stage (Mặt bằng & Điện nước)
    const rentPaid = statement.rent;
    const utilitiesPaid = statement.utilities;
    const currentFinance = statement.finance;
    const cogsPaid = currentFinance.cogs;
    const grossProfit = statement.grossProfit;
    const marketingPaid = currentFinance.marketing;
    const netProfit = statement.netProfit + statement.spoilage.spoilageCost;

    // 4. Phân tích Nút Cổ Chai (Bottleneck: Cầu - Năng lực - Kho)
    const bottleneckAnalysis = calculateBottleneck({
      servedCount: dailyCustomersServed,
      lostCount: dailyCustomersLost,
      capacityBottleneckCount: get().lossReasons.capacity,
      stockBottleneckCount: get().lossReasons.inventory,
      demandBottleneckCount: get().lossReasons.demand,
      revenue: dailyRevenue,
      reputation: gameState.reputation || 0,
    });

    // 5. Tính toán hao hụt nguyên liệu tươi cuối ngày (Daily Spoilage)
    const spoilage = statement.spoilage;

    // 6. Tính dự báo dòng tiền 3 ngày tới
    const projectedCashflow = calculate3DayCashflowForecast({
      currentMoney: statement.closingCash,
      dailyNetProfit: netProfit - spoilage.spoilageCost,
      fixedCostsPerDay: totalSalaries + rentPaid + utilitiesPaid,
    });

    // 7. Đánh giá 5 mức Sức khỏe Tài chính
    const nextMoney = statement.closingCash;
    const nextCrisisCount = nextMoney <= 0 ? (gameState.consecutiveCrisisDays || 0) + 1 : 0;
    const health = evaluateFinancialHealth({
      currentMoney: nextMoney,
      dailyFixedCost: totalSalaries + rentPaid + utilitiesPaid,
      loanDebt: gameState.loanDebt || 0,
      consecutiveCrisisDays: nextCrisisCount,
    });

    // 8. Tính Uy tín trung bình trượt 14 ngày (Rolling Average)
    const pastRatings = [...(gameState.rollingRatings || []), gameState.rating ?? 75];
    const rollingRep = calculateRollingReputation(gameState.reputation, pastRatings);

    // 9. Sinh Insights thông minh cho báo cáo ngày
    const insights = generateDailyInsights({
      finance: {
        ...currentFinance,
        revenue: dailyRevenue,
        cogs: cogsPaid,
        grossProfit,
        payroll: totalSalaries,
        rent: rentPaid,
        utilities: utilitiesPaid,
        marketing: marketingPaid,
        netProfit: netProfit - spoilage.spoilageCost,
      },
      servedCount: dailyCustomersServed,
      lostCount: dailyCustomersLost,
      averageRating: gameState.rating ?? 75,
    });

    const summary: DailySummary = {
      day: gameState.day,
      totalRevenue: dailyRevenue,
      cogs: cogsPaid,
      ingredientCost: dailyCost,
      salariesPaid: totalSalaries,
      rentPaid,
      utilitiesPaid,
      marketingPaid,
      grossProfit,
      netProfit: netProfit - spoilage.spoilageCost,
      servedCustomers: dailyCustomersServed,
      lostCustomers: dailyCustomersLost,
      reputationChange: Math.max(0, dailyCustomersServed - dailyCustomersLost),
      averageRating: gameState.rating ?? 75,
      fameGain: Math.max(0, dailyCustomersServed - dailyCustomersLost),
      insights,
      branchFinances: statement.branchStatements,
      primaryBottleneck: bottleneckAnalysis.type,
      bottleneckAnalysis,
      projectedCashflow3Days: projectedCashflow,
      financialHealth: health.level,
      spoilageCost: spoilage.spoilageCost,
      spoilageDetails: spoilage.spoilageDetails,
      rollingReputation: rollingRep,
    };

    // 10. Chu kỳ thời tiết ngẫu nhiên cho ngày hôm sau
    const weatherRoll = Math.random();
    const nextWeather: 'sunny' | 'rainy' | 'breezy' =
      weatherRoll < 0.5 ? 'sunny' : weatherRoll < 0.8 ? 'rainy' : 'breezy';

    // 11. Sinh giá thị trường biến động cho ngày hôm sau
    const nextMarketPrices = generateDailyMarketPrices(nextWeather);

    // 12. Sinh Bản Tin Sáng (Morning Briefing) cho Ngày Mới
    const briefing = generateMorningBriefing({
      day: gameState.day + 1,
      weather: nextWeather,
      businessStage: gameState.businessStage || 'cart',
    });
    if (nextWeather === 'rainy' && (gameState.neighbors.chu_nam?.level || 1) >= 2) briefing.warningAlert = 'Chú Năm báo trước: ngày mai mưa, chuẩn bị bếp và nguyên liệu cho đơn giao; tránh nhận nhiều đơn cùng lúc.';

    // Sự kiện đặc biệt chợ đầu mối giảm giá mỗi ngày
    const marketSpecialCandidates: { ingredientId: IngredientId; discountPercent: number; newsText: string }[] = [
      { ingredientId: 'egg', discountPercent: 30, newsText: 'Trang trại xả kho trứng gà tươi sạch loại 1 (-30%)' },
      { ingredientId: 'bread', discountPercent: 25, newsText: 'Lò bánh mì đầu ngõ trợ giá sáng sớm (-25%)' },
      { ingredientId: 'pork', discountPercent: 20, newsText: 'Chợ đầu mối thịt heo tươi ngon mở bán trợ giá (-20%)' },
      { ingredientId: 'beef', discountPercent: 35, newsText: 'Nông trại bắp bò Úc nhập khẩu khuyến mãi sâu (-35%)' },
      { ingredientId: 'pho_noodle', discountPercent: 30, newsText: 'Làng nghề bánh phở tươi tráng nóng xả kho (-30%)' },
      { ingredientId: 'tea', discountPercent: 30, newsText: 'Đồi chè Bảo Lộc thu hoạch rộ chè tươi (-30%)' },
      { ingredientId: 'coffee', discountPercent: 25, newsText: 'Đại lý hạt Robusta Ban Mê xả hàng niên vụ mới (-25%)' },
      { ingredientId: 'cucumber', discountPercent: 40, newsText: 'Vựa rau củ sạch Đà Lạt xả kho dưa leo (-40%)' },
      { ingredientId: 'broken_rice', discountPercent: 25, newsText: 'Vựa gạo miền Tây chuyển hàng gạo tấm thơm (-25%)' },
      { ingredientId: 'butter', discountPercent: 30, newsText: 'Bơ lạt thơm béo nhập khẩu trợ giá làm bò né (-30%)' },
    ];
    const pickedSpecial = marketSpecialCandidates[Math.floor(Math.random() * marketSpecialCandidates.length)];

    // Trừ các chi phí cố định (lương + mặt bằng + điện nước + hao hụt) khỏi ví
    const fixedCostDeductions = totalSalaries + rentPaid + utilitiesPaid;

    const nextDayState: GameSaveState = {
      ...gameState,
      day: gameState.day + 1,
      gameTimeMinutes: 360, // 06:00 sáng
      money: nextMoney,
      businessMetrics: { ...gameState.businessMetrics!, lifetimeProfit:gameState.historySummaries.reduce((sum,day) => sum + day.netProfit,0) + statement.netProfit },
      player: {
        ...gameState.player,
        energy: gameState.player.maxEnergy, // Hồi phục 100% năng lượng
      },
      dayPhase: 'morning_prep',
      morningBriefing: briefing,
      financialHealth: health.level,
      consecutiveCrisisDays: nextCrisisCount,
      rollingRatings: pastRatings.slice(-14),
      loanDebt: Math.max(0, (gameState.loanDebt || 0) - statement.debtPayment),
      settledDay: gameState.day,
      operatingSnapshot: undefined,
      lastDeliveryRequestMinute: undefined,
      restaurantInventories: statement.inventories,
      inventory: spoilage.updatedInventory,
      weather: nextWeather,
      marketPrices: nextMarketPrices,
      dailyFinance: createInitialDailyFinance(),
      branchFinances: {},
      marketSpecial: pickedSpecial,
      employeeDetails: updatedEmployees,
      historySummaries: [summary, ...gameState.historySummaries],
      currentEvent: null,
      lastSavedAt: new Date().toISOString(),
    };

    set({
      gameState: nextDayState,
      activeOrders: [],
      deliveryOrders: [],
      activeIncident: null,
      isShopOpen: false,
      isDailySummaryShown: false,
      hasEventTriggeredToday: false,
      hasIncidentTriggeredToday: false,
      dailyEventsCount: 0,
      lastEventTimeMinutes: 0,
      lastEventOutcome: null,
      isLotteryDrawnToday: false,
      activeModal: null,
      dailyRevenue: 0,
      dailyCost: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      lossReasons: { inventory:0, capacity:0, demand:0 },
    });

    const weatherEmoji = nextWeather === 'sunny' ? '☀️' : nextWeather === 'rainy' ? '🌧️' : '🍃';
    get().showToast(
      `${weatherEmoji} Chào buổi sáng Ngày ${nextDayState.day}! Đã trừ chi phí cố định (-${fixedCostDeductions.toLocaleString('vi-VN')} đ). Hãy xem Bản Tin Sáng trước khi mở cửa!`
    );
    get().saveLocal();
    get().syncCloud();
  },

  forceCloseStoreTonight: () => {
    if (get().gameState.dayPhase === 'night_audit') return;
    const { activeOrders, gameState } = get();
    for (const order of activeOrders.filter(o => o.state === 'paying')) get().collectPayment(order.id);
    const remaining = get().activeOrders;
    const lostCount = remaining.length + get().deliveryOrders.filter(o => o.status !== 'pending').length;
    const currentRating = get().gameState.rating ?? 75;
    const newRating = lostCount > 0 ? updateShopRating(currentRating, 20) : currentRating;

    set((state) => ({
      dailyCustomersLost: state.dailyCustomersLost + lostCount,
      lossReasons: { ...state.lossReasons, capacity:state.lossReasons.capacity + lostCount },
      activeOrders: [],
      deliveryOrders: [],
      isShopOpen: false,
      isDailySummaryShown: true,
      activeModal: 'dailySummary',
      gameState: {
        ...state.gameState,
        dayPhase: 'night_audit',
        gameTimeMinutes: 1320,
        reputation: Math.max(0, state.gameState.reputation - (lostCount > 0 ? 1 : 0)),
        fame: Math.max(0, (state.gameState.fame ?? state.gameState.reputation) - (lostCount > 0 ? 1 : 0)),
        rating: newRating,
      },
    }));
    get().showToast('🧹 Đã dọn quán đóng cửa và chuyển sang Bảng Kết Toán Ngày!');
    get().saveLocal();
  },

  openStoreForDay: () => {
    if (get().gameState.dayPhase === 'night_audit') { get().openModal('dailySummary'); return; }
    set((state) => ({
      isShopOpen: true,
      gameState: {
        ...state.gameState,
        dayPhase: 'operating',
      },
    }));
    get().showToast('🔔 ĐÃ MỞ CỬA BÁN HÀNG! Chúc quán buôn may bán đắt! 🌸');
  },

  takeEmergencyLoan: (source: 'neighbor' | 'bank') => {
    const { gameState } = get();
    if ((gameState.loanDebt || 0) > 0) { get().showToast('Cần trả hết khoản vay hiện tại trước khi vay tiếp.'); return false; }
    const amount = source === 'neighbor' ? 1000000 : 5000000;
    const addedDebt = source === 'neighbor' ? 1000000 : 5500000;
    set({
      gameState: {
        ...gameState,
        money: gameState.money + amount,
        loanDebt: addedDebt,
        loanRepaymentPerDay: Math.ceil(addedDebt / 10),
        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, otherExpense: (gameState.dailyFinance?.otherExpense || 0) + addedDebt - amount },
        consecutiveCrisisDays: 0,
        financialHealth: 'deficit',
      },
    });
    get().showToast(`💵 Đã nhận ${amount.toLocaleString('vi-VN')}đ cứu trợ từ ${source === 'neighbor' ? 'Bác Ba Hàng Xóm' : 'Ngân hàng'}!`);
    get().saveLocal();
    return true;
  },

  liquidateEquipment: () => {
    const { gameState } = get();
    const offer = getLiquidationOffer(gameState);
    if (!offer) { get().showToast('Không có thiết bị đã mua để thanh lý.'); return false; }
    const levels = { ...(gameState.stageUpgrades || { [gameState.businessStage]: gameState.purchasedUpgrades }) };
    levels[offer.stage] = { ...levels[offer.stage], [offer.id]: offer.level - 1 };
    const current = levels[gameState.businessStage] || {};
    if (get().activeOrders.some(o => o.tableIndex > calculateMaxTables(gameState.businessStage, current, levels))) { get().showToast('Hoàn tất các bàn đang phục vụ trước khi bán bớt thiết bị.'); return false; }
    set({ gameState: { ...gameState, money: gameState.money + offer.value,
      stageUpgrades: levels, purchasedUpgrades: current,
      storageCapacity: calculateStorageCapacity(gameState.businessStage, current, levels),
      fridgeUpgradeLevel: Math.min(2, Object.values(levels).reduce((sum, value) => sum + (value?.cozy_storage || 0), 0)),
      financialHealth: 'stress', consecutiveCrisisDays: 0 } });
    get().showToast(`Đã bán ${offer.title}: +${offer.value.toLocaleString('vi-VN')}đ. Hiệu quả thiết bị giảm một cấp.`);
    get().saveLocal();
    return true;
  },

  resetGameWithLegacy: () => {
    const { gameState } = get();
    if (gameState.financialHealth !== 'bankrupt') { get().showToast('Di sản chỉ được kế thừa khi hành trình đã phá sản.'); return; }
    const pointsEarned = Math.max(1, Math.floor((gameState.businessMetrics?.lifetimeRevenue || 0) / 1000000) + (gameState.unlockedRestaurants?.length || 1) * 3);
    const totalLegacy = (gameState.legacyPoints || 0) + pointsEarned;
    const bonusStartMoney = 500000 + Math.min(2000000, totalLegacy * 25000);

    set({
      gameState: {
        ...INITIAL_GAME_STATE,
        money: bonusStartMoney,
        legacyPoints: totalLegacy,
        historySummaries: [],
        dayPhase: 'morning_prep',
      },
      isShopOpen: false, activeOrders: [], deliveryOrders: [], activeIncident: null,
      dailyRevenue: 0, dailyCost: 0, dailyCustomersServed: 0, dailyCustomersLost: 0, lossReasons:{ inventory:0, capacity:0, demand:0 },
      isDailySummaryShown: false, dailyEventsCount: 0, lastEventTimeMinutes: 0, hasIncidentTriggeredToday: false,
      activeModal: null,
    });
    get().showToast(`🌱 Bắt đầu hành trình mới! Di sản để lại: +${pointsEarned} Điểm Di Sản (Vốn khởi đầu: ${bonusStartMoney.toLocaleString('vi-VN')}đ)`);
    get().saveLocal();
  },

  saveLocal: () => {
    try {
      const state = get();
      const game = { ...state.gameState, deliveryOrders: state.deliveryOrders, lastSavedAt: new Date().toISOString(),
        operatingSnapshot: { activeOrders: state.activeOrders, isShopOpen: state.isShopOpen, dailyCost: state.dailyCost,
          dailyCustomersServed: state.dailyCustomersServed, dailyCustomersLost: state.dailyCustomersLost,
          lossReasons: state.lossReasons,
          dailyEventsCount: state.dailyEventsCount, lastEventTimeMinutes: state.lastEventTimeMinutes,
          isLotteryDrawnToday: state.isLotteryDrawnToday, hasIncidentTriggeredToday: state.hasIncidentTriggeredToday, activeIncident: state.activeIncident } };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(game));
      set({ gameState: game });
    } catch (error) { console.error('Không thể lưu game:', error); }
  },

  loadGame: async () => {
    const applySave = (raw: GameSaveState) => { const game = migrateSave(raw); set({ gameState: game, ...restoreOperatingState(game), showFlashScreen: false }); };
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) applySave(JSON.parse(local));
      else set({ showFlashScreen: !get().gameState.hasChosenStarter });
      const loadedAt = get().gameState.lastSavedAt;
      try {
        const response = await fetch(`/api/save/${get().gameState.playerId}`);
        if (!response.ok) return;
        const json = await response.json();
        if (json.success && json.data && get().gameState.lastSavedAt === loadedAt && new Date(json.data.lastSavedAt).getTime() > new Date(loadedAt || 0).getTime()) {
          applySave(json.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get().gameState));
        }
      } catch { /* Local save remains authoritative while offline. */ }
    } catch (error) { console.warn('Không thể tải bản lưu:', error); }
  },

  syncCloud: async () => {
    get().saveLocal();
    try {
      const state = get().gameState;
      const response = await fetch(`/api/save/${state.playerId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
      if (!response.ok) return false;
      const result = await response.json();
      return result.success === true;
    } catch { return false; }
  },

  resetGame: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      gameState: { ...structuredClone(INITIAL_GAME_STATE), lastSavedAt: new Date().toISOString() },
      activeOrders: [], deliveryOrders: [], activeIncident: null, employeeActionStatus: {}, showFlashScreen: true, lossReasons:{ inventory:0, capacity:0, demand:0 },
      isShopOpen: false,
      dailyRevenue: 0,
      dailyCost: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      activeModal: null,
      hasEventTriggeredToday: false,
      hasIncidentTriggeredToday: false,
      dailyEventsCount: 0,
      lastEventTimeMinutes: 0,
      lastEventOutcome: null,
      isLotteryDrawnToday: false,
      isDailySummaryShown: false,
    });
    get().showToast('🔄 Đã khởi động lại tiệm từ đầu!');
  },
};
});
