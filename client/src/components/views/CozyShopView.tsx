import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  CUSTOMER_TYPES,
  RECIPES,
  INGREDIENTS,
  RESTAURANT_TYPES,
  EMPLOYEES,
} from '../../../../shared/gameData';
import {
  IngredientId,
  ActiveOrder,
  Employee,
} from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Clock,
  Sparkles,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Settings,
  Heart,
  Plus,
  Minus,
  AlertTriangle,
  RotateCcw,
  Check,
  Trash2,
} from 'lucide-react';

// Cấu hình 12 nguyên liệu chuẩn theo Master Asset Sheet của Quán Bánh Mì
interface BanhMiIngredientConfig {
  id: IngredientId;
  name: string;
  image: string;
  category: 'main' | 'veg' | 'sauce' | 'extra';
}

const MASTER_12_INGREDIENTS: BanhMiIngredientConfig[] = [
  // Hàng 1
  { id: 'bread', name: 'Bánh Mì', image: '/ui/banh_mi/ingredients/bread.png', category: 'main' },
  { id: 'egg', name: 'Trứng Ốp', image: '/ui/banh_mi/ingredients/egg.png', category: 'main' },
  { id: 'pork', name: 'Chả / Thịt', image: '/ui/banh_mi/ingredients/ham.png', category: 'main' },
  { id: 'pate', name: 'Pate Gan', image: '/ui/banh_mi/ingredients/pate.png', category: 'main' },
  { id: 'butter', name: 'Bơ Vàng', image: '/ui/banh_mi/ingredients/butter.png', category: 'main' },
  { id: 'cucumber', name: 'Dưa Leo', image: '/ui/banh_mi/ingredients/cucumber.png', category: 'veg' },
  // Hàng 2
  { id: 'herb', name: 'Đồ Chua', image: '/ui/banh_mi/ingredients/pickles.png', category: 'veg' },
  { id: 'spring_onion', name: 'Rau Thơm', image: '/ui/banh_mi/ingredients/herbs.png', category: 'veg' },
  { id: 'bun_broth', name: 'Ớt Cay', image: '/ui/banh_mi/ingredients/chili.png', category: 'extra' },
  { id: 'condensed_milk', name: 'Sốt Mayo', image: '/ui/banh_mi/ingredients/mayo.png', category: 'sauce' },
  { id: 'pepper_sauce', name: 'Nước Sốt', image: '/ui/banh_mi/ingredients/sauce.png', category: 'sauce' },
  { id: 'coffee', name: 'Gia Vị', image: '/ui/banh_mi/ingredients/bottles.png', category: 'sauce' },
];

