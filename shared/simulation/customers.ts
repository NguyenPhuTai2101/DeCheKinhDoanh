import { CustomerTypeId, RecipeId } from '../types';
import { CUSTOMER_PRICE_SENSITIVITY } from '../economy/demand';
import { RECIPES } from '../gameData';

export interface CustomerSatisfactionParams {
  customerType: CustomerTypeId;
  recipeId: RecipeId;
  playerPrice?: number;
  cookSkill?: number; // 0 - 100
  serverSkill?: number; // 0 - 100
  cozyPoints?: number; // Điểm thẩm mỹ quán
  patienceRemainingRatio: number; // 0.0 (chờ đến giọt nước cuối cùng) đến 1.0 (nhanh tức thì)
  isCreativeDish?: boolean; // Đầu bếp có trait Creative nấu món tuyệt hảo
  hasFriendlyServer?: boolean; // Phục vụ có trait Friendly
}

export interface ReviewOutcome {
  satisfaction: number; // 0 - 100
  stars: 1 | 2 | 3 | 4 | 5;
  icon: string;
  label: string;
  comment: string;
  fameChange: number;
}

/**
 * Tính toán độ hài lòng của thực khách khi ăn xong
 * Satisfaction = 40 + FoodQuality + ServiceQuality + Environment - WaitingPenalty - PricePenalty
 */
export function calculateCustomerSatisfaction(params: CustomerSatisfactionParams): ReviewOutcome {
  const {
    customerType,
    recipeId,
    playerPrice,
    cookSkill = 50,
    serverSkill = 50,
    cozyPoints = 0,
    patienceRemainingRatio,
    isCreativeDish = false,
    hasFriendlyServer = false,
  } = params;

  const recipe = RECIPES[recipeId];
  const basePrice = recipe?.basePrice || 30000;
  const currentPrice = playerPrice ?? basePrice;

  // 1. Chất lượng món ăn (Food Quality: 10 - 30 điểm)
  // Phụ thuộc vào Cooking Skill của đầu bếp
  let foodQuality = 15 + Math.round((cookSkill / 100) * 12);
  if (isCreativeDish) {
    foodQuality += 8; // Món ăn bùng nổ hương vị từ đầu bếp sáng tạo
  }

  // 2. Chất lượng dịch vụ (Service Quality: 8 - 20 điểm)
  // Phụ thuộc vào Service Skill và Friendly trait
  let serviceQuality = 8 + Math.round((serverSkill / 100) * 12);
  if (hasFriendlyServer) {
    serviceQuality += 6;
  }

  // 3. Không gian & Trang trí quán (Environment: 5 - 15 điểm)
  const environment = Math.min(15, 6 + Math.round((cozyPoints / 20) * 8));

  // 4. Phạt thời gian chờ đợi (Waiting Penalty: 0 - 25 điểm)
  // Nếu patienceRemainingRatio thấp (gần hết kiên nhẫn), phạt nặng
  let waitingPenalty = 0;
  if (patienceRemainingRatio < 0.3) {
    waitingPenalty = 22;
  } else if (patienceRemainingRatio < 0.6) {
    waitingPenalty = 12;
  } else if (patienceRemainingRatio < 0.8) {
    waitingPenalty = 5;
  }

  // 5. Phạt giá cả (Price Penalty: 0 - 20 điểm)
  let pricePenalty = 0;
  if (currentPrice > basePrice) {
    const sensitivity = CUSTOMER_PRICE_SENSITIVITY[customerType]?.sensitivity ?? 1.0;
    const priceRatio = currentPrice / basePrice;
    pricePenalty = Math.min(25, Math.round((priceRatio - 1.0) * 20 * sensitivity));
  }

  // Tổng điểm hài lòng (0 - 100)
  const rawSatisfaction = 40 + foodQuality + serviceQuality + environment - waitingPenalty - pricePenalty;
  const satisfaction = Math.max(10, Math.min(100, Math.round(rawSatisfaction)));

  // Kết quả đánh giá theo sao
  if (satisfaction >= 90) {
    return {
      satisfaction,
      stars: 5,
      icon: '😍',
      label: '5 Sao - Tuyệt Vời',
      comment: 'Món ăn chuẩn vị, nhân viên thân thiện, trải nghiệm tuyệt đỉnh!',
      fameChange: 2, // Đánh giá 5 sao cộng Fame
    };
  }
  if (satisfaction >= 75) {
    return {
      satisfaction,
      stars: 4,
      icon: '😊',
      label: '4 Sao - Rất Tốt',
      comment: 'Ăn vừa miệng, quán phục vụ chu đáo.',
      fameChange: 1,
    };
  }
  if (satisfaction >= 60) {
    return {
      satisfaction,
      stars: 3,
      icon: '🙂',
      label: '3 Sao - Ổn',
      comment: 'Chất lượng bình thường, tạm ổn.',
      fameChange: 0,
    };
  }
  if (satisfaction >= 40) {
    return {
      satisfaction,
      stars: 2,
      icon: '😐',
      label: '2 Sao - Hơi Thất Vọng',
      comment: 'Chờ hơi lâu, giá hơi đắt hoặc món ăn chưa tới.',
      fameChange: 0,
    };
  }
  return {
    satisfaction,
    stars: 1,
    icon: '😡',
    label: '1 Sao - Rất Kém',
    comment: 'Chờ đợi mòn mỏi, phục vụ chậm chạp!',
    fameChange: -1,
  };
}

/**
 * Cập nhật điểm Rating của quán (0 - 100) theo phương pháp Weighted Moving Average
 * Giúp chỉ số di chuyển mượt mà, chân thực theo thời gian
 */
export function updateShopRating(
  currentRating: number = 75,
  reviewSatisfaction: number
): number {
  // Trọng số 95% rating cũ + 5% trải nghiệm khách mới
  const updated = currentRating * 0.95 + reviewSatisfaction * 0.05;
  return Math.max(10, Math.min(100, Math.round(updated * 10) / 10));
}

/**
 * Tính tiền boa (Tip) dựa trên chất lượng phục vụ và phân khúc khách
 */
export function calculateTipAmount(params: {
  sellingPrice: number;
  serviceSkill?: number;
  tipMultiplier?: number;
  satisfaction: number;
}): number {
  const { sellingPrice, serviceSkill = 50, tipMultiplier = 1.0, satisfaction } = params;
  if (satisfaction < 70) return 0; // Khách không hài lòng thì không tip

  // Cơ bản: 5% - 15% tiền món
  let baseTipRate = 0.05 + ((serviceSkill / 100) * 0.1);
  if (satisfaction >= 90) {
    baseTipRate += 0.05;
  }

  const finalTip = Math.round(sellingPrice * baseTipRate * tipMultiplier);
  return Math.max(0, finalTip);
}
