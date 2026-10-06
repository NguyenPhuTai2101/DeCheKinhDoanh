import React from 'react';
import { IngredientIcon } from '../common/IngredientIcon';
import { useGameStore } from '../../store/gameStore';
import { RECIPES, INGREDIENTS, RESTAURANT_TYPES } from '../../../../shared/gameData';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import { X, Bike, Check, Clock, DollarSign, Plus, PhoneCall } from 'lucide-react';

export const DeliveryModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    deliveryOrders,
    fulfillDeliveryOrder,
    spawnDeliveryOrder,
    cancelDeliveryOrder,
  } = useGameStore();

  const currentRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[currentRestId] || RESTAURANT_TYPES.banh_mi;
  const unlocked = gameState.businessStage !== 'cart' || gameState.player.cookingLevel >= 2;

  // Lọc chỉ giữ đơn thuộc quán hiện tại
  const matchingOrders = deliveryOrders.filter((order) =>
    currentRest.primaryRecipeIds.includes(order.recipeId)
  );

  // Tự động dọn dẹp đơn cũ của quán khác nếu còn sót lại trong store
  React.useEffect(() => {
    if (deliveryOrders.some((o) => !currentRest.primaryRecipeIds.includes(o.recipeId))) {
      useGameStore.setState({
        deliveryOrders: matchingOrders,
      });
    }
  }, [currentRest, deliveryOrders, matchingOrders]);

  const handleDeliver = (orderId: string) => {
    const success = fulfillDeliveryOrder(orderId);
    if (success) {
      soundManager.playClick();
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#0284C7', '#38BDF8', '#F59E0B'],
      });
    }
  };

  const handleCallOrder = () => {
    soundManager.playDoorBell();
    spawnDeliveryOrder();
  };

  return (
    <div className="game-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div role="dialog" aria-modal="true" aria-label="Delivery" className="game-modal-panel bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-sky-400 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col h-[85dvh] sm:h-auto sm:max-h-[82vh] animate-slide-up">
        {/* Header */}
        <div className="bg-sky-50 px-5 py-3.5 border-b-2 border-sky-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛵</span>
            <div>
              <h2 className="text-lg font-black text-sky-950 flex items-center gap-2">
                <span>Đội Xe Giao Hàng Chú Năm</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-extrabold">
                  {currentRest.icon} {currentRest.name}
                </span>
              </h2>
              <p className="text-xs text-sky-700">
                Nhận đơn mang đi & Ship tận nơi cho công ty, trường học trong xóm
              </p>
            </div>
          </div>
          <button aria-label="Đóng cửa sổ"
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white hover:bg-sky-100 flex items-center justify-center text-sky-900 shadow-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin Chú Năm & Thống kê */}
        <div className="bg-white/90 p-3.5 border-b border-sky-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-2xl shrink-0">
              🛵
            </div>
            <div>
              <div className="font-black text-sky-950">Chú Năm Shipper</div>
              <div className="text-[11px] text-sky-700 font-medium">
                Đã hoàn thành: <span className="font-bold text-amber-600">{gameState.totalDeliveriesCompleted || 0}</span> đơn giao
              </div>
            </div>
          </div>

          <button
            disabled={!unlocked || !useGameStore.getState().isShopOpen || matchingOrders.length > 0}
            onClick={handleCallOrder}
            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Kiểm tra đơn mới</span>
          </button>
        </div>

        {/* Danh sách đơn giao hàng */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!unlocked && <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm font-bold text-[#87615e]">Giao hàng mở khi tay nghề đạt cấp 2 hoặc quán lên Góc Phố. Luyện làm món tại bàn trước nhé!</p>}
          {matchingOrders.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border-2 border-dashed border-sky-200 text-center space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-bold text-sky-950">
                Hiện chưa có đơn đặt mang về nào cho {currentRest.name}!
              </p>
              <p className="text-[11px] text-sky-700 max-w-xs mx-auto">
                Mở cửa để nhận đơn. Đơn dùng chung bếp với khách tại bàn; bạn chỉ nhận tiền sau khi giao xong.
              </p>
            </div>
          ) : (
            matchingOrders.map((order) => {
              const recipe = RECIPES[order.recipeId];
              if (!recipe) return null;

              // Kiểm tra nguyên liệu trong kho
              let hasStock = true;
              for (const ing of recipe.requiredIngredients) {
                if ((gameState.inventory[ing] || 0) < order.quantity) {
                  hasStock = false;
                  break;
                }
              }

              const totalEarned = order.rewardMoney + order.rewardTip - (order.shippingFee || Math.round(order.rewardMoney * 0.1));

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border-2 border-sky-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl bg-sky-50 p-2 rounded-2xl border border-sky-200">
                        {recipe.icon}
                      </span>
                      <div>
                        <div className="text-xs font-black text-sky-950">
                          {order.customerName}
                        </div>
                        <div className="text-xs font-bold text-sky-700">
                          {order.quantity}x {recipe.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-600">
                        +{totalEarned.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold">
                        (Tip: +{order.rewardTip.toLocaleString('vi-VN')} đ)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-bold"><span>⏱ Còn {Math.ceil(order.timeRemainingSeconds)}s</span><span>{order.status === 'pending' ? 'Chờ nhận' : order.status === 'cooking' ? `Đang nấu · ${Math.ceil(order.workRemainingSeconds || 0)}s · ${order.chefName}` : order.status === 'ready' ? 'Đã đóng gói · chờ bàn giao' : `Đang giao · ${Math.ceil(order.workRemainingSeconds || 0)}s`}</span></div>
                  <p className="text-xs text-[#87615e]">Đóng cửa sổ để tiếp tục thời gian. Phí ship 10% giá món; nguyên liệu đã dùng sẽ không hoàn lại khi hủy.</p>
                  {/* Danh sách nguyên liệu cần để giao */}
                  <div className="bg-[#FAF5EE] p-2.5 rounded-xl border border-sky-100 text-xs">
                    <div className="text-[10px] font-bold text-[#9C7C75] mb-1">
                      Nguyên liệu cần cho {order.quantity} suất:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.requiredIngredients.map((ingId) => {
                        const ing = INGREDIENTS[ingId];
                        const available = gameState.inventory[ingId] || 0;
                        const needed = order.quantity;
                        const isEnough = available >= needed;

                        return (
                          <span
                            key={ingId}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                              isEnough
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <IngredientIcon id={ingId} size={20}/> {ing?.name}: {available}/{needed}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeliver(order.id)}
                      disabled={!useGameStore.getState().isShopOpen || (order.status === 'pending' && !hasStock) || ['cooking','delivering'].includes(order.status)}
                      className="flex-1 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{order.status === 'pending' ? (hasStock ? 'Nhận đơn & chế biến' : 'Thiếu nguyên liệu · Đi chợ') : order.status === 'ready' ? 'Bàn giao cho Chú Năm' : order.status === 'cooking' ? 'Bếp đang chế biến…' : 'Chú Năm đang giao…'}</span>
                    </button>

                    <button
                      onClick={() => cancelDeliveryOrder(order.id)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl active:scale-95"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
