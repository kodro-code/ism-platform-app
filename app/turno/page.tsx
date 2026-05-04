'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ReqType = '' | 'report' | 'extra'
type ExtraT  = '' | 'dayChange' | 'extraHours'
type Status  = 'idle' | 'loading' | 'success' | 'error'

// ── field styles ──────────────────────────────────────────────────────────────
const baseInp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  color: '#E8EDF5', fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  appearance: 'none' as any, border: '1px solid transparent',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10.5, letterSpacing: '0.04em',
  textTransform: 'uppercase', color: 'rgba(232,237,245,0.4)',
  marginBottom: 5, fontFamily: "'Inter', sans-serif", fontWeight: 600,
}
const arrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300FFB2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center / 14px`

function fst(focused: boolean, hasValue: boolean) {
  if (focused)  return { borderColor:'rgba(0,255,178,0.5)', boxShadow:'0 0 0 3px rgba(0,255,178,0.07)', background:'rgba(0,255,178,0.05)' }
  if (hasValue) return { borderColor:'rgba(0,255,178,0.25)', boxShadow:'none', background:'rgba(0,255,178,0.03)' }
  return        { borderColor:'rgba(255,255,255,0.08)', boxShadow:'none', background:'rgba(6,9,14,0.8)' }
}
function FI({ style, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false)
  const s = fst(f, !!p.value)
  return <input {...p} style={{ ...baseInp, ...s, ...style }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />
}
function FS({ style, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [f, setF] = useState(false)
  const s = fst(f, !!p.value)
  return (
    <select {...p} style={{ ...baseInp, ...s, ...style, background:`${arrow}, ${s.background}`, paddingRight:32, colorScheme:'dark' as any }} onFocus={()=>setF(true)} onBlur={()=>setF(false)}>
      {children}
    </select>
  )
}
function FT({ style, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f, setF] = useState(false)
  const s = fst(f, !!(p.value as string))
  return <textarea {...p} style={{ ...baseInp, ...s, ...style, resize:'none' }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />
}
function F({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={style}><label style={lbl}>{label}</label>{children}</div>
}
function Sec({ accent, icon, title, children }: { accent: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${accent}22`, marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', background:`${accent}0A`, borderBottom:`1px solid ${accent}18` }}>
        <span style={{ fontSize:12 }}>{icon}</span>
        <span style={{ fontSize:10.5, letterSpacing:'0.04em', textTransform:'uppercase', color:`${accent}CC`, fontFamily:"'Inter',sans-serif", fontWeight:700 }}>{title}</span>
      </div>
      <div style={{ padding:'12px 14px', background:'rgba(12,16,22,0.8)', display:'flex', flexDirection:'column', gap:10 }}>
        {children}
      </div>
    </div>
  )
}

const START_HOURS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const END_HOURS   = ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']
const SHIFT_OPTS  = ['8 Horas','7 Horas','6 Horas','5 Horas','4 Horas','3 Horas','2 Horas','1 Hora']

const RPT0 = { manager:'', ini:'', fin:'', calls:'', callTime:'', waCalls:'', waTime:'', invoices:'', payments:'', comments:'' }
const EXT0 = { manager:'', extType:'' as ExtraT, dayOff:'', recovery:'', shift:'', hours:'', comments:'' }

// ── MiniCalendar ──────────────────────────────────────────────────────────────
const MONTH_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAY_PT   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

