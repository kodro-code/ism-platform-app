'use client'

export default function ComunicacaoPage() {
  return (
    <div style={{ padding:'36px 40px 64px', fontFamily:"'Inter',sans-serif", maxWidth:1100 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:28, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#DDE4EC', margin:'0 0 4px', letterSpacing:'-0.02em' }}>
            Comunicação entre Departamentos
          </h1>
          <p style={{ fontSize:13.5, color:'#58707F', margin:0 }}>
            Identifique o caso → escolha o canal correto → siga o fluxo.
          </p>
        </div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSf9sg4N3M_qMMZaVN1yCYYZrHS0RWMRlkZsmYIQcRsyYtcI1g/viewform"
          target="_blank" rel="noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:10, background:'rgba(204,120,72,0.1)', border:'1.5px solid rgba(204,120,72,0.3)', color:'#CC7848', fontSize:13.5, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(204,120,72,0.18)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(204,120,72,0.1)' }}
        >
          📋 Abrir Formulário CS-ISM ↗
        </a>
      </div>

      {/* ── 2 columns: card + flow below each ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>

        {/* ── Teaching column ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ borderRadius:14, background:'#0C1C26', border:'1.5px solid #1A4A60', display:'flex', flexDirection:'column', flex:1 }}>
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #143850' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#3A7A90', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Canal — Teaching</div>
              <div style={{ fontSize:19, fontWeight:800, color:'#5AB4CC' }}>#brasil-cs-teaching</div>
              <div style={{ fontSize:12.5, color:'#3A7A90', marginTop:3 }}>Sempre marcar o TL do tutor — sem formulário</div>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14, flex:1 }}>
              {/* list — flex:1 so modelo is pushed to same height in both cards */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#3A7A90', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Quando usar</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {[
                    'Reclamações ou perguntas sobre aulas e tutores',
                    'Pedido de aula extra ou nivelamento',
                    'Overbooking (acima do limite de alunos)',
                    'Turma individual ou WhatsApp da turma',
                    'Autorização de matrícula fora da faixa etária',
                    'Feedback de aula e/ou tutor',
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 10px', borderRadius:7, background:'#0E2030' }}>
                      <span style={{ color:'#4A98B4', fontSize:11, marginTop:3, flexShrink:0 }}>◆</span>
                      <span style={{ fontSize:13, color:'#88B4C8', lineHeight:1.45 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* modelo — sits at bottom */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#3A7A90', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Modelo de mensagem</div>
                <div style={{ background:'#071218', border:'1px solid #143850', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:'#3A7A90', marginBottom:9 }}>🧑 Você no #brasil-cs-teaching</div>
                  <div style={{ fontSize:13, color:'#9ABCCC', lineHeight:1.9, borderLeft:'3px solid #3A8AA8', paddingLeft:12 }}>
                    <strong style={{ color:'#5AB4CC' }}>@TL do Tutor</strong> boa noite!<br/>
                    O aluno <em style={{ color:'#BCD4DE' }}>[nome do aluno]</em> está com <em style={{ color:'#BCD4DE' }}>[situação/motivo]</em>.<br/>
                    A turma que melhor se encaixa seria <em style={{ color:'#BCD4DE' }}>[turma]</em>. Existe possibilidade?<br/>
                    <em style={{ color:'#507888', fontSize:12.5 }}>Contexto: [informação adicional, se necessário]</em><br/>
                    <span style={{ color:'#3A6070', fontSize:12 }}>BO: <em>[link do backoffice do aluno]</em></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <FlowSteps
            id="teaching" title="Fluxo — Teaching"
            color="#5AB4CC" colorRgb="90,180,204" dim="#3A7A90"
            bgCard="#0C1C26" borderCard="#1A4A60"
            steps={[
              { icon:'🔍', label:'Identifica o caso' },
              { icon:'💬', label:'Envia no canal' },
              { icon:'🏷️', label:'Marca o TL' },
              { icon:'⏳', label:'Aguarda confirmação' },
            ]}
          />
        </div>

        {/* ── CS-ISM column ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ borderRadius:14, background:'#1C1008', border:'1.5px solid #4A2A10', display:'flex', flexDirection:'column', flex:1 }}>
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #38200C' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#885030', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Canal — CS-ISM</div>
              <div style={{ fontSize:19, fontWeight:800, color:'#CC7848' }}>#brasil-cs-ism</div>
              <div style={{ fontSize:12.5, color:'#885030', marginTop:3 }}>Criar o ticket no formulário ANTES de solicitar no Slack</div>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14, flex:1 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#885030', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Quando usar — e quem mencionar</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {[
                    ['Alteração de turma / horário',        'Samantha'],
                    ['Solicitação de reembolso',             'Carlos Tamaoki'],
                    ['Correção de saldo',                    'Renan'],
                    ['Matrícula',                            'Helena ou Paloma'],
                    ['Informar cliente sobre data adiada',  'Samantha'],
                    ['Aviso de tutor ausente',               'Samantha'],
                  ].map(([caso, pessoa], i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'7px 10px', borderRadius:7, background:'#140C04' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ color:'#A86038', fontSize:11, flexShrink:0 }}>◆</span>
                        <span style={{ fontSize:13, color:'#C09068', lineHeight:1.4 }}>{caso}</span>
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:700, color:'#CC7848', whiteSpace:'nowrap', flexShrink:0 }}>@{pessoa}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#885030', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Modelo de mensagem</div>
                <div style={{ background:'#0E0804', border:'1px solid #38200C', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:'#885030', marginBottom:9 }}>🧑 Você no #brasil-cs-ism</div>
                  <div style={{ fontSize:13, color:'#C09870', lineHeight:1.9, borderLeft:'3px solid #A86038', paddingLeft:12 }}>
                    <strong style={{ color:'#CC7848' }}>@[pessoa responsável]</strong> boa noite!<br/>
                    Por favor, poderia realizar <em style={{ color:'#DEC0A0' }}>[a solicitação]</em> para o aluno <em style={{ color:'#DEC0A0' }}>[nome]</em>?<br/>
                    <em style={{ color:'#806048', fontSize:12.5 }}>Situação: [descreva o contexto brevemente]</em><br/>
                    <span style={{ color:'#4A9E70', fontWeight:600 }}>✅ Formulário enviado</span><br/>
                    <span style={{ color:'#503020', fontSize:12 }}>BO: <em>[link do backoffice do aluno]</em></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <FlowSteps
            id="cs" title="Fluxo — CS-ISM"
            color="#CC7848" colorRgb="204,120,72" dim="#885030"
            bgCard="#1C1008" borderCard="#4A2A10"
            steps={[
              { icon:'📋', label:'Preenche o formulário' },
              { icon:'💬', label:'Envia no canal' },
              { icon:'🏷️', label:'Marca o responsável' },
              { icon:'⏳', label:'Aguarda resposta do CS' },
            ]}
          />
        </div>

      </div>

      {/* ── Reference table ── */}
      <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #141E28' }}>
        <div style={{ padding:'12px 20px', background:'#0A1420', borderBottom:'1px solid #141E28' }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:'#6080A0' }}>Tabela de referência completa</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#080E18' }}>
              <th style={{ ...TH, textAlign:'left',   color:'#50687A', width:'36%' }}>Motivo</th>
              <th style={{ ...TH, textAlign:'center', color:'#CC7848', width:'11%' }}>CS – ISM</th>
              <th style={{ ...TH, textAlign:'center', color:'#5AB4CC', width:'11%' }}>Teaching</th>
              <th style={{ ...TH, textAlign:'center', color:'#50687A', width:'26%' }}>Menção</th>
              <th style={{ ...TH, textAlign:'center', color:'#50687A', width:'16%' }}>Formulário</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m:'Aula Experimental',                cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Aula Motivacional',                cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Turma Individual',                 cs:false, t:true,  p:'Alysson Caldas',    f:false },
              { m:'Solicitação Overbooking',          cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Autorizações para Exceção: Idade', cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Aula de Nivelamento',              cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Feedback – Aula e/ou Tutor',      cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Link Grupo WhatsApp',              cs:false, t:true,  p:'TL do Tutor',       f:false },
              { m:'Alteração de Turma / Horário',     cs:true,  t:false, p:'Samantha',           f:true  },
              { m:'Solicitação de Reembolso',         cs:true,  t:false, p:'Carlos Tamaoki',    f:true  },
              { m:'Correção de Saldo',                cs:true,  t:false, p:'Renan',              f:true  },
              { m:'Matrícula',                        cs:true,  t:false, p:'Helena ou Paloma',   f:true  },
            ].map((row, i, arr) => (
              <tr key={i} style={{ background: i%2===0 ? '#080E18' : '#0A1220', borderBottom: i<arr.length-1 ? '1px solid #101820' : 'none' }}>
                <td style={{ padding:'11px 20px', fontSize:13, color:'#A8B8C8' }}>{row.m}</td>
                <td style={{ padding:'11px', textAlign:'center' }}>
                  {row.cs && <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#CC7848', opacity:0.85 }} />}
                </td>
                <td style={{ padding:'11px', textAlign:'center' }}>
                  {row.t && <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#5AB4CC', opacity:0.85 }} />}
                </td>
                <td style={{ padding:'11px 16px', textAlign:'center', fontSize:13, color:'#7890A0' }}>{row.p}</td>
                <td style={{ padding:'11px', textAlign:'center' }}>
                  {row.f
                    ? <span style={{ fontSize:12, fontWeight:700, color:'#4A9E70', background:'rgba(74,158,112,0.1)', border:'1px solid rgba(74,158,112,0.25)', borderRadius:6, padding:'2px 9px' }}>SIM</span>
                    : <span style={{ fontSize:13, color:'#202C38' }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

// Sequential glow animation: each step lights up in order, cycling slowly
function FlowSteps({ id, title, color, colorRgb, dim, bgCard, borderCard, steps }: {
  id: string; title: string; color: string; colorRgb: string; dim: string
  bgCard: string; borderCard: string
  steps: { icon: string; label: string }[]
}) {
  const totalDur = 8               // total cycle in seconds
  const stepDur  = totalDur / steps.length  // 2s per step

  // Each step peaks at 50% of the keyframe.
  // delay = i * stepDur - totalDur/2  → step i peaks at real time i * stepDur
  const css = `
    @keyframes ${id}-pulse {
      0%, 38%, 62%, 100% { opacity:0.38; background:rgba(${colorRgb},0.06); box-shadow:none; }
      50% { opacity:1; background:rgba(${colorRgb},0.22); box-shadow:0 0 16px rgba(${colorRgb},0.5), inset 0 0 0 1px rgba(${colorRgb},0.6); }
    }
    ${steps.map((_, i) =>
      `.${id}-s${i}{animation:${id}-pulse ${totalDur}s ease-in-out infinite;animation-delay:${(i * stepDur - totalDur / 2).toFixed(1)}s;animation-fill-mode:both;}`
    ).join('')}
  `

  return (
    <div style={{ borderRadius:12, background:bgCard, border:`1.5px solid ${borderCard}`, padding:'14px 16px', overflow:'visible' }}>
      <style>{css}</style>
      <div style={{ fontSize:11, fontWeight:700, color:dim, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{title}</div>
      <div style={{ display:'flex', alignItems:'stretch' }}>
        {steps.flatMap((step, i) => [
          <div
            key={`s${i}`}
            className={`${id}-s${i}`}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 8px', borderRadius:10, flex:1, textAlign:'center', border:'1px solid rgba(' + colorRgb + ',0.18)' }}
          >
            <span style={{ fontSize:17 }}>{step.icon}</span>
            <span style={{ fontSize:11.5, color, fontWeight:600, lineHeight:1.3 }}>{step.label}</span>
          </div>,
          ...(i < steps.length - 1 ? [
            <div key={`a${i}`} style={{ display:'flex', alignItems:'center', padding:'0 5px', color:dim, fontSize:16, flexShrink:0 }}>›</div>
          ] : [])
        ])}
      </div>
    </div>
  )
}

const TH: React.CSSProperties = {
  padding:'11px 16px', fontSize:10.5, fontWeight:700, letterSpacing:'0.08em',
  textTransform:'uppercase', fontFamily:"'Inter',sans-serif",
  borderBottom:'1px solid #141E28', whiteSpace:'nowrap',
}
