// Floating diamond background — deterministic positions (no hydration mismatch)
const GEMS = Array.from({ length: 18 }, (_, i) => ({
  x:    +((i * 137.508 + 11) % 100).toFixed(1),
  y:    +((i * 83.21  + i * 1.3) % 100).toFixed(1),
  size: 6 + (i % 4) * 4,
  op:   0.04 + (i % 5) * 0.022,
  dur:  `${14 + (i % 6) * 4}s`,
  del:  `${(i % 7) * -3}s`,
  hue:  i % 3 === 0 ? '#00FFB2' : i % 3 === 1 ? '#00C2FF' : '#9D8FFF',
  dx:   (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 6),
  dy:   (i % 2 === 0 ? -1 : 1) * (6 + (i % 4) * 5),
}))

// Medium: more visible and faster than default, less chaotic than bright
const GEMS_MEDIUM = Array.from({ length: 20 }, (_, i) => ({
  x:    +((i * 137.508 + 11) % 100).toFixed(1),
  y:    +((i * 83.21  + i * 1.3) % 100).toFixed(1),
  size: 8 + (i % 4) * 5,
  op:   0.07 + (i % 5) * 0.035,
  dur:  `${8 + (i % 5) * 3}s`,
  del:  `${(i % 7) * -2}s`,
  hue:  i % 3 === 0 ? '#00FFB2' : i % 3 === 1 ? '#00C2FF' : '#9D8FFF',
  dx:   (i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 7),
  dy:   (i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 6),
}))

const GEMS_BRIGHT = Array.from({ length: 22 }, (_, i) => ({
  x:    +((i * 137.508 + 11) % 100).toFixed(1),
  y:    +((i * 83.21  + i * 1.3) % 100).toFixed(1),
  size: 10 + (i % 4) * 6,
  op:   0.13 + (i % 5) * 0.06,
  dur:  `${6 + (i % 5) * 2}s`,
  del:  `${(i % 7) * -2}s`,
  hue:  i % 3 === 0 ? '#00FFB2' : i % 3 === 1 ? '#00C2FF' : '#9D8FFF',
  dx:   (i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 8),
  dy:   (i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 7),
}))

export default function DiamondBg({ bright, medium }: { bright?: boolean; medium?: boolean }) {
  const gems = bright ? GEMS_BRIGHT : medium ? GEMS_MEDIUM : GEMS
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      <style>{`
        ${gems.map((g, i) => `
          @keyframes dfloat${i} {
            0%   { transform: translate(0,0)        rotate(0deg)   }
            33%  { transform: translate(${g.dx}px,${g.dy}px) rotate(45deg)  }
            66%  { transform: translate(${-g.dx*0.6}px,${g.dy*0.4}px) rotate(20deg) }
            100% { transform: translate(0,0)        rotate(0deg)   }
          }
        `).join('')}
      `}</style>
      {gems.map((g, i) => {
        const h = g.size, c = g.size / 2
        return (
          <svg
            key={i}
            width={h} height={h}
            viewBox={`0 0 ${h} ${h}`}
            fill="none"
            style={{
              position:'absolute',
              left:`${g.x}%`,
              top:`${g.y}%`,
              opacity: g.op,
              animation:`dfloat${i} ${g.dur} ease-in-out infinite`,
              animationDelay: g.del,
            }}
          >
            <polygon
              points={`${c},0 ${h},${c} ${c},${h} 0,${c}`}
              fill={g.hue}
            />
            <polygon
              points={`${c},0 ${h},${c} ${c},${c * 0.55}`}
              fill="rgba(255,255,255,0.35)"
            />
          </svg>
        )
      })}
    </div>
  )
}
