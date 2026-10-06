import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { NEIGHBORS_DATA, RECIPES, DREAM_BOOK_NUMBERS } from '../../../../shared/gameData';
import { NeighborId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { X, Heart, MessageCircle, Gift, Sparkles, Ticket, BookOpen, Check, Dices, Flame } from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';


export const NeighborsModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    interactNeighbor,
    giveGiftToNeighbor,
    buyLotteryTicket,
    playInstantLotteryDraw,
    checkLotteryDraw,
  } = useGameStore();

  const [selectedNeighborId, setSelectedNeighborId] = useState<NeighborId>('bac_ba');
  const [activeTab, setActiveTab] = useState<'chat' | 'secrets' | 'lottery'>('chat');
  const [lotteryNumber, setLotteryNumber] = useState('68');
  const [lotteryBet, setLotteryBet] = useState(10000);
  const [lotteryType, setLotteryType] = useState<'de' | 'lo'>('de');

  const selectedData = NEIGHBORS_DATA[selectedNeighborId];
  const relation = gameState.neighbors[selectedNeighborId] || {
    level: 1,
    intimacyExp: 0,
    unlockedSecretIds: [],
    lastInteractedDay: 0,
  };

  const favoriteRecipe = RECIPES[selectedData.favoriteDishId];
  const currentDialogue = selectedData.dialogues[relation.level] || selectedData.dialogues[1];

  const handleInteract = () => {
    soundManager.playClick();
    interactNeighbor(selectedNeighborId);
  };

  const handleGift = () => {
    soundManager.playClick();
    giveGiftToNeighbor(selectedNeighborId, selectedData.favoriteDishId);
  };

  const handleBuyLottery = () => {
    soundManager.playCoin();
    buyLotteryTicket();
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div role="dialog" aria-modal="true" aria-label="Neighbors" className="game-modal-panel bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#F7A8C4] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="bg-[#FFF1F6] px-5 py-3.5 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏘️</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Bà Con Xóm Giềng</h2>
              <p className="text-xs text-[#9C7C75]">
                Giao lưu tình làng nghĩa xóm, lắng nghe tâm sự & mở khóa bí mật
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#7C5C55] shadow-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách Avatar hàng xóm nằm ngang */}
        <HorizontalScrollBox
          showArrows={true}
          className="bg-white/80 px-3 py-2.5 border-b border-[#FFD6E5] flex gap-2.5 shrink-0 scrollbar-none"
        >
          {(Object.keys(NEIGHBORS_DATA) as NeighborId[]).map((id) => {
            const n = NEIGHBORS_DATA[id];
            const rel = gameState.neighbors[id] || { level: 1, intimacyExp: 0, unlockedSecretIds: [] };
            const isSelected = selectedNeighborId === id;

            return (
              <button
                key={id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedNeighborId(id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#FFF1F6] border-[#F7A8C4] shadow-sm scale-105'
                    : 'bg-white border-[#E5E0D8] opacity-80 hover:opacity-100'
                }`}
              >
                <span className="text-2xl">{n.avatar}</span>
                <div className="text-left">
                  <div className="text-xs font-black text-[#7C5C55] flex items-center gap-1">
                    {n.name}
                    <span className="text-pink-500 text-[11px]">❤️{rel.level}</span>
                  </div>
                  <div className="text-[10px] text-[#9C7C75] font-medium">{n.nickname}</div>
                </div>
              </button>
            );
          })}
        </HorizontalScrollBox>


        {/* Nội dung chi tiết nhân vật đang chọn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Card thông tin nhân vật */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF1F6] border-2 border-[#F7A8C4] flex items-center justify-center text-4xl shadow-inner shrink-0">
                {selectedData.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-[#7C5C55]">{selectedData.name}</h3>
                  <span className="text-xs font-bold text-pink-600 bg-[#FFF1F6] px-2.5 py-0.5 rounded-full border border-[#FFD6E5]">
                    {selectedData.role}
                  </span>
                </div>

                {/* Thanh thiện cảm (Hearts) */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#7C5C55] mb-1">
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < relation.level
                              ? 'text-pink-500 fill-pink-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] text-[#9C7C75]">Cấp {relation.level}/5</span>
                    </span>
                    <span className="text-[11px] text-pink-500">{relation.intimacyExp}/100 Thân Thiết</span>
                  </div>
                  <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, relation.intimacyExp)}%` }}
                    />
                  </div>
                </div>

                {/* Đặc quyền hàng xóm */}
                <div className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  ✨ {selectedNeighborId !== 'co_bay' && relation.level < 2 ? 'Mở đặc quyền khi thân thiết cấp 2: ' : 'Đặc quyền đang áp dụng: '}{selectedData.perkDescription}
                </div>
              </div>
            </div>

            {/* Sub-tabs: Trò chuyện / Bí mật / Tính năng riêng */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-[#FFD6E5]">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#F7A8C4] text-white shadow-sm'
                    : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Tâm Sự
              </button>
              <button
                onClick={() => setActiveTab('secrets')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'secrets'
                    ? 'bg-[#F7A8C4] text-white shadow-sm'
                    : 'bg-[#FFF1F6] text-[#7C5C55] hover:bg-pink-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Bí Mật ({relation.unlockedSecretIds.length}/{selectedData.secrets.length})
              </button>

              {selectedNeighborId === 'co_bay' && (
                <button
                  onClick={() => setActiveTab('lottery')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'lottery'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Vé Số Chiều
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: TÂM SỰ & TƯƠNG TÁC */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {/* Khung đối thoại */}
              <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E5] shadow-sm relative">
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-[#FFF1F6] border border-[#FFD6E5] rounded-full text-[10px] font-bold text-[#7C5C55]">
                  Lời dặn của {selectedData.name}
                </div>
                <p className="text-xs text-[#7C5C55] italic leading-relaxed pt-1">
                  "{currentDialogue}"
                </p>
              </div>

              {/* Hai nút hành động: Nói chuyện & Tặng quà */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleInteract}
                  className="bg-white hover:bg-[#FFF1F6] border-2 border-[#F7A8C4] p-3 rounded-2xl flex flex-col items-center gap-1 text-[#7C5C55] font-bold text-xs shadow-sm active:scale-95 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                  <span>Trò Chuyện</span>
                  <span className="text-[10px] text-pink-500 font-medium">+20 Thân Thiết</span>
                </button>

                <button
                  onClick={handleGift}
                  className="bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-[#F7A8C4] p-3 rounded-2xl flex flex-col items-center gap-1 text-[#7C5C55] font-bold text-xs shadow-sm active:scale-95 transition-all"
                >
                  <Gift className="w-5 h-5 text-rose-500" />
                  <span>Tặng {favoriteRecipe?.name || 'Món Quán'}</span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    Món ruột (+45 Thân Thiết)
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BÍ MẬT XÓM GIỀNG */}
          {activeTab === 'secrets' && (
            <div className="space-y-3">
              {selectedData.secrets.map((secret) => {
                const isUnlocked = relation.unlockedSecretIds.includes(secret.level);

                return (
                  <div
                    key={secret.level}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      isUnlocked
                        ? 'bg-white border-[#FFD6E5] shadow-sm'
                        : 'bg-[#F2ECE4] border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-black text-[#7C5C55] flex items-center gap-1.5">
                        <span>{isUnlocked ? '📖' : '🔒'}</span>
                        <span>{secret.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-pink-500">
                        {isUnlocked ? 'Đã mở khóa' : `Cần ❤️ Cấp ${secret.level}`}
                      </span>
                    </div>

                    <p className="text-xs text-[#7C5C55] leading-relaxed">
                      {isUnlocked ? secret.story : 'Hãy trò chuyện và tặng món ngon để mở khóa mẩu chuyện này.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: VÉ SỐ & SỔ MƠ DÂN GIAN CÔ BẢY */}
          {activeTab === 'lottery' && selectedNeighborId === 'co_bay' && (
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
                    <span>🎟️</span> Xổ Số, Đánh Đề & Sổ Mơ Dân Gian
                  </h4>
                  <p className="text-xs text-amber-700">
                    Ghi số may mắn với Cô Bảy · Đề đuôi ăn gấp 70 lần vốn!
                  </p>
                </div>
                <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                  Ăn x70 🔥
                </span>
              </div>

              {/* Vé số hiện tại chờ xổ */}
              {gameState.activeLotteryTicket ? (
                <div className="p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl border-2 border-dashed border-amber-400 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] font-bold text-amber-800">TẤM VÉ CHỜ MỞ THƯỞNG 16:30</div>
                    <div className="text-2xl font-black text-amber-900 tracking-wider">
                      Số: [{gameState.activeLotteryTicket.ticketNumber}]
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold">
                      Cược: {gameState.activeLotteryTicket.cost.toLocaleString('vi-VN')} đ (
                      {gameState.activeLotteryTicket.betType === 'lo' ? 'Bao Lô' : 'Đề Đuôi x70'})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold shadow-sm">
                      Chờ 16h30 Xổ ⏰
                    </span>
                  </div>
                </div>
              ) : null}

              {/* KHU VỰC CHỌN SỐ VÀ MỨC CƯỢC */}
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-amber-200 space-y-3">
                {/* 1. Chọn kiểu đánh */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setLotteryType('de');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                      lotteryType === 'de'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Đề Đuôi (Ăn x70)</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setLotteryType('lo');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                      lotteryType === 'lo'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Bao Lô (Ăn x35)</span>
                  </button>
                </div>

                {/* 2. Nhập số & Random */}
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-950">
                    Số Bạn Chọn (00 - 99):
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={lotteryNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 2) setLotteryNumber(val);
                      }}
                      className="w-14 h-10 text-center font-black text-xl bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                        setLotteryNumber(rand);
                      }}
                      className="px-2.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1 active:scale-95 transition-all"
                      title="Quay số ngẫu nhiên"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Hên Xui</span>
                    </button>
                  </div>
                </div>

                {/* 3. Mức cược */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-amber-900">Mức Tiền Cược:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5000, 10000, 20000, 50000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          soundManager.playClick();
                          setLotteryBet(amt);
                        }}
                        className={`py-1.5 rounded-xl text-[11px] font-black transition-all ${
                          lotteryBet === amt
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        {(amt / 1000).toFixed(0)}k đ
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Hai nút bấm hành động */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundManager.playCoin();
                      const num = lotteryNumber.padStart(2, '0');
                      buyLotteryTicket(num, lotteryBet, lotteryType);
                    }}
                    disabled={gameState.money < lotteryBet}
                    className={`py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all ${
                      gameState.money >= lotteryBet
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Ghi Vé Chiều (16h30)</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playCoin();
                      const num = lotteryNumber.padStart(2, '0');
                      playInstantLotteryDraw(num, lotteryBet, lotteryType);
                    }}
                    disabled={gameState.money < lotteryBet}
                    className={`py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all ${
                      gameState.money >= lotteryBet
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quay Thử Ngay 🎲</span>
                  </button>
                </div>
              </div>

              {/* SỔ MƠ DÂN GIAN GEN Z */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                    <span>📖</span> Sổ Mơ Dân Gian Gen Z (Chạm để chọn số)
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Tâm linh chuẩn bài</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {DREAM_BOOK_NUMBERS.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundManager.playClick();
                        setLotteryNumber(d.number);
                      }}
                      className={`p-1.5 rounded-xl text-left border text-[11px] font-bold flex items-center justify-between transition-all ${
                        lotteryNumber === d.number
                          ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                          : 'bg-[#FAF5EE] border-amber-200 text-[#7C5C55] hover:bg-amber-50'
                      }`}
                    >
                      <span className="truncate pr-1">
                        {d.icon} {d.dream}
                      </span>
                      <span className="bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-black text-[10px] shrink-0">
                        {d.number}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bảng cơ cấu giải thưởng */}
              <div className="bg-[#FAF5EE] p-3 rounded-xl border border-amber-200 text-xs space-y-1 text-[#7C5C55]">
                <div className="font-bold text-[#7C5C55] mb-1">Cơ Cấu Giải Thưởng Vỉa Hè:</div>
                <div className="flex justify-between">
                  <span>👑 Trùng khớp 2 số (Độc Đắc Đề Đuôi):</span>
                  <span className="font-bold text-amber-700">Ăn x70 lần (Ví dụ 10k ăn 700k)</span>
                </div>
                <div className="flex justify-between">
                  <span>✨ Trùng đuôi hàng đơn vị (Giải Nhì):</span>
                  <span className="font-bold text-amber-700">Ăn x4 lần tiền cược</span>
                </div>
                <div className="flex justify-between">
                  <span>⭐ Liền kề ±1 số (Giải An Ủi):</span>
                  <span className="font-bold text-amber-700">Ăn x2 lần tiền cược</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
