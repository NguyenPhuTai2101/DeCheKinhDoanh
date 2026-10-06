// Kiểu dữ liệu dùng chung giữa Client và Server

export type IngredientId =
  | 'bread'
  | 'egg'
  | 'pork'
  | 'pate'
  | 'cucumber'
  | 'herb'
  | 'cha_lua'
  | 'pickles'
  | 'chili'
  | 'mayo'
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

export type ShelfLifeCategory = 'fresh' | 'semi_fresh' | 'dry';

export interface Ingredient {
  id: IngredientId;
  name: string;
  icon: string;
  category: 'bakery' | 'meat' | 'veg' | 'beverage';
  cost: number; // Giá mua từ chợ (VND)
  shelfLifeCategory?: ShelfLifeCategory; // Hạn dùng: fresh (1-2 ngày), semi_fresh (3-7 ngày), dry (không hỏng)
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

export interface BranchTier {
  level: number;
  name: string;
  tagline: string;
  cost: number;
  requiredReputation: number;
  requiredStaff: number;
  bonusMultiplier: number;
  description: string;
}

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
  requiredStaffCount?: number;
  branchTiers?: BranchTier[];
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

export interface ShopUpgradeTier {
  level: number;
  title: string;
  cost: number;
  description: string;
  effectValue: number;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  category?: 'kitchen' | 'storage' | 'marketing' | 'comfort' | 'service' | 'logistics';
  tiers?: ShopUpgradeTier[];
  effect: {
    type:
      | 'add_table'
      | 'cook_speed'
      | 'storage_capacity'
      | 'attract_customers'
      | 'customer_patience'
      | 'tip_rate'
      | 'delivery_bonus'
      | 'reputation_boost';
    value: number;
  };
}

export type EmployeePersonality =
  | 'hardworking'
  | 'friendly'
  | 'ambitious'
  | 'creative'
  | 'extrovert';

export type EmployeeRole = 'cook' | 'server' | 'manager' | 'shopper';

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
  hiringCost?: number; // Tiền thuê / ký hợp đồng ban đầu (mắc cho nhân viên đi chợ)
  marketSkill?: number; // Kỹ năng đi chợ: mặc cả & chiết khấu giá sỉ (0 - 100)
  speed: number;
  cookingSkill: number;
  serviceSkill: number;
  mood: number; // 0 - 100
  stress: number; // 0 - 100
  loyalty: number; // 0 - 100
  experience: number;
  hired: boolean;
  description: string;
  assignedRestaurantId?: RestaurantTypeId;
  trainingCount?: number;
  lastWorkedDay?: number;
  daysWorked?: number;
  mistakes?: number;
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

export interface DailyFinance {
  revenue: number;
  branchRevenue?: number;
  cogs: number; // Giá vốn hàng bán thực tế theo giá thị trường
  grossProfit: number;
  payroll: number;
  rent: number;
  utilities: number;
  marketing: number;
  deliveryFees: number;
  eventExpenses: number;
  otherIncome: number;
  otherExpense: number;
  tips?: number;
  netProfit: number;
}

export interface BranchDailyFinance {
  deliveryFees?: number;
  restaurantId: RestaurantTypeId;
  revenue: number;
  cogs: number;
  grossProfit: number;
  payroll: number;
  rent: number;
  utilities: number;
  marketing: number;
  netProfit: number;
  customersServed: number;
}

export interface RestaurantMenuSettings {
  activeRecipes: RecipeId[];
  prices: Partial<Record<RecipeId, number>>;
}

export interface ShopperPolicy {
  autoRestock: boolean;
  autoBuyEnabled?: boolean;
  minStock: number;
  targetStock: number;
  maxPriceMultiplier: number;
}

export interface BusinessMetrics {
  lifetimeRevenue: number;
  lifetimeProfit: number;
  totalCustomers: number;
  fiveStarReviews: number;
  averageRating: number;
}

export type DayPhase = 'morning_prep' | 'operating' | 'night_audit';

export type FinancialHealthLevel = 'stable' | 'stress' | 'deficit' | 'crisis' | 'bankrupt';

export type BottleneckType = 'demand' | 'capacity' | 'inventory';

export interface BottleneckAnalysis {
  type: BottleneckType;
  title: string;
  description: string;
  recommendation: string;
  demandLoss: number;
  capacityLoss: number;
  stockLoss: number;
}

export interface MorningBriefing {
  day: number;
  weather: 'sunny' | 'rainy' | 'breezy';
  weatherHeadline: string;
  marketHeadline: string;
  marketTrendDescription: string;
  warningAlert?: string;
  dailyAdvice: string;
}

export interface DailySummary {
  day: number;
  totalRevenue: number;
  cogs: number;
  ingredientCost: number; // Giữ để tương thích ngược
  salariesPaid: number;
  wages?: number;
  staffSalaries?: number;
  rentPaid: number;
  rent?: number;
  utilitiesPaid: number;
  utilities?: number;
  marketingPaid: number;
  grossProfit: number;
  netProfit: number;
  servedCustomers: number;
  lostCustomers: number;
  reputationChange: number;
  averageRating: number;
  fameGain: number;
  insights?: string[];
  smartInsights?: string[];
  branchFinances?: Partial<Record<RestaurantTypeId, BranchDailyFinance>>;

