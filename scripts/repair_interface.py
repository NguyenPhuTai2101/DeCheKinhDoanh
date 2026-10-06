from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
def edit(file, action):
    path=root/file
    path.write_text(action(path.read_text(encoding='utf-8')),encoding='utf-8')
def delivery(s):
    s=s.replace("import React from 'react';", "import React from 'react';\nimport { IngredientIcon } from '../common/IngredientIcon';")
    s=s.replace('onClick={handleCallOrder}', 'disabled={!useGameStore.getState().isShopOpen || matchingOrders.length > 0}\n            onClick={handleCallOrder}')
    s=s.replace('<span>Gọi Thêm Đơn</span>', '<span>Kiểm tra đơn mới</span>')
    s=s.replace('Bấm nút [Gọi Thêm Đơn] phía trên hoặc chờ các công ty xung quanh gọi điện thoại đặt hàng nhé!', 'Mở cửa để nhận đơn. Đơn dùng chung bếp với khách tại bàn; bạn chỉ nhận tiền sau khi giao xong.')
    s=s.replace('const totalEarned = order.rewardMoney + order.rewardTip;', 'const totalEarned = order.rewardMoney + order.rewardTip - (order.shippingFee || Math.round(order.rewardMoney * 0.1));')
    s=s.replace('{/* Danh sách nguyên liệu cần để giao */}', '''<div className="flex flex-wrap gap-2 text-xs font-bold"><span>⏱ Còn {Math.ceil(order.timeRemainingSeconds)}s</span><span>{order.status === 'pending' ? 'Chờ nhận' : order.status === 'cooking' ? `Đang nấu · ${Math.ceil(order.workRemainingSeconds || 0)}s · ${order.chefName}` : order.status === 'ready' ? 'Đã đóng gói · chờ bàn giao' : `Đang giao · ${Math.ceil(order.workRemainingSeconds || 0)}s`}</span></div>
                  <p className="text-xs text-[#87615e]">Đóng cửa sổ để tiếp tục thời gian. Phí ship 10% giá món; nguyên liệu đã dùng sẽ không hoàn lại khi hủy.</p>
                  {/* Danh sách nguyên liệu cần để giao */}''')
    s=s.replace('disabled={!hasStock}', "disabled={!useGameStore.getState().isShopOpen || (order.status === 'pending' && !hasStock) || ['cooking','delivering'].includes(order.status)}")
    s=s.replace("{hasStock ? 'Bàn Giao Cho Chú Năm Đi Ship' : 'Thiếu Nguyên Liệu (Đi Chợ)'}", "{order.status === 'pending' ? (hasStock ? 'Nhận đơn & chế biến' : 'Thiếu nguyên liệu · Đi chợ') : order.status === 'ready' ? 'Bàn giao cho Chú Năm' : order.status === 'cooking' ? 'Bếp đang chế biến…' : 'Chú Năm đang giao…'}")
    s=s.replace('{ing?.icon} {ing?.name}', '<IngredientIcon id={ingId} size={20}/> {ing?.name}')
    s=s.replace("      soundManager.playCoin();", "      soundManager.playClick();")
    return s
edit('client/src/components/modals/DeliveryModal.tsx',delivery)
def reference(s):
    s=s.replace("import { INGREDIENTS, RECIPES }", "import { SHOP_THEMES, DECORATION_ITEMS, INGREDIENTS, RECIPES }")
    s=s.replace("  const minutes = Math.floor(g.gameTimeMinutes);", "  const minutes = Math.floor(g.gameTimeMinutes);\n  const theme = SHOP_THEMES.find(t => t.id === g.activeTheme);\n  const cozy = g.equippedDecorations.reduce((sum,id) => sum + (DECORATION_ITEMS.find(d => d.id === id)?.cozyPoints || 0), 0);")
    s=s.replace('<section className="bm-game"', '<section style={{ background: theme?.bgColor }} className="bm-game"')
    s=s.replace('<b>Bánh Mì</b>', '<b title={g.shopName}>{g.shopName || \'Bánh Mì\'}</b>')
    s=s.replace('<header className="bm-hud">', '<header className="bm-hud" style={{ background: theme ? `linear-gradient(${theme.bgColor}, ${theme.primaryColor}25)` : undefined }}>')
    s=s.replace('    </header>', '''      <div className="bm-operations"><span className={g.player.energy < 15 ? 'is-low' : ''}>⚡ {g.player.energy}/{g.player.maxEnergy}<meter min={0} max={g.player.maxEnergy} value={g.player.energy} aria-label="Thể lực"/></span><button onClick={() => openModal('menuPricing')}>📋 Menu & giá</button><button onClick={() => openModal('delivery')}>🛵 {store.deliveryOrders.length} đơn</button></div>
      {g.player.energy < 3 && <p className="bm-low-energy">Bạn hết sức. Có thể để nhân viên nấu hoặc kết thúc ca để nghỉ.</p>}
      {!!cozy && <small className="bm-cozy">🌿 Cozy +{cozy} · {g.equippedDecorations.map(id => DECORATION_ITEMS.find(d => d.id === id)?.icon).join(' ')}</small>}
    </header>''',1)
    return s
