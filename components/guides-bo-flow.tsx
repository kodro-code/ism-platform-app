'use client'

import { useState, useEffect, useRef } from 'react'

// ── Objections ────────────────────────────────────────────────────────────────
const OBJECTIONS = [
  'Not interested in programming','Lost interest','Boring lessons',
  'Not interested in the offer','Not interested in the online format',
  'Not interested in a group setting','Poor tutor performance',
  'High school load','Financial difficulties','Pay later','Health issues',
  'Continue later','N/A after deal','N/A after discussion',
  'Client did not provide reasons for discontinuing','Competitor','Critical case',
]

// ── Status icons ──────────────────────────────────────────────────────────────
const STATUS_ICONS: Record<string,string> = {
  'ism-start':'🏁','callback':'📞','ngt':'📵',
  'na5':'⏰','followup':'💬','waiting':'🤔',
  'negotiation':'🤝','payment-control':'💳',
  'payment-received':'💚','installment':'📅',
  'reserve-grads':'📦','reserve-prol':'📦','closed':'🔒',
  'freeze':'❄️','temporary':'⏳','subscription-reactivation':'🔄',
}

// ── Status definitions ────────────────────────────────────────────────────────
interface Status {
  id: string; label: string; color: string; bg: string
  type: 'entry'|'active'|'final-paid'|'final-reserve'|'final-closed'|'special'
  description: string; whenToUse: string; nextIds: string[]
  hasObjection?: boolean; task: string; action?: string
}

