'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface ManagerCard {
  email: string; name: string; rank: string
  runRate: number; meta: number; notaEsperada: number; estado: string; pestana: string
  photoUrl?: string
}

const RANK_CFG: Record<string, { color:string; glow:string; bg:string; label:string }> = {
  'Senior+': { color:'#FFD700', glow:'rgba(255,215,0,0.38)',  bg:'rgba(255,215,0,0.09)',  label:'Senior+' },
  'Senior':  { color:'#FF6D00', glow:'rgba(255,109,0,0.28)',  bg:'rgba(255,109,0,0.08)',  label:'Senior'  },
  'Middle':  { color:'#00A3FF', glow:'rgba(0,163,255,0.25)',  bg:'rgba(0,163,255,0.07)',  label:'Middle'  },
  'Junior':  { color:'#C44DFF', glow:'rgba(196,77,255,0.25)', bg:'rgba(196,77,255,0.07)', label:'Junior'  },
}
const RANK_DEFAULT = { color:'#C44DFF', glow:'rgba(196,77,255,0.25)', bg:'rgba(196,77,255,0.07)', label:'Manager' }

function getRankCfg(rank: string) {
  const key = Object.keys(RANK_CFG).find(r => rank.toLowerCase().replace(/\s+/g,'').includes(r.toLowerCase().replace(/\s+/g,'')))
  return key ? RANK_CFG[key] : RANK_DEFAULT
}
function stripISMPrefix(name: string) { return name.replace(/^ISM\s+/i,'').trim() }
function getInitials(name: string) { return stripISMPrefix(name).split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase() }
function fileIdFromUrl(raw: string) {
  if (!raw) return ''
  const m = raw.match(/\/d\/([a-zA-Z0-9_-]+)/); if (m) return m[1]
  const m2 = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/); return m2 ? m2[1] : ''
}

interface CommissionData { pct: number; amount: number; nextThreshold: number; missingForNext: number }
interface MinhaAreaData {
  success: boolean; error?: string
  managerName: string; rank: string; reconhecimentos: number; estado: string
  runRate: number; meta: number; metaUpgrade: number
  ishikawa: { labels: string[]; values: number[]; average: number }
  comentarios: string; notaEsperada: number
  salary: {
    base: number; bonus: number; multas: number; diasExtras: number
    commission: CommissionData; total: number
  }
  ventas: { total: number; payments: number; aov: number; referrals: number; weekly: number[]; upgrades?: number }
  calls: { sysCalls: number; sysTimeSec: number; waCalls: number; waTimeSec: number; turnoCount: number }
  efficiency: {
    pct: number; avgPerClientSec: number; totalCalls: number
    sysCalls: number; sysTimeSec: number; waCalls: number; waTimeSec: number
    totalTimeSec: number; metaSec: number
  }
  month: number; year: number
}

interface ScorePoint { month: number; year: number; score: number }
interface SalesPoint  { month: number; year: number; total: number }

// ── Constants & helpers ───────────────────────────────────────────────────────
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const RANK_META: Record<string, { color: string; bg: string }> = {
  'junior':  { color:'#9D8FFF', bg:'rgba(157,143,255,0.12)' },
  'middle':  { color:'#00C2FF', bg:'rgba(0,194,255,0.12)'   },
  'senior':  { color:'#FF9640', bg:'rgba(255,150,64,0.12)'  },
  'senior+': { color:'#FFD700', bg:'rgba(255,215,0,0.12)'   },
}
function getRankMeta(rank: string) {
  const k = rank.toLowerCase().replace(/\s+/g,'')
  if (k.includes('senior+') || k.includes('senior%2B')) return RANK_META['senior+']
  if (k.includes('senior'))  return RANK_META['senior']
  if (k.includes('middle'))  return RANK_META['middle']
  if (k.includes('junior'))  return RANK_META['junior']
  return { color:'#00FFB2', bg:'rgba(0,255,178,0.1)' }
}

function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtSec(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}
function metricColor(pct: number) {
  if (pct >= 80) return '#00FFB2'
  if (pct >= 50) return '#FFB340'
  return '#FF5454'
}

// ── Loading spinner ───────────────────────────────────────────────────────────
function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, gap:10 }}>
      <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', animation:'pulse 1.2s infinite' }} />
      <span style={{ fontSize:12, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
    </div>
  )
}

// ── Status system ─────────────────────────────────────────────────────────────
const S_LABELS = ['', 'Outlier', 'Normal Average', 'High Average', 'Top Performance']
const S_COLOR: Record<number,string> = { 1:'#FF5454', 2:'#FFB340', 3:'#FFD700', 4:'#00FFB2' }
const S_BG:    Record<number,string> = { 1:'rgba(255,84,84,0.1)', 2:'rgba(255,179,64,0.1)', 3:'rgba(255,215,0,0.09)', 4:'rgba(0,255,178,0.09)' }
const MAX_PTS  = { vendas:5, upgrades:2, eficiencia:0.5, ishikawa:2.5 }

// Status is based on run rate (projected monthly), not raw sales total
function calcVentasStatus(runRate: number) { return runRate < 4000 ? 1 : runRate < 6000 ? 2 : runRate < 12000 ? 3 : 4 }
function calcUpgradeStatus(payments: number, meta: number) { if (meta<=0) return 0; const p=payments/meta; return p<.25?1:p<.5?2:p<.75?3:4 }
function calcEffStatus(pct: number)        { if (pct<=0) return 0; return pct<50?1:pct<100?2:pct<200?3:4 }
function calcIshikawaStatus(avg: number)   { if (avg<=0) return 0; return avg<70?1:avg<80?2:avg<90?3:4 }

function calcFinalScore(vs:number, us:number, es:number, is:number) {
  const metrics = [
    { s:vs, max:MAX_PTS.vendas },
    ...(us>0 ? [{s:us, max:MAX_PTS.upgrades}]   : []),
    ...(es>0 ? [{s:es, max:MAX_PTS.eficiencia}] : []),
    ...(is>0 ? [{s:is, max:MAX_PTS.ishikawa}]   : []),
  ]
  const totalMax = metrics.reduce((a,m) => a+m.max, 0)
  const raw      = metrics.reduce((a,m) => a + m.s/4*m.max, 0)
  return totalMax > 0 ? Math.round((raw / totalMax * 10) * 100) / 100 : 0
}

function getFinalAssessment(score: number) {
  if (score >= 8.5) return { label:'Excelente mês',     color:'#00FFB2', bg:'rgba(0,255,178,0.09)'  }
  if (score >= 7.0) return { label:'Bom mês',           color:'#FFD700', bg:'rgba(255,215,0,0.09)'  }
  if (score >= 5.0) return { label:'Mês médio',         color:'#FFB340', bg:'rgba(255,179,64,0.09)' }
  return               { label:'Mês para melhorar', color:'#FF5454', bg:'rgba(255,84,84,0.09)'  }
}

