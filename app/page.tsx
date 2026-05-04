'use client'

import { useState, useEffect, useRef } from 'react';

// ── translations ──────────────────────────────────────────────────────────────
const T = {
  pt: {
    badge: 'ISM Brazil · Time NexaForce',
    tagline: 'Cultura é nosso ativo mais valioso — a força invisível que nos une e a bússola que guia cada decisão que tomamos juntos.',
    meetTeam: 'Conhecer o Time',
    ourCulture: 'Nossa Cultura ↓',
    identityLabel: '💎 Identidade NexaForce',
    identityTitle: 'O que nos define',
    missionLabel: 'Nossa Missão',
    missionQuote: '"Queremos que cada pessoa se sinta segura, capaz e motivada — sabendo que sempre terá suporte, orientação e oportunidades de crescimento aqui."',
    missionSub: 'Cada membro domina o que faz, supera seus limites e alcança metas — juntos.',
    principlesLabel: '🛡 Cultura Nexa',
    principlesTitle: '9 Princípios Fundamentais',
    principlesSub: 'Os padrões que mantemos todos os dias',
    pactLabel: '✍ Nosso Pacto',
    pactTitle: 'Se protegermos nossa cultura,\nnossa cultura nos levará onde queremos chegar.',
    pactBody: 'Cada membro da Nexa se compromete a viver esses princípios diariamente — não como obrigação, mas como um padrão de excelência e respeito que nos define.',
    pactTags: ['Metas mais ambiciosas', 'Competência de alto nível', 'Orgulho de pertencer à Nexa'],
    pactClose: '✨ Obrigado por fazer parte da Nexa e construir este grande time juntos! ✨',
    hoverCards: 'Passe o mouse nos cards para ver os perfis completos',
    noManagers: 'Nenhum manager ativo encontrado.',
    pillars: [
      { icon:'💎', title:'Conexão',              color:'#00FFB2', desc:'Nos apoiamos mutuamente, compartilhamos ideias e celebramos conquistas coletivas. Aqui ninguém caminha sozinho — cada membro é essencial.' },
      { icon:'🚀', title:'Comprometimento',      color:'#00C2FF', desc:'Cada ação reflete nossa dedicação à equipe e aos clientes. Agimos com perseverança e determinação, sabendo que cada passo nos aproxima da excelência.' },
      { icon:'⚡', title:'Responsabilidade',     color:'#a855f7', desc:'Assumimos nossos desafios e resultados com integridade. Cada decisão importa e nosso esforço individual impacta toda a equipe.' },
      { icon:'📚', title:'Aprendizado Contínuo', color:'#f59e0b', desc:'Todo desafio é uma oportunidade de crescer. Aprendemos com vitórias e erros, evoluindo constantemente para sermos melhores, individualmente e juntos.' },
    ],
    principles: [
      { n:1, icon:'🤝', title:'Honestidade Inabalável',      color:'#3b82f6', items:['Sem espaço para mentiras','Transparência é a base da confiança','Reconheça erros e proponha soluções'] },
      { n:2, icon:'🙌', title:'Respeito Absoluto',            color:'#8b5cf6', items:['Respeito é inegociável','Comunique-se com cortesia, mesmo em desentendimentos','Valorize as diferenças e aprenda com elas'] },
      { n:3, icon:'🎯', title:'Metas Claras e Foco Total',    color:'#f59e0b', items:['Cada meta é específica, mensurável e tem prazo','Trabalhe com disciplina e urgência','Celebre cada passo, não só o resultado final'] },
      { n:4, icon:'💪', title:'Paciência e Consistência',     color:'#10b981', items:['O sucesso não acontece da noite para o dia','Consistência é nosso superpoder: adicionamos valor todos os dias','Sabemos esperar, mas nunca paramos de avançar'] },
      { n:5, icon:'🤲', title:'Responsabilidade Compartilhada',color:'#ef4444', items:['Antecipe problemas antes que explorem','Enfrente desafios juntos e aprenda','Cada membro contribui para o objetivo comum'] },
      { n:6, icon:'🤗', title:'União e Cooperação',            color:'#00FFB2', items:['Ouça primeiro, entenda, depois aja para ajudar','Compartilhe conhecimento e recursos generosamente','Quando um colega precisa de ajuda, o time responde'] },
      { n:7, icon:'🏆', title:'Excelência e Maestria',         color:'#eab308', items:['Buscamos o excelente, não apenas o bom','Treinamento contínuo faz parte de como trabalhamos','A maestria nos dá confiança e abre oportunidades'] },
      { n:8, icon:'💬', title:'Empatia e Cuidado',             color:'#06b6d4', items:['Todo contato é uma oportunidade valiosa','Pratique empatia para compreender verdadeiramente as necessidades','Construa relacionamentos sólidos e duradouros'] },
      { n:9, icon:'📈', title:'Melhoria Contínua',             color:'#a855f7', items:['O que não é medido não pode melhorar','Revise processos e resultados de forma construtiva','Abrace a mudança como parte do nosso crescimento'] },
    ],
  },
  en: {
    badge: 'ISM Brazil · NexaForce Team',
    tagline: 'Culture is our most valuable asset — the invisible force that unites us and the compass guiding every decision we make together.',
    meetTeam: 'Meet the Team',
    ourCulture: 'Our Culture ↓',
    identityLabel: '💎 NexaForce Identity',
    identityTitle: 'What defines us',
    missionLabel: 'Our Mission',
    missionQuote: '"We want every person to feel safe, capable, and motivated — knowing they will always have support, guidance, and growth opportunities here."',
    missionSub: 'Every member masters what they do, pushes their limits, and achieves goals — together.',
    principlesLabel: '🛡 Nexa Culture',
    principlesTitle: '9 Core Principles',
    principlesSub: 'The standards we uphold every single day',
    pactLabel: '✍ Our Pact',
    pactTitle: 'If we protect our culture,\nour culture will lead us where we want to go.',
    pactBody: 'Every member of Nexa commits to living these principles daily — not as an obligation, but as a standard of excellence and respect that defines us.',
    pactTags: ['More ambitious goals', 'High-level competence', 'Pride in belonging to Nexa'],
    pactClose: '✨ Thank you for being part of Nexa and building this great team together! ✨',
    hoverCards: 'Hover the cards to see full profiles',
    noManagers: 'No active managers found.',
    pillars: [
      { icon:'💎', title:'Connection',          color:'#00FFB2', desc:'We support each other, share ideas, and celebrate collective achievements. Here, no one walks alone — every member is essential.' },
      { icon:'🚀', title:'Commitment',           color:'#00C2FF', desc:'Every action reflects our dedication to the team and clients. We act with perseverance and determination, knowing every step brings us closer to excellence.' },
      { icon:'⚡', title:'Responsibility',       color:'#a855f7', desc:'We own our challenges and results with integrity. Every decision matters and our individual effort impacts the entire team.' },
      { icon:'📚', title:'Continuous Learning',  color:'#f59e0b', desc:'Every challenge is an opportunity to grow. We learn from victories and mistakes, constantly evolving to be better, individually and together.' },
    ],
    principles: [
      { n:1, icon:'🤝', title:'Unwavering Honesty',       color:'#3b82f6', items:['No room for lies','Transparency is the foundation of trust','Acknowledge mistakes and propose solutions'] },
      { n:2, icon:'🙌', title:'Absolute Respect',          color:'#8b5cf6', items:['Respect is non-negotiable','Communicate courteously, even in disagreements','Value differences and learn from them'] },
      { n:3, icon:'🎯', title:'Clear Goals & Total Focus', color:'#f59e0b', items:['Every goal is specific, measurable and time-bound','Work with discipline and urgency','Celebrate every step, not just the final result'] },
      { n:4, icon:'💪', title:'Patience & Consistency',    color:'#10b981', items:["Success doesn't happen overnight",'Consistency is our superpower: every day we add value',"We know how to wait but never stop moving forward"] },
      { n:5, icon:'🤲', title:'Shared Responsibility',     color:'#ef4444', items:['Anticipate problems before they explode','Face challenges together and learn','Every member contributes to the common goal'] },
      { n:6, icon:'🤗', title:'Unity & Cooperation',       color:'#00FFB2', items:['Listen first, understand, then act to help','Share knowledge and resources generously','When a teammate needs help, the team responds'] },
      { n:7, icon:'🏆', title:'Excellence & Mastery',      color:'#eab308', items:['We aim for excellent, not just good','Continuous training is part of how we work','Mastery gives us confidence and opens opportunities'] },
      { n:8, icon:'💬', title:'Empathy & Care',             color:'#06b6d4', items:['Every contact is a valuable opportunity','Practice empathy to truly understand needs','Build solid, lasting relationships'] },
      { n:9, icon:'📈', title:'Continuous Improvement',    color:'#a855f7', items:["What isn't measured can't improve",'Review processes and results constructively','Embrace change as part of our growth'] },
    ],
  },
};

