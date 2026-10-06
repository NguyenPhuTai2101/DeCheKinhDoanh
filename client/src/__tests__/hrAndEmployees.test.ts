import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { INITIAL_GAME_STATE, EMPLOYEES } from '../../../shared/gameData';

describe('Module: HR & Employees System', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameState: JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),
      isShopOpen: false,
      toastMessage: null,
    });
  });

  describe('1. Tuyển Dụng & Sa Thải (Hiring & Firing)', () => {
    it('TC_HR_01: Tuyển nhân viên thành công khi đủ tiền và còn chỉ tiêu', () => {
      const { hireEmployee } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 1000000,
          hiredEmployees: [],
        },
      }));

      const success = hireEmployee('emp_huy');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.hiredEmployees).toContain('emp_huy');
      expect(state.gameState.employeeDetails['emp_huy']).toBeDefined();
      expect(state.gameState.employeeDetails['emp_huy'].hired).toBe(true);
      expect(state.gameState.money).toBeLessThan(1000000);
    });

    it('TC_HR_02: Từ chối tuyển nhân viên khi không đủ tiền mặt', () => {
      const { hireEmployee } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 10000, // Chỉ có 10k
          hiredEmployees: [],
        },
      }));

      const success = hireEmployee('emp_huy');
      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.gameState.hiredEmployees).not.toContain('emp_huy');
    });

    it('TC_HR_03: Sa thải nhân viên gỡ bỏ khỏi danh sách nhân sự', () => {
      const { fireEmployee } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          hiredEmployees: ['emp_huy'],
          employeeDetails: {
            emp_huy: { ...EMPLOYEES[0], hired: true },
          },
        },
      }));

      fireEmployee('emp_huy');

      const state = useGameStore.getState();
      expect(state.gameState.hiredEmployees).not.toContain('emp_huy');
      expect(state.gameState.employeeDetails['emp_huy']).toBeUndefined();
    });
  });

  describe('2. Đãi Ngộ & Tinh Thần Nhân Viên (Mood, Bonus & Stress)', () => {
    it('TC_HR_04: Thưởng nóng (Bonus) giúp tăng tâm trạng (Mood) của nhân viên', () => {
      const { giveBonusEmployee } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 500000,
          hiredEmployees: ['emp_huy'],
          employeeDetails: {
            emp_huy: { ...EMPLOYEES[0], mood: 60, hired: true },
          },
        },
      }));

      const success = giveBonusEmployee('emp_huy', 50000);
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.employeeDetails['emp_huy'].mood).toBeGreaterThan(60);
      expect(state.gameState.money).toBe(450000);
    });

    it('TC_HR_05: Đào tạo nâng cao kỹ năng (Training)', () => {
      const { trainEmployee } = useGameStore.getState();

      useGameStore.setState((s) => ({
        gameState: {
          ...s.gameState,
          money: 500000,
          hiredEmployees: ['emp_huy'],
          employeeDetails: {
            emp_huy: { ...EMPLOYEES[0], speed: 1.0, hired: true },
          },
        },
      }));

      const success = trainEmployee('emp_huy');
      expect(success).toBe(true);

      const state = useGameStore.getState();
      expect(state.gameState.employeeDetails['emp_huy'].speed).toBeGreaterThan(1.0);
    });
  });
});
