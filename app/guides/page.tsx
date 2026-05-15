'use client'

import { useState } from 'react'
import DiamondBg from '@/components/diamond-bg'
import BOFlowView from '@/components/guides-bo-flow'

type Section = 'multas' | 'crescimento' | 'bo-flow'

interface Multa {
  icon: string
  infracao: string
  multa: string
  observacao: string
  nivel: 'baixo' | 'medio' | 'alto' | 'critico'
}

const NIVEL_COR = {
  baixo:   '#FFD700',
  medio:   '#FF9A3C',
  alto:    '#FF4C4C',
  critico: '#FF1744',
}
const NIVEL_LABEL = { baixo:'Baixo', medio:'Médio', alto:'Alto', critico:'Crítico' }

const MULTAS: Multa[] = [
  { icon:'📉', infracao:'Baixa Utilização',                      multa:'$2 por dia',                       observacao:'Aplica-se quando a utilização fica abaixo do esperado.',                                    nivel:'baixo'   },
  { icon:'⏱️', infracao:'Atraso no Processamento de Leads',      multa:'$1 por lead',                      observacao:'Baseado no número de leads não processados dentro do prazo esperado.',                       nivel:'baixo'   },
  { icon:'🎙️', infracao:'Execução Ruim do Script de Chamadas',   multa:'$2 a $10 por ocorrência',          observacao:'A multa depende da gravidade e frequência da falha.',                                        nivel:'medio'   },
  { icon:'🔔', infracao:'Começar o Turno Atrasado',              multa:'$10 por ocorrência',               observacao:'Aplica-se mesmo se atrasar 5 minutos ou mais.',                                             nivel:'medio'   },
  { icon:'⏰', infracao:'Trabalhar Menos Horas que o Requerido', multa:'Repor horas ou desconto no salário',observacao:'Monitorado semanalmente. Se não reposto, descontado do salário fixo.',                      nivel:'alto'    },
  { icon:'❌', infracao:'Faltar Sem Avisar',                     multa:'$16 a $25 por ocorrência',         observacao:'A multa depende do contexto e da frequência.',                                               nivel:'alto'    },
  { icon:'👻', infracao:'Falsificação de Chamadas',              multa:'$5 por dia',                       observacao:'Inclui chamadas falsas, chamadas fantasma ou atividade simulada.',                           nivel:'alto'    },
  { icon:'📋', infracao:'Falsificação de Resultados',            multa:'$15 por ocorrência',               observacao:'Inclui vendas, leads ou dados manipulados.',                                                 nivel:'alto'    },
  { icon:'⚠️', infracao:'Quebra da Cultura da Empresa',          multa:'Demissão imediata',                observacao:'Inclui desrespeito, desonestidade ou comportamento tóxico. Tolerância zero.',                nivel:'critico' },
]

// ── Thermometer stages ────────────────────────────────────────────────────────
const BAR_H   = 440
const STAGES  = [
  { frac:0,    label:'Funcionário ativo', sub:'Sem infrações',  color:'#22C55E', dot:'#22C55E' },
  { frac:0.22, label:'Baixo risco',       sub:'$1–$2 / dia',    color:'#FFD700', dot:'#FFD700' },
  { frac:0.44, label:'Risco moderado',    sub:'$2–$10',         color:'#FF9A3C', dot:'#FF9A3C' },
  { frac:0.66, label:'Risco crítico',     sub:'$10–$25',        color:'#FF4C4C', dot:'#FF4C4C' },
  { frac:0.88, label:'Demissão',          sub:'Saída imediata', color:'#FF1744', dot:'#FF1744' },
]

