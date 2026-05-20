'use client'

import { useState, useEffect } from 'react'

/* ─── Types ──────────────────────────────────────────────────────── */
type Payment = {
  date: string; dateRaw: string; col: number; rowStart: number
  isClosing: boolean; fix: number; totalSales: number; pctComm: number
  commission: number; extraDays: number; bonus: number; fines: number
  totalSalary: number; comment: string; approved: string
}
type Month = {
  key: string; label: string; fix: number; commission: number
  bonus: number; fines: number; totalSalary: number; payments: Payment[]
}
type Manager = {
  name: string; email: string; rowStart: number
  payments: Payment[]; months: Month[]; photoUrl?: string; inactive?: boolean
}

/* ─── Constants ──────────────────────────────────────────────────── */
const COLORS = [
  { bg: 'rgba(0,255,178,0.12)',   c: '#00FFB2' },
  { bg: 'rgba(0,194,255,0.12)',   c: '#00C2FF' },
  { bg: 'rgba(168,85,247,0.12)',  c: '#A855F7' },
  { bg: 'rgba(245,166,35,0.12)',  c: '#F5A623' },
  { bg: 'rgba(255,107,107,0.12)', c: '#FF6B6B' },
  { bg: 'rgba(52,211,153,0.12)',  c: '#34D399' },
]


/* ─── Helpers ────────────────────────────────────────────────────── */
const fmt   = (n: number) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ini   = (name: string) => name.replace(/^ISM\s+/i, '').trim().split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
const clean = (name: string) => name.replace(/^ISM\s+/i, '').trim()
const needsAction = (p: Payment) => { const s = (p.approved || '').toLowerCase(); return s !== 'approved' && s !== 'not approved' }

