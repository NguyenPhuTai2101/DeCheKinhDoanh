import {
  Ingredient,
  IngredientId,
  Recipe,
  RecipeId,
  CustomerType,
  ShopUpgrade,
  Employee,
  GameSaveState,
  ShopTheme,
  DecorationItem,
  RestaurantType,
  RestaurantTypeId,
  BranchTier,
  BusinessStageId,
} from './types';

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  bread: {
    id: 'bread',
    name: 'Bánh Mì Giòn',
    icon: '🥖',
    category: 'bakery',
    cost: 3000,
    description: 'Vỏ giòn rụm, ruột mềm thơm mùi bơ.',
  },
  egg: {
    id: 'egg',
    name: 'Trứng Gà Tươi',
    icon: '🥚',
    category: 'meat',
    cost: 4000,
    description: 'Trứng gà ta lòng đỏ béo ngậy.',
  },
  pork: {
    id: 'pork',
    name: 'Thịt Nướng Ướp Vị',
    icon: '🥩',
    category: 'meat',
    cost: 10000,
    description: 'Thịt heo tươi ướp sả ớt mật ong đậm đà.',
  },
  pate: {
    id: 'pate',
    name: 'Patê Gan Thơm Béo',
    icon: '🧈',
    category: 'meat',
    cost: 6000,
    description: 'Patê gan béo ngậy gia truyền.',
  },
  cucumber: {
    id: 'cucumber',
    name: 'Dưa Leo Giòn',
    icon: '🥒',
    category: 'veg',
    cost: 2000,
    description: 'Dưa leo vườn tươi mát, giải ngấy.',
  },
  herb: {
    id: 'herb',
    name: 'Rau Thơm & Ngò Gai',
    icon: '🌿',
    category: 'veg',
    cost: 1500,
    description: 'Rau ngò thơm phức chuẩn vị bánh mì Việt.',
  },
  tea: {
    id: 'tea',
    name: 'Trà Lài Hảo Hạng',
    icon: '🍃',
    category: 'beverage',
    cost: 5000,
    description: 'Lá trà ướp hoa lài thanh mát.',
  },
  milk: {
    id: 'milk',
    name: 'Sữa Tươi Thanh Trùng',
    icon: '🥛',
    category: 'beverage',
    cost: 6000,
    description: 'Sữa tươi béo ngậy ngọt lành.',
  },
  condensed_milk: {
    id: 'condensed_milk',
    name: 'Sữa Đặc Ngọt Ngào',
    icon: '🍯',
    category: 'beverage',
    cost: 4000,
    description: 'Sữa đặc béo ngọt sánh mịn.',
  },
  coffee: {
    id: 'coffee',
    name: 'Cà Phê Phin Robusta',
    icon: '☕',
    category: 'beverage',
    cost: 7000,
    description: 'Cà phê rang xay đậm đà hương vị truyền thống.',
  },
  // Phở Bò Gia Truyền
  pho_noodle: {
    id: 'pho_noodle',
    name: 'Bánh Phở Tươi',
    icon: '🍜',
    category: 'bakery',
    cost: 4000,
    description: 'Sợi phở dẻo mềm, làm mới mỗi sáng.',
  },
  beef: {
    id: 'beef',
    name: 'Thịt Bò Tươi Phi Lê',
    icon: '🥩',
    category: 'meat',
    cost: 16000,
    description: 'Bò tơ tươi mềm, thái mỏng ngọt thịt.',
  },
  beef_broth: {
    id: 'beef_broth',
    name: 'Nước Hầm Xương Phở',
    icon: '🍲',
    category: 'meat',
    cost: 7000,
    description: 'Nước hầm xương ống, quế, thảo quả ngào ngạt.',
  },
  quay: {
    id: 'quay',
    name: 'Quẩy Giòn Rụm',
    icon: '🥖',
    category: 'bakery',
    cost: 3000,
    description: 'Quẩy chiên vàng ruộm, nhúng nước dùng giòn tan.',
  },
  spring_onion: {
    id: 'spring_onion',
    name: 'Hành Hoa & Mùi Tàu',
    icon: '🌿',
    category: 'veg',
    cost: 1500,
    description: 'Hành hoa thái nhỏ và rau thơm dậy vị phở.',
  },
  // Bún Bò Huế & Bún Riêu Cua
  bun_noodle: {
    id: 'bun_noodle',
    name: 'Sợi Bún Tươi',
    icon: '🍜',
    category: 'bakery',
    cost: 3500,
    description: 'Bún gạo tươi sợi tròn dẻo dai.',
  },
  crab_paste: {
    id: 'crab_paste',
    name: 'Riêu Cua Đồng & Chả',
    icon: '🦀',
    category: 'meat',
    cost: 12000,
    description: 'Gạch cua đồng giã tay thơm nức mũi.',
  },
  bun_broth: {
    id: 'bun_broth',
    name: 'Nước Lèo Bún Bò Sa Tế',
    icon: '🌶️',
    category: 'meat',
    cost: 8000,
    description: 'Nước dùng mắm ruốc sả sa tế cay thơm nồng nàn.',
  },
  tofu: {
    id: 'tofu',
    name: 'Đậu Hũ Chiên Vàng',
    icon: '🧈',
    category: 'veg',
    cost: 3000,
    description: 'Đậu hũ non chiên giòn vỏ, mềm mịn bên trong.',
  },
  tomato: {
    id: 'tomato',
    name: 'Cà Chua Mọng Nước',
    icon: '🍅',
    category: 'veg',
    cost: 2000,
    description: 'Cà chua chín đỏ tạo vị thanh ngọt cho nước riêu.',
  },
  // Bò Né / Beefsteak
  butter: {
    id: 'butter',
    name: 'Bơ Thơm Béo',
    icon: '🧈',
    category: 'meat',
    cost: 5000,
    description: 'Bơ lạt thơm lừng giúp chảo gang xèo xèo ngậy vị.',
  },
  potato: {
    id: 'potato',
    name: 'Khoai Tây Chiên Giòn',
    icon: '🍟',
    category: 'veg',
    cost: 4000,
    description: 'Khoai tây que chiên giòn tan ăn kèm bò né.',
  },
  pepper_sauce: {
    id: 'pepper_sauce',
    name: 'Sốt Tiêu Đen Đậm Vị',
    icon: '🥣',
    category: 'meat',
    cost: 6000,
    description: 'Sốt tiêu Phú Quốc cay ấm, đậm đà sánh mịn.',
  },
  // Cơm Tấm
  broken_rice: {
    id: 'broken_rice',
    name: 'Gạo Tấm Thơm Dẻo',
    icon: '🍚',
    category: 'bakery',
    cost: 5000,
    description: 'Hạt tấm nhuyễn dẻo thơm trứ danh Sài Gòn.',
  },
  pork_rib: {
    id: 'pork_rib',
    name: 'Sườn Cốt Lết Ướp Mật Ong',
    icon: '🍖',
    category: 'meat',
    cost: 18000,
    description: 'Sườn heo dày thịt ướp sả, mật ong nướng than hồng.',
  },
  scallion_oil: {
    id: 'scallion_oil',
    name: 'Mỡ Hành & Tóp Mỡ',
    icon: '🧅',
    category: 'veg',
    cost: 3000,
    description: 'Mỡ hành thơm lừng kèm tóp mỡ giòn rụm.',
  },
};

export const RECIPES: Record<RecipeId, Recipe> = {
  banh_mi_trung: {
    id: 'banh_mi_trung',
    name: 'Bánh Mì Trứng Ốp La',
    icon: '🍳',
    category: 'food',
    requiredIngredients: ['bread', 'egg', 'cucumber'],
    cookingTimeMs: 2500,
    basePrice: 18000,
    expGain: 15,
    description: 'Bánh mì kẹp 2 trứng ốp la lòng đào kèm dưa leo giòn rụm.',
  },
  banh_mi_thit: {
    id: 'banh_mi_thit',
    name: 'Bánh Mì Thịt Nướng',
    icon: '🥪',
    category: 'food',
    requiredIngredients: ['bread', 'pork', 'cucumber', 'herb'],
    cookingTimeMs: 3500,
    basePrice: 28000,
    expGain: 25,
    description: 'Thịt xiên nướng thơm lừng kết hợp rau thơm và dưa chua.',
  },
  banh_mi_dac_biet: {
    id: 'banh_mi_dac_biet',
    name: 'Bánh Mì Thập Cẩm Đặc Biệt',
    icon: '🥖',
    category: 'food',
    requiredIngredients: ['bread', 'pork', 'egg', 'pate', 'cucumber', 'herb'],
    cookingTimeMs: 4500,
    basePrice: 42000,
    expGain: 40,
    description: 'Món "best-seller" ngập tràn patê béo ngậy, thịt nướng và trứng ốp la.',
  },
  tra_sua: {
    id: 'tra_sua',
    name: 'Trà Sữa Cozy Signature',
    icon: '🧋',
    category: 'drink',
    requiredIngredients: ['tea', 'milk', 'condensed_milk'],
    cookingTimeMs: 2000,
    basePrice: 25000,
    expGain: 20,
    description: 'Trà sữa thơm nồng vị trà lài, ngậy béo sữa tươi.',
  },
  cafe_sua: {
    id: 'cafe_sua',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    icon: '🥤',
    category: 'drink',
    requiredIngredients: ['coffee', 'condensed_milk'],
    cookingTimeMs: 2000,
    basePrice: 22000,
    expGain: 20,
    description: 'Đậm đà vị cà phê phin hòa quyện cùng sữa đặc ngọt béo.',
  },
  banh_mi_xiu_mai: {
    id: 'banh_mi_xiu_mai',
    name: 'Bánh Mì Xíu Mại Sốt Cà',
    icon: '🧆',
    category: 'food',
    requiredIngredients: ['bread', 'pork', 'cucumber', 'herb'],
    cookingTimeMs: 3200,
    basePrice: 32000,
    expGain: 30,
    description: 'Xíu mại thịt heo sốt cà chua đậm đà, kẹp bánh mì giòn tan thơm lừng.',
  },
  tra_dao: {
    id: 'tra_dao',
    name: 'Trà Đào Cam Sả Mát Lạnh',
    icon: '🍑',
    category: 'drink',
    requiredIngredients: ['tea', 'herb', 'condensed_milk'],
    cookingTimeMs: 2000,
    basePrice: 28000,
    expGain: 25,
    description: 'Trà lài ủ lạnh hòa cùng vị ngọt thơm của đào miếng và hương sả cay thanh.',
  },
  // Phở Bò Gia Truyền
  pho_tai: {
    id: 'pho_tai',
    name: 'Phở Bò Tái Lăn',
    icon: '🍜',
    category: 'food',
    requiredIngredients: ['pho_noodle', 'beef', 'beef_broth', 'spring_onion'],
    cookingTimeMs: 2200,
    basePrice: 45000,
    expGain: 25,
    description: 'Tô phở bốc khói, thịt bò tái lăn mềm ngọt thơm mùi gừng tỏi.',
  },
  pho_nam: {
    id: 'pho_nam',
    name: 'Phở Bò Nạm Quẩy Giòn',
    icon: '🍜',
    category: 'food',
    requiredIngredients: ['pho_noodle', 'beef', 'beef_broth', 'quay'],
    cookingTimeMs: 2500,
    basePrice: 50000,
    expGain: 30,
    description: 'Nạm bò mềm thơm béo ngậy, nhúng thêm đĩa quẩy giòn tan.',
  },
  pho_dac_biet: {
    id: 'pho_dac_biet',
    name: 'Phở Bò Đặc Biệt Thập Cẩm',
    icon: '🍜',
    category: 'food',
    requiredIngredients: ['pho_noodle', 'beef', 'beef_broth', 'egg', 'quay'],
    cookingTimeMs: 3000,
    basePrice: 65000,
    expGain: 45,
    description: 'Tô phở đại vương với thịt bò tươi, trứng chần lòng đào và quẩy giòn.',
  },
  // Bún Bò & Bún Riêu
  bun_bo_hue: {
    id: 'bun_bo_hue',
    name: 'Bún Bò Huế Chả Cua',
    icon: '🍲',
    category: 'food',
    requiredIngredients: ['bun_noodle', 'beef', 'bun_broth', 'crab_paste'],
    cookingTimeMs: 2400,
    basePrice: 48000,
    expGain: 28,
    description: 'Đậm đà hương vị cố đô với thịt bò nạm, chả cua và nước lèo cay sả.',
  },
  bun_rieu_cua: {
    id: 'bun_rieu_cua',
    name: 'Bún Riêu Cua Đồng Đậu Hũ',
    icon: '🍲',
    category: 'food',
    requiredIngredients: ['bun_noodle', 'crab_paste', 'tofu', 'tomato'],
    cookingTimeMs: 2000,
    basePrice: 40000,
    expGain: 22,
    description: 'Riêu cua nổi vàng ươm, cà chua đỏ mọng và đậu hũ chiên béo ngậy.',
  },
  // Bò Né / Beefsteak
  bo_ne_op_la: {
    id: 'bo_ne_op_la',
    name: 'Bò Né Trứng Ốp La Xèo Xèo',
    icon: '🥩',
    category: 'food',
    requiredIngredients: ['beef', 'egg', 'pate', 'butter', 'bread'],
    cookingTimeMs: 2600,
    basePrice: 55000,
    expGain: 35,
    description: 'Chảo gang hình con bò xèo xèo bơ tỏi, trứng lòng đào và bánh mì nóng giòn.',
  },
  beefsteak_sot_tieu: {
    id: 'beefsteak_sot_tieu',
    name: 'Beefsteak Chảo Gang Sốt Tiêu Đen',
    icon: '🥩',
    category: 'food',
    requiredIngredients: ['beef', 'butter', 'potato', 'pepper_sauce', 'bread'],
    cookingTimeMs: 3200,
    basePrice: 75000,
    expGain: 50,
    description: 'Thăn bò thượng hạng sốt tiêu đen cay nồng ăn kèm khoai tây giòn rụm.',
  },
  // Cơm Tấm
  com_tam_suon: {
    id: 'com_tam_suon',
    name: 'Cơm Tấm Sườn Nướng Mật Ong',
    icon: '🍛',
    category: 'food',
    requiredIngredients: ['broken_rice', 'pork_rib', 'scallion_oil', 'cucumber'],
    cookingTimeMs: 2800,
    basePrice: 45000,
    expGain: 26,
    description: 'Sườn nướng than hồng thơm nức mũi, hạt cơm tấm dẻo chan mỡ hành tóp mỡ.',
  },
  com_tam_suon_bi_cha: {
    id: 'com_tam_suon_bi_cha',
    name: 'Cơm Tấm Sườn Chả Trứng Ốp La',
    icon: '🍛',
    category: 'food',
    requiredIngredients: ['broken_rice', 'pork_rib', 'egg', 'scallion_oil'],
    cookingTimeMs: 3200,
    basePrice: 60000,
    expGain: 40,
    description: 'Đĩa cơm sườn vàng ruộm, thêm trứng ốp la lòng đào và mỡ hành béo ngậy.',
  },
};

