/**
 * BỘ DỮ LIỆU CẤU HÌNH MÔ PHỎNG, KINH TẾ & HỆ THỐNG CÂU THOẠI KHÁCH HÀNG
 * Dành cho Game "Đế Chế Kinh Doanh Vỉa Hè" (decheviahe.com)
 * Thiết kế chuẩn theo quy tắc: Áp lực chi phí cố định, Nút cổ chai (Cầu - Năng lực - Kho),
 * Đa dạng tính cách khách hàng, Đột biến rủi ro & Review chân thực ẩm thực Việt Nam.
 */

import { RecipeId, RestaurantTypeId, SurpriseIncident } from './types';

// ============================================================================
// 1. DỮ LIỆU PHÂN KHÚC KHÁCH HÀNG (CUSTOMER SEGMENTS)
// ============================================================================

export type CustomerSegmentId =
  | 'student'          // Học sinh, sinh viên
  | 'blue_collar'      // Công nhân, thợ thuyền, bác tài xế
  | 'office_worker'    // Dân văn phòng, công sở
  | 'tourist'          // Khách du lịch, khách phương xa
  | 'foodie_gourmet'   // Khách sành ăn, food reviewer, TikToker
  | 'neighbor_regular' // Khách quen trong xóm, cô chú lớn tuổi
  | 'night_shifter';   // Khách ăn đêm, tăng ca, thanh niên chạy show

export interface CustomerSegmentProfile {
  id: CustomerSegmentId;
  name: string;
  badge: string;
  description: string;
  icon: string;
  // Khung giờ ưa thích (phút trong ngày: 360 = 06:00, 720 = 12:00, 1140 = 19:00, 1320 = 22:00)
  peakHours: { startMinutes: number; endMinutes: number }[];
  patienceBaseSeconds: number;     // Độ kiên nhẫn cơ bản (giây)
  priceSensitivity: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'; // Nhạy cảm về giá
  priceSensitivityFactor: number;  // 1.5 = cực nhạy (giá tăng là bỏ đi), 0.6 = ít quan tâm giá
  budgetPerMeal: { min: number; max: number }; // Ngân sách chấp nhận trả (VND)
  cleanlinessExpectation: number;  // Yêu cầu vệ sinh sạch sẽ (1 - 5 sao)
  tipProbability: number;          // Tỉ lệ cho tiền tip (0.0 - 1.0)
  tipMultiplier: number;           // Hệ số nhân tiền boa (ví dụ 1.5x)
  favoriteCategories: ('food' | 'drink' | 'special')[];
  rushHourTendency: 'always_rushing' | 'normal' | 'relaxed';
}

export const CUSTOMER_SEGMENTS: Record<CustomerSegmentId, CustomerSegmentProfile> = {
  student: {
    id: 'student',
    name: 'Học Sinh - Sinh Viên',
    badge: '🎒 Nhóm Học Đường',
    description: 'Tụ tập giờ tan học, hầu bao eo hẹp nhưng cực đông đúc. Thích món no lâu, nhiều trà sữa, nhạy giá.',
    icon: '🎒',
    peakHours: [
      { startMinutes: 400, endMinutes: 460 },   // 06:40 - 07:40 (Ăn sáng vội vào lớp)
      { startMinutes: 690, endMinutes: 780 },   // 11:30 - 13:00 (Nghỉ trưa)
      { startMinutes: 1000, endMinutes: 1080 }, // 16:40 - 18:00 (Tan học)
    ],
    patienceBaseSeconds: 35,
    priceSensitivity: 'very_high',
    priceSensitivityFactor: 1.6,
    budgetPerMeal: { min: 15000, max: 35000 },
    cleanlinessExpectation: 2.5,
    tipProbability: 0.1,
    tipMultiplier: 0.5,
    favoriteCategories: ['food', 'drink'],
    rushHourTendency: 'always_rushing',
  },
  blue_collar: {
    id: 'blue_collar',
    name: 'Công Nhân & Bác Tài',
    badge: '🛵 Lao Động Chăm Chỉ',
    description: 'Tài xế công nghệ, công nhân xưởng, thợ xây. Cần bữa ăn chắc bụng, giàu đạm, phục vụ nhanh.',
    icon: '🛵',
    peakHours: [
      { startMinutes: 360, endMinutes: 450 },   // 06:00 - 07:30 (Sáng sớm xuất hành)
      { startMinutes: 670, endMinutes: 750 },   // 11:10 - 12:30 (Cơm trưa nạp năng lượng)
    ],
    patienceBaseSeconds: 40,
    priceSensitivity: 'high',
    priceSensitivityFactor: 1.3,
    budgetPerMeal: { min: 25000, max: 45000 },
    cleanlinessExpectation: 2.8,
    tipProbability: 0.25,
    tipMultiplier: 0.8,
    favoriteCategories: ['food'],
    rushHourTendency: 'always_rushing',
  },
  office_worker: {
    id: 'office_worker',
    name: 'Dân Văn Phòng - Công Sở',
    badge: '💼 Công Sở Hiện Đại',
    description: 'Chỉ có 45-60 phút nghỉ trưa. Đòi hỏi tốc độ cao, ghét mùi dầu mỡ bám quần áo, thích đồ uống đi kèm.',
    icon: '💼',
    peakHours: [
      { startMinutes: 420, endMinutes: 500 },   // 07:00 - 08:20 (Mua vội mang đi)
      { startMinutes: 700, endMinutes: 800 },   // 11:40 - 13:20 (Giờ cơm trưa công sở)
    ],
    patienceBaseSeconds: 32, // Rất vội! Chờ lâu là hủy đơn
    priceSensitivity: 'medium',
    priceSensitivityFactor: 0.95,
    budgetPerMeal: { min: 35000, max: 75000 },
    cleanlinessExpectation: 4.0,
    tipProbability: 0.45,
    tipMultiplier: 1.2,
    favoriteCategories: ['food', 'drink'],
    rushHourTendency: 'always_rushing',
  },
  tourist: {
    id: 'tourist',
    name: 'Khách Du Lịch - Phương Xa',
    badge: '📸 Du Khách Trải Nghiệm',
    description: 'Thích trải nghiệm ẩm thực vỉa hè bản địa. Rất chịu chi tiền tip nếu phục vụ thân thiện, nhưng soi kỹ vệ sinh.',
    icon: '📸',
    peakHours: [
      { startMinutes: 480, endMinutes: 570 },   // 08:00 - 09:30 (Ăn sáng thư thái)
      { startMinutes: 1080, endMinutes: 1260 }, // 18:00 - 21:00 (Khám phá phố đêm)
    ],
    patienceBaseSeconds: 55,
    priceSensitivity: 'very_low',
    priceSensitivityFactor: 0.5,
    budgetPerMeal: { min: 50000, max: 150000 },
    cleanlinessExpectation: 4.6,
    tipProbability: 0.75,
    tipMultiplier: 2.2,
    favoriteCategories: ['food', 'special'],
    rushHourTendency: 'relaxed',
  },
  foodie_gourmet: {
    id: 'foodie_gourmet',
    name: 'Khách Sành Ăn & Reviewer',
    badge: '⭐ Thực Thần Kỹ Tính',
    description: 'Đến vì danh tiếng quán. Đánh giá cực kỳ khắt khe về vị giác, độ tươi của nguyên liệu và quy chuẩn bưng bê.',
    icon: '⭐',
    peakHours: [
      { startMinutes: 510, endMinutes: 600 },   // 08:30 - 10:00 (Thưởng thức tinh tế)
      { startMinutes: 1110, endMinutes: 1230 }, // 18:30 - 20:30
    ],
    patienceBaseSeconds: 48,
    priceSensitivity: 'low',
    priceSensitivityFactor: 0.7,
    budgetPerMeal: { min: 60000, max: 200000 },
    cleanlinessExpectation: 4.8,
    tipProbability: 0.6,
    tipMultiplier: 2.5,
    favoriteCategories: ['food', 'special'],
    rushHourTendency: 'normal',
  },
  neighbor_regular: {
    id: 'neighbor_regular',
    name: 'Khách Quen Xóm Giềng',
    badge: '🌸 Tình Nghĩa Hàng Xóm',
    description: 'Bác Ba, Chú Bảy, Bé Bống... Ăn quen thành thói quen. Sẵn sàng chờ đợi, động viên chủ quán ngày mưa.',
    icon: '🌸',
    peakHours: [
      { startMinutes: 380, endMinutes: 540 },   // 06:20 - 09:00
      { startMinutes: 980, endMinutes: 1100 },  // 16:20 - 18:20
    ],
    patienceBaseSeconds: 65,
    priceSensitivity: 'high',
    priceSensitivityFactor: 1.1,
    budgetPerMeal: { min: 20000, max: 50000 },
    cleanlinessExpectation: 3.0,
    tipProbability: 0.35,
    tipMultiplier: 1.0,
    favoriteCategories: ['food', 'drink'],
    rushHourTendency: 'relaxed',
  },
  night_shifter: {
    id: 'night_shifter',
    name: 'Cú Đêm & Tăng Ca',
    badge: '🌙 Thực Khách Phố Đêm',
    description: 'Thanh niên đi chơi đêm, nhân viên ca kíp. Đói cồn cào lúc tối muộn, thèm tô phở bún nóng hổi hoặc bánh mì giòn.',
    icon: '🌙',
    peakHours: [
      { startMinutes: 1200, endMinutes: 1320 }, // 20:00 - 22:00+
    ],
    patienceBaseSeconds: 42,
    priceSensitivity: 'medium',
    priceSensitivityFactor: 0.85,
    budgetPerMeal: { min: 30000, max: 70000 },
    cleanlinessExpectation: 3.2,
    tipProbability: 0.4,
    tipMultiplier: 1.3,
    favoriteCategories: ['food', 'drink'],
    rushHourTendency: 'normal',
  },
};

// ============================================================================
// 2. CHI PHÍ MẶT BẰNG & CHI PHÍ CỐ ĐỊNH THEO 5 CẤP SỰ NGHIỆP
// ============================================================================

export interface StagePremisesConfig {
  stageId: 'cart' | 'corner' | 'awning' | 'eatery' | 'empire';
  title: string;
  subtitle: string;
  depositCost: number;        // Tiền đặt cọc mặt bằng ban đầu (hoàn trả nếu chuyển đi)
  dailyRentCost: number;      // Tiền thuê mặt bằng trừ mỗi ngày
  dailyUtilityCost: number;   // Tiền điện, nước, gas nấu nướng
  dailyWasteAndFee: number;   // Phí vệ sinh môi trường, rác thải
  dailyTaxEstimate: number;   // Thuế khoán / thuế GTGT theo quy mô
  maxBranchesAllowed: number; // Số chi nhánh được quản lý
  maxStaffAllowed: number;    // Giới hạn nhân sự
  baseCapacity: number;       // Sức chứa kho mặc định
  breakEvenDailyRevenue: number; // Doanh thu hòa vốn ước tính / ngày
}

