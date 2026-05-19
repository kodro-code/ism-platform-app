'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';


interface Venta { rowIndex: number; data: (string | number)[] }
interface VentasResp { success: boolean; headers: string[]; data: Venta[] }

const MONTH_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const PAYMENT_OPTIONS = [
  { value: 'Stripe - Full payment',              label: 'Stripe' },
  { value: 'Ebanx - Pix - Boleto - Debit Card', label: 'Ebanx — Pix / Boleto / Débito' },
  { value: 'Ebanx - Credit Card',               label: 'Ebanx — Cartão de Crédito' },
  { value: 'Deposit',                           label: 'Depósito' },
  { value: 'Internal installment 1',            label: 'Parcelamento Interno 1' },
  { value: 'Internal installment 2',            label: 'Parcelamento Interno 2' },
  { value: 'Internal installment 3',            label: 'Parcelamento Interno 3' },
  { value: 'Internal installment 4',            label: 'Parcelamento Interno 4' },
];
const COURSES     = ['FunTech','Scratch','Roblox','Python LVL 1','Python LVL 2','DC LVL 1','DC LVL 2','FWD Pro','Unity'];
const FORMATS     = [
  { value: 'Premium',        label: 'Premium' },
  { value: 'Standard',       label: 'Standard' },
  { value: 'Upgrade to PRM', label: 'Upgrade → PRM' },
  { value: 'Upgrade to IND', label: 'Upgrade → IND' },
];
const WORK_FRONTS = ['Prolongation','Upsale Grads','FP RP Upsale','Cohort','Graduate','Referral','WhatsApp','Adaptation'];
const REQUIRED    = ['manager','amoLink','paymentType','amountUsd','amountBrl','numLessons','course','format','workFront'] as const;
const COLORS      = ['#00FFB2','#00C2FF','#B47EFF','#FFD700','#FF6B6B'];
const EMPTY       = { manager:'', amoLink:'', paymentType:'', amountUsd:'', amountBrl:'', numLessons:'', course:'', format:'', workFront:'', comment:'' };

type Status = 'idle' | 'loading' | 'success' | 'error';
interface Particle { id: number; x: number; color: string; size: number; duration: number; delay: number; }

function playSuccessSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.start(t); osc.stop(t + 0.7);
    });
  } catch {}
}

// ── field styles ──────────────────────────────────────────────────────────────
const baseInp: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  borderRadius: 8, color: '#E8EDF5', fontSize: 12.5,
  fontFamily: "'DM Sans', sans-serif", outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  appearance: 'none' as any, border: '1px solid transparent',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10.5, letterSpacing: '0.04em',
  textTransform: 'uppercase', color: 'rgba(232,237,245,0.4)',
  marginBottom: 5, fontFamily: "'Inter', sans-serif", fontWeight: 600,
};
const arrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300FFB2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 10px center / 14px`;

function fst(focused: boolean, hasValue: boolean) {
  if (focused)  return { borderColor:'rgba(0,255,178,0.5)', boxShadow:'0 0 0 3px rgba(0,255,178,0.07)', background:'rgba(0,255,178,0.05)' };
  if (hasValue) return { borderColor:'rgba(0,255,178,0.25)', boxShadow:'none', background:'rgba(0,255,178,0.03)' };
  return        { borderColor:'rgba(255,255,255,0.08)', boxShadow:'none', background:'#06090E' };
}

function FI({ style, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false);
  const s = fst(f, !!p.value);
  return <input {...p} style={{ ...baseInp, ...s, ...style }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />;
}
function FS({ style, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [f, setF] = useState(false);
  const s = fst(f, !!p.value);
  return (
    <select {...p} style={{ ...baseInp, ...s, ...style, background:`${arrow}, ${s.background}`, paddingRight:32, colorScheme:'dark' as any }} onFocus={()=>setF(true)} onBlur={()=>setF(false)}>
      {children}
    </select>
  );
}
function FT({ style, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f, setF] = useState(false);
  const s = fst(f, !!(p.value as string));
  return <textarea {...p} style={{ ...baseInp, ...s, ...style, resize:'none' }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} />;
}
function F({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={style}><label style={lbl}>{label}</label>{children}</div>;
}

// ── section card ──────────────────────────────────────────────────────────────
function Section({ accent, icon, title, children }: {
  accent: string; icon: string; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${accent}22`, flexShrink: 0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', background:`${accent}0A`, borderBottom:`1px solid ${accent}18` }}>
        <span style={{ fontSize:12 }}>{icon}</span>
        <span style={{ fontSize:10.5, letterSpacing:'0.04em', textTransform:'uppercase', color:`${accent}CC`, fontFamily:"'Inter', sans-serif", fontWeight:700 }}>{title}</span>
      </div>
      <div style={{ padding:'12px 14px', background:'#0B0F16', display:'flex', flexDirection:'column', gap:10 }}>
        {children}
      </div>
    </div>
  );
}

