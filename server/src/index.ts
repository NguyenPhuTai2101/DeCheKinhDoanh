import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './db';
import {
  INGREDIENTS,
  RECIPES,
  CUSTOMER_TYPES,
  SHOP_UPGRADES,
  EMPLOYEES,
  SHOP_THEMES,
  DECORATION_ITEMS,
  INITIAL_GAME_STATE,
} from '../../shared/gameData';
import { GameSaveState } from '../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    game: 'Đế Chế Kinh Doanh (Cozy Business Story)',
    version: '0.3.0',
    timestamp: new Date().toISOString(),
  });
});

// Static Catalog Data
app.get('/api/game/catalog', (req: Request, res: Response) => {
  res.json({
    ingredients: INGREDIENTS,
    recipes: RECIPES,
    customerTypes: CUSTOMER_TYPES,
    upgrades: SHOP_UPGRADES,
    employees: EMPLOYEES,
    themes: SHOP_THEMES,
    decorations: DECORATION_ITEMS,
    initialState: INITIAL_GAME_STATE,
  });
});

// Get Save Game
app.get('/api/save/:playerId', (req: Request, res: Response) => {
  const { playerId } = req.params;
  const saveState = dbService.getSave(playerId);
  res.json({ success: true, data: saveState });
});

// Save Game
app.post('/api/save/:playerId', (req: Request, res: Response) => {
  const { playerId } = req.params;
  const state: GameSaveState = req.body;

  if (!state || typeof state.money !== 'number') {
    res.status(400).json({ success: false, message: 'Dữ liệu save game không hợp lệ' });
    return;
  }

  const success = dbService.saveGame(playerId, state);
  res.json({ success, message: 'Đã lưu game thành công vào Cloud DB' });
});

// Reset Game
app.post('/api/reset/:playerId', (req: Request, res: Response) => {
  const { playerId } = req.params;
  const resetState = dbService.resetSave(playerId);
  res.json({ success: true, message: 'Đã reset save game về trạng thái khởi đầu', data: resetState });
});

// Leaderboard
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const leaderboard = dbService.getLeaderboard();
  res.json({ success: true, data: leaderboard });
});

app.listen(PORT, () => {
  console.log(`🌸 Server Đế Chế Kinh Doanh đang chạy tại http://localhost:${PORT}`);
});
