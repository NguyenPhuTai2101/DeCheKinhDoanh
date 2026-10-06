import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES } from '../../../../shared/gameData';
import {
  calculateStageFixedCosts,
  generateDailyInsights,
  calculateBottleneck,
  calculate3DayCashflowForecast,
  evaluateFinancialHealth,
  calculateDailySpoilage,
} from '../../../../shared/economy/finance';
import confetti from 'canvas-confetti';
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  X,
  Building,
  Lightbulb,
  Star,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Clock,
  ArrowRight,
  Coins,
  Flame,
  Package,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const DailySummaryModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    dailyRevenue,
    dailyCost,
    dailyCustomersServed,
    dailyCustomersLost,
    endDayAndSleep,
    takeEmergencyLoan,
    liquidateEquipment,
    resetGameWithLegacy,
  } = useGameStore();

  // 1. Quỹ lương nhân sự
  let totalSalaries = 0;
  for (const empId of gameState.hiredEmployees) {
    const emp = gameState.employeeDetails[empId] || EMPLOYEES.find((e) => e.id === empId);
    if (emp) totalSalaries += emp.salaryPerDay;
  }

  // 2. Chi phí cố định (Mặt bằng + Điện nước/vận hành)
  const stageCosts = calculateStageFixedCosts(gameState.businessStage || 'cart');
  const rent = stageCosts.rent;
  const utilities = stageCosts.utilities;

  // 3. Hao hụt nguyên liệu tươi cuối ngày (Daily Spoilage)
  const spoilage = calculateDailySpoilage({
    inventory: gameState.inventory,
    fridgeLevel: gameState.fridgeUpgradeLevel || 0,
  });

  // 4. Giá vốn thực tế (COGS) & Lợi nhuận gộp
  const cogs =
    gameState.dailyFinance && gameState.dailyFinance.cogs > 0
      ? gameState.dailyFinance.cogs
      : dailyCost;
  const grossProfit = dailyRevenue - cogs;
  const grossMargin = dailyRevenue > 0 ? (grossProfit / dailyRevenue) * 100 : 0;

  // 5. Lợi nhuận ròng (Net Profit) - trừ cả chi phí hao hụt
  const netProfit = grossProfit - totalSalaries - rent - utilities - spoilage.spoilageCost;
  const netMargin = dailyRevenue > 0 ? (netProfit / dailyRevenue) * 100 : 0;

  // 6. Phân tích Nút Cổ Chai (Bottleneck: Cầu - Năng lực - Tồn kho)
  const bottleneck = calculateBottleneck({
    servedCount: dailyCustomersServed,
    lostCount: dailyCustomersLost,
    capacityBottleneckCount: dailyCustomersLost,
    revenue: dailyRevenue,
    reputation: gameState.reputation || 0,
  });

  // 7. Dự báo dòng tiền 3 ngày tới
  const fixedCosts = totalSalaries + rent + utilities;
  const currentMoneyAfterCosts = gameState.money - fixedCosts - spoilage.spoilageCost;
  const projectedCashflow = calculate3DayCashflowForecast({
    currentMoney: currentMoneyAfterCosts,
    dailyNetProfit: netProfit,
    fixedCostsPerDay: fixedCosts,
  });

  // 8. Đánh giá 5 mức Sức khỏe Tài chính
  const nextCrisisDays = currentMoneyAfterCosts <= 0 ? (gameState.consecutiveCrisisDays || 0) + 1 : 0;
  const health = evaluateFinancialHealth({
    currentMoney: currentMoneyAfterCosts,
    dailyFixedCost: fixedCosts,
    loanDebt: gameState.loanDebt || 0,
    consecutiveCrisisDays: nextCrisisDays,
  });

  // 9. Smart Insights
  const insights = generateDailyInsights({
    finance: {
      ...(gameState.dailyFinance || {
        revenue: dailyRevenue,
        cogs,
        grossProfit,
        payroll: totalSalaries,
        rent,
        utilities,
        marketing: 0,
        deliveryFees: 0,
        eventExpenses: 0,
        otherIncome: 0,
        otherExpense: 0,
        netProfit,
      }),
      revenue: dailyRevenue,
      cogs,
      grossProfit,
      payroll: totalSalaries,
      rent,
      utilities,
      netProfit,
    },
    servedCount: dailyCustomersServed,
    lostCount: dailyCustomersLost,
    averageRating: gameState.rating ?? 75,
  });

  useEffect(() => {
    if (netProfit > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F7A8C4', '#FFD6E5', '#BFE3D0', '#FFE6A7'],
      });
    }
  }, [netProfit]);

  const weather = gameState.weather || 'sunny';
  const weatherInfo = {
    sunny: { icon: '☀️', name: 'Nắng Ráo', desc: 'Đồ uống mát lạnh được khách chuộng, tip tăng thêm!' },
    rainy: { icon: '🌧️', name: 'Mưa Rào', desc: 'Khách ngồi lại chậm nhưng đơn ship mang đi tăng vọt!' },
    breezy: { icon: '🍃', name: 'Gió Mát Lành', desc: 'Khách thoải mái, kiên nhẫn hơn và hào phóng thưởng tip!' },
  }[weather];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50 animate-fade-in select-none">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFCCD9] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-5 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌙</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">
                Báo Cáo Tài Chính & Tổng Kết Ngày {gameState.day}
              </h2>
              <p className="text-xs text-[#9C7C75]">
                Báo cáo kết quả hoạt động kinh doanh (P&L) F&B chuẩn mực
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung thống kê */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Thời tiết & Khí hậu hôm nay */}
          <div className="bg-[#FFF5F8] p-2.5 rounded-2xl border border-[#FFCCD9] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weatherInfo.icon}</span>
              <div>
                <div className="font-black text-[#5C3A33]">
                  Khí hậu hôm nay: <span className="text-[#FF6584]">{weatherInfo.name}</span>
                </div>
                <div className="text-[10px] text-[#8C6258]">{weatherInfo.desc}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-white rounded-xl text-[9.5px] font-black text-[#5C3A33] border border-[#FFD0DE] shadow-2xs shrink-0">
              {gameState.shopName}
            </span>
          </div>

          {/* Bảng báo cáo P&L (Doanh thu -> Giá vốn -> Chi phí -> Lợi nhuận) */}
          <div className="bg-white rounded-2xl p-3.5 border-2 border-[#FFCCD9] shadow-2xs space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#5C3A33] pb-1.5 border-b border-dashed border-[#FFCCD9]">
              <span className="font-extrabold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tổng Doanh Thu (Revenue):</span>
              </span>
              <span className="font-black text-sm text-emerald-600">
                +{dailyRevenue.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex justify-between items-center text-[#5C3A33] pb-1.5 border-b border-dashed border-[#FFCCD9]">
              <span className="font-extrabold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                <span>Giá Vốn Hàng Bán (COGS):</span>
              </span>
              <span className="font-bold text-rose-600">
                -{cogs.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex justify-between items-center bg-emerald-50/70 px-2 py-1 rounded-xl text-emerald-950 font-black">
              <span>Lợi Nhuận Gộp (Gross Profit - {grossMargin.toFixed(1)}%):</span>
              <span className="text-emerald-700 font-black">
                {grossProfit >= 0 ? '+' : ''}{grossProfit.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex justify-between items-center text-[#5C3A33] pt-1">
              <span className="font-medium flex items-center gap-1.5 text-[11px]">
                <Users className="w-3 h-3 text-purple-500" />
                <span>Quỹ Lương Nhân Viên ({gameState.hiredEmployees.length} người):</span>
              </span>
              <span className="font-bold text-purple-700 text-[11px]">
                -{totalSalaries.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {rent > 0 && (
              <div className="flex justify-between items-center text-[#5C3A33]">
                <span className="font-medium flex items-center gap-1.5 text-[11px]">
                  <Building className="w-3 h-3 text-blue-500" />
                  <span>Thuê Mặt Bằng (Rent):</span>
                </span>
                <span className="font-bold text-blue-700 text-[11px]">
                  -{rent.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            {utilities > 0 && (
              <div className="flex justify-between items-center text-[#5C3A33]">
                <span className="font-medium flex items-center gap-1.5 text-[11px]">
                  <span>⚡</span>
                  <span>Điện Nước & Vận Hành (Utilities):</span>
                </span>
                <span className="font-bold text-slate-700 text-[11px]">
                  -{utilities.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            {spoilage.spoilageCost > 0 && (
              <div className="flex justify-between items-center text-rose-800 bg-rose-50/80 px-2 py-1 rounded-lg">
                <span className="font-medium flex items-center gap-1 text-[11px]">
                  <span>🍂</span>
                  <span>Hao Hụt Tự Nhiên Cuối Ngày (Spoilage):</span>
                </span>
                <span className="font-bold text-rose-600 text-[11px]">
                  -{spoilage.spoilageCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            <div className={`flex justify-between items-center p-2.5 rounded-xl border mt-2 font-black ${
              netProfit >= 0 ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950' : 'bg-rose-100/70 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-1.5">
                <TrendingUp className={`w-4 h-4 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                <span>Lợi Nhuận Ròng (Net Profit):</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black">
                  {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[9.5px] block font-bold opacity-80">
                  Biên ròng: {netMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Phục vụ khách hàng, Rating & Danh tiếng Fame */}
          <div className="bg-[#FFF1F6] p-3 rounded-2xl border border-[#FFD6E5] grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-[10px] text-[#9C7C75] font-bold">Khách Phục Vụ</div>
              <div className="text-base font-black text-[#7C5C55] mt-0.5">
                {dailyCustomersServed} 😋
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9C7C75] font-bold">Khách Bỏ Về</div>
              <div className="text-base font-black text-rose-500 mt-0.5">
                {dailyCustomersLost} 💔
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9C7C75] font-bold">Rating Quán</div>
              <div className="text-base font-black text-amber-600 mt-0.5 flex items-center justify-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{(gameState.rating ?? 75).toFixed(0)}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#9C7C75] font-bold">Danh Tiếng (Fame)</div>
              <div className="text-base font-black text-[#E91E63] mt-0.5 flex items-center justify-center gap-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>{gameState.fame ?? gameState.reputation}</span>
              </div>
            </div>
          </div>

          {/* Phân tích Nút Cổ Chai (Bottleneck: Cầu - Năng lực - Kho) */}
          <div className="bg-white rounded-2xl p-3 border-2 border-[#FFD0DE] shadow-2xs space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-black text-[#5C3A33] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#FF6584]" />
                <span>Nút Cổ Chai Vận Hành (Bottleneck)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                bottleneck.type === 'inventory'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : bottleneck.type === 'capacity'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {bottleneck.type === 'inventory' ? 'Kho Nguyên Liệu' : bottleneck.type === 'capacity' ? 'Năng Lực Bếp/Bàn' : 'Lượng Khách/Cầu'}
              </span>
            </div>
            <div className="font-bold text-[#7C5C55] text-xs">
              {bottleneck.title}
            </div>
            <p className="text-[11px] text-[#8C6258] leading-relaxed">
              {bottleneck.description}
            </p>
            <div className="bg-amber-50/90 p-2 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
              <span className="font-black">💡 Khuyến nghị: </span>
              {bottleneck.recommendation}
            </div>
          </div>

          {/* Dự Báo Dòng Tiền 3 Ngày Tới (Cashflow 3-day projection) */}
          <div className="bg-white rounded-2xl p-3 border-2 border-[#FFD0DE] shadow-2xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-black text-[#5C3A33] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Dự Báo Dòng Tiền 3 Ngày Tới</span>
              </div>
              <span className="text-[10px] text-[#9C7C75] font-bold">Giả định nhịp bán ổn định</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {projectedCashflow.map((val, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl text-center border ${
                    val >= 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-75">Ngày {gameState.day + idx + 1}</div>
                  <div className="text-xs font-black mt-0.5">
                    {val.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#9C7C75] italic leading-tight text-center">
              {projectedCashflow[2] < 0
                ? '⚠️ Cảnh báo: Dòng tiền có nguy cơ âm sau 3 ngày! Hãy giảm chi phí hoặc tăng tốc bán hàng.'
                : '✨ Dòng tiền dự kiến duy trì tích cực, an tâm mở rộng quy mô!'}
            </p>
          </div>

          {/* Đánh Giá 5 Mức Sức Khỏe Tài Chính & Cứu Trợ Khẩn Cấp */}
          <div className={`rounded-2xl p-3 border-2 shadow-2xs space-y-2 text-xs ${
            health.level === 'stable'
              ? 'bg-emerald-50/80 border-emerald-300'
              : health.level === 'stress'
              ? 'bg-amber-50/80 border-amber-300'
              : health.level === 'deficit'
              ? 'bg-orange-50/80 border-orange-300'
              : 'bg-rose-50/90 border-rose-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="font-black flex items-center gap-1.5 text-[#5C3A33]">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Sức Khỏe Tài Chính: {health.title}</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-full border border-black/10">
                {health.daysRemaining > 0 ? `Đủ trụ ${health.daysRemaining} ngày` : 'Nguy cấp'}
              </span>
            </div>
            <p className="text-[11px] text-[#7C5C55] leading-relaxed">
              {health.desc}
            </p>

            {/* Nếu có dư nợ vay */}
            {(gameState.loanDebt || 0) > 0 && (
              <div className="text-[11px] font-black text-rose-700 bg-white/70 p-1.5 rounded-lg border border-rose-200">
                💸 Dư nợ cứu trợ chưa thanh toán: {(gameState.loanDebt || 0).toLocaleString('vi-VN')} đ
              </div>
            )}

            {/* Các tùy chọn cứu trợ khẩn cấp nếu căng thẳng / thiếu hụt / khủng hoảng */}
            {(health.level === 'crisis' || health.level === 'deficit' || health.level === 'stress') && (
              <div className="pt-1 border-t border-black/10 space-y-1.5">
                <div className="text-[11px] font-black text-[#5C3A33]">🚑 Phương Án Cứu Trợ Khẩn Cấp:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    onClick={() => takeEmergencyLoan('neighbor')}
                    className="p-1.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-300 text-left font-bold text-[10.5px] text-emerald-800 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>🤝 Vay Bác Ba Hàng Xóm (+1.000.000đ)</span>
                  </button>
                  <button
                    onClick={() => takeEmergencyLoan('bank')}
                    className="p-1.5 bg-white hover:bg-blue-50 rounded-xl border border-blue-300 text-left font-bold text-[10.5px] text-blue-800 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>🏦 Vay Quỹ Hỗ Trợ (+5.000.000đ)</span>
                  </button>
                  <button
                    onClick={() => liquidateEquipment()}
                    className="p-1.5 bg-white hover:bg-amber-50 rounded-xl border border-amber-300 text-left font-bold text-[10.5px] text-amber-900 transition-all cursor-pointer col-span-1 sm:col-span-2 flex items-center justify-between"
                  >
                    <span>📦 Thanh Lý Bớt Đồ Nghề Cũ (+2.000.000đ tiền mặt)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Nếu phá sản hoàn toàn */}
            {health.level === 'bankrupt' && (
              <div className="pt-1.5 border-t border-rose-300 space-y-2">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-950 font-black text-xs leading-snug">
                  ⚠️ Cửa hàng không còn khả năng chi trả sau 3 ngày ân hạn. Bạn có thể bắt đầu lại và kế thừa Điểm Di Sản (Legacy Points)!
                </div>
                <button
                  onClick={resetGameWithLegacy}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>🌱 BẮT ĐẦU LẠI VỚI DI SẢN (Kế Thừa Điểm Thưởng & Vốn Lớn Hơn)</span>
                </button>
              </div>
            )}
          </div>

          {/* Chi tiết Hao hụt hàng tươi nếu có */}
          {spoilage.spoilageDetails.length > 0 && (
            <div className="bg-rose-50/60 p-2.5 rounded-2xl border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <span>🍂</span>
                <span>Chi tiết hao hụt nguyên liệu tươi qua đêm:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {spoilage.spoilageDetails.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white rounded-lg border border-rose-200 text-[10.5px] text-rose-700 font-bold"
                  >
                    {item.name}: -{item.count} (-{item.cost.toLocaleString('vi-VN')}đ)
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-rose-800/80 pt-0.5">
                💡 Mẹo: Mua hoặc nâng cấp Tủ Lạnh trong mục Nâng Cấp để bảo quản nguyên liệu tươi lâu hơn (giảm đến 80% hao hụt)!
              </p>
            </div>
          )}

          {/* Smart Insights F&B */}
          {insights.length > 0 && (
            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs space-y-1.5">
              <div className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-200" />
                <span>Góc Phân Tích & Insight Kinh Doanh (F&B):</span>
              </div>
              <div className="space-y-1 text-[11px] text-amber-950">
                {insights.map((msg, i) => (
                  <p key={i} className="leading-snug">{msg}</p>
                ))}
              </div>
            </div>
          )}

          {/* Nút hành động chính */}
          {health.level !== 'bankrupt' && (
            <button
              onClick={endDayAndSleep}
              className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-[#F7A8C4] to-[#f28bb1] hover:brightness-105 text-white shadow-xl shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Moon className="w-4 h-4" />
              <span>ĐI NGỦ & BƯỚC SANG NGÀY {gameState.day + 1} (Hồi 100% Sức Lực ⚡)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

