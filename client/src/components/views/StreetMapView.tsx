import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BUSINESS_STAGES,
  RECIPES,
  CUSTOMER_TYPES,
  NEIGHBORS_DATA,
  RESTAURANT_TYPES,
  EMPLOYEES,
} from '../../../../shared/gameData';
import { BusinessStageId, RestaurantTypeId, Employee } from '../../../../shared/types';
import { STAGE_VISUALS } from '../../utils/stageVisuals';
import { soundManager } from '../../utils/soundManager';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Sparkles,
  Award,
  UserPlus,
  X,
  Building2,
  HardHat,
  Coins,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Store,
  Trees,
  CheckCircle2,
} from 'lucide-react';

// KÍCH THƯỚC Ô LƯỚI ISOMETRIC 2.5D (Isometric Grid Geometry)
const TILE_W = 110;
const TILE_H = 55;

export const StreetMapView: React.FC = () => {
  const {
    gameState,
    activeOrders,
    setCurrentView,
    serveDishOrder,
    openModal,
    switchActiveRestaurant,
  } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Vị trí Pan (kéo rê camera 2.5D) & Tỷ lệ Zoom
  const [pan, setPan] = useState({ x: 0, y: -40 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const hasDraggedRef = useRef(false);

  // Công trình / Lô đất đang được chọn mở bảng thông tin
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Chu kỳ xe cộ di chuyển trên đường 2.5D
  const [vehicleOffset, setVehicleOffset] = useState(0);

  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      setVehicleOffset((elapsed * 0.12) % 1);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Cấu hình cấp bậc vỉa hè & quán ăn hiện tại
  const currentStage = BUSINESS_STAGES[gameState.businessStage] || BUSINESS_STAGES.cart;
  const activeRestId = gameState.activeRestaurantId || 'banh_mi';
  const currentRest = RESTAURANT_TYPES[activeRestId] || RESTAURANT_TYPES.banh_mi;
  const stageVisual = STAGE_VISUALS[gameState.businessStage] || STAGE_VISUALS.cart;

  // Lấy danh sách nhân viên được phân công cho từng quán
  const getStaffForRest = (restKey: RestaurantTypeId): Employee[] => {
    return gameState.hiredEmployees
      .map((id) => gameState.employeeDetails[id] || EMPLOYEES.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e) && (e.assignedRestaurantId || 'banh_mi') === restKey);
  };

  // Helper tính tọa độ màn hình từ tọa độ ô lưới (Grid to Screen Isometric)
  const gridToScreen = (gx: number, gy: number) => {
    return {
      x: (gx - gy) * (TILE_W / 2) + 600,
      y: (gx + gy) * (TILE_H / 2) + 160,
    };
  };

  // DANH SÁCH CÁC CÔNG TRÌNH & LÔ ĐẤT ẨM THỰC 2.5D (Zoning Plots)
  const buildings = useMemo(() => {
    return [
      // 1. QUÁN BÁNH MÌ SÀI GÒN
      {
        id: 'banh_mi',
        type: 'restaurant' as const,
        restKey: 'banh_mi' as RestaurantTypeId,
        title: 'Bánh Mì Sài Gòn',
        tagline: 'Giòn rụm pate bơ Pháp',
        icon: '🥖',
        gx: 2,
        gy: 1,
        width: 1,
        length: 1,
        height: 65,
        themeColor: '#EA580C',
        wallColor: '#FDBA74',
        roofColor: '#C2410C',
      },
      // 2. QUÁN PHỞ BÒ GIA TRUYỀN
      {
        id: 'pho',
        type: 'restaurant' as const,
        restKey: 'pho' as RestaurantTypeId,
        title: 'Phở Bò Gia Truyền',
        tagline: 'Nước dùng ninh xương 24h',
        icon: '🍜',
        gx: 4,
        gy: 1,
        width: 1,
        length: 1,
        height: 72,
        themeColor: '#DC2626',
        wallColor: '#FCA5A5',
        roofColor: '#B91C1C',
      },
      // 3. QUÁN BÚN BÒ HUẾ & BÚN RIÊU
      {
        id: 'bun',
        type: 'restaurant' as const,
        restKey: 'bun' as RestaurantTypeId,
        title: 'Bún Bò Huế & Riêu',
        tagline: 'Sa tế cay nồng đậm vị',
        icon: '🍲',
        gx: 6,
        gy: 1,
        width: 1,
        length: 1,
        height: 68,
        themeColor: '#7C3AED',
        wallColor: '#DDD6FE',
        roofColor: '#6D28D9',
      },
      // 4. TIỆM BÒ NÉ & STEAK CHẢO GANG
      {
        id: 'beefsteak',
        type: 'restaurant' as const,
        restKey: 'beefsteak' as RestaurantTypeId,
        title: 'Bò Né Xèo Xèo',
        tagline: 'Chảo gang bơ thơm lừng',
        icon: '🥩',
        gx: 2,
        gy: 4,
        width: 1,
        length: 1,
        height: 66,
        themeColor: '#B91C1C',
        wallColor: '#FED7AA',
        roofColor: '#991B1B',
      },
      // 5. QUÁN CƠM TẤM SƯỜN NƯỚNG THAN
      {
        id: 'com_tam',
        type: 'restaurant' as const,
        restKey: 'com_tam' as RestaurantTypeId,
        title: 'Cơm Tấm Sườn Bì Chả',
        tagline: 'Sườn nướng mật ong than hồng',
        icon: '🍛',
        gx: 4,
        gy: 4,
        width: 1,
        length: 1,
        height: 70,
        themeColor: '#D97706',
        wallColor: '#FDE68A',
        roofColor: '#B45309',
      },
      // 6. CHỢ ĐẦU MỐI NÔNG SẢN BẾN THÀNH (Market)
      {
        id: 'market',
        type: 'facility' as const,
        facilityType: 'market' as const,
        title: 'Chợ Sỉ Đầu Mối',
        tagline: 'Rau củ thịt cá bơ trứng',
        icon: '🛒',
        gx: 7,
        gy: 3,
        width: 2,
        length: 1,
        height: 55,
        themeColor: '#10B981',
        wallColor: '#A7F3D0',
        roofColor: '#059669',
      },
      // 7. CÀ PHÊ BÁC BA & CÂY ME CỔ THỤ (Neighbors / Park)
      {
        id: 'neighbors',
        type: 'facility' as const,
        facilityType: 'neighbors' as const,
        title: 'Cà Phê Bác Ba & Cây Me',
        tagline: 'Bàn cờ tướng & radio xưa',
        icon: '☕',
        gx: 6,
        gy: 5,
        width: 1,
        length: 1,
        height: 48,
        themeColor: '#0284C7',
        wallColor: '#BAE6FD',
        roofColor: '#0369A1',
      },
      // 8. TIỆM SỬA XE MÁY CHÚ NĂM
      {
        id: 'delivery',
        type: 'facility' as const,
        facilityType: 'delivery' as const,
        title: 'Đội Xe Giao Hàng & Sửa Xe',
        tagline: 'Bơm vá & shipper nổ cuốc',
        icon: '🔧',
        gx: 1,
        gy: 3,
        width: 1,
        length: 1,
        height: 52,
        themeColor: '#64748B',
        wallColor: '#CBD5E1',
        roofColor: '#475569',
      },
      // 9. ĐẠI LÝ VÉ SỐ CÔ BẢY
      {
        id: 'lottery',
        type: 'facility' as const,
        facilityType: 'lottery' as const,
        title: 'Vé Số & Đề Học Cô Bảy',
        tagline: 'Cơ hội trúng độc đắc x70',
        icon: '🎟️',
        gx: 1,
        gy: 5,
        width: 1,
        length: 1,
        height: 45,
        themeColor: '#E11D48',
        wallColor: '#FECDD3',
        roofColor: '#BE123C',
      },
    ];
  }, []);

  // Xử lý kéo rê chuột / cảm ứng (Mouse & Touch Pan Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Chuyển sang quản lý chi nhánh
  const handleSwitchBranch = (id: RestaurantTypeId) => {
    soundManager.playClick();
    switchActiveRestaurant(id);
    setSelectedBuildingId(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Thu hoạch nhanh tiền thụ động chi nhánh
  const handleHarvestBranch = (restKey: RestaurantTypeId, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playCoin();
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#EC4899'],
    });
  };

  // Zoom In / Out
  const handleZoom = (delta: number) => {
    soundManager.playClick();
    setZoom((prev) => Math.max(0.75, Math.min(1.4, +(prev + delta).toFixed(2))));
  };

  const handleResetCenter = () => {
    soundManager.playClick();
    setPan({ x: 0, y: -40 });
    setZoom(1);
  };

  // Tìm thông tin công trình đang chọn
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none bg-[#74A747] relative">
      {/* CSS KEYFRAMES CHO HOẠT HỌA SIMCITY 2.5D */}
      <style>{`
        @keyframes floatHat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.08); }
        }
        @keyframes coinBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.12); }
        }
        @keyframes smokePuff {
          0% { transform: translateY(0) scale(0.8); opacity: 0.8; }
          50% { transform: translateY(-12px) scale(1.2); opacity: 0.4; }
          100% { transform: translateY(-24px) scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. THANH TOP HUD PHONG CÁCH SIMCITY BUILDIT ĐẲNG CẤP                     */}
      {/* ========================================================================= */}
      <div className="relative z-40 shrink-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-2 sm:px-4 text-white flex items-center justify-between pointer-events-auto">
        {/* Góc trái: Level Badge Tím, Dân số, Độ hài lòng, Kho hàng */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Huy hiệu Level Tím (Giống icon số 3 trong ảnh mẫu) */}
          <div
            onClick={() => openModal('upgrades')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-pink-500 border-2 border-white flex items-center justify-center font-black text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
            title="Cấp bậc vỉa hè"
          >
            <span>
              {gameState.businessStage === 'cart'
                ? '1'
                : gameState.businessStage === 'corner'
                ? '2'
                : gameState.businessStage === 'awning'
                ? '3'
                : gameState.businessStage === 'eatery'
                ? '4'
                : '5'}
            </span>
          </div>

          {/* Khách hàng & Độ hài lòng */}
          <div className="bg-black/60 backdrop-blur-xs rounded-full border border-white/20 px-2 py-0.5 flex items-center gap-1.5 text-[11px] font-black">
            <span className="text-amber-400">👥</span>
            <span>{800 + gameState.reputation * 12}</span>
            <span className="text-white/40">|</span>
            <span className="text-emerald-400">😊</span>
            <span>{Math.min(100, 75 + Math.round(gameState.reputation / 3))}%</span>
          </div>

          {/* Sức chứa kho nguyên liệu */}
          <div
            onClick={() => openModal('market')}
            className="bg-black/60 backdrop-blur-xs rounded-full border border-white/20 px-2 py-0.5 flex items-center gap-1 text-[11px] font-black cursor-pointer hover:border-amber-400 active:scale-95"
            title="Kho nguyên liệu & Chợ sỉ"
          >
            <span className="text-sky-400">📦</span>
            <span className="text-sky-200">
              {Object.values(gameState.inventory).reduce((a, b) => a + b, 0)}/{gameState.storageCapacity}
            </span>
          </div>
        </div>

        {/* Góc phải: Tiền Vàng 🪙 và Vốn Đầu Tư 💵 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tiền Vàng (Coins Bar chuẩn SimCity) */}
          <div className="bg-black/60 backdrop-blur-xs rounded-full border border-white/20 px-2.5 py-0.5 flex items-center gap-1.5 shadow-md">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-100 flex items-center justify-center text-[11px] shadow-xs">
              🪙
            </div>
            <span className="font-black text-amber-300 text-xs sm:text-sm">
              {gameState.money.toLocaleString('vi-VN')}
            </span>
            <button
              onClick={() => openModal('market')}
              className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center ml-0.5"
            >
              +
            </button>
          </div>

          {/* Điểm Danh Tiếng / Uy Tín ⭐ */}
          <div className="bg-black/60 backdrop-blur-xs rounded-full border border-white/20 px-2 py-0.5 flex items-center gap-1 shadow-md text-xs font-black text-emerald-300">
            <span>⭐</span>
            <span>{gameState.reputation}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KHÔNG GIAN BẢN ĐỒ ISOMETRIC 2.5D (SIMCITY CANVAS)                     */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex-1 w-full relative overflow-hidden touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* CONTAINER ZOOM & PAN NỘI BỘ */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            width: '1200px',
            height: '800px',
          }}
          className="relative pointer-events-auto"
        >
          {/* SVG LỚP 1: NỀN ĐẤT CỎ, ĐƯỜNG NHỰA 2.5D, VẠCH SƠN VÀ XE CỘ */}
          <svg
            viewBox="0 0 1200 800"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* 1. NỀN THẢM CỎ XANH TƯƠI MÁT */}
            <defs>
              <pattern id="grassGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#75A642" />
                <circle cx="20" cy="20" r="1.5" fill="#6A973A" />
                <circle cx="8" cy="8" r="1" fill="#7EB247" />
                <circle cx="32" cy="30" r="1" fill="#7EB247" />
              </pattern>

              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3F4A57" />
                <stop offset="100%" stopColor="#2E3742" />
              </linearGradient>

              {/* Bộ lọc bóng đổ mềm cho công trình 2.5D */}
              <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="4" dy="8" stdDeviation="5" floodOpacity="0.32" />
              </filter>
            </defs>

            <rect width="1200" height="800" fill="url(#grassGrid)" />

            {/* CÂY XANH RỪNG RẬM Ở CÁC RÌA BẢN ĐỒ */}
            {[
              { x: 100, y: 80 }, { x: 150, y: 110 }, { x: 80, y: 150 },
              { x: 1050, y: 100 }, { x: 1120, y: 130 }, { x: 1080, y: 180 },
              { x: 1100, y: 650 }, { x: 1050, y: 700 }, { x: 980, y: 680 },
              { x: 120, y: 650 }, { x: 180, y: 700 }, { x: 80, y: 720 },
            ].map((tree, i) => (
              <g key={i} transform={`translate(${tree.x}, ${tree.y})`}>
                <ellipse cx="0" cy="8" rx="14" ry="6" fill="#000000" opacity="0.25" />
                <circle cx="0" cy="-2" r="14" fill="#3D7E2F" />
                <circle cx="-3" cy="-5" r="10" fill="#4B9B3A" />
                <circle cx="3" cy="-7" r="7" fill="#67B847" />
              </g>
            ))}

            {/* 2. MẠNG LƯỚI ĐƯỜNG NHỰA ISOMETRIC (Road Network) */}
            {/* Đường trục 1: Tây Bắc sang Đông Nam (gx: 0..8, gy: 2.5) */}
            {(() => {
              const start = gridToScreen(0, 2.7);
              const end = gridToScreen(8, 2.7);
              return (
                <g>
                  {/* Vỉa hè bê tông xám */}
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#CBD5E1" strokeWidth="44" strokeLinecap="round"
                  />
                  {/* Lòng đường nhựa */}
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="url(#roadGradient)" strokeWidth="36" strokeLinecap="round"
                  />
                  {/* Vạch kẻ đường đứt nét vàng */}
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#FDE047" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.85"
                  />
                </g>
              );
            })()}

            {/* Đường trục 2: Tây Bắc sang Đông Nam (gx: 0..8, gy: 5.5) */}
            {(() => {
              const start = gridToScreen(0, 5.7);
              const end = gridToScreen(8, 5.7);
              return (
                <g>
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#CBD5E1" strokeWidth="44" strokeLinecap="round"
                  />
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="url(#roadGradient)" strokeWidth="36" strokeLinecap="round"
                  />
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#FDE047" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.85"
                  />
                </g>
              );
            })()}

            {/* Đường trục nối dọc: Tây Nam sang Đông Bắc (gy: 0..8, gx: 3.5) */}
            {(() => {
              const start = gridToScreen(3.5, 0);
              const end = gridToScreen(3.5, 8);
              return (
                <g>
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#CBD5E1" strokeWidth="42" strokeLinecap="round"
                  />
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="url(#roadGradient)" strokeWidth="34" strokeLinecap="round"
                  />
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="#FFFFFF" strokeWidth="2" strokeDasharray="7 7" opacity="0.8"
                  />
                </g>
              );
            })()}

            {/* 3. XE CỘ CHẠY TRÊN ĐƯỜNG 2.5D (Animated Traffic) */}
            {/* Xe 1: Xe taxi vàng trên đường trục 1 */}
            {(() => {
              const start = gridToScreen(0, 2.6);
              const end = gridToScreen(8, 2.6);
              const curX = start.x + (end.x - start.x) * vehicleOffset;
              const curY = start.y + (end.y - start.y) * vehicleOffset;
              return (
                <g transform={`translate(${curX}, ${curY})`}>
                  <ellipse cx="0" cy="2" rx="9" ry="4" fill="#000" opacity="0.4" />
                  <rect x="-8" y="-5" width="16" height="8" rx="2" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
                  <rect x="-5" y="-7" width="10" height="4" rx="1" fill="#FEF08A" />
                </g>
              );
            })()}

            {/* Xe 2: Xe máy Dream chở hàng trên đường trục 2 */}
            {(() => {
              const start = gridToScreen(8, 5.8);
              const end = gridToScreen(0, 5.8);
              const curX = start.x + (end.x - start.x) * vehicleOffset;
              const curY = start.y + (end.y - start.y) * vehicleOffset;
              return (
                <g transform={`translate(${curX}, ${curY})`}>
                  <ellipse cx="0" cy="2" rx="6" ry="3" fill="#000" opacity="0.35" />
                  <circle cx="-3" cy="0" r="3" fill="#1E293B" />
                  <circle cx="3" cy="0" r="3" fill="#1E293B" />
                  <rect x="-4" y="-6" width="7" height="4" fill="#DC2626" rx="1" />
                </g>
              );
            })()}

            {/* Xe 3: Xe con màu trắng trên trục dọc */}
            {(() => {
              const start = gridToScreen(3.6, 0.5);
              const end = gridToScreen(3.6, 7.5);
              const offset2 = (vehicleOffset + 0.5) % 1;
              const curX = start.x + (end.x - start.x) * offset2;
              const curY = start.y + (end.y - start.y) * offset2;
              return (
                <g transform={`translate(${curX}, ${curY})`}>
                  <ellipse cx="0" cy="2" rx="9" ry="4" fill="#000" opacity="0.4" />
                  <rect x="-8" y="-5" width="16" height="8" rx="2" fill="#F8FAFC" stroke="#475569" strokeWidth="1" />
                  <rect x="-4" y="-7" width="8" height="4" rx="1" fill="#94A3B8" />
                </g>
              );
            })()}
          </svg>

          {/* LỚP 2: CÁC KHỐI NHÀ 2.5D ISOMETRIC VÀ BONG BÓNG NỔI (HTML Interactive Elements) */}
          <div className="absolute inset-0 pointer-events-none">
            {buildings.map((b) => {
              const pos = gridToScreen(b.gx, b.gy);
              const isSelected = selectedBuildingId === b.id;

              // Kiểm tra trạng thái nếu là quán ẩm thực
              const isRest = b.type === 'restaurant';
              const restKey = b.restKey as RestaurantTypeId;
              const isCurrent = isRest && restKey === activeRestId;
              const isUnlocked = isRest && gameState.unlockedRestaurants?.includes(restKey);
              const staff = isRest ? getStaffForRest(restKey) : [];
              const isStaffed = staff.length > 0;
              const canAffordUnlock =
                isRest &&
                !isUnlocked &&
                gameState.money >= (RESTAURANT_TYPES[restKey]?.unlockCost || 0) &&
                gameState.reputation >= (RESTAURANT_TYPES[restKey]?.requiredReputation || 0);

              return (
                <div
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playClick();
                    setSelectedBuildingId(b.id);
                  }}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -100%)',
                    zIndex: Math.round(b.gx + b.gy) * 10,
                  }}
                  className="absolute pointer-events-auto cursor-pointer group"
                >
                  {/* BÓNG ĐỔ KHỐI NHÀ DƯỚI ĐẤT */}
                  <div
                    style={{
                      width: `${TILE_W * 0.9}px`,
                      height: `${TILE_H * 0.8}px`,
                      transform: 'translate(-50%, 65%) scale(1, 0.5)',
                      backgroundColor: 'rgba(0,0,0,0.28)',
                      borderRadius: '50%',
                    }}
                    className="absolute left-1/2 bottom-0 pointer-events-none"
                  />

                  {/* KHỐI NHÀ 2.5D ISOMETRIC (Building Mesh) */}
                  <div
                    style={{
                      width: `${TILE_W * 0.85}px`,
                      height: `${b.height + 35}px`,
                    }}
                    className={`relative flex flex-col justify-end transition-all duration-200 ${
                      isSelected ? 'scale-105 brightness-110' : 'group-hover:scale-102 group-hover:brightness-105'
                    }`}
                  >
                    {/* TRƯỜNG HỢP A: QUÁN CHƯA MỞ (LÔ ĐẤT ĐANG THI CÔNG / CÔNG TRƯỜNG GIỐNG SIMCITY) */}
                    {isRest && !isUnlocked ? (
                      <div className="relative w-full h-14 bg-amber-100/90 border-2 border-dashed border-amber-500 rounded-xl p-1 flex flex-col justify-between items-center shadow-md">
                        {/* Hàng rào công trình vàng sọc đen */}
                        <div className="w-full h-2 rounded-t flex overflow-hidden">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-full"
                              style={{ backgroundColor: i % 2 === 0 ? '#F59E0B' : '#78350F' }}
                            />
                          ))}
                        </div>

                        <div className="text-xl opacity-75">{b.icon}</div>

                        <div className="text-[8px] font-black text-amber-950 bg-amber-300 px-1.5 rounded-full">
                          {canAffordUnlock ? 'SẴN SÀNG 🚀' : 'CHƯA MỞ ⏳'}
                        </div>
                      </div>
                    ) : (
                      /* TRƯỜNG HỢP B: TÒA NHÀ 2.5D HOÀN CHỈNH CÓ MẶT NÓC, MẶT TRƯỚC VÀ MẶT HÔNG */
                      <div className="relative w-full flex flex-col justify-end">
                        {/* 1. MẶT MÁI NHÀ (Roof - Nhìn từ trên xuống) */}
                        <div
                          style={{
                            backgroundColor: b.roofColor,
                            borderColor: b.themeColor,
                            height: '24px',
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                          }}
                          className="w-full relative flex items-center justify-center shadow-xs"
                        >
                          {/* Khói nghi ngút bốc lên từ nóc nhà */}
                          {isUnlocked && (
                            <span
                              style={{ animation: 'smokePuff 2.2s infinite ease-out' }}
                              className="absolute -top-3 text-xs pointer-events-none"
                            >
                              ♨️
                            </span>
                          )}
                        </div>

                        {/* 2. MẶT TRƯỚC TÒA NHÀ 2.5D (Front Facade) */}
                        <div
                          style={{
                            backgroundColor: b.wallColor,
                            borderColor: b.themeColor,
                            borderWidth: '2px',
                          }}
                          className={`w-full rounded-b-xl p-1.5 flex flex-col justify-between shadow-lg relative overflow-hidden ${
                            isCurrent ? 'ring-2 ring-amber-400' : ''
                          }`}
                        >
                          {/* Mái hiên sọc đặc trưng */}
                          <div className="h-2 w-full rounded flex overflow-hidden mb-1">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="flex-1 h-full"
                                style={{
                                  backgroundColor:
                                    i % 2 === 0 ? b.themeColor : '#FFFFFF',
                                }}
                              />
                            ))}
                          </div>

                          {/* Icon công trình & Bảng hiệu */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xl sm:text-2xl drop-shadow-xs">{b.icon}</span>
                            <div className="text-right min-w-0">
                              <div className="text-[9px] font-black text-slate-900 leading-tight truncate">
                                {b.title.split(' ')[0]}
                              </div>
                              <div className="text-[7.5px] font-bold text-slate-700 truncate">
                                {isRest ? (isCurrent ? 'Trụ Sở 👑' : `${staff.length} NV`) : 'Dịch vụ'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================================================================= */}
                    {/* BONG BÓNG NỔI ĐẶC TRƯNG SIMCITY (Floating Interactive Bubbles)    */}
                    {/* ================================================================= */}
                    {/* 1. Mũ Bảo Hộ Màu Vàng 👷‍♂️ (Khi đủ điều kiện mở chi nhánh) */}
                    {isRest && !isUnlocked && canAffordUnlock && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          openModal('franchise');
                        }}
                        style={{ animation: 'floatHat 2s infinite ease-in-out' }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 z-30"
                        title="Đủ điều kiện mở chi nhánh! Chạm để xây dựng"
                      >
                        <span className="text-base">👷‍♂️</span>
                      </div>
                    )}

                    {/* 2. Bong Bóng Tiền Vàng 💰 (Chi nhánh tự động có doanh thu thụ động) */}
                    {isRest && isUnlocked && !isCurrent && isStaffed && (
                      <div
                        onClick={(e) => handleHarvestBranch(restKey, e)}
                        style={{ animation: 'coinBounce 2.5s infinite ease-in-out' }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 z-30"
                        title="Chi nhánh đang tự động kiếm tiền! Chạm để thu hoạch"
                      >
                        <span className="text-base">💰</span>
                      </div>
                    )}

                    {/* 3. Bong Bóng Cảnh Báo ⚠️ (Chi nhánh chưa có nhân viên phụ trách) */}
                    {isRest && isUnlocked && !isCurrent && !isStaffed && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          openModal('employees');
                        }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-rose-500 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer animate-pulse hover:scale-110 active:scale-90 z-30"
                        title="Cần phân công nhân viên để tự động bán hàng!"
                      >
                        <span className="text-sm">⚠️</span>
                      </div>
                    )}

                    {/* 4. Vương Miện Trụ Sở 👑 */}
                    {isCurrent && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 border border-amber-600 text-amber-950 font-black text-[7.5px] px-1.5 py-0.2 rounded-full shadow-md flex items-center gap-0.5 whitespace-nowrap z-20">
                        <span>👑</span> Trụ Sở
                      </div>
                    )}

                    {/* 5. Bong bóng Sự Kiện 🚨 tại Cây Me Bác Ba */}
                    {b.id === 'neighbors' && gameState.currentEvent && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          openModal('streetEvents');
                        }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 border-2 border-yellow-300 shadow-xl flex items-center justify-center cursor-pointer animate-bounce hover:scale-110 active:scale-90 z-30"
                        title="Có biến cố đường phố!"
                      >
                        <span className="text-base">🚨</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NÚT ĐIỀU KHIỂN ZOOM & CĂN GIỮA CAMERA (Floating Map Controls) */}
        <div className="absolute right-3 bottom-20 z-40 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => handleZoom(0.15)}
            className="w-8 h-8 rounded-xl bg-white/90 border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleZoom(-0.15)}
            className="w-8 h-8 rounded-xl bg-white/90 border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetCenter}
            className="w-8 h-8 rounded-xl bg-amber-500 border border-amber-600 shadow-md flex items-center justify-center text-white hover:bg-amber-600 active:scale-90"
            title="Căn giữa camera"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BẢNG ĐIỀU KHIỂN CÔNG TRÌNH 2.5D KHI CHẠM VÀO (Building Inspector Sheet) */}
      {/* ========================================================================= */}
      {activeBuilding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-300 w-full max-w-md overflow-hidden shadow-2xl p-4 flex flex-col gap-3 animate-slide-up">
            {/* Header thẻ công trình */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: activeBuilding.wallColor }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-xs border border-black/5"
                >
                  {activeBuilding.icon}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    {activeBuilding.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {activeBuilding.tagline}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBuildingId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chi tiết theo từng loại công trình */}
            {activeBuilding.type === 'restaurant' ? (
              (() => {
                const restKey = activeBuilding.restKey as RestaurantTypeId;
                const rest = RESTAURANT_TYPES[restKey];
                const isCurrent = restKey === activeRestId;
                const isUnlocked = gameState.unlockedRestaurants?.includes(restKey);
                const staff = getStaffForRest(restKey);

                return (
                  <div className="space-y-2.5">
                    {/* Thiết bị đặc sản */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-black text-slate-700 flex items-center gap-1">
                        <span>{rest.equipmentIcon}</span>
                        <span>{rest.equipmentName}</span>
                      </span>
                      <span className="font-bold text-slate-500">{rest.primaryRecipeIds.length} món đặc sản</span>
                    </div>

                    {/* Tình trạng chi nhánh & nhân sự */}
                    {isUnlocked ? (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          staff.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div>
                          <div className="font-black text-slate-800 flex items-center gap-1">
                            <span>{staff.length > 0 ? '🟢 TỰ ĐỘNG BÁN HÀNG' : '⚠️ CHƯA CÓ NHÂN VIÊN'}</span>
                          </div>
                          <div className="text-[10.5px] text-slate-600 mt-0.5">
                            {staff.length > 0
                              ? `Đang trực: ${staff.map((s) => s.name).join(', ')}`
                              : 'Cần phân công nhân viên để tự động kinh doanh'}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBuildingId(null);
                            openModal('employees');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[10px] font-black text-slate-700 shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3 text-amber-600" />
                          <span>Giao Việc</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-black text-slate-800">
                          <span>Chi phí mở chi nhánh:</span>
                          <span className="text-rose-600">{rest.unlockCost.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                          <span>Uy tín yêu cầu:</span>
                          <span className="text-emerald-700">{rest.requiredReputation} ⭐</span>
                        </div>
                      </div>
                    )}

                    {/* Các nút hành động chính */}
                    <div className="pt-1 flex items-center gap-2">
                      {isCurrent ? (
                        <button
                          onClick={() => {
                            setSelectedBuildingId(null);
                            setCurrentView('shop');
                          }}
                          className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Utensils className="w-4 h-4" />
                          <span>VÀO BẾP NẤU NƯỚNG 🍳</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleSwitchBranch(restKey)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>CHUYỂN QUẢN LÝ QUÁN NÀY 🔀</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBuildingId(null);
                            openModal('franchise');
                          }}
                          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>MỞ CHI NHÁNH NÀY 🚀</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Dịch vụ tiện ích dân cư (Chợ, Bác Ba, Giao hàng, Vé số) */
              <div className="space-y-2.5">
                <p className="text-xs text-slate-600">
                  {activeBuilding.facilityType === 'market' && 'Ghé Chợ Đầu Mối để mua sỉ các loại nguyên liệu thịt, bánh mì, rau củ tươi ngon.'}
                  {activeBuilding.facilityType === 'neighbors' && 'Trò chuyện cùng Bác Ba và bà con lối xóm để tăng độ thân thiết và mở khóa bí mật.'}
                  {activeBuilding.facilityType === 'delivery' && 'Nhận cuốc giao hàng siêu tốc bằng xe máy để kiếm thêm tiền tip và kinh nghiệm.'}
                  {activeBuilding.facilityType === 'lottery' && 'Thử vận may mua vé số kiến thiết chiều nay hoặc tra cứu sổ mơ lô đề x70.'}
                </p>

                <button
                  onClick={() => {
                    const fType = activeBuilding.facilityType;
                    setSelectedBuildingId(null);
                    if (fType === 'market') openModal('market');
                    else if (fType === 'neighbors') openModal('neighbors');
                    else if (fType === 'delivery') openModal('delivery');
                    else if (fType === 'lottery') openModal('lotteryDraw');
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>GHÉ THĂM ĐỊA ĐIỂM NÀY 👉</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
