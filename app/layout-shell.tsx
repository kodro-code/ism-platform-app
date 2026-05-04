'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function UserAvatar({ name, fileId }: { name: string; photoUrl: string; fileId: string }) {
  const [err, setErr] = useState(false);
  const url = fileId ? `/api/photo?id=${fileId}` : '';
  return (
    <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'1px solid rgba(0,255,178,0.3)', boxShadow:'0 0 8px rgba(0,255,178,0.15)' }}>
      {url && !err
        ? <img src={url} alt={name} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,rgba(0,255,178,0.25),rgba(0,194,255,0.15))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'var(--accent)', fontFamily:"'Inter',sans-serif" }}>{name[0]}</div>
      }
    </div>
  );
}

type Child   = { id: string; label: string; icon: string; route: string; desc?: string };
type NavItem = { id: string; label: string; icon?: string; route?: string; children?: Child[] };

const NAV: NavItem[] = [
  { id: 'home',    label: 'Home',           route: '/' },
  { id: 'team',    label: 'Meet the Team',  route: '/team' },
  { id: 'logros',  label: 'Achievements',   route: '/logros' },
  {
    id: 'tools', label: 'Tools', route: '/tools',
    children: [
      { id: 'calculadora', label: 'Calculadora de Preços', icon: '🧮', route: '/calculadora', desc: 'Calcule preços, margens e impostos' },
      { id: 'relatorio',   label: 'Relatório de Vendas',  icon: '📋', route: '/relatorio',   desc: 'Visualize e filtre vendas por período' },
      { id: 'cashback',    label: 'Gerador de Cashback',  icon: '💵', route: '/cashback',    desc: 'Gere links de cashback para clientes' },
      { id: 'turno',       label: 'Registro de Turno',    icon: '🕐', route: '/turno',       desc: 'Relatório de final de turno e solicitações' },
      { id: 'indicacoes',  label: 'Indicações',           icon: '🔗', route: '/tools/indicacoes', desc: 'Gere links de indicação e acompanhe referrals' },
    ],
  },
  {
    id: 'courses', label: 'Courses', route: '/courses',
    children: [],
  },
  {
    id: 'direction', label: 'Direction', route: '/direction',
    children: [
      { id: 'brasil',            label: 'LX Presentation', icon: '📊', route: '/direction/brasil',            desc: 'Apresentação para a equipe LX' },
      { id: 'dir-indicacoes',    label: 'Indicações',      icon: '🔗', route: '/direction/indicacoes',        desc: 'Painel de indicações de todos os managers' },
    ],
  },
  { id: 'soporte', label: 'Suporte Técnico', icon: '🎫', route: '/soporte' },
];

// Export for landing pages to use
export { NAV };
export type { Child, NavItem };

