import Phaser from 'phaser';
import { generateProceduralAssets } from './assetGenerator';
import { useGameStore } from '../store/gameStore';
import { CUSTOMER_TYPES, RECIPES, INGREDIENTS } from '../../../shared/gameData';
import { CustomerTypeId, RecipeId } from '../../../shared/types';
import { gameBridge } from './gameBridge';
import { soundManager } from '../utils/soundManager';

interface SceneTable {
  index: number;
  x: number;
  y: number;
  chairX: number;
  chairY: number;
  isUnlocked: boolean;
  isOccupied: boolean;
  customerId: string | null;
  tableSprite: Phaser.GameObjects.Sprite;
  chairSprite: Phaser.GameObjects.Sprite;
  bubbleContainer?: Phaser.GameObjects.Container;
  bubbleBg?: Phaser.GameObjects.Graphics;
  dishText?: Phaser.GameObjects.Text;
  patienceBar?: Phaser.GameObjects.Graphics;
  currentRecipeId?: RecipeId;
  foodReady: boolean;
}

interface SceneCustomer {
  id: string;
  typeId: CustomerTypeId;
  sprite: Phaser.GameObjects.Sprite;
  tableIndex: number;
  state: 'walking_in' | 'sitting' | 'eating' | 'walking_out';
  recipeId?: RecipeId;
  patienceRemaining: number;
  maxPatience: number;
}

