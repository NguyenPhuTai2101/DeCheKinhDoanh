import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUSINESS_STAGES, getStageCatalog, getStageUpgradeTierInfo, calculateStorageCapacity, calculateCookSpeedBoost, calculateSpawnRateBoost, calculateCustomerPatienceBonus, calculateTipRateBonus, calculateDeliveryBonus, calculateReputationBonus, calculateMaxTables } from '../../../../shared/gameData';
import { calculateStageFixedCosts } from '../../../../shared/economy/finance';
import { BusinessStageId } from '../../../../shared/types';
import { X, ArrowRight, Check, Coins, Store, Wrench, Lock, Info, ChevronDown } from 'lucide-react';
import './upgrades.css';
const stages: BusinessStageId[] = ['cart','corner','awning','eatery','empire'];
const money = (v:number) => `${Math.round(v).toLocaleString('vi-VN')} đ`;
const percent = (v:number) => `${Math.round(v*1000)/10}%`;

export const UpgradesModal: React.FC = () => {
  const {gameState:g,closeModal,purchaseUpgrade,upgradeBusinessStage} = useGameStore();
  const [tab,setTab] = useState<'equipment'|'expansion'>('equipment');
  const [showRoadmap,setShowRoadmap] = useState(false);
  const stageId=g.businessStage || 'cart';
  const catalog=getStageCatalog(stageId);
  const levels=g.stageUpgrades?.[stageId] ?? (g.stageUpgrades ? {} : g.purchasedUpgrades || {});
  const history=g.stageUpgrades || { [stageId]: levels };
  const stage=BUSINESS_STAGES[stageId];
  const nextId=stages[stages.indexOf(stageId)+1];
  const next=nextId&&BUSINESS_STAGES[nextId];
  const costs=calculateStageFixedCosts(stageId);
  const nextCosts=calculateStageFixedCosts(nextId||stageId);
  const stock=Object.values(g.inventory).reduce((a,b)=>a+b,0);
  const benefits=(id:string,l:Record<string,number>)=>{
    switch(id){
      case 'cozy_storage': return `${Math.max(g.storageCapacity, calculateStorageCapacity(stageId,l,history))} ô`;
      case 'modern_stove': return `${(10/(1+calculateCookSpeedBoost(stageId,l,history))).toFixed(1)} giây`;
      case 'flower_signboard': return `${(stage.customerRateMs/1000/(1+calculateSpawnRateBoost(stageId,l,history))).toFixed(1)} giây`;
      case 'seating_comfort': return `+${calculateCustomerPatienceBonus(stageId,l,history)} giây`;
      case 'dishware_premium': return `+${percent(calculateTipRateBonus(stageId,l,history))}`;
      case 'delivery_fleet': return `+${percent(calculateDeliveryBonus(stageId,l,history))}`;
      case 'sound_ambience': return `+${percent(calculateReputationBonus(stageId,l,history))}`;
      case 'extra_tables': return `${calculateMaxTables(stageId,l,history)} bàn`;
      default:return '';
    }
  };
  const explanation:Record<string,[string,string]>={
    cozy_storage:['Sức chứa nguyên liệu','Kho của quán đang quản lý. Một cấp bảo quản giảm 50% hao hụt; từ hai cấp giảm 80%.'],
    modern_stove:['Thời gian món mẫu 10 giây','Áp dụng khi bạn chế biến và khi nhân viên tự nấu.'],
    flower_signboard:['Khoảng cách khách ghé cơ bản','Còn phụ thuộc giờ bán, thời tiết, giá và đánh giá.'],
    seating_comfort:['Thời gian chờ cộng thêm','Khách có thêm thời gian kiên nhẫn chờ món.'],
    dishware_premium:['Thưởng tiền tip','Tăng tiền tip cơ bản, không cộng trực tiếp vào giá bán.'],
    delivery_fleet:['Thưởng giao hàng','Chỉ có lợi khi hoàn thành các đơn giao hàng.'],
    sound_ambience:['Thưởng danh tiếng kỳ vọng','Thêm cơ hội nhận điểm từ phục vụ tốt; không xóa điểm phạt.'],
    extra_tables:['Bàn phục vụ đồng thời','Có thêm chỗ ngồi; cần đủ nhân lực và nguyên liệu.'],
  };
  const ready=!!next&&g.money>=next.cost&&g.reputation>=next.requiredReputation;
  return <div className="up-backdrop"><section className="up-dialog" role="dialog" aria-modal="true" aria-labelledby="up-title">
    <header className="up-header"><span className="up-header-icon"><Wrench size={22}/></span><div><small>ĐẦU TƯ CHO QUÁN</small><h2 id="up-title">Nâng cấp & mở rộng</h2></div><button aria-label="Đóng nâng cấp" onClick={closeModal}><X size={20}/></button></header>
    <div className="up-wallet"><span><Coins size={16}/> Vốn hiện có</span><b>{money(g.money)}</b></div>
    <div className="up-tabs" role="tablist" aria-label="Loại nâng cấp"><button role="tab" aria-selected={tab==='equipment'} className={tab==='equipment'?'active':''} onClick={()=>setTab('equipment')}><Wrench size={16}/>Thiết bị</button><button role="tab" aria-selected={tab==='expansion'} className={tab==='expansion'?'active':''} onClick={()=>setTab('expansion')}><Store size={16}/>Mở rộng</button></div>
    <div className="up-scroll">
      {tab==='equipment'?<>
        <div className="up-overview"><span>{stage.icon}</span><div><b>{catalog.stageName}</b><small>Thiết bị tại đời quán hiện tại · Hiệu quả cũ được kế thừa</small></div></div>
        <div className="up-guide"><Info size={16}/><span>{stock>=g.storageCapacity*.8?'Kho gần đầy — mở rộng kho giúp chủ động nhập hàng.':'Chọn thiết bị theo nhu cầu: kho, tốc độ phục vụ hoặc thu hút khách.'}</span></div>
        {catalog.upgrades.map(u=>{
          const level=levels[u.id]||0;
          const tier=getStageUpgradeTierInfo(stageId,u.id,level);
          const isMax=tier.isMax || (u.id==='extra_tables' && calculateMaxTables(stageId,levels,history)>=8);
          const after={...levels,[u.id]:level+1};
          const missing=Math.max(0,tier.cost-g.money);
          const [label,note]=explanation[u.id]||['Hiệu quả',''];
          return <article className="up-item" key={u.id}><div className="up-item-top"><span className="up-item-icon">{u.icon}</span><div><h3>{u.name}</h3><small>Cấp {level}/{u.maxLevel}</small></div>{isMax&&<span className="up-max"><Check size={12}/>Tối đa</span>}</div>
            {!isMax&&<p className="up-tier">Tiếp theo: <b>{tier.title}</b></p>}
            <div className="up-benefit"><small>{label}</small><div><b>{benefits(u.id,levels)}</b>{!isMax&&<><ArrowRight size={16}/><strong>{benefits(u.id,after)}</strong></>}</div></div>
            <p className="up-note">{note}</p>
            {isMax?<p className="up-complete">Đã đạt giới hạn nâng cấp của thiết bị này.</p>:<><div className="up-purchase-info"><span>Giá <b>{money(tier.cost)}</b></span><span>{missing?<>Thiếu <b>{money(missing)}</b></>:<>Còn lại <b>{money(g.money-tier.cost)}</b></>}</span></div>
              {!missing&&g.money-tier.cost<costs.total&&<p className="up-warning">Sau mua, vốn còn lại thấp hơn chi phí mặt bằng một ngày ({money(costs.total)}), chưa tính lương và nhập hàng.</p>}
              <button className="up-buy" disabled={missing>0} onClick={()=>purchaseUpgrade(u.id)}>{missing?<><Lock size={14}/>Thiếu {money(missing)}</>:<>Nâng cấp · {money(tier.cost)}<ArrowRight size={15}/></>}</button></>}
          </article>;
        })}
      </>:<>
        <div className="up-overview"><span>{stage.icon}</span><div><b>Hiện tại: {stage.name}</b><small>Cấp cơ nghiệp {stages.indexOf(stageId)+1}/5 · Áp dụng cho toàn chuỗi</small></div></div>
        {next?<article className="up-expansion"><small>BƯỚC TIẾP THEO</small><h3>{next.icon} {next.name}</h3><p>{next.tagline}</p>
          <div className="up-requirements"><div className={g.money>=next.cost?'met':''}><span>{g.money>=next.cost?<Check size={14}/>:<Lock size={14}/>}Vốn đầu tư</span><b>{money(next.cost)}</b><small>{g.money>=next.cost?`Còn ${money(g.money-next.cost)} sau lên đời`:`Thiếu ${money(next.cost-g.money)}`}</small></div><div className={g.reputation>=next.requiredReputation?'met':''}><span>{g.reputation>=next.requiredReputation?<Check size={14}/>:<Lock size={14}/>}Danh tiếng</span><b>{g.reputation}/{next.requiredReputation} điểm</b><small>{g.reputation>=next.requiredReputation?'Đã đạt yêu cầu':`Cần thêm ${next.requiredReputation-g.reputation} điểm`}</small></div></div>
          <h4>Quy mô trước → sau</h4><div className="up-comparison">{[['Chi nhánh tối đa',stage.maxRestaurants,next.maxRestaurants],['Nhân viên tối đa',stage.maxStaff,next.maxStaff],['Bàn phục vụ',calculateMaxTables(stageId,levels,history),calculateMaxTables(nextId,g.stageUpgrades?.[nextId]||{},history)],['Kho nguyên liệu',g.storageCapacity,Math.max(g.storageCapacity,calculateStorageCapacity(nextId,g.stageUpgrades?.[nextId]||{},history))]].map(([label,before,after])=><div key={label}><span>{label}</span><b>{before}<ArrowRight size={12}/><strong>{after}</strong></b></div>)}</div>
          <h4>Chi phí vận hành mỗi ngày</h4><div className="up-comparison">{[['Thuê mặt bằng',costs.rent,nextCosts.rent],['Điện, nước & vệ sinh',costs.utilities,nextCosts.utilities],['Tổng cố định',costs.total,nextCosts.total]].map(([label,before,after])=><div key={label}><span>{label}</span><b>{money(Number(before))}<ArrowRight size={12}/><strong>{money(Number(after))}</strong></b></div>)}</div>
          <p className="up-warning">Chưa bao gồm lương, nguyên liệu và các chi phí khác. Lên đời tăng chi phí ngay cả khi ít khách.</p><p className="up-note">Hiệu quả thiết bị đã mua được giữ lại. Bộ thiết bị đời mới bắt đầu ở cấp 0. Quyền mở thêm chi nhánh không bao gồm tiền mua chi nhánh.</p>
          <button className="up-buy" disabled={!ready} onClick={upgradeBusinessStage}>{ready?`Mở rộng · ${money(next.cost)}`:'Chưa đủ vốn hoặc danh tiếng'}<ArrowRight size={16}/></button>
        </article>:<div className="up-overview"><span>👑</span><div><b>Đã đạt cấp cơ nghiệp cao nhất</b><small>Tiếp tục tối ưu thiết bị và phát triển chi nhánh.</small></div></div>}
        <button className="up-roadmap-toggle" onClick={()=>setShowRoadmap(!showRoadmap)} aria-expanded={showRoadmap}>Lộ trình 5 cấp cơ nghiệp<ChevronDown size={16}/></button>
        {showRoadmap&&<ol className="up-roadmap">{stages.map((id,i)=><li key={id}><span>{BUSINESS_STAGES[id].icon}</span><div><b>{i+1}. {BUSINESS_STAGES[id].name}</b><small>{i<=stages.indexOf(stageId)?id===stageId?'Đang kinh doanh':'Đã đạt':`${money(BUSINESS_STAGES[id].cost)} · ${BUSINESS_STAGES[id].requiredReputation} điểm danh tiếng`}</small></div></li>)}</ol>}
      </>}
    </div>
  </section></div>;
};
