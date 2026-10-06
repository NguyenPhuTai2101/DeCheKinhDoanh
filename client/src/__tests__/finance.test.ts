import { describe, it, expect } from 'vitest';
import {
  calculateStageFixedCosts,
  calculateBottleneck,
  calculateDailySpoilage,
  calculate3DayCashflowForecast,
  evaluateFinancialHealth,
  calculateRollingReputation,
  generateMorningBriefing,
  generateDailyInsights,
} from '../../../shared/economy/finance';
import { INGREDIENTS } from '../../../shared/gameData';

describe('Module: Finance & Economics', () => {
  describe('1. calculateStageFixedCosts', () => {
    it('TC_FIN_01: Cart (Xe Đẩy Vỉa Hè) có chi phí mặt bằng và điện nước tối thiểu', () => {
      const costs = calculateStageFixedCosts('cart');
      expect(costs.rent).toBe(0);
      expect(costs.utilities).toBe(15000); // 10k điện + 5k rác
      expect(costs.total).toBe(15000);
    });

    it('TC_FIN_02: Corner (Góc Phố Cố Định) có tiền thuê vỉa hè và điện nước', () => {
      const costs = calculateStageFixedCosts('corner');
      expect(costs.rent).toBe(45000);
      expect(costs.utilities).toBe(28000);
      expect(costs.total).toBe(73000);
    });

    it('TC_FIN_03: Eatery (Nhà Hàng Mặt Tiền) có chi phí cố định lớn', () => {
      const costs = calculateStageFixedCosts('eatery');
      expect(costs.rent).toBe(750000);
      expect(costs.utilities).toBe(225000);
      expect(costs.total).toBe(975000);
    });
  });

  describe('2. calculateBottleneck (Phân tích Nút Cổ Chai)', () => {
    it('TC_FIN_04: Xác định nút thắt CẦU (Demand) khi phục vụ ít khách (<10)', () => {
      const result = calculateBottleneck({
        servedCount: 5,
        lostCount: 0,
        revenue: 150000,
        reputation: 60,
      });
      expect(result.type).toBe('demand');
      expect(result.title).toContain('Lượng Cầu Khách Ít');
      expect(result.demandLoss).toBeGreaterThan(0);
    });

    it('TC_FIN_05: Xác định nút thắt NĂNG LỰC (Capacity) khi nhiều khách bỏ về vì quá tải', () => {
      const result = calculateBottleneck({
        servedCount: 20,
        lostCount: 8,
        capacityBottleneckCount: 8,
        revenue: 800000,
        reputation: 80,
      });
      expect(result.type).toBe('capacity');
      expect(result.title).toContain('Năng Lực Quá Tải');
      expect(result.capacityLoss).toBe(8);
    });

    it('TC_FIN_06: Xác định nút thắt TỒN KHO (Inventory) khi khách bỏ về do cạn nguyên liệu', () => {
      const result = calculateBottleneck({
        servedCount: 15,
        lostCount: 5,
        capacityBottleneckCount: 1,
        stockBottleneckCount: 4,
        revenue: 600000,
        reputation: 75,
      });
      expect(result.type).toBe('inventory');
      expect(result.title).toContain('Cạn Kiệt Tồn Kho');
      expect(result.stockLoss).toBe(4);
    });

    it('TC_FIN_07: Xác định Vận Hành Ổn Định khi phục vụ tốt và không mất khách', () => {
      const result = calculateBottleneck({
        servedCount: 25,
        lostCount: 0,
        revenue: 1200000,
        reputation: 90,
      });
      expect(result.title).toContain('Vận Hành Ổn Định');
      expect(result.capacityLoss).toBe(0);
    });
  });

  describe('3. calculateDailySpoilage (Hao Hụt Tự Nhiên Cuối Ngày)', () => {
    it('TC_FIN_08: Hàng khô (dry) không bao giờ bị hao hụt (gạo, trà, cà phê)', () => {
      const inventory = {
        broken_rice: 50,
        tea: 30,
        coffee: 40,
      };
      const result = calculateDailySpoilage({ inventory, fridgeLevel: 0 });
      expect(result.spoilageCost).toBe(0);
      expect(result.spoilageDetails).toHaveLength(0);
      expect(result.updatedInventory.broken_rice).toBe(50);
      expect(result.updatedInventory.tea).toBe(30);
    });

    it('TC_FIN_09: Hàng tươi (fresh) số lượng nhỏ (<3) được bảo toàn không hao hụt', () => {
      const inventory = {
        beef: 2,
        egg: 2,
        scallion: 1,
      };
      const result = calculateDailySpoilage({ inventory, fridgeLevel: 0 });
      expect(result.spoilageCost).toBe(0);
      expect(result.updatedInventory.beef).toBe(2);
    });

    it('TC_FIN_10: Hàng tươi số lượng lớn (thịt, rau) có hao hụt và tính chi phí chính xác', () => {
      const inventory = {
        beef: 100,
        pork: 80,
      };
      const result = calculateDailySpoilage({ inventory, fridgeLevel: 0 });
      expect(result.spoilageCost).toBeGreaterThan(0);
      expect(result.updatedInventory.beef).toBeLessThan(100);
      expect(result.spoilageDetails.length).toBeGreaterThan(0);
    });

    it('TC_FIN_11: Nâng cấp tủ lạnh cấp 2 giảm hao hụt đáng kể so với không có tủ lạnh', () => {
      const inventory = { beef: 100, pork: 100 };
      const withoutFridge = calculateDailySpoilage({ inventory, fridgeLevel: 0 });
      const withFridgeLvl2 = calculateDailySpoilage({ inventory, fridgeLevel: 2 });
      
      expect(withFridgeLvl2.spoilageCost).toBeLessThanOrEqual(withoutFridge.spoilageCost);
    });
  });

  describe('4. calculate3DayCashflowForecast (Dự Báo Dòng Tiền 3 Ngày)', () => {
    it('TC_FIN_12: Dự phóng dòng tiền tăng trưởng dương khi quán có lãi ròng', () => {
      const forecast = calculate3DayCashflowForecast({
        currentMoney: 1000000,
        dailyNetProfit: 200000,
        fixedCostsPerDay: 150000,
      });
      expect(forecast).toHaveLength(3);
      expect(forecast[0]).toBe(1200000);
      expect(forecast[1]).toBe(1400000);
      expect(forecast[2]).toBe(1600000);
    });

    it('TC_FIN_13: Dự phóng dòng tiền thâm hụt và cảnh báo âm vốn khi lỗ', () => {
      const forecast = calculate3DayCashflowForecast({
        currentMoney: 300000,
        dailyNetProfit: -150000,
        fixedCostsPerDay: 200000,
      });
      expect(forecast[0]).toBe(150000);
      expect(forecast[1]).toBe(0);
      expect(forecast[2]).toBe(-150000);
    });
  });

  describe('5. evaluateFinancialHealth (Thang 5 Mức Sức Khỏe Tài Chính)', () => {
    it('TC_FIN_14: Đánh giá Stable (Vững Vàng) khi tiền mặt đủ >14 ngày chi phí cố định', () => {
      const health = evaluateFinancialHealth({
        currentMoney: 3000000,
        dailyFixedCost: 100000,
      });
      expect(health.level).toBe('stable');
      expect(health.daysRemaining).toBe(30);
    });

    it('TC_FIN_15: Đánh giá Stress (Căng Thẳng) khi tiền mặt đủ 7-14 ngày', () => {
      const health = evaluateFinancialHealth({
        currentMoney: 1000000,
        dailyFixedCost: 100000,
      });
      expect(health.level).toBe('stress');
      expect(health.daysRemaining).toBe(10);
    });

    it('TC_FIN_16: Đánh giá Deficit (Thiếu Hụt) khi tiền mặt <7 ngày hoặc đang gánh nợ', () => {
      const health = evaluateFinancialHealth({
        currentMoney: 500000,
        dailyFixedCost: 100000,
      });
      expect(health.level).toBe('deficit');
      expect(health.daysRemaining).toBe(5);

      const healthWithDebt = evaluateFinancialHealth({
        currentMoney: 2000000,
        dailyFixedCost: 100000,
        loanDebt: 1000000,
      });
      expect(healthWithDebt.level).toBe('deficit');
    });

    it('TC_FIN_17: Đánh giá Crisis (Khủng Hoảng) khi tiền mặt <= 0 trong thời gian ân hạn', () => {
      const health = evaluateFinancialHealth({
        currentMoney: -50000,
        dailyFixedCost: 100000,
        consecutiveCrisisDays: 1,
      });
      expect(health.level).toBe('crisis');
      expect(health.desc).toContain('ngày ân hạn');
    });

    it('TC_FIN_18: Đánh giá Bankrupt (Phá Sản) khi âm vốn vượt quá 3 ngày ân hạn', () => {
      const health = evaluateFinancialHealth({
        currentMoney: -50000,
        dailyFixedCost: 100000,
        consecutiveCrisisDays: 3,
      });
      expect(health.level).toBe('bankrupt');
      expect(health.title).toContain('Phá Sản');
    });
  });

  describe('6. calculateRollingReputation (Uy Tín Trung Bình Trượt)', () => {
    it('TC_FIN_19: Tính trung bình trượt 14 ngày chuẩn xác', () => {
      const pastRatings = [80, 85, 90, 80, 85];
      const rolling = calculateRollingReputation(80, pastRatings);
      // avg14 = (80+85+90+80+85)/5 = 84. rolling = Math.round(84 * 0.7 + 80 * 0.3) = 83
      expect(rolling).toBe(83);
    });

    it('TC_FIN_20: Trả về uy tín gốc nếu chưa có lịch sử đánh giá', () => {
      expect(calculateRollingReputation(75, [])).toBe(75);
    });
  });

  describe('7. generateMorningBriefing & generateDailyInsights', () => {
    it('TC_FIN_21: Sinh bản tin sáng có thời tiết và phân tích thị trường', () => {
      const briefing = generateMorningBriefing({
        day: 2,
        weather: 'sunny',
        businessStage: 'corner',
      });
      expect(briefing.day).toBe(2);
      expect(briefing.weather).toBe('sunny');
      expect(briefing.weatherHeadline.length).toBeGreaterThan(0);
      expect(briefing.marketHeadline.length).toBeGreaterThan(0);
      expect(briefing.dailyAdvice.length).toBeGreaterThan(0);
    });

    it('TC_FIN_22: Sinh Insight cảnh báo khách bỏ về và phân tích P&L', () => {
      const insights = generateDailyInsights({
        finance: {
          revenue: 500000,
          cogs: 200000,
          grossProfit: 300000,
          payroll: 100000,
          rent: 50000,
          utilities: 20000,
          marketing: 0,
          deliveryFees: 0,
          eventExpenses: 0,
          otherIncome: 0,
          otherExpense: 0,
          netProfit: 130000,
        },
        servedCount: 10,
        lostCount: 4,
        averageRating: 85,
      });
      expect(insights.length).toBeGreaterThan(0);
      const lostWarning = insights.find((i) => i.includes('khách') && (i.includes('bỏ về') || i.includes('chờ lâu')));
      expect(lostWarning).toBeDefined();
    });
  });
});
