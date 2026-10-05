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
    | 'emp_tuan'
    | 'emp_hong'
    | 'emp_tai'
    | 'emp_ngoc'
    | 'emp_quan'
    | 'emp_dung'
    | 'emp_coba'
    | 'emp_chubay'
    | 'emp_bactam'
    | 'bac_ba'
    | 'co_bay'
    | 'chu_nam'
    | 'be_bong'
    | 'chi_lan'
    | string;
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
  // Cấu hình bảng màu sắc & đặc điểm cho từng nhân vật
  const configs: Record<string, any> = {
    player: {
      skin: '#FFF2E8',
      hair: '#5C3A33',
      hairStyle: 'pigtails',
      outfit: '#FF8EA3',
      hat: 'chef',
      accessory: 'heart_apron',
    },
    student: {
      skin: '#FFF2E8',
      hair: '#292524',
      hairStyle: 'short',
      outfit: '#38BDF8',
      hat: 'none',
      accessory: 'school_collar',
    },
    office_worker: {
      skin: '#FFF2E8',
      hair: '#44403C',
      hairStyle: 'neat',
      outfit: '#C084FC',
      hat: 'none',
      accessory: 'tie',
    },
    food_lover: {
      skin: '#FFF2E8',
      hair: '#EA580C',
      hairStyle: 'curly',
      outfit: '#FBBF24',
      hat: 'beret',
      accessory: 'scarf',
    },
    neighborhood: {
      skin: '#FFF2E8',
      hair: '#78716C',
      hairStyle: 'bun',
      outfit: '#34D399',
      hat: 'none',
      accessory: 'glasses',
    },
    emp_mai: {
      skin: '#FFF2E8',
      hair: '#451A03',
      hairStyle: 'twin_bows',
      outfit: '#F472B6',
      hat: 'none',
      accessory: 'maid_ribbon',
    },
    emp_linh: {
      skin: '#FFF2E8',
      hair: '#475569',
      hairStyle: 'short',
      outfit: '#E2E8F0',
      hat: 'chef_tall',
      accessory: 'mustache',
    },
    emp_tuan: {
      skin: '#FFF2E8',
      hair: '#C2410C',
      hairStyle: 'curly',
      outfit: '#F59E0B',
      hat: 'chef',
      accessory: 'heart_apron',
    },
    emp_hong: {
      skin: '#FFF2E8',
      hair: '#78350F',
      hairStyle: 'bun',
      outfit: '#EF4444',
      hat: 'chef',
      accessory: 'heart_apron',
    },
    emp_tai: {
      skin: '#FFF2E8',
      hair: '#3E2723',
      hairStyle: 'short',
      outfit: '#D97706',
      hat: 'chef_tall',
      accessory: 'mustache',
    },
    emp_ngoc: {
      skin: '#FFF2E8',
      hair: '#1E293B',
      hairStyle: 'pigtails',
      outfit: '#06B6D4',
      hat: 'none',
      accessory: 'maid_ribbon',
    },
    emp_quan: {
      skin: '#FFF2E8',
      hair: '#334155',
      hairStyle: 'neat',
      outfit: '#10B981',
      hat: 'none',
      accessory: 'tie',
    },
    emp_dung: {
      skin: '#FFF2E8',
      hair: '#18181B',
      hairStyle: 'short',
      outfit: '#8B5CF6',
      hat: 'helmet',
      accessory: 'wrench',
    },
    emp_coba: {
      skin: '#FFEAD9',
      hair: '#5C3A33',
      hairStyle: 'bun',
      outfit: '#10B981',
      hat: 'conical_hat',
      accessory: 'scarf',
    },
    emp_chubay: {
      skin: '#FFEAD9',
      hair: '#292524',
      hairStyle: 'short',
      outfit: '#D97706',
      hat: 'helmet',
      accessory: 'mustache',
    },
    emp_bactam: {
      skin: '#FFEAD9',
      hair: '#475569',
      hairStyle: 'neat',
      outfit: '#2563EB',
      hat: 'none',
      accessory: 'glasses',
    },
    bac_ba: {
      skin: '#FFEAD9',
      hair: '#A8A29E',
      hairStyle: 'short',
      outfit: '#4D7C0F',
      hat: 'none',
      accessory: 'glasses',
    },
    co_bay: {
      skin: '#FFEAD9',
      hair: '#78716C',
      hairStyle: 'bun',
      outfit: '#F59E0B',
      hat: 'conical_hat',
      accessory: 'lottery_tickets',
    },
    chu_nam: {
      skin: '#FFEAD9',
      hair: '#44403C',
      hairStyle: 'short',
      outfit: '#0284C7',
      hat: 'worker_cap',
      accessory: 'wrench',
    },
    be_bong: {
      skin: '#FFF2E8',
      hair: '#1C1917',
      hairStyle: 'twin_bows',
      outfit: '#FB7185',
      hat: 'none',
      accessory: 'cherry_hairclip',
    },
    chi_lan: {
      skin: '#FFF2E8',
      hair: '#451A03',
      hairStyle: 'pigtails',
      outfit: '#E11D48',
      hat: 'none',
      accessory: 'pearl_necklace',
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
          {/* Đổ bóng mịn màng */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#FDA4AF" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. Bóng đổ dưới chân */}
        <ellipse cx="50" cy="94" rx="28" ry="4.5" fill="#E2D1CC" opacity="0.8" />

        {/* 2. Thân & Trang phục */}
        <path
          d="M 28 65 Q 24 90 26 92 L 74 92 Q 76 90 72 65 Z"
          fill={cfg.outfit}
          stroke="#5C3A33"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Phụ kiện trang phục đặc trưng */}
        {cfg.accessory === 'heart_apron' && (
          <g>
            <path d="M 36 68 L 64 68 L 60 92 L 40 92 Z" fill="#FFFFFF" stroke="#5C3A33" strokeWidth="1.2" />
            <path
              d="M 50 78 C 47 74 43 74 43 78 C 43 82 50 86 50 86 C 50 86 57 82 57 78 C 57 74 53 74 50 78 Z"
              fill="#FF6584"
            />
          </g>
        )}
        {cfg.accessory === 'tie' && (
          <g>
            <polygon points="50,66 53,77 50,83 47,77" fill="#5C3A33" />
            <circle cx="50" cy="67" r="2" fill="#FF8EA3" />
          </g>
        )}
        {cfg.accessory === 'school_collar' && (
          <g>
            <path d="M 38 65 L 50 73 L 62 65" fill="#FFFFFF" stroke="#5C3A33" strokeWidth="1.5" />
            <circle cx="50" cy="74" r="2.5" fill="#EF4444" />
          </g>
        )}
        {cfg.accessory === 'glasses' && (
          <g stroke="#5C3A33" strokeWidth="1.8" fill="rgba(255,255,255,0.4)">
            <circle cx="39" cy="46" r="6.5" />
            <circle cx="61" cy="46" r="6.5" />
            <line x1="45.5" y1="46" x2="54.5" y2="46" />
          </g>
        )}
        {cfg.accessory === 'wrench' && (
          <g transform="translate(68, 70) rotate(25)">
            <rect x="-2" y="-8" width="4" height="16" rx="1.5" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
            <circle cx="0" cy="-8" r="3.5" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
          </g>
        )}
        {cfg.accessory === 'lottery_tickets' && (
          <g transform="translate(64, 72) rotate(15)">
            <rect x="-4" y="-7" width="8" height="14" rx="1" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
            <rect x="-2" y="-5" width="6" height="10" fill="#FEF08A" />
          </g>
        )}
        {cfg.accessory === 'pearl_necklace' && (
          <path d="M 40 67 Q 50 72 60 67" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeDasharray="1,4" />
        )}

        {/* 3. Đầu & Khuôn mặt chibi tròn trịa đáng yêu */}
        <circle
          cx="50"
          cy="46"
          r="26"
          fill={cfg.skin}
          stroke="#5C3A33"
          strokeWidth="2.5"
        />

        {/* Má hồng hào tươi tắn với hiệu ứng phấn đào */}
        <ellipse cx="32" cy="52" rx="5" ry="3.5" fill="#FF8EA3" opacity="0.65" />
        <ellipse cx="68" cy="52" rx="5" ry="3.5" fill="#FF8EA3" opacity="0.65" />
        <circle cx="31" cy="51" r="1.2" fill="#FFF" opacity="0.7" />
        <circle cx="69" cy="51" r="1.2" fill="#FFF" opacity="0.7" />

        {/* Tóc phía sau */}
        {cfg.hairStyle === 'bun' && (
          <circle cx="50" cy="18" r="10" fill={cfg.hair} stroke="#5C3A33" strokeWidth="2.2" />
        )}
        {cfg.hairStyle === 'pigtails' && (
          <g fill={cfg.hair} stroke="#5C3A33" strokeWidth="2.2">
            <circle cx="20" cy="38" r="8.5" />
            <circle cx="80" cy="38" r="8.5" />
            <circle cx="21" cy="37" r="2" fill="#FFF" opacity="0.3" />
            <circle cx="79" cy="37" r="2" fill="#FFF" opacity="0.3" />
          </g>
        )}
        {cfg.hairStyle === 'twin_bows' && (
          <g>
            <circle cx="19" cy="36" r="8.5" fill={cfg.hair} stroke="#5C3A33" strokeWidth="2.2" />
            <circle cx="81" cy="36" r="8.5" fill={cfg.hair} stroke="#5C3A33" strokeWidth="2.2" />
            {/* Nơ bướm xinh hai bên */}
            <path d="M 17 31 L 23 35 L 17 39 Z" fill="#FF4081" stroke="#5C3A33" strokeWidth="1" />
            <path d="M 83 31 L 77 35 L 83 39 Z" fill="#FF4081" stroke="#5C3A33" strokeWidth="1" />
            <circle cx="20" cy="35" r="2" fill="#FFCCD9" />
            <circle cx="80" cy="35" r="2" fill="#FFCCD9" />
          </g>
        )}

        {/* Tóc mái phía trước uốn cong mềm mại */}
        <path
          d="M 25 42 C 26 22 74 22 75 42 C 67 36 60 40 50 34 C 40 40 33 36 25 42 Z"
          fill={cfg.hair}
          stroke="#5C3A33"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ánh sáng lượn sóng trên mái tóc (Anime Hair Shine) */}
        <path
          d="M 33 34 Q 50 28 67 34"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Các loại Mũ & Nón đặc trưng */}
        {cfg.hat === 'chef' && (
          <g>
            <path
              d="M 34 26 C 28 12 42 8 50 12 C 58 8 72 12 66 26 Z"
              fill="#FFFFFF"
              stroke="#5C3A33"
              strokeWidth="2.2"
            />
            <rect x="35" y="24" width="30" height="6.5" rx="2" fill="#FFFFFF" stroke="#5C3A33" strokeWidth="2" />
            <circle cx="50" cy="27" r="1.5" fill="#F59E0B" />
          </g>
        )}
        {cfg.hat === 'chef_tall' && (
          <g>
            <path
              d="M 35 24 C 29 2 71 2 65 24 Z"
              fill="#FFFFFF"
              stroke="#5C3A33"
              strokeWidth="2.2"
            />
            <rect x="35" y="21" width="30" height="7" rx="2" fill="#FFFFFF" stroke="#5C3A33" strokeWidth="2" />
            <line x1="44" y1="6" x2="44" y2="18" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1="50" y1="5" x2="50" y2="18" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1="56" y1="6" x2="56" y2="18" stroke="#E2E8F0" strokeWidth="1.5" />
          </g>
        )}
        {cfg.hat === 'beret' && (
          <path
            d="M 30 28 C 30 16 72 14 74 28 C 70 34 34 34 30 28 Z"
            fill="#D84315"
            stroke="#5C3A33"
            strokeWidth="2"
          />
        )}
        {cfg.hat === 'helmet' && (
          <path
            d="M 25 36 C 25 12 75 12 75 36 C 65 30 35 30 25 36 Z"
            fill="#0284C7"
            stroke="#5C3A33"
            strokeWidth="2.5"
          />
        )}
        {cfg.hat === 'worker_cap' && (
          <g>
            <path d="M 26 34 C 28 16 72 16 74 34 Z" fill="#15803D" stroke="#5C3A33" strokeWidth="2" />
            <ellipse cx="50" cy="33" rx="26" ry="4" fill="#166534" stroke="#5C3A33" strokeWidth="1.8" />
            <circle cx="50" cy="24" r="2.5" fill="#FBBF24" />
          </g>
        )}
        {cfg.hat === 'conical_hat' && (
          <g transform="translate(0, -6)">
            {/* Nón lá truyền thống đội lệch duyên dáng */}
            <polygon points="50,6 20,32 80,32" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.8" />
            <line x1="50" y1="6" x2="35" y2="32" stroke="#FDE68A" strokeWidth="1" />
            <line x1="50" y1="6" x2="65" y2="32" stroke="#FDE68A" strokeWidth="1" />
            <path d="M 34 32 Q 50 38 66 32" stroke="#EC4899" strokeWidth="1.5" fill="none" />
          </g>
        )}
        {cfg.accessory === 'cherry_hairclip' && (
          <g transform="translate(68, 28)">
            <circle cx="0" cy="0" r="3.5" fill="#EF4444" stroke="#5C3A33" strokeWidth="1" />
            <circle cx="5" cy="2" r="3" fill="#EF4444" stroke="#5C3A33" strokeWidth="1" />
            <path d="M 0 -2 Q 2 -6 4 -4" stroke="#15803D" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {/* 4. Cảm xúc khuôn mặt (Eyes, Sparkles & Mouth) */}
        {emotion === 'happy' && (
          <g>
            {/* Mắt cười tít hình trăng khuyết tươi vui ^^ */}
            <path d="M 35 48 Q 41 42 47 48" fill="none" stroke="#5C3A33" strokeWidth="3" strokeLinecap="round" />
            <path d="M 53 48 Q 59 42 65 48" fill="none" stroke="#5C3A33" strokeWidth="3" strokeLinecap="round" />
            {/* Miệng cười xinh hở răng trắng */}
            <path d="M 45 54 Q 50 59 55 54" fill="none" stroke="#5C3A33" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {emotion === 'waiting' && (
          <g>
            {/* Mắt tròn to long lanh với đốm sáng kép */}
            <circle cx="41" cy="46" r="4.2" fill="#292524" />
            <circle cx="42.5" cy="44.2" r="1.6" fill="#FFFFFF" />
            <circle cx="39.8" cy="47.5" r="0.8" fill="#FFFFFF" />

            <circle cx="59" cy="46" r="4.2" fill="#292524" />
            <circle cx="60.5" cy="44.2" r="1.6" fill="#FFFFFF" />
            <circle cx="57.8" cy="47.5" r="0.8" fill="#FFFFFF" />

            {/* Miệng chúm chím */}
            <ellipse cx="50" cy="54" rx="2.5" ry="2" fill="#5C3A33" />
          </g>
        )}

        {emotion === 'eating' && (
          <g>
            {/* Mắt nhắm tít mãn nguyện */}
            <path d="M 35 47 L 43 49 L 35 51" fill="none" stroke="#5C3A33" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 65 47 L 57 49 L 65 51" fill="none" stroke="#5C3A33" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Miệng há to nhai sung sướng */}
            <path d="M 44 53 Q 50 61 56 53 Z" fill="#E11D48" stroke="#5C3A33" strokeWidth="2" />
            <path d="M 46 54 Q 50 56 54 54" stroke="#FFF" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {emotion === 'love' && (
          <g>
            {/* Mắt trái tim hồng ngọc rực rỡ */}
            <path
              d="M 41 43 C 38 40 34 40 34 43 C 34 47 41 51 41 51 C 41 51 48 47 48 43 C 48 40 44 40 41 43 Z"
              fill="#E11D48"
              stroke="#5C3A33"
              strokeWidth="1.2"
            />
            <path
              d="M 59 43 C 56 40 52 40 52 43 C 52 47 59 51 59 51 C 59 51 66 47 66 43 C 66 40 62 40 59 43 Z"
              fill="#E11D48"
              stroke="#5C3A33"
              strokeWidth="1.2"
            />
            <path d="M 45 54 Q 50 59 55 54" fill="none" stroke="#5C3A33" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {emotion === 'angry' && (
          <g>
            <line x1="35" y1="41" x2="45" y2="46" stroke="#5C3A33" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="65" y1="41" x2="55" y2="46" stroke="#5C3A33" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="41" cy="48" r="3" fill="#292524" />
            <circle cx="59" cy="48" r="3" fill="#292524" />
            <path d="M 45 56 Q 50 52 55 56" fill="none" stroke="#DC2626" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
