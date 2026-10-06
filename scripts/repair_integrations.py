from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / 'client/src/store/gameStore.ts'
s = path.read_text(encoding='utf-8')
def replace(old, new):
    global s
    assert old in s, old[:100]
    s = s.replace(old, new, 1)
def section(start, end, new):
    global s
    a, b = s.index(start), s.index(end, s.index(start))
    s = s[:a] + new + s[b:]

replace("import { create } from 'zustand';", "import { create } from 'zustand';\nimport { getOperatingStatement, getLiquidationOffer, describeCashMovement } from '../../../shared/economy/operating';\nimport { migrateSave, restoreOperatingState } from './persistence';")
replace("syncCloud: () => Promise<void>;", "syncCloud: () => Promise<boolean>;")
replace("export const useGameStore = create<GameStoreState>((set, get) => ({", """export const useGameStore = create<GameStoreState>((baseSet, get) => {
  const set = (update: Partial<GameStoreState> | ((state: GameStoreState) => Partial<GameStoreState>)) => baseSet(state => {
    const patch = typeof update === 'function' ? update(state) : update;
    if (patch.gameState && patch.gameState.money !== state.gameState.money) {
      const next = patch.gameState;
      const journal = next.day < state.gameState.day ? [] : state.gameState.cashJournal || [];
      return { ...patch, gameState: { ...next, cashJournal: [...journal, { day: next.day, minute: next.gameTimeMinutes,
        label: describeCashMovement(state.gameState, next), amount: next.money - state.gameState.money, balance: next.money }].slice(-300) } };
    }
    return patch;
  });
  return {""")