export const PREMISES_CONFIG: Record<string, StagePremisesConfig> = {
  cart: {
    stageId: 'cart',
    title: 'Xe Đẩy Rong Vỉa Hè',
    subtitle: 'Khởi nghiệp vốn mỏng, cơ động, bán trước cổng trường/ngõ chợ',
    depositCost: 0,
    dailyRentCost: 0,
    dailyUtilityCost: 10000,     // Bình gas mini + 1 bình ắc quy
    dailyWasteAndFee: 5000,      // Phí vệ sinh khu phố
    dailyTaxEstimate: 0,         // Chưa phải nộp thuế
    maxBranchesAllowed: 1,
    maxStaffAllowed: 2,
    baseCapacity: 100,
    breakEvenDailyRevenue: 60000,
  },
  corner: {
    stageId: 'corner',
    title: 'Góc Phố Cố Định',
    subtitle: 'Có chỗ ngồi vỉa hè kê vài bộ bàn ghế nhựa, khách quen ghé đông',
    depositCost: 1000000,        // Cọc chủ nhà cho thuê vỉa hè
    dailyRentCost: 45000,        // 1.350.000đ/tháng
    dailyUtilityCost: 20000,     // Điện câu nhờ nhà dân + gas nấu
    dailyWasteAndFee: 8000,      // Phí rác thải & an ninh trật tự
    dailyTaxEstimate: 0,
    maxBranchesAllowed: 1,
    maxStaffAllowed: 4,
    baseCapacity: 160,
    breakEvenDailyRevenue: 220000,
  },
  awning: {
    stageId: 'awning',
    title: 'Tiệm Mái Hiên Kiên Cố',
    subtitle: 'Có mái che di động, tủ kính ngăn bụi, điện nước đồng hồ riêng',
    depositCost: 5000000,        // Cọc 1 tháng tiền nhà
    dailyRentCost: 170000,       // 5.100.000đ/tháng
    dailyUtilityCost: 55000,     // Tủ mát trữ đồ, quạt máy, đèn LED, gas công nghiệp
    dailyWasteAndFee: 20000,     // Rác sinh hoạt + quỹ bảo an đô thị
    dailyTaxEstimate: 25000,     // Thuế môn bài & thuế khoán kinh doanh cá thể
    maxBranchesAllowed: 2,
    maxStaffAllowed: 7,
    baseCapacity: 250,
    breakEvenDailyRevenue: 750000,
  },
  eatery: {
    stageId: 'eatery',
    title: 'Nhà Hàng Mặt Tiền',
    subtitle: 'Cửa hàng khang trang, điều hòa mát lạnh, bếp riêng biệt đạt chuẩn',
    depositCost: 25000000,       // Cọc 2 tháng hợp đồng thuê dài hạn
    dailyRentCost: 750000,       // 22.500.000đ/tháng mặt bằng đẹp
    dailyUtilityCost: 180000,    // Điện điều hòa 3 pha, tủ đông trữ sỉ, nước máy lớn
    dailyWasteAndFee: 45000,     // Hợp đồng vệ sinh môi trường đô thị
    dailyTaxEstimate: 90000,     // Thuế suất doanh thu ăn uống quy định
    maxBranchesAllowed: 4,
    maxStaffAllowed: 12,
    baseCapacity: 400,
    breakEvenDailyRevenue: 2500000,
  },
  empire: {
    stageId: 'empire',
    title: 'Chuỗi Đế Chế Ẩm Thực',
    subtitle: 'Vận hành 5 thương hiệu ẩm thực danh tiếng cùng kho phân phối sỉ trung tâm',
    depositCost: 80000000,       // Tổng tiền cọc các chi nhánh chuỗi
    dailyRentCost: 2800000,      // Tổng thuê mặt bằng các chi nhánh đắc địa
    dailyUtilityCost: 650000,    // Hệ thống thiết bị bếp & kho lạnh trung tâm
    dailyWasteAndFee: 150000,    // Phí dịch vụ toàn hệ thống
    dailyTaxEstimate: 380000,    // Thuế doanh nghiệp thương mại dịch vụ
    maxBranchesAllowed: 5,
    maxStaffAllowed: 20,
    baseCapacity: 650,
    breakEvenDailyRevenue: 8500000,
  },
};

// ============================================================================
// 3. CHI PHÍ NHÂN SỰ & TÍNH CÁCH ĐẶC TRƯNG (STAFF ECONOMICS & TRAITS)
// ============================================================================

export interface StaffRoleProfile {
  role: 'cook' | 'server' | 'manager' | 'shopper';
  roleName: string;
  roleIcon: string;
  baseDailySalary: number;     // Lương cơ bản/ngày
  hiringContractFee: number;   // Phí hợp đồng tuyển dụng ban đầu
  overtimeHourlyCost: number;  // Chi phí trả khi tăng ca quá 18:00
  trainingCostPerLevel: number;// Chi phí gửi đi học nghề nâng tay nghề
  fatiguePerRushHour: number;  // Mức độ tiêu hao thể lực sau 1 đợt cao điểm (0 - 100)
}

export const STAFF_ROLE_DEFAULTS: Record<string, StaffRoleProfile> = {
  cook: {
    role: 'cook',
    roleName: 'Đầu Bếp / Phụ Bếp',
    roleIcon: '👨‍🍳',
    baseDailySalary: 70000,
    hiringContractFee: 50000,
    overtimeHourlyCost: 15000,
    trainingCostPerLevel: 30000,
    fatiguePerRushHour: 15,
  },
  server: {
    role: 'server',
    roleName: 'Nhân Viên Phục Vụ / Chạy Bàn',
    roleIcon: '🏃',
    baseDailySalary: 55000,
    hiringContractFee: 30000,
    overtimeHourlyCost: 12000,
    trainingCostPerLevel: 20000,
    fatiguePerRushHour: 18,
  },
  shopper: {
    role: 'shopper',
    roleName: 'Chuyên Viên Đi Chợ Sỉ',
    roleIcon: '🛵',
    baseDailySalary: 95000,
    hiringContractFee: 1500000, // Thuê xe & ký cược vốn đi chợ mắc tiền
    overtimeHourlyCost: 20000,
    trainingCostPerLevel: 60000,
    fatiguePerRushHour: 10,
  },
  manager: {
    role: 'manager',
    roleName: 'Quản Lý Quán / Cửa Hàng Trưởng',
    roleIcon: '👩‍💼',
    baseDailySalary: 130000,
    hiringContractFee: 350000,
    overtimeHourlyCost: 25000,
    trainingCostPerLevel: 80000,
    fatiguePerRushHour: 8,
  },
};

export interface StaffTrait {
  id: string;
  name: string;
  icon: string;
  positive: boolean;
  description: string;
  effectSummary: string;
}

export const STAFF_TRAITS: Record<string, StaffTrait> = {
  early_bird: {
    id: 'early_bird',
    name: 'Dậy Sớm Năng Nổ',
    icon: '🌅',
    positive: true,
    description: 'Rất hào hứng vào ca sáng sớm, chuẩn bị nguyên liệu nhanh hơn 25%.',
    effectSummary: 'Tốc độ +25% trước 09:00 sáng',
  },
  speedy_hands: {
    id: 'speedy_hands',
    name: 'Tay Nhanh Thoăn Thoắt',
    icon: '⚡',
    positive: true,
    description: 'Thao tác dao thớt và quẹt bơ nướng bánh thuần thục bẩm sinh.',
    effectSummary: 'Tốc độ chế biến +15%',
  },
  charismatic: {
    id: 'charismatic',
    name: 'Duyên Dáng Hút Khách',
    icon: '💖',
    positive: true,
    description: 'Miệng chào tay làm, xởi lởi tươi cười khiến khách rất thích cho thêm tiền tip.',
    effectSummary: 'Tỉ lệ khách tip +30%',
  },
  haggler_master: {
    id: 'haggler_master',
    name: 'Bậc Thầy Mặc Cả',
    icon: '💰',
    positive: true,
    description: 'Biết mặt tất cả chủ vựa đầu mối, luôn ép được giá sỉ rẻ nhất chợ.',
    effectSummary: 'Chiết khấu mua nguyên liệu sỉ thêm 12%',
  },
  loyal_heart: {
    id: 'loyal_heart',
    name: 'Trung Thành Gắn Bó',
    icon: '🛡️',
    positive: true,
    description: 'Không bao giờ lung lay trước lời dụ dỗ chèo kéo của quán đối thủ.',
    effectSummary: 'Không bỏ việc khi quán ế khách',
  },
  forgetful: {
    id: 'forgetful',
    name: 'Não Cá Vàng',
    icon: '🧠',
    positive: false,
    description: 'Thỉnh thoảng quên bỏ ớt hoặc quên dặn bếp làm món không hành.',
    effectSummary: 'Có 5% xác suất làm nhầm yêu cầu của khách',
  },
  clumsy: {
    id: 'clumsy',
    name: 'Tay Chân Lóng Ngóng',
    icon: '🥣',
    positive: false,
    description: 'Thỉnh thoảng làm rơi đũa, vỡ bát đĩa khi bưng bê ca cao điểm.',
    effectSummary: 'Hao hụt 5.000đ tiền bát đĩa/ngày',
  },
  grumpy: {
    id: 'grumpy',
    name: 'Mặt Hay Nhăn Nhó',
    icon: '😤',
    positive: false,
    description: 'Khi mệt mỏi sẽ lộ vẻ bực dọc ra mặt, làm khách khó tính trừ điểm uy tín.',
    effectSummary: 'Giảm 10% điểm hài lòng nếu stress > 60',
  },
};

// ============================================================================
// 4. DANH MỤC GIÁ NÂNG CẤP & CÔNG CỤ PHÒNG NGỪA RỦI RO
// ============================================================================

export interface UpgradeCatalogItem {
  id: string;
  name: string;
  category: 'kitchen' | 'storage' | 'ambiance' | 'prevention' | 'marketing';
  categoryLabel: string;
  icon: string;
  level: number;
  maxLevel: number;
  cost: number;
  description: string;
  perkEffect: string;
  riskMitigation?: string; // Giảm thiểu biến cố rủi ro gì
}

