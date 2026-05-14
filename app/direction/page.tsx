'use client'

import { useRouter } from 'next/navigation';

const ITEMS = [
  {
    icon: '📊',
    label: 'LX Presentation',
    desc: 'Apresentação estratégica para a equipe LX com métricas e direcionamentos.',
    route: '/direction/brasil',
    color: 'rgba(0,194,255,0.12)',
    glow: 'rgba(0,194,255,0.2)',
  },
  {
    icon: '🔗',
    label: 'Indicações',
    desc: 'Painel completo de indicações de todos os managers — status, filtros e acompanhamento.',
    route: '/direction/indicacoes',
    color: 'rgba(168,85,247,0.12)',
    glow: 'rgba(168,85,247,0.2)',
  },
  {
    icon: '📈',
    label: 'Performance per Manager',
    desc: 'Relatório mensal de performance individual — metas, run rate, upgrades e avaliação.',
    route: '/minha-area',
    color: 'rgba(0,255,178,0.10)',
    glow: 'rgba(0,255,178,0.2)',
  },
];

export default function DirectionPage() {
  const router = useRouter();

  return (
    <div style={{ padding:'56px 40px', maxWidth:900, margin:'0 auto', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:48 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10, fontFamily:"'Inter',sans-serif" }}>
          Direção
        </div>
        <h1 style={{
          margin:0, fontSize:32, fontWeight:800, letterSpacing:'-0.02em',
          background:'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.5))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          fontFamily:"'Inter',sans-serif",
        }}>Direction</h1>
        <p style={{ margin:'10px 0 0', fontSize:15, color:'var(--text-dim)', maxWidth:420 }}>
          Recursos estratégicos e apresentações para liderança. Acesse pelo card ou pelo menu lateral.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
        {ITEMS.map((item, i) => (
          <div
            key={item.route}
            onClick={() => router.push(item.route)}
            style={{
              background:'var(--card)',
              border:'1px solid var(--border)',
              borderRadius:16, padding:'28px 24px',
              cursor:'pointer',
              transition:'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              animation:`fadeUp 0.35s ease both`,
              animationDelay:`${i * 0.07}s`,
              position:'relative', overflow:'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(0,194,255,0.28)';
              el.style.transform = 'translateY(-4px)';
              el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,194,255,0.12)`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--border)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{
              position:'absolute', top:-30, right:-30, width:100, height:100,
              borderRadius:'50%', background:item.color,
              filter:'blur(28px)', pointerEvents:'none',
            }} />

            <div style={{
              width:48, height:48, borderRadius:12, marginBottom:18,
              background:item.color, border:`1px solid ${item.glow}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22,
            }}>{item.icon}</div>

            <h3 style={{
              margin:'0 0 8px', fontSize:15, fontWeight:700,
              color:'var(--text)', fontFamily:"'Inter',sans-serif",
            }}>{item.label}</h3>

            <p style={{
              margin:'0 0 20px', fontSize:13, color:'var(--text-dim)', lineHeight:1.6,
            }}>{item.desc}</p>

            <div style={{
              display:'flex', alignItems:'center', gap:5,
              fontSize:12, fontWeight:600, color:'var(--accent)',
              fontFamily:"'Inter',sans-serif",
            }}>
              Abrir <span style={{ fontSize:11 }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
