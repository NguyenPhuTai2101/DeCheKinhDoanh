import React from 'react';
import { useGameStore, ModalType } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import {
  X,
  Users,
  Palette,
  BookOpen,
  Bike,
  HeartHandshake,
  Megaphone,
  Ticket,
  Moon,
  Settings,
  ChevronRight,
  Store,
  Compass,
} from 'lucide-react';

export const MenuMoreDrawer: React.FC = () => {
  const { closeModal, openModal, gameState, deliveryOrders, triggerSurpriseIncident } = useGameStore();

  const handleSelectModal = (modal: ModalType) => {
    soundManager.playClick();
    if (modal === 'dailySummary') useGameStore.getState().forceCloseStoreTonight();
    else openModal(modal);
  };

  const hiredCount = gameState.hiredEmployees.length;
  const pendingDeliveries = deliveryOrders.filter((d) => d.status !== 'delivering').length;
  const hasEvent = !!gameState.currentEvent;

  return (
    <div
      onClick={closeModal}
      className="game-modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85dvh] animate-slide-up"
      >
        {/* Header Drawer */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📑</span>
            <div>
              <h2 className="text-base font-black text-[#7C5C55]">Tiện Ích & Mở Rộng</h2>
              <p className="text-[11px] text-[#9C7C75]">
                Quản lý nâng cao, đời sống khu phố & hệ thống
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 active:scale-90 transition-all shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung danh mục ngăn kéo */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          <button onClick={() => handleSelectModal('menuPricing')} className="w-full rounded-2xl border border-pink-200 bg-white p-3 text-left text-sm font-bold text-[#7C5C55]">📋 Thực đơn & giá bán <small className="block font-normal">Chọn món mở bán, xem giá vốn và điều chỉnh giá</small></button>
          {/* NHÓM 1: QUẢN LÝ QUÁN */}
          <div>
            <div className="text-[10px] font-black text-[#9C7C75] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
              <Store className="w-3 h-3 text-pink-500" />
              <span>Quản Lý & Phát Triển Quán</span>
            </div>

            {/* Banner Mở Chuỗi Quán Ăn */}
            <div
              onClick={() => handleSelectModal('franchise')}
              className="p-3 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-2xl text-white shadow-sm flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all group mb-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0 shadow-inner">
                  🍜
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>Mở Rộng Chuỗi Quán Ăn</span>
                    <span className="text-[8.5px] bg-white text-orange-600 px-1.5 py-0.2 rounded-full font-black">
                      {gameState.unlockedRestaurants?.length || 1}/5 Quán
                    </span>
                  </div>
                  <div className="text-[10.5px] text-amber-100">
                    Phở Bò, Bún Riêu, Bò Né Chảo Gang, Cơm Tấm...
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Nhân sự */}
              <button
                onClick={() => handleSelectModal('employees')}
                className="flex items-center sm:flex-col sm:items-start justify-between p-2.5 bg-white rounded-2xl border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-black shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-purple-950 flex items-center gap-1">
                      <span>Nhân Sự</span>
                      {hiredCount > 0 && (
                        <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">
                          {hiredCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-purple-700/70">Tuyển phụ bếp & bưng bê</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform sm:hidden" />
              </button>

              {/* Trang trí */}
              <button
                onClick={() => handleSelectModal('decor')}
                className="flex items-center sm:flex-col sm:items-start justify-between p-2.5 bg-white rounded-2xl border border-pink-200 hover:border-pink-400 hover:bg-pink-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-black shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-pink-950">Trang Trí</div>
                    <div className="text-[10px] text-pink-700/70">Tăng điểm Cozy & hút khách</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform sm:hidden" />
              </button>

              {/* Sổ sách tài chính */}
              <button
                onClick={() => handleSelectModal('ledger')}
                className="flex items-center sm:flex-col sm:items-start justify-between p-2.5 bg-white rounded-2xl border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-black shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-950">Sổ Sách</div>
                    <div className="text-[10px] text-amber-700/70">Báo cáo doanh thu & dòng tiền</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform sm:hidden" />
              </button>
            </div>
          </div>

          {/* NHÓM 2: ĐỜI SỐNG KHU PHỐ */}
          <div>
            <div className="text-[10px] font-black text-[#9C7C75] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
              <Compass className="w-3 h-3 text-sky-500" />
              <span>Đời Sống Khu Phố & Vỉa Hè</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Giao hàng Chú Năm */}
              <button
                onClick={() => handleSelectModal('delivery')}
                className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-sky-200 hover:border-sky-400 hover:bg-sky-50/50 shadow-2xs active:scale-98 transition-all group relative"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-black shrink-0">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                      <span>Giao Hàng Chú Năm</span>
                      {pendingDeliveries > 0 && (
                        <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                          {pendingDeliveries} đơn
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-sky-700/70">Nổ cuốc ship bánh mì kiếm tiền boa</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Tình làng nghĩa xóm */}
              <button
                onClick={() => handleSelectModal('neighbors')}
                className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-black shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-rose-950">Xóm Giềng Thân Thiết</div>
                    <div className="text-[10px] text-rose-700/70">Bác Ba, Cô Bảy, Chú Năm, Bé Bông</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Chuyện xóm & Biến cố */}
              <button
                onClick={() => handleSelectModal('streetEvents')}
                className={`flex items-center justify-between p-2.5 bg-white rounded-2xl border shadow-2xs active:scale-98 transition-all group ${
                  hasEvent
                    ? 'border-red-400 bg-red-50/70 ring-2 ring-red-300'
                    : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      hasEvent ? 'bg-red-500 text-white animate-bounce' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>Chuyện Xóm & Biến Cố</span>
                      {hasEvent && (
                        <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                          🚨 Có Biến!
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-700/70">Công an dẹp lề, bảo kê, hóng hớt</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Sổ mơ & Đề x70 */}
              <button
                onClick={() => handleSelectModal('lotteryDraw')}
                className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-red-200 hover:border-red-400 hover:bg-red-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-sm font-black shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-red-950 flex items-center gap-1">
                      <span>Vé Số & Đề x70</span>
                      <span className="text-[8px] bg-red-600 text-white px-1 rounded-full font-bold">HOT</span>
                    </div>
                    <div className="text-[10px] text-red-700/70">Tra sổ mơ Gen Z & thử vận may Cô Bảy</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Tình Huống Bất Ngờ Đời Thực */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  closeModal();
                  triggerSurpriseIncident();
                }}
                className="flex items-center justify-between p-2.5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-pink-300 hover:border-pink-500 shadow-2xs active:scale-98 transition-all group sm:col-span-2 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                    ⚡
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                      <span>Biến Cố Bất Ngờ (Đời Thực)</span>
                      <span className="text-[8.5px] bg-pink-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                        MỚI
                      </span>
                    </div>
                    <div className="text-[10px] text-rose-700/80">
                      Trật tự đô thị, mèo chôm thịt, Việt kiều boa sộp, tố oan khách...
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* NHÓM 3: HỆ THỐNG */}
          <div>
            <div className="text-[10px] font-black text-[#9C7C75] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
              <Settings className="w-3 h-3 text-stone-500" />
              <span>Hệ Thống & Ca Bán</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Đi ngủ */}
              <button
                onClick={() => handleSelectModal('dailySummary')}
                className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-black shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-indigo-950">Đi Ngủ</div>
                  <div className="text-[10px] text-indigo-700/70">Tổng kết ca bán ngày</div>
                </div>
              </button>

              {/* Cài đặt */}
              <button
                onClick={() => handleSelectModal('settings')}
                className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50/50 shadow-2xs active:scale-98 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center text-sm font-black shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-stone-950">Cài Đặt</div>
                  <div className="text-[10px] text-stone-700/70">Âm thanh & sao lưu</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