export const UPGRADE_CATALOG: UpgradeCatalogItem[] = [
  // --- NHÓM 1: BẾP & THIẾT BỊ NẤU NƯỚNG ---
  {
    id: 'stove_turbo',
    name: 'Bếp Ga Khè Áp Suất Cao',
    category: 'kitchen',
    categoryLabel: 'Bếp & Thiết Bị',
    icon: '🔥',
    level: 1,
    maxLevel: 5,
    cost: 150000,
    description: 'Lửa xanh cực mạnh giúp ninh nước dùng và nấu chín phở bún nhanh vượt trội.',
    perkEffect: 'Tốc độ nấu món nước +18%',
  },
  {
    id: 'toaster_steam',
    name: 'Lò Nướng Điện Bánh Mì Hơi Nước',
    category: 'kitchen',
    categoryLabel: 'Bếp & Thiết Bị',
    icon: '🥖',
    level: 1,
    maxLevel: 4,
    cost: 120000,
    description: 'Bánh mì nướng 45 giây là giòn rụm từ trong ra ngoài, không bị cháy khét mép.',
    perkEffect: 'Tốc độ giòn vỏ bánh +25%, khách hài lòng +5%',
  },
  {
    id: 'iron_cast_plate',
    name: 'Bộ Chảo Gang Bò Né Chống Dính',
    category: 'kitchen',
    categoryLabel: 'Bếp & Thiết Bị',
    icon: '🍳',
    level: 1,
    maxLevel: 3,
    cost: 200000,
    description: 'Chảo gang dày giữ nhiệt cực lâu, bơ sôi xèo xèo thơm ngào ngạt hút khách qua đường.',
    perkEffect: 'Món bò né thơm ngon hơn, tăng 20% khả năng gọi thêm',
  },

  // --- NHÓM 2: KHO & BẢO QUẢN NGUYÊN LIỆU ---
  {
    id: 'fridge_inverter',
    name: 'Tủ Mát Inverter 4 Cánh',
    category: 'storage',
    categoryLabel: 'Kho & Bảo Quản',
    icon: '❄️',
    level: 1,
    maxLevel: 5,
    cost: 350000,
    description: 'Nhiệt độ ổn định từ 1 - 4°C, bảo quản rau thơm, thịt bò tươi ngon cả ngày.',
    perkEffect: 'Tăng sức chứa kho +35 slots, giảm 40% hỏng đồ tươi',
    riskMitigation: 'Chống biến cố ngộ độc thực phẩm do thịt biến chất',
  },
  {
    id: 'freezer_deep',
    name: 'Tủ Đông Sâu Trữ Sỉ Thịt Cốt Lết',
    category: 'storage',
    categoryLabel: 'Kho & Bảo Quản',
    icon: '🧊',
    level: 1,
    maxLevel: 3,
    cost: 650000,
    description: 'Cho phép gom thịt bò nạc và sườn heo giá sỉ mùa rẻ cất trữ lên tới 7 ngày.',
    perkEffect: 'Tăng sức chứa kho +60 slots, giữ thịt tươi 5 ngày',
    riskMitigation: 'Giảm sốc chi phí khi chợ bão giá nguyên liệu',
  },

  // --- NHÓM 3: KHÔNG GIAN, BÀN GHẾ & VỆ SINH ---
  {
    id: 'tables_stainless',
    name: 'Bộ Bàn Ghế Inox & Đệm Êm',
    category: 'ambiance',
    categoryLabel: 'Bàn Ghế & Vệ Sinh',
    icon: '🪑',
    level: 1,
    maxLevel: 5,
    cost: 250000,
    description: 'Bàn inox lau nhanh sạch bóng, ghế tựa êm giúp khách ngồi thoải mái không đau lưng.',
    perkEffect: 'Thêm +1 bàn đón khách, tăng thời gian kiên nhẫn +6s',
  },
  {
    id: 'misting_fan',
    name: 'Hệ Thống Quạt Phun Sương Mát Lạnh',
    category: 'ambiance',
    categoryLabel: 'Bàn Ghế & Vệ Sinh',
    icon: '💨',
    level: 1,
    maxLevel: 3,
    cost: 280000,
    description: 'Xua tan cái nóng oi bức mùa hè Sài Gòn, khách ngồi ăn bát phở nóng vẫn dễ chịu.',
    perkEffect: 'Thời tiết Nắng không bị tụt kiên nhẫn, tip +15%',
  },

  // --- NHÓM 4: CÔNG CỤ PHÒNG NGỪA BIẾN CỐ & AN TOÀN (RẤT QUAN TRỌNG) ---
  {
    id: 'fire_extinguisher',
    name: 'Bình Cứu Hỏa Bọt CO2 & Hộp Sơ Cứu',
    category: 'prevention',
    categoryLabel: 'Phòng Ngừa Rủi Ro',
    icon: '🧯',
    level: 1,
    maxLevel: 2,
    cost: 180000,
    description: 'Trang bị phòng cháy chữa cháy bắt buộc khi cơ quan chức năng kiểm tra.',
    perkEffect: 'Triệt tiêu 90% thiệt hại nếu xảy ra biến cố cháy bếp',
    riskMitigation: 'Không bị Đội trật tự phạt vi phạm quy chuẩn PCCC',
  },
  {
    id: 'hygiene_cert',
    name: 'Chứng Nhận Vệ Sinh ATTP & Khử Trùng',
    category: 'prevention',
    categoryLabel: 'Phòng Ngừa Rủi Ro',
    icon: '📋',
    level: 1,
    maxLevel: 3,
    cost: 320000,
    description: 'Tập huấn nhân viên đeo găng tay, kẹp gắp thức ăn và có giấy phép kiểm định.',
    perkEffect: 'Uy tín tiệm +15 sao, khách sành ăn đánh giá 5 sao cao hơn',
    riskMitigation: 'Miễn nhiễm với biến cố Đoàn Thanh Tra Vệ Sinh đình chỉ',
  },
  {
    id: 'security_camera',
    name: 'Camera Giám Sát & Chuông Cảnh Báo',
    category: 'prevention',
    categoryLabel: 'Phòng Ngừa Rủi Ro',
    icon: '📹',
    level: 1,
    maxLevel: 2,
    cost: 240000,
    description: 'Quan sát nhân viên thu tiền két và khách gửi xe ngoài vỉa hè.',
    perkEffect: 'Giảm 95% tình trạng khách quỵt tiền hoặc trộm vặt két tiền',
    riskMitigation: 'Phát hiện kẻ gian trộm đồ giữa ca đông',
  },
  {
    id: 'neighborhood_fund',
    name: 'Quỹ Nghĩa Tình Xóm Giềng & Tổ Dân Phố',
    category: 'prevention',
    categoryLabel: 'Phòng Ngừa Rủi Ro',
    icon: '🤝',
    level: 1,
    maxLevel: 3,
    cost: 150000,
    description: 'Ủng hộ bà con lối xóm, cô Bảy tổ trưởng, chú Năm bảo vệ dân phố.',
    perkEffect: 'Được cảnh báo trước 24h nếu có đợt dọn vỉa hè đô thị',
    riskMitigation: 'Không bị tịch thu bàn ghế khi xe trật tự đi qua',
  },
  {
    id: 'emergency_insurance',
    name: 'Gói Bảo Hiểm Rủi Ro Kinh Doanh',
    category: 'prevention',
    categoryLabel: 'Phòng Ngừa Rủi Ro',
    icon: '🛡️',
    level: 1,
    maxLevel: 3,
    cost: 500000,
    description: 'Bảo hiểm đền bù thiệt hại do ngập lụt mùa mưa hoặc chập điện hư kho.',
    perkEffect: 'Bồi thường 70% giá trị kho hàng nếu gặp thiên tai',
    riskMitigation: 'Ngăn chặn bờ vực phá sản khi dính bão lũ lớn',
  },

  // --- NHÓM 5: TIẾP THỊ & BẢN ĐỒ ĐỒNG ĐỘNG (MARKETING) ---
  {
    id: 'led_signboard',
    name: 'Biển Hiệu Đèn Neon Hồng Bắt Mắt',
    category: 'marketing',
    categoryLabel: 'Quảng Bá Tiếp Thị',
    icon: '✨',
    level: 1,
    maxLevel: 4,
    cost: 220000,
    description: 'Biển đèn phát sáng rực rỡ từ xa 200m, thu hút người đi đường buổi tối.',
    perkEffect: 'Lượng khách vãng lai ban đêm +20%',
  },
  {
    id: 'food_review_collab',
    name: 'Mời TikToker Đánh Giá Món Ngon',
    category: 'marketing',
    categoryLabel: 'Quảng Bá Tiếp Thị',
    icon: '📱',
    level: 1,
    maxLevel: 3,
    cost: 450000,
    description: 'Video ngắn viral đạt hàng chục ngàn lượt xem trên mạng xã hội.',
    perkEffect: 'Lượng khách tăng vọt 50% trong 3 ngày tiếp theo',
  },
];

// ============================================================================
// 5. BỘ DỮ LIỆU CÂU THOẠI KHÁCH HÀNG KHI MUA ĐỒ (CỰC KỲ ĐA DẠNG)
// ============================================================================

export interface CustomerOrderDialogue {
  id: string;
  restaurantId: RestaurantTypeId;
  dishName: string;
  customizationTag: string; // Tên tag biến tấu (ví dụ: 'không hành', 'nhiều bơ',...)
  dialogue: string;         // Câu thoại khách nói khi gọi món
  customerSegment?: CustomerSegmentId;
  moodNote?: string;
}

