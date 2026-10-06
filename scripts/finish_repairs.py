from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(file, action):
    p=root/file;p.write_text(action(p.read_text(encoding='utf-8')),encoding='utf-8')
def hook(s):
    a=s.index('        useGameStore.setState((s) => {',s.index('// Cập nhật nguyên liệu & tiền'))
    b=s.index('\n      }',a)
    s=s[:a]+'''        state.commitKitchenChanges(updatedInventory, consumedCost, moneySpentOnShopping);'''+s[b:]
    # Hourly peaks affect arrival capacity, not a hidden instant difficulty jump.
    s=s.replace('const baseRate = currentStage.customerRateMs * weatherSpawnDelay;', "const hour = Math.floor(currentGameState.gameTimeMinutes / 60);\n      const peak = hour >= 11 && hour < 14 ? 1.3 : hour >= 17 && hour < 20 ? 1.15 : 0.85;\n      const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak;")
    return s
edit('client/src/hooks/useGameSimulation.ts',hook)
def store(s):
    s=s.replace('      grossProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + dishCOGS),', '      grossProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + (order?.cogsBooked ? 0 : dishCOGS)),')
    s=s.replace('      netProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + dishCOGS)', '      netProfit: (currentFinance.revenue + totalEarned) - (currentFinance.cogs + (order?.cogsBooked ? 0 : dishCOGS))')
    s=s.replace("      isShopOpen: false,\n      activeOrders: [],\n    });\n    get().showToast(`🌱", "      isShopOpen: false, activeOrders: [], deliveryOrders: [], activeIncident: null,\n      dailyRevenue: 0, dailyCost: 0, dailyCustomersServed: 0, dailyCustomersLost: 0,\n      isDailySummaryShown: false, dailyEventsCount: 0, lastEventTimeMinutes: 0, hasIncidentTriggeredToday: false,\n      activeModal: null,\n    });\n    get().showToast(`🌱")
    return s
edit('client/src/store/gameStore.ts',store)
def menu(s):
    s=s.replace("    openModal(modal);", "    if (modal === 'dailySummary') useGameStore.getState().forceCloseStoreTonight();\n    else openModal(modal);")
    return s
edit('client/src/components/modals/MenuMoreDrawer.tsx',menu)
def tests(s):
    a=s.index("    it('TC_STR_07:");b=s.index("    it('TC_STR_08:",a)
    s=s[:a]+'''    it('TC_STR_07: Chỉ thanh lý thiết bị đã mua và giảm một cấp', () => {
      useGameStore.setState(s => ({ gameState: { ...s.gameState, money: 1000000 } }));
      expect(useGameStore.getState().purchaseUpgrade('cozy_storage')).toBe(true);
      const before = useGameStore.getState().gameState.money;
      expect(useGameStore.getState().liquidateEquipment()).toBe(true);
      expect(useGameStore.getState().gameState.money).toBeGreaterThan(before);
      expect(useGameStore.getState().gameState.stageUpgrades?.cart?.cozy_storage).toBe(0);
      expect(useGameStore.getState().liquidateEquipment()).toBe(false);
    });

'''+s[b:]
    s=s.replace('      store.endDayAndSleep();', '      store.openStoreForDay();\n      store.endDayAndSleep();')
    s=s.replace('expect(state.gameState.money).toBe(initialMoney + 120000);','expect(state.gameState.money).toBe(initialMoney + 120000 - 48000);')
    return s
edit('client/src/__tests__/gameStore.test.ts',tests)
def delivery_tests(s):
    s=s.replace('      const state = useGameStore.getState();\n      expect(state.gameState.money).toBeGreaterThan(100000);', '''      expect(useGameStore.getState().gameState.money).toBe(100000);
      expect(useGameStore.getState().fulfillDeliveryOrder('deliv_1')).toBe(false);
      useGameStore.getState().tickDeliveries(10);
      expect(useGameStore.getState().deliveryOrders[0].status).toBe('ready');
      expect(useGameStore.getState().fulfillDeliveryOrder('deliv_1')).toBe(true);
      useGameStore.getState().tickDeliveries(12);
      const state = useGameStore.getState();
      expect(state.gameState.money).toBeGreaterThan(100000);''')
    s=s.replace('      deliveryOrders: [],\n      isShopOpen:', '      deliveryOrders: [], activeOrders: [], dailyRevenue: 0, dailyCost: 0, dailyCustomersServed: 0,\n      isShopOpen:')
    return s
edit('client/src/__tests__/deliveryAndIncidents.test.ts',delivery_tests)
