import { RestaurantScene } from './RestaurantScene';

let activeScene: RestaurantScene | null = null;

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
};
