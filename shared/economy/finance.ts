import {
  DailyFinance,
  BranchDailyFinance,
  RestaurantTypeId,
  RecipeId,
  BottleneckType,
  BottleneckAnalysis,
  FinancialHealthLevel,
  MorningBriefing,
  IngredientId,
} from '../types';
import { PREMISES_CONFIG } from '../simulationConfig';
import { RECIPES, INGREDIENTS } from '../gameData';
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

/**
 * Phân tích Nút Cổ Chai (Bottleneck) lớn nhất của ngày hôm đó
 * So sánh Cầu (Demand), Năng lực phục vụ (Capacity), và Tồn kho (Inventory)
 */
export function calculateBottleneck(params: {
  servedCount: number;
  lostCount: number;
  capacityBottleneckCount?: number;
  stockBottleneckCount?: number;
  revenue: number;
  reputation: number;
}): BottleneckAnalysis {
  const { servedCount, lostCount, capacityBottleneckCount = 0, stockBottleneckCount = 0 } = params;

  // Nếu hầu hết khách bỏ về do thiếu hàng tồn kho
  if (stockBottleneckCount > 0 && (stockBottleneckCount >= capacityBottleneckCount || stockBottleneckCount > 2)) {
    return {
      type: 'inventory',
      title: '📦 Nút Thắt: Cạn Kiệt Tồn Kho',
      description: `Mất khoảng ${stockBottleneckCount} lượt khách do quán hết nguyên liệu tươi hoặc món yêu cầu giữa ca bán.`,
      recommendation: 'Cần nâng cấp sức chứa kho, nhập hàng nhiều hơn vào buổi sáng hoặc tuyển chuyên viên Đi Chợ Sỉ.',
      demandLoss: 0,
      capacityLoss: capacityBottleneckCount,
      stockLoss: stockBottleneckCount,
    };
  }

  // Nếu khách bỏ về do chờ lâu / thiếu bàn / thiếu người
  if (lostCount > 0 && (capacityBottleneckCount > 0 || lostCount > servedCount * 0.15)) {
    return {
      type: 'capacity',
      title: '🏃 Nút Thắt: Năng Lực Quá Tải',
      description: `Có ${lostCount} khách bỏ về vì đợi quá lâu trong giờ cao điểm hoặc không có bàn trống.`,
      recommendation: 'Cần tuyển thêm phục vụ/đầu bếp, mua thêm bàn ghế hoặc nâng cấp thiết bị nấu nhanh hơn.',
      demandLoss: 0,
      capacityLoss: lostCount,
      stockLoss: stockBottleneckCount,
    };
  }

  // Nếu phục vụ hết nhưng lượng khách tổng thể vẫn ít -> Cầu thấp
  if (servedCount < 10) {
    return {
      type: 'demand',
      title: '📢 Nút Thắt: Lượng Cầu Khách Ít',
      description: 'Nhân viên rảnh tay, bàn ghế trống nhiều, doanh thu không đủ bù chi phí cố định (thuê & lương).',
      recommendation: 'Cần giảm giá nhẹ để thu hút khách, đầu tư marketing/biển hiệu hoặc làm hài lòng khách để tăng sao Uy Tín.',
      demandLoss: Math.max(0, 15 - servedCount),
      capacityLoss: 0,
      stockLoss: 0,
    };
  }

  // Mặc định cân bằng tốt
  return {
    type: 'capacity',
    title: '⚖️ Vận Hành Ổn Định',
    description: `Quán phục vụ trơn tru ${servedCount} khách với tỷ lệ hài lòng tốt.`,
    recommendation: 'Hãy tiếp tục duy trì và tích lũy vốn để mở rộng quy mô hoặc nâng cấp chi nhánh tiếp theo!',
    demandLoss: 0,
    capacityLoss: lostCount,
    stockLoss: stockBottleneckCount,
  };
}

/**
 * Dự báo dòng tiền 3 ngày tới (Cashflow 3-day projection)
 */