assert s.rstrip().endswith('}));')
s = s.rstrip()[:-4] + '};\n});\n'
replace("if (!order) return false;\n\n    const recipe = RECIPES[order.recipeId];", "if (!order || order.state !== 'ready') return false;\n\n    const recipe = RECIPES[order.recipeId];")
replace("      get().serveNeighborGuest(order.neighborId);\n", "")
a = s.index('  collectPayment: (orderId) => {')
s = s[:a] + s[a:].replace('if (!order) return false;', "if (!order || order.state !== 'paying') return false;", 1)
section('  tickTime: (deltaMinutes) => {', '  consumeEnergy: (amount) => {', """  tickTime: (deltaMinutes) => {
    const state = get();
    if (!state.isShopOpen || state.isDailySummaryShown || !Number.isFinite(deltaMinutes) || deltaMinutes <= 0) return;
    const newTime = Math.min(1320, state.gameState.gameTimeMinutes + deltaMinutes);
    set(current => ({ gameState: { ...current.gameState, gameTimeMinutes: newTime } }));
    if (newTime >= 1320) { get().forceCloseStoreTonight(); return; }
    if (!get().isLotteryDrawnToday && newTime >= 990 && get().gameState.activeLotteryTicket) get().checkLotteryDraw();
    if (!get().activeModal && !get().activeIncident && get().dailyEventsCount < 3 && newTime - get().lastEventTimeMinutes >= 150 && Math.random() < 0.2) get().triggerStreetEvent();
  },

""")
replace("    const dishCOGS = recipeId ? calculateDishCOGS(recipeId, gameState.marketPrices) : Math.round(revenue * 0.4);", "    const dishCOGS = order?.preparedIngredients ? order.preparedIngredients.reduce((sum, id) => sum + getIngredientCurrentPrice(id, gameState.marketPrices), 0) : recipeId ? calculateDishCOGS(recipeId, gameState.marketPrices) : Math.round(revenue * 0.4);")
replace("      revenue: currentFinance.revenue + totalEarned,", "      revenue: currentFinance.revenue + totalEarned,\n      tips: (currentFinance.tips || 0) + tip,")
replace("        storageCapacity: newStorageCapacity,", "        storageCapacity: newStorageCapacity,\n        fridgeUpgradeLevel: Math.min(2, Object.values(updatedStageUpgrades).reduce((sum, levels) => sum + (levels?.storage || 0), 0)),")
replace("    const currentRestId = gameState.activeRestaurantId || 'banh_mi';\n\n    set((state) => {\n      // 1. Lưu kho", "    const currentRestId = gameState.activeRestaurantId || 'banh_mi';\n    if (currentRestId === restaurantId) return;\n    if (get().activeOrders.length || get().deliveryOrders.some(o => o.status !== 'pending')) {\n      get().showToast('Hãy hoàn tất khách và đơn giao đang làm trước khi chuyển quán.');\n      return;\n    }\n\n    set((state) => {\n      // 1. Lưu kho")
# All non-sales income must remain outside meal revenue.
replace("      dailyRevenue: moneyDiff > 0 ? state.dailyRevenue + moneyDiff : state.dailyRevenue,\n      dailyCost: moneyDiff < 0 ? state.dailyCost + Math.abs(moneyDiff) : state.dailyCost,", "      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,")
replace("    const newMoney = Math.max(0, gameState.money + moneyDiff);", "    const newMoney = gameState.money + moneyDiff;")
replace("      dailyRevenue: state.dailyRevenue + gain,\n      dailyCost: state.dailyCost + cost,", "      dailyRevenue: state.gameState.dailyFinance?.revenue || 0,")
replace("        money: state.gameState.money - cost + gain,\n        reputation:", "        money: state.gameState.money - cost + gain,\n        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance,\n          otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + gain,\n          eventExpenses: (state.gameState.dailyFinance?.eventExpenses || 0) + cost },\n        fame: Math.max(0, (state.gameState.fame ?? state.gameState.reputation) + rep),\n        reputation:")
replace("    const { gameState, dailyRevenue, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();\n\n    // Nếu còn vé số", "    if (get().gameState.settledDay === get().gameState.day) return;\n    if (get().activeOrders.length || get().isShopOpen) get().forceCloseStoreTonight();\n    if (get().gameState.activeLotteryTicket) get().checkLotteryDraw();\n    const { gameState, dailyCost, dailyCustomersServed, dailyCustomersLost } = get();\n    const statement = getOperatingStatement(gameState);\n    const dailyRevenue = statement.finance.revenue;\n\n    // Nếu còn vé số")
section('    const stageCosts = calculateStageFixedCosts', '    // 4. Phân tích Nút Cổ Chai', """    const rentPaid = statement.rent;
    const utilitiesPaid = statement.utilities;
    const currentFinance = statement.finance;
    const cogsPaid = currentFinance.cogs;
    const grossProfit = statement.grossProfit;
    const marketingPaid = currentFinance.marketing;
    const netProfit = statement.netProfit + statement.spoilage.spoilageCost;

""")
replace("    const spoilage = calculateDailySpoilage({\n      inventory: gameState.inventory,\n      fridgeLevel: gameState.fridgeUpgradeLevel || 0,\n    });", "    const spoilage = statement.spoilage;")
replace("currentMoney: gameState.money - totalSalaries - rentPaid - utilitiesPaid - spoilage.spoilageCost,", "currentMoney: statement.closingCash,")
replace("    const nextMoney = gameState.money - totalSalaries - rentPaid - utilitiesPaid - spoilage.spoilageCost;", "    const nextMoney = statement.closingCash;")
replace("      rollingRatings: pastRatings,\n      inventory: spoilage.updatedInventory,", "      rollingRatings: pastRatings.slice(-14),\n      loanDebt: Math.max(0, (gameState.loanDebt || 0) - statement.debtPayment),\n      settledDay: gameState.day,\n      operatingSnapshot: undefined,\n      restaurantInventories: statement.inventories,\n      inventory: spoilage.updatedInventory,")
replace("      gameState: nextDayState,\n      isShopOpen: false,", "      gameState: nextDayState,\n      activeOrders: [],\n      deliveryOrders: [],\n      activeIncident: null,\n      isShopOpen: false,")
# Close pays completed orders before removing unfinished guests.
replace("    const lostCount = activeOrders.length;", "    for (const order of activeOrders.filter(o => o.state === 'paying')) get().collectPayment(order.id);\n    const remaining = get().activeOrders;\n    const lostCount = remaining.length;")
replace("    const { gameState, activeOrders } = get();\n    const lostCount", "    const { gameState, activeOrders } = get();\n    const lostCount") if False else None
# Closing must use the post-payment game state (never overwrite collected cash).
force_start = s.index('  forceCloseStoreTonight: () => {')
force_end = s.index('  openStoreForDay:', force_start)
force = s[force_start:force_end]
force = force.replace('        ...state.gameState,', '        ...state.gameState,')
force = force.replace("reputation: newReputation,", "reputation: Math.max(0, state.gameState.reputation - (lostCount > 0 ? 1 : 0)),").replace("fame: newFame,", "fame: Math.max(0, (state.gameState.fame ?? state.gameState.reputation) - (lostCount > 0 ? 1 : 0)),")
s = s[:force_start] + force + s[force_end:]
replace("    const amount = source === 'neighbor' ? 1000000 : 5000000;", "    if ((gameState.loanDebt || 0) > 0) { get().showToast('Cần trả hết khoản vay hiện tại trước khi vay tiếp.'); return false; }\n    const amount = source === 'neighbor' ? 1000000 : 5000000;")
replace("        loanDebt: (gameState.loanDebt || 0) + addedDebt,", "        loanDebt: addedDebt,\n        loanRepaymentPerDay: Math.ceil(addedDebt / 10),\n        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, otherExpense: (gameState.dailyFinance?.otherExpense || 0) + addedDebt - amount },")
section('  liquidateEquipment: () => {', '  resetGameWithLegacy: () => {', """  liquidateEquipment: () => {
    const { gameState } = get();
    const offer = getLiquidationOffer(gameState);
    if (!offer) { get().showToast('Không có thiết bị đã mua để thanh lý.'); return false; }
    const levels = { ...(gameState.stageUpgrades || { [gameState.businessStage]: gameState.purchasedUpgrades }) };
    levels[offer.stage] = { ...levels[offer.stage], [offer.id]: offer.level - 1 };
    const current = levels[gameState.businessStage] || {};
    if (get().activeOrders.length > calculateMaxTables(gameState.businessStage, current, levels)) { get().showToast('Hoàn tất các bàn đang phục vụ trước khi bán bớt thiết bị.'); return false; }
    set({ gameState: { ...gameState, money: gameState.money + offer.value,
      stageUpgrades: levels, purchasedUpgrades: current,
      storageCapacity: calculateStorageCapacity(gameState.businessStage, current, levels),
      fridgeUpgradeLevel: Math.min(2, Object.values(levels).reduce((sum, value) => sum + (value?.storage || 0), 0)),
      financialHealth: 'stress', consecutiveCrisisDays: 0 } });
    get().showToast(`Đã bán ${offer.title}: +${offer.value.toLocaleString('vi-VN')}đ. Hiệu quả thiết bị giảm một cấp.`);
    get().saveLocal();
    return true;
  },

""")
section('  saveLocal: () => {', '  resetGame: () => {', """  saveLocal: () => {
    try {
      const state = get();
      const game = { ...state.gameState, deliveryOrders: state.deliveryOrders, lastSavedAt: new Date().toISOString(),
        operatingSnapshot: { activeOrders: state.activeOrders, isShopOpen: state.isShopOpen, dailyCost: state.dailyCost,
          dailyCustomersServed: state.dailyCustomersServed, dailyCustomersLost: state.dailyCustomersLost,
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

""")
replace("      gameState: { ...INITIAL_GAME_STATE, lastSavedAt: new Date().toISOString() },", "      gameState: { ...structuredClone(INITIAL_GAME_STATE), lastSavedAt: new Date().toISOString() },\n      activeOrders: [], deliveryOrders: [], activeIncident: null, employeeActionStatus: {}, showFlashScreen: true,")
path.write_text(s, encoding='utf-8')
