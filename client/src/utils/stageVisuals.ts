import { BusinessStageId } from '../../../shared/types';

export interface StageVisualConfig {
  id: BusinessStageId;
  name: string;
  badge: string;
  icon: string;
  levelNumber: number;

  // Ngoại thất mặt tiền phố (StreetMapView Storefront)
  storefront: {
    title: string;
    subTitle: string;
    tagText: string;
    tagBg: string;
    tagColor: string;
    facadeBg: string;
    facadeBorder: string;
    roofColors: [string, string]; // Màu sọc mái che
    roofRounds: string;
    signboardBg: string;
    signboardBorder: string;
    signboardTextColor: string;
    cartDisplayTitle: string;
    cartDisplayIcon: string;
    cartBadge: string;
    cartBadgeBg: string;
    cartDescription: string;
    decorativeProps: Array<{ icon: string; name: string }>;
    hasRedCarpet?: boolean;
    hasNeonGlow?: boolean;
    shophouseFloors?: number;
  };

  // Dãy bàn ghế đón khách trên vỉa hè (Street Sidewalk Tables)
  table: {
    materialName: string;
    headerTitle: string;
    tableTypeIcon: string;
    badgeBg: string;
    topBg: string;
    topBorder: string;
    topHighlight?: string;
    legColor: string;
    label: string;
    labelColor: string;
    chairType: 'plastic_red' | 'wooden_stool' | 'inox_round' | 'modern_wood' | 'luxury_gold';
    chairColor: string;
    chairLabel: string;
    tableCardBg: string;
    tableCardBorder: string;
    emptyText: string;
  };

  // Không gian quầy bếp (CozyShopView Kitchen)
  kitchen: {
    stageBadge: string;
    awningColors: [string, string];
    workbenchTitle: string;
    workbenchBg: string;
    workbenchBorder: string;
    workbenchHeaderColor: string;
    workbenchTagline: string;
    toolIcon: string;
    plateType: string;
  };
}