export const RESTAURANT_TYPES: Record<RestaurantTypeId, RestaurantType> = {
  banh_mi: {
    id: 'banh_mi',
    name: 'Tiệm Bánh Mì & Cà Phê',
    shortName: 'Bánh Mì',
    icon: '🥖',
    badge: 'Khởi Nghiệp Quốc Dân',
    tagline: 'Vỏ giòn rụm, bơ pate thơm nức, cà phê phin đậm đà.',
    starterDescription: 'Vốn khởi nghiệp nhẹ nhàng, khách đông từ sáng sớm đến chiều muộn, dễ quản lý.',
    unlockCost: 0,
    requiredReputation: 0,
    requiredStaffCount: 0,
    branchTiers: [
      {
        level: 1,
        name: 'Kiosk Vỉa Hè Tinh Gọn',
        tagline: 'Xe đẩy inox vỉa hè giản dị',
        cost: 0,
        requiredReputation: 0,
        requiredStaff: 0,
        bonusMultiplier: 1.0,
        description: 'Doanh thu tự động cơ bản 100%.',
      },
      {
        level: 2,
        name: 'Quán Góc Phố Nhộn Nhịp',
        tagline: 'Bàn ghế gỗ xếp, mái hiên di động che mưa nắng',
        cost: 1500000,
        requiredReputation: 80,
        requiredStaff: 1,
        bonusMultiplier: 1.4,
        description: '+40% Doanh thu tự động & tăng 20% tốc độ bán.',
      },
      {
        level: 3,
        name: 'Cửa Hàng Mặt Tiền Máy Lạnh',
        tagline: 'Biển LED nổi bật, khách ngồi điều hòa thưởng thức',
        cost: 4500000,
        requiredReputation: 200,
        requiredStaff: 1,
        bonusMultiplier: 1.9,
        description: '+90% Doanh thu tự động & khách boa thêm 15%.',
      },
      {
        level: 4,
        name: 'Chuỗi Nhượng Quyền Quốc Dân',
        tagline: 'Thương hiệu nức tiếng phủ sóng khắp các quận trung tâm',
        cost: 12000000,
        requiredReputation: 450,
        requiredStaff: 2,
        bonusMultiplier: 2.5,
        description: '+150% Doanh thu tự động & nhận thêm ⭐ uy tín mỗi ngày.',
      },
      {
        level: 5,
        name: 'Đế Chế Bánh Mì Toàn Cầu',
        tagline: 'Biểu tượng ẩm thực Việt Nam vươn tầm quốc tế',
        cost: 30000000,
        requiredReputation: 900,
        requiredStaff: 3,
        bonusMultiplier: 3.5,
        description: '+250% Doanh thu tự động (Gấp 3.5 lần doanh thu cơ bản!).',
      },
    ],
    themeColor: '#D97706',
    accentColor: '#FEF3C7',
    equipmentName: 'Thớt Gỗ Chế Biến & Bếp Nướng',
    equipmentIcon: '🪵',
    equipmentType: 'board',
    primaryRecipeIds: ['banh_mi_trung', 'banh_mi_thit', 'banh_mi_dac_biet', 'banh_mi_xiu_mai', 'cafe_sua', 'tra_sua', 'tra_dao'],
    allowedIngredientIds: ['bread', 'egg', 'pork', 'pate', 'cucumber', 'herb', 'tea', 'milk', 'condensed_milk', 'coffee'],
  },
  pho: {
    id: 'pho',
    name: 'Quán Phở Bò Gia Truyền',
    shortName: 'Phở Bò',
    icon: '🍜',
    badge: 'Tinh Hoa Ẩm Thực',
    tagline: 'Nồi nước dùng hầm xương 24h, quế hồi ngào ngạt, thịt bò tái lăn mềm ngọt.',
    starterDescription: 'Món ăn danh tiếng toàn cầu. Giá trị mỗi tô cao, khách sẵn lòng chi trả hào phóng!',
    unlockCost: 3500000,
    requiredReputation: 120,
    requiredStaffCount: 1,
    branchTiers: [
      {
        level: 1,
        name: 'Gánh Phở Bò Thúng Xưa',
        tagline: 'Hương vị xưa thanh tao ấm lòng người lữ khách',
        cost: 0,
        requiredReputation: 120,
        requiredStaff: 1,
        bonusMultiplier: 1.0,
        description: 'Doanh thu tự động cơ bản 100%.',
      },
      {
        level: 2,
        name: 'Quán Phở Gia Truyền Góc Phố',
        tagline: 'Nồi ninh xương đồng sáng bóng, khói nghi ngút',
        cost: 3000000,
        requiredReputation: 220,
        requiredStaff: 1,
        bonusMultiplier: 1.45,
        description: '+45% Doanh thu tự động & ninh nước lèo nhanh hơn.',
      },
      {
        level: 3,
        name: 'Nhà Hàng Phở Bò Thượng Hạng',
        tagline: 'Không gian ấm cúng, bò Wagyu tái lăn sang trọng',
        cost: 8500000,
        requiredReputation: 450,
        requiredStaff: 2,
        bonusMultiplier: 2.0,
        description: '+100% Doanh thu tự động (x2 doanh thu) & khách tip 20%.',
      },
      {
        level: 4,
        name: 'Chuỗi Phở Bò Di Sản Đô Thị',
        tagline: 'Hàng ngàn lượt khách xếp hàng thưởng thức mỗi ngày',
        cost: 22000000,
        requiredReputation: 850,
        requiredStaff: 2,
        bonusMultiplier: 2.7,
        description: '+170% Doanh thu tự động & danh tiếng vang xa khắp vùng.',
      },
      {
        level: 5,
        name: 'Kỳ Lân Phở Việt Vươn Tầm Thế Giới',
        tagline: 'Thương hiệu Michelin được truyền thông quốc tế ca tụng',
        cost: 55000000,
        requiredReputation: 1600,
        requiredStaff: 3,
        bonusMultiplier: 3.8,
        description: '+280% Doanh thu tự động siêu khổng lồ!',
      },
    ],
    themeColor: '#DC2626',
    accentColor: '#FEE2E2',
    equipmentName: 'Nồi Hầm Xương & Quầy Trụng Phở',
    equipmentIcon: '🍲',
    equipmentType: 'pho_pot',
    primaryRecipeIds: ['pho_tai', 'pho_nam', 'pho_dac_biet', 'cafe_sua', 'tra_dao'],
    allowedIngredientIds: ['pho_noodle', 'beef', 'beef_broth', 'quay', 'spring_onion', 'egg', 'coffee', 'tea', 'milk', 'condensed_milk'],
  },
  bun: {
    id: 'bun',
    name: 'Quán Bún Bò Huế & Bún Riêu Cua',
    shortName: 'Bún Bò & Bún Riêu',
    icon: '🍲',
    badge: 'Đậm Vị Xứ Huế & Miền Tây',
    tagline: 'Riêu cua béo ngậy, bún bò sa tế cay nồng, chả cua giòn sần sật.',
    starterDescription: 'Món nước khoái khẩu của mọi lứa tuổi, lượng khách trung thành cực kỳ đông đảo.',
    unlockCost: 10000000,
    requiredReputation: 300,
    requiredStaffCount: 2,
    branchTiers: [
      {
        level: 1,
        name: 'Quầy Bún Nước Lèo Vỉa Hè',
        tagline: 'Nồi sa tế đỏ cam bốc khói cay nồng hấp dẫn',
        cost: 0,
        requiredReputation: 300,
        requiredStaff: 2,
        bonusMultiplier: 1.0,
        description: 'Doanh thu tự động cơ bản 100%.',
      },
      {
        level: 2,
        name: 'Tiệm Bún Sa Tế Khang Trang',
        tagline: 'Bàn inox sáng bóng, quầy chả cua đầy ắp tươi ngon',
        cost: 7000000,
        requiredReputation: 480,
        requiredStaff: 2,
        bonusMultiplier: 1.45,
        description: '+45% Doanh thu tự động & khách trung thành tăng vọt.',
      },
      {
        level: 3,
        name: 'Quán Ăn Bún Bò Cố Đô Chuẩn Vị',
        tagline: 'Không gian cung đình Huế, hương sả quế nồng đượm',
        cost: 18000000,
        requiredReputation: 800,
        requiredStaff: 3,
        bonusMultiplier: 2.1,
        description: '+110% Doanh thu tự động & nhận thưởng tip hậu hĩnh.',
      },
      {
        level: 4,
        name: 'Chuỗi Bún Riêu & Bún Bò Trứ Danh',
        tagline: 'Thương hiệu ẩm thực miền Trung & Nam bộ phủ sóng',
        cost: 45000000,
        requiredReputation: 1400,
        requiredStaff: 3,
        bonusMultiplier: 2.8,
        description: '+180% Doanh thu tự động & chuỗi cung ứng độc quyền.',
      },
      {
        level: 5,
        name: 'Đại Tiệc Ẩm Thực Bún Đẳng Cấp Quốc Gia',
        tagline: 'Đỉnh cao phong vị bún nước lèo truyền đời',
        cost: 95000000,
        requiredReputation: 2500,
        requiredStaff: 4,
        bonusMultiplier: 4.0,
        description: '+300% Doanh thu tự động (Gấp 4 lần doanh thu ban đầu!).',
      },
    ],
    themeColor: '#EA580C',
    accentColor: '#FFEDD5',
    equipmentName: 'Nồi Nước Lèo Sa Tế & Riêu Cua',
    equipmentIcon: '♨️',
    equipmentType: 'bun_pot',
    primaryRecipeIds: ['bun_bo_hue', 'bun_rieu_cua', 'cafe_sua', 'tra_sua'],
    allowedIngredientIds: ['bun_noodle', 'crab_paste', 'bun_broth', 'tofu', 'tomato', 'beef', 'herb', 'coffee', 'tea', 'milk', 'condensed_milk'],
  },
  beefsteak: {
    id: 'beefsteak',
    name: 'Quán Bò Né / Beefsteak Chảo Gang',
    shortName: 'Bò Né & Beefsteak',
    icon: '🥩',
    badge: 'Chảo Gang Xèo Xèo Sang Chảnh',
    tagline: 'Thịt bò mềm mọng, bơ thơm ngào ngạt, trứng ốp la lòng đào sốt tiêu xèo xèo.',
    starterDescription: 'Phục vụ nóng hổi trên chảo gang con bò, giá bán cực cao, lợi nhuận tiền triệu.',
    unlockCost: 28000000,
    requiredReputation: 650,
    requiredStaffCount: 3,
    branchTiers: [
      {
        level: 1,
        name: 'Quán Bò Né Chảo Gang Vỉa Hè',
        tagline: 'Chảo gang hình con bò bốc khói xèo xèo thơm bơ',
        cost: 0,
        requiredReputation: 650,
        requiredStaff: 3,
        bonusMultiplier: 1.0,
        description: 'Doanh thu tự động cơ bản 100%.',
      },
      {
        level: 2,
        name: 'Tiệm Steak Xèo Xèo Phong Cách Mới',
        tagline: 'Dàn bếp ga công suất lớn, nướng bơ xèo xèo không ngừng',
        cost: 18000000,
        requiredReputation: 950,
        requiredStaff: 3,
        bonusMultiplier: 1.5,
        description: '+50% Doanh thu tự động & phục vụ nóng hổi tức thì.',
      },
      {
        level: 3,
        name: 'Nhà Hàng Bò Né Chảo Nóng Phố Tây',
        tagline: 'Rượu vang đỏ và chảo bò hảo hạng thu hút du khách',
        cost: 48000000,
        requiredReputation: 1500,
        requiredStaff: 4,
        bonusMultiplier: 2.2,
        description: '+120% Doanh thu tự động & khách VIP chi trả hào phóng.',
      },
      {
        level: 4,
        name: 'Chuỗi Steakhouse Đẳng Cấp Thượng Lưu',
        tagline: 'Bò nhập khẩu sốt tiêu đen hảo hạng phủ khắp thành phố',
        cost: 110000000,
        requiredReputation: 2500,
        requiredStaff: 4,
        bonusMultiplier: 3.0,
        description: '+200% Doanh thu tự động (x3 lần doanh thu!).',
      },
      {
        level: 5,
        name: 'Dinh Thự Ẩm Thực Bò Né Hoàng Gia',
        tagline: 'Chuỗi nhà hàng beefsteak sang trọng bậc nhất Đông Nam Á',
        cost: 220000000,
        requiredReputation: 4000,
        requiredStaff: 5,
        bonusMultiplier: 4.5,
        description: '+350% Doanh thu tự động cực đại!',
      },
    ],
    themeColor: '#9333EA',
    accentColor: '#F3E8FF',
    equipmentName: 'Bếp Ga Chảo Gang Xèo Xèo',
    equipmentIcon: '🍳',
    equipmentType: 'steak_pan',
    primaryRecipeIds: ['bo_ne_op_la', 'beefsteak_sot_tieu', 'cafe_sua', 'tra_dao'],
    allowedIngredientIds: ['beef', 'egg', 'bread', 'pate', 'butter', 'potato', 'pepper_sauce', 'cucumber', 'coffee', 'tea'],
  },
  com_tam: {
    id: 'com_tam',
    name: 'Quán Cơm Tấm Sườn Bì Chả',
    shortName: 'Cơm Tấm',
    icon: '🍛',
    badge: 'Món Ăn Quốc Dân Sài Gòn',
    tagline: 'Khói than nướng sườn thơm nức mũi, chả trứng béo ngậy, mỡ hành óng ánh.',
    starterDescription: 'Mùi khói than nướng sườn bay xa hàng trăm mét hút khách từ sáng tới khuya!',
    unlockCost: 70000000,
    requiredReputation: 1200,
    requiredStaffCount: 4,
    branchTiers: [
      {
        level: 1,
        name: 'Quầy Cơm Tấm Khói Than Lề Đường',
        tagline: 'Mùi sườn nướng quạt than thơm nức cả góc phố',
        cost: 0,
        requiredReputation: 1200,
        requiredStaff: 4,
        bonusMultiplier: 1.0,
        description: 'Doanh thu tự động cơ bản 100%.',
      },
      {
        level: 2,
        name: 'Quán Cơm Tấm Sườn Mỡ Hành Nức Tiếng',
        tagline: 'Khách xếp hàng dài mua mang đi và ăn tại chỗ',
        cost: 45000000,
        requiredReputation: 1800,
        requiredStaff: 4,
        bonusMultiplier: 1.55,
        description: '+55% Doanh thu tự động & khách đông nghẹt từ sáng đến đêm.',
      },
      {
        level: 3,
        name: 'Cửa Hàng Cơm Tấm Sài Gòn Không Ngủ',
        tagline: 'Xửng hấp cơm tấm khổng lồ, sườn ướp mật ong vàng óng',
        cost: 110000000,
        requiredReputation: 2800,
        requiredStaff: 5,
        bonusMultiplier: 2.3,
        description: '+130% Doanh thu tự động & phục vụ 24/7.',
      },
      {
        level: 4,
        name: 'Chuỗi Cơm Tấm Sườn Cọng Thượng Hạng',
        tagline: 'Biểu tượng ẩm thực đường phố Sài Gòn hiện đại',
        cost: 220000000,
        requiredReputation: 4200,
        requiredStaff: 5,
        bonusMultiplier: 3.2,
        description: '+220% Doanh thu tự động doanh số tiền tỷ.',
      },
      {
        level: 5,
        name: 'Kỳ Lân Cơm Tấm Quốc Bảo Việt Nam',
        tagline: 'Đỉnh cao đế chế kinh doanh ẩm thực vỉa hè đạt quy mô huyền thoại',
        cost: 450000000,
        requiredReputation: 6500,
        requiredStaff: 6,
        bonusMultiplier: 5.0,
        description: '+400% Doanh thu tự động (Gấp 5 lần doanh thu ban đầu!).',
      },
    ],
    themeColor: '#16A34A',
    accentColor: '#DCFCE7',
    equipmentName: 'Lò Nướng Than Hồng & Xửng Hấp Cơm',
    equipmentIcon: '🔥',
    equipmentType: 'grill',
    primaryRecipeIds: ['com_tam_suon', 'com_tam_suon_bi_cha', 'cafe_sua', 'tra_dao'],
    allowedIngredientIds: ['broken_rice', 'pork_rib', 'scallion_oil', 'egg', 'cucumber', 'herb', 'coffee', 'tea'],
  },
};

export const CUSTOMER_TYPES: Record<string, CustomerType> = {
  student: {
    id: 'student',
    name: 'Bạn Học Sinh / Sinh Viên',
    description: 'Rất thích đồ ăn nhanh, trà sữa ngọt ngào và giá cả phải chăng.',
    spriteKey: 'customer_student',
    patienceSeconds: 35,
    tipRate: 0.05,
    favoriteRecipeIds: ['banh_mi_trung', 'tra_sua'],
  },
  office_worker: {
    id: 'office_worker',
    name: 'Anh Chị Dân Văn Phòng',
    description: 'Cần nạp năng lượng nhanh vào buổi sáng, chuộng cà phê sữa đá.',
    spriteKey: 'customer_office',
    patienceSeconds: 25,
    tipRate: 0.15,
    favoriteRecipeIds: ['cafe_sua', 'banh_mi_thit'],
  },
  food_lover: {
    id: 'food_lover',
    name: 'Tín Đồ Ẩm Thực',
    description: 'Sẵn sàng chờ đợi để thưởng thức bánh mì đặc biệt nhiều topping.',
    spriteKey: 'customer_gourmet',
    patienceSeconds: 45,
    tipRate: 0.25,
    favoriteRecipeIds: ['banh_mi_dac_biet'],
  },
  neighborhood: {
    id: 'neighborhood',
    name: 'Bác Hàng Xóm Thân Thiện',
    description: 'Khách quen tính tình vui vẻ, thích ngồi chill thưởng trà hoặc ăn sáng.',
    spriteKey: 'customer_neighbor',
    patienceSeconds: 50,
    tipRate: 0.1,
    favoriteRecipeIds: ['banh_mi_trung', 'cafe_sua', 'tra_sua'],
  },
};

export interface StageUpgradeCatalog {
  stageId: BusinessStageId;
  stageName: string;
  stageIcon: string;
  stageTagline: string;
  baseStorage: number;
  baseCookSpeed: number;
  baseSpawnRate: number;
  basePatience: number;
  baseTipRate: number;
  baseDeliveryBonus: number;
  baseRepBonus: number;
  upgrades: ShopUpgrade[];
}

