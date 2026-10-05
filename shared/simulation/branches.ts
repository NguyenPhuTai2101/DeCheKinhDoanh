import {
  RestaurantTypeId,
  Employee,
  BranchDailyFinance,
  RecipeId,
} from '../types';
import { RESTAURANT_TYPES, RECIPES } from '../gameData';
import { calculateDishCOGS } from '../economy/pricing';

export interface BranchSimResult {
  restaurantId: RestaurantTypeId;
  dishName: string;
  earnedRevenue: number;
  cogsCost: number;
  netProfitChange: number;
  servedCustomers: number;
  lostReason?: string;
}

/**
 * Mô phỏng kinh doanh chân thực cho một chi nhánh thụ động
 * Loại bỏ cơ chế "máy in tiền ảo":
 * - Tính toán Năng lực (Capacity)
 * - Yêu cầu Nhân sự (Staff Requirements)
 * - Doanh thu thực tế (Revenue)
 * - Giá vốn thực tế (COGS)
 * - Lợi nhuận ròng thực tế (Net Profit)
 */
export function simulatePassiveBranchTick(params: {
  restaurantId: RestaurantTypeId;
  branchLevel: number;
  branchStaff: Employee[];
  marketPrices?: Partial<Record<any, number>>;
  weather?: 'sunny' | 'rainy' | 'breezy';
  playerPrices?: Partial<Record<RecipeId, number>>;
  activeRecipes?: RecipeId[];
}): BranchSimResult | null {
  const {
    restaurantId,
    branchLevel = 1,
    branchStaff,
    marketPrices,
    weather = 'sunny',
    playerPrices,
    activeRecipes,
  } = params;

  const restType = RESTAURANT_TYPES[restaurantId];
  if (!restType) return null;

  // 1. Kiểm tra nhân sự
  if (branchStaff.length === 0) {
    return {
      restaurantId,
      dishName: '',
      earnedRevenue: 0,
      cogsCost: 0,
      netProfitChange: 0,
      servedCustomers: 0,
      lostReason: 'Chi nhánh đóng cửa do không có nhân viên trực!',
    };
  }

  const cooks = branchStaff.filter((e) => e.role === 'cook');
  const servers = branchStaff.filter((e) => e.role === 'server');
  const managers = branchStaff.filter((e) => e.role === 'manager');

  // Nếu không có đầu bếp thì không thể phục vụ món ăn
  if (cooks.length === 0) {
    return {
      restaurantId,
      dishName: '',
      earnedRevenue: 0,
      cogsCost: 0,
      netProfitChange: 0,
      servedCustomers: 0,
      lostReason: 'Chi nhánh thiếu đầu bếp, không thể chế biến món ăn!',
    };
  }

  // 2. Danh mục món bán được
  const menuList = activeRecipes && activeRecipes.length > 0
    ? activeRecipes.filter((r) => restType.primaryRecipeIds.includes(r))
    : restType.primaryRecipeIds;

  if (menuList.length === 0) return null;

  // Chọn ngẫu nhiên 1 món trong menu
  const recipeId = menuList[Math.floor(Math.random() * menuList.length)];
  const recipe = RECIPES[recipeId];
  if (!recipe) return null;

  // 3. Hiệu suất nhân sự & quản lý
  const hasManager = managers.length > 0;
  const managerBoost = hasManager ? 1.25 : 1.0; // Manager chỉ buff cho chính chi nhánh này!

  // Đánh giá kỹ năng đầu bếp chính
  const bestCookSkill = Math.max(...cooks.map((c) => c.cookingSkill || 50));
  const cookMultiplier = 0.8 + (bestCookSkill / 100) * 0.4;

  // Đánh giá phục vụ
  const serverCount = servers.length;
  const serverMultiplier = serverCount > 0 ? 1.0 + serverCount * 0.1 : 0.75; // Không có server bị phạt -25%

  // 4. Branch Tier
  const tier = restType.branchTiers?.[branchLevel - 1];
  const tierMultiplier = tier?.bonusMultiplier || (1 + (branchLevel - 1) * 0.35);

  // 5. Giá bán & COGS
  const sellingPrice = playerPrices?.[recipeId] ?? recipe.basePrice;
  const cogs = calculateDishCOGS(recipeId, marketPrices);

  // Tính số lượng suất bán được trong chu kỳ
  let baseCustomers = 1;
  if (branchLevel >= 3 && Math.random() < 0.4) baseCustomers = 2;
  if (branchLevel >= 5 && Math.random() < 0.6) baseCustomers = 3;

  const servedCustomers = baseCustomers;
  const totalRevenue = Math.round(
    servedCustomers * sellingPrice * cookMultiplier * serverMultiplier * managerBoost * tierMultiplier
  );
  const totalCOGS = Math.round(servedCustomers * cogs);

  const netProfitChange = totalRevenue - totalCOGS;

  return {
    restaurantId,
    dishName: recipe.name,
    earnedRevenue: totalRevenue,
    cogsCost: totalCOGS,
    netProfitChange,
    servedCustomers,
  };
}
