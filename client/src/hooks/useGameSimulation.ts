import { useEffect, useRef } from 'react';
import { simulationDelta } from '../../../shared/simulation/time';
import { useGameStore } from '../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  INGREDIENTS,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  RESTAURANT_TYPES,
  EMPLOYEES,
  calculateCookSpeedBoost,
  calculateSpawnRateBoost,
  calculateCustomerPatienceBonus,
  calculateTipRateBonus,
  calculateMaxTables,
  calculateStorageCapacity,
} from '../../../shared/gameData';
import { ActiveOrder, CustomerTypeId, Employee, NeighborId, RecipeId, IngredientId } from '../../../shared/types';
import { getRandomRecipeCustomization } from '../../../shared/simulationConfig';
import { calculateCookEfficiency, calculateServerEfficiency } from '../../../shared/simulation/employees';
import { getOrderIngredients, evaluateDishMatch } from '../../../shared/simulation/orders';
import { calculatePriceMultiplier } from '../../../shared/economy/demand';
import { generateOrderCustomization } from '../../../shared/simulation/orders';
import { calculateRatingMultiplier } from '../../../shared/economy/demand';
import { simulatePassiveBranchTick } from '../../../shared/simulation/branches';
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
    recordBranchSales,
  } = useGameStore();

  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const stageId = gameState.businessStage || 'cart';
  const stageUpgrades = gameState.stageUpgrades?.[stageId] ?? (gameState.stageUpgrades ? {} : gameState.purchasedUpgrades || {});
  const maxTables = calculateMaxTables(stageId, stageUpgrades, gameState.stageUpgrades);

  // Timers tracked in refs so component re-renders do NOT reset them
  const spawnTimerRef = useRef(0);
  const deliveryTimerRef = useRef(0);
  const branchPassiveTimerRef = useRef(0);
  const branchToastTimerRef = useRef(0);
  const stockAlertCooldownRef = useRef(0);
  const autoShopCooldownRef = useRef(0);
  const incidentTimerRef = useRef(0);

  // 1. VÒNG LẶP MÔ PHỎNG THỜI GIAN, NẤU ĂN, BƯNG MÓN & CHI NHÁNH TỰ ĐỘNG
  useEffect(() => {
    if (!isShopOpen || timeSpeed === 0) return;

    const delta = simulationDelta(500, timeSpeed);
    const tickMs = 500; // Chu kỳ quét 500ms
    const interval = setInterval(() => {
      if (!useGameStore.getState().isShopOpen || useGameStore.getState().activeModal || useGameStore.getState().activeIncident) return;
      const state = useGameStore.getState();
      const currentGameState = state.gameState;
      const currentOrders = state.activeOrders;
      const currentRestId = currentGameState.activeRestaurantId || 'banh_mi';
      const currentWeather = currentGameState.weather || 'sunny';

      // 1.1 Cập nhật đồng hồ trò chơi
      tickTime(delta.gameMinutes);
      if (!useGameStore.getState().isShopOpen || useGameStore.getState().activeModal) return;

      // Hiệu ứng thời tiết
      const weatherPatienceBonus = currentWeather === 'breezy' ? 6 : 0;
      const weatherTipBoost = currentWeather === 'breezy' ? 0.25 : 0;
      const weatherSpawnDelay = currentWeather === 'rainy' ? 1.35 : 1.0;

      // Tự động sinh đơn ship giao hàng (Mưa: 12s, Bình thường: 28s)
      deliveryTimerRef.current += delta.milliseconds;
      const deliveryInterval = currentWeather === 'rainy' ? 12000 : 28000;
      if (deliveryTimerRef.current >= deliveryInterval) {
        deliveryTimerRef.current = 0;
        const deliveries = state.deliveryOrders || [];
        if (deliveries.length < 3) {
          state.spawnDeliveryOrder();
        }
      }

      // 1.1b Kích hoạt biến cố bất ngờ đời thực (Tối đa 1 lần/ngày trong khung giờ vàng 10:30 - 17:30)
      const currentMinute = currentGameState.gameTimeMinutes || 360;
      if (
        !state.hasIncidentTriggeredToday &&
        !state.activeIncident &&
        !state.activeModal &&
        currentMinute >= 630 && // Sau 10:30 sáng
        currentMinute <= 1050    // Trước 17:30 chiều
      ) {
        incidentTimerRef.current += delta.milliseconds;
        if (incidentTimerRef.current >= 25000) {
          incidentTimerRef.current = 0;
          // Xác suất 25% mỗi 25s trong khung giờ vàng (chỉ nổ đúng 1 lần duy nhất trong cả ngày)
          if (Math.random() < 0.25) {
            state.triggerSurpriseIncident();
          }
        }
      }

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
      // BUG 4 FIXED: Chỉ nhân viên Tuấn trực tại quán này mới kích hoạt buff
      const hasTuan = activeStaff.some((e) => e.id === 'emp_tuan');

      const simStageId = currentGameState.businessStage || 'cart';
      const simStageUpgrades = currentGameState.stageUpgrades?.[simStageId] ?? (currentGameState.stageUpgrades ? {} : currentGameState.purchasedUpgrades || {});
      const simMaxTables = calculateMaxTables(simStageId, simStageUpgrades, currentGameState.stageUpgrades);
      const cookSpeedBoost = calculateCookSpeedBoost(simStageId, simStageUpgrades, currentGameState.stageUpgrades);
      const spawnRateBoost = calculateSpawnRateBoost(simStageId, simStageUpgrades, currentGameState.stageUpgrades);
      const extraPatience = calculateCustomerPatienceBonus(simStageId, simStageUpgrades, currentGameState.stageUpgrades) + weatherPatienceBonus;
      const tipRateBoost = calculateTipRateBonus(simStageId, simStageUpgrades, currentGameState.stageUpgrades) + weatherTipBoost;

      // 1.3 Quản lý đơn hàng: Nấu ăn (Cook), Bưng món (Server), Quản lý điều hành (Manager)
      // Tìm đầu bếp rảnh tay
      const busyCookIds = new Set(
        currentOrders
          .filter((o) => o.state === 'cooking' && o.chefId)
          .map((o) => o.chefId!)
          .concat(state.deliveryOrders.filter(o => o.status === 'cooking' && o.chefId).map(o => o.chefId!))
      );
      const freeCooks = cooks.filter((c) => !busyCookIds.has(c.id));

      // Tìm phục vụ rảnh tay
      const busyServerIds = new Set(
        currentOrders
          .filter((o) => o.state === 'eating' && o.serverId)
          .map((o) => o.serverId!)
      );
      const freeServers = servers.filter((s) => !busyServerIds.has(s.id));

      // Tìm Quản lý rảnh tay (không đang bận nấu hoặc bưng món cho đơn nào)
      const busyManagerIds = new Set(
        currentOrders
          .filter((o) => (o.state === 'cooking' && o.chefId) || (o.state === 'eating' && o.serverId))
          .map((o) => o.state === 'cooking' ? o.chefId : o.serverId)
          .filter(Boolean) as string[]
      );
      const freeManagers = managers.filter((m) => !busyManagerIds.has(m.id) && !busyCookIds.has(m.id));

      const updatedInventory = { ...currentGameState.inventory };
      let inventoryChanged = false;
      let consumedCost = 0;
      let moneySpentOnShopping = 0;
      const newActionStatuses: Record<string, string> = {};

      // 1.2b Tự động đi chợ sỉ thông minh theo Shopper Policy (Mục 33 - Hỗ trợ cả Shopper và Quản lý)
      const shoppers = hiredList.filter(
        (e) => (e.role === 'shopper' || e.role === 'manager') && (!e.assignedRestaurantId || e.assignedRestaurantId === currentRestId)
      );

      const shopperPolicy = currentGameState.shopperPolicy || {
        autoRestock: true,
        minStock: 5,
        targetStock: 25,
        maxPriceMultiplier: 1.3,
      };

      if (shoppers.length > 0 && shopperPolicy.autoRestock) {
        autoShopCooldownRef.current += delta.milliseconds;
        const bestShopper = shoppers.filter(e => e.role === 'shopper' || freeManagers.some(m => m.id === e.id)).sort((a,b) => (b.marketSkill || 0) - (a.marketSkill || 0))[0];
        if (!bestShopper) autoShopCooldownRef.current = 0;
        const shopperInterval = Math.max(7000, 14000 / (bestShopper?.speed || 1.2));

        if (bestShopper && autoShopCooldownRef.current >= shopperInterval) {
          autoShopCooldownRef.current = 0;

          const currentRest = RESTAURANT_TYPES[currentRestId];
          const neededIngs = [...new Set((currentGameState.menuSettings?.[currentRestId]?.activeRecipes || currentRest?.primaryRecipeIds || []).filter(id => currentGameState.unlockedRecipes.includes(id)).flatMap(id => RECIPES[id].requiredIngredients))];

          // Tìm các nguyên liệu dưới ngưỡng tối thiểu (minStock)
          const lowIngs = neededIngs.filter(
            (id) => (updatedInventory[id] || 0) < shopperPolicy.minStock
          );

          if (lowIngs.length > 0) {
            const capacity = calculateStorageCapacity(simStageId, simStageUpgrades, currentGameState.stageUpgrades);
            const currentStock = Object.values(updatedInventory).reduce((a, b) => a + b, 0);
            const freeSpace = capacity - currentStock;

            if (freeSpace >= 5) {
              const discountRate = Math.min(0.35, ((bestShopper.marketSkill || 75) - 50) * 0.006 + 0.1);
              let totalItemsToBuy = 0;
              let rawCost = 0;
              const itemsToBuy: Record<string, number> = {};

              for (const ingId of lowIngs) {
                if (totalItemsToBuy >= freeSpace) break;
                const ing = INGREDIENTS[ingId];
                if (!ing) continue;

                // Kiểm tra chính sách giá trần (maxPriceMultiplier)
                const currentMarketPrice = currentGameState.marketPrices?.[ingId] ?? ing.cost;
                if (currentMarketPrice > ing.cost * shopperPolicy.maxPriceMultiplier) {
                  // Giá chợ hôm nay quá đắt, bỏ qua không mua
                  continue;
                }

                const neededQty = Math.max(0, shopperPolicy.targetStock - (updatedInventory[ingId] || 0));
                const buyQty = Math.min(neededQty, freeSpace - totalItemsToBuy);
                if (buyQty > 0) {
                  itemsToBuy[ingId] = buyQty;
                  totalItemsToBuy += buyQty;
                  rawCost += currentMarketPrice * buyQty;
                }
              }

              const discountedCost = Math.round(rawCost * (1 - discountRate));

              if (totalItemsToBuy > 0 && currentGameState.money >= discountedCost) {
                moneySpentOnShopping = discountedCost;
                inventoryChanged = true;

                for (const [id, qty] of Object.entries(itemsToBuy)) {
                  const k = id as IngredientId;
                  updatedInventory[k] = (updatedInventory[k] || 0) + qty;
                }

                newActionStatuses[bestShopper.id] = 'shopping';
                const index = freeManagers.findIndex(m => m.id === bestShopper.id);
                if (index >= 0) freeManagers.splice(index, 1);
                soundManager.playCoin();
                const roleTitle = bestShopper.role === 'manager' ? 'Quản lý' : 'Shopper';
                showToast(
                  `🛵 [${roleTitle} ${bestShopper.name}] đã đi chợ gom +${totalItemsToBuy} nguyên liệu về kho (-${discountedCost.toLocaleString('vi-VN')}đ, tiết kiệm ${Math.round(discountRate * 100)}%)!`
                );
              }
            }
          }
        }
      }

      const nextOrders: ActiveOrder[] = [];

      for (const order of currentOrders) {
        const recipe = RECIPES[order.recipeId];
        if (!recipe) {
          nextOrders.push(order);
          continue;
        }

        // --- TRẠNG THÁI WAITING: Khách đang chờ ---
        if (order.state === 'waiting') {
          // Nếu có đầu bếp rảnh HOẶC Quản lý rảnh tay, tự động xắn tay vào bếp nấu!
          const canCook = freeCooks.length > 0 || freeManagers.length > 0;
          if (canCook) {
            // Kiểm tra nguyên liệu trong kho
            let ingredients = getOrderIngredients(order);
            const hasStock = ingredients.every(id => (updatedInventory[id] || 0) >= ingredients.filter(value => value === id).length);

            if (hasStock) {
              const assignedChef = freeCooks.length > 0 ? freeCooks.shift()! : freeManagers.shift()!;
              const isManagerCooking = assignedChef.role === 'manager';
              const efficiency = calculateCookEfficiency(assignedChef);
              if (efficiency.mistakeRisk > 0 && Math.random() < efficiency.mistakeRisk) { ingredients = ingredients.slice(0,-1); showToast(`${assignedChef.name} đang căng thẳng và bỏ sót nguyên liệu. Cân nhắc thưởng hoặc nghỉ sau ca.`); }

              // Trừ nguyên liệu vào kho
              ingredients.forEach((ingId) => {
                updatedInventory[ingId] = Math.max(0, (updatedInventory[ingId] || 0) - 1);
                consumedCost += currentGameState.marketPrices?.[ingId] ?? INGREDIENTS[ingId].cost;
              });
              inventoryChanged = true;

              newActionStatuses[assignedChef.id] = 'cooking';
              if (isManagerCooking) {
                showToast(`👩‍🍳 Quản lý [${assignedChef.name}] xắn tay vào bếp nấu ${recipe.name}!`);
              }
              const dishMatch = evaluateDishMatch({ recipeId: order.recipeId, order, preparedIngredients: ingredients });
              nextOrders.push({
                ...order,
                state: 'cooking',
                chefId: assignedChef.id,
                chefName: assignedChef.name,
                cookingProgress: 0,
                preparedIngredients: ingredients,
                cogsBooked: true,
                matchGrade: dishMatch.matchGrade,
                matchFeedback: dishMatch.feedback,
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
          const newPatience = order.patienceRemaining - delta.seconds;
          if (newPatience <= 0) {
            handleCustomerLeaveAngry(order.tableIndex);
            continue; // Khách bỏ về
          }
          nextOrders.push({ ...order, patienceRemaining: newPatience });
        }

        // --- TRẠNG THÁI COOKING: Đầu bếp / Quản lý đang chế biến ---
        else if (order.state === 'cooking') {
          const cook = hiredList.find((e) => e.id === order.chefId);
          const isManager = cook?.role === 'manager';
          const cookSkill = isManager ? (cook?.cookingSkill || 65) : (cook?.cookingSkill || 50);
          const isPlayerCooking = !order.chefId && order.chefName === 'Bạn';
          const cookSpeed = isPlayerCooking ? 1 : (cook ? calculateCookEfficiency(cook).speedMultiplier : 1) * managerBoost;
          const cookingDurationMs = Math.max(
            350,
            (recipe.cookingTimeMs * (!isPlayerCooking && hasTuan ? 0.75 : 1.0)) / (1 + cookSpeedBoost) / cookSpeed
          );

          const progressDelta = (delta.milliseconds / cookingDurationMs) * 100;
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
          // Nếu có phục vụ rảnh tay HOẶC Quản lý rảnh tay, tự động bưng ra bàn!
          const canServe = freeServers.length > 0 || freeManagers.length > 0;
          if (canServe) {
            const assignedServer = freeServers.length > 0 ? freeServers.shift()! : freeManagers.shift()!;
            const isManagerServing = assignedServer.role === 'manager';
            newActionStatuses[assignedServer.id] = 'serving';
            if (isManagerServing) {
              showToast(`🏃 Quản lý [${assignedServer.name}] bưng ${recipe.name} ra Bàn ${order.tableIndex}!`);
            } else {
              showToast(`🏃‍♀️ ${assignedServer.name} bưng ${recipe.name} ra Bàn ${order.tableIndex}!`);
            }
            const eatDuration = 10 / calculateServerEfficiency(assignedServer).speedMultiplier;
            nextOrders.push({
              ...order,
              state: 'eating',
              serverId: assignedServer.id,
              serverName: assignedServer.name,
              eatingTimer: eatDuration,
              maxEatingTimer: eatDuration,
            });
            continue;
          }

          // Chưa có ai rảnh, giữ trạng thái ready chờ người chơi bưng thủ công
          nextOrders.push(order);
        }

        // --- TRẠNG THÁI EATING: Khách đang ăn uống thong thả tại bàn ---
        else if (order.state === 'eating') {
          const eatDuration = order.maxEatingTimer || 10;
          const remainingTimer = (order.eatingTimer ?? eatDuration) - delta.seconds;
          if (remainingTimer <= 0) {
            // Khách ăn xong! Tính tiền tip và chuyển sang trạng thái chờ trả tiền 'paying'
            const cType = CUSTOMER_TYPES[order.typeId];
            const patiencePercent = Math.max(0, order.patienceRemaining / order.maxPatience);
            const dishwareTipBoost = 1 + tipRateBoost;
            let tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent * dishwareTipBoost);
            const server = hiredList.find(e => e.id === order.serverId);
            if (server) tip = Math.round(tip * (1 + calculateServerEfficiency(server).tipBonusRate));
            if (hasTuan) tip = Math.round(tip * 1.15);
            // Trời nắng: Khách thưởng thêm cho các món đồ uống giải khát mát lạnh
            if (currentWeather === 'sunny' && recipe.category === 'drink') {
              tip += Math.round(recipe.basePrice * 0.2);
            }
            if (order.neighborId) {
              tip += Math.round(recipe.basePrice * 0.2);
              serveNeighborGuest(order.neighborId);
            }

            if (order.serverId) {
              newActionStatuses[order.serverId] = 'idle';
            }

            nextOrders.push({
              ...order,
              state: 'paying',
              eatingTimer: 0,
              maxEatingTimer: eatDuration,
              calculatedTip: tip,
            });
          } else {
            nextOrders.push({
              ...order,
              eatingTimer: remainingTimer,
              maxEatingTimer: eatDuration,
            });
          }
        }

        // --- TRẠNG THÁI PAYING: Khách đã ăn xong, đặt tiền lên bàn chờ dọn ---
        else if (order.state === 'paying') {
          // Ưu tiên Quản lý (Cashier / Store Manager) dọn bàn thu tiền, hoặc Phục vụ dọn bàn
          const canCashier = freeManagers.length > 0 || freeServers.length > 0;
          if (canCashier) {
            const cashier = freeManagers.length > 0 ? freeManagers.shift()! : freeServers.shift()!;
            const isManager = cashier.role === 'manager';
            newActionStatuses[cashier.id] = isManager ? 'managing' : 'serving';
            const tip = order.calculatedTip ?? 0;
            soundManager.playCoin();
            const restMenu = currentGameState.menuSettings?.[currentRestId];
            const playerPrice = restMenu?.prices?.[recipe.id] ?? recipe.basePrice;
            finishServing(order.tableIndex, playerPrice, tip, order);
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.65 },
            });
            if (isManager) {
              showToast(`💰 Quản lý [${cashier.name}] dọn bàn & thu tiền Bàn ${order.tableIndex}: +${(playerPrice + tip).toLocaleString('vi-VN')}đ!`);
            } else {
              showToast(`💰 ${cashier.name} dọn bàn & thu tiền Bàn ${order.tableIndex}: +${(playerPrice + tip).toLocaleString('vi-VN')}đ!`);
            }
            // Không đẩy vào nextOrders để dọn bàn đón khách mới
          } else {
            // Chờ người chơi bấm nút "THU TIỀN"
            nextOrders.push(order);
          }
        } else {
          nextOrders.push(order);
        }
      }

      // Cập nhật nguyên liệu & tiền nếu có đi chợ hoặc trừ kho
      if (inventoryChanged || moneySpentOnShopping > 0) {
        state.commitKitchenChanges(updatedInventory, consumedCost, moneySpentOnShopping);
      }

      // Cập nhật trạng thái hành động của nhân viên
      if (Object.keys(newActionStatuses).length > 0) {
        setEmployeeActionStatus(newActionStatuses);
      }

      // Cập nhật danh sách đơn hàng
      setActiveOrders(nextOrders);

      state.tickDeliveries(delta.seconds);

      // 1.4 Sinh khách hàng mới vào bàn ăn theo Rating & Thực đơn mở bán (Active Menu)
      const ratingMult = calculateRatingMultiplier(currentGameState.rating ?? 75);
      const hour = Math.floor(currentGameState.gameTimeMinutes / 60);
      const peak = hour >= 11 && hour < 14 ? 1.3 : hour >= 17 && hour < 20 ? 1.15 : 0.85;
      const restMenuForRate = currentGameState.menuSettings?.[currentRestId];
      const menuForRate = (restMenuForRate?.activeRecipes || RESTAURANT_TYPES[currentRestId].primaryRecipeIds).filter(id => currentGameState.unlockedRecipes.includes(id));
      const discountAttraction = Math.max(1, menuForRate.reduce((sum,id) => sum + calculatePriceMultiplier(restMenuForRate?.prices?.[id] ?? RECIPES[id].basePrice, RECIPES[id].basePrice), 0) / Math.max(1,menuForRate.length));
      const studentAttraction = (currentGameState.neighbors.be_bong?.level || 1) >= 2 ? 1.0375 : 1;
      const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak / discountAttraction / studentAttraction;
      const spawnRate = Math.max(500, Math.round(baseRate / ((1 + spawnRateBoost) * ratingMult)));

      spawnTimerRef.current += delta.milliseconds;
      if (spawnTimerRef.current >= spawnRate) {
        spawnTimerRef.current = 0;
        (() => {
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
          // V2: Khách hàng chỉ gọi những món nằm trong Active Menu của ngày hôm nay!
          const restMenu = currentGameState.menuSettings?.[currentRestId];
          const activeMenu =
            restMenu?.activeRecipes && restMenu.activeRecipes.length > 0
              ? restMenu.activeRecipes.filter((r) => activeRest.primaryRecipeIds.includes(r) && currentGameState.unlockedRecipes.includes(r))
              : activeRest.primaryRecipeIds.filter(r => currentGameState.unlockedRecipes.includes(r));
          const availableRecipes = activeMenu;
          if (!availableRecipes.length) return;

          const isNeighbor = Math.random() < 0.22;
          let chosenType: CustomerTypeId = 'student';
          let chosenNeighborId: NeighborId | undefined = undefined;
          let chosenRecipe: RecipeId = availableRecipes[0] || 'banh_mi_trung';
          let patienceSeconds = 45 + extraPatience;

          if (isNeighbor) {
            const neighborKeys: NeighborId[] = ['bac_ba', 'co_bay', 'chu_nam', 'be_bong', 'chi_lan'];
            chosenNeighborId = neighborKeys[Math.floor(Math.random() * neighborKeys.length)];
            const nData = NEIGHBORS_DATA[chosenNeighborId];
            chosenType = chosenNeighborId === 'be_bong' ? 'student' : chosenNeighborId === 'chi_lan' ? 'office_worker' : 'neighborhood';
            if (availableRecipes.includes(nData.favoriteDishId)) {
              chosenRecipe = nData.favoriteDishId;
            } else {
              chosenRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            }
            patienceSeconds = 55 + extraPatience;
          } else {
            const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
            const weights = typeKeys.map(type => type === 'student' && (currentGameState.neighbors.be_bong?.level || 1) >= 2 ? 1.15 : 1);
            let roll = Math.random() * weights.reduce((sum,value) => sum + value,0);
            chosenType = typeKeys[weights.findIndex(value => (roll -= value) < 0)] || 'neighborhood';
            const cType = CUSTOMER_TYPES[chosenType];
            const matched = cType.favoriteRecipeIds.filter((r) => availableRecipes.includes(r));
            if (matched.length > 0) {
              chosenRecipe = matched[Math.floor(Math.random() * matched.length)];
            } else {
              chosenRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            }
            patienceSeconds = cType.patienceSeconds + extraPatience;
          }

          const dish = RECIPES[chosenRecipe];
          const price = restMenu?.prices?.[chosenRecipe] ?? dish.basePrice;
          if (Math.random() > Math.min(1, calculatePriceMultiplier(price, dish.basePrice, chosenType))) { state.recordLostCustomer('demand'); return; }

          // Sinh biến tấu ngẫu nhiên chân thực theo từng món (Order Customization)
          const customSpec = generateOrderCustomization({
            recipeId: chosenRecipe,
            customerType: chosenType,
            neighborId: chosenNeighborId,
            stageId: simStageId,
          });

          let dialogue = customSpec.dialogueText || 'Làm nóng giòn, vừa miệng nha chủ quán!';
          if (isNeighbor && chosenNeighborId) {
            const nData = NEIGHBORS_DATA[chosenNeighborId];
            dialogue = `${nData.dialogues[currentGameState.neighbors[chosenNeighborId]?.level || 1] || nData.dialogues[1] || 'Chào chủ quán!'} ${customSpec.dialogueText || ''}`;
          }

          soundManager.playDoorBell();

          const newOrder: ActiveOrder = {
            id: Math.random().toString(36).substring(2, 9),
            tableIndex: freeTable,
            typeId: chosenType,
            neighborId: chosenNeighborId,
            dialogue,
            customTag: customSpec.customTag,
            removedIngredients: customSpec.removedIngredients,
            extraIngredients: customSpec.extraIngredients,
            orderNotes: customSpec.orderNotes,
            recipeId: chosenRecipe,
            patienceRemaining: patienceSeconds,
            maxPatience: patienceSeconds,
            state: 'waiting',
          };

          setActiveOrders((prev) => [...prev, newOrder]);
        } else state.recordLostCustomer('capacity');
        })();
      }

      // 1.5 MÔ PHỎNG CHI NHÁNH CHẠY NỀN CHÂN THỰC (V2: Có tính COGS & Quản lý điều hành)
      branchPassiveTimerRef.current += delta.milliseconds;
      if (branchPassiveTimerRef.current >= 4500) {
        branchPassiveTimerRef.current = 0;

        const unlockedRestaurants = currentGameState.unlockedRestaurants || ['banh_mi'];
        const otherBranches = unlockedRestaurants.filter((rId) => rId !== currentRestId);
        const hasChainManager = hiredList.some((e) => e.id === 'emp_quan');

        for (const branchId of otherBranches) {
          const branchStaff = hiredList.filter(
            (e) => (e.assignedRestaurantId || 'banh_mi') === branchId
          );

          const branchLevels: Record<string, number> = currentGameState.branchLevels || {};
          const branchLvl = branchLevels[branchId] || 1;
          const bMenu = currentGameState.menuSettings?.[branchId];

          // BUG 2, BUG 3, BUG 5 FIXED & NÂNG CẤP V2: Mô phỏng có tính đầy đủ Cook, Server, Manager và COGS
          const simResult = simulatePassiveBranchTick({
            restaurantId: branchId,
            branchLevel: branchLvl,
            branchStaff,
            marketPrices: currentGameState.marketPrices,
            weather: currentWeather,
            playerPrices: bMenu?.prices,
            activeRecipes: (bMenu?.activeRecipes || RESTAURANT_TYPES[branchId].primaryRecipeIds).filter(id => currentGameState.unlockedRecipes.includes(id)),
            inventory: useGameStore.getState().gameState.restaurantInventories?.[branchId] || {},
            rating: currentGameState.rating,
            hasChainManager,
          });

          if (simResult && simResult.earnedRevenue > 0) {
            recordBranchSales(
              branchId,
              simResult.earnedRevenue,
              simResult.cogsCost,
              simResult.dishName,
              simResult.recipeId,
              simResult.servedCustomers
            );

            // Thông báo định kỳ để người chơi thấy rõ chi nhánh đang bán hàng mang tiền về két
            branchToastTimerRef.current += 1;
            if (branchToastTimerRef.current >= 3) {
              branchToastTimerRef.current = 0;
              const bRest = RESTAURANT_TYPES[branchId];
              showToast(
                `🏪 Chi nhánh [${bRest?.shortName || branchId}] vừa bán ${simResult.servedCustomers} suất ${simResult.dishName} (+${simResult.earnedRevenue.toLocaleString('vi-VN')}đ)!`
              );
            }
          }
        }
      }
    }, tickMs);

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
    recordBranchSales,
  ]);
};