// ── Score history helpers ─────────────────────────────────────────────────────
function getPrev3Months(month: number, year: number) {
  return [-3, -2, -1].map(offset => {
    let m = month + offset, y = year
    if (m <= 0) { m += 12; y-- }
    return { m, y }
  })
}

function buildScorePoints(results: any[]): ScorePoint[] {
  return results
    .filter((d: any) => d?.success)
    .map((d: any): ScorePoint => {
      const vs = calcVentasStatus(d.runRate)
      const us = d.metaUpgrade > 0 ? calcUpgradeStatus(d.ventas.upgrades ?? d.ventas.payments, d.metaUpgrade) : 0
      const es = calcEffStatus(d.efficiency?.pct ?? 0)
      const is = calcIshikawaStatus(d.ishikawa.average)
      return { month: d.month, year: d.year, score: calcFinalScore(vs, us, es, is) }
    })
}

// ── Donut progress chart with shooting-star tip ───────────────────────────────
function DonutProgress({ value, max, color, size = 130, strokeWidth = 11 }: {
  value: number; max: number; color: string; size?: number; strokeWidth?: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const pct    = max > 0 ? Math.min(100, value / max * 100) : 0
  const r      = (size - strokeWidth * 2) / 2
  const cx     = size / 2, cy = size / 2
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - (mounted ? pct : 0) / 100)
  const angle  = ((mounted ? pct : 0) / 100) * 2 * Math.PI - Math.PI / 2
  const dotX   = cx + r * Math.cos(angle)
  const dotY   = cy + r * Math.sin(angle)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
      {/* Progress arc */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{
          transition:'stroke-dashoffset 1.4s cubic-bezier(0.34,1.1,0.64,1)',
          filter:`drop-shadow(0 0 5px ${color}88)`,
        }}
      />
      {/* Shooting-star dot */}
      {mounted && pct > 3 && (
        <circle cx={dotX} cy={dotY} r={strokeWidth / 2 + 1} fill={color}
          style={{ filter:`drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}99)` }}
        />
      )}
    </svg>
  )
}

// Donut with centered metric overlay
function DonutCard({ value, max, color, center, sub, size = 130, strokeWidth = 11 }: {
  value: number; max: number; color: string
  center: string; sub?: string
  size?: number; strokeWidth?: number
}) {
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <DonutProgress value={value} max={max} color={color} size={size} strokeWidth={strokeWidth} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none', gap:2 }}>
        <span style={{ fontSize:Math.round(size/7.5), fontWeight:900, color, fontFamily:"'Inter',sans-serif", lineHeight:1, textAlign:'center' }}>{center}</span>
        {sub && <span style={{ fontSize:Math.round(size/13), color:'rgba(232,237,245,0.35)', fontFamily:"'DM Sans',sans-serif", textAlign:'center' }}>{sub}</span>}
      </div>
    </div>
  )
}

// ── Pulsing glow keyframes (injected once in DocumentReport) ─────────────────
const PULSE_STYLES = `
  @keyframes pg1{0%,100%{box-shadow:0 0 4px #FF545450}50%{box-shadow:0 0 12px #FF5454,0 0 20px #FF545430}}
  @keyframes pg2{0%,100%{box-shadow:0 0 4px #FFB34050}50%{box-shadow:0 0 12px #FFB340,0 0 20px #FFB34030}}
  @keyframes pg3{0%,100%{box-shadow:0 0 4px #FFD70050}50%{box-shadow:0 0 12px #FFD700,0 0 20px #FFD70030}}
  @keyframes pg4{0%,100%{box-shadow:0 0 4px #00FFB250}50%{box-shadow:0 0 12px #00FFB2,0 0 20px #00FFB230}}
`

// ── Status scale (horizontal chips) ──────────────────────────────────────────
function StatusScale({ current }: { current: number }) {
  return (
    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
      {[1,2,3,4].map(i => {
        const active = current === i
        const col    = S_COLOR[i]
        return (
          <span key={i} style={{
            padding:'3px 9px', borderRadius:4, fontSize:10, fontWeight:active?700:400,
            color: active ? col : 'rgba(232,237,245,0.2)',
            background: active ? S_BG[i] : 'transparent',
            border:`1px solid ${active ? col+'40' : 'rgba(255,255,255,0.06)'}`,
            fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap',
            animation: active ? `pg${i} 2s ease-in-out infinite` : undefined,
          }}>{S_LABELS[i]}</span>
        )
      })}
    </div>
  )
}

