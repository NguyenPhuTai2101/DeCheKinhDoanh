import {
  IngredientId,
  RecipeId,
  ActiveOrder,
  DishMatchGrade,
  CustomerTypeId,
  NeighborId,
} from '../types';
import { RECIPES, INGREDIENTS } from '../gameData';

export function getOrderIngredients(order: Pick<ActiveOrder, 'recipeId' | 'removedIngredients' | 'extraIngredients'>): IngredientId[] {
  return (RECIPES[order.recipeId]?.requiredIngredients || []).filter(id => !order.removedIngredients?.includes(id)).concat(order.extraIngredients || []);
}

export interface OrderCustomizationSpec {
  customTag?: string;
  removedIngredients: IngredientId[];
  extraIngredients: IngredientId[];
  orderNotes: string[];
  dialogueText?: string;
}

/**
 * Sinh yêu cầu biến tấu cá nhân hóa (Order Customization) cho khách
 * Dựa trên công thức món ăn, nhóm khách và cấp bậc quán
 */
export function generateOrderCustomization(params: {
  recipeId: RecipeId;
  customerType: CustomerTypeId;
  neighborId?: NeighborId;
  stageId?: string;
}): OrderCustomizationSpec {
  const { recipeId, customerType, neighborId } = params;
  const recipe = RECIPES[recipeId];
  if (!recipe) {
    return {
      removedIngredients: [],
      extraIngredients: [],
      orderNotes: [],
    };
  }

  const reqs = recipe.requiredIngredients;
  const removed: IngredientId[] = [];
  const extra: IngredientId[] = [];
  const notes: string[] = [];
  let tag = '';
  let dialogue = '';

  // Tỷ lệ xuất hiện yêu cầu tùy biến:
  // VIP / Hàng xóm quen: 65% có yêu cầu riêng
  // Khách thường: 45% có yêu cầu riêng
  const chance = neighborId ? 0.65 : 0.45;
  if (Math.random() > chance) {
    return {
      removedIngredients: [],
      extraIngredients: [],
      orderNotes: [],
      dialogueText: 'Làm nóng giòn, đậm đà giùm mình nha chủ quán! 😋',
    };
  }

  // Pool các yêu cầu khả dĩ theo từng loại món
  // 1. Nhóm Bánh Mì
  if (recipeId.startsWith('banh_mi')) {
    const roll = Math.random();
    if (roll < 0.28 && reqs.includes('herb')) {
      removed.push('herb');
      notes.push('❌ Không cho rau thơm/hành');
      tag = 'Không rau hành 🌿';
      dialogue = 'Cho mình 1 ổ không rau hành ngò nha, mình ăn không quen!';
    } else if (roll < 0.50 && reqs.includes('cucumber')) {
      removed.push('cucumber');
      notes.push('❌ Không dưa leo');
      tag = 'Không dưa leo 🥒';
      dialogue = 'Bánh mì đừng bỏ dưa leo nha, để giòn ăn liền!';
    } else if (roll < 0.72) {
      extra.push('egg');
      notes.push('➕ Thêm 1 quả trứng ốp la');
      tag = 'Thêm 1 Trứng 🍳';
      dialogue = 'Làm cho mình ổ này thêm 1 trứng ốp la béo ngậy nha!';
    } else if (roll < 0.88 && reqs.includes('pate')) {
      removed.push('pate');
      notes.push('❌ Không patê');
      tag = 'Không Patê 🧈';
      dialogue = 'Mình kiêng béo, ổ này không trét patê giùm mình nha.';
    } else {
      extra.push('pork');
      notes.push('➕ Thêm thịt nướng đậm vị');
      tag = 'Thêm Thịt 🥩';
      dialogue = 'Cho mình nhiều thịt nướng một chút, ăn cho đã miệng!';
    }
  }

  // 2. Nhóm Phở
  else if (recipeId.startsWith('pho')) {
    const roll = Math.random();
    if (roll < 0.35 && reqs.includes('spring_onion')) {
      removed.push('spring_onion');
      notes.push('❌ Không hành lá / mùi tàu');
      tag = 'Không Hành 🌿';
      dialogue = 'Bát phở này đừng rắc hành hoa nha chủ quán, nước béo ngọt!';
    } else if (roll < 0.70) {
      extra.push('quay');
      notes.push('➕ Thêm quẩy giòn');
      tag = 'Thêm Quẩy 🥖';
      dialogue = 'Cho mình gọi thêm đĩa quẩy giòn rụm nhúng nước dùng nha!';
    } else {
      extra.push('beef');
      notes.push('➕ Thêm thịt bò tái');
      tag = 'Thêm Bò 🥩';
      dialogue = 'Trần thêm cho mình chút thịt bò phi lê tươi mềm nha!';
    }
  }

  // 3. Nhóm Bún Bò & Bún Riêu
  else if (recipeId.startsWith('bun')) {
    const roll = Math.random();
    if (roll < 0.35 && reqs.includes('tofu')) {
      removed.push('tofu');
      notes.push('❌ Không lấy đậu hũ');
      tag = 'Không Đậu Hũ 🧈';
      dialogue = 'Tô bún này đừng bỏ đậu hũ nha, mình thích nước dùng thanh!';
    } else if (roll < 0.70) {
      extra.push('crab_paste');
      notes.push('➕ Thêm riêu cua');
      tag = 'Thêm Riêu Cua 🦀';
      dialogue = 'Múc cho mình thêm muỗng riêu cua đồng gạch béo nha!';
    } else {
      extra.push('tofu');
      notes.push('➕ Thêm đậu hũ chiên');
      tag = 'Thêm Đậu Hũ 🧈';
      dialogue = 'Thêm cho mình mấy miếng đậu hũ chiên vàng giòn rụm!';
    }
  }

  // 4. Nhóm Bò Né / Steak
  else if (recipeId.startsWith('bo_ne') || recipeId.startsWith('beefsteak')) {
    const roll = Math.random();
    if (roll < 0.40) {
      extra.push('egg');
      notes.push('➕ Thêm 1 trứng ốp la');
      tag = '2 Trứng 🍳';
      dialogue = 'Chảo gang này làm cho mình 2 trứng ốp la lòng đào xèo xèo nha!';
    } else if (roll < 0.70) {
      extra.push('potato');
      notes.push('➕ Thêm khoai tây chiên');
      tag = 'Thêm Khoai Tây 🍟';
      dialogue = 'Cho thêm nhiều khoai tây chiên giòn chấm sốt tiêu nha!';
    } else {
      extra.push('butter');
      notes.push('➕ Thêm bơ thơm lừng');
      tag = 'Nhiều Bơ 🧈';
      dialogue = 'Cho nhiều bơ một chút cho thơm nức mũi cả quán!';
    }
  }

  // 5. Nhóm Cơm Tấm
  else if (recipeId.startsWith('com_tam')) {
    const roll = Math.random();
    if (roll < 0.35 && reqs.includes('scallion_oil')) {
      removed.push('scallion_oil');
      notes.push('❌ Không mỡ hành');
      tag = 'Không Mỡ Hành 🧅';
      dialogue = 'Dĩa cơm sườn này đừng chan mỡ hành nha, mình ăn thanh đạm!';
    } else if (roll < 0.70) {
      extra.push('egg');
      notes.push('➕ Thêm trứng ốp la lòng đào');
      tag = 'Thêm Trứng 🍳';
      dialogue = 'Dĩa cơm sườn nướng kèm thêm 1 trứng ốp la lòng đào nha!';
    } else {
      extra.push('pork_rib');
      notes.push('➕ Thêm sườn cốt lết nướng');
      tag = '2 Sườn 🍖';
      dialogue = 'Cho mình dĩa 2 miếng sườn nướng mật ong bự chà bá nha!';
    }
  }

  // 6. Nhóm Đồ Uống
  else if (recipe.category === 'drink') {
    const roll = Math.random();
    if (roll < 0.50) {
      extra.push('condensed_milk');
      notes.push('➕ Thêm sữa đặc ngọt ngào');
      tag = 'Nhiều Sữa 🍯';
      dialogue = 'Ly này cho ngọt đậm, nhiều sữa đặc béo ngậy giùm mình!';
    } else {
      tag = 'Ít Ngọt 🍃';
      dialogue = 'Cho mình ly này ít ngọt thanh mát thôi nha chú quán!';
    }
  }

  return {
    customTag: tag || undefined,
    removedIngredients: removed,
    extraIngredients: extra,
    orderNotes: notes,
    dialogueText: dialogue || 'Làm chuẩn vị, thơm ngon giùm mình nhé!',
  };
}