// ── Thermometer component ─────────────────────────────────────────────────────
function CaminhoSaida() {
  const LINE_X = 9

  return (
    <div style={{ width:190, flexShrink:0 }}>
      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(232,237,245,0.22)', marginBottom:14, textAlign:'center', fontFamily:"'Inter',sans-serif" }}>
        Caminho para a Saída
      </div>

      <div style={{ position:'relative', height:BAR_H }}>

        {/* Gradient vertical line */}
        <div style={{
          position:'absolute',
          left:LINE_X, top:0, bottom:0, width:3, borderRadius:99,
          background:'linear-gradient(180deg,#22C55E 0%,#FFD700 22%,#FF9A3C 44%,#FF4C4C 66%,#FF1744 88%,#FF1744 100%)',
          opacity:0.7,
        }}/>

        {/* Moving dot */}
        <div style={{
          position:'absolute',
          left: LINE_X - 5, width:13, height:13,
          borderRadius:'50%',
          background:'#fff',
          boxShadow:'0 0 10px rgba(255,255,255,0.9)',
          animation:'thermoDot 4s ease-in-out infinite',
          zIndex:5,
        }}/>

        {/* Stage markers */}
        {STAGES.map((s, i) => {
          const top = BAR_H * s.frac
          const sz  = i === 0 || i === 4 ? 13 : 10
          return (
            <div key={i} style={{ position:'absolute', top: top - sz/2, left:0, display:'flex', alignItems:'center', gap:14 }}>
              {/* Dot */}
              <div style={{
                width:sz, height:sz, borderRadius:'50%', flexShrink:0,
                background:s.dot, boxShadow:`0 0 ${i===4?12:7}px ${s.dot}`,
                marginLeft: LINE_X - (sz - 3) / 2,
              }}/>
              {/* Label */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:s.color, fontFamily:"'Inter',sans-serif", lineHeight:1.2 }}>{s.label}</div>
                <div style={{ fontSize:10, color:'rgba(232,237,245,0.28)', fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

// ── Growth process data ───────────────────────────────────────────────────────
const MAX_SALES = 17000

interface Nivel {
  label: string; color: string; bg: string; border: string; dot: string
  icon: React.ReactNode
  metaVendas: string; salarioBase: string; bonus?: string
  gaugeMin: number; gaugeMax: number; gaugeLabel: string
}

const NIVEIS: Nivel[] = [
  {
    label:'JÚNIOR', color:'#C8A800', bg:'rgba(255,215,0,0.07)', border:'rgba(255,215,0,0.25)', dot:'#22C55E',
    icon:(<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    metaVendas:'$4.000 – $9.500', salarioBase:'$320',
    gaugeMin:4000, gaugeMax:9500, gaugeLabel:'$9.5k',
  },
  {
    label:'MIDDLE', color:'#A97BD4', bg:'rgba(180,130,230,0.07)', border:'rgba(180,130,230,0.25)', dot:'#FFD700',
    icon:(<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/><circle cx="12" cy="12" r="4"/></svg>),
    metaVendas:'$9.500 – $12.000', salarioBase:'$320', bonus:'$100 de bônus',
    gaugeMin:9500, gaugeMax:12000, gaugeLabel:'$12k',
  },
  {
    label:'SENIOR', color:'#38B2C8', bg:'rgba(56,178,200,0.07)', border:'rgba(56,178,200,0.25)', dot:'#FF9A3C',
    icon:(<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>),
    metaVendas:'$12.000 – $15.000', salarioBase:'$528',
    gaugeMin:12000, gaugeMax:15000, gaugeLabel:'$15k',
  },
  {
    label:'SENIOR+', color:'#7B9CEC', bg:'rgba(40,55,120,0.20)', border:'rgba(100,130,220,0.35)', dot:'#22C55E',
    icon:(<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>),
    metaVendas:'+$16.500', salarioBase:'$528', bonus:'$100 de bônus',
    gaugeMin:15000, gaugeMax:17000, gaugeLabel:'$17k+',
  },
]

// ── Deterministic stars (same on server + client, no hydration mismatch) ──────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x:     +((i * 137.508) % 100).toFixed(2),
  y:     +((i * 97.324  + i * 0.618) % 100).toFixed(2),
  r:     0.5 + (i % 3) * 0.35,
  o:     0.07 + (i % 6) * 0.055,
  delay: `${(i % 7) * 0.5}s`,
  dur:   `${2 + (i % 4) * 0.6}s`,
}))

// ── Gauge / speedometer ───────────────────────────────────────────────────────
function GaugeChart({ color, startPct, endPct, label, animIdx }: {
  color:string; startPct:number; endPct:number; label:string; animIdx:number
}) {
  const CX = 60, CY = 58, R = 46
  const pt = (p: number) => ({
    x: +(CX + R * Math.cos(Math.PI * (1 - p))).toFixed(2),
    y: +(CY - R * Math.sin(Math.PI * (1 - p))).toFixed(2),
  })
  const arc = (p1: number, p2: number) => {
    const a = pt(p1), b = pt(p2)
    return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`
  }
  return (
    <svg width="120" height="74" viewBox="0 0 120 74" style={{ display:'block', margin:'0 auto' }}>
      <path d={arc(0,1)} stroke="rgba(255,255,255,0.06)" strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d={arc(startPct,endPct)} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.55"/>
      {startPct > 0 && <circle cx={pt(startPct).x} cy={pt(startPct).y} r="4" fill={color} opacity="0.5"/>}
      <circle cx={pt(endPct).x} cy={pt(endPct).y} r="5.5" fill={color}/>
      <g style={{ transformOrigin:`${CX}px ${CY}px`, animation:`needle${animIdx} 2.8s ease-in-out infinite` }}>
        <line x1={CX} y1={CY} x2={CX+R-10} y2={CY} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      <circle cx={CX} cy={CY} r="5" fill={color}/>
      <circle cx={CX} cy={CY} r="2.5" fill="#080A12"/>
      <text x="9"   y={CY+13} fill="rgba(232,237,245,0.22)" fontSize="7.5" fontFamily="Inter,sans-serif">$0</text>
      <text x={CX}  y={CY+13} fill={color} fontSize="8.5" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">{label}</text>
      <text x="111" y={CY+13} fill="rgba(232,237,245,0.22)" fontSize="7.5" fontFamily="Inter,sans-serif" textAnchor="end">$17k</text>
    </svg>
  )
}

// ── Diamond shapes ────────────────────────────────────────────────────────────
function Diamond({ color, size=20 }: { color:string; size?:number }) {
  const h = size, c = size/2
  return (
    <svg width={h} height={h} viewBox={`0 0 ${h} ${h}`} fill="none">
      <polygon points={`${c},1 ${h-1},${c} ${c},${h-1} 1,${c}`} fill={color} opacity="0.92"/>
      <polygon points={`${c},1 ${h-1},${c} ${c},${c*0.65}`} fill="rgba(255,255,255,0.38)"/>
      <polygon points={`1,${c} ${c},${c*0.65} ${c},${h-1}`} fill="rgba(0,0,0,0.22)"/>
    </svg>
  )
}

function Gem({ color }: { color:string }) {
  return (
    <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
      <polygon points="19,2 9,10 1,13 19,32 37,13 29,10" fill={color} opacity="0.88"/>
      <polygon points="19,2 29,10 19,13" fill="rgba(255,255,255,0.52)"/>
      <polygon points="19,2 9,10 19,13" fill="rgba(255,255,255,0.28)"/>
      <polygon points="1,13 9,10 19,13 19,32" fill={color} opacity="0.55"/>
      <polygon points="37,13 29,10 19,13 19,32" fill={color} opacity="0.72"/>
      <polygon points="1,13 19,13 19,32" fill="rgba(0,0,0,0.18)"/>
      <polygon points="9,10 29,10 19,13" fill="rgba(255,255,255,0.12)"/>
      <polygon points="19,2 9,10 1,13 19,32 37,13 29,10" stroke={color} strokeWidth="0.6" fill="none" opacity="0.5"/>
      <circle cx="19" cy="13" r="2.5" fill="rgba(255,255,255,0.7)"/>
    </svg>
  )
}

// ── Diamond line below cards ──────────────────────────────────────────────────
const DIA_COLS = ['#C8A800','#A97BD4','#38B2C8','#7B9CEC']
const DIA_POS  = ['12.5%','37.5%','62.5%','87.5%']

function DiamondLine() {
  return (
    <div style={{ position:'relative', height:60, marginTop:28 }}>
      <div style={{ position:'absolute', left:'8%', right:'8%', top:'50%', height:2, background:'rgba(255,255,255,0.07)', transform:'translateY(-50%)' }}/>
      <div style={{ position:'absolute', left:'12.5%', top:'50%', height:2, transform:'translateY(-50%)', background:`linear-gradient(90deg,${DIA_COLS[0]},${DIA_COLS[1]},${DIA_COLS[2]},${DIA_COLS[3]})`, animation:'trailFill 7s ease-in-out infinite' }}/>
      {DIA_POS.map((pos, i) => (
        <div key={i} style={{ position:'absolute', left:pos, top:'50%', transform:'translate(-50%,-50%)', animation:`dPulse${i} 7s ease-in-out infinite`, zIndex:2 }}>
          {i === 3 ? <Gem color={DIA_COLS[i]}/> : <Diamond color={DIA_COLS[i]} size={22}/>}
        </div>
      ))}
      <div style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)', animation:'gemTravel 7s ease-in-out infinite', zIndex:10, filter:'drop-shadow(0 0 5px white)' }}>
        <Diamond color="white" size={16}/>
      </div>
    </div>
  )
}

// ── Crescimento section ───────────────────────────────────────────────────────
function CrescimentoView() {
  return (
    <div style={{ position:'relative', overflow:'hidden' }}>
      {/* Space stars */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, width:s.r*2, height:s.r*2, borderRadius:'50%', background:'white', opacity:s.o, animation:`twinkle ${s.dur} ease-in-out infinite alternate`, animationDelay:s.delay }}/>
        ))}
      </div>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:36, textAlign:'center' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:6 }}>
            <span style={{ color:'rgba(232,237,245,0.22)', fontSize:18 }}>✦</span>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#E8EDF5', margin:0, letterSpacing:'-0.02em', fontFamily:"'Inter',sans-serif" }}>Processo de Crescimento</h1>
            <span style={{ color:'rgba(232,237,245,0.22)', fontSize:18 }}>✦</span>
          </div>
          <p style={{ fontSize:13, color:'rgba(232,237,245,0.32)', margin:0, fontFamily:"'DM Sans',sans-serif" }}>Evolução de cargo, metas e salário base por nível</p>
        </div>

        {/* Cards */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top:36, left:'12.5%', right:'12.5%', height:2, background:'rgba(255,255,255,0.07)', zIndex:0 }}/>
          <div style={{ display:'flex', gap:14, alignItems:'stretch' }}>
            {NIVEIS.map((n, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                {/* Icon */}
                <div style={{ width:72, height:72, borderRadius:'50%', flexShrink:0, border:`2px solid ${n.border}`, background:n.bg, display:'flex', alignItems:'center', justifyContent:'center', color:n.color, position:'relative', zIndex:1, boxShadow:`0 0 22px ${n.border}` }}>
                  {n.icon}
                </div>
                {/* Badge */}
                <div style={{ padding:'5px 14px', borderRadius:8, background:n.bg, border:`1.5px solid ${n.border}`, fontSize:11, fontWeight:800, color:n.color, letterSpacing:'0.08em', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
                  {n.label}
                </div>
                {/* Card */}
                <div style={{ width:'100%', borderRadius:14, padding:'14px 12px', background:n.bg, border:`1.5px solid ${n.border}`, display:'flex', flexDirection:'column', gap:8, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:n.dot, boxShadow:`0 0 6px ${n.dot}`, flexShrink:0 }}/>
                    <span style={{ fontSize:10.5, fontWeight:800, color:n.color, letterSpacing:'0.09em', fontFamily:"'Inter',sans-serif" }}>{n.label}</span>
                  </div>
                  <GaugeChart color={n.color} startPct={n.gaugeMin/MAX_SALES} endPct={n.gaugeMax/MAX_SALES} label={n.gaugeLabel} animIdx={i}/>
                  <div style={{ borderTop:`1px solid ${n.border}`, paddingTop:8, display:'flex', flexDirection:'column', gap:7 }}>
                    <div style={{ textAlign:'center', paddingTop:2 }}>
                      <div style={{ fontSize:10, color:'rgba(232,237,245,0.32)', fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>Meta de vendas:</div>
                      <div style={{ fontSize:13, fontWeight:800, color:n.color, fontFamily:"'Inter',sans-serif", letterSpacing:'-0.01em' }}>{n.metaVendas}</div>
                    </div>
                    <div style={{ textAlign:'center', paddingTop:2 }}>
                      <div style={{ fontSize:10, color:'rgba(232,237,245,0.32)', fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>Salário base:</div>
                      <div style={{ fontSize:20, fontWeight:900, color:n.color, fontFamily:"'Inter',sans-serif", letterSpacing:'-0.02em', textShadow:`0 0 18px ${n.color}55` }}>{n.salarioBase}</div>
                    </div>
                    {n.bonus && (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, paddingTop:6, borderTop:`1px solid ${n.border}` }}>
                        <span style={{ fontSize:11.5, fontWeight:700, color:n.color, fontFamily:"'Inter',sans-serif" }}>{n.bonus}</span>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                          {[0,1,2].map(j => (
                            <span key={j} style={{ fontSize:7, color:n.color, lineHeight:1, animation:'arrowUp 1.1s ease-in-out infinite', animationDelay:`${j*0.28}s`, display:'block' }}>▲</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diamond progress line */}
        <DiamondLine />
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS: Array<{ id: Section; icon: string; label: string; soon?: boolean }> = [
  { id:'multas',      icon:'⚖️', label:'Multas & Penalidades' },
  { id:'crescimento', icon:'📈', label:'Processo de Crescimento' },
  { id:'bo-flow',     icon:'🗺️', label:'Fluxo de Trabalho BO' },
]

const thStyle: React.CSSProperties = {
  padding:'11px 16px', textAlign:'left', fontSize:10.5, fontWeight:700,
  letterSpacing:'0.07em', textTransform:'uppercase', color:'rgba(232,237,245,0.35)',
  fontFamily:"'Inter',sans-serif", borderBottom:'1px solid rgba(255,255,255,0.08)',
  whiteSpace:'nowrap', background:'#0A0D14',
}

const GUIDE_CARDS = [
  {
    id: 'multas' as Section,
    icon: '⚖️',
    label: 'Multas & Penalidades',
    desc: 'Infrações, valores e consequências — política interna da empresa.',
    color: 'rgba(255,77,77,0.10)',
    glow: 'rgba(255,77,77,0.22)',
    accent: '#FF4C4C',
  },
  {
    id: 'crescimento' as Section,
    icon: '📈',
    label: 'Processo de Crescimento',
    desc: 'Evolução de cargo, metas e salário base por nível — Júnior até Senior+.',
    color: 'rgba(0,255,178,0.08)',
    glow: 'rgba(0,255,178,0.2)',
    accent: '#00FFB2',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
export default function GuidesPage() {
  const [section, setSection] = useState<Section | null>(null)

  return (
    <>
      <style>{`
        /* Thermometer */
        @keyframes thermoDot {
          0%   { top:-6px;  opacity:0; }
          6%   { top:-6px;  opacity:1; }
          88%  { top:${BAR_H*0.88-6}px; opacity:1; }
          94%  { top:${BAR_H*0.88+6}px; opacity:0; }
          100% { top:-6px;  opacity:0; }
        }
        /* Gauge needles — rotate from range-start to range-end */
        @keyframes needle0 { 0%,100%{transform:rotate(-138deg)} 50%{transform:rotate(-79deg)} }
        @keyframes needle1 { 0%,100%{transform:rotate(-79deg)}  50%{transform:rotate(-53deg)} }
        @keyframes needle2 { 0%,100%{transform:rotate(-53deg)}  50%{transform:rotate(-21deg)} }
        @keyframes needle3 { 0%,100%{transform:rotate(-21deg)}  50%{transform:rotate(0deg)}   }
        /* Space stars */
        @keyframes twinkle { from{opacity:var(--o,0.1)} to{opacity:calc(var(--o,0.1)*3)} }
        /* Bonus arrows */
        @keyframes arrowUp {
          0%   { opacity:0;   transform:translateY(5px);  }
          35%  { opacity:1;   transform:translateY(0px);  }
          70%  { opacity:0.2; transform:translateY(-5px); }
          100% { opacity:0;   transform:translateY(-5px); }
        }
        /* Diamond line trail */
        @keyframes trailFill {
          0%  {width:0}  22%{width:25%}  62%{width:50%}  92%{width:75%}
          94% {width:75%} 96%{width:0}   100%{width:0}
        }
        /* Traveling diamond */
        @keyframes gemTravel {
          0%  {left:12.5%;opacity:1} 22%{left:37.5%;opacity:1}
          40% {left:37.5%;opacity:1} 62%{left:62.5%;opacity:1}
          80% {left:62.5%;opacity:1} 92%{left:87.5%;opacity:1}
          94% {left:87.5%;opacity:0} 95%{left:12.5%;opacity:0}
          100%{left:12.5%;opacity:1}
        }
        /* Fixed diamonds appear as traveling one arrives */
        @keyframes dPulse0 {
          0%  {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          2%  {opacity:1;transform:translate(-50%,-50%) scale(1.3)}
          8%  {opacity:1;transform:translate(-50%,-50%) scale(1)}
          93% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          96% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          100%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}
        }
        @keyframes dPulse1 {
          0%  {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          20% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          24% {opacity:1;transform:translate(-50%,-50%) scale(1.3)}
          30% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          93% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          96% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          100%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}
        }
        @keyframes dPulse2 {
          0%  {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          60% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          64% {opacity:1;transform:translate(-50%,-50%) scale(1.3)}
          70% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          93% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          96% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          100%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}
        }
        @keyframes dPulse3 {
          0%  {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          90% {opacity:0;transform:translate(-50%,-50%) scale(0.5)}
          94% {opacity:1;transform:translate(-50%,-50%) scale(1.6)}
          98% {opacity:1;transform:translate(-50%,-50%) scale(1)}
          100%{opacity:1;transform:translate(-50%,-50%) scale(1)}
        }
      `}</style>

      <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

        {/* ── Sidebar — always visible ──────────────────────────────────── */}
        <div style={{
          width:220, flexShrink:0, background:'#07090F',
          borderRight:'1px solid rgba(255,255,255,0.07)',
          display:'flex', flexDirection:'column', padding:'24px 10px',
        }}>
          <div style={{ padding:'0 6px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(232,237,245,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:2 }}>Guides</div>
            <div style={{ fontSize:12, color:'rgba(232,237,245,0.28)', fontFamily:"'DM Sans',sans-serif" }}>Processos e políticas</div>
          </div>
          {SIDEBAR_ITEMS.map(item => {
            const on = section === item.id
            return (
              <button key={item.id} onClick={() => !item.soon && setSection(item.id)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, marginBottom:3,
                background: on ? 'rgba(0,255,178,0.08)' : 'transparent',
                border:`1px solid ${on ? 'rgba(0,255,178,0.22)' : 'transparent'}`,
                color: on ? '#00FFB2' : 'rgba(232,237,245,0.5)',
                cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.12s',
              }}
              onMouseEnter={e => { if (!on) { const el=e.currentTarget; el.style.background='rgba(255,255,255,0.05)'; el.style.color='#E8EDF5' }}}
              onMouseLeave={e => { if (!on) { const el=e.currentTarget; el.style.background='transparent'; el.style.color='rgba(232,237,245,0.5)' }}}
              >
                <span style={{ fontSize:15, lineHeight:1 }}>{item.icon}</span>
                <span style={{ fontSize:12.5, fontWeight: on ? 600 : 400, fontFamily:"'Inter',sans-serif" }}>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:'auto', background:'#08090F' }}>

        {/* Landing — shown when no section selected */}
        {!section && (
          <div style={{ position:'relative', padding:'48px 40px', maxWidth:760, fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
            <DiamondBg />
            <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ marginBottom:40 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8, fontFamily:"'Inter',sans-serif" }}>Guides</div>
              <h1 style={{ margin:0, fontSize:28, fontWeight:800, letterSpacing:'-0.02em', background:'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.5))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Inter',sans-serif" }}>
                Processos & Políticas
              </h1>
              <p style={{ margin:'8px 0 0', fontSize:14, color:'var(--text-dim)' }}>
                Selecione uma secção no menu lateral ou clique num card para começar.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
              {GUIDE_CARDS.map((card, i) => (
                <div
                  key={card.id}
                  onClick={() => setSection(card.id)}
                  style={{
                    background:'var(--card)', border:'1px solid var(--border)',
                    borderRadius:16, padding:'24px 20px', cursor:'pointer',
                    transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                    animation:`fadeUp 0.35s ease both`, animationDelay:`${i * 0.07}s`,
                    position:'relative', overflow:'hidden',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = card.glow; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3)`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ position:'absolute', top:-24, right:-24, width:80, height:80, borderRadius:'50%', background:card.color, filter:'blur(24px)', pointerEvents:'none' }} />
                  <div style={{ width:44, height:44, borderRadius:10, marginBottom:14, background:card.color, border:`1px solid ${card.glow}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{card.icon}</div>
                  <h3 style={{ margin:'0 0 6px', fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:"'Inter',sans-serif" }}>{card.label}</h3>
                  <p style={{ margin:'0 0 16px', fontSize:12.5, color:'var(--text-dim)', lineHeight:1.6 }}>{card.desc}</p>
                  <div style={{ fontSize:12, fontWeight:600, color:card.accent, fontFamily:"'Inter',sans-serif" }}>Abrir →</div>
                </div>
              ))}
            </div>
            </div>{/* zIndex:1 */}
          </div>
        )}

        {/* Section content */}
        {section && <div style={{ padding:'36px 40px 64px' }}>

          {section === 'multas' && (
            <div>

              {/* Header */}
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:800, color:'#E8EDF5', margin:'0 0 5px', letterSpacing:'-0.02em', fontFamily:"'Inter',sans-serif" }}>
                  Multas & Penalidades
                </h1>
                <p style={{ fontSize:13, color:'rgba(232,237,245,0.35)', margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                  Infrações, valores e consequências — política interna da empresa
                </p>
              </div>

              {/* Legend */}
              <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
                {(Object.entries(NIVEL_COR) as Array<[keyof typeof NIVEL_COR, string]>).map(([nivel, cor]) => (
                  <div key={nivel} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'#0D1018', border:`1px solid ${cor}30` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:cor, boxShadow:`0 0 6px ${cor}` }} />
                    <span style={{ fontSize:11, color:cor, fontWeight:600, fontFamily:"'Inter',sans-serif" }}>{NIVEL_LABEL[nivel]}</span>
                  </div>
                ))}
              </div>

              {/* Table + walking path side by side */}
              <div style={{ display:'flex', gap:36, alignItems:'flex-start' }}>

                {/* Table */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, width:20 }} />
                          <th style={thStyle}>Infração</th>
                          <th style={{ ...thStyle, width:200 }}>Multa / Consequência</th>
                          <th style={thStyle}>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MULTAS.map((m, i) => {
                          const cor    = NIVEL_COR[m.nivel]
                          const isLast = i === MULTAS.length - 1
                          const isCrit = m.nivel === 'critico'
                          return (
                            <tr
                              key={i}
                              style={{
                                background: isCrit ? 'rgba(255,23,68,0.06)' : i % 2 === 0 ? '#0A0D14' : '#0C1019',
                                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                transition:'background 0.15s',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${cor}11` }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isCrit ? 'rgba(255,23,68,0.06)' : i % 2 === 0 ? '#0A0D14' : '#0C1019' }}
                            >
                              <td style={{ padding:'13px 0 13px 16px', verticalAlign:'middle' }}>
                                <div style={{ width:9, height:9, borderRadius:'50%', background:cor, boxShadow:`0 0 7px ${cor}`, margin:'0 auto' }} />
                              </td>
                              <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{m.icon}</span>
                                  <span style={{ fontSize:13, fontWeight:600, color: isCrit ? cor : '#E8EDF5', fontFamily:"'Inter',sans-serif", lineHeight:1.3 }}>{m.infracao}</span>
                                </div>
                              </td>
                              <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                                <span style={{ fontSize:13, fontWeight:700, color:cor, fontFamily:"'Inter',sans-serif" }}>
                                  {isCrit ? '⚠️ ' : ''}{m.multa}
                                </span>
                              </td>
                              <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                                <span style={{ fontSize:12.5, color:'rgba(232,237,245,0.42)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{m.observacao}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Note */}
                  <div style={{ marginTop:20, padding:'14px 20px', borderRadius:12, background:'#0D1018', border:'1px solid rgba(255,179,64,0.2)', display:'flex', gap:12, alignItems:'flex-start' }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>📌</span>
                    <p style={{ fontSize:12.5, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65, margin:0 }}>
                      <strong style={{ color:'rgba(232,237,245,0.62)', fontFamily:"'Inter',sans-serif" }}>Atenção:</strong> Todas as multas são descontadas automaticamente no fechamento mensal do salário. Em caso de dúvidas, entre em contato com a sua liderança antes do fechamento.
                    </p>
                  </div>
                </div>

                {/* Walking figure */}
                <CaminhoSaida />

              </div>
            </div>
          )}

          {section === 'crescimento' && <CrescimentoView />}
          {section === 'bo-flow' && <BOFlowView />}

          {false && (
            <div>
              {/* placeholder to preserve git diff context */}
              <div style={{ marginBottom:36, textAlign:'center' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:6 }}>
                  <span style={{ color:'rgba(232,237,245,0.2)', fontSize:18 }}>✦</span>
                  <h1 style={{ fontSize:26, fontWeight:900, color:'#E8EDF5', margin:0, letterSpacing:'-0.02em', fontFamily:"'Inter',sans-serif" }}>
                    Processo de Crescimento
                  </h1>
                  <span style={{ color:'rgba(232,237,245,0.2)', fontSize:18 }}>✦</span>
                </div>
                <p style={{ fontSize:13, color:'rgba(232,237,245,0.32)', margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                  Evolução de cargo, metas e salário base por nível
                </p>
              </div>

              {/* Timeline + cards */}
              <div style={{ position:'relative' }}>

                {/* Horizontal connector line through icon centers */}
                <div style={{
                  position:'absolute', top:36, left:'12.5%', right:'12.5%', height:2,
                  background:'rgba(255,255,255,0.08)', zIndex:0,
                }}/>

                <div style={{ display:'flex', gap:16 }}>
                  {NIVEIS.map((n, i) => (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>

                      {/* Icon circle */}
                      <div style={{
                        width:72, height:72, borderRadius:'50%', flexShrink:0,
                        border:`2px solid ${n.border}`,
                        background:n.bg,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:n.color, position:'relative', zIndex:1,
                        boxShadow:`0 0 20px ${n.border}`,
                      }}>
                        {n.icon}
                      </div>

                      {/* Badge */}
                      <div style={{
                        padding:'5px 16px', borderRadius:8,
                        background:n.bg, border:`1.5px solid ${n.border}`,
                        fontSize:11.5, fontWeight:800, color:n.color,
                        letterSpacing:'0.08em', fontFamily:"'Inter',sans-serif",
                        whiteSpace:'nowrap',
                      }}>
                        {n.label}
                      </div>

                      {/* Card */}
                      <div style={{
                        width:'100%', borderRadius:14, padding:'18px 16px',
                        background:n.bg, border:`1.5px solid ${n.border}`,
                        display:'flex', flexDirection:'column', gap:12,
                      }}>
                        {/* Dot + name */}
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:n.dot, boxShadow:`0 0 7px ${n.dot}`, flexShrink:0 }}/>
                          <span style={{ fontSize:11, fontWeight:800, color:n.color, letterSpacing:'0.09em', fontFamily:"'Inter',sans-serif" }}>{n.label}</span>
                        </div>

                        <div style={{ borderTop:`1px solid ${n.border}`, paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                          {/* Meta */}
                          <div>
                            <div style={{ fontSize:10.5, color:'rgba(232,237,245,0.35)', fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Meta de vendas:</div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#E8EDF5', fontFamily:"'Inter',sans-serif" }}>{n.metaVendas}</div>
                          </div>
                          {/* Salário */}
                          <div>
                            <div style={{ fontSize:10.5, color:'rgba(232,237,245,0.35)', fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Salário base:</div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#E8EDF5', fontFamily:"'Inter',sans-serif" }}>{n.salarioBase}</div>
                          </div>
                          {/* Bônus */}
                          {n.bonus && (
                            <div style={{
                              fontSize:12, fontWeight:700, color:n.color,
                              fontFamily:"'Inter',sans-serif",
                              paddingTop:4, borderTop:`1px solid ${n.border}`,
                            }}>
                              {n.bonus}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>}

        </div>
      </div>

    </>
  )
}