function SBadge({ pts }: { pts: number }) {
  if (!pts) return <span style={{ display:'inline-block', minWidth:108, textAlign:'center', color:'rgba(232,237,245,0.2)', fontSize:10 }}>—</span>
  const col = S_COLOR[pts]
  return (
    <span style={{ display:'inline-block', minWidth:108, textAlign:'center', padding:'2px 8px', borderRadius:4, background:S_BG[pts], border:`1px solid ${col}35`,
      fontSize:9.5, fontWeight:700, color:col, fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
      {S_LABELS[pts]}
    </span>
  )
}

// ── Colored section wrapper ────────────────────────────────────────────────────
function Section({ num, title, accent, status, children }: {
  num: string; title: string; accent: string; status: number; children: React.ReactNode
}) {
  return (
    <div style={{ marginTop:8, position:'relative' }}>
      <div style={{ height:1, background:`linear-gradient(90deg, ${accent}30, transparent)`, marginBottom:20 }} />
      <div style={{ position:'absolute', left:0, top:21, bottom:0, width:3, borderRadius:2, background:`linear-gradient(180deg, ${accent}, ${accent}00)` }} />
      <div style={{ paddingLeft:18 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:9, fontWeight:700, color:`${accent}60`, letterSpacing:'0.18em', fontFamily:"'Inter',sans-serif" }}>{num}</span>
            <span style={{ fontSize:13, fontWeight:800, color:accent, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'Inter',sans-serif" }}>{title}</span>
          </div>
          {status > 0 && (
            <span style={{ padding:'5px 16px', borderRadius:6, background:S_BG[status], border:`1px solid ${S_COLOR[status]}40`,
              fontSize:11, fontWeight:700, color:S_COLOR[status], fontFamily:"'Inter',sans-serif", letterSpacing:'0.04em', textTransform:'uppercase' }}>
              {S_LABELS[status]}
            </span>
          )}
        </div>
        {status > 0 && <div style={{ marginBottom:16 }}><StatusScale current={status} /></div>}
        {children}
      </div>
    </div>
  )
}

// ── StatCell ──────────────────────────────────────────────────────────────────
function StatCell({ label, value, sub, color }: { label:string; value:string; sub?:string; color?:string }) {
  return (
    <div style={{ padding:'12px 14px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontSize:9.5, color:'rgba(232,237,245,0.3)', fontFamily:"'DM Sans',sans-serif", marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:800, color: color ?? 'var(--text)', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:'rgba(232,237,245,0.3)', fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>{sub}</div>}
    </div>
  )
}

// ── Weekly vendas table ───────────────────────────────────────────────────────
function WeeklyTable({ weekly, meta }: { weekly: number[]; meta: number }) {
  const weekMeta = Math.floor(meta / 4)
  const total    = weekly.reduce((a,v) => a+v, 0)
  const rows = [
    { label:'Total',  meta, val:total },
    ...weekly.map((v,i) => ({ label:`Semana ${i+1}`, meta: i<3 ? weekMeta : meta - 3*weekMeta, val:v }))
  ]
  const td: React.CSSProperties = { padding:'7px 10px', fontFamily:"'Inter',sans-serif", fontSize:12, borderBottom:'1px solid rgba(255,255,255,0.04)' }
  return (
    <div style={{ overflowX:'auto', marginTop:16 }}>
      <table style={{ borderCollapse:'collapse', width:'100%', minWidth:340 }}>
        <thead>
          <tr>
            {['','Meta','Avanço','Progresso'].map(h => (
              <th key={h} style={{ ...td, textAlign:h===''?'left':'right', fontSize:9.5, color:'rgba(232,237,245,0.25)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'5px 10px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const pct = r.meta > 0 ? (r.val / r.meta) * 100 : 0
            const col = pct > 0 ? metricColor(pct) : 'rgba(232,237,245,0.15)'
            const isTotal = i === 0
            return (
              <tr key={i} style={{ background: isTotal ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                <td style={{ ...td, color:isTotal?'var(--text)':'rgba(232,237,245,0.45)', fontWeight:isTotal?700:400 }}>{r.label}</td>
                <td style={{ ...td, textAlign:'right', color:'rgba(232,237,245,0.3)' }}>{fmtUSD(r.meta)}</td>
                <td style={{ ...td, textAlign:'right', color:r.val>0?'rgba(232,237,245,0.8)':'rgba(232,237,245,0.18)', fontWeight:isTotal?700:400 }}>{r.val > 0 ? fmtUSD(r.val) : '—'}</td>
                <td style={{ ...td, textAlign:'right', color:col, fontWeight:isTotal?700:400 }}>{r.val > 0 ? `${pct.toFixed(2)}%` : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Sales history chart ───────────────────────────────────────────────────────
function SalesHistoryChart({ points, currentMonth, currentYear }: {
  points: SalesPoint[]; currentMonth: number; currentYear: number
}) {
  if (points.length < 1) return null

  const VW = 800, PX = 48, PT = 36, PB = 28, IH = 82
  const H  = PT + IH + PB
  const innerW = VW - PX * 2

  const totals = points.map(p => p.total)
  const maxT   = Math.max(...totals) * 1.18
  const xOf    = (i: number) => PX + (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2)
  const yOf    = (t: number) => PT + IH * (1 - t / maxT)
  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(p.total).toFixed(1)}`
  ).join(' ')

  function fmtK(n: number) {
    return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n.toFixed(0)
  }
  const fs = points.length > 7 ? 8.5 : 10

  return (
    <div style={{ marginBottom:28, width:'100%' }}>
      <div style={{ fontSize:9, fontWeight:700, color:'rgba(232,237,245,0.18)', letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", marginBottom:10, textAlign:'center' }}>Evolução de Vendas</div>
      <svg width="100%" viewBox={`0 0 ${VW} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <defs>
          <linearGradient id="sfg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,255,178,0.14)" />
            <stop offset="100%" stopColor="rgba(0,255,178,0)" />
          </linearGradient>
        </defs>
        <path d={`${linePath} L${xOf(points.length-1).toFixed(1)},${(PT+IH).toFixed(1)} L${xOf(0).toFixed(1)},${(PT+IH).toFixed(1)} Z`} fill="url(#sfg)" />
        <path d={linePath} fill="none" stroke="rgba(0,255,178,0.3)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isCurrent = p.month === currentMonth && p.year === currentYear
          const px = xOf(i), py = yOf(p.total)
          const lbl = `${MONTHS_PT[p.month - 1].slice(0, 3)}${p.month === 1 ? ' \'' + String(p.year).slice(2) : ''}`
          return (
            <g key={i}>
              <text x={px} y={py - 11} textAnchor="middle"
                fontSize={isCurrent ? fs + 1.5 : fs} fontWeight={isCurrent ? 800 : 500}
                fill={isCurrent ? '#00FFB2' : 'rgba(0,255,178,0.6)'}
                fontFamily="'Inter',sans-serif">{fmtK(p.total)}</text>
              <circle cx={px} cy={py} r={isCurrent ? 6 : 3.5}
                fill={isCurrent ? '#00FFB2' : 'rgba(0,255,178,0.45)'}
                style={isCurrent ? { filter:'drop-shadow(0 0 7px #00FFB290)' } : {}} />
              <text x={px} y={H - 4} textAnchor="middle" fontSize={fs}
                fill={isCurrent ? 'rgba(232,237,245,0.55)' : 'rgba(232,237,245,0.27)'}
                fontFamily="'DM Sans',sans-serif">{lbl}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Score evolution sparkline ─────────────────────────────────────────────────
function ScoreSparkline({ history, score, month, year }: {
  history: ScorePoint[]; score: number; month: number; year: number
}) {
  const pts = [...history, { month, year, score }]
  if (pts.length < 2) return null

  const VW = 800, PX = 52, PT = 28, PB = 24, IH = 50
  const H = PT + IH + PB
  const innerW = VW - PX * 2
  const scores = pts.map(p => p.score)
  const minS = Math.max(0, Math.min(...scores) - 1.5)
  const maxS = Math.min(10, Math.max(...scores) + 1.5)
  const range = Math.max(maxS - minS, 0.01)
  const xOf = (i: number) => PX + (pts.length > 1 ? (i / (pts.length - 1)) * innerW : innerW / 2)
  const yOf = (s: number) => PT + IH * (1 - (s - minS) / range)
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(p.score).toFixed(1)}`).join(' ')

  return (
    <div style={{ marginBottom:24, width:'100%' }}>
      <div style={{ fontSize:9, fontWeight:700, color:'rgba(232,237,245,0.18)', letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", marginBottom:10, textAlign:'center' }}>Evolução de Nota</div>
      <svg width="100%" viewBox={`0 0 ${VW} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path d={`${linePath} L${xOf(pts.length-1).toFixed(1)},${(PT+IH).toFixed(1)} L${xOf(0).toFixed(1)},${(PT+IH).toFixed(1)} Z`} fill="url(#sg)" />
        <path d={linePath} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const isCurrent = i === pts.length - 1
          const col = getFinalAssessment(p.score).color
          const px = xOf(i), py = yOf(p.score)
          const lbl = `${MONTHS_PT[p.month - 1].slice(0, 3)}${p.year !== year ? ' \'' + String(p.year).slice(2) : ''}`
          const scoreLabel = parseFloat(p.score.toFixed(2)).toString()
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={isCurrent ? 6 : 4}
                fill={isCurrent ? col : `${col}60`}
                style={isCurrent ? { filter:`drop-shadow(0 0 7px ${col}90)` } : {}} />
              <text x={px} y={py - 12} textAnchor="middle"
                fontSize={isCurrent ? 13 : 11} fontWeight={isCurrent ? 800 : 600}
                fill={isCurrent ? col : `${col}AA`} fontFamily="'Inter',sans-serif">{scoreLabel}</text>
              <text x={px} y={H - 2} textAnchor="middle" fontSize={11}
                fill={isCurrent ? 'rgba(232,237,245,0.5)' : 'rgba(232,237,245,0.27)'}
                fontFamily="'DM Sans',sans-serif">{lbl}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Manager photo circle ──────────────────────────────────────────────────────
function ManagerPhotoCircle({ url, name, size = 60 }: { url: string; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  const id  = fileIdFromUrl(url)
  const src = id ? `/api/photo?id=${id}` : ''
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'2px solid rgba(0,255,178,0.3)', boxShadow:'0 0 18px rgba(0,255,178,0.18)' }}>
      {src && !err
        ? <img src={src} alt={name} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,rgba(0,255,178,0.2),rgba(0,194,255,0.1))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:800, color:'var(--accent)', fontFamily:"'Inter',sans-serif" }}>{getInitials(name)}</div>
      }
    </div>
  )
}

// ── Nav button style ──────────────────────────────────────────────────────────
const navBtn: React.CSSProperties = {
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:8, padding:'5px 11px', color:'rgba(232,237,245,0.6)', cursor:'pointer', fontSize:13,
  transition:'background 0.15s',
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function DocumentReport({ data, email, photoUrl, month, year, onPrev, onNext, isCurrentMonth, scoreHistory = [], salesHistory = [] }: {
  data: MinhaAreaData; email?: string; photoUrl?: string; month: number; year: number
  onPrev: () => void; onNext: () => void; isCurrentMonth: boolean
  scoreHistory?: ScorePoint[]; salesHistory?: SalesPoint[]
}) {
  const rankMeta   = getRankMeta(data.rank)
  const effPct     = data.efficiency?.pct ?? 0
  const totalCalls = (data.calls.sysCalls + data.calls.waCalls) || data.efficiency?.totalCalls || 0

  // Status calculations
  const vs       = calcVentasStatus(data.runRate)          // based on run rate
  const upgrCount = data.ventas.upgrades ?? data.ventas.payments
  const us        = data.metaUpgrade > 0 ? calcUpgradeStatus(upgrCount, data.metaUpgrade) : 0
  const es = calcEffStatus(effPct)
  const is = calcIshikawaStatus(data.ishikawa.average)

  const score      = calcFinalScore(vs, us, es, is)
  const assessment = getFinalAssessment(score)

  const hasUpgrades = data.metaUpgrade > 0
  const secNum = (n: number) => String(n).padStart(2, '0')

  type ScoreRow = { label:string; st:number; max:number }
  const scoreRows: ScoreRow[] = [
    { label:'Vendas',                st:vs, max:MAX_PTS.vendas     },
    ...(hasUpgrades ? [{ label:'Upgrades para PRM',   st:us, max:MAX_PTS.upgrades   }] : []),
    { label:'Eficiência em ligação', st:es, max:MAX_PTS.eficiencia },
    ...(is > 0      ? [{ label:'Qualidade - Ishikawa',st:is, max:MAX_PTS.ishikawa   }] : []),
  ]
  const maxShown = scoreRows.reduce((a,r) => a+r.max, 0)

  const salesPct = data.meta > 0 ? (data.ventas.total / data.meta) * 100 : 0

  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>
      <style>{PULSE_STYLES}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {photoUrl && <ManagerPhotoCircle url={photoUrl} name={data.managerName} size={64} />}
          <div>
            <div style={{ fontSize:8.5, fontWeight:700, color:'rgba(232,237,245,0.15)', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", marginBottom:8 }}>ISM Platform · Relatório de Performance</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text)', margin:0, fontFamily:"'Inter',sans-serif" }}>{stripISMPrefix(data.managerName)}</h2>
              <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, color:rankMeta.color, background:rankMeta.bg, border:`1px solid ${rankMeta.color}40`, fontFamily:"'Inter',sans-serif" }}>{data.rank}</span>
              {data.estado && <span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, color:'rgba(232,237,245,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', fontFamily:"'Inter',sans-serif" }}>{data.estado}</span>}
            </div>
            {email && (
              <div style={{ fontSize:11, color:'rgba(232,237,245,0.3)', fontFamily:"'DM Sans',sans-serif" }}>{email}</div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={onPrev} style={navBtn}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}>‹</button>
          <div style={{ padding:'6px 16px', background:'rgba(0,255,178,0.06)', border:'1px solid rgba(0,255,178,0.15)', borderRadius:9, minWidth:136, textAlign:'center' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--accent)', fontFamily:"'Inter',sans-serif" }}>{MONTHS_PT[month-1]} {year}</span>
          </div>
          <button onClick={onNext} disabled={isCurrentMonth} style={{ ...navBtn, color:isCurrentMonth?'rgba(232,237,245,0.2)':'rgba(232,237,245,0.6)', cursor:isCurrentMonth?'default':'pointer' }}
            onMouseEnter={e=>{ if(!isCurrentMonth) e.currentTarget.style.background='rgba(255,255,255,0.1)' }}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}>›</button>
        </div>
      </div>

      {/* ── Sections container ─────────────────────────────────────────── */}
      <div style={{ background:'rgba(12,17,26,0.98)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'28px 28px 32px' }}>

        {/* ── Sales evolution chart ──────────────────────────────────── */}
        {salesHistory.length > 0 && (
          <SalesHistoryChart points={salesHistory} currentMonth={month} currentYear={year} />
        )}

        {/* ── 01 VENDAS ────────────────────────────────── accent: #00FFB2 */}
        <Section num={secNum(1)} title="Vendas" accent="#00FFB2" status={vs}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
            <DonutCard
              value={data.ventas.total} max={data.meta} color="#00FFB2"
              center={fmtUSD(data.ventas.total)}
              sub={`de ${fmtUSD(data.meta)}`}
              size={144} strokeWidth={8}
            />
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <StatCell label="Venda Total"    value={fmtUSD(data.ventas.total)} color="#00FFB2" />
                <StatCell label="Meta"           value={fmtUSD(data.meta)} />
                <StatCell label="Nº Pagamentos"  value={String(data.ventas.payments)} color="#00C2FF" />
                <StatCell label="AOV"            value={data.ventas.payments>0 ? fmtUSD(data.ventas.aov) : '—'} color="#9D8FFF" />
              </div>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <div style={{ padding:'8px 14px', borderRadius:8, background:'rgba(0,255,178,0.05)', border:'1px solid rgba(0,255,178,0.12)' }}>
                  <div style={{ fontSize:9.5, color:'rgba(232,237,245,0.3)', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Run Rate</div>
                  <div style={{ fontSize:16, fontWeight:800, color:S_COLOR[vs], fontFamily:"'Inter',sans-serif" }}>{fmtUSD(data.runRate)}</div>
                </div>
              </div>
            </div>
          </div>
          <WeeklyTable weekly={data.ventas.weekly} meta={data.meta} />
          <div style={{ fontSize:11, color:'rgba(232,237,245,0.25)', fontFamily:"'DM Sans',sans-serif", marginTop:10 }}>
            Progresso: {salesPct.toFixed(1)}% da meta
          </div>
        </Section>

        {/* ── 02 UPGRADES ─────────────────────────────── accent: #00A3FF */}
        {hasUpgrades && (
          <Section num={secNum(2)} title="Upgrades para PRM" accent="#00A3FF" status={us}>
            <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
              <DonutCard
                value={upgrCount} max={data.metaUpgrade} color="#00A3FF"
                center={String(upgrCount)}
                sub={`de ${Math.round(data.metaUpgrade)}`}
                size={144} strokeWidth={8}
              />
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <StatCell label="Upgrades (PRM + IND)" value={String(upgrCount)} color={us>0?S_COLOR[us]:'rgba(232,237,245,0.4)'} />
                  <StatCell label="Meta"                  value={String(Math.round(data.metaUpgrade))} />
                  <StatCell label="Progresso"             value={data.metaUpgrade>0 ? `${(upgrCount/data.metaUpgrade*100).toFixed(1)}%` : '—'} color={us>0?S_COLOR[us]:'rgba(232,237,245,0.4)'} />
                  <StatCell label="Indicações" value={String(data.ventas.referrals)} color="#C44DFF" sub="extra · não conta na nota" />
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ── 03/02 EFICIÊNCIA ─────────────────────────── accent: #FF9640 */}
        <Section num={secNum(hasUpgrades ? 3 : 2)} title="Eficiência em Ligação" accent="#FF9640" status={es}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
            <DonutCard
              value={effPct} max={200} color="#FF9640"
              center={effPct > 0 ? `${effPct.toFixed(0)}%` : '—'}
              sub="eficiência"
              size={144} strokeWidth={8}
            />
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <StatCell label="Eficiência"          value={effPct > 0 ? `${effPct.toFixed(1)}%` : '—'} color={es>0?S_COLOR[es]:'rgba(232,237,245,0.4)'} />
                <StatCell label="Tempo Total"         value={fmtSec(data.calls.sysTimeSec + data.calls.waTimeSec)} />
                <StatCell label="Nº Ligações"         value={String(totalCalls)} />
                <StatCell label="Média por Cliente"   value={fmtSec(data.efficiency?.avgPerClientSec ?? 0)} color="#00C2FF"
                  sub={`meta: ${fmtSec(data.efficiency?.metaSec ?? 60)}/cliente`} />
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
            {[
              { l:'Callgear', time:data.calls.sysTimeSec, calls:data.calls.sysCalls, col:'#00C2FF' },
              { l:'WhatsApp', time:data.calls.waTimeSec,  calls:data.calls.waCalls,  col:'#25D366' },
            ].map(r => (
              <div key={r.l} style={{ padding:'14px 16px', borderRadius:9, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:10, fontWeight:700, color:r.col, fontFamily:"'Inter',sans-serif", marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>{r.l}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:r.col, fontFamily:"'Inter',sans-serif" }}>{fmtSec(r.time)}</div>
                    <div style={{ fontSize:9, color:'rgba(232,237,245,0.25)', marginTop:2 }}>Tempo</div>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'rgba(232,237,245,0.65)', fontFamily:"'Inter',sans-serif" }}>{r.calls}</div>
                    <div style={{ fontSize:9, color:'rgba(232,237,245,0.25)', marginTop:2 }}>Ligações</div>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'rgba(232,237,245,0.45)', fontFamily:"'Inter',sans-serif" }}>{r.calls>0?fmtSec(Math.round(r.time/r.calls)):'—'}</div>
                    <div style={{ fontSize:9, color:'rgba(232,237,245,0.25)', marginTop:2 }}>Média/lig.</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 04/03 ISHIKAWA ──────────────────────────── accent: #9D8FFF */}
        <Section num={secNum(hasUpgrades ? 4 : 3)} title="Qualidade - Ishikawa" accent="#9D8FFF" status={is}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
            <DonutCard
              value={data.ishikawa.average} max={100} color="#9D8FFF"
              center={data.ishikawa.average > 0 ? `${data.ishikawa.average.toFixed(0)}%` : '—'}
              sub="qualidade"
              size={144} strokeWidth={8}
            />
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <StatCell label="Média Ishikawa" value={data.ishikawa.average>0 ? `${data.ishikawa.average.toFixed(2)}%` : '—'} color={is>0?S_COLOR[is]:'rgba(232,237,245,0.4)'} />
                <StatCell label="Meta" value="100%" />
              </div>
              <table style={{ borderCollapse:'collapse', width:'100%' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'4px 8px', textAlign:'left', fontSize:9, color:'rgba(232,237,245,0.2)', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:"'Inter',sans-serif", borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Critério</th>
                    <th style={{ padding:'4px 8px', textAlign:'right', fontSize:9, color:'rgba(232,237,245,0.2)', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:"'Inter',sans-serif", borderBottom:'1px solid rgba(255,255,255,0.07)' }}>Pontuação</th>
                    <th style={{ padding:'4px 8px', width:80, borderBottom:'1px solid rgba(255,255,255,0.07)' }} />
                  </tr>
                </thead>
                <tbody>
                  {data.ishikawa.labels.map((label, i) => {
                    const v = data.ishikawa.values[i]
                    const col = metricColor(v)
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding:'6px 8px', fontSize:11.5, color:'rgba(232,237,245,0.65)', fontFamily:"'DM Sans',sans-serif" }}>
                          <span style={{ fontSize:9.5, color:'rgba(232,237,245,0.25)', marginRight:6, fontFamily:"'Inter',sans-serif" }}>Espinha {i+1}</span>
                          {label}
                        </td>
                        <td style={{ padding:'6px 8px', textAlign:'right', fontSize:12, fontWeight:700, color:v>0?col:'rgba(232,237,245,0.18)', fontFamily:"'Inter',sans-serif" }}>{v>0?`${v.toFixed(0)}%`:'—'}</td>
                        <td style={{ padding:'6px 8px' }}>
                          {v > 0 && (
                            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:2, height:4, overflow:'hidden' }}>
                              <div style={{ width:`${v}%`, height:'100%', background:col, borderRadius:2 }} />
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ── PONTUAÇÃO FINAL ─────────────────────────────────────────── */}
        <div style={{ marginTop:8 }}>
          <div style={{ height:1, background:'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)', marginBottom:24 }} />

          {/* Score evolution */}
          {scoreHistory.length > 0 && (
            <ScoreSparkline history={scoreHistory} score={score} month={month} year={year} />
          )}

          {/* Assessment legend */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'rgba(232,237,245,0.2)', letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", marginBottom:12 }}>Avaliação Mensal</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[
                { label:'Mês para melhorar', range:'< 5',      col:'#FF5454', bg:'rgba(255,84,84,0.08)'  },
                { label:'Mês médio',         range:'5 – 7',    col:'#FFB340', bg:'rgba(255,179,64,0.08)' },
                { label:'Bom mês',           range:'7 – 8.5',  col:'#FFD700', bg:'rgba(255,215,0,0.08)'  },
                { label:'Excelente mês',     range:'≥ 8.5',    col:'#00FFB2', bg:'rgba(0,255,178,0.08)'  },
              ].map(a => {
                const active = a.label === assessment.label
                return (
                  <div key={a.label} style={{
                    flex:1, minWidth:130, padding:'12px 14px', borderRadius:9,
                    background: active ? a.bg : 'rgba(255,255,255,0.02)',
                    border:`1px solid ${active ? a.col+'55' : 'rgba(255,255,255,0.06)'}`,
                    transition:'all 0.2s',
                  }}>
                    <div style={{ fontSize:13, fontWeight:active?800:400, color:active?a.col:'rgba(232,237,245,0.3)', fontFamily:"'Inter',sans-serif", marginBottom:3 }}>{a.label}</div>
                    <div style={{ fontSize:11, color:active?`${a.col}99`:'rgba(232,237,245,0.18)', fontFamily:"'Inter',sans-serif" }}>{a.range}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scoring table + final score */}
          <div style={{ display:'flex', gap:10, alignItems:'stretch', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:300 }}>
              <table style={{ borderCollapse:'collapse', width:'100%' }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,0.025)' }}>
                    {['Partes avaliadas','Status','Pts máx.','Peso','Pts obtidos','Progresso',''].map((h,i) => (
                      <th key={h+i} style={{ padding:'8px 8px', textAlign:i===0?'left':'center', fontSize:9, color:'rgba(232,237,245,0.35)', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", borderBottom:'1px solid rgba(255,255,255,0.08)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scoreRows.map((r, i) => {
                    const pts      = Math.round(r.st / 4 * r.max * 100) / 100
                    const prog     = r.st / 4 * 100
                    const col      = r.st > 0 ? S_COLOR[r.st] : 'rgba(232,237,245,0.22)'
                    const colSoft  = r.st > 0 ? `${S_COLOR[r.st]}AA` : 'rgba(232,237,245,0.22)'
                    const barFill  = r.st > 0 ? `${S_COLOR[r.st]}70` : 'rgba(255,255,255,0.07)'
                    const weight   = Math.round(r.max / 10 * 100)
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding:'9px 8px', verticalAlign:'middle' }}>
                          <span style={{ fontSize:12, color:'rgba(232,237,245,0.7)', fontFamily:"'DM Sans',sans-serif" }}>{r.label}</span>
                        </td>
                        <td style={{ padding:'9px 8px', textAlign:'center', verticalAlign:'middle' }}>
                          <SBadge pts={r.st} />
                        </td>
                        <td style={{ padding:'9px 8px', textAlign:'center', fontSize:12, fontWeight:600, color:'rgba(232,237,245,0.45)', fontFamily:"'Inter',sans-serif", verticalAlign:'middle', whiteSpace:'nowrap' }}>{r.max}</td>
                        <td style={{ padding:'9px 8px', textAlign:'center', fontSize:12, fontWeight:600, color:'rgba(232,237,245,0.45)', fontFamily:"'Inter',sans-serif", verticalAlign:'middle', whiteSpace:'nowrap' }}>{weight}%</td>
                        <td style={{ padding:'9px 8px', textAlign:'center', fontSize:12, fontWeight:700, color:colSoft, fontFamily:"'Inter',sans-serif", verticalAlign:'middle', whiteSpace:'nowrap' }}>{pts.toFixed(2)}</td>
                        <td style={{ padding:'9px 8px', width:100, verticalAlign:'middle' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <div style={{ flex:1, background:'rgba(255,255,255,0.07)', borderRadius:3, height:4, overflow:'hidden' }}>
                              <div style={{ width:`${prog}%`, height:'100%', background:barFill, borderRadius:3 }} />
                            </div>
                            <span style={{ fontSize:12, fontWeight:600, color:colSoft, width:32, textAlign:'right', fontFamily:"'Inter',sans-serif", flexShrink:0 }}>{prog.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:'9px 2px 9px 0', textAlign:'center', verticalAlign:'middle', fontSize:10, color:`${col}45`, letterSpacing:-1 }}>›</td>
                      </tr>
                    )
                  })}
                  <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'9px 8px', fontSize:12, fontWeight:700, color:'rgba(232,237,245,0.55)', fontFamily:"'Inter',sans-serif", verticalAlign:'middle' }}>TOTAL</td>
                    <td />
                    <td style={{ padding:'9px 8px', textAlign:'center', fontSize:12, fontWeight:600, color:'rgba(232,237,245,0.35)', fontFamily:"'Inter',sans-serif", verticalAlign:'middle' }}>{maxShown.toFixed(1)}</td>
                    <td style={{ padding:'9px 8px', textAlign:'center', fontSize:12, fontWeight:600, color:'rgba(232,237,245,0.35)', fontFamily:"'Inter',sans-serif", verticalAlign:'middle' }}>100%</td>
                    <td style={{ padding:'9px 8px', textAlign:'center', fontSize:14, fontWeight:900, color:`${assessment.color}CC`, fontFamily:"'Inter',sans-serif", verticalAlign:'middle' }}>{parseFloat(score.toFixed(2)).toString()}</td>
                    <td style={{ padding:'9px 8px', width:100, verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ flex:1, background:'rgba(255,255,255,0.07)', borderRadius:3, height:4, overflow:'hidden' }}>
                          <div style={{ width:`${Math.min(100, score / 10 * 100)}%`, height:'100%', background:`${assessment.color}70`, borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:`${assessment.color}CC`, width:32, textAlign:'right', fontFamily:"'Inter',sans-serif", flexShrink:0 }}>{(score / 10 * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Final score box — compact */}
            <div style={{ padding:'12px 16px', borderRadius:12, background:assessment.bg, border:`1px solid ${assessment.color}35`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, minWidth:90 }}>
              <div style={{ fontSize:9, fontWeight:700, color:`${assessment.color}70`, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>Nota</div>
              <div style={{ fontSize:26, fontWeight:900, color:assessment.color, fontFamily:"'Inter',sans-serif", lineHeight:1 }}>{parseFloat(score.toFixed(2)).toString()}</div>
              <div style={{ fontSize:9.5, fontWeight:700, color:`${assessment.color}CC`, fontFamily:"'Inter',sans-serif", textAlign:'center', lineHeight:1.3 }}>{assessment.label}</div>
            </div>
          </div>
        </div>

        {/* ── Comentários ───────────────────────────────────────────────── */}
        {data.comentarios && (
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(168,85,247,0.5)', letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", marginBottom:12 }}>Comentários</div>
            <div style={{ fontSize:13, color:'rgba(232,237,245,0.6)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.8, padding:'12px 18px', borderLeft:'2px solid rgba(168,85,247,0.3)', background:'rgba(168,85,247,0.04)', borderRadius:'0 8px 8px 0' }}>
              {data.comentarios}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — Manager Grid
// ═══════════════════════════════════════════════════════════════════════════════
function AdminAvatar({ name, photoUrl, size, color }: { name:string; photoUrl:string; size:number; color:string }) {
  const [err, setErr] = useState(false)
  const id  = fileIdFromUrl(photoUrl)
  const url = id ? `/api/photo?id=${id}` : ''
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:`2px solid ${color}50`, boxShadow:`0 0 14px ${color}40` }}>
      {url && !err
        ? <img src={url} alt={name} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${color}20,${color}10)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:800, color, fontFamily:"'Inter',sans-serif" }}>{getInitials(name)}</div>
      }
    </div>
  )
}

function AdminManagerCard({ m, onSelect }: { m: ManagerCard; onSelect: (m: ManagerCard) => void }) {
  const [hov, setHov] = useState(false)
  const cfg  = getRankCfg(m.rank)
  const name = stripISMPrefix(m.name) || m.email
  return (
    <div onClick={() => onSelect(m)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width:192, cursor:'pointer',
        background:'rgba(9,13,19,0.98)',
        border:`1px solid ${cfg.color}${hov ? '55' : '22'}`,
        borderRadius:16,
        boxShadow: hov ? `0 0 28px ${cfg.glow}` : '0 4px 18px rgba(0,0,0,0.45)',
        padding:'20px 14px 18px',
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        transition:'box-shadow 0.25s, border-color 0.25s, transform 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
      }}
    >
      <AdminAvatar name={m.name} photoUrl={m.photoUrl ?? ''} size={72} color={cfg.color} />
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:13.5, fontWeight:800, color:'#E8EDF5', lineHeight:1.3, fontFamily:"'Inter',sans-serif", marginBottom:6 }}>{name}</div>
        <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, background:cfg.bg, border:`1px solid ${cfg.color}40`, fontSize:9.5, fontWeight:700, color:cfg.color, letterSpacing:'0.05em', fontFamily:"'Inter',sans-serif" }}>
          {cfg.label.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

function ManagerGrid({ managers, onSelect }: { managers: ManagerCard[]; onSelect: (m: ManagerCard) => void }) {
  const RANK_ORDER = ['Senior+','Senior','Middle','Junior']
  const grouped = RANK_ORDER.map(rank => ({
    rank, cfg: RANK_CFG[rank] ?? RANK_DEFAULT,
    items: managers.filter(m => getRankCfg(m.rank).label === (RANK_CFG[rank]?.label ?? rank)),
  })).filter(g => g.items.length > 0)
  const known  = new Set(grouped.flatMap(g => g.items.map(m => m.email)))
  const others = managers.filter(m => !known.has(m.email))
  const ICONS: Record<string, string> = { 'Senior+':'⭐', 'Senior':'🔥', 'Middle':'💧', 'Junior':'✨' }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
      {grouped.map(g => (
        <div key={g.rank}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <span style={{ fontSize:13 }}>{ICONS[g.rank] ?? '•'}</span>
            <span style={{ fontSize:10, letterSpacing:'0.08em', color:`${g.cfg.color}85`, textTransform:'uppercase', fontFamily:"'Inter',sans-serif", fontWeight:700 }}>{g.cfg.label}</span>
            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:"'Inter',sans-serif" }}>{g.items.length} {g.items.length === 1 ? 'manager' : 'managers'}</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {g.items.map(m => <AdminManagerCard key={m.email} m={m} onSelect={onSelect} />)}
          </div>
        </div>
      ))}
      {others.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <span style={{ fontSize:10, letterSpacing:'0.08em', color:'rgba(232,237,245,0.35)', textTransform:'uppercase', fontFamily:"'Inter',sans-serif", fontWeight:700 }}>Outros</span>
            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.05)' }} />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {others.map(m => <AdminManagerCard key={m.email} m={m} onSelect={onSelect} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MinhaAreaPage() {
  const { data: session, status } = useSession()
  const sessionLoading = status === 'loading'
  const now    = new Date()
  const isAdmin = (session?.user as any)?.isAdmin ?? false

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())

  const [data,    setData]    = useState<MinhaAreaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const [managers,        setManagers]        = useState<ManagerCard[]>([])
  const [managersLoading, setManagersLoading] = useState(false)
  const [managersError,   setManagersError]   = useState('')
  const [selectedManager, setSelectedManager] = useState<ManagerCard | null>(null)
  const [managerData,     setManagerData]     = useState<MinhaAreaData | null>(null)
  const [managerLoading,  setManagerLoading]  = useState(false)
  const [adminMonth,      setAdminMonth]      = useState(now.getMonth() + 1)
  const [adminYear,       setAdminYear]       = useState(now.getFullYear())
  const [userScoreHistory,  setUserScoreHistory]  = useState<ScorePoint[]>([])
  const [adminScoreHistory, setAdminScoreHistory] = useState<ScorePoint[]>([])
  const [userSalesHistory,  setUserSalesHistory]  = useState<SalesPoint[]>([])
  const [adminSalesHistory, setAdminSalesHistory] = useState<SalesPoint[]>([])

  useEffect(() => {
    if (isAdmin || sessionLoading) return
    setLoading(true); setError('')
    fetch(`/api/minha-area?month=${month}&year=${year}`)
      .then(r => r.json())
      .then(d => { if (!d.success) { setError(d.error || 'Erro ao carregar'); setData(null) } else setData(d) })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [month, year, isAdmin, sessionLoading])

  useEffect(() => {
    if (!isAdmin || managers.length > 0) return
    setManagersLoading(true); setManagersError('')
    Promise.all([
      fetch('/api/minha-area?action=managers').then(r => r.json()),
      fetch('/api/managers').then(r => r.json()).catch(() => []),
    ]).then(([boardsData, teamData]) => {
      if (!boardsData.success) { setManagersError(boardsData.error || 'Erro ao carregar managers'); return }
      const team: any[] = Array.isArray(teamData) ? teamData : []
      const enriched = (boardsData.managers ?? []).map((m: ManagerCard) => {
        const bName  = stripISMPrefix(m.name).toLowerCase()
        const bFirst = bName.split(/\s+/)[0]
        const match  = team.find((t: any) => {
          const tName  = stripISMPrefix(String(t.name || '')).toLowerCase()
          if (tName === bName) return true
          const tFirst = tName.split(/\s+/)[0]
          return bFirst.length >= 5 && tFirst === bFirst
        })
        return { ...m, photoUrl: match?.photoUrl ?? '' }
      })
      setManagers(enriched)
    }).catch(e => setManagersError(String(e)))
      .finally(() => setManagersLoading(false))
  }, [isAdmin])

  useEffect(() => {
    if (!selectedManager) return
    setManagerLoading(true); setManagerData(null)
    fetch(`/api/minha-area?targetEmail=${encodeURIComponent(selectedManager.email)}&pestana=${encodeURIComponent(selectedManager.pestana)}&month=${adminMonth}&year=${adminYear}`)
      .then(r => r.json())
      .then(d => { if (d.success) setManagerData(d) })
      .catch(() => {})
      .finally(() => setManagerLoading(false))
  }, [selectedManager, adminMonth, adminYear])

  useEffect(() => {
    if (!data || isAdmin || sessionLoading) { setUserScoreHistory([]); return }
    const prev2 = getPrev3Months(month, year)
    Promise.all(prev2.map(({ m, y }) =>
      fetch(`/api/minha-area?month=${m}&year=${y}`).then(r => r.json()).catch(() => null)
    )).then(results => setUserScoreHistory(buildScorePoints(results)))
  }, [month, year, data, isAdmin, sessionLoading])

  useEffect(() => {
    if (!managerData || !selectedManager) { setAdminScoreHistory([]); return }
    const prev2 = getPrev3Months(adminMonth, adminYear)
    Promise.all(prev2.map(({ m, y }) =>
      fetch(`/api/minha-area?targetEmail=${encodeURIComponent(selectedManager.email)}&pestana=${encodeURIComponent(selectedManager.pestana)}&month=${m}&year=${y}`)
        .then(r => r.json()).catch(() => null)
    )).then(results => setAdminScoreHistory(buildScorePoints(results)))
  }, [adminMonth, adminYear, managerData, selectedManager])

  useEffect(() => {
    if (!session?.user?.email || isAdmin || sessionLoading) return
    fetch('/api/minha-area?action=salesHistory')
      .then(r => r.json())
      .then(d => { if (d.success) setUserSalesHistory(d.points ?? []) })
      .catch(() => {})
  }, [session?.user?.email, isAdmin, sessionLoading])

  useEffect(() => {
    if (!selectedManager) { setAdminSalesHistory([]); return }
    fetch(`/api/minha-area?action=salesHistory&targetEmail=${encodeURIComponent(selectedManager.email)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setAdminSalesHistory(d.points ?? []) })
      .catch(() => {})
  }, [selectedManager])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  function adminPrevMonth() {
    if (adminMonth === 1) { setAdminMonth(12); setAdminYear(y => y - 1) } else setAdminMonth(m => m - 1)
  }
  function adminNextMonth() {
    if (adminYear > now.getFullYear() || (adminYear === now.getFullYear() && adminMonth >= now.getMonth() + 1)) return
    if (adminMonth === 12) { setAdminMonth(1); setAdminYear(y => y + 1) } else setAdminMonth(m => m + 1)
  }
  const adminIsCurrentMonth = adminYear === now.getFullYear() && adminMonth === now.getMonth() + 1

  function handleSelectManager(m: ManagerCard) {
    setAdminMonth(now.getMonth() + 1)
    setAdminYear(now.getFullYear())
    setSelectedManager(m)
  }

  if (sessionLoading) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 28px 48px' }}>

      {!isAdmin && (
        error
          ? (
              <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', padding:'60px 24px' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#FF7070', marginBottom:8 }}>{error}</div>
                {error.includes('GAS_MINHA_AREA_URL') && (
                  <div style={{ fontSize:12, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
                    Implemente <code style={{ color:'var(--accent)' }}>data/gas-minha-area.js</code> no Google Apps Script<br />
                    e adicione a URL em <code style={{ color:'var(--accent)' }}>GAS_MINHA_AREA_URL</code>.
                  </div>
                )}
              </div>
            )
          : loading
            ? <Spinner />
            : data
              ? <DocumentReport
                  data={data} email={session?.user?.email ?? undefined}
                  photoUrl={(session?.user as any)?.foto ?? undefined}
                  month={month} year={year}
                  onPrev={prevMonth} onNext={nextMonth} isCurrentMonth={isCurrentMonth}
                  scoreHistory={userScoreHistory} salesHistory={userSalesHistory}
                />
              : null
      )}

      {isAdmin && (
        selectedManager
          ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                  <button onClick={() => setSelectedManager(null)} style={{
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:8, padding:'6px 14px', color:'rgba(232,237,245,0.7)',
                    cursor:'pointer', fontSize:12, fontFamily:"'Inter',sans-serif",
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    ← Todos os Managers
                  </button>
                </div>
                {managerLoading
                  ? <Spinner label={`Carregando dados de ${stripISMPrefix(selectedManager.name)}...`} />
                  : managerData
                    ? <DocumentReport
                        data={managerData}
                        email={selectedManager.email}
                        photoUrl={selectedManager.photoUrl ?? undefined}
                        month={adminMonth} year={adminYear}
                        onPrev={adminPrevMonth} onNext={adminNextMonth} isCurrentMonth={adminIsCurrentMonth}
                        scoreHistory={adminScoreHistory} salesHistory={adminSalesHistory}
                      />
                    : <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(232,237,245,0.3)', fontSize:13 }}>Sem dados para este manager este mês</div>
                }
              </div>
            )
          : managersLoading
            ? <Spinner label="Carregando managers..." />
            : managersError
              ? (
                  <div style={{ textAlign:'center', padding:'60px 24px' }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>⚠️</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#FF7070', marginBottom:8 }}>{managersError}</div>
                    <div style={{ fontSize:11, color:'rgba(232,237,245,0.35)', fontFamily:"'DM Sans',sans-serif" }}>Verifique se o GAS foi redesplegado com a nova função getManagers</div>
                  </div>
                )
              : <ManagerGrid managers={managers} onSelect={handleSelectManager} />
      )}

    </div>
  )
}
