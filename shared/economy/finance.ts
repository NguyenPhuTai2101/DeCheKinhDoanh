import {
  DailyFinance,
  BranchDailyFinance,
  RestaurantTypeId,
  RecipeId,
} from '../types';
import { PREMISES_CONFIG } from '../simulationConfig';
import { RECIPES } from '../gameData';
import { calculateDishCOGS } from './pricing';

export function createInitialDailyFinance(): DailyFinance {
  return {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    payroll: 0,
    rent: 0,
    utilities: 0,
    marketing: 0,
    deliveryFees: 0,
    eventExpenses: 0,
    otherIncome: 0,
    otherExpense: 0,
    netProfit: 0,
  };
}

export function createInitialBranchFinance(
  restaurantId: RestaurantTypeId,
  rent: number = 0,
  utilities: number = 0
): BranchDailyFinance {
  return {
    restaurantId,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    payroll: 0,
    rent,
    utilities,
    marketing: 0,
    netProfit: 0,
    customersServed: 0,
  };
}

/**
 * Tính toán chi phí cố định (mặt bằng, điện nước, rác thải) theo Business Stage
 */
export function calculateStageFixedCosts(stageId: string = 'cart'): {
  rent: number;
  utilities: number;
  waste: number;
  total: number;
} {
  const config = PREMISES_CONFIG[stageId] || PREMISES_CONFIG.cart;
  if (!config) {
    return { rent: 0, utilities: 0, waste: 0, total: 0 };
  }
  const rent = config.dailyRentCost || 0;
  const utilities = config.dailyUtilityCost || 0;
  const waste = config.dailyWasteAndFee || 0;
  return {
    rent,
    utilities: utilities + waste,
    waste,
    total: rent + utilities + waste,
  };
}

/**
 * Tính toán Lợi nhuận ròng từ các chỉ số tài chính
 */
export function calculateNetProfit(finance: DailyFinance): number {
  const gross = finance.revenue - finance.cogs;
  const totalExpenses =
    finance.payroll +
    finance.rent +
    finance.utilities +
    finance.marketing +
    finance.deliveryFees +
    finance.eventExpenses +
    finance.otherExpense;
  return gross + finance.otherIncome - totalExpenses;
}

export interface DishSalesRecord {
  recipeId: RecipeId;
  count: number;
  revenue: number;
  cogs: number;
}

/**
 * Tạo danh sách Insights kinh doanh thông minh cho báo cáo cuối ngày
 */
export function generateDailyInsights(params: {
  finance: DailyFinance;
  servedCount: number;
  lostCount: number;
  dishSales?: Record<RecipeId, { count: number; revenue: number; cogs: number }>;
  averageRating: number;
}): string[] {
  const insights: string[] = [];
  const { finance, servedCount, lostCount, dishSales, averageRating } = params;

  // 1. Phân tích món ăn
  if (dishSales && Object.keys(dishSales).length > 0) {
    const dishes = Object.entries(dishSales).map(([id, d]) => ({
      id: id as RecipeId,
      name: RECIPES[id as RecipeId]?.name || id,
      count: d.count,
      revenue: d.revenue,
      cogs: d.cogs,
      profit: d.revenue - d.cogs,
      margin: d.revenue > 0 ? (d.revenue - d.cogs) / d.revenue : 0,
    }));

    // Món bán chạy nhất
    dishes.sort((a, b) => b.count - a.count);
    const topSeller = dishes[0];
    if (topSeller && topSeller.count > 0) {
      if (topSeller.margin < 0.25) {
        insights.push(
          `⚠️ "${topSeller.name}" bán chạy nhất (${topSeller.count} phần) nhưng biên lợi nhuận thấp (${(topSeller.margin * 100).toFixed(0)}%) do giá nguyên liệu cao. Nên cân nhắc điều chỉnh tăng giá nhẹ!`
        );
      } else {
        insights.push(
          `🌟 "${topSeller.name}" là món chủ lực hôm nay với ${topSeller.count} phần bán ra, mang lại ${topSeller.profit.toLocaleString('vi-VN')}đ lợi nhuận gộp.`
        );
      }
    }

    // Món biên lợi nhuận cao nhất
    dishes.sort((a, b) => b.margin - a.margin);
    const bestMargin = dishes[0];
    if (bestMargin && bestMargin.count > 0 && bestMargin.margin >= 0.5) {
      insights.push(
        `💡 "${bestMargin.name}" có biên lợi nhuận ấn tượng nhất (${(bestMargin.margin * 100).toFixed(0)}%). Hãy đẩy mạnh món này trong menu!`
      );
    }
  }

  // 2. Phân tích khách bỏ về
  if (lostCount > 0) {
    const lostRate = (lostCount / (servedCount + lostCount)) * 100;
    if (lostRate > 20) {
      insights.push(
        `🚨 Có tới ${lostCount} khách tức giận bỏ về (${lostRate.toFixed(0)}% tổng lượt khách). Bếp bị quá tải hoặc thiếu người bưng món! Nên tuyển thêm phụ bếp hoặc nâng cấp tốc độ nấu.`
      );
    } else {
      insights.push(
        `⏱️ ${lostCount} khách bỏ về do chờ lâu trong giờ cao điểm. Cân nhắc chuẩn bị trước nguyên liệu hoặc bố trí thêm nhân sự.`
      );
    }
  }

  // 3. Phân tích chất lượng phục vụ & Rating
  if (averageRating >= 90) {
    insights.push(`😍 Khách hàng cực kỳ hài lòng (Đánh giá ${averageRating.toFixed(0)}/100). Danh tiếng quán đang lan tỏa rất nhanh!`);
  } else if (averageRating < 60) {
    insights.push(`📉 Đánh giá trung bình chỉ đạt ${averageRating.toFixed(0)}/100. Hãy chú ý kiểm soát chất lượng món ăn và không để khách đợi quá lâu.`);
  }

  // 4. Phân tích tài chính ròng
  if (finance.netProfit < 0) {
    insights.push(
      `💸 Quán đang chịu lỗ ${Math.abs(finance.netProfit).toLocaleString('vi-VN')}đ hôm nay! Hãy kiểm tra chi phí mặt bằng và quỹ lương nhân sự so với lượng khách bán được.`
    );
  } else {
    const netMargin = finance.revenue > 0 ? (finance.netProfit / finance.revenue) * 100 : 0;
    insights.push(
      `📊 Biên lợi nhuận ròng hôm nay đạt ${netMargin.toFixed(1)}%. Dòng tiền kinh doanh lành mạnh!`
    );
  }

  return insights;
}