/**
 * Đánh giá độ khớp (Match Grade) giữa món thực tế chế biến và yêu cầu của khách
 */
export function evaluateDishMatch(params: {
  recipeId: RecipeId;
  order: ActiveOrder;
  preparedIngredients: IngredientId[];
}): {
  matchGrade: DishMatchGrade;
  feedback: string;
  tipMultiplier: number;
  ratingImpact: number;
} {
  const { recipeId, order, preparedIngredients } = params;
  const recipe = RECIPES[recipeId];
  if (!recipe) {
    return {
      matchGrade: 'minor',
      feedback: 'Món ăn tạm ổn.',
      tipMultiplier: 1.0,
      ratingImpact: 0,
    };
  }

  const baseReqs = recipe.requiredIngredients;
  const removed = order.removedIngredients || [];
  const extra = order.extraIngredients || [];

  // Tập hợp kỳ vọng hoàn hảo: (base - removed) + extra
  const expectedSet = baseReqs
    .filter((id) => !removed.includes(id))
    .concat(extra);

  // Đếm số lượng từng nguyên liệu kỳ vọng và thực tế
  const expectedCounts: Record<string, number> = {};
  for (const id of expectedSet) {
    expectedCounts[id] = (expectedCounts[id] || 0) + 1;
  }

  const preparedCounts: Record<string, number> = {};
  for (const id of preparedIngredients) {
    preparedCounts[id] = (preparedCounts[id] || 0) + 1;
  }

  // Kiểm tra vi phạm điều cấm (Khách đã dặn bỏ/dị ứng nhưng vẫn nạp vào đĩa)
  const violatedRemoved = removed.some((id) => (preparedCounts[id] || 0) > 0);
  if (violatedRemoved) {
    return {
      matchGrade: order.allergyIngredients?.some(id => (preparedCounts[id] || 0) > 0) ? 'allergy' : 'wrong',
      feedback: `Ơ kìa! Mình đã dặn kỹ là "${order.orderNotes?.[0] || 'không ăn món này'}" mà quán vẫn bỏ vào! 💔`,
      tipMultiplier: 0,
      ratingImpact: -5,
    };
  }

  // Kiểm tra xem có đủ toàn bộ nguyên liệu kỳ vọng không
  let missingCount = 0;
  for (const [id, count] of Object.entries(expectedCounts)) {
    const prepCount = preparedCounts[id] || 0;
    if (prepCount < count) {
      missingCount += count - prepCount;
    }
  }

  // Khớp hoàn hảo 100%
  if (missingCount === 0 && !violatedRemoved) {
    const hasCustom = removed.length > 0 || extra.length > 0;
    return {
      matchGrade: 'perfect',
      feedback: hasCustom
        ? 'Ôi chuẩn vị tuyệt đối! Đúng ý mình từng chút một, 10 điểm cho sự tinh tế của quán! 💖'
        : 'Món ăn nóng sốt, thơm ngon tuyệt vời! Ăn là ghiền! 😋',
      tipMultiplier: hasCustom ? 1.4 : 1.2,
      ratingImpact: hasCustom ? 3 : 1,
    };
  }

  // Thiếu 1 nguyên liệu phụ (rau thơm, dưa leo...)
  const garnish = new Set(['herb','cucumber','spring_onion','chili','pickles','mayo']);
  const missingMain = baseReqs.some(id => !removed.includes(id) && !garnish.has(id) && (preparedCounts[id] || 0) < baseReqs.filter(value => value === id).length);
  if (missingCount <= 1 && !missingMain) {
    return {
      matchGrade: 'minor',
      feedback: 'Món ăn cũng ngon miệng, nhưng hình như hơi thiếu chút đỉnh so với mình dặn á~ ⭐',
      tipMultiplier: 0.85,
      ratingImpact: 0,
    };
  }

  // Sai nhiều hoặc thiếu món chính
  return {
    matchGrade: 'wrong',
    feedback: 'Món này làm vội quá, thiếu nguyên liệu rồi chủ quán ơi! Lần sau cẩn thận hơn nha. ⚠️',
    tipMultiplier: 0.4,
    ratingImpact: -2,
  };
}