export const STAGE_VISUALS: Record<BusinessStageId, StageVisualConfig> = {
  cart: {
    id: 'cart',
    name: 'Xe Đẩy Lề Đường',
    badge: 'Cấp 1',
    icon: '🛒',
    levelNumber: 1,

    storefront: {
      title: 'Xe Đẩy Bánh Mì Vỉa Hè',
      subTitle: 'Khởi đầu bình dị · Xe nhôm kính ven đường',
      tagText: 'Xe Đẩy Dã Chiến',
      tagBg: '#FFEBEE',
      tagColor: '#C62828',
      facadeBg: '#FFFDF9',
      facadeBorder: '#D7CCC8',
      roofColors: ['#EF5350', '#FFFFFF'], // Đỏ & Trắng
      roofRounds: 'rounded-b-xs',
      signboardBg: '#FFF8E1',
      signboardBorder: '#E53935',
      signboardTextColor: '#7C5C55',
      cartDisplayTitle: 'Xe Đẩy Nhôm Kính Vỉa Hè',
      cartDisplayIcon: '🛒🥖',
      cartBadge: 'Xe Khởi Nghiệp',
      cartBadgeBg: '#FFE082',
      cartDescription: 'Pate bơ tỏi gia truyền · Ổ giòn rụm',
      decorativeProps: [
        { icon: '🧺', name: 'Giỏ bánh mì' },
        { icon: '🧊', name: 'Bình trà đá' },
      ],
      shophouseFloors: 1,
    },

    table: {
      materialName: 'Ghế Nhựa Đỏ Song Long',
      headerTitle: 'BÀN GHẾ NHỰA ĐỎ SONG LONG VỈA HÈ',
      tableTypeIcon: '🪑',
      badgeBg: '#E53935',
      topBg: '#E53935',
      topBorder: '#B71C1C',
      legColor: '#C62828',
      label: 'SLONG',
      labelColor: '#FFFFFF',
      chairType: 'plastic_red',
      chairColor: '#E53935',
      chairLabel: 'Ghế nhựa',
      tableCardBg: 'bg-white',
      tableCardBorder: 'border-rose-200',
      emptyText: 'Bàn Trống (Nhựa đỏ)',
    },

    kitchen: {
      stageBadge: 'Cấp 1: Xe Đẩy Lề Đường 🛒',
      awningColors: ['#EF5350', '#FFFFFF'],
      workbenchTitle: '🪵 THỚT GỖ MỘC & BẾP GA ĐƠN',
      workbenchBg: '#FAF3EA',
      workbenchBorder: '#8D6E63',
      workbenchHeaderColor: '#5D4037',
      workbenchTagline: 'Khởi nghiệp bình dị ven đường, ấm nồng mùi bơ pate',
      toolIcon: '🪵',
      plateType: 'Đĩa nhựa mộc',
    },
  },

  corner: {
    id: 'corner',
    name: 'Góc Cây Me / Quán Cóc',
    badge: 'Cấp 2',
    icon: '🌳',
    levelNumber: 2,

    storefront: {
      title: 'Quán Cóc Rợp Bóng Cây Me',
      subTitle: 'Dù tròn râm mát · Trà đá cà phê phin tán gẫu',
      tagText: 'Góc Phố Râm Mát',
      tagBg: '#E8F5E9',
      tagColor: '#2E7D32',
      facadeBg: '#F1F8E9',
      facadeBorder: '#A5D6A7',
      roofColors: ['#43A047', '#E8F5E9'], // Xanh lá & Kem mát mẻ
      roofRounds: 'rounded-b-md',
      signboardBg: '#E8F5E9',
      signboardBorder: '#2E7D32',
      signboardTextColor: '#1B5E20',
      cartDisplayTitle: 'Quầy Cóc Gỗ Dưới Bóng Cây',
      cartDisplayIcon: '🌳🥖',
      cartBadge: 'Râm Mát Chill Chill',
      cartBadgeBg: '#A5D6A7',
      cartDescription: 'Thơm lừng sả ớt · Trà đá mát rượi giải nhiệt',
      decorativeProps: [
        { icon: '🪭', name: 'Quạt nan' },
        { icon: '☕', name: 'Ấm phin cà phê' },
        { icon: '🧊', name: 'Thùng đá xốp' },
      ],
      shophouseFloors: 1,
    },

    table: {
      materialName: 'Bàn Ghế Cóc Thấp Mộc Mạc',
      headerTitle: 'DÃY BÀN GHẾ CÓC RÂM MÁT BÓNG CÂY ME',
      tableTypeIcon: '🌳',
      badgeBg: '#43A047',
      topBg: '#795548',
      topBorder: '#4E342E',
      legColor: '#3E2723',
      label: 'CÓC',
      labelColor: '#FFE0B2',
      chairType: 'wooden_stool',
      chairColor: '#8D6E63',
      chairLabel: 'Ghế cóc',
      tableCardBg: 'bg-[#F9FBE7]',
      tableCardBorder: 'border-lime-200',
      emptyText: 'Bàn Trống (Bàn cóc)',
    },

    kitchen: {
      stageBadge: 'Cấp 2: Quán Cóc Cây Me 🌳',
      awningColors: ['#43A047', '#E8F5E9'],
      workbenchTitle: '🌳 QUẦY BẾP GỖ CÓC THÂN THIỆN',
      workbenchBg: '#F9FBE7',
      workbenchBorder: '#689F38',
      workbenchHeaderColor: '#33691E',
      workbenchTagline: 'Quán cóc chill chill dưới bóng me râm mát',
      toolIcon: '🌳',
      plateType: 'Mẹt tre lót lá chuối',
    },
  },

  awning: {
    id: 'awning',
    name: 'Tiệm Mái Hiên Bình Dân',
    badge: 'Cấp 3',
    icon: '🏮',
    levelNumber: 3,

    storefront: {
      title: 'Tiệm Mái Hiên Bình Dân',
      subTitle: 'Mái hiên Hiflex sáng đèn · Bàn xếp inox sạch sẽ',
      tagText: 'Mái Hiên Che Kín',
      tagBg: '#FFF3E0',
      tagColor: '#E65100',
      facadeBg: '#FFF8E1',
      facadeBorder: '#FFB74D',
      roofColors: ['#FB8C00', '#FFF3E0'], // Cam bạt sọc & Trắng sáng
      roofRounds: 'rounded-b-lg',
      signboardBg: '#FFF3E0',
      signboardBorder: '#F57C00',
      signboardTextColor: '#BF360C',
      cartDisplayTitle: 'Tủ Inox 2 Tầng Kính Cường Lực',
      cartDisplayIcon: '🏮🥖',
      cartBadge: 'Inox Sáng Bóng',
      cartBadgeBg: '#FFE082',
      cartDescription: 'Hệ thống đèn tuýp sáng rực · Khay inox vệ sinh',
      decorativeProps: [
        { icon: '🥢', name: 'Ống đũa inox' },
        { icon: '🥫', name: 'Hũ tương ớt' },
        { icon: '💡', name: 'Đèn tuýp LED' },
      ],
      hasNeonGlow: true,
      shophouseFloors: 1,
    },

    table: {
      materialName: 'Bàn Xếp Inox Sáng Bóng',
      headerTitle: 'DÃY BÀN XẾP INOX SÁNG BÓNG SẠCH SẼ',
      tableTypeIcon: '🏮',
      badgeBg: '#F57C00',
      topBg: '#ECEFF1',
      topBorder: '#90A4AE',
      topHighlight: 'linear-gradient(135deg, #CFD8DC 0%, #FFFFFF 50%, #B0BEC5 100%)',
      legColor: '#78909C',
      label: 'INOX',
      labelColor: '#37474F',
      chairType: 'inox_round',
      chairColor: '#607D8B',
      chairLabel: 'Ghế cao',
      tableCardBg: 'bg-[#F0F4F8]',
      tableCardBorder: 'border-slate-300',
      emptyText: 'Bàn Trống (Bàn Inox)',
    },

    kitchen: {
      stageBadge: 'Cấp 3: Tiệm Mái Hiên Inox 🏮',
      awningColors: ['#FB8C00', '#FFF3E0'],
      workbenchTitle: '🍳 QUẦY BẾP INOX CÔNG NGHIỆP SÁNG BÓNG',
      workbenchBg: '#ECEFF1',
      workbenchBorder: '#607D8B',
      workbenchHeaderColor: '#263238',
      workbenchTagline: 'Quầy Inox chuẩn an toàn vệ sinh, mái bạt che kín giờ cao điểm',
      toolIcon: '🍳',
      plateType: 'Khay đĩa inox sáng',
    },
  },

  eatery: {
    id: 'eatery',
    name: 'Quán Ăn Phố Lớn',
    badge: 'Cấp 4',
    icon: '🏪',
    levelNumber: 4,

    storefront: {
      title: 'Quán Ăn Phố Lớn (Mặt Tiền Trung Tâm)',
      subTitle: 'Mặt tiền 2 tầng khang trang · Bếp mở hiện đại thực khách xếp hàng',
      tagText: 'Mặt Tiền Phố Lớn',
      tagBg: '#E3F2FD',
      tagColor: '#0D47A1',
      facadeBg: '#F4F7FB',
      facadeBorder: '#90CAF9',
      roofColors: ['#1976D2', '#BBDEFB'], // Xanh Navy hiện đại & Xanh nhạt
      roofRounds: 'rounded-b-xl',
      signboardBg: '#0D47A1',
      signboardBorder: '#1E88E5',
      signboardTextColor: '#FFFFFF',
      cartDisplayTitle: 'Bếp Mở Hiện Đại (Open Kitchen Showcase)',
      cartDisplayIcon: '🏪🥖',
      cartBadge: 'Bếp Mở Sang Trọng',
      cartBadgeBg: '#90CAF9',
      cartDescription: 'Thương hiệu nức tiếng gần xa · Thực khách check-in',
      decorativeProps: [
        { icon: '🪴', name: 'Bồn cây cảnh' },
        { icon: '📋', name: 'Menu mica' },
        { icon: '✨', name: 'Cửa kính lớn' },
      ],
      hasNeonGlow: true,
      shophouseFloors: 2,
    },

    table: {
      materialName: 'Bàn Ghế Gỗ Sồi Sang Trọng',
      headerTitle: 'DÃY BÀN GỖ SỒI HIỆN ĐẠI & MENU MICA',
      tableTypeIcon: '🛋️',
      badgeBg: '#1976D2',
      topBg: '#D7CCC8',
      topBorder: '#8D6E63',
      topHighlight: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 50%, #BCAAA4 100%)',
      legColor: '#5D4037',
      label: 'OAK',
      labelColor: '#4E342E',
      chairType: 'modern_wood',
      chairColor: '#795548',
      chairLabel: 'Ghế tựa gỗ',
      tableCardBg: 'bg-[#FDFBF7]',
      tableCardBorder: 'border-amber-300',
      emptyText: 'Bàn Trống (Bàn Gỗ Sồi)',
    },

    kitchen: {
      stageBadge: 'Cấp 4: Quán Ăn Phố Lớn 🏪',
      awningColors: ['#1976D2', '#BBDEFB'],
      workbenchTitle: '☕ BẾP MỞ ĐÁ HOA CƯƠNG HIỆN ĐẠI',
      workbenchBg: '#F5F5F5',
      workbenchBorder: '#455A64',
      workbenchHeaderColor: '#1A237E',
      workbenchTagline: 'Không gian bếp mở tiêu chuẩn cao cấp, hệ thống hút khói êm ái',
      toolIcon: '☕',
      plateType: 'Đĩa gốm sứ Bát Tràng',
    },
  },

  empire: {
    id: 'empire',
    name: 'Chuỗi Đế Chế Vỉa Hè',
    badge: 'Cấp 5',
    icon: '👑',
    levelNumber: 5,

    storefront: {
      title: 'Đại Trụ Sở Chuỗi Đế Chế Ẩm Thực Vỉa Hè',
      subTitle: 'Biểu tượng ẩm thực đường phố · Chi nhánh phủ khắp phố phường!',
      tagText: 'ĐỈNH CAO ĐẾ CHẾ 👑',
      tagBg: '#FFF8E1',
      tagColor: '#B78103',
      facadeBg: '#FFFDE7',
      facadeBorder: '#FFD54F',
      roofColors: ['#FFB300', '#FFF8E1'], // Vàng Hoàng Gia & Kem kim loại
      roofRounds: 'rounded-b-2xl',
      signboardBg: '#1A1A1A',
      signboardBorder: '#FFD700',
      signboardTextColor: '#FFD700',
      cartDisplayTitle: 'Flagship Store 5 Sao & Thảm Đỏ Đón Khách',
      cartDisplayIcon: '👑🥖',
      cartBadge: 'HOÀNG GIA 5 SAO',
      cartBadgeBg: '#FFE082',
      cartDescription: 'Doanh thu tiền triệu mỗi ngày · Chuỗi nhượng quyền nức tiếng',
      decorativeProps: [
        { icon: '👑', name: 'Vương miện vàng' },
        { icon: '💎', name: 'Đèn pha LED' },
        { icon: '🛵', name: 'Đội xe shipper' },
      ],
      hasRedCarpet: true,
      hasNeonGlow: true,
      shophouseFloors: 3,
    },

    table: {
      materialName: 'Bàn VIP Viền Vàng Hoàng Gia',
      headerTitle: 'KHU BÀN VIP ĐẾ CHẾ VÀNG KIM (CÓ THẢM ĐỎ)',
      tableTypeIcon: '👑',
      badgeBg: '#D4AF37',
      topBg: '#FFF8E1',
      topBorder: '#FFB300',
      topHighlight: 'linear-gradient(135deg, #FFFDE7 0%, #FFE082 50%, #FFB300 100%)',
      legColor: '#FFA000',
      label: '👑 VIP',
      labelColor: '#B78103',
      chairType: 'luxury_gold',
      chairColor: '#FFB300',
      chairLabel: 'Ghế VIP bọc da',
      tableCardBg: 'bg-[#FFFDE7]',
      tableCardBorder: 'border-yellow-400',
      emptyText: 'Bàn Trống (Bàn VIP)',
    },

    kitchen: {
      stageBadge: 'Cấp 5: Chuỗi Đế Chế Hoàng Gia 👑',
      awningColors: ['#FFB300', '#FFF8E1'],
      workbenchTitle: '👑 BẾP TRƯỞNG HOÀNG GIA - ĐỈNH CAO NGHỆ THUẬT',
      workbenchBg: '#FFFDE7',
      workbenchBorder: '#FFB300',
      workbenchHeaderColor: '#B78103',
      workbenchTagline: 'Đỉnh cao ẩm thực đường phố, doanh thu tiền triệu mỗi ngày!',
      toolIcon: '👑',
      plateType: 'Đĩa dát viền vàng kim hoàng gia',
    },
  },
};
