import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES, RESTAURANT_TYPES } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { soundManager } from '../../utils/soundManager';
import {
  X,
  UserPlus,
  HeartHandshake,
  GraduationCap,
  Award,
  Heart,
  TrendingDown,
  UserMinus,
  Sparkles,
  Zap,
  Building2,
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
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'hired' | 'recruit'>('hired');

  const hiredList = gameState.hiredEmployees.map((id) => {
    return gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id)!;
  }).filter(Boolean);

  const candidateList = EMPLOYEES.filter(
    (e) => !gameState.hiredEmployees.includes(e.id)
  );

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
    giveBonusEmployee(empId, 20000);
  };

  const handleFire = (empId: string) => {
    soundManager.playClick();
    if (confirm('Bạn có chắc chắn muốn cho nhân viên này thôi việc?')) {
      fireEmployee(empId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[88dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-4 sm:px-6 py-3 border-b-2 border-[#FFD6E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#7C5C55]">
                Quản Lý Nhân Sự & Đội Ngũ
              </h2>
              <p className="text-[11px] text-[#9C7C75]">
                Đào tạo, thăng tiến và chăm sóc tâm trạng cho nhân viên của tiệm
              </p>
            </div>
          </div>
          <button
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
        <div className="flex items-center bg-[#FFF7ED] border-b border-[#F7D7BA] px-3 py-1.5 gap-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('hired');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'hired'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-white text-[#7C5C55] border border-[#F7D7BA]'
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
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'recruit'
                ? 'bg-[#F7A8C4] text-white shadow-sm'
                : 'bg-white text-[#7C5C55] border border-[#F7D7BA]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ứng Viên Tuyển Mới ({candidateList.length})</span>
          </button>
        </div>

        {/* Danh sách nhân viên */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {activeTab === 'hired' ? (
            hiredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9C7C75] bg-[#FFF9F2] rounded-2xl border-2 border-dashed border-[#F7D7BA] flex flex-col items-center gap-2">
                <span className="text-3xl">☕</span>
                <p className="font-bold">Chưa có nhân viên nào trong đội ngũ.</p>
                <p>Hãy chuyển sang tab "Ứng Viên Tuyển Mới" để tuyển phụ bếp và người bưng món nhé!</p>
              </div>
            ) : (
              hiredList.map((emp) => {
                const mood = emp.mood ?? 90;
                const stress = emp.stress ?? 15;

                return (
                  <div
                    key={emp.id}
                    className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-3.5 flex flex-col gap-3 hover:border-[#FFD6E5] transition-all shadow-sm"
                  >
                    {/* Hàng 1: Avatar, Tên, Cấp bậc, Tính cách */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-[#FFF1F6] p-2 rounded-2xl border border-[#FFD6E5]">
                          {emp.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-[#7C5C55]">{emp.name}</h4>
                            <span className="text-[10px] bg-[#FFD6E5] text-[#7C5C55] font-extrabold px-2 py-0.2 rounded-full uppercase">
                              {emp.careerTier}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9C7C75] mt-0.5 font-medium">
                            {emp.personalityDesc}
                          </p>
                          <div className="text-[11px] font-black text-[#F7A8C4] mt-0.5">
                            Lương: {emp.salaryPerDay.toLocaleString('vi-VN')} đ / ngày · Tốc độ: {emp.speed}x
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFire(emp.id)}
                        className="text-[10px] text-rose-400 hover:text-rose-600 font-bold p-1 hover:bg-rose-50 rounded-lg flex items-center gap-0.5 shrink-0"
                        title="Cho nghỉ việc"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nghỉ Việc</span>
                      </button>
                    </div>

                    {/* Phân công trực quán / Chi nhánh */}
                    <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
                      <span className="font-extrabold text-[#7C5C55] flex items-center gap-1.5 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Phân công quán:</span>
                      </span>
                      <select
                        value={emp.assignedRestaurantId || 'banh_mi'}
                        onChange={(e) => {
                          soundManager.playClick();
                          assignEmployeeToRestaurant(emp.id, e.target.value as RestaurantTypeId);
                        }}
                        className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-2xs outline-none cursor-pointer"
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

                    {/* Hàng 2: Thanh Tâm trạng (Mood) & Độ căng thẳng (Stress) */}
                    <div className="grid grid-cols-2 gap-2 bg-[#FFF7ED]/60 p-2.5 rounded-xl border border-[#F7D7BA] text-[10px] font-bold text-[#7C5C55]">
                      <div>
                        <div className="flex justify-between mb-1">
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
                        <div className="flex justify-between mb-1">
                          <span>⚡ Căng thẳng (Stress):</span>
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

                    {/* Hàng 3: Các nút hành động phát triển nhân sự */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#F2E8E5] flex-wrap">
                      <button
                        onClick={() => handleTrain(emp.id)}
                        className="flex-1 min-w-[100px] py-1.5 px-2 bg-[#FFF1F6] hover:bg-[#FFD6E5] text-[#7C5C55] rounded-xl text-[10px] font-black border border-[#F7A8C4] flex items-center justify-center gap-1 active:scale-95"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-[#F7A8C4]" />
                        <span>Đào Tạo (25k)</span>
                      </button>

                      <button
                        onClick={() => handlePromote(emp.id)}
                        className="flex-1 min-w-[100px] py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[10px] font-black border border-amber-300 flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Thăng Chức</span>
                      </button>

                      <button
                        onClick={() => handleBonus(emp.id)}
                        className="flex-1 min-w-[100px] py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black border border-emerald-300 flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                        <span>Thưởng Nóng (20k)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            candidateList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9C7C75] bg-[#FFF9F2] rounded-2xl border-2 border-dashed border-[#F7D7BA]">
                🎉 Bạn đã tuyển mộ tất cả ứng viên tài năng hiện có!
              </div>
            ) : (
              candidateList.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white border-2 border-[#F2E8E5] rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-[#FFD6E5] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl bg-[#FFF1F6] p-2 rounded-2xl border border-[#FFD6E5] shrink-0">
                      {cand.avatar}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm text-[#7C5C55]">{cand.name}</h4>
                        <span className="text-[10px] bg-[#FFD6E5] text-[#7C5C55] font-bold px-2 py-0.2 rounded-full">
                          {cand.role === 'cook' ? 'Phụ Bếp' : cand.role === 'manager' ? 'Quản Lý' : 'Phục Vụ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9C7C75] mt-0.5 truncate">{cand.personalityDesc}</p>
                      <div className="text-[11px] font-black text-[#F7A8C4] mt-1">
                        Lương đề xuất: {cand.salaryPerDay.toLocaleString('vi-VN')} đ / ngày
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHire(cand.id)}
                    className="px-4 py-2 bg-[#F7A8C4] hover:bg-[#f28bb1] text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tuyển Dụng</span>
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
