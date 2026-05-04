'use client'

import { Suspense, useState, useRef, useEffect, forwardRef } from 'react';
import { useSearchParams } from 'next/navigation';

const HORARIOS = ['8h–10h', '10h–12h', '12h–14h', '14h–16h', '16h–18h', '18h–20h', '20h–22h'];
const DIAS     = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

type Step = 1 | 2 | 3;

function validatePhone(v: string) {
  const digits = v.replace(/\D/g, '');
  if (digits.length < 7)  return 'Insira um número com pelo menos 7 dígitos';
  if (digits.length > 15) return 'Número muito longo';
  return '';
}
function validateEmail(v: string) {
  if (!v.trim()) return 'E-mail obrigatório';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Insira um e-mail válido (ex: nome@email.com)';
  return '';
}

const inputBase: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', color: '#fff',
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  fontFamily: "'Inter', 'DM Sans', sans-serif",
};
const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(255,255,255,0.45)', marginBottom: 8,
  letterSpacing: '0.08em', textTransform: 'uppercase',
};

// ── Kodland logo ──────────────────────────────────────────────────────────────
function KodlandLogo() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
      background: 'linear-gradient(145deg, #FF9D00 0%, #FFD000 55%, #FF8C00 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(255,160,0,0.45), 0 3px 10px rgba(0,0,0,0.4)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '46%', background: 'rgba(255,255,255,0.28)', borderRadius: '18px 18px 60% 60%' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 18px 18px' }} />
      <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: "'Inter',sans-serif", textShadow: '0 2px 6px rgba(0,0,0,0.28)', position: 'relative', zIndex: 1, letterSpacing: '-0.03em' }}>K</span>
    </div>
  );
}

// ── Falling code background ───────────────────────────────────────────────────
const CODE_SNIPPETS = [
  'def start():', 'for i in range:', 'if alive:', 'print("Hello!")',
  'class Game:', 'return True', 'while loop:', '{ score: 100 }',
  'spawn(mob)', 'setBlock(x,y)', '>>> import', 'from pygame',
  'x += speed', '01001101', '// quest', 'const val', 'git push',
  'func main()', '#python3', 'true||false', 'import *',
];

function CodeRain() {
  const leftXs  = [1.5, 5, 8.5, 12.5, 16.5];
  const rightXs = [83.5, 87, 91, 95, 98.5];

  const makeDrops = (xs: number[], green: boolean) =>
    xs.flatMap((x, ci) =>
      Array.from({ length: 5 }, (_, ri) => {
        const text = CODE_SNIPPETS[(ci * 5 + ri * 3) % CODE_SNIPPETS.length];
        const dur  = 9 + ((ci * 2 + ri) % 5);
        const del  = (ri / 5) * dur;
        return (
          <div key={`${green ? 'L' : 'R'}${ci}-${ri}`} style={{
            position: 'absolute', left: `${x}%`, top: '-4%',
            fontSize: 10, fontFamily: "'Courier New', monospace",
            color: green ? 'rgba(0,255,178,0.40)' : 'rgba(255,195,0,0.32)',
            animation: `codeDrop ${dur}s linear ${del}s infinite`,
            whiteSpace: 'nowrap', userSelect: 'none',
          }}>
            {text}
          </div>
        );
      })
    );

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {makeDrops(leftXs, true)}
      {makeDrops(rightXs, false)}
    </div>
  );
}

