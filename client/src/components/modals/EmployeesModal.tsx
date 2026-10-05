import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES, RESTAURANT_TYPES, BUSINESS_STAGES } from '../../../../shared/gameData';
import { RestaurantTypeId, EmployeeRole } from '../../../../shared/types';
import {
  calculateEmployeeTrainingCost,
  checkTrainingCap,
  checkPromotionEligibility,
  PROMOTION_REQUIREMENTS,
} from '../../../../shared/simulation/employees';
import { soundManager } from '../../utils/soundManager';
import {
  X,
  UserPlus,
  HeartHandshake,
  GraduationCap,
  Award,
  Heart,
  UserMinus,
  Building2,
  ShoppingBag,
  Sparkles,
  Zap,
  Star,
  Shield,
  Info,
} from 'lucide-react';

export const EmployeesModal: React.FC = () => {
  const {
    closeModal,
    gameState,
    hireEmployee,
    fireEmployee,
    trainEmployee,
    promoteEmployee,
    giveBonusEmployee,
    assignEmployeeToRestaurant,
    dispatchShopperRun,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'hired' | 'recruit'>('hired');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');

  const currentStage = BUSINESS_STAGES[gameState.businessStage || 'cart'] || BUSINESS_STAGES.cart;
  const maxStaff = currentStage.maxStaff ?? 2;
  const isStaffCapReached = gameState.hiredEmployees.length >= maxStaff;

  const hiredList = gameState.hiredEmployees
    .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id)!)
    .filter(Boolean);

  const candidateList = EMPLOYEES.filter(
    (e) => !gameState.hiredEmployees.includes(e.id)
  );

  const filteredHiredList =
    roleFilter === 'all'
      ? hiredList
      : hiredList.filter((e) => e.role === roleFilter);

  const filteredCandidateList =
    roleFilter === 'all'
      ? candidateList
      : candidateList.filter((e) => e.role === roleFilter);

  const handleHire = (empId: string) => {
    soundManager.playClick();
    hireEmployee(empId);
  };

  const handleTrain = (empId: string) => {
    soundManager.playClick();
    trainEmployee(empId);
  };

  const handlePromote = (empId: string) => {
    soundManager.playDishComplete();
    promoteEmployee(empId);
  };

  const handleBonus = (empId: string) => {
    soundManager.playCoin();
    giveBonusEmployee(empId, 50000);
  };

  const handleFire = (empId: string) => {
    soundManager.playClick();
    if (confirm('Bạn có chắc chắn muốn cho nhân viên này thôi việc?')) {
      fireEmployee(empId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFCCD9] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[88vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF5F8] px-4 sm:px-6 py-3 border-b-2 border-[#FFCCD9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce-short">👥</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#5C3A33] flex items-center gap-1.5">
                <span>Quản Lý Nhân Sự & Đội Ngũ</span>
                <span className={`text-xs px-2 py-0.2 rounded-full font-black ${isStaffCapReached ? 'bg-amber-600 text-white' : 'bg-[#FF6584] text-white'}`}>
                  {hiredList.length}/{maxStaff} Nhân Sự ({currentStage.name})
                </span>
              </h2>
              <p className="text-[11px] text-[#8C6258]">
                Tuyển phụ bếp, người bưng món và chuyên viên đi chợ sỉ tiếp tế cho tiệm
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#FFCCD9] flex items-center justify-center text-[#5C3A33] hover:bg-rose-100 transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab chuyển đổi: Đang làm việc vs Tuyển mới */}
        <div className="flex items-center bg-[#FFF9FA] border-b border-[#FFEBF0] px-3 py-1.5 gap-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('hired');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hired'
                ? 'bg-[#FF6584] text-white shadow-xs'
                : 'bg-white text-[#5C3A33] border border-[#FFCCD9] hover:bg-[#FFF0F5]'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Đang Làm Việc ({hiredList.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('recruit');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'recruit'
                ? 'bg-[#FF6584] text-white shadow-xs'
                : 'bg-white text-[#5C3A33] border border-[#FFCCD9] hover:bg-[#FFF0F5]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ứng Viên Tuyển Mới ({candidateList.length})</span>
          </button>
        </div>

        {/* Bộ lọc Vị Trí / Vai Trò (Roles Filter) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-b border-[#FFEBF0] overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-black text-[#8C6258] shrink-0">Vai trò:</span>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'cook', label: '👨‍🍳 Đầu Bếp' },
              { id: 'server', label: '🏃 Phục Vụ' },
              { id: 'shopper', label: '🛵 Đi Chợ Sỉ ⭐' },
              { id: 'manager', label: '👩‍💼 Quản Lý' },
            ] as const
          ).map((rf) => (
            <button
              key={rf.id}
              onClick={() => {
                soundManager.playClick();
                setRoleFilter(rf.id as any);
              }}
              className={`px-2.5 py-0.8 rounded-lg text-[10.5px] font-black transition-all shrink-0 cursor-pointer ${
                roleFilter === rf.id
                  ? rf.id === 'shopper'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                    : 'bg-[#FF8EA3] text-white shadow-xs'
                  : rf.id === 'shopper'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#FFF5F8] text-[#7C5046] border border-[#FFCCD9] hover:bg-white'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>

        {/* Danh sách nhân viên */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {activeTab === 'hired' ? (
            filteredHiredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C6258] bg-[#FFF9FA] rounded-2xl border-2 border-dashed border-[#FFCCD9] flex flex-col items-center gap-2">
                <span className="text-3xl">☕</span>
                <p className="font-bold">Chưa có nhân viên nào phù hợp bộ lọc.</p>
                <p>Hãy chuyển sang tab "Ứng Viên Tuyển Mới" để tuyển thêm nhân sự nhé!</p>
              </div>
            ) : (
              filteredHiredList.map((emp) => {
                const mood = emp.mood ?? 90;
                const stress = emp.stress ?? 15;
                const isShopper = emp.role === 'shopper';
                const isCook = emp.role === 'cook';
                const isServer = emp.role === 'server';
                const isManager = emp.role === 'manager';

                const trainCost = calculateEmployeeTrainingCost(emp.trainingCount || 0);
                const trainCap = checkTrainingCap(emp);
                const canAffordTrain = gameState.money >= trainCost;
                const canTrain = trainCap.canTrain && canAffordTrain;

                const promoCheck = checkPromotionEligibility(emp);
                const primarySkill = isCook ? (emp.cookingSkill || 50) : (emp.serviceSkill || 50);

                return (
                  <div
                    key={emp.id}
                    className={`bg-white border-2 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 transition-all shadow-xs ${
                      isShopper
                        ? 'border-emerald-300 bg-gradient-to-b from-[#F0FDF4]/50 to-white'
                        : 'border-[#FFCCD9] hover:border-[#FF8EA3]'
                    }`}
                  >
                    {/* Hàng 1: Avatar, Tên, Cấp bậc, Vai trò */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-3xl bg-[#FFF5F8] p-2 rounded-2xl border-2 border-[#FFCCD9] shrink-0">
                          {emp.avatar}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm text-[#5C3A33] truncate">{emp.name}</h4>
                            <span
                              className={`text-[9.5px] font-black px-2 py-0.2 rounded-full border ${
                                isShopper
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isCook
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : isServer
                                  ? 'bg-pink-100 text-pink-800 border-pink-300'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              }`}
                            >
                              {isShopper
                                ? '🛵 Đi Chợ Sỉ'
                                : isCook
                                ? '👨‍🍳 Đầu Bếp'
                                : isServer
                                ? '🏃 Phục Vụ'
                                : '👩‍💼 Quản Lý'}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                              {promoCheck.req?.name || emp.careerTier}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#8C6258] mt-0.5 line-clamp-1">
                            {emp.personalityDesc}
                          </p>
                          <div className="text-[10.5px] font-black text-[#E91E63] mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>Lương: {emp.salaryPerDay.toLocaleString('vi-VN')} đ/ngày</span>
                            <span>·</span>
                            <span>Tốc độ: {emp.speed.toFixed(2)}x</span>
                            {isShopper && (
                              <span className="text-emerald-700 font-black">
                                · Giảm {emp.marketSkill || 75}% giá sỉ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFire(emp.id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold p-1 hover:bg-rose-50 rounded-lg flex items-center gap-0.5 shrink-0 cursor-pointer"
                        title="Cho nghỉ việc"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nghỉ Việc</span>
                      </button>
                    </div>

                    {/* Phân công trực quán / Chi nhánh */}
                    <div className="flex items-center justify-between bg-[#FFF9FA] border border-[#FFEBF0] px-3 py-1 rounded-xl text-xs">
                      <span className="font-extrabold text-[#7C5046] flex items-center gap-1.5 text-[10.5px]">
                        <Building2 className="w-3.5 h-3.5 text-pink-600" />
                        <span>Trực quán:</span>
                      </span>
                      <select
                        value={emp.assignedRestaurantId || 'banh_mi'}
                        onChange={(e) => {
                          soundManager.playClick();
                          assignEmployeeToRestaurant(emp.id, e.target.value as RestaurantTypeId);
                        }}
                        className="bg-white border border-[#FFCCD9] rounded-lg px-2 py-0.5 text-[10.5px] font-black text-[#5C3A33] shadow-2xs outline-none cursor-pointer"
                      >
                        {(gameState.unlockedRestaurants || ['banh_mi']).map((rId) => {
                          const r = RESTAURANT_TYPES[rId];
                          return (
                            <option key={rId} value={rId}>
                              {r?.icon} {r?.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Hàng 2: Chi tiết Kỹ năng & Điểm kinh nghiệm V2 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FFF9FA] p-2 rounded-xl border border-[#FFCCD9] text-[9.5px] font-bold text-[#5C3A33]">
                      <div className="bg-white p-1.5 rounded-lg border border-[#FFEBF0]">
                        <div className="text-[9px] text-[#8C6258]">
                          {isCook ? '🍳 Nấu nướng' : isServer ? '🏃 Phục vụ' : '💼 Nghiệp vụ'}
                        </div>
                        <div className="font-black text-[#5C3A33] text-xs">
                          {primarySkill}/100
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded-lg border border-[#FFEBF0]">
                        <div className="text-[9px] text-[#8C6258]">⭐ Kinh nghiệm</div>
                        <div className="font-black text-amber-600 text-xs">
                          {emp.experience || 0} XP
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded-lg border border-[#FFEBF0]">
                        <div className="text-[9px] text-[#8C6258]">💎 Độ gắn bó</div>
                        <div className="font-black text-indigo-600 text-xs">
                          {emp.loyalty || 50}%
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded-lg border border-[#FFEBF0]">
                        <div className="text-[9px] text-[#8C6258]">🎓 Đã đào tạo</div>
                        <div className="font-black text-pink-600 text-xs">
                          {emp.trainingCount || 0} lần
                        </div>
                      </div>
                    </div>

                    {/* Hàng 3: Thanh Tâm trạng (Mood) & Độ căng thẳng (Stress) */}
                    <div className="grid grid-cols-2 gap-2 bg-[#FFF5F8]/60 p-2 rounded-xl border border-[#FFCCD9] text-[9.5px] font-bold text-[#5C3A33]">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>💖 Tâm trạng:</span>
                          <span className="font-black">{mood}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-400 rounded-full"
                            style={{ width: `${mood}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>⚡ Căng thẳng:</span>
                          <span className={`font-black ${stress > 60 ? 'text-rose-600' : ''}`}>
                            {stress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stress > 60 ? 'bg-rose-500' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${stress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hàng 4: Các nút hành động phát triển nhân sự V2 */}
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-[#FFEBF0]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isShopper && (
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              dispatchShopperRun(emp.id);
                            }}
                            className="flex-1 min-w-[120px] py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 text-white rounded-xl text-[10px] font-black border border-emerald-400 flex items-center justify-center gap-1 active:scale-95 shadow-xs cursor-pointer"
                            title="Lập tức đi chợ gom nguyên liệu còn thiếu về kho với giá chiết khấu"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                            <span>Đi Chợ Ngay 🛵</span>
                          </button>
                        )}

                        {/* Nút Đào tạo (Chi phí lũy tiến + Chặn Cap) */}
                        <button
                          onClick={() => handleTrain(emp.id)}
                          disabled={!canTrain}
                          className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-xl text-[10px] font-black border flex items-center justify-center gap-1 transition-all ${
                            canTrain
                              ? 'bg-[#FFF5F8] hover:bg-[#FFE4EC] text-[#5C3A33] border-[#FFCCD9] active:scale-95 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                          title={!trainCap.canTrain ? trainCap.reason : !canAffordTrain ? 'Không đủ tiền' : ''}
                        >
                          <GraduationCap className={`w-3.5 h-3.5 ${canTrain ? 'text-[#FF6584]' : 'text-slate-400'}`} />
                          <span>
                            {!trainCap.canTrain
                              ? 'Đạt Cực Hạn'
                              : `Đào Tạo (${trainCost.toLocaleString('vi-VN')}đ)`}
                          </span>
                        </button>

                        {/* Nút Thăng chức (Có kiểm tra điều kiện minh bạch) */}
                        <button
                          onClick={() => handlePromote(emp.id)}
                          disabled={!promoCheck.eligible}
                          className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-xl text-[10px] font-black border flex items-center justify-center gap-1 transition-all ${
                            !promoCheck.req
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-default'
                              : promoCheck.eligible
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400 active:scale-95 shadow-xs animate-bounce-short cursor-pointer'
                              : 'bg-amber-50/60 text-amber-700/60 border-amber-200 cursor-not-allowed'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-current" />
                          <span>
                            {!promoCheck.req
                              ? 'Cấp Tối Đa 👑'
                              : promoCheck.eligible
                              ? `Lên ${promoCheck.req.nextName} 🌟`
                              : 'Thăng Chức'}
                          </span>
                        </button>

                        {/* Nút Thưởng khích lệ */}
                        <button
                          onClick={() => handleBonus(emp.id)}
                          disabled={gameState.money < 50000}
                          className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-xl text-[10px] font-black border flex items-center justify-center gap-1 transition-all ${
                            gameState.money >= 50000
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 active:scale-95 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                          <span>Thưởng (50k)</span>
                        </button>
                      </div>

                      {/* Gợi ý / Lý do chưa thể thăng chức nếu có */}
                      {promoCheck.req && !promoCheck.eligible && (
                        <div className="text-[9px] text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Info className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{promoCheck.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : filteredCandidateList.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C6258] bg-[#FFF9FA] rounded-2xl border-2 border-dashed border-[#FFCCD9]">
              🎉 Đã tuyển hết ứng viên trong danh mục này!
            </div>
          ) : (
            <>
              {isStaffCapReached && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 mb-1">
                  <span className="text-base">⚠️</span>
                  <span>
                    Đã đạt giới hạn tối đa ({maxStaff} nhân sự) của cấp bậc [{currentStage.name}]. Hãy thăng tiến sự nghiệp để mở rộng quy mô tuyển dụng!
                  </span>
                </div>
              )}
              {filteredCandidateList.map((cand) => {
                const hiringCost = cand.hiringCost || 0;
                const canAfford = gameState.money >= hiringCost;
                const canHire = canAfford && !isStaffCapReached;
                const isShopper = cand.role === 'shopper';

              return (
                <div
                  key={cand.id}
                  className={`bg-white border-2 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all shadow-xs ${
                    isShopper
                      ? 'border-emerald-300 bg-gradient-to-br from-[#F0FDF4]/60 via-white to-[#FDF4FF]/30'
                      : 'border-[#FFCCD9] hover:border-[#FF8EA3]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                    <span className="text-3xl bg-[#FFF5F8] p-2 rounded-2xl border-2 border-[#FFCCD9] shrink-0">
                      {cand.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-sm text-[#5C3A33]">{cand.name}</h4>
                        <span
                          className={`text-[9.5px] font-black px-2 py-0.2 rounded-full border ${
                            isShopper
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1'
                              : cand.role === 'cook'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : cand.role === 'server'
                              ? 'bg-pink-100 text-pink-800 border-pink-300'
                              : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          }`}
                        >
                          {isShopper ? (
                            <>
                              <span>🛵 Đi Chợ Sỉ</span>
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            </>
                          ) : cand.role === 'cook' ? (
                            '👨‍🍳 Đầu Bếp'
                          ) : cand.role === 'server' ? (
                            '🏃 Phục Vụ'
                          ) : (
                            '👩‍💼 Quản Lý'
                          )}
                        </span>
                        {isShopper && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-black px-1.5 py-0.2 rounded-full">
                            Tự Động Hoá ⚡
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#8C6258] mt-0.5 line-clamp-2">
                        {cand.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-[11px] font-black flex-wrap">
                        <span className="text-[#E91E63]">
                          Phí tuyển dụng: {hiringCost > 0 ? `${hiringCost.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                        <span className="text-[#8C6258]">·</span>
                        <span className="text-[#8C6258]">
                          Lương: {cand.salaryPerDay.toLocaleString('vi-VN')} đ/ngày
                        </span>
                        {isShopper && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                            Chiết khấu sỉ: -{cand.marketSkill || 75}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="w-full sm:w-auto shrink-0 flex justify-end">
                    <button
                      onClick={() => handleHire(cand.id)}
                      disabled={!canHire}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                        canHire
                          ? isShopper
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 text-white border border-emerald-400'
                            : 'bg-gradient-to-r from-[#FF6584] to-[#FFA07A] hover:brightness-105 text-white border border-white/60'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>
                        {isStaffCapReached
                          ? `Đạt Giới Hạn (${maxStaff} NV)`
                          : canAfford
                          ? hiringCost > 0
                            ? `Tuyển Dụng (${hiringCost.toLocaleString('vi-VN')}đ)`
                            : 'Tuyển Dụng (Free)'
                          : `Thiếu ${(hiringCost - gameState.money).toLocaleString('vi-VN')}đ`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesModal;