export const ORDER_DIALOGUES: CustomerOrderDialogue[] = [
  // ==================== A. PHỞ BÒ / PHỞ GÀ (pho) ====================
  {
    id: 'pho_01',
    restaurantId: 'pho',
    dishName: 'Phở Bò Tái',
    customizationTag: 'không_hành',
    dialogue: 'Cho em 1 tô tái KHÔNG HÀNH nha chị ơi! Em bị dị ứng hành lá á, đừng bỏ cọng nào nha!',
    customerSegment: 'student',
  },
  {
    id: 'pho_02',
    restaurantId: 'pho',
    dishName: 'Phở Bò Tái Nạm',
    customizationTag: 'nhiều_hành_trần',
    dialogue: 'Bác ơi, cho cháu tô tái nạm nhiều hành tây với cho xin chén hành hoa trần nước béo nhé!',
    customerSegment: 'foodie_gourmet',
  },
  {
    id: 'pho_03',
    restaurantId: 'pho',
    dishName: 'Phở Bò Đặc Biệt',
    customizationTag: 'nước_trong',
    dialogue: 'Lấy anh tô đặc biệt nước trong thanh nha, anh đang kiêng dầu mỡ, đừng chan váng béo.',
    customerSegment: 'office_worker',
  },
  {
    id: 'pho_04',
    restaurantId: 'pho',
    dishName: 'Phở Bò Tái Lăn',
    customizationTag: 'nhiều_bò_tái',
    dialogue: 'Chủ quán ơi, làm tô tái nhiều thịt xíu nha! Chạy xe từ sáng tới giờ đói cồn cào ruột gan rồi!',
    customerSegment: 'blue_collar',
  },
  {
    id: 'pho_05',
    restaurantId: 'pho',
    dishName: 'Phở Nạm Gầu',
    customizationTag: 'gầu_giòn_bánh_mềm',
    dialogue: 'Cho cô tô nạm gầu, gầu giòn nha cháu, trụng bánh mềm xíu răng cô hơi yếu nè.',
    customerSegment: 'neighbor_regular',
  },
  {
    id: 'pho_06',
    restaurantId: 'pho',
    dishName: 'Phở Bò Viên',
    customizationTag: 'không_giá',
    dialogue: 'Em ăn phở bò viên không lấy giá đỗ nha, cho em xin nhiều ngò gai với lát chanh tươi ạ!',
    customerSegment: 'student',
  },
  {
    id: 'pho_07',
    restaurantId: 'pho',
    dishName: 'Phở Tái Trứng Chần',
    customizationTag: 'trứng_lòng_đào',
    dialogue: 'Làm anh tô phở tái đập thêm 2 hột gà lòng đào để riêng chén nước súp ngập hành nhé!',
    customerSegment: 'office_worker',
  },
  {
    id: 'pho_08',
    restaurantId: 'pho',
    dishName: 'Phở Bò Tái Gân',
    customizationTag: 'gân_mềm_nhiều_ớt',
    dialogue: 'Tô tái gân ninh mềm nha quán, bỏ sẵn 2 muỗng ớt sa tế cay nồng vào súp giúp em luôn!',
    customerSegment: 'night_shifter',
  },
  {
    id: 'pho_09',
    restaurantId: 'pho',
    dishName: 'Phở Bò Chín Nạm',
    customizationTag: 'ít_bánh_nhiều_thịt',
    dialogue: 'Chị ơi em đang ăn kiêng Keto á, cho em xin ít bánh phở thôi mà thêm nhiều thịt chín nha chị!',
    customerSegment: 'office_worker',
  },
  {
    id: 'pho_10',
    restaurantId: 'pho',
    dishName: 'Phở Bò Đặc Biệt',
    customizationTag: 'xin_quẩy_giòn',
    dialogue: 'Cho bàn số 2 tô đặc biệt với 2 đĩa quẩy nóng giòn rụm nha, nhớ chừa chén tương đen!',
    customerSegment: 'tourist',
  },

  // ==================== B. BÁNH MÌ (banh_mi) ====================
  {
    id: 'bm_01',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Thịt Nguội',
    customizationTag: 'không_cay_không_ớt',
    dialogue: 'Bán em ổ thịt chả KHÔNG ỚT KHÔNG CAY nha cô! Mua cho bé nhỏ ở nhà ăn sáng đi học á.',
    customerSegment: 'neighbor_regular',
  },
  {
    id: 'bm_02',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Pate Trứng',
    customizationTag: 'ngập_pate_bơ',
    dialogue: 'Cô ơi quẹt cho con ngập ngụa pate với sốt bơ trứng gà béo nha! Con mê pate quán cô nhất xóm!',
    customerSegment: 'student',
  },
  {
    id: 'bm_03',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Thịt Nướng',
    customizationTag: 'nướng_giòn_rụm',
    dialogue: 'Làm liền ổ thịt nướng nướng than giòn rụm giúp anh nha! Đang vội chuẩn bị vào ca họp.',
    customerSegment: 'office_worker',
  },
  {
    id: 'bm_04',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Xíu Mại',
    customizationTag: 'chan_nhiều_nước_sốt',
    dialogue: 'Bánh mì xíu mại nhớ chan nhiều nước sốt cà ri thơm béo cho thấm bánh nha bạn hiền!',
    customerSegment: 'blue_collar',
  },
  {
    id: 'bm_05',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Chả Lụa',
    customizationTag: 'nhiều_dưa_leo_ngò',
    dialogue: 'Cho em ổ chả lụa nhiều dưa chua với dưa leo cắn cho giòn mát, xịt ít nước tương thôi.',
    customerSegment: 'student',
  },
  {
    id: 'bm_06',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Trứng Ốp La',
    customizationTag: 'lòng_đào_chảy',
    dialogue: 'Chiên cho anh 2 quả trứng ốp la lòng đào chảy nha, cắn bể ra dính sốt tương ớt ăn mới phê!',
    customerSegment: 'office_worker',
  },
  {
    id: 'bm_07',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Thập Cẩm Đặc Biệt',
    customizationTag: 'bỏ_hết_topping',
    dialogue: 'Làm cho em ổ full topping đặc biệt đắt nhất quán đi anh! Có gì bỏ hết vào nhé, đang đói hoa mắt!',
    customerSegment: 'night_shifter',
  },
  {
    id: 'bm_08',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Thịt Heo Quay',
    customizationTag: 'da_heo_giòn',
    dialogue: 'Lấy phần heo quay da giòn nổ bóng bì nha cô, đừng lấy mỡ nhiều ngấy lắm ạ.',
    customerSegment: 'foodie_gourmet',
  },
  {
    id: 'bm_09',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Gà Xé',
    customizationTag: 'ít_bơ_nhiều_muối_tiêu',
    dialogue: 'Cho ổ gà xé ít sốt bơ thôi nhen, rắc thêm xíu muối tiêu chanh cay cay the the nha.',
    customerSegment: 'neighbor_regular',
  },
  {
    id: 'bm_10',
    restaurantId: 'banh_mi',
    dishName: 'Bánh Mì Chả Cá Nóng',
    customizationTag: 'chiên_tại_chỗ',
    dialogue: 'Chả cá chiên tại chảo ép sợi thơm lừng nha, rưới đậm đà nước mắm tỏi ớt chua ngọt giùm em!',
    customerSegment: 'tourist',
  },

  // ==================== C. BÚN BÒ HUẾ & BÚN RIÊU (bun) ====================
  {
    id: 'bun_01',
    restaurantId: 'bun',
    dishName: 'Bún Bò Huế Đặc Biệt',
    customizationTag: 'nhiều_mắm_ruốc_cay',
    dialogue: 'Làm tô bún bò chuẩn vị Huế đậm mắm ruốc giùm anh! Nêm sa tế cay chảy nước mắt mới đã!',
    customerSegment: 'foodie_gourmet',
  },
  {
    id: 'bun_02',
    restaurantId: 'bun',
    dishName: 'Bún Bò Giò Heo',
    customizationTag: 'giò_nạc_không_gân',
    dialogue: 'Cho em tô giò nạc đừng lấy giò gân nha chị! Với cho em xin đĩa rau muống chẻ nhiều bắp chuối!',
    customerSegment: 'office_worker',
  },
  {
    id: 'bun_03',
    restaurantId: 'bun',
    dishName: 'Bún Bò Chả Cua',
    customizationTag: 'không_huyết',
    dialogue: 'Cô ơi con không ăn được huyết heo á, cô đổi cục huyết thành 1 miếng chả cua được không cô?',
    customerSegment: 'student',
  },
  {
    id: 'bun_04',
    restaurantId: 'bun',
    dishName: 'Bún Bò Bắp Hoa',
    customizationTag: 'nhiều_bún_sợi_to',
    dialogue: 'Làm tô bún sợi to nhiều bắp bò hoa nha bác, cho em chén nước béo hành củ thơm phức nhé!',
    customerSegment: 'blue_collar',
  },
  {
    id: 'bun_05',
    restaurantId: 'bun',
    dishName: 'Bún Riêu Cua Đồng',
    customizationTag: 'nhiều_riêu_đậu_hũ',
    dialogue: 'Bán tô bún riêu nhiều gạch cua với đậu hũ chiên phồng nha! Vắt thêm 2 miếng chanh tươi giùm.',
    customerSegment: 'neighbor_regular',
  },
  {
    id: 'bun_06',
    restaurantId: 'bun',
    dishName: 'Bún Riêu Giò Chả',
    customizationTag: 'chan_ngập_nước_me',
    dialogue: 'Bún riêu nước dùng phải có vị chua dịu thanh của cà chua với me nha, đừng ngọt đường quá.',
    customerSegment: 'tourist',
  },
  {
    id: 'bun_07',
    restaurantId: 'bun',
    dishName: 'Bún Bò Tái Nạm',
    customizationTag: 'chả_lá_huế',
    dialogue: 'Cho kèm 2 cây chả lá Huế thơm mùi tiêu sọ nha em ơi, bóc vỏ ăn liền tại bàn.',
    customerSegment: 'office_worker',
  },
  {
    id: 'bun_08',
    restaurantId: 'bun',
    dishName: 'Bún Bò Gân Trong',
    customizationTag: 'rau_trụng_chín',
    dialogue: 'Rau muống với giá trụng chín mềm giùm bác nha cháu, đừng để sống bác ăn đau bụng đấy.',
    customerSegment: 'neighbor_regular',
  },

  // ==================== D. BÒ NÉ & BEEFSTEAK (beefsteak) ====================
  {
    id: 'bone_01',
    restaurantId: 'beefsteak',
    dishName: 'Bò Né Trứng Ốp La',
    customizationTag: 'lòng_đào_sôi_xèo',
    dialogue: 'Bưng ra chảo gang còn sôi xèo xèo bơ khói nghi ngút nha quán! Trứng phải còn lòng đào chảy mới chấm bánh mì ngon!',
    customerSegment: 'student',
  },
  {
    id: 'bone_02',
    restaurantId: 'beefsteak',
    dishName: 'Beefsteak Sốt Tiêu Đen',
    customizationTag: 'bò_tái_vừa_medium',
    dialogue: 'Cho em đĩa steak bò mềm chín tái vừa (medium-rare) thôi nha, nướng kĩ quá thịt bò bị dai khô mất ngọt.',
    customerSegment: 'foodie_gourmet',
  },
  {
    id: 'bone_03',
    restaurantId: 'beefsteak',
    dishName: 'Bò Né Xúc Xích Pate',
    customizationTag: 'nhiều_bơ_thơm',
    dialogue: 'Cho cục bơ lạt to to vào chảo ngập mỡ béo ngậy nha anh zai! Kèm thêm 2 ổ bánh mì nóng hổi giòn rụm.',
    customerSegment: 'night_shifter',
  },
  {
    id: 'bone_04',
    restaurantId: 'beefsteak',
    dishName: 'Bò Né Khoai Tây Chiên',
    customizationTag: 'khoai_chiên_giòn',
    dialogue: 'Khoai tây chiên vàng giòn rắc xíu muối nha, đừng để ngập dầu mềm nhũn tội nghiệp con tui nó thích ăn giòn.',
    customerSegment: 'neighbor_regular',
  },
  {
    id: 'bone_05',
    restaurantId: 'beefsteak',
    dishName: 'Bò Né Thập Cẩm Phô Mai',
    customizationTag: 'phô_mai_kéo_sợi',
    dialogue: 'Cho xin lát phô mai cheddar tan chảy kéo sợi lên trên miếng bò nhé em! Đang quay video review nè!',
    customerSegment: 'tourist',
  },
  {
    id: 'bone_06',
    restaurantId: 'beefsteak',
    dishName: 'Bò Né Sốt Cà Ri Bơ',
    customizationTag: 'chín_kỹ_well_done',
    dialogue: 'Làm chín kỹ 100% giúp chị nha em, chị đang mang thai không ăn đồ lòng đào sống được.',
    customerSegment: 'office_worker',
  },

  // ==================== E. CƠM TẤM SÀI GÒN (com_tam) ====================
  {
    id: 'ct_01',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Sườn Nướng',
    customizationTag: 'sườn_cháy_cạnh',
    dialogue: 'Chủ tiệm ơi! Lựa em miếng sườn cốt lết dày dặn nướng cháy xém cạnh thơm mùi khói than nha!',
    customerSegment: 'blue_collar',
  },
  {
    id: 'ct_02',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Sườn Bì Chả',
    customizationTag: 'nhiều_mỡ_hành_tóp_mỡ',
    dialogue: 'Chan ngập mỡ hành với xúc cho em muỗng tóp mỡ giòn rụm nha chị! Nước mắm kẹo ớt tỏi cay xè nha!',
    customerSegment: 'student',
  },
  {
    id: 'ct_03',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Sườn Mỡ',
    customizationTag: 'sườn_mỡ_mềm',
    dialogue: 'Bán anh đĩa sườn có dải mỡ mềm thơm không bị khô cằn, thêm chén đồ chua củ cải cà rốt giòn mát.',
    customerSegment: 'office_worker',
  },
  {
    id: 'ct_04',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Ba Chỉ Nướng',
    customizationTag: 'ít_cơm_nhiều_thịt',
    dialogue: 'Lấy em ít hạt tấm thôi chị, em sợ mập á, nhưng miếng thịt ba rọi nướng phải đậm vị mật ong nha!',
    customerSegment: 'student',
  },
  {
    id: 'ct_05',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Tứ Quý (Sườn Bì Chả Trứng)',
    customizationTag: 'chả_trứng_hấp_mềm',
    dialogue: 'Cắt lát chả trứng nấm mèo vàng ươm dày dặn, trứng ốp la còn lòng đào chan nước mắm lên ăn bá cháy!',
    customerSegment: 'foodie_gourmet',
  },
  {
    id: 'ct_06',
    restaurantId: 'com_tam',
    dishName: 'Cơm Tấm Đùi Gà Nướng Mật Ong',
    customizationTag: 'da_gà_bóng_mật',
    dialogue: 'Gà nướng da bóng mỡ giòn ngọt nha cô Bảy, cho xin thêm chén canh súp sườn húp cho đỡ nghẹn.',
    customerSegment: 'neighbor_regular',
  },

  // ==================== F. ĐỒ UỐNG GIẢI KHÁT & CÀ PHÊ ====================
  {
    id: 'drink_01',
    restaurantId: 'banh_mi',
    dishName: 'Cà Phê Sữa Đá',
    customizationTag: 'nhiều_sữa_ít_đắng',
    dialogue: 'Làm ly cà phê sữa đá ngọt béo đậm đặc nhiều sữa đặc giùm em, sáng nay cần nạp đường tỉnh ngủ!',
    customerSegment: 'office_worker',
  },
  {
    id: 'drink_02',
    restaurantId: 'banh_mi',
    dishName: 'Cà Phê Đen Đá',
    customizationTag: 'không_đường_đậm_đắng',
    dialogue: 'Cho ly đen đá không đường đậm đặc đắng nghét nha bác, pha phin nhỏ giọt đậm mùi hạt Robusta.',
    customerSegment: 'blue_collar',
  },
  {
    id: 'drink_03',
    restaurantId: 'banh_mi',
    dishName: 'Trà Sữa Trân Châu',
    customizationTag: '30_đường_50_đá',
    dialogue: 'Ly trà sữa truyền thống 30% đường 50% đá nhiều trân châu đen giòn dai nha bạn phục vụ!',
    customerSegment: 'student',
  },
  {
    id: 'drink_04',
    restaurantId: 'banh_mi',
    dishName: 'Trà Đào Cam Sả',
    customizationTag: 'nhiều_miếng_đào',
    dialogue: 'Cho em ly trà đào thơm lừng mùi sả, bỏ 4 miếng đào ngâm giòn sựt sựt giải nhiệt trưa hè nha!',
    customerSegment: 'tourist',
  },
  {
    id: 'drink_05',
    restaurantId: 'pho',
    dishName: 'Trà Đá Vỉa Hè',
    customizationTag: 'trà_đá_mát_lạnh',
    dialogue: 'Bác ơi cho xin ca trà đá to nhiều đá mát lạnh uống kèm tô phở nóng bốc khói với ạ!',
    customerSegment: 'student',
  },
];

// ============================================================================
// 5.2. BIẾN TẤU GỌI MÓN NGẪU NHIÊN ĐỜI THỰC (RECIPE CUSTOMIZATIONS)
// "Bánh mì không hành, 2 trứng", "Phở không hành, nhiều bánh", "Nước béo",...
// ============================================================================

export interface RecipeCustomizationOption {
  tag: string;              // Badge ngắn hiển thị trên thẻ món: "2 trứng, không hành", "Nhiều bánh phở",...
  dialogue: string;         // Câu thoại chi tiết khách nói khi gọi món
  tipBonusPercent?: number; // Hệ số cộng thêm tiền tip khi khách được phục vụ chu đáo
}