export const STAGE_SHOP_UPGRADES: Record<BusinessStageId, StageUpgradeCatalog> = {
  // === KỶ NGUYÊN 1: XE ĐẨY LỀ ĐƯỜNG 🛒 ===
  cart: {
    stageId: 'cart',
    stageName: 'Xe Đẩy Lề Đường',
    stageIcon: '🛒',
    stageTagline: 'Khởi đầu mộc mạc vỉa hè với xe nhôm kính và ghế nhựa',
    baseStorage: 100,
    baseCookSpeed: 0.0,
    baseSpawnRate: 0.0,
    basePatience: 0,
    baseTipRate: 0.0,
    baseDeliveryBonus: 0.0,
    baseRepBonus: 0.0,
    upgrades: [
      {
        id: 'cozy_storage',
        name: 'Thùng & Ngăn Chứa Xe Đẩy',
        icon: '📦',
        description: 'Mở rộng ngăn chứa nguyên liệu trên xe đẩy (Tối đa 250 ô).',
        cost: 30000,
        level: 0,
        maxLevel: 5,
        category: 'storage',
        effect: { type: 'storage_capacity', value: 25 },
        tiers: [
          { level: 1, title: 'Thùng Xốp Đựng Đá Ướp Lạnh', cost: 30000, effectValue: 25, description: '+25 ô kho (Đạt 125 ô), giữ pate rau củ tươi mát cả buổi.' },
          { level: 2, title: 'Thùng Nhựa Đại Có Quai Xách', cost: 70000, effectValue: 25, description: '+25 ô kho (Đạt 150 ô), chia ngăn gia vị bánh mì gọn gàng.' },
          { level: 3, title: 'Thùng Giữ Nhiệt 3 Lớp Inox', cost: 140000, effectValue: 30, description: '+30 ô kho (Đạt 180 ô), trữ thịt chả không sợ ôi thiu.' },
          { level: 4, title: 'Kệ Gỗ Đóng Thêm Hông Xe Đẩy', cost: 250000, effectValue: 30, description: '+30 ô kho (Đạt 210 ô), xếp bánh mì và nước sốt ngăn nắp.' },
          { level: 5, title: 'Tủ Nhôm Kính Kín Gió Tinh Tế', cost: 420000, effectValue: 40, description: '+40 ô kho (Đạt 250 ô - Max Xe Đẩy), bảo quản tối đa trên xe đẩy!' },
        ],
      },
      {
        id: 'modern_stove',
        name: 'Bếp Nướng & Khò Xe Đẩy',
        icon: '⚡',
        description: 'Tăng tốc độ nướng bánh mì và làm nóng món ăn.',
        cost: 35000,
        level: 0,
        maxLevel: 5,
        category: 'kitchen',
        effect: { type: 'cook_speed', value: 0.08 },
        tiers: [
          { level: 1, title: 'Bếp Gas Mini Du Lịch Chống Gió', cost: 35000, effectValue: 0.08, description: 'Giảm 8% thời gian chế biến, lửa đều không tắt khi có gió.' },
          { level: 2, title: 'Bếp Gas Đơn Đánh Lửa Magneto', cost: 80000, effectValue: 0.09, description: 'Giảm thêm 9% thời gian nấu, chiên trứng ốp la nhanh giòn.' },
          { level: 3, title: 'Đầu Khò Lửa Cầm Tay Tiện Dụng', cost: 160000, effectValue: 0.10, description: 'Giảm thêm 10% thời gian nấu, khò phô mai và thịt thơm lừng.' },
          { level: 4, title: 'Bếp Gas Đôi Lửa Xanh Tiết Kiệm', cost: 280000, effectValue: 0.10, description: 'Giảm thêm 10% thời gian nấu, thao tác 2 chảo cùng lúc.' },
          { level: 5, title: 'Bếp Khè Vỉa Hè Chế Lại Siêu Tốc', cost: 450000, effectValue: 0.11, description: 'Giảm thêm 11% thời gian nấu (Tổng +48%), tốc độ ra món vèo vèo!' },
        ],
      },
      {
        id: 'flower_signboard',
        name: 'Bảng Hiệu & Đèn Bão Xe Đẩy',
        icon: '🌸',
        description: 'Trang trí xe đẩy bắt mắt, thu hút khách đi đường ghé mua.',
        cost: 30000,
        level: 0,
        maxLevel: 5,
        category: 'marketing',
        effect: { type: 'attract_customers', value: 0.08 },
        tiers: [
          { level: 1, title: 'Bìa Carton Viết Bút Lông Dạ Đỏ', cost: 30000, effectValue: 0.08, description: 'Khách đi đường ghé nhanh hơn 8% nhờ chữ viết to rõ nét.' },
          { level: 2, title: 'Đèn Bão Treo Móc Xe Đêm Tối', cost: 75000, effectValue: 0.09, description: 'Khách ghé nhanh hơn 9%, rực sáng một góc vỉa hè buổi tối.' },
          { level: 3, title: 'Biển Bạt Mini In Hình Món Hấp Dẫn', cost: 150000, effectValue: 0.10, description: 'Khách ghé nhanh hơn 10%, hình ảnh món ăn kích thích vị giác.' },
          { level: 4, title: 'Dây Đèn Nháy Nhiều Màu Quấn Xe', cost: 260000, effectValue: 0.11, description: 'Khách ghé nhanh hơn 11%, xe đẩy lung linh nổi bật nhất phố.' },
          { level: 5, title: 'Bảng Đèn LED Nhỏ Sạc Bình Ắc-quy', cost: 420000, effectValue: 0.12, description: 'Khách ghé nhanh hơn 12% (Tổng +50%), khách đông nườm nượp!' },
        ],
      },
      {
        id: 'seating_comfort',
        name: 'Ghế Nhựa Vỉa Hè Tiện Lợi',
        icon: '🪑',
        description: 'Chỗ ngồi tạm ven đường giúp khách thoải mái chờ đợi.',
        cost: 25000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'customer_patience', value: 3 },
        tiers: [
          { level: 1, title: 'Ghế Nhựa Lùn Xanh Dương Song Long', cost: 25000, effectValue: 3, description: '+3s thời gian khách kiên nhẫn ngồi chờ lấy món.' },
          { level: 2, title: 'Ghế Nhựa Đỏ Dày Đỡ Mỏi Lưng', cost: 60000, effectValue: 3, description: '+3s kiên nhẫn, ngồi chắc chắn không sợ gãy lún.' },
          { level: 3, title: 'Bàn Nhựa Vuông Ăn Uống Đỡ Vướng', cost: 130000, effectValue: 3, description: '+3s kiên nhẫn, có chỗ đặt ly trà đá mát rượi.' },
          { level: 4, title: 'Bàn Xếp Inox Dã Chiến Sạch Sẽ', cost: 230000, effectValue: 3, description: '+3s kiên nhẫn, bàn sáng bóng tạo thiện cảm.' },
          { level: 5, title: 'Bộ Ghế Xếp Dù Mini Thoải Mái', cost: 380000, effectValue: 3, description: '+3s kiên nhẫn (Tổng +15s), khách vui vẻ chờ đợi không hối thúc!' },
        ],
      },
      {
        id: 'dishware_premium',
        name: 'Bao Gói & Dụng Cụ Bánh Mì',
        icon: '🍽️',
        description: 'Đóng gói sạch sẽ, khách hài lòng boa thêm tiền tip.',
        cost: 25000,
        level: 0,
        maxLevel: 5,
        category: 'service',
        effect: { type: 'tip_rate', value: 0.05 },
        tiers: [
          { level: 1, title: 'Túi Giấy Xi-Măng Thân Thiện Môi Trường', cost: 25000, effectValue: 0.05, description: '+5% tiền tip boa từ khách vì bọc bánh mì sạch đẹp.' },
          { level: 2, title: 'Dĩa Nhựa Phíp Dày Dặn Ăn Tại Chỗ', cost: 60000, effectValue: 0.05, description: '+5% tiền tip, món ăn bày biện gọn gàng.' },
          { level: 3, title: 'Đũa Muỗng Dùng Một Lần Cao Cấp', cost: 120000, effectValue: 0.05, description: '+5% tiền tip, vệ sinh tiện lợi cho khách văn phòng.' },
          { level: 4, title: 'Muỗng Nĩa Inox Cầm Đầm Chắc Tay', cost: 220000, effectValue: 0.05, description: '+5% tiền tip, cảm giác dùng bữa xịn sò hơn hẳn.' },
          { level: 5, title: 'Khay Bưng Nhựa Giả Gỗ Sạch Sẽ', cost: 380000, effectValue: 0.05, description: '+5% tiền tip (Tổng +25% tip), khách thường xuyên thưởng thêm!' },
        ],
      },
      {
        id: 'delivery_fleet',
        name: 'Đồ Nghề Giao Hàng Bằng Xe Máy',
        icon: '🛵',
        description: 'Trang bị giao hàng đơn giản cho đơn mang đi.',
        cost: 25000,
        level: 0,
        maxLevel: 5,
        category: 'logistics',
        effect: { type: 'delivery_bonus', value: 0.05 },
        tiers: [
          { level: 1, title: 'Túi Xốp 2 Quai Buộc Chắc Ghi-đông', cost: 25000, effectValue: 0.05, description: '+5% thưởng đơn giao hàng mang đi an toàn.' },
          { level: 2, title: 'Túi Giữ Nhiệt Lót Bạc Ghi Đông', cost: 60000, effectValue: 0.05, description: '+5% thưởng đơn, bánh mì giữ độ nóng giòn khi tới tay.' },
          { level: 3, title: 'Thùng Xốp Nhỏ Cột Đuôi Xe Máy', cost: 120000, effectValue: 0.06, description: '+6% thưởng đơn, chở được nhiều ổ bánh một chuyến.' },
          { level: 4, title: 'Dây Ràng Chun Bản To Siêu Chắc', cost: 220000, effectValue: 0.06, description: '+6% thưởng đơn, phóng nhanh qua ổ gà không lo đổ súp.' },
          { level: 5, title: 'Thùng Nhựa Xếp Gọn Sau Xe Máy', cost: 380000, effectValue: 0.06, description: '+6% thưởng đơn (Tổng +28%), shipper giao nhanh thưởng cao!' },
        ],
      },
      {
        id: 'sound_ambience',
        name: 'Đài Radio & Âm Thanh Vỉa Hè',
        icon: '🎵',
        description: 'Tạo không khí vỉa hè vui tươi, nhận thêm sao uy tín ⭐.',
        cost: 25000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'reputation_boost', value: 0.05 },
        tiers: [
          { level: 1, title: 'Đài Radio Cũ Nghe Thời Sự Buổi Sáng', cost: 25000, effectValue: 0.05, description: '+5% tỷ lệ nhận sao uy tín ⭐ từ các bác hàng xóm.' },
          { level: 2, title: 'Loa Bluetooth Cầm Tay Nhỏ Nhắn', cost: 60000, effectValue: 0.05, description: '+5% nhận sao uy tín, phát nhạc trẻ thu hút sinh viên.' },
          { level: 3, title: 'Nhạc Điện Thoại Tuyển Tập Hot TikTok', cost: 120000, effectValue: 0.05, description: '+5% nhận sao uy tín, quán luôn sôi động tràn ngập niềm vui.' },
          { level: 4, title: 'Loa Thùng Mini Đặt Góc Xe Đẩy', cost: 220000, effectValue: 0.05, description: '+5% nhận sao uy tín, tiếng nhạc lan tỏa khắp đoạn phố.' },
          { level: 5, title: 'Loa Kẹo Kéo Vỉa Hè Hát Bolero Vui Nhộn', cost: 380000, effectValue: 0.06, description: '+6% nhận sao uy tín (Tổng +26%), quán thân thiện cả phố yêu mến!' },
        ],
      },
      {
        id: 'extra_tables',
        name: 'Kê Thêm Bàn Ăn Lề Đường',
        icon: '🪑',
        description: 'Kê thêm bàn nhựa đón khách giờ cao điểm (Tối đa 3 bàn).',
        cost: 200000,
        level: 0,
        maxLevel: 1,
        category: 'kitchen',
        effect: { type: 'add_table', value: 1 },
        tiers: [
          { level: 1, title: 'Kê Thêm Bàn Nhựa Số 3 (Vỉa Hè Bên Cạnh)', cost: 200000, effectValue: 1, description: 'Mở thêm Bàn 3 phục vụ đồng thời 3 nhóm thực khách!' },
        ],
      },
    ],
  },

  // === KỶ NGUYÊN 2: GÓC CÂY ME / QUÁN CÓC 🌳 ===
  corner: {
    stageId: 'corner',
    stageName: 'Góc Cây Me / Quán Cóc',
    stageIcon: '🌳',
    stageTagline: 'Quán cóc râm mát bóng cây, dù che nắng mưa và bàn gỗ mộc mạc',
    baseStorage: 250, // Kế thừa đỉnh cao từ Xe Đẩy
    baseCookSpeed: 0.30,
    baseSpawnRate: 0.35,
    basePatience: 10,
    baseTipRate: 0.15,
    baseDeliveryBonus: 0.18,
    baseRepBonus: 0.18,
    upgrades: [
      {
        id: 'cozy_storage',
        name: 'Tủ Mát & Ngăn Trữ Quán Cóc',
        icon: '📦',
        description: 'Mở rộng tủ bảo quản tại quán cóc (Tối đa 450 ô).',
        cost: 250000,
        level: 0,
        maxLevel: 5,
        category: 'storage',
        effect: { type: 'storage_capacity', value: 35 },
        tiers: [
          { level: 1, title: 'Tủ Mát Mini Dưới Gốc Cây Sanaky', cost: 250000, effectValue: 35, description: '+35 ô kho (Đạt 285 ô), giữ nước ngọt và pate lạnh buốt.' },
          { level: 2, title: 'Tủ Đông Nằm 1 Ngăn Nhỏ 100L', cost: 550000, effectValue: 40, description: '+40 ô kho (Đạt 325 ô), trữ thịt bò, sườn heo tươi rói.' },
          { level: 3, title: 'Kệ Sắt V Lỗ Chống Chuột Thông Thoáng', cost: 1000000, effectValue: 40, description: '+40 ô kho (Đạt 365 ô), bảo quản bột mì, bánh mì khô ráo.' },
          { level: 4, title: 'Tủ Mát Cánh Kính Đèn LED Trưng Bày', cost: 1800000, effectValue: 40, description: '+40 ô kho (Đạt 405 ô), khách nhìn thấy topping bắt mắt thèm thuồng.' },
          { level: 5, title: 'Tủ Đông 2 Chế Độ Đông - Mát Quán Cóc', cost: 2800000, effectValue: 45, description: '+45 ô kho (Đạt 450 ô - Max Quán Cóc), kho hàng rộng rãi không lo cạn hàng!' },
        ],
      },
      {
        id: 'modern_stove',
        name: 'Hệ Bếp Á & Nồi Hầm Quán Cóc',
        icon: '⚡',
        description: 'Bếp khò công suất vừa, nấu nước dùng và chiên xào nhanh chóng.',
        cost: 280000,
        level: 0,
        maxLevel: 5,
        category: 'kitchen',
        effect: { type: 'cook_speed', value: 0.10 },
        tiers: [
          { level: 1, title: 'Bếp Á 1 Họng Gang Khè Áp Lực', cost: 280000, effectValue: 0.10, description: 'Giảm thêm 10% thời gian nấu, lửa khò xanh biếc xào chín tức thì.' },
          { level: 2, title: 'Quạt Hút Khói Gốc Cây Thoáng Khí', cost: 650000, effectValue: 0.10, description: 'Giảm thêm 10% thời gian nấu, đầu bếp đứng nấu không bị cay mắt.' },
          { level: 3, title: 'Nồi Nấu Nước Lèo Cách Thủy Tiết Kiệm', cost: 1200000, effectValue: 0.11, description: 'Giảm thêm 11% thời gian nấu, nước dùng sôi sùng sục cả ngày.' },
          { level: 4, title: 'Bếp Chiên Nhúng Đơn Chống Khét', cost: 2000000, effectValue: 0.12, description: 'Giảm thêm 12% thời gian nấu, chả lụa và tóp mỡ vàng rụm.' },
          { level: 5, title: 'Cụm Bếp Khè Đôi Công Nghiệp Chuyên Dụng', cost: 3200000, effectValue: 0.12, description: 'Giảm thêm 12% thời gian nấu (Tổng +85%), phục vụ liên tục không nghỉ!' },
        ],
      },
      {
        id: 'flower_signboard',
        name: 'Biển Hiệu Gỗ & Dù Che Mát Quán',
        icon: '🌸',
        description: 'Không gian góc cây me rực rỡ, khách ghé quán đông đúc.',
        cost: 250000,
        level: 0,
        maxLevel: 5,
        category: 'marketing',
        effect: { type: 'attract_customers', value: 0.12 },
        tiers: [
          { level: 1, title: 'Biển Gỗ Mộc Treo Cành Cây Me', cost: 250000, effectValue: 0.12, description: 'Khách ghé nhanh hơn 12%, biển gỗ phong cách xưa thơ mộng.' },
          { level: 2, title: 'Dây Đèn Lồng Treo Râm Mát Buổi Trưa', cost: 60000, effectValue: 0.12, description: 'Khách ghé nhanh hơn 12%, góc phố chill mát hút dân văn phòng.' },
          { level: 3, title: 'Bảng Menu Huỳnh Quang Dạ Quang Đêm', cost: 1100000, effectValue: 0.14, description: 'Khách ghé nhanh hơn 14%, thực đơn phát sáng rực rỡ từ xa.' },
          { level: 4, title: 'Hộp Đèn Tròn Hút Nổi Si-bô Nhận Diện', cost: 1900000, effectValue: 0.16, description: 'Khách ghé nhanh hơn 16%, thương hiệu quán cóc dần thành quen thuộc.' },
          { level: 5, title: 'Biển Đèn LED Hai Mặt Đón Khách 2 Chiều', cost: 3000000, effectValue: 0.16, description: 'Khách ghé nhanh hơn 16% (Tổng +105%), khách đến không ngớt tay!' },
        ],
      },
      {
        id: 'seating_comfort',
        name: 'Bàn Ghế Gỗ & Dù Che Nắng',
        icon: '🪑',
        description: 'Bóng mát gốc cây cùng bàn gỗ giúp khách thư thái ngồi lâu.',
        cost: 220000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'customer_patience', value: 4 },
        tiers: [
          { level: 1, title: 'Ghế Đẩu Gỗ Cà Phê Mộc Mạc', cost: 220000, effectValue: 4, description: '+4s khách kiên nhẫn, ngồi tán gẫu ngắm phố phường.' },
          { level: 2, title: 'Bàn Gỗ Thông Tự Nhiên Rộng Rãi', cost: 520000, effectValue: 4, description: '+4s khách kiên nhẫn, để được nhiều đĩa đồ ăn thoải mái.' },
          { level: 3, title: 'Dù Lệch Tâm 3m Che Nắng Râm Mát', cost: 1000000, effectValue: 4, description: '+4s khách kiên nhẫn, che trọn bóng râm tránh nắng gắt trưa hè.' },
          { level: 4, title: 'Quạt Hơi Nước Xua Tan Nóng Bức', cost: 1800000, effectValue: 5, description: '+5s khách kiên nhẫn, gió mát rượi phe phẩy khoan khoái.' },
          { level: 5, title: 'Góc Trà Đạo Cây Xanh Mát Rượi Chữa Lành', cost: 2800000, effectValue: 5, description: '+5s khách kiên nhẫn (Tổng +32s), khách ngồi thưởng thức thư thái!' },
        ],
      },
      {
        id: 'dishware_premium',
        name: 'Bộ Đĩa Phíp & Ly Trà Đá Cóc',
        icon: '🍽️',
        description: 'Trình bày đậm chất quán cóc Sài Gòn xưa, khách boa tiền đều đặn.',
        cost: 220000,
        level: 0,
        maxLevel: 5,
        category: 'service',
        effect: { type: 'tip_rate', value: 0.06 },
        tiers: [
          { level: 1, title: 'Bộ Dĩa Nhựa Melamine Chống Trầy Cao Cấp', cost: 220000, effectValue: 0.06, description: '+6% tiền boa tip, dĩa phíp sạch sáng bóng.' },
          { level: 2, title: 'Ly Thủy Tinh Khía Uống Trà Đá Đã Khát', cost: 500000, effectValue: 0.06, description: '+6% tiền boa, trà đá mát lạnh làm hài lòng thực khách.' },
          { level: 3, title: 'Ống Đũa Inox Có Nắp Đậy Khử Trùng', cost: 950000, effectValue: 0.07, description: '+7% tiền boa, vệ sinh an toàn tạo niềm tin tuyệt đối.' },
          { level: 4, title: 'Bộ Hũ Gia Vị Thủy Tinh Nắp Gỗ Vintage', cost: 1700000, effectValue: 0.08, description: '+8% tiền boa, ớt ngâm tỏi tương ớt chỉn chu.' },
          { level: 5, title: 'Khay Nhôm Dày Sáng Bóng Chuẩn Quán Xưa', cost: 2800000, effectValue: 0.09, description: '+9% tiền boa (Tổng +51% tip), khách rút ví boa không ngần ngại!' },
        ],
      },
      {
        id: 'delivery_fleet',
        name: 'Thùng Ship Xe Máy & Liên Minh Shipper',
        icon: '🛵',
        description: 'Mở rộng đội giao hàng quen mặt khu phố.',
        cost: 220000,
        level: 0,
        maxLevel: 5,
        category: 'logistics',
        effect: { type: 'delivery_bonus', value: 0.07 },
        tiers: [
          { level: 1, title: 'Thùng Giao Hàng Bọc Bạt 30L Sau Xe', cost: 220000, effectValue: 0.07, description: '+7% tiền thưởng ship, thùng chống mưa hắt bảo vệ món ăn.' },
          { level: 2, title: 'Túi Khí Chống Sốc Chống Đổ Nước Lèo', cost: 500000, effectValue: 0.07, description: '+7% tiền thưởng ship, bát nước dùng nguyên vẹn không tràn ra ngoài.' },
          { level: 3, title: 'Bình Thủy Giữ Nóng Nước Dùng 5L', cost: 950000, effectValue: 0.08, description: '+8% tiền thưởng ship, nước súp giao tới nơi vẫn bốc khói nghi ngút.' },
          { level: 4, title: 'Thùng Đôi Phân Loại Nóng & Lạnh Riêng', cost: 1700000, effectValue: 0.09, description: '+9% tiền thưởng ship, bánh mì nóng giòn đi kèm cà phê đá mát lạnh.' },
          { level: 5, title: 'Liên Minh Shipper Quen Mặt Nhanh Nhẹn', cost: 2800000, effectValue: 0.11, description: '+11% tiền thưởng ship (Tổng +60%), giao hàng thần tốc trong ngõ ngách!' },
        ],
      },
      {
        id: 'sound_ambience',
        name: 'Loa Kẹo Kéo Bolero Quán Cóc',
        icon: '🎵',
        description: 'Âm nhạc trữ tình lắng đọng, tạo điểm đến quen thuộc của cả xóm.',
        cost: 220000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'reputation_boost', value: 0.07 },
        tiers: [
          { level: 1, title: 'Loa Kẹo Kéo Tiếng Ấm Bass Dày Vừa Vặn', cost: 220000, effectValue: 0.07, description: '+7% sao uy tín ⭐, âm lượng vừa phải không gây ồn ào lối xóm.' },
          { level: 2, title: 'Tuyển Tập Nhạc Trịnh & Bolero Say Đắm Lòng Người', cost: 500000, effectValue: 0.07, description: '+7% sao uy tín, khách vừa ăn vừa nhịp chân theo điệu nhạc.' },
          { level: 3, title: 'Cặp Loa Treo Thân Cây Âm Thanh Vòm Tự Nhiên', cost: 950000, effectValue: 0.08, description: '+8% sao uy tín, giai điệu phủ đều dưới bóng cây mát rượi.' },
          { level: 4, title: 'Bộ Micro Không Dây Giao Lưu Cùng Thực Khách', cost: 1700000, effectValue: 0.09, description: '+9% sao uy tín, tiếng cười rộn rã gắn kết tình làng nghĩa xóm.' },
          { level: 5, title: 'Không Khí Quán Cóc Rôm Rả Hút Hồn Cả Khu Phố', cost: 2800000, effectValue: 0.11, description: '+11% sao uy tín (Tổng +60%), quán cóc trở thành biểu tượng khu phố!' },
        ],
      },
      {
        id: 'extra_tables',
        name: 'Kê Thêm Bàn Gỗ Quán Cóc',
        icon: '🪑',
        description: 'Kê thêm bàn gỗ dưới tán cây (Tối đa 4 bàn).',
        cost: 1200000,
        level: 0,
        maxLevel: 1,
        category: 'kitchen',
        effect: { type: 'add_table', value: 1 },
        tiers: [
          { level: 1, title: 'Kê Thêm Bàn Gỗ Quán Cóc Số 4 (Dưới Bóng Cây Me)', cost: 1200000, effectValue: 1, description: 'Mở thêm Bàn 4 phục vụ cùng lúc 4 nhóm khách ngồi chill mát!' },
        ],
      },
    ],
  },

  // === KỶ NGUYÊN 3: TIỆM MÁI HIÊN BÌNH DÂN 🏮 ===
  awning: {
    stageId: 'awning',
    stageName: 'Tiệm Mái Hiên Bình Dân',
    stageIcon: '🏮',
    stageTagline: 'Mặt bằng kiên cố, mái hiên di động che mưa nắng, bàn inox sáng bóng',
    baseStorage: 450, // Kế thừa đỉnh cao từ Quán Cóc
    baseCookSpeed: 0.60,
    baseSpawnRate: 0.70,
    basePatience: 20,
    baseTipRate: 0.30,
    baseDeliveryBonus: 0.35,
    baseRepBonus: 0.35,
    upgrades: [
      {
        id: 'cozy_storage',
        name: 'Tủ Đông & Phòng Kho Mát Tiệm',
        icon: '📦',
        description: 'Mở rộng kho bảo quản đạt chuẩn an toàn thực phẩm (Tối đa 900 ô).',
        cost: 1500000,
        level: 0,
        maxLevel: 5,
        category: 'storage',
        effect: { type: 'storage_capacity', value: 70 },
        tiers: [
          { level: 1, title: 'Tủ Mát 2 Cánh Kính Cường Lực Alaska', cost: 1500000, effectValue: 70, description: '+70 ô kho (Đạt 520 ô), trữ hàng trăm nguyên liệu tươi ngon.' },
          { level: 2, title: 'Tủ Đông Đứng 4 Ngăn Độc Lập Chống Mùi', cost: 3200000, effectValue: 80, description: '+80 ô kho (Đạt 600 ô), phân loại thịt cá nước sốt riêng biệt.' },
          { level: 3, title: 'Phòng Kho Mát Tiệt Trùng Ozon Nhỏ Sau Tiệm', cost: 5800000, effectValue: 90, description: '+90 ô kho (Đạt 690 ô), không khí tuần hoàn giữ thực phẩm tươi mới.' },
          { level: 4, title: 'Dàn Giá Kệ Inox 304 Dày Chịu Tải 500kg', cost: 9500000, effectValue: 100, description: '+100 ô kho (Đạt 790 ô), xếp bao bột gạo, thùng gia vị đồ hộp.' },
          { level: 5, title: 'Tủ Cấp Đông Nhanh Chuẩn F&B Chuyên Nghiệp', cost: 15000000, effectValue: 110, description: '+110 ô kho (Đạt 900 ô - Max Mái Hiên), kho thực phẩm dồi dào sẵn sàng đón bão khách!' },
        ],
      },
      {
        id: 'modern_stove',
        name: 'Hệ Bếp Á Công Suất & Nồi Hầm Điện',
        icon: '⚡',
        description: 'Bếp đôi đánh lửa tự động, nấu nhanh và tiết kiệm nhiên liệu.',
        cost: 1800000,
        level: 0,
        maxLevel: 5,
        category: 'kitchen',
        effect: { type: 'cook_speed', value: 0.15 },
        tiers: [
          { level: 1, title: 'Bếp Á 2 Họng Đánh Lửa Tự Động Cao Cấp', cost: 1800000, effectValue: 0.15, description: 'Giảm thêm 15% thời gian nấu, ngọn lửa xanh cuốn xoáy chín đều.' },
          { level: 2, title: 'Nồi Hầm Điện Áp Suất Giữ Nhiệt 80L', cost: 3800000, effectValue: 0.15, description: 'Giảm thêm 15% thời gian nấu, ninh xương nhừ tơi trong thời gian kỷ lục.' },
          { level: 3, title: 'Chảo Đảo Xào Bán Tự Động Chống Dính', cost: 7000000, effectValue: 0.18, description: 'Giảm thêm 18% thời gian nấu, xào thịt bò giòn mềm chỉ trong 10 giây.' },
          { level: 4, title: 'Bếp Từ Nhập Khẩu 3500W Siêu Tiết Kiệm', cost: 12000000, effectValue: 0.20, description: 'Giảm thêm 20% thời gian nấu, điều khiển nhiệt độ chính xác từng độ C.' },
          { level: 5, title: 'Hệ Thống Bếp Khò 4 Họng Chuyên Dụng Nhà Nghề', cost: 18000000, effectValue: 0.22, description: 'Giảm thêm 22% thời gian nấu (Tổng +150%), phục vụ tốc độ siêu bão!' },
        ],
      },
      {
        id: 'flower_signboard',
        name: 'Bạt Mái Hiên & Đèn LED Mặt Tiền',
        icon: '🌸',
        description: 'Mặt bằng sáng bừng cả góc phố, khách chen chúc xếp hàng.',
        cost: 1600000,
        level: 0,
        maxLevel: 5,
        category: 'marketing',
        effect: { type: 'attract_customers', value: 0.15 },
        tiers: [
          { level: 1, title: 'Bạt Mái Hiên Tự Động In Logo Sắc Nét', cost: 1600000, effectValue: 0.15, description: 'Khách ghé nhanh hơn 15%, tiệm che kín mưa nắng khang trang.' },
          { level: 2, title: 'Dàn Đèn Pha LED Chiếu Rọi Mặt Tiền Sáng Rực', cost: 3500000, effectValue: 0.17, description: 'Khách ghé nhanh hơn 17%, đứng cách 200m vẫn thấy biển tiệm sáng ngời.' },
          { level: 3, title: 'Biển Chữ Nổi Mica Có Đèn LED Hắt Sáng Chân', cost: 6500000, effectValue: 0.20, description: 'Khách ghé nhanh hơn 20%, vẻ ngoài hiện đại uy tín vượt trội.' },
          { level: 4, title: 'Màn Hình TV Trình Chiếu Video Nấu Món Hấp Dẫn', cost: 11000000, effectValue: 0.23, description: 'Khách ghé nhanh hơn 23%, người đi đường dừng xe ngắm nhìn thòm thèm.' },
          { level: 5, title: 'Hộp Đèn Siêu Sáng Đẳng Cấp Phố Ăn Uống Nổi Tiếng', cost: 17000000, effectValue: 0.25, description: 'Khách ghé nhanh hơn 25% (Tổng +170%), tiệm trở thành điểm hẹn số 1 trên phố!' },
        ],
      },
      {
        id: 'seating_comfort',
        name: 'Bàn Inox & Quạt Trần Đảo Mát',
        icon: '🪑',
        description: 'Bàn ghế inox chắc chắn, quạt gió làm mát khắp không gian tiệm.',
        cost: 1400000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'customer_patience', value: 5 },
        tiers: [
          { level: 1, title: 'Bàn Inox Chân Tròn Chắc Chắn Không Rung Lắc', cost: 1400000, effectValue: 5, description: '+5s khách kiên nhẫn, bàn sáng bóng lau sạch trong 1 giây.' },
          { level: 2, title: 'Ghế Tựa Lưng Có Đệm Ngồi Êm Ái Chống Mỏi', cost: 3000000, effectValue: 5, description: '+5s khách kiên nhẫn, ngồi ăn thoải mái như ở nhà.' },
          { level: 3, title: 'Dàn Quạt Đảo Trần Mát Rượi Toàn Không Gian Tiệm', cost: 5800000, effectValue: 6, description: '+6s khách kiên nhẫn, gió đối lưu thoáng mát xua tan oi ả.' },
          { level: 4, title: 'Hệ Thống Đèn Vàng Ấm Cúng & Gối Tựa Lưng', cost: 10000000, effectValue: 7, description: '+7s khách kiên nhẫn, tạo cảm giác sum vầy ấm cúng gia đình.' },
          { level: 5, title: 'Khu Bàn Dài Tiệc Nhỏ Cho Hội Nhóm & Gia Đình', cost: 16000000, effectValue: 7, description: '+7s khách kiên nhẫn (Tổng +50s), thực khách ngồi lâu gọi thêm nhiều món!' },
        ],
      },
      {
        id: 'dishware_premium',
        name: 'Bát Đĩa Sứ Trắng & Đũa Gỗ Mun',
        icon: '🍽️',
        description: 'Dụng cụ sứ sáng bóng nâng tầm trải nghiệm món ăn.',
        cost: 1400000,
        level: 0,
        maxLevel: 5,
        category: 'service',
        effect: { type: 'tip_rate', value: 0.08 },
        tiers: [
          { level: 1, title: 'Bộ Bát Đĩa Sứ Trắng Bề Mặt Nhẵn Chống Trầy', cost: 1400000, effectValue: 0.08, description: '+8% tiền tip boa, món ăn bày biện sạch đẹp ngon miệng.' },
          { level: 2, title: 'Đũa Gỗ Muồng Đen Khắc Chìm Chống Trơn Trượt', cost: 3000000, effectValue: 0.09, description: '+9% tiền tip, gắp sợi phở bún mượt mà không văng nước dùng.' },
          { level: 3, title: 'Thố Đựng Gia Vị Sứ Hoa Lam Cao Cấp', cost: 5800000, effectValue: 0.11, description: '+11% tiền tip, hũ gia vị sang trọng kích thích thực khách.' },
          { level: 4, title: 'Khay Bưng Gỗ Tự Nhiên Thẩm Mỹ Tinh Tế', cost: 10000000, effectValue: 0.12, description: '+12% tiền tip, nhân viên bưng bê nhẹ nhàng chuyên nghiệp.' },
          { level: 5, title: 'Dĩa Inox 304 Dày Dặn Sang Trọng Chống Rỉ Sét', cost: 16000000, effectValue: 0.15, description: '+15% tiền tip (Tổng +85% tip), tiền tip đổ về túi ào ào!' },
        ],
      },
      {
        id: 'delivery_fleet',
        name: 'Đội Giao Hàng Chống Nước Chuyên Nghiệp',
        icon: '🛵',
        description: 'Thùng giữ nhiệt 60L cùng máy đóng hộp tự động.',
        cost: 1400000,
        level: 0,
        maxLevel: 5,
        category: 'logistics',
        effect: { type: 'delivery_bonus', value: 0.08 },
        tiers: [
          { level: 1, title: 'Thùng Giao Hàng Chống Nước 60L Khóa Chốt An Toàn', cost: 1400000, effectValue: 0.08, description: '+8% thưởng đơn ship, mưa to gió lớn vẫn bảo toàn nguyên vẹn.' },
          { level: 2, title: 'Hệ Thống Ngăn Hút Chân Không Giữ Ấm 4 Tiếng', cost: 3000000, effectValue: 10, description: '+10% thưởng đơn ship, món ăn thơm nóng như vừa nhấc khỏi bếp.' },
          { level: 3, title: 'Máy Ép Miệng Ly & Hộp Đồ Ăn Tự Động Kín Mép', cost: 5800000, effectValue: 0.12, description: '+12% thưởng đơn ship, không bao giờ bị rỉ rỉ đổ nước ra ngoài.' },
          { level: 4, title: 'Đồng Hồ Điện Tử Báo Nhiệt Đơn Hàng Thông Minh', cost: 10000000, effectValue: 0.14, description: '+14% thưởng đơn ship, đảm bảo chuẩn nhiệt 70°C khi tới tay khách.' },
          { level: 5, title: 'Biệt Đội Giao Nhanh Khu Vực Nội Phố Cam Kết 20 Phút', cost: 16000000, effectValue: 0.16, description: '+16% thưởng đơn ship (Tổng +95%), nhận đơn ship liên tục lợi nhuận khủng!' },
        ],
      },
      {
        id: 'sound_ambience',
        name: 'Dàn Âm Thanh Stereo & Acoustic Tiệm',
        icon: '🎵',
        description: 'Âm nhạc acoustic thư thái, quán đông khách khen ngợi khắp nơi.',
        cost: 1400000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'reputation_boost', value: 0.08 },
        tiers: [
          { level: 1, title: 'Dàn Âm Thanh Stereo 2 Kênh Trong Trẻo', cost: 1400000, effectValue: 0.08, description: '+8% sao uy tín ⭐, âm sắc ấm áp phủ đều các góc bàn.' },
          { level: 2, title: 'Tuyển Tập Acoustic Thư Thái Buổi Sáng & Chiều Tà', cost: 3000000, effectValue: 0.10, description: '+10% sao uy tín, giai điệu nhẹ nhàng giữ chân thực khách thư giãn.' },
          { level: 3, title: 'Loa Phân Vùng Trong Nhà & Ngoài Mái Hiên', cost: 5800000, effectValue: 0.12, description: '+12% sao uy tín, mọi chỗ ngồi đều có trải nghiệm âm thanh tuyệt hảo.' },
          { level: 4, title: 'Rèm Chống Ồn Giảm Tiếng Xe Cộ Ngoài Đường Lớn', cost: 10000000, effectValue: 0.14, description: '+14% sao uy tín, không gian ẩm thực yên bình giữa phố xá tấp nập.' },
          { level: 5, title: 'Không Khí Ẩm Thực Phố Hấp Dẫn Khách Quen & Du Khách', cost: 16000000, effectValue: 0.16, description: '+16% sao uy tín (Tổng +95%), điểm dừng chân văn hóa nức tiếng gần xa!' },
        ],
      },
      {
        id: 'extra_tables',
        name: 'Kê Thêm Bàn Inox Tiệm Mái Hiên',
        icon: '🪑',
        description: 'Mở rộng thêm bàn inox (Tối đa 5 bàn).',
        cost: 6000000,
        level: 0,
        maxLevel: 1,
        category: 'kitchen',
        effect: { type: 'add_table', value: 1 },
        tiers: [
          { level: 1, title: 'Kê Thêm Bàn Inox Số 5 (Khu Mái Hiên Phía Trước)', cost: 6000000, effectValue: 1, description: 'Mở thêm Bàn 5 phục vụ đồng thời 5 nhóm khách gia đình!' },
        ],
      },
    ],
  },

  // === KỶ NGUYÊN 4: QUÁN ĂN PHỐ LỚN 🏪 ===
  eatery: {
    stageId: 'eatery',
    stageName: 'Quán Ăn Phố Lớn',
    stageIcon: '🏪',
    stageTagline: 'Mặt bằng phố lớn 2 tầng, máy lạnh 24/7, bếp inox công nghiệp toàn phần',
    baseStorage: 900, // Kế thừa đỉnh cao từ Mái Hiên
    baseCookSpeed: 1.00,
    baseSpawnRate: 1.10,
    basePatience: 32,
    baseTipRate: 0.50,
    baseDeliveryBonus: 0.60,
    baseRepBonus: 0.60,
    upgrades: [
      {
        id: 'cozy_storage',
        name: 'Kho Lạnh Walk-In & Pallet Nhôm',
        icon: '📦',
        description: 'Kho bảo quản lạnh công nghiệp tiêu chuẩn khách sạn (Tối đa 1,900 ô).',
        cost: 8000000,
        level: 0,
        maxLevel: 5,
        category: 'storage',
        effect: { type: 'storage_capacity', value: 160 },
        tiers: [
          { level: 1, title: 'Tủ Mát Công Nghiệp 4 Cửa Inox 304 Khổng Lồ', cost: 8000000, effectValue: 160, description: '+160 ô kho (Đạt 1,060 ô), tích trữ nguyên liệu cho cả tuần buôn bán.' },
          { level: 2, title: 'Tủ Đông Âm Sâu -25°C Chống Đóng Tuyết Tự Động', cost: 16000000, effectValue: 180, description: '+180 ô kho (Đạt 1,240 ô), giữ độ tươi ngon thịt bò thăn, tôm cua thượng hạng.' },
          { level: 3, title: 'Kho Lạnh Walk-In Mini Bước Vào Trong Tiện Lợi', cost: 30000000, effectValue: 200, description: '+200 ô kho (Đạt 1,440 ô), nhân viên đẩy xe xếp dỡ hàng hóa dễ dàng.' },
          { level: 4, title: 'Hệ Thống Giá Pallet Nhôm Chống Ẩm & Sâu Bọ', cost: 52000000, effectValue: 220, description: '+220 ô kho (Đạt 1,660 ô), tối ưu hóa diện tích kho chứa tối đa.' },
          { level: 5, title: 'Phòng Kho Tiệt Trùng Ozon & Lọc Khí Khép Kín Cao Cấp', cost: 85000000, effectValue: 240, description: '+240 ô kho (Đạt 1,900 ô - Max Quán Lớn), kho nguyên liệu bao la không sợ gián đoạn!' },
        ],
      },
      {
        id: 'modern_stove',
        name: 'Dàn Bếp Trung Tâm & Lò Combi',
        icon: '⚡',
        description: 'Công nghệ nấu nướng nhà hàng 5 sao, chế biến thần tốc chuẩn vị.',
        cost: 10000000,
        level: 0,
        maxLevel: 5,
        category: 'kitchen',
        effect: { type: 'cook_speed', value: 0.22 },
        tiers: [
          { level: 1, title: 'Hệ Thống Hút Khói Khử Mùi Màng Nước Hiện Đại', cost: 10000000, effectValue: 0.22, description: 'Giảm thêm 22% thời gian nấu, bếp thông thoáng mát mẻ như phòng làm việc.' },
          { level: 2, title: 'Lò Hấp Nướng Đa Năng Combi 10 Khay Điện Tử', cost: 22000000, effectValue: 0.24, description: 'Giảm thêm 24% thời gian nấu, nướng sườn chín mềm mọng nước chỉ vài phút.' },
          { level: 3, title: 'Dây Chuyền Bếp Á & Bếp Âu Inox Toàn Khối 304', cost: 42000000, effectValue: 0.26, description: 'Giảm thêm 26% thời gian nấu, 3 đầu bếp phối hợp nhịp nhàng ra đĩa liên hồi.' },
          { level: 4, title: 'Bếp Chiên Tách Dầu Tuần Hoàn Tự Động Thông Minh', cost: 70000000, effectValue: 0.30, description: 'Giảm thêm 30% thời gian nấu, đồ chiên vàng giòn rụm không ngấy mỡ.' },
          { level: 5, title: 'Dàn Bếp Trung Tâm Smart Master Hẹn Giờ Chuẩn Xác', cost: 110000000, effectValue: 0.38, description: 'Giảm thêm 38% thời gian nấu (Tổng +240%), tốc độ nấu vượt mọi kỷ lục phố ẩm thực!' },
        ],
      },
      {
        id: 'flower_signboard',
        name: 'Mặt Dựng Alu & Biển Đèn Neon Nghệ Thuật',
        icon: '🌸',
        description: 'Mặt tiền phố lớn tráng lệ, khách xếp hàng dài chờ có bàn.',
        cost: 9000000,
        level: 0,
        maxLevel: 5,
        category: 'marketing',
        effect: { type: 'attract_customers', value: 0.22 },
        tiers: [
          { level: 1, title: 'Ốp Toàn Bộ Mặt Dựng Alu Vàng Ánh Kim Sang Trọng', cost: 9000000, effectValue: 0.22, description: 'Khách ghé nhanh hơn 22%, mặt tiền đồ sộ nổi bật cả tuyến phố.' },
          { level: 2, title: 'Bộ Chữ Inox Mạ Vàng Gương Phát Sáng Đèn LED', cost: 20000000, effectValue: 0.26, description: 'Khách ghé nhanh hơn 26%, thương hiệu ẩm thực đẳng cấp ghi dấu ấn sâu đậm.' },
          { level: 3, title: 'Đèn Neon Sign Nghệ Thuật Điểm Check-In Hot Trend', cost: 38000000, effectValue: 0.30, description: 'Khách ghé nhanh hơn 30%, giới trẻ xếp hàng chụp ảnh viral mạng xã hội.' },
          { level: 4, title: 'Màn Hình LED Ngoài Trời Ma Trận Đầy Màu Sắc', cost: 65000000, effectValue: 0.34, description: 'Khách ghé nhanh hơn 34%, trình chiếu câu chuyện món ăn sống động.' },
          { level: 5, title: 'Biển Hiệu Nhận Diện Thương Hiệu Độc Bản Phố Trung Tâm', cost: 105000000, effectValue: 0.38, description: 'Khách ghé nhanh hơn 38% (Tổng +260%), quán ăn trở thành biểu tượng sầm uất!' },
        ],
      },
      {
        id: 'seating_comfort',
        name: 'Phòng Máy Lạnh & Bàn Ghế Gỗ Sồi',
        icon: '🪑',
        description: 'Không gian máy lạnh 24°C, ghế nệm da cao cấp khách ngồi mê mẩn.',
        cost: 8000000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'customer_patience', value: 7 },
        tiers: [
          { level: 1, title: 'Bàn Ăn Gỗ Sồi Sơn Mài Sang Trọng Lau Bóng', cost: 8000000, effectValue: 7, description: '+7s khách kiên nhẫn, mặt bàn gỗ vân tự nhiên mát rượi dễ chịu.' },
          { level: 2, title: 'Ghế Nệm Bọc Da Kháng Khuẩn Êm Ái Chống Đau Lưng', cost: 18000000, effectValue: 8, description: '+8s khách kiên nhẫn, ngồi trò chuyện hàng giờ không biết mỏi.' },
          { level: 3, title: 'Hệ Thống Điều Hòa Trung Tâm Inverter 24°C Êm Ái', cost: 35000000, effectValue: 10, description: '+10s khách kiên nhẫn, không khí mát dịu sảng khoái xua tan nắng nóng.' },
          { level: 4, title: 'Vách Gỗ Điêu Khắc Không Gian Riêng Tư Lịch Thiệp', cost: 60000000, effectValue: 12, description: '+12s khách kiên nhẫn, thích hợp tiếp khách bàn công việc kinh doanh.' },
          { level: 5, title: 'Không Gian Phòng Ăn VIP Độc Bản Sang Trọng 5 Sao', cost: 95000000, effectValue: 13, description: '+13s khách kiên nhẫn (Tổng +82s), thực khách thư thái tuyệt đối không bao giờ phàn nàn!' },
        ],
      },
      {
        id: 'dishware_premium',
        name: 'Gốm Sứ Bát Tràng & Dao Nĩa Inox 316',
        icon: '🍽️',
        description: 'Bát đĩa tráng men ngọc, khách sẵn sàng boa tip tiền triệu.',
        cost: 8000000,
        level: 0,
        maxLevel: 5,
        category: 'service',
        effect: { type: 'tip_rate', value: 0.12 },
        tiers: [
          { level: 1, title: 'Bát Đĩa Gốm Sứ Bát Tràng Men Ngọc Nghệ Thuật', cost: 8000000, effectValue: 0.12, description: '+12% tiền tip boa, món ăn toát lên vẻ đẹp mỹ thực truyền thống.' },
          { level: 2, title: 'Bộ Dao Nĩa Inox 316 Đánh Bóng Gương Chống Trầy', cost: 18000000, effectValue: 0.14, description: '+14% tiền tip, cắt thái thịt mềm mại đầm chắc.' },
          { level: 3, title: 'Thố Đất Nung Nướng Giữ Nóng Cháy Cạnh Xèo Xèo', cost: 35000000, effectValue: 0.16, description: '+16% tiền tip, giữ độ nóng hổi đến thìa cuối cùng.' },
          { level: 4, title: 'Khay Đá Nóng Chuyên Dụng Giữ Nhiệt Suốt Bữa Tiệc', cost: 60000000, effectValue: 0.18, description: '+18% tiền tip, miếng beefsteak giữ trọn hương vị tuyệt hảo.' },
          { level: 5, title: 'Bộ Bát Đĩa Minh Long Mạ Chỉ Vàng Đẳng Cấp Hoàng Gia', cost: 95000000, effectValue: 0.22, description: '+22% tiền tip (Tổng +132% tip), khách VIP thưởng tiền boa liên tiếp!' },
        ],
      },
      {
        id: 'delivery_fleet',
        name: 'Đội Xe Điện & Hộp Điều Nhiệt GPS',
        icon: '🛵',
        description: 'Đội xe máy điện chuyên biệt, quản lý đơn hàng theo thời gian thực.',
        cost: 8000000,
        level: 0,
        maxLevel: 5,
        category: 'logistics',
        effect: { type: 'delivery_bonus', value: 0.12 },
        tiers: [
          { level: 1, title: 'Đội Xe Máy Điện Xanh Chuyên Biệt Nhanh Nhẹn', cost: 8000000, effectValue: 0.12, description: '+12% thưởng đơn ship, di chuyển êm ái luồn lách mọi cung đường.' },
          { level: 2, title: 'Thùng Giao Hàng Cắm Điện Giữ Nóng 80°C Suốt Hành Trình', cost: 18000000, effectValue: 0.14, description: '+14% thưởng đơn ship, khách mở hộp ngửi thấy mùi thơm bốc lên.' },
          { level: 3, title: 'Hộp Cách Nhiệt Sợi Carbon Siêu Nhẹ Kháng Va Đập', cost: 35000000, effectValue: 0.16, description: '+16% thưởng đơn ship, đồ ăn giữ hình dạng nguyên vẹn mỹ miều.' },
          { level: 4, title: 'Hệ Thống GPS Điều Phối & Báo Lộ Trình Realtime', cost: 60000000, effectValue: 0.18, description: '+18% thưởng đơn ship, tối ưu quãng đường nhanh nhất từng giây.' },
          { level: 5, title: 'Biệt Đội Giao Hàng Hỏa Tốc Cam Kết Dưới 15 Phút', cost: 95000000, effectValue: 0.22, description: '+22% thưởng đơn ship (Tổng +142%), chiếm lĩnh thị phần giao đồ ăn cả quận!' },
        ],
      },
      {
        id: 'sound_ambience',
        name: 'Hệ Thống Loa Âm Trần & Nhạc Jazz',
        icon: '🎵',
        description: 'Không gian thư thái cao cấp, uy tín quán vang xa toàn thành phố.',
        cost: 8000000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'reputation_boost', value: 0.12 },
        tiers: [
          { level: 1, title: 'Hệ Thống Loa Âm Trần Hi-Fi BGM Phát Nhạc Nền Tinh Tế', cost: 8000000, effectValue: 0.12, description: '+12% sao uy tín ⭐, âm lượng dịu nhẹ tạo sự thư thái khi trò chuyện.' },
          { level: 2, title: 'Tuyển Tập Jazz & Bossa Nova Thư Giãn Bản Quyền', cost: 18000000, effectValue: 0.14, description: '+14% sao uy tín, giai điệu dẫn dắt cảm xúc thăng hoa vị giác.' },
          { level: 3, title: 'Tường Ốp Tiêu Âm Tiêu Chuẩn Phòng Trà Cách Biệt Phố', cost: 35000000, effectValue: 0.16, description: '+16% sao uy tín, giữ trọn sự yên tĩnh riêng tư cho thực khách.' },
          { level: 4, title: 'Hệ Thống Đèn Chiếu Sáng Đổi Màu Theo Giai Điệu Bài Hát', cost: 60000000, effectValue: 0.18, description: '+18% sao uy tín, trải nghiệm thị giác và thính giác tuyệt đỉnh.' },
          { level: 5, title: 'Sân Khấu Nhạc Sống Acoustic Cuối Tuần Hút Khách VIP', cost: 95000000, effectValue: 0.22, description: '+22% sao uy tín (Tổng +142%), điểm đến thời thượng được săn đón!' },
        ],
      },
      {
        id: 'extra_tables',
        name: 'Kê Thêm Bàn Đá Quán Ăn Phố Lớn',
        icon: '🪑',
        description: 'Mở rộng thêm bàn đá sang trọng (Tối đa 6 bàn).',
        cost: 25000000,
        level: 0,
        maxLevel: 1,
        category: 'kitchen',
        effect: { type: 'add_table', value: 1 },
        tiers: [
          { level: 1, title: 'Kê Thêm Bàn Đá Sang Trọng Số 6 (Khu Tầng Trệt Mặt Tiền)', cost: 25000000, effectValue: 1, description: 'Mở thêm Bàn 6 phục vụ đồng thời 6 nhóm khách đông đúc!' },
        ],
      },
    ],
  },

  // === KỶ NGUYÊN 5: CHUỖI ĐẾ CHẾ VỈA HÈ 👑 ===
  empire: {
    stageId: 'empire',
    stageName: 'Chuỗi Đế Chế Vỉa Hè',
    stageIcon: '👑',
    stageTagline: 'Kỳ lân F&B quốc gia, chuỗi nhượng quyền phủ sóng, trung tâm logistics hiện đại',
    baseStorage: 1900, // Kế thừa đỉnh cao từ Quán Lớn
    baseCookSpeed: 1.60,
    baseSpawnRate: 1.70,
    basePatience: 50,
    baseTipRate: 0.80,
    baseDeliveryBonus: 0.90,
    baseRepBonus: 0.90,
    upgrades: [
      {
        id: 'cozy_storage',
        name: 'Chuỗi Logistics Hub & Cung Ứng Quốc Gia',
        icon: '📦',
        description: 'Trung tâm tổng kho phân phối và chuỗi cung ứng tự động (Tối đa 4,000 ô).',
        cost: 40000000,
        level: 0,
        maxLevel: 5,
        category: 'storage',
        effect: { type: 'storage_capacity', value: 300 },
        tiers: [
          { level: 1, title: 'Kho Trung Tâm Hub & Spoke Phân Phối Đa Chi Nhánh', cost: 40000000, effectValue: 300, description: '+300 ô kho (Đạt 2,200 ô), tiếp ứng nguồn hàng đồng bộ cho toàn bộ chuỗi.' },
          { level: 2, title: 'Đội Xe Tải Lạnh Tiếp Ứng 24/7 Không Bao Giờ Đứt Gãy', cost: 80000000, effectValue: 350, description: '+350 ô kho (Đạt 2,550 ô), điều chuyển nguyên liệu tươi ngon tức thì.' },
          { level: 3, title: 'Kho Lạnh Tự Động Hóa Robot Phân Loại Hàng Hóa', cost: 150000000, effectValue: 400, description: '+400 ô kho (Đạt 2,950 ô), độ chính xác tuyệt đối không thất thoát.' },
          { level: 4, title: 'Hệ Thống Quản Lý Kho Chuỗi AI Đa Điểm Tiêu Chuẩn Quốc Tế', cost: 260000000, effectValue: 450, description: '+450 ô kho (Đạt 3,400 ô), quản trị dòng chảy nguyên liệu quy mô lớn.' },
          { level: 5, title: 'Mạng Lưới Chuỗi Cung Ứng Độc Quyền Toàn Quốc', cost: 420000000, effectValue: 600, description: '+600 ô kho (Đạt 4,000 ô - Kỳ Lân Đế Chế), sức chứa kho khổng lồ dẫn đầu ngành F&B!' },
        ],
      },
      {
        id: 'modern_stove',
        name: 'Siêu Bếp AI & Dây Chuyền Bếp Trung Tâm',
        icon: '⚡',
        description: 'Công nghệ chế biến tự động hóa chuẩn xác từng miligiây.',
        cost: 45000000,
        level: 0,
        maxLevel: 5,
        category: 'kitchen',
        effect: { type: 'cook_speed', value: 0.35 },
        tiers: [
          { level: 1, title: 'Robot Chế Biến Món Ăn Bán Tự Động Đa Năng', cost: 45000000, effectValue: 0.35, description: 'Giảm thêm 35% thời gian nấu, ra món nhanh gấp đôi đầu bếp thông thường.' },
          { level: 2, title: 'Hệ Thống Hơi Nước Áp Suất Siêu Tốc Giữ Trọn Dinh Dưỡng', cost: 95000000, effectValue: 0.40, description: 'Giảm thêm 40% thời gian nấu, món ăn giữ nguyên vị ngọt mọng tự nhiên.' },
          { level: 3, title: 'Trạm Chế Biến Khép Kín Công Suất Khủng Phục Vụ Hàng Ngàn Khách', cost: 180000000, effectValue: 0.45, description: 'Giảm thêm 45% thời gian nấu, không bị nghẽn đơn dù đông khách cỡ nào.' },
          { level: 4, title: 'Dây Chuyền AI Định Lượng Gia Vị Chuẩn Xác Từng Giọt', cost: 300000000, effectValue: 0.50, description: 'Giảm thêm 50% thời gian nấu, hương vị triệu món như một tuyệt hảo.' },
          { level: 5, title: 'Siêu Bếp AI Trung Tâm Kỳ Lân Ẩm Thực Toàn Quốc', cost: 480000000, effectValue: 0.70, description: 'Giảm thêm 70% thời gian nấu (Tổng +400%), nấu món trong chớp mắt như ảo thuật!' },
        ],
      },
      {
        id: 'flower_signboard',
        name: 'Màn Hình LED 3D Ngoài Trời & Biểu Tượng Quốc Gia',
        icon: '🌸',
        description: 'Biểu tượng văn hóa ẩm thực vang danh cả nước, khách nườm nượp kéo đến.',
        cost: 40000000,
        level: 0,
        maxLevel: 5,
        category: 'marketing',
        effect: { type: 'attract_customers', value: 0.35 },
        tiers: [
          { level: 1, title: 'Màn Hình LED Cong 3D Khổng Lồ Ngoài Trời Đỉnh Cao', cost: 40000000, effectValue: 0.35, description: 'Khách kéo đến nhanh hơn 35%, hiệu ứng 3D mãn nhãn thu hút cả ngã tư.' },
          { level: 2, title: 'Cột Tháp Biển Hiệu Landmark Đầu Tuyến Đô Thị', cost: 85000000, effectValue: 0.40, description: 'Khách kéo đến nhanh hơn 40%, trở thành điểm mốc định vị của cả thành phố.' },
          { level: 3, title: 'Chiến Dịch Truyền Thông Phủ Sóng Toàn Bộ Kênh Số', cost: 160000000, effectValue: 0.45, description: 'Khách kéo đến nhanh hơn 45%, thương hiệu xuất hiện trên mọi bản tin ẩm thực.' },
          { level: 4, title: 'Hệ Thống Nhận Diện Nhượng Quyền Chuỗi Vàng Tiêu Chuẩn', cost: 280000000, effectValue: 0.55, description: 'Khách kéo đến nhanh hơn 55%, khách hàng tin tưởng tuyệt đối vào chất lượng.' },
          { level: 5, title: 'Biểu Tượng Ẩm Thực Vang Danh Cả Nước & Quốc Tế', cost: 450000000, effectValue: 0.75, description: 'Khách kéo đến nhanh hơn 75% (Tổng +420%), khách xếp hàng dài từ sáng tới khuya!' },
        ],
      },
      {
        id: 'seating_comfort',
        name: 'Phòng Tiệc Hoàng Gia & Sofa Da Ý',
        icon: '🪑',
        description: 'Nội thất xa xỉ, phòng VIP cách âm phục vụ giới thượng lưu.',
        cost: 35000000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'customer_patience', value: 12 },
        tiers: [
          { level: 1, title: 'Sofa Da Bò Ý Nhập Khẩu Thương Gia Đẳng Cấp', cost: 35000000, effectValue: 12, description: '+12s khách kiên nhẫn, ngồi êm ái thư giãn tận hưởng không gian.' },
          { level: 2, title: 'Phòng VIP Kính Một Chiều Riêng Tư Độc Bản', cost: 75000000, effectValue: 13, description: '+13s khách kiên nhẫn, ngắm phố phường từ trên cao mà không bị làm phiền.' },
          { level: 3, title: 'Hệ Thống Lọc Khí Ozon & Khuếch Tán Tinh Dầu Tự Nhiên', cost: 140000000, effectValue: 15, description: '+15s khách kiên nhẫn, hương thơm thảo mộc dịu nhẹ thanh lọc tâm hồn.' },
          { level: 4, title: 'Bàn Ăn Cảm Biến Ánh Sáng Điều Chỉnh Cảm Xúc Thực Khách', cost: 240000000, effectValue: 18, description: '+18s khách kiên nhẫn, trải nghiệm ẩm thực kết hợp nghệ thuật đỉnh cao.' },
          { level: 5, title: 'Phòng Tiệc Hoàng Gia Đẳng Cấp Quốc Tế Đón Tiếp Nguyên Thủ', cost: 400000000, effectValue: 22, description: '+22s khách kiên nhẫn (Tổng +130s), khách kiên nhẫn tuyệt đối với thái độ tôn kính!' },
        ],
      },
      {
        id: 'dishware_premium',
        name: 'Bộ Dụng Cụ Dát Vàng & Pha Lê Bohemia',
        icon: '🍽️',
        description: 'Đồ bàn tiệc cung đình dát vàng 24K, tiền boa tip khổng lồ.',
        cost: 35000000,
        level: 0,
        maxLevel: 5,
        category: 'service',
        effect: { type: 'tip_rate', value: 0.18 },
        tiers: [
          { level: 1, title: 'Bộ Đồ Ăn Nghệ Thuật Thiết Kế Độc Quyền Theo Mùa', cost: 35000000, effectValue: 0.18, description: '+18% tiền tip boa, mỗi món ăn là một tác phẩm hội họa.' },
          { level: 2, title: 'Ly Pha Lê Bohemia Cao Cấp Tinh Xảo Phát Tiếng Trong Trẻo', cost: 75000000, effectValue: 0.20, description: '+20% tiền tip, nâng chén cạn ly vang ngân tiếng pha lê.' },
          { level: 3, title: 'Bộ Dao Nĩa Thìa Bạc Khắc Thủ Công Hoa Văn Cung Đình', cost: 140000000, effectValue: 0.24, description: '+24% tiền tip, cảm giác dùng bữa quyền quý hoàng tộc.' },
          { level: 4, title: 'Bộ Thố Sứ Dát Vàng Hoàng Gia 24K Giữ Nhiệt Vĩnh Cửu', cost: 240000000, effectValue: 0.28, description: '+28% tiền tip, ánh vàng lấp lánh phản chiếu sự sang giàu.' },
          { level: 5, title: 'Set Bàn Tiệc Tinh Hoa Ẩm Thực Cung Đình Đế Vương', cost: 400000000, effectValue: 0.35, description: '+35% tiền tip (Tổng +205% tip), tiền tip vượt xa cả tiền gốc món ăn!' },
        ],
      },
      {
        id: 'delivery_fleet',
        name: 'Logistics Vận Tải Toàn Thành & Đội Drone',
        icon: '🛵',
        description: 'Mạng lưới vận chuyển đa phương thức hỏa tốc phủ sóng cả nước.',
        cost: 35000000,
        level: 0,
        maxLevel: 5,
        category: 'logistics',
        effect: { type: 'delivery_bonus', value: 0.18 },
        tiers: [
          { level: 1, title: 'Đội Xe Tải Lạnh Đô Thị Phủ Sóng Mọi Quận Huyện', cost: 35000000, effectValue: 0.18, description: '+18% thưởng đơn ship, vận chuyển số lượng lớn không giới hạn.' },
          { level: 2, title: 'Hộp Điện Tử Điều Nhiệt Thông Minh Điều Khiển Qua App', cost: 75000000, effectValue: 0.20, description: '+20% thưởng đơn ship, kiểm soát độ ẩm và nhiệt độ hoàn hảo.' },
          { level: 3, title: 'Trạm Sạc Nhanh & Đóng Gói Tự Động Bằng Cánh Tay Robot', cost: 140000000, effectValue: 0.24, description: '+24% thưởng đơn ship, đóng gói thần tốc 5 giây mỗi đơn hàng.' },
          { level: 4, title: 'Đội Drone Giao Hàng Siêu Tốc Thử Nghiệm Tầng Không', cost: 240000000, effectValue: 0.28, description: '+28% thưởng đơn ship, bay thẳng qua tắc đường giao hàng tận ban công.' },
          { level: 5, title: 'Mạng Lưới Logistics Vận Tải Toàn Thành Độc Quyền Kỳ Lân', cost: 400000000, effectValue: 0.35, description: '+35% thưởng đơn ship (Tổng +215%), doanh thu giao hàng hàng tỷ đồng mỗi ngày!' },
        ],
      },
      {
        id: 'sound_ambience',
        name: 'Nhà Hát Ẩm Thực & Dàn Âm Thanh Dolby Atmos',
        icon: '🎵',
        description: 'Không gian trình diễn nghệ thuật ẩm thực đỉnh cao, uy tín huyền thoại.',
        cost: 35000000,
        level: 0,
        maxLevel: 5,
        category: 'comfort',
        effect: { type: 'reputation_boost', value: 0.18 },
        tiers: [
          { level: 1, title: 'Dàn Âm Thanh Vòm Dolby Atmos Đẳng Cấp Thế Giới', cost: 35000000, effectValue: 0.18, description: '+18% sao uy tín ⭐, âm thanh sống động như đang xem phim rạp.' },
          { level: 2, title: 'Sân Khấu Mini Mời Nghệ Sĩ Danh Tiếng Biểu Diễn Trực Tiếp', cost: 75000000, effectValue: 0.20, description: '+20% sao uy tín, thu hút giới doanh nhân và người nổi tiếng.' },
          { level: 3, title: 'Thiết Kế Âm Học Chuẩn Nhà Hát Hoàng Gia Châu Âu', cost: 140000000, effectValue: 0.24, description: '+24% sao uy tín, âm thanh trong vắt đánh thức mọi giác quan.' },
          { level: 4, title: 'Kịch Bản Âm Nhạc & Ánh Sáng Cá Nhân Hóa Từng Thực Khách', cost: 240000000, effectValue: 0.28, description: '+28% sao uy tín, mỗi bữa ăn là một trải nghiệm độc nhất vô nhị.' },
          { level: 5, title: 'Phòng Hòa Nhạc Ẩm Thực Tinh Hoa Thượng Lưu Huyền Thoại', cost: 400000000, effectValue: 0.35, description: '+35% sao uy tín (Tổng +215%), ghi danh vào bản đồ ẩm thực thế giới!' },
        ],
      },
      {
        id: 'extra_tables',
        name: 'Kê Thêm Bàn Hoàng Gia Chuỗi Đế Chế',
        icon: '🪑',
        description: 'Mở rộng bàn tiệc hoàng gia tối thượng (Tối đa 8 bàn).',
        cost: 80000000,
        level: 0,
        maxLevel: 2,
        category: 'kitchen',
        effect: { type: 'add_table', value: 1 },
        tiers: [
          { level: 1, title: 'Kê Thêm Bàn Hoàng Gia Số 7 (Phòng Tiệc Thương Gia)', cost: 80000000, effectValue: 1, description: 'Mở thêm Bàn 7 tiếp đón đoàn khách VIP cấp cao!' },
          { level: 2, title: 'Kê Thêm Bàn Hoàng Gia Số 8 (Khu Sky Lounge Đỉnh Cao)', cost: 200000000, effectValue: 1, description: 'Mở thêm Bàn 8 (Tối đa 8 bàn!), quy mô phục vụ đại tiệc đỉnh cao!' },
        ],
      },
    ],
  },
};

