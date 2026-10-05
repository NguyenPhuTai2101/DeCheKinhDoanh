import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  RESTAURANT_TYPES,
  EMPLOYEES,
  calculateCookSpeedBoost,
  calculateSpawnRateBoost,
  calculateCustomerPatienceBonus,
  calculateTipRateBonus,
  calculateMaxTables,
} from '../../../shared/gameData';
import { ActiveOrder, CustomerTypeId, Employee, NeighborId, RecipeId } from '../../../shared/types';
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
    addBranchRevenue,
  } = useGameStore();

  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const stageId = gameState.businessStage || 'cart';
  const stageUpgrades = gameState.stageUpgrades?.[stageId] || gameState.purchasedUpgrades || {};
  const maxTables = calculateMaxTables(stageId, stageUpgrades);

  // Timers tracked in refs so component re-renders do NOT reset them
  const spawnTimerRef = useRef(0);
  const branchPassiveTimerRef = useRef(0);
  const stockAlertCooldownRef = useRef(0);

  // 1. VÒNG LẶP MÔ PHỎNG THỜI GIAN, NẤU ĂN, BƯNG MÓN & CHI NHÁNH TỰ ĐỘNG
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const tickMs = 500; // Chu kỳ quét 500ms
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const currentGameState = state.gameState;
      const currentOrders = state.activeOrders;
      const currentRestId = currentGameState.activeRestaurantId || 'banh_mi';

      // 1.1 Cập nhật đồng hồ trò chơi
      tickTime(1.25 * timeSpeed);

      // 1.2 Danh sách nhân viên được phân công cho quán đang quản lý
      const hiredList = currentGameState.hiredEmployees
        .map((id) => currentGameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
        .filter(Boolean) as Employee[];

      const activeStaff = hiredList.filter(
        (e) => (e.assignedRestaurantId || 'banh_mi') === currentRestId
      );
      const cooks = activeStaff.filter((e) => e.role === 'cook');
      const servers = activeStaff.filter((e) => e.role === 'server');
      const managers = activeStaff.filter((e) => e.role === 'manager');
      const hasManager = managers.length > 0;
      const managerBoost = hasManager ? 1.25 : 1.0;
      const hasTuan = hiredList.some((e) => e.id === 'emp_tuan');

      const simStageId = currentGameState.businessStage || 'cart';
      const simStageUpgrades = currentGameState.stageUpgrades?.[simStageId] || currentGameState.purchasedUpgrades || {};
      const simMaxTables = calculateMaxTables(simStageId, simStageUpgrades);
      const cookSpeedBoost = calculateCookSpeedBoost(simStageId, simStageUpgrades);
      const spawnRateBoost = calculateSpawnRateBoost(simStageId, simStageUpgrades);
      const extraPatience = calculateCustomerPatienceBonus(simStageId, simStageUpgrades);
      const tipRateBoost = calculateTipRateBonus(simStageId, simStageUpgrades);

      // 1.3 Quản lý đơn hàng: Nấu ăn (Cook), Bưng món (Server), Kiên nhẫn (Waiting)
      // Tìm đầu bếp rảnh tay
      const busyCookIds = new Set(
        currentOrders
          .filter((o) => o.state === 'cooking' && o.chefId)
          .map((o) => o.chefId!)
      );
      const freeCooks = cooks.filter((c) => !busyCookIds.has(c.id));

      // Tìm phục vụ rảnh tay
      const busyServerIds = new Set(
        currentOrders
          .filter((o) => o.state === 'eating' && o.serverId)
          .map((o) => o.serverId!)
      );
      const freeServers = servers.filter((s) => !busyServerIds.has(s.id));

      const updatedInventory = { ...currentGameState.inventory };
      let inventoryChanged = false;
      const newActionStatuses: Record<string, string> = {};

      const nextOrders: ActiveOrder[] = [];

      for (const order of currentOrders) {
        const recipe = RECIPES[order.recipeId];
        if (!recipe) {
          nextOrders.push(order);
          continue;
        }

        // --- TRẠNG THÁI WAITING: Khách đang chờ ---
        if (order.state === 'waiting') {
          // Nếu có đầu bếp rảnh, bắt đầu tự động nấu!
          if (freeCooks.length > 0) {
            // Kiểm tra nguyên liệu trong kho
            const hasStock = recipe.requiredIngredients.every(
              (ingId) => (updatedInventory[ingId] || 0) > 0
            );

            if (hasStock) {
              const assignedCook = freeCooks.shift()!;
              // Trừ nguyên liệu vào kho
              recipe.requiredIngredients.forEach((ingId) => {
                updatedInventory[ingId] = Math.max(0, (updatedInventory[ingId] || 0) - 1);
              });
              inventoryChanged = true;

              newActionStatuses[assignedCook.id] = 'cooking';
              nextOrders.push({
                ...order,
                state: 'cooking',
                chefId: assignedCook.id,
                chefName: assignedCook.name,
                cookingProgress: 5,
              });
              continue;
            } else {
              // Thiếu hàng trong kho
              if (Date.now() - stockAlertCooldownRef.current > 15000) {
                stockAlertCooldownRef.current = Date.now();
                showToast(`⚠️ Hết nguyên liệu làm ${recipe.name}! Vào Chợ Sỉ 🛒 để nhập thêm.`);
              }
            }
          }

          // Giảm độ kiên nhẫn nếu vẫn đang chờ
          const newPatience = order.patienceRemaining - (tickMs / 1000) * timeSpeed;
          if (newPatience <= 0) {
            handleCustomerLeaveAngry(order.tableIndex);
            continue; // Khách bỏ về
          }
          nextOrders.push({ ...order, patienceRemaining: newPatience });
        }

        // --- TRẠNG THÁI COOKING: Đầu bếp đang chế biến ---
        else if (order.state === 'cooking') {
          const cook = hiredList.find((e) => e.id === order.chefId);
          const cookSpeed = (cook?.speed || 1.0) * managerBoost;
          const cookingDurationMs = Math.max(
            350,
            (recipe.cookingTimeMs * (hasTuan ? 0.75 : 1.0)) / (1 + cookSpeedBoost) / cookSpeed / timeSpeed
          );

          const progressDelta = (tickMs / cookingDurationMs) * 100;
          const currentProgress = (order.cookingProgress || 0) + progressDelta;

          if (currentProgress >= 100) {
            // Nấu xong!
            soundManager.playDishComplete();
            showToast(`👨‍🍳 ${order.chefName || 'Bếp'} đã nấu xong ${recipe.name} cho Bàn ${order.tableIndex}!`);
            if (order.chefId) {
              newActionStatuses[order.chefId] = 'idle';
            }
            nextOrders.push({
              ...order,
              state: 'ready',
              cookingProgress: 100,
            });
          } else {
            if (order.chefId) {
              newActionStatuses[order.chefId] = 'cooking';
            }
            nextOrders.push({
              ...order,
              cookingProgress: currentProgress,
            });
          }
        }

        // --- TRẠNG THÁI READY: Món đã hoàn thành, chờ bưng ra bàn ---
        else if (order.state === 'ready') {
          // Nếu có phục vụ rảnh tay, tự động bưng ra bàn!
          if (freeServers.length > 0) {
            const assignedServer = freeServers.shift()!;
            newActionStatuses[assignedServer.id] = 'serving';
            showToast(`🏃‍♀️ ${assignedServer.name} bưng ${recipe.name} ra Bàn ${order.tableIndex}!`);
            nextOrders.push({
              ...order,
              state: 'eating',
              serverId: assignedServer.id,
              serverName: assignedServer.name,
              eatingTimer: 2.5, // 2.5 giây ăn uống
            });
            continue;
          }

          // Chưa có nhân viên phục vụ, giữ trạng thái ready chờ người chơi bưng thủ công
          nextOrders.push(order);
        }

        // --- TRẠNG THÁI EATING: Khách đang ăn tại bàn ---
        else if (order.state === 'eating') {
          const remainingTimer = (order.eatingTimer ?? 2.5) - (tickMs / 1000) * timeSpeed;
          if (remainingTimer <= 0) {
            // Ăn xong, thu tiền thanh toán + tip
            const cType = CUSTOMER_TYPES[order.typeId];
            const patiencePercent = Math.max(0, order.patienceRemaining / order.maxPatience);
            const dishwareTipBoost = 1 + tipRateBoost;
            let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent * dishwareTipBoost);
            if (hasTuan) tip = Math.round(tip * 1.15);
            if (order.neighborId) {
              tip += Math.round(recipe.basePrice * 0.2);
              serveNeighborGuest(order.neighborId);
            }

            soundManager.playCoin();
            finishServing(order.tableIndex, recipe.basePrice, tip);
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.65 },
            });

            if (order.serverId) {
              newActionStatuses[order.serverId] = 'idle';
            }
            // Không đẩy vào nextOrders để dọn bàn trống
          } else {
            nextOrders.push({
              ...order,
              eatingTimer: remainingTimer,
            });
          }
        } else {
          nextOrders.push(order);
        }
      }

      // Cập nhật nguyên liệu nếu có trừ kho
      if (inventoryChanged) {
        useGameStore.setState((s) => ({
          gameState: {
            ...s.gameState,
            inventory: updatedInventory,
          },
        }));
      }

      // Cập nhật trạng thái hành động của nhân viên
      if (Object.keys(newActionStatuses).length > 0) {
        setEmployeeActionStatus(newActionStatuses);
      }

      // Cập nhật danh sách đơn hàng
      setActiveOrders(nextOrders);

      // 1.4 Sinh khách hàng mới vào bàn ăn
      const baseRate = currentStage.customerRateMs;
      const spawnRate = Math.max(600, Math.round(baseRate / (1 + spawnRateBoost)));

      spawnTimerRef.current += tickMs * timeSpeed;
      if (spawnTimerRef.current >= spawnRate) {
        spawnTimerRef.current = 0;

        if (nextOrders.length < simMaxTables) {
          const takenTables = nextOrders.map((o) => o.tableIndex);
          let freeTable = 1;
          for (let i = 1; i <= simMaxTables; i++) {
            if (!takenTables.includes(i)) {
              freeTable = i;
              break;
            }
          }

          const activeRest = RESTAURANT_TYPES[currentRestId] || RESTAURANT_TYPES.banh_mi;
          const availableRecipes = activeRest.primaryRecipeIds;

          const isNeighbor = Math.random() < 0.22;
          let chosenType: CustomerTypeId = 'student';
          let chosenNeighborId: NeighborId | undefined = undefined;
          let chosenRecipe: RecipeId = availableRecipes[0] || 'banh_mi_trung';
          let dialogue = '';
          let patienceSeconds = 45 + extraPatience;

          if (isNeighbor) {
            const neighborKeys: NeighborId[] = ['bac_ba', 'co_bay', 'chu_nam', 'be_bong', 'chi_lan'];
            chosenNeighborId = neighborKeys[Math.floor(Math.random() * neighborKeys.length)];
            const nData = NEIGHBORS_DATA[chosenNeighborId];
            if (availableRecipes.includes(nData.favoriteDishId)) {
              chosenRecipe = nData.favoriteDishId;
            } else {
              chosenRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            }
            dialogue = nData.dialogues[1] || 'Chào chủ quán!';
            patienceSeconds = 55 + extraPatience;
          } else {
            const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
            chosenType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
            const cType = CUSTOMER_TYPES[chosenType];
            const matched = cType.favoriteRecipeIds.filter((r) => availableRecipes.includes(r));
            if (matched.length > 0) {
              chosenRecipe = matched[Math.floor(Math.random() * matched.length)];
            } else {
              chosenRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            }
            patienceSeconds = cType.patienceSeconds + extraPatience;
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

          setActiveOrders((prev) => [...prev, newOrder]);
        }
      }

      // 1.5 TỰ ĐỘNG KIẾM TIỀN CHO CÁC CHI NHÁNH ĐÃ MỞ (BẮT BUỘC PHẢI CÓ NHÂN VIÊN TRỰC)
      branchPassiveTimerRef.current += tickMs * timeSpeed;
      if (branchPassiveTimerRef.current >= 8000) {
        branchPassiveTimerRef.current = 0;

        const unlockedRestaurants = currentGameState.unlockedRestaurants || ['banh_mi'];
        const otherBranches = unlockedRestaurants.filter((rId) => rId !== currentRestId);

        for (const branchId of otherBranches) {
          // Kiểm tra xem chi nhánh này có nhân viên được phân công không
          const branchStaff = hiredList.filter(
            (e) => (e.assignedRestaurantId || 'banh_mi') === branchId
          );

          if (branchStaff.length > 0) {
            // Chi nhánh có nhân viên -> Tự động bán hàng và thu tiền!
            const branchRest = RESTAURANT_TYPES[branchId];
            if (branchRest && branchRest.primaryRecipeIds.length > 0) {
              const randomRecipeId =
                branchRest.primaryRecipeIds[
                  Math.floor(Math.random() * branchRest.primaryRecipeIds.length)
                ];
              const recipe = RECIPES[randomRecipeId];
              if (recipe) {
                const staffBonus = 1 + 0.15 * branchStaff.length;
                const branchLevels: Record<string, number> = currentGameState.branchLevels || {};
                const branchLvl = branchLevels[branchId] || 1;
                const tier = branchRest.branchTiers?.[branchLvl - 1];
                const tierMultiplier = tier?.bonusMultiplier || (1 + (branchLvl - 1) * 0.5);

                const earned = Math.round(recipe.basePrice * staffBonus * managerBoost * tierMultiplier);
                addBranchRevenue(branchId, earned, recipe.name);
              }
            }
          }
        }
      }
    }, tickMs / timeSpeed);

    return () => clearInterval(interval);
  }, [
    isShopOpen,
    timeSpeed,
    tickTime,
    maxTables,
    currentStage.customerRateMs,
    setActiveOrders,
    handleCustomerLeaveAngry,
    finishServing,
    serveNeighborGuest,
    showToast,
    setEmployeeActionStatus,
    addBranchRevenue,
  ]);
};
