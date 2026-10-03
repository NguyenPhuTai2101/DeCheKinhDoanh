import React, { useState } from 'react';
import { useGameStore, ModalType } from '../store/gameStore';
import {
  Utensils,
  ShoppingBag,
  HeartHandshake,
  BookOpen,
  Megaphone,
  ArrowUpCircle,
  Users,
  Palette,
  Moon,
  Settings,
  LayoutGrid,
  SlidersHorizontal,
  Bike,
} from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import { HorizontalScrollBox } from './common/HorizontalScrollBox';

export const BottomBar: React.FC = () => {
  const { openModal, gameState, deliveryOrders } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = (modal: ModalType) => {
    soundManager.playClick();
    openModal(modal);
  };

  const currentStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);

  const menuItems: Array<{
    id: ModalType;
    label: string;
    icon: React.ReactNode;
    colorClasses: string;
    badge?: string | number | null;
    hasAlert?: boolean;
  }> = [
    {
      id: 'cooking',
      label: 'Nấu Ăn',
      icon: <Utensils className="w-4 h-4" />,
      colorClasses: 'bg-[#FFF1F6] border-[#F7A8C4] text-[#F7A8C4] group-hover:bg-[#F7A8C4] group-hover:text-white',
    },
    {
      id: 'market',
      label: `Chợ (${currentStock})`,
      icon: <ShoppingBag className="w-4 h-4" />,
      colorClasses: 'bg-[#FFF7ED] border-[#F7D7BA] text-amber-600 group-hover:bg-amber-400 group-hover:text-white',
    },
    {
      id: 'neighbors',
      label: 'Xóm Giềng',
      icon: <HeartHandshake className="w-4 h-4" />,
      colorClasses: 'bg-rose-50 border-rose-300 text-rose-500 group-hover:bg-rose-400 group-hover:text-white',
      badge: '❤️',
    },
    {
      id: 'ledger',
      label: 'Sổ Sách',
      icon: <BookOpen className="w-4 h-4" />,
      colorClasses: 'bg-amber-50 border-amber-300 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
    },
    {
      id: 'streetEvents',
      label: 'Chuyện Xóm',
      icon: <Megaphone className="w-4 h-4" />,
      colorClasses: 'bg-sky-50 border-sky-300 text-sky-600 group-hover:bg-sky-400 group-hover:text-white',
      hasAlert: !!gameState.currentEvent,
    },
    {
      id: 'delivery',
      label: deliveryOrders.length > 0 ? `Ship (${deliveryOrders.length})` : 'Giao Hàng',
      icon: <Bike className="w-4 h-4" />,
      colorClasses: 'bg-sky-50 border-sky-400 text-sky-600 group-hover:bg-sky-500 group-hover:text-white',
      badge: deliveryOrders.length > 0 ? deliveryOrders.length : null,
      hasAlert: deliveryOrders.length > 0,
    },
    {
      id: 'upgrades',
      label: 'Nâng Cấp',
      icon: <ArrowUpCircle className="w-4 h-4" />,
      colorClasses: 'bg-[#E8F5E9] border-[#A5D6A7] text-emerald-600 group-hover:bg-emerald-400 group-hover:text-white',
    },
    {
      id: 'employees',
      label: 'Nhân Sự',
      icon: <Users className="w-4 h-4" />,
      colorClasses: 'bg-[#EDE7F6] border-[#D1C4E9] text-purple-600 group-hover:bg-purple-400 group-hover:text-white',
      badge: gameState.hiredEmployees.length > 0 ? gameState.hiredEmployees.length : null,
    },
    {
      id: 'decor',
      label: 'Trang Trí',
      icon: <Palette className="w-4 h-4" />,
      colorClasses: 'bg-[#FFF1F6] border-[#F7A8C4] text-[#F7A8C4] group-hover:bg-[#F7A8C4] group-hover:text-white',
    },
    {
      id: 'dailySummary',
      label: 'Đi Ngủ',
      icon: <Moon className="w-4 h-4" />,
      colorClasses: 'bg-[#E0F2FE] border-[#BAE6FD] text-sky-600 group-hover:bg-sky-400 group-hover:text-white',
    },
    {
      id: 'settings',
      label: 'Cài Đặt',
      icon: <Settings className="w-3.5 h-3.5" />,
      colorClasses: 'bg-[#FFF1F6] border-[#FFD6E5] text-[#7C5C55] group-hover:bg-[#7C5C55] group-hover:text-white',
    },
  ];

  return (
    <nav className="w-full bg-[#FAF5EE] border-t-2 border-[#FFD6E5] shadow-lg z-30 shrink-0 relative">
      {/* Nút toggle chuyển đổi Chế độ Cuộn 1 hàng ↔ Lưới 2 hàng */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#FFF1F6]/80 border-b border-[#FFD6E5]/60 text-[9px] text-[#9C7C75]">
        <span className="font-bold">
          {isExpanded ? '📑 Danh Mục Tiện Ích (Tất cả)' : '👉 Vuốt sang ngang hoặc bấm mũi tên'}
        </span>
        <button
          onClick={() => {
            soundManager.playClick();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1 font-black text-pink-600 hover:text-pink-700 active:scale-95 transition-all"
        >
          {isExpanded ? (
            <>
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>Chế độ 1 Hàng</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-2.5 h-2.5" />
              <span>Hiện Tất Cả (Lưới)</span>
            </>
          )}
        </button>
      </div>

      {/* CHẾ ĐỘ 1: LƯỚI GỌN GÀNG (Hiển thị 100% không cần cuộn) */}
      {isExpanded ? (
        <div className="p-1.5 grid grid-cols-4 sm:grid-cols-6 gap-1 animate-slide-up">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleOpen(item.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90 relative"
            >
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${item.colorClasses}`}
              >
                {item.icon}
              </div>
              <span className="text-[9px] font-bold truncate max-w-full leading-tight">
                {item.label}
              </span>
              {item.hasAlert && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
              {item.badge && (
                <span className="absolute top-0 right-1 text-[8px] font-bold text-pink-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: CUỘN NGANG VỚI MŨI TÊN & KÉO CHUỘT MƯỢT MÀ */
        <HorizontalScrollBox
          showArrows={true}
          className="py-1 px-1 flex items-center gap-1 scrollbar-none"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleOpen(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl hover:bg-[#FFF1F6] text-[#7C5C55] transition-all group active:scale-90 shrink-0 relative"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${item.colorClasses}`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-bold whitespace-nowrap">
                {item.label}
              </span>
              {item.hasAlert && (
                <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              {item.badge && (
                <span className="absolute top-0.5 right-1.5 text-[9px] font-black text-pink-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </HorizontalScrollBox>
      )}
    </nav>
  );
};