const STATUSES: Status[] = [
  {
    id:'ism-start', label:'ISM Start Working', color:'#00A3FF', bg:'rgba(0,163,255,0.12)',
    type:'entry',
    description:'Estado inicial automático. O sistema distribui o lead para qualquer lista e chega com este status.',
    whenToUse:'Atribuído automaticamente pelo sistema. O manager começa a trabalhar a partir daqui e muda para o status correto conforme a conversa evolui.',
    nextIds:['callback','ngt','followup','waiting','negotiation','payment-control'],
    task:'ISM Start Working',
  },
  {
    id:'callback', label:'Call Back', color:'#FFD700', bg:'rgba(255,215,0,0.12)',
    type:'active',
    description:'O cliente respondeu e pediu para ligar em outro momento.',
    whenToUse:'O cliente já atendeu ou respondeu e marcou uma hora — "liga às 18h", "amanhã de manhã". Há compromisso de contato.',
    nextIds:['ngt','waiting','negotiation','reserve-grads','reserve-prol'],
    task:'Call Back',
  },
  {
    id:'ngt', label:'Not Getting Through', color:'#FF9A3C', bg:'rgba(255,154,60,0.12)',
    type:'active',
    description:'O cliente não está atendendo nem respondendo a nenhuma tentativa de contato.',
    whenToUse:'Quando o cliente não atende chamadas nem responde mensagens. Após +5 tentativas sem resposta → N/A +5.',
    nextIds:['na5','callback','followup'],
    task:'Not Getting Through',
  },
  {
    id:'na5', label:'N/A +5', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)',
    type:'active',
    description:'O cliente não respondeu após 5 ou mais tentativas de contato.',
    whenToUse:'Vem de Not Getting Through após +5 tentativas. Continuar tentando com espaçamento maior.',
    nextIds:['reserve-grads','reserve-prol'],
    task:'N/A +5',
  },
  {
    id:'followup', label:'Follow Up', color:'#00E5FF', bg:'rgba(0,229,255,0.12)',
    type:'active',
    description:'O cliente respondeu mas a conversa foi genérica. Não agendaram chamada nem há proposta concreta.',
    whenToUse:'Status entre Not Getting Through e Call Back. O cliente responde mas não há compromisso. Conversa em aberto.',
    nextIds:['negotiation','waiting','payment-control','callback'],
    task:'Follow Up',
  },
  {
    id:'waiting', label:'Waiting for Decision', color:'#FF8C94', bg:'rgba(255,140,148,0.12)',
    type:'active',
    description:'O cliente recebeu toda a informação e está analisando. Disse que vai pensar mas ainda não decidiu.',
    whenToUse:'Quando o cliente já tem a proposta e disse "vou pensar". Tem a informação mas ainda não disse sim nem não.',
    nextIds:['negotiation','payment-control','reserve-grads','reserve-prol','closed'],
    task:'Waiting for Decision',
  },
  {
    id:'negotiation', label:'Negotiation', color:'#00FFB2', bg:'rgba(0,255,178,0.12)',
    type:'active',
    description:'O cliente confirmou interesse e está escolhendo o pacote. Já disse que quer — só falta definir qual.',
    whenToUse:'Diferente de Waiting: aqui o cliente JÁ disse que quer. Estão escolhendo o pacote e forma de pagamento.',
    nextIds:['payment-control'],
    task:'Negotiation',
  },
  {
    id:'payment-control', label:'Payment Control', color:'#22C55E', bg:'rgba(34,197,94,0.12)',
    type:'active',
    description:'O cliente aceitou a proposta e já recebeu o link de pagamento. Aguardando confirmação.',
    whenToUse:'Quando o cliente disse "manda o link" e o link foi enviado. Momento crítico de follow-up.',
    nextIds:['payment-received','installment','reserve-grads','reserve-prol'],
    task:'Payment Control',
  },
  {
    id:'payment-received', label:'Payment Received', color:'#FFD700', bg:'rgba(255,215,0,0.12)',
    type:'final-paid',
    description:'O cliente pagou. Lead fechado com sucesso.',
    whenToUse:'Quando o pagamento é confirmado. O lead volta ao sistema no próximo ciclo se balance < 18 aulas.',
    nextIds:[],
    task:'Payment Received',
  },
  {
    id:'installment', label:'Installment Payment Received', color:'#9D8FFF', bg:'rgba(157,143,255,0.12)',
    type:'final-paid',
    description:'O cliente vai pagar em parcelas internas, sem cartão de crédito.',
    whenToUse:'Quando o cliente aceita parcelamento interno acordado com a empresa.',
    nextIds:[],
    task:'Installment Payment Received',
  },
  {
    id:'reserve-grads', label:'Reserve Base Grads', color:'#6366F1', bg:'rgba(99,102,241,0.12)',
    type:'final-reserve',
    description:'Cliente de Upsale Grads que não comprou agora. Fica em reserva até ao próximo ciclo.',
    whenToUse:'Balance positivo → volta ao sistema próximo mês para Prolongation como Grad. Balance 0/-1 → vai para Cohort.',
    nextIds:[], hasObjection:true,
    task:'Reserve Base Grads',
  },
  {
    id:'reserve-prol', label:'Reserve Base Prolongation', color:'#818CF8', bg:'rgba(129,140,248,0.12)',
    type:'final-reserve',
    description:'Cliente de FPRP ou Prolongation que não comprou agora. Tem aulas restantes — ficará em reserva.',
    whenToUse:'Balance positivo → volta ao sistema próximo mês. Balance 0/-1 → vai para Cohort.',
    nextIds:[], hasObjection:true,
    task:'Reserve Base Prolongation',
  },
  {
    id:'closed', label:'Closed', color:'#FF1744', bg:'rgba(255,23,68,0.12)',
    type:'final-closed',
    description:'Lead perdido definitivamente. Só managers de Cohort colocam Closed. Não é redistribuído.',
    whenToUse:'Quando o cliente de Cohort recusou a oferta final. Este lead já passou por múltiplos managers — é o fim do ciclo.',
    nextIds:[], hasObjection:true,
    task:'Closed',
  },
  // ── Statuses especiais — não trabalhados pelo manager ─────────────────────
  {
    id:'freeze', label:'Freeze', color:'#818CF8', bg:'rgba(129,140,248,0.12)',
    type:'special',
    description:'Cliente que tem saldo de aulas mas pausou o curso voluntariamente. Vai retornar ao sistema em 6 meses a 1 ano, dependendo do acordo.',
    whenToUse:'O cliente pausou o curso mas ainda tem balance positivo. Não há ação de venda — o lead será retomado quando o cliente voltar.',
    nextIds:[], task:'Freeze', action:'Pular o lead — não trabalhar',
  },
  {
    id:'temporary', label:'Temporary', color:'#A78BFA', bg:'rgba(167,139,250,0.12)',
    type:'special',
    description:'Leads adicionais atribuídos temporariamente ao manager. São leads extras sob tua responsabilidade que podem ser redistribuídos para outro manager.',
    whenToUse:'Estes leads fazem parte do teu cargo mas são temporários. Se redistribuídos, podem impactar o número de leads do mês.',
    nextIds:[], task:'Temporary', action:'Escalar para TL Arturo',
  },
  {
    id:'subscription-reactivation', label:'Subscription Reactivation', color:'#C4B5FD', bg:'rgba(196,181,253,0.12)',
    type:'special',
    description:'Leads com método de subscrição mensal. O pagamento é cobrado automaticamente pelo departamento de CS — não pelo manager de vendas.',
    whenToUse:'Este lead é gerido pelo CS. O processo de cobrança e reativação é da responsabilidade do departamento de CS.',
    nextIds:[], task:'Subscription Reactivation', action:'Pular o lead — gerido pelo CS',
  },
]

const SM = Object.fromEntries(STATUSES.map(s => [s.id, s]))

// ── Journey (Lists) ───────────────────────────────────────────────────────────
interface JStage {
  label: string; icon: string; color: string; bg: string; balance: string
  description: string; ifPaysText: string; ifNotPaysText: string
}
interface ListDef {
  name: string; icon: string; color: string; bg: string; balance: string; desc: string
  stages: JStage[]
}

