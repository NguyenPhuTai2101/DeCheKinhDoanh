import { RecipeId, RestaurantTypeId } from '../../../shared/types';
import { banhMiArt } from '../assets/banhMiArt';

/**
 * Mapping các hình ảnh món ăn 2D minh họa chân thực, phong cách ấm cúng (Cozy Kawaii)
 */
export const DISH_IMAGES: Partial<Record<RecipeId, string>> = {
  // Bánh Mì
  banh_mi_trung: banhMiArt('banh-mi'),
  banh_mi_thit: banhMiArt('banh-mi'),
  banh_mi_dac_biet: banhMiArt('banh-mi'),
  banh_mi_xiu_mai: banhMiArt('banh-mi'),

  // Đồ uống
  cafe_sua: banhMiArt('coffee'),
  tra_sua: banhMiArt('milk-tea'),
  tra_dao: banhMiArt('tea'),

  // Phở Bò Gia Truyền
  pho_tai: '/dishes/pho_bo.jpg',
  pho_nam: '/dishes/pho_bo.jpg',
  pho_dac_biet: '/dishes/pho_bo.jpg',

  // Bún Bò Huế & Bún Riêu
  bun_bo_hue: '/dishes/bun_bo.jpg',
  bun_rieu_cua: '/dishes/bun_bo.jpg',

  // Bò Né / Beefsteak Chảo Gang
  bo_ne_op_la: '/dishes/bo_ne.jpg',
  beefsteak_sot_tieu: '/dishes/bo_ne.jpg',

  // Cơm Tấm Sài Gòn
  com_tam_suon: '/dishes/com_tam.jpg',
  com_tam_suon_bi_cha: '/dishes/com_tam.jpg',
};

/**
 * Ảnh đại diện theo từng loại hình quán
 */
export const RESTAURANT_BANNER_IMAGES: Partial<Record<RestaurantTypeId, string>> = {
  banh_mi: banhMiArt('banh-mi'),
  pho: '/dishes/pho_bo.jpg',
  bun: '/dishes/bun_bo.jpg',
  beefsteak: '/dishes/bo_ne.jpg',
  com_tam: '/dishes/com_tam.jpg',
};

export const WORKBENCH_BG_IMAGE = '/dishes/workbench.jpg';

export const BUILDING_IMAGES: Record<RestaurantTypeId, string> = {
  banh_mi: '/buildings/banh_mi.jpg',
  pho: '/buildings/pho.jpg',
  bun: '/buildings/bun_bo.jpg',
  beefsteak: '/buildings/bo_ne.jpg',
  com_tam: '/buildings/com_tam.jpg',
};

export function getBuildingImage(restId?: RestaurantTypeId): string | undefined {
  if (!restId) return undefined;
  return BUILDING_IMAGES[restId];
}

/**
 * Lấy đường dẫn ảnh minh họa cho món ăn, nếu chưa có ảnh trả về undefined
 */
export function getDishImage(recipeId?: string): string | undefined {
  if (!recipeId) return undefined;
  return DISH_IMAGES[recipeId as RecipeId];
}
