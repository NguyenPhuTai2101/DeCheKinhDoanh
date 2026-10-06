import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, RECIPES, getBranchTierInfo, BUSINESS_STAGES, EMPLOYEES } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Crown,
  ChevronRight,
  Coins,
  AlertTriangle,
  Receipt,
  DollarSign,
  Zap,
} from 'lucide-react';

export const FranchiseModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    switchActiveRestaurant,
    unlockRestaurantFranchise,
    upgradeBranch,
    assignEmployeeToRestaurant,
  } = useGameStore();

  const currentRestId = gameState.activeRestaurantId || 'banh_mi';
  const unlockedList = gameState.unlockedRestaurants || ['banh_mi'];
  const restaurants = Object.values(RESTAURANT_TYPES);
  const branchLevels: Record<string, number> = gameState.branchLevels || {};
  const currentStage = BUSINESS_STAGES[gameState.businessStage || 'cart'] || BUSINESS_STAGES.cart;
  const maxRestaurants = currentStage.maxRestaurants ?? 1;
  const isBranchCapReached = unlockedList.length >= maxRestaurants;
  const hasChainManager = gameState.hiredEmployees.includes('emp_quan');

  const handleSwitch = (id: RestaurantTypeId) => {
    soundManager.playClick();
    switchActiveRestaurant(id);
    closeModal();
  };

  const handleUnlock = (id: RestaurantTypeId) => {
    soundManager.playCoin();
    const success = unlockRestaurantFranchise(id);
    if (success) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
      });
      closeModal();
    }
  };

  const handleUpgradeBranch = (id: RestaurantTypeId) => {
    soundManager.playCoin();
    const success = upgradeBranch(id);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-300 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 px-4 py-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏢</span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight drop-shadow-2xs">
                Chuỗi Đế Chế Ẩm Thực Đa Ngành
              </h2>
              <p className="text-[11px] text-amber-100 font-medium">
                Mở rộng & Nâng cấp 5 thương hiệu: Phở, Bún Bò, Bò Né, Cơm Tấm, Bánh Mì
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thống kê chuỗi chi nhánh & giới hạn theo sự nghiệp */}
        <div className="bg-amber-100/60 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-950 flex items-center gap-1">
              <span>🏪 Chi nhánh:</span>
              <span className={isBranchCapReached ? "text-amber-900 font-black" : "text-emerald-700 font-black"}>
                {unlockedList.length}/{maxRestaurants} Quán ({currentStage.name})
              </span>
            </span>
            <span className="text-amber-800 font-bold flex items-center gap-1">
              <span>👥 Nhân sự:</span>
              <span className="text-emerald-700 font-black">{gameState.hiredEmployees.length}/{currentStage.maxStaff ?? 2} NV</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-900">
            <span>Ví: <strong className="text-rose-600">{gameState.money.toLocaleString('vi-VN')} đ</strong></span>
            <span>·</span>
            <span>⭐ Uy tín: <strong>{gameState.reputation}</strong></span>
          </div>
        </div>

        {/* Danh sách 5 thương hiệu ẩm thực */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3.5">
          {restaurants.map((rest) => {
            const isCurrent = rest.id === currentRestId;
            const isUnlocked = unlockedList.includes(rest.id);
            const staffReq = rest.requiredStaffCount || 0;
            const hasStaffReq = gameState.hiredEmployees.length >= staffReq;
            const canAffordMoney = gameState.money >= rest.unlockCost;
            const canAffordRep = gameState.reputation >= rest.requiredReputation;
            const canUnlock = !isUnlocked && canAffordMoney && canAffordRep && hasStaffReq && !isBranchCapReached;

            const branchStaff = gameState.hiredEmployees
              .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
              .filter((e) => e && (e.assignedRestaurantId || 'banh_mi') === rest.id);

            const hasCook = branchStaff.some((e) => e?.role === 'cook');
            const hasServer = branchStaff.some((e) => e?.role === 'server');
            const hasManager = branchStaff.some((e) => e?.role === 'manager');
            const branchFinance = gameState.branchFinances?.[rest.id];

            const branchLvl = branchLevels[rest.id] || 1;
            const tierInfo = getBranchTierInfo(rest.id, branchLvl);
            const nextTier = tierInfo.nextTier;
            const canUpgradeBranch =
              isUnlocked &&
              nextTier &&
              gameState.money >= nextTier.cost &&
              gameState.reputation >= nextTier.requiredReputation &&
              branchStaff.length >= nextTier.requiredStaff;

            return (
              <div
                key={rest.id}
                className={`rounded-2xl p-3 sm:p-3.5 border-2 transition-all relative ${
                  isCurrent
                    ? 'bg-white border-amber-500 ring-2 ring-amber-200 shadow-md'
                    : isUnlocked
                    ? 'bg-white/95 border-emerald-300 shadow-xs hover:border-emerald-400'
                    : 'bg-slate-50 border-slate-300 opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon & Thông tin quán */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      style={{ backgroundColor: rest.accentColor }}
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 border border-black/5 mt-0.5"
                    >
                      {rest.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-sm text-slate-800 leading-tight">
                          {rest.name}
                        </h4>
                        {isCurrent && (
                          <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.2 rounded-full">
                            Đang Đứng Bếp 👑
                          </span>
                        )}
                        {isUnlocked && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded-md">
                            Cấp {branchLvl}/5
                          </span>
                        )}
                        {isUnlocked && !isCurrent && (
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                              hasCook
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : hasManager
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : branchStaff.length === 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {hasCook
                              ? `Tự động bán (${branchStaff.length} NV)`
                              : hasManager
                              ? `Quản lý kiêm nhiệm (${branchStaff.length} NV) ⭐`
                              : branchStaff.length === 0
                              ? 'Vận hành thời vụ (50% CS) ⚡'
                              : 'Thiếu Đầu Bếp ⚠️'}
                          </span>
                        )}
                      </div>

                      <div
                        style={{ color: rest.themeColor }}
                        className="text-[9.5px] font-extrabold mt-0.5 flex items-center gap-1"
                      >
                        <Award className="w-2.5 h-2.5" />
                        <span>{rest.badge}</span>
                      </div>

                      <p className="text-[10px] text-slate-600 italic mt-0.5 font-medium line-clamp-1">
                        "{rest.tagline}"
                      </p>

                      {/* Dụng cụ nấu & Thực đơn */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[9px]">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-1">
                          <span>{rest.equipmentIcon}</span>
                          <span>{rest.equipmentName}</span>
                        </span>
                        <span className="text-slate-500 font-bold">
                          {rest.primaryRecipeIds.length} món đặc sản
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BÁO CÁO P&L HÔM NAY VÀ TRẠNG THÁI NHÂN SỰ CHI NHÁNH */}
                {isUnlocked && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div className="bg-white p-1 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[9px]">Doanh thu</span>
                        <span className="font-black text-emerald-600">
                          +{(branchFinance?.revenue || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[9px]">Giá vốn (COGS)</span>
                        <span className="font-black text-rose-500">
                          -{(branchFinance?.cogs || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[9px]">Lợi nhuận gộp</span>
                        <span className="font-black text-slate-800">
                          +{(branchFinance?.grossProfit || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[9px]">Khách phục vụ</span>
                        <span className="font-black text-amber-700">
                          {branchFinance?.customersServed || 0} khách
                        </span>
                      </div>
                    </div>

                    {!isCurrent && (
                      <div className="flex flex-wrap gap-1 text-[9.5px]">
                        {hasCook ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Đầu bếp đứng nấu tự động ({branchStaff.length} nhân sự)</span>
                          </span>
                        ) : hasManager ? (
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>Quản lý kiêm nhiệm đứng bếp & điều hành (+15% Doanh thu, -10% COGS)</span>
                          </span>
                        ) : branchStaff.length === 0 ? (
                          <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Vận hành thời vụ nhượng quyền (50% công suất - hãy phân công NV để đạt 100%)</span>
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Thiếu đầu bếp: Tốc độ bán giảm mạnh!</span>
                          </span>
                        )}

                        {hasCook && !hasServer && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Thiếu phục vụ: Giảm 50% tốc độ khách!</span>
                          </span>
                        )}

                        {hasChainManager && (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Giám đốc chuỗi Chú Quân (+25% Doanh thu toàn chuỗi) 🏢</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Phân công nhân sự trực quán nhanh */}
                    <div className="mt-2 flex items-center justify-between bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-xl text-[10px] flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Users className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>Nhân sự trực ({branchStaff.length} người):</span>
                        {branchStaff.length === 0 ? (
                          <span className="text-amber-700 italic font-medium">Chưa có ai (đang chạy thời vụ 50%)</span>
                        ) : (
                          <span className="font-extrabold text-slate-800">
                            {branchStaff.map((e) => e?.name).join(', ')}
                          </span>
                        )}
                      </div>
                      {gameState.hiredEmployees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-500 font-semibold">Chuyển NV:</span>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                soundManager.playClick();
                                assignEmployeeToRestaurant(e.target.value, rest.id);
                              }
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-[9.5px] font-bold text-slate-700 shadow-2xs outline-none cursor-pointer"
                          >
                            <option value="">+ Điều phối NV sang đây...</option>
                            {gameState.hiredEmployees.map((eId) => {
                              const emp = gameState.employeeDetails[eId] || EMPLOYEES.find((emp) => emp.id === eId);
                              if (!emp) return null;
                              const isAssignedHere = (emp.assignedRestaurantId || 'banh_mi') === rest.id;
                              const currentAssignedRest = RESTAURANT_TYPES[emp.assignedRestaurantId || 'banh_mi']?.name || 'Quán khác';
                              return (
                                <option key={eId} value={isAssignedHere ? '' : eId} disabled={isAssignedHere}>
                                  {emp.avatar} {emp.name} ({isAssignedHere ? 'Đang ở đây' : `Ở ${currentAssignedRest}`})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KHU VỰC NÂNG CẤP CHI NHÁNH (NẾU ĐÃ MỞ QUÁN) */}
                {isUnlocked ? (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 bg-[#FFFDF8] rounded-xl p-2.5 border border-amber-200/60">
                    <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 font-black text-amber-950">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quy mô: {tierInfo.currentTier.name}</span>
                      </div>
                      <div className="text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ⚡ Hiệu suất: {Math.round(tierInfo.currentTier.bonusMultiplier * 100)}% ({tierInfo.currentTier.bonusMultiplier}x Doanh thu)
                      </div>
                    </div>

                    {/* Thanh tiến độ 5 cấp chi nhánh */}
                    <div className="flex items-center gap-1 my-1.5">
                      {Array.from({ length: 5 }).map((_, stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            stepIdx < branchLvl ? 'bg-emerald-500 shadow-2xs' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Nâng cấp quy mô tiếp theo */}
                    {tierInfo.isMax || !nextTier ? (
                      <div className="text-[10.5px] font-extrabold text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-center">
                        👑 Chi nhánh đã đạt quy mô FLAGSHIP tối đa (+250% Doanh thu)!
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                        <div className="text-[10.5px] min-w-0">
                          <div className="font-black text-slate-800">
                            Nâng lên Cấp {nextTier.level}: <span className="text-rose-600">{nextTier.name}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-600 mt-0.5">
                            {nextTier.description}
                          </div>
                          <div className="text-[9px] text-amber-800 font-bold flex items-center gap-1.5 mt-0.5">
                            <span>Giá: <strong className="text-rose-600 font-black">{nextTier.cost.toLocaleString('vi-VN')} đ</strong></span>
                            <span>·</span>
                            <span>Cần: <strong>{nextTier.requiredReputation}⭐</strong></span>
                            <span>·</span>
                            <span>Cần: <strong className={branchStaff.length >= nextTier.requiredStaff ? 'text-emerald-700' : 'text-rose-600'}>{nextTier.requiredStaff} NV trực</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpgradeBranch(rest.id)}
                          disabled={!canUpgradeBranch}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all shrink-0 ${
                            canUpgradeBranch
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white animate-bounce-short active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{canUpgradeBranch ? 'Nâng Cấp Chi Nhánh ⭐' : 'Chưa Đạt Điều Kiện'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ĐIỀU KIỆN MỞ KHÓA MỚI (CHƯA MỞ) */
                  <div className="mt-2.5 pt-2 border-t border-slate-200 bg-amber-50/50 rounded-xl p-2.5 border border-dashed border-amber-300">
                    <div className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                      <span>🏗️ Điều kiện mở thương hiệu:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-2">
                      <div className={`p-1 rounded-lg border ${canAffordMoney ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-rose-200 text-rose-700 font-bold'}`}>
                        <div>Vốn đầu tư</div>
                        <div className="font-black text-[11px]">{rest.unlockCost.toLocaleString('vi-VN')} đ</div>
                      </div>
                      <div className={`p-1 rounded-lg border ${canAffordRep ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-rose-200 text-rose-700 font-bold'}`}>
                        <div>Điểm Uy tín</div>
                        <div className="font-black text-[11px]">{rest.requiredReputation} ⭐</div>
                      </div>
                      <div className={`p-1 rounded-lg border ${hasStaffReq ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-rose-200 text-rose-700 font-bold'}`}>
                        <div>Nhân sự quán</div>
                        <div className="font-black text-[11px]">{staffReq} NV</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9.5px] text-slate-500 italic">
                        {isBranchCapReached
                          ? `🔒 Đạt giới hạn ${maxRestaurants} quán ở cấp ${currentStage.name}. Hãy thăng tiến sự nghiệp!`
                          : canUnlock
                          ? '✨ Bạn đã đủ điều kiện khai trương!'
                          : '⏳ Cần tích lũy thêm vốn, uy tín và tuyển nhân sự'}
                      </span>
                      <button
                        onClick={() => handleUnlock(rest.id)}
                        disabled={!canUnlock}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all ${
                          canUnlock
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white animate-bounce-short active:scale-95 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {isBranchCapReached
                            ? 'Giới Hạn Cấp Bậc'
                            : canUnlock
                            ? 'Mở Chi Nhánh 🚀'
                            : 'Chưa Đủ Điều Kiện'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer chuyển sang đứng bếp */}
                {isUnlocked && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {rest.primaryRecipeIds.slice(0, 3).map((rId) => {
                        const recipe = RECIPES[rId];
                        if (!recipe) return null;
                        return (
                          <span
                            key={rId}
                            className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[8.5px] font-bold"
                          >
                            {recipe.icon} {recipe.name.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          Đang Đứng Bếp Quán Này 🍳
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSwitch(rest.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-black shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>Chuyển Sang Đứng Bếp 🔀</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
