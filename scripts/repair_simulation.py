from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'client/src/store/gameStore.ts'
s=p.read_text(encoding='utf-8')
s=s.replace('  fulfillDeliveryOrder: (orderId: string) => boolean;', '  fulfillDeliveryOrder: (orderId: string) => boolean;\n  tickDeliveries: (seconds: number) => void;')
s=s.replace('recordBranchSales: (restaurantId: RestaurantTypeId, revenue: number, cogs: number, dishName: string) => void;', 'recordBranchSales: (restaurantId: RestaurantTypeId, revenue: number, cogs: number, dishName: string, recipeId?: RecipeId, quantity?: number) => void;')
s=s.replace("import { evaluateDishMatch }", "import { calculateCookEfficiency } from '../../../shared/simulation/employees';\nimport { calculateCookSpeedBoost } from '../../../shared/gameData';\nimport { evaluateDishMatch }")
s=s.replace('recordBranchSales: (restaurantId, revenue, cogs, dishName) => {', 'recordBranchSales: (restaurantId, revenue, cogs, dishName, recipeId, quantity = 1) => {')
a=s.index('  recordBranchSales: (restaurantId,');b=s.index('  // === V2: MENU',a)
part=s[a:b]
part=part.replace('    // Cập nhật DailyFinance', '''    if (!Number.isFinite(revenue) || revenue < 0 || !Number.isFinite(cogs) || cogs < 0 || quantity <= 0) return;
    const inventory = { ...(restaurantId === gameState.activeRestaurantId ? gameState.inventory : gameState.restaurantInventories?.[restaurantId]) };
    if (recipeId) {
      const needs: Record<string, number> = {};
      RECIPES[recipeId].requiredIngredients.forEach(id => { needs[id] = (needs[id] || 0) + quantity; });
      if (Object.entries(needs).some(([id, count]) => (inventory[id as IngredientId] || 0) < count)) return;
      Object.entries(needs).forEach(([id, count]) => { inventory[id as IngredientId] = (inventory[id as IngredientId] || 0) - count; });
    }

    // Cập nhật DailyFinance''')
part=part.replace('revenue: currentFinance.revenue + revenue,','revenue: currentFinance.revenue + revenue,\n      branchRevenue: (currentFinance.branchRevenue || 0) + revenue,')
part=part.replace('customersServed: branchFin.customersServed + 1','customersServed: branchFin.customersServed + quantity').replace('totalCustomers: metrics.totalCustomers + 1','totalCustomers: metrics.totalCustomers + quantity').replace('dailyCustomersServed: state.dailyCustomersServed + 1','dailyCustomersServed: state.dailyCustomersServed + quantity')
part=part.replace('money: state.gameState.money + revenue,', '''money: state.gameState.money + revenue - (recipeId ? 0 : cogs),
        ...(recipeId ? { restaurantInventories: { ...state.gameState.restaurantInventories, [restaurantId]: inventory }, ...(restaurantId === state.gameState.activeRestaurantId ? { inventory } : {}) } : {}),''')
