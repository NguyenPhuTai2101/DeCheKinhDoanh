import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SHOP_THEMES, DECORATION_ITEMS } from '../../../../shared/gameData';
import { ShopThemeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import { X, Palette, Sparkles, Check, Home, Edit3, Heart } from 'lucide-react';
import { HorizontalScrollBox } from '../common/HorizontalScrollBox';


export const DecorModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    buyTheme,
    setTheme,
    buyDecoration,
    toggleEquipDecoration,
    updateShopName,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'themes' | 'items' | 'branding'>('themes');
  const [newShopName, setNewShopName] = useState(gameState.shopName || 'Tiệm Bánh Mì Của Tôi 🌸');

  const totalCozyPoints = gameState.equippedDecorations.reduce((sum, decorId) => {
    const item = DECORATION_ITEMS.find((d) => d.id === decorId);
    return sum + (item ? item.cozyPoints : 0);
  }, 0);

  const handleSelectTheme = (themeId: ShopThemeId) => {
    soundManager.playClick();
    if (gameState.ownedThemes.includes(themeId)) {
      setTheme(themeId);
    } else {
      buyTheme(themeId);
    }
  };

  const handleDecorAction = (decorId: string) => {
    soundManager.playClick();
    if (gameState.ownedDecorations.includes(decorId)) {
      toggleEquipDecoration(decorId);
    } else {
      buyDecoration(decorId);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    soundManager.playClick();
    updateShopName(newShopName.trim());
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div role="dialog" aria-modal="true" aria-label="Decor" className="game-modal-panel bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-4 sm:px-6 py-3 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎨</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#7C5C55]">
                  Trang Trí & Diện Mạo Quán
                </h2>
                <span className="text-[10px] bg-[#FFE6A7] text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  ✨ Cozy: {totalCozyPoints} điểm
                </span>
              </div>
              <p className="text-[11px] text-[#9C7C75]">
                Tùy biến phong cách, sắm sửa nội thất để quán thêm xinh xắn
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <HorizontalScrollBox
          showArrows={true}
          className="flex items-center bg-[#FFF7ED] border-b border-[#F7D7BA] px-3 py-1.5 gap-2 shrink-0 scrollbar-none"
        >
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('themes');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'themes'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-white text-[#7C5C55] border border-[#F7D7BA]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Chủ Đề (Themes)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('items');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'items'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-white text-[#7C5C55] border border-[#F7D7BA]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nội Thất & Đồ Xinh ({gameState.equippedDecorations.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('branding');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'branding'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-white text-[#7C5C55] border border-[#F7D7BA]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Biển Hiệu & Tên Tiệm</span>
          </button>
        </HorizontalScrollBox>


        {/* Nội dung theo Tab */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {/* TAB 1: THEMES */}
          {activeTab === 'themes' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#9C7C75]">
                Chọn bảng màu chủ đạo để thay đổi toàn bộ không khí của quán:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(SHOP_THEMES).map((theme) => {
                  const isOwned = gameState.ownedThemes.includes(theme.id);
                  const isActive = gameState.activeTheme === theme.id;
                  const canAfford = gameState.money >= theme.cost;

                  return (
                    <div
                      key={theme.id}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                        isActive
                          ? 'border-[#F7A8C4] bg-[#FFF1F6] shadow-sm'
                          : 'border-[#F2E8E5] bg-white hover:border-[#FFD6E5]'
                      }`}
                    >
                      <div>
                        {/* Dải màu xem trước */}
                        <div className="h-6 w-full rounded-lg mb-2 flex overflow-hidden border border-slate-200">
                          <div className="flex-1" style={{ backgroundColor: theme.primaryColor }} />
                          <div className="flex-1" style={{ backgroundColor: theme.accentColor }} />
                          <div className="flex-1" style={{ backgroundColor: theme.bgColor }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm text-[#7C5C55]">{theme.name}</h4>
                          {isActive && (
                            <span className="text-[10px] font-black text-[#F7A8C4] bg-white px-2 py-0.5 rounded-full border border-[#F7A8C4]">
                              Đang Dùng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#9C7C75] mt-1">{theme.description}</p>
                      </div>

                      <div className="pt-2 border-t border-[#F2E8E5] flex items-center justify-between">
                        <span className="text-xs font-black text-[#7C5C55]">
                          {isOwned ? (
                            <span className="text-emerald-600 font-bold">Đã sở hữu</span>
                          ) : (
                            <span className="text-[#F7A8C4]">{theme.cost.toLocaleString('vi-VN')} đ</span>
                          )}
                        </span>

                        <button
                          onClick={() => handleSelectTheme(theme.id)}
                          disabled={!isOwned && !canAfford}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                            isActive
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : isOwned
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : canAfford
                              ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-sm'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'Đang Dùng' : isOwned ? 'Kích Hoạt' : 'Mở Khóa'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DECOR ITEMS */}
          {activeTab === 'items' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#9C7C75]">
                Vật phẩm trang trí giúp quán đạt điểm <strong>Cozy</strong> cao hơn, giữ chân khách lâu hơn:
              </p>

              <div className="flex flex-col gap-2.5">
                {DECORATION_ITEMS.map((item) => {
                  const isOwned = gameState.ownedDecorations.includes(item.id);
                  const isEquipped = gameState.equippedDecorations.includes(item.id);
                  const canAfford = gameState.money >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-[#FFF7ED] border-[#F7D7BA]'
                          : 'bg-white border-[#F2E8E5]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl bg-[#FFF1F6] p-2 rounded-2xl border border-[#FFD6E5] shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs sm:text-sm text-[#7C5C55] truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full shrink-0">
                              +{item.cozyPoints} Cozy
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            ✨ {item.bonusEffectDesc}
                          </p>
                          <div className="text-[10px] text-[#9C7C75] mt-0.5">{item.description}</div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {!isOwned && (
                          <span className="text-xs font-black text-[#F7A8C4]">
                            {item.cost.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                        <button
                          onClick={() => handleDecorAction(item.id)}
                          disabled={!isOwned && !canAfford}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                            isEquipped
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : isOwned
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : canAfford
                              ? 'bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-sm'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isEquipped ? 'Cất Kho' : isOwned ? 'Trưng Bày' : 'Mua Ngay'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <div className="bg-[#FFF1F6] p-4 rounded-2xl border border-[#FFD6E5] flex flex-col gap-2">
                <label className="text-xs font-black text-[#7C5C55]">
                  Đặt tên cho tiệm của bạn:
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-[#F7A8C4] bg-white text-sm font-bold text-[#7C5C55] outline-none focus:ring-2 focus:ring-[#FFD6E5]"
                  placeholder="Ví dụ: Tiệm Bánh Mì Bé Bơ..."
                />
                <p className="text-[11px] text-[#9C7C75]">
                  Tên tiệm sẽ xuất hiện trên mái hiên, bảng tổng kết ngày và danh thiếp thương hiệu.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F7A8C4] hover:bg-[#f28bb1] text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95"
              >
                Lưu Tên Tiệm Mới 🌸
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
