import fs from 'fs';
import path from 'path';
import { GameSaveState } from '../../shared/types';
import { INITIAL_GAME_STATE } from '../../shared/gameData';

const DATA_DIR = path.join(__dirname, '..', 'data');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseStructure {
  saves: Record<string, GameSaveState>;
  auditLogs: Array<{
    timestamp: string;
    playerId: string;
    action: string;
    details?: any;
  }>;
}

function loadDatabase(): DatabaseStructure {
  try {
    if (fs.existsSync(SAVES_FILE)) {
      const content = fs.readFileSync(SAVES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Lỗi khi đọc file saves.json, tạo database mới:', error);
  }
  return { saves: {}, auditLogs: [] };
}

function persistDatabase(db: DatabaseStructure): void {
  try {
    fs.writeFileSync(SAVES_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi khi lưu vào database:', error);
  }
}

export const dbService = {
  getSave(playerId: string): GameSaveState {
    const db = loadDatabase();
    if (!db.saves[playerId]) {
      // Nếu chưa có, tạo save mặc định
      db.saves[playerId] = {
        ...INITIAL_GAME_STATE,
        playerId,
        lastSavedAt: new Date().toISOString(),
      };
      persistDatabase(db);
    }
    return db.saves[playerId];
  },

  saveGame(playerId: string, state: GameSaveState): boolean {
    const db = loadDatabase();
    db.saves[playerId] = {
      ...state,
      playerId,
      lastSavedAt: new Date().toISOString(),
    };
    db.auditLogs.push({
      timestamp: new Date().toISOString(),
      playerId,
      action: 'SAVE_GAME',
      details: { day: state.day, money: state.money, reputation: state.reputation },
    });
    // Giới hạn audit log tối đa 500 records
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(-500);
    }
    persistDatabase(db);
    return true;
  },

  resetSave(playerId: string): GameSaveState {
    const db = loadDatabase();
    db.saves[playerId] = {
      ...INITIAL_GAME_STATE,
      playerId,
      lastSavedAt: new Date().toISOString(),
    };
    persistDatabase(db);
    return db.saves[playerId];
  },

  getLeaderboard(): Array<{ playerId: string; name: string; day: number; money: number; reputation: number }> {
    const db = loadDatabase();
    return Object.values(db.saves)
      .map((s) => ({
        playerId: s.playerId,
        name: s.player.name,
        day: s.day,
        money: s.money,
        reputation: s.reputation,
      }))
      .sort((a, b) => b.money - a.money)
      .slice(0, 10);
  },
};
