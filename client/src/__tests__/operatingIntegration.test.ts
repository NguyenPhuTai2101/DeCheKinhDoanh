import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, RECIPES, EMPLOYEES } from '../../../shared/gameData';
import type { ActiveOrder, DeliveryOrder } from '../../../shared/types';
import { getOperatingStatement } from '../../../shared/economy/operating';
import { getOrderIngredients } from '../../../shared/simulation/orders';
import { simulatePassiveBranchTick } from '../../../shared/simulation/branches';
import { migrateSave } from '../store/persistence';
import { simulationDelta } from '../../../shared/simulation/time';
import { chooseContextualIncident } from '../../../shared/simulation/incidents';
import { evaluateDishMatch } from '../../../shared/simulation/orders';

const guest = (state: ActiveOrder['state'] = 'waiting'): ActiveOrder => ({ id:'guest', tableIndex:1, recipeId:'banh_mi_trung', typeId:'student', state, maxPatience:45, patienceRemaining:45 });
const delivery = (): DeliveryOrder => ({ id:'ship', customerName:'Công ty trong xóm', recipeId:'banh_mi_trung', quantity:2, rewardMoney:36000, rewardTip:1000, timeRemainingSeconds:90, maxTimeSeconds:90, status:'pending' });
beforeEach(() => {
  vi.useFakeTimers();
  const saved = new Map<string,string>();
  vi.stubGlobal('localStorage', { setItem:(key:string,value:string) => saved.set(key,value), getItem:(key:string) => saved.get(key) || null, removeItem:(key:string) => saved.delete(key) });
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok:false })));
  useGameStore.setState({ gameState:structuredClone(INITIAL_GAME_STATE), activeOrders:[], deliveryOrders:[], dailyRevenue:0, dailyCost:0, dailyCustomersServed:0, dailyCustomersLost:0,
    lossReasons:{ inventory:0,capacity:0,demand:0 }, isShopOpen:false, isDailySummaryShown:false, activeModal:null, activeIncident:null, dailyEventsCount:0, lastEventTimeMinutes:0, isLotteryDrawnToday:false, hasIncidentTriggeredToday:false });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Operating invariants across features', () => {
  it('2x doubles each shared time delta once, and pause stops every timer', () => {
    const normal = simulationDelta(500,1);
    const fast = simulationDelta(500,2);
    expect(fast.seconds).toBe(normal.seconds * 2);
    expect(fast.gameMinutes).toBe(normal.gameMinutes * 2);
    expect(simulationDelta(500,0).milliseconds).toBe(0);
  });
  it('new recipes require skill and investment, and become available once', () => {
    const recipe = 'banh_mi_xiu_mai' as const;
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, unlockedRecipes:['banh_mi_trung'],money:500000 } }));
    expect(useGameStore.getState().learnRecipe('banh_mi',recipe)).toBe(false);
    useGameStore.setState(s => ({ gameState:{ ...s.gameState,player:{ ...s.gameState.player,cookingLevel:2 } } }));
    expect(useGameStore.getState().learnRecipe('banh_mi',recipe)).toBe(true);
    const balance = useGameStore.getState().gameState.money;
    expect(balance).toBe(500000 - RECIPES[recipe].basePrice * 3);
    expect(useGameStore.getState().gameState.menuSettings?.banh_mi?.activeRecipes).toContain(recipe);
    expect(useGameStore.getState().learnRecipe('banh_mi',recipe)).toBe(false);
    expect(useGameStore.getState().gameState.money).toBe(balance);
  });
  it('delivery is introduced after basic cooking and order requests cannot be spammed', () => {
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().spawnDeliveryOrder();
    expect(useGameStore.getState().deliveryOrders).toHaveLength(0);
    useGameStore.setState(s => ({ gameState:{ ...s.gameState,player:{ ...s.gameState.player,cookingLevel:2 } } }));
    useGameStore.getState().spawnDeliveryOrder();
    useGameStore.getState().spawnDeliveryOrder();
    expect(useGameStore.getState().deliveryOrders).toHaveLength(1);
  });
  it('first shifts teach the game without random penalties', () => {
    for (let i=0;i<20;i++) expect(chooseContextualIncident(structuredClone(INITIAL_GAME_STATE),false).type).toBe('reward');
  });
  it('mitigating a penalty costs stamina and half the money while preserving reputation', () => {
    const initial = useGameStore.getState().gameState;
    useGameStore.getState().triggerSurpriseIncident({ id:'leak',moneyChange:-10000,reputationChange:-1 } as any);
    useGameStore.getState().resolveSurpriseIncident('mitigate');
    const game = useGameStore.getState().gameState;
    expect(game.money).toBe(initial.money - 5000);
    expect(game.player.energy).toBe(initial.player.energy - 10);
    expect(game.reputation).toBe(initial.reputation);
    expect(game.dailyFinance?.eventExpenses).toBe(5000);
    expect(game.incidentHistory).toContain('leak');
  });
  it('ordinary preferences are not treated as allergies and a missing bread is not a garnish mistake', () => {
    const order = { ...guest(),removedIngredients:['cucumber' as const] };
    expect(evaluateDishMatch({ recipeId:order.recipeId,order,preparedIngredients:RECIPES[order.recipeId].requiredIngredients }).matchGrade).toBe('wrong');
    expect(evaluateDishMatch({ recipeId:order.recipeId,order,preparedIngredients:['egg'] }).matchGrade).toBe('wrong');
  });
  it('prepared food cost is booked once even when collected later', () => {
    useGameStore.setState({ activeOrders:[guest()] });
    const recipe = RECIPES.banh_mi_trung;
    expect(useGameStore.getState().completeCooking(recipe.id,1,recipe.requiredIngredients,true)).toBe(true);
    const cogs = useGameStore.getState().gameState.dailyFinance?.cogs;
    useGameStore.setState(s => ({ activeOrders:s.activeOrders.map(o => ({ ...o,state:'paying' as const })) }));
    expect(useGameStore.getState().collectPayment('guest')).toBe(true);
    expect(useGameStore.getState().gameState.dailyFinance?.cogs).toBe(cogs);
    expect(useGameStore.getState().gameState.branchFinances?.banh_mi?.cogs).toBe(cogs);
  });
  it('cannot collect payment or serve food before the correct state', () => {
    useGameStore.setState({ activeOrders:[guest()] });
    expect(useGameStore.getState().collectPayment('guest')).toBe(false);
    expect(useGameStore.getState().serveDishOrder('guest')).toBe(false);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money);
  });
  it('entering the same shop preserves guests; switching with unfinished guests is blocked', () => {
    useGameStore.setState(s => ({ activeOrders:[guest()], gameState:{ ...s.gameState, unlockedRestaurants:['banh_mi','pho'] } }));
    useGameStore.getState().switchActiveRestaurant('banh_mi');
    expect(useGameStore.getState().activeOrders).toHaveLength(1);
    useGameStore.getState().switchActiveRestaurant('pho');
    expect(useGameStore.getState().gameState.activeRestaurantId).toBe('banh_mi');
    expect(useGameStore.getState().activeOrders).toHaveLength(1);
  });
  it('closing pays completed guests exactly once and clears unfinished work', () => {
    useGameStore.setState({ activeOrders:[guest('paying'), { ...guest(), id:'unfinished', tableIndex:2 }] });
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().forceCloseStoreTonight();
    const money = useGameStore.getState().gameState.money;
    expect(money).toBe(INITIAL_GAME_STATE.money + RECIPES.banh_mi_trung.basePrice);
    expect(useGameStore.getState().activeOrders).toHaveLength(0);
    expect(useGameStore.getState().dailyCustomersLost).toBe(1);
    useGameStore.getState().forceCloseStoreTonight();
    expect(useGameStore.getState().gameState.money).toBe(money);
  });
  it('a newly spawned event survives the clock update', () => {
    vi.spyOn(Math,'random').mockReturnValue(0);
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().tickTime(1.25);
    expect(useGameStore.getState().dailyEventsCount).toBe(1);
    expect(useGameStore.getState().gameState.currentEvent).toBeTruthy();
    expect(useGameStore.getState().gameState.gameTimeMinutes).toBe(361.25);
  });
  it('event reward is income once, not food sales plus a second reward', () => {
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, inventory:{} } }));
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().triggerSurpriseIncident({ id:'bonus', moneyChange:100000, reputationChange:0 } as any);
    useGameStore.getState().resolveSurpriseIncident();
    const statement = getOperatingStatement(useGameStore.getState().gameState);
    expect(statement.finance.revenue).toBe(0);
    expect(statement.finance.otherIncome).toBe(100000);
    expect(statement.netProfit).toBe(85000);
    useGameStore.getState().endDayAndSleep();
    expect(useGameStore.getState().gameState.historySummaries[0].netProfit).toBe(statement.netProfit);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money + 85000);
  });
  it('spoilage is stable in previews, removes stock and does not spend cash again', () => {
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, inventory:{ pork:100 }, restaurantInventories:{ banh_mi:{ pork:100 } } } }));
    useGameStore.getState().openStoreForDay();
    const before = getOperatingStatement(useGameStore.getState().gameState);
    expect(getOperatingStatement(useGameStore.getState().gameState).spoilage).toEqual(before.spoilage);
    expect(before.spoilage.spoilageCost).toBeGreaterThan(0);
    useGameStore.getState().endDayAndSleep();
    const game = useGameStore.getState().gameState;
    expect(game.money).toBe(INITIAL_GAME_STATE.money - before.fixedCosts);
    expect(game.inventory).toEqual(before.spoilage.updatedInventory);
    expect(game.restaurantInventories?.banh_mi).toEqual(game.inventory);
    expect(game.historySummaries[0].spoilageCost).toBe(before.spoilage.spoilageCost);
  });
  it('loan cannot be stacked and is repaid from cash after the shift costs', () => {
    expect(useGameStore.getState().takeEmergencyLoan('neighbor')).toBe(true);
    expect(useGameStore.getState().takeEmergencyLoan('bank')).toBe(false);
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().endDayAndSleep();
    expect(useGameStore.getState().gameState.loanDebt).toBe(900000);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money + 1000000 - 15000 - 100000);
  });
  it('cannot liquidate absent equipment or repeatedly settle a closed day', () => {
    expect(useGameStore.getState().liquidateEquipment()).toBe(false);
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().endDayAndSleep();
    const game = useGameStore.getState().gameState;
    useGameStore.getState().endDayAndSleep();
    expect(useGameStore.getState().gameState.day).toBe(game.day);
    expect(useGameStore.getState().gameState.money).toBe(game.money);
  });
  it('restores customers, revenue and operating counters from a mid-shift save', async () => {
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, dailyFinance:{ ...s.gameState.dailyFinance!, revenue:100000, cogs:30000 } }, activeOrders:[guest('cooking')], dailyCustomersServed:4, dailyCost:35000, dailyEventsCount:2 }));
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().saveLocal();
    useGameStore.setState({ gameState:structuredClone(INITIAL_GAME_STATE), activeOrders:[], dailyRevenue:0, dailyCustomersServed:0, dailyCost:0, isShopOpen:false });
    await useGameStore.getState().loadGame();
    expect(useGameStore.getState().activeOrders[0].state).toBe('cooking');
    expect(useGameStore.getState().dailyRevenue).toBe(100000);
    expect(useGameStore.getState().dailyCustomersServed).toBe(4);
    expect(useGameStore.getState().dailyCost).toBe(35000);
    expect(useGameStore.getState().dailyEventsCount).toBe(2);
    expect(useGameStore.getState().isShopOpen).toBe(true);
  });
  it('legacy migration never creates missing ingredients for free', () => {
    const loaded = migrateSave({ ...structuredClone(INITIAL_GAME_STATE), inventory:{ bread:2 }, restaurantInventories:undefined });
    expect(loaded.inventory.egg).toBe(0);
    expect(loaded.inventory.bread).toBe(2);
  });
  it('offline cloud sync reports failure and keeps the local snapshot', async () => {
    expect(await useGameStore.getState().syncCloud()).toBe(false);
    expect(localStorage.getItem('cozy_empire_save_v4')).toBeTruthy();
  });
  it('delivery reserves ingredients once, shares the player kitchen and pays only after transit', () => {
    useGameStore.setState({ deliveryOrders:[delivery()], activeOrders:[guest()] });
    useGameStore.getState().openStoreForDay();
    const before = useGameStore.getState().gameState.money;
    const bread = useGameStore.getState().gameState.inventory.bread!;
    expect(useGameStore.getState().fulfillDeliveryOrder('ship')).toBe(true);
    expect(useGameStore.getState().fulfillDeliveryOrder('ship')).toBe(false);
    expect(useGameStore.getState().gameState.inventory.bread).toBe(bread - 2);
    expect(useGameStore.getState().gameState.money).toBe(before);
    expect(useGameStore.getState().completeCooking('banh_mi_trung',1,RECIPES.banh_mi_trung.requiredIngredients,true)).toBe(false);
    useGameStore.getState().tickDeliveries(20);
    expect(useGameStore.getState().deliveryOrders[0].status).toBe('ready');
    expect(useGameStore.getState().fulfillDeliveryOrder('ship')).toBe(true);
    useGameStore.getState().tickDeliveries(12);
    expect(useGameStore.getState().deliveryOrders).toHaveLength(0);
    expect(useGameStore.getState().gameState.money).toBe(before + 36000 + 1000 - 3600);
    expect(useGameStore.getState().gameState.dailyFinance?.revenue).toBe(37000);
    expect(useGameStore.getState().gameState.dailyFinance?.deliveryFees).toBe(3600);
    expect(useGameStore.getState().gameState.dailyFinance?.cogs).toBeGreaterThan(0);
  });
  it('expired deliveries do not pay and cannot be collected again', () => {
    useGameStore.setState({ deliveryOrders:[{ ...delivery(),timeRemainingSeconds:1 }] });
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().tickDeliveries(2);
    expect(useGameStore.getState().fulfillDeliveryOrder('ship')).toBe(false);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money);
  });
  it('delivery quotes use the configured menu price and only unlocked active dishes', () => {
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, menuSettings:{ banh_mi:{ activeRecipes:['banh_mi_trung'], prices:{ banh_mi_trung:20000 } } } } }));
    useGameStore.setState(s => ({ gameState:{ ...s.gameState,player:{ ...s.gameState.player,cookingLevel:2 } } }));
    useGameStore.getState().openStoreForDay();
    useGameStore.getState().spawnDeliveryOrder();
    const order = useGameStore.getState().deliveryOrders[0];
    expect(order.recipeId).toBe('banh_mi_trung');
    expect(order.rewardMoney).toBe(order.quantity * 20000);
  });
  it('passive branches need staff and stock; outrageous prices have no buyers', () => {
    vi.spyOn(Math,'random').mockReturnValue(.1);
    const cook = EMPLOYEES.find(e => e.role === 'cook')!;
    const params = { restaurantId:'banh_mi' as const, branchLevel:1, activeRecipes:['banh_mi_trung' as const], branchStaff:[cook], inventory:{ bread:10,egg:10,cucumber:10 } };
    expect(simulatePassiveBranchTick({ ...params,branchStaff:[] })).toBeNull();
    expect(simulatePassiveBranchTick({ ...params,inventory:{} })).toBeNull();
    expect(simulatePassiveBranchTick(params)?.servedCustomers).toBeGreaterThan(0);
    expect(simulatePassiveBranchTick({ ...params,playerPrices:{ banh_mi_trung:1800000 } })).toBeNull();
  });
  it('stock-based branch sales consume quantities and reject selling beyond stock', () => {
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, restaurantInventories:{ pho:{ beef:2,pho_noodle:2,broth:2,spring_onion:2 } } } }));
    const recipe = RECIPES.pho_tai;
    const inventory = Object.fromEntries(recipe.requiredIngredients.map(id => [id,2]));
    useGameStore.setState(s => ({ gameState:{ ...s.gameState, restaurantInventories:{ pho:inventory } } }));
    useGameStore.getState().recordBranchSales('pho',100000,40000,'Phở',recipe.id,2);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money + 100000);
    expect(useGameStore.getState().gameState.restaurantInventories?.pho?.[recipe.requiredIngredients[0]]).toBe(0);
    expect(useGameStore.getState().gameState.branchFinances?.pho?.customersServed).toBe(2);
    useGameStore.getState().recordBranchSales('pho',100000,40000,'Phở',recipe.id,2);
    expect(useGameStore.getState().gameState.money).toBe(INITIAL_GAME_STATE.money + 100000);
  });
  it('customized meals count duplicate extras and cannot be prepared twice', () => {
    const order = { ...guest(), removedIngredients:['cucumber' as const],extraIngredients:['egg' as const] };
    const needed = getOrderIngredients(order);
    expect(needed.filter(id => id === 'egg')).toHaveLength(2);
    expect(needed).not.toContain('cucumber');
    useGameStore.setState({ activeOrders:[order] });
    expect(useGameStore.getState().completeCooking(order.recipeId,1,needed,true)).toBe(true);
    expect(useGameStore.getState().activeOrders[0].matchGrade).toBe('perfect');
    expect(useGameStore.getState().completeCooking(order.recipeId,1,needed,true)).toBe(false);
  });
});