export const CozyShopView: React.FC = () => {
  const {
    gameState,
    isShopOpen,
    openStoreForDay,
    completeCooking,
    serveDishOrder,
    collectPayment,
    openModal,
    activeOrders,
    setActiveOrders,
    forceCloseStoreTonight,
    showToast,
  } = useGameStore();

  const orders = activeOrders;
  const setOrders = setActiveOrders;
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  // Tab phân loại khay nguyên liệu ('banh_mi' | 'drink' | 'market' | 'other')
  const [activeTab, setActiveTab] = useState<'banh_mi' | 'drink' | 'market' | 'other'>('banh_mi');

  // Khay nguyên liệu đang chọn trên thớt (id -> số lượng)
  const [selectedIngredients, setSelectedIngredients] = useState<Partial<Record<IngredientId, number>>>({});

  // Feedback outcome pill tạm thời khi vừa hoàn thành món
  const [lastFeedbackOutcome, setLastFeedbackOutcome] = useState<'perfect' | 'ok' | 'wrong' | 'allergy' | null>(null);

  // Cấu hình cấp bậc & thương hiệu quán hiện tại
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;

  // Đơn hàng đang được chọn chế biến
  const activeOrder = orders.find((o) => o.tableIndex === selectedOrderIndex) || orders[0] || null;
  const currentRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  // Tự động chọn bàn đầu tiên nếu bàn hiện tại bị xóa
  useEffect(() => {
    if (selectedOrderIndex !== null && !orders.some((o) => o.tableIndex === selectedOrderIndex)) {
      setSelectedOrderIndex(orders[0]?.tableIndex ?? null);
    }
  }, [orders, selectedOrderIndex]);

  // Reset thớt khi chuyển order
  useEffect(() => {
    setSelectedIngredients({});
  }, [activeOrder?.id]);

  // Thêm nguyên liệu vào bánh mì trên thớt
  const addIngredient = (ingId: IngredientId) => {
    const stock = gameState.inventory[ingId] || 0;
    const currentQty = selectedIngredients[ingId] || 0;

    if (stock <= 0 || currentQty >= stock) {
      soundManager.playClick();
      showToast(`⚠️ Hết [${INGREDIENTS[ingId]?.name || ingId}] trong kho! Vào Chợ Sỉ 🛒 để nhập.`);
      openModal('market');
      return;
    }

    soundManager.playClick();
    setSelectedIngredients((prev) => ({
      ...prev,
      [ingId]: (prev[ingId] || 0) + 1,
    }));
  };

  // Làm lại thớt
  const clearCuttingBoard = () => {
    soundManager.playClick();
    setSelectedIngredients({});
  };

  const getPreparedIngredients = (): IngredientId[] =>
    Object.entries(selectedIngredients).flatMap(([id, qty]) =>
      Array.from({ length: qty || 0 }, () => id as IngredientId)
    );

  // Xử lý Hoàn Thành Món (Nút HOÀN THÀNH)
  const handleCompleteDish = () => {
    if (!activeOrder || !currentRecipe) {
      showToast('⚠️ Hiện chưa có khách gọi món tại quầy!');
      return;
    }

    const prepList = getPreparedIngredients();
    if (prepList.length === 0) {
      showToast('⚠️ Hãy cho nguyên liệu vào ổ bánh mì trước khi hoàn thành!');
      return;
    }

    // Kiểm tra độ khớp
    const removed = activeOrder.removedIngredients || [];
    const extra = activeOrder.extraIngredients || [];
    const hasAllergy = prepList.some((id) => removed.includes(id));
    const isMissingRequired = currentRecipe.requiredIngredients.some(
      (id) => !removed.includes(id) && !prepList.includes(id)
    );

    let outcome: 'perfect' | 'ok' | 'wrong' | 'allergy' = 'perfect';
    if (hasAllergy) {
      outcome = 'allergy';
    } else if (isMissingRequired) {
      outcome = 'wrong';
    } else if (extra.some((id) => !prepList.includes(id))) {
      outcome = 'ok';
    }

    setLastFeedbackOutcome(outcome);
    setTimeout(() => setLastFeedbackOutcome(null), 3000);

    const success = completeCooking(activeOrder.recipeId, activeOrder.tableIndex, prepList);
    if (success) {
      soundManager.playDishComplete();
      setSelectedIngredients({});
      confetti({
        particleCount: outcome === 'perfect' ? 45 : 20,
        spread: 60,
        origin: { y: 0.6 },
        colors: outcome === 'perfect' ? ['#10B981', '#34D399', '#FBBF24', '#F43F5E'] : ['#F59E0B', '#EF4444'],
      });
    }
  };

  // Đơn giá bán
  const playerPrice =
    activeOrder && currentRecipe
      ? gameState.menuSettings?.[activeRestId]?.prices?.[activeOrder.recipeId] ?? currentRecipe.basePrice
      : currentRecipe?.basePrice || 25000;

  // Tính tỷ lệ kiên nhẫn
  const patienceRatio = activeOrder && activeOrder.maxPatience > 0
    ? Math.max(0, Math.min(1, activeOrder.patienceRemaining / activeOrder.maxPatience))
    : 1;

  // Danh sách ghi chú của khách
  const removedIngs = activeOrder?.removedIngredients || [];
  const extraIngs = activeOrder?.extraIngredients || [];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none bg-[#FFF5F8] text-[#5C3A33] p-1.5 sm:p-2 gap-1.5 min-h-0">
      {/* 0. THÔNG BÁO CUỐI NGÀY 22:00: NGỪNG NHẬN KHÁCH & ĐANG PHỤC VỤ NỐT */}
      {gameState.gameTimeMinutes >= 1320 && orders.length > 0 && (
        <div className="shrink-0 bg-gradient-to-r from-amber-900 via-rose-950 to-amber-900 text-white px-3 py-1.5 rounded-2xl shadow-xs flex items-center justify-between text-xs animate-fade-in border border-amber-400/40">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🌙</span>
            <div>
              <span className="font-black text-amber-200">Đã 22:00 (Hết giờ đón khách)</span>
              <span className="text-amber-100/90 ml-1.5 hidden sm:inline">
                · Đang phục vụ nốt {orders.length} khách cuối cùng
              </span>
            </div>
          </div>
          <button
            onClick={() => forceCloseStoreTonight()}
            className="touch-control-btn px-2.5 py-1 bg-rose-800/80 hover:bg-rose-700 text-rose-100 hover:text-white rounded-xl font-bold text-[11px] transition-all border border-rose-500/40 cursor-pointer active:scale-95 shrink-0"
            title="Đóng cửa quán ngay (khách chưa phục vụ sẽ ra về)"
          >
            Dọn Quán Ngay 🧹
          </button>
        </div>
      )}

      {/* 1. QUẦY GỌI MÓN & HÀNG KHÁCH XẾP HÀNG (CUSTOMER QUEUE AREA THEO MASTER SHEET) */}
      <div className="shrink-0 bg-white rounded-2xl border-2 border-[#FFCCD9] shadow-xs overflow-hidden relative">
        {/* Mái hiên sọc hồng trắng Kawaii */}
        <div className="w-full h-5 sm:h-6 bg-[repeating-linear-gradient(45deg,#FF6584,#FF6584_12px,#FFFFFF_12px,#FFFFFF_24px)] border-b border-[#FFCCD9] flex items-center justify-between px-2.5 relative">
          <span className="text-[9px] sm:text-[10px] font-black text-white bg-[#FF6584] px-2 py-0.2 rounded-full shadow-2xs">
            🌸 QUẦY GỌI MÓN BÁNH MÌ
          </span>
          <span className="text-[9px] font-bold text-rose-900 bg-white/90 px-1.5 py-0.2 rounded-full">
            {orders.length} Khách đang đợi
          </span>
        </div>

        {/* Hàng ngang: Biển gỗ "QUẦY GỌI MÓN" + 8 Nhân vật Chibi Khách Hàng */}
        <div className="p-1.5 sm:p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Biển hiệu gỗ QUẦY GỌI MÓN */}
          <div className="shrink-0 w-24 sm:w-28 flex flex-col items-center justify-center">
            <img
              src="/ui/banh_mi/queue/sign_order.png"
              alt="Quầy Gọi Món"
              className="w-full h-auto object-contain drop-shadow-xs"
            />
          </div>

          {/* Dãy Khách Hàng Chibi Xếp Hàng Chờ Món */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {orders.length > 0 ? (
              orders.map((o, idx) => {
                const isSelected = activeOrder?.tableIndex === o.tableIndex;
                const custImgIndex = (o.tableIndex % 8) + 1;
                const custPatienceRatio = o.maxPatience > 0 ? Math.max(0, o.patienceRemaining / o.maxPatience) : 1;
                const recipe = RECIPES[o.recipeId];

                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedOrderIndex(o.tableIndex);
                    }}
                    className={`shrink-0 flex flex-col items-center p-1 rounded-2xl transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-100/90 ring-2 ring-[#FF6584] scale-105 shadow-sm'
                        : 'bg-pink-50/50 hover:bg-pink-50 border border-pink-100'
                    }`}
                  >
                    {/* Bong bóng món gọi */}
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-rose-300 shadow-2xs flex items-center justify-center text-xs sm:text-sm animate-bounce-short">
                      {recipe?.icon || '🥖'}
                    </div>

                    {/* Avatar chibi khách */}
                    <img
                      src={`/ui/banh_mi/queue/cust_${custImgIndex}.png`}
                      alt={`Khách ${o.tableIndex}`}
                      className="w-12 h-16 sm:w-14 sm:h-18 object-contain"
                    />

                    {/* Thanh kiên nhẫn mini */}
                    <div className="w-11 sm:w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5 border border-white">
                      <div
                        className={`h-full transition-all duration-300 ${
                          custPatienceRatio > 0.5
                            ? 'bg-emerald-500'
                            : custPatienceRatio > 0.25
                            ? 'bg-amber-500'
                            : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{ width: `${custPatienceRatio * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-[#5C3A33] mt-0.5">Bàn {o.tableIndex}</span>
                  </button>
                );
              })
            ) : (!isShopOpen || gameState.dayPhase === 'morning_prep') ? (
              /* PHA SÁNG: NÚT MỞ CỬA */
              <div className="flex-1 flex items-center justify-between p-2 bg-pink-50/60 rounded-xl border border-pink-200">
                <div className="text-xs font-bold text-amber-900 leading-tight">
                  🌅 <strong>Buổi sáng chuẩn bị:</strong> Kiểm tra kho nguyên liệu và mở cửa bán hàng nhé!
                </div>
                <button
                  onClick={openStoreForDay}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-xs animate-pulse cursor-pointer shrink-0"
                >
                  🚀 Mở Cửa
                </button>
              </div>
            ) : (
              /* ĐANG MỞ CỬA NHƯNG CHƯA CÓ KHÁCH VÀO BÀN */
              <div className="flex items-center gap-2 py-1 text-xs text-[#8C6258] font-bold">
                <span className="text-2xl animate-spin">⏳</span>
                <span>Khách đang chuẩn bị ghé tiệm bánh mì, sẵn sàng phục vụ nhé...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC THẺ ORDER CỦA KHÁCH & BÀN CHẾ BIẾN WORKBENCH (CHUẨN MASTER SHEET) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-2 flex-1 min-h-0">
        {/* CỘT TRÁI (MD: 5 CỘT) — THẺ ORDER CHI TIẾT BÉ GÁI NÓN VÀNG & 3 NÚT BẾP */}
        <div className="md:col-span-5 flex flex-col justify-between gap-1.5 min-h-0">
          {/* THẺ ORDER CARD */}
          {activeOrder && currentRecipe ? (
            <div className="bg-white rounded-2xl border-2 border-[#FFCCD9] p-2.5 shadow-xs flex flex-col justify-between relative overflow-hidden flex-1 min-h-[190px]">
              {/* Header Card: Bé gái nón vàng + Xem trước món bánh mì + Đồng hồ */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Bé gái chibi nón vàng */}
                  <img
                    src="/ui/banh_mi/queue/cust_3.png"
                    alt="Khách gọi món"
                    className="w-14 h-16 sm:w-16 sm:h-18 object-contain shrink-0"
                  />
                  <div>
                    <div className="text-xs font-black text-[#5C3A33] flex items-center gap-1">
                      <span>Bàn {activeOrder.tableIndex}</span>
                      <span className="text-[10px] bg-rose-100 text-[#FF6584] px-1.5 py-0.2 rounded-full font-bold">
                        {CUSTOMER_TYPES[activeOrder.typeId]?.name || 'Khách quen'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-rose-700 mt-0.5">
                      {currentRecipe.name}
                    </div>
                    <div className="text-[10px] font-extrabold text-amber-900">
                      Giá: {playerPrice.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>

                {/* Hộp xem trước ổ bánh mì & Đồng hồ đếm ngược */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl shadow-2xs">
                    {currentRecipe.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <Clock className="w-3 h-3 text-[#FF6584]" />
                    <span>{Math.ceil(activeOrder.patienceRemaining)}s</span>
                  </div>
                </div>
              </div>

              {/* 4 DÒNG SLOT DẶN DÒ CỦA KHÁCH THEO MASTER SHEET */}
              <div className="space-y-1 my-1.5 text-[11px] font-bold">
                {/* Dòng 1: Yêu thích (💖) */}
                <div className="flex items-center gap-1.5 bg-pink-50/70 border border-pink-200 px-2 py-1 rounded-xl">
                  <span className="text-sm">💖</span>
                  <span className="text-pink-900 truncate">Vị thơm ngon, bánh mì giòn rụm</span>
                </div>

                {/* Dòng 2: Thêm topping (➕) */}
                <div className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200 px-2 py-1 rounded-xl">
                  <span className="text-sm">➕</span>
                  <span className="text-emerald-900 truncate">
                    {extraIngs.length > 0
                      ? `Thêm: ${extraIngs.map((id) => INGREDIENTS[id]?.name || id).join(', ')}`
                      : 'Đúng chuẩn công thức truyền thống'}
                  </span>
                </div>

                {/* Dòng 3: Bỏ bớt topping (➖) */}
                <div className="flex items-center gap-1.5 bg-rose-50/70 border border-rose-200 px-2 py-1 rounded-xl">
                  <span className="text-sm">➖</span>
                  <span className="text-rose-900 truncate">
                    {removedIngs.length > 0
                      ? `Bỏ: ${removedIngs.map((id) => INGREDIENTS[id]?.name || id).join(', ')}`
                      : 'Đầy đủ mọi loại topping'}
                  </span>
                </div>

                {/* Dòng 4: Kiêng / Dị ứng (⚠️) */}
                <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200 px-2 py-1 rounded-xl">
                  <span className="text-sm">⚠️</span>
                  <span className="text-amber-950 truncate">
                    {activeOrder.orderNotes && activeOrder.orderNotes.length > 0
                      ? activeOrder.orderNotes.join(' · ')
                      : 'Ăn tại chỗ thơm ngon'}
                  </span>
                </div>
              </div>

              {/* THANH TIẾN ĐỘ KIÊN NHẪN (CAPSULE XANH LÁ + MẶT CƯỜI THEO MASTER SHEET) */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex-1 h-3 sm:h-3.5 bg-pink-100 rounded-full overflow-hidden p-0.5 border border-pink-300">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      patienceRatio > 0.5
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : patienceRatio > 0.25
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-rose-400 to-rose-500 animate-pulse'
                    }`}
                    style={{ width: `${patienceRatio * 100}%` }}
                  />
                </div>
                <span className="text-lg animate-bubble-wiggle">
                  {patienceRatio > 0.5 ? '😊' : patienceRatio > 0.25 ? '😐' : '😡'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-[#FFCCD9] p-4 flex flex-col items-center justify-center text-center shadow-xs flex-1 min-h-[190px]">
              <span className="text-4xl animate-bounce-short">🥖</span>
              <div className="text-xs sm:text-sm font-black text-[#5C3A33] mt-2">
                Chưa Có Khách Đang Gọi Món
              </div>
              <div className="text-xs text-[#8C6258] mt-1">
                Khách đến quầy sẽ xuất hiện thẻ dặn dò tại đây nhé!
              </div>
            </div>
          )}

          {/* BỘ 3 NÚT THAO TÁC BẾP (BỎ MÓN · LÀM LẠI · HOÀN THÀNH THEO MASTER SHEET) */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Nút 1: BỎ MÓN */}
            <button
              onClick={() => {
                soundManager.playClick();
                clearCuttingBoard();
                showToast('🗑️ Đã bỏ phần bánh mì đang làm dở!');
              }}
              className="touch-action-btn flex items-center justify-center p-0 rounded-2xl active:scale-95 transition-transform overflow-hidden shadow-xs cursor-pointer"
              title="Bỏ phần bánh mì đang làm dở"
            >
              <img
                src="/ui/banh_mi/buttons/btn_trash.png"
                alt="Bỏ Món"
                className="w-full h-auto object-contain hover:brightness-105"
              />
            </button>

            {/* Nút 2: LÀM LẠI */}
            <button
              onClick={() => {
                soundManager.playClick();
                clearCuttingBoard();
                showToast('🔄 Đã dọn thớt sạch sẽ để làm lại!');
              }}
              className="touch-action-btn flex items-center justify-center p-0 rounded-2xl active:scale-95 transition-transform overflow-hidden shadow-xs cursor-pointer"
              title="Dọn thớt làm lại từ đầu"
            >
              <img
                src="/ui/banh_mi/buttons/btn_reset.png"
                alt="Làm Lại"
                className="w-full h-auto object-contain hover:brightness-105"
              />
            </button>

            {/* Nút 3: HOÀN THÀNH */}
            <button
              onClick={handleCompleteDish}
              className="touch-action-btn flex items-center justify-center p-0 rounded-2xl active:scale-95 transition-transform overflow-hidden shadow-xs cursor-pointer"
              title="Hoàn thành món và trao cho khách"
            >
              <img
                src="/ui/banh_mi/buttons/btn_complete.png"
                alt="Hoàn Thành"
                className="w-full h-auto object-contain hover:brightness-105"
              />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (MD: 7 CỘT) — BÀN CHẾ BIẾN WORKBENCH THỰC TẾ & KHAY 12 NGUYÊN LIỆU */}
        <div className="md:col-span-7 flex flex-col justify-between gap-1.5 min-h-0">
          {/* BÀN CHẾ BIẾN WORKBENCH THỰC TẾ (LÒ NƯỚNG · THỚT BÁNH MÌ · KHAY TOPPING) */}
          <div className="bg-white rounded-2xl border-2 border-[#FFCCD9] p-1.5 sm:p-2 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="relative w-full rounded-xl overflow-hidden border border-amber-300/60 shadow-inner">
              <img
                src="/ui/banh_mi/workbench.png"
                alt="Bàn Chế Biến Bánh Mì"
                className="w-full h-auto object-contain block"
              />

              {/* LỚP PHỦ TƯƠNG TÁC: CÁC TOPPING ĐÃ CHO VÀO Ổ BÁNH MÌ TRÊN THỚT */}
              <div className="absolute top-[35%] left-[8%] w-[38%] h-[40%] flex flex-wrap items-center justify-center gap-0.5 p-1 pointer-events-none">
                {Object.entries(selectedIngredients).map(([ingId, qty]) => {
                  const ing = INGREDIENTS[ingId as IngredientId];
                  return (
                    <span
                      key={ingId}
                      className="px-1.5 py-0.5 bg-white/95 rounded-full text-[9px] sm:text-[10px] font-black text-[#5C3A33] border border-amber-300 shadow-xs animate-fade-in"
                    >
                      {ing?.icon || '✨'} {ing?.name.split(' ')[0] || ingId} x{qty}
                    </span>
                  );
                })}
              </div>

              {/* Pop-up Feedback Pill sau khi hoàn thành món */}
              {lastFeedbackOutcome && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-2 animate-bounce-short z-10">
                  <img
                    src={`/ui/banh_mi/feedbacks/${lastFeedbackOutcome}.png`}
                    alt={lastFeedbackOutcome}
                    className="max-w-[200px] h-auto object-contain drop-shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Nút hành động nhanh phục vụ / thu tiền nếu món đã xong */}
            {activeOrder && activeOrder.state === 'ready' && (
              <div className="mt-1 flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1.5 animate-pulse">
                <span className="text-xs font-black text-emerald-800">
                  ✨ Món đã làm xong! Hãy bưng ra bàn cho khách.
                </span>
                <button
                  onClick={() => {
                    soundManager.playDishComplete();
                    serveDishOrder(activeOrder.id);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Bưng Ra Bàn 🏃
                </button>
              </div>
            )}

            {activeOrder && activeOrder.state === 'paying' && (
              <div className="mt-1 flex items-center justify-between bg-amber-50 border border-amber-300 rounded-xl p-1.5 animate-pulse">
                <span className="text-xs font-black text-amber-900">
                  🪙 Khách Bàn {activeOrder.tableIndex} đã ăn xong và muốn tính tiền!
                </span>
                <button
                  onClick={() => {
                    soundManager.playCoin();
                    confetti({ particleCount: 35, spread: 50, origin: { y: 0.65 } });
                    collectPayment(activeOrder.id);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Thu Tiền 💰
                </button>
              </div>
            )}
          </div>

          {/* TAB DANH MỤC (BÁNH MÌ · ĐỒ UỐNG · CHỢ SỈ · KHÁC) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('banh_mi')}
              className={`flex-1 py-1 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'banh_mi'
                  ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] text-white shadow-2xs'
                  : 'bg-white border border-pink-200 text-[#5C3A33] hover:bg-pink-50'
              }`}
            >
              <span>🥖 Bánh Mì</span>
            </button>
            <button
              onClick={() => setActiveTab('drink')}
              className={`flex-1 py-1 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'drink'
                  ? 'bg-gradient-to-r from-[#FF6584] to-[#F43F5E] text-white shadow-2xs'
                  : 'bg-white border border-pink-200 text-[#5C3A33] hover:bg-pink-50'
              }`}
            >
              <span>🥤 Đồ Uống</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('market');
              }}
              className="flex-1 py-1 px-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            >
              <span>🛒 Chợ Sỉ</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                openModal('menuPricing');
              }}
              className="flex-1 py-1 px-2 bg-white border border-pink-200 text-[#5C3A33] hover:bg-pink-50 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            >
              <span>👨‍🍳 Chỉnh Giá</span>
            </button>
          </div>

          {/* KHAY 12 NGUYÊN LIỆU (LƯỚI 2X6 CHUẨN MASTER SHEET VỚI Ô ĐIỀN TỒN KHO) */}
          <div className="bg-white rounded-2xl border-2 border-[#FFCCD9] p-1.5 sm:p-2 shadow-xs">
            <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
              {MASTER_12_INGREDIENTS.map((item) => {
                const stock = gameState.inventory[item.id] || 0;
                const pickedCount = selectedIngredients[item.id] || 0;
                const isForbidden = removedIngs.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => addIngredient(item.id)}
                    className={`flex flex-col items-center justify-between p-0.5 rounded-xl transition-all cursor-pointer active:scale-95 relative ${
                      pickedCount > 0
                        ? 'bg-rose-50 ring-2 ring-[#FF6584] shadow-2xs'
                        : 'bg-white hover:bg-pink-50/50 border border-pink-100'
                    }`}
                  >
                    {/* Badge gạch cấm đỏ nếu khách dặn không ăn */}
                    {isForbidden && (
                      <div className="absolute top-0.5 left-0.5 text-xs z-10 animate-pulse" title="Khách dặn không lấy món này!">
                        🚫
                      </div>
                    )}

                    {/* Số lượng đã gắp vào thớt */}
                    {pickedCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-[#FF6584] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs z-10">
                        {pickedCount}
                      </span>
                    )}

                    {/* Hình ảnh nguyên liệu từ Master Sheet */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-auto object-contain max-h-11 sm:max-h-12"
                    />

                    {/* Ô capsule hiển thị số lượng tồn kho theo thời gian thực */}
                    <div className="w-full flex items-center justify-center mt-0.5">
                      <span
                        className={`text-[9.5px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                          stock > 0
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                        }`}
                      >
                        {stock}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. HÀNG PHÍM TẮT NHANH (SHIP · THUÊ NV · NÂNG CẤP · MENU & GIÁ THEO MASTER SHEET) */}
      <div className="shrink-0 flex items-center justify-between gap-1 pt-0.5">
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('delivery');
          }}
          className="flex-1 py-1.5 bg-[#E8F0FE] hover:bg-blue-100 text-[#1967D2] rounded-xl font-black text-[11px] border border-blue-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Ship</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('employees');
          }}
          className="flex-1 py-1.5 bg-[#FEF7E0] hover:bg-amber-100 text-[#B06000] rounded-xl font-black text-[11px] border border-amber-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Thuê NV</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('upgrades');
          }}
          className="flex-1 py-1.5 bg-[#F3E8FD] hover:bg-purple-100 text-[#7627BB] rounded-xl font-black text-[11px] border border-purple-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Nâng Cấp</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            openModal('menuPricing');
          }}
          className="flex-1 py-1.5 bg-[#FCE8E6] hover:bg-rose-100 text-[#C5221F] rounded-xl font-black text-[11px] border border-rose-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Menu & Giá</span>
        </button>
      </div>
    </div>
  );
};
