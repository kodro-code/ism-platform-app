'use client'

import { usePathname, useRouter } from 'next/navigation'
import { COURSES, CATEGORIES } from '@/data/courses'

const CAT_COLOR: Record<string, string> = {
  coding: '#00C2FF',
  design: '#A855F7',
}

export default function CourseSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const activeSlug = pathname.startsWith('/courses/') ? pathname.split('/courses/')[1] : null
  const isHome     = pathname === '/courses'

  return (
    <div style={{
      width: 210, flexShrink: 0,
      background: 'rgba(7,10,17,0.98)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', height: '100%',
    }}>

      {/* Home button */}
      <button
        onClick={() => router.push('/courses')}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '14px 16px',
          background: isHome ? 'rgba(0,255,178,0.06)' : 'transparent',
          borderLeft: `3px solid ${isHome ? '#00FFB2' : 'transparent'}`,
          border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
          color: isHome ? '#00FFB2' : 'rgba(232,237,245,0.5)',
          cursor: 'pointer', fontSize: 12.5, fontWeight: isHome ? 700 : 400,
          fontFamily: "'Inter',sans-serif", textAlign: 'left', width: '100%',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!isHome) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(232,237,245,0.8)' } }}
        onMouseLeave={e => { if (!isHome) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(232,237,245,0.5)' } }}
      >
        <span style={{ fontSize: 15 }}>📚</span>
        Todos os Cursos
      </button>

      {/* Category groups */}
      {CATEGORIES.map(cat => {
        const courses = COURSES.filter(c => c.category === cat.id)
        const cc = CAT_COLOR[cat.id] ?? '#00C2FF'
        return (
          <div key={cat.id}>
            {/* Category label */}
            <div style={{
              padding: '12px 16px 6px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 3, height: 10, borderRadius: 2, background: cc, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: `${cc}90`, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>
                {cat.label}
              </span>
            </div>

            {/* Course links */}
            {courses.map(course => {
              const isActive = activeSlug === course.slug
              return (
                <button
                  key={course.slug}
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '7px 14px 7px 0',
                    background: isActive ? `${cc}10` : 'transparent',
                    borderLeft: `3px solid ${isActive ? cc : 'transparent'}`,
                    border: 'none',
                    color: isActive ? 'rgba(232,237,245,0.95)' : 'rgba(232,237,245,0.42)',
                    cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 400,
                    fontFamily: "'Inter',sans-serif", textAlign: 'left',
                    transition: 'all 0.13s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.color = 'rgba(232,237,245,0.7)'
                      e.currentTarget.style.borderLeftColor = `${cc}40`
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(232,237,245,0.42)'
                      e.currentTarget.style.borderLeftColor = 'transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: 14, paddingLeft: 11, flexShrink: 0 }}>{course.icon}</span>
                  <span style={{ lineHeight: 1.3, flex: 1, minWidth: 0 }}>
                    {course.name}
                    {course.isNew && (
                      <span style={{ marginLeft: 5, fontSize: 8.5, fontWeight: 700, color: '#FF9640', verticalAlign: 'middle' }}>NEW</span>
                    )}
                  </span>
                </button>
              )
            })}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '6px 0' }} />
          </div>
        )
      })}
    </div>
  )
}
