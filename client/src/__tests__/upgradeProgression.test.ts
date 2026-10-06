import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, getStageCatalog, calculateCookSpeedBoost, calculateStorageCapacity, calculateMaxTables, calculateTipRateBonus, calculateCustomerPatienceBonus, RECIPES } from '../../../shared/gameData';
import { ActiveOrder } from '../../../shared/types';

describe('Upgrade progression regressions', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {setItem:vi.fn(),getItem:vi.fn(()=>null)});
    useGameStore.setState({gameState:structuredClone(INITIAL_GAME_STATE),activeOrders:[],toastMessage:null});
  });
  afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
  it('charges the first new-stage equipment price, despite old legacy levels', () => {
    useGameStore.setState(s=>({gameState:{...s.gameState,businessStage:'corner',money:10000000,stageUpgrades:{cart:{modern_stove:5},corner:{}},purchasedUpgrades:{modern_stove:5}}}));
    const price=getStageCatalog('corner').upgrades.find(u=>u.id==='modern_stove')!.tiers![0].cost;
    expect(useGameStore.getState().purchaseUpgrade('modern_stove')).toBe(true);
    const g=useGameStore.getState().gameState;
    expect(g.money).toBe(10000000-price);
    expect(g.stageUpgrades?.corner?.modern_stove).toBe(1);
    expect(g.stageUpgrades?.cart?.modern_stove).toBe(5);
  });
  it('keeps paid benefits over multiple stage transitions, and new tiers add to them', () => {
    const history={cart:{modern_stove:5,cozy_storage:5,seating_comfort:5,dishware_premium:5,extra_tables:1},corner:{modern_stove:2,extra_tables:1}};
    expect(calculateCookSpeedBoost('corner',{},history)).toBeCloseTo(.48);
    expect(calculateCustomerPatienceBonus('corner',{},history)).toBe(15);
    expect(calculateTipRateBonus('corner',{},history)).toBeCloseTo(.25);
    const speed=calculateCookSpeedBoost('corner',history.corner,history);
    expect(calculateCookSpeedBoost('awning',{},history)).toBeGreaterThanOrEqual(speed);
    expect(calculateMaxTables('awning',{},history)).toBeGreaterThanOrEqual(calculateMaxTables('corner',history.corner,history));
    expect(calculateStorageCapacity('corner',{cozy_storage:1},history)).toBeGreaterThan(250);
  });
  it('preserves old-format purchases on stage transition without auto-buying new equipment', () => {
    useGameStore.setState(s=>({gameState:{...s.gameState,money:10000000,reputation:200,stageUpgrades:undefined,purchasedUpgrades:{modern_stove:5}}}));
    expect(useGameStore.getState().upgradeBusinessStage()).toBe(true);
    const g=useGameStore.getState().gameState;
    expect(g.stageUpgrades?.cart?.modern_stove).toBe(5);
    expect(g.stageUpgrades?.corner).toEqual({});
    expect(calculateCookSpeedBoost('corner',{},g.stageUpgrades)).toBeCloseTo(.48);
  });
  it('rejects unaffordable purchases without changing money or levels', () => {
    useGameStore.setState(s=>({gameState:{...s.gameState,money:1,stageUpgrades:{cart:{}}}}));
    expect(useGameStore.getState().purchaseUpgrade('modern_stove')).toBe(false);
    expect(useGameStore.getState().gameState.money).toBe(1);
    expect(useGameStore.getState().gameState.stageUpgrades?.cart).toEqual({});
  });
  it('starts timed player cooking and consumes ingredients once at preparation', () => {
    const recipe=RECIPES.banh_mi_trung;
    const order={id:'timed-test',tableIndex:1,recipeId:'banh_mi_trung',typeId:'student',state:'waiting',patienceRemaining:100,maxPatience:100} as ActiveOrder;
    const inventory=Object.fromEntries(recipe.requiredIngredients.map(id=>[id,10]));
    useGameStore.setState(s=>({gameState:{...s.gameState,inventory},activeOrders:[order]}));
    expect(useGameStore.getState().completeCooking(order.recipeId,1,recipe.requiredIngredients,true)).toBe(true);
    const s=useGameStore.getState();
    expect(s.activeOrders[0].state).toBe('cooking');
    expect(s.activeOrders[0].chefName).toBe('Bạn');
    expect(s.gameState.inventory.bread).toBe(9);
    expect(s.completeCooking(order.recipeId,1,recipe.requiredIngredients,true)).toBe(false);
    expect(useGameStore.getState().gameState.inventory.bread).toBe(9);
  });
  it('keeps all legacy equipment levels when the first purchase creates a stage map', () => {
    useGameStore.setState(s=>({gameState:{...s.gameState,money:1000000,stageUpgrades:undefined,purchasedUpgrades:{cozy_storage:2,seating_comfort:1}}}));
    expect(useGameStore.getState().purchaseUpgrade('modern_stove')).toBe(true);
    expect(useGameStore.getState().gameState.stageUpgrades?.cart).toEqual({cozy_storage:2,seating_comfort:1,modern_stove:1});
  });
  it('does not charge for extra tables after inherited capacity reaches the global limit', () => {
    const history={cart:{extra_tables:1},corner:{extra_tables:1},awning:{extra_tables:2},eatery:{extra_tables:2},empire:{}};
    useGameStore.setState(s=>({gameState:{...s.gameState,money:100000000,businessStage:'empire',stageUpgrades:history}}));
    expect(calculateMaxTables('empire',{},history)).toBe(8);
    expect(useGameStore.getState().purchaseUpgrade('extra_tables')).toBe(false);
    expect(useGameStore.getState().gameState.money).toBe(100000000);
  });
  it('requires both cash and fame for expansion and leaves equipment intact on rejection', () => {
    useGameStore.setState(s=>({gameState:{...s.gameState,money:249999,reputation:500,stageUpgrades:{cart:{modern_stove:1}}}}));
    expect(useGameStore.getState().upgradeBusinessStage()).toBe(false);
    expect(useGameStore.getState().gameState.businessStage).toBe('cart');
    useGameStore.setState(s=>({gameState:{...s.gameState,money:1000000,reputation:49}}));
    expect(useGameStore.getState().upgradeBusinessStage()).toBe(false);
    expect(useGameStore.getState().gameState.stageUpgrades?.cart?.modern_stove).toBe(1);
  });
  it('actually awards ambience bonus for good service', () => {
    vi.spyOn(Math,'random').mockReturnValue(0);
    useGameStore.setState(s=>({gameState:{...s.gameState,reputation:10,fame:10,stageUpgrades:{cart:{sound_ambience:1}}}}));
    useGameStore.getState().finishServing(1,20000,0);
    expect(useGameStore.getState().gameState.reputation).toBe(12);
  });
});
