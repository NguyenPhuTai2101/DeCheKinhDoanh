import { describe, it, expect } from 'vitest';
import {
  generateOrderCustomization,
  evaluateDishMatch,
} from '../../../shared/simulation/orders';
import { ActiveOrder } from '../../../shared/types';

describe('Module: Orders & Cooking Evaluation', () => {
  describe('1. generateOrderCustomization (Tùy biến món ăn & Dặn dò khách)', () => {
    it('TC_ORD_01: Sinh tùy biến món ăn cho Bánh mì khi khách có yêu cầu riêng', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Kích hoạt có yêu cầu

      try {
        const custom = generateOrderCustomization({
          recipeId: 'banh_mi_thit',
          customerType: 'office_worker',
        });
        expect(custom).toBeDefined();
        expect(custom.orderNotes).toBeDefined();
        expect(custom.dialogueText).toBeDefined();
        expect(custom.orderNotes.length).toBeGreaterThan(0);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('TC_ORD_02: Trả về orderNotes rỗng khi khách ăn vị truyền thống không dặn dò', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.99; // > 0.45

      try {
        const custom = generateOrderCustomization({
          recipeId: 'banh_mi_thit',
          customerType: 'student',
        });
        expect(custom.orderNotes).toHaveLength(0);
        expect(custom.removedIngredients).toHaveLength(0);
        expect(custom.extraIngredients).toHaveLength(0);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('TC_ORD_03: Sinh tùy biến cho Phở (phở bò tái, phở gà)', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.1;

      try {
        const custom = generateOrderCustomization({
          recipeId: 'pho_tai',
          customerType: 'office_worker',
        });
        expect(custom.customTag).toBeDefined();
        expect(custom.orderNotes.length).toBeGreaterThan(0);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('TC_ORD_04: Sinh tùy biến cho Cà phê / Trà sữa (độ ngọt, nhiều sữa)', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.1;

      try {
        const custom = generateOrderCustomization({
          recipeId: 'cafe_sua',
          customerType: 'office_worker',
        });
        expect(custom.customTag).toBeDefined();
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  describe('2. evaluateDishMatch (Chấm điểm độ khớp trên thớt bếp)', () => {
    // banh_mi_thit: ['bread', 'pork', 'cucumber', 'herb']
    const mockOrder: ActiveOrder = {
      id: 'order_1',
      tableIndex: 0,
      recipeId: 'banh_mi_thit',
      typeId: 'office_worker',
      state: 'waiting',
      patienceRemaining: 60,
      maxPatience: 60,
      removedIngredients: [],
      extraIngredients: [],
      orderNotes: [],
    };

    it('TC_ORD_05: Perfect - Khớp hoàn hảo khi nấu đúng công thức gốc không dặn dò', () => {
      const match = evaluateDishMatch({
        recipeId: 'banh_mi_thit',
        order: mockOrder,
        preparedIngredients: ['bread', 'pork', 'cucumber', 'herb'],
      });
      expect(match.matchGrade).toBe('perfect');
      expect(match.tipMultiplier).toBeGreaterThanOrEqual(1.2);
      expect(match.ratingImpact).toBeGreaterThanOrEqual(1);
      expect(match.feedback).toContain('tuyệt vời');
    });

    it('TC_ORD_06: Perfect - Khớp hoàn hảo khi làm đúng dặn dò (bỏ rau thơm, thêm trứng)', () => {
      const customOrder: ActiveOrder = {
        ...mockOrder,
        removedIngredients: ['herb'],
        extraIngredients: ['egg'],
        orderNotes: ['Không rau thơm, thêm trứng'],
      };

      const match = evaluateDishMatch({
        recipeId: 'banh_mi_thit',
        order: customOrder,
        preparedIngredients: ['bread', 'pork', 'cucumber', 'egg'],
      });
      expect(match.matchGrade).toBe('perfect');
      expect(match.tipMultiplier).toBe(1.4);
      expect(match.ratingImpact).toBe(3);
    });

    it('TC_ORD_07: Allergy - Khách dặn kiêng (không dưa leo) mà đầu bếp vẫn cho vào', () => {
      const allergyOrder: ActiveOrder = {
        ...mockOrder,
        allergyIngredients: ['cucumber'],
        removedIngredients: ['cucumber'],
        orderNotes: ['❌ Không dưa leo'],
      };

      const match = evaluateDishMatch({
        recipeId: 'banh_mi_thit',
        order: allergyOrder,
        preparedIngredients: ['bread', 'pork', 'cucumber', 'herb'], // Có cucumber!
      });
      expect(match.matchGrade).toBe('allergy');
      expect(match.tipMultiplier).toBe(0);
      expect(match.ratingImpact).toBe(-5);
      expect(match.feedback).toContain('dặn kỹ');
    });

    it('TC_ORD_08: Minor - Đúng món nhưng thiếu topping dặn thêm (dặn thêm trứng nhưng không cho)', () => {
      const customOrder: ActiveOrder = {
        ...mockOrder,
        extraIngredients: ['egg'],
        orderNotes: ['➕ Thêm 1 trứng'],
      };

      const match = evaluateDishMatch({
        recipeId: 'banh_mi_thit',
        order: customOrder,
        preparedIngredients: ['bread', 'pork', 'cucumber', 'herb'], // Thiếu egg
      });
      expect(match.matchGrade).toBe('minor');
      expect(match.tipMultiplier).toBe(0.85);
      expect(match.ratingImpact).toBe(0);
      expect(match.feedback).toContain('thiếu');
    });

    it('TC_ORD_09: Wrong - Thiếu nguyên liệu chính bắt buộc của món (thiếu thịt heo và rau)', () => {
      const match = evaluateDishMatch({
        recipeId: 'banh_mi_thit',
        order: mockOrder,
        preparedIngredients: ['bread'], // Thiếu pork, cucumber, herb (missing 3 món)
      });
      expect(match.matchGrade).toBe('wrong');
      expect(match.tipMultiplier).toBe(0.4);
      expect(match.ratingImpact).toBe(-2);
      expect(match.feedback).toContain('thiếu nguyên liệu');
    });
  });
});
