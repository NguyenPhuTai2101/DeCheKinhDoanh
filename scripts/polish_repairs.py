from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(file, action):
    p=root/file;p.write_text(action(p.read_text(encoding='utf-8')),encoding='utf-8')
def hook(s):
    s=s.replace('        spawnTimerRef.current = 0;\n\n        if (nextOrders.length', '        spawnTimerRef.current = 0;\n        (() => {\n        if (nextOrders.length')
    s=s.replace('          setActiveOrders((prev) => [...prev, newOrder]);\n        }\n      }', "          setActiveOrders((prev) => [...prev, newOrder]);\n        } else state.recordLostCustomer('capacity');\n        })();\n      }")
    s=s.replace('if (Math.random() > Math.min(1, calculatePriceMultiplier(price, dish.basePrice, chosenType))) return;', "if (Math.random() > Math.min(1, calculatePriceMultiplier(price, dish.basePrice, chosenType))) { state.recordLostCustomer('demand'); return; }")
    s=s.replace('const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak;', "const restMenuForRate = currentGameState.menuSettings?.[currentRestId];\n      const menuForRate = (restMenuForRate?.activeRecipes || RESTAURANT_TYPES[currentRestId].primaryRecipeIds).filter(id => currentGameState.unlockedRecipes.includes(id));\n      const discountAttraction = Math.max(1, menuForRate.reduce((sum,id) => sum + calculatePriceMultiplier(restMenuForRate?.prices?.[id] ?? RECIPES[id].basePrice, RECIPES[id].basePrice), 0) / Math.max(1,menuForRate.length));\n      const baseRate = currentStage.customerRateMs * weatherSpawnDelay / peak / discountAttraction;")
    return s
edit('client/src/hooks/useGameSimulation.ts',hook)
for p in (root/'client/src/components/modals').glob('*.tsx'):
    s=p.read_text(encoding='utf-8')
    def button(m):
        text=m.group(0)
        return text.replace('<button','<button aria-label="Đóng cửa sổ"',1) if '<X ' in text and 'aria-label=' not in text else text
    s=re.sub(r'<button\b[\s\S]*?</button>',button,s)
    if 'game-modal-panel' in s and 'role="dialog"' not in s:
        s=s.replace('<div className="game-modal-panel', f'<div role="dialog" aria-modal="true" aria-label="{p.stem.replace("Modal","")}" className="game-modal-panel',1)
    s=s.replace('✨ Tiền boa từ khách hài lòng (Tips):','✨ Tiền boa (đã gồm trong doanh thu):')
    p.write_text(s,encoding='utf-8')
def reference(s):
    s=s.replace("<b title={g.shopName}>{g.shopName || 'Bánh Mì'}</b><span className=\"bm-level\">Lv.{g.player.cookingLevel}</span>", "<span className=\"bm-brand-copy\"><b title={g.shopName}>{g.shopName || 'Bánh Mì'}</b><small>Lv.{g.player.cookingLevel}</small></span>")
    return s
edit('client/src/components/views/ReferenceShopView.tsx',reference)
def store(s):
    s=s.replace('newStress = Math.min(100, (emp.stress || 15)', 'newStress = Math.min(100, (emp.stress ?? 15)').replace('(emp.mood || 85)', '(emp.mood ?? 85)')
    s=s.replace('dailyCustomersServed: 0, dailyCustomersLost: 0,\n      isDailySummaryShown:', 'dailyCustomersServed: 0, dailyCustomersLost: 0, lossReasons:{ inventory:0, capacity:0, demand:0 },\n      isDailySummaryShown:')
    s=s.replace('      activeOrders: [], deliveryOrders: [], activeIncident: null, employeeActionStatus: {}, showFlashScreen: true,', '      activeOrders: [], deliveryOrders: [], activeIncident: null, employeeActionStatus: {}, showFlashScreen: true, lossReasons:{ inventory:0, capacity:0, demand:0 },')
    return s
edit('client/src/store/gameStore.ts',store)
