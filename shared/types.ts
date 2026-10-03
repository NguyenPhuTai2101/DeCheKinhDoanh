// Kiểu dữ liệu dùng chung giữa Client và Server

export type IngredientId =
  | 'bread'
  | 'egg'
  | 'pork'
  | 'pate'
  | 'cucumber'
  | 'herb'
  | 'tea'
  | 'milk'
  | 'condensed_milk'
  | 'coffee';

export interface Ingredient {
  id: IngredientId;
  name: string;
  icon: string;
  category: 'bakery' | 'meat' | 'veg' | 'beverage';
  cost: number; // Giá mua từ chợ (VND)
  description: string;
}

export type RecipeId =
  | 'banh_mi_trung'
  | 'banh_mi_thit'
  | 'banh_mi_dac_biet'
  | 'tra_sua'
  | 'cafe_sua';

export interface Recipe {
  id: RecipeId;
  name: string;
  icon: string;
  category: 'food' | 'drink';
  requiredIngredients: IngredientId[];
  cookingTimeMs: number; // Thời gian chế biến (ms)
  basePrice: number; // Giá bán (VND)
  expGain: number;
  description: string;
}

export interface InventoryItem {
  ingredientId: IngredientId;
  quantity: number;
}

export type CustomerTypeId = 'student' | 'office_worker' | 'food_lover' | 'neighborhood';

export interface CustomerType {
  id: CustomerTypeId;
  name: string;
  description: string;
  spriteKey: string;
  patienceSeconds: number; // Thời gian chờ tối đa
  tipRate: number; // Tỉ lệ tiền boa
  favoriteRecipeIds: RecipeId[];
}

export type CustomerState =
  | 'spawning'
  | 'walking_to_table'
  | 'waiting_to_order'
  | 'ordered'
  | 'eating'
  | 'paying'
  | 'leaving';

export interface CustomerInstance {
  id: string;
  typeId: CustomerTypeId;
  name: string;
  tableIndex: number;
  orderRecipeId?: RecipeId;
  state: CustomerState;
  patienceRemaining: number;
  maxPatience: number;
}

export interface TableSpot {
  index: number;
  x: number;
  y: number;
  chairX: number;
  chairY: number;
  isOccupied: boolean;
  customerId?: string;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  effect: {
    type: 'add_table' | 'cook_speed' | 'storage_capacity' | 'attract_customers';
    value: number;
  };
}

export interface Employee {
  id: string;
  name: string;
  role: 'cook' | 'server';
  avatar: string;
  salaryPerDay: number;
  speed: number; // Hệ số tốc độ
  hired: boolean;
  description: string;
}

export interface DailySummary {
  day: number;
  totalRevenue: number;
  ingredientCost: number;
  salariesPaid: number;
  netProfit: number;
  servedCustomers: number;
  lostCustomers: number;
  reputationChange: number;
}

export interface PlayerStats {
  name: string;
  energy: number; // 0 - 100
  maxEnergy: number;
  cookingLevel: number;
  cookingExp: number;
}

export interface GameSaveState {
  version: string;
  playerId: string;
  day: number;
  gameTimeMinutes: number; // 360 (06:00) đến 1320 (22:00)
  money: number;
  reputation: number;
  player: PlayerStats;
  inventory: Record<IngredientId, number>;
  unlockedRecipes: RecipeId[];
  purchasedUpgrades: Record<string, number>;
  hiredEmployees: string[];
  storageCapacity: number;
  historySummaries: DailySummary[];
  lastSavedAt: string;
}