// ── stat row ──────────────────────────────────────────────────────────────────
function SR({ label, value, hi=false }: { label:string; value:string; hi?:boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize:10, color:'rgba(232,237,245,0.3)', letterSpacing:'0.03em', textTransform:'uppercase', fontFamily:"'Inter', sans-serif" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:700, color: hi ? '#00FFB2' : '#E8EDF5', fontFamily:"'Inter', sans-serif", transition:'color 0.3s' }}>{value}</span>
    </div>
  );
}

// ── date helpers ──────────────────────────────────────────────────────────────
function parseDateFE(s: string): Date | null {
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2]-1, +iso[3]);
  const sl  = s.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
  if (sl)  return new Date(+sl[1],  +sl[2]-1,  +sl[3]);
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) return new Date(+mdy[3], +mdy[1]-1, +mdy[2]);
  return null;
}
function fmtDateCell(s: string): string {
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  const p = parseDateFE(s);
  if (p) return `${String(p.getDate()).padStart(2,'0')}/${String(p.getMonth()+1).padStart(2,'0')}/${p.getFullYear()}`;
  return s;
}
function fmtNum(val: string | number, prefix: string, decimals = 2): string {
  const n = parseFloat(String(val));
  return isNaN(n) ? String(val) : `${prefix}${n.toFixed(decimals)}`;
}

