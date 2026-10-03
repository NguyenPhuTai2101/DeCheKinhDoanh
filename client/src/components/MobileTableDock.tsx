import React, { useEffect, useState } from 'react';
import { gameBridge, TableStatusInfo } from '../game/gameBridge';
import { RECIPES } from '../../../shared/gameData';
import { Utensils, Sparkles, ChefHat } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const MobileTableDock: React.FC = () => {
  const [tables, setTables] = useState<TableStatusInfo[]>([]);

  useEffect(() => {
    gameBridge.onTableStatusesChanged((statuses) => {
      setTables(statuses);
    });
  }, []);

  const occupiedTables = tables.filter((t) => t.isUnlocked && t.isOccupied);

  if (occupiedTables.length === 0) {
    return null;
  }

  const handleAction = (tableIndex: number) => {
    soundManager.playClick();
    gameBridge.triggerTableAction(tableIndex);
  };

  return (
    <div className="w-full px-2 py-1.5 bg-white/95 backdrop-blur-md border-t border-[#FFD6E5] shadow-md z-20 overflow-x-auto flex items-center gap-2 no-scrollbar">
      <div className="shrink-0 text-[11px] font-black text-[#7C5C55] bg-[#FFF1F6] px-2.5 py-1 rounded-full border border-[#FFD6E5] flex items-center gap-1">
        <span>⚡ Bàn Đang Chờ ({occupiedTables.length})</span>
      </div>

      <div className="flex items-center gap-2 flex-nowrap min-w-0">
        {occupiedTables.map((table) => {
          const recipe = table.currentRecipeId ? RECIPES[table.currentRecipeId] : null;

          return (
            <div
              key={table.index}
              className="shrink-0 bg-[#FFF7ED] border-2 border-[#F7D7BA] rounded-2xl px-3 py-1.5 flex items-center gap-2.5 shadow-sm"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#7C5C55]">
                  Bàn {table.index}
                </span>
                <span className="text-[10px] text-[#9C7C75] font-semibold truncate max-w-[90px]">
                  {recipe ? `${recipe.icon} ${recipe.name}` : 'Đang chọn món...'}
                </span>
              </div>

              {/* Nút hành động trực tiếp */}
              {table.foodReady ? (
                <button
                  onClick={() => handleAction(table.index)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-md shadow-emerald-200 animate-pulse active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bưng Món</span>
                </button>
              ) : recipe ? (
                <button
                  onClick={() => handleAction(table.index)}
                  className="px-3 py-1.5 bg-[#F7A8C4] hover:bg-[#f28bb1] text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-md shadow-pink-200 active:scale-95"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Nấu Ngay</span>
                </button>
              ) : (
                <span className="text-[11px] text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded-xl">
                  Đợi Order...
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