export const RECIPE_CUSTOMIZATIONS: Record<RecipeId, RecipeCustomizationOption[]> = {
  // --- BÁNH MÌ (banh_mi) ---
  banh_mi_trung: [
    {
      tag: '2 trứng, không hành',
      dialogue: 'Cho em 1 ổ bánh mì 2 trứng ốp la lòng đào, KHÔNG HÀNH nha chị ơi!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Không hành, nhiều dưa leo',
      dialogue: 'Một ổ bánh mì trứng KHÔNG HÀNH, cho nhiều dưa leo cắn cho giòn mát nha cô!',
      tipBonusPercent: 0.15,
    },
    {
      tag: '2 trứng chín kỹ, không ớt',
      dialogue: 'Chiên giúp em 2 trứng chín kỹ nha, không bỏ ớt cay bé nhỏ nhà em ăn á!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Lòng đào, ngập tương ớt',
      dialogue: 'Trứng ốp la lòng đào chảy nha chị, xịt đẫm sốt tương ớt ăn mới phê!',
      tipBonusPercent: 0.15,
    },
    {
      tag: 'Thêm pate béo, không hành',
      dialogue: 'Quét thêm miếng pate béo ngậy giúp anh, dặn bếp đừng bỏ cọng hành nào nhé!',
      tipBonusPercent: 0.3,
    },
  ],
  banh_mi_thit: [
    {
      tag: 'Không hành, không ớt',
      dialogue: 'Cho 1 ổ thịt nướng KHÔNG HÀNH KHÔNG ỚT nha, em không ăn cay được!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Nhiều thịt nướng, giòn rụm',
      dialogue: 'Lấy em ổ nhiều thịt nướng than cháy cạnh nha anh, nướng giòn rụm nhen!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Không dưa chua, nhiều ngò',
      dialogue: 'Em không ăn đồ chua, cho em nhiều ngò rí với rắc muối tiêu the the nha!',
      tipBonusPercent: 0.15,
    },
    {
      tag: 'Nhiều sốt bơ, cay xé lưỡi',
      dialogue: 'Trét nhiều bơ trứng gà thơm béo, cắt 2 trái ớt hiểm cay xé lưỡi giùm anh!',
      tipBonusPercent: 0.25,
    },
  ],
  banh_mi_dac_biet: [
    {
      tag: 'Không hành, ngập pate',
      dialogue: 'Ổ đặc biệt ngập tràn pate bơ, nhớ KHÔNG BỎ HÀNH nha quán ơi!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Full topping, nhiều ớt',
      dialogue: 'Có bao nhiêu topping ngon bỏ hết vào ổ cho em nha, cho cay nồng luôn!',
      tipBonusPercent: 0.4,
    },
    {
      tag: 'Nhiều dưa leo, ít mỡ',
      dialogue: 'Lựa thịt nạc ít mỡ thôi nha cô, cho nhiều dưa chuột cắn cho đỡ ngấy!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Bánh mì giòn tan, ép nóng',
      dialogue: 'Bỏ lò nướng lại cho thật nóng giòn nha chị, cắn vào phải rôm rốp mới ngon!',
      tipBonusPercent: 0.25,
    },
  ],
  banh_mi_xiu_mai: [
    {
      tag: 'Chan nhiều nước sốt',
      dialogue: 'Chan nhiều nước sốt xíu mại sánh đậm cho ngập ổ bánh mì giùm em nha!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Không hành, xíu mại to',
      dialogue: 'Lấy em viên xíu mại nạc to bự, nhớ đừng rắc hành hoa lên trên nha!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Nhiều tiêu cay, giòn vỏ',
      dialogue: 'Xíu mại nhớ rắc thêm tiêu đen cay the, bánh mì giòn rụm nha bạn hiền!',
      tipBonusPercent: 0.2,
    },
  ],

  // --- ĐỒ UỐNG (drinks) ---
  tra_sua: [
    {
      tag: '50% đường, nhiều đá',
      dialogue: 'Cho ly trà sữa 50% đường, ít ngọt nhiều đá mát lạnh nha quán!',
      tipBonusPercent: 0.15,
    },
    {
      tag: 'Ít đá, đậm vị trà',
      dialogue: 'Lấy ly trà sữa ít đá thôi nha, pha đậm vị trà thơm nức mũi á!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Ngọt béo, đầy ắp ly',
      dialogue: 'Cho nhiều sữa đặc béo ngậy ngọt lịm nha, đang thèm ngọt xỉu luôn!',
      tipBonusPercent: 0.15,
    },
  ],
  cafe_sua: [
    {
      tag: 'Đậm đặc, ít sữa',
      dialogue: 'Cho ly cà phê sữa đá nhiều cà phê đậm đà, ít ngọt, đánh bọt giùm chú!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Nhiều sữa béo, nhiều đá',
      dialogue: 'Pha ly bạc xỉu nhiều sữa đặc thơm béo, đập đá nhuyễn đầy ly nha!',
      tipBonusPercent: 0.15,
    },
  ],
  tra_dao: [
    {
      tag: 'Nhiều đào, chua thanh',
      dialogue: 'Cho ly trà đào cam sả nhiều miếng đào giòn sần sật, vị chua thanh nha!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Ít ngọt, nhiều đá',
      dialogue: 'Lấy ly trà đào ít ngọt thôi em, trưa nắng uống thanh nhiệt mát họng!',
      tipBonusPercent: 0.15,
    },
  ],

  // --- PHỞ (pho) ---
  pho_tai: [
    {
      tag: 'Không hành, nhiều bánh phở',
      dialogue: 'Cho em tô phở tái KHÔNG HÀNH, nhiều bánh phở nha! Em không ăn được hành á!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Nước béo, nhiều hành trần',
      dialogue: 'Bác ơi, cho cháu tô tái nước béo ngậy với chén hành hoa trần thơm phức!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Bò tái mềm, không giá',
      dialogue: 'Làm tô bò tái mềm mọng, không lấy giá đỗ, cho xin 2 lát chanh tươi nha!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Thêm trứng chần lòng đào',
      dialogue: 'Đập thêm quả trứng gà chần lòng đào vào tô phở tái giúp anh nhé!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Nước trong, ít bánh phở',
      dialogue: 'Cho tô tái nước trong thanh, ít bánh phở thôi nha, anh đang kiêng dầu mỡ!',
      tipBonusPercent: 0.2,
    },
  ],
  pho_nam: [
    {
      tag: 'Nạm giòn, không hành',
      dialogue: 'Cho cô tô nạm gầu giòn sần sật, KHÔNG HÀNH, trụng bánh phở mềm xíu nha!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Nhiều nạm, thêm quẩy giòn',
      dialogue: 'Lấy tô phở nạm nhiều thịt với đĩa quẩy nóng giòn rụm nhúng súp nha quán!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Nhiều ớt, nước thật nóng',
      dialogue: 'Chan nước lèo sôi sùng sục nha bạn, cho nhiều ớt cay húp toát mồ hôi mới đã!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Ít bánh, nhiều nước dùng',
      dialogue: 'Cho xin ít bánh phở thôi mà chan đầy ắp nước dùng xương hầm nha chị!',
      tipBonusPercent: 0.2,
    },
  ],
  pho_dac_biet: [
    {
      tag: 'Không hành, ngập thịt bò',
      dialogue: 'Tô đặc biệt KHÔNG CỌNG HÀNH NÀO, cho nhiều thịt bò tái nạm ngập tô nha!',
      tipBonusPercent: 0.4,
    },
    {
      tag: 'Nước béo hành trần + quẩy',
      dialogue: 'Làm tô đặc biệt chan thìa váng mỡ béo, xin thêm chén hành hoa với đĩa quẩy!',
      tipBonusPercent: 0.35,
    },
    {
      tag: '2 trứng chần, gân mềm',
      dialogue: 'Tô đặc biệt thêm 2 trứng chần lòng đào, gân ninh nhừ mềm tan trong miệng nha!',
      tipBonusPercent: 0.45,
    },
    {
      tag: 'Nhiều bánh phở, đậm vị quế',
      dialogue: 'Tô đặc biệt cho nhiều bánh phở ăn cho no lâu nha bác, nước phở thơm nức mũi!',
      tipBonusPercent: 0.25,
    },
  ],

  // --- BÚN BÒ & BÚN RIÊU (bun) ---
  bun_bo_hue: [
    {
      tag: 'Không cay, nhiều chả cua',
      dialogue: 'Tô bún bò KHÔNG BỎ SA TẾ CAY nha cô, cho con nhiều chả cua thơm ngon ạ!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Đậm mắm ruốc, sa tế cay',
      dialogue: 'Nêm chuẩn vị Huế nồng nàn mắm ruốc, ớt sa tế cay xé lưỡi giùm anh mới đúng điệu!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Giò nạc, không gân mỡ',
      dialogue: 'Lấy khoanh giò nạc đừng lấy mỡ ngấy nha chị, cho đĩa rau chuối bào nhiều nha!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Không huyết, nhiều bắp bò',
      dialogue: 'Em không ăn huyết heo, đổi giúp em sang bắp bò hoa thái mỏng nhé quán!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Sợi bún to, rau trụng chín',
      dialogue: 'Bún bò sợi to truyền thống, trụng rau muống giá đỗ chín mềm giùm chú nha cháu!',
      tipBonusPercent: 0.2,
    },
  ],
  bun_rieu_cua: [
    {
      tag: 'Nhiều riêu cua, đậu rán giòn',
      dialogue: 'Cho tô bún riêu nhiều gạch cua đồng với đậu hũ chiên vàng phồng giòn rụm nha!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Thêm mắm tôm, chua thanh',
      dialogue: 'Cho muỗng mắm tôm đánh sủi bọt, nước dùng chua thanh cà chua dịu ngọt nha cô!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Không hành, nhiều ốc giòn',
      dialogue: 'Bún riêu cua KHÔNG HÀNH LÁ, cho nhiều ốc nhai giòn sần sật nha chị!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Nhiều bún, chan ngập nước',
      dialogue: 'Bác ơi cho cháu nhiều bún xíu, chan ngập nước riêu cua màu gạch đẹp mắt nhé!',
      tipBonusPercent: 0.2,
    },
  ],

  // --- BÒ NÉ & BEEFSTEAK (beefsteak) ---
  bo_ne_op_la: [
    {
      tag: '2 trứng lòng đào, nhiều bơ',
      dialogue: 'Chảo bò né cho 2 trứng ốp la lòng đào chảy, ngập bơ thơm béo xèo xèo nha anh!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Không hành tây, bò tái mềm',
      dialogue: 'Em không ăn được hành tây, cho thịt bò chín tái vừa mềm mọng ngọt nước nha!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Bánh mì giòn nóng hổi',
      dialogue: 'Bưng ra chảo gang sôi réo rắt kèm 2 ổ bánh mì nướng nóng giòn rụm nha quán!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Trứng chín kỹ, ít tiêu',
      dialogue: 'Làm trứng chín kỹ 100% giúp chị nha, rắc ít tiêu thôi bé nhà chị ăn cùng!',
      tipBonusPercent: 0.2,
    },
    {
      tag: '2 trứng, pate ngập bơ',
      dialogue: 'Thập cẩm đập 2 hột gà, trét miếng pate to bự với bơ ngậy thơm nức mũi nha!',
      tipBonusPercent: 0.4,
    },
    {
      tag: 'Thêm phô mai kéo sợi',
      dialogue: 'Cho thêm lát phô mai tan chảy kéo sợi lên chảo bò né nha bạn hiền!',
      tipBonusPercent: 0.35,
    },
  ],
  beefsteak_sot_tieu: [
    {
      tag: 'Sốt tiêu đen cay nồng',
      dialogue: 'Rưới đẫm sốt tiêu Phú Quốc cay ấm sánh mịn lên miếng bò dày mềm giúp anh!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Bò chín vừa (Medium)',
      dialogue: 'Steak bò làm chín vừa (medium-rare) mọng nước nha, đừng nướng khô dai nhé!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Thêm khoai tây chiên giòn',
      dialogue: 'Cho thêm phần khoai tây que chiên giòn rụm rắc muối lắc đều nha em ơi!',
      tipBonusPercent: 0.25,
    },
  ],

  // --- CƠM TẤM (com_tam) ---
  com_tam_suon: [
    {
      tag: 'Sườn mỡ cháy cạnh',
      dialogue: 'Lựa em miếng sườn có dải mỡ nướng cháy xém cạnh, thơm phức mùi than hoa nha!',
      tipBonusPercent: 0.3,
    },
    {
      tag: 'Nhiều mỡ hành, tóp mỡ giòn',
      dialogue: 'Chan ngập mỡ hành xanh mướt với xúc cho muỗng tóp mỡ giòn rụm nha chị!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Sườn nạc không mỡ, ít cơm',
      dialogue: 'Lấy miếng sườn nạc không dính mỡ nha cô, cho ít cơm tấm thôi con sợ tăng cân!',
      tipBonusPercent: 0.2,
    },
    {
      tag: 'Nước mắm kẹo ớt tỏi',
      dialogue: 'Cho chén nước mắm kẹo quánh ớt tỏi cay the ngọt dịu, thêm chén đồ chua củ cải nha!',
      tipBonusPercent: 0.2,
    },
  ],
  com_tam_suon_bi_cha: [
    {
      tag: 'Chả trứng mềm, sườn giòn',
      dialogue: 'Miếng chả trứng hấp nấm mèo vàng ươm dày cộp, sườn cốt lết dày thịt nha chủ tiệm!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Nhiều bì thính, mỡ hành',
      dialogue: 'Bì heo trộn thính thơm giòn, rưới ngập mỡ hành béo ngậy lên đĩa giùm em nha!',
      tipBonusPercent: 0.25,
    },
    {
      tag: 'Thêm ốp la lòng đào',
      dialogue: 'Đĩa sườn bì chả thêm 1 trứng ốp la lòng đào dẻo quánh chan mắm lên ăn bá cháy!',
      tipBonusPercent: 0.4,
    },
    {
      tag: 'Full sườn bì chả trứng',
      dialogue: 'Làm đĩa sườn bì chả trứng ốp la đắt nhất quán đi chị, đói lả người từ sáng rồi!',
      tipBonusPercent: 0.45,
    },
    {
      tag: 'Sườn mật ong, nhiều tóp mỡ',
      dialogue: 'Sườn ướp mật ong thơm nức, rắc ngập tràn tóp mỡ giòn tan béo ngậy nha cô Bảy!',
      tipBonusPercent: 0.35,
    },
    {
      tag: 'Nhiều cơm tấm, thêm canh súp',
      dialogue: 'Xới cho em đĩa cơm đầy đặn nha, cho xin thêm chén canh sườn húp cho đỡ nghẹn!',
      tipBonusPercent: 0.25,
    },
  ],
};

