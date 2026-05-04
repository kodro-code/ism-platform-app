'use client'

import { useState, useEffect, useRef, useMemo } from 'react';

interface Manager {
  name:string; description:string; birthday:string;
  rank:string; photoUrl:string; city:string; startDate:string;
}

const RANK: Record<string, {color:string;glow:string;bg:string;label:string;order:number}> = {
  'Head':      {color:'#E4EAF8',glow:'rgba(228,234,248,0.45)',bg:'rgba(228,234,248,0.09)',label:'Head',order:0},
  'Team Lead': {color:'#9CB4D0',glow:'rgba(156,180,208,0.35)',bg:'rgba(156,180,208,0.08)',label:'Team Lead',order:1},
  'Senior+':   {color:'#FFD700',glow:'rgba(255,215,0,0.38)', bg:'rgba(255,215,0,0.09)',   label:'Senior+',order:2},
  'Senior':    {color:'#FF6D00',glow:'rgba(255,109,0,0.28)', bg:'rgba(255,109,0,0.08)',   label:'Senior', order:3},
  'Middle':    {color:'#00A3FF',glow:'rgba(0,163,255,0.25)', bg:'rgba(0,163,255,0.07)',   label:'Middle', order:4},
  'Junior':    {color:'#C44DFF',glow:'rgba(196,77,255,0.25)',bg:'rgba(196,77,255,0.07)',  label:'Junior', order:5},
};
const DEFAULT_RANK={color:'#C44DFF',glow:'rgba(196,77,255,0.25)',bg:'rgba(196,77,255,0.07)',label:'Junior',order:5};

