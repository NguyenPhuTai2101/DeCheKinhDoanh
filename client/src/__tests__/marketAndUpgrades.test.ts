import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, INGREDIENTS } from '../../../shared/gameData';

describe('Module: Market, Upgrades & Equipment', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameState: JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),
      isShopOpen: false,
      toastMessage: null,
    });
  });

  describe('1. Mua Sắm Chợ Đầu Mối (Market Purchases)', () => {
    it('TC_MKT_01: Mua nguyên liệu thành công khi đủ tiền, cập nhật kho và trừ ví', () => {
      const { buyIngredients } = useGameStore.getState();
      
      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 500000,
          inventory: { bread: 2 },
        },
      }));

      const cost = 5 * INGREDIENTS['bread'].cost;
      const success = buyIngredients({ bread: 5 } as any, cost);

      expect(success).toBe(true);
      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(500000 - cost);
      expect(state.gameState.inventory.bread).toBe(7); // 2 + 5
    });

    it('TC_MKT_02: Từ chối mua hàng khi số dư tiền mặt không đủ', () => {
      const { buyIngredients } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 1000, // Chỉ có 1k!
          inventory: { beef: 0 },
        },
      }));

      const cost = 10 * INGREDIENTS['beef'].cost;
      const success = buyIngredients({ beef: 10 } as any, cost);

      expect(success).toBe(false);
      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(1000);
      expect(state.gameState.inventory.beef).toBe(0);
    });
  });

  describe('2. Nâng Cấp Thiết Bị & Mặt Bằng (Upgrades & Stages)', () => {
    it('TC_UPG_01: Mua nâng cấp thiết bị trừ tiền và ghi nhận vào danh sách nâng cấp', () => {
      const { purchaseUpgrade } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 10000000,
          purchasedUpgrades: {},
        },
      }));

      // Mua nâng cấp Bếp Nướng & Khò Xe Đẩy (modern_stove)
      const success = purchaseUpgrade('modern_stove');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.stageUpgrades?.['cart']?.['modern_stove']).toBe(1);
      expect(state.gameState.money).toBeLessThan(10000000);
    });

    it('TC_UPG_02: Nâng cấp mô hình kinh doanh từ cart lên corner', () => {
      const { upgradeBusinessStage } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          businessStage: 'cart',
          money: 10000000,
          reputation: 200,
        },
      }));

      const success = upgradeBusinessStage();
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.businessStage).toBe('corner');
    });
  });

  describe('3. Điều Chỉnh Giá Bán Menu (Menu Pricing Strategy)', () => {
    it('TC_PRC_01: Điều chỉnh giá bán món ăn trong menu', () => {
      const { setDishPrice } = useGameStore.getState();

      setDishPrice('banh_mi', 'banh_mi_trung', 25000);

      const state = useGameStore.getState();
      expect(state.gameState.menuSettings?.['banh_mi']?.prices?.['banh_mi_trung']).toBe(25000);
    });

    it('TC_PRC_02: Bật/Tắt món ăn phục vụ trong menu', () => {
      const { toggleActiveRecipe } = useGameStore.getState();

      toggleActiveRecipe('banh_mi', 'banh_mi_trung');

      const state = useGameStore.getState();
      expect(state.gameState.menuSettings?.['banh_mi']?.activeRecipes?.includes('banh_mi_trung')).toBe(false);
    });
  });
});
