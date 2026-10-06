import {
  RestaurantTypeId,
  Employee,
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
 * - Chi nhánh có Đầu Bếp hoặc Quản Lý tự động vận hành 100% công suất
 * - Quản Lý có thể kiêm nhiệm nấu và quản xuyến chi nhánh
 * - Nếu có Giám đốc chuỗi (Chú Quân), buff +25% doanh thu cho toàn bộ các quán
 * - Nếu chi nhánh mới mở chưa kịp phân công nhân sự chính thức:
 *   Vẫn tự động vận hành cầm chừng bằng nhân sự thời vụ (50% công suất)
 */
export function simulatePassiveBranchTick(params: {
  restaurantId: RestaurantTypeId;
  branchLevel: number;
  branchStaff: Employee[];
  marketPrices?: Partial<Record<any, number>>;
  weather?: 'sunny' | 'rainy' | 'breezy';
  playerPrices?: Partial<Record<RecipeId, number>>;
  activeRecipes?: RecipeId[];
  hasChainManager?: boolean;
}): BranchSimResult | null {
  const {
    restaurantId,
    branchLevel = 1,
    branchStaff = [],
    marketPrices,
    weather = 'sunny',
    playerPrices,
    activeRecipes,
    hasChainManager = false,
  } = params;

  const restType = RESTAURANT_TYPES[restaurantId];
  if (!restType) return null;

  // 1. Phân loại nhân sự tại chi nhánh
  const cooks = branchStaff.filter((e) => e.role === 'cook');
  const servers = branchStaff.filter((e) => e.role === 'server');
  const managers = branchStaff.filter((e) => e.role === 'manager');

  // Đánh giá trạng thái vận hành của chi nhánh
  const hasDedicatedCook = cooks.length > 0;
  const hasManager = managers.length > 0;
  const hasServer = servers.length > 0;
  const isUnstaffed = branchStaff.length === 0;

  // 2. Danh mục món bán được
  const menuList =
    activeRecipes && activeRecipes.length > 0
      ? activeRecipes.filter((r) => restType.primaryRecipeIds.includes(r))
      : restType.primaryRecipeIds;

  if (menuList.length === 0) return null;

  // Chọn ngẫu nhiên 1 món trong menu của quán
  const recipeId = menuList[Math.floor(Math.random() * menuList.length)];
  const recipe = RECIPES[recipeId];
  if (!recipe) return null;

  // 3. Tính toán hệ số năng lực nấu & phục vụ
  let cookMultiplier = 1.0;
  let serverMultiplier = 1.0;
  let staffMultiplier = 1.0;
  let statusReason = '';

  if (hasDedicatedCook) {
    // Có đầu bếp chuyên nghiệp
    const bestCookSkill = Math.max(...cooks.map((c) => c.cookingSkill || 50));
    cookMultiplier = 0.85 + (bestCookSkill / 100) * 0.45;
    serverMultiplier = hasServer ? 1.0 + servers.length * 0.15 : 0.85; // Không có phục vụ thì khách tự lấy món
    staffMultiplier = 1.0;
  } else if (hasManager) {
    // Không có đầu bếp riêng nhưng có Quản Lý trực tiếp đứng quán
    // Quản lý kiêm nhiệm bếp và điều phối
    const bestManagerSkill = Math.max(...managers.map((m) => m.cookingSkill || 65));
    cookMultiplier = 0.8 + (bestManagerSkill / 100) * 0.35;
    serverMultiplier = hasServer ? 1.15 : 1.0; // Quản lý kiêm luôn phục vụ
    staffMultiplier = 1.1; // Quản lý giỏi tối ưu dòng khách
    statusReason = 'Quản lý kiêm nhiệm vận hành chi nhánh';
  } else if (hasServer) {
    // Chỉ có nhân viên phục vụ, thuê thợ nấu phụ bên ngoài
    cookMultiplier = 0.75;
    serverMultiplier = 1.05;
    staffMultiplier = 0.75;
    statusReason = 'Phục vụ tự đón khách và thuê thợ nấu phụ';
  } else if (isUnstaffed) {
    // Chi nhánh chưa có nhân sự chính thức phân công:
    // Tự động vận hành dạng nhượng quyền / thuê thời vụ (50% công suất)
    cookMultiplier = 0.6;
    serverMultiplier = 0.8;
    staffMultiplier = 0.5;
    statusReason = 'Đang chạy bằng nhân sự thời vụ (50% công suất). Hãy phân công nhân viên!';
  }

  // 4. Hiệu ứng Quản Lý & Giám đốc chuỗi
  let managerBoost = 1.0;
  if (hasManager) {
    managerBoost *= 1.25; // Quản lý trực tiếp tại quán tăng 25% doanh số
  }
  if (hasChainManager) {
    managerBoost *= 1.25; // Chú Quân (Giám đốc chuỗi) buff thêm 25% cho toàn chuỗi chi nhánh
  }

  // 5. Cấp độ chi nhánh (Branch Tier)
  const tier = restType.branchTiers?.[branchLevel - 1];
  const tierMultiplier = tier?.bonusMultiplier || (1 + (branchLevel - 1) * 0.35);

  // 6. Thời tiết ảnh hưởng nhẹ
  let weatherMultiplier = 1.0;
  if (weather === 'rainy') {
    weatherMultiplier = 0.9;
  } else if (weather === 'sunny' && recipe.category === 'drink') {
    weatherMultiplier = 1.2;
  }

  // 7. Giá bán & COGS
  const sellingPrice = playerPrices?.[recipeId] ?? recipe.basePrice;
  const cogs = calculateDishCOGS(recipeId, marketPrices);

  // Tính số lượng suất bán được trong chu kỳ
  let baseCustomers = 1;
  if (branchLevel >= 2 && Math.random() < 0.35) baseCustomers = 2;
  if (branchLevel >= 4 && Math.random() < 0.5) baseCustomers = 3;

  const servedCustomers = baseCustomers;
  const totalRevenue = Math.max(
    1000,
    Math.round(
      servedCustomers *
        sellingPrice *
        cookMultiplier *
        serverMultiplier *
        staffMultiplier *
        managerBoost *
        tierMultiplier *
        weatherMultiplier
    )
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
    lostReason: statusReason || undefined,
  };
}
