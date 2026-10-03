import Phaser from 'phaser';

/**
 * Sinh texture đồ họa Cozy Pixel Art trực tiếp bằng Canvas HTML5
 * Đảm bảo 100% chuẩn màu GDD: Hồng pastel (#F7A8C4), Kem (#FFF7ED), Nâu (#7C5C55)
 */
export function generateProceduralAssets(scene: Phaser.Scene) {
  // 1. Sàn gỗ Cozy Checkered Floor (32x32)
  if (!scene.textures.exists('tile_floor')) {
    const canvas = scene.textures.createCanvas('tile_floor', 64, 64);
    if (canvas) {
      const ctx = canvas.context;
      // Nền kem gỗ
      ctx.fillStyle = '#FFF7ED';
      ctx.fillRect(0, 0, 64, 64);
      // Họa tiết vân gỗ nhạt
      ctx.fillStyle = '#FFEBD4';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillRect(32, 32, 32, 32);
      // Đường viền gỗ thanh nhã
      ctx.strokeStyle = '#F7D7BA';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 64, 64);
      ctx.strokeRect(0, 0, 32, 32);
      canvas.refresh();
    }
  }

  // 2. Tường Hồng Pastel với dải ốp chân tường (64x64)
  if (!scene.textures.exists('tile_wall')) {
    const canvas = scene.textures.createCanvas('tile_wall', 64, 64);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#F7A8C4';
      ctx.fillRect(0, 0, 64, 52);
      // Điểm xuyết hoa văn chấm bi pastel
      ctx.fillStyle = '#FFD6E5';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.arc(48, 36, 4, 0, Math.PI * 2);
      ctx.fill();
      // Chân tường gỗ kem
      ctx.fillStyle = '#FFF7ED';
      ctx.fillRect(0, 52, 64, 12);
      ctx.strokeStyle = '#E2B89D';
      ctx.strokeRect(0, 52, 64, 12);
      canvas.refresh();
    }
  }

  // 3. Quầy Bếp (Cooking Counter) 80x48
  if (!scene.textures.exists('prop_kitchen')) {
    const canvas = scene.textures.createCanvas('prop_kitchen', 80, 50);
    if (canvas) {
      const ctx = canvas.context;
      // Thân quầy
      ctx.fillStyle = '#FFF1F6';
      ctx.fillRect(0, 10, 80, 40);
      ctx.strokeStyle = '#F7A8C4';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 10, 80, 40);
      // Mặt bếp
      ctx.fillStyle = '#BFE3D0'; // Mint
      ctx.fillRect(0, 0, 80, 14);
      // Bếp lò tròn
      ctx.fillStyle = '#7C5C55';
      ctx.beginPath();
      ctx.arc(24, 7, 5, 0, Math.PI * 2);
      ctx.arc(56, 7, 5, 0, Math.PI * 2);
      ctx.fill();
      // Lửa nhỏ ấm áp
      ctx.fillStyle = '#FF8A65';
      ctx.beginPath();
      ctx.arc(24, 7, 2.5, 0, Math.PI * 2);
      ctx.arc(56, 7, 2.5, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
  }

  // 4. Quầy Thu Ngân / Gọi Món (Cashier Counter) 70x44
  if (!scene.textures.exists('prop_cashier')) {
    const canvas = scene.textures.createCanvas('prop_cashier', 70, 44);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#FFF7ED';
      ctx.fillRect(0, 8, 70, 36);
      ctx.strokeStyle = '#E2B89D';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 8, 70, 36);
      // Mặt bàn
      ctx.fillStyle = '#F7A8C4';
      ctx.fillRect(0, 0, 70, 10);
      // Máy tính tiền nhỏ
      ctx.fillStyle = '#D8C4F1';
      ctx.fillRect(25, 2, 20, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(28, 5, 14, 5);
      canvas.refresh();
    }
  }

  // 5. Bàn Ăn Tròn Gỗ & Lọ Hoa Pastel (60x60)
  if (!scene.textures.exists('prop_table')) {
    const canvas = scene.textures.createCanvas('prop_table', 60, 60);
    if (canvas) {
      const ctx = canvas.context;
      // Bóng đổ
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.ellipse(30, 34, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mặt bàn gỗ
      ctx.fillStyle = '#FFF7ED';
      ctx.beginPath();
      ctx.arc(30, 28, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F7A8C4';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Khăn trải bàn hình thoi hồng
      ctx.fillStyle = '#FFD6E5';
      ctx.beginPath();
      ctx.moveTo(30, 16);
      ctx.lineTo(42, 28);
      ctx.lineTo(30, 40);
      ctx.lineTo(18, 28);
      ctx.closePath();
      ctx.fill();
      // Lọ hoa nhỏ ở giữa
      ctx.fillStyle = '#BFE3D0';
      ctx.beginPath();
      ctx.arc(30, 28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F7A8C4';
      ctx.beginPath();
      ctx.arc(30, 26, 2, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
  }

  // 6. Ghế Đệm Hồng (30x30)
  if (!scene.textures.exists('prop_chair')) {
    const canvas = scene.textures.createCanvas('prop_chair', 30, 30);
    if (canvas) {
      const ctx = canvas.context;
      // Đệm ghế
      ctx.fillStyle = '#FFD6E5';
      ctx.beginPath();
      ctx.arc(15, 15, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7C5C55';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Lưng tựa
      ctx.fillStyle = '#7C5C55';
      ctx.fillRect(6, 4, 18, 4);
      canvas.refresh();
    }
  }

  // 7. Thảm Cửa Chào Đón Hoa Hồng (64x36)
  if (!scene.textures.exists('prop_door_mat')) {
    const canvas = scene.textures.createCanvas('prop_door_mat', 64, 36);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#FFD6E5';
      ctx.fillRect(2, 2, 60, 32);
      ctx.strokeStyle = '#F7A8C4';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 60, 32);
      ctx.fillStyle = '#7C5C55';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WELCOME 🌸', 32, 20);
      canvas.refresh();
    }
  }

  // 8. Nhân vật chính (Chủ Quán) 32x48
  createCharacterTexture(scene, 'char_player', '#F7A8C4', '#FFE0BD', '#5D4037', true);

  // 9. Khách hàng 1: Học Sinh / Sinh Viên (Áo trắng xanh, tóc đen)
  createCharacterTexture(scene, 'char_student', '#90CAF9', '#FFE0BD', '#212121', false);

  // 10. Khách hàng 2: Dân Văn Phòng (Sơ mi pastel tím, lịch sự)
  createCharacterTexture(scene, 'char_office', '#D8C4F1', '#FFE0BD', '#4E342E', false);

  // 11. Khách hàng 3: Gourmet Tín đồ ẩm thực (Áo vàng cam ấm)
  createCharacterTexture(scene, 'char_gourmet', '#FFE082', '#FFE0BD', '#D84315', false);

  // 12. Khách hàng 4: Bác Hàng Xóm Thân Thiện (Áo hoa mint)
  createCharacterTexture(scene, 'char_neighbor', '#BFE3D0', '#FFE0BD', '#757575', false);

  // 13. Nhân viên Mai (Phục vụ - nơ hồng tóc hai bím)
  createCharacterTexture(scene, 'char_emp_mai', '#FF80AB', '#FFE0BD', '#3E2723', false, true);

  // 14. Nhân viên Linh (Bếp trưởng - mũ đầu bếp trắng)
  createCharacterTexture(scene, 'char_emp_linh', '#CFD8DC', '#FFE0BD', '#455A64', true);
}

function createCharacterTexture(
  scene: Phaser.Scene,
  key: string,
  outfitColor: string,
  skinColor: string,
  hairColor: string,
  isChefHat = false,
  hasBow = false
) {
  if (scene.textures.exists(key)) return;

  const canvas = scene.textures.createCanvas(key, 32, 48);
  if (!canvas) return;
  const ctx = canvas.context;

  // Bóng dưới chân
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(16, 44, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chân/Giày
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(10, 38, 5, 6);
  ctx.fillRect(17, 38, 5, 6);

  // Quần / Váy
  ctx.fillStyle = '#7C5C55';
  ctx.fillRect(9, 32, 14, 8);

  // Thân áo
  ctx.fillStyle = outfitColor;
  ctx.fillRect(8, 20, 16, 14);

  // Tạp dề nếu là bếp
  if (isChefHat) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 23, 12, 10);
    ctx.fillStyle = '#F7A8C4';
    ctx.fillRect(14, 25, 4, 4); // Hình tim nhỏ trên tạp dề
  }

  // Cổ & Mặt
  ctx.fillStyle = skinColor;
  ctx.fillRect(14, 18, 4, 3);
  ctx.beginPath();
  ctx.arc(16, 12, 8, 0, Math.PI * 2);
  ctx.fill();

  // Mắt đen long lanh
  ctx.fillStyle = '#212121';
  ctx.fillRect(13, 11, 2, 3);
  ctx.fillRect(17, 11, 2, 3);
  // Má hồng dễ thương
  ctx.fillStyle = '#FFAB91';
  ctx.beginPath();
  ctx.arc(11, 14, 1.5, 0, Math.PI * 2);
  ctx.arc(21, 14, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Tóc
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(16, 9, 8.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(8, 9, 3, 6);
  ctx.fillRect(21, 9, 3, 6);

  // Mũ đầu bếp
  if (isChefHat) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 2, 12, 5);
    ctx.beginPath();
    ctx.arc(16, 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Nơ cài tóc nếu có
  if (hasBow) {
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.arc(9, 7, 3, 0, Math.PI * 2);
    ctx.arc(23, 7, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.refresh();
}
