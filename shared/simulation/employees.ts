import { CareerTier, Employee } from '../types';

export interface PromotionRequirement {
  tier: CareerTier;
  nextTier: CareerTier;
  name: string;
  nextName: string;
  requiredXp: number;
  requiredSkill: number;
  requiredLoyalty: number;
  salaryIncrease: number;
}

export const PROMOTION_REQUIREMENTS: Record<CareerTier, PromotionRequirement | null> = {
  intern: {
    tier: 'intern',
    nextTier: 'junior',
    name: 'Thực tập sinh',
    nextName: 'Nhân viên sơ cấp',
    requiredXp: 200,
    requiredSkill: 40,
    requiredLoyalty: 40,
    salaryIncrease: 25000,
  },
  junior: {
    tier: 'junior',
    nextTier: 'senior',
    name: 'Nhân viên sơ cấp',
    nextName: 'Nhân viên cứng cáp',
    requiredXp: 600,
    requiredSkill: 60,
    requiredLoyalty: 50,
    salaryIncrease: 40000,
  },
  senior: {
    tier: 'senior',
    nextTier: 'shift_leader',
    name: 'Nhân viên cứng cáp',
    nextName: 'Trưởng ca / Giám sát',
    requiredXp: 1200,
    requiredSkill: 75,
    requiredLoyalty: 65,
    salaryIncrease: 70000,
  },
  shift_leader: {
    tier: 'shift_leader',
    nextTier: 'store_manager',
    name: 'Trưởng ca / Giám sát',
    nextName: 'Quản lý cửa hàng',
    requiredXp: 2500,
    requiredSkill: 85,
    requiredLoyalty: 80,
    salaryIncrease: 120000,
  },
  store_manager: null, // Đã là cấp cao nhất
};

/**
 * Kiểm tra nhân viên có đủ điều kiện thăng chức hay không
 */
export function checkPromotionEligibility(emp: Employee): {
  eligible: boolean;
  req: PromotionRequirement | null;
  reason?: string;
} {
  const req = PROMOTION_REQUIREMENTS[emp.careerTier || 'intern'];
  if (!req) {
    return { eligible: false, req: null, reason: 'Đã đạt cấp bậc cao nhất!' };
  }

  const primarySkill = emp.role === 'cook' ? emp.cookingSkill : emp.serviceSkill;

  if (emp.experience < req.requiredXp) {
    return {
      eligible: false,
      req,
      reason: `Cần thêm ${req.requiredXp - emp.experience} XP kinh nghiệm (Hiện tại: ${emp.experience}/${req.requiredXp})`,
    };
  }

  if (primarySkill < req.requiredSkill) {
    return {
      eligible: false,
      req,
      reason: `Kỹ năng chuyên môn cần đạt tối thiểu ${req.requiredSkill} (Hiện tại: ${primarySkill}/${req.requiredSkill})`,
    };
  }

  if (emp.loyalty < req.requiredLoyalty) {
    return {
      eligible: false,
      req,
      reason: `Độ gắn bó (Loyalty) cần đạt tối thiểu ${req.requiredLoyalty}% (Hiện tại: ${emp.loyalty}%)`,
    };
  }

  return { eligible: true, req };
}

/**
 * Tính chi phí đào tạo nhân viên (lũy tiến theo số lần đã train)
 * trainingCost = baseCost * (1.6 ^ trainingCount)
 */
export function calculateEmployeeTrainingCost(
  trainingCount: number = 0,
  baseCost: number = 25000
): number {
  return Math.round(baseCost * Math.pow(1.6, trainingCount));
}

/**
 * Kiểm tra xem nhân viên có thể đào tạo tiếp không
 */
export function checkTrainingCap(emp: Employee): {
  canTrain: boolean;
  reason?: string;
} {
  const isCook = emp.role === 'cook';
  const skill = isCook ? emp.cookingSkill : emp.serviceSkill;

  if (skill >= 100) {
    return { canTrain: false, reason: 'Kỹ năng chuyên môn đã chạm mốc tối đa (100)!' };
  }
  if (emp.speed >= 1.6) {
    return { canTrain: false, reason: 'Tốc độ làm việc đã chạm mốc tối đa (1.6x)!' };
  }
  return { canTrain: true };
}

/**
 * Tính toán hiệu suất tốc độ nấu ăn của đầu bếp
 * CookSpeed = BaseSpeed * (0.7 + (CookingSkill / 100) * 0.6) * MoodPenalty * StressPenalty
 */
export function calculateCookEfficiency(emp: Employee): {
  speedMultiplier: number;
  mistakeRisk: number; // Tỉ lệ mắc lỗi làm hỏng món (0 - 1)
  isCreativeTriggered: boolean;
} {
  const baseSpeed = emp.speed || 1.0;
  const cookMultiplier = 0.7 + ((emp.cookingSkill || 50) / 100) * 0.6;

  // Xử lý Tâm trạng (Mood)
  let moodPenalty = 1.0;
  if (emp.mood < 30) {
    moodPenalty = 0.8; // Giảm 20% năng suất nếu tâm trạng tệ
  }

  // Xử lý Căng thẳng (Stress)
  let stressPenalty = 1.0;
  let mistakeRisk = 0;
  if (emp.stress > 90) {
    stressPenalty = 0.7; // Giảm 30% tốc độ
    mistakeRisk = 0.15; // 15% nguy cơ làm hỏng món
  } else if (emp.stress > 70) {
    stressPenalty = 0.85; // Giảm 15%
    mistakeRisk = 0.05;
  } else if (emp.stress > 50) {
    stressPenalty = 0.95; // Giảm 5%
  }

  // Xử lý Trait Sáng tạo (Creative)
  const isCreative = emp.personality === 'creative';
  const isCreativeTriggered = isCreative && Math.random() < 0.18; // 18% cơ hội nấu món hoàn hảo

  const speedMultiplier = baseSpeed * cookMultiplier * moodPenalty * stressPenalty;
  return {
    speedMultiplier,
    mistakeRisk,
    isCreativeTriggered,
  };
}

/**
 * Tính toán hiệu suất phục vụ & tip bonus của bồi bàn
 */
export function calculateServerEfficiency(emp: Employee): {
  speedMultiplier: number;
  tipBonusRate: number;
  hasFriendlyTrait: boolean;
} {
  const baseSpeed = emp.speed || 1.0;
  const serviceSkill = emp.serviceSkill || 50;

  let moodPenalty = 1.0;
  if (emp.mood < 30) moodPenalty = 0.8;

  let stressPenalty = 1.0;
  if (emp.stress > 70) stressPenalty = 0.85;

  // Bonus tiền tip: tipBonus = serviceSkill * 0.15%
  const tipBonusRate = (serviceSkill * 0.15) / 100;
  const hasFriendlyTrait = emp.personality === 'friendly';

  return {
    speedMultiplier: baseSpeed * moodPenalty * stressPenalty,
    tipBonusRate,
    hasFriendlyTrait,
  };
}
