'use client'

const SUPPORT_URL = 'https://kodland-support.atlassian.net/servicedesk/customer/portal/3/create/37';

const WHEN_ITEMS = [
  { icon: '❌', text: 'O WSS não está funcionando' },
  { icon: '📞', text: 'O CallGear não está permitindo chamadas' },
  { icon: '🔄', text: 'O CallGear não está registrando chamadas' },
  { icon: '⚠️', text: 'O BO não está abrindo' },
  { icon: '🔑', text: 'Precisamos recuperar o acesso às nossas contas' },
  { icon: '👤', text: 'O perfil de um estudante não permite alterar o status ou atualizá-lo' },
  { icon: '🚫', text: 'Não é possível ver o painel ISM nem a seção de tarefas' },
];

const STEPS = [
  { num: '1',  text: 'Abra o formulário pelo botão acima.' },
  { num: '2',  text: 'Insira seu e-mail corporativo na primeira seção.' },
  { num: '3',  text: 'Forneça uma breve descrição do problema.' },
  { num: '4',  text: 'Escreva uma explicação mais detalhada na próxima seção.' },
  { num: '5',  text: 'Especifique o sistema em que está tendo problemas.' },
  { num: '6',  text: 'Insira seu e-mail corporativo novamente.' },
  { num: '7',  text: 'Selecione o segmento: LATAM | Brazil e insira seu cargo: ISM.' },
  { num: '8',  text: 'Especifique seu sistema operacional e o navegador que está usando (ex: Chrome).' },
  { num: '10', text: 'Insira seu e-mail corporativo novamente, anexe um print e envie o ticket.', highlight: 'Se você perdeu o acesso, pode fornecer um e-mail pessoal apenas nesta seção para receber atualizações.' },
];

export default function SoportePage() {
  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 64px)', fontFamily:"'DM Sans', sans-serif" }}>

      {/* Subtle background — covers grid, adds soft glow */}
      <div style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,178,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,194,255,0.03) 0%, transparent 60%)',
        backdropFilter:'none',
      }} />
      {/* Solid overlay to mute the grid */}
      <div style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'rgba(8,11,16,0.82)',
      }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32 }}>
          <div style={{
            width:50, height:50, borderRadius:14, flexShrink:0,
            background:'linear-gradient(135deg,rgba(0,255,178,0.15),rgba(0,194,255,0.1))',
            border:'1px solid rgba(0,255,178,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          }}>🎫</div>
          <div>
            <h1 style={{
              margin:0, fontSize:26, fontWeight:800,
              background:'linear-gradient(135deg,#00FFB2,#00C2FF)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              fontFamily:"'Inter',sans-serif",
            }}>Suporte Técnico</h1>
            <p style={{ margin:'3px 0 0', fontSize:13, color:'var(--text-faint)' }}>
              Como abrir um ticket no Jira para reportar problemas
            </p>
          </div>
        </div>

        {/* ── CTA Button ── */}
        <div style={{ marginBottom:40 }}>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:10,
              padding:'14px 30px', borderRadius:12,
              background:'linear-gradient(135deg,rgba(0,255,178,0.18),rgba(0,194,255,0.12))',
              border:'1px solid rgba(0,255,178,0.35)',
              color:'var(--accent)', fontSize:15, fontWeight:700,
              textDecoration:'none', fontFamily:"'Inter',sans-serif",
              boxShadow:'0 0 24px rgba(0,255,178,0.1)',
              transition:'all 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'linear-gradient(135deg,rgba(0,255,178,0.26),rgba(0,194,255,0.18))';
              el.style.boxShadow = '0 0 36px rgba(0,255,178,0.2)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'linear-gradient(135deg,rgba(0,255,178,0.18),rgba(0,194,255,0.12))';
              el.style.boxShadow = '0 0 24px rgba(0,255,178,0.1)';
            }}
          >
            <span style={{ fontSize:18 }}>🎫</span>
            Abrir Formulário de Suporte
            <span style={{ fontSize:13, opacity:0.6 }}>↗</span>
          </a>
        </div>

        {/* ── When section ── */}
        <SectionTitle>📩 Quando abrir um ticket no Jira?</SectionTitle>
        <p style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.7, marginBottom:18 }}>
          Abrimos um ticket quando algo no sistema não está funcionando e precisa ser resolvido pelo suporte:
        </p>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          gap:12, marginBottom:36,
        }}>
          {WHEN_ITEMS.map((item, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'flex-start', gap:12,
              background:'rgba(255,255,255,0.03)',
              border:'1px solid var(--border)',
              borderRadius:12, padding:'14px 16px',
              transition:'border-color 0.15s, background 0.15s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0,255,178,0.18)';
                el.style.background = 'rgba(0,255,178,0.04)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <span style={{ fontSize:20, lineHeight:1, flexShrink:0, marginTop:1 }}>{item.icon}</span>
              <span style={{ fontSize:13.5, color:'var(--text)', lineHeight:1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ── How section ── */}
        <SectionTitle>📝 Como abrir um ticket no Jira?</SectionTitle>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:36 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display:'flex', gap:14, alignItems:'flex-start',
              background:'rgba(255,255,255,0.025)',
              border:'1px solid var(--border)',
              borderRadius:10, padding:'13px 16px',
            }}>
              <div style={{
                flexShrink:0, width:28, height:28, borderRadius:8,
                background:'linear-gradient(135deg,rgba(0,255,178,0.15),rgba(0,194,255,0.1))',
                border:'1px solid rgba(0,255,178,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, color:'var(--accent)',
                fontFamily:"'Inter',sans-serif",
              }}>{step.num}</div>
              <div>
                <p style={{ margin:0, fontSize:14, color:'var(--text)', lineHeight:1.5 }}>{step.text}</p>
                {step.highlight && (
                  <p style={{ margin:'6px 0 0', fontSize:12, color:'var(--text-faint)', lineHeight:1.5, fontStyle:'italic' }}>
                    💡 {step.highlight}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Final step ── */}
        <div style={{
          background:'linear-gradient(135deg,rgba(0,255,178,0.07),rgba(0,194,255,0.04))',
          border:'1px solid rgba(0,255,178,0.2)',
          borderRadius:14, padding:'20px 22px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:16 }}>🔹</span>
            <span style={{ fontSize:15, fontWeight:700, color:'var(--accent)', fontFamily:"'Inter',sans-serif" }}>
              Etapa Final
            </span>
          </div>
          <p style={{ margin:'0 0 10px', fontSize:14, color:'var(--text)', lineHeight:1.7 }}>
            📌 Após o envio, você receberá um <strong>código de ticket</strong> (ex:{' '}
            <code style={{
              background:'rgba(0,255,178,0.1)', border:'1px solid rgba(0,255,178,0.2)',
              borderRadius:5, padding:'1px 6px', fontSize:13, color:'var(--accent)',
              fontFamily:"'Inter',sans-serif",
            }}>KIS-XXXXX</code>).
          </p>
          <p style={{ margin:0, fontSize:14, color:'var(--text-dim)', lineHeight:1.7 }}>
            📢 <strong style={{ color:'var(--text)' }}>Compartilhe esse código</strong> no{' '}
            <em>ISM Reports</em> ou no <em>grupo do Telegram</em> para que os supervisores sejam informados do problema e saibam que está sendo resolvido.
          </p>
        </div>

      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize:15, fontWeight:700, color:'var(--text)',
      fontFamily:"'Inter',sans-serif",
      marginBottom:14, paddingBottom:10,
      borderBottom:'1px solid var(--border)',
    }}>{children}</h2>
  );
}
