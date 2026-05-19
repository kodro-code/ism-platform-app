'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { COURSES, type Course } from '@/data/courses'

const TABS = [
  { id: 'cliente',            label: 'Conteúdo p/ Cliente',   icon: '📤' },
  { id: 'conhece',            label: 'Conhece o Produto',      icon: '📚' },
  { id: 'oferta',             label: 'Como Oferecer',          icon: '💬' },
  { id: 'experimental',       label: 'Aula Experimental',      icon: '🎓' },
  { id: 'webinars',           label: 'Webinars',               icon: '🎥' },
] as const
type TabId = typeof TABS[number]['id']

// ── Coming soon placeholder ───────────────────────────────────────────────────
function ComingSoon({ tab }: { tab: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 32px', gap: 14, textAlign: 'center' }}>
      <div style={{ fontSize: 40, opacity: 0.4 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(232,237,245,0.4)', fontFamily: "'Inter',sans-serif" }}>Em preparação</div>
      <div style={{ fontSize: 13, color: 'rgba(232,237,245,0.2)', fontFamily: "'DM Sans',sans-serif", maxWidth: 340, lineHeight: 1.6 }}>
        O conteúdo de <strong style={{ color: 'rgba(232,237,245,0.35)' }}>{tab}</strong> está sendo preparado e será disponibilizado em breve.
      </div>
    </div>
  )
}

// ── Tab: Conteúdo para o Cliente ──────────────────────────────────────────────
function PdfBlock({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div style={{ flex: '1 1 420px', minWidth: 0 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(232,237,245,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: 10 }}>PDF do Curso</div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        <iframe
          src={`https://drive.google.com/file/d/${pdfUrl}/preview`}
          width="100%" height="520"
          style={{ display: 'block', border: 'none' }}
          allow="autoplay"
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <a href={`https://drive.google.com/file/d/${pdfUrl}/view`} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, fontSize: 11, color: 'rgba(232,237,245,0.45)', fontFamily: "'Inter',sans-serif", textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>↗ Abrir</a>
        <a href={`https://drive.google.com/uc?export=download&id=${pdfUrl}`} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, fontSize: 11, color: 'rgba(0,194,255,0.8)', fontFamily: "'Inter',sans-serif", textDecoration: 'none', background: 'rgba(0,194,255,0.07)', border: '1px solid rgba(0,194,255,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,194,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,194,255,0.07)')}>↓ Baixar PDF</a>
      </div>
    </div>
  )
}

function ClienteTab({ course }: { course: Course }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  if (!course.cliente) return <ComingSoon tab="Conteúdo para o Cliente" />


  const variants = Array.isArray(course.cliente) ? course.cliente : [course.cliente]
  const variant  = variants[variantIdx]
  const { resumo, pdfUrl } = variant

  function handleCopy() {
    navigator.clipboard.writeText(resumo).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div>
      {/* Internal note — not included in copy */}
      {course.internalNote && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 14px', borderRadius: 8, marginBottom: 18,
          background: 'rgba(255,193,7,0.06)', border: '1px solid rgba(255,193,7,0.2)',
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📌</span>
          <span style={{ fontSize: 11.5, color: 'rgba(255,220,80,0.8)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.55 }}>
            {course.internalNote}
          </span>
        </div>
      )}

      {/* Variant selector — only shown when multiple variants exist */}
      {variants.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: 'rgba(232,237,245,0.3)', fontFamily: "'Inter',sans-serif", alignSelf: 'center', marginRight: 4 }}>Versão:</span>
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => { setVariantIdx(i); setCopied(false) }}
              style={{
                padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5, fontWeight: i === variantIdx ? 700 : 400,
                background: i === variantIdx ? `${course.color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === variantIdx ? course.color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: i === variantIdx ? course.color : 'rgba(232,237,245,0.45)',
                fontFamily: "'Inter',sans-serif", transition: 'all 0.15s',
              }}
            >{v.label ?? `Variante ${i + 1}`}</button>
          ))}
        </div>
      )}

    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

      {/* PDF embed */}
      {pdfUrl && <PdfBlock pdfUrl={pdfUrl} />}

      {/* Resumo + copy */}
      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(232,237,245,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Resumo para Compartilhar</div>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: copied ? 'rgba(0,255,178,0.12)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${copied ? 'rgba(0,255,178,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#00FFB2' : 'rgba(232,237,245,0.6)',
              fontSize: 11, fontWeight: 600, fontFamily: "'Inter',sans-serif",
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copiado!' : '⎘ Copiar'}
          </button>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 12.5,
          lineHeight: 1.75,
          color: 'rgba(232,237,245,0.72)',
          fontFamily: "'DM Sans',sans-serif",
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: 520,
          overflowY: 'auto',
        }}>
          {resumo}
        </div>
      </div>
    </div>
    </div>
  )
}

// ── Tab: Conhece o Produto ────────────────────────────────────────────────────
function ConheceProdutoTab({ course }: { course: Course }) {
  if (!course.conheceProduto) return <ComingSoon tab="Conhece o Produto" />

  const embedUrl = `https://docs.google.com/presentation/d/${course.conheceProduto}/embed?start=false&loop=false&rm=minimal`

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', borderRadius: 8, marginBottom: 18,
        background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.22)',
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🔒</span>
        <span style={{ fontSize: 11.5, color: 'rgba(200,160,255,0.85)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 700 }}>Uso interno — managers only.</strong> Esta apresentação é exclusiva para a equipe. Não compartilhar com clientes.
        </span>
      </div>

      <div style={{
        textAlign: 'center', fontSize: 13, color: 'rgba(232,237,245,0.5)',
        marginBottom: 12, fontFamily: "'Inter',sans-serif", lineHeight: 1.6,
        padding: '8px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        👆 Clique no <strong style={{ color: 'rgba(232,237,245,0.8)' }}>lado direito</strong> do slide para avançar &nbsp;·&nbsp; <strong style={{ color: 'rgba(232,237,245,0.8)' }}>lado esquerdo</strong> para voltar
      </div>

      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="560"
          style={{ display: 'block', border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  )
}

// ── Course detail page ────────────────────────────────────────────────────────
export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('cliente')

  const course = COURSES.find(c => c.slug === params.slug)

  if (!course) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>🔍</div>
        <div style={{ fontSize: 14, color: 'rgba(232,237,245,0.4)', fontFamily: "'Inter',sans-serif" }}>Curso não encontrado</div>
        <button onClick={() => router.push('/courses')} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,237,245,0.6)', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
          ← Ver todos os cursos
        </button>
      </div>
    )
  }

  const c = course.color

  function renderTabContent() {
    switch (activeTab) {
      case 'cliente':       return <ClienteTab course={course!} />
      case 'conhece':       return <ConheceProdutoTab course={course!} />
      case 'oferta':        return <ComingSoon tab="Como Oferecer" />
      case 'experimental':  return <ComingSoon tab="Aula Experimental" />
      case 'webinars':      return <ComingSoon tab="Webinars" />
    }
  }

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 1080, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Course header */}
      <div style={{ background: 'rgba(9,13,20,0.98)', border: `1px solid ${c}22`, borderRadius: 16, padding: '22px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c}, ${c}00)` }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>{course.icon}</span>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'rgba(232,237,245,0.95)', fontFamily: "'Inter',sans-serif" }}>{course.name}</h1>
              {(course.badge ?? (course.isNew ? 'NOVO' : null)) && (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9.5, fontWeight: 800, color: '#FF9640', background: 'rgba(255,150,64,0.12)', border: '1px solid rgba(255,150,64,0.3)', fontFamily: "'Inter',sans-serif", letterSpacing: '0.07em' }}>
                  {course.badge ?? 'NOVO'}
                </span>
              )}
            </div>
            {course.marketingName !== course.name && (
              <div style={{ fontSize: 12, color: `${c}99`, fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>{course.marketingName}</div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {course.ageRange && (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10.5, color: `${c}CC`, background: `${c}12`, border: `1px solid ${c}25`, fontFamily: "'Inter',sans-serif" }}>
                  👦 {course.ageRange}
                </span>
              )}
              {course.level && (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10.5, color: 'rgba(232,237,245,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Inter',sans-serif" }}>
                  {course.level}
                </span>
              )}
              {course.duration && (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10.5, color: 'rgba(232,237,245,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Inter',sans-serif" }}>
                  🕒 {course.duration}
                </span>
              )}
            </div>
          </div>

          {/* Codes — right side, prominent */}
          {course.codeStatus && course.codes.length === 0 && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(232,237,245,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: 7 }}>Código do Produto</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}20` }}>
                <span style={{ fontSize: 11, color: `${c}70`, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>⏳ {course.codeStatus}</span>
              </div>
            </div>
          )}
          {course.codes.length > 0 && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(232,237,245,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: 7 }}>
                {course.codes.length === 1 ? 'Código do Produto' : 'Códigos do Produto'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {course.codes.map((cc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: `${c}10`, border: `1px solid ${c}30` }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: c, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.01em', lineHeight: 1 }}>{cc.code}</span>
                    <div>
                      <div style={{ fontSize: 10.5, color: 'rgba(232,237,245,0.55)', fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{cc.label}</div>
                      {cc.note && <div style={{ fontSize: 9.5, color: 'rgba(232,237,245,0.3)', fontFamily: "'DM Sans',sans-serif", marginTop: 1 }}>{cc.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {course.codes.length === 0 && (
            <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,150,64,0.06)', border: '1px solid rgba(255,150,64,0.2)' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,150,64,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>Código</div>
              <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.3)', fontFamily: "'DM Sans',sans-serif" }}>Em breve</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'rgba(9,13,20,0.98)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '13px 18px',
                  background: isActive ? `${c}10` : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? c : 'transparent'}`,
                  color: isActive ? c : 'rgba(232,237,245,0.35)',
                  cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 400,
                  fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(232,237,245,0.6)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(232,237,245,0.35)' }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '28px 24px' }}>
          {renderTabContent()}
        </div>

      </div>
    </div>
  )
}
