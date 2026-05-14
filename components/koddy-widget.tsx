'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface KoddyData {
  meta: number; ventas: number; metaUpgrade: number
  upgrades: number; month: number; year: number
}

// ── Thresholds ────────────────────────────────────────────────────────────────
const RUN_LEVELS = [
  { label: 'Normal Average', min: 4000  },
  { label: 'High Average',   min: 6000  },
  { label: 'Top Performance',min: 12000 },
]
const UPG_LEVELS = [
  { label: 'Normal Average', pct: 0.25 },
  { label: 'High Average',   pct: 0.50 },
  { label: 'Top Performance',pct: 0.75 },
]

function nextRunLevel(runRate: number) {
  return RUN_LEVELS.find(l => l.min > runRate) ?? null
}
function nextUpgradeLevel(upgrades: number, meta: number) {
  if (meta <= 0) return null
  return UPG_LEVELS.find(l => l.pct * meta > upgrades) ?? null
}

function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

// ── Motivational ──────────────────────────────────────────────────────────────
function getMotivation(pct: number, day: number, dim: number, firstName: string) {
  const name = firstName ? `${firstName}! ` : ''
  if (pct >= 1)   return `${name}Meta mensal atingida! Tás a arrasar 🎉`
  if (pct >= 0.8) return `${name}Quase lá! Mais um esforço e chegaste.`
  if (pct >= 0.5) return `${name}Na metade do caminho, continua assim!`
  if (day > dim * 0.6) return `${name}Ainda dás a volta! Foca no daily de hoje.`
  return `${name}O mês tem muito tempo. Vai nessa! 🚀`
}

// ── Bubble ────────────────────────────────────────────────────────────────────
function Bubble({ children, accent, highlight }: { children: React.ReactNode; accent?: string; highlight?: boolean }) {
  return (
    <div style={{
      background: accent ? `${accent}12` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? accent + (highlight ? '55' : '28') : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 14, borderTopLeftRadius: 4,
      padding: '10px 13px',
      fontSize: 12, color: 'rgba(232,237,245,0.85)',
      fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6,
      boxShadow: highlight && accent ? `0 0 12px ${accent}22` : undefined,
      transition: 'box-shadow 0.4s, border-color 0.4s',
    }}>
      {children}
    </div>
  )
}

