'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: 5 + (i * 47 + 13) % 92,
  y: 5 + (i * 61 + 7)  % 88,
  size: 8 + (i % 4) * 5,
  opacity: 0.03 + (i % 5) * 0.012,
  delay: (i * 0.38) % 5,
  dur: 5 + (i % 4) * 1.8,
}))

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)
  const [step,     setStep]     = useState<'idle'|'success'>('idle')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setError('Email ou senha inválidos. Verifique e tente novamente.')
    } else {
      setStep('success')
      setTimeout(() => router.push('/'), 1400)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="grid-bg" />

      {/* Floating diamonds */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          border: `1px solid rgba(0,255,178,${p.opacity * 2})`,
          background: `rgba(0,255,178,${p.opacity})`,
          transform: 'rotate(45deg)',
          animation: `floatDiamond ${p.dur}s ease-in-out ${p.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Glow orb */}
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,178,0.05) 0%, transparent 65%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, padding: '52px 44px',
        background: 'rgba(13,17,23,0.95)',
        border: '1px solid var(--border-mid)',
        borderRadius: 24,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,178,0.06)',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1)',
      }}>

        {/* Success overlay */}
        {step === 'success' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            background: 'rgba(13,17,23,0.97)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, zIndex: 10,
            animation: 'fadeIn 0.3s ease both',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(0,255,178,0.12)', border: '2px solid rgba(0,255,178,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, animation: 'successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>✓</div>
            <div style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
              Bem-vinda!
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: "'DM Sans',sans-serif" }}>
              Entrando na plataforma…
            </div>
          </div>
        )}

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 18px',
            background: 'linear-gradient(135deg, rgba(0,255,178,0.18), rgba(0,194,255,0.12))',
            border: '1px solid rgba(0,255,178,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,255,178,0.14)',
            animation: mounted ? 'scaleIn 0.5s cubic-bezier(0.34,1.4,0.64,1) 0.1s both' : 'none',
          }}>
            <span style={{
              fontSize: 32, fontWeight: 900,
              background: 'linear-gradient(135deg,#00FFB2,#00C2FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: "'Inter',sans-serif",
            }}>N</span>
          </div>

          <div style={{
            fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg,#00FFB2,#00C2FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'Inter',sans-serif", marginBottom: 6,
            animation: mounted ? 'fadeUp 0.45s ease 0.18s both' : 'none',
          }}>NexaForce</div>

          <div style={{
            fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.14em',
            textTransform: 'uppercase', fontFamily: "'Inter',sans-serif",
            animation: mounted ? 'fadeUp 0.45s ease 0.26s both' : 'none',
          }}>ISM Brazil</div>

          <div style={{
            marginTop: 22, fontSize: 13, color: 'var(--text-dim)',
            fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5,
            animation: mounted ? 'fadeUp 0.45s ease 0.32s both' : 'none',
          }}>
            Entre com seu email corporativo
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ animation: mounted ? 'fadeUp 0.45s ease 0.38s both' : 'none' }}>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--text-dim)',
              fontFamily: "'Inter',sans-serif", marginBottom: 8,
            }}>Email Corporativo</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nome@kodland.team" required autoComplete="email"
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-mid)',
                borderRadius: 12, color: 'var(--text)', fontSize: 14,
                fontFamily: "'DM Sans',sans-serif", outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,255,178,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,255,178,0.07)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 26 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--text-dim)',
              fontFamily: "'Inter',sans-serif", marginBottom: 8,
            }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                style={{
                  width: '100%', padding: '13px 48px 13px 16px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-mid)',
                  borderRadius: 12, color: 'var(--text)', fontSize: 14,
                  fontFamily: "'DM Sans',sans-serif", outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,255,178,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,255,178,0.07)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-faint)', fontSize: 15, padding: 4, lineHeight: 1,
              }}>{showPass ? '🙈' : '👁'}</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 10, marginBottom: 18,
              background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.22)',
              fontSize: 13, color: '#FF7070', fontFamily: "'DM Sans',sans-serif",
              animation: 'fadeUp 0.2s ease both',
            }}>{error}</div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading
              ? 'rgba(0,255,178,0.06)'
              : 'linear-gradient(135deg, rgba(0,255,178,0.18), rgba(0,194,255,0.12))',
            border: `1px solid ${loading ? 'var(--border)' : 'rgba(0,255,178,0.38)'}`,
            borderRadius: 12,
            color: loading ? 'var(--text-faint)' : 'var(--accent)',
            fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter',sans-serif", letterSpacing: '0.03em',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: loading ? 'none' : '0 0 24px rgba(0,255,178,0.08)',
          }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(0,255,178,0.18)'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(0,255,178,0.08)'; }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(0,255,178,0.15)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                Verificando…
              </>
            ) : 'Entrar →'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 28, textAlign: 'center',
          fontSize: 11, color: 'var(--text-faint)', fontFamily: "'Inter',sans-serif",
          animation: mounted ? 'fadeUp 0.45s ease 0.5s both' : 'none',
        }}>
          Plataforma interna · ISM Brazil
        </div>
      </div>
    </div>
  )
}
