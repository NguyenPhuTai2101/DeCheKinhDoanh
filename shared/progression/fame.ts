export interface FameTier {
  minFame: number;
  title: string;
  badge: string;
  description: string;
}

export const FAME_TIERS: FameTier[] = [
  {
    minFame: 5000,
    title: 'Đế Chế Kinh Doanh',
    badge: '👑 Tập Đoàn Quốc Tế',
    description: 'Thương hiệu vươn tầm đế chế, phủ sóng toàn quốc và mở rộng đa ngành.',
  },
  {
    minFame: 2500,
    title: 'Thương Hiệu Quốc Gia',
    badge: '🏆 Chuỗi Toàn Quốc',
    description: 'Tên tuổi quen thuộc trên cả nước, khách du lịch bốn phương đổ về.',
  },
  {
    minFame: 1000,
    title: 'Chuỗi Nổi Tiếng Thành Phố',
    badge: '🏙️ Biểu Tượng Thành Phố',
    description: 'Hàng loạt chi nhánh đông khách, được truyền thông và báo chí săn đón.',
  },
  {
    minFame: 400,
    title: 'Thương Hiệu Trong Quận',
    badge: '⭐ Tiếng Vang Cấp Quận',
    description: 'Khách các phường lân cận tìm đến thưởng thức, nườm nượp giờ cao điểm.',
  },
  {
    minFame: 150,
    title: 'Quán Nổi Tiếng Khu Phố',
    badge: '🌟 Điểm Đến Khu Phố',
    description: 'Khách quen đông đúc, dân cư trong khu phố ai ai cũng biết mặt đặt tên.',
  },
  {
    minFame: 50,
    title: 'Quán Quen Trong Xóm',
    badge: '🏠 Quán Quen Xóm Giềng',
    description: 'Bác Ba, Cô Bảy và bà con lối xóm thường xuyên ghé ủng hộ.',
  },
  {
    minFame: 0,
    title: 'Người Mới Bắt Đầu',
    badge: '🌱 Khởi Nghiệp Vỉa Hè',
    description: 'Chập chững mở xe bán hàng, tích lũy từng khách quen đầu tiên.',
  },
];

export function getFameTier(fame: number = 0): FameTier {
  const safeFame = Math.max(0, fame);
  for (const tier of FAME_TIERS) {
    if (safeFame >= tier.minFame) {
      return tier;
    }
  }
  return FAME_TIERS[FAME_TIERS.length - 1];
}
