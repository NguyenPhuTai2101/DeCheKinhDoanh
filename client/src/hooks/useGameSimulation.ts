import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  INGREDIENTS,
} from '../../../shared/gameData';
import { ActiveOrder, CustomerTypeId, NeighborId, RecipeId } from '../../../shared/types';
import { soundManager } from '../utils/soundManager';
import confetti from 'canvas-confetti';

export const useGameSimulation = () => {
  const {
    gameState,
    isShopOpen,
    timeSpeed,
    tickTime,
    activeOrders,
    setActiveOrders,
    finishServing,
    handleCustomerLeaveAngry,
    serveNeighborGuest,
    showToast,
    setEmployeeActionStatus,
  } = useGameStore();

  const isLinhCookingRef = useRef(false);
  const isMaiServingRef = useRef(false);

  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const upgrades = gameState.purchasedUpgrades;
  const maxTables =
    currentStage.maxTables + (upgrades['extra_table_1'] ? 1 : 0) + (upgrades['extra_table_2'] ? 1 : 0);

  // 1. VÒNG LẶP THỜI GIAN & ĐỘ KIÊN NHẪN CỦA KHÁCH
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const interval = setInterval(() => {
      tickTime(2.5 * timeSpeed);

      setActiveOrders((prev) => {
        const next = prev.map((order) => {
          if (order.state === 'waiting') {
            const newPatience = order.patienceRemaining - 1 * timeSpeed;
            if (newPatience <= 0) {
              handleCustomerLeaveAngry(order.tableIndex);
              return { ...order, state: 'leaving' as const };
            }
            return { ...order, patienceRemaining: newPatience };
          }
          return order;
        });
        return next.filter((o) => o.state !== 'leaving');
      });
    }, 1000 / timeSpeed);

    return () => clearInterval(interval);
  }, [isShopOpen, timeSpeed, tickTime, handleCustomerLeaveAngry, setActiveOrders]);

  // 2. VÒNG LẶP ĐÓN KHÁCH MỚI VÀO BÀN ĂN
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hasSignboard = (gameState.purchasedUpgrades['flower_signboard'] || 0) > 0;
    const baseRate = currentStage.customerRateMs;
    const spawnRate = hasSignboard ? Math.round(baseRate * 0.85) : baseRate;

    const spawnInterval = setInterval(() => {
      setActiveOrders((prev) => {
        if (prev.length >= maxTables) return prev;

        // Tìm bàn trống đầu tiên
        const takenTables = prev.map((o) => o.tableIndex);
        let freeTable = 1;
        for (let i = 1; i <= maxTables; i++) {
          if (!takenTables.includes(i)) {
            freeTable = i;
            break;
          }
        }

        // Tỷ lệ xuất hiện hàng xóm quen thuộc
        const isNeighbor = Math.random() < 0.22;
        let chosenType: CustomerTypeId = 'student';
        let chosenNeighborId: NeighborId | undefined = undefined;
        let chosenRecipe: RecipeId = 'banh_mi_trung';
        let dialogue = '';
        let patienceSeconds = 40;

        if (isNeighbor) {
          const neighborKeys: NeighborId[] = ['bac_ba', 'co_bay', 'chu_nam', 'be_bong', 'chi_lan'];
          chosenNeighborId = neighborKeys[Math.floor(Math.random() * neighborKeys.length)];
          const nData = NEIGHBORS_DATA[chosenNeighborId];
          chosenRecipe = nData.favoriteDishId;
          dialogue = nData.dialogues[1] || 'Chào chủ quán!';
          patienceSeconds = 50;
        } else {
          const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
          chosenType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
          const cType = CUSTOMER_TYPES[chosenType];
          const favoriteList = cType.favoriteRecipeIds;
          chosenRecipe = favoriteList[Math.floor(Math.random() * favoriteList.length)];
          patienceSeconds = cType.patienceSeconds;
        }

        soundManager.playDoorBell();

        const newOrder: ActiveOrder = {
          id: Math.random().toString(36).substring(2, 9),
          tableIndex: freeTable,
          typeId: chosenType,
          neighborId: chosenNeighborId,
          dialogue,
          recipeId: chosenRecipe,
          patienceRemaining: patienceSeconds,
          maxPatience: patienceSeconds,
          state: 'waiting',
        };

        return [...prev, newOrder];
      });
    }, spawnRate / timeSpeed);

    return () => clearInterval(spawnInterval);
  }, [
    isShopOpen,
    timeSpeed,
    maxTables,
    currentStage.customerRateMs,
    gameState.purchasedUpgrades,
    setActiveOrders,
  ]);

  // 3. TỰ ĐỘNG NẤU ĂN BỞI BÁC LINH (COOK) & EM TUẤN (ASSISTANT)
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hired = gameState.hiredEmployees;
    const hasLinh = hired.includes('emp_linh');
    const hasTuan = hired.includes('emp_tuan');

    if (!hasLinh && !hasTuan) return;
    if (isLinhCookingRef.current) return;

    const waitingOrder = activeOrders.find((o) => o.state === 'waiting');
    if (!waitingOrder) return;

    const recipe = RECIPES[waitingOrder.recipeId];
    if (!recipe) return;

    // Kiểm tra nguyên liệu trong kho
    const hasStock = recipe.requiredIngredients.every(
      (ingId) => (gameState.inventory[ingId] || 0) > 0
    );
    if (!hasStock) return;

    // Bắt đầu chế biến
    isLinhCookingRef.current = true;
    setEmployeeActionStatus({
      linh: hasLinh ? 'cooking' : 'idle',
      tuan: hasTuan ? 'assisting' : 'idle',
    });

    const cookingDuration = Math.max(
      800,
      (recipe.cookingTimeMs * (hasTuan ? 0.6 : 1.0)) / timeSpeed
    );

    const timer = setTimeout(() => {
      // Trừ nguyên liệu
      const updatedInventory = { ...gameState.inventory };
      recipe.requiredIngredients.forEach((ingId) => {
        updatedInventory[ingId] = Math.max(0, (updatedInventory[ingId] || 0) - 1);
      });

      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          inventory: updatedInventory,
        },
      }));

      // Đổi trạng thái order sang 'ready'
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === waitingOrder.id ? { ...o, state: 'ready' as const } : o))
      );

      soundManager.playDishComplete();
      showToast(
        hasLinh
          ? `👨‍🍳 Bác Linh đã nấu xong ${recipe.name} cho Bàn ${waitingOrder.tableIndex}!`
          : `🧑‍🍳 Em Tuấn đã chuẩn bị xong món ${recipe.name}!`
      );

      setEmployeeActionStatus({ linh: 'idle', tuan: 'idle' });
      isLinhCookingRef.current = false;
    }, cookingDuration);

    return () => {
      clearTimeout(timer);
      isLinhCookingRef.current = false;
    };
  }, [
    activeOrders,
    isShopOpen,
    timeSpeed,
    gameState.hiredEmployees,
    gameState.inventory,
    setActiveOrders,
    setEmployeeActionStatus,
    showToast,
  ]);

  // 4. TỰ ĐỘNG BƯNG MÓN BỞI EM MAI (WAITER)
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const hired = gameState.hiredEmployees;
    const hasMai = hired.includes('emp_mai');
    const hasTuan = hired.includes('emp_tuan');

    if (!hasMai) return;
    if (isMaiServingRef.current) return;

    const readyOrder = activeOrders.find((o) => o.state === 'ready');
    if (!readyOrder) return;

    const recipe = RECIPES[readyOrder.recipeId];
    if (!recipe) return;

    isMaiServingRef.current = true;
    setEmployeeActionStatus({ mai: 'serving' });

    const serveDuration = 1200 / timeSpeed;

    const timer = setTimeout(() => {
      const cType = CUSTOMER_TYPES[readyOrder.typeId];
      const patiencePercent = readyOrder.patienceRemaining / readyOrder.maxPatience;
      let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

      // Em Tuấn bonus +15% tip nếu được thuê
      if (hasTuan) {
        tip = Math.round(tip * 1.15);
      }

      if (readyOrder.neighborId) {
        tip += Math.round(recipe.basePrice * 0.2);
        serveNeighborGuest(readyOrder.neighborId);
      }

      // Khách chuyển sang trạng thái đang ăn
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === readyOrder.id ? { ...o, state: 'eating' as const } : o))
      );

      showToast(`🏃‍♀️ Em Mai bưng món ra Bàn ${readyOrder.tableIndex}!`);
      setEmployeeActionStatus({ mai: 'idle' });

      // Sau khi ăn xong, thu tiền thanh toán
      setTimeout(() => {
        soundManager.playCoin();
        finishServing(readyOrder.tableIndex, recipe.basePrice, tip);

        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#EC4899'],
        });

        setActiveOrders((prev) => prev.filter((o) => o.id !== readyOrder.id));
        isMaiServingRef.current = false;
      }, 2000 / timeSpeed);
    }, serveDuration);

    return () => {
      clearTimeout(timer);
      isMaiServingRef.current = false;
    };
  }, [
    activeOrders,
    isShopOpen,
    timeSpeed,
    gameState.hiredEmployees,
    setActiveOrders,
    setEmployeeActionStatus,
    finishServing,
    serveNeighborGuest,
    showToast,
  ]);
};
