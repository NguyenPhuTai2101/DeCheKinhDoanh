import React from 'react';

interface ChibiAvatarProps {
  type:
    | 'player'
    | 'student'
    | 'office_worker'
    | 'food_lover'
    | 'neighborhood'
    | 'emp_mai'
    | 'emp_linh'
    | 'bac_ba'
    | 'co_bay'
    | 'chu_nam'
    | 'be_bong'
    | 'chi_lan';
  emotion?: 'happy' | 'waiting' | 'eating' | 'love' | 'angry';
  size?: number;
  className?: string;
}

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  type,
  emotion = 'happy',
  size = 64,
  className = '',
}) => {
  // Cấu hình bảng màu sắc nét cho từng nhân vật
  const configs: Record<string, any> = {
    player: {
      skin: '#FFE0BD',
      hair: '#5D4037',
      hairStyle: 'pigtails',
      outfit: '#F7A8C4',
      hat: 'chef',
      accessory: 'heart_apron',
    },
    student: {
      skin: '#FFE0BD',
      hair: '#212121',
      hairStyle: 'short',
      outfit: '#90CAF9',
      hat: 'none',
      accessory: 'badge',
    },
    office_worker: {
      skin: '#FFE0BD',
      hair: '#4E342E',
      hairStyle: 'neat',
      outfit: '#D8C4F1',
      hat: 'none',
      accessory: 'tie',
    },
    food_lover: {
      skin: '#FFE0BD',
      hair: '#D84315',
      hairStyle: 'curly',
      outfit: '#FFE082',
      hat: 'beret',
      accessory: 'scarf',
    },
    neighborhood: {
      skin: '#FFE0BD',
      hair: '#757575',
      hairStyle: 'bun',
      outfit: '#BFE3D0',
      hat: 'none',
      accessory: 'glasses',
    },
    emp_mai: {
      skin: '#FFE0BD',
      hair: '#3E2723',
      hairStyle: 'twin_bows',
      outfit: '#FF80AB',
      hat: 'none',
      accessory: 'maid_ribbon',
    },
    emp_linh: {
      skin: '#FFE0BD',
      hair: '#455A64',
      hairStyle: 'short',
      outfit: '#CFD8DC',
      hat: 'chef_tall',
      accessory: 'mustache',
    },
    bac_ba: {
      skin: '#FFE0BD',
      hair: '#9E9E9E',
      hairStyle: 'short',
      outfit: '#33691E',
      hat: 'none',
      accessory: 'glasses',
    },
    co_bay: {
      skin: '#FFE0BD',
      hair: '#616161',
      hairStyle: 'bun',
      outfit: '#F59E0B',
      hat: 'none',
      accessory: 'scarf',
    },
    chu_nam: {
      skin: '#FFE0BD',
      hair: '#3E2723',
      hairStyle: 'short',
      outfit: '#0284C7',
      hat: 'helmet',
      accessory: 'tie',
    },
    be_bong: {
      skin: '#FFE0BD',
      hair: '#212121',
      hairStyle: 'twin_bows',
      outfit: '#F472B6',
      hat: 'none',
      accessory: 'scarf',
    },
    chi_lan: {
      skin: '#FFE0BD',
      hair: '#4E342E',
      hairStyle: 'pigtails',
      outfit: '#E11D48',
      hat: 'none',
      accessory: 'badge',
    },
  };

  const cfg = configs[type] || configs.player;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* 1. Bóng đổ dưới thân */}
        <ellipse cx="50" cy="94" rx="28" ry="5" fill="#E8D7D3" />

        {/* 2. Thân & Trang phục */}
        <path
          d="M 28 65 Q 24 90 26 92 L 74 92 Q 76 90 72 65 Z"
          fill={cfg.outfit}
          stroke="#7C5C55"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Phụ kiện trang phục */}
        {cfg.accessory === 'heart_apron' && (
          <g>
            <path d="M 36 68 L 64 68 L 60 92 L 40 92 Z" fill="#FFFFFF" opacity="0.9" />
            <path
              d="M 50 77 C 48 74 44 74 44 77 C 44 80 50 84 50 84 C 50 84 56 80 56 77 C 56 74 52 74 50 77 Z"
              fill="#F7A8C4"
            />
          </g>
        )}
        {cfg.accessory === 'tie' && (
          <polygon points="50,68 53,78 50,83 47,78" fill="#7C5C55" />
        )}
        {cfg.accessory === 'glasses' && (
          <g stroke="#7C5C55" strokeWidth="1.5" fill="none">
            <circle cx="40" cy="46" r="6" />
            <circle cx="60" cy="46" r="6" />
            <line x1="46" y1="46" x2="54" y2="46" />
          </g>
        )}

        {/* 3. Đầu & Khuôn mặt chibi tròn trĩnh */}
        <circle
          cx="50"
          cy="46"
          r="26"
          fill={cfg.skin}
          stroke="#7C5C55"
          strokeWidth="2.5"
        />

        {/* Má hồng dễ thương */}
        <ellipse cx="33" cy="52" rx="4.5" ry="3" fill="#FFAB91" opacity="0.75" />
        <ellipse cx="67" cy="52" rx="4.5" ry="3" fill="#FFAB91" opacity="0.75" />

        {/* Tóc sau */}
        {cfg.hairStyle === 'bun' && (
          <circle cx="50" cy="18" r="10" fill={cfg.hair} stroke="#7C5C55" strokeWidth="2" />
        )}
        {cfg.hairStyle === 'pigtails' && (
          <g fill={cfg.hair} stroke="#7C5C55" strokeWidth="2">
            <circle cx="21" cy="38" r="8" />
            <circle cx="79" cy="38" r="8" />
          </g>
        )}
        {cfg.hairStyle === 'twin_bows' && (
          <g>
            <circle cx="20" cy="36" r="8" fill={cfg.hair} stroke="#7C5C55" strokeWidth="2" />
            <circle cx="80" cy="36" r="8" fill={cfg.hair} stroke="#7C5C55" strokeWidth="2" />
            <path d="M 18 32 L 24 36 L 18 40 Z" fill="#FF4081" />
            <path d="M 82 32 L 76 36 L 82 40 Z" fill="#FF4081" />
          </g>
        )}

        {/* Tóc mái phía trước */}
        <path
          d="M 25 42 C 26 22 74 22 75 42 C 67 36 60 40 50 34 C 40 40 33 36 25 42 Z"
          fill={cfg.hair}
          stroke="#7C5C55"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Mũ đầu bếp nếu có */}
        {cfg.hat === 'chef' && (
          <g>
            <path
              d="M 34 26 C 30 14 42 10 50 14 C 58 10 70 14 66 26 Z"
              fill="#FFFFFF"
              stroke="#7C5C55"
              strokeWidth="2"
            />
            <rect x="36" y="24" width="28" height="6" rx="2" fill="#FFFFFF" stroke="#7C5C55" strokeWidth="2" />
          </g>
        )}
        {cfg.hat === 'chef_tall' && (
          <g>
            <path
              d="M 35 24 C 30 4 70 4 65 24 Z"
              fill="#FFFFFF"
              stroke="#7C5C55"
              strokeWidth="2"
            />
            <rect x="36" y="22" width="28" height="7" rx="2" fill="#FFFFFF" stroke="#7C5C55" strokeWidth="2" />
          </g>
        )}
        {cfg.hat === 'beret' && (
          <path
            d="M 30 28 C 30 18 72 16 74 28 C 70 34 34 34 30 28 Z"
            fill="#D84315"
            stroke="#7C5C55"
            strokeWidth="2"
          />
        )}
        {cfg.hat === 'helmet' && (
          <path
            d="M 26 36 C 26 14 74 14 74 36 C 65 30 35 30 26 36 Z"
            fill="#0284C7"
            stroke="#7C5C55"
            strokeWidth="2.5"
          />
        )}

        {/* 4. Cảm xúc khuôn mặt (Eyes & Mouth) */}
        {emotion === 'happy' && (
          <g>
            {/* Mắt cười tít mắt hình cầu vồng ^^ */}
            <path d="M 36 47 Q 41 42 46 47" fill="none" stroke="#5D4037" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 54 47 Q 59 42 64 47" fill="none" stroke="#5D4037" strokeWidth="2.8" strokeLinecap="round" />
            {/* Miệng cười xinh */}
            <path d="M 46 54 Q 50 58 54 54" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {emotion === 'waiting' && (
          <g>
            {/* Mắt tròn long lanh */}
            <circle cx="41" cy="46" r="3.5" fill="#424242" />
            <circle cx="42.5" cy="44.5" r="1.2" fill="#FFFFFF" />
            <circle cx="59" cy="46" r="3.5" fill="#424242" />
            <circle cx="60.5" cy="44.5" r="1.2" fill="#FFFFFF" />
            {/* Miệng nhỏ chúm chím */}
            <circle cx="50" cy="54" r="2" fill="#5D4037" />
          </g>
        )}

        {emotion === 'eating' && (
          <g>
            {/* Mắt nhắm tít vui sướng */}
            <path d="M 36 46 L 44 48 L 36 50" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 64 46 L 56 48 L 64 50" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Miệng há to nhai nhồm nhoàm */}
            <path d="M 45 53 Q 50 60 55 53 Z" fill="#E91E63" stroke="#5D4037" strokeWidth="2" />
          </g>
        )}

        {emotion === 'love' && (
          <g>
            {/* Mắt hình trái tim lấp lánh */}
            <path
              d="M 41 44 C 39 41 36 41 36 44 C 36 47 41 50 41 50 C 41 50 46 47 46 44 C 46 41 43 41 41 44 Z"
              fill="#E91E63"
            />
            <path
              d="M 59 44 C 57 41 54 41 54 44 C 54 47 59 50 59 50 C 59 50 64 47 64 44 C 64 41 61 41 59 44 Z"
              fill="#E91E63"
            />
            <path d="M 45 54 Q 50 59 55 54" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {emotion === 'angry' && (
          <g>
            <line x1="36" y1="42" x2="45" y2="46" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="64" y1="42" x2="55" y2="46" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="41" cy="48" r="2.5" fill="#424242" />
            <circle cx="59" cy="48" r="2.5" fill="#424242" />
            <path d="M 46 56 Q 50 52 54 56" fill="none" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
