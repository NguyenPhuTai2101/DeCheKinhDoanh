import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, RECIPES } from '../../../shared/gameData';
import { DeliveryOrder } from '../../../shared/types';

describe('Module: Delivery Orders & Street Life', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameState: JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),
      deliveryOrders: [],
      isShopOpen: true,
      toastMessage: null,
    });
  });

  describe('1. Đơn Giao Hàng Trực Tuyến (Delivery Orders Lifecycle)', () => {
    it('TC_DLV_01: Sinh đơn giao hàng mới khi danh sách chưa đầy', () => {
      const { spawnDeliveryOrder } = useGameStore.getState();

      spawnDeliveryOrder();

      const state = useGameStore.getState();
      expect(state.deliveryOrders.length).toBe(1);
      const order = state.deliveryOrders[0];
      expect(order.id).toBeDefined();
      expect(order.customerName).toBeDefined();
      expect(order.rewardMoney).toBeGreaterThan(0);
      expect(order.recipeId).toBeDefined();
    });

    it('TC_DLV_02: Giới hạn tối đa 3 đơn giao hàng cùng lúc', () => {
      const { spawnDeliveryOrder } = useGameStore.getState();

      for (let i = 0; i < 6; i++) {
        spawnDeliveryOrder();
      }

      const state = useGameStore.getState();
      expect(state.deliveryOrders.length).toBeLessThanOrEqual(3);
    });

    it('TC_DLV_03: Hoàn thành đơn giao hàng khi đủ nguyên liệu, nhận thưởng tiền & uy tín', () => {
      const { fulfillDeliveryOrder } = useGameStore.getState();

      const recipeId = 'banh_mi_trung';
      const mockOrder: DeliveryOrder = {
        id: 'deliv_1',
        customerName: 'Chị Ngọc Kế Toán',
        recipeId,
        quantity: 1,
        timeRemainingSeconds: 60,
        maxTimeSeconds: 60,
        rewardMoney: 30000,
        rewardTip: 5000,
        status: 'pending',
      };

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 100000,
          inventory: { bread: 5, egg: 5, cucumber: 5 },
        },
        deliveryOrders: [mockOrder],
      }));

      const success = fulfillDeliveryOrder('deliv_1');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.money).toBeGreaterThan(100000);
      expect(state.deliveryOrders.find((o) => o.id === 'deliv_1')).toBeUndefined();
    });

    it('TC_DLV_04: Hủy đơn giao hàng gỡ bỏ khỏi danh sách', () => {
      const { cancelDeliveryOrder } = useGameStore.getState();

      const mockOrder: DeliveryOrder = {
        id: 'deliv_2',
        customerName: 'Anh Tuấn Shipper',
        recipeId: 'banh_mi_trung',
        quantity: 1,
        timeRemainingSeconds: 30,
        maxTimeSeconds: 60,
        rewardMoney: 20000,
        rewardTip: 0,
        status: 'pending',
      };

      useGameStore.setState({ deliveryOrders: [mockOrder] });
      cancelDeliveryOrder('deliv_2');

      const state = useGameStore.getState();
      expect(state.deliveryOrders).toHaveLength(0);
    });
  });

  describe('2. Vé Số & Cầu May Đầu Ngõ (Street Lottery)', () => {
    it('TC_LOT_01: Mua vé số kiến thiết trừ tiền cược và ghi nhận vé trong ngày', () => {
      const { buyLotteryTicket } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 500000,
          activeLotteryTicket: null,
        },
      }));

      const success = buyLotteryTicket('68', 20000, 'de');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.money).toBe(480000);
      expect(state.gameState.activeLotteryTicket).toBeDefined();
      expect(state.gameState.activeLotteryTicket?.ticketNumber).toBe('68');
    });

    it('TC_LOT_02: Quay số cào nhanh (Instant Draw)', () => {
      const { playInstantLotteryDraw } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 500000,
        },
        lotteryDrawResult: null,
      }));

      playInstantLotteryDraw('88', 10000, 'de');

      const state = useGameStore.getState();
      expect(state.lotteryDrawResult).toBeDefined();
      expect(state.lotteryDrawResult?.drawnNumber).toBeDefined();
    });
  });
});
