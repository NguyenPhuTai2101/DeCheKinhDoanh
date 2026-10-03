import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  Zap,
  Coins,
  Smile,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export const StreetEventsModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    resolveStreetEventChoice,
    triggerStreetEvent,
    lastEventOutcome,
    closeStreetEventOutcome,
  } = useGameStore();

  const event = gameState.currentEvent;

  const handleChoose = (idx: number) => {
    soundManager.playClick();
    if (!event) return;
    const choice = event.choices[idx];
    if (choice) {
      if ((choice.gainMoney || 0) >= 30000 || (choice.gainReputation || 0) >= 5) {
        soundManager.playFanfare();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6'],
        });
      } else if ((choice.gainReputation || 0) < 0 || (choice.gainEnergy || 0) < 0) {
        soundManager.playBuzzer();
      } else {
        soundManager.playCoin();
      }
    }
    resolveStreetEventChoice(idx);
  };

  const handleRollNewEvent = () => {
    soundManager.playClick();
    triggerStreetEvent();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#F7A8C4] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[88dvh] animate-slide-up">
        {/* Header */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce-short">
              {lastEventOutcome ? '🎉' : event ? event.icon : '📢'}
            </span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">
                {lastEventOutcome
                  ? 'Kết Quả Tình Huống'
                  : event
                  ? 'Chuyện Phố Phường'
                  : 'Bản Tin Vỉa Hè'}
              </h2>
              <p className="text-xs text-[#9C7C75]">
                {lastEventOutcome
                  ? 'Ghi nhận biến động đời thường & lòng lề đường'
                  : 'Sự kiện bất ngờ, hài hước & đời sống Gen Z'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              if (lastEventOutcome) {
                closeStreetEventOutcome();
              } else {
                closeModal();
              }
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#7C5C55] shadow-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TRƯỜNG HỢP 1: ĐÃ CÓ KẾT QUẢ VỪA XỬ LÝ (OUTCOME VIEW) */}
          {lastEventOutcome ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-5 border-2 border-[#FFD6E5] shadow-md text-center space-y-3 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner mx-auto animate-bounce-short">
                  {lastEventOutcome.icon}
                </div>

                <div>
                  {lastEventOutcome.tag && (
                    <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {lastEventOutcome.tag}
                    </span>
                  )}
                  <h3 className="text-base font-black text-[#7C5C55] mt-1.5">
                    {lastEventOutcome.eventTitle}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 italic mt-0.5">
                    "{lastEventOutcome.choiceText}"
                  </p>
                </div>

                {/* Đoạn tường thuật kết quả vui nhộn */}
                <div className="text-xs text-[#7C5C55] leading-relaxed bg-[#FAF5EE] p-3.5 rounded-2xl border-2 border-dashed border-[#F7A8C4] text-left">
                  {lastEventOutcome.outcomeText}
                </div>

                {/* Thống kê biến động */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  {/* Tiền mặt */}
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl">
                    <div className="text-[10px] text-amber-800 font-bold flex items-center justify-center gap-0.5">
                      <Coins className="w-3 h-3" /> Ví Tiền
                    </div>
                    <div className="text-xs font-black mt-0.5">
                      {lastEventOutcome.gainMoney > 0 ? (
                        <span className="text-emerald-600">
                          +{lastEventOutcome.gainMoney.toLocaleString('vi-VN')} đ
                        </span>
                      ) : lastEventOutcome.cost > 0 ? (
                        <span className="text-rose-600">
                          -{lastEventOutcome.cost.toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-slate-500">0 đ</span>
                      )}
                    </div>
                  </div>

                  {/* Uy tín */}
                  <div className="bg-pink-50 border border-pink-200 p-2 rounded-xl">
                    <div className="text-[10px] text-pink-800 font-bold flex items-center justify-center gap-0.5">
                      <Award className="w-3 h-3" /> Uy Tín
                    </div>
                    <div className="text-xs font-black mt-0.5">
                      {lastEventOutcome.gainReputation > 0 ? (
                        <span className="text-pink-600">+{lastEventOutcome.gainReputation} ⭐</span>
                      ) : lastEventOutcome.gainReputation < 0 ? (
                        <span className="text-rose-600">{lastEventOutcome.gainReputation} ⭐</span>
                      ) : (
                        <span className="text-slate-500">Giữ nguyên</span>
                      )}
                    </div>
                  </div>

                  {/* Năng lượng */}
                  <div className="bg-sky-50 border border-sky-200 p-2 rounded-xl">
                    <div className="text-[10px] text-sky-800 font-bold flex items-center justify-center gap-0.5">
                      <Zap className="w-3 h-3" /> Sức Khỏe
                    </div>
                    <div className="text-xs font-black mt-0.5">
                      {lastEventOutcome.gainEnergy && lastEventOutcome.gainEnergy > 0 ? (
                        <span className="text-emerald-600">+{lastEventOutcome.gainEnergy} ⚡</span>
                      ) : lastEventOutcome.gainEnergy && lastEventOutcome.gainEnergy < 0 ? (
                        <span className="text-rose-600">{lastEventOutcome.gainEnergy} ⚡</span>
                      ) : (
                        <span className="text-slate-500">Khỏe mạnh</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Các nút hành động sau sự kiện */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    closeStreetEventOutcome();
                  }}
                  className="flex-1 py-3 bg-[#F7A8C4] hover:bg-pink-400 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tiếp Tục Bán Hàng 🥖</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    handleRollNewEvent();
                  }}
                  className="px-4 py-3 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Khám phá thêm tình huống khác trong xóm"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hóng Tiếp 🎲</span>
                </button>
              </div>
            </div>
          ) : event ? (
            /* TRƯỜNG HỢP 2: ĐANG CÓ SỰ KIỆN CHỜ NGƯỜI CHƠI LỰA CHỌN */
            <>
              {/* Event Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFD6E5] shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {event.icon}
                  </div>
                  <div>
                    {event.tag && (
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        {event.tag}
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-black text-[#7C5C55] mt-1 leading-snug">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#7C5C55] leading-relaxed bg-[#FAF5EE] p-3.5 rounded-2xl border border-[#FFD6E5]">
                  {event.description}
                </p>
              </div>

              {/* Danh sách các lựa chọn */}
              <div className="space-y-2.5">
                <div className="text-xs font-extrabold text-[#7C5C55] px-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bạn sẽ xử lý tình huống này ra sao?</span>
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
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-semibold">
                          {cost > 0 && (
                            <span className="text-red-500 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                              Chi: -{cost.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {choice.gainMoney && (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Thu: +{choice.gainMoney.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {choice.gainReputation && (
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded border ${
                                choice.gainReputation > 0
                                  ? 'text-pink-600 bg-pink-50 border-pink-200'
                                  : 'text-rose-600 bg-rose-50 border-rose-200'
                              }`}
                            >
                              Uy tín: {choice.gainReputation > 0 ? `+${choice.gainReputation}` : choice.gainReputation} ⭐
                            </span>
                          )}
                          {choice.gainEnergy && (
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded border ${
                                choice.gainEnergy > 0
                                  ? 'text-sky-600 bg-sky-50 border-sky-200'
                                  : 'text-orange-600 bg-orange-50 border-orange-200'
                              }`}
                            >
                              Sức: {choice.gainEnergy > 0 ? `+${choice.gainEnergy}` : choice.gainEnergy} ⚡
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#FFF1F6] flex items-center justify-center text-[#F7A8C4] shrink-0 border border-[#FFD6E5]">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* TRƯỜNG HỢP 3: KHÔNG CÓ SỰ KIỆN NÀO ĐANG DIỄN RA */
            <div className="bg-white rounded-3xl p-6 border-2 border-[#FFD6E5] text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border-2 border-emerald-200">
                🌿
              </div>
              <div>
                <h3 className="text-base font-black text-[#7C5C55]">
                  Phố Phường Yên Bình & Buôn Bán Thuận Lợi!
                </h3>
                <p className="text-xs text-[#9C7C75] mt-1 max-w-xs mx-auto">
                  Hiện chưa có biến động hay tình huống khẩn cấp nào. Bấm nút dưới đây để dạo quanh ngõ phố hóng chuyện ngay!
                </p>
              </div>

              <button
                onClick={handleRollNewEvent}
                className="px-5 py-2.5 bg-[#F7A8C4] hover:bg-pink-400 text-white rounded-2xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Khám Phá Chuyện Trong Xóm 🎲</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
