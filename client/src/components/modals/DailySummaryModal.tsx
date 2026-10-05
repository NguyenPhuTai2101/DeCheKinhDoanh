import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES } from '../../../../shared/gameData';
import { calculateStageFixedCosts, generateDailyInsights } from '../../../../shared/economy/finance';
import confetti from 'canvas-confetti';
import { Moon, TrendingUp, TrendingDown, Users, DollarSign, Award, X, Building, Lightbulb, Star } from 'lucide-react';

export const DailySummaryModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    dailyRevenue,
    dailyCost,
    dailyCustomersServed,
    dailyCustomersLost,
    endDayAndSleep,
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

  // 3. Giá vốn thực tế (COGS) & Lợi nhuận gộp
  const cogs = (gameState.dailyFinance && gameState.dailyFinance.cogs > 0)
    ? gameState.dailyFinance.cogs
    : dailyCost;
  const grossProfit = dailyRevenue - cogs;
  const grossMargin = dailyRevenue > 0 ? (grossProfit / dailyRevenue) * 100 : 0;

  // 4. Lợi nhuận ròng (Net Profit)
  const netProfit = grossProfit - totalSalaries - rent - utilities;
  const netMargin = dailyRevenue > 0 ? (netProfit / dailyRevenue) * 100 : 0;

  // 5. Smart Insights
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
          <button
            onClick={endDayAndSleep}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-[#F7A8C4] to-[#f28bb1] hover:brightness-105 text-white shadow-xl shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Moon className="w-4 h-4" />
            <span>ĐI NGỦ & BƯỚC SANG NGÀY {gameState.day + 1} (Hồi 100% Sức Lực ⚡)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