  // V3: Phân tích Nút cổ chai, Dự báo dòng tiền & Sức khỏe tài chính
  primaryBottleneck?: BottleneckType;
  bottleneckAnalysis?: BottleneckAnalysis;
  projectedCashflow3Days?: number[];
  financialHealth?: FinancialHealthLevel;
  spoilageCost?: number;
  spoilageDetails?: Array<{ ingredientId: IngredientId; name: string; count: number; cost: number }>;
  rollingReputation?: number;
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
  maxRestaurants: number; // Hạn mức số lượng chi nhánh được phép sở hữu
  maxStaff: number; // Hạn mức tối đa số lượng nhân sự được phép tuyển dụng
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
  status: 'pending' | 'cooking' | 'ready' | 'delivering';
  workRemainingSeconds?: number;
  chefId?: string;
  chefName?: string;
  cogs?: number;
  shippingFee?: number;
}

export type DishMatchGrade = 'perfect' | 'minor' | 'wrong' | 'allergy';

export interface ActiveOrder {
  id: string;
  tableIndex: number;
  typeId: CustomerTypeId;
  neighborId?: NeighborId;
  dialogue?: string;
  customTag?: string; // Ghi chú order ngắn: "Không hành", "2 trứng", "Nhiều bánh phở", "Nước béo"...
  removedIngredients?: IngredientId[]; // Nguyên liệu khách yêu cầu bỏ (ví dụ: không hành/rau)
  allergyIngredients?: IngredientId[];
  extraIngredients?: IngredientId[]; // Nguyên liệu khách yêu cầu thêm (ví dụ: thêm trứng)
  orderNotes?: string[]; // Danh sách yêu cầu chi tiết của khách
  preparedIngredients?: IngredientId[]; // Nguyên liệu người chơi hoặc đầu bếp đã nạp vào đĩa
  cogsBooked?: boolean;
  matchGrade?: DishMatchGrade; // Kết quả đánh giá độ khớp (perfect, minor, wrong, allergy)
  matchFeedback?: string; // Lời phản hồi trực tiếp của khách khi ăn
  recipeId: RecipeId;
  patienceRemaining: number;
  maxPatience: number;
  state: 'waiting' | 'cooking' | 'ready' | 'eating' | 'paying' | 'leaving';
  cookingProgress?: number;
  chefId?: string;
  chefName?: string;
  serverId?: string;
  serverName?: string;
  eatingTimer?: number;
  maxEatingTimer?: number;
  calculatedTip?: number;
}

export interface GameSaveState {
  operatingSnapshot?: {
    activeOrders: ActiveOrder[];
    isShopOpen: boolean;
    dailyCost: number;
    dailyCustomersServed: number;
    dailyCustomersLost: number;
    lossReasons?: { inventory: number; capacity: number; demand: number };
    dailyEventsCount: number;
    lastEventTimeMinutes: number;
    isLotteryDrawnToday: boolean;
    hasIncidentTriggeredToday: boolean;
    activeIncident: SurpriseIncident | null;
  };
  cashJournal?: Array<{ day: number; minute: number; label: string; amount: number; balance: number }>;
  soundMuted?: boolean;
  lastDeliveryRequestMinute?: number;
  incidentHistory?: string[];
  streetEventHistory?: string[];
  loanRepaymentPerDay?: number;
  settledDay?: number;
  version: string;
  playerId: string;
  shopName: string;
  day: number;
  gameTimeMinutes: number; // 360 (06:00) đến 1320 (22:00)
  money: number;
  reputation: number;
  player: PlayerStats;
  inventory: Partial<Record<IngredientId, number>>; // Kho nguyên liệu của quán đang kích hoạt
  restaurantInventories?: Partial<Record<RestaurantTypeId, Partial<Record<IngredientId, number>>>>; // Kho riêng biệt cho từng thương hiệu quán
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
  stageUpgrades?: Partial<Record<BusinessStageId, Record<string, number>>>;
  neighbors: Record<NeighborId, NeighborRelationship>;
  activeLotteryTicket?: LotteryTicket | null;
  lotteryHistory: LotteryTicket[];
  currentEvent?: StreetEvent | null;
  deliveryOrders?: DeliveryOrder[];
  totalDeliveriesCompleted?: number;

