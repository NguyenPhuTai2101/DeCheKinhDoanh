import { BusinessStageId } from '../types';

export interface StageV2Requirement {
  id: BusinessStageId;
  name: string;
  tagline: string;
  requiredCash: number;
  requiredFame: number;
  maxRestaurants: number;
  maxStaff: number;
  features: string[];
}

export const STAGE_V2_CONFIG: Record<BusinessStageId, StageV2Requirement> = {
  cart: {
    id: 'cart',
    name: 'Xe Đẩy Vỉa Hè',
    tagline: 'Khởi nghiệp đơn sơ, tự tay nấu nướng',
    requiredCash: 0,
    requiredFame: 0,
    maxRestaurants: 1,
    maxStaff: 2,
    features: ['1 Thương hiệu', '1 Điểm bán', 'Tối đa 2 nhân viên', 'Không manager', 'Không logistics'],
  },
  corner: {
    id: 'corner',
    name: 'Quán Cóc Góc Phố',
    tagline: 'Mở rộng bàn ghế, có bạn hữu tiếp tế',
    requiredCash: 250000,
    requiredFame: 50,
    maxRestaurants: 1,
    maxStaff: 4,
    features: ['Tối đa 4 nhân viên', 'Mở khóa Nhà Cung Cấp', 'Nhân viên đi chợ (Shopper)', 'Marketing cơ bản'],
  },
  awning: {
    id: 'awning',
    name: 'Tiệm Mái Hiên',
    tagline: 'Cửa hàng khang trang, phát triển giao hàng',
    requiredCash: 1500000,
    requiredFame: 150,
    maxRestaurants: 2,
    maxStaff: 7,
    features: ['Mở 2 cửa hàng song song', '7 Nhân sự', 'Quản lý cửa hàng (Manager)', 'Hệ thống Giao hàng (Delivery)'],
  },
  eatery: {
    id: 'eatery',
    name: 'Quán Phố Lớn',
    tagline: 'Mặt bằng đắc địa, thương hiệu phủ sóng',
    requiredCash: 6000000,
    requiredFame: 500,
    maxRestaurants: 4,
    maxStaff: 15,
    features: ['Mở 4 chi nhánh', '15 Nhân viên', 'Chiến dịch Marketing diện rộng', 'Quản lý khu vực (Area Manager)'],
  },
  empire: {
    id: 'empire',
    name: 'Đế Chế Kinh Doanh',
    tagline: 'Tập đoàn đa ngành, thống lĩnh thị trường',
    requiredCash: 25000000,
    requiredFame: 1500,
    maxRestaurants: 5,
    maxStaff: 40,
    features: ['Toàn bộ 5 chuỗi ẩm thực', 'Trụ sở chính (HQ)', 'Quản lý chuỗi cung ứng', 'Mở rộng đa ngành'],
  },
};

export const STAGE_ORDER: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];

export function checkStageUpgradeEligibility(
  currentStageId: BusinessStageId,
  currentCash: number,
  currentFame: number
): {
  canUpgrade: boolean;
  nextStage: StageV2Requirement | null;
  missingCash: number;
  missingFame: number;
} {
  const currentIndex = STAGE_ORDER.indexOf(currentStageId);
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
    return { canUpgrade: false, nextStage: null, missingCash: 0, missingFame: 0 };
  }

  const nextId = STAGE_ORDER[currentIndex + 1];
  const nextStage = STAGE_V2_CONFIG[nextId];

  const missingCash = Math.max(0, nextStage.requiredCash - currentCash);
  const missingFame = Math.max(0, nextStage.requiredFame - currentFame);

  return {
    canUpgrade: missingCash === 0 && missingFame === 0,
    nextStage,
    missingCash,
    missingFame,
  };
}