// ── Neural network background ─────────────────────────────────────────────────
function NeuralNet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    let animId: number;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      initNodes();
    };
    window.addEventListener('resize', onResize);

    const N = 42, MAX_D = 175;

    interface Node { x:number; y:number; vx:number; vy:number; r:number; phase:number; }
    interface Pulse { ai:number; bi:number; t:number; spd:number; hue:number; }

    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let frame = 0;

    function initNodes() {
      nodes = Array.from({ length: N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: 1.8 + Math.random() * 2, phase: Math.random() * Math.PI * 2,
      }));
    }
    initNodes();

    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.phase += 0.018;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Spawn pulses
      if (frame % 14 === 0) {
        const ai = Math.floor(Math.random() * N);
        const bi = Math.floor(Math.random() * N);
        if (ai !== bi) {
          const dx = nodes[ai].x - nodes[bi].x, dy = nodes[ai].y - nodes[bi].y;
          if (Math.sqrt(dx*dx + dy*dy) < MAX_D)
            pulses.push({ ai, bi, t: 0, spd: 0.007 + Math.random() * 0.011, hue: Math.random() > 0.55 ? 165 : 45 });
        }
      }

      // Edges
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < MAX_D) {
            const a = (1 - d / MAX_D) * 0.13;
            ctx.strokeStyle = `rgba(0,255,178,${a})`;
            ctx.lineWidth   = 0.65;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Pulses
      pulses = pulses.filter(p => p.t <= 1);
      for (const p of pulses) {
        const a = nodes[p.ai], b = nodes[p.bi];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_D) {
          const px = a.x + dx * p.t, py = a.y + dy * p.t;
          const g  = ctx.createRadialGradient(px, py, 0, px, py, 6);
          g.addColorStop(0, `hsla(${p.hue},100%,65%,0.9)`);
          g.addColorStop(1, `hsla(${p.hue},100%,65%,0)`);
          ctx.beginPath(); ctx.fillStyle = g;
          ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
          p.t += p.spd;
        } else { p.t = 2; }
      }

      // Nodes
      for (const n of nodes) {
        const pulse = Math.sin(n.phase) * 0.5 + 0.5;
        const a     = 0.22 + pulse * 0.3;
        const r     = n.r + pulse * 1.6;
        const g     = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
        g.addColorStop(0, `rgba(0,255,178,${a})`);
        g.addColorStop(1, 'rgba(0,255,178,0)');
        ctx.beginPath(); ctx.fillStyle = g;
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = `rgba(0,255,178,${a + 0.25})`;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.65 }} />;
}

// ── Form pieces ───────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: error ? 10 : 20 }}>
      <label style={labelSt}>{label}</label>
      {children}
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}

