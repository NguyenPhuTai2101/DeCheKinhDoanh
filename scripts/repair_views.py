from pathlib import Path
root = Path(__file__).resolve().parents[1]
def edit(file, action):
    path=root/file
    path.write_text(action(path.read_text(encoding='utf-8')),encoding='utf-8')
def summary(s):
    s=s.replace("import React, { useEffect } from 'react';", "import React, { useEffect } from 'react';\nimport { getOperatingStatement, getLiquidationOffer } from '../../../../shared/economy/operating';")
    a=s.index('  // 1. Quỹ lương nhân sự'); b=s.index('  // 6. Phân tích',a)
    s=s[:a]+'''  const statement = getOperatingStatement(gameState);
  const liquidation = getLiquidationOffer(gameState);
  const totalSalaries = statement.payroll;
  const rent = statement.rent;
  const utilities = statement.utilities;
  const spoilage = statement.spoilage;
  const cogs = statement.finance.cogs;
  const grossProfit = statement.grossProfit;
  const grossMargin = dailyRevenue > 0 ? (grossProfit / dailyRevenue) * 100 : 0;
  const netProfit = statement.netProfit;
  const netMargin = dailyRevenue > 0 ? (netProfit / dailyRevenue) * 100 : 0;

'''+s[b:]
    s=s.replace('gameState.money - fixedCosts - spoilage.spoilageCost','statement.closingCash')
    s=s.replace("onClick={() => takeEmergencyLoan('neighbor')}", "disabled={(gameState.loanDebt || 0) > 0}\n                    onClick={() => takeEmergencyLoan('neighbor')}")
    s=s.replace("onClick={() => takeEmergencyLoan('bank')}", "disabled={(gameState.loanDebt || 0) > 0}\n                    onClick={() => takeEmergencyLoan('bank')}")
    s=s.replace('onClick={() => liquidateEquipment()}', 'disabled={!liquidation}\n                    onClick={() => liquidateEquipment()}')
    s=s.replace('📦 Thanh Lý Bớt Đồ Nghề Cũ (+2.000.000đ tiền mặt)', "{liquidation ? `📦 Bán ${liquidation.title} (+${liquidation.value.toLocaleString('vi-VN')}đ, giảm 1 cấp)` : 'Không có thiết bị để thanh lý'}")
    return s.replace('💸 Dư nợ cứu trợ chưa thanh toán:', '💸 Dư nợ (trả tối đa 10 kỳ, sau chi phí ca):')
edit('client/src/components/modals/DailySummaryModal.tsx',summary)
def ledger(s):
    s=s.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { getOperatingStatement } from '../../../../shared/economy/operating';")
    a=s.index('  // Tính toán P&L');b=s.index('  // Fame',a)
    s=s[:a]+'''  const statement = getOperatingStatement(gameState);
  const fixedCosts = { rent: statement.rent, utilities: statement.utilities };
  const branchRev = statement.finance.branchRevenue || 0;
  const totalRev = statement.finance.revenue;
  const mainShopRev = totalRev - branchRev;
  const cogsToday = statement.finance.cogs;
  const grossProfitToday = statement.grossProfit;
  const grossMargin = totalRev > 0 ? Math.round(grossProfitToday / totalRev * 100) : 0;
  const tipsToday = statement.finance.tips || 0;
  const totalStaffSalaries = statement.payroll;
  const estNetProfit = statement.netProfit;

'''+s[b:]
    s=s.replace("(gameState.gameTimeMinutes % 60).toString()", "Math.floor(gameState.gameTimeMinutes % 60).toString()")
    s=s.replace('P&L Hôm Nay','Thu Chi Hôm Nay').replace('Sổ Sách & Báo Cáo Tài Chính F&B','Sổ Thu Chi').replace('Giá vốn (COGS)','Giá vốn món bán')
    # Show cash movements separately from profit; investments and loans are not meal sales.
    marker='{/* Fame'
    # place journal above the tab body rather than depending on existing section comments
    idx=s.index("      </div>\n    </div>",s.index('  return ('))
    journal='''        <details className="px-4 pb-3 text-xs text-[#7C5C55] border-t border-pink-100">
          <summary className="py-3 font-bold cursor-pointer">Dòng tiền thực · {gameState.cashJournal?.length || 0} giao dịch</summary>
          <p className="mb-2">Lợi nhuận khác tiền trong ví. Mua hàng, đầu tư và vay đều được ghi riêng.</p>
          <div className="max-h-40 overflow-y-auto space-y-2">{[...(gameState.cashJournal || [])].reverse().map((entry, i) => <div key={i} className="flex justify-between gap-3"><span>Ngày {entry.day} · {entry.label}</span><b>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString('vi-VN')}đ</b></div>)}</div>
          <p className="mt-2">Thu khác: {statement.finance.otherIncome.toLocaleString('vi-VN')}đ · Chi khác và biến cố: {(statement.finance.eventExpenses + statement.finance.otherExpense).toLocaleString('vi-VN')}đ · Hao hụt: {statement.spoilage.spoilageCost.toLocaleString('vi-VN')}đ · Trả nợ dự kiến: {statement.debtPayment.toLocaleString('vi-VN')}đ</p>
        </details>
'''
    s=s[:idx]+journal+s[idx:]
    return s