// ── ventas section ────────────────────────────────────────────────────────────
function VentasSection({ ventas, ventaHeaders, loadingV, deletingRow, SHOW_COLS, loadVentas, deleteVenta }: {
  ventas: Venta[]; ventaHeaders: string[]; loadingV: boolean; deletingRow: number | null;
  SHOW_COLS: number[];
  loadVentas: () => void; deleteVenta: (rowIndex: number) => void;
}) {
  const today = new Date();
  const [selYear,  setSelYear]  = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth());
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  // Meses disponibles (cronológico)
  const availMonths = useMemo(() => {
    const seen = new Set<string>();
    const list: { y: number; m: number }[] = [];
    ventas.forEach(v => {
      const d = parseDateFE(String(v.data[3] ?? ''));
      if (!d) return;
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(k)) { seen.add(k); list.push({ y: d.getFullYear(), m: d.getMonth() }); }
    });
    return list.sort((a, b) => a.y !== b.y ? a.y - b.y : a.m - b.m);
  }, [ventas]);

  // Filas del mes seleccionado
  const rows = useMemo(() => ventas.filter(v => {
    const d = parseDateFE(String(v.data[3] ?? ''));
    return d && d.getFullYear() === selYear && d.getMonth() === selMonth;
  }), [ventas, selYear, selMonth]);

  // Totales
  const totalMonth = rows.reduce((s, v) => s + (parseFloat(String(v.data[5])) || 0), 0);
  const totalToday = rows
    .filter(v => { const d = parseDateFE(String(v.data[3] ?? '')); return d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); })
    .reduce((s, v) => s + (parseFloat(String(v.data[5])) || 0), 0);

  const mesLabel = `${MONTH_PT[selMonth].slice(0,3)} ${selYear}`;

  return (
    <div style={{ padding:'32px 28px 48px', borderTop:'1px solid rgba(255,255,255,0.06)', position:'relative', zIndex:1, background:'rgba(6,9,14,0.85)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:13 }}>📋</span>
        <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(232,237,245,0.5)', fontFamily:"'Inter',sans-serif" }}>Histórico de Vendas</span>
        <button onClick={loadVentas} disabled={loadingV}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(232,237,245,0.5)', fontSize:11, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(0,255,178,0.3)';(e.currentTarget as HTMLElement).style.color='var(--accent)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.color='rgba(232,237,245,0.5)';}}>
          {loadingV ? <div style={{ width:11, height:11, border:'1.5px solid rgba(0,255,178,0.2)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/> : '↻'} Atualizar
        </button>
      </div>

      {/* Tabs de meses */}
      {availMonths.length > 0 && (
        <div style={{ display:'flex', gap:5, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
          {availMonths.map(({ y, m }) => {
            const active = y === selYear && m === selMonth;
            return (
              <button key={`${y}-${m}`} onClick={() => { setSelYear(y); setSelMonth(m); }}
                style={{ flexShrink:0, padding:'4px 11px', borderRadius:20, border:`1px solid ${active ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.07)'}`, background: active ? 'rgba(0,255,178,0.1)' : 'transparent', color: active ? 'var(--accent)' : 'rgba(232,237,245,0.35)', fontSize:11, fontWeight: active ? 700 : 400, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', whiteSpace:'nowrap' }}>
                {MONTH_PT[m].slice(0,3)} {y}
              </button>
            );
          })}
        </div>
      )}

      {/* Totales */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, marginBottom:18 }}>
        <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(0,255,178,0.05)', border:'1px solid rgba(0,255,178,0.12)' }}>
          <div style={{ fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(0,255,178,0.45)', fontFamily:"'Inter',sans-serif", marginBottom:3 }}>Total Hoje</div>
          <div style={{ fontSize:20, fontWeight:800, color:'#00FFB2', fontFamily:"'Inter',sans-serif" }}>${totalToday.toFixed(2)}</div>
        </div>
        <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(0,194,255,0.05)', border:'1px solid rgba(0,194,255,0.12)' }}>
          <div style={{ fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(0,194,255,0.45)', fontFamily:"'Inter',sans-serif", marginBottom:3 }}>Total {mesLabel}</div>
          <div style={{ fontSize:20, fontWeight:800, color:'#00C2FF', fontFamily:"'Inter',sans-serif" }}>${totalMonth.toFixed(2)}</div>
        </div>
        <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:70 }}>
          <div style={{ fontSize:20, fontWeight:800, color:'rgba(232,237,245,0.6)', fontFamily:"'Inter',sans-serif" }}>{rows.length}</div>
          <div style={{ fontSize:9, color:'rgba(232,237,245,0.25)', fontFamily:"'Inter',sans-serif", textTransform:'uppercase', letterSpacing:'0.05em' }}>{rows.length === 1 ? 'venda' : 'vendas'}</div>
        </div>
      </div>

      {/* Tabla */}
      {loadingV && ventas.length === 0 ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'32px 0' }}>
          <div style={{ width:22, height:22, border:'2px solid rgba(0,255,178,0.15)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.75s linear infinite' }}/>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:'rgba(232,237,245,0.25)', fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
          Nenhuma venda em {MONTH_PT[selMonth]} {selYear}.
        </div>
      ) : (
        <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, fontFamily:"'Inter',sans-serif" }}>
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                {SHOW_COLS.map(ci => (
                  <th key={ci} style={{ padding:'10px 14px', textAlign:'left', fontSize:9.5, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(232,237,245,0.35)', whiteSpace:'nowrap', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    {ventaHeaders[ci] ?? ''}
                  </th>
                ))}
                <th style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)', width:40 }}/>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => (
                <tr key={v.rowIndex} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.12s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                  {SHOW_COLS.map(ci => {
                    const raw  = v.data[ci] ?? '';
                    const hdr  = ventaHeaders[ci] ?? '';
                    const isUSD  = hdr === 'Amount USD';
                    const isBRL  = hdr === 'Amount BRL';
                    const isPPL  = hdr === 'ppl';
                    const isDisc = hdr === '% Discount';
                    const isDate = hdr === 'Date of payment';
                    let text = String(raw);
                    if ((isUSD || isPPL) && raw !== '')  text = fmtNum(raw, '$');
                    else if (isBRL && raw !== '')        text = fmtNum(raw, 'R$');
                    else if (isDisc && raw !== '')       text = `${(parseFloat(String(raw)) * 100).toFixed(2)}%`;
                    else if (isDate && raw !== '')       text = fmtDateCell(String(raw));
                    return (
                      <td key={ci} style={{ padding:'10px 14px', whiteSpace:'nowrap',
                        color: isUSD||isPPL ? '#00FFB2' : isBRL ? '#00C2FF' : isDate ? 'rgba(232,237,245,0.9)' : isDisc ? 'rgba(255,215,0,0.85)' : 'rgba(232,237,245,0.65)',
                        fontWeight: isUSD||isBRL||isPPL ? 700 : 400, fontSize: isDate ? 11 : 12 }}>
                        {text}
                      </td>
                    );
                  })}
                  <td style={{ padding:'10px 8px', textAlign:'center' }}>
                    <button onClick={() => setPendingDelete(v.rowIndex)} disabled={deletingRow === v.rowIndex}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,77,77,0.4)', fontSize:13, padding:'4px 6px', borderRadius:6, transition:'all 0.12s', lineHeight:1 }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#FF7070';(e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.08)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,77,77,0.4)';(e.currentTarget as HTMLElement).style.background='none';}}>
                      {deletingRow === v.rowIndex ? '…' : '🗑'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {pendingDelete !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(5px)' }}
          onClick={() => setPendingDelete(null)}>
          <div style={{ background:'rgba(13,17,23,0.99)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:16, padding:'28px 32px', maxWidth:360, width:'90%', boxShadow:'0 24px 64px rgba(0,0,0,0.7)', animation:'fadeUp 0.18s ease both' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:12, textAlign:'center' }}>🗑</div>
            <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:'#E8EDF5', fontFamily:"'Inter',sans-serif", textAlign:'center' }}>Excluir registro?</h3>
            <p style={{ margin:'0 0 24px', fontSize:13, color:'rgba(232,237,245,0.45)', fontFamily:"'DM Sans',sans-serif", textAlign:'center', lineHeight:1.5 }}>
              Esta ação não pode ser desfeita. O registro será removido permanentemente da planilha.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setPendingDelete(null)}
                style={{ flex:1, padding:'10px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(232,237,245,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLElement).style.color='#E8EDF5';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='rgba(232,237,245,0.6)';}}>
                Não
              </button>
              <button onClick={() => { deleteVenta(pendingDelete); setPendingDelete(null); }}
                style={{ flex:1, padding:'10px', borderRadius:9, border:'1px solid rgba(255,77,77,0.3)', background:'rgba(255,77,77,0.08)', color:'#FF7070', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.18)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,77,77,0.5)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.08)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,77,77,0.3)';}}>
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function Relatorio() {
  const { data: session }         = useSession();
  const [managers, setManagers]   = useState<{ name: string }[]>([]);
  const [form, setForm]           = useState(EMPTY);
  const [status, setStatus]       = useState<Status>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ventas, setVentas]       = useState<Venta[]>([]);
  const [ventaHeaders, setVentaHeaders] = useState<string[]>([]);
  const [loadingV, setLoadingV]   = useState(false);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);

  const loadVentas = useCallback(async () => {
    if (!session?.user?.pestana) return;
    setLoadingV(true);
    try {
      const res: VentasResp = await fetch('/api/ventas').then(r => r.json());
      if (res.success) { setVentaHeaders(res.headers); setVentas(res.data); }
    } catch {}
    setLoadingV(false);
  }, [session?.user?.pestana]);

  useEffect(() => {
    fetch('/api/relatorio').then(r => r.json()).then(setManagers).catch(() => {});
  }, []);

  useEffect(() => { loadVentas(); }, [loadVentas]);

  const upd = (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const lessons = parseInt(form.numLessons)  || 0;
  const usd     = parseFloat(form.amountUsd) || 0;
  const brl     = parseFloat(form.amountBrl) || 0;
  const ppl     = lessons > 0 && usd > 0 ? usd / lessons : 0;
  const realBRL = form.format === 'Premium' ? lessons * 110 : lessons > 0 ? lessons * 60 : 0;
  const disc    = realBRL > 0 && brl > 0 ? ((realBRL - brl) / realBRL) * 100 : 0;
  const filled  = REQUIRED.filter(k => form[k]).length;
  const isValid = filled === REQUIRED.length;
  const pct     = Math.round((filled / REQUIRED.length) * 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setStatus('loading');
    try {
      const res  = await fetch('/api/relatorio', { method:'POST', body:JSON.stringify(form), headers:{ 'Content-Type':'application/json' } });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setParticles(Array.from({ length: 24 }, (_, i) => ({ id:i, x:5+Math.random()*90, color:COLORS[i%COLORS.length], size:5+Math.random()*9, duration:0.8+Math.random()*0.9, delay:Math.random()*0.4 })));
        setStatus('success');
        loadVentas();
      } else { setStatus('error'); }
    } catch { setStatus('error'); }
  }

  function reset() { setForm(EMPTY); setStatus('idle'); setParticles([]); }

  async function deleteVenta(rowIndex: number) {
    setDeletingRow(rowIndex);
    try {
      const res = await fetch('/api/ventas', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ rowIndex }) });
      const data = await res.json();
      if (data.success) setVentas(v => v.filter(x => x.rowIndex !== rowIndex));
    } catch {}
    setDeletingRow(null);
  }

  // ── success ────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'calc(100vh - 73px)', overflow:'hidden' }}>
        {particles.map(p => (
          <div key={p.id} style={{ position:'absolute', bottom:'42%', left:`${p.x}%`, width:p.size, height:p.size, borderRadius:'50%', background:p.color, boxShadow:`0 0 ${p.size*2}px ${p.color}80`, animation:`floatUp ${p.duration}s ease-out ${p.delay}s both` }} />
        ))}
        <div className="panel-scale" style={{ textAlign:'center', zIndex:1 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(0,255,178,0.08)', border:'2px solid #00FFB2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 0 50px rgba(0,255,178,0.22)' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00FFB2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase', color:'#00FFB2', marginBottom:10, fontFamily:"'Inter', sans-serif" }}>◈ Relatório enviado</div>
          <h2 style={{ fontSize:28, fontWeight:800, fontFamily:"'Inter', sans-serif", marginBottom:8 }}>Tudo certo!</h2>
          <p style={{ fontSize:13, color:'rgba(232,237,245,0.4)', marginBottom:32 }}>Dados salvos e Telegram notificado.</p>
          <button onClick={reset}
            style={{ padding:'11px 36px', borderRadius:10, border:'1px solid rgba(0,255,178,0.3)', background:'rgba(0,255,178,0.08)', color:'#00FFB2', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter', sans-serif", letterSpacing:'0.05em', transition:'all 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(0,255,178,0.16)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(0,255,178,0.08)'}}>
            Novo Relatório
          </button>
        </div>
      </div>
    );
  }

  const SHOW_COLS = [3,4,5,6,7,8,10,11,12,13,14];

  // ── layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - 73px)', position:'relative' }}>

    {/* ── FORM + PREVIEW ── */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', height:'calc(100vh - 73px)', overflow:'hidden', position:'relative', zIndex:1 }}>

      {/* ── LEFT ── */}
      <form onSubmit={submit} style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto', background:'rgba(6,9,14,0.72)', backdropFilter:'blur(2px)' }}>

        {/* progress header — reemplaza el título duplicado */}
        <div style={{ flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(232,237,245,0.25)', fontFamily:"'Inter', sans-serif" }}>
              {filled === 0 ? 'Preencha os campos abaixo' : filled < REQUIRED.length ? `${REQUIRED.length - filled} campo${REQUIRED.length - filled > 1 ? 's' : ''} restante${REQUIRED.length - filled > 1 ? 's' : ''}` : '✓ Pronto para enviar'}
            </div>
            <div style={{ padding:'4px 14px', borderRadius:20, background: isValid ? 'rgba(0,255,178,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${isValid ? 'rgba(0,255,178,0.35)' : 'rgba(255,255,255,0.08)'}`, fontSize:13, fontWeight:800, color: isValid ? '#00FFB2' : 'rgba(232,237,245,0.35)', fontFamily:"'Inter', sans-serif", transition:'all 0.3s', boxShadow: isValid ? '0 0 12px rgba(0,255,178,0.2)' : 'none' }}>
              {pct}%
            </div>
          </div>
          {/* barra grande */}
          <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:4, transition:'width 0.4s ease, box-shadow 0.3s ease',
              background: pct === 100
                ? 'linear-gradient(90deg,#00FFB2,#00C2FF)'
                : pct >= 55
                ? 'linear-gradient(90deg,rgba(0,255,178,0.75),rgba(0,194,255,0.75))'
                : 'linear-gradient(90deg,rgba(0,255,178,0.4),rgba(0,194,255,0.4))',
              boxShadow: isValid ? '0 0 14px rgba(0,255,178,0.45)' : 'none'
            }} />
          </div>
        </div>

        {/* IDENTIFICAÇÃO */}
        <Section accent="#00FFB2" icon="👤" title="Identificação">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <F label="Gerente (Manager)">
              <FS value={form.manager} onChange={upd('manager')} required>
                <option value="">Selecione um Gerente</option>
                {managers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </FS>
            </F>
            <F label="Link do BO">
              <FI type="text" value={form.amoLink} onChange={upd('amoLink')} placeholder="https://..." required />
            </F>
          </div>
        </Section>

        {/* PAGAMENTO */}
        <Section accent="#FFD700" icon="💳" title="Pagamento">
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10 }}>
            <F label="Forma de Pagamento">
              <FS value={form.paymentType} onChange={upd('paymentType')} required>
                <option value="">Selecione</option>
                {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FS>
            </F>
            <F label="Valor USD">
              <FI type="number" step="0.01" min="0" value={form.amountUsd} onChange={upd('amountUsd')} placeholder="0.00" required />
            </F>
            <F label="Valor BRL">
              <FI type="number" step="0.01" min="0" value={form.amountBrl} onChange={upd('amountBrl')} placeholder="0.00" required />
            </F>
          </div>
        </Section>

        {/* CURSO */}
        <Section accent="#00C2FF" icon="📚" title="Curso">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr 1.2fr 1.4fr', gap:10 }}>
            <F label="Nº Aulas">
              <FI type="number" min="1" value={form.numLessons} onChange={upd('numLessons')} placeholder="0" required />
            </F>
            <F label="Curso">
              <FS value={form.course} onChange={upd('course')} required>
                <option value="">Selecione</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </FS>
            </F>
            <F label="Formato">
              <FS value={form.format} onChange={upd('format')} required>
                <option value="">Selecione</option>
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </FS>
            </F>
            <F label="Lista do Lead">
              <FS value={form.workFront} onChange={upd('workFront')} required>
                <option value="">Selecione</option>
                {WORK_FRONTS.map(w => <option key={w} value={w}>{w}</option>)}
              </FS>
            </F>
          </div>
        </Section>

        {/* COMENTÁRIO — fijo, no crece */}
        <div style={{ flexShrink:0 }}>
          <F label="Comentário (opcional)">
            <FT value={form.comment} onChange={upd('comment')} placeholder="Alguma observação extra..." rows={2} />
          </F>
        </div>

        {/* SUBMIT */}
        <div style={{ flexShrink:0, paddingBottom:8 }}>
          <SubmitBtn status={status} isValid={isValid} />
        </div>

      </form>

      {/* ── RIGHT — preview ── */}
      <div style={{ borderLeft:'1px solid rgba(255,255,255,0.07)', background:'#080B10', padding:'20px 18px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>

        <div style={{ fontSize:9.5, letterSpacing:'0.04em', textTransform:'uppercase', color:'rgba(232,237,245,0.18)', fontFamily:"'Inter', sans-serif", flexShrink:0 }}>— Preview em tempo real</div>

        {/* manager */}
        <div style={{ padding:'11px 13px', background:'rgba(0,255,178,0.04)', border:'1px solid rgba(0,255,178,0.12)', borderRadius:10, flexShrink:0 }}>
          <div style={{ fontSize:9, letterSpacing:'0.15em', color:'rgba(0,255,178,0.5)', textTransform:'uppercase', fontFamily:"'Inter', sans-serif", marginBottom:4 }}>Manager</div>
          <div style={{ fontSize:12, fontWeight:700, color: form.manager ? '#E8EDF5' : 'rgba(232,237,245,0.18)', fontFamily:"'Inter', sans-serif", transition:'color 0.25s', lineHeight:1.4 }}>
            {form.manager || '—'}
          </div>
        </div>

        {/* stats */}
        <div style={{ flexShrink:0 }}>
          <SR label="USD"            value={usd>0      ? `$${usd.toFixed(2)}`        : '—'} hi={usd>0} />
          <SR label="BRL"            value={brl>0      ? `R$ ${brl.toFixed(2)}`      : '—'} />
          <SR label="Aulas"          value={lessons>0  ? String(lessons)             : '—'} />
          <SR label="PPL"            value={ppl>0      ? `$${ppl.toFixed(2)}`        : '—'} hi={ppl>0} />
          <SR label="Real BRL"       value={realBRL>0  ? `R$ ${realBRL.toFixed(2)}` : '—'} />
          <SR label="Desconto"       value={realBRL>0&&brl>0 ? `${disc.toFixed(1)}%` : '—'} />
        </div>

        {/* tags */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, flexShrink:0, minHeight:22 }}>
          {[form.course, form.format, form.workFront].filter(Boolean).map(tag => (
            <span key={tag} style={{ padding:'3px 8px', borderRadius:5, background:'rgba(0,194,255,0.07)', border:'1px solid rgba(0,194,255,0.2)', fontSize:10, color:'#00C2FF', fontFamily:"'Inter', sans-serif" }}>{tag}</span>
          ))}
        </div>

        {/* payment */}
        {form.paymentType && (
          <div style={{ padding:'8px 11px', background:'rgba(255,215,0,0.04)', border:'1px solid rgba(255,215,0,0.12)', borderRadius:8, flexShrink:0 }}>
            <div style={{ fontSize:9, color:'rgba(255,215,0,0.45)', letterSpacing:'0.03em', textTransform:'uppercase', fontFamily:"'Inter', sans-serif", marginBottom:3 }}>Pagamento</div>
            <div style={{ fontSize:11, color:'#FFD700' }}>{PAYMENT_OPTIONS.find(o=>o.value===form.paymentType)?.label}</div>
          </div>
        )}

        {/* comment */}
        {form.comment && (
          <div style={{ padding:'8px 11px', background:'rgba(180,126,255,0.04)', border:'1px solid rgba(180,126,255,0.12)', borderRadius:8, flexShrink:0 }}>
            <div style={{ fontSize:9, color:'rgba(180,126,255,0.45)', letterSpacing:'0.03em', textTransform:'uppercase', fontFamily:"'Inter', sans-serif", marginBottom:3 }}>Comentário</div>
            <div style={{ fontSize:11, color:'rgba(232,237,245,0.5)', lineHeight:1.5 }}>{form.comment}</div>
          </div>
        )}

        {/* dots al fondo */}
        <div style={{ marginTop:'auto', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
            <span style={{ fontSize:9.5, color:'rgba(232,237,245,0.18)', letterSpacing:'0.03em', textTransform:'uppercase', fontFamily:"'Inter', sans-serif" }}>Preenchimento</span>
            <span style={{ fontSize:10, color: isValid ? '#00FFB2' : 'rgba(232,237,245,0.2)', fontFamily:"'Inter', sans-serif", fontWeight:700, transition:'color 0.3s' }}>{pct}%</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${REQUIRED.length},1fr)`, gap:3 }}>
            {REQUIRED.map((k,i) => (
              <div key={k} style={{ height:3, borderRadius:2, background: form[k] ? '#00FFB2' : 'rgba(255,255,255,0.06)', transition:`background 0.3s ease ${i*40}ms` }} />
            ))}
          </div>
        </div>

      </div>
    </div>{/* /grid form+preview */}

    {/* ── MINHAS VENDAS ── */}
    <VentasSection
      ventas={ventas} ventaHeaders={ventaHeaders} loadingV={loadingV} deletingRow={deletingRow}
      SHOW_COLS={SHOW_COLS}
      loadVentas={loadVentas} deleteVenta={deleteVenta}
    />

    </div>
  );
}

// ── submit button ─────────────────────────────────────────────────────────────
function SubmitBtn({ status, isValid }: { status: Status; isValid: boolean }) {
  const [hov, setHov] = useState(false);
  const loading = status === 'loading';
  const error   = status === 'error';
  const bg = error   ? 'linear-gradient(135deg,#ef4444,#dc2626)'
           : isValid ? 'linear-gradient(135deg,#00FFB2,#00C2FF)'
           : 'rgba(255,255,255,0.04)';
  return (
    <button type="submit" disabled={!isValid || loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:bg,
        color: isValid ? '#080B10' : 'rgba(232,237,245,0.18)', fontSize:13, fontWeight:800,
        cursor: isValid&&!loading ? 'pointer' : 'not-allowed',
        fontFamily:"'Inter', sans-serif", letterSpacing:'0.06em',
        transition:'all 0.25s',
        transform: hov&&isValid&&!loading ? 'translateY(-2px)' : 'none',
        boxShadow: hov&&isValid&&!loading ? '0 8px 24px rgba(0,255,178,0.22)' : 'none',
        display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
      {loading
        ? <><div style={{ width:14, height:14, border:'2px solid rgba(8,11,16,0.3)', borderTopColor:'#080B10', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Enviando...</>
        : error ? 'Erro — Tentar Novamente' : 'Confirmar Relatório'}
    </button>
  );
}