// Tương thích ngược: SHOP_UPGRADES mặc định lấy danh mục của Xe Đẩy (cart)
export const SHOP_UPGRADES: ShopUpgrade[] = STAGE_SHOP_UPGRADES.cart.upgrades;

// === CÁC HELPER TÍNH TOÁN CHỈ SỐ KỶ NGUYÊN (ERA SYSTEM HELPERS) ===

export const getStageCatalog = (stageId: BusinessStageId = 'cart'): StageUpgradeCatalog => {
  return STAGE_SHOP_UPGRADES[stageId] || STAGE_SHOP_UPGRADES.cart;
};

export const getStageUpgrades = (stageId: BusinessStageId = 'cart'): ShopUpgrade[] => {
  return getStageCatalog(stageId).upgrades;
};

// Helper tính toán thông tin tầng nâng cấp của trang thiết bị
export const getUpgradeTierInfo = (
  upgrade: ShopUpgrade,
  currentLevel: number
): {
  level: number;
  title: string;
  cost: number;
  description: string;
  effectValue: number;
  isMax: boolean;
} => {
  const isMax = currentLevel >= upgrade.maxLevel;
  if (upgrade.tiers && upgrade.tiers.length > 0) {
    const targetIdx = Math.min(upgrade.tiers.length - 1, currentLevel);
    const tier = upgrade.tiers[targetIdx];
    return {
      level: currentLevel + 1,
      title: tier.title,
      cost: tier.cost,
      description: tier.description,
      effectValue: tier.effectValue,
      isMax,
    };
  }

  const nextCost = Math.round(upgrade.cost * Math.pow(2.2, currentLevel));
  return {
    level: currentLevel + 1,
    title: `${upgrade.name} (Cấp ${currentLevel + 1})`,
    cost: nextCost,
    description: upgrade.description,
    effectValue: upgrade.effect.value * (currentLevel + 1),
    isMax,
  };
};