export class RestaurantScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private targetPosition: { x: number; y: number } | null = null;
  
  private tables: SceneTable[] = [];
  private customers: SceneCustomer[] = [];
  private spawnTimer = 0;
  private kitchenCounter!: Phaser.GameObjects.Sprite;
  private cashierCounter!: Phaser.GameObjects.Sprite;
  
  // Trợ lý tự động
  private staffMaiSprite?: Phaser.GameObjects.Sprite;
  private staffLinhSprite?: Phaser.GameObjects.Sprite;
  private staffMaiTarget: { x: number; y: number } | null = null;

  constructor() {
    super('RestaurantScene');
  }

  preload() {
    // Tạo texture bằng procedural canvas
    generateProceduralAssets(this);
  }

  create() {
    // 1. Tạo bản đồ nền (Floor & Walls)
    const mapWidth = 800;
    const mapHeight = 600;

    // Sàn gỗ trải đều
    for (let x = 0; x < mapWidth; x += 64) {
      for (let y = 64; y < mapHeight; y += 64) {
        this.add.image(x + 32, y + 32, 'tile_floor');
      }
    }

    // Tường hồng pastel phía trên
    for (let x = 0; x < mapWidth; x += 64) {
      this.add.image(x + 32, 32, 'tile_wall');
    }

    // Thảm cửa đón khách ở cửa chính dưới cùng (x: 400, y: 570)
    this.add.image(400, 570, 'prop_door_mat');

    // 2. Nội thất cố định: Quầy bếp và Quầy thu ngân
    // Quầy bếp góc trên bên trái
    this.kitchenCounter = this.add.sprite(150, 95, 'prop_kitchen').setInteractive({ useHandCursor: true });
    this.add.text(150, 130, '🍳 Bếp Nấu Ăn', {
      fontSize: '13px',
      color: '#7C5C55',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.kitchenCounter.on('pointerdown', () => {
      useGameStore.getState().openModal('cooking');
    });

    // Quầy thu ngân góc trên bên phải
    this.cashierCounter = this.add.sprite(650, 95, 'prop_cashier').setInteractive({ useHandCursor: true });
    this.add.text(650, 130, '🌸 Thu Ngân', {
      fontSize: '13px',
      color: '#7C5C55',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 3. Khởi tạo Bàn ăn (Tối đa 4 bàn, mở rộng qua Shop Upgrade)
    const tableConfigs = [
      { index: 1, x: 230, y: 280, chairX: 185, chairY: 280, defaultUnlocked: true },
      { index: 2, x: 570, y: 280, chairX: 615, chairY: 280, defaultUnlocked: true },
      { index: 3, x: 230, y: 440, chairX: 185, chairY: 440, defaultUnlocked: false, upgradeKey: 'extra_table_1' },
      { index: 4, x: 570, y: 440, chairX: 615, chairY: 440, defaultUnlocked: false, upgradeKey: 'extra_table_2' },
    ];

    const storeState = useGameStore.getState();

    tableConfigs.forEach((cfg) => {
      const isUnlocked =
        cfg.defaultUnlocked || (storeState.gameState.purchasedUpgrades[cfg.upgradeKey || ''] || 0) > 0;

      const chair = this.add.sprite(cfg.chairX, cfg.chairY, 'prop_chair').setVisible(isUnlocked);
      const table = this.add.sprite(cfg.x, cfg.y, 'prop_table').setInteractive({ useHandCursor: true }).setVisible(isUnlocked);

      // Nhãn số bàn
      this.add.text(cfg.x, cfg.y + 35, `Bàn ${cfg.index}`, {
        fontSize: '12px',
        color: '#7C5C55',
        backgroundColor: '#FFF7ED',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setVisible(isUnlocked);

      const sceneTable: SceneTable = {
        index: cfg.index,
        x: cfg.x,
        y: cfg.y,
        chairX: cfg.chairX,
        chairY: cfg.chairY,
        isUnlocked,
        isOccupied: false,
        customerId: null,
        tableSprite: table,
        chairSprite: chair,
        foodReady: false,
      };

      // Tương tác bấm vào bàn ăn
      table.on('pointerdown', () => {
        this.handleTableClick(sceneTable);
      });

      this.tables.push(sceneTable);
    });

    // 4. Nhân vật chính (Chủ tiệm)
    this.player = this.add.sprite(400, 320, 'char_player').setDepth(10);
    this.add.text(400, 350, 'Bạn (Chủ Quán)', {
      fontSize: '11px',
      color: '#FFF',
      backgroundColor: '#F7A8C4',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(11);

    // 5. Cài đặt phím bấm
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // 6. Chạm/Click chuột để di chuyển nhân vật
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Chỉ nhận di chuyển nếu không bấm trúng vật thể tương tác
      if (pointer.y > 64 && pointer.y < 580) {
        this.targetPosition = { x: pointer.x, y: pointer.y };
      }
    });

    // 7. Đồng bộ nhân viên nếu đã thuê
    this.syncStaffSprites();

    // Đăng ký với Game Bridge
    gameBridge.setScene(this);
  }

  public syncStaffSprites() {
    const hired = useGameStore.getState().gameState.hiredEmployees;

    // Nhân viên Mai (Phục vụ)
    if (hired.includes('emp_mai') && !this.staffMaiSprite) {
      this.staffMaiSprite = this.add.sprite(400, 150, 'char_emp_mai').setDepth(9);
      this.add.text(400, 180, 'Bé Mai (Phục Vụ)', {
        fontSize: '10px',
        color: '#FFF',
        backgroundColor: '#FF80AB',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(9);
    }

    // Bác Linh (Đầu bếp)
    if (hired.includes('emp_linh') && !this.staffLinhSprite) {
      this.staffLinhSprite = this.add.sprite(150, 60, 'char_emp_linh').setDepth(9);
      this.add.text(150, 30, 'Bác Linh (Bếp Trưởng)', {
        fontSize: '10px',
        color: '#FFF',
        backgroundColor: '#455A64',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(9);
    }

    // Cập nhật trạng thái mở bàn từ upgrades
    const upgrades = useGameStore.getState().gameState.purchasedUpgrades;
    this.tables.forEach((t) => {
      if (t.index === 3 && (upgrades['extra_table_1'] || 0) > 0) {
        t.isUnlocked = true;
        t.tableSprite.setVisible(true);
        t.chairSprite.setVisible(true);
      }
      if (t.index === 4 && (upgrades['extra_table_2'] || 0) > 0) {
        t.isUnlocked = true;
        t.tableSprite.setVisible(true);
        t.chairSprite.setVisible(true);
      }
    });
  }

  private handleTableClick(table: SceneTable) {
    if (!table.isOccupied || !table.currentRecipeId) return;

    if (table.foodReady) {
      // Món ăn đã sẵn sàng trên bàn -> Khách ăn xong và thanh toán
      this.serveCustomer(table);
    } else {
      // Mở modal nấu ăn cho món của bàn này
      useGameStore.setState({
        selectedTableForCooking: table.index,
        activeModal: 'cooking',
      });
    }
  }

  public markFoodReadyForTable(tableIndex: number) {
    const table = this.tables.find((t) => t.index === tableIndex);
    if (!table || !table.isOccupied) return;

    table.foodReady = true;

    // Cập nhật icon trên đầu bàn: hiện món lấp lánh
    if (table.dishText) {
      const recipe = RECIPES[table.currentRecipeId!];
      table.dishText.setText(`✨ ${recipe?.icon || '🍲'} (Bấm để bưng)`);
    }

    soundManager.playDishComplete();

    // Tạo hiệu ứng sao lấp lánh
    this.createFloatingFeedback('✨ Món đã xong!', '#FFE6A7', table.x, table.y - 40);
  }

  private serveCustomer(table: SceneTable) {
    const customer = this.customers.find((c) => c.tableIndex === table.index);
    if (!customer || !table.currentRecipeId) return;

    const recipe = RECIPES[table.currentRecipeId];
    const cType = CUSTOMER_TYPES[customer.typeId];
    const patiencePercent = customer.patienceRemaining / customer.maxPatience;
    const tip = Math.round(recipe.basePrice * (cType?.tipRate || 0.1) * patiencePercent);

    // Chuyển sang trạng thái ăn ngon miệng
    customer.state = 'eating';
    if (table.dishText) {
      table.dishText.setText('😋 Măm măm...');
    }

    this.time.delayedCall(2200, () => {
      // Khách ăn xong -> trả tiền
      soundManager.playCoin();
      useGameStore.getState().finishServing(table.index, recipe.basePrice, tip);
      this.createFloatingFeedback(`+${(recipe.basePrice + tip).toLocaleString('vi-VN')} đ 💰`, '#4CAF50', table.x, table.y - 50);

      // Xóa bubble order
      this.clearTableBubble(table);

      // Khách đứng dậy ra về
      customer.state = 'walking_out';
      this.tweens.add({
        targets: customer.sprite,
        x: 400,
        y: 580,
        duration: 2500,
        onComplete: () => {
          customer.sprite.destroy();
          this.customers = this.customers.filter((c) => c.id !== customer.id);
          table.isOccupied = false;
          table.customerId = null;
          table.currentRecipeId = undefined;
          table.foodReady = false;
        },
      });
    });
  }

  private createFloatingFeedback(text: string, color: string, x: number, y: number) {
    const floating = this.add.text(x, y, text, {
      fontSize: '14px',
      color: color,
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: floating,
      y: y - 45,
      alpha: 0,
      duration: 1200,
      ease: 'Power1',
      onComplete: () => floating.destroy(),
    });
  }

  private spawnCustomer() {
    const availableTable = this.tables.find((t) => t.isUnlocked && !t.isOccupied);
    if (!availableTable) return;

    // Chọn ngẫu nhiên loại khách
    const typeKeys: CustomerTypeId[] = ['student', 'office_worker', 'food_lover', 'neighborhood'];
    const selectedType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const cType = CUSTOMER_TYPES[selectedType];

    const spriteKey =
      selectedType === 'student'
        ? 'char_student'
        : selectedType === 'office_worker'
        ? 'char_office'
        : selectedType === 'food_lover'
        ? 'char_gourmet'
        : 'char_neighbor';

    const customerSprite = this.add.sprite(400, 580, spriteKey).setDepth(8);

    const newCustomer: SceneCustomer = {
      id: Math.random().toString(36).substring(2, 9),
      typeId: selectedType,
      sprite: customerSprite,
      tableIndex: availableTable.index,
      state: 'walking_in',
      patienceRemaining: cType.patienceSeconds,
      maxPatience: cType.patienceSeconds,
    };

    availableTable.isOccupied = true;
    availableTable.customerId = newCustomer.id;
    this.customers.push(newCustomer);

    soundManager.playDoorBell();

    // Di chuyển khách vào bàn
    this.tweens.add({
      targets: customerSprite,
      x: availableTable.chairX,
      y: availableTable.chairY,
      duration: 2500,
      onComplete: () => {
        newCustomer.state = 'sitting';
        this.setupOrderForTable(availableTable, newCustomer);
      },
    });
  }

  private setupOrderForTable(table: SceneTable, customer: SceneCustomer) {
    const cType = CUSTOMER_TYPES[customer.typeId];
    // Chọn món ưa thích
    const favorites = cType.favoriteRecipeIds;
    const chosenRecipeId = favorites[Math.floor(Math.random() * favorites.length)];
    const recipe = RECIPES[chosenRecipeId];

    table.currentRecipeId = chosenRecipeId;
    table.foodReady = false;
    customer.recipeId = chosenRecipeId;

    // Tạo khung bong bóng order trên bàn
    const container = this.add.container(table.x, table.y - 48).setDepth(15);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xffffff, 0.95);
    bubbleBg.lineStyle(2, 0xf7a8c4);
    bubbleBg.fillRoundedRect(-55, -20, 110, 36, 12);
    bubbleBg.strokeRoundedRect(-55, -20, 110, 36, 12);

    const dishText = this.add.text(0, -6, `${recipe.icon} ${recipe.name}`, {
      fontSize: '11px',
      color: '#7C5C55',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const patienceBar = this.add.graphics();

    container.add([bubbleBg, dishText, patienceBar]);
    table.bubbleContainer = container;
    table.bubbleBg = bubbleBg;
    table.dishText = dishText;
    table.patienceBar = patienceBar;

    // Bong bóng nhấp nháy nhẹ
    this.tweens.add({
      targets: container,
      y: table.y - 52,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private clearTableBubble(table: SceneTable) {
    if (table.bubbleContainer) {
      table.bubbleContainer.destroy();
      table.bubbleContainer = undefined;
      table.dishText = undefined;
      table.patienceBar = undefined;
    }
  }

  private handleCustomerLeaveAngry(table: SceneTable, customer: SceneCustomer) {
    useGameStore.getState().handleCustomerLeaveAngry(table.index);
    this.createFloatingFeedback('💔 Quá lâu! Khách bỏ về', '#E91E63', table.x, table.y - 40);

    this.clearTableBubble(table);
    customer.state = 'walking_out';

    this.tweens.add({
      targets: customer.sprite,
      x: 400,
      y: 580,
      duration: 2000,
      onComplete: () => {
        customer.sprite.destroy();
        this.customers = this.customers.filter((c) => c.id !== customer.id);
        table.isOccupied = false;
        table.customerId = null;
        table.currentRecipeId = undefined;
        table.foodReady = false;
      },
    });
  }

  update(time: number, delta: number) {
    const store = useGameStore.getState();
    const speed = store.timeSpeed;
    if (speed === 0) return; // Đang Pause

    // 1. Tiến trình thời gian trong game
    // 1 ngày = ~6 phút thực tế -> 1 giây thực tế = 2.5 phút game
    const minutesPassed = (delta / 1000) * 2.5 * speed;
    store.tickTime(minutesPassed);

    // 2. Sinh khách định kỳ khi mở cửa
    if (store.isShopOpen) {
      this.spawnTimer += delta * speed;
      // Bonus tốc độ gọi khách từ nâng cấp Biển hiệu hoa hồng
      const hasSignboard = (store.gameState.purchasedUpgrades['flower_signboard'] || 0) > 0;
      const spawnInterval = hasSignboard ? 4500 : 6500;

      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        this.spawnCustomer();
      }
    }

    // 3. Cập nhật thanh kiên nhẫn của khách
    this.customers.forEach((c) => {
      if (c.state === 'sitting' && !this.tables.find((t) => t.index === c.tableIndex)?.foodReady) {
        c.patienceRemaining -= (delta / 1000) * speed;
        const table = this.tables.find((t) => t.index === c.tableIndex);
        if (table && table.patienceBar) {
          table.patienceBar.clear();
          const percent = Math.max(0, c.patienceRemaining / c.maxPatience);
          const barColor = percent > 0.5 ? 0x81c784 : percent > 0.25 ? 0xffb74d : 0xe57373;
          table.patienceBar.fillStyle(barColor, 1);
          table.patienceBar.fillRoundedRect(-45, 8, 90 * percent, 4, 2);
        }

        // Hết kiên nhẫn
        if (c.patienceRemaining <= 0) {
          const t = this.tables.find((tb) => tb.index === c.tableIndex);
          if (t) this.handleCustomerLeaveAngry(t, c);
        }
      }
    });

    // 4. Hỗ trợ tự động của nhân viên
    this.updateAutomatedStaff(delta * speed);

    // 5. Di chuyển nhân vật người chơi
    this.updatePlayerMovement(delta);
  }

  private updateAutomatedStaff(deltaMs: number) {
    const store = useGameStore.getState();
    const hired = store.gameState.hiredEmployees;

    // Nhân viên Mai (Phục vụ): Tự động bưng món khi món đã xong
    if (hired.includes('emp_mai') && this.staffMaiSprite) {
      const readyTable = this.tables.find((t) => t.isOccupied && t.foodReady);
      if (readyTable) {
        // Mai bước tới bàn phục vụ
        const dist = Phaser.Math.Distance.Between(
          this.staffMaiSprite.x,
          this.staffMaiSprite.y,
          readyTable.x,
          readyTable.y
        );
        if (dist > 30) {
          this.physics?.moveToObject
            ? this.physics.moveToObject(this.staffMaiSprite, readyTable.tableSprite, 120)
            : this.moveTowards(this.staffMaiSprite, readyTable.x, readyTable.y, 1.8);
        } else {
          // Phục vụ món
          this.serveCustomer(readyTable);
        }
      } else {
        // Quay về vị trí nghỉ
        this.moveTowards(this.staffMaiSprite, 400, 160, 1.2);
      }
    }

    // Bác Linh (Đầu bếp): Tự nấu khi có order và kho còn nguyên liệu
    if (hired.includes('emp_linh')) {
      const pendingTable = this.tables.find(
        (t) => t.isOccupied && !t.foodReady && t.currentRecipeId
      );
      if (pendingTable && pendingTable.currentRecipeId) {
        const recipe = RECIPES[pendingTable.currentRecipeId];
        let hasEnough = true;
        for (const ingId of recipe.requiredIngredients) {
          if ((store.gameState.inventory[ingId] || 0) <= 0) {
            hasEnough = false;
            break;
          }
        }
        if (hasEnough) {
          // Bác Linh tự động nấu sau 3.5 giây
          if (!pendingTable.foodReady) {
            store.completeCooking(pendingTable.currentRecipeId, pendingTable.index);
            this.markFoodReadyForTable(pendingTable.index);
          }
        }
      }
    }
  }

  private moveTowards(sprite: Phaser.GameObjects.Sprite, targetX: number, targetY: number, speed: number) {
    const dx = targetX - sprite.x;
    const dy = targetY - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) return;
    sprite.x += (dx / dist) * speed;
    sprite.y += (dy / dist) * speed;
  }

  private updatePlayerMovement(delta: number) {
    const moveSpeed = 3.2;
    let vx = 0;
    let vy = 0;

    // Phím bấm
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      // Hủy vị trí click chuột nếu người chơi ấn phím
      this.targetPosition = null;
      const len = Math.sqrt(vx * vx + vy * vy);
      this.player.x += (vx / len) * moveSpeed;
      this.player.y += (vy / len) * moveSpeed;
    } else if (this.targetPosition) {
      // Di chuyển theo vị trí chạm/click
      const dx = this.targetPosition.x - this.player.x;
      const dy = this.targetPosition.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 6) {
        this.targetPosition = null;
      } else {
        this.player.x += (dx / dist) * moveSpeed;
        this.player.y += (dy / dist) * moveSpeed;
      }
    }

    // Giới hạn trong khuôn viên quán
    this.player.x = Phaser.Math.Clamp(this.player.x, 60, 740);
    this.player.y = Phaser.Math.Clamp(this.player.y, 110, 560);
  }
}