const driveImgUrl = (url?: string): string => {
  if (!url) return ''
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w100` : url
}

function periodLabel(dateRaw: string, isClosing: boolean) {
  const [y, m] = dateRaw.split('-').map(Number)
  if (isClosing) {
    const prev = new Date(y, m - 2, 1)
    return `${prev.toLocaleString('en-US', { month: 'long' })} 16–end`
  }
  return `${new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long' })} 1–15`
}

/* ─── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ name, photoUrl, mi, size = 40 }: { name: string; photoUrl?: string; mi: number; size?: number }) {
  const [err, setErr] = useState(false)
  const col = COLORS[mi % COLORS.length]
  const url = driveImgUrl(photoUrl)
  if (url && !err) return (
    <img src={url} onError={() => setErr(true)} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${col.c}28`, flexShrink: 0, display: 'block' }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col.bg, color: col.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.28), fontWeight: 700, flexShrink: 0, border: `2px solid ${col.c}28`, fontFamily: "'Inter',sans-serif" }}>
      {ini(name)}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */
function Chip({ label, value, color, big, bordered }: { label: string; value: string; color?: string; big?: boolean; bordered?: boolean }) {
  return (
    <div style={{ background: bordered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${bordered ? 'var(--border-mid)' : 'var(--border)'}`, borderRadius: 10, padding: '10px 13px', minWidth: 80 }}>
      <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: big ? 18 : 15, fontWeight: 600, color: color || 'var(--text-dim)', fontFamily: "'Inter',sans-serif" }}>{value}</div>
    </div>
  )
}

function SmallChip({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 12px' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}: </span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 600, color: color || 'var(--text)', fontFamily: "'Inter',sans-serif" }}>{value}</span>
    </div>
  )
}

function ActionBtn({ label, color, onClick, disabled, small }: { label: string; color: string; onClick: () => void; disabled?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: small ? '5px 11px' : '7px 16px', borderRadius: 8, background: `${color}14`, border: `1px solid ${color}33`, color, fontSize: small ? 11 : 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}>
      {label}
    </button>
  )
}

function EmptyState({ icon, msg, sub }: { icon: string; msg: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: 12 }}>
      <div style={{ fontSize: 36, opacity: 0.15 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dim)', fontFamily: "'Inter',sans-serif" }}>{msg}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', maxWidth: 320 }}>{sub}</div>}
    </div>
  )
}

/* ─── MiniChart (single series) ──────────────────────────────────── */
function MiniChart({ months, getValue, color, gradId, cols = 1 }: {
  months: Month[]; getValue: (m: Month) => number; color: string; gradId: string; cols?: number
}) {
  // Scale up fonts/dots to stay readable when rendered in a narrow column.
  // cols=3 → each chart is ~1/3 of screen width → SVG shrinks ~35%, compensate.
  const fVal   = cols === 3 ? 17 : cols === 2 ? 14 : 11
  const fMonth = cols === 3 ? 15 : cols === 2 ? 12 : 10
  const dotR   = cols === 3 ? 7  : cols === 2 ? 6  : 4.5
  const dotRL  = cols === 3 ? 10 : cols === 2 ? 8  : 6
  const PL = 14, PR = 14
  const W = 560, H = 250, PT = 42, PB = 30
  const cW = W - PL - PR, cH = H - PT - PB
  const data = months.map(getValue)
  const maxV = Math.max(...data, 1)
  const n = months.length
  if (n < 2) return <div style={{ padding: '24px', textAlign: 'center', fontSize: 11, color: 'var(--text-faint)' }}>Not enough data</div>
  const xAt = (i: number) => PL + (i / (n - 1)) * cW
  const yAt = (v: number) => PT + (1 - v / maxV) * cH
  const lineD = data.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const areaD = `M${xAt(0).toFixed(1)} ${yAt(data[0]).toFixed(1)} ${data.map((v, i) => `L${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')} L${xAt(n-1).toFixed(1)} ${(PT+cH).toFixed(1)} L${xAt(0).toFixed(1)} ${(PT+cH).toFixed(1)} Z`
  const fmtVal = (v: number) =>
    v >= 10000 ? `$${(v / 1000).toFixed(1)}k` :
    v >= 1000  ? `$${Math.round(v).toLocaleString('en-US')}` :
    `$${Math.round(v)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => (
        <line key={i} x1={PL} y1={yAt(maxV * t)} x2={PL + cW} y2={yAt(maxV * t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {months.map((m, i) => {
        const isLast = i === n - 1
        const cx = xAt(i)
        const cy = yAt(data[i])
        const labelY = cy < PT + fVal + dotRL ? cy + dotRL + fVal + 2 : cy - dotRL - 4
        const anchor = i === 0 ? 'start' : isLast ? 'end' : 'middle'
        return (
          <g key={i}>
            <text x={cx} y={labelY} textAnchor={anchor} fontSize={fVal} fontWeight="700" fill={color} fontFamily="'Inter',sans-serif"
              stroke="#080B10" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke fill">
              {fmtVal(data[i])}
            </text>
            {isLast && (
              <>
                {/* Glow behind dot */}
                <circle cx={cx} cy={cy} r={dotRL + 4} fill={color} opacity="0">
                  <animate attributeName="opacity" values="0;0.35;0" dur="1.6s" repeatCount="indefinite" />
                </circle>
                {/* Ring 1 — main sonar pulse */}
                <circle cx={cx} cy={cy} r={dotRL} fill="none" stroke={color} strokeWidth="3" opacity="0">
                  <animate attributeName="r" values={`${dotRL};${dotRL + 36};${dotRL + 36}`} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;0" dur="1.6s" repeatCount="indefinite" />
                </circle>
                {/* Ring 2 — staggered 30% behind */}
                <circle cx={cx} cy={cy} r={dotRL} fill="none" stroke={color} strokeWidth="1.5" opacity="0">
                  <animate attributeName="r" values={`${dotRL};${dotRL};${dotRL + 36};${dotRL + 36}`} keyTimes="0;0.3;1;1" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.7;0;0" keyTimes="0;0.3;0.95;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            <circle cx={cx} cy={cy} r={isLast ? dotRL : dotR} fill={color} stroke="#080B10" strokeWidth="1.5" />
            <text x={cx} y={H - 6} textAnchor={anchor} fontSize={fMonth} fill="rgba(232,237,245,0.35)" fontFamily="'Inter',sans-serif">
              {m.label.slice(0, 3)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Queue View ─────────────────────────────────────────────────── */
function QueueView({ mgrs, nextQueueCol, gone, saving, onApprove, onViewMgr }: {
  mgrs: Manager[]; nextQueueCol: number | null; gone: Set<string>; saving: string | null
  onApprove: (mi: number, p: Payment, status: string) => Promise<void>
  onViewMgr: (mi: number) => void
}) {
  const items = mgrs.flatMap((mgr, mi) =>
    mgr.payments.filter(p => p.col === nextQueueCol && needsAction(p)).map(p => ({ mgr, mi, p }))
  )
  const visible = items.filter(({ p }) => !gone.has(`${p.rowStart}-${p.col}`))

  // Upcoming columns after the current queue column
  const upcomingMap: Record<string, { count: number; isClosing: boolean; date: string }> = {}
  mgrs.forEach(mgr => {
    mgr.payments.filter(p => needsAction(p) && nextQueueCol !== null && p.col > nextQueueCol)
      .forEach(p => {
        if (!upcomingMap[p.dateRaw]) upcomingMap[p.dateRaw] = { count: 0, isClosing: p.isClosing, date: p.date }
        upcomingMap[p.dateRaw].count++
      })
  })
  const upcomingDates = Object.keys(upcomingMap).sort().slice(0, 3)

  if (nextQueueCol === null) return <EmptyState icon="✓" msg="No pending payments" sub="All managers are up to date." />

  const sample = items[0]?.p
  const nextQueueDate = sample?.dateRaw ?? null

  return (
    <div style={{ padding: '28px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
          Next payment to approve
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>
          {nextQueueDate ? new Date(nextQueueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
        </div>
        {sample && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
            {periodLabel(sample.dateRaw, sample.isClosing)} · {visible.length > 0 ? `${visible.length} pending` : 'All resolved'}
          </div>
        )}
      </div>

      {items.map(({ mgr, mi, p }) => {
        const key = `${p.rowStart}-${p.col}`
        if (gone.has(key)) return null
        const isSaving = saving === key
        const isOnHold = (p.approved || '').toLowerCase() === 'waiting'
        return (
          <div key={key} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 12, overflow: 'hidden', opacity: isSaving ? 0.65 : 1, transition: 'opacity 0.2s', animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={mgr.name} photoUrl={mgr.photoUrl} mi={mi} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>{clean(mgr.name)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                  {p.isClosing ? 'Closing payment' : 'Advance payment'}
                </div>
              </div>
              {isOnHold && (
                <div style={{ background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.25)', borderRadius: 99, padding: '3px 12px', fontSize: 10, fontWeight: 700, color: '#00C2FF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  On hold
                </div>
              )}
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 14 }}>
                {p.fix > 0        && <Chip label="Base"       value={`$${fmt(p.fix)}`} />}
                {p.totalSales > 0 && <Chip label="Sales"      value={`$${fmt(p.totalSales)}`} />}
                {p.commission > 0 && <Chip label={`Comm${p.pctComm ? ' ' + (p.pctComm < 1 ? Math.round(p.pctComm * 100) : Math.round(p.pctComm)) + '%' : ''}`} value={`$${fmt(p.commission)}`} color="#00C2FF" />}
                {p.extraDays > 0  && <Chip label="Extra"      value={`$${fmt(p.extraDays)}`} />}
                {p.bonus > 0      && <Chip label="Bonus"      value={`$${fmt(p.bonus)}`} color="var(--accent)" />}
                {p.fines !== 0    && <Chip label="Fines"      value={`-$${fmt(Math.abs(p.fines))}`} color="#FF6B6B" />}
                <Chip label="Total" value={`$${fmt(p.totalSalary)}`} color="var(--text)" big bordered />
              </div>
              {p.comment && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 13px', fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
                  💬 {p.comment}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionBtn label="Approve" color="#00FFB2" onClick={() => onApprove(mi, p, 'Approved')} disabled={isSaving} />
                <ActionBtn label="Reject"  color="#FF6B6B" onClick={() => onApprove(mi, p, 'Not Approved')} disabled={isSaving} />
                <ActionBtn label="Hold"    color="#F5A623" onClick={() => onApprove(mi, p, 'Waiting')} disabled={isSaving} />
                <button onClick={() => onViewMgr(mi)}
                  style={{ padding: '7px 15px', borderRadius: 8, background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}
                >View history</button>
              </div>
            </div>
          </div>
        )
      })}

      {visible.length === 0 && nextQueueDate && (
        <EmptyState icon="✓" msg="All resolved" sub="All payments for this date have been processed." />
      )}

      {/* Upcoming preview */}
      {upcomingDates.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>
            Upcoming
          </div>
          {upcomingDates.map(dk => {
            const u = upcomingMap[dk]
            return (
              <div key={dk} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-mid)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: "'Inter',sans-serif" }}>{u.date}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 }}>· {periodLabel(dk, u.isClosing)}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.count} payment{u.count !== 1 ? 's' : ''}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Rankings View ──────────────────────────────────────────────── */
function RankingsView({ mgrs }: { mgrs: Manager[] }) {
  const monthMap: Record<string, { key: string; label: string; entries: { name: string; photoUrl?: string; mi: number; totalSalary: number; commission: number }[] }> = {}
  mgrs.forEach((mgr, mi) => {
    mgr.months.forEach(month => {
      if (!monthMap[month.key]) monthMap[month.key] = { key: month.key, label: month.label, entries: [] }
      monthMap[month.key].entries.push({ name: mgr.name, photoUrl: mgr.photoUrl, mi, totalSalary: month.totalSalary, commission: month.commission })
    })
  })
  const months = Object.values(monthMap).sort((a, b) => a.key > b.key ? -1 : 1)
  const [selMonth, setSelMonth] = useState('')
  const effectiveMonth = selMonth || (months[0]?.key ?? '')
  const current = monthMap[effectiveMonth]

  if (months.length === 0) return <EmptyState icon="🏆" msg="No data yet" sub="Salary data will appear here once approved." />

  const salRanked  = current ? [...current.entries].sort((a, b) => b.totalSalary - a.totalSalary) : []
  const commRanked = current ? [...current.entries].filter(e => e.commission > 0).sort((a, b) => b.commission - a.commission) : []
  const medal = (rank: number) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null

  const RankRow = ({ e, rank, valueKey, color }: { e: typeof salRanked[0]; rank: number; valueKey: 'totalSalary' | 'commission'; color: string }) => {
    const m = medal(rank)
    return (
      <div style={{ padding: '10px 18px', borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 10, background: rank === 0 ? `${color}08` : 'transparent' }}>
        <div style={{ minWidth: 28, textAlign: 'center', fontSize: m ? 16 : 11, color: 'var(--text-faint)', fontFamily: "'Inter',sans-serif" }}>{m ?? (rank + 1)}</div>
        <Avatar name={e.name} photoUrl={e.photoUrl} mi={e.mi} size={30} />
        <div style={{ flex: 1, fontSize: 13, fontWeight: rank < 3 ? 600 : 400, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clean(e.name)}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color, flexShrink: 0, fontFamily: "'Inter',sans-serif" }}>${fmt(e[valueKey])}</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Rankings</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>Performance leaderboard</div>
      </div>

      {/* Month tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {months.map(m => {
          const active = effectiveMonth === m.key
          return (
            <button key={m.key} onClick={() => setSelMonth(m.key)}
              style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, background: active ? 'rgba(0,255,178,0.08)' : 'none', color: active ? 'var(--accent)' : 'var(--text-faint)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}>
              {m.label}
            </button>
          )
        })}
      </div>

      {current && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFB2' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontFamily: "'Inter',sans-serif" }}>Total salary</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {salRanked.map((e, rank) => (
                <div key={e.name} style={{ borderBottom: rank < salRanked.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <RankRow e={e} rank={rank} valueKey="totalSalary" color="#00FFB2" />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C2FF' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontFamily: "'Inter',sans-serif" }}>Commission</span>
            </div>
            {commRanked.length === 0
              ? <div style={{ padding: '24px 18px', fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>No commission this month</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {commRanked.map((e, rank) => (
                    <div key={e.name} style={{ borderBottom: rank < commRanked.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <RankRow e={e} rank={rank} valueKey="commission" color="#00C2FF" />
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Detail View ────────────────────────────────────────────────── */
function DetailView({ mgr, mi, onBack, onApprove, gone, saving, nextQueueCol }: {
  mgr: Manager; mi: number; onBack: () => void; gone: Set<string>; saving: string | null
  onApprove: (mi: number, p: Payment, status: string) => Promise<void>; nextQueueCol: number | null
}) {
  const totalPaid = mgr.months.reduce((s, m) => s + m.totalSalary, 0)
  const totalComm = mgr.months.reduce((s, m) => s + m.commission, 0)
  const pendingNowP = nextQueueCol !== null
    ? mgr.payments.find(p => p.col === nextQueueCol && needsAction(p) && !gone.has(`${p.rowStart}-${p.col}`))
    : null
  const nextPendingKey = pendingNowP ? `${pendingNowP.rowStart}-${pendingNowP.col}` : null

  return (
    <div style={{ padding: '28px 40px' }}>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12, cursor: 'pointer', marginBottom: 24, fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}
      >← Back to queue</button>

      {/* Manager header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
        <Avatar name={mgr.name} photoUrl={mgr.photoUrl} mi={mi} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>{clean(mgr.name)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{mgr.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Months',     val: String(mgr.months.length) },
            { label: 'Total paid', val: `$${fmt(totalPaid)}` },
            { label: 'Commission', val: `$${fmt(totalComm)}`, color: '#00C2FF' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 15px', textAlign: 'center', minWidth: 82 }}>
              <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color || 'var(--text)', fontFamily: "'Inter',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts — single row */}
      {mgr.months.length >= 2 && (() => {
        const hasComm  = mgr.months.some(m => m.commission > 0)
        const hasSales = mgr.months.some(m => m.payments.some(p => p.totalSales > 0))
        const cols = 1 + (hasComm ? 1 : 0) + (hasSales ? 1 : 0)
        return (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 28 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFB2' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Salary</span>
              </div>
              <MiniChart months={mgr.months} getValue={m => m.totalSalary} color="#00FFB2" gradId={`gSal-${mi}`} cols={cols} />
            </div>
            {hasComm && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C2FF' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Commission</span>
                </div>
                <MiniChart months={mgr.months} getValue={m => m.commission} color="#00C2FF" gradId={`gComm-${mi}`} cols={cols} />
              </div>
            )}
            {hasSales && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A855F7' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sales</span>
                </div>
                <MiniChart months={mgr.months} getValue={m => m.payments.reduce((s, p) => s + p.totalSales, 0)} color="#A855F7" gradId={`gSales-${mi}`} cols={cols} />
              </div>
            )}
          </div>
        )
      })()}

      {/* Payment history */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontFamily: "'Inter',sans-serif" }}>
        Payment history
      </div>

      {[...mgr.months].reverse().map((month, mIdx) => {
        const allApproved = month.payments.every(p => (p.approved || '').toLowerCase() === 'approved')
        const mColor = COLORS[mIdx % COLORS.length].c
        return (
          <div key={month.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingLeft: 12, borderLeft: `3px solid ${mColor}55` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{month.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>· ${fmt(month.totalSalary)}</span>
              {allApproved && (
                <span style={{ background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.2)', borderRadius: 99, padding: '2px 10px', fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Approved
                </span>
              )}
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${mColor}22`, borderRadius: 10, overflow: 'hidden' }}>
              {month.payments.map((p, pi) => {
                const s = (p.approved || '').toLowerCase()
                const isUpcoming = !s && needsAction(p) && nextQueueCol !== null && p.col > nextQueueCol
                const sc = s === 'approved' ? '#00FFB2' : s === 'not approved' ? '#FF6B6B' : s === 'waiting' ? '#00C2FF' : isUpcoming ? 'rgba(232,237,245,0.3)' : '#F5A623'
                const sl = s === 'approved' ? 'Approved' : s === 'not approved' ? 'Rejected' : s === 'waiting' ? 'On hold' : isUpcoming ? 'Upcoming' : 'Pending'
                const key = `${p.rowStart}-${p.col}`
                const isSaving = saving === key
                const pendingNow = key === nextPendingKey
                return (
                  <div key={pi} style={{ padding: '12px 16px', borderBottom: pi < month.payments.length - 1 ? '1px solid var(--border)' : 'none', background: pendingNow ? 'rgba(245,166,35,0.04)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)' }}>{p.date}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>· {periodLabel(p.dateRaw, p.isClosing)}</span>
                      <span style={{ marginLeft: 'auto', background: `${sc}14`, border: `1px solid ${sc}30`, borderRadius: 99, padding: '2px 9px', fontSize: 9, fontWeight: 700, color: sc, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sl}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      {p.fix > 0        && <SmallChip label="Base"       value={`$${fmt(p.fix)}`} />}
                      {p.totalSales > 0 && <SmallChip label="Sales"      value={`$${fmt(p.totalSales)}`} color="#A855F7" />}
                      {p.commission > 0 && <SmallChip label={`Comm${p.pctComm ? ' ' + (p.pctComm < 1 ? Math.round(p.pctComm * 100) : Math.round(p.pctComm)) + '%' : ''}`} value={`$${fmt(p.commission)}`} color="#00C2FF" />}
                      {p.extraDays > 0  && <SmallChip label="Extra"      value={`$${fmt(p.extraDays)}`} />}
                      {p.bonus > 0      && <SmallChip label="Bonus" value={`$${fmt(p.bonus)}`} color="var(--accent)" />}
                      {p.fines !== 0    && <SmallChip label="Fines" value={`-$${fmt(Math.abs(p.fines))}`} color="#FF6B6B" />}
                      <SmallChip label="Total" value={`$${fmt(p.totalSalary)}`} color="var(--text)" bold />
                      {pendingNow && (
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                          <ActionBtn label="Approve" color="#00FFB2" small onClick={() => onApprove(mi, p, 'Approved')} disabled={isSaving} />
                          <ActionBtn label="Reject"  color="#FF6B6B" small onClick={() => onApprove(mi, p, 'Not Approved')} disabled={isSaving} />
                          <ActionBtn label="Hold"    color="#F5A623" small onClick={() => onApprove(mi, p, 'Waiting')} disabled={isSaving} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Gastos View ────────────────────────────────────────────────── */
function GastosView({ mgrs }: { mgrs: Manager[] }) {
  const [activeCats, setActiveCats] = useState<string[]>(['totalSalary', 'commission'])

  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })()

  const aggMap: Record<string, { key: string; label: string; fix: number; commission: number; extraDays: number; bonus: number; fines: number; totalSalary: number }> = {}
  mgrs.forEach(mgr => {
    mgr.months.forEach(mo => {
      if (mo.key > todayKey) return  // skip future months
      if (!aggMap[mo.key]) aggMap[mo.key] = { key: mo.key, label: mo.label, fix: 0, commission: 0, extraDays: 0, bonus: 0, fines: 0, totalSalary: 0 }
      aggMap[mo.key].fix         += mo.fix
      aggMap[mo.key].commission  += mo.commission
      aggMap[mo.key].bonus       += mo.bonus
      aggMap[mo.key].fines       += mo.fines
      aggMap[mo.key].totalSalary += mo.totalSalary
      aggMap[mo.key].extraDays   += mo.payments.reduce((s, p) => s + p.extraDays, 0)
    })
  })
  const sorted = Object.values(aggMap).sort((a, b) => a.key < b.key ? -1 : 1)
  if (sorted.length === 0) return <EmptyState icon="📊" msg="No data yet" sub="Spending data will appear here once payments are approved." />

  const cur = aggMap[todayKey] ?? sorted[sorted.length - 1]

  const fmtPayDate = (iso: string) => { const [,m,d] = iso.split('-'); return `${Number(m)}/${Number(d)}` }
  type HalfTotals = { totalSalary: number; fix: number; commission: number; bonus: number; fines: number; dates: string[] }

  // Group current-month payments by spreadsheet column; a col is "sent" when all its payments are processed
  type ColGroup = { totalSalary: number; fix: number; commission: number; bonus: number; fines: number; date: string; allProcessed: boolean }
  const colGroups: Record<number, ColGroup> = {}
  mgrs.forEach(mgr => {
    mgr.months.filter(mo => mo.key === todayKey).forEach(mo => {
      mo.payments.forEach(p => {
        if (!colGroups[p.col]) colGroups[p.col] = { totalSalary: 0, fix: 0, commission: 0, bonus: 0, fines: 0, date: p.dateRaw.slice(0, 10), allProcessed: true }
        colGroups[p.col].totalSalary += p.totalSalary
        colGroups[p.col].fix         += p.fix
        colGroups[p.col].commission  += p.commission
        colGroups[p.col].bonus       += p.bonus
        colGroups[p.col].fines       += p.fines
        if (needsAction(p)) colGroups[p.col].allProcessed = false
      })
    })
  })
  const paidHalf: HalfTotals     = { totalSalary: 0, fix: 0, commission: 0, bonus: 0, fines: 0, dates: [] }
  const upcomingHalf: HalfTotals = { totalSalary: 0, fix: 0, commission: 0, bonus: 0, fines: 0, dates: [] }
  Object.values(colGroups).forEach(cg => {
    const half = cg.allProcessed ? paidHalf : upcomingHalf
    half.totalSalary += cg.totalSalary
    half.fix         += cg.fix
    half.commission  += cg.commission
    half.bonus       += cg.bonus
    half.fines       += cg.fines
    half.dates.push(cg.date)
  })

  const CATS = [
    { key: 'totalSalary', label: 'Total salary', color: '#00FFB2', short: 'Total' },
    { key: 'fix',         label: 'Base pay',      color: '#E8EDF5', short: 'Base' },
    { key: 'commission',  label: 'Commission',    color: '#00C2FF', short: 'Comm' },
    { key: 'extraDays',   label: 'Extra days',    color: '#A855F7', short: 'Extras' },
    { key: 'bonus',       label: 'Bonus',         color: '#F5A623', short: 'Bonus' },
    { key: 'fines',       label: 'Fines',         color: '#FF6B6B', short: 'Fines' },
  ]

  const toggle = (key: string) => setActiveCats(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])

  const n            = sorted.length
  const curIdx       = sorted.findIndex(m => m.key === cur.key)
  const activeSeries = CATS.filter(c => activeCats.includes(c.key))
  const allVals      = activeSeries.flatMap(s => sorted.map(m => (m as any)[s.key] as number || 0))
  const maxV         = Math.max(...allVals, 1)
  const W = 760, H = 190, PL = 14, PR = 14, PT = 18, PB = 26
  const cW = W - PL - PR, cH = H - PT - PB
  const xAt = (i: number) => PL + (i / Math.max(n - 1, 1)) * cW
  const yAt = (v: number) => PT + (1 - v / maxV) * cH

  return (
    <div style={{ padding: '28px 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Analysis</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>Monthly spending — {cur.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,178,0.07)', border: '1px solid rgba(0,255,178,0.2)', borderRadius: 99, padding: '3px 10px' }}>
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" fill="#00FFB2" opacity="0.25">
                <animate attributeName="r" values="4;2;4" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.25;0.6;0.25" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="4" cy="4" r="2.5" fill="#00FFB2"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Paid vs Upcoming split */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, alignItems: 'stretch' }}>
        {/* Already sent */}
        <div style={{ flex: 1, background: 'rgba(0,255,178,0.05)', border: '1px solid rgba(0,255,178,0.2)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,255,178,0.15)', border: '1px solid rgba(0,255,178,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#00FFB2', flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>Já enviado</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#00FFB2', fontFamily: "'Inter',sans-serif", marginBottom: 5 }}>${fmt(paidHalf.totalSalary)}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', fontFamily: "'Inter',sans-serif" }}>
            {paidHalf.dates.length > 0 ? paidHalf.dates.sort().map(fmtPayDate).join(', ') : '—'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(232,237,245,0.2)', fontSize: 22, fontWeight: 300, padding: '0 2px', userSelect: 'none' }}>+</div>

        {/* Upcoming */}
        <div style={{ flex: 1, background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="8" fill="#F5A623" fillOpacity="0.15">
                <animate attributeName="r" values="8;5;8" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="fillOpacity" values="0.15;0.4;0.15" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="8" cy="8" r="4.5" fill="#F5A623"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>A enviar</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#F5A623', fontFamily: "'Inter',sans-serif", marginBottom: 5 }}>${fmt(upcomingHalf.totalSalary)}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', fontFamily: "'Inter',sans-serif" }}>
            {upcomingHalf.dates.length > 0 ? upcomingHalf.dates.sort().map(fmtPayDate).join(', ') : 'Mes completo ✓'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(232,237,245,0.2)', fontSize: 22, fontWeight: 300, padding: '0 2px', userSelect: 'none' }}>=</div>

        {/* Total */}
        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>Total estimado</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', fontFamily: "'Inter',sans-serif" }}>${fmt(paidHalf.totalSalary + upcomingHalf.totalSalary)}</div>
          <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', fontFamily: "'Inter',sans-serif", marginTop: 5 }}>{cur.label}</div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {CATS.map(cat => {
          const val = (cur as any)[cat.key] as number || 0
          return (
            <div key={cat.key} style={{ flex: '1 1 130px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>{cat.label}</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: cat.color, fontFamily: "'Inter',sans-serif" }}>${fmt(val)}</div>
            </div>
          )
        })}
      </div>

      {/* Category selector */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginRight: 2, fontFamily: "'Inter',sans-serif" }}>Chart:</span>
        {CATS.map(cat => {
          const on = activeCats.includes(cat.key)
          return (
            <button key={cat.key} onClick={() => toggle(cat.key)}
              style={{ padding: '4px 13px', borderRadius: 99, border: `1px solid ${on ? cat.color : 'var(--border)'}`, background: on ? `${cat.color}12` : 'none', color: on ? cat.color : 'var(--text-faint)', fontSize: 11, fontWeight: on ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}>
              {cat.short}
            </button>
          )
        })}
      </div>

      {/* Multi-series chart */}
      {n >= 2 && activeSeries.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            {activeSeries.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <defs>
              {activeSeries.map(s => (
                <linearGradient key={s.key} id={`gG-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.10" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
                </linearGradient>
              ))}
            </defs>
            {[0, 0.5, 1].map((t, i) => (
              <line key={i} x1={PL} y1={yAt(maxV * t)} x2={PL + cW} y2={yAt(maxV * t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {activeSeries.map(s => {
              const data = sorted.map(m => (m as any)[s.key] as number || 0)
              const ld = data.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
              const ad = `M${xAt(0).toFixed(1)} ${yAt(data[0]).toFixed(1)} ${data.map((v, i) => `L${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')} L${xAt(n - 1).toFixed(1)} ${(PT + cH).toFixed(1)} L${xAt(0).toFixed(1)} ${(PT + cH).toFixed(1)} Z`
              return (
                <g key={s.key}>
                  <path d={ad} fill={`url(#gG-${s.key})`} />
                  <path d={ld} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {data.map((v, i) => {
                    const isCur = i === curIdx
                    const cx = xAt(i), cy = yAt(v)
                    const labelAnchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
                    const labelY = cy < PT + 22 ? cy + 20 : cy - 8
                    const fmtV = v >= 10000 ? `$${(v / 1000).toFixed(1)}k` : v >= 1000 ? `$${Math.round(v).toLocaleString('en-US')}` : `$${Math.round(v)}`
                    return (
                      <g key={i}>
                        <text x={cx} y={labelY} textAnchor={labelAnchor} fontSize="11" fontWeight="700" fill={s.color} fontFamily="'Inter',sans-serif"
                          stroke="#080B10" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke fill">
                          {fmtV}
                        </text>
                        {isCur && (
                          <>
                            <circle cx={cx} cy={cy} r="6" fill={s.color} opacity="0">
                              <animate attributeName="opacity" values="0;0.3;0" dur="1.6s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={cx} cy={cy} r="4" fill="none" stroke={s.color} strokeWidth="2.5" opacity="0">
                              <animate attributeName="r" values="4;30;30" dur="1.6s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1;0;0" dur="1.6s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={cx} cy={cy} r="4" fill="none" stroke={s.color} strokeWidth="1.5" opacity="0">
                              <animate attributeName="r" values="4;4;30;30" keyTimes="0;0.3;1;1" dur="1.6s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0;0.7;0;0" keyTimes="0;0.3;0.95;1" dur="1.6s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}
                        <circle cx={cx} cy={cy} r={isCur ? 5 : 3.5} fill={s.color} stroke="#080B10" strokeWidth="1.5" />
                      </g>
                    )
                  })}
                </g>
              )
            })}
            {sorted.map((m, i) => {
              const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
              return (
                <text key={i} x={xAt(i)} y={H - 4} textAnchor={anchor} fontSize="10" fill="rgba(232,237,245,0.32)" fontFamily="'Inter',sans-serif">
                  {m.label.split(' ')[0]}
                </text>
              )
            })}
          </svg>
        </div>
      )}

      {/* Monthly breakdown table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(6, 96px)', padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
          {['Month', 'Total', 'Base', 'Commission', 'Extras', 'Bonus', 'Fines'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.09em', textAlign: h === 'Month' ? 'left' : 'right', fontFamily: "'Inter',sans-serif" }}>{h}</div>
          ))}
        </div>
        {[...sorted].reverse().map((m, i) => {
          const isCur = m.key === cur.key
          return (
            <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(6, 96px)', padding: '11px 18px', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none', background: isCur ? 'rgba(0,255,178,0.03)' : 'transparent' }}>
              <div style={{ fontSize: 12, fontWeight: isCur ? 700 : 400, color: isCur ? 'var(--accent)' : 'var(--text-dim)', fontFamily: "'Inter',sans-serif" }}>{m.label}</div>
              {[m.totalSalary, m.fix, m.commission, m.extraDays, m.bonus, m.fines].map((v, j) => (
                <div key={j} style={{ fontSize: 12, fontWeight: 500, color: ['#00FFB2', 'var(--text-dim)', '#00C2FF', '#A855F7', '#F5A623', '#FF6B6B'][j], textAlign: 'right', fontFamily: "'Inter',sans-serif" }}>${fmt(v)}</div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function SalariosPage() {
  const [mgrs, setMgrs]             = useState<Manager[]>([])
  const [loading, setLoading]       = useState(true)
  const [err, setErr]               = useState<string | null>(null)
  const [sel, setSel]               = useState<number | null>(null)
  const [gone, setGone]             = useState<Set<string>>(new Set())
  const [saving, setSaving]         = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [view, setView]             = useState<'pending' | 'gastos' | 'rankings'>('pending')

  const load = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true)
    try {
      const res  = await fetch('/api/direction/salarios')
      const body = await res.json().catch(() => ({ error: `Status ${res.status}` }))
      if (!res.ok) throw new Error(body.error || `Server error ${res.status}`)
      setMgrs(body)
      setErr(null)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const doApprove = async (mi: number, p: Payment, status: string) => {
    const key = `${p.rowStart}-${p.col}`
    setSaving(key)
    try {
      await fetch('/api/direction/salarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mgrRow: p.rowStart, col: p.col, status }),
      })
      setMgrs(prev => prev.map((m, i) => i !== mi ? m : {
        ...m,
        payments: m.payments.map(pp => pp.col === p.col && pp.rowStart === p.rowStart ? { ...pp, approved: status } : pp),
        months:   m.months.map(mo => ({ ...mo, payments: mo.payments.map(pp => pp.col === p.col && pp.rowStart === p.rowStart ? { ...pp, approved: status } : pp) })),
      }))
      if (status === 'Approved' || status === 'Not Approved') {
        setTimeout(() => setGone(prev => new Set(Array.from(prev).concat(key))), 280)
      }
    } finally {
      setSaving(null)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.07)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'var(--text-faint)', fontFamily: "'Inter',sans-serif" }}>Loading salary data…</div>
    </div>
  )

  if (err) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 24, opacity: 0.3 }}>⚠</div>
      <div style={{ fontSize: 13, color: '#FF6B6B', fontFamily: "'Inter',sans-serif", maxWidth: 500, textAlign: 'center' }}>Error: {err}</div>
      <button onClick={() => load()} style={{ padding: '7px 18px', borderRadius: 8, background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
        Retry
      </button>
    </div>
  )

  // Next actionable column: smallest col index where any manager has a pending payment
  const nextQueueCol = (() => {
    const cols = mgrs.flatMap(m => m.payments).filter(needsAction).map(p => p.col)
    return cols.length > 0 ? Math.min(...cols) : null
  })()

  const totalPending = mgrs.reduce((s, m) =>
    s + m.payments.filter(p => p.col === nextQueueCol && needsAction(p)).length, 0
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* ── HEADER BAR ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 1 }}>Direction</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>Salary Approval</div>
        </div>
        {totalPending > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.28)', borderRadius: 99, padding: '4px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', boxShadow: '0 0 6px rgba(245,166,35,0.6)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#F5A623', fontWeight: 600 }}>{totalPending} pending</span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,178,0.07)', border: '1px solid rgba(0,255,178,0.2)', borderRadius: 99, padding: '4px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>All approved</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        {([['pending', 'Pending Approval'], ['gastos', 'Spend'], ['rankings', 'Rankings']] as const).map(([v, label]) => {
          const isActive = view === v
          return (
            <button key={v} onClick={() => { setView(v); setSel(null) }}
              style={{ padding: '6px 18px', borderRadius: 99, border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}`, background: isActive ? 'rgba(0,255,178,0.08)' : 'rgba(255,255,255,0.04)', color: isActive ? 'var(--accent)' : 'rgba(232,237,245,0.65)', fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}>
              {label}
            </button>
          )
        })}
        <button onClick={() => load(true)} disabled={refreshing}
          style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(232,237,245,0.65)', fontSize: 12, cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', fontWeight: 500 }}
          onMouseEnter={e => { if (!refreshing) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' } }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLElement).style.color = 'rgba(232,237,245,0.65)' }}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── MANAGER CHIPS (Pending Approval view only) ───────────── */}
      {view === 'pending' && (
        <div style={{ display: 'flex', gap: 7, padding: '8px 28px', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => setSel(null)}
            style={{ padding: '5px 16px', borderRadius: 99, border: `1px solid ${sel === null ? 'var(--accent)' : 'var(--border)'}`, background: sel === null ? 'rgba(0,255,178,0.08)' : 'none', color: sel === null ? 'var(--accent)' : 'var(--text-faint)', fontSize: 11, fontWeight: sel === null ? 700 : 400, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}>
            All
          </button>
          {mgrs.map((mgr, i) => {
            if (mgr.inactive) return null
            const hasPending = mgr.payments.some(p => p.col === nextQueueCol && needsAction(p))
            const isSel = sel === i
            return (
              <button key={i} onClick={() => setSel(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 5px', borderRadius: 99, border: `1px solid ${isSel ? 'var(--accent)' : hasPending ? 'rgba(245,166,35,0.4)' : 'var(--border)'}`, background: isSel ? 'rgba(0,255,178,0.08)' : hasPending ? 'rgba(245,166,35,0.06)' : 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                <Avatar name={mgr.name} photoUrl={mgr.photoUrl} mi={i} size={22} />
                <span style={{ fontSize: 11, color: isSel ? 'var(--accent)' : 'var(--text-dim)', fontWeight: isSel ? 700 : 400, fontFamily: "'Inter',sans-serif" }}>
                  {clean(mgr.name).split(' ')[0]}
                </span>
                {hasPending
                  ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} />
                  : <span style={{ fontSize: 9, color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                }
              </button>
            )
          })}
        </div>
      )}

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'rankings'
          ? <RankingsView mgrs={mgrs.filter(m => !m.inactive)} />
          : view === 'gastos'
          ? <GastosView mgrs={mgrs} />
          : sel === null
            ? <QueueView mgrs={mgrs.filter(m => !m.inactive)} nextQueueCol={nextQueueCol} gone={gone} saving={saving} onApprove={doApprove} onViewMgr={i => setSel(i)} />
            : <DetailView mgr={mgrs[sel]} mi={sel} onBack={() => setSel(null)} onApprove={doApprove} gone={gone} saving={saving} nextQueueCol={nextQueueCol} />
        }
      </div>
    </div>
  )
}