const LISTS: Record<string,ListDef> = {
  upsale: {
    name:'Upsale Grads', icon:'⬆️', color:'#6366F1', bg:'rgba(99,102,241,0.12)',
    balance:'8 – 18 aulas', desc:'Aluno próximo de se graduar. Manager tenta vender upgrade antes da formatura.',
    stages:[
      {
        label:'Upsale Grads', icon:'⬆️', color:'#6366F1', bg:'rgba(99,102,241,0.12)', balance:'8 – 18 aulas',
        description:'O aluno tem muitas aulas mas está próximo de se graduar. Oferta de continuidade antes que o ciclo acabe. Alta propensão a comprar — o cliente já está investido.',
        ifPaysText:'Payment Received ✅ — lead convertido!',
        ifNotPaysText:'Vai para Reserve Base Grads. No próximo mês volta como Prolongation Grads.',
      },
      {
        label:'Prolongation · Grads', icon:'⏱️', color:'#FF9A3C', bg:'rgba(255,154,60,0.13)', balance:'1 – 6 aulas',
        description:'O aluno graduou-se e tem poucas aulas restantes. A urgência é real — o cliente sente que o tempo está acabando. Último empurrão antes do Cohort.',
        ifPaysText:'Payment Received ✅ — lead convertido!',
        ifNotPaysText:'Balance zerado — vai direto para Cohort.',
      },
      {
        label:'Cohort', icon:'🆘', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)', balance:'0 / -1 aulas',
        description:'Última tentativa com o maior desconto possível. O aluno não tem mais aulas — é agora ou nunca. Abordagem empática e direta.',
        ifPaysText:'Payment Received ✅ — lead salvo na última fase!',
        ifNotPaysText:'Não há mais oportunidades → lead vai para Closed definitivamente.',
      },
    ],
  },
  fprp: {
    name:'FPRP', icon:'🔁', color:'#00A3FF', bg:'rgba(0,163,255,0.12)',
    balance:'8 – 18 aulas', desc:'First Purchase / Repeat Purchase. Cliente com balance elevado, ainda não graduado.',
    stages:[
      {
        label:'FPRP', icon:'🔁', color:'#00A3FF', bg:'rgba(0,163,255,0.13)', balance:'8 – 18 aulas',
        description:'First Purchase: primeiro pagamento interno. Repeat Purchase: já pagou antes e está renovando. Ambos têm balance alto — janela longa de negociação.',
        ifPaysText:'Payment Received ✅ — lead convertido!',
        ifNotPaysText:'Vai para Reserve Base Prolongation. Próximo mês volta como Prolongation First/Repeat.',
      },
      {
        label:'Prolongation · First / Repeat', icon:'⏱️', color:'#FF9A3C', bg:'rgba(255,154,60,0.13)', balance:'1 – 6 aulas',
        description:'Poucas aulas antes de zerar. O cliente percebe que está acabando — a urgência é o principal argumento. Oferta de continuidade com prazo claro.',
        ifPaysText:'Payment Received ✅ — lead convertido!',
        ifNotPaysText:'Balance zerado → vai para Cohort.',
      },
      {
        label:'Cohort', icon:'🆘', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)', balance:'0 / -1 aulas',
        description:'Última tentativa. O cliente passou por FPRP e Prolongation sem comprar. Desconto máximo disponível.',
        ifPaysText:'Payment Received ✅ — lead salvo!',
        ifNotPaysText:'Não há mais oportunidades → Closed.',
      },
    ],
  },
  prolongation: {
    name:'Prolongation', icon:'⏱️', color:'#FF9A3C', bg:'rgba(255,154,60,0.13)',
    balance:'1 – 6 aulas', desc:'Poucas aulas restantes. Pode ser First, Repeat ou Grad. Caminho curto até Cohort.',
    stages:[
      {
        label:'Prolongation', icon:'⏱️', color:'#FF9A3C', bg:'rgba(255,154,60,0.13)', balance:'1 – 6 aulas',
        description:'Pode ser First, Repeat ou Grad. O cliente tem poucas aulas — a urgência é o maior argumento. Sem reserva: ou fecha agora ou vai direto a Cohort.',
        ifPaysText:'Payment Received ✅ — lead convertido!',
        ifNotPaysText:'Balance zerado → vai direto para Cohort. Sem reserva, sem próximo mês.',
      },
      {
        label:'Cohort', icon:'🆘', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)', balance:'0 / -1 aulas',
        description:'Última tentativa. O cliente já passou por Prolongation sem pagar. Desconto máximo — abordagem de urgência total.',
        ifPaysText:'Payment Received ✅ — lead salvo!',
        ifNotPaysText:'Não há mais oportunidades → Closed.',
      },
    ],
  },
  cohort: {
    name:'Cohort', icon:'🆘', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)',
    balance:'0 / -1 aulas', desc:'Balance zero ou negativo. Última tentativa com desconto máximo.',
    stages:[
      {
        label:'Cohort', icon:'🆘', color:'#FF4C4C', bg:'rgba(255,76,76,0.12)', balance:'0 / -1 aulas',
        description:'O lead chegou aqui com balance zerado ou negativo. Pode ter passado por vários managers. Esta é a última oportunidade — desconto máximo, abordagem direta.',
        ifPaysText:'Payment Received ✅ — lead salvo na última fase!',
        ifNotPaysText:'Não há mais oportunidades → Closed.',
      },
    ],
  },
}