function MiniCalendar({ value, onChange, label: fieldLabel }: { value: string; onChange: (v: string) => void; label: string }) {
  const today      = new Date()
  const [open,     setOpen]  = useState(false)
  const [calPos,   setCalPos] = useState<{top:number;left:number;width:number} | null>(null)
  const ref        = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const calRef     = useRef<HTMLDivElement>(null)

  const parsed  = value ? (() => { const [d,m,y] = value.split('/').map(Number); return new Date(y, m-1, d) })() : null
  const [view,  setView]  = useState(() => parsed || new Date(today.getFullYear(), today.getMonth(), 1))

  // Cierra al hacer click fuera o al hacer scroll
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onMouse = (e: MouseEvent) => {
      const inTrigger  = ref.current?.contains(e.target as Node)
      const inCalendar = calRef.current?.contains(e.target as Node)
      if (!inTrigger && !inCalendar) close()
    }
    document.addEventListener('mousedown', onMouse)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  function handleOpen() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setCalPos({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    setOpen(o => !o)
  }

  const yr  = view.getFullYear()
  const mo  = view.getMonth()
  const dim = new Date(yr, mo + 1, 0).getDate()
  const off = (new Date(yr, mo, 1).getDay() + 6) % 7  // semana empieza en lunes
  const cells: (number | null)[] = [...Array(off).fill(null), ...Array.from({length:dim},(_,i)=>i+1)]
  while (cells.length % 7) cells.push(null)

  const fmt = (d: number) => `${String(d).padStart(2,'0')}/${String(mo+1).padStart(2,'0')}/${yr}`
  const isSel  = (d: number) => !!parsed && parsed.getDate()===d && parsed.getMonth()===mo && parsed.getFullYear()===yr
  const isTod  = (d: number) => today.getDate()===d && today.getMonth()===mo && today.getFullYear()===yr

  const trigger = fst(open, !!value)

  return (
    <div ref={ref}>
      <label style={lbl}>{fieldLabel}</label>
      <div ref={triggerRef} onClick={handleOpen}
        style={{ ...baseInp, ...trigger, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color: value ? '#E8EDF5' : 'rgba(232,237,245,0.28)', fontSize:12.5, fontFamily:"'DM Sans',sans-serif" }}>
          {value || 'dd/mm/aaaa'}
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={open ? '#00FFB2' : 'rgba(232,237,245,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transition:'stroke 0.2s' }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      {open && calPos && createPortal(
        <div ref={calRef} style={{ position:'fixed', top:calPos.top, left:calPos.left, zIndex:9999, width:240,
          background:'#090D13', border:'1px solid rgba(0,255,178,0.22)', borderRadius:12,
          padding:'12px 11px', boxShadow:'0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,255,178,0.06)',
          animation:'dropIn 0.15s ease both' }}>

          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <button onClick={e=>{e.stopPropagation();setView(new Date(yr,mo-1,1))}}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:6, cursor:'pointer', color:'rgba(232,237,245,0.6)', fontSize:13, width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s' }}>‹</button>
            <span style={{ fontSize:11.5, fontWeight:700, color:'#E8EDF5', fontFamily:"'Inter',sans-serif" }}>
              {MONTH_PT[mo]} {yr}
            </span>
            <button onClick={e=>{e.stopPropagation();setView(new Date(yr,mo+1,1))}}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:6, cursor:'pointer', color:'rgba(232,237,245,0.6)', fontSize:13, width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, marginBottom:4 }}>
            {DAY_PT.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:9, color:'rgba(232,237,245,0.22)', fontFamily:"'Inter',sans-serif", fontWeight:700, padding:'2px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((day, i) => {
              const sel = !!day && isSel(day)
              const tod = !!day && isTod(day)
              return (
                <div key={i}
                  onClick={day ? e => { e.stopPropagation(); onChange(fmt(day)); setOpen(false) } : undefined}
                  style={{ aspectRatio:'1/1', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, fontSize:11, fontFamily:"'Inter',sans-serif",
                    cursor: day ? 'pointer' : 'default',
                    background: sel ? 'rgba(0,255,178,0.15)' : 'transparent',
                    border: sel ? '1px solid rgba(0,255,178,0.45)' : tod ? '1px solid rgba(0,255,178,0.22)' : '1px solid transparent',
                    color: sel ? '#00FFB2' : tod ? 'rgba(0,255,178,0.75)' : day ? 'rgba(232,237,245,0.68)' : 'transparent',
                    fontWeight: sel ? 700 : 400, transition:'all 0.1s',
                  }}
                  onMouseEnter={e => { if (day && !sel) { const el=e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.07)'; el.style.color='#E8EDF5' } }}
                  onMouseLeave={e => { if (day && !sel) { const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color=tod?'rgba(0,255,178,0.75)':'rgba(232,237,245,0.68)' } }}
                >
                  {day ?? ''}
                </div>
              )
            })}
          </div>

          {/* Clear */}
          {value && (
            <button onClick={e=>{e.stopPropagation();onChange('');setOpen(false)}}
              style={{ marginTop:9, width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:10.5, color:'rgba(232,237,245,0.25)', fontFamily:"'Inter',sans-serif", padding:'4px', borderRadius:4, transition:'color 0.15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,100,100,0.6)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(232,237,245,0.25)'}}>
              Limpar data
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

function SubmitBtn({ valid, loading, label }: { valid: boolean; loading: boolean; label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="submit" disabled={!valid || loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'100%', padding:'13px', borderRadius:10, border:'none',
        background: valid ? 'linear-gradient(135deg,#00FFB2,#00C2FF)' : 'rgba(255,255,255,0.04)',
        color: valid ? '#080B10' : 'rgba(232,237,245,0.18)', fontSize:13, fontWeight:800,
        cursor: valid&&!loading ? 'pointer' : 'not-allowed', fontFamily:"'Inter',sans-serif",
        letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'all 0.2s',
        transform: hov&&valid&&!loading ? 'translateY(-1px)' : 'none',
        boxShadow: hov&&valid&&!loading ? '0 8px 24px rgba(0,255,178,0.2)' : 'none' }}>
      {loading
        ? <><div style={{ width:14, height:14, border:'2px solid rgba(8,11,16,0.3)', borderTopColor:'#080B10', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>Registrando...</>
        : label}
    </button>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function TurnoPage() {
  const [managers,    setManagers]    = useState<string[]>([])
  const [mgLoading,   setMgLoading]   = useState(true)
  const [reqType,     setReqType]     = useState<ReqType>('')
  const [rpt,         setRpt]         = useState(RPT0)
  const [ext,         setExt]         = useState(EXT0)
  const [status,      setStatus]      = useState<Status>('idle')
  const [slackText,   setSlackText]   = useState('')
  const [copied,      setCopied]      = useState(false)
  const [errMsg,      setErrMsg]      = useState('')

  useEffect(() => {
    fetch('/api/turno')
      .then(r => r.json())
      .then(d => { if (d.success) setManagers(d.managers) })
      .catch(() => {})
      .finally(() => setMgLoading(false))
  }, [])

  const today    = new Date()
  const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`

  const slackPreview = [
    `🇧🇷 Date: ${todayStr}`,
    `➡️ Shift started at: ${rpt.ini || '—'} BRA`,
    `🔚 Shift ended at: ${rpt.fin || '—'} BRA`,
    `--------------------------------------------------`,
    `📞 Total number of calls: ${rpt.calls || '—'} (${rpt.callTime || '—'})`,
    `📱 Total WhatsApp calls: ${rpt.waCalls || '—'} (${rpt.waTime || '—'})`,
    `🔗 Invoices sent: ${rpt.invoices || '—'}`,
    `💰 Payments today: +${rpt.payments || '—'} USD`,
    ...(rpt.comments.trim() ? [`📝 Comments: ${rpt.comments}`] : []),
  ].join('\n')

  // ── Progresso ────────────────────────────────────────────────────────────────
  const rptFields  = [rpt.manager, rpt.ini, rpt.fin, rpt.calls, rpt.callTime, rpt.waCalls, rpt.waTime, rpt.invoices, rpt.payments]
  const rptFilled  = rptFields.filter(v => v !== '').length
  const rptTotal   = rptFields.length

  const extAllFields = ext.extType === 'dayChange'
    ? [ext.manager, ext.extType, ext.dayOff, ext.recovery, ext.shift]
    : ext.extType === 'extraHours' ? [ext.manager, ext.extType, ext.hours]
    : [ext.manager, ext.extType]
  const extFilled  = extAllFields.filter(v => v !== '').length
  const extTotal   = Math.max(extAllFields.length, 2)

  const progFilled = reqType === 'report' ? rptFilled : extFilled
  const progTotal  = reqType === 'report' ? rptTotal  : extTotal
  const progPct    = progTotal > 0 ? Math.round((progFilled / progTotal) * 100) : 0

  const barGrad = progPct === 100
    ? 'linear-gradient(90deg,#00FFB2,#00C2FF)'
    : progPct >= 67 ? 'linear-gradient(90deg,rgba(0,255,178,0.7),rgba(0,194,255,0.9))'
    : progPct >= 34 ? 'linear-gradient(90deg,#FFD700,rgba(0,255,178,0.75))'
    : 'linear-gradient(90deg,#FF7878,#FFD700)'

  const rU = (k: keyof typeof RPT0) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setRpt(p => ({ ...p, [k]: e.target.value }))
  const eU = (k: keyof typeof EXT0) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setExt(p => ({ ...p, [k]: e.target.value as any }))

  const rptValid = !!(rpt.manager && rpt.ini && rpt.fin && rpt.calls !== '' && rpt.callTime && rpt.waCalls !== '' && rpt.waTime && rpt.invoices !== '' && rpt.payments !== '')
  const extValid = !!(ext.manager && ext.extType && (ext.extType === 'dayChange' ? (ext.dayOff && ext.recovery && ext.shift) : ext.hours))
  const isValid  = reqType === 'report' ? rptValid : reqType === 'extra' ? extValid : false

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || status === 'loading') return
    setStatus('loading'); setErrMsg('')
    try {
      const body = reqType === 'report'
        ? { action:'report', manager:rpt.manager, horaInicio:rpt.ini, horaFin:rpt.fin, totalCalls:rpt.calls, timeCalls:rpt.callTime, totalWA:rpt.waCalls, timeWA:rpt.waTime, invoices:rpt.invoices, payments:rpt.payments, comments:rpt.comments }
        : { action:'extra', manager:ext.manager, requestType:ext.extType==='dayChange'?'Mudança de Dia':'Horas Extras', dayOff:ext.dayOff, recoveryDay:ext.recovery, shiftDuration:ext.shift, extraHours:ext.hours, comments:ext.comments }
      const res  = await fetch('/api/turno', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.success) {
        if (reqType === 'report') {
          setSlackText([
            `🇧🇷 Date: ${data.date}`,
            `➡️ Shift started at: ${data.horaInicio} BRA`,
            `🔚 Shift ended at: ${data.horaFin} BRA`,
            `--------------------------------------------------`,
            `📞 Total number of calls: ${data.totalCalls} (${data.timeCalls})`,
            `📱 Total WhatsApp calls: ${data.totalWA} (${data.timeWA})`,
            `🔗 Invoices sent: ${data.invoices}`,
            `💰 Payments today: +${data.payments} USD`,
            ...(data.comments?.trim() ? [`📝 Comments: ${data.comments}`] : []),
          ].join('\n'))
        }
        setStatus('success')
      } else {
        setErrMsg(data.error || 'Erro ao registrar'); setStatus('error')
      }
    } catch {
      setErrMsg('Erro de conexão com o servidor'); setStatus('error')
    }
  }

  function reset() {
    setStatus('idle'); setReqType(''); setRpt(RPT0); setExt(EXT0)
    setSlackText(''); setCopied(false); setErrMsg('')
  }
  function selectType(t: ReqType) { setReqType(t); setStatus('idle'); setErrMsg('') }

  const isSuccess = status === 'success'
  const hasPanel  = !!reqType && !mgLoading
  // Spacer: menor en éxito (sin type selector) que durante llenado del form
  const spacerH   = isSuccess ? 108 : 258

  return (
    <div style={{ padding: hasPanel ? '32px 28px 64px' : '52px 28px 64px', display:'grid', gridTemplateColumns: hasPanel ? '1fr 400px' : '1fr', gap:28, alignItems:'start', position:'relative' }}>

      {/* ── Background decoration ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'8%', right:'12%', width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle, rgba(180,126,255,0.055) 0%, transparent 68%)', animation:'orbitPulse 14s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'6%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,255,178,0.035) 0%, transparent 70%)', animation:'orbitPulse 19s ease-in-out infinite 4s' }} />
        <div style={{ position:'absolute', top:'55%', left:'35%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,194,255,0.03) 0%, transparent 70%)', animation:'orbitPulse 11s ease-in-out infinite 2s' }} />
      </div>

      {/* ── LEFT ── */}
      <div style={{ position:'relative', zIndex:1, maxWidth: hasPanel ? 'none' : 560, margin: hasPanel ? '0' : '0 auto', width:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:28, textAlign: hasPanel ? 'left' : 'center' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8, fontFamily:"'Inter',sans-serif" }}>Ferramentas</div>
          <h1 style={{ margin:'0 0 6px', fontSize:28, fontWeight:800, letterSpacing:'-0.02em', background:'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.5))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Inter',sans-serif" }}>
            Registro de Turno
          </h1>
          <p style={{ margin:0, fontSize:13, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif" }}>
            {isSuccess ? '' : 'Selecione o tipo de solicitação para continuar.'}
          </p>
        </div>

        {/* ── SUCCESS: left panel ── */}
        {isSuccess && (
          <div style={{ animation:'fadeUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both' }}>
            {/* Checkmark */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(0,255,178,0.08)', border:'2px solid #00FFB2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 32px rgba(0,255,178,0.2)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00FFB2" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize:9.5, letterSpacing:'0.05em', textTransform:'uppercase', color:'#00FFB2', fontFamily:"'Inter',sans-serif", marginBottom:3 }}>
                  ◈ {reqType === 'report' ? 'Turno registrado' : 'Solicitação enviada'}
                </div>
                <h2 style={{ margin:0, fontSize:22, fontWeight:800, fontFamily:"'Inter',sans-serif", color:'#E8EDF5' }}>Tudo certo!</h2>
              </div>
            </div>

            {/* Info card */}
            <div style={{ borderRadius:12, border:'1px solid rgba(0,255,178,0.12)', background:'rgba(0,255,178,0.04)', padding:'16px 18px', marginBottom:22 }}>
              <p style={{ margin:0, fontSize:13, color:'rgba(232,237,245,0.55)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
                {reqType === 'report'
                  ? <>Dados salvos na planilha de controle e turno marcado. {slackText && <span style={{ color:'rgba(0,255,178,0.8)' }}>Copie o relatório ao lado e cole no Slack.</span>}</>
                  : 'Solicitação registrada nos dois documentos de controle.'
                }
              </p>
            </div>

            {/* Extra: summary of what was sent */}
            {reqType === 'extra' && (
              <div style={{ borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden', marginBottom:22 }}>
                <div style={{ padding:'9px 14px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'rgba(232,237,245,0.3)', fontFamily:"'Inter',sans-serif" }}>Resumo enviado</span>
                </div>
                <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                  {([
                    { label:'Tipo',    value: ext.extType === 'dayChange' ? 'Mudança de Dia' : 'Horas Extras' },
                    { label:'Gerente', value: ext.manager },
                    ...(ext.extType === 'dayChange' ? [
                      { label:'Dia de folga', value: ext.dayOff },
                      { label:'Recuperação',  value: ext.recovery },
                      { label:'Duração',      value: ext.shift },
                    ] : [{ label:'Horas extras', value: ext.hours }]),
                    ...(ext.comments.trim() ? [{ label:'Comentários', value: ext.comments }] : []),
                  ]).map(({ label, value }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:8, borderBottom:'1px solid rgba(255,255,255,0.04)', paddingBottom:6 }}>
                      <span style={{ fontSize:10.5, color:'rgba(232,237,245,0.3)', fontFamily:"'Inter',sans-serif", textTransform:'uppercase', letterSpacing:'0.03em', flexShrink:0 }}>{label}</span>
                      <span style={{ fontSize:12.5, color:'#E8EDF5', fontFamily:"'Inter',sans-serif", fontWeight:600, textAlign:'right' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid rgba(0,255,178,0.25)', background:'rgba(0,255,178,0.06)', color:'#00FFB2', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", letterSpacing:'0.05em', transition:'all 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(0,255,178,0.14)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(0,255,178,0.06)'}}>
              + Nova Solicitação
            </button>
          </div>
        )}

        {/* Type selector (hidden on success) */}
        {!isSuccess && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:26 }}>
            {([
              { id:'report' as ReqType, icon:'🕐', label:'Relatório de Final de Turno',       desc:'Chamadas, pagamentos e marcação de turno na planilha' },
              { id:'extra'  as ReqType, icon:'📅', label:'Mudança de Horário / Horas Extras', desc:'Solicite uma troca de dia ou registre horas extras' },
            ]).map(opt => {
              const active = reqType === opt.id
              return (
                <button key={opt.id} onClick={() => selectType(opt.id)}
                  style={{ padding:'16px 14px', borderRadius:12, border:`1px solid ${active?'rgba(0,255,178,0.4)':'rgba(255,255,255,0.07)'}`, background:active?'rgba(0,255,178,0.07)':'rgba(255,255,255,0.02)', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                  onMouseEnter={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(0,255,178,0.2)';el.style.background='rgba(0,255,178,0.03)'}}}
                  onMouseLeave={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.07)';el.style.background='rgba(255,255,255,0.02)'}}}
                >
                  <div style={{ fontSize:22, marginBottom:9 }}>{opt.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:active?'var(--accent)':'#E8EDF5', fontFamily:"'Inter',sans-serif", marginBottom:4, lineHeight:1.3 }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{opt.desc}</div>
                </button>
              )
            })}
          </div>
        )}

        {mgLoading && !isSuccess && (
          <div style={{ display:'flex', justifyContent:'center', padding:'24px 0' }}>
            <div style={{ width:18, height:18, border:'2px solid rgba(0,255,178,0.15)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.75s linear infinite' }}/>
          </div>
        )}

        {/* ── REPORT FORM ── */}
        {reqType === 'report' && !mgLoading && !isSuccess && (
          <form onSubmit={handleSubmit} style={{ maxWidth: hasPanel ? 'none' : 560 }}>
            <Sec accent="#00FFB2" icon="👤" title="Identificação do Turno">
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10 }}>
                <F label="Gerente">
                  <FS value={rpt.manager} onChange={rU('manager')} required>
                    <option value="">Selecione</option>
                    {managers.map(m => <option key={m} value={m}>{m}</option>)}
                  </FS>
                </F>
                <F label="Início">
                  <FS value={rpt.ini} onChange={rU('ini')} required>
                    <option value="">Hora</option>
                    {START_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </FS>
                </F>
                <F label="Fim">
                  <FS value={rpt.fin} onChange={rU('fin')} required>
                    <option value="">Hora</option>
                    {END_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </FS>
                </F>
              </div>
            </Sec>

            <Sec accent="#00C2FF" icon="📞" title="Chamadas — Sistema (Callgear)">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <F label="Total de chamadas">
                  <FI type="number" min="0" value={rpt.calls} onChange={rU('calls')} placeholder="0" required />
                </F>
                <F label="Tempo total (hh:mm:ss)">
                  <FI type="text" value={rpt.callTime} onChange={rU('callTime')} placeholder="00:00:00" pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}" required />
                </F>
              </div>
            </Sec>

            <Sec accent="#B47EFF" icon="📱" title="Chamadas — WhatsApp">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <F label="Total de chamadas WA">
                  <FI type="number" min="0" value={rpt.waCalls} onChange={rU('waCalls')} placeholder="0" required />
                </F>
                <F label="Tempo total WA (hh:mm:ss)">
                  <FI type="text" value={rpt.waTime} onChange={rU('waTime')} placeholder="00:00:00" pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}" required />
                </F>
              </div>
            </Sec>

            <Sec accent="#FFD700" icon="💰" title="Vendas">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <F label="Links de pagamento enviados">
                  <FI type="number" min="0" value={rpt.invoices} onChange={rU('invoices')} placeholder="0" required />
                </F>
                <F label="Pagamentos recebidos (USD)">
                  <FI type="number" min="0" step="0.01" value={rpt.payments} onChange={rU('payments')} placeholder="0.00" required />
                </F>
              </div>
            </Sec>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Comentários (opcional)</label>
              <FT value={rpt.comments} onChange={rU('comments')} placeholder="Alguma observação..." rows={2} />
            </div>

            {errMsg && <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,77,77,0.07)', border:'1px solid rgba(255,77,77,0.2)', color:'#FF7070', fontSize:12, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>{errMsg}</div>}
            <SubmitBtn valid={rptValid} loading={status==='loading'} label="Registrar Turno" />
          </form>
        )}

        {/* ── EXTRA FORM ── */}
        {reqType === 'extra' && !mgLoading && !isSuccess && (
          <form onSubmit={handleSubmit} style={{ maxWidth: hasPanel ? 'none' : 560 }}>
            <Sec accent="#00FFB2" icon="👤" title="Identificação">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <F label="Gerente">
                  <FS value={ext.manager} onChange={eU('manager')} required>
                    <option value="">Selecione</option>
                    {managers.map(m => <option key={m} value={m}>{m}</option>)}
                  </FS>
                </F>
                <F label="Tipo de solicitação">
                  <FS value={ext.extType} onChange={eU('extType')} required>
                    <option value="">Selecione</option>
                    <option value="dayChange">Mudança de dia de trabalho</option>
                    <option value="extraHours">Horas extras</option>
                  </FS>
                </F>
              </div>
            </Sec>

            {ext.extType === 'dayChange' && (
              <Sec accent="#B47EFF" icon="📅" title="Detalhes da Mudança de Dia">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <MiniCalendar label="Dia que não irá trabalhar" value={ext.dayOff}   onChange={v => setExt(p => ({...p, dayOff:   v}))} />
                  <MiniCalendar label="Dia de recuperação"        value={ext.recovery} onChange={v => setExt(p => ({...p, recovery: v}))} />
                </div>
                <F label="Duração do turno a recuperar">
                  <FS value={ext.shift} onChange={eU('shift')} required>
                    <option value="">Selecione</option>
                    {SHIFT_OPTS.map(o => <option key={o} value={o}>{o === '8 Horas' ? 'Turno Completo (8 Horas)' : o}</option>)}
                  </FS>
                </F>
              </Sec>
            )}

            {ext.extType === 'extraHours' && (
              <Sec accent="#FFD700" icon="⏱" title="Detalhes das Horas Extras">
                <F label="Quantidade de horas extras">
                  <FS value={ext.hours} onChange={eU('hours')} required>
                    <option value="">Selecione</option>
                    <option value="8 Horas">8 Horas</option>
                    <option value="6 Horas">6 Horas</option>
                  </FS>
                </F>
              </Sec>
            )}

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Comentários (opcional)</label>
              <FT value={ext.comments} onChange={eU('comments')} placeholder="Alguma observação..." rows={2} />
            </div>

            {errMsg && <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,77,77,0.07)', border:'1px solid rgba(255,77,77,0.2)', color:'#FF7070', fontSize:12, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>{errMsg}</div>}
            <SubmitBtn valid={extValid} loading={status==='loading'} label="Enviar Solicitação" />
          </form>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      {hasPanel && (
        <div style={{ zIndex:1 }}>
          <div style={{ height: spacerH }} />
          <div style={{ position:'sticky', top:88, display:'flex', flexDirection:'column', gap:14 }}>

            {/* ── SUCCESS: Slack copy panel ── */}
            {isSuccess && reqType === 'report' && slackText && (
              <div style={{ animation:'fadeUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:14 }}>📋</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#E8EDF5', fontFamily:"'Inter',sans-serif" }}>Relatório para o Slack</div>
                    <div style={{ fontSize:11, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif" }}>Clique no texto para copiar</div>
                  </div>
                </div>

                {/* Copyable message */}
                <div onClick={() => { navigator.clipboard.writeText(slackText).then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2500) }) }}
                  style={{ background:'rgba(6,9,14,0.97)', border:`1px solid ${copied?'rgba(0,255,178,0.5)':'rgba(255,255,255,0.1)'}`, borderRadius:14, padding:'20px 22px', fontFamily:'monospace', fontSize:13, lineHeight:1.9, color:copied?'#00FFB2':'rgba(232,237,245,0.85)', whiteSpace:'pre', overflowX:'auto', cursor:'pointer', userSelect:'all' as any, transition:'border-color 0.2s,color 0.2s,box-shadow 0.2s', boxShadow: copied ? '0 0 32px rgba(0,255,178,0.15)' : '0 4px 24px rgba(0,0,0,0.3)', position:'relative' }}>
                  {copied ? '✅  Copiado! Agora cole no Slack.' : slackText}
                  {!copied && (
                    <div style={{ position:'absolute', top:10, right:12, background:'linear-gradient(135deg,rgba(0,255,178,0.15),rgba(0,194,255,0.1))', border:'1px solid rgba(0,255,178,0.3)', borderRadius:6, padding:'3px 10px', fontSize:10, fontWeight:700, color:'#00FFB2', fontFamily:"'Inter',sans-serif", letterSpacing:'0.04em' }}>
                      COPIAR
                    </div>
                  )}
                </div>

                <div style={{ textAlign:'center', marginTop:8, fontSize:10.5, color:'rgba(232,237,245,0.2)', fontFamily:"'Inter',sans-serif" }}>
                  Cole no canal do Slack após copiar
                </div>
              </div>
            )}

            {/* ── FILLING: Progress bar + preview ── */}
            {!isSuccess && (
              <>
                {/* Progress bar */}
                <div style={{ background:'rgba(10,14,20,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em', color:'rgba(232,237,245,0.3)', fontFamily:"'Inter',sans-serif" }}>Progresso</span>
                    <span style={{ fontSize:11.5, fontWeight:700, color: progPct === 100 ? '#00FFB2' : 'rgba(232,237,245,0.45)', fontFamily:"'Inter',sans-serif", transition:'color 0.3s' }}>
                      {progFilled}/{progTotal} campos {progPct === 100 ? '✓' : ''}
                    </span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${progPct}%`, background:barGrad, borderRadius:3, transition:'width 0.35s ease, background 0.5s ease' }} />
                  </div>
                  {progPct === 100 && (
                    <div style={{ marginTop:8, fontSize:11, color:'rgba(0,255,178,0.65)', fontFamily:"'Inter',sans-serif", textAlign:'center', animation:'fadeUp 0.3s ease both' }}>
                      Pronto para enviar! ↓
                    </div>
                  )}
                </div>

                {/* Preview header */}
                <div style={{ fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(232,237,245,0.2)', fontFamily:"'Inter',sans-serif", display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ width:16, height:1, background:'rgba(0,255,178,0.25)', display:'inline-block' }}/>
                  Preview em tempo real
                  <span style={{ width:16, height:1, background:'rgba(0,255,178,0.25)', display:'inline-block' }}/>
                </div>

                {/* Read-only preview (report) */}
                {reqType === 'report' && (
                  <div style={{ background:'rgba(6,9,14,0.96)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 22px', fontFamily:'monospace', fontSize:13, lineHeight:1.9, color:'rgba(232,237,245,0.65)', whiteSpace:'pre', overflowX:'auto', userSelect:'none' as any, cursor:'default', position:'relative' }}>
                    {slackPreview}
                    <div style={{ position:'absolute', bottom:9, right:12, fontSize:10, color:'rgba(232,237,245,0.18)', fontFamily:"'Inter',sans-serif" }}>
                      Copiar disponível após envio
                    </div>
                  </div>
                )}

                {/* Summary card (extra) */}
                {reqType === 'extra' && (ext.manager || ext.extType) && (
                  <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.09)', overflow:'hidden' }}>
                    <div style={{ padding:'11px 18px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize:10.5, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(232,237,245,0.35)', fontFamily:"'Inter',sans-serif", fontWeight:700 }}>Resumo da Solicitação</div>
                    </div>
                    <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:9 }}>
                      {([
                        { label:'Tipo',    value: ext.extType === 'dayChange' ? 'Mudança de Dia' : ext.extType === 'extraHours' ? 'Horas Extras' : '—' },
                        { label:'Gerente', value: ext.manager || '—' },
                        ...(ext.extType === 'dayChange' ? [
                          { label:'Dia de folga', value: ext.dayOff   || '—' },
                          { label:'Recuperação',  value: ext.recovery || '—' },
                          { label:'Duração',      value: ext.shift    || '—' },
                        ] : ext.extType === 'extraHours' ? [
                          { label:'Horas extras', value: ext.hours || '—' },
                        ] : []),
                        ...(ext.comments.trim() ? [{ label:'Comentários', value: ext.comments }] : []),
                      ]).map(({ label, value }) => (
                        <div key={label} style={{ display:'flex', justifyContent:'space-between', gap:8, borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:8 }}>
                          <span style={{ fontSize:11, color:'rgba(232,237,245,0.35)', fontFamily:"'Inter',sans-serif", textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>{label}</span>
                          <span style={{ fontSize:13, color:value==='—'?'rgba(232,237,245,0.18)':'#E8EDF5', fontFamily:"'Inter',sans-serif", fontWeight:value!=='—'?600:400, textAlign:'right' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
