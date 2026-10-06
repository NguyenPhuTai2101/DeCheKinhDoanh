import type { GameSaveState, IngredientId } from '../types';
import { EMPLOYEES, RESTAURANT_TYPES, getStageUpgradeTierInfo } from '../gameData';
import { calculateDailySpoilage, calculateNetProfit, calculateStageFixedCosts, createInitialDailyFinance, createInitialBranchFinance } from './finance';
import type { RestaurantTypeId } from '../types';

export function withBranchOperation(game: GameSaveState, restaurant: RestaurantTypeId, revenue: number, cogs: number, customers = 0, deliveryFees = 0) {
  const before = game.branchFinances?.[restaurant] || createInitialBranchFinance(restaurant);
  const after = { ...before, revenue: before.revenue + revenue, cogs: before.cogs + cogs, customersServed: before.customersServed + customers, deliveryFees:(before.deliveryFees || 0) + deliveryFees };
  after.grossProfit = after.revenue - after.cogs;
  after.netProfit = after.grossProfit - after.payroll - after.rent - after.utilities - after.marketing - after.deliveryFees;
  return { ...game.branchFinances, [restaurant]: after };
}

// One statement drives the ledger, closing preview and committed end-of-day results.
export function getOperatingStatement(game: GameSaveState) {
  const finance = { ...createInitialDailyFinance(), ...game.dailyFinance };
  const branches = game.unlockedRestaurants || [game.activeRestaurantId || 'banh_mi'];
  const fixed = calculateStageFixedCosts(game.businessStage);
  const rent = fixed.rent * branches.length;
  const utilities = fixed.utilities * branches.length;
  const payroll = game.hiredEmployees.reduce((sum, id) => sum + ((game.employeeDetails[id] || EMPLOYEES.find(e => e.id === id))?.salaryPerDay || 0), 0);
  const inventories = { ...game.restaurantInventories, [game.activeRestaurantId || 'banh_mi']: game.inventory };
  let spoilageCost = 0;
  const spoilageDetails: ReturnType<typeof calculateDailySpoilage>['spoilageDetails'] = [];
  for (const restaurantId of branches) {
    const inventory = inventories[restaurantId] || {};
    // Stable per-day seed: opening a report cannot reroll spoilage.
    let seed = game.day * 7919 + restaurantId.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const loss = calculateDailySpoilage({ inventory, fridgeLevel: game.fridgeUpgradeLevel || 0, random });
    inventories[restaurantId] = loss.updatedInventory;
    spoilageCost += loss.spoilageCost;
    spoilageDetails.push(...loss.spoilageDetails.map(item => ({ ...item, name: `${item.name} · ${RESTAURANT_TYPES[restaurantId].shortName}` })));
  }
  const grossProfit = finance.revenue - finance.cogs;
  const netProfit = calculateNetProfit({ ...finance, payroll, rent, utilities }) - spoilageCost;
  const fixedCosts = payroll + rent + utilities;
  const debtPayment = Math.min(game.loanDebt || 0, game.loanRepaymentPerDay || Math.ceil((game.loanDebt || 0) / 10), Math.max(0, game.money - fixedCosts));
  const branchStatements = Object.fromEntries(branches.map(id => {
    const branch = game.branchFinances?.[id] || createInitialBranchFinance(id);
    const payroll = game.hiredEmployees.map(employee => game.employeeDetails[employee] || EMPLOYEES.find(e => e.id === employee)).filter(e => e && (e.assignedRestaurantId || 'banh_mi') === id).reduce((sum,e) => sum + (e?.salaryPerDay || 0),0);
    return [id, { ...branch, payroll, rent:fixed.rent, utilities:fixed.utilities, grossProfit:branch.revenue - branch.cogs,
      netProfit:branch.revenue - branch.cogs - payroll - fixed.rent - fixed.utilities - (branch.deliveryFees || 0) }];
  }));
  return { finance, rent, utilities, payroll, grossProfit, netProfit, fixedCosts, debtPayment,
    closingCash: game.money - fixedCosts - debtPayment,
    spoilage: { spoilageCost, spoilageDetails, updatedInventory: inventories[game.activeRestaurantId || 'banh_mi'] as Partial<Record<IngredientId, number>> }, inventories, branchStatements };
}

export function getLiquidationOffer(game: GameSaveState) {
  const history = game.stageUpgrades || { [game.businessStage]: game.purchasedUpgrades };
  const offers = Object.entries(history).flatMap(([stage, levels]) => Object.entries(levels || {}).filter(([, level]) => level > 0).map(([id, level]) => {
    const tier = getStageUpgradeTierInfo(stage as GameSaveState['businessStage'], id, level - 1);
    return { stage: stage as GameSaveState['businessStage'], id, level, title: tier.title, value: Math.floor(tier.cost * 0.5) };
  })).filter(offer => offer.value > 0).sort((a, b) => b.value - a.value);
  return offers[0] || null;
}

export function describeCashMovement(before: GameSaveState, after: GameSaveState): string {
  if (after.day !== before.day) return 'Kết toán: lương, mặt bằng, điện nước và trả nợ';
  if ((after.loanDebt || 0) > (before.loanDebt || 0)) return 'Nhận khoản vay cứu trợ';
  if ((after.dailyFinance?.revenue || 0) > (before.dailyFinance?.revenue || 0)) return 'Bán món và tiền boa';
  if ((after.dailyFinance?.otherIncome || 0) > (before.dailyFinance?.otherIncome || 0)) return 'Thu khác: sự kiện hoặc thưởng';
  if ((after.dailyFinance?.eventExpenses || 0) > (before.dailyFinance?.eventExpenses || 0)) return 'Chi phí biến cố';
  if (JSON.stringify(before.inventory) !== JSON.stringify(after.inventory) && after.money < before.money) return 'Mua nguyên liệu';
  if (JSON.stringify(before.stageUpgrades) !== JSON.stringify(after.stageUpgrades)) return after.money > before.money ? 'Thanh lý thiết bị' : 'Đầu tư thiết bị';
  return after.money > before.money ? 'Thu khác' : 'Đầu tư hoặc chi phí quản lý';
}
