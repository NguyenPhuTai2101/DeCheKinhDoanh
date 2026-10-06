import React from 'react';
import { IngredientId } from '../../../../shared/types';
import { banhMiArt, ingredientArtNames } from '../../assets/banhMiArt';

interface IngredientIconProps {
  id: string;
  size?: number;
  className?: string;
  fallbackIcon?: string;
}

export const IngredientIcon: React.FC<IngredientIconProps> = ({
  id,
  size = 28,
  className = '',
  fallbackIcon = '✨',
}) => {
  const s = size;
  const artName = ingredientArtNames[id];
  if (artName) {
    return <img src={banhMiArt(artName)} alt="" aria-hidden="true" width={s} height={s} className={className} style={{ objectFit: 'contain' }} decoding="async" />;
  }

  switch (id as IngredientId) {
    case 'bread':
      // Ổ bánh mì vàng giòn rụm với vết rạch truyền thống
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="breadGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="slashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
          </defs>
          <ellipse cx="20" cy="20" rx="17" ry="10" transform="rotate(-20 20 20)" fill="url(#breadGrad)" stroke="#78350F" strokeWidth="1.5" />
          <ellipse cx="14" cy="17" rx="3.5" ry="1.2" transform="rotate(-35 14 17)" fill="url(#slashGrad)" opacity="0.9" />
          <ellipse cx="20" cy="20" rx="3.5" ry="1.2" transform="rotate(-35 20 20)" fill="url(#slashGrad)" opacity="0.9" />
          <ellipse cx="26" cy="23" rx="3.5" ry="1.2" transform="rotate(-35 26 23)" fill="url(#slashGrad)" opacity="0.9" />
          <circle cx="12" cy="13" r="1.5" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case 'egg':
      // Trứng gà tươi lòng đỏ ốp la óng ánh
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="yolkGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Lòng trắng */}
          <path
            d="M10 22 C6 14, 18 6, 26 10 C34 14, 35 25, 29 31 C22 36, 12 32, 10 22 Z"
            fill="#FFFDF7"
            stroke="#FDE68A"
            strokeWidth="2"
          />
          {/* Lòng đỏ */}
          <circle cx="21" cy="21" r="7.5" fill="url(#yolkGrad)" stroke="#B45309" strokeWidth="1" />
          {/* Đốm sáng */}
          <circle cx="18" cy="18" r="2" fill="#FFF" opacity="0.8" />
        </svg>
      );

    case 'pork':
      // Thịt nướng ướp sả mật ong vân caramel
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="porkGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="60%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
          <rect x="7" y="10" width="26" height="20" rx="6" fill="url(#porkGrad)" stroke="#450A0A" strokeWidth="1.5" />
          {/* Vết cháy xém nướng than */}
          <line x1="12" y1="14" x2="28" y2="14" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="10" y1="20" x2="30" y2="20" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="12" y1="26" x2="28" y2="26" stroke="#450A0A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="12" cy="11" r="1.5" fill="#FEF08A" opacity="0.8" />
        </svg>
      );

    case 'pate':
      // Khối Patê gan thơm béo mịn màng
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="pateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="40%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>
          </defs>
          <path d="M8 18 L20 10 L32 18 L20 26 Z" fill="#EAB308" opacity="0.9" stroke="#713F12" strokeWidth="1" />
          <path d="M8 18 L20 26 L20 33 L8 25 Z" fill="url(#pateGrad)" stroke="#713F12" strokeWidth="1" />
          <path d="M20 26 L32 18 L32 25 L20 33 Z" fill="#854D0E" stroke="#713F12" strokeWidth="1" />
          {/* Hạt tiêu đen trên mặt */}
          <circle cx="18" cy="17" r="1" fill="#1C1917" />
          <circle cx="23" cy="18" r="0.8" fill="#1C1917" />
          <circle cx="20" cy="14" r="0.8" fill="#1C1917" />
        </svg>
      );

    case 'cucumber':
      // Lát dưa leo giòn mát
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="20" r="15" fill="#86EFAC" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="10" fill="#DCFCE7" />
          {/* Hạt dưa leo */}
          <circle cx="16" cy="17" r="1.2" fill="#4ADE80" />
          <circle cx="24" cy="17" r="1.2" fill="#4ADE80" />
          <circle cx="17" cy="23" r="1.2" fill="#4ADE80" />
          <circle cx="23" cy="23" r="1.2" fill="#4ADE80" />
        </svg>
      );

    case 'herb':
      // Cành ngò gai rau thơm tươi xanh
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <path d="M20 34 Q20 20 20 6" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="14" cy="14" rx="6" ry="3" transform="rotate(-30 14 14)" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
          <ellipse cx="26" cy="14" rx="6" ry="3" transform="rotate(30 26 14)" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
          <ellipse cx="13" cy="24" rx="5" ry="2.5" transform="rotate(-40 13 24)" fill="#16A34A" stroke="#15803D" strokeWidth="1" />
          <ellipse cx="27" cy="24" rx="5" ry="2.5" transform="rotate(40 27 24)" fill="#16A34A" stroke="#15803D" strokeWidth="1" />
          <ellipse cx="20" cy="8" rx="4" ry="2" transform="rotate(-90 20 8)" fill="#4ADE80" />
        </svg>
      );

    case 'tea':
      // Lá trà lài thanh mát
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <path d="M12 28 C8 15, 20 8, 28 8 C32 18, 24 28, 12 28 Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
          <path d="M14 26 Q20 18 26 10" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="26" cy="11" r="1.5" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case 'milk':
      // Bình sữa tươi nắp hồng
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          {/* Thân bình */}
          <path d="M14 14 L26 14 L28 32 C28 34, 12 34, 12 32 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Nhãn bình màu hồng */}
          <rect x="13" y="20" width="14" height="7" rx="1.5" fill="#F472B6" />
          <circle cx="20" cy="23.5" r="1.5" fill="#FFF" />
          {/* Cổ và nắp */}
          <rect x="15" y="10" width="10" height="4" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="14" y="8" width="12" height="3" rx="1" fill="#EC4899" />
        </svg>
      );

    case 'condensed_milk':
      // Lon sữa đặc Ông Thọ ngọt béo
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="11" y="12" width="18" height="20" rx="3" fill="#FCD34D" stroke="#B45309" strokeWidth="1.5" />
          <rect x="11" y="17" width="18" height="10" fill="#EF4444" />
          <circle cx="20" cy="22" r="3" fill="#FFF" />
          <ellipse cx="20" cy="12" rx="9" ry="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
          <ellipse cx="20" cy="32" rx="9" ry="2.5" fill="#D97706" opacity="0.5" />
        </svg>
      );

    case 'coffee':
      // Cà phê phin Robusta
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          {/* Phin inox */}
          <rect x="12" y="10" width="16" height="14" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
          {/* Nắp phin */}
          <ellipse cx="20" cy="10" rx="8" ry="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
          <circle cx="20" cy="7" r="1.5" fill="#94A3B8" />
          {/* Đĩa chặn phin */}
          <ellipse cx="20" cy="24" rx="11" ry="2.5" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
          {/* Giọt cà phê nhỏ giọt */}
          <path d="M20 28 C18.5 30, 18.5 32, 20 33 C21.5 32, 21.5 30, 20 28 Z" fill="#451A03" />
        </svg>
      );

    case 'pho_noodle':
      // Sợi bánh phở tươi dẻo mềm
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="8" y="16" width="24" height="15" rx="3" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
          <line x1="12" y1="16" x2="12" y2="31" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <line x1="16" y1="16" x2="16" y2="31" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <line x1="20" y1="16" x2="20" y2="31" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <line x1="24" y1="16" x2="24" y2="31" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <line x1="28" y1="16" x2="28" y2="31" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <path d="M12 12 Q20 8 28 12" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'beef':
      // Thịt bò phi lê đỏ tươi vân mỡ
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="beefGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>
          <path
            d="M10 20 C8 12, 22 8, 30 14 C36 18, 32 30, 24 32 C14 34, 10 26, 10 20 Z"
            fill="url(#beefGrad)"
            stroke="#7F1D1D"
            strokeWidth="1.5"
          />
          {/* Vân mỡ cẩm thạch */}
          <path d="M15 17 Q20 20 26 16" stroke="#FEE2E2" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M14 24 Q20 26 27 23" stroke="#FEE2E2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'beef_broth':
      // Nồi nước dùng hầm xương phở
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="brothGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <ellipse cx="20" cy="22" rx="14" ry="10" fill="url(#brothGrad)" stroke="#B45309" strokeWidth="1.5" />
          {/* Hoa hồi nổi */}
          <polygon points="20,17 21,20 24,20 22,22 23,25 20,23 17,25 18,22 16,20 19,20" fill="#78350F" />
          {/* Làn khói nghi ngút */}
          <path d="M15 13 Q17 9 15 6" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M23 12 Q25 8 23 5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
      );

    case 'quay':
      // Cặp quẩy chiên vàng ruộm
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="13" y="8" width="6" height="24" rx="3" transform="rotate(-15 16 20)" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          <rect x="19" y="8" width="6" height="24" rx="3" transform="rotate(-15 22 20)" fill="#D97706" stroke="#92400E" strokeWidth="1.2" />
        </svg>
      );

    case 'spring_onion':
      // Hành hoa mùi tàu
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <circle cx="16" cy="18" r="3" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
          <circle cx="24" cy="16" r="3.5" fill="#16A34A" stroke="#15803D" strokeWidth="1" />
          <circle cx="20" cy="24" r="3" fill="#4ADE80" stroke="#15803D" strokeWidth="1" />
          <circle cx="26" cy="24" r="2.5" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
          <circle cx="14" cy="25" r="2.5" fill="#15803D" stroke="#14532D" strokeWidth="1" />
        </svg>
      );

    case 'bun_noodle':
      // Cuộn bún tươi tròn
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="22" rx="14" ry="9" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M12 21 Q20 26 28 21" stroke="#94A3B8" strokeWidth="1" fill="none" />
          <path d="M14 19 Q20 15 26 19" stroke="#94A3B8" strokeWidth="1" fill="none" />
        </svg>
      );

    case 'crab_paste':
      // Riêu cua đồng óng ánh
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <path
            d="M12 20 C10 14, 20 10, 28 14 C32 18, 28 28, 22 28 C14 28, 12 24, 12 20 Z"
            fill="#EA580C"
            stroke="#9A3412"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="18" r="1.5" fill="#FDE047" />
          <circle cx="24" cy="20" r="1.5" fill="#FDE047" />
          <circle cx="17" cy="23" r="1" fill="#FDE047" />
        </svg>
      );

    case 'bun_broth':
      // Nước lèo sa tế cay đỏ
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="22" rx="14" ry="10" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          {/* Váng dầu ớt sả */}
          <circle cx="17" cy="20" r="3" fill="#EA580C" opacity="0.7" />
          <circle cx="23" cy="23" r="2.5" fill="#F59E0B" opacity="0.8" />
          <circle cx="19" cy="24" r="1.5" fill="#FBBF24" opacity="0.9" />
        </svg>
      );

    case 'tofu':
      // Đậu hũ chiên vàng ươm
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="10" y="12" width="20" height="18" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="12" y="14" width="16" height="14" rx="2" fill="#FDE68A" />
        </svg>
      );

    case 'tomato':
      // Cà chua chín mọng
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="23" r="12" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
          <circle cx="16" cy="18" r="2" fill="#FCA5A5" opacity="0.7" />
          {/* Cuống xanh */}
          <polygon points="20,11 17,9 19,8 20,5 21,8 23,9" fill="#15803D" />
        </svg>
      );

    case 'butter':
      // Miếng bơ thơm béo
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="9" y="14" width="22" height="14" rx="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          <path d="M9 18 L31 18" stroke="#FEF08A" strokeWidth="2" />
        </svg>
      );

    case 'potato':
      // Khoai tây que chiên giòn
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <rect x="12" y="10" width="4" height="20" rx="1.5" transform="rotate(-15 14 20)" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <rect x="18" y="8" width="4" height="22" rx="1.5" transform="rotate(5 20 19)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <rect x="24" y="11" width="4" height="19" rx="1.5" transform="rotate(20 26 20)" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    case 'pepper_sauce':
      // Chén sốt tiêu đen Phú Quốc
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="22" rx="13" ry="8" fill="#292524" stroke="#1C1917" strokeWidth="1.5" />
          {/* Hạt tiêu nổi */}
          <circle cx="17" cy="20" r="1" fill="#78716C" />
          <circle cx="23" cy="21" r="1.2" fill="#78716C" />
          <circle cx="20" cy="24" r="0.8" fill="#78716C" />
          <circle cx="15" cy="23" r="1" fill="#78716C" />
        </svg>
      );

    case 'broken_rice':
      // Gạo tấm Sài Gòn
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          {/* Bát sứ */}
          <ellipse cx="20" cy="24" rx="13" ry="8" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Cơm tấm vun tròn */}
          <ellipse cx="20" cy="20" rx="11" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="18" cy="19" r="0.8" fill="#CBD5E1" />
          <circle cx="22" cy="19" r="0.8" fill="#CBD5E1" />
          <circle cx="20" cy="21" r="0.8" fill="#CBD5E1" />
        </svg>
      );

    case 'pork_rib':
      // Sườn cốt lết nướng mật ong
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <defs>
            <linearGradient id="ribGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="60%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
          </defs>
          {/* Xương sườn nhô ra */}
          <circle cx="10" cy="18" r="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          <rect x="10" y="16" width="8" height="4" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          {/* Miếng thịt sườn dày */}
          <path
            d="M16 14 C16 10, 30 10, 32 16 C34 24, 28 30, 20 30 C15 30, 15 22, 16 14 Z"
            fill="url(#ribGrad)"
            stroke="#431407"
            strokeWidth="1.5"
          />
          {/* Vết nướng than óng mật ong */}
          <line x1="20" y1="16" x2="28" y2="20" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <line x1="18" y1="22" x2="26" y2="26" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        </svg>
      );

    case 'scallion_oil':
      // Mỡ hành & tóp mỡ
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="22" rx="13" ry="8" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.5" />
          {/* Tóp mỡ giòn */}
          <rect x="16" y="19" width="3.5" height="3.5" rx="1" fill="#FDE047" stroke="#A16207" strokeWidth="0.8" />
          <rect x="22" y="21" width="3" height="3" rx="1" fill="#FDE047" stroke="#A16207" strokeWidth="0.8" />
          <circle cx="19" cy="24" r="1.5" fill="#15803D" />
          <circle cx="23" cy="19" r="1.5" fill="#15803D" />
        </svg>
      );

    default:
      return <span className={className} style={{ fontSize: `${s * 0.8}px` }}>{fallbackIcon}</span>;
  }
};
