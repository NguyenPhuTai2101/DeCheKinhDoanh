import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { X, Cloud, HardDrive, RefreshCw, AlertTriangle, CheckCircle2, Heart } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { closeModal, saveLocal, syncCloud, resetGame, gameState, showToast, setShowFlashScreen } = useGameStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleManualSave = async () => {
    setIsSyncing(true);
    saveLocal();
    await syncCloud();
    setIsSyncing(false);
    showToast('💾 Đã lưu dữ liệu cả Cục bộ (Local) và Cloud Server!');
  };

  const handleConfirmReset = () => {
    resetGame();
    setShowConfirmReset(false);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Cài Đặt & Lưu Dữ Liệu</h2>
              <p className="text-xs text-[#9C7C75]">
                Quản lý đồng bộ Cloud, sao lưu dữ liệu và cài đặt trò chơi
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 flex flex-col gap-4">
          {/* Trạng thái sao lưu */}
          <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-[#F7D7BA] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#7C5C55]">
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-600" />
                Lưu trữ Local (Trình duyệt):
              </span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tự động mỗi 30s
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#7C5C55]">
              <span className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-600" />
                Đồng bộ Cloud Server:
              </span>
              <span className="text-sky-600 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Node.js / Express DB
              </span>
            </div>

            <div className="text-[11px] text-[#9C7C75] border-t border-[#F7D7BA] pt-2">
              Lần lưu gần nhất: {new Date(gameState.lastSavedAt).toLocaleString('vi-VN')}
            </div>
          </div>

          {/* Nút sao lưu thủ công */}
          <button
            onClick={handleManualSave}
            disabled={isSyncing}
            className="w-full py-3 rounded-2xl font-black text-sm bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-md shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ Cloud...' : 'Lưu Game Ngay (Cloud + Local)'}</span>
          </button>

          {/* Nút Mở Lại FlashScreen Khởi Nghiệp */}
          <button
            onClick={() => {
              closeModal();
              setShowFlashScreen(true);
            }}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
          >
            <span>🏮</span>
            <span>Mở Lại Màn Hình FlashScreen (Chọn Quán Khởi Nghiệp)</span>
          </button>

          {/* Nút reset */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 rounded-2xl font-bold text-xs text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Chơi lại từ đầu (Xóa Save)</span>
            </button>
          ) : (
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-300 flex flex-col gap-2.5 text-center">
              <span className="text-xs font-bold text-rose-700">
                ⚠️ Bạn có chắc chắn muốn xóa toàn bộ tiến trình và bắt đầu lại từ ngày 1?
              </span>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-sm"
                >
                  Đồng Ý Xóa
                </button>
              </div>
            </div>
          )}

          {/* Thông tin phiên bản */}
          <div className="text-center text-xs text-[#9C7C75] mt-2 flex flex-col items-center gap-1">
            <span className="flex items-center gap-1 font-bold text-[#7C5C55]">
              Đế Chế Kinh Doanh V0.1 Demo 🌸
            </span>
            <span>Thiết kế theo chuẩn Game Design Document (GDD V0.1)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
