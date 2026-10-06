import { RESTAURANT_TYPES, RECIPES, getStarterRecipesForRestaurant } from '../gameData';
import type { RestaurantTypeId, RecipeId } from '../types';

export function getRecipeLearningCost(restaurant: RestaurantTypeId, recipe: RecipeId) {
  const starter = getStarterRecipesForRestaurant(restaurant).includes(recipe);
  return { cost: starter ? 0 : RECIPES[recipe].basePrice * 3, requiredLevel: starter ? 1 : 2,
    valid: RESTAURANT_TYPES[restaurant].primaryRecipeIds.includes(recipe) };
}