export const getStageUpgradeTierInfo = (
  stageId: BusinessStageId = 'cart',
  upgradeId: string,
  currentLevel: number
): {
  level: number;
  title: string;
  cost: number;
  description: string;
  effectValue: number;
  isMax: boolean;
} => {
  const upgrades = getStageUpgrades(stageId);
  const upgrade = upgrades.find((u) => u.id === upgradeId) || upgrades[0];
  return getUpgradeTierInfo(upgrade, currentLevel);
};

// 1. Dung tích kho: Sàn của Kỷ Nguyên + Tổng các tầng nâng cấp đã mua trong kỷ nguyên
export const calculateStorageCapacity = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseStorage;
  const upgrade = catalog.upgrades.find((u) => u.id === 'cozy_storage');
  const lvl = stageUpgrades['cozy_storage'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 2. Tốc độ nấu: Sàn của Kỷ Nguyên + Tổng các tầng nâng cấp bếp
export const calculateCookSpeedBoost = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseCookSpeed;
  const upgrade = catalog.upgrades.find((u) => u.id === 'modern_stove');
  const lvl = stageUpgrades['modern_stove'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 3. Tỷ lệ khách kéo đến: Sàn của Kỷ Nguyên + Biển hiệu
export const calculateSpawnRateBoost = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseSpawnRate;
  const upgrade = catalog.upgrades.find((u) => u.id === 'flower_signboard');
  const lvl = stageUpgrades['flower_signboard'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 4. Thời gian khách kiên nhẫn (giây): Sàn của Kỷ Nguyên + Bàn ghế
export const calculateCustomerPatienceBonus = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.basePatience;
  const upgrade = catalog.upgrades.find((u) => u.id === 'seating_comfort');
  const lvl = stageUpgrades['seating_comfort'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 5. Tỷ lệ tiền tip boa: Sàn của Kỷ Nguyên + Bát đĩa
export const calculateTipRateBonus = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseTipRate;
  const upgrade = catalog.upgrades.find((u) => u.id === 'dishware_premium');
  const lvl = stageUpgrades['dishware_premium'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 6. Thưởng đơn giao hàng: Sàn của Kỷ Nguyên + Đội xe
export const calculateDeliveryBonus = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseDeliveryBonus;
  const upgrade = catalog.upgrades.find((u) => u.id === 'delivery_fleet');
  const lvl = stageUpgrades['delivery_fleet'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 7. Thưởng nhận sao uy tín: Sàn của Kỷ Nguyên + Âm thanh
export const calculateReputationBonus = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const catalog = getStageCatalog(stageId);
  let total = catalog.baseRepBonus;
  const upgrade = catalog.upgrades.find((u) => u.id === 'sound_ambience');
  const lvl = stageUpgrades['sound_ambience'] || 0;
  if (upgrade?.tiers && lvl > 0) {
    for (let i = 0; i < Math.min(lvl, upgrade.tiers.length); i++) {
      total += upgrade.tiers[i].effectValue;
    }
  }
  return total;
};

// 8. Số bàn ăn tối đa: Sàn theo stage + Kê thêm bàn
export const calculateMaxTables = (
  stageId: BusinessStageId = 'cart',
  stageUpgrades: Record<string, number> = {}
): number => {
  const baseStageTables: Record<BusinessStageId, number> = {
    cart: 2,
    corner: 3,
    awning: 4,
    eatery: 5,
    empire: 6,
  };
  const base = baseStageTables[stageId] || 2;
  const extra = stageUpgrades['extra_tables'] || 0;
  return Math.min(8, base + extra);
};

// Helper tính toán quy mô chi nhánh thương hiệu
export const getBranchTierInfo = (
  restaurantId: RestaurantTypeId,
  currentLevel = 1
): {
  currentTier: BranchTier;
  nextTier: BranchTier | null;
  isMax: boolean;
} => {
  const rest = RESTAURANT_TYPES[restaurantId];
  const tiers = rest?.branchTiers || [];
  const safeLvl = Math.max(1, Math.min(tiers.length, currentLevel));
  const currentTier = tiers[safeLvl - 1] || {
    level: 1,
    name: 'Kiosk Tiêu Chuẩn',
    tagline: 'Chi nhánh bán hàng cơ bản',
    cost: 0,
    requiredReputation: 0,
    requiredStaff: 0,
    bonusMultiplier: 1.0,
    description: 'Hiệu suất bán 100%',
  };
  const nextTier = safeLvl < tiers.length ? tiers[safeLvl] : null;
  return {
    currentTier,
    nextTier,
    isMax: safeLvl >= tiers.length,
  };
};

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp_mai',
    name: 'Bé Mai',
    role: 'server',
    careerTier: 'junior',
    avatar: '👧',
    personality: 'hardworking',
    personalityDesc: 'Chăm chỉ, cần mẫn, luôn hoàn thành nhiệm vụ trước thời hạn.',
    salaryPerDay: 45000,
    hiringCost: 100000,
    speed: 1.25,
    cookingSkill: 40,
    serviceSkill: 85,
    mood: 90,
    stress: 15,
    loyalty: 80,
    experience: 120,
    hired: false,
    description: 'Tự động mang món ăn ra bàn ngay khi bếp hoàn thành.',
  },
  {
    id: 'emp_linh',
    name: 'Bác Linh',
    role: 'cook',
    careerTier: 'senior',
    avatar: '👨‍🍳',
    personality: 'friendly',
    personalityDesc: 'Thân thiện, tỉ mỉ, nấu ăn bằng cả trái tim và tình yêu ẩm thực.',
    salaryPerDay: 65000,
    hiringCost: 250000,
    speed: 1.1,
    cookingSkill: 92,
    serviceSkill: 50,
    mood: 85,
    stress: 20,
    loyalty: 85,
    experience: 350,
    hired: false,
    description: 'Tự động chuẩn bị và chế biến món ăn khi có order của khách.',
  },
  {
    id: 'emp_tuan',
    name: 'Em Tuấn',
    role: 'cook',
    careerTier: 'intern',
    avatar: '🧑‍🍳',
    personality: 'creative',
    personalityDesc: 'Sáng tạo, thích đổi mới công thức, giúp món ăn đậm vị hơn (+15% tiền tip).',
    salaryPerDay: 50000,
    hiringCost: 150000,
    speed: 1.15,
    cookingSkill: 75,
    serviceSkill: 60,
    mood: 95,
    stress: 10,
    loyalty: 70,
    experience: 80,
    hired: false,
    description: 'Phụ bếp năng động, tăng tỷ lệ nhận thêm tiền boa từ khách.',
  },
  {
    id: 'emp_lan',
    name: 'Chị Lan',
    role: 'manager',
    careerTier: 'shift_leader',
    avatar: '👩‍💼',
    personality: 'ambitious',
    personalityDesc: 'Cầu tiến, có óc tổ chức, giúp cả tiệm giảm 25% độ căng thẳng.',
    salaryPerDay: 75000,
    hiringCost: 350000,
    speed: 1.3,
    cookingSkill: 65,
    serviceSkill: 90,
    mood: 80,
    stress: 25,
    loyalty: 75,
    experience: 280,
    hired: false,
    description: 'Trợ lý quản lý cửa hàng, hỗ trợ điều phối và tăng hiệu suất làm việc.',
  },
  {
    id: 'emp_huy',
    name: 'Cậu Huy',
    role: 'server',
    careerTier: 'intern',
    avatar: '👦',
    personality: 'extrovert',
    personalityDesc: 'Hoạt bát, vui vẻ, nụ cười tỏa nắng thu hút thêm 15% lượng khách.',
    salaryPerDay: 40000,
    hiringCost: 120000,
    speed: 1.2,
    cookingSkill: 35,
    serviceSkill: 88,
    mood: 92,
    stress: 12,
    loyalty: 72,
    experience: 60,
    hired: false,
    description: 'Phục vụ vui tươi, làm khách hàng luôn cảm thấy ấm áp.',
  },
  {
    id: 'emp_hong',
    name: 'Chị Hồng',
    role: 'cook',
    careerTier: 'senior',
    avatar: '👩‍🍳',
    personality: 'friendly',
    personalityDesc: 'Bếp trưởng món nước, ninh nước lèo thanh ngọt chuẩn vị truyền thống.',
    salaryPerDay: 60000,
    hiringCost: 280000,
    speed: 1.2,
    cookingSkill: 95,
    serviceSkill: 55,
    mood: 90,
    stress: 15,
    loyalty: 88,
    experience: 380,
    hired: false,
    description: 'Chuyên gia nước lèo (Phở, Bún bò), nấu nhanh và làm hài lòng khách khó tính.',
  },
  {
    id: 'emp_tai',
    name: 'Anh Tài',
    role: 'cook',
    careerTier: 'shift_leader',
    avatar: '👨‍🍳',
    personality: 'hardworking',
    personalityDesc: 'Vua chảo gang & lò nướng than hồng, giữ nhiệt thịt chín mềm xèo xèo.',
    salaryPerDay: 62000,
    hiringCost: 300000,
    speed: 1.25,
    cookingSkill: 90,
    serviceSkill: 50,
    mood: 88,
    stress: 18,
    loyalty: 85,
    experience: 320,
    hired: false,
    description: 'Bếp nướng & xảo chảo điêu luyện (Bò né, Cơm tấm), tăng 10% giá trị món.',
  },
  {
    id: 'emp_ngoc',
    name: 'Bé Ngọc',
    role: 'server',
    careerTier: 'junior',
    avatar: '👧',
    personality: 'extrovert',
    personalityDesc: 'Bước chân thoăn thoắt, bưng 2 mâm một lúc không rơi một giọt nước dùng.',
    salaryPerDay: 42000,
    hiringCost: 180000,
    speed: 1.35,
    cookingSkill: 40,
    serviceSkill: 90,
    mood: 92,
    stress: 10,
    loyalty: 78,
    experience: 150,
    hired: false,
    description: 'Phục vụ siêu tốc, giảm 30% thời gian bưng món cho khách.',
  },
  {
    id: 'emp_quan',
    name: 'Chú Quân',
    role: 'manager',
    careerTier: 'store_manager',
    avatar: '👨‍💼',
    personality: 'ambitious',
    personalityDesc: 'Chuyên gia vận hành chuỗi F&B, tối ưu chi phí và bùng nổ doanh số chi nhánh.',
    salaryPerDay: 85000,
    hiringCost: 500000,
    speed: 1.3,
    cookingSkill: 70,
    serviceSkill: 95,
    mood: 85,
    stress: 20,
    loyalty: 90,
    experience: 500,
    hired: false,
    description: 'Giám đốc chuỗi chi nhánh, tăng 25% doanh thu thụ động cho mọi quán đã mở.',
  },
  {
    id: 'emp_dung',
    name: 'Cậu Dũng',
    role: 'cook',
    careerTier: 'junior',
    avatar: '🧑‍🍳',
    personality: 'creative',
    personalityDesc: 'Thao tác cắt thái như múa dao, tốc độ ra món nhanh nhất xóm vỉa hè.',
    salaryPerDay: 52000,
    hiringCost: 200000,
    speed: 1.4,
    cookingSkill: 80,
    serviceSkill: 45,
    mood: 90,
    stress: 15,
    loyalty: 75,
    experience: 160,
    hired: false,
    description: 'Đầu bếp siêu tốc độ, nấu món cực nhanh giúp khách không phải chờ đợi.',
  },
  // --- CÁC NHÂN VIÊN ĐI CHỢ SỈ / TIẾP LIỆU (SHOPPERS) - GIÁ THUÊ MẮC, ĐẦU TƯ TỰ ĐỘNG HOÁ ---
  {
    id: 'emp_coba',
    name: 'Cô Ba Đi Chợ',
    role: 'shopper',
    careerTier: 'junior',
    avatar: '🛵',
    personality: 'hardworking',
    personalityDesc: 'Chạy chiếc xe Cub chở sọt mây, chuyên săn lùng nguyên liệu tươi ngon giá hời tại chợ sớm.',
    salaryPerDay: 85000,
    hiringCost: 1500000, // 1.500.000đ - Giá thuê cao cấp, mở khoá tự động hoá
    speed: 1.3,
    cookingSkill: 40,
    serviceSkill: 75,
    marketSkill: 75, // Giảm 10% giá sỉ
    mood: 92,
    stress: 12,
    loyalty: 85,
    experience: 200,
    hired: false,
    description: '🛵 Tự động chạy đi chợ mua bổ sung khi kho dưới 5 món. Tiết kiệm 10% tiền mua sỉ!',
  },
  {
    id: 'emp_chubay',
    name: 'Chú Bảy Đầu Mối',
    role: 'shopper',
    careerTier: 'senior',
    avatar: '🚚',
    personality: 'ambitious',
    personalityDesc: 'Khét tiếng mối lái chợ đầu mối nông sản Bình Điền - Thủ Đức, nguồn hàng dồi dào bạt ngàn.',
    salaryPerDay: 160000,
    hiringCost: 5000000, // 5.000.000đ - Giá thuê cao cấp!
    speed: 1.5,
    cookingSkill: 50,
    serviceSkill: 80,
    marketSkill: 88, // Giảm 20% giá sỉ
    mood: 90,
    stress: 16,
    loyalty: 88,
    experience: 450,
    hired: false,
    description: '🚚 Tự động nhập hàng số lượng lớn với giá sỉ rẻ hơn 20%. Đảm bảo kho không bao giờ cạn!',
  },
  {
    id: 'emp_bactam',
    name: 'Bác Tám Kho Vận',
    role: 'shopper',
    careerTier: 'store_manager',
    avatar: '🚛',
    personality: 'creative',
    personalityDesc: 'Vua vận tải lạnh chuỗi cung ứng thực phẩm, nhập thẳng tận nông trại hữu cơ chuẩn xuất khẩu.',
    salaryPerDay: 300000,
    hiringCost: 15000000, // 15.000.000đ - Cực kỳ đắt, đỉnh cao cung ứng tự động hoá!
    speed: 1.75,
    cookingSkill: 60,
    serviceSkill: 90,
    marketSkill: 98, // Giảm 30% giá sỉ
    mood: 95,
    stress: 10,
    loyalty: 95,
    experience: 800,
    hired: false,
    description: '🚛 Tự động kiểm kho & gom đầy 100% dung lượng kho với giá gốc giảm 30%! Phục vụ toàn chuỗi chi nhánh.',
  },
];

export const SHOP_THEMES: Record<string, ShopTheme> = {
  sakura_pink: {
    id: 'sakura_pink',
    name: 'Hoa Anh Đào (Sakura Pink)',
    description: 'Tông màu hồng pastel ngọt ngào, ấm áp nguyên bản của tiệm.',
    primaryColor: '#F7A8C4',
    accentColor: '#FFD6E5',
    bgColor: '#FAF5EE',
    unlocked: true,
    cost: 0,
  },
  mint_cafe: {
    id: 'mint_cafe',
    name: 'Bạc Hà Dịu Mát (Mint Cafe)',
    description: 'Sắc xanh bạc hà thanh mát, tạo cảm giác thư thái dễ chịu cho khách ghé thăm.',
    primaryColor: '#72C2A1',
    accentColor: '#BFE3D0',
    bgColor: '#F3FAF6',
    unlocked: false,
    cost: 80000,
  },
  cream_bakery: {
    id: 'cream_bakery',
    name: 'Tiệm Bánh Bơ Sữa (Cream Bakery)',
    description: 'Phong cách tiệm bánh châu Âu cổ điển với màu vàng bơ và nâu cà phê ấm cúng.',
    primaryColor: '#E6A15C',
    accentColor: '#FFE6A7',
    bgColor: '#FFFBF2',
    unlocked: false,
    cost: 120000,
  },
  lavender_dream: {
    id: 'lavender_dream',
    name: 'Giấc Mơ Oải Hương (Lavender Dream)',
    description: 'Tím mộng mơ lãng mạn, mang hương thơm hoa cỏ êm dịu giữa lòng phố.',
    primaryColor: '#B39DDB',
    accentColor: '#D8C4F1',
    bgColor: '#F8F5FC',
    unlocked: false,
    cost: 180000,
  },
};

export const DECORATION_ITEMS: DecorationItem[] = [
  {
    id: 'deco_flower_vase',
    name: 'Bình Hoa Linh Lan Trắng',
    category: 'plant',
    icon: '💐',
    cost: 35000,
    cozyPoints: 12,
    bonusEffectDesc: '+5% độ kiên nhẫn của khách hàng khi chờ món.',
    owned: false,
    equipped: false,
    description: 'Hoa linh lan tượng trưng cho sự thuần khiết và may mắn.',
  },
  {
    id: 'deco_sun_lamp',
    name: 'Đèn Chùm Giọt Nắng Pastel',
    category: 'lighting',
    icon: '💡',
    cost: 55000,
    cozyPoints: 20,
    bonusEffectDesc: '+10% tỷ lệ khách hàng ghé thăm tiệm.',
    owned: false,
    equipped: false,
    description: 'Ánh sáng vàng ấm áp tạo bầu không khí lung linh lãng mạn.',
  },
  {
    id: 'deco_menu_chalk',
    name: 'Bảng Menu Vẽ Phấn Nghệ Thuật',
    category: 'wall',
    icon: '📋',
    cost: 45000,
    cozyPoints: 15,
    bonusEffectDesc: '+8% tiền boa (Tip) từ khách hàng.',
    owned: false,
    equipped: false,
    description: 'Bảng vẽ tay xinh xắn ghi lại những món "best-seller" của quán.',
  },
  {
    id: 'deco_sofa',
    name: 'Ghế Băng Chờ Bọc Nhung Hồng',
    category: 'furniture',
    icon: '🛋️',
    cost: 85000,
    cozyPoints: 30,
    bonusEffectDesc: '+15% độ kiên nhẫn tối đa cho toàn bộ khách trong tiệm.',
    owned: false,
    equipped: false,
    description: 'Khách hàng có thể ngồi nghỉ chân thư giãn khi đợi món mang về.',
  },
  {
    id: 'deco_cat_painting',
    name: 'Tranh Treo Mèo Con Thưởng Trà',
    category: 'wall',
    icon: '🖼️',
    cost: 65000,
    cozyPoints: 22,
    bonusEffectDesc: 'Giảm 20% tốc độ tăng căng thẳng (Stress) cho nhân viên.',
    owned: false,
    equipped: false,
    description: 'Bức tranh dễ thương làm tan biến mọi mệt mỏi trong ca làm việc.',
  },
];

// === V0.4 - V0.5: ĐẾ CHẾ VỈA HÈ CATALOGS ===

export const BUSINESS_STAGES: Record<string, import('./types').BusinessStage> = {
  cart: {
    id: 'cart',
    name: 'Xe Đẩy Lề Đường',
    tagline: 'Khởi đầu bình dị với chiếc xe nhôm và ghế nhựa đỏ ven đường.',
    icon: '🛒',
    maxTables: 2,
    customerRateMs: 5500,
    cost: 0,
    requiredReputation: 0,
    maxRestaurants: 1, // Tối đa 1 quán khởi sự
    maxStaff: 2, // Tối đa 2 nhân viên (Chủ + 1 phụ tá)
    description: 'Chỉ vỏn vẹn chiếc xe đẩy nhỏ nép bên vỉa hè, bán 1 quán duy nhất và tự thân vận động.',
  },
  corner: {
    id: 'corner',
    name: 'Góc Cây Me / Quán Cóc',
    tagline: 'Thêm dù che nắng mưa, quầy trà đá cà phê phin mát rượi.',
    icon: '🌳',
    maxTables: 3,
    customerRateMs: 4500,
    cost: 250000,
    requiredReputation: 45,
    maxRestaurants: 1, // Vẫn 1 quán nhưng mở rộng chỗ ngồi
    maxStaff: 4, // Tối đa 4 nhân viên (Mở khóa tuyển nhân viên đi chợ)
    description: 'Bàn ghế kê râm mát dưới bóng cây, mở rộng thêm bàn ăn và tuyển chuyên viên đi chợ sỉ.',
  },
  awning: {
    id: 'awning',
    name: 'Tiệm Mái Hiên Bình Dân',
    tagline: 'Bảng hiệu bạt Hiflex sáng đèn, bàn xếp inox sạch sẽ.',
    icon: '🏮',
    maxTables: 4,
    customerRateMs: 3800,
    cost: 1500000,
    requiredReputation: 120,
    maxRestaurants: 2, // ⭐ CHÍNH THỨC MỞ KHÓA CHI NHÁNH THỨ 2!
    maxStaff: 7, // Tối đa 7 nhân viên phục vụ 2 quán
    description: 'Mái hiên di động che mưa nắng, thương hiệu uy tín chính thức được mở thêm Chi Nhánh thứ 2!',
  },
  eatery: {
    id: 'eatery',
    name: 'Quán Ăn Phố Lớn',
    tagline: 'Mặt tiền trung tâm, bếp mở hiện đại, thực khách xếp hàng.',
    icon: '🏪',
    maxTables: 5,
    customerRateMs: 3000,
    cost: 6000000,
    requiredReputation: 350,
    maxRestaurants: 4, // ⭐ MỞ KHÓA CHI NHÁNH THỨ 3 & 4!
    maxStaff: 12, // Tối đa 12 nhân viên
    description: 'Mặt tiền phố lớn đông đúc, mở rộng lên đến 4 chi nhánh đa ngành ẩm thực.',
  },
  empire: {
    id: 'empire',
    name: 'Chuỗi Đế Chế Vỉa Hè',
    tagline: 'Biểu tượng ẩm thực đường phố, chi nhánh phủ khắp phố phường!',
    icon: '👑',
    maxTables: 6,
    customerRateMs: 2400,
    cost: 25000000,
    requiredReputation: 850,
    maxRestaurants: 5, // ⭐ MỞ TRỌN BỘ 5 CHI NHÁNH TOÀN NĂNG!
    maxStaff: 20, // Tối đa 20 nhân viên
    description: 'Đỉnh cao đế chế ẩm thực quốc dân! Mở trọn vẹn cả 5 chuỗi thương hiệu khắp thành phố.',
  },
};

export const NEIGHBORS_DATA: Record<import('./types').NeighborId, import('./types').NeighborData> = {
  bac_ba: {
    id: 'bac_ba',
    name: 'Bác Ba',
    nickname: 'Tổ Trưởng Khu Phố',
    role: 'Tổ Trưởng Dân Phố',
    avatar: '👴',
    gender: 'male',
    favoriteDishId: 'cafe_sua',
    dialogues: {
      1: 'Vỉa hè buôn bán phải nhớ quét dọn sạch sẽ nha cháu! Đừng để rác bừa bãi kẻo lối xóm phiền lòng.',
      2: 'Cà phê của cháu pha đậm đà đấy! Bác đi tuần tra sáng nào cũng muốn ghé làm một ly cho tỉnh táo.',
      3: 'Bác nghe nói mấy bữa nữa có đoàn trật tự đô thị đi nhắc nhở. Cháu nhớ xếp bàn ghế gọn gàng nghe!',
      4: 'Cả xóm này ai cũng khen cháu chịu thương chịu khó. Bác đang tính xét tặng quán cháu danh hiệu Điểm Sáng Văn Hóa!',
      5: 'Cháu như con cháu trong nhà của bác vậy! Có ai làm khó cháu trên vỉa hè này, cứ bảo Bác Ba một tiếng!',
    },
    secrets: [
      {
        level: 2,
        title: 'Bí Mật Chiếc Sổ Tay Bác Ba',
        story: 'Bác Ba đã làm tổ trưởng hơn 20 năm, cuốn sổ tay cũ kỹ ghi chép sinh nhật của từng đứa trẻ trong xóm!',
      },
      {
        level: 4,
        title: 'Tấm Lòng Bác Tổ Trưởng',
        story: 'Ngày xưa Bác Ba từng là đầu bếp trong quân ngũ, nên bác sành ăn và rất quý những người nấu nướng có tâm.',
      },
    ],
    perkDescription: 'Bác Ba che chở: Giảm 50% nguy cơ bị nhắc nhở phạt lấn chiếm lề đường.',
  },
  co_bay: {
    id: 'co_bay',
    name: 'Cô Bảy',
    nickname: 'Bảy Vé Số May Mắn',
    role: 'Người Bán Vé Số Dạo',
    avatar: '👵',
    gender: 'female',
    favoriteDishId: 'banh_mi_trung',
    dialogues: {
      1: 'Mua giùm cô tờ vé số đi con ơi! Chiều nay 16h30 xổ số, biết đâu đổi đời trúng độc đắc tiền tỷ nhen!',
      2: 'Bánh mì trứng con chiên thơm phức hà. Cô đi bộ mỏi chân, ngửi mùi là muốn ghé ngồi nghỉ liền.',
      3: 'Sáng nay cô nghe mấy bà ngoài chợ đồn giá thịt heo với trứng sắp hạ nhiệt đấy, con tha hồ lấy hàng rẻ!',
      4: 'Cô để dành sẵn cho con cặp vé số có đuôi lộc phát 68 - 86 nè, chúc quán con hôm nay khách nườm nượp!',
      5: 'Con tốt bụng với cô quá! Cô coi con như con gái/con trai ruột vậy. Cầu trời phật phù hộ cho con buôn may bán đắt!',
    },
    secrets: [
      {
        level: 2,
        title: 'Ước Mơ Của Cô Bảy',
        story: 'Cô Bảy bán vé số suốt 15 năm qua để nuôi hai người con ăn học đỗ đại học trên thành phố.',
      },
      {
        level: 4,
        title: 'Tấm Vé Số Định Mệnh',
        story: 'Năm ngoái một vị khách quen mua vé của cô đã trúng giải an ủi 50 triệu và biếu lại cô một chiếc xe đạp mới.',
      },
    ],
    perkDescription: 'Vé số tài lộc: Mua vé số mỗi ngày và nhận cơ hội trúng giải thưởng lớn lúc 16:30!',
  },
  chu_nam: {
    id: 'chu_nam',
    name: 'Chú Năm',
    nickname: 'Năm Xe Ôm Biker',
    role: 'Tài Xế Công Nghệ & Xe Ôm',
    avatar: '🛵',
    gender: 'male',
    favoriteDishId: 'banh_mi_thit',
    dialogues: {
      1: 'Cho chú một ổ bánh mì thịt nhiều ớt với ly trà đá lẹ lẹ nha em trai, chú đang đợi nổ cuốc xe mới!',
      2: 'Bánh mì quán này ướp thịt nướng ngon số dách! Chú giới thiệu cả hội anh em tài xế ghé qua ủng hộ luôn rồi đó.',
      3: 'Chú chạy khắp hang cùng ngõ hẻm, thấy quán nào đông là biết ngay bí quyết. Quán cháu vừa rẻ vừa ngon, chắc chắn sẽ phất lên!',
      4: 'Trời sắp đổ mưa to đó cháu ơi, chuẩn bị kéo bạt che bàn kẻo khách ướt mem bây giờ!',
      5: 'Anh em tài xế bảo nhau: cứ thèm bánh mì là phải tạt vô quán này! Chú nhận ship đồ ăn độc quyền cho quán cháu luôn!',
    },
    secrets: [
      {
        level: 2,
        title: 'Chiếc Xe Máy Cổ',
        story: 'Chiếc xe Cup 50 chú Năm chạy là kỷ vật người cha để lại, bền bỉ qua hơn 30 năm mưa nắng vỉa hè.',
      },
      {
        level: 4,
        title: 'Hiệp Sĩ Đường Phố',
        story: 'Chú Năm từng nhiều lần giúp bà con bắt trộm và đưa người già lạc đường về tận nhà.',
      },
    ],
    perkDescription: 'Đội xe hỗ trợ: Tăng 20% tiền boa và nhận cảnh báo sớm trước khi thời tiết xấu ập tới.',
  },
  be_bong: {
    id: 'be_bong',
    name: 'Bé Bông',
    nickname: 'Học Sinh Lớp 3',
    role: 'Học Sinh Tiểu Học Trong Xóm',
    avatar: '👧',
    gender: 'female',
    favoriteDishId: 'tra_sua',
    dialogues: {
      1: 'Anh/Chị ơi, cho em xin một ly trà sữa trân châu thật nhiều thạch nha! Em để dành tiền ăn sáng cả tuần đó ạ!',
      2: 'Quán của anh/chị thơm quá chừng! Mỗi lần tan học đi ngang em đều nhìn hoài luôn.',
      3: 'Hôm nay em được điểm 10 môn toán nè! Mẹ thưởng cho em tiền mua bánh mì pate đặc biệt ăn mừng!',
      4: 'Em có vẽ tặng quán một bức tranh hình bánh mì cute nè, anh/chị dán lên xe đẩy nha!',
      5: 'Lớn lên em cũng muốn mở một tiệm bánh mì dễ thương như quán của anh/chị vậy á!',
    },
    secrets: [
      {
        level: 2,
        title: 'Heo Đất Tiết Kiệm Của Bông',
        story: 'Bé Bông có chú heo đất màu hồng, đang tiết kiệm tiền để mua quà sinh nhật tặng mẹ.',
      },
      {
        level: 4,
        title: 'Bức Tranh Giải Nhất Trường',
        story: 'Bức tranh vẽ quán vỉa hè của bạn đã đoạt giải Nhất hội thi vẽ nét đẹp quê hương cấp trường!',
      },
    ],
    perkDescription: 'Nụ cười thiên thần: Mang lại may mắn, tăng 15% lượng khách học sinh sinh viên ghé quán.',
  },
  chi_lan: {
    id: 'chi_lan',
    name: 'Chị Lan',
    nickname: 'Lan Văn Phòng Sành Ăn',
    role: 'Nhân Viên Công Sở Tòa Nhà Đối Diện',
    avatar: '👩‍💼',
    gender: 'female',
    favoriteDishId: 'banh_mi_dac_biet',
    dialogues: {
      1: 'Làm cho chị 1 ổ bánh mì đặc biệt mang đi nha, nhớ cắt đôi giùm chị, bọc giấy cẩn thận nhé.',
      2: 'Vỏ bánh mì giòn rụm mà pate thơm béo ngậy chuẩn vị Pháp luôn! Chị mê tít từ miếng cắn đầu tiên.',
      3: 'Hôm nay phòng Marketing tụi chị tăng ca, chị gom đơn 5 ổ bánh mì với 5 ly cà phê sữa đá cho cả nhóm nè!',
      4: 'Chị đã review 5 sao quán em lên nhóm "Hội Ăn Sạch Uống Lành Văn Phòng" rồi đấy, chuẩn bị đông khách nha!',
      5: 'Chị coi quán này như căn tin riêng của công ty vậy! Cứ đói là nghĩ ngay đến thương hiệu của em!',
    },
    secrets: [
      {
        level: 2,
        title: 'Food Blogger Giấu Mặt',
        story: 'Chị Lan ngoài làm công sở còn sở hữu một trang blog ẩm thực với hơn 50.000 lượt theo dõi!',
      },
      {
        level: 4,
        title: 'Hợp Đồng Cung Cấp Bữa Sáng',
        story: 'Chị Lan đã đề xuất ban giám đốc ký hợp đồng đặt bữa sáng cố định mỗi tuần từ quán vỉa hè của bạn.',
      },
    ],
    perkDescription: 'Khách sành điệu: Khách văn phòng tip hào phóng +25% tiền boa và thường xuyên gọi combo lớn.',
  },
};

export const DREAM_BOOK_NUMBERS = [
  { dream: 'Mơ thấy Con Rắn bò qua đường', number: '32', icon: '🐍' },
  { dream: 'Mơ thấy Con Chó vẫy đuôi', number: '11', icon: '🐕' },
  { dream: 'Mơ thấy Tiền rơi đầy ngõ', number: '52', icon: '💸' },
  { dream: 'Mơ được Crush tỏ tình ngọt ngào', number: '69', icon: '💖' },
  { dream: 'Mơ Trật Tự Đô Thị rượt chạy té khói', number: '88', icon: '👮' },
  { dream: 'Mơ Gà đẻ trứng vàng phát sáng', number: '28', icon: '🐓' },
  { dream: 'Mơ Xe Ôm nổ cuốc tiền triệu', number: '54', icon: '🛵' },
  { dream: 'Mơ Bánh Mì giòn rụm thơm bơ', number: '08', icon: '🥖' },
  { dream: 'Mơ Trúng Độc Đắc thành tỷ phú', number: '99', icon: '👑' },
  { dream: 'Mơ Bà bán bún bò đối diện làm hòa', number: '73', icon: '🍜' },
];

export const STREET_EVENTS: import('./types').StreetEvent[] = [
  {
    id: 'urban_patrol',
    title: '🚨 Công An & Trật Tự Đô Thị Đi Tuần!',
    tag: '👮 Trật Tự Đô Thị',
    icon: '🚓',
    description: 'Tiếng còi hú vang lên đầu hẻm kèm loa phát thanh: "Yêu cầu các hộ buôn bán lập tức dọn dẹp lòng lề đường!". Khách ngồi ăn nháo nhào nhìn bạn!',
    choices: [
      {
        text: 'Bê bàn ghế chạy thục mạng vào hẻm né đoàn xe',
        gainMoney: 0,
        gainReputation: -1,
        gainEnergy: -10,
        outcomeText: 'Pha né trạm đỉnh cao! Bạn và khách ôm ghế né vào ngõ cụt an toàn, dù hơi mệt nhưng cả xóm vỗ tay khen bạn nhanh như chớp!',
      },
      {
        text: 'Cầu cứu Bác Ba Tổ Trưởng ra đỡ lời bảo lãnh',
        gainReputation: 3,
        outcomeText: 'Bác Ba bước ra khoát tay: "Mấy chú thông cảm, cháu nó buôn bán ngoan ngoãn sạch sẽ lắm!". Đoàn kiểm tra mỉm cười gật đầu rồi đi tiếp. (+3 Uy tín)',
      },
      {
        text: 'Nghiêm chỉnh chấp hành nộp phạt tại chỗ (30,000 đ)',
        cost: 30000,
        gainReputation: 8,
        outcomeText: 'Đoàn lập biên bản nhắc nhở và tuyên dương tinh thần thượng tôn pháp luật! Hình ảnh quán văn minh được lan tỏa. (+8 Uy tín)',
      },
    ],
  },
  {
    id: 'gangster_protection',
    title: '🦹 Đại Ca Xăm Trổ Đòi Phí Bảo Kê Vỉa Hè!',
    tag: '🕶️ Giang Hồ Hẻm',
    icon: '🐉',
    description: 'Hai thanh niên đeo kính đen, tay xăm rồng phượng bước vào gõ bàn cồm cộp: "Khu này tụi tao bảo kê, biết điều đóng 40k tiền nước mỗi tuần đi chủ quán!"',
    choices: [
      {
        text: 'Tự tay làm 2 ổ Bánh Mì Thập Cẩm siêu cay mời đại ca hạ hỏa',
        cost: 12000,
        gainReputation: 5,
        gainEnergy: 5,
        outcomeText: 'Đại ca cắn một miếng cay xé lưỡi nhưng tấm tắc: "Má ơi ngon quá! Thôi từ nay tao bảo kê miễn phí cho quán mày, ai phá bảo tao!". (+5 Uy tín)',
      },
      {
        text: 'Gọi Chú Năm xe ôm hiệp sĩ đường phố ra nói chuyện lý lẽ',
        gainReputation: 3,
        outcomeText: 'Chú Năm dắt hội anh em biker mặt ngầu ra đứng khoanh tay lườm. Hai thanh niên đổi giọng "Tụi em ghé hỏi thăm sức khỏe thôi ạ" rồi lủi mất dạng!',
      },
      {
        text: 'Mở loa kẹo kéo bật Vinahouse quẩy cùng đại ca',
        gainReputation: 2,
        gainMoney: 25000,
        outcomeText: 'Nhạc sàn bốc lửa khiến đại ca hứng chí nhảy tưng bừng, bo ngược lại 25,000 đ tiền tip rồi rủ hôm nào đi hát karaoke! (+25,000 đ)',
      },
    ],
  },
  {
    id: 'cousin_borrow_money',
    title: '📱 Thằng Em Họ Bắn Tin Nhắn Vay Nóng Zalo!',
    tag: '💬 Người Nhà Báo Thủ',
    icon: '💸',
    description: 'Ting ting! Tin nhắn Zalo từ Em Họ: "Anh/Chị hai ơi! Em kẹt tiền nạp 4G với đóng tiền trọ quá, bắn em mượn 50,000 đ, cuối tuần có lương em trả liền hứa danh dự!"',
    choices: [
      {
        text: 'Chuyển khoản luôn 50,000 đ ("Coi như mất, nhưng thương em")',
        cost: 50000,
        gainMoney: 110000,
        gainReputation: 4,
        outcomeText: 'Bất ngờ chưa! Cuối tuần mẹ nó ở quê xách lên thùng gà ta với buồng chuối thơm lừng cảm ơn bạn, bạn đem chế biến bán được hẳn 110,000 đ! (+4 Uy tín)',
      },
      {
        text: 'Từ chối khéo: "Anh còn đang ăn bánh mì vụn chan nước tương đây em"',
        gainReputation: 0,
        outcomeText: 'Nó gửi lại một loạt sticker mèo khóc ròng than vãn rồi đi mượn người khác. Bạn bảo toàn nguyên vẹn số dư ví!',
      },
      {
        text: 'Rủ rê: "Qua phụ quán bưng bê rửa chén 1 buổi anh cho 60k bao ăn"',
        cost: 60000,
        gainEnergy: 30,
        gainReputation: 3,
        outcomeText: 'Nó lật đật chạy qua phụ cật lực, chén đĩa sạch bóng loáng, bạn đỡ mệt hẳn và hồi phục +30 Năng lượng!',
      },
    ],
  },
  {
    id: 'lotto_dream',
    title: '🎱 Chiêm Bao Thấy Giấc Mộng Số Đề Thần Kê!',
    tag: '🎲 Sổ Mơ Dân Gian',
    icon: '🐓',
    description: 'Đêm qua bạn nằm mơ thấy một con gà trống vàng bay qua xe bánh mì đẻ ra quả trứng phát sáng! Bà con trong xóm khuyên: "Gà đẻ trứng là số 28 hoặc 68 đó!"',
    choices: [
      {
        text: 'Xuống xác 20,000 đ ghi con số đề may mắn',
        cost: 20000,
        gainMoney: 120000,
        gainReputation: 3,
        outcomeText: 'Tài lộc nở rộ! Chiều xổ đúng phóc số chiêm bao! Bạn trúng đậm 120,000 đ tiền thưởng trong tiếng reo hò của cả xóm! (+120,000 đ)',
      },
      {
        text: 'Mua 1 tờ vé số 10k ủng hộ Cô Bảy lấy hên',
        cost: 10000,
        gainMoney: 30000,
        gainReputation: 2,
        outcomeText: 'Cô Bảy vui vẻ chúc phúc, bạn trúng giải an ủi nhận về 30,000 đ tiền may mắn!',
      },
      {
        text: 'Không mê tín dị đoan, tập trung nướng bánh mì',
        gainEnergy: 10,
        gainReputation: 1,
        outcomeText: 'Lao động là vinh quang! Bạn giữ vững tâm lý kiên định, nướng được mẻ bánh mì vàng ươm thơm nức mũi.',
      },
    ],
  },
  {
    id: 'crush_visit',
    title: '💖 Crush Bất Ngờ Xuất Hiện Tại Xe Bánh Mì!',
    tag: '✨ Rung Động Tuổi Trẻ',
    icon: '🥰',
    description: 'Crush đạp xe ghé vào tiệm: "Cho mình 1 ổ bánh mì trứng nhiều bơ patê nha...". Tim bạn đập thình thịch 150 nhịp/phút, chân tay bủn rủn!',
    choices: [
      {
        text: 'Run tay cho gấp đôi thịt phô mai & tặng kèm ly trà sữa',
        cost: 15000,
        gainReputation: 6,
        gainMoney: 30000,
        outcomeText: 'Crush ngạc nhiên thích thú: "Ôi sao đầy đặn thế này!". Crush khen bạn dễ thương và chủ động xin tài khoản Zalo / Instagram! (+6 Uy tín)',
      },
      {
        text: 'Dán giấy note thả thính: "Bánh mì thì có bơ, còn em thì có cơ hội không?"',
        gainReputation: 8,
        gainMoney: 20000,
        outcomeText: 'Crush đọc xong đỏ bừng mặt cười tít mắt, tip thêm cho bạn 20,000 đ và bảo "Sáng nào mình cũng ghé ủng hộ nha!". (+8 Uy tín)',
      },
      {
        text: 'Giữ vẻ mặt ngầu lạnh lùng, múa dao kẹp bánh mì như Salt Bae',
        gainReputation: 4,
        gainEnergy: 10,
        outcomeText: 'Thần thái đỉnh cao! Crush trầm trồ bấm máy quay story đăng lên mạng với caption: "Chủ quán bánh mì ngầu nhất phố!".',
      },
    ],
  },
  {
    id: 'qr_transfer_glitch',
    title: '💸 Biến Động Số Dư Tâm Linh: Khách Bắn 2k Thay Vì 20k!',
    tag: '📲 Drama Chuyển Khoản',
    icon: '🧾',
    description: 'Một bạn trẻ đi xe Vision sành điệu quét VietQR thanh toán 1 ổ đặc biệt rồi phóng vụt đi. Điện thoại ting ting: "Tài khoản vừa nhận +2,000 VND"!',
    choices: [
      {
        text: 'Hét lớn "Thiếu một số 0 bạn ơi!" rồi nhờ Chú Năm dí theo',
        gainMoney: 50000,
        gainReputation: 2,
        outcomeText: 'Chú Năm vít ga chặn đầu xe! Bạn trẻ ngượng chín mặt xin lỗi vì nhìn nhầm số 0, chuyển bù ngay 50,000 đ tạ lỗi! (+50,000 đ)',
      },
      {
        text: 'Chụp bill đăng lên Threads tâm sự Gen Z tìm người quen',
        gainMoney: 40000,
        gainReputation: 6,
        outcomeText: 'Bài viết viral 100k view! Cư dân mạng cười bò và rủ nhau kéo tới quán ăn bánh mì giải cứu chủ quán đáng thương! (+40,000 đ, +6 Uy tín)',
      },
      {
        text: 'Coi như của đi thay người, hoan hỷ bỏ qua lấy vía may',
        gainReputation: 3,
        gainMoney: 25000,
        outcomeText: 'Tâm sinh tướng! Ngay sau đó một vị khách hào sảng ghé mua và tip hẳn 25,000 đ vì thấy nụ cười hiền lành của bạn!',
      },
    ],
  },
  {
    id: 'trend_toptop',
    title: '🍋 Bắt Trend Tóp Tóp: Trà Chanh Giã Tay & Bánh Mì Chữa Lành!',
    tag: '🔥 Cơn Sốt Mạng Xã Hội',
    icon: '⚡',
    description: 'Trend mới bùng nổ trên TikTok! Cả đám đông học sinh sinh viên kéo tới đứng kín lề đường hỏi: "Quán có trà giã tay hay bánh mì chữa lành không ạ?"',
    choices: [
      {
        text: 'Cầm cối chày giã chanh đùng đùng phục vụ khách tới tấp',
        gainMoney: 85000,
        gainReputation: 5,
        gainEnergy: -20,
        outcomeText: 'Doanh thu bùng nổ rực rỡ thu về +85,000 đ! Dù hai cánh tay mỏi rã rời nhưng túi tiền rủng rỉnh ấm no! (+85,000 đ, +5 Uy tín)',
      },
      {
        text: 'Ra mắt món "Bánh Mì Chữa Lành Ôm Trọn Nỗi Đau" giá sinh viên',
        cost: 10000,
        gainMoney: 55000,
        gainReputation: 7,
        outcomeText: 'Cái tên độc lạ đánh trúng tim đen Gen Z! Các bạn trẻ check-in ầm ầm khen ngợi sự sáng tạo của bạn! (+55,000 đ, +7 Uy tín)',
      },
      {
        text: 'Kiên định bán bánh mì truyền thống không đu trend',
        gainReputation: 4,
        gainMoney: 20000,
        outcomeText: 'Các cô bác lớn tuổi trong xóm tấm tắc: "Ăn quán này mộc mạc chuẩn vị nhất, không màu mè!". (+4 Uy tín)',
      },
    ],
  },
  {
    id: 'delivery_bombed',
    title: '🛵 Bi Kịch Shipper: Bị Khách Bom 5 Ổ Bánh Mì Nóng Hổi!',
    tag: '😭 Bùng Đơn Oái Oăm',
    icon: '📦',
    description: 'Chú Năm giao hàng quay về mếu máo: Khách đặt 5 ổ bánh mì thập cẩm đặc biệt nhưng tới nơi thì thuê bao quý khách không liên lạc được!',
    choices: [
      {
        text: 'Treo bảng thanh lý nửa giá "Bánh mì giải cứu" cho sinh viên',
        gainMoney: 40000,
        gainReputation: 4,
        outcomeText: 'Các bạn sinh viên trường gần đó chạy ùa tới mua sạch trong 2 phút! Thu hồi vốn 40,000 đ và nhận ngàn lời cảm ơn! (+40,000 đ)',
      },
      {
        text: 'Mở tiệc liên hoan nội bộ cho toàn thể nhân viên ăn no nê',
        gainEnergy: 25,
        gainReputation: 3,
        outcomeText: 'Bé Mai, Em Tuấn, Bác Linh ăn giòn rụm tấm tắc khen ngon! Tinh thần làm việc phấn chấn x2, tốc độ phục vụ tăng vọt! (+25 Năng lượng)',
      },
      {
        text: 'Đem tặng các cô bác lao công và Bác Ba Tổ Trưởng',
        gainReputation: 9,
        outcomeText: 'Nghĩa cử cao đẹp làm ấm lòng khu phố! Bác Ba cảm động viết bài biểu dương quán trên bảng tin dân phố! (+9 Uy tín)',
      },
    ],
  },
  {
    id: 'neighbor_war',
    title: '👵 Đại Chiến Vỉa Hè: Bà Bán Bún Bò Đối Diện Hắt Nước Rửa Chén!',
    tag: '💥 Kịch Tính Xóm Giềng',
    icon: '🍜',
    description: 'Bà Năm bán bún bò bên kia đường thấy quán bạn đông khách bèn ghen tị, cố tình hắt xô nước rửa chén làm văng ra đường trước mặt thực khách!',
    choices: [
      {
        text: 'Bê ngay 1 đĩa bánh mì giòn nóng hổi sang mời bà Năm nếm thử',
        cost: 8000,
        gainReputation: 6,
        gainMoney: 30000,
        outcomeText: 'Lấy ân báo oán! Bà Năm ăn miếng bánh mì pate ngon quá bèn ngượng ngùng xin lỗi, sau đó hai quán bắt tay làm combo Bún Bò + Bánh Mì đắt hàng! (+30,000 đ)',
      },
      {
        text: 'Bật loa kẹo kéo hát bài Bolero trữ tình át tiếng cằn nhằn',
        gainReputation: 4,
        gainEnergy: 10,
        outcomeText: 'Giọng ca oanh vàng của bạn làm thực khách vừa ăn vừa vỗ tay cổ vũ rần rần! Bà Năm tắt đài dọn bàn đi vào nhà.',
      },
      {
        text: 'Mời Bác Ba Tổ Trưởng sang lập biên bản giữ gìn vệ sinh chung',
        gainReputation: 5,
        outcomeText: 'Bác Ba nghiêm khắc nhắc nhở bà Năm không được xả nước bừa bãi. Lòng lề đường lập tức thông thoáng sạch đẹp trở lại! (+5 Uy tín)',
      },
    ],
  },
  {
    id: 'multilevel_scam',
    title: '💼 Thanh Niên Đa Cấp "Tự Do Tài Chính 4.0" Rủ Làm Giàu!',
    tag: '👔 Làm Giàu Không Khó',
    icon: '💼',
    description: 'Một thanh niên mặc vest bảnh bao, cầm túi da bước vào: "Chào bạn, nhìn bạn nướng bánh mì cực khổ quá. Tham gia mạng lưới tài chính cùng tôi để sở hữu xe sang sau 3 tháng nhé!"',
    choices: [
      {
        text: 'Tặng luôn 1 ổ bánh mì ăn lót dạ: "Ăn đi em cho tỉnh táo rồi hẵng chém gió"',
        cost: 6000,
        gainReputation: 5,
        outcomeText: 'Thanh niên đói lả ăn một hơi hết sạch, rưng rưng nước mắt thú nhận bị lừa hết tiền và hứa sẽ từ bỏ đa cấp về quê làm lại từ đầu! (+5 Uy tín)',
      },
      {
        text: 'Hỏi dồn: "Thế dự án lãi bao nhiêu %, dòng tiền từ đâu ra?"',
        gainReputation: 3,
        gainMoney: 15000,
        outcomeText: 'Bị bạn chất vấn kinh tế học vi mô chuẩn bài, thanh niên ú ớ toát mồ hôi hột, vội vàng mua 1 ổ bánh mì rồi rút lui! (+15,000 đ)',
      },
      {
        text: 'Chỉ tay sang tiệm sửa xe Chú Năm: "Anh sang rủ Chú Năm đầu tư kìa"',
        gainReputation: 2,
        outcomeText: 'Chú Năm cầm cờ-lê ra hỏi thăm một câu là thanh niên xách cặp chạy té khói không dám quay lại!',
      },
    ],
  },
  {
    id: 'rain_shower',
    title: '🌦️ Cơn Mưa Rào Vỉa Hè Bất Chợt!',
    tag: '🌧️ Thời Tiết Phố Phường',
    icon: '🌧️',
    description: 'Bầu trời bỗng tối sầm và những giọt mưa rào lộp độp rơi xuống mặt đường. Bà con vội vã tìm chỗ trú mưa!',
    choices: [
      {
        text: 'Bung bạt dù che cho toàn bộ khách',
        cost: 15000,
        gainReputation: 4,
        gainMoney: 40000,
        outcomeText: 'Khách ấm lòng ngồi trú mưa, gọi thêm trà đá và cà phê nóng! (+40,000 đ doanh thu, +4 Uy tín)',
      },
      {
        text: 'Chỉ che xe đẩy, xin lỗi mời khách dọn vào hiên',
        gainReputation: 1,
        outcomeText: 'Khách thông cảm chia sẻ nỗi vất vả của hàng quán vỉa hè ngày mưa.',
      },
    ],
  },
  {
    id: 'market_sale',
    title: '🥬 Chợ Đầu Mối Giảm Giá Giờ Vàng!',
    tag: '🥦 Chợ Sỉ Giá Rẻ',
    icon: '🎉',
    description: 'Cô Ba tạp hóa quen ngoài chợ gọi điện: "Sáng nay lô pate và trứng gà tươi về nhiều quá, ghé lấy giá gốc nè cháu!"',
    choices: [
      {
        text: 'Tranh thủ lấy thêm lô bánh mì & trứng gà tươi giá sỉ',
        cost: 30000,
        gainReputation: 3,
        gainMoney: 50000,
        outcomeText: 'Kho hàng của bạn được bổ sung nguyên liệu tươi ngon với giá hời, tiết kiệm một khoản chi phí lớn! (+3 Uy tín)',
      },
      {
        text: 'Cảm ơn cô, hiện tại kho vẫn còn đủ dùng',
        gainReputation: 0,
        outcomeText: 'Bạn tiếp tục tập trung phục vụ thực khách.',
      },
    ],
  },
];

/**
 * Trả về danh sách kho khởi nghiệp (10 đơn vị mỗi loại) CHỈ gồm các nguyên liệu của thương hiệu quán đó
 */
export function getStarterInventoryForRestaurant(restaurantId: RestaurantTypeId): Partial<Record<IngredientId, number>> {
  const rest = RESTAURANT_TYPES[restaurantId];
  const inv: Partial<Record<IngredientId, number>> = {};
  if (!rest) return inv;

  for (const ingId of rest.allowedIngredientIds) {
    inv[ingId] = 10;
  }
  return inv;
}

/**
 * Trả về danh sách công thức ban đầu của quán
 */
export function getStarterRecipesForRestaurant(restaurantId: RestaurantTypeId): RecipeId[] {
  const rest = RESTAURANT_TYPES[restaurantId];
  return rest ? [...rest.primaryRecipeIds] : ['banh_mi_trung', 'banh_mi_thit', 'cafe_sua', 'tra_dao'];
}

export const INITIAL_GAME_STATE: GameSaveState = {
  version: '0.4.0',
  playerId: 'player_default',
  shopName: 'Tiệm Bánh Mì Vỉa Hè Ba Miền 🥖',
  day: 1,
  gameTimeMinutes: 360, // 06:00 sáng
  money: 100000, // 100,000 VND vốn khởi nghiệp vỉa hè
  reputation: 10,
  player: {
    name: 'Chủ Quán Dễ Thương',
    energy: 100,
    maxEnergy: 100,
    cookingLevel: 1,
    cookingExp: 0,
  },
  inventory: {
    bread: 10,
    egg: 10,
    pork: 10,
    cucumber: 10,
    pate: 10,
    herb: 10,
    tea: 10,
    milk: 10,
    condensed_milk: 10,
    coffee: 10,
  },
  restaurantInventories: {
    banh_mi: {
      bread: 10,
      egg: 10,
      pork: 10,
      cucumber: 10,
      pate: 10,
      herb: 10,
      tea: 10,
      milk: 10,
      condensed_milk: 10,
      coffee: 10,
    },
  },
  unlockedRecipes: [
    'banh_mi_trung',
    'banh_mi_thit',
    'banh_mi_dac_biet',
    'banh_mi_xiu_mai',
    'tra_sua',
    'cafe_sua',
    'tra_dao',
  ],
  purchasedUpgrades: {},
  hiredEmployees: [],
  employeeDetails: {},
  activeTheme: 'sakura_pink',
  ownedThemes: ['sakura_pink'],
  ownedDecorations: [],
  equippedDecorations: [],
  storageCapacity: 100,
  historySummaries: [],
  lastSavedAt: new Date().toISOString(),

  // Dữ liệu Đế Chế Vỉa Hè
  businessStage: 'cart',
  stageUpgrades: {
    cart: {},
    corner: {},
    awning: {},
    eatery: {},
    empire: {},
  },
  neighbors: {
    bac_ba: {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    },
    co_bay: {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    },
    chu_nam: {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    },
    be_bong: {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    },
    chi_lan: {
      level: 1,
      intimacyExp: 0,
      unlockedSecretIds: [],
      lastInteractedDay: 0,
    },
  },
  activeLotteryTicket: null,
  lotteryHistory: [],
  currentEvent: null,
  deliveryOrders: [],
  totalDeliveriesCompleted: 0,

  // V0.6: Hệ thống Chuỗi Chi Nhánh Đa Ẩm Thực
  activeRestaurantId: 'banh_mi',
  unlockedRestaurants: ['banh_mi'],
  branchLevels: {
    banh_mi: 1,
    pho: 1,
    bun: 1,
    beefsteak: 1,
    com_tam: 1,
  },
  hasChosenStarter: false,
  weather: 'sunny',
  marketSpecial: null,
};



