import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUSINESS_STAGES } from '../../../../shared/gameData';
import { BusinessStageId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { X, BookMarked, TrendingUp, DollarSign, Award, ChevronRight, Crown, History, Ticket } from 'lucide-react';
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

  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const stageOrder: BusinessStageId[] = ['cart', 'corner', 'awning', 'eatery', 'empire'];
  const currentIdx = stageOrder.indexOf(gameState.businessStage);
  const nextStageId = stageOrder[currentIdx + 1];
  const nextStage = nextStageId ? BUSINESS_STAGES[nextStageId] : null;

  const netProfit = dailyRevenue - dailyCost;

  const handleUpgrade = () => {
    soundManager.playCoin();
    upgradeBusinessStage();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#F7A8C4] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Sổ Tay Lò Xo */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📒</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Sổ Sách & Cơ Nghiệp Vỉa Hè</h2>
              <p className="text-xs text-[#9C7C75]">
                Kê khai thu chi mỗi ngày & Lộ trình xây dựng chuỗi thương hiệu
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#7C5C55] shadow-sm transition-all"
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
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'today'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Hôm Nay</span>
          </button>
          <button
            onClick={() => setActiveTab('empire')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'empire'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Cơ Nghiệp ({currentStage.name})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Nhật Ký Các Ngày</span>
          </button>
          <button
            onClick={() => setActiveTab('lottery')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
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
          {/* TAB 1: THU CHI HÔM NAY */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {/* Trang sổ ô ly kẻ carô mộc mạc */}
              <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm relative">
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#FFD6E5] mb-3">
                  <span className="text-xs font-black text-[#7C5C55]">
                    NGÀY {gameState.day} • {gameState.shopName}
                  </span>
                  <span className="text-[11px] font-bold text-pink-600 bg-[#FFF1F6] px-2 py-0.5 rounded-full">
                    Thời gian: {Math.floor(gameState.gameTimeMinutes / 60).toString().padStart(2, '0')}:{(gameState.gameTimeMinutes % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-[#7C5C55]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>💰</span> Tổng Doanh Thu Hôm Nay:
                    </span>
                    <span className="font-black text-emerald-600 text-sm">
                      +{dailyRevenue.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#7C5C55]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>🛒</span> Chi Phí Mua Nguyên Liệu & Vận Hành:
                    </span>
                    <span className="font-bold text-rose-500">
                      -{dailyCost.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#7C5C55]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>👥</span> Khách Hàng Đã Phục Vụ:
                    </span>
                    <span className="font-bold text-[#7C5C55]">
                      {dailyCustomersServed} người {dailyCustomersLost > 0 && <span className="text-rose-400">({dailyCustomersLost} bỏ về)</span>}
                    </span>
                  </div>

                  <div className="pt-2 border-t-2 border-dashed border-[#FFD6E5] flex justify-between items-center">
                    <span className="font-black text-sm text-[#7C5C55]">
                      💵 Lãi Ròng Dự Kiến (Chưa trừ lương):
                    </span>
                    <span className={`font-black text-base ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Lương nhân viên ước tính khi ngủ */}
              <div className="bg-white rounded-2xl p-3.5 border-2 border-[#FFD6E5] shadow-sm">
                <div className="text-xs font-bold text-[#7C5C55] mb-2 flex items-center justify-between">
                  <span>Chi Trả Lương Nhân Viên Cuối Ngày:</span>
                  <span className="text-pink-600">
                    {gameState.hiredEmployees.length} nhân viên
                  </span>
                </div>

                {gameState.hiredEmployees.length === 0 ? (
                  <p className="text-xs text-[#9C7C75] italic">
                    Bạn đang tự tay làm mọi việc! Chưa có chi phí lương nhân viên.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {gameState.hiredEmployees.map((id) => {
                      const emp = gameState.employeeDetails[id];
                      return (
                        <div key={id} className="flex justify-between text-[#7C5C55]">
                          <span>{emp?.name || id} ({emp?.role}):</span>
                          <span className="font-bold text-rose-500">
                            -{(emp?.salaryPerDay || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CƠ NGHIỆP VỈA HÈ */}
          {activeTab === 'empire' && (
            <div className="space-y-4">
              {/* Card cấp bậc hiện tại */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                    {currentStage.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Cấp bậc hiện tại
                    </div>
                    <h3 className="text-base font-black text-amber-950">{currentStage.name}</h3>
                    <p className="text-xs text-amber-800 italic">{currentStage.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-200 text-xs">
                  <div className="bg-white/80 p-2 rounded-xl text-center">
                    <div className="text-[#9C7C75] text-[10px]">Số Bàn Đón Khách</div>
                    <div className="font-black text-amber-900 text-sm">{currentStage.maxTables} Bàn</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl text-center">
                    <div className="text-[#9C7C75] text-[10px]">Tần Suất Khách</div>
                    <div className="font-black text-amber-900 text-sm">{(currentStage.customerRateMs / 1000).toFixed(1)}s / khách</div>
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
                      <span className={`font-black ${gameState.money >= nextStage.cost ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {nextStage.cost.toLocaleString('vi-VN')} đ (Có: {gameState.money.toLocaleString('vi-VN')} đ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yêu Cầu Uy Tín:</span>
                      <span className={`font-black ${gameState.reputation >= nextStage.requiredReputation ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {nextStage.requiredReputation} ⭐ (Có: {gameState.reputation} ⭐)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={gameState.money < nextStage.cost || gameState.reputation < nextStage.requiredReputation}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
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

          {/* TAB 3: LỊCH SỬ SỔ SÁCH */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {gameState.historySummaries.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border-2 border-[#FFD6E5] text-center text-xs text-[#9C7C75]">
                  Chưa có lịch sử các ngày trước. Hãy hoàn thành ngày làm việc và đi ngủ để ghi sổ!
                </div>
              ) : (
                gameState.historySummaries.map((summary) => (
                  <div
                    key={summary.day}
                    className="bg-white rounded-2xl p-3.5 border-2 border-[#FFD6E5] shadow-sm flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#7C5C55]">Ngày {summary.day}</div>
                      <div className="text-[11px] text-[#9C7C75]">
                        Phục vụ: {summary.servedCustomers} khách
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {summary.netProfit >= 0 ? '+' : ''}{summary.netProfit.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-pink-500 font-semibold">
                        Thu: {summary.totalRevenue.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                ))
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
      </div>
    </div>
  );
};
