import React, { useState } from 'react';
import { getOperatingStatement } from '../../../../shared/economy/operating';
import { useGameStore } from '../../store/gameStore';
import { BUSINESS_STAGES } from '../../../../shared/gameData';
import { BusinessStageId, DailySummary } from '../../../../shared/types';
import { calculateStageFixedCosts } from '../../../../shared/economy/finance';
import { getFameTier, FAME_TIERS } from '../../../../shared/progression/fame';
import { soundManager } from '../../utils/soundManager';
import {
  X,
  TrendingUp,
  DollarSign,
  Award,
  Crown,
  History,
  Ticket,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Receipt,
  Users,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';

export const LedgerModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    dailyRevenue,
    dailyCost,
    dailyCustomersServed,
    dailyCustomersLost,
    upgradeBusinessStage,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'today' | 'empire' | 'history' | 'lottery'>('today');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
  const currentIdx = stageOrder.indexOf(gameState.businessStage);
  const nextStageId = stageOrder[currentIdx + 1];
  const nextStage = nextStageId ? BUSINESS_STAGES[nextStageId] : null;

  const statement = getOperatingStatement(gameState);
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

  // Fame & Danh tiếng
  const currentFame = gameState.fame ?? gameState.reputation;
  const currentFameTier = getFameTier(currentFame);
  const nextFameTier = FAME_TIERS.slice()
    .reverse()
    .find((t) => t.minFame > currentFame);

  const handleUpgrade = () => {
    soundManager.playCoin();
    upgradeBusinessStage();
  };

  const toggleDayExpand = (day: number) => {
    soundManager.playClick();
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div role="dialog" aria-modal="true" aria-label="Ledger" className="game-modal-panel bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#F7A8C4] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Sổ Tay Lò Xo */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📒</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Sổ Thu Chi</h2>
              <p className="text-xs text-[#9C7C75]">
                Kê khai P&L chuẩn mực F&B và lộ trình xây dựng chuỗi thương hiệu
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#7C5C55] shadow-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <HorizontalScrollBox
          showArrows={true}
          className="bg-white px-3 py-2 border-b border-[#FFD6E5] flex gap-2 shrink-0 scrollbar-none"
        >
          <button
            onClick={() => setActiveTab('today')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Thu Chi Hôm Nay</span>
          </button>
          <button
            onClick={() => setActiveTab('empire')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'empire'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Cơ Nghiệp & Danh Tiếng</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử ({gameState.historySummaries.length} Ngày)</span>
          </button>
          <button
            onClick={() => setActiveTab('lottery')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'lottery'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Vé Số ({gameState.lotteryHistory.length})</span>
          </button>
        </HorizontalScrollBox>

        {/* Nội dung theo Tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: THU CHI P&L HÔM NAY CHUẨN F&B */}
          {activeTab === 'today' && (
            <div className="space-y-3.5">
              {/* Thẻ Bảng Kê P&L F&B */}
              <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm relative space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#FFD6E5]">
                  <div>
                    <span className="text-xs font-black text-[#7C5C55] uppercase">
                      Báo Cáo Thu Chi Ngày {gameState.day}
                    </span>
                    <p className="text-[10px] text-[#9C7C75]">
                      Mô hình: {currentStage.name} • {gameState.shopName}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-pink-600 bg-[#FFF1F6] px-2.5 py-0.5 rounded-full border border-pink-200">
                    {Math.floor(gameState.gameTimeMinutes / 60)
                      .toString()
                      .padStart(2, '0')}
                    :
                    {Math.floor(gameState.gameTimeMinutes % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Khối Doanh thu */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[#7C5C55]">
                    <span className="font-medium flex items-center gap-1">
                      <span>🏪</span> Doanh thu quán chính:
                    </span>
                    <span className="font-bold text-emerald-600">
                      +{mainShopRev.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {branchRev > 0 && (
                    <div className="flex justify-between items-center text-[#7C5C55]">
                      <span className="font-medium flex items-center gap-1">
                        <span>🏢</span> Doanh thu chuỗi chi nhánh:
                      </span>
                      <span className="font-bold text-emerald-600">
                        +{branchRev.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-black text-slate-800 bg-[#FFF9FA] px-2 py-1 rounded-lg">
                    <span>Tổng Doanh Thu Bán Hàng:</span>
                    <span className="text-emerald-600 text-sm">
                      +{totalRev.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Khối COGS */}
                  <div className="flex justify-between items-center text-[#7C5C55] pt-1">
                    <span className="font-medium flex items-center gap-1">
                      <span>🥩</span> Chi phí giá vốn nguyên liệu (COGS):
                    </span>
                    <span className="font-bold text-rose-500">
                      -{cogsToday.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Lợi nhuận gộp */}
                  <div className="flex justify-between items-center bg-amber-50/70 border border-amber-200 px-2 py-1 rounded-lg text-xs font-black">
                    <span className="text-amber-900">
                      Lợi Nhuận Gộp (Gross Profit - {grossMargin}%):
                    </span>
                    <span className={grossProfitToday >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {grossProfitToday >= 0 ? '+' : ''}
                      {grossProfitToday.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {tipsToday > 0 && (
                    <div className="flex justify-between items-center text-xs text-amber-700 font-bold px-1">
                      <span>✨ Tiền boa (đã gồm trong doanh thu):</span>
                      <span className="text-emerald-600">+{tipsToday.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                </div>

                {/* Khối Chi phí cố định cuối ngày */}
                <div className="pt-2 border-t-2 border-dashed border-[#FFD6E5] space-y-1 text-xs">
                  <div className="text-[11px] font-black text-[#9C7C75] mb-1">
                    KHOẢN TRỪ CỐ ĐỊNH KHI ĐÓNG CỬA & ĐI NGỦ:
                  </div>

                  <div className="flex justify-between text-[#7C5C55]">
                    <span>👥 Lương nhân sự ({gameState.hiredEmployees.length} người):</span>
                    <span className="font-bold text-rose-500">
                      -{totalStaffSalaries.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between text-[#7C5C55]">
                    <span>🏠 Thuê mặt bằng ({currentStage.name}):</span>
                    <span className="font-bold text-rose-500">
                      -{fixedCosts.rent.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between text-[#7C5C55]">
                    <span>⚡ Điện, nước & tiện ích:</span>
                    <span className="font-bold text-rose-500">
                      -{fixedCosts.utilities.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Tổng kết Lợi nhuận ròng */}
                <div className="pt-2 border-t-2 border-[#FFD6E5] flex justify-between items-center">
                  <div>
                    <span className="font-black text-sm text-[#7C5C55] block">
                      💵 Lãi Ròng Ước Tính (Net Profit):
                    </span>
                    <span className="text-[10px] text-[#9C7C75]">
                      Đã phục vụ: {dailyCustomersServed} khách{' '}
                      {dailyCustomersLost > 0 && (
                        <span className="text-rose-400">({dailyCustomersLost} bỏ về)</span>
                      )}
                    </span>
                  </div>
                  <span
                    className={`font-black text-base sm:text-lg ${
                      estNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {estNetProfit >= 0 ? '+' : ''}
                    {estNetProfit.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CƠ NGHIỆP & DANH TIẾNG FAME */}
          {activeTab === 'empire' && (
            <div className="space-y-4">
              {/* Card Phân Hạng Danh Tiếng (Fame Tier V2) */}
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-4 border-2 border-amber-300 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                        Phân Hạng Danh Tiếng F&B
                      </div>
                      <h3 className="text-base font-black text-amber-950">
                        {currentFameTier.badge} - {currentFameTier.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-800">Danh tiếng:</span>
                    <div className="text-lg font-black text-rose-600">{currentFame} 🏆</div>
                  </div>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed italic bg-white/70 p-2 rounded-xl border border-amber-200">
                  "{currentFameTier.description}"
                </p>

                {nextFameTier && (
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-900">
                      <span>Mục tiêu tiếp theo: {nextFameTier.badge}</span>
                      <span>
                        {currentFame}/{nextFameTier.minFame} Fame
                      </span>
                    </div>
                    <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((currentFame / nextFameTier.minFame) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card cấp bậc hiện tại */}
              <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF9FA] border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                    {currentStage.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Quy mô cơ sở hiện tại
                    </div>
                    <h3 className="text-base font-black text-amber-950">{currentStage.name}</h3>
                    <p className="text-xs text-amber-800 italic">{currentStage.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-amber-100 text-xs text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[#9C7C75] text-[10px]">Bàn Phục Vụ</div>
                    <div className="font-black text-amber-900 text-sm">
                      {currentStage.maxTables} Bàn
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[#9C7C75] text-[10px]">Tối Đa Nhân Sự</div>
                    <div className="font-black text-amber-900 text-sm">
                      {currentStage.maxStaff} NV
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[#9C7C75] text-[10px]">Chi Nhánh Tối Đa</div>
                    <div className="font-black text-amber-900 text-sm">
                      {currentStage.maxRestaurants} Quán
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[#9C7C75] text-[10px]">Mặt Bằng/Ngày</div>
                    <div className="font-black text-amber-900 text-sm">
                      {fixedCosts.rent.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Nâng cấp lên cấp tiếp theo */}
              {nextStage ? (
                <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-pink-600 uppercase">
                        Mục tiêu thăng cấp tiếp theo
                      </div>
                      <h4 className="text-sm font-black text-[#7C5C55] flex items-center gap-1.5">
                        <span>{nextStage.icon}</span> {nextStage.name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-[#7C5C55] leading-relaxed">
                    {nextStage.description}
                  </p>

                  <div className="bg-[#FAF5EE] p-3 rounded-xl border border-[#FFD6E5] space-y-1.5 text-xs text-[#7C5C55]">
                    <div className="flex justify-between">
                      <span>Chi Phí Mở Rộng:</span>
                      <span
                        className={`font-black ${
                          gameState.money >= nextStage.cost ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {nextStage.cost.toLocaleString('vi-VN')} đ (Có:{' '}
                        {gameState.money.toLocaleString('vi-VN')} đ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yêu Cầu Danh Tiếng (Fame):</span>
                      <span
                        className={`font-black ${
                          currentFame >= nextStage.requiredReputation
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                        }`}
                      >
                        {nextStage.requiredReputation} 🏆 (Có: {currentFame} 🏆)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={
                      gameState.money < nextStage.cost ||
                      currentFame < nextStage.requiredReputation
                    }
                    className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    Thăng Cấp Ngay ({nextStage.cost.toLocaleString('vi-VN')} đ)
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-center text-xs text-emerald-800 font-bold">
                  👑 Chúc mừng! Bạn đã đạt tới đỉnh cao Chuỗi Đế Chế Vỉa Hè!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ SỔ SÁCH V2 */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {gameState.historySummaries.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border-2 border-[#FFD6E5] text-center text-xs text-[#9C7C75]">
                  Chưa có lịch sử các ngày trước. Hãy hoàn thành ngày làm việc và đi ngủ để ghi sổ!
                </div>
              ) : (
                gameState.historySummaries.map((summary: DailySummary) => {
                  const isExpanded = expandedDay === summary.day;

                  return (
                    <div
                      key={summary.day}
                      className="bg-white rounded-2xl border-2 border-[#FFD6E5] shadow-xs overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleDayExpand(summary.day)}
                        className="w-full p-3 flex items-center justify-between text-xs hover:bg-[#FFF9FA] transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 font-black flex items-center justify-center text-xs shrink-0">
                            N{summary.day}
                          </span>
                          <div>
                            <div className="font-black text-[#7C5C55]">
                              Ngày {summary.day} · {summary.servedCustomers} khách
                            </div>
                            <div className="text-[10px] text-[#9C7C75]">
                              Doanh thu: {summary.totalRevenue.toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-xs sm:text-sm ${
                              summary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {summary.netProfit >= 0 ? '+' : ''}
                            {summary.netProfit.toLocaleString('vi-VN')} đ
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-dashed border-[#FFD6E5] bg-[#FFFDF8] text-[11px] space-y-2">
                          <div className="grid grid-cols-2 gap-1.5 pt-2 text-[#7C5C55]">
                            <div>
                              <span>Giá vốn món bán:</span>{' '}
                              <strong className="text-rose-500">
                                -{(summary.cogs || summary.ingredientCost || 0).toLocaleString('vi-VN')} đ
                              </strong>
                            </div>
                            <div>
                              <span>Lợi nhuận gộp:</span>{' '}
                              <strong className="text-emerald-700">
                                +{(summary.grossProfit || summary.totalRevenue - (summary.cogs || 0)).toLocaleString('vi-VN')} đ
                              </strong>
                            </div>
                            <div>
                              <span>Lương nhân sự:</span>{' '}
                              <strong className="text-rose-500">
                                -{(summary.wages || summary.staffSalaries || 0).toLocaleString('vi-VN')} đ
                              </strong>
                            </div>
                            <div>
                              <span>Mặt bằng & Tiện ích:</span>{' '}
                              <strong className="text-rose-500">
                                -{((summary.rent || 0) + (summary.utilities || 0)).toLocaleString('vi-VN')} đ
                              </strong>
                            </div>
                          </div>

                          {summary.smartInsights && summary.smartInsights.length > 0 && (
                            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 space-y-1">
                              <span className="font-black text-amber-900 text-[10.5px] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>Phân tích kinh doanh ngày {summary.day}:</span>
                              </span>
                              {summary.smartInsights.map((insight, idx) => (
                                <p key={idx} className="text-[10px] text-amber-800 leading-tight">
                                  {insight}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: LỊCH SỬ VÉ SỐ CỦA CÔ BẢY */}
          {activeTab === 'lottery' && (
            <div className="space-y-3">
              {gameState.lotteryHistory.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border-2 border-amber-200 text-center text-xs text-amber-800">
                  Chưa có lịch sử vé số nào. Hãy ghé tab Bà Con Xóm Giềng để mua ủng hộ Cô Bảy nhé!
                </div>
              ) : (
                gameState.lotteryHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-3 border-2 border-amber-200 shadow-sm flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🎟️</span>
                      <div>
                        <div className="font-black text-amber-900">
                          Số mua: <span className="text-sm underline">{item.ticketNumber}</span> (Ngày {item.boughtDay})
                        </div>
                        <div className="text-[11px] text-amber-700">
                          Kết quả xổ: {item.drawnNumber || 'Đang chờ'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {(item.prizeAmount || 0) > 0 ? (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full font-bold text-[10px]">
                          +{item.prizeAmount?.toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-semibold">
                          Chúc may mắn
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <details className="px-4 pb-3 text-xs text-[#7C5C55] border-t border-pink-100">
          <summary className="py-3 font-bold cursor-pointer">Dòng tiền thực · {gameState.cashJournal?.length || 0} giao dịch</summary>
          <p className="mb-2">Lợi nhuận khác tiền trong ví. Mua hàng, đầu tư và vay đều được ghi riêng.</p>
          <div className="max-h-40 overflow-y-auto space-y-2">{[...(gameState.cashJournal || [])].reverse().map((entry, i) => <div key={i} className="flex justify-between gap-3"><span>Ngày {entry.day} · {entry.label}</span><b>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString('vi-VN')}đ</b></div>)}</div>
          <p className="mt-2">Thu khác: {statement.finance.otherIncome.toLocaleString('vi-VN')}đ · Chi khác và biến cố: {(statement.finance.eventExpenses + statement.finance.otherExpense).toLocaleString('vi-VN')}đ · Hao hụt: {statement.spoilage.spoilageCost.toLocaleString('vi-VN')}đ · Trả nợ dự kiến: {statement.debtPayment.toLocaleString('vi-VN')}đ</p>
        </details>
      </div>
    </div>
  );
};

export default LedgerModal;