/**
 * Lấy ngẫu nhiên biến tấu món ăn (tag & câu thoại) cho một món cụ thể
 */
export function getRandomRecipeCustomization(recipeId: RecipeId): RecipeCustomizationOption {
  const options = RECIPE_CUSTOMIZATIONS[recipeId];
  if (!options || options.length === 0) {
    return {
      tag: 'Nóng giòn vừa miệng',
      dialogue: 'Cho một phần nóng hổi vừa miệng nha chủ quán!',
      tipBonusPercent: 0.1,
    };
  }
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}


// ============================================================================
// 6. CÂU THOẠI KHÁCH HỐI GIỤC, TÂM TRẠNG & TƯƠNG TÁC TẠI QUÁN
// ============================================================================

export interface CustomerAmbianceDialogue {
  type: 'rushing' | 'impatient' | 'happy' | 'complaining';
  text: string;
}

export const AMBIANCE_DIALOGUES: CustomerAmbianceDialogue[] = [
  // Hối giục vì vội
  { type: 'rushing', text: 'Quán ơi nhanh tay giùm em với, còn 5 phút nữa sếp vào văn phòng điểm danh rồi!' },
  { type: 'rushing', text: 'Bác tài ơi làm lẹ giùm con ổ bánh mì, xe buýt số 08 vừa bật đèn xi-nhan tới trạm kìa!' },
  { type: 'rushing', text: 'Anh đầu bếp ơi gấp gấp với, trễ giờ thi là giám thị không cho vào phòng thi đâu á!' },
  { type: 'rushing', text: 'Bấm giờ nãy giờ 8 phút rồi đó tiệm ơi, sắp tới giờ giao hàng cho khách bên quận 1 rồi!' },

  // Sốt ruột / Khó chịu khi chờ lâu (Nút cổ chai Năng lực phục vụ thấp)
  { type: 'impatient', text: 'Ủa bạn ơi? Bàn bên kia vào sau bàn tôi mà sao có tô phở ăn trước vậy cà?' },
  { type: 'impatient', text: 'Nước dùng chưa sôi hay sao mà lâu thế đầu bếp? Đói mốc mồm nãy giờ rồi nè!' },
  { type: 'impatient', text: 'Bàn này dơ quá chưa lau em ơi, lấy khăn sạch lau giùm vết dầu mỡ với!' },
  { type: 'impatient', text: 'Hết thịt bò thì báo sớm một câu để người ta đổi quán chứ để ngồi chờ hoài vậy trời?' },

  // Hài lòng / Khen ngợi khi món ra nhanh, thơm ngon (Điểm Uy tín tăng)
  { type: 'happy', text: 'Trời ơi bưng ra thơm phức cả góc phố! Nhìn miếng sườn nướng mỡ màng là ưng bụng rồi!' },
  { type: 'happy', text: 'Pate quán này béo ngậy đỉnh thật sự, đúng là tiệm bánh mì vỉa hè ngon nhất khu này!' },
  { type: 'happy', text: 'Phục vụ nhanh nhẹn dễ thương ghê, lát tính tiền giữ lại tiền thừa coi như tiền tip nha em!' },
  { type: 'happy', text: 'Ăn tô phở ấm lòng giữa ngày mưa gió rét thế này không còn gì tuyệt vời hơn!' },
  { type: 'happy', text: 'Nước mắm kẹo cay xè chuẩn cơm tấm Sài Gòn, mai anh lại dắt mấy đứa cùng phòng ghé ủng hộ!' },

  // Phàn nàn chất lượng (Cảnh báo biến cố ngộ độc / mất sao)
  { type: 'complaining', text: 'Ủa đã dặn là không bỏ cọng hành nào mà sao vẫn rắc nguyên nắm hành lá thế này?' },
  { type: 'complaining', text: 'Miếng thịt này ngửi sao có mùi chua chua lạ lạ vậy quán? Hàng để tủ lạnh mấy ngày rồi?' },
  { type: 'complaining', text: 'Bánh mì nướng nguội ngắt ỉu xìu thế này sao nuốt nổi? Đổi lại ổ mới giùm cái!' },
  { type: 'complaining', text: 'Tô bún lõng bõng có 2 miếng thịt mỏng dính mà chém tận 65 ngàn? Buôn bán kiểu gì vậy?' },
];

// ============================================================================
// 7. HỆ THỐNG ĐÁNH GIÁ (REVIEWS) 1 ĐẾN 5 SAO THEO NGUYÊN NHÂN THỰC TẾ
// ============================================================================

export interface CustomerReviewEntry {
  id: string;
  stars: 1 | 2 | 3 | 4 | 5;
  authorName: string;
  authorBadge: string;
  restaurantId: RestaurantTypeId;
  bottleneckCause?: 'wait_time' | 'out_of_stock' | 'price' | 'cleanliness' | 'taste' | 'service';
  headline: string;
  comment: string;
  upvotes: number;
  impactReputation: number; // Tác động điểm uy tín (-15 đến +10)
}