// ── Animated arrows ───────────────────────────────────────────────────────────
function AnimVArrow({ color = '#00C2FF', height = 28, label }: { color?: string; height?: number; label?: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
      {label && <div style={{ fontSize:8.5, color:`${color}99`, fontFamily:"'DM Sans',sans-serif", marginBottom:2, letterSpacing:'0.04em' }}>{label}</div>}
      <div style={{ width:2, height, overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:`repeating-linear-gradient(to bottom, ${color} 0px, ${color} 5px, transparent 5px, transparent 10px)`, backgroundSize:'2px 20px', animation:'arrowFlowDown 0.5s linear infinite' }}/>
      </div>
      <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`7px solid ${color}` }}/>
    </div>
  )
}

function AnimHArrow({ color = '#00FFB2', width = 28 }: { color?: string; width?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
      <div style={{ width, height:2, overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:`repeating-linear-gradient(to right, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)`, backgroundSize:'16px 2px', animation:'arrowFlowRight 0.5s linear infinite' }}/>
      </div>
      <div style={{ width:0, height:0, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:`6px solid ${color}` }}/>
    </div>
  )
}

// ── Status Node ───────────────────────────────────────────────────────────────
function SNode({ id, sel, onSel, highlight }:{ id:string; sel:string|null; onSel:(id:string, el:HTMLDivElement|null)=>void; highlight?:boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const s = SM[id]; const active = sel === id
  const typeLabel = { entry:'Entrada', active:'Ativo', 'final-paid':'Pago ✓', 'final-reserve':'Reserva', 'final-closed':'Fechado', special:'Especial' }[s.type] ?? 'Especial'

  const baseBg     = active ? s.bg     : highlight ? `${s.bg}66`        : 'rgba(255,255,255,0.025)'
  const baseBorder = active ? s.color  : highlight ? `${s.color}66`     : 'rgba(255,255,255,0.08)'
  const baseShadow = active ? `0 0 24px ${s.color}40, inset 0 0 16px ${s.color}08`
                   : highlight ? `0 0 14px ${s.color}30` : 'none'

  return (
    <div
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onSel(active ? '' : id, active ? null : ref.current) }}
      style={{ background:baseBg, border:`1.5px solid ${baseBorder}`, borderRadius:12, padding:'10px 14px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', minWidth:140, boxShadow:baseShadow, transform:active?'scale(1.05)':'scale(1)', userSelect:'none' }}
      onMouseEnter={e=>{ if(!active){ const el=e.currentTarget as HTMLElement; el.style.borderColor=s.color+'88'; el.style.background=s.bg+'ee'; el.style.transform='scale(1.06)'; el.style.boxShadow=`0 0 22px ${s.color}35` } }}
      onMouseLeave={e=>{ if(!active){ const el=e.currentTarget as HTMLElement; el.style.borderColor=baseBorder; el.style.background=baseBg; el.style.transform='scale(1)'; el.style.boxShadow=baseShadow } }}
    >
      <div style={{ fontSize:20, marginBottom:3 }}>{STATUS_ICONS[id]}</div>
      <div style={{ fontSize:8.5, fontWeight:700, color:active?s.color:highlight?s.color+'aa':`${s.color}77`, letterSpacing:'0.07em', marginBottom:3, fontFamily:"'Inter',sans-serif", textTransform:'uppercase' }}>{typeLabel}</div>
      <div style={{ fontSize:12, fontWeight:700, color:active?'#E8EDF5':highlight?'rgba(232,237,245,0.85)':'rgba(232,237,245,0.65)', fontFamily:"'Inter',sans-serif", lineHeight:1.25 }}>{s.label}</div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ id, onClose }:{ id:string; onClose:()=>void }) {
  const s = SM[id]; const [showObj, setShowObj] = useState(false)
  return (
    <div style={{ width:286, flexShrink:0, background:'rgba(8,10,18,0.99)', border:`1px solid ${s.color}30`, borderRadius:14, display:'flex', flexDirection:'column', overflow:'hidden', animation:'koddySlide 0.2s ease-out' }}>
      <div style={{ padding:'13px 15px', background:`${s.color}0e`, borderBottom:`1px solid ${s.color}20`, display:'flex', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, fontWeight:700, color:s.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3, fontFamily:"'Inter',sans-serif" }}>Status</div>
          <div style={{ fontSize:14, fontWeight:800, color:'#E8EDF5', fontFamily:"'Inter',sans-serif", lineHeight:1.2 }}>{s.label}</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(232,237,245,0.3)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'13px 15px', display:'flex', flexDirection:'column', gap:12 }}>
        <div>
          <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(232,237,245,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4, fontFamily:"'Inter',sans-serif" }}>O que significa</div>
          <div style={{ fontSize:12, color:'rgba(232,237,245,0.72)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>{s.description}</div>
        </div>
        <div>
          <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(232,237,245,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4, fontFamily:"'Inter',sans-serif" }}>Quando usar</div>
          <div style={{ fontSize:12, color:'rgba(232,237,245,0.72)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>{s.whenToUse}</div>
        </div>
        {s.action && (
          <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.28)', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(167,139,250,0.7)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4, fontFamily:"'Inter',sans-serif" }}>⚡ Ação</div>
            <div style={{ fontSize:13, fontWeight:800, color:'#C4B5FD', fontFamily:"'Inter',sans-serif" }}>{s.action}</div>
          </div>
        )}
        {s.type !== 'entry' && s.type !== 'special' && (
          <div style={{ background:'rgba(0,255,178,0.06)', border:'1px solid rgba(0,255,178,0.18)', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(0,255,178,0.55)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4, fontFamily:"'Inter',sans-serif" }}>⚡ Task a criar</div>
            <div style={{ fontSize:13, fontWeight:800, color:'#00FFB2', fontFamily:"'Inter',sans-serif" }}>{s.task}</div>
            <div style={{ fontSize:10.5, color:'rgba(232,237,245,0.3)', fontFamily:"'DM Sans',sans-serif", marginTop:3 }}>Nome da Task = nome do Status</div>
          </div>
        )}
        {s.hasObjection && (
          <div>
            <button onClick={()=>setShowObj(o=>!o)} style={{ width:'100%', background:'rgba(255,23,68,0.07)', border:'1px solid rgba(255,23,68,0.18)', borderRadius:10, padding:'10px 12px', cursor:'pointer', textAlign:'left' }}>
              <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,76,76,0.7)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3, fontFamily:"'Inter',sans-serif" }}>⚠️ O BO pede objeção</div>
              <div style={{ fontSize:11.5, color:'rgba(232,237,245,0.45)', fontFamily:"'DM Sans',sans-serif", display:'flex', justifyContent:'space-between' }}>
                Janela automática ao salvar <span>{showObj?'▲':'▼'}</span>
              </div>
            </button>
            {showObj && (
              <div style={{ marginTop:6, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 12px', display:'flex', flexDirection:'column', gap:2 }}>
                {OBJECTIONS.map((o,i)=>(
                  <div key={i} style={{ fontSize:11, color:'rgba(232,237,245,0.45)', fontFamily:"'DM Sans',sans-serif", padding:'3px 0', borderBottom:i<OBJECTIONS.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>{o}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {s.nextIds.length > 0 && (
          <div>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(232,237,245,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, fontFamily:"'Inter',sans-serif" }}>Pode mover para</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {s.nextIds.map(nid=>{ const ns=SM[nid]; if(!ns) return null; return (
                <div key={nid} style={{ padding:'3px 8px', borderRadius:6, background:ns.bg, border:`1px solid ${ns.color}33`, fontSize:10.5, fontWeight:600, color:ns.color, fontFamily:"'Inter',sans-serif" }}>{ns.label}</div>
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ color, text }:{ color:string; text:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, alignSelf:'stretch', paddingLeft:4, marginBottom:8, marginTop:4 }}>
      <div style={{ width:3, height:14, borderRadius:2, background:color, opacity:0.8 }}/>
      <div style={{ fontSize:9.5, fontWeight:700, color:`${color}aa`, letterSpacing:'0.11em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>{text}</div>
    </div>
  )
}

// ── Flow Map ──────────────────────────────────────────────────────────────────
function FlowMap({ sel, onSel }:{ sel:string|null; onSel:(id:string, el:HTMLDivElement|null)=>void }) {
  const nextIds = sel && SM[sel] ? SM[sel].nextIds : []
  const n = (id:string) => <SNode id={id} sel={sel} onSel={onSel} highlight={nextIds.includes(id)} />
  return (
    <div style={{ overflowX:'auto', padding:'20px 24px 28px' }}>
      {/* Instruction hint */}
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:18, padding:'7px 12px', background:'rgba(0,194,255,0.05)', border:'1px solid rgba(0,194,255,0.11)', borderRadius:9 }}>
        <span style={{ fontSize:14 }}>💡</span>
        <span style={{ fontSize:11, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif" }}>
          Clique em qualquer status para ver o que significa, quando usar e qual Task criar no BO.
          {sel && SM[sel] && <span style={{ color:`${SM[sel].color}99`, marginLeft:6 }}>→ os destinos do status selecionado estão destacados.</span>}
        </span>
      </div>
      <div style={{ minWidth:700, display:'flex', flexDirection:'column', alignItems:'center' }}>

        <SectionLabel color="#00A3FF" text="Entrada" />
        {n('ism-start')}
        <AnimVArrow color="#00A3FF" height={26} label="cliente atribuído" />

        <SectionLabel color="#FFD700" text="Em Trabalho" />
        <div style={{ display:'flex', gap:0, alignItems:'flex-start', justifyContent:'center' }}>
          {/* Left branch: contact attempts */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            {n('callback')}
            <AnimVArrow color="#FFD700" height={22} />
            {n('ngt')}
            <AnimVArrow color="#FF9A3C" height={22} />
            {n('na5')}
          </div>
          {/* Separator */}
          <div style={{ width:36, display:'flex', alignItems:'flex-start', paddingTop:30 }}>
            <div style={{ width:36, height:1.5, background:'rgba(255,255,255,0.08)', marginTop:16 }}/>
          </div>
          {/* Right branch: closing funnel — ends at Payment Control */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            {n('followup')}
            <AnimVArrow color="#00E5FF" height={22} />
            {n('waiting')}
            <AnimVArrow color="#00C2FF" height={22} />
            {n('negotiation')}
            <AnimVArrow color="#00FFB2" height={22} />
            {n('payment-control')}
          </div>
        </div>

        {/* Fork from Payment Control: paid exits right, not paid continues down */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', gap:10, marginTop:0 }}>
          {/* Not paid: vertical arrow continues to reserve section */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
            <div style={{ fontSize:7.5, fontWeight:700, color:'rgba(255,76,76,0.5)', fontFamily:"'Inter',sans-serif", marginBottom:2 }}>❌ não pagou</div>
            <AnimVArrow color="#FF4C4C" height={22} />
          </div>
          {/* Paid: horizontal exits to payment statuses */}
          <div style={{ display:'flex', alignItems:'center', gap:7, paddingTop:10 }}>
            <span style={{ fontSize:8, fontWeight:700, color:'rgba(0,255,178,0.5)', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>✅ pagou</span>
            <AnimHArrow color="#00FFB2" width={14} />
            {n('payment-received')}
            <AnimHArrow color="#FFD70066" width={12} />
            {n('installment')}
          </div>
        </div>

        <SectionLabel color="#6366F1" text="Reserva / Fechado" />
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {n('reserve-grads')}
          {n('reserve-prol')}
          {n('closed')}
        </div>

        {/* Special statuses separator */}
        <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.05)', margin:'20px 0 14px' }} />
        <SectionLabel color="#A78BFA" text="Especiais — Não Trabalhados" />
        <div style={{ fontSize:10, color:'rgba(167,139,250,0.45)', fontFamily:"'DM Sans',sans-serif", marginBottom:10, textAlign:'center' }}>
          Estes leads chegam com estes status — identificar e pular.
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {n('freeze')}
          {n('temporary')}
          {n('subscription-reactivation')}
        </div>
      </div>
    </div>
  )
}

// ── Lead Journey ──────────────────────────────────────────────────────────────
function LeadJourney() {
  const [listId, setListId]     = useState<string|null>(null)
  const [dotStage, setDotStage] = useState(0)
  const [isReset, setIsReset]   = useState(false)
  const containerRef  = useRef<HTMLDivElement>(null)
  const circleRefs    = useRef<(HTMLDivElement|null)[]>([])
  const [charPos, setCharPos] = useState({ top: -30, left: 8 })

  const list = listId ? LISTS[listId] : null
  const totalStages = list ? list.stages.length + 1 : 0 // stages + Closed

  // Auto-advance timer
  useEffect(() => {
    if (!listId || !list) return
    let cur = 0
    setDotStage(0)
    const interval = setInterval(() => {
      cur = (cur + 1) % totalStages
      if (cur === 0) {
        // Instant reset jump (no transition)
        setIsReset(true)
        setDotStage(0)
        setTimeout(() => setIsReset(false), 80)
      } else {
        setDotStage(cur)
      }
    }, 2200)
    return () => clearInterval(interval)
  }, [listId, totalStages])

  // Update character position whenever dotStage or list changes
  useEffect(() => {
    const circle = circleRefs.current[dotStage]
    const container = containerRef.current
    if (!circle || !container) return
    const cRect = circle.getBoundingClientRect()
    const pRect = container.getBoundingClientRect()
    setCharPos({
      top:  cRect.top  - pRect.top  - 28,
      left: cRect.left - pRect.left + cRect.width / 2 - 11,
    })
  }, [dotStage, listId])

  function selectList(id: string) {
    circleRefs.current = []
    setListId(id)
    setDotStage(0)
    setIsReset(true)
    setTimeout(() => setIsReset(false), 80)
  }

  return (
    <div>
      <h2 style={{ fontSize:17, fontWeight:800, color:'#E8EDF5', margin:'0 0 4px', fontFamily:"'Inter',sans-serif" }}>
        O Caminho de um Lead
      </h2>
      <p style={{ fontSize:12.5, color:'rgba(232,237,245,0.35)', margin:'0 0 20px', fontFamily:"'DM Sans',sans-serif" }}>
        Seleciona uma lista e vê como o lead percorre o funil. A linha verde sai quando paga; a linha vermelha continua quando não paga.
      </p>

      {/* List selector */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {Object.entries(LISTS).map(([id, l]) => (
          <button key={id} onClick={() => selectList(id)} style={{
            display:'flex', alignItems:'center', gap:8, padding:'9px 15px',
            borderRadius:10, cursor:'pointer', transition:'all 0.15s',
            background: listId===id ? l.bg : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${listId===id ? l.color : 'rgba(255,255,255,0.09)'}`,
            color: listId===id ? l.color : 'rgba(232,237,245,0.55)',
            fontFamily:"'Inter',sans-serif", fontSize:12.5, fontWeight:600,
          }}>
            <span style={{ fontSize:17 }}>{l.icon}</span>
            {l.name}
            <span style={{ fontSize:9.5, padding:'1px 7px', borderRadius:10, background:'rgba(255,255,255,0.05)', color:'rgba(232,237,245,0.3)', fontWeight:500 }}>{l.balance}</span>
          </button>
        ))}
      </div>

      {!list && (
        <div style={{ padding:32, textAlign:'center', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:14, color:'rgba(232,237,245,0.2)', fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
          ← Seleciona uma lista para ver o caminho do lead
        </div>
      )}

      {list && (
        <div ref={containerRef} style={{ position:'relative' }}>

          {/* Animated character */}
          <div style={{
            position:'absolute',
            top: charPos.top,
            left: charPos.left,
            fontSize:22, zIndex:10, pointerEvents:'none',
            transition: isReset ? 'none' : 'top 0.9s cubic-bezier(0.4,0,0.2,1)',
            filter:'drop-shadow(0 0 6px rgba(255,255,255,0.4))',
          }}>🚶</div>

          {/* Stage rows */}
          {list.stages.map((stage, i) => {
            const isActive = dotStage === i
            return (
              <div key={i}>
                {/* Stage row: circle + card + pay exit */}
                <div style={{ display:'flex', alignItems:'center' }}>
                  {/* Circle */}
                  <div style={{ width:44, flexShrink:0, display:'flex', justifyContent:'center' }}>
                    <div
                      ref={el => { circleRefs.current[i] = el }}
                      style={{
                        width:40, height:40, borderRadius:'50%',
                        background: isActive ? stage.bg : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isActive ? stage.color : stage.color+'2a'}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:18, flexShrink:0,
                        boxShadow: isActive ? `0 0 20px ${stage.color}55` : 'none',
                        transition:'all 0.55s ease',
                      }}
                    >{stage.icon}</div>
                  </div>

                  {/* Card */}
                  <div style={{
                    flex:1, marginLeft:10,
                    background: isActive ? stage.bg : 'rgba(255,255,255,0.015)',
                    border:`1.5px solid ${isActive ? stage.color+'77' : 'rgba(255,255,255,0.055)'}`,
                    borderRadius:12, padding:'11px 14px',
                    transition:'all 0.55s ease',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:isActive?stage.color:'rgba(232,237,245,0.5)', fontFamily:"'Inter',sans-serif", transition:'color 0.5s' }}>{stage.label}</span>
                      <span style={{ padding:'2px 8px', borderRadius:12, background:`${stage.color}14`, border:`1px solid ${stage.color}22`, fontSize:10, fontWeight:700, color:stage.color, fontFamily:"'Inter',sans-serif" }}>{stage.balance}</span>
                    </div>
                    <div style={{ fontSize:11.5, color:'rgba(232,237,245,0.45)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>{stage.description}</div>
                  </div>

                  {/* Pay exit: green branch */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:10, flexShrink:0 }}>
                    <div style={{ fontSize:8.5, color:'#00FFB266', fontWeight:700, fontFamily:"'Inter',sans-serif", textAlign:'center', lineHeight:1.4 }}>✅<br/>paga</div>
                    <AnimHArrow color="#00FFB244" width={20} />
                    <div style={{
                      padding:'5px 9px', borderRadius:8,
                      background:'rgba(0,255,178,0.055)', border:'1px solid rgba(0,255,178,0.16)',
                      fontSize:9, fontWeight:700, color:'rgba(0,255,178,0.65)',
                      fontFamily:"'Inter',sans-serif", lineHeight:1.5, whiteSpace:'nowrap',
                    }}>💚 Payment<br/>Received</div>
                  </div>
                </div>

                {/* Red connector to next stage */}
                <div style={{ display:'flex', alignItems:'center', paddingLeft:22, gap:8, margin:'2px 0' }}>
                  <AnimVArrow color="#FF4C4C66" height={28} />
                  <div style={{ fontSize:9, color:'rgba(255,76,76,0.4)', fontFamily:"'Inter',sans-serif", fontWeight:600 }}>❌ não paga</div>
                </div>
              </div>
            )
          })}

          {/* Closed */}
          <div style={{ display:'flex', alignItems:'center' }}>
            <div style={{ width:44, flexShrink:0, display:'flex', justifyContent:'center' }}>
              <div
                ref={el => { circleRefs.current[list.stages.length] = el }}
                style={{
                  width:40, height:40, borderRadius:'50%',
                  background: dotStage===list.stages.length ? 'rgba(255,23,68,0.16)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${dotStage===list.stages.length ? '#FF1744' : '#FF174422'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                  boxShadow: dotStage===list.stages.length ? '0 0 22px rgba(255,23,68,0.4)' : 'none',
                  transition:'all 0.55s ease',
                }}
              >🔒</div>
            </div>
            <div style={{
              flex:1, marginLeft:10,
              background: dotStage===list.stages.length ? 'rgba(255,23,68,0.08)' : 'rgba(255,255,255,0.015)',
              border: `1.5px solid ${dotStage===list.stages.length ? '#FF174433' : 'rgba(255,255,255,0.05)'}`,
              borderRadius:12, padding:'11px 14px',
              transition:'all 0.55s ease',
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#FF1744', fontFamily:"'Inter',sans-serif", marginBottom:4 }}>Closed 🔒</div>
              <div style={{ fontSize:11.5, color:'rgba(232,237,245,0.4)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>
                Lead perdido definitivamente. Passou por {list.stages.length} etapa{list.stages.length>1?'s':''} sem fechar. Cada status mal colocado e cada Task esquecida aproximou este lead ao Closed.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
const LEFT_NODES        = new Set(['callback', 'ngt', 'na5'])
const FORCE_RIGHT_NODES = new Set(['reserve-grads','reserve-prol','closed','payment-received','installment','freeze','temporary','subscription-reactivation'])

export default function BOFlowView() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selStatus, setSelStatus] = useState<string|null>(null)
  const [panel, setPanel] = useState<{
    x:number; y:number
    connL:number; connW:number; connY:number
    tailOff:number; side:'left'|'right'
  }|null>(null)

  function clearSel() { setSelStatus(null); setPanel(null) }

  function handleNodeSelect(id: string, el: HTMLDivElement | null) {
    if (!id || id === selStatus) { clearSel(); return }
    setSelStatus(id)
    if (!el || !scrollRef.current) return

    const nr  = el.getBoundingClientRect()
    const cr  = scrollRef.current.getBoundingClientRect()
    const st  = scrollRef.current.scrollTop
    const cw  = scrollRef.current.clientWidth

    const nodeTop   = nr.top   - cr.top  + st
    const nodeLeft  = nr.left  - cr.left
    const nodeRight = nr.right - cr.left
    const nodeMidY  = nodeTop  + nr.height / 2

    const PW = 286, GAP = 16
    let side: 'left'|'right'
    let px: number

    if (FORCE_RIGHT_NODES.has(id)) {
      // Always place in the far-right margin so panel never overlaps adjacent nodes
      side = 'right'
      px = Math.max(nodeRight + GAP, cw - PW - 8)
    } else if (LEFT_NODES.has(id)) {
      side = 'left'
      px = nodeLeft - PW - GAP
      if (px < 8) { side = 'right'; px = nodeRight + GAP }
    } else {
      side = 'right'
      px = nodeRight + GAP
      if (px + PW + 8 > cw) { side = 'left'; px = Math.max(8, nodeLeft - PW - GAP) }
    }

    const connL   = side === 'left' ? px + PW    : nodeRight
    const connW   = side === 'left' ? nodeLeft - (px + PW) : px - nodeRight
    const py      = Math.max(8, nodeMidY - 30)
    const tailOff = Math.max(10, nodeMidY - py)

    setPanel({ x:px, y:py, connL, connW:Math.max(0, connW), connY:nodeMidY, tailOff, side })
  }

  return (
    <div style={{ height:'100%', overflow:'hidden' }}>
      <style>{`
        @keyframes arrowFlowDown {
          from { background-position: 0 0; }
          to   { background-position: 0 20px; }
        }
        @keyframes arrowFlowRight {
          from { background-position: 0 0; }
          to   { background-position: 20px 0; }
        }
        @keyframes koddySlide {
          from { opacity:0; transform:translateX(10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes cloudIn {
          0%   { opacity:0; filter:blur(12px); transform:scale(0.82); }
          100% { opacity:1; filter:blur(0);    transform:scale(1); }
        }
      `}</style>

      <div ref={scrollRef} style={{ height:'100%', overflowY:'auto', padding:'28px 28px 64px', position:'relative' }} onClick={() => { if (panel) clearSel() }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:5, fontFamily:"'Inter',sans-serif" }}>Guia · BO</div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#E8EDF5', letterSpacing:'-0.02em', fontFamily:"'Inter',sans-serif" }}>Fluxo de Trabalho</h1>
        </div>

        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, marginBottom:40, overflow:'hidden' }}>
          <FlowMap sel={selStatus} onSel={handleNodeSelect} />
        </div>

        <LeadJourney />

        {/* Animated connector — spans gap between node and panel */}
        {selStatus && SM[selStatus] && panel && panel.connW > 2 && (
          <div style={{
            position:'absolute', left:panel.connL, top:panel.connY - 1,
            width:panel.connW, height:2, overflow:'hidden',
            zIndex:199, pointerEvents:'none',
          }}>
            <div style={{
              position:'absolute', inset:0,
              background:`repeating-linear-gradient(to right, ${SM[selStatus].color}66 0px, ${SM[selStatus].color}66 4px, transparent 4px, transparent 8px)`,
              backgroundSize:'16px 2px',
              animation:'arrowFlowRight 0.5s linear infinite',
            }}/>
          </div>
        )}

        {/* Panel — absolutely positioned so it stays anchored to the node when scrolling */}
        {selStatus && SM[selStatus] && panel && (() => {
          const s = SM[selStatus]
          return (
            <div onClick={(e) => e.stopPropagation()} style={{ position:'absolute', left:panel.x, top:panel.y, zIndex:200, width:286, animation:'cloudIn 0.3s ease-out 0.06s both', filter:'drop-shadow(0 12px 40px rgba(0,0,0,0.6))' }}>
              <div style={{ position:'relative' }}>
                {/* Speech-bubble tail pointing toward the node */}
                <div style={{
                  position:'absolute',
                  top: panel.tailOff - 7,
                  borderTop:'7px solid transparent',
                  borderBottom:'7px solid transparent',
                  ...(panel.side === 'right'
                    ? { left:-9, borderRight:`9px solid ${s.color}33` }
                    : { right:-9, borderLeft:`9px solid ${s.color}33` }),
                }}/>
                <DetailPanel id={selStatus} onClose={clearSel} />
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
