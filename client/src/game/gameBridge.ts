import { RestaurantScene } from './RestaurantScene';
import { RecipeId } from '../../../shared/types';

export interface TableStatusInfo {
  index: number;
  isUnlocked: boolean;
  isOccupied: boolean;
  currentRecipeId?: RecipeId;
  foodReady: boolean;
  patiencePercent: number;
}

let activeScene: RestaurantScene | null = null;
let tableStatusListener: ((statuses: TableStatusInfo[]) => void) | null = null;

export const gameBridge = {
  setScene(scene: RestaurantScene | null) {
    activeScene = scene;
  },
  getScene(): RestaurantScene | null {
    return activeScene;
  },
  markFoodReady(tableIndex: number) {
    if (activeScene) {
      activeScene.markFoodReadyForTable(tableIndex);
    }
  },
  syncStaff() {
    if (activeScene) {
      activeScene.syncStaffSprites();
    }
  },
  triggerTableAction(tableIndex: number) {
    if (activeScene) {
      activeScene.triggerTableActionFromUI(tableIndex);
    }
  },
  sendMoveInput(vx: number, vy: number) {
    if (activeScene) {
      activeScene.setVirtualMoveInput(vx, vy);
    }
  },
  onTableStatusesChanged(listener: (statuses: TableStatusInfo[]) => void) {
    tableStatusListener = listener;
  },
  emitTableStatuses(statuses: TableStatusInfo[]) {
    if (tableStatusListener) {
      tableStatusListener(statuses);
    }
  },
};