export const CUSTOMER_REVIEWS_DATABASE: CustomerReviewEntry[] = [
  // ==================== 5 SAO (ĐÁNH GIÁ XUẤT SẮC - UY TÍN TĂNG VỌT) ====================
  {
    id: 'rev_501',
    stars: 5,
    authorName: 'Minh Thư Food Blogger',
    authorBadge: '⭐ Top 10 Reviewer Sài Gòn',
    restaurantId: 'banh_mi',
    bottleneckCause: 'taste',
    headline: 'Ổ bánh mì pate bơ ngon nhức nách đỉnh nóc kịch trần!',
    comment: 'Tình cờ tấp vào ăn thử mà bất ngờ thật sự! Vỏ bánh giòn rụm không bị vụn nát, pate gan nhà làm thơm béo ngậy không tanh xíu nào. Sốt bơ vàng ươm sánh mịn, thịt nướng than hoa thơm lừng. Giá cực kì học sinh sinh viên. Chắc chắn ghé lại 100 lần!',
    upvotes: 142,
    impactReputation: 8,
  },
  {
    id: 'rev_502',
    stars: 5,
    authorName: 'Anh Tuấn Kỹ Sư Cầu Đường',
    authorBadge: '🛵 Khách Ruột 6 Tháng',
    restaurantId: 'pho',
    bottleneckCause: 'taste',
    headline: 'Nước dùng phở bò ngọt thanh từ xương ống, không lạm dụng mì chính!',
    comment: 'Tôi người gốc Bắc vào Nam làm việc, tìm đỏ mắt mới ra quán phở vỉa hè nấu nước dùng chuẩn gu thế này. Nước trong veo ninh xương thơm phức thảo quả hoa hồi, thịt bò tái lăn mềm ngọt nước. Bác chủ quán thân thiện, xin thêm hành trần nước béo cho xông xênh không tính tiền.',
    upvotes: 98,
    impactReputation: 7,
  },
  {
    id: 'rev_503',
    stars: 5,
    authorName: 'Chị Mai Kế Toán Trưởng',
    authorBadge: '💼 Cư Dân Tòa Nhà Landmark',
    restaurantId: 'com_tam',
    bottleneckCause: 'service',
    headline: 'Phục vụ nhanh như chớp, sườn nướng mỡ màng ngon không cưỡng lại được',
    comment: 'Dân văn phòng tụi mình trưa nào cũng chỉ có 40 phút ăn cơm, vào quán gọi món chưa đầy 2 phút là đĩa sườn bì chả nóng hổi đã bưng ra bàn. Tóp mỡ giòn rụm béo bùi, nước mắm kẹo đậm đà ớt tỏi băm. 10 điểm cho sự nhiệt tình của mấy bạn nhân viên trẻ!',
    upvotes: 85,
    impactReputation: 6,
  },
  {
    id: 'rev_504',
    stars: 5,
    authorName: 'David & Sarah',
    authorBadge: '📸 Backpacker Du Lịch Quốc Tế',
    restaurantId: 'beefsteak',
    bottleneckCause: 'taste',
    headline: 'Best Vietnamese Sizzling Beef Steak in town! Must try!',
    comment: 'Amazing experience! The sizzling beef steak on a cow-shaped cast iron plate with pate, sunny egg and warm crispy baguette blew our minds. Very clean street food stall, hospitable owner. Cheap price for an unforgettable culinary memory in Vietnam!',
    upvotes: 120,
    impactReputation: 9,
  },
  {
    id: 'rev_505',
    stars: 5,
    authorName: 'Chú Ba Chạy GrabBike',
    authorBadge: '🌸 Hàng Xóm Thân Thiết',
    restaurantId: 'bun',
    bottleneckCause: 'service',
    headline: 'Tô bún bò huế giò chả đầy ắp tình nghĩa ấm lòng người lao động',
    comment: 'Quán của cháu nó bán sạch sẽ, đàng hoàng. Bữa nào chạy xe mệt ghé vào làm tô bún bò nóng hổi nhiều rau thơm là tỉnh táo cả người. Mấy đứa nhỏ phục vụ dạ thưa lễ phép, chúc quán làm ăn phát tài phát lộc!',
    upvotes: 64,
    impactReputation: 5,
  },

  // ==================== 4 SAO (KHÁ NGON NHƯNG CÒN ĐIỂM TRỪ NHỎ) ====================
  {
    id: 'rev_401',
    stars: 4,
    authorName: 'Hoàng Long IT',
    authorBadge: '💼 Coder Thức Đêm',
    restaurantId: 'pho',
    bottleneckCause: 'wait_time',
    headline: 'Vị phở 9.5/10 nhưng giờ cao điểm đứng chờ hơi sốt ruột',
    comment: 'Món ăn không có chỗ nào để chê, thịt bò mềm tươi ngon tuyệt đỉnh. Điểm trừ duy nhất là quán đông khách quá, đầu bếp làm không kịp thở, mình đứng đợi gần 10 phút mới có bàn ngồi. Khuyên quán nên thuê thêm 1 phụ bếp chạy bàn phụ vào khung giờ trưa!',
    upvotes: 45,
    impactReputation: 3,
  },
  {
    id: 'rev_402',
    stars: 4,
    authorName: 'Bảo Ngọc Gen Z',
    authorBadge: '🎒 Học Sinh Chuyên Lê Hồng Phong',
    restaurantId: 'banh_mi',
    bottleneckCause: 'price',
    headline: 'Bánh mì ngon đỉnh chóp nhưng giá hơi nhỉnh hơn mấy xe bên cạnh',
    comment: 'Chất lượng thì tiền nào của nấy rồi, pate bơ ngập ngụa, thịt nướng thơm lừng. Cơ mà giá 35k với học sinh tụi mình thì chỉ dám ăn 2-3 bữa một tuần thôi hổng dám ăn mỗi ngày đâu hihi. Nếu có combo giảm 5k cho học sinh thì tuyệt vời ông mặt trời!',
    upvotes: 38,
    impactReputation: 2,
  },
  {
    id: 'rev_403',
    stars: 4,
    authorName: 'Thầy Hùng Giáo Viên',
    authorBadge: '🌸 Khách Quen Khu Phố',
    restaurantId: 'com_tam',
    bottleneckCause: 'cleanliness',
    headline: 'Cơm tấm sườn nướng xuất sắc, nếu che chắn bụi đường kĩ hơn sẽ trọn vẹn',
    comment: 'Miếng thịt sườn tẩm ướp chuẩn vị cơm tấm xưa Sài Gòn. Tuy nhiên do ngồi vỉa hè xe cộ qua lại hơi bụi, quán nên đầu tư thêm tủ kính che chắn đồ ăn hoặc tấm bạt kéo di động thì khách ăn sẽ an tâm hơn rất nhiều.',
    upvotes: 52,
    impactReputation: 2,
  },

  // ==================== 3 SAO (TRUNG BÌNH, TẠM ĐƯỢC, CÓ HẠN CHẾ) ====================
  {
    id: 'rev_301',
    stars: 3,
    authorName: 'Ngọc Lan Nhân Viên Ngân Hàng',
    authorBadge: '💼 Khách Vãng Lai',
    restaurantId: 'bun',
    bottleneckCause: 'out_of_stock',
    headline: 'Ghé quán lúc 12h15 đã báo hết chả cua và nạm bò!',
    comment: 'Mới giờ cơm trưa ghé vào mà nhân viên báo hết sạch thịt nạm với chả cua, đành phải ăn tô giò heo không đúng sở thích. Nước dùng nấu vị được, nhưng quản lý kho hàng dự trù nguyên liệu kém quá, giờ khách đông nhất lại hết đồ ăn.',
    upvotes: 31,
    impactReputation: 0,
  },
  {
    id: 'rev_302',
    stars: 3,
    authorName: 'Thanh Tùng Giao Hàng',
    authorBadge: '🛵 Shipper Công Nghệ',
    restaurantId: 'beefsteak',
    bottleneckCause: 'service',
    headline: 'Món ăn tạm ổn, nhân viên bận rộn mặt hơi quạu',
    comment: 'Đồ ăn mang ra nóng hổi nhưng nhân viên lúc đông khách gọi xin thêm ổ bánh mì với ly trà đá mà gọi 3 lần mới mang ra, mặt mày nhăn nhó không được vui vẻ cho lắm. Khách trả tiền ăn chứ đâu có ăn xin đâu nè.',
    upvotes: 27,
    impactReputation: -1,
  },
  {
    id: 'rev_303',
    stars: 3,
    authorName: 'Hải Đăng Sinh Viên',
    authorBadge: '🎒 KTX Đại Học Bách Khoa',
    restaurantId: 'banh_mi',
    bottleneckCause: 'taste',
    headline: 'Hơi thất vọng vì sốt chan hơi ngọt đường',
    comment: 'Bánh mì giòn rụm nhưng nước sốt chan theo gu ngọt miền Tây quá, át hết vị pate thơm bùi. Ai không quen ăn ngọt chắc sẽ thấy ngấy sau khi ăn hết nửa ổ.',
    upvotes: 19,
    impactReputation: 0,
  },

  // ==================== 2 SAO (KÉM - BÁO HIỆU NÚT CỔ CHAI ĐANG BỊ NGHẼN NẶNG) ====================
  {
    id: 'rev_201',
    stars: 2,
    authorName: 'Bác Sĩ Trí Khoa Cấp Cứu',
    authorBadge: '⭐ Khách Hàng Khó Tính',
    restaurantId: 'pho',
    bottleneckCause: 'cleanliness',
    headline: 'Bàn ghế dính dầu mỡ không lau, đũa muỗng còn ướt nhẹp',
    comment: 'Bước vào quán thấy giấy ăn vứt đầy dưới sàn nhà không ai quét dọn. Đũa muỗng đựng trong ống còn dính nước rửa bát tanh nồng. Đồ ăn chưa biết ngon dở thế nào nhưng khâu vệ sinh vỉa hè thế này là quá tệ!',
    upvotes: 76,
    impactReputation: -6,
  },
  {
    id: 'rev_202',
    stars: 2,
    authorName: 'Hương Giang Văn Phòng',
    authorBadge: '💼 Khách Hàng Công Sở',
    restaurantId: 'com_tam',
    bottleneckCause: 'wait_time',
    headline: 'Chờ 22 phút đói cồn cào suýt trễ giờ làm việc buổi chiều!',
    comment: 'Order từ lúc 11h45 mà ngồi ngắm trời ngắm đất tới 12h07 mới có đĩa cơm. Hỏi nhân viên thì bảo bếp bận làm đơn giao hàng ShopeeFood trước. Làm ăn kiểu phân biệt đối xử khách ngồi tại bàn thế này thì không bao giờ quay lại lần 2!',
    upvotes: 89,
    impactReputation: -7,
  },
  {
    id: 'rev_203',
    stars: 2,
    authorName: 'Văn Hậu',
    authorBadge: '🎒 Học Sinh Cấp 3',
    restaurantId: 'banh_mi',
    bottleneckCause: 'service',
    headline: 'Đã dặn không hành không ớt mà cắn miếng đầu tiên cay xé lưỡi!',
    comment: 'Mình đã dặn đi dặn lại là em không ăn cay được, người bán gật đầu dạ vâng cho đã rồi nhét nguyên trái ớt hiểm cắt lát vào giữa ổ. Cắn một miếng cay rát cổ họng phải bỏ nguyên ổ bánh mì. Quá ẩu tả và thiếu tôn trọng khách!',
    upvotes: 54,
    impactReputation: -5,
  },

  // ==================== 1 SAO (THẢM HỌA - NGUY CƠ BÃO PHỐT & PHÁ SẢN) ====================
  {
    id: 'rev_101',
    stars: 1,
    authorName: 'Khánh Vy & Nhóm Bạn',
    authorBadge: '⚠️ Cảnh Báo Ngộ Độc Thực Phẩm',
    restaurantId: 'pho',
    bottleneckCause: 'taste',
    headline: 'CẢNH BÁO: Nghi ngờ thịt bò ôi thiu lưu cữu, ăn xong cả nhóm đau bụng!',
    comment: 'Hôm qua đi ăn phở thấy miếng thịt bò màu tái thâm đen có mùi hăng hôi lạ. Chủ quán bảo thịt tươi mới nhập nhưng ăn xong về đến tối cả 3 đứa tụi mình đều bị nôn ói và tiêu chảy cấp phải vào trạm y tế truyền nước! Đề nghị thanh tra y tế vào cuộc kiểm tra ngay cái quán làm ăn bất lương này!',
    upvotes: 310,
    impactReputation: -18,
  },
  {
    id: 'rev_102',
    stars: 1,
    authorName: 'Tuấn Khang Reviewer',
    authorBadge: '📱 Kênh Ẩm Thực 500k Followers',
    restaurantId: 'com_tam',
    bottleneckCause: 'price',
    headline: 'Chặt chém khách vãng lai không niêm yết giá: Đĩa cơm sườn tính 95.000đ!',
    comment: 'Thấy quán vỉa hè tấp vào ăn thử, bình thường quán khác bán 35k-40k, lúc tính tiền bà chủ hét 95k/đĩa với lý do sườn đặc biệt! Hỏi bảng giá đâu thì bảo ở đây không cần bảng giá. Buôn bán chộp giật, chặt chém kiểu du côn này thì chúc quán sớm dẹp tiệm phá sản!',
    upvotes: 420,
    impactReputation: -20,
  },
  {
    id: 'rev_103',
    stars: 1,
    authorName: 'Quốc Bảo Tài Xế',
    authorBadge: '🛵 Tài Xế Xe Công Nghệ',
    restaurantId: 'beefsteak',
    bottleneckCause: 'cleanliness',
    headline: 'Kinh hoàng phát hiện dị vật mất vệ sinh trong chảo bò né!',
    comment: 'Đang ăn gần hết chảo bò né thì phát hiện nguyên con ruồi chết dính chặt trong đĩa rau xà lách dính bẩn bùn đất chưa rửa sạch. Gọi chủ quán ra thì thản nhiên gắp vứt đi bảo có gì đâu mà làm quá. Thái độ coi thường sức khỏe khách hàng đến mức ghê tởm!',
    upvotes: 280,
    impactReputation: -16,
  },
  {
    id: 'rev_104',
    stars: 1,
    authorName: 'Minh Đạt Sinh Viên',
    authorBadge: '🎒 KTX Khu B',
    restaurantId: 'bun',
    bottleneckCause: 'out_of_stock',
    headline: 'Chờ 25 phút bưng ra tô bún không có thịt, tính tiền đủ 50k!',
    comment: 'Bếp làm ẩu tả hết thịt bò mà không nói, chan nước dùng với mấy cọng bún trắng nhách bưng ra lừa khách. Phục vụ cãi tay đôi đòi đánh khách khi bị thắc mắc. Quá tệ hại, mọi người né gấp cái quán này ra!',
    upvotes: 195,
    impactReputation: -15,
  },
];

// ============================================================================
// 7. BỘ DANH MỤC BIẾN CỐ BẤT NGỜ ĐỜI THỰC (SURPRISE INCIDENTS & POPUPS)
// Tình huống dở khóc dở cười, rất thật với đời sống vỉa hè & quán ăn Việt Nam
// ============================================================================