  // V0.6: Hệ thống Chuỗi Chi Nhánh Đa Ẩm Thực & Môi Trường Mô Phỏng
  activeRestaurantId?: RestaurantTypeId;
  unlockedRestaurants?: RestaurantTypeId[];
  branchLevels?: Record<RestaurantTypeId, number>;
  hasChosenStarter?: boolean;
  weather?: 'sunny' | 'rainy' | 'breezy';
  marketSpecial?: {
    ingredientId: IngredientId;
    discountPercent: number;
    newsText: string;
  } | null;

  // === V2: KINH TẾ CHUYÊN SÂU & ĐẾ CHẾ KINH DOANH ===
  rating?: number; // Điểm chất lượng dịch vụ hiện tại (0 - 100)
  fame?: number; // Danh tiếng tích lũy (Fame >= 0, mở rộng không giới hạn)
  dailyFinance?: DailyFinance;
  branchFinances?: Partial<Record<RestaurantTypeId, BranchDailyFinance>>;
  menuSettings?: Partial<Record<RestaurantTypeId, RestaurantMenuSettings>>;
  marketPrices?: Partial<Record<IngredientId, number>>;
  shopperPolicy?: ShopperPolicy;
  businessMetrics?: BusinessMetrics;

  // === V3: 3 PHA NGÀY, ORDER TÙY BIẾN, SỨC KHỎE TÀI CHÍNH & DI SẢN ===
  dayPhase?: DayPhase; // 'morning_prep' | 'operating' | 'night_audit'
  morningBriefing?: MorningBriefing;
  financialHealth?: FinancialHealthLevel;
  consecutiveCrisisDays?: number;
  loanDebt?: number;
  rollingRatings?: number[]; // Lịch sử đánh giá 14 ngày gần nhất
  legacyPoints?: number; // Điểm di sản tích lũy sau các lần chơi / phá sản
  legacyPerks?: string[]; // Các đặc quyền đã mở bằng điểm di sản
  ingredientFreshness?: Partial<Record<IngredientId, number>>; // Độ tươi nguyên liệu (0 - 100)
  fridgeUpgradeLevel?: number; // Cấp độ tủ lạnh chống hao hụt nguyên liệu tươi
}

// ============================================================================
// HỆ THỐNG BIẾN CỐ BẤT NGỜ ĐỜI THỰC (SURPRISE INCIDENTS & POPUPS)
// ============================================================================

export type IncidentType = 'penalty' | 'reward';

export interface SurpriseIncident {
  id: string;
  type: IncidentType;
  icon: string;              // Emoji kết hợp, ví dụ "⚖️ ❌", "🚔 ⚠️", "💵 🎉", "🐱 🥩"
  title: string;             // Tiêu đề in hoa giật gân, ví dụ "VU KHỐNG - TỐ CÁO SAI SỰ THẬT!"
  story: string;             // Đoạn trích câu chuyện tình huống đời thường
  behaviorLabel: string;     // Dòng "Hành vi / Tình huống / Cơ duyên"
  moneyChange: number;       // Số tiền trừ (âm) hoặc cộng (dương) (VND)
  reputationChange: number;  // Số điểm sao / uy tín thay đổi (âm hoặc dương)
  reputationNote: string;    // Dòng ghi chú sao: "Bị giảm điểm sao (-2 đánh giá 1 sao...)"
  footerNote?: string;       // Ghi chú dưới cùng trong ngoặc đơn
  actionButtonText: string;  // Nhãn nút bấm: "Chấp hành & Tiếp tục", "Hoan hỉ & Tiếp tục", v.v.
}



