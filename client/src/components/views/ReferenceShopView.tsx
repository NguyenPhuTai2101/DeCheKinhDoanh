import { useEffect, useState } from 'react';
import { ArrowUpCircle, BookOpen, CalendarDays, Check, ChefHat, ChevronDown, Clock3, Coins, LayoutGrid, Pause, Play, Plus, ShoppingBag, Smile, Sparkles, Store, Trash2, Trophy, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { SHOP_THEMES, DECORATION_ITEMS, INGREDIENTS, RECIPES } from '../../../../shared/gameData';
import type { IngredientId } from '../../../../shared/types';
import './reference-shop.css';
import { banhMiArt, getCustomerPortrait } from '../../assets/banhMiArt';

type PantryItem = { id: IngredientId; label: string; image: string };
const food: PantryItem[] = [
  { id: 'bread', label: 'Bánh mì', image: banhMiArt('bread') },
  { id: 'egg', label: 'Trứng', image: banhMiArt('egg') },
  { id: 'pork', label: 'Thịt nướng', image: banhMiArt('pork') },
  { id: 'pate', label: 'Pate', image: banhMiArt('pate') },
  { id: 'cha_lua', label: 'Chả lụa', image: banhMiArt('cha-lua') },
  { id: 'cucumber', label: 'Dưa leo', image: banhMiArt('cucumber') },
  { id: 'pickles', label: 'Đồ chua', image: banhMiArt('pickles') },
  { id: 'herb', label: 'Rau thơm', image: banhMiArt('herbs') },
  { id: 'chili', label: 'Ớt', image: banhMiArt('chili') },
  { id: 'mayo', label: 'Sốt mayo', image: banhMiArt('mayo') },
];
const sauces: PantryItem[] = [food[8], food[9], { id: 'pepper_sauce', label: 'Sốt tiêu', image: banhMiArt('pepper-sauce') }];
const drinks: PantryItem[] = [
  { id: 'tea', label: 'Trà', image: banhMiArt('tea') },
  { id: 'milk', label: 'Sữa tươi', image: banhMiArt('milk') },
  { id: 'condensed_milk', label: 'Sữa đặc', image: banhMiArt('condensed-milk') },
  { id: 'coffee', label: 'Cà phê', image: banhMiArt('coffee') },
];
const allItems = [...food, ...sauces, ...drinks];
function IngredientArt({ item }: { item: PantryItem }) {
  return <span className="bm-art"><img src={item.image} alt="" draggable={false}/></span>;
}
function IngredientCard({ item, stock, quantity, forbidden, onAdd }: { item: PantryItem; stock: number; quantity: number; forbidden: boolean; onAdd: () => void }) {
  return <button className={`bm-ingredient ${quantity ? 'is-selected' : ''} ${forbidden ? 'is-forbidden' : ''} ${stock <= 0 ? 'is-empty' : ''}`} onClick={onAdd} aria-label={`${item.label}, còn ${stock}, đã chọn ${quantity}`}>
    <IngredientArt item={item}/><span className="bm-stock">{stock}</span><strong>{item.label}</strong>
    {quantity > 0 && <span className="bm-picked"><Check size={12}/> {quantity}</span>}
    {forbidden && <span className="bm-forbidden"><X size={16}/></span>}
  </button>;
}
function DishWorkbench({ draft, drink, onRemove }: { draft: IngredientId[]; drink: boolean; onRemove: (index: number) => void }) {
  const layers = draft.filter(id => id !== 'bread');
  return <div className={`bm-board ${drink ? 'bm-drink-board' : ''}`} aria-label="Nguyên liệu trên thớt">
    <div className="bm-gingham"/>
    <div className="bm-dish-preview">
      {drink ? <img className="bm-base" src={banhMiArt('milk')} alt="Ly đang pha"/> : <img className={`bm-base ${!draft.includes('bread') ? 'is-ghost' : ''}`} src={banhMiArt('bread')} alt={draft.includes('bread') ? 'Bánh mì đang chế biến' : 'Vị trí đặt bánh mì'}/>}
      {layers.map((id, i) => {
        const item = allItems.find(a => a.id === id);
        return item && <div key={`${id}-${i}`} className="bm-dish-layer" style={{ left: `${17 + (i % 4) * 14}%`, top: `${30 + Math.floor(i / 4) * 10}%`, transform: `rotate(${-18 + (i % 3) * 14}deg)`, zIndex: i + 1 }}><IngredientArt item={item}/></div>;
      })}
      {!draft.length && <span className="bm-board-hint">{drink ? 'Chọn nguyên liệu để pha' : 'Đặt bánh mì lên thớt'}</span>}
    </div>
    <div className="bm-draft-chips">{draft.map((id, i) => <button key={`${id}-${i}`} onClick={() => onRemove(i)} aria-label={`Bỏ ${INGREDIENTS[id]?.name}`}><span>{allItems.find(a => a.id === id)?.label || INGREDIENTS[id]?.name}</span><X size={12}/></button>)}</div>
  </div>;
}
export function ReferenceShopView() {
  const store = useGameStore();
  const { gameState: g, activeOrders, isShopOpen, openModal, showToast } = store;
  const [orderId, setOrderId] = useState<string | null>(null);
  const [tab, setTab] = useState<'food' | 'sauce' | 'drink'>('food');
  const [draft, setDraft] = useState<IngredientId[]>([]);
  const order = activeOrders.find(o => o.id === orderId) || activeOrders[0];
  const recipe = order && RECIPES[order.recipeId];
  useEffect(() => { setDraft([]); }, [order?.id]);
  const needed = recipe ? recipe.requiredIngredients.filter(id => !order?.removedIngredients?.includes(id)).concat(order?.extraIngredients || []) : [];
  const notes = order?.orderNotes?.length ? order.orderNotes : ['Nóng giòn, đúng công thức nhé!'];
  const list = tab === 'food' ? food : tab === 'sauce' ? sauces : drinks;
  const toggleOpen = () => isShopOpen ? store.forceCloseStoreTonight() : g.dayPhase === 'night_audit' ? openModal('dailySummary') : store.openStoreForDay();
  const add = (id: IngredientId) => {
    if (!order || order.state !== 'waiting') { showToast('Chọn khách đang chờ để chế biến món nhé.'); return; }
    if ((g.inventory[id] || 0) <= draft.filter(i => i === id).length) { showToast(`Hết ${INGREDIENTS[id]?.name || id}. Hãy nhập thêm ở Chợ.`); return; }
    setDraft(prev => [...prev, id]);
  };
  const finish = () => {
    if (!order) { if (!isShopOpen) toggleOpen(); else showToast('Khách đang ghé quán, chờ một chút nhé.'); return; }
    if (order.state === 'paying') { store.collectPayment(order.id); store.saveLocal(); return; }
    if (order.state === 'ready') { store.serveDishOrder(order.id); return; }
    if (order.state !== 'waiting') { showToast('Khách đang thưởng thức món. Chọn khách tiếp theo nhé!'); return; }
    if (!draft.length) { showToast('Chọn nguyên liệu theo công thức và dặn dò của khách.'); return; }
    if (store.completeCooking(order.recipeId, order.tableIndex, draft, true)) { setDraft([]); store.saveLocal(); }
  };
  const label = !order ? (isShopOpen ? 'Đang đón khách…' : 'Mở cửa đón khách') : order.state === 'paying' ? 'Thu tiền khách' : order.state === 'ready' ? 'Phục vụ món' : order.state === 'eating' ? 'Khách đang ăn…' : order.state === 'cooking' ? `Đang chế biến ${Math.round(order.cookingProgress || 0)}%` : 'Hoàn thành món';
  const minutes = Math.floor(g.gameTimeMinutes);
  const theme = SHOP_THEMES[g.activeTheme];
  const cozy = g.equippedDecorations.reduce((sum,id) => sum + (DECORATION_ITEMS.find(d => d.id === id)?.cozyPoints || 0), 0);
  return <section style={{ background: theme?.bgColor }} className="bm-game" aria-label="Quầy bánh mì — Đế Chế Kinh Doanh">
    <header className="bm-hud" style={{ background: theme ? `linear-gradient(${theme.bgColor}, ${theme.primaryColor}25)` : undefined }}>
      <div className="bm-hud-main">
        <button className="bm-brand" onClick={() => openModal('franchise')} aria-label="Quản lý chuỗi cửa hàng"><span className="bm-shop-icon"><Store/></span><span className="bm-brand-copy"><b title={g.shopName}>{g.shopName || 'Bánh Mì'}</b><small>Lv.{g.player.cookingLevel}</small></span><ChevronDown size={14}/></button>
        <button className="bm-cash" onClick={() => openModal('ledger')} aria-label="Sổ thu chi"><Coins/><b>{g.money.toLocaleString('vi-VN')} đ</b><Plus className="bm-plus"/></button>
        <button className="bm-open" onClick={toggleOpen}><Store size={17}/>{isShopOpen ? 'Đóng cửa' : 'Mở Cửa'}<Sparkles size={14}/></button>
      </div>
      <div className="bm-hud-stats">
        <button className="bm-day" onClick={() => store.setTimeSpeed(store.timeSpeed === 0 ? 1 : 0)} aria-label={store.timeSpeed === 0 ? 'Tiếp tục thời gian' : 'Tạm dừng thời gian'}><CalendarDays/><span><b>Ngày {g.day}</b><small><Clock3 size={13}/>{`${Math.floor(minutes / 60)}`.padStart(2,'0')}:{`${minutes % 60}`.padStart(2,'0')}{store.timeSpeed === 0 ? <Play size={12}/> : <Pause size={12}/>}</small></span></button>
        <div className="bm-scores"><span>⭐ <b>{Math.round(g.rating ?? 75)}</b></span><i/><span><Trophy/> <b>{g.fame ?? g.reputation}</b></span></div>
        <div className="bm-rating"><Smile/><span><b>{((g.rating ?? 75)/20).toLocaleString('vi-VN',{maximumFractionDigits:1})}</b><small>{store.dailyCustomersServed} khách hôm nay</small></span></div>
      </div>
      <div className="bm-operations"><span className={g.player.energy < 15 ? 'is-low' : ''}>⚡ {g.player.energy}/{g.player.maxEnergy}<meter min={0} max={g.player.maxEnergy} value={g.player.energy} aria-label="Thể lực"/></span><button onClick={() => openModal('menuPricing')}>📋 Menu & giá</button><button onClick={() => openModal('delivery')}>🛵 {store.deliveryOrders.length} đơn</button></div>
      {g.player.energy < 3 && <p className="bm-low-energy">Bạn hết sức. Có thể để nhân viên nấu hoặc kết thúc ca để nghỉ.</p>}
      {!!cozy && <small className="bm-cozy">🌿 Cozy +{cozy} · {g.equippedDecorations.map(id => DECORATION_ITEMS.find(d => d.id === id)?.icon).join(' ')}</small>}
    </header>
    <div className="bm-play-area">
      <section className="bm-queue" aria-label="Hàng khách"><div className="bm-awning"/><div className="bm-lights"><i/><i/><i/><i/></div>
        <div className="bm-customers">{activeOrders.map((o) => <button key={o.id} className={`bm-customer ${o.id === order?.id ? 'is-active' : ''}`} onClick={() => setOrderId(o.id)} aria-label={`Khách bàn ${o.tableIndex}, ${RECIPES[o.recipeId]?.name}, ${o.state}`}><span className="bm-customer-portrait"><img src={getCustomerPortrait(o.id)} alt=""/></span><span className="bm-table">{o.state === 'paying' ? '₫' : o.tableIndex}</span><small>{o.state === 'paying' ? 'Thu tiền' : o.state === 'eating' ? 'Đang ăn' : 'Gọi món'}</small></button>)}
          {!activeOrders.length && <div className="bm-welcome"><span>{isShopOpen ? '🔔' : '🌤️'}</span><b>{isShopOpen ? 'Khách đang ghé quán…' : 'Chào buổi sáng, chủ quán!'}</b><small>{isShopOpen ? 'Chuẩn bị bếp, sẵn sàng đón khách.' : 'Mở cửa để bắt đầu một ngày mới.'}</small></div>}
        </div>
      </section>
      <section className="bm-order" aria-label="Phiếu gọi món"><div className="bm-order-image"><img src={recipe?.category === 'drink' ? banhMiArt('milk-tea') : banhMiArt('banh-mi')} alt=""/></div><div className="bm-order-copy"><div className="bm-order-title"><h1>{recipe?.name || 'Bánh mì đặc biệt'}</h1><span>{order ? `Bàn ${order.tableIndex}` : 'Chưa có đơn'}</span></div><div className="bm-notes">{order ? notes.map(n => <span key={n}>{n}</span>) : <span>Chuẩn bị nguyên liệu và mở cửa nhé!</span>}</div><div className="bm-patience"><b>KIÊN NHẪN</b><progress max={order?.maxPatience || 100} value={order?.patienceRemaining || 100} aria-label="Kiên nhẫn của khách"/></div></div></section>
      <section className="bm-pantry" aria-label="Khay nguyên liệu"><div className="bm-tabs" role="tablist" aria-label="Loại nguyên liệu">{(['food','sauce','drink'] as const).map((t,i) => <button key={t} id={`bm-tab-${t}`} role="tab" aria-selected={tab === t} aria-controls="bm-pantry-panel" onClick={() => setTab(t)} className={tab === t ? 'is-active' : ''}>{['🥖 Nguyên Liệu','🧴 Sốt & Gia Vị','🧋 Đồ Uống'][i]}</button>)}</div><div className="bm-ingredients" id="bm-pantry-panel" role="tabpanel" aria-labelledby={`bm-tab-${tab}`}>{list.map(item => <IngredientCard key={item.id} item={item} stock={(g.inventory[item.id] || 0) - draft.filter(id => id === item.id).length} quantity={draft.filter(id => id === item.id).length} forbidden={!!order?.removedIngredients?.includes(item.id)} onAdd={() => add(item.id)}/>)}</div></section>
      <section className="bm-workbench" aria-label="Bàn chế biến"><div className="bm-worktop"><aside className="bm-ticket"><div className="bm-ticket-rings"><i/><i/></div><b>{recipe?.name || 'PHIẾU GỌI MÓN'}</b>{order ? <><span className="bm-ticket-notes">{notes.join(' · ')}</span><small>Cần có:</small><div className="bm-recipe-list">{needed.map((id,i) => <span key={`${id}-${i}`} className={draft.filter(a => a === id).length >= needed.slice(0,i+1).filter(a => a === id).length ? 'is-added' : ''}><Check size={11}/>{allItems.find(a => a.id === id)?.label || INGREDIENTS[id]?.name}</span>)}</div></> : <small>Đọc đơn → chọn nguyên liệu → hoàn thành món.</small>}</aside><DishWorkbench draft={draft} drink={recipe?.category === 'drink'} onRemove={i => setDraft(d => d.filter((_,j) => j !== i))}/><button className="bm-reset" onClick={() => setDraft([])} aria-label="Làm lại món" title="Làm lại món"><Trash2 size={20}/></button></div><div className="bm-counter-tools">{sauces.map((item,i) => <button key={item.id} onClick={() => add(item.id)} aria-label={`Thêm ${item.label}`}><span className={`bm-bottle bottle-${i}`}><i/><b>{item.label}</b></span></button>)}</div></section>
    </div>
    <div className="bm-actionbar"><button className="bm-finish" onClick={finish} disabled={!!order && ['eating','cooking'].includes(order.state)}><ChefHat/><span>{label}</span><Sparkles size={19}/></button></div>
    <nav className="bm-nav" aria-label="Điều hướng game">
      <button onClick={() => openModal('cooking')}><span className="nav-icon nav-pink"><BookOpen/></span><b>Công Thức</b></button>
      <button onClick={() => openModal('market')}><span className="nav-icon nav-amber"><ShoppingBag/>{Object.values(g.inventory).filter(q => q <= 2).length > 0 && <i>!</i>}</span><b>Chợ</b></button>
      <button className="bm-nav-street" onClick={() => store.setCurrentView('street')}><span className="nav-icon nav-peach"><Store/></span><b>Ra Phố</b></button>
      <button onClick={() => openModal('upgrades')}><span className="nav-icon nav-mint"><ArrowUpCircle/></span><b>Nâng Cấp</b></button>
      <button onClick={() => openModal('menuMore')}><span className="nav-icon nav-purple"><LayoutGrid/></span><b>Thêm</b></button>
    </nav>
  </section>;
}



