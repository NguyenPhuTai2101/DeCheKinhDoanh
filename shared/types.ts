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
  | 'coffee'
  // Phở
  | 'pho_noodle'
  | 'beef'
  | 'beef_broth'
  | 'quay'
  | 'spring_onion'
  // Bún Bò & Bún Riêu
  | 'bun_noodle'
  | 'crab_paste'
  | 'bun_broth'
  | 'tofu'
  | 'tomato'
  // Bò Né / Beefsteak
  | 'butter'
  | 'potato'
  | 'pepper_sauce'
  // Cơm Tấm
  | 'broken_rice'
  | 'pork_rib'
  | 'scallion_oil';

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
  | 'banh_mi_xiu_mai'
  | 'tra_sua'
  | 'cafe_sua'
  | 'tra_dao'
  // Phở
  | 'pho_tai'
  | 'pho_nam'
  | 'pho_dac_biet'
  // Bún
  | 'bun_bo_hue'
  | 'bun_rieu_cua'
  // Beefsteak
  | 'bo_ne_op_la'
  | 'beefsteak_sot_tieu'
  // Cơm Tấm
  | 'com_tam_suon'
  | 'com_tam_suon_bi_cha';

export type RestaurantTypeId = 'banh_mi' | 'pho' | 'bun' | 'beefsteak' | 'com_tam';

export interface RestaurantType {
  id: RestaurantTypeId;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  tagline: string;
  starterDescription: string;
  unlockCost: number;
  requiredReputation: number;
  themeColor: string;
  accentColor: string;
  equipmentName: string;
  equipmentIcon: string;
  equipmentType: 'board' | 'pho_pot' | 'bun_pot' | 'steak_pan' | 'grill';
  primaryRecipeIds: RecipeId[];
  allowedIngredientIds: IngredientId[];
}

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
  neighborId?: NeighborId;
  neighborGreeting?: string;
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

export type EmployeePersonality =
  | 'hardworking'
  | 'friendly'
  | 'ambitious'
  | 'creative'
  | 'extrovert';

export type EmployeeRole = 'cook' | 'server' | 'manager';

export type CareerTier = 'intern' | 'junior' | 'senior' | 'shift_leader' | 'store_manager';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  careerTier: CareerTier;
  avatar: string;
  personality: EmployeePersonality;
  personalityDesc: string;
  salaryPerDay: number;
  speed: number;
  cookingSkill: number;
  serviceSkill: number;
  mood: number; // 0 - 100
  stress: number; // 0 - 100
  loyalty: number; // 0 - 100
  experience: number;
  hired: boolean;
  description: string;
}

export type ShopThemeId = 'sakura_pink' | 'mint_cafe' | 'lavender_dream' | 'cream_bakery';

export interface ShopTheme {
  id: ShopThemeId;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  unlocked: boolean;
  cost: number;
}

export interface DecorationItem {
  id: string;
  name: string;
  category: 'wall' | 'plant' | 'lighting' | 'furniture';
  icon: string;
  cost: number;
  cozyPoints: number; // Điểm thẩm mỹ Cozy
  bonusEffectDesc: string;
  owned: boolean;
  equipped: boolean;
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

// === V0.4 - V0.5: ĐẾ CHẾ VỈA HÈ (decheviahe.com) ===

export type BusinessStageId = 'cart' | 'corner' | 'awning' | 'eatery' | 'empire';

export interface BusinessStage {
  id: BusinessStageId;
  name: string;
  tagline: string;
  icon: string;
  maxTables: number;
  customerRateMs: number;
  cost: number;
  requiredReputation: number;
  description: string;
}

export type NeighborId = 'bac_ba' | 'co_bay' | 'chu_nam' | 'be_bong' | 'chi_lan';

export interface NeighborStorySecret {
  level: number;
  title: string;
  story: string;
}

export interface NeighborData {
  id: NeighborId;
  name: string;
  nickname: string;
  role: string;
  avatar: string;
  gender: 'male' | 'female';
  favoriteDishId: RecipeId;
  dialogues: Record<number, string>; // 1 -> 5 sao
  secrets: NeighborStorySecret[];
  perkDescription: string;
}

export interface NeighborRelationship {
  level: number; // 1 đến 5 tim
  intimacyExp: number;
  unlockedSecretIds: number[];
  lastInteractedDay: number;
}

export interface StreetEventChoice {
  text: string;
  cost?: number;
  gainMoney?: number;
  gainReputation?: number;
  gainEnergy?: number;
  outcomeText: string;
}

export interface StreetEvent {
  id: string;
  title: string;
  icon: string;
  tag?: string;
  description: string;
  choices: StreetEventChoice[];
}

export interface LotteryTicket {
  ticketNumber: string; // 2 chữ số (ví dụ: '68')
  betType?: 'de' | 'lo'; // 'de': trúng x70, 'lo': bao lô x3.5
  boughtDay: number;
  cost: number;
  drawnNumber?: string;
  prizeType?: 'jackpot' | 'prize2' | 'prize3' | 'none';
  prizeAmount?: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  recipeId: RecipeId;
  quantity: number;
  rewardMoney: number;
  rewardTip: number;
  timeRemainingSeconds: number;
  maxTimeSeconds: number;
  status: 'pending' | 'ready' | 'delivering';
}

export interface ActiveOrder {
  id: string;
  tableIndex: number;
  typeId: CustomerTypeId;
  neighborId?: NeighborId;
  dialogue?: string;
  recipeId: RecipeId;
  patienceRemaining: number;
  maxPatience: number;
  state: 'waiting' | 'ready' | 'eating' | 'leaving';
}

export interface GameSaveState {
  version: string;
  playerId: string;
  shopName: string;
  day: number;
  gameTimeMinutes: number; // 360 (06:00) đến 1320 (22:00)
  money: number;
  reputation: number;
  player: PlayerStats;
  inventory: Record<IngredientId, number>;
  unlockedRecipes: RecipeId[];
  purchasedUpgrades: Record<string, number>;
  hiredEmployees: string[];
  employeeDetails: Record<string, Employee>;
  activeTheme: ShopThemeId;
  ownedThemes: ShopThemeId[];
  ownedDecorations: string[];
  equippedDecorations: string[];
  storageCapacity: number;
  historySummaries: DailySummary[];
  lastSavedAt: string;

  // Thuộc tính mới V0.4: Đế Chế Vỉa Hè (decheviahe.com)
  businessStage: BusinessStageId;
  neighbors: Record<NeighborId, NeighborRelationship>;
  activeLotteryTicket?: LotteryTicket | null;
  lotteryHistory: LotteryTicket[];
  currentEvent?: StreetEvent | null;
  deliveryOrders?: DeliveryOrder[];
  totalDeliveriesCompleted?: number;

  // V0.6: Hệ thống Chuỗi Chi Nhánh Đa Ẩm Thực
  activeRestaurantId?: RestaurantTypeId;
  unlockedRestaurants?: RestaurantTypeId[];
  hasChosenStarter?: boolean;
}


