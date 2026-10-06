import type { GameSaveState, SurpriseIncident } from '../types';
import { SURPRISE_INCIDENTS } from '../simulationConfig';

export function chooseContextualIncident(game: GameSaveState, hasDelivery: boolean): SurpriseIncident {
  const history = game.incidentHistory || [];
  const pool = SURPRISE_INCIDENTS.filter(incident => {
    if (history.slice(-3).includes(incident.id)) return false;
    if (incident.id === 'inc_wrong_accuse') return false; // Requires an actual accusation story, not a random penalty.
    if (incident.id === 'inc_shipper_slip' && !hasDelivery) return false;
    if (incident.id === 'inc_cat_thief' && !(game.inventory.pork || game.inventory.beef)) return false;
    if (game.day <= 2 && incident.type === 'penalty') return false; // First shifts teach the loop before risks escalate.
    return true;
  });
  const available = pool.length ? pool : SURPRISE_INCIDENTS.filter(incident => incident.type === 'reward');
  const weights = available.map(incident => incident.id === 'inc_urban_order' && (game.neighbors.bac_ba?.level || 1) >= 2 ? 0.5 : 1);
  let roll = Math.random() * weights.reduce((sum, value) => sum + value, 0);
  const selected = available[weights.findIndex(value => (roll -= value) < 0)] || available[0];
  const scale = { cart:.35, corner:.55, awning:.75, eatery:.9, empire:1 }[game.businessStage];
  return { ...selected, moneyChange:Math.round(selected.moneyChange * scale), footerNote:'Mức tác động theo quy mô quán. Bạn có thể chọn cách xử lý trước khi tiếp tục.' };
}