const InputEl = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  function InputEl({ hasError, onFocus, onBlur, ...rest }, ref) {
    return (
      <input
        ref={ref} {...rest}
        style={{ ...inputBase, border: `1.5px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}` }}
        onFocus={e => { e.currentTarget.style.borderColor = hasError ? 'rgba(248,113,113,0.7)' : 'rgba(255,157,0,0.55)'; onFocus?.(e); }}
        onBlur={e => { e.currentTarget.style.borderColor = hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'; onBlur?.(e); }}
      />
    );
  }
);

function SelectGrid({ options, value, onChange, cols = 2 }: { options: string[]; value: string; onChange: (v: string) => void; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8 }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: '10px 6px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
          border: `1.5px solid ${value === opt ? 'rgba(255,157,0,0.6)' : 'rgba(255,255,255,0.09)'}`,
          background: value === opt ? 'rgba(255,157,0,0.12)' : 'rgba(255,255,255,0.03)',
          color: value === opt ? '#FFD000' : 'rgba(255,255,255,0.55)',
          fontSize: 12, fontWeight: value === opt ? 600 : 400,
          transition: 'all 0.15s', fontFamily: "'Inter',sans-serif",
        }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProgressDots({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {[1, 2, 3].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: n < step ? 'linear-gradient(135deg,#FF9D00,#FFD000)' : n === step ? 'rgba(255,157,0,0.12)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${n <= step ? '#FFB300' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
            color: n < step ? '#0a0f1a' : n === step ? '#FFD000' : 'rgba(255,255,255,0.25)',
            transition: 'all 0.35s',
            boxShadow: n === step ? '0 0 18px rgba(255,157,0,0.35)' : 'none',
          }}>
            {n < step ? '✓' : n}
          </div>
          {i < 2 && (
            <div style={{ width: 52, height: 2, flexShrink: 0, background: n < step ? 'linear-gradient(90deg,#FF9D00,#FFD000)' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Form logic ────────────────────────────────────────────────────────────────
function FormContent() {
  const searchParams = useSearchParams();
  const managerCode  = searchParams.get('mc') || '';
  const studentId    = searchParams.get('id') || '';
  const clientName   = searchParams.get('cn') || '';

  const [step,     setStep]    = useState<Step>(1);
  const [nome,     setNome]    = useState('');
  const [nomeErr,  setNomeErr] = useState('');
  const [telefone, setTel]     = useState('');
  const [telErr,   setTelErr]  = useState('');
  const [email,    setEmail]   = useState('');
  const [emailErr, setEmailErr]= useState('');
  const [horario,  setHorario] = useState('');
  const [dia,      setDia]     = useState('');
  const [loading,  setLoading] = useState(false);
  const [done,     setDone]    = useState(false);
  const [error,    setError]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const idReferido = studentId ? `${studentId}${managerCode.padStart(2, '0')}` : '';

  function goStep2() {
    const err = nome.trim().length < 2 ? 'Por favor, insira seu nome completo' : '';
    setNomeErr(err);
    if (!err) setStep(2);
  }
  function goStep3() {
    const te = validatePhone(telefone);
    const ee = validateEmail(email);
    setTelErr(te); setEmailErr(ee);
    if (!te && !ee) setStep(3);
  }

  async function submit() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/indicacoes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitForm', idReferido, clientName, nome: nome.trim(), telefone: telefone.trim(), email: email.trim(), horario, diaContato: dia }),
      });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.error || 'Erro ao enviar. Tente novamente.');
    } catch { setError('Erro de conexão. Tente novamente.'); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
        <div style={{ fontSize: 52, marginBottom: 18 }}>✅</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>
          Formulário enviado!
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontFamily: "'Inter',sans-serif" }}>
          Recebemos seus dados com sucesso.<br />
          Um consultor especializado da Kodland<br />
          entrará em contato com você em breve.
        </div>
        <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 10, background: 'rgba(255,157,0,0.07)', border: '1px solid rgba(255,157,0,0.2)', fontSize: 12, color: 'rgba(255,200,0,0.8)', fontFamily: "'Inter',sans-serif" }}>
          Fique de olho no seu WhatsApp e e-mail 📱
        </div>
      </div>
    );
  }

  const nextBtn = (onClick: () => void, disabled: boolean, label = 'Continuar →') => (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px', borderRadius: 10, border: 'none',
      background: disabled ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#FF9D00,#FFD000)',
      color: disabled ? 'rgba(255,255,255,0.25)' : '#0a0f1a',
      fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Inter',sans-serif",
      boxShadow: disabled ? 'none' : '0 4px 20px rgba(255,157,0,0.35)',
      transition: 'opacity 0.15s',
    }}>{label}</button>
  );

  const backBtn = (onClick: () => void) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
      background: 'transparent', color: 'rgba(255,255,255,0.45)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
    }}>← Voltar</button>
  );

  return (
    <>
      <ProgressDots step={step} />

      {step === 1 && (
        <div>
          <Field label="Seu nome completo" error={nomeErr}>
            <InputEl ref={inputRef} autoFocus type="text" value={nome}
              onChange={e => { setNome(e.target.value); setNomeErr(''); }}
              onKeyDown={e => e.key === 'Enter' && goStep2()}
              placeholder="Nome e sobrenome" hasError={!!nomeErr} />
          </Field>
          {nextBtn(goStep2, !nome.trim())}
        </div>
      )}

      {step === 2 && (
        <div>
          <Field label="WhatsApp" error={telErr}>
            <InputEl ref={inputRef} autoFocus type="tel" value={telefone}
              onChange={e => { setTel(e.target.value); setTelErr(''); }}
              placeholder="+55 (11) 99999-9999" hasError={!!telErr}
              onBlur={() => setTelErr(validatePhone(telefone))} />
          </Field>
          <Field label="E-mail" error={emailErr}>
            <InputEl type="email" value={email}
              onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
              onKeyDown={e => e.key === 'Enter' && goStep3()}
              placeholder="seu@email.com" hasError={!!emailErr}
              onBlur={() => setEmailErr(validateEmail(email))} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            {backBtn(() => setStep(1))}
            <button onClick={goStep3} disabled={!telefone.trim()} style={{
              flex: 2, padding: '13px', borderRadius: 10, border: 'none',
              background: telefone.trim() ? 'linear-gradient(135deg,#FF9D00,#FFD000)' : 'rgba(255,255,255,0.07)',
              color: telefone.trim() ? '#0a0f1a' : 'rgba(255,255,255,0.25)',
              fontSize: 14, fontWeight: 700, cursor: telefone.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter',sans-serif",
              boxShadow: telefone.trim() ? '0 4px 20px rgba(255,157,0,0.35)' : 'none',
            }}>Continuar →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <Field label="Melhor horário para contato">
            <SelectGrid options={HORARIOS} value={horario} onChange={setHorario} cols={3} />
          </Field>
          <Field label="Dia preferido">
            <SelectGrid options={DIAS} value={dia} onChange={setDia} cols={2} />
          </Field>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            {backBtn(() => setStep(2))}
            <button onClick={submit} disabled={!horario || !dia || loading} style={{
              flex: 2, padding: '13px', borderRadius: 10, border: 'none',
              background: (horario && dia && !loading) ? 'linear-gradient(135deg,#FF9D00,#FFD000)' : 'rgba(255,255,255,0.07)',
              color: (horario && dia && !loading) ? '#0a0f1a' : 'rgba(255,255,255,0.25)',
              fontSize: 14, fontWeight: 700, cursor: (horario && dia && !loading) ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter',sans-serif",
              boxShadow: (horario && dia && !loading) ? '0 4px 20px rgba(255,157,0,0.35)' : 'none',
            }}>
              {loading ? 'Enviando...' : 'Enviar formulário'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
function PageShell({ clientName }: { clientName: string }) {
  const firstName = clientName.trim().split(/\s+/)[0];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1a; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes codeDrop {
          from { transform: translateY(0); opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 0.85; }
          to   { transform: translateY(110vh); opacity: 0; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #08101f 0%, #0d1a2e 50%, #08101f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative',
        animation: 'fadeIn 0.3s ease both',
      }}>
        {/* Dot grid */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Glow blobs */}
        <div style={{ position: 'fixed', top: '10%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,157,0,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '15%', right: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,163,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Background effects */}
        <NeuralNet />
        <CodeRain />

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 490,
          background: 'rgba(10, 17, 34, 0.92)',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22, padding: '40px 36px',
          boxShadow: '0 40px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
          animation: 'cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <KodlandLogo />

            {firstName ? (
              <>
                <div style={{
                  display: 'inline-block', padding: '6px 18px', borderRadius: 99, marginBottom: 14,
                  background: 'rgba(255,157,0,0.1)', border: '1px solid rgba(255,157,0,0.25)',
                  fontSize: 13, color: 'rgba(255,210,0,0.9)', fontFamily: "'Inter',sans-serif",
                }}>
                  👋 {firstName} te indicou!
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontFamily: "'Inter',sans-serif" }}>
                  <strong style={{ color: 'rgba(255,255,255,0.78)' }}>{firstName}</strong> nos indicou você para conhecer a Kodland — uma escola de programação para crianças e jovens. Preencha o formulário e um consultor entrará em contato.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif", lineHeight: 1.3, marginBottom: 10 }}>
                  Formulário de Indicação
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontFamily: "'Inter',sans-serif" }}>
                  Você foi indicado para conhecer a Kodland — uma escola de programação para crianças e jovens. Preencha o formulário e um consultor entrará em contato.
                </p>
              </>
            )}
          </div>

          <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif" }}>Carregando...</div>}>
            <FormContent />
          </Suspense>

          {/* Courses strip */}
          <div style={{ marginTop: 28, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['🐍 Python', '⛏️ Minecraft', '🎮 Roblox', '🦎 Scratch', '🕹️ Unity'].map(s => (
              <span key={s} style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', fontFamily: "'Inter',sans-serif" }}>{s}</span>
            ))}
          </div>

          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: "'Inter',sans-serif" }}>
            Kodland · Formulário de Indicação
          </div>
        </div>
      </div>
    </>
  );
}

function PageWithParams() {
  const searchParams = useSearchParams();
  return <PageShell clientName={searchParams.get('cn') || ''} />;
}

export default function IndicacaoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#08101f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif" }}>
        Carregando...
      </div>
    }>
      <PageWithParams />
    </Suspense>
  );
}