function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(0,255,178,0.05)', border:'1px solid rgba(0,255,178,0.12)', borderRadius:8, padding:'6px 12px' }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 7px var(--accent)', animation:'pulse 2s infinite' }} />
      <div>
        <div style={{ fontSize:14, fontWeight:700, color:'var(--accent)', lineHeight:1, fontFamily:"'Inter',sans-serif" }}>{time}</div>
        <div style={{ fontSize:11, color:'rgba(232,237,245,0.5)', textTransform:'capitalize', marginTop:2, fontFamily:"'Inter',sans-serif" }}>{date}</div>
      </div>
    </div>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const { data: session } = useSession();
  const [openSidebar,  setOpenSidebar]  = useState<string | null>(null);
  const [scrolled,     setScrolled]     = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(false);
  const sidebarRef     = useRef<HTMLDivElement>(null);
  const navRef         = useRef<HTMLElement>(null);
  const didRestoreRef  = useRef(false);

  // Restore sidebar from localStorage on mount (only if current page is within that group)
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_open');
    if (!saved) return;
    const item = NAV.find(n => n.id === saved);
    if (!item) return;
    const groupRoutes = [item.route, ...(item.children?.map(c => c.route) ?? [])].filter(Boolean) as string[];
    if (groupRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
      setOpenSidebar(saved);
    }
  }, []);

  // Persist sidebar state to localStorage — skip the very first run so we
  // don't erase localStorage before the restore effect above has applied.
  useEffect(() => {
    if (!didRestoreRef.current) { didRestoreRef.current = true; return; }
    if (openSidebar) {
      localStorage.setItem('sidebar_open', openSidebar);
    } else {
      localStorage.removeItem('sidebar_open');
    }
  }, [openSidebar]);

  // Keep sidebar open within group; close only when leaving the group
  useEffect(() => {
    if (!openSidebar) return;
    const item = NAV.find(n => n.id === openSidebar);
    const groupRoutes = [
      item?.route,
      ...(item?.children?.map(c => c.route) ?? []),
    ].filter(Boolean) as string[];
    const withinGroup = groupRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
    if (!withinGroup) setOpenSidebar(null);
  }, [pathname]);

  // Scroll detection
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenSidebar(null); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Welcome toast — uma vez por sessão do browser
  useEffect(() => {
    if (session?.user && !sessionStorage.getItem('nf_welcomed')) {
      sessionStorage.setItem('nf_welcomed', '1');
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 4000);
    }
  }, [session]);

  // Login page: render bare, no shell — DESPUÉS de todos los hooks
  if (pathname === '/login' || pathname.startsWith('/indicacao')) return <>{children}</>;

  const isAdmin    = session?.user?.rol === 'admin';
  const userName   = (session?.user?.nombre ?? '').replace(/^ISM\s+/i, '').trim().split(' ')[0];
  const userFoto   = session?.user?.foto ?? '';
  const visibleNav = NAV.filter(item => item.id !== 'direction' || isAdmin);

  function fileId(url: string) {
    if (!url) return '';
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m2 ? m2[1] : '';
  }

  function isActive(item: NavItem) {
    if (item.route && (pathname === item.route || pathname.startsWith(item.route + '/'))) return true;
    return item.children?.some(c => pathname === c.route || pathname.startsWith(c.route + '/')) ?? false;
  }

  function handleGroupClick(item: NavItem) {
    const sidebarOpen = openSidebar === item.id;
    if (sidebarOpen) {
      setOpenSidebar(null);
      return;
    }
    // Navigate to landing only if not already within the group
    const groupRoutes = [item.route, ...(item.children?.map(c => c.route) ?? [])].filter(Boolean) as string[];
    const withinGroup = groupRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
    if (!withinGroup && item.route) router.push(item.route);
    setOpenSidebar(item.id);
  }

  const isFullPage = ['/calculadora', '/cashback'].includes(pathname) || pathname.startsWith('/direction/');

  const navBg     = scrolled ? 'rgba(8,11,16,0.96)' : 'rgba(8,11,16,0.55)';
  const navBorder = scrolled ? 'var(--border)' : 'transparent';
  const activeSidebarItem = NAV.find(n => n.id === openSidebar);

  return (
    <>
      <div className="grid-bg" />

      {/* ── TOP NAV ── */}
      <header ref={navRef} style={{
        position:'fixed', top:0, left:0, right:0, height:64, zIndex:200,
        background: navBg, borderBottom:`1px solid ${navBorder}`,
        backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
        display:'flex', alignItems:'center', padding:'0 28px',
        transition:'background 0.3s, border-color 0.3s',
      }}>

        {/* Logo */}
        <div onClick={() => router.push('/')} style={{ cursor:'pointer', marginRight:24, display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,rgba(0,255,178,0.18),rgba(0,194,255,0.12))', border:'1px solid rgba(0,255,178,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:14, fontWeight:900, background:'linear-gradient(135deg,#00FFB2,#00C2FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Inter',sans-serif" }}>N</span>
          </div>
          <span style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.01em', background:'linear-gradient(135deg,#00FFB2,#00C2FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Inter',sans-serif" }}>NexaForce</span>
        </div>

        {/* Nav links */}
        <nav style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
          {visibleNav.map(item => {
            const active      = isActive(item);
            const sidebarOpen = openSidebar === item.id;

            const btnStyle: React.CSSProperties = {
              display:'flex', alignItems:'center', gap:5,
              padding:'7px 14px', borderRadius:8,
              background: (active || sidebarOpen) ? 'var(--accent-dim)' : 'transparent',
              border:`1px solid ${(active || sidebarOpen) ? 'rgba(0,255,178,0.25)' : 'transparent'}`,
              color: (active || sidebarOpen) ? 'var(--accent)' : 'var(--text-dim)',
              fontSize:13.5, fontWeight: (active || sidebarOpen) ? 600 : 500,
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              transition:'all 0.15s', whiteSpace:'nowrap',
            };

            // Simple nav links (no children)
            if (!item.children) {
              const isSupport = item.id === 'soporte';
              const supportStyle: React.CSSProperties = isSupport ? {
                ...btnStyle,
                background: active ? 'var(--accent-dim)' : 'rgba(0,255,178,0.06)',
                border: `1px solid ${active ? 'rgba(0,255,178,0.35)' : 'rgba(0,255,178,0.18)'}`,
                color: active ? 'var(--accent)' : 'rgba(0,255,178,0.75)',
                marginLeft: 8,
              } : btnStyle;
              return (
                <button key={item.id} style={isSupport ? supportStyle : btnStyle}
                  onClick={() => router.push(item.route!)}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget; el.style.color = isSupport ? 'var(--accent)' : 'var(--text)'; el.style.background = isSupport ? 'rgba(0,255,178,0.12)' : 'rgba(255,255,255,0.05)'; }}}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget; el.style.color = isSupport ? 'rgba(0,255,178,0.75)' : 'var(--text-dim)'; el.style.background = isSupport ? 'rgba(0,255,178,0.06)' : 'transparent'; }}}
                >
                  {item.icon && <span style={{ fontSize:13, lineHeight:1 }}>{item.icon}</span>}
                  {item.label}
                </button>
              );
            }

            // Sidebar-trigger buttons (Tools, Courses, Direction)
            return (
              <button key={item.id} style={btnStyle}
                onClick={() => handleGroupClick(item)}
                onMouseEnter={e => { if (!active && !sidebarOpen) { const el = e.currentTarget; el.style.color = 'var(--text)'; el.style.background = 'rgba(255,255,255,0.05)'; }}}
                onMouseLeave={e => { if (!active && !sidebarOpen) { const el = e.currentTarget; el.style.color = 'var(--text-dim)'; el.style.background = 'transparent'; }}}
              >
                {item.label}
                <span style={{ fontSize:9, opacity:0.5, marginLeft:1, display:'inline-block', transform: sidebarOpen ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>▾</span>
              </button>
            );
          })}
        </nav>

        {/* Right — greeting + clock + logout */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>

          {/* Greeting next to clock */}
          {userName && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:8, background:'rgba(0,255,178,0.05)', border:'1px solid rgba(0,255,178,0.12)' }}>
              <UserAvatar name={userName} photoUrl={userFoto} fileId={fileId(userFoto)} />
              <div>
                <div style={{ fontSize:10, color:'rgba(232,237,245,0.6)', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>Olá,</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Inter',sans-serif", lineHeight:1.3 }}>{userName} 👋</div>
              </div>
            </div>
          )}

          <Clock />

          {userName && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:8, background:'transparent', border:'1px solid var(--border)', color:'var(--text-dim)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,77,77,0.35)'; el.style.color = '#FF7070'; el.style.background = 'rgba(255,77,77,0.06)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-dim)'; el.style.background = 'transparent'; }}
            >
              <span style={{ fontSize:11 }}>⏻</span> Sair
            </button>
          )}
        </div>
      </header>

      {/* ── LEFT SIDEBAR ── */}
      {openSidebar && (
        <div ref={sidebarRef} style={{
          position:'fixed', top:64, left:0, bottom:0, width:252,
          background:'rgba(10,14,20,0.98)',
          borderRight:'1px solid var(--border-mid)',
          backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
          zIndex:190,
          display:'flex', flexDirection:'column',
          animation:'slideInLeft 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
          boxShadow:'4px 0 32px rgba(0,0,0,0.4)',
        }}>

          {/* Sidebar header */}
          <div style={{
            padding:'18px 16px 14px',
            borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>
                {activeSidebarItem?.label}
              </div>
              <div style={{ fontSize:11, color:'var(--text-faint)', opacity:0.55 }}>
                {activeSidebarItem?.children?.length ?? 0} {activeSidebarItem?.children?.length === 1 ? 'item' : 'items'}
              </div>
            </div>
            <button
              onClick={() => setOpenSidebar(null)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:16, padding:4, lineHeight:1, borderRadius:6, transition:'color 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; }}
            >✕</button>
          </div>

          {/* Sidebar items */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 8px' }}>
            {activeSidebarItem?.children && activeSidebarItem.children.length > 0 ? (
              activeSidebarItem.children.map((child, i) => {
                const childActive = pathname === child.route || pathname.startsWith(child.route + '/');
                return (
                  <div
                    key={child.id}
                    className={`sidebar-item${childActive ? ' active' : ''}`}
                    onClick={() => router.push(child.route)}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'11px 12px', borderRadius:9, cursor:'pointer',
                      background: childActive ? 'var(--accent-dim)' : 'transparent',
                      border:`1px solid ${childActive ? 'rgba(0,255,178,0.2)' : 'transparent'}`,
                      marginBottom:3, transition:'all 0.12s',
                      animation:`fadeUp 0.2s ease both`,
                      animationDelay:`${i * 0.04}s`,
                    }}
                    onMouseEnter={e => { if (!childActive) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'var(--border)'; }}}
                    onMouseLeave={e => { if (!childActive) { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'transparent'; }}}
                  >
                    <span className="sidebar-icon" style={{ fontSize:19, lineHeight:1, flexShrink:0 }}>{child.icon}</span>
                    <div>
                      <div style={{ fontSize:13, color: childActive ? 'var(--accent)' : 'var(--text)', fontFamily:"'Inter',sans-serif", fontWeight: childActive ? 600 : 400, lineHeight:1.3 }}>{child.label}</div>
                      {child.desc && <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:2, lineHeight:1.3 }}>{child.desc}</div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 16px', gap:10 }}>
                <div style={{ fontSize:28, opacity:0.4 }}>🚧</div>
                <div style={{ fontSize:13, color:'var(--text-faint)', textAlign:'center' }}>Em breve...</div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── WELCOME TOAST ── */}
      {showWelcome && (
        <div style={{
          position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
          zIndex:999, display:'flex', alignItems:'center', gap:12,
          padding:'14px 24px', borderRadius:16,
          background:'rgba(13,17,23,0.97)', border:'1px solid rgba(0,255,178,0.3)',
          boxShadow:'0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,178,0.06)',
          backdropFilter:'blur(20px)',
          animation:'fadeUp 0.4s cubic-bezier(0.34,1.3,0.64,1) both',
          whiteSpace:'nowrap',
        }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(0,255,178,0.2),rgba(0,194,255,0.12))', border:'1px solid rgba(0,255,178,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👋</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Inter',sans-serif" }}>
              Bem-vindo à plataforma NexaForce{userName ? `, ${userName}` : ''}!
            </div>
            <div style={{ fontSize:11, color:'rgba(232,237,245,0.55)', fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>
              Bom trabalho hoje 🚀
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div
        key={pathname}
        className="page-in"
        style={isFullPage
          ? { marginTop:64, marginLeft: openSidebar ? 252 : 0, height:'calc(100vh - 64px)', overflow:'hidden', display:'flex', flexDirection:'column', transition:'margin-left 0.22s cubic-bezier(0.25,0.46,0.45,0.94)' }
          : { marginTop:64, marginLeft: openSidebar ? 252 : 0, minHeight:'calc(100vh - 64px)', position:'relative', zIndex:1, transition:'margin-left 0.22s cubic-bezier(0.25,0.46,0.45,0.94)' }
        }
      >
        {children}
      </div>
    </>
  );
}