export function calculate3DayCashflowForecast(params: {
  currentMoney: number;
  dailyNetProfit: number;
  fixedCostsPerDay: number;
}): number[] {
  const { currentMoney, dailyNetProfit } = params;
  const day1 = Math.round(currentMoney + dailyNetProfit);
  const day2 = Math.round(day1 + dailyNetProfit);
  const day3 = Math.round(day2 + dailyNetProfit);
  return [day1, day2, day3];
}

/**
 * Đánh giá 5 mức Sức Khỏe Tài Chính theo chi phí cố định
 */
export function evaluateFinancialHealth(params: {
  currentMoney: number;
  dailyFixedCost: number;
  loanDebt?: number;
  consecutiveCrisisDays?: number;
}): { level: FinancialHealthLevel; title: string; desc: string; daysRemaining: number } {
  const { currentMoney, dailyFixedCost, loanDebt = 0, consecutiveCrisisDays = 0 } = params;
  const cost = Math.max(1, dailyFixedCost);
  const daysCovered = currentMoney / cost;

  if (currentMoney <= 0) {
    if (consecutiveCrisisDays >= 3) {
      return {
        level: 'bankrupt',
        title: '⚫ Phá Sản Do Vỡ Nợ',
        desc: 'Hết thời gian ân hạn 3 ngày mà không thanh toán được nợ và chi phí vận hành.',
        daysRemaining: 0,
      };
    }
    return {
      level: 'crisis',
      title: '🔴 Khủng Hoảng Tiền Mặt',
      desc: `Tiền mặt đã âm! Bạn có ${Math.max(1, 3 - consecutiveCrisisDays)} ngày ân hạn để xoay sở vốn cứu quán.`,
      daysRemaining: 0,
    };
  }

  if (daysCovered < 7 || loanDebt > 0) {
    return {
      level: 'deficit',
      title: '🟠 Báo Động Thiếu Hụt',
      desc: `Tiền mặt chỉ đủ chi trả ${daysCovered.toFixed(1)} ngày chi phí cố định. Tinh thần nhân viên bắt đầu lo lắng!`,
      daysRemaining: Math.floor(daysCovered),
    };
  }

  if (daysCovered < 14) {
    return {
      level: 'stress',
      title: '🟡 Căng Thẳng Ngân Sách',
      desc: `Đủ trang trải ${daysCovered.toFixed(0)} ngày. Nên thận trọng trước các khoản đầu tư lớn.`,
      daysRemaining: Math.floor(daysCovered),
    };
  }

  return {
    level: 'stable',
    title: '🟢 Tài Chính Vững Vàng',
    desc: `Dự trữ tiền mặt dồi dào, đủ chi trả ${daysCovered.toFixed(0)} ngày vận hành liên tục.`,
    daysRemaining: Math.floor(daysCovered),
  };
}

/**
 * Tính Uy tín trung bình trượt 14 ngày (Rolling Average)
 */
export function calculateRollingReputation(
  currentRep: number,
  pastRatings: number[] = []
): number {
  if (pastRatings.length === 0) return currentRep;
  const recent14 = pastRatings.slice(-14);
  const avg14 = recent14.reduce((s, r) => s + r, 0) / recent14.length;
  return Math.round(avg14 * 0.7 + currentRep * 0.3);
}

/**
 * Tính toán hao hụt nguyên liệu tươi cuối ngày (Daily Spoilage)
 */
