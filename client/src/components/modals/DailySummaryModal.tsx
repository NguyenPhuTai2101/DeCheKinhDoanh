import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES } from '../../../../shared/gameData';
import confetti from 'canvas-confetti';
import { Moon, Sparkles, TrendingUp, TrendingDown, Users, DollarSign, Award, X } from 'lucide-react';

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

  let totalSalaries = 0;
  for (const empId of gameState.hiredEmployees) {
    const emp = EMPLOYEES.find((e) => e.id === empId);
    if (emp) totalSalaries += emp.salaryPerDay;
  }

  const netProfit = dailyRevenue - dailyCost - totalSalaries;

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-[#FFD6E5] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-5 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌙</span>
            <div>
              <h2 className="text-xl font-black text-[#7C5C55]">
                Tổng Kết Hoạt Động Ngày {gameState.day}
              </h2>
              <p className="text-xs text-[#9C7C75]">
                Báo cáo tài chính & kết quả kinh doanh của tiệm hôm nay
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung thống kê */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Doanh thu */}
            <div className="bg-[#FFF7ED] p-3.5 rounded-2xl border border-[#F7D7BA] flex flex-col">
              <span className="text-xs font-bold text-[#9C7C75] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Tổng Doanh Thu
              </span>
              <span className="text-lg font-black text-emerald-600 mt-1">
                +{dailyRevenue.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Chi phí nguyên liệu */}
            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 flex flex-col">
              <span className="text-xs font-bold text-[#9C7C75] flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Tiền Mua Nguyên Liệu
              </span>
              <span className="text-lg font-black text-rose-600 mt-1">
                -{dailyCost.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Tiền lương nhân viên */}
            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 flex flex-col">
              <span className="text-xs font-bold text-[#9C7C75] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" />
                Lương Nhân Viên ({gameState.hiredEmployees.length} người)
              </span>
              <span className="text-lg font-black text-purple-600 mt-1">
                -{totalSalaries.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Lợi nhuận ròng */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col ${
                netProfit >= 0
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <span className="text-xs font-bold text-[#9C7C75] flex items-center gap-1.5">
                <TrendingUp
                  className={`w-4 h-4 ${
                    netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                />
                Lợi Nhuận Ròng
              </span>
              <span
                className={`text-lg font-black mt-1 ${
                  netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {netProfit >= 0 ? '+' : ''}
                {netProfit.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Phục vụ khách hàng */}
          <div className="bg-[#FFF1F6] p-4 rounded-2xl border border-[#FFD6E5] flex items-center justify-around text-center">
            <div>
              <div className="text-xs text-[#9C7C75] font-bold">Khách Phục Vụ</div>
              <div className="text-xl font-black text-[#7C5C55] mt-0.5">
                {dailyCustomersServed} 😋
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[#FFD6E5]" />
            <div>
              <div className="text-xs text-[#9C7C75] font-bold">Khách Bỏ Về</div>
              <div className="text-xl font-black text-rose-500 mt-0.5">
                {dailyCustomersLost} 💔
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[#FFD6E5]" />
            <div>
              <div className="text-xs text-[#9C7C75] font-bold">Điểm Uy Tín Hiện Tại</div>
              <div className="text-xl font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                {gameState.reputation}
              </div>
            </div>
          </div>

          {/* Nút hành động chính */}
          <button
            onClick={endDayAndSleep}
            className="w-full py-4 rounded-2xl font-black text-base bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-xl shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98 mt-2"
          >
            <Moon className="w-5 h-5" />
            <span>ĐI NGỦ & BƯỚC SANG NGÀY {gameState.day + 1} (Hồi 100% Sức Lực ⚡)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
