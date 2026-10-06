from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(file, action):
    p=root/file;p.write_text(action(p.read_text(encoding='utf-8')),encoding='utf-8')
def hook(s):
    s=s.replace('const ingredients = getOrderIngredients(order);','let ingredients = getOrderIngredients(order);')
    s=s.replace("const isManagerCooking = assignedChef.role === 'manager';", "const isManagerCooking = assignedChef.role === 'manager';\n              const efficiency = calculateCookEfficiency(assignedChef);\n              if (efficiency.mistakeRisk > 0 && Math.random() < efficiency.mistakeRisk) { ingredients = ingredients.slice(0,-1); showToast(`${assignedChef.name} đang căng thẳng và bỏ sót nguyên liệu. Cân nhắc thưởng hoặc nghỉ sau ca.`); }")
    s=s.replace("const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak / discountAttraction;", "const studentAttraction = (currentGameState.neighbors.be_bong?.level || 1) >= 2 ? 1.0375 : 1;\n      const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak / discountAttraction / studentAttraction;")
    s=s.replace('            const nData = NEIGHBORS_DATA[chosenNeighborId];\n            if (availableRecipes', "            const nData = NEIGHBORS_DATA[chosenNeighborId];\n            chosenType = chosenNeighborId === 'be_bong' ? 'student' : chosenNeighborId === 'chi_lan' ? 'office_worker' : 'neighborhood';\n            if (availableRecipes")
    s=s.replace('            chosenType = typeKeys[Math.floor(Math.random() * typeKeys.length)];', "            const weights = typeKeys.map(type => type === 'student' && (currentGameState.neighbors.be_bong?.level || 1) >= 2 ? 1.15 : 1);\n            let roll = Math.random() * weights.reduce((sum,value) => sum + value,0);\n            chosenType = typeKeys[weights.findIndex(value => (roll -= value) < 0)] || 'neighborhood';")
    return s
edit('client/src/hooks/useGameSimulation.ts',hook)
def old_delivery(s):
    return s.replace('gameState: JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),', 'gameState: { ...structuredClone(INITIAL_GAME_STATE), player:{ ...INITIAL_GAME_STATE.player,cookingLevel:2 } },')
edit('client/src/__tests__/deliveryAndIncidents.test.ts',old_delivery)
def integration(s):
    s=s.replace('isShopOpen:false, isDailySummaryShown:', 'lossReasons:{ inventory:0,capacity:0,demand:0 }, isShopOpen:false, isDailySummaryShown:')
    s=s.replace("    useGameStore.getState().spawnDeliveryOrder();\n    const order = useGameStore.getState().deliveryOrders[0];", "    useGameStore.setState(s => ({ gameState:{ ...s.gameState,player:{ ...s.gameState.player,cookingLevel:2 } } }));\n    useGameStore.getState().openStoreForDay();\n    useGameStore.getState().spawnDeliveryOrder();\n    const order = useGameStore.getState().deliveryOrders[0];")
    return s
edit('client/src/__tests__/operatingIntegration.test.ts',integration)
