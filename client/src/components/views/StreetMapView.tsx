import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RESTAURANT_TYPES, BUSINESS_STAGES, RECIPES, calculateMaxTables } from '../../../../shared/gameData';
import { RestaurantTypeId } from '../../../../shared/types';
import { ArrowLeft, ArrowRight, Store, MapPin, ShoppingBag, Truck, Users, Newspaper, Lock, Coins, ChefHat, Plus, Sun, CloudRain, Wind, Sparkles } from 'lucide-react';
import { getCustomerPortrait } from '../../assets/banhMiArt';
import './street-map.css';

const ids: RestaurantTypeId[] = ['banh_mi', 'pho', 'bun', 'beefsteak', 'com_tam'];
const colors = ['#f58faa', '#9acbb3', '#aeb6e3', '#edb987', '#b3cbd8'];

// Original vector storefronts: every facade, awning and sign remains editable.
const StreetScene = ({ selected, onSelect }: { selected: RestaurantTypeId; onSelect: (id: RestaurantTypeId) => void }) => <svg className="pp-scene" viewBox="0 0 520 300" role="img" aria-label="Góc phố với năm cửa hàng, cây xanh và đường đi">
  <defs><linearGradient id="pp-sky" x2="0" y2="1"><stop stopColor="#d7edf0"/><stop offset="1" stopColor="#fff2db"/></linearGradient><pattern id="pp-pavers" width="30" height="16" patternUnits="userSpaceOnUse"><path d="M0 15h30M15 0v15" stroke="#dabca3" strokeWidth="1"/></pattern></defs>
  <rect width="520" height="300" fill="url(#pp-sky)"/><circle cx="430" cy="42" r="23" fill="#ffe2a0"/>
  <g fill="#fffdf5" opacity=".9"><rect x="40" y="35" width="72" height="17" rx="9"/><circle cx="65" cy="34" r="15"/><circle cx="85" cy="36" r="11"/><rect x="292" y="23" width="59" height="14" rx="8"/><circle cx="315" cy="22" r="12"/></g>
  <g fill="#c7d7cb" opacity=".5"><path d="M0 98h26V64h42v42h24V80h45v55H0z"/><path d="M354 102h29V73h41v29h21V59h41v45h34v38H354z"/></g>
  <rect y="211" width="520" height="37" fill="#edd5b9"/><rect y="211" width="520" height="37" fill="url(#pp-pavers)"/><rect y="249" width="520" height="51" fill="#bcaaa8"/><path d="M0 273h520" stroke="#fff2db" strokeWidth="3" strokeDasharray="27 20"/>
  {ids.map((id,i)=><g key={id} transform={`translate(${12+i*100} ${i%2?87:98})`} role="button" tabIndex={0} aria-label={`Chọn ${RESTAURANT_TYPES[id].shortName}`} onClick={()=>onSelect(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(id);}}} className={selected===id?'pp-building selected':'pp-building'}>
    <rect x="0" y="0" width="94" height={i%2?124:113} rx="6" fill={colors[i]} stroke="#b58173" strokeWidth="2"/>
    <rect x="5" y="-7" width="84" height="12" rx="4" fill="#fff3dc" stroke="#b58173" strokeWidth="2"/>
    <rect x="13" y="15" width="26" height="27" rx="4" fill="#fff3dc"/><rect x="54" y="15" width="26" height="27" rx="4" fill="#fff3dc"/><path d="M26 15v27M67 15v27" stroke="#c1957c" strokeWidth="2"/>
    <rect x="8" y="51" width="78" height="19" rx="5" fill="#fffaf0" stroke="#c1957c"/><text x="47" y="64" textAnchor="middle" fontSize="10" fontWeight="900" fill="#754c43">{({banh_mi:"Bánh Mì",pho:"Phở Bò",bun:"Bún Bò",beefsteak:"Bò Né",com_tam:"Cơm Tấm"})[id]}</text>
    <rect x="10" y="76" width="74" height={i%2?44:33} fill="#725b51"/>
    {[0,1,2,3,4,5].map(n=><path key={n} d={`M${5+n*14} 72h14l3 14q-10 8-20 0z`} fill={n%2?'#fff0d9':colors[i]} stroke="#ba8878" strokeWidth=".6"/>)}
    <rect x="20" y="92" width="53" height="10" rx="3" fill="#e6be87"/>{selected===id&&<g><circle cx="47" cy="-25" r="13" fill="#ff648b" stroke="white" strokeWidth="3"/><path d="m42-25 4 4 7-8" stroke="white" strokeWidth="2" fill="none"/></g>}
  </g>)}
  {[7,508].map(x=><g key={x}><path d={`M${x} 194v43`} stroke="#987b59" strokeWidth="5"/><circle cx={x} cy="184" r="20" fill="#9abf8f"/><circle cx={x-7} cy="178" r="13" fill="#bdd7a1"/></g>)}
  <g transform="translate(340 224)"><rect width="30" height="9" rx="2" fill="#b28468"/><path d="M3 9v11M27 9v11" stroke="#8b6955" strokeWidth="3"/></g>
  <g transform="translate(100 253)"><circle cx="0" cy="15" r="7" fill="#715b56"/><circle cx="40" cy="15" r="7" fill="#715b56"/><path d="M0 12h40L30 0H14L8 7H0z" fill="#f28ba3" stroke="#875d59" strokeWidth="2"/><path d="M20-2v-9h11" stroke="#875d59" strokeWidth="3"/></g>
