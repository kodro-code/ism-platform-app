'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DiamondBg from '@/components/diamond-bg'

const ALL_ITEMS = [
  {
    id: 'minha-area',
    icon: '📊', label: 'Minha Área',
    desc: 'Relatório mensal de performance pessoal — metas, run rate e avaliação.',
    route: '/minha-area',
    color: 'rgba(0,255,178,0.10)', glow: 'rgba(0,255,178,0.22)', accent: '#00FFB2',
    adminOnly: false, hideForAdmin: true,
  },
  {
    id: 'soporte',
    icon: '🎫', label: 'Suporte Técnico',
    desc: 'Abra um ticket de suporte técnico para resolução de problemas.',
    route: '/soporte',
    color: 'rgba(255,179,64,0.10)', glow: 'rgba(255,179,64,0.22)', accent: '#FFB340',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'comunicacao',
    icon: '📨', label: 'CS / Teaching',
    desc: 'A quem acionar e quando abrir o formulário — por motivo da solicitação.',
    route: '/tools/comunicacao',
    color: 'rgba(157,143,255,0.10)', glow: 'rgba(157,143,255,0.22)', accent: '#9D8FFF',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'calculadora',
    icon: '🧮', label: 'Calculadora de Preços',
    desc: 'Calcule preços, margens e impostos de forma rápida e precisa.',
    route: '/calculadora',
    color: 'rgba(0,255,178,0.10)', glow: 'rgba(0,255,178,0.22)', accent: '#00FFB2',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'relatorio',
    icon: '📋', label: 'Relatório de Vendas',
    desc: 'Visualize e filtre os relatórios de vendas por período e vendedor.',
    route: '/relatorio',
    color: 'rgba(0,194,255,0.10)', glow: 'rgba(0,194,255,0.22)', accent: '#00C2FF',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'cashback',
    icon: '💵', label: 'Gerador de Cashback',
    desc: 'Gere links e valores de cashback personalizados para clientes.',
    route: '/cashback',
    color: 'rgba(0,255,178,0.10)', glow: 'rgba(0,255,178,0.22)', accent: '#00FFB2',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'turno',
    icon: '🕐', label: 'Registro de Turno',
    desc: 'Registre o relatório de final de turno e solicite mudanças de horário.',
    route: '/turno',
    color: 'rgba(180,126,255,0.10)', glow: 'rgba(180,126,255,0.22)', accent: '#B47EFF',
    adminOnly: false, hideForAdmin: false,
  },
  {
    id: 'indicacoes',
    icon: '🔗', label: 'Indicações',
    desc: 'Gere links de indicação e acompanhe o status dos seus referrals.',
    route: '/tools/indicacoes',
    color: 'rgba(157,143,255,0.10)', glow: 'rgba(157,143,255,0.22)', accent: '#9D8FFF',
    adminOnly: false, hideForAdmin: false,
  },
]

export default function ToolsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin ?? false

  const items = ALL_ITEMS.filter(item => !(item.hideForAdmin && isAdmin))

  return (
    <div style={{ position:'relative', minHeight:'100%', padding:'48px 36px', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
      <DiamondBg />

      <div style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8, fontFamily:"'Inter',sans-serif" }}>
            Ferramentas
          </div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:800, letterSpacing:'-0.02em', background:'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.5))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Inter',sans-serif" }}>
            Tools
          </h1>
          <p style={{ margin:'8px 0 0', fontSize:14, color:'var(--text-dim)', maxWidth:400 }}>
            Selecione uma ferramenta ou acesse pelo menu lateral.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {items.map((item, i) => (
            <div
              key={item.route}
              onClick={() => router.push(item.route)}
              style={{
                background:'var(--card)', border:'1px solid var(--border)',
                borderRadius:14, padding:'20px 18px',
                cursor:'pointer',
                transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                animation:`fadeUp 0.35s ease both`,
                animationDelay:`${i * 0.055}s`,
                position:'relative', overflow:'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = item.glow
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 12px 36px rgba(0,0,0,0.3)`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{ position:'absolute', top:-24, right:-24, width:80, height:80, borderRadius:'50%', background:item.color, filter:'blur(22px)', pointerEvents:'none' }} />
              <div style={{ width:40, height:40, borderRadius:10, marginBottom:12, background:item.color, border:`1px solid ${item.glow}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                {item.icon}
              </div>
              <h3 style={{ margin:'0 0 6px', fontSize:13.5, fontWeight:700, color:'var(--text)', fontFamily:"'Inter',sans-serif", lineHeight:1.3 }}>
                {item.label}
              </h3>
              <p style={{ margin:'0 0 14px', fontSize:12, color:'var(--text-dim)', lineHeight:1.55 }}>
                {item.desc}
              </p>
              <div style={{ fontSize:11.5, fontWeight:600, color:item.accent, fontFamily:"'Inter',sans-serif" }}>
                Abrir →
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  )
}