export function calculateDailySpoilage(params: {
  inventory: Partial<Record<IngredientId, number>>;
  fridgeLevel?: number;
}): {
  spoilageCost: number;
  spoilageDetails: Array<{ ingredientId: IngredientId; name: string; count: number; cost: number }>;
  updatedInventory: Partial<Record<IngredientId, number>>;
} {
  const { inventory, fridgeLevel = 0 } = params;
  let totalCost = 0;
  const details: Array<{ ingredientId: IngredientId; name: string; count: number; cost: number }> = [];
  const updatedInv = { ...inventory };

  // Tủ lạnh cấp 1 giảm 50% hao hụt, cấp 2 giảm 80% hao hụt
  const fridgeReduction = fridgeLevel >= 2 ? 0.2 : fridgeLevel >= 1 ? 0.5 : 1.0;

  for (const [id, qty] of Object.entries(inventory)) {
    if (!qty || qty <= 0) continue;
    const ingId = id as IngredientId;
    const ing = INGREDIENTS[ingId];
    if (!ing) continue;

    let lossRate = 0;
    if (ing.shelfLifeCategory === 'fresh') {
      lossRate = (0.04 + Math.random() * 0.04) * fridgeReduction;
    } else if (ing.shelfLifeCategory === 'semi_fresh') {
      lossRate = (0.01 + Math.random() * 0.02) * fridgeReduction;
    }

    if (lossRate > 0 && qty >= 3) {
      const lostCount = Math.min(qty, Math.floor(qty * lossRate));
      if (lostCount > 0) {
        const itemLossCost = lostCount * ing.cost;
        totalCost += itemLossCost;
        updatedInv[ingId] = Math.max(0, qty - lostCount);
        details.push({
          ingredientId: ingId,
          name: ing.name,
          count: lostCount,
          cost: itemLossCost,
        });
      }
    }
  }

  return {
    spoilageCost: totalCost,
    spoilageDetails: details,
    updatedInventory: updatedInv,
  };
}

/**
 * Sinh Bản Tin Sáng (Morning Briefing) cho Pha 1
 */
export function generateMorningBriefing(params: {
  day: number;
  weather: 'sunny' | 'rainy' | 'breezy';
  businessStage: string;
}): MorningBriefing {
  const { day, weather, businessStage } = params;

  let weatherHeadline = '';
  let marketHeadline = '';
  let marketTrend = '';
  let warningAlert: string | undefined = undefined;
  let dailyAdvice = '';

  if (weather === 'sunny') {
    weatherHeadline = '☀️ Trời nắng trong lành, buổi trưa oi bức.';
    marketHeadline = 'Nhu cầu nước giải khát, trà tắc, cafe tăng vọt!';
    marketTrend = 'Giá chanh, trà và sữa ổn định. Hãy chuẩn bị sẵn đá lạnh và ly mang đi.';
    dailyAdvice = 'Đồ uống có biên lợi nhuận cao, hãy bán kèm combo để tăng doanh thu!';
  } else if (weather === 'rainy') {
    weatherHeadline = '🌧️ Dự báo có mưa to ngập đường từ đầu giờ chiều.';
    marketHeadline = 'Khách ngồi lại vỉa hè giảm mạnh, đơn giao hàng (delivery) tăng cao.';
    marketTrend = 'Giá rau xanh ngoài chợ tăng nhẹ +20% do mưa ngập đường vận chuyển.';
    warningAlert = 'Cảnh báo: Che chắn quầy kỹ càng để nguyên liệu không bị ướt!';
    dailyAdvice = 'Mở ứng dụng giao hàng và đẩy mạnh các món nóng sốt như phở, bún!';
  } else {
    weatherHeadline = '🍃 Gió mát dịu dàng, thời tiết cực kỳ chiều lòng thực khách.';
    marketHeadline = 'Chợ đầu mối nguồn hàng dồi dào, giá cả bình ổn.';
    marketTrend = 'Khách có xu hướng nán lại trò chuyện lâu hơn, hào phóng thưởng tip!';
    dailyAdvice = 'Duy trì thái độ niềm nở và dọn dẹp bàn nhanh để đón lượt khách tiếp theo.';
  }

  if (day % 7 === 0) {
    warningAlert = '⚠️ Cuối tuần đông đúc: Đội trật tự đô thị có thể đi rà soát khu phố!';
  }

  return {
    day,
    weather,
    weatherHeadline,
    marketHeadline,
    marketTrendDescription: marketTrend,
    warningAlert,
    dailyAdvice,
  };
}