s=s[:a]+part+s[b:]
s=s.replace("    const baseRev = recipe.basePrice * qty;", "    const baseRev = (gameState.menuSettings?.[activeRestId]?.prices?.[chosenRecipeId] ?? recipe.basePrice) * qty;")
s=s.replace("      gameState.unlockedRecipes.includes(rId)\n    );", "      gameState.unlockedRecipes.includes(rId) && (gameState.menuSettings?.[activeRestId]?.activeRecipes || currentRest.primaryRecipeIds).includes(rId)\n    );",1)
s=s.replace('availableRecipes.length > 0 ? availableRecipes : currentRest.primaryRecipeIds;', 'availableRecipes;\n    if (!candidateRecipes.length) return;')
a=s.index('  fulfillDeliveryOrder: (orderId) => {');b=s.index('  cancelDeliveryOrder:',a)
s=s[:a]+'''  fulfillDeliveryOrder: (orderId) => {
    const state = get();
    const game = state.gameState;
    const order = state.deliveryOrders.find(o => o.id === orderId);
    if (!order || order.timeRemainingSeconds <= 0 || !state.isShopOpen) return false;
    if (order.status === 'ready') {
      set({ deliveryOrders: state.deliveryOrders.map(o => o.id === orderId ? { ...o, status: 'delivering', workRemainingSeconds: 12 } : o) });
      get().saveLocal();
      return true;
    }
    if (order.status !== 'pending') return false;
    const recipe = RECIPES[order.recipeId];
    const busy = new Set([...state.activeOrders.filter(o => o.state === 'cooking').map(o => o.chefId || 'player'), ...state.deliveryOrders.filter(o => o.status === 'cooking').map(o => o.chefId || 'player')]);
    const chef = game.hiredEmployees.map(id => game.employeeDetails[id] || EMPLOYEES.find(e => e.id === id)).find(e => e && ['cook','manager'].includes(e.role) && (e.assignedRestaurantId || 'banh_mi') === (game.activeRestaurantId || 'banh_mi') && !busy.has(e.id));
    if (!chef && busy.has('player')) { get().showToast('Bếp đang bận. Hoàn tất món hiện tại trước khi nhận đơn ship.'); return false; }
    const needs: Partial<Record<IngredientId, number>> = {};
    recipe.requiredIngredients.forEach(id => { needs[id] = (needs[id] || 0) + order.quantity; });
    if (Object.entries(needs).some(([id, count]) => (game.inventory[id as IngredientId] || 0) < count!)) { get().showToast('Không đủ nguyên liệu cho toàn bộ đơn giao.'); return false; }
    if (!chef && !get().consumeEnergy(order.quantity * 3)) return false;
    const inventory = { ...game.inventory };
    Object.entries(needs).forEach(([id, count]) => { inventory[id as IngredientId] = (inventory[id as IngredientId] || 0) - count!; });
    const cogs = recipe.requiredIngredients.reduce((sum, id) => sum + getIngredientCurrentPrice(id, game.marketPrices), 0) * order.quantity;
    const levels = game.stageUpgrades?.[game.businessStage] || game.purchasedUpgrades;
    const speed = chef ? calculateCookEfficiency(chef).speedMultiplier : 1;
    const work = recipe.cookingTimeMs / 1000 * order.quantity / speed / (1 + calculateCookSpeedBoost(game.businessStage, levels, game.stageUpgrades));
    set(current => ({ deliveryOrders: current.deliveryOrders.map(o => o.id === orderId ? { ...o, status: 'cooking', chefId: chef?.id, chefName: chef?.name || 'Bạn', workRemainingSeconds: work, cogs, shippingFee: Math.round(o.rewardMoney * 0.1) } : o),
      gameState: { ...current.gameState, inventory, restaurantInventories: { ...current.gameState.restaurantInventories, [game.activeRestaurantId || 'banh_mi']: inventory },
        dailyFinance: { ...createInitialDailyFinance(), ...current.gameState.dailyFinance, cogs: (current.gameState.dailyFinance?.cogs || 0) + cogs } } }));
    get().showToast('Đã nhận đơn và đưa vào bếp. Đóng cửa sổ để tiếp tục ca bán.');
    get().saveLocal();
    return true;
  },

  tickDeliveries: (seconds) => {
    if (seconds <= 0 || !Number.isFinite(seconds) || !get().isShopOpen) return;
    for (const original of [...get().deliveryOrders]) {
      const state = get();
      const order = state.deliveryOrders.find(o => o.id === original.id);
      if (!order) continue;
      const timeRemainingSeconds = order.timeRemainingSeconds - seconds;
      const workRemainingSeconds = Math.max(0, (order.workRemainingSeconds || 0) - seconds);
      if (timeRemainingSeconds <= 0) {
        set(current => ({ deliveryOrders: current.deliveryOrders.filter(o => o.id !== order.id), dailyCustomersLost: current.dailyCustomersLost + 1,
          gameState: { ...current.gameState, reputation: Math.max(0, current.gameState.reputation - 1), fame: Math.max(0, (current.gameState.fame ?? current.gameState.reputation) - 1) } }));
        get().showToast(`Đơn ${order.customerName} quá hạn. Nguyên liệu đã chế biến không được hoàn lại.`);
        continue;
      }
      if (order.status === 'delivering' && workRemainingSeconds <= 0) {
        const revenue = order.rewardMoney + order.rewardTip;
        const fee = order.shippingFee || 0;
        set(current => ({ dailyRevenue: (current.gameState.dailyFinance?.revenue || 0) + revenue,
          dailyCustomersServed: current.dailyCustomersServed + order.quantity,
          deliveryOrders: current.deliveryOrders.filter(o => o.id !== order.id),
          gameState: { ...current.gameState, money: current.gameState.money + revenue - fee,
            totalDeliveriesCompleted: (current.gameState.totalDeliveriesCompleted || 0) + 1,
            reputation: current.gameState.reputation + 1, fame: (current.gameState.fame ?? current.gameState.reputation) + 1,
            dailyFinance: { ...createInitialDailyFinance(), ...current.gameState.dailyFinance, revenue: (current.gameState.dailyFinance?.revenue || 0) + revenue,
              tips: (current.gameState.dailyFinance?.tips || 0) + order.rewardTip, deliveryFees: (current.gameState.dailyFinance?.deliveryFees || 0) + fee } } }));
        get().serveNeighborGuest('chu_nam');
        get().showToast(`Giao thành công: +${(revenue - fee).toLocaleString('vi-VN')}đ sau phí ship.`);
        get().saveLocal();
      } else {
        const status = order.status === 'cooking' && workRemainingSeconds <= 0 ? 'ready' as const : order.status;
        set(current => ({ deliveryOrders: current.deliveryOrders.map(o => o.id === order.id ? { ...o, timeRemainingSeconds, workRemainingSeconds, status } : o) }));
      }
    }
  },

'''+s[b:]
# Preserve the consumed cost for canceled/failed delivery; inventory was already paid for.
s=s.replace("    const pointsEarned = Math.max(15, Math.floor(gameState.day * 3));", "    if (gameState.financialHealth !== 'bankrupt') { get().showToast('Di sản chỉ được kế thừa khi hành trình đã phá sản.'); return; }\n    const pointsEarned = Math.max(1, Math.floor((gameState.businessMetrics?.lifetimeRevenue || 0) / 1000000) + (gameState.unlockedRestaurants?.length || 1) * 3);")
p.write_text(s,encoding='utf-8')

