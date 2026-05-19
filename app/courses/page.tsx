'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DiamondBg from '@/components/diamond-bg'
import { COURSES, CATEGORIES, type Course } from '@/data/courses'

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const c = course.color

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        background: 'rgba(9,13,20,0.95)',
        border: `1px solid ${c}${hov ? '55' : '22'}`,
        borderRadius: 14,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.18s',
        boxShadow: hov ? `0 0 28px ${c}30` : '0 2px 12px rgba(0,0,0,0.4)',
        transform: hov ? 'translateY(-3px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c}, ${c}00)`, borderRadius: '14px 14px 0 0' }} />

      {(course.badge ?? (course.isNew ? 'NOVO' : null)) && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 800,
          color: '#FF9640', background: 'rgba(255,150,64,0.12)', border: '1px solid rgba(255,150,64,0.3)',
          fontFamily: "'Inter',sans-serif", letterSpacing: '0.08em',
        }}>{course.badge ?? 'NOVO'}</span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{course.icon}</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'rgba(232,237,245,0.9)', fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{course.name}</div>
          {course.marketingName !== course.name && (
            <div style={{ fontSize: 10, color: `${c}99`, fontFamily: "'DM Sans',sans-serif", marginTop: 2, lineHeight: 1.3 }}>{course.marketingName}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {course.ageRange && (
          <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, color: `${c}CC`, background: `${c}12`, border: `1px solid ${c}25`, fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>
            {course.ageRange}
          </span>
        )}
        {course.level && (
          <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, color: 'rgba(232,237,245,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>
            {course.level}
          </span>
        )}
      </div>

      {course.codes.length > 0 && (
        <div style={{ marginTop: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(232,237,245,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: 5 }}>
            {course.codes.length === 1 ? 'Código' : 'Códigos'}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {course.codes.map((cc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, background: `${c}10`, border: `1px solid ${c}30` }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: c, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.01em' }}>{cc.code}</span>
                {cc.note && <span style={{ fontSize: 9, color: `${c}80`, fontFamily: "'DM Sans',sans-serif" }}>· {cc.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {course.codes.length === 0 && course.codeStatus && (
        <div style={{ fontSize: 10, color: `${c}60`, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
          ⏳ {course.codeStatus}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 14, right: 14, fontSize: 13, color: `${c}50`, transition: 'transform 0.18s', transform: hov ? 'translateX(3px)' : 'none' }}>›</div>
    </div>
  )
}

export default function CoursesPage() {
  const router = useRouter()

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: '44px 36px 60px', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden' }}>
      <DiamondBg />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>
            Capacitação · ISM Platform
          </div>
          <h1 style={{
            margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.45))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'Inter',sans-serif",
          }}>Courses</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'rgba(232,237,245,0.35)', maxWidth: 460, lineHeight: 1.6 }}>
            Selecione um curso para ver conteúdo para o cliente, conhecer o produto, scripts de oferta e material de aula experimental.
          </p>
        </div>

        {CATEGORIES.map(cat => {
          const courses = COURSES.filter(c => c.category === cat.id)
          return (
            <div key={cat.id} style={{ marginBottom: 44 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>{cat.label}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${cat.color}30, transparent)` }} />
                <span style={{ fontSize: 10, color: 'rgba(232,237,245,0.2)', fontFamily: "'Inter',sans-serif" }}>{courses.length} cursos</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {courses.map(course => (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    onClick={() => router.push(`/courses/${course.slug}`)}
                  />
                ))}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}