// ── Chime ─────────────────────────────────────────────────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [880, 1100, 1320]
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.13
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t)
      osc.stop(t + 0.35)
    })
  } catch {}
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function KoddyWidget() {
  const { data: session, status } = useSession()
  const [open, setOpen]       = useState(false)
  const [kd, setKd]           = useState<KoddyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState<Date | null>(null)
  const [pulse, setPulse]     = useState(false)
  const [unread, setUnread]   = useState(0)
  const [changed, setChanged] = useState(false)  // highlights bubbles on change

  const openRef    = useRef(false)
  const prevKd     = useRef<KoddyData | null>(null)
  const firstFetch = useRef(true)

  const isAdmin   = (session?.user as any)?.isAdmin ?? false
  const visible   = status === 'authenticated' && !isAdmin
  const firstName = String((session?.user as any)?.nombre || '').split(' ')[0] || ''

  useEffect(() => { openRef.current = open }, [open])

  const fetchData = useCallback(async () => {
    if (!visible) return
    setLoading(true)
    try {
      const res  = await fetch('/api/minha-area')
      const data = await res.json()
      if (data.success) {
        const next: KoddyData = {
          meta:        data.meta,
          ventas:      data.ventas.total,
          metaUpgrade: data.metaUpgrade,
          upgrades:    data.ventas.upgrades ?? data.ventas.payments,
          month:       data.month,
          year:        data.year,
        }

        const prev = prevKd.current
        const dataChanged = !firstFetch.current && prev !== null && (
          prev.ventas   !== next.ventas ||
          prev.upgrades !== next.upgrades
        )

        setKd(next)
        prevKd.current = next
        setUpdated(new Date())
        setPulse(true)
        setTimeout(() => setPulse(false), 1200)

        if (dataChanged) {
          setChanged(true)
          setTimeout(() => setChanged(false), 4000)
          // Only notify + badge if panel is closed
          if (!openRef.current) {
            playChime()
            setUnread(n => n + 1)
          }
        }

        firstFetch.current = false
      }
    } catch {}
    setLoading(false)
  }, [visible])

  // Initial fetch + 5-min polling
  useEffect(() => {
    if (!visible) return
    fetchData()
    const iv = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [visible, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!visible) return
    const onFocus = () => fetchData()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [visible, fetchData])

  if (!visible || !kd) return null

  // ── Calculations ────────────────────────────────────────────────────────────
  const now      = new Date()
  const dim      = daysInMonth(kd.month, kd.year)
  const dayNum   = kd.month === now.getMonth() + 1 && kd.year === now.getFullYear()
    ? now.getDate() : dim
  const daysLeft = Math.max(1, dim - dayNum + 1)
  const daily    = Math.max(0, kd.meta - kd.ventas) / daysLeft

  const daysElapsed = Math.max(1, dayNum)
  const runRate     = kd.ventas / daysElapsed * dim
  const nextRun     = nextRunLevel(runRate)
  const runGap      = nextRun
    ? Math.max(0, nextRun.min * daysElapsed / dim - kd.ventas)
    : 0

  const nextUpg = nextUpgradeLevel(kd.upgrades, kd.metaUpgrade)
  const upgGap  = nextUpg
    ? Math.max(0, Math.ceil(nextUpg.pct * kd.metaUpgrade) - kd.upgrades)
    : 0

  const monthlyPct = kd.meta > 0 ? kd.ventas / kd.meta : 0
  const motivation = getMotivation(monthlyPct, dayNum, dim, firstName)

  const updatedStr = updated
    ? updated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''

  function handleOpen() {
    setOpen(o => !o)
    setUnread(0)
    setChanged(false)
  }

  return (
    <>
      <style>{`
        @keyframes koddyPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,163,255,0.5), 0 4px 24px rgba(0,0,0,0.5) }
          50%      { box-shadow:0 0 0 8px rgba(0,163,255,0), 0 4px 24px rgba(0,0,0,0.5) }
        }
        @keyframes koddySlide {
          from { opacity:0; transform:translateY(12px) scale(0.97) }
          to   { opacity:1; transform:translateY(0)   scale(1)    }
        }
        @keyframes koddyBadge {
          0%   { transform:scale(0) }
          70%  { transform:scale(1.25) }
          100% { transform:scale(1) }
        }
      `}</style>

      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>

        {/* ── Chat panel ── */}
        {open && (
          <div style={{
            width:320, maxHeight:460,
            background:'rgba(10,14,20,0.98)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:18,
            boxShadow:'0 24px 64px rgba(0,0,0,0.7)',
            display:'flex', flexDirection:'column', overflow:'hidden',
            animation:'koddySlide 0.22s ease-out',
          }}>

            {/* Header */}
            <div style={{ padding:'13px 16px', background:'rgba(0,163,255,0.08)', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
              <img src="/Koddy.jpg" alt="Koddy" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid rgba(0,163,255,0.4)' }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#E8EDF5', fontFamily:"'Inter',sans-serif" }}>Koddy</div>
                <div style={{ fontSize:9.5, color:'rgba(0,163,255,0.75)', fontFamily:"'DM Sans',sans-serif" }}>
                  {loading ? 'Atualizando...' : updatedStr ? `Atualizado às ${updatedStr}` : ''}
                </div>
              </div>
              <button onClick={handleOpen} style={{ background:'none', border:'none', color:'rgba(232,237,245,0.35)', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 14px', display:'flex', flexDirection:'column', gap:10 }}>

              {/* Motivation */}
              <Bubble>
                <span style={{ fontSize:13 }}>👋</span> {motivation}
              </Bubble>

              {/* Daily */}
              <Bubble accent="#00FFB2" highlight={changed}>
                <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(0,255,178,0.55)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Meta para hoje</div>
                {kd.ventas >= kd.meta
                  ? <div style={{ fontSize:13, fontWeight:700, color:'#00FFB2' }}>Meta mensal atingida! 🎉</div>
                  : <>
                      <div style={{ fontSize:22, fontWeight:900, color:'#00FFB2', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>{fmtUSD(daily)}</div>
                      <div style={{ fontSize:10, color:'rgba(232,237,245,0.3)', marginTop:3 }}>{daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''} no mês</div>
                    </>
                }
              </Bubble>

              {/* Run rate gap */}
              <Bubble accent="#00A3FF" highlight={changed}>
                <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(0,163,255,0.55)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>
                  Vendas · {nextRun ? `→ ${nextRun.label}` : 'Top Performance'}
                </div>
                {nextRun
                  ? <>
                      <div style={{ fontSize:18, fontWeight:800, color:'#00A3FF', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>+{fmtUSD(runGap)}</div>
                      <div style={{ fontSize:10, color:'rgba(232,237,245,0.3)', marginTop:3 }}>para o teu run rate passar para {nextRun.label}</div>
                    </>
                  : <div style={{ fontSize:13, fontWeight:700, color:'#00A3FF' }}>Run Rate em Top Performance! 🚀</div>
                }
              </Bubble>

              {/* Upgrades gap */}
              {kd.metaUpgrade > 0 && (
                <Bubble accent="#9D8FFF" highlight={changed}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(157,143,255,0.55)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>
                    Upgrades · {nextUpg ? `→ ${nextUpg.label}` : 'Top Performance'}
                  </div>
                  {nextUpg
                    ? <>
                        <div style={{ fontSize:18, fontWeight:800, color:'#9D8FFF', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>+{upgGap} upgrade{upgGap !== 1 ? 's' : ''}</div>
                        <div style={{ fontSize:10, color:'rgba(232,237,245,0.3)', marginTop:3 }}>para atingir {nextUpg.label} ({kd.upgrades}/{Math.round(kd.metaUpgrade)})</div>
                      </>
                    : <div style={{ fontSize:13, fontWeight:700, color:'#9D8FFF' }}>Upgrades no máximo! ✓</div>
                  }
                </Bubble>
              )}

            </div>

            {/* Footer */}
            <div style={{ padding:'9px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={fetchData} style={{ background:'none', border:'none', color:'rgba(232,237,245,0.25)', cursor:'pointer', fontSize:11, fontFamily:"'DM Sans',sans-serif", transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(232,237,245,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,245,0.25)'}
              >↻ Atualizar</button>
            </div>
          </div>
        )}

        {/* ── Floating button ── */}
        <div style={{ position:'relative', display:'inline-flex' }}>
          <button
            onClick={handleOpen}
            style={{
              width:56, height:56, borderRadius:'50%',
              border:'none', cursor:'pointer', padding:0, overflow:'hidden',
              animation: pulse ? 'koddyPulse 1.2s ease-out' : undefined,
              boxShadow: open
                ? '0 0 0 3px rgba(0,163,255,0.45), 0 8px 28px rgba(0,0,0,0.6)'
                : '0 4px 24px rgba(0,0,0,0.5)',
              transition:'box-shadow 0.2s',
            }}
          >
            <img src="/Koddy.jpg" alt="Koddy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </button>

          {/* Badge */}
          {unread > 0 && !open && (
            <div style={{
              position:'absolute', top:-4, right:-4,
              minWidth:20, height:20, borderRadius:10,
              background:'#FF3B30', border:'2px solid rgba(10,14,20,1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10.5, fontWeight:800, color:'#fff',
              fontFamily:"'Inter',sans-serif", lineHeight:1,
              padding:'0 4px',
              animation:'koddyBadge 0.3s cubic-bezier(0.34,1.3,0.64,1)',
              pointerEvents:'none',
            }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