export const SURPRISE_INCIDENTS: SurpriseIncident[] = [
  // --- NHÓM BIẾN CỐ BỊ PHẠT / MẤT TIỀN (PENALTIES & MISHAPS) ---
  {
    id: 'inc_wrong_accuse',
    type: 'penalty',
    icon: '⚖️ ❌',
    title: 'VU KHỐNG - TỐ CÁO SAI SỰ THẬT!',
    story: 'Người bạn chỉ điểm là Anh Nam IT hoàn toàn vô tội và có chứng cứ ngoại phạm xác thực!',
    behaviorLabel: 'Tố cáo oan người vô tội, vu khống gây xáo trộn',
    moneyChange: -150000,
    reputationChange: -2,
    reputationNote: 'Bị giảm điểm sao (-2 đánh giá 1 sao vì thiếu minh bạch)',
    footerNote: '(Tiền phạt đã trừ trực tiếp vào két tiền quán và ghi vào chi phí sự cố)',
    actionButtonText: 'Chấp hành & Tiếp tục',
  },
  {
    id: 'inc_urban_order',
    type: 'penalty',
    icon: '🚔 ⚠️',
    title: 'ĐỘI TRẬT TỰ ĐÔ THỊ ĐẾN BẤT NGỜ!',
    story: 'Xe trật tự đô thị bất ngờ quẹo cua vào hẻm! Quán lấn 2 gang tay vỉa hè để kê thêm bàn nhựa bị lập biên bản nhắc nhở!',
    behaviorLabel: 'Lấn chiếm lòng lề đường 20cm làm cản trở lối đi bộ',
    moneyChange: -200000,
    reputationChange: -1,
    reputationNote: 'Bị giảm điểm sao (-1 sao vì thiếu ý thức vỉa hè văn minh)',
    footerNote: '(Bàn ghế đã được dọn ngay ngắn vào trong vạch sơn kẻ đường)',
    actionButtonText: 'Chấp hành & Tiếp tục',
  },
  {
    id: 'inc_cat_thief',
    type: 'penalty',
    icon: '🐱 🥩',
    title: 'MÈO MƯỚP NHÀ CÔ BA CHÔM THỊT!',
    story: 'Lợi dụng lúc quán đang đông khách, con mèo mướp béo múp nhà cô Ba đã nhảy phóc lên bàn sơ chế tha mất nửa cân thịt tươi ngon!',
    behaviorLabel: 'Mất cắp nguyên liệu tươi do bảo quản sơ hở trước mèo hàng xóm',
    moneyChange: -95000,
    reputationChange: 0,
    reputationNote: 'Uy tín không đổi (khách cười trừ vì mèo quá dễ thương)',
    footerNote: '(Cô Ba đã sang xin lỗi và hứa sẽ xích mèo lại vào giờ cao điểm)',
    actionButtonText: 'Rút kinh nghiệm & Tiếp tục',
  },
  {
    id: 'inc_shipper_slip',
    type: 'penalty',
    icon: '🛵 🍌',
    title: 'SHIPPER TRƯỢT VỎ CHUỐI TÉ NGÃ!',
    story: 'Anh shipper chạy vội vào lấy đơn thì trượt vỏ chuối trước hiên, làm đổ lăn lóc khay 4 phần nước và đồ ăn ra sàn!',
    behaviorLabel: 'Tai nạn trơn trượt làm hỏng đơn hàng và đổ thức ăn ra sàn',
    moneyChange: -85000,
    reputationChange: -1,
    reputationNote: 'Giảm uy tín (-1 sao do khách đặt online phải chờ làm lại món)',
    footerNote: '(Quán đã hỗ trợ băng gạc cho anh shipper và lau khô sàn nhà)',
    actionButtonText: 'Khắc phục & Tiếp tục',
  },
  {
    id: 'inc_water_leak',
    type: 'penalty',
    icon: '💧 💸',
    title: 'QUÊN KHÓA VÒI NƯỚC QUA ĐÊM!',
    story: 'Tối qua sau giờ dọn dẹp, nhân viên rửa chén sơ suất quên khóa chặt vòi nước bồn rửa, nước chảy róc rách suốt cả đêm!',
    behaviorLabel: 'Lãng phí tài nguyên nước sạch đô thị do bất cẩn',
    moneyChange: -120000,
    reputationChange: -1,
    reputationNote: 'Giảm uy tín (-1 sao vì thiếu ý thức tiết kiệm tài nguyên)',
    footerNote: '(Hóa đơn tiền nước kỳ này tăng vọt, đã dán biển nhắc nhở ở bồn rửa)',
    actionButtonText: 'Chấp hành & Tiếp tục',
  },
  {
    id: 'inc_drunk_quarrel',
    type: 'penalty',
    icon: '🍺 💢',
    title: 'KHÁCH SAY RƯỢU CÀ KHỊA BÀN BÊN!',
    story: 'Hai bàn khách uống bia say sưa lời qua tiếng lại rồi va quẹt làm vỡ 3 cái tô sứ và 1 cái ghế nhựa của quán!',
    behaviorLabel: 'Xô xát do quá chén làm hư hỏng tài sản và ồn ào quán xá',
    moneyChange: -65000,
    reputationChange: -1,
    reputationNote: 'Giảm uy tín (-1 sao do gây ồn ào ảnh hưởng khách xung quanh)',
    footerNote: '(Đã mời hai bên giải tán trong hòa bình và dọn dẹp mảnh vỡ)',
    actionButtonText: 'Rút kinh nghiệm & Tiếp tục',
  },
  {
    id: 'inc_chili_overload',
    type: 'penalty',
    icon: '🌶️ 🥵',
    title: 'BỎ NHẦM ỚT HIỂM SIÊU CAY CHO KHÁCH TÂY!',
    story: 'Bếp nhỡ tay thả 3 trái ớt hiểm chỉ thiên vào phần ăn của một vị khách Tây, khiến khách vừa ăn vừa khóc sưng cả mắt!',
    behaviorLabel: 'Nhầm lẫn gia vị cay nồng gây sốc nhiệt cho du khách phương xa',
    moneyChange: -40000,
    reputationChange: -2,
    reputationNote: 'Giảm uy tín (-2 sao trên diễn đàn du lịch quốc tế)',
    footerNote: '(Quán đã miễn phí bữa ăn và tặng thêm bình trà tắc mát lạnh làm dịu)',
    actionButtonText: 'Xin lỗi & Tiếp tục',
  },
  {
    id: 'inc_trash_inspection',
    type: 'penalty',
    icon: '📋 🗑️',
    title: 'ĐỘI KIỂM TRA PHÁT HIỆN THÙNG RÁC HỞ NẮP!',
    story: 'Đoàn kiểm tra vệ sinh an toàn thực phẩm đi ngang phát hiện thùng rác khu chế biến chưa đậy kín nắp theo đúng quy định!',
    behaviorLabel: 'Vi phạm quy chế vệ sinh khu vực chế biến thực phẩm',
    moneyChange: -250000,
    reputationChange: -2,
    reputationNote: 'Bị trừ uy tín (-2 sao vì không giữ vệ sinh chuẩn chỉnh)',
    footerNote: '(Đã trang bị ngay thùng rác inox có bàn đạp chân tự đóng kín)',
    actionButtonText: 'Chấp hành & Tiếp tục',
  },

  // --- NHÓM BIẾN CỐ THƯỞNG / CỘNG TIỀN (REWARDS & WINDFALLS) ---
  {
    id: 'inc_overseas_viet',
    type: 'reward',
    icon: '💵 🎉',
    title: 'VIỆT KIỀU HỒI HƯƠNG BOA ĐẬM ĐÀ!',
    story: 'Một cô Việt kiều về thăm quê ăn xong xúc động bảo "Hương vị này giống hệt gánh hàng mẹ tôi nấu 30 năm trước", rút ngay tờ 500k boa thẳng tay!',
    behaviorLabel: 'Khách hoài niệm ký ức quê hương, tán thưởng món ăn tuyệt phẩm',
    moneyChange: 500000,
    reputationChange: 3,
    reputationNote: 'Tăng vọt uy tín (+3 đánh giá 5 sao rực rỡ từ kiều bào)',
    footerNote: '(Tiền thưởng đã được cộng thẳng vào két sắt của quán)',
    actionButtonText: 'Hoan hỉ & Tiếp tục',
  },
  {
    id: 'inc_lottery_treat',
    type: 'reward',
    icon: '🎫 🍻',
    title: 'CHÚ BẢY TRÚNG SỐ BAO CẢ QUÁN!',
    story: 'Chú Bảy chiều nay trúng giải vé số 30 triệu đồng, hào sảng ghé quán hô to "Bà con ăn uống thoải mái, chú bao hết hóa đơn hôm nay!"!',
    behaviorLabel: 'Lộc phát trời ban, đãi tiệc bao trọn gói toàn bộ khách đang ngồi',
    moneyChange: 450000,
    reputationChange: 2,
    reputationNote: 'Tăng mạnh uy tín (+2 sao vì không khí quán vui như trẩy hội)',
    footerNote: '(Khách trong quán vỗ tay reo hò rôm rả, két sắt quán đầy ắp)',
    actionButtonText: 'Nhận lộc & Tiếp tục',
  },
  {
    id: 'inc_generous_tycoon',
    type: 'reward',
    icon: '🏎️ 💰',
    title: 'ĐẠI GIA ĐI XE SANG TIP NHẦM TIỀN!',
    story: 'Một vị đại gia đi Mercedes ghé mua đồ ăn vội đi họp, rút nhầm tờ 500k đưa rồi phẩy tay "Khỏi thối nha em!" phóng xe đi mất dạng!',
    behaviorLabel: 'Khách bận việc đại sự, boa nhầm mệnh giá khủng cho quán',
    moneyChange: 350000,
    reputationChange: 1,
    reputationNote: 'Tăng uy tín (+1 sao nhờ tốc độ phục vụ nhanh thần tốc)',
    footerNote: '(Đã lưu lại số dư vào sổ, nếu khách quay lại sẽ gửi lời cảm ơn)',
    actionButtonText: 'Cảm ơn & Tiếp tục',
  },
  {
    id: 'inc_movie_crew',
    type: 'reward',
    icon: '🎬 ✨',
    title: 'ĐOÀN PHIM MƯỢN GÓC QUÁN QUAY PHIM!',
    story: 'Một đoàn làm phim học đường mượn góc quán vỉa hè quay cảnh lãng mạn trong 20 phút, gửi phong bì cảm ơn nồng hậu!',
    behaviorLabel: 'Cho thuê địa điểm bối cảnh phim ảnh & quảng bá hình ảnh quán',
    moneyChange: 300000,
    reputationChange: 3,
    reputationNote: 'Tăng uy tín (+3 sao sau khi phim chibi lên sóng trên mạng)',
    footerNote: '(Đoàn phim còn gọi ủng hộ thêm 10 ly trà mát cho cả ê-kíp)',
    actionButtonText: 'Hoan hỉ & Tiếp tục',
  },
  {
    id: 'inc_sudden_rain',
    type: 'reward',
    icon: '🌧️ 🍲',
    title: 'CƠN MƯA RÀO - KHÁCH KÉO VÀO TRÚ MƯA!',
    story: 'Trời đổ cơn mưa rào bất chợt, cả chục người đi đường tấp xe vào hiên quán trú mưa, lạnh bụng bèn gọi ngay một loạt tô nóng hổi ăn sạch sẽ!',
    behaviorLabel: 'Thiên thời địa lợi, biến cơn mưa thành doanh thu đột biến',
    moneyChange: 280000,
    reputationChange: 2,
    reputationNote: 'Tăng uy tín (+2 sao vì hiên quán che chở ấm áp cho người đi đường)',
    footerNote: '(Quán còn phát trà gừng nóng miễn phí cho mọi người làm ấm lòng)',
    actionButtonText: 'Ấm lòng & Tiếp tục',
  },
  {
    id: 'inc_viral_tiktoker',
    type: 'reward',
    icon: '📱 🌟',
    title: 'TIKTOKER REVIEW ẨM THỰC KHEN NỨC NỞ!',
    story: 'Một Tiktoker ẩm thực ghé ăn thử âm thầm rồi đăng clip khen nước sốt quán đỉnh chóp, clip lên xu hướng đạt triệu view!',
    behaviorLabel: 'Được reviewer có tâm giới thiệu không tốn tiền quảng cáo',
    moneyChange: 400000,
    reputationChange: 4,
    reputationNote: 'Tăng bùng nổ (+4 đánh giá 5 sao từ người hâm mộ khắp nơi)',
    footerNote: '(Khách xếp hàng dài từ đầu phố đến cuối ngõ để mua ăn thử)',
    actionButtonText: 'Đón nhận & Tiếp tục',
  },
  {
    id: 'inc_charity_lottery_elder',
    type: 'reward',
    icon: '👵 💖',
    title: 'ỦNG HỘ CỤ GIÀ BÁN VÉ SỐ - LAN TỎA YÊU THƯƠNG!',
    story: 'Quán mời cụ già bán vé số dạo một suất ăn nóng sốt và ly nước mát miễn phí, khách ngồi ăn thấy xúc động bèn thi nhau tip thêm tiền ủng hộ!',
    behaviorLabel: 'Tương thân tương ái, lan tỏa lòng nhân ái nơi góc phố vỉa hè',
    moneyChange: 180000,
    reputationChange: 3,
    reputationNote: 'Tăng mạnh uy tín (+3 sao nhờ nghĩa cử đẹp tử tế)',
    footerNote: '(Hình ảnh đẹp được khách chia sẻ lên hội nhóm khu dân cư)',
    actionButtonText: 'Ấm áp & Tiếp tục',
  },
  {
    id: 'inc_neighbor_blessing',
    type: 'reward',
    icon: '🏮 🧧',
    title: 'BÀ CON KHU PHỐ TẶNG LỘC ĐẦU THÁNG!',
    story: 'Hôm nay ngày rằm, các cô chú ban liên lạc tổ dân phố đi chùa về ghé quán mừng tuổi phong bao đỏ chúc quán buôn may bán đắt!',
    behaviorLabel: 'Tình làng nghĩa xóm gắn kết, chúc phúc tài lộc dồi dào',
    moneyChange: 200000,
    reputationChange: 2,
    reputationNote: 'Tăng uy tín (+2 sao vì được lòng hàng xóm láng giềng)',
    footerNote: '(Phong bao may mắn được treo ngay trước ban thờ thần tài của tiệm)',
    actionButtonText: 'Đa tạ & Tiếp tục',
  },
];

/**
 * Lấy ngẫu nhiên một biến cố bất ngờ đời thực
 */
export function getRandomSurpriseIncident(): SurpriseIncident {
  const index = Math.floor(Math.random() * SURPRISE_INCIDENTS.length);
  return SURPRISE_INCIDENTS[index];
}

