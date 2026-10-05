import { CustomerTypeId, RecipeId } from '../types';
import { RECIPES } from '../gameData';

export interface CustomerPriceSensitivity {
  sensitivity: number;
  label: string;
}

export const CUSTOMER_PRICE_SENSITIVITY: Record<CustomerTypeId, CustomerPriceSensitivity> = {
  student: { sensitivity: 1.5, label: 'Rất nhạy cảm giá' },
  office_worker: { sensitivity: 1.0, label: 'Nhạy cảm vừa' },
  neighborhood: { sensitivity: 0.8, label: 'Ít nhạy cảm giá' },
  food_lover: { sensitivity: 0.5, label: 'Chấp nhận giá cao' },
};

/**
 * Tính hệ số phạt/thưởng giá theo độ nhạy giá của nhóm khách
 * priceRatio = playerPrice / basePrice
 */
export function calculatePriceMultiplier(
  playerPrice: number,
  basePrice: number,
  customerType: CustomerTypeId = 'student'
): number {
  if (basePrice <= 0) return 1.0;
  const priceRatio = playerPrice / basePrice;
  const sensitivity = CUSTOMER_PRICE_SENSITIVITY[customerType]?.sensitivity ?? 1.0;

  if (priceRatio > 1.0) {
    // Giá cao hơn chuẩn -> Giảm nhu cầu
    // Công thức: max(0.35, 1 - (priceRatio - 1) * priceSensitivity)
    const penalty = 1.0 - (priceRatio - 1.0) * sensitivity;
    return Math.max(0.35, penalty);
  } else if (priceRatio < 1.0) {
    // Giá rẻ hơn chuẩn -> Tăng nhu cầu nhẹ
    const bonus = 1.0 + (1.0 - priceRatio) * 0.5;
    return Math.min(1.4, bonus);
  }

  return 1.0;
}

/**
 * Hệ số tác động của Rating lên nhu cầu khách:
 * ratingMultiplier = 0.6 + (rating / 100) * 0.8
 * Rating 0 -> 0.6x
 * Rating 50 -> 1.0x
 * Rating 100 -> 1.4x
 */
export function calculateRatingMultiplier(rating: number = 75): number {
  const clampedRating = Math.max(0, Math.min(100, rating));
  return 0.6 + (clampedRating / 100) * 0.8;
}

/**
 * Hệ số tác động của thời tiết tới nhu cầu món
 */
export function calculateWeatherMultiplier(
  weather: 'sunny' | 'rainy' | 'breezy',
  recipeCategory: 'food' | 'drink',
  recipeId?: RecipeId
): number {
  if (weather === 'sunny') {
    // Nắng nóng chuộng đồ uống
    if (recipeCategory === 'drink') return 1.35;
    return 1.0;
  }
  if (weather === 'rainy') {
    // Mưa chuộng món nước nóng sốt
    if (recipeCategory === 'drink') return 0.85;
    if (
      recipeId?.includes('pho') ||
      recipeId?.includes('bun') ||
      recipeId?.includes('bo_ne')
    ) {
      return 1.3;
    }
    return 1.05;
  }
  if (weather === 'breezy') {
    // Gió mát, khách ngồi ăn nhiều
    return 1.15;
  }
  return 1.0;
}

/**
 * Hệ số danh tiếng (Fame / Reputation)
 */
export function calculateFameMultiplier(fame: number = 0): number {
  const safeFame = Math.max(0, fame);
  // Quy mô tăng trưởng logarit nhẹ
  return 1.0 + Math.log10(safeFame + 10) * 0.15;
}

export type DemandLevel = 'very_high' | 'high' | 'normal' | 'low';

export interface DemandAnalysis {
  demandScore: number;
  level: DemandLevel;
  badge: string;
  description: string;
}

/**
 * Tính toán nhu cầu tổng thể của một món ăn
 */
export function calculateDishDemand(params: {
  recipeId: RecipeId;
  playerPrice?: number;
  rating?: number;
  weather?: 'sunny' | 'rainy' | 'breezy';
  fame?: number;
  marketingMultiplier?: number;
  trendMultiplier?: number;
}): DemandAnalysis {
  const recipe = RECIPES[params.recipeId];
  if (!recipe) {
    return {
      demandScore: 1.0,
      level: 'normal',
      badge: '🟡 Bình thường',
      description: 'Nhu cầu ổn định',
    };
  }

  const basePrice = recipe.basePrice;
  const playerPrice = params.playerPrice ?? basePrice;

  // Lấy trung bình giá phạt của 4 nhóm khách
  const types: CustomerTypeId[] = ['student', 'office_worker', 'neighborhood', 'food_lover'];
  const avgPriceMult =
    types.reduce((sum, t) => sum + calculatePriceMultiplier(playerPrice, basePrice, t), 0) /
    types.length;

  const ratingMult = calculateRatingMultiplier(params.rating ?? 75);
  const weatherMult = calculateWeatherMultiplier(
    params.weather ?? 'sunny',
    recipe.category,
    params.recipeId
  );
  const fameMult = calculateFameMultiplier(params.fame ?? 0);
  const marketingMult = params.marketingMultiplier ?? 1.0;
  const trendMult = params.trendMultiplier ?? 1.0;

  const demandScore =
    1.0 * avgPriceMult * ratingMult * weatherMult * fameMult * marketingMult * trendMult;

  if (demandScore >= 1.35) {
    return {
      demandScore,
      level: 'very_high',
      badge: '🔥 Rất cao',
      description: 'Món ăn đắt khách, khách tranh nhau gọi!',
    };
  }
  if (demandScore >= 1.05) {
    return {
      demandScore,
      level: 'high',
      badge: '🟢 Cao',
      description: 'Nhu cầu tốt, tiêu thụ nhanh',
    };
  }
  if (demandScore >= 0.75) {
    return {
      demandScore,
      level: 'normal',
      badge: '🟡 Bình thường',
      description: 'Nhu cầu ổn định, bán đều đặn',
    };
  }
  return {
    demandScore,
    level: 'low',
    badge: '🔴 Thấp',
    description: 'Nhu cầu thấp, có thể giá quá cao hoặc ít chuộng',
  };
}
