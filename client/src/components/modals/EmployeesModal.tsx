import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { EMPLOYEES } from '../../../../shared/gameData';
import { gameBridge } from '../../game/gameBridge';
import { X, Check, UserPlus, HeartHandshake } from 'lucide-react';

export const EmployeesModal: React.FC = () => {
  const { closeModal, gameState, hireEmployee } = useGameStore();

  const handleHire = (empId: string) => {
    const success = hireEmployee(empId);
    if (success) {
      gameBridge.syncStaff();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-[#FFD6E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-[#FFF1F6] px-6 py-4 border-b-2 border-[#FFD6E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-lg font-black text-[#7C5C55]">Gia Đình & Đội Ngũ Nhân Sự</h2>
              <p className="text-xs text-[#9C7C75]">
                Tuyển nhân viên đồng hành để từng bước tự động hóa công việc của quán
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-white border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-rose-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách nhân viên */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {EMPLOYEES.map((emp) => {
            const isHired = gameState.hiredEmployees.includes(emp.id);

            return (
              <div
                key={emp.id}
                className={`border-2 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                  isHired
                    ? 'bg-[#FFF7ED]/60 border-[#F7D7BA]'
                    : 'bg-white border-[#F2E8E5] hover:border-[#FFD6E5]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF1F6] border-2 border-[#FFD6E5] flex items-center justify-center text-3xl shadow-sm shrink-0">
                    {emp.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-[#7C5C55]">{emp.name}</h4>
                      <span className="text-[10px] bg-[#FFD6E5] text-[#7C5C55] px-2 py-0.5 rounded-full font-bold">
                        {emp.role === 'cook' ? 'Bếp Trưởng' : 'Phục Vụ Năng Động'}
                      </span>
                    </div>
                    <p className="text-xs text-[#9C7C75] mt-1">{emp.description}</p>
                    <div className="text-xs font-black text-[#F7A8C4] mt-1.5 flex items-center gap-2">
                      <span>Lương ngày: {emp.salaryPerDay.toLocaleString('vi-VN')} đ</span>
                      <span className="text-[11px] text-[#9C7C75] font-normal">
                        (Khấu trừ khi kết thúc ngày)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="shrink-0">
                  {isHired ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                      <HeartHandshake className="w-4 h-4" />
                      <span>Đang Làm Việc</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleHire(emp.id)}
                      className="px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 bg-[#F7A8C4] hover:bg-[#f28bb1] text-white shadow-md shadow-pink-200 transition-all active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tuyển Dụng</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
