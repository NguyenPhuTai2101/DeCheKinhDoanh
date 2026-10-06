import type { GameSaveState, IngredientId } from '../../../shared/types';
import { INITIAL_GAME_STATE, EMPLOYEES, RESTAURANT_TYPES, calculateStorageCapacity, getStarterInventoryForRestaurant, getStarterRecipesForRestaurant } from '../../../shared/gameData';
import { createInitialDailyFinance } from '../../../shared/economy/finance';

export function migrateSave(saved: GameSaveState): GameSaveState {
  const active = saved.activeRestaurantId || 'banh_mi';
  const restaurant = RESTAURANT_TYPES[active];
  const stage = saved.businessStage || 'cart';
  const upgrades = saved.stageUpgrades || { [stage]: saved.purchasedUpgrades || {} };
  const inventories = { ...saved.restaurantInventories };
  // Missing units in an existing save are zero, never free replenishment on reload.
  const inventory = Object.fromEntries(restaurant.allowedIngredientIds.map(id => [id, saved.inventory?.[id] || 0])) as Partial<Record<IngredientId, number>>;
  inventories[active] = inventory;
  for (const id of saved.unlockedRestaurants || [active]) inventories[id] ||= getStarterInventoryForRestaurant(id);
  const employeeDetails = { ...saved.employeeDetails };
  for (const id of saved.hiredEmployees || []) {
    const original = EMPLOYEES.find(e => e.id === id);
    if (original) employeeDetails[id] = { ...original, ...employeeDetails[id], salaryPerDay: Math.max(original.salaryPerDay, employeeDetails[id]?.salaryPerDay || 0) };
  }
  return { ...structuredClone(INITIAL_GAME_STATE), ...saved, activeRestaurantId: active, businessStage: stage,
    stageUpgrades: upgrades, purchasedUpgrades: upgrades[stage] || {},
    storageCapacity: calculateStorageCapacity(stage, upgrades[stage] || {}, upgrades), inventory, restaurantInventories: inventories,
    unlockedRecipes: Array.from(new Set([...(saved.unlockedRecipes || []), ...getStarterRecipesForRestaurant(active)])),
    employeeDetails, dailyFinance: { ...createInitialDailyFinance(), ...saved.dailyFinance },
    neighbors: { ...INITIAL_GAME_STATE.neighbors, ...saved.neighbors },
    deliveryOrders: (saved.deliveryOrders || []).filter(o => restaurant.primaryRecipeIds.includes(o.recipeId)),
  };
}

export function restoreOperatingState(game: GameSaveState) {
  const snapshot = game.operatingSnapshot;
  return {
    activeOrders: snapshot?.activeOrders || [],
    isShopOpen: snapshot?.isShopOpen ?? false,
    dailyRevenue: game.dailyFinance?.revenue || 0,
    dailyCost: snapshot?.dailyCost || 0,
    dailyCustomersServed: snapshot?.dailyCustomersServed || 0,
    dailyCustomersLost: snapshot?.dailyCustomersLost || 0,
    lossReasons: snapshot?.lossReasons || { inventory:0, capacity:0, demand:0 },
    dailyEventsCount: snapshot?.dailyEventsCount || 0,
    lastEventTimeMinutes: snapshot?.lastEventTimeMinutes || 0,
    isLotteryDrawnToday: snapshot?.isLotteryDrawnToday || false,
    hasIncidentTriggeredToday: snapshot?.hasIncidentTriggeredToday || false,
    activeIncident: snapshot?.activeIncident || null,
    hasEventTriggeredToday: (snapshot?.dailyEventsCount || 0) > 0,
    isDailySummaryShown: game.dayPhase === 'night_audit',
    activeModal: game.dayPhase === 'night_audit' ? 'dailySummary' as const : game.currentEvent ? 'streetEvents' as const : null,
    deliveryOrders: game.deliveryOrders || [],
    currentView: 'shop' as const, timeSpeed: 1, selectedTableForCooking: null, employeeActionStatus: {}, lastEventOutcome: null,
  };
}
