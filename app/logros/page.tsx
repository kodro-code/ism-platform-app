'use client'

import { useState, useEffect, useRef } from 'react';

interface Award {
  manager:  string;
  active:   boolean;
  month:    number;
  year:     number;
  award:    string;
  photoUrl: string;
  notes:    string;
}

const AWARD_CFG: Record<string, { color:string; glow:string; label:string; image:string }> = {
  'Manager of Month': { color:'#a855f7', glow:'rgba(168,85,247,',  label:'Manager of Month', image:'/awards/manager-of-month.jpg' },
  'Best Revenue':     { color:'#10b981', glow:'rgba(16,185,129,',  label:'Best Revenue',     image:'/awards/best-revenue.jpg'     },
  'Best AOV':         { color:'#f59e0b', glow:'rgba(245,158,11,',  label:'Best AOV',         image:'/awards/best-aov.jpg'         },
  'Best Utilization': { color:'#3b82f6', glow:'rgba(59,130,246,',  label:'Best Utilization', image:'/awards/best-utilization.jpg' },
};
const AWARD_ORDER = ['Manager of Month', 'Best Revenue', 'Best AOV', 'Best Utilization'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fileIdFromUrl(raw:string):string {
  if (!raw) return '';
  const m = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  const m2 = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m2 ? m2[1] : '';
}
function stripISM(name:string){ return name.replace(/^ISM\s+/i,'').trim(); }
function initials(name:string){ return stripISM(name).split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(); }
function shortName(name:string){ return stripISM(name).split(/\s+/).slice(0,2).join(' '); }

function ManagerPhoto({ name, photoUrl, size, color }: { name:string; photoUrl:string; size:number; color:string }) {
  const [err, setErr] = useState(false);
  const id  = fileIdFromUrl(photoUrl);
  const url = id ? `/api/photo?id=${id}` : '';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:`2px solid ${color}70`, boxShadow:`0 0 14px ${color}45` }}>
      {url && !err
        ? <img src={url} alt={name} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ width:'100%', height:'100%', background:`${color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:800, color, fontFamily:"'Inter',sans-serif" }}>{initials(name)}</div>
      }
    </div>
  );
}

function AwardImage({ cfg, fill=false }: { cfg:{ color:string; label:string; image:string }; fill?:boolean }) {
  const [err, setErr] = useState(false);
  const FALLBACK: Record<string, string> = {
    'Manager of Month':'🏆', 'Best Revenue':'💰', 'Best AOV':'🏅', 'Best Utilization':'📈',
  };
  if (!err) {
    return <img src={cfg.image} alt={cfg.label} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit: fill ? 'cover' : 'contain' }} />;
  }
  return (
    <div style={{ width:'100%', height:'100%', background:`${cfg.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42 }}>
      {FALLBACK[cfg.label]}
    </div>
  );
}

function SparkleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, raf = 0;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const COLORS = ['rgba(245,158,11,','rgba(168,85,247,','rgba(16,185,129,','rgba(59,130,246,','rgba(0,255,178,'];
    type Spark = { x:number; y:number; vy:number; size:number; opacity:number; color:string; phase:number; speed:number };
    const sparks: Spark[] = Array.from({ length:80 }, () => ({
      x: Math.random()*1600, y: Math.random()*900,
      vy: 0.3+Math.random()*0.5, size: 1.2+Math.random()*3,
      opacity: 0.25+Math.random()*0.4,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      phase: Math.random()*Math.PI*2, speed: 0.012+Math.random()*0.02,
    }));
    const tick = () => {
      ctx.clearRect(0,0,W,H);
      sparks.forEach(s => {
        s.y -= s.vy; s.phase += s.speed;
        if (s.y < -10) { s.y = H+10; s.x = Math.random()*W; }
        const op = s.opacity*(0.55+0.45*Math.sin(s.phase));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
        ctx.fillStyle = `${s.color}${op})`; ctx.fill();
        if (s.size > 1.8) {
          ctx.strokeStyle = `${s.color}${op*0.5})`; ctx.lineWidth=0.5;
          ctx.beginPath(); ctx.moveTo(s.x-s.size*1.8,s.y); ctx.lineTo(s.x+s.size*1.8,s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x,s.y-s.size*1.8); ctx.lineTo(s.x,s.y+s.size*1.8); ctx.stroke();
        }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />;
}

export default function AchievementsPage() {
  const [awards, setAwards]         = useState<Award[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [flippedCard, setFlipped]   = useState<string | null>(null);
  const [confettiCard, setConfetti] = useState<string | null>(null);

  function playFlipSound() {
    try {
      const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  function handleCardEnter(type: string) {
    if (flippedCard !== type) {
      playFlipSound();
      setFlipped(type);
      setConfetti(type);
      setTimeout(() => setConfetti(null), 900);
    }
  }

  useEffect(() => {
    fetch('/api/achievements')
      .then(r => r.json())
      .then(d => { setAwards(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const latest = awards.reduce<{month:number;year:number}|null>((acc,a) => {
    if (!acc) return { month:a.month, year:a.year };
    return (a.year*12+a.month) > (acc.year*12+acc.month) ? { month:a.month, year:a.year } : acc;
  }, null);
  const displayMonth = latest?.month ?? (new Date().getMonth()+1);
  const displayYear  = latest?.year  ?? new Date().getFullYear();

  const thisMonth = awards.filter(a => a.month===displayMonth && a.year===displayYear);
  const byType: Record<string,Award[]> = {};
  AWARD_ORDER.forEach(t => { byType[t] = thisMonth.filter(a => a.award===t); });

  const managerNames = Array.from(new Set(awards.filter(a=>a.active).map(a=>a.manager)));
  const leaderboard = managerNames.map(name => {
    const mine = awards.filter(a => a.manager===name);
    const breakdown: Record<string,Award[]> = {};
    AWARD_ORDER.forEach(t => { breakdown[t] = mine.filter(a => a.award===t); });
    const total    = mine.length;
    const isNew    = mine.some(a => a.month===displayMonth && a.year===displayYear);
    const newCount = mine.filter(a => a.month===displayMonth && a.year===displayYear).length;
    return { name, total, breakdown, isNew, newCount };
  }).sort((a,b) => b.total-a.total);

  return (
    <div style={{ minHeight:'100%', background:'var(--bg)', position:'relative' }}>
      <SparkleField />
      <div style={{ position:'relative', zIndex:1, padding:'56px 32px 80px', maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12, fontFamily:"'Inter',sans-serif" }}>🏆 NexaForce</div>
          <h1 style={{ fontSize:40, fontWeight:900, color:'var(--text)', fontFamily:"'Inter',sans-serif", letterSpacing:'-0.02em', marginBottom:10 }}>Achievements</h1>
          <p style={{ fontSize:15, color:'var(--text-dim)', fontFamily:"'DM Sans',sans-serif" }}>{MONTHS[displayMonth-1]} {displayYear} · Monthly Awards</p>
        </div>

        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(0,255,178,0.15)', borderTopColor:'#00FFB2', borderRadius:'50%', animation:'spin 0.75s linear infinite' }}/>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Award Cards con flip ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24, marginBottom:72 }}>
              {AWARD_ORDER.map(type => {
                const cfg     = AWARD_CFG[type];
                const winners = byType[type] || [];
                const notes   = Array.from(new Set(winners.map(w=>w.notes).filter(n => n && typeof n==='string' && n.trim().length>2 && n.toLowerCase()!=='undefined' && n.toLowerCase()!=='false')));
                const isFlipped = flippedCard === type;
                const cardBase: React.CSSProperties = {
                  position:'absolute', inset:0, borderRadius:20,
                  backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
                  overflow:'hidden',
                };
                const CONFETTI_COLORS = [cfg.color,'#FFD700','#FF6B6B','#00FFB2','#B47EFF','#FF8C00','#00C2FF'];
                return (
                  <div key={type}
                    style={{ height:340, perspective:'1100px', cursor:'pointer', position:'relative' }}
                    onMouseEnter={() => handleCardEnter(type)}
                    onMouseLeave={() => setFlipped(null)}
                  >
                    {/* Confetti burst on flip */}
                    {confettiCard === type && Array.from({length:22}, (_,i) => {
                      const angle = (i/22)*Math.PI*2;
                      const dist  = 55 + (i*19 % 65);
                      const cx    = Math.round(Math.cos(angle)*dist);
                      const cy    = Math.round(Math.sin(angle)*dist - 15);
                      const cr    = (i*41) % 360;
                      const size  = 5 + (i*3 % 7);
                      return (
                        <div key={i} style={{
                          position:'absolute', left:'50%', top:'50%',
                          width:size, height:size,
                          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                          borderRadius: i%3===0 ? '50%' : i%3===1 ? '2px' : '1px',
                          animation:`confettiPop 0.75s ease-out ${i*0.018}s forwards`,
                          pointerEvents:'none', zIndex:30,
                          ['--cx' as string]:`${cx}px`,
                          ['--cy' as string]:`${cy}px`,
                          ['--cr' as string]:`${cr}deg`,
                        } as React.CSSProperties}/>
                      );
                    })}
                    <div style={{
                      width:'100%', height:'100%', position:'relative',
                      transformStyle:'preserve-3d',
                      transition:'transform 0.68s cubic-bezier(0.4,0,0.2,1)',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}>

                      {/* FRONT — imagen pura, sin texto */}
                      <div style={{ ...cardBase, border:`1px solid ${cfg.color}30`, boxShadow:`0 6px 32px ${cfg.glow}0.12)` }}>
                        <AwardImage cfg={cfg} fill />
                        <div style={{ position:'absolute', inset:0, borderRadius:20, boxShadow:`inset 0 0 0 2px ${cfg.color}`, pointerEvents:'none' }}/>
                        <div style={{ position:'absolute', inset:0, borderRadius:20, boxShadow:`0 0 40px ${cfg.glow}0.4)`, pointerEvents:'none' }}/>
                      </div>

                      {/* BACK — ganadores centrados + notas fijadas al fondo */}
                      <div style={{ ...cardBase, transform:'rotateY(180deg)', background:'rgba(13,17,23,0.98)', border:`1px solid ${cfg.color}40`, boxShadow:`0 0 40px ${cfg.glow}0.2)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 22px 20px' }}>

                        {/* Managers centrados verticalmente — ocupan el espacio disponible */}
                        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {winners.length === 0 ? (
                            <div style={{ fontSize:14, color:'var(--text-faint)', fontStyle:'italic', fontFamily:"'Inter',sans-serif" }}>No winner yet</div>
                          ) : (
                            <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
                              {winners.map(w => (
                                <div key={w.manager} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                                  <ManagerPhoto name={w.manager} photoUrl={w.photoUrl} size={76} color={cfg.color} />
                                  <div style={{ fontSize:16, fontWeight:800, color:'var(--text)', fontFamily:"'Inter',sans-serif", textAlign:'center', whiteSpace:'nowrap' }}>{shortName(w.manager)}</div>
                                  <div style={{ fontSize:11, color:cfg.color, fontFamily:"'Inter',sans-serif" }}>✨ {MONTHS[displayMonth-1]} {displayYear}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Notas — siempre al fondo, solo si existen */}
                        {notes.length > 0 && (
                          <div style={{ width:'100%', fontSize:12, color:'var(--text-dim)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, textAlign:'center', padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', marginTop:16, flexShrink:0 }}>
                            "{notes.join(' · ')}"
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Star Leaderboard ── */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ height:1, width:16, background:'rgba(255,255,255,0.07)' }}/>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'var(--accent)', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>⭐ Star Leaderboard</span>
                <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.05)' }}/>
              </div>
              <p style={{ fontSize:12, color:'var(--text-faint)', fontFamily:"'Inter',sans-serif", marginBottom:16 }}>Click on a manager to see their award history</p>

              <div style={{ display:'flex', flexDirection:'column', gap:8, overflowX:'auto' }}>
                {leaderboard.map((m, idx) => {
                  const isOpen = expanded === m.name;
                  return (
                    <div key={m.name} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${m.isNew ? 'rgba(0,255,178,0.22)' : 'var(--border)'}`, background: m.isNew ? 'rgba(0,255,178,0.03)' : 'var(--card)' }}>
                      {/* Row */}
                      <div
                        onClick={() => setExpanded(isOpen ? null : m.name)}
                        style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', cursor:'pointer', minWidth:920 }}
                      >
                        {/* Rank */}
                        <div style={{ fontSize:13, fontWeight:700, color:'var(--text-faint)', width:26, textAlign:'right', flexShrink:0, fontFamily:"'Inter',sans-serif" }}>#{idx+1}</div>

                        {/* Name — ancho fijo para que las columnas siempre estén alineadas */}
                        <div style={{ width:220, flexShrink:0 }}>
                          <span style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
                            {stripISM(m.name)}
                          </span>
                        </div>
                        {/* NEW badge — columna fija, siempre en la misma posición */}
                        <div style={{ width:44, flexShrink:0 }}>
                          {m.isNew && <span style={{ fontSize:10, fontWeight:700, color:'#00FFB2', padding:'2px 7px', borderRadius:10, background:'rgba(0,255,178,0.12)', border:'1px solid rgba(0,255,178,0.25)', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>NEW</span>}
                        </div>

                        {/* 4 premios en columnas fijas — siempre en la misma posición */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, alignItems:'center', flex:1 }}>
                          {AWARD_ORDER.map(type => {
                            const wins  = m.breakdown[type];
                            const count = wins.length;
                            const cfg   = AWARD_CFG[type];
                            const isNew = count > 0 && m.isNew && wins.some(w => w.month===displayMonth && w.year===displayYear);
                            return (
                              <div key={type} style={{ display:'flex', alignItems:'center', gap:6, opacity: count===0 ? 0.2 : 1 }}>
                                <div style={{ width:32, height:32, borderRadius:8, overflow:'hidden', border:`1px solid ${count>0 ? cfg.color+'55' : 'rgba(255,255,255,0.08)'}`, flexShrink:0 }}>
                                  <AwardImage cfg={cfg} fill />
                                </div>
                                <div style={{ display:'flex', flexDirection:'column', lineHeight:1.15, minWidth:0 }}>
                                  <span style={{ fontSize:10, color: isNew ? cfg.color : 'var(--text-faint)', fontFamily:"'Inter',sans-serif", fontWeight:600, whiteSpace:'nowrap' }}>{cfg.label}</span>
                                  <span style={{ fontSize:13, fontWeight:800, color: isNew ? cfg.color : count>0 ? 'var(--text-dim)' : 'var(--text-faint)', fontFamily:"'Inter',sans-serif" }}>×{count}{isNew ? ' ✨' : ''}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Total — estrella + número, alineados siempre */}
                        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0, width:56, justifyContent:'flex-end' }}>
                          <span style={{ fontSize: m.isNew ? 20 : 17, filter: m.isNew ? 'drop-shadow(0 0 10px gold)' : 'none', transition:'all 0.3s', lineHeight:1 }}>⭐</span>
                          <span style={{ fontSize:16, fontWeight:800, color: m.isNew ? '#FFD700' : 'var(--text-dim)', fontFamily:"'Inter',sans-serif", lineHeight:1 }}>{m.total}</span>
                        </div>

                        {/* Expand arrow */}
                        <span style={{ fontSize:11, color:'var(--text-faint)', transition:'transform 0.2s', display:'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                      </div>

                      {/* Expanded — historial con fechas */}
                      {isOpen && (
                        <div style={{ padding:'0 20px 18px 62px', display:'flex', flexDirection:'column', gap:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                          {AWARD_ORDER.map(type => {
                            const wins = m.breakdown[type];
                            if (!wins.length) return null;
                            const cfg = AWARD_CFG[type];
                            return (
                              <div key={type}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, marginTop:12 }}>
                                  <div style={{ width:20, height:20, borderRadius:5, overflow:'hidden', border:`1px solid ${cfg.color}50`, flexShrink:0 }}>
                                    <AwardImage cfg={cfg} fill />
                                  </div>
                                  <span style={{ fontSize:12, fontWeight:700, color:cfg.color, fontFamily:"'Inter',sans-serif", textTransform:'uppercase', letterSpacing:'0.05em' }}>{cfg.label}</span>
                                </div>
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                  {wins.sort((a,b)=>(b.year*12+b.month)-(a.year*12+a.month)).map(w => (
                                    <span key={`${w.month}-${w.year}`} style={{
                                      fontSize:12, padding:'4px 12px', borderRadius:20,
                                      background: (w.month===displayMonth&&w.year===displayYear) ? `${cfg.color}20` : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${(w.month===displayMonth&&w.year===displayYear) ? cfg.color+'50' : 'rgba(255,255,255,0.08)'}`,
                                      color: (w.month===displayMonth&&w.year===displayYear) ? cfg.color : 'var(--text-dim)',
                                      fontFamily:"'Inter',sans-serif", fontWeight:600,
                                    }}>
                                      {MONTHS[w.month-1]} {w.year}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {leaderboard.length === 0 && (
                  <p style={{ color:'var(--text-faint)', textAlign:'center', fontFamily:"'Inter',sans-serif", fontSize:13, padding:'40px 0' }}>No achievements recorded yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
