'use client'

export default function CoursesPage() {
  return (
    <div style={{ padding:'56px 40px', maxWidth:900, margin:'0 auto', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:48 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10, fontFamily:"'Inter',sans-serif" }}>
          Capacitação
        </div>
        <h1 style={{
          margin:0, fontSize:32, fontWeight:800, letterSpacing:'-0.02em',
          background:'linear-gradient(135deg,#E8EDF5 30%,rgba(232,237,245,0.5))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          fontFamily:"'Inter',sans-serif",
        }}>Courses</h1>
        <p style={{ margin:'10px 0 0', fontSize:15, color:'var(--text-dim)', maxWidth:420 }}>
          Conteúdos de capacitação para a equipe. Novos cursos chegando em breve.
        </p>
      </div>

      {/* Coming soon */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'72px 32px',
        background:'rgba(255,255,255,0.02)',
        border:'1px dashed var(--border-mid)',
        borderRadius:20, gap:16, textAlign:'center',
      }}>
        <div style={{ fontSize:48, filter:'grayscale(0.3)', animation:'pulse 3s ease infinite' }}>🚧</div>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'Inter',sans-serif" }}>
            Em construção
          </div>
          <div style={{ fontSize:14, color:'var(--text-faint)', maxWidth:320, lineHeight:1.6 }}>
            Os cursos estão sendo preparados. Em breve você poderá acessar os conteúdos de capacitação aqui.
          </div>
        </div>
      </div>

    </div>
  );
}