edit('client/src/components/views/ReferenceShopView.tsx',reference)
def employees(s):
    s=s.replace('{emp.marketSkill || 75}% giá sỉ', '{Math.round(Math.min(0.35, ((emp.marketSkill || 75) - 50) * 0.006 + 0.1) * 100)}% giá sỉ')
    return s.replace('{cand.marketSkill || 75}%', '{Math.round(Math.min(0.35, ((cand.marketSkill || 75) - 50) * 0.006 + 0.1) * 100)}%')
edit('client/src/components/modals/EmployeesModal.tsx',employees)
def franchise(s):
    return s.replace('Chưa có ai (đang chạy thời vụ 50%)','Chưa có bếp hoặc quản lý · tạm ngừng bán').replace('(1x Doanh thu)','(năng lực phục vụ)').replace('Doanh thu tự động','năng lực bán tự động')
edit('client/src/components/modals/FranchiseModal.tsx',franchise)
def menu(s):
    return s.replace('{/* NHÓM 1: QUẢN LÝ QUÁN */}', '''<button onClick={() => handleSelectModal('menuPricing')} className="w-full rounded-2xl border border-pink-200 bg-white p-3 text-left text-sm font-bold text-[#7C5C55]">📋 Thực đơn & giá bán <small className="block font-normal">Chọn món mở bán, xem giá vốn và điều chỉnh giá</small></button>
          {/* NHÓM 1: QUẢN LÝ QUÁN */}''')
edit('client/src/components/modals/MenuMoreDrawer.tsx',menu)
def settings(s):
    s=s.replace("import React, { useState }", "import { soundManager } from '../../utils/soundManager';\nimport React, { useState }")
    s=s.replace('{/* Header Modal */}', '{/* Header Modal */}',1)
    # Insert before the first saved-state status card.
    idx=s.index('        <div className="p-6')
    end=s.index('>',idx)+1
    s=s[:end]+'''\n          <button className="w-full p-3 rounded-xl border border-pink-200 bg-white font-bold text-sm" onClick={() => { const muted = !gameState.soundMuted; soundManager.setMuted(muted); useGameStore.setState({ gameState: { ...gameState, soundMuted: muted } }); saveLocal(); }}>{gameState.soundMuted ? '🔇 Âm thanh đang tắt · Bật' : '🔊 Âm thanh đang bật · Tắt'}</button>'''+s[end:]
    return s
edit('client/src/components/modals/SettingsModal.tsx',settings)
# Adopt common modal dimensions, header hierarchy and accessible close buttons.
for p in (root/'client/src/components/modals').glob('*.tsx'):
    s=p.read_text(encoding='utf-8')
    s=s.replace('className="fixed inset-0 ', 'className="game-modal-backdrop fixed inset-0 ',1)
    s=re.sub(r'(<div className=")([^"\n]*rounded-t-3xl[^"\n]*)(")',r'\1game-modal-panel \2\3',s,count=1)
    # Buttons containing an X icon get a semantic name; leave already named ones alone.
    def label(m):
        text=m.group(0)
        return text if 'aria-label=' in text else text.replace('<button','<button aria-label="Đóng cửa sổ"',1)
    s=re.sub(r'<button\b[^>]*>\s*<X\b[^<]*</button>',label,s)
    s=s.replace('Thực Đơn & Chiến Lược Định Giá (V2)','Thực Đơn & Giá Bán').replace('Tối ưu hóa Active Menu, Giá vốn (COGS) & Biên lợi nhuận','Chọn món, xem giá vốn và lợi nhuận')
    p.write_text(s,encoding='utf-8')