edit('client/src/components/modals/LedgerModal.tsx',ledger)
def settings(s):
    s=s.replace('await syncCloud();','const synced = await syncCloud();')
    s=s.replace("showToast('💾 Đã lưu dữ liệu cả Cục bộ (Local) và Cloud Server!');", "showToast(synced ? 'Đã lưu trên máy và đồng bộ thành công.' : 'Đã lưu trên máy. Chưa kết nối được máy chủ để đồng bộ.');")
    return s.replace('Node.js / Express DB','Máy chủ (khi kết nối)').replace('Mở Lại Màn Hình FlashScreen (Chọn Quán Khởi Nghiệp)','Xem hướng dẫn khởi nghiệp')
edit('client/src/components/modals/SettingsModal.tsx',settings)
def app(s):
    s=s.replace('    useGameStore.getState().setShowFlashScreen(false);\n','')
    return s.replace('showFlashScreen && !referenceMode','showFlashScreen')
edit('client/src/App.tsx',app)
def store(s):
    s=s.replace('levels?.storage || 0','levels?.cozy_storage || 0').replace('value?.storage || 0','value?.cozy_storage || 0')
    # Monetary results of lottery never masquerade as food sales.
    s=s.replace('dailyRevenue: state.dailyRevenue + prizeAmount,','dailyRevenue: state.gameState.dailyFinance?.revenue || 0,')
    s=s.replace('      dailyCost: state.dailyCost + betAmount,\n','')
    s=s.replace('money: gameState.money - betAmount,','money: gameState.money - betAmount,\n        dailyFinance: { ...createInitialDailyFinance(), ...gameState.dailyFinance, otherExpense: (gameState.dailyFinance?.otherExpense || 0) + betAmount },')
    s=s.replace('money: state.gameState.money - betAmount + prizeAmount,','money: state.gameState.money - betAmount + prizeAmount,\n        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance, otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + prizeAmount, otherExpense: (state.gameState.dailyFinance?.otherExpense || 0) + betAmount },')
    s=s.replace('money: state.gameState.money + prizeAmount,','money: state.gameState.money + prizeAmount,\n        dailyFinance: { ...createInitialDailyFinance(), ...state.gameState.dailyFinance, otherIncome: (state.gameState.dailyFinance?.otherIncome || 0) + prizeAmount },')
    s=s.replace('    const currentRating = gameState.rating ?? 75;\n    const newRating = lostCount', '    const currentRating = get().gameState.rating ?? 75;\n    const newRating = lostCount')
    s=s.replace('    const newReputation = Math.max(0, (gameState.reputation || 0) - (lostCount > 0 ? 1 : 0));\n','').replace('    const newFame = Math.max(0, (gameState.fame ?? gameState.reputation ?? 0) - (lostCount > 0 ? 1 : 0));\n','')
    return s
edit('client/src/store/gameStore.ts',store)