function useVisible(ref: React.RefObject<HTMLElement | null>, threshold=0.1){
  const [v,setV]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setV(true); },{threshold});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[]);
  return v;
}

function FortressCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, frame = 0;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const getDiamondPts = (n: number) => {
      const pts = []; const cx = W/2, cy = H/2;
      const rx = Math.min(W,H)*0.26, ry = Math.min(W,H)*0.33;
      for (let i=0;i<n;i++) {
        const t = (i/n)*Math.PI*2;
        const c=Math.cos(t), s=Math.sin(t);
        const sc = 1/(Math.abs(c)+Math.abs(s));
        pts.push({x:cx+c*sc*rx, y:cy+s*sc*ry, glow:0});
      }
      return pts;
    };
    type Piece = { x:number; y:number; vx:number; vy:number; size:number; opacity:number; rot:number; rotS:number; type:number; targetIdx:number; seeking:boolean; stuck:number };
    let diamondPts: {x:number;y:number;glow:number}[] = [];
    const pieces: Piece[] = Array.from({length:55}, () => ({
      x: Math.random()*1200, y: Math.random()*800,
      vx:(Math.random()-0.5)*0.5, vy:(Math.random()-0.5)*0.5,
      size:3+Math.random()*6, opacity:0.08+Math.random()*0.18,
      rot:Math.random()*Math.PI*2, rotS:(Math.random()-0.5)*0.015,
      type:Math.floor(Math.random()*3),
      targetIdx:-1, seeking:false, stuck:0,
    }));
    const assignTargets = () => {
      diamondPts = getDiamondPts(28);
      pieces.forEach((p,i) => { p.targetIdx = i % 28; p.seeking = Math.random()>0.4; p.stuck=0; });
    };
    assignTargets();
    let reassignTimer = 0;
    const drawShape = (p: Piece) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      const c = `rgba(0,255,178,${p.opacity})`;
      ctx.fillStyle = c; ctx.strokeStyle = `rgba(0,255,178,${p.opacity*1.5})`; ctx.lineWidth=0.6;
      if (p.type===0) { ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); }
      else if (p.type===1) { ctx.beginPath(); ctx.moveTo(0,-p.size); ctx.lineTo(p.size*0.87,p.size*0.5); ctx.lineTo(-p.size*0.87,p.size*0.5); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(0,-p.size); ctx.lineTo(p.size*0.55,0); ctx.lineTo(0,p.size); ctx.lineTo(-p.size*0.55,0); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    };
    const tick = () => {
      ctx.clearRect(0,0,W,H);
      reassignTimer++;
      if (reassignTimer>480) { reassignTimer=0; assignTargets(); }
      if (diamondPts.length>1) {
        ctx.strokeStyle='rgba(0,255,178,0.06)'; ctx.lineWidth=0.8;
        ctx.beginPath(); diamondPts.forEach((pt,i)=>{ i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y); });
        ctx.closePath(); ctx.stroke();
        diamondPts.forEach(pt => {
          if (pt.glow>0) {
            ctx.beginPath(); ctx.arc(pt.x,pt.y,3,0,Math.PI*2);
            ctx.fillStyle=`rgba(0,255,178,${pt.glow*0.7})`; ctx.fill();
            pt.glow=Math.max(0,pt.glow-0.008);
          }
        });
      }
      pieces.forEach(p => {
        p.rot+=p.rotS;
        if (p.seeking && p.stuck<1 && diamondPts[p.targetIdx]) {
          const tgt=diamondPts[p.targetIdx];
          const dx=tgt.x-p.x, dy=tgt.y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
          if (dist<4) { p.stuck=1; p.x=tgt.x; p.y=tgt.y; tgt.glow=1; p.opacity=Math.min(0.55,p.opacity+0.05); }
          else { p.x+=dx*0.012; p.y+=dy*0.012; }
        } else {
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<-20)p.x=W+20; if(p.x>W+20)p.x=-20;
          if(p.y<-20)p.y=H+20; if(p.y>H+20)p.y=-20;
        }
        drawShape(p);
      });
      for (let i=0;i<pieces.length;i++) for (let j=i+1;j<pieces.length;j++) {
        const dx=pieces[i].x-pieces[j].x, dy=pieces[i].y-pieces[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<90) { ctx.strokeStyle=`rgba(0,255,178,${(1-d/90)*0.07})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(pieces[i].x,pieces[i].y); ctx.lineTo(pieces[j].x,pieces[j].y); ctx.stroke(); }
      }
      frame=requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />;
}

// ── LANG TOGGLE ───────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang:'pt'|'en'; setLang:(l:'pt'|'en')=>void }) {
  return (
    <div style={{
      position:'absolute', top:20, right:24, zIndex:10,
      display:'flex', alignItems:'center',
      background:'rgba(255,255,255,0.05)',
      border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:20, overflow:'hidden',
    }}>
      {(['pt','en'] as const).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding:'5px 14px', border:'none', cursor:'pointer',
          background: lang===l ? 'rgba(0,255,178,0.18)' : 'transparent',
          color: lang===l ? 'var(--accent)' : 'var(--text-faint)',
          fontSize:11, fontWeight:700, letterSpacing:'0.06em',
          fontFamily:"'Inter',sans-serif", textTransform:'uppercase',
          transition:'all 0.15s',
        }}>{l}</button>
      ))}
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero({ lang, setLang }: { lang:'pt'|'en'; setLang:(l:'pt'|'en')=>void }) {
  const t = T[lang];
  return(
    <section style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:'linear-gradient(-45deg,#080B10,#091422,#0d1f35,#080B10)',backgroundSize:'400% 400%',animation:'gradientShift 12s ease infinite'}}>
      <div style={{position:'absolute',top:'15%',left:'10%',width:500,height:500,borderRadius:'50%',background:'rgba(0,255,178,0.04)',filter:'blur(90px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'15%',right:'10%',width:420,height:420,borderRadius:'50%',background:'rgba(0,194,255,0.04)',filter:'blur(90px)',pointerEvents:'none'}}/>
      <FortressCanvas />
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{textAlign:'center',padding:'0 24px',position:'relative',zIndex:1,maxWidth:820}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 18px',borderRadius:20,background:'var(--accent-dim)',border:'1px solid var(--accent-glow)',marginBottom:32}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',boxShadow:'0 0 8px var(--accent)',animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',color:'var(--accent)',fontFamily:"'Inter',sans-serif",textTransform:'uppercase'}}>{t.badge}</span>
        </div>

        <h1 style={{fontSize:'clamp(56px,9vw,96px)',fontWeight:900,lineHeight:1,fontFamily:"'Inter',sans-serif",background:'linear-gradient(135deg,#ffffff 0%,#00FFB2 45%,#00C2FF 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:22,letterSpacing:'-0.03em'}}>
          NexaForce
        </h1>

        <p style={{fontSize:20,color:'var(--text-dim)',lineHeight:1.75,maxWidth:580,margin:'0 auto 40px',fontFamily:"'DM Sans',sans-serif"}}>
          {t.tagline}
        </p>

        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/team" style={{padding:'13px 30px',borderRadius:10,background:'var(--accent)',color:'#080B10',fontWeight:700,fontSize:14,textDecoration:'none',fontFamily:"'Inter',sans-serif",boxShadow:'0 4px 22px var(--accent-glow)',display:'inline-block',transition:'all 0.2s'}}>
            {t.meetTeam}
          </a>
          <a href="#principles" style={{padding:'13px 30px',borderRadius:10,background:'transparent',border:'1px solid var(--border-mid)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none',fontFamily:"'Inter',sans-serif",display:'inline-block',transition:'all 0.2s'}}>
            {t.ourCulture}
          </a>
        </div>
      </div>
    </section>
  );
}

// ── IDENTITY ──────────────────────────────────────────────────────────────────
function IdentitySection({ lang }: { lang:'pt'|'en' }) {
  const t = T[lang];
  const ref=useRef<HTMLDivElement>(null);
  const v=useVisible(ref);
  return(
    <section style={{padding:'96px 24px',background:'var(--surface)',borderTop:'1px solid var(--border)'}}>
      <div style={{maxWidth:1140,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12,fontFamily:"'Inter',sans-serif"}}>{t.identityLabel}</div>
          <h2 style={{fontSize:36,fontWeight:800,color:'var(--text)',fontFamily:"'Inter',sans-serif",lineHeight:1.2}}>{t.identityTitle}</h2>
        </div>
        <div ref={ref} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
          {t.pillars.map((p,i)=>(
            <div key={p.title} className={`reveal-card${v?' visible':''}`}
              style={{padding:'28px 24px',borderRadius:16,background:'var(--card)',border:'1px solid var(--border)',borderTop:`3px solid ${p.color}`,cursor:'default',transitionDelay:`${i*0.08}s`} as React.CSSProperties}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-5px)';el.style.boxShadow=`0 12px 36px rgba(0,0,0,0.25),0 0 0 1px ${p.color}30`;}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.boxShadow='none';}}
            >
              <div style={{fontSize:34,marginBottom:18}}>{p.icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,color:'var(--text)',fontFamily:"'Inter',sans-serif",marginBottom:10}}>{p.title}</h3>
              <p style={{fontSize:14,color:'var(--text-dim)',lineHeight:1.75,fontFamily:"'DM Sans',sans-serif"}}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MISSION ───────────────────────────────────────────────────────────────────
function MissionSection({ lang }: { lang:'pt'|'en' }) {
  const t = T[lang];
  return(
    <section style={{padding:'80px 24px',background:'var(--bg)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
      <div style={{maxWidth:740,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:18}}>🙌</div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:18,fontFamily:"'Inter',sans-serif"}}>{t.missionLabel}</div>
        <blockquote style={{fontSize:22,color:'var(--text)',lineHeight:1.8,fontFamily:"'DM Sans',sans-serif",fontStyle:'italic',borderLeft:'none'}}>
          {t.missionQuote}
        </blockquote>
        <p style={{marginTop:20,fontSize:15,color:'var(--text-dim)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.7}}>
          {t.missionSub}
        </p>
      </div>
    </section>
  );
}

// ── PRINCIPLES ────────────────────────────────────────────────────────────────
function PrinciplesSection({ lang }: { lang:'pt'|'en' }) {
  const t = T[lang];
  const ref=useRef<HTMLDivElement>(null);
  const v=useVisible(ref,0.05);
  return(
    <section id="principles" style={{padding:'96px 24px',background:'var(--surface)',borderTop:'1px solid var(--border)'}}>
      <div style={{maxWidth:1140,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12,fontFamily:"'Inter',sans-serif"}}>{t.principlesLabel}</div>
          <h2 style={{fontSize:36,fontWeight:800,color:'var(--text)',fontFamily:"'Inter',sans-serif",lineHeight:1.2}}>{t.principlesTitle}</h2>
          <p style={{marginTop:12,fontSize:15,color:'var(--text-dim)',fontFamily:"'DM Sans',sans-serif"}}>{t.principlesSub}</p>
        </div>
        <div ref={ref} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16}}>
          {t.principles.map((p)=>(
            <div key={p.n} className={`reveal-card${v?' visible':''}`}
              style={{padding:'24px',borderRadius:14,background:'var(--card)',border:'1px solid var(--border)',borderLeft:`3px solid ${p.color}`,cursor:'default'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px)';el.style.boxShadow=`0 10px 32px rgba(0,0,0,0.2),0 0 0 1px ${p.color}22`;}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.boxShadow='none';}}
            >
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${p.color}15`,border:`1px solid ${p.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{p.icon}</div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:p.color,fontFamily:"'Inter',sans-serif",letterSpacing:'0.06em',marginBottom:2}}>#{String(p.n).padStart(2,'0')}</div>
                  <h3 style={{fontSize:15,fontWeight:700,color:'var(--text)',fontFamily:"'Inter',sans-serif",lineHeight:1.2}}>{p.title}</h3>
                </div>
              </div>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8}}>
                {p.items.map(item=>(
                  <li key={item} style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:13.5,color:'var(--text-dim)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.55}}>
                    <span style={{width:5,height:5,borderRadius:'50%',background:p.color,flexShrink:0,marginTop:7}}/>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PACT ──────────────────────────────────────────────────────────────────────
function PactSection({ lang }: { lang:'pt'|'en' }) {
  const t = T[lang];
  return(
    <section style={{padding:'80px 24px',background:'linear-gradient(135deg,rgba(0,255,178,0.04),rgba(0,194,255,0.03))',borderTop:'1px solid var(--border)'}}>
      <div style={{maxWidth:720,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:14,fontFamily:"'Inter',sans-serif"}}>{t.pactLabel}</div>
        <h2 style={{fontSize:28,fontWeight:800,color:'var(--text)',fontFamily:"'Inter',sans-serif",marginBottom:16,lineHeight:1.4,whiteSpace:'pre-line'}}>
          {t.pactTitle}
        </h2>
        <p style={{fontSize:15,color:'var(--text-dim)',marginBottom:36,fontFamily:"'DM Sans',sans-serif",lineHeight:1.75}}>
          {t.pactBody}
        </p>
        <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
          {t.pactTags.map(tag=>(
            <div key={tag} style={{padding:'9px 20px',borderRadius:20,background:'var(--accent-dim)',border:'1px solid var(--accent-glow)',fontSize:13,fontWeight:600,color:'var(--accent)',fontFamily:"'Inter',sans-serif"}}>{tag}</div>
          ))}
        </div>
        <p style={{marginTop:40,fontSize:18,color:'var(--text-dim)',fontFamily:"'DM Sans',sans-serif'"}}>
          {t.pactClose}
        </p>
      </div>
    </section>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<'pt'|'en'>('pt');
  return (
    <div>
      <Hero lang={lang} setLang={setLang} />
      <IdentitySection lang={lang} />
      <MissionSection lang={lang} />
      <PrinciplesSection lang={lang} />
      <PactSection lang={lang} />
    </div>
  );
}
