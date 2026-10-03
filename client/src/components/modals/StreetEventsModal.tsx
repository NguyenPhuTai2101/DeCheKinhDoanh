import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { STREET_EVENTS } from '../../../../shared/gameData';
import { soundManager } from '../../utils/soundManager';
import { X, AlertCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

export const StreetEventsModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    resolveStreetEventChoice,
    triggerStreetEvent,
  } = useGameStore();

  const event = gameState.currentEvent;

  const handleChoose = (idx: number) => {
    soundManager.playClick();
    resolveStreetEventChoice(idx);
  };

  const handleRollNewEvent = () => {
    soundManager.playClick();
    triggerStreetEvent();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#F7A8C4] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85dvh] animate-slide-up">
        {/* Header */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📢</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Chuyện Trong Xóm</h2>
              <p className="text-xs text-[#9C7C75]">
                Sự kiện vỉa hè & Biến động đời thường
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

        {/* Nội dung Sự Kiện */}
        <div className="p-5 overflow-y-auto space-y-4">
          {event ? (
            <>
              {/* Event Card */}
              <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {event.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#7C5C55]">{event.title}</h3>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Tình Huống Bất Ngờ
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#7C5C55] leading-relaxed bg-[#FAF5EE] p-3 rounded-xl border border-[#FFD6E5]">
                  {event.description}
                </p>
              </div>

              {/* Danh sách các lựa chọn */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#7C5C55] px-1">
                  Bạn sẽ xử lý tình huống này ra sao?
                </div>

                {event.choices.map((choice, idx) => {
                  const cost = choice.cost || 0;
                  const canAfford = cost === 0 || gameState.money >= cost;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleChoose(idx)}
                      disabled={!canAfford}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                        canAfford
                          ? 'bg-white hover:bg-[#FFF1F6] border-[#FFD6E5] hover:border-[#F7A8C4] shadow-sm active:scale-98'
                          : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#7C5C55] leading-snug">
                          {choice.text}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold">
                          {cost > 0 && (
                            <span className="text-red-500 font-bold">
                              Chi: -{cost.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {choice.gainMoney && (
                            <span className="text-emerald-600 font-bold">
                              Thu: +{choice.gainMoney.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {choice.gainReputation && (
                            <span className="text-pink-600 font-bold">
                              Uy tín: +{choice.gainReputation}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#FFF1F6] flex items-center justify-center text-[#F7A8C4] shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-6 border-2 border-[#FFD6E5] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border-2 border-emerald-200">
                🌿
              </div>
              <div>
                <h3 className="text-base font-black text-[#7C5C55]">
                  Phố Phường Hôm Nay Thật Yên Bình!
                </h3>
                <p className="text-xs text-[#9C7C75] mt-1 max-w-xs mx-auto">
                  Hiện chưa có biến động hay tình huống khẩn cấp nào. Hãy tập trung phục vụ khách hoặc bấm kích hoạt để dạo quanh xóm!
                </p>
              </div>

              <button
                onClick={handleRollNewEvent}
                className="px-4 py-2 bg-[#F7A8C4] hover:bg-pink-400 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Khám Phá Chuyện Trong Xóm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