p=root/'client/src/hooks/useGameSimulation.ts'
s=p.read_text(encoding='utf-8')
s=s.replace("import { generateOrderCustomization }", "import { calculateCookEfficiency, calculateServerEfficiency } from '../../../shared/simulation/employees';\nimport { getOrderIngredients, evaluateDishMatch } from '../../../shared/simulation/orders';\nimport { calculatePriceMultiplier } from '../../../shared/economy/demand';\nimport { generateOrderCustomization }")
s=s.replace('      const state = useGameStore.getState();', '      if (!useGameStore.getState().isShopOpen || useGameStore.getState().activeModal || useGameStore.getState().activeIncident) return;\n      const state = useGameStore.getState();',1)
s=s.replace('      tickTime(1.25 * timeSpeed);','      tickTime(1.25 * timeSpeed);\n      if (!useGameStore.getState().isShopOpen || useGameStore.getState().activeModal) return;')
s=s.replace('    }, tickMs / timeSpeed);','    }, tickMs);')
s=s.replace(".map((o) => o.chefId!)", ".map((o) => o.chefId!)\n          .concat(state.deliveryOrders.filter(o => o.status === 'cooking' && o.chefId).map(o => o.chefId!))",1)
s=s.replace(".map((o) => o.chefId || o.serverId)", ".map((o) => o.state === 'cooking' ? o.chefId : o.serverId)")
s=s.replace('const freeManagers = managers.filter((m) => !busyManagerIds.has(m.id));','const freeManagers = managers.filter((m) => !busyManagerIds.has(m.id) && !busyCookIds.has(m.id));')
s=s.replace('const bestShopper = shoppers[0];', "const bestShopper = shoppers.filter(e => e.role === 'shopper' || freeManagers.some(m => m.id === e.id)).sort((a,b) => (b.marketSkill || 0) - (a.marketSkill || 0))[0];\n        if (!bestShopper) autoShopCooldownRef.current = 0;")
s=s.replace("if (autoShopCooldownRef.current >= shopperInterval)", "if (bestShopper && autoShopCooldownRef.current >= shopperInterval)")
s=s.replace('(bestShopper.speed || 1.2)', '(bestShopper?.speed || 1.2)')
s=s.replace("const neededIngs = currentRest?.allowedIngredientIds || [];", "const neededIngs = [...new Set((currentGameState.menuSettings?.[currentRestId]?.activeRecipes || currentRest?.primaryRecipeIds || []).filter(id => currentGameState.unlockedRecipes.includes(id)).flatMap(id => RECIPES[id].requiredIngredients))];")
s=s.replace("                newActionStatuses[bestShopper.id] = 'shopping';", "                newActionStatuses[bestShopper.id] = 'shopping';\n                const index = freeManagers.findIndex(m => m.id === bestShopper.id);\n                if (index >= 0) freeManagers.splice(index, 1);")
s=s.replace("            const hasStock = recipe.requiredIngredients.every(\n              (ingId) => (updatedInventory[ingId] || 0) > 0\n            );", "            const ingredients = getOrderIngredients(order);\n            const hasStock = ingredients.every(id => (updatedInventory[id] || 0) >= ingredients.filter(value => value === id).length);")
s=s.replace('              recipe.requiredIngredients.forEach((ingId) => {','              ingredients.forEach((ingId) => {')
s=s.replace("                cookingProgress: 5,", "                cookingProgress: 0,\n                preparedIngredients: ingredients,\n                ...evaluateDishMatch({ recipeId: order.recipeId, order, preparedIngredients: ingredients }),")
s=s.replace("(cook?.speed || 1.0) * (0.8 + (cookSkill / 100) * 0.4) * managerBoost", "(cook ? calculateCookEfficiency(cook).speedMultiplier : 1) * managerBoost")
s=s.replace('/ cookSpeed / timeSpeed','/ cookSpeed')
s=s.replace('const progressDelta = (tickMs / cookingDurationMs)', 'const progressDelta = (tickMs * timeSpeed / cookingDurationMs)')
s=s.replace('const eatDuration = 10; // 10 giây thong thả ngồi ăn tại bàn', 'const eatDuration = 10 / calculateServerEfficiency(assignedServer).speedMultiplier;')
s=s.replace("              serveNeighborGuest(order.neighborId);", "              serveNeighborGuest(order.neighborId);")
s=s.replace('            if (hasTuan) tip =', "            const server = hiredList.find(e => e.id === order.serverId);\n            if (server) tip = Math.round(tip * (1 + calculateServerEfficiency(server).tipBonusRate));\n            if (hasTuan) tip =")
# Timers retain 1x real-second semantics; all deadlines advance once per shared delta.
s=s.replace('      // 1.4 Sinh khách hàng', '      state.tickDeliveries(tickMs / 1000 * timeSpeed);\n\n      // 1.4 Sinh khách hàng')
s=s.replace("? restMenu.activeRecipes.filter((r) => activeRest.primaryRecipeIds.includes(r))", "? restMenu.activeRecipes.filter((r) => activeRest.primaryRecipeIds.includes(r) && currentGameState.unlockedRecipes.includes(r))")
s=s.replace(': activeRest.primaryRecipeIds;\n          const availableRecipes = activeMenu.length > 0 ? activeMenu : activeRest.primaryRecipeIds;', ': activeRest.primaryRecipeIds.filter(r => currentGameState.unlockedRecipes.includes(r));\n          const availableRecipes = activeMenu;\n          if (!availableRecipes.length) return;')
s=s.replace("          // Sinh biến tấu ngẫu nhiên", "          const dish = RECIPES[chosenRecipe];\n          const price = restMenu?.prices?.[chosenRecipe] ?? dish.basePrice;\n          if (Math.random() > Math.min(1, calculatePriceMultiplier(price, dish.basePrice, chosenType))) return;\n\n          // Sinh biến tấu ngẫu nhiên")
s=s.replace("nData.dialogues[1] || 'Chào chủ quán!'", "nData.dialogues[Math.min((currentGameState.neighbors[chosenNeighborId]?.level || 1) - 1, nData.dialogues.length - 1)] || 'Chào chủ quán!'")
s=s.replace('            activeRecipes: bMenu?.activeRecipes,', '            activeRecipes: (bMenu?.activeRecipes || RESTAURANT_TYPES[branchId].primaryRecipeIds).filter(id => currentGameState.unlockedRecipes.includes(id)),\n            inventory: useGameStore.getState().gameState.restaurantInventories?.[branchId] || {},\n            rating: currentGameState.rating,')
s=s.replace('              simResult.dishName\n', '              simResult.dishName,\n              simResult.recipeId,\n              simResult.servedCustomers\n')
p.write_text(s,encoding='utf-8')
