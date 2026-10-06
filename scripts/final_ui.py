from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(file, action):
    p=root/file;p.write_text(action(p.read_text(encoding='utf-8')),encoding='utf-8')
def clock(s):
    s=s.replace("import { useEffect, useRef } from 'react';", "import { useEffect, useRef } from 'react';\nimport { simulationDelta } from '../../../shared/simulation/time';")
    s=s.replace('    const tickMs = 500;', '    const delta = simulationDelta(500, timeSpeed);\n    const tickMs = 500;')
    s=s.replace('tickTime(1.25 * timeSpeed)', 'tickTime(delta.gameMinutes)')
    s=s.replace('(tickMs / 1000) * timeSpeed','delta.seconds').replace('tickMs / 1000 * timeSpeed','delta.seconds').replace('tickMs * timeSpeed','delta.milliseconds')
    return s
edit('client/src/hooks/useGameSimulation.ts',clock)
def settings(s):
    s=s.replace('const [isSyncing, setIsSyncing]', "const [cloudStatus, setCloudStatus] = useState<'unknown'|'ok'|'offline'>('unknown');\n  const [isSyncing, setIsSyncing]")
    s=s.replace('const synced = await syncCloud();', "const synced = await syncCloud();\n    setCloudStatus(synced ? 'ok' : 'offline');")
    s=s.replace('Lưu trữ Local (Trình duyệt):','Lưu trên máy:').replace('Đồng bộ Cloud Server:','Đồng bộ:')
    s=s.replace('Máy chủ (khi kết nối)', "{cloudStatus === 'ok' ? 'Đã đồng bộ' : cloudStatus === 'offline' ? 'Chưa kết nối' : 'Chưa kiểm tra'}")
    s=s.replace('Quản lý đồng bộ Cloud, sao lưu dữ liệu và cài đặt trò chơi','Lưu tiến độ, âm thanh và hướng dẫn chơi')
    s=s.replace('Lưu Game Ngay (Cloud + Local)','Lưu tiến độ ngay')
    return s
edit('client/src/components/modals/SettingsModal.tsx',settings)
def store(s):
    a=s.index('  serveNeighborGuest: (neighborId) => {'); b=s.index('  spawnDeliveryOrder:',a)
    part=s[a:b].replace('            lastInteractedDay: gameState.day,','')
    s=s[:a]+part+s[b:]
    s=s.replace('    const chosen = event || STREET_EVENTS[Math.floor(Math.random() * STREET_EVENTS.length)];', "    if (!event && get().dailyEventsCount >= 3) { get().showToast('Hôm nay đã đủ chuyện xóm. Ghé lại vào ngày mai nhé.'); return; }\n    const recent = gameState.streetEventHistory?.slice(-3) || [];\n    const available = STREET_EVENTS.filter(item => !recent.includes(item.id));\n    const pool = available.length ? available : STREET_EVENTS;\n    const chosen = event || pool[Math.floor(Math.random() * pool.length)];")
    s=s.replace('        currentEvent: null,\n      },\n    }));', '        currentEvent: null,\n        streetEventHistory: [...(state.gameState.streetEventHistory || []), event.id].slice(-20),\n      },\n    }));',1)
    s=s.replace('      operatingSnapshot: undefined,','      operatingSnapshot: undefined,\n      currentEvent: null,')
    return s
edit('client/src/store/gameStore.ts',store)