</svg>;

export const StreetMapView: React.FC = () => {
  const store = useGameStore();
  const { gameState:g, activeOrders, openModal } = store;
  const active = g.activeRestaurantId || 'banh_mi';
  const [selected,setSelected] = useState<RestaurantTypeId>(active);
  const rest = RESTAURANT_TYPES[selected];
  const unlocked = selected===active || g.unlockedRestaurants?.includes(selected);
  const opened = ids.filter(id=>id===active||g.unlockedRestaurants?.includes(id)).length;
  const stage = BUSINESS_STAGES[g.businessStage] || BUSINESS_STAGES.cart;
  const seats = calculateMaxTables(g.businessStage, g.stageUpgrades?.[g.businessStage] ?? (g.stageUpgrades ? {} : g.purchasedUpgrades || {}), g.stageUpgrades);
  const Weather = g.weather==='rainy'?CloudRain:g.weather==='breezy'?Wind:Sun;
  const enter = () => {store.switchActiveRestaurant(selected);store.setCurrentView('shop');};
  return <div className="pp-page">
    <header className="pp-header"><button aria-label="Trở về quầy" onClick={()=>store.setCurrentView('shop')}><ArrowLeft size={20}/></button><div><small>ĐẾ CHẾ KINH DOANH</small><h1>Phố Phường <Sparkles size={18}/></h1></div><span className="pp-weather"><Weather size={19}/>{g.weather==='rainy'?'Mưa':g.weather==='breezy'?'Mát':'Nắng'}</span></header>
    <div className="pp-scroll">
      <section className="pp-neighborhood"><div className="pp-scene-label"><span><MapPin size={13}/> Góc phố của bạn</span><b>Ngày {g.day}</b></div><StreetScene selected={selected} onSelect={setSelected}/><div className="pp-scene-footer"><span><i/> {opened}/5 quán đã mở</span><span>Chạm vào quán để khám phá</span></div></section>
      <div className="pp-section-title"><h2>Quán trong phố</h2><button onClick={()=>openModal('franchise')}>Quản lý chuỗi <ArrowRight size={13}/></button></div>
      <div className="pp-shop-tabs" role="tablist" aria-label="Cửa hàng trong phố">{ids.map((id,i)=><button key={id} role="tab" aria-selected={selected===id} className={selected===id?'active':''} onClick={()=>setSelected(id)}><span style={{background:colors[i]}}>{RESTAURANT_TYPES[id].icon}</span>{({banh_mi:"Bánh Mì",pho:"Phở Bò",bun:"Bún Bò",beefsteak:"Bò Né",com_tam:"Cơm Tấm"})[id]}{!(id===active||g.unlockedRestaurants?.includes(id))&&<Lock size={10}/>}</button>)}</div>
      <section className="pp-shop-card"><div className="pp-shop-heading"><span className="pp-shop-icon" style={{background:colors[ids.indexOf(selected)]+'45'}}>{rest.icon}</span><div><small>{selected===active?'QUÁN ĐANG QUẢN LÝ':unlocked?'CHI NHÁNH CỦA BẠN':'MỘT KHỞI ĐẦU MỚI'}</small><h3>{rest.name}</h3><p>{unlocked?stage.name:rest.tagline}</p></div></div>
        <div className="pp-shop-meta">{unlocked?<><span><Store size={14}/> Đã mở cửa hàng</span><span>⭐ {g.reputation} uy tín</span></>:<><span><Coins size={14}/> {rest.unlockCost.toLocaleString('vi-VN')} đ</span><span>⭐ Cần {rest.requiredReputation} uy tín</span></>}</div>
        <button className="pp-primary" onClick={()=>unlocked?enter():openModal('franchise')}>{unlocked?<ChefHat size={18}/>:<Plus size={18}/>} {unlocked?'Vào bếp bán hàng':'Khám phá & mở quán'}<ArrowRight size={17}/></button>
      </section>
      <div className="pp-section-title"><h2>Dạo quanh phố</h2><span>Mỗi ngày một câu chuyện</span></div>
      <div className="pp-destinations">
        <button onClick={()=>openModal('market')}><span className="pp-mint"><ShoppingBag/></span><b>Chợ đầu ngõ</b><small>Mua nguyên liệu tươi</small><ArrowRight size={15}/></button>
        <button onClick={()=>openModal('delivery')}><span className="pp-peach"><Truck/></span><b>Trạm giao hàng</b><small>Đơn mang đi & giao tận nơi</small><ArrowRight size={15}/></button>
        <button onClick={()=>openModal('neighbors')}><span className="pp-lavender"><Users/></span><b>Hàng xóm</b><small>Ghé thăm, làm quen</small><ArrowRight size={15}/></button>
        <button onClick={()=>openModal('streetEvents')}><span className="pp-pink"><Newspaper/></span><b>Bản tin vỉa hè</b><small>Hóng chuyện trong xóm</small><ArrowRight size={15}/></button>
      </div>
      <div className="pp-section-title"><h2>Bàn ngoài hiên</h2><span>{activeOrders.length}/{seats} bàn có khách</span></div>
      <section className="pp-tables">{Array.from({length:seats},(_,i)=>{const order=activeOrders.find(o=>o.tableIndex===i+1);return <article key={i} className="pp-table"><span className="pp-table-number">Bàn {i+1}</span>{order?<><img src={getCustomerPortrait(order.id)} alt="Khách tại bàn"/><b>{RECIPES[order.recipeId]?.name}</b>{order.state==='paying'?<button onClick={()=>store.collectPayment(order.id)}>Thu tiền</button>:order.state==='ready'?<button onClick={()=>store.serveDishOrder(order.id)}>Bưng món</button>:<small>{order.state==='eating'?'Đang thưởng thức':'Đang chờ món'}</small>}</>:<><span className="pp-empty-table">☕</span><b>Mời khách ghé chơi</b><small>Bàn đang trống</small></>}</article>})}</section>
      <button className="pp-staff" onClick={()=>openModal('employees')}><Users size={18}/><span><b>Đội ngũ của bạn</b><small>{g.hiredEmployees.length} nhân viên · Cùng nhau xây quán</small></span><ArrowRight size={17}/></button>
      <p className="pp-end">Một góc phố nhỏ, một ước mơ lớn ♡</p>
    </div>
  </div>;
};


