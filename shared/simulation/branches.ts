import type { RestaurantTypeId, Employee, RecipeId, IngredientId } from '../types';
import { RESTAURANT_TYPES, RECIPES } from '../gameData';
import { calculateDishCOGS } from '../economy/pricing';
import { calculatePriceMultiplier, calculateRatingMultiplier, calculateWeatherMultiplier } from '../economy/demand';
import { calculateCookEfficiency } from './employees';

export interface BranchSimResult {
  restaurantId: RestaurantTypeId; recipeId: RecipeId; dishName: string;
  earnedRevenue: number; cogsCost: number; netProfitChange: number; servedCustomers: number; lostReason?: string;
}

export function simulatePassiveBranchTick(params: {
  restaurantId: RestaurantTypeId; branchLevel: number; branchStaff: Employee[];
  marketPrices?: Partial<Record<IngredientId, number>>; weather?: 'sunny' | 'rainy' | 'breezy';
  playerPrices?: Partial<Record<RecipeId, number>>; activeRecipes?: RecipeId[];
  hasChainManager?: boolean; inventory?: Partial<Record<IngredientId, number>>; rating?: number;
}): BranchSimResult | null {
  const restaurant = RESTAURANT_TYPES[params.restaurantId];
  const chefs = params.branchStaff.filter(e => e.role === 'cook' || e.role === 'manager');
  // An unattended branch is closed, rather than supplied by free temporary workers.
  if (!restaurant || !chefs.length) return null;
  const menu = (params.activeRecipes ?? restaurant.primaryRecipeIds).filter(id => restaurant.primaryRecipeIds.includes(id));
  if (!menu.length) return null;
  const recipeId = menu[Math.floor(Math.random() * menu.length)];
  const recipe = RECIPES[recipeId];
  const price = params.playerPrices?.[recipeId] ?? recipe.basePrice;
  const chef = chefs.reduce((best, e) => (e.cookingSkill || 0) > (best.cookingSkill || 0) ? e : best);
  const efficiency = calculateCookEfficiency(chef);
  const tier = restaurant.branchTiers?.[params.branchLevel - 1]?.bonusMultiplier || 1;
  const serverBoost = params.branchStaff.some(e => e.role === 'server') ? 1.15 : 0.85;
  const capacity = Math.min(4, efficiency.speedMultiplier * tier * serverBoost * (params.hasChainManager ? 1.25 : 1));
  const demand = calculatePriceMultiplier(price, recipe.basePrice, 'neighborhood') * calculateRatingMultiplier(params.rating) * calculateWeatherMultiplier(params.weather || 'sunny', recipe.category, recipeId);
  const expected = Math.min(capacity, 2 * demand);
  let quantity = Math.floor(expected) + (Math.random() < expected % 1 ? 1 : 0);
  if (params.inventory) {
    const counts: Partial<Record<IngredientId, number>> = {};
    recipe.requiredIngredients.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    quantity = Math.min(quantity, ...Object.entries(counts).map(([id, count]) => Math.floor((params.inventory?.[id as IngredientId] || 0) / count!)));
  }
  if (quantity <= 0) return null;
  const earnedRevenue = Math.round(quantity * price);
  const cogsCost = quantity * calculateDishCOGS(recipeId, params.marketPrices);
  return { restaurantId: params.restaurantId, recipeId, dishName: recipe.name, earnedRevenue, cogsCost,
    netProfitChange: earnedRevenue - cogsCost, servedCustomers: quantity };
}
