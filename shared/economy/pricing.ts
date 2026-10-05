import { IngredientId, RecipeId } from '../types';
import { INGREDIENTS, RECIPES } from '../gameData';

/**
 * Tính toán COGS (Giá vốn hàng bán) của một món ăn dựa trên giá thị trường thực tế của các nguyên liệu
 */
export function calculateDishCOGS(
  recipeId: RecipeId,
  marketPrices?: Partial<Record<IngredientId, number>>
): number {
  const recipe = RECIPES[recipeId];
  if (!recipe) return 0;

  let totalCost = 0;
  for (const ingId of recipe.requiredIngredients) {
    const marketPrice = marketPrices?.[ingId];
    if (typeof marketPrice === 'number') {
      totalCost += marketPrice;
    } else {
      const ing = INGREDIENTS[ingId];
      totalCost += ing ? ing.cost : 0;
    }
  }

  return totalCost;
}

/**
 * Lợi nhuận gộp (Gross Profit) = Giá bán - COGS
 */
export function calculateGrossProfit(sellingPrice: number, cogs: number): number {
  return sellingPrice - cogs;
}

/**
 * Biên lợi nhuận gộp (Gross Margin) = Lợi nhuận gộp / Giá bán
 */
export function calculateGrossMargin(sellingPrice: number, cogs: number): number {
  if (sellingPrice <= 0) return 0;
  return (sellingPrice - cogs) / sellingPrice;
}

/**
 * Sinh giá thị trường cho các nguyên liệu mỗi ngày mới
 * Giá biến động: -30%, -15%, Normal (0%), +15%, +30%, +50%
 * Chịu ảnh hưởng bởi thời tiết và quy luật cung cầu
 */
export function generateDailyMarketPrices(
  weather: 'sunny' | 'rainy' | 'breezy' = 'sunny'
): Partial<Record<IngredientId, number>> {
  const prices: Partial<Record<IngredientId, number>> = {};
  const fluctuationTiers = [-0.3, -0.15, 0, 0, 0.15, 0.3, 0.5];

  for (const [id, ing] of Object.entries(INGREDIENTS)) {
    const ingId = id as IngredientId;
    let baseRate = fluctuationTiers[Math.floor(Math.random() * fluctuationTiers.length)];

    // Thời tiết ảnh hưởng đặc thù
    if (weather === 'rainy') {
      if (ing.category === 'veg') {
        // Mưa làm dập rau -> rau tăng giá
        baseRate = Math.max(baseRate, 0.2);
      } else if (ing.category === 'meat') {
        baseRate += 0.05;
      }
    } else if (weather === 'sunny') {
      if (ing.category === 'beverage') {
        // Nắng nóng, nhu cầu đồ uống tăng -> trà, cà phê, sữa hơi tăng nhẹ
        baseRate += 0.1;
      }
    }

    const finalPrice = Math.round(ing.cost * (1 + baseRate));
    // Giới hạn giá không thấp hơn 50% và không cao hơn 200% giá gốc
    prices[ingId] = Math.max(Math.round(ing.cost * 0.5), Math.min(Math.round(ing.cost * 2.0), finalPrice));
  }

  return prices;
}

/**
 * Lấy giá thị trường hiện tại của một nguyên liệu (kết hợp biến động thị trường & khuyến mãi giờ vàng)
 */
export function getIngredientCurrentPrice(
  ingId: IngredientId,
  marketPrices?: Partial<Record<IngredientId, number>>,
  marketSpecial?: { ingredientId: IngredientId; discountPercent: number } | null
): number {
  let price: number;
  if (marketPrices && typeof marketPrices[ingId] === 'number') {
    price = marketPrices[ingId]!;
  } else {
    const ing = INGREDIENTS[ingId];
    price = ing ? ing.cost : 0;
  }

  if (marketSpecial && marketSpecial.ingredientId === ingId) {
    price = Math.round((price * (100 - marketSpecial.discountPercent)) / 100);
  }

  return price;
}