function fileIdFromUrl(raw:string):string{if(!raw)return'';const m=raw.match(/\/d\/([a-zA-Z0-9_-]+)/);if(m)return m[1];const m2=raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);return m2?m2[1]:'';}
function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();}
function parseDate(s:string):Date|null{if(!s)return null;const p=s.split('/');if(p.length===3&&p[2].length===4){const d=new Date(+p[2],+p[1]-1,+p[0]);if(!isNaN(d.getTime()))return d;}const d=new Date(s);return isNaN(d.getTime())?null:d;}
function tenureMonths(sd:string):number{const s=parseDate(sd);if(!s)return 0;const n=new Date();return(n.getFullYear()-s.getFullYear())*12+n.getMonth()-s.getMonth();}
function tenureLabel(sd:string):string{const m=tenureMonths(sd);if(m<1)return'< 1 mês';const y=Math.floor(m/12),r=m%12;if(y===0)return`${m} mês${m>1?'es':''}`;if(r===0)return`${y} ano${y>1?'s':''}`;return`${y}a ${r}m`;}
const MONTHS_PT=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MONTHS_SHORT=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function fmtBirthday(bd:string):string{if(!bd)return'';const d=parseDate(bd);if(!d)return bd;return`${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`;}
function fmtStartDate(sd:string):string{if(!sd)return'';const d=parseDate(sd);if(!d)return sd;return`${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;}
function isBirthdayMonth(bd:string):boolean{const d=parseDate(bd);if(!d)return false;return d.getMonth()===new Date().getMonth();}
function anniversaryProgress(sd:string):{pct:number;label:string;soon:boolean}{const s=parseDate(sd);if(!s)return{pct:0,label:'',soon:false};const t=new Date(),thisY=new Date(t.getFullYear(),s.getMonth(),s.getDate());const next=thisY>=t?thisY:new Date(t.getFullYear()+1,s.getMonth(),s.getDate());const prev=new Date(next.getFullYear()-1,s.getMonth(),s.getDate());const pct=Math.round(((t.getTime()-prev.getTime())/(next.getTime()-prev.getTime()))*100);const days=Math.round((next.getTime()-t.getTime())/86400000);const label=days===0?'🎉 Hoje!':days<30?`${days}d p/ aniversário`:`${MONTHS_SHORT[next.getMonth()]} ${next.getFullYear()}`;return{pct,label,soon:days<=30};}
function stripISM(name:string):string{return name.replace(/^ISM\s+/i,'').trim();}
function firstName(name:string):string{return stripISM(name).split(/\s+/)[0];}

let _ctx:AudioContext|null=null,_last=0;
function ping(){const now=Date.now();if(now-_last<130)return;_last=now;try{if(!_ctx)_ctx=new(window.AudioContext||(window as any).webkitAudioContext)();const osc=_ctx.createOscillator(),gain=_ctx.createGain();osc.connect(gain);gain.connect(_ctx.destination);osc.type='sine';osc.frequency.value=880;const t=_ctx.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(0.035,t+0.01);gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);osc.start(t);osc.stop(t+0.2);}catch{}}

function Avatar({name,photoUrl,size,color}:{name:string;photoUrl:string;size:number;color:string}){
  const[err,setErr]=useState(false);
  const id=fileIdFromUrl(photoUrl);
  const url=id?`/api/photo?id=${id}`:'';
  return(<div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:`2px solid ${color}50`,boxShadow:`0 0 14px ${color}40`}}>{url&&!err?<img src={url} alt={name} onError={()=>setErr(true)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${color}20,${color}10)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.36,fontWeight:800,color,fontFamily:"'Inter',sans-serif",letterSpacing:'-0.02em'}}>{initials(name)}</div>}</div>);
}

function Card({m,large=false}:{m:Manager;large?:boolean}){
  const[hov,setHov]=useState(false);
  const cfg=RANK[m.rank]??DEFAULT_RANK;
  const w=large?210:192, h=large?276:256;
  const anniv=anniversaryProgress(m.startDate);
  const bdMonth=isBirthdayMonth(m.birthday);
  const CONFETTI=['#FFD700','#FF6B6B','#00FFB2','#B47EFF','#FF8C00','#00C2FF'];
  const cardBase:React.CSSProperties={position:'absolute',inset:0,borderRadius:16,background:'rgba(9,13,19,0.98)',border:`1px solid ${cfg.color}${hov?'50':'22'}`,boxShadow:hov?`0 0 28px ${cfg.glow}`:'0 4px 18px rgba(0,0,0,0.45)',padding:'13px 12px',display:'flex',flexDirection:'column',transition:'box-shadow 0.3s,border-color 0.3s',backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden'};
  return(
    <div style={{width:w,height:h,perspective:'1000px',flexShrink:0}} onMouseEnter={()=>{setHov(true);ping();}} onMouseLeave={()=>setHov(false)}>
      <div style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transition:'transform 0.62s cubic-bezier(0.4,0,0.2,1)',transform:hov?'rotateY(180deg)':'rotateY(0deg)'}}>
        {/* FRONT */}
        <div style={{...cardBase,alignItems:'center',gap:8,border:bdMonth?'1px solid rgba(255,215,0,0.6)':cardBase.border,boxShadow:bdMonth?'0 0 24px rgba(255,215,0,0.25)':cardBase.boxShadow}}>
          {bdMonth&&CONFETTI.map((c,i)=>(<div key={i} style={{position:'absolute',pointerEvents:'none',zIndex:0,top:`${8+i*14}%`,left:`${4+i*16}%`,width:5+(i%3),height:5+(i%3),background:c,borderRadius:i%2===0?2:'50%',opacity:0.75,animation:`floatUp ${1.4+i*0.25}s ease-out ${i*0.3}s infinite`}}/>))}
          {bdMonth&&<div style={{position:'absolute',top:8,right:10,fontSize:16,zIndex:1}}>🎂</div>}
          <Avatar name={m.name} photoUrl={m.photoUrl} size={large?70:60} color={bdMonth?'#FFD700':cfg.color}/>
          <div style={{padding:'5px 13px',borderRadius:20,background:bdMonth?'rgba(255,215,0,0.12)':cfg.bg,border:`1px solid ${bdMonth?'rgba(255,215,0,0.5)':cfg.color+'40'}`,fontSize:10,fontWeight:700,color:bdMonth?'#FFD700':cfg.color,letterSpacing:'0.05em',fontFamily:"'Inter',sans-serif",flexShrink:0}}>{bdMonth?'🎉 Aniversário!':cfg.label.toUpperCase()}</div>
          <div style={{fontSize:large?16:15,fontWeight:800,color:'#E8EDF5',textAlign:'center',lineHeight:1.25,fontFamily:"'Inter',sans-serif"}}>{m.name}</div>
          {m.city&&<div style={{fontSize:12,color:'rgba(232,237,245,0.65)',fontFamily:"'Inter',sans-serif",display:'flex',alignItems:'center',gap:4}}><span>📍</span>{m.city}</div>}
          <div style={{marginTop:'auto',width:'100%'}}>
            {m.startDate&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><span style={{fontSize:11,color:'rgba(232,237,245,0.6)',fontFamily:"'Inter',sans-serif"}}>{tenureLabel(m.startDate)} na Kodland</span><span style={{fontSize:10,fontWeight:700,color:anniv.soon?'#FFD700':cfg.color,fontFamily:"'Inter',sans-serif"}}>{anniv.pct}%</span></div>}
            <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${anniv.pct}%`,borderRadius:3,background:anniv.soon?'linear-gradient(90deg,#FFD700,#FF8C00)':`linear-gradient(90deg,${cfg.color}60,${cfg.color})`,transition:'width 0.8s ease'}}/></div>
          </div>
        </div>
        {/* BACK */}
        <div style={{...cardBase,transform:'rotateY(180deg)',gap:9,justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,paddingBottom:10,borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}><Avatar name={m.name} photoUrl={m.photoUrl} size={38} color={cfg.color}/><div><div style={{fontSize:14,fontWeight:800,color:'#E8EDF5',fontFamily:"'Inter',sans-serif",lineHeight:1.2}}>{firstName(m.name)}</div><div style={{fontSize:11,color:cfg.color,fontFamily:"'Inter',sans-serif",fontWeight:600}}>{cfg.label}</div></div></div>
          <div style={{fontSize:12,color:'rgba(232,237,245,0.82)',lineHeight:1.6,fontFamily:"'Inter',sans-serif",flex:1,overflowY:'auto'}}>{m.description||<span style={{color:'rgba(232,237,245,0.3)',fontStyle:'italic'}}>Sem descrição ainda.</span>}</div>
          <div style={{display:'flex',flexDirection:'column',gap:7,flexShrink:0}}>
            {m.birthday&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'rgba(232,237,245,0.72)',fontFamily:"'Inter',sans-serif"}}><span>🎂</span>{fmtBirthday(m.birthday)}</div>}
            {m.city&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'rgba(232,237,245,0.72)',fontFamily:"'Inter',sans-serif"}}><span>📍</span>{m.city}</div>}
            {m.startDate&&anniv.label&&<div style={{marginTop:2}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,color:'rgba(232,237,245,0.58)',fontFamily:"'Inter',sans-serif"}}>{`Desde ${fmtStartDate(m.startDate)}`}</span><span style={{fontSize:10,fontWeight:700,color:anniv.soon?'#FFD700':cfg.color,fontFamily:"'Inter',sans-serif"}}>{anniv.label}</span></div><div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${anniv.pct}%`,borderRadius:2,background:anniv.soon?'linear-gradient(90deg,#FFD700,#FF8C00)':`linear-gradient(90deg,${cfg.color}60,${cfg.color})`,transition:'width 0.8s ease'}}/></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}


// Floating diamond background pieces
function DiamondField() {
  const pieces = useMemo(() => {
    const result: {x:number;y:number;size:number;opacity:number;delay:number;duration:number;type:number}[] = [];
    const positions = [
      {x:50,y:12},{x:65,y:22},{x:78,y:35},{x:85,y:50},{x:78,y:65},{x:65,y:78},{x:50,y:88},{x:35,y:78},{x:22,y:65},{x:15,y:50},{x:22,y:35},{x:35,y:22},
      {x:50,y:30},{x:60,y:40},{x:50,y:50},{x:40,y:40},{x:50,y:70},{x:38,y:55},{x:62,y:55},
      {x:10,y:20},{x:88,y:25},{x:5,y:55},{x:95,y:60},{x:15,y:80},{x:85,y:78},
    ];
    positions.forEach((pos,i) => {
      result.push({
        x: pos.x, y: pos.y,
        size: 12 + (i%4)*6,
        opacity: 0.04 + (i%5)*0.015,
        delay: (i*0.37) % 5,
        duration: 5 + (i%4)*1.5,
        type: i%3,
      });
    });
    return result;
  }, []);

  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
      {pieces.map((p,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size,
          border:`1px solid rgba(0,255,178,${p.opacity*2})`,
          background:`rgba(0,255,178,${p.opacity})`,
          transform:'rotate(45deg)',
          boxShadow:`0 0 ${p.size}px rgba(0,255,178,${p.opacity*0.8})`,
          animation:`floatDiamond ${p.duration}s ease-in-out ${p.delay}s infinite`,
          borderRadius: p.type===1 ? '20%' : p.type===2 ? '2px' : '0',
        }}/>
      ))}
      <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%) rotate(45deg)',width:'55vmin',height:'55vmin',border:'1px solid rgba(0,255,178,0.04)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%) rotate(45deg)',width:'38vmin',height:'38vmin',border:'1px solid rgba(0,255,178,0.03)',pointerEvents:'none'}}/>
    </div>
  );
}

interface ConfettiPiece { id:number; x:number; y:number; color:string; cx:number; cy:number; cr:number; }

const ROAD_LEVELS = [
  { rank:'Senior+', color:'#FFD700', glow:'rgba(255,215,0,0.38)',  icon:'⭐', label:'Senior+' },
  { rank:'Senior',  color:'#FF6D00', glow:'rgba(255,109,0,0.28)',  icon:'🔥', label:'Senior' },
  { rank:'Middle',  color:'#00A3FF', glow:'rgba(0,163,255,0.25)',  icon:'💧', label:'Middle' },
  { rank:'Junior',  color:'#C44DFF', glow:'rgba(196,77,255,0.25)', icon:'✨', label:'Junior' },
];

const LEADER_LEVELS = [
  { rank:'Head',      color:'#E4EAF8', glow:'rgba(228,234,248,0.4)',  icon:'👑', label:'Head' },
  { rank:'Team Lead', color:'#9CB4D0', glow:'rgba(156,180,208,0.35)', icon:'🌟', label:'Team Lead' },
];

const ROAD_CONFETTI = ['#FFD700','#FF6B6B','#00FFB2','#B47EFF','#FF8C00','#00C2FF'];

function CareerRoad({ managers }: { managers: Manager[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgH, setSvgH]         = useState(620);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { const h = el.clientHeight; if (h > 80) setSvgH(h); });
    ro.observe(el);
    const h = el.clientHeight;
    if (h > 80) setSvgH(h);
    return () => ro.disconnect();
  }, []);

  const W = 110, CX = W / 2;
  // 4-level winding road: Junior(bottom) → Middle(0.67) → Senior(0.33) → Senior+(top)
  const PATH = `M ${CX} ${svgH-16} ` +
    `C ${W-14} ${svgH*0.83} 14 ${svgH*0.72} ${CX} ${svgH*0.67} ` +
    `C ${W-14} ${svgH*0.58} 14 ${svgH*0.42} ${CX} ${svgH*0.33} ` +
    `C ${W-14} ${svgH*0.24} 14 ${svgH*0.08} ${CX} 16`;

  useEffect(() => {
    let alive = true;
    function fire(y: number) {
      const pieces: ConfettiPiece[] = Array.from({length:14}, (_,i) => ({
        id: Date.now()*100+i, x:CX, y,
        color: ROAD_CONFETTI[i % ROAD_CONFETTI.length],
        cx: (Math.random()-0.5)*110,
        cy: -(30+Math.random()*70),
        cr: (Math.random()-0.5)*720,
      }));
      setConfetti(prev => [...prev, ...pieces]);
      const ids = new Set(pieces.map(p => p.id));
      setTimeout(() => setConfetti(prev => prev.filter(p => !ids.has(p.id))), 1400);
    }
    function cycle() {
      if (!alive) return;
      // Fire confetti as character reaches each milestone (~2.67s per segment over 8s)
      window.setTimeout(() => {
        if (!alive) return;
        fire(svgH*0.67); // Middle
        window.setTimeout(() => {
          if (!alive) return;
          fire(svgH*0.33); // Senior
          window.setTimeout(() => {
            if (!alive) return;
            fire(16); // Senior+
            window.setTimeout(() => { if (alive) cycle(); }, 300);
          }, 2600);
        }, 2600);
      }, 2600);
    }
    cycle();
    return () => { alive = false; };
  }, [svgH]);

  const leaderMgrs = managers.filter(m => LEADER_LEVELS.some(l => l.rank === m.rank));

  return (
    <div>
      {/* Leadership: Head / Team Lead — same row, centered */}
      {leaderMgrs.length > 0 && (
        <div style={{display:'flex',gap:48,justifyContent:'center',flexWrap:'wrap',marginBottom:52}}>
          {LEADER_LEVELS.map(lvl => {
            const lvlMgrs = managers.filter(m => m.rank === lvl.rank);
            if (!lvlMgrs.length) return null;
            return (
              <div key={lvl.rank}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                  <div style={{height:1,width:16,background:'rgba(255,255,255,0.07)'}}/>
                  <span style={{fontSize:13}}>{lvl.icon}</span>
                  <span style={{fontSize:10,letterSpacing:'0.08em',color:`${lvl.color}85`,textTransform:'uppercase',fontFamily:"'Inter',sans-serif",fontWeight:700}}>{lvl.label}</span>
                  <div style={{height:1,width:16,background:'rgba(255,255,255,0.07)'}}/>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.2)',fontFamily:"'Inter',sans-serif"}}>{lvlMgrs.length} {lvlMgrs.length===1?'membro':'membros'}</span>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:18,justifyContent:'center'}}>
                  {lvlMgrs.map(m => <Card key={m.name} m={m} large />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Career road: Junior → Middle → Senior → Senior+ */}
      <div ref={containerRef} style={{position:'relative', paddingLeft:130}}>

        {/* Road column */}
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:W+20,overflow:'visible'}}>
          <svg width={W} height={svgH} style={{position:'absolute',top:0,left:0,overflow:'visible'}}>
            <defs>
              <linearGradient id="roadGrad" gradientUnits="userSpaceOnUse" x1={CX} y1={svgH} x2={CX} y2="0">
                <stop offset="0%"   stopColor="#C44DFF"/>
                <stop offset="33%"  stopColor="#00A3FF"/>
                <stop offset="66%"  stopColor="#FF6D00"/>
                <stop offset="100%" stopColor="#FFD700"/>
              </linearGradient>
            </defs>
            {/* Road: asphalt base */}
            <path d={PATH} fill="none" stroke="rgba(15,22,35,0.98)" strokeWidth={26} strokeLinecap="round"/>
            {/* Road: white edge lines (wider stroke, overdrawn by asphalt leaving edges visible) */}
            <path d={PATH} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={28} strokeLinecap="round"/>
            <path d={PATH} fill="none" stroke="rgba(15,22,35,0.98)" strokeWidth={22} strokeLinecap="round"/>
            {/* Road: yellow dashed center line */}
            <path d={PATH} fill="none" stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="9 7" opacity={0.55}/>
            {/* Road: gradient glow overlay */}
            <path d={PATH} fill="none" stroke="url(#roadGrad)" strokeWidth={1} strokeLinecap="round" opacity={0.3}/>
            {/* Junior */}
            <circle cx={CX} cy={svgH-16} r={13} fill="rgba(196,77,255,0.14)"/>
            <circle cx={CX} cy={svgH-16} r={6.5} fill="#C44DFF" opacity={0.92}/>
            {/* Middle */}
            <circle cx={CX} cy={svgH*0.67} r={13} fill="rgba(0,163,255,0.14)"/>
            <circle cx={CX} cy={svgH*0.67} r={6.5} fill="#00A3FF" opacity={0.92}/>
            {/* Senior */}
            <circle cx={CX} cy={svgH*0.33} r={13} fill="rgba(255,109,0,0.14)"/>
            <circle cx={CX} cy={svgH*0.33} r={6.5} fill="#FF6D00" opacity={0.92}/>
            {/* Senior+ */}
            <circle cx={CX} cy={16} r={14} fill="rgba(255,215,0,0.18)"/>
            <circle cx={CX} cy={16} r={7}  fill="#FFD700" opacity={0.95}/>
          </svg>

          {/* Moving character */}
          <div style={{
            position:'absolute', left:0, top:0,
            fontSize:28, lineHeight:1,
            offsetPath:`path("${PATH}")`,
            offsetRotate:'0deg',
            animation:'driveRoad 8s linear infinite',
            filter:'drop-shadow(0 0 12px rgba(0,255,178,0.9)) drop-shadow(0 3px 6px rgba(0,0,0,0.85))',
            zIndex:10, pointerEvents:'none',
          } as React.CSSProperties}>🏃</div>

          {/* Confetti */}
          {confetti.map(p => (
            <div key={p.id} style={{
              position:'absolute', left:p.x, top:p.y,
              width:7, height:7, background:p.color,
              borderRadius: p.id%3===0?'50%':2,
              transform:'translate(-50%,-50%)',
              animation:'confettiPop 1.2s ease-out forwards',
              pointerEvents:'none',
              ['--cx' as string]: `${p.cx}px`,
              ['--cy' as string]: `${p.cy}px`,
              ['--cr' as string]: `${p.cr}deg`,
            } as React.CSSProperties}/>
          ))}
        </div>

        {/* Level sections — Senior at top, Junior at bottom */}
        <div>
          {ROAD_LEVELS.map((lvl, i) => {
            const lvlMgrs = managers.filter(m => m.rank === lvl.rank);
            if (!lvlMgrs.length) return null;
            return (
              <div key={lvl.rank} style={{marginBottom: i < ROAD_LEVELS.length-1 ? 52 : 0}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                  <span style={{fontSize:13}}>{lvl.icon}</span>
                  <span style={{fontSize:10,letterSpacing:'0.08em',color:`${lvl.color}85`,textTransform:'uppercase',fontFamily:"'Inter',sans-serif",fontWeight:700}}>{lvl.label}</span>
                  <div style={{height:1,flex:1,background:'rgba(255,255,255,0.05)'}}/>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.2)',fontFamily:"'Inter',sans-serif"}}>{lvlMgrs.length} {lvlMgrs.length===1?'membro':'membros'}</span>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:14}}>
                  {lvlMgrs.map(m => <Card key={m.name} m={m} large={false}/>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const[managers,setManagers]=useState<Manager[]>([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch('/api/managers').then(r=>r.json()).then(d=>{setManagers(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const bdThisMonth=managers.filter(m=>isBirthdayMonth(m.birthday));

  return (
    <div style={{position:'relative',minHeight:'100%',background:'var(--bg)'}}>
      <DiamondField />
      <div style={{position:'relative',zIndex:1,padding:'48px 60px 80px',maxWidth:1600,margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:44,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12,fontFamily:"'Inter',sans-serif"}}>👥 ISM Brazil</div>
          <h1 style={{fontSize:38,fontWeight:900,color:'var(--text)',fontFamily:"'Inter',sans-serif",letterSpacing:'-0.02em',marginBottom:10}}>Meet the Team</h1>
          <p style={{fontSize:14,color:'var(--text-dim)',fontFamily:"'DM Sans',sans-serif"}}>Hover the cards to see full profiles</p>
        </div>

        {/* Stats */}
        <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',marginBottom:48,justifyContent:'center'}}>
          {[{n:managers.length,l:'Active'},{n:managers.filter(m=>m.rank==='Senior+').length,l:'Senior+'},{n:managers.filter(m=>m.rank==='Senior').length,l:'Seniors'},{n:managers.filter(m=>m.rank==='Middle').length,l:'Middles'},{n:managers.filter(m=>m.rank==='Junior').length,l:'Juniors'}].map(s=>(
            <div key={s.l} style={{padding:'14px 22px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',textAlign:'center',backdropFilter:'blur(8px)'}}>
              <div style={{fontSize:26,fontWeight:800,color:'var(--accent)',fontFamily:"'Inter',sans-serif",lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:10,color:'var(--text-faint)',letterSpacing:'0.05em',textTransform:'uppercase',fontFamily:"'Inter',sans-serif",marginTop:3}}>{s.l}</div>
            </div>
          ))}
          {bdThisMonth.map(m=>(
            <div key={m.name} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderRadius:12,background:'rgba(255,215,0,0.07)',border:'1px solid rgba(255,215,0,0.3)',backdropFilter:'blur(8px)'}}>
              <span style={{fontSize:18}}>🎂</span>
              <Avatar name={m.name} photoUrl={m.photoUrl} size={32} color="#FFD700"/>
              <div><div style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Inter',sans-serif"}}>{firstName(m.name)}</div><div style={{fontSize:10,color:'rgba(255,215,0,0.75)',fontFamily:"'Inter',sans-serif"}}>{fmtBirthday(m.birthday)}</div></div>
            </div>
          ))}
        </div>

        {loading&&(
          <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}>
            <div style={{width:30,height:30,border:'2px solid rgba(0,255,178,0.15)',borderTopColor:'#00FFB2',borderRadius:'50%',animation:'spin 0.75s linear infinite'}}/>
          </div>
        )}

        {!loading&&(
          managers.length === 0
            ? <p style={{color:'var(--text-faint)',textAlign:'center',fontFamily:"'Inter',sans-serif",fontSize:13}}>No active managers found.</p>
            : <CareerRoad managers={managers} />
        )}
      </div>
    </div>
  );
}
