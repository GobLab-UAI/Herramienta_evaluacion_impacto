import React from 'react'
import { T, MONO, SERIF } from '@/lib/civic'

/**
 * Gráficos de la pantalla de resultados. Se usan tanto en pantalla como en el
 * marcado oculto que se serializa al PDF (html2pdf/html2canvas), por eso usan
 * solo estilos en línea y flexbox: nada de clases que dependan del layout.
 */

export type NivelImpacto = {
  label: string
  short: string
  from: number
  to: number
  color: string
  summary: string
}

/** Puntaje 0–100 por dimensión; `null` si la dimensión no tuvo preguntas puntuables visibles. */
export type PuntajeDimension = { dim: string; pct: number | null }

/**
 * Barra horizontal con los cuatro tramos de impacto y un marcador con el
 * puntaje del proyecto. Los tramos van en un solo tono de intensidad creciente:
 * un nivel más alto pide revisar más a fondo, no es un "peor" resultado.
 */
export function ImpactLevelBar({ score, levels, recommendationCount, compact = false }: {
  score: number
  levels: readonly NivelImpacto[]
  /** Recomendaciones generadas: conecta el nivel con lo que implica revisar. */
  recommendationCount?: number
  compact?: boolean
}) {
  const rounded = Math.max(0, Math.min(100, Math.round(score)))
  const current = levels.find(l => rounded <= l.to) ?? levels[levels.length - 1]
  // El rótulo se acota para no salirse de la barra en los extremos.
  const labelLeft = Math.max(9, Math.min(91, rounded))

  return (
    <div role="img" aria-label={`Puntaje ${rounded} de 100: ${current.label}`} style={{ width: '100%' }}>
      {/* Rótulo en píldora (mismo lenguaje que las etiquetas de la app) unido
          por una línea al punto marcador, como los puntos del radar. */}
      <div style={{ position: 'relative', height: compact ? 42 : 48 }}>
        <div style={{ position: 'absolute', left: `${labelLeft}%`, bottom: 12, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          {/* En SVG y no en HTML: html2canvas desplaza el texto HTML dentro de
              cajas con borde, y el PDF mostraba el número fuera de la píldora. */}
          <svg width="116" height="28" viewBox="0 0 116 28" style={{ display: 'block' }}>
            <rect x="0.75" y="0.75" width="114.5" height="26.5" rx="13.25" fill="#fff" stroke={T.burgundy} strokeWidth="1.5" />
            <text x="14" y="18" fontSize="11.5" fill={T.ink60} letterSpacing="0.3" fontFamily="Helvetica, Arial, sans-serif">Tu proyecto</text>
            <text x="102" y="19.5" textAnchor="end" fontSize="18" fontWeight="600" fill={T.burgundy} fontFamily={SERIF}>{rounded}</text>
          </svg>
        </div>
        <div style={{ position: 'absolute', left: `${rounded}%`, bottom: 0, width: 2, height: 12, marginLeft: -1, background: T.burgundy }} />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', height: compact ? 34 : 40, borderRadius: 8, overflow: 'hidden' }}>
          {levels.map(l => {
            const active = l.label === current.label
            // Todos los tramos con su tono pleno (la gradación es la escala); el
            // alcanzado se marca con el texto más fuerte y el marcador encima.
            const darkBg = l.color === T.roseDeep || l.color === T.burgundy
            return (
              <div
                key={l.label}
                style={{
                  flex: `${l.to - l.from + 1} 0 0`, background: l.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: darkBg ? '#fff' : T.ink, opacity: active ? 1 : 0.7,
                  fontSize: 12.5, fontWeight: active ? 800 : 600, letterSpacing: 0.3,
                  borderRight: l === levels[levels.length - 1] ? 'none' : '2px solid #fff',
                }}
              >
                {l.short.toUpperCase()}
              </div>
            )
          })}
        </div>
        {/* Línea blanca con borde borgoña: se distingue sobre cualquier tono. */}
        <div style={{ position: 'absolute', left: `${rounded}%`, top: 0, bottom: 0, width: 4, marginLeft: -2, background: '#fff', borderLeft: `1px solid ${T.burgundy}`, borderRight: `1px solid ${T.burgundy}` }} />
        <div style={{ position: 'absolute', left: `${rounded}%`, top: 0, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 99, background: T.burgundy, border: '2.5px solid #fff', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', marginTop: 6 }}>
        {levels.map(l => (
          <div key={l.label} style={{ flex: `${l.to - l.from + 1} 0 0`, textAlign: 'center', fontFamily: MONO, fontSize: 11.5, color: l.label === current.label ? T.ink : T.ink60, fontWeight: l.label === current.label ? 700 : 400 }}>
            {l.from}–{l.to}
          </div>
        ))}
      </div>

      <div style={{ marginTop: compact ? 10 : 16, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SERIF, fontSize: compact ? 24 : 30, fontWeight: 500, color: T.ink, lineHeight: 1 }}>{rounded}</span>
        <span style={{ fontSize: 13, color: T.ink60 }}>de 100 puntos ·</span>
        <span style={{ fontFamily: SERIF, fontSize: 20, color: T.burgundy }}>{current.label}</span>
      </div>
      <p style={{ fontSize: 13.5, color: T.ink80, margin: '6px 0 0', lineHeight: 1.55 }}>{current.summary}</p>
      {recommendationCount !== undefined && (
        <p style={{ fontSize: 13.5, color: T.ink, margin: '6px 0 0', lineHeight: 1.55 }}>
          {recommendationCount === 1
            ? <>Se generó <strong style={{ color: T.burgundy }}>1 recomendación</strong> para revisar.</>
            : <>Se generaron <strong style={{ color: T.burgundy }}>{recommendationCount} recomendaciones</strong> para revisar.</>}
        </p>
      )}
    </div>
  )
}

/** Radar de las dimensiones numeradas (01–11), escala 0–100. */
export function RadarDimensiones({ data, height = 260 }: { data: PuntajeDimension[]; height?: number }) {
  const CX = 190, CY = 165, R = 118, n = data.length
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2
  const at = (pct: number, i: number) => {
    const r = (pct / 100) * R
    return `${(CX + Math.cos(angle(i)) * r).toFixed(1)},${(CY + Math.sin(angle(i)) * r).toFixed(1)}`
  }
  return (
    <svg viewBox="0 0 380 340" style={{ width: '100%', height }}>
      {[25, 50, 75, 100].map((sc, i) => (
        <polygon key={i} points={data.map((_, j) => at(sc, j)).join(' ')} fill={i === 3 ? T.rosePaper : 'none'} stroke={T.roseLight} strokeWidth="1" />
      ))}
      {data.map((_, i) => (
        <line key={i} x1={CX} y1={CY} x2={CX + Math.cos(angle(i)) * R} y2={CY + Math.sin(angle(i)) * R} stroke={T.roseLight} strokeWidth="1" />
      ))}
      <polygon points={data.map((d, i) => at(d.pct ?? 0, i)).join(' ')} fill={T.rose} fillOpacity="0.32" stroke={T.burgundy} strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = at(d.pct ?? 0, i).split(',')
        return <circle key={i} cx={x} cy={y} r="4" fill={T.burgundy} />
      })}
      {data.map((_, i) => (
        <text key={i} x={CX + Math.cos(angle(i)) * (R + 22)} y={CY + Math.sin(angle(i)) * (R + 22)} textAnchor="middle" dominantBaseline="middle" fill={T.ink60} fontFamily={MONO} fontSize="11" fontWeight="600">
          {String(i + 1).padStart(2, '0')}
        </text>
      ))}
    </svg>
  )
}

/** Desglose por dimensión: número, nombre, barra y puntaje entero. */
export function PuntajeDimensiones({ data, compact = false }: { data: PuntajeDimension[]; compact?: boolean }) {
  return (
    <div>
      {data.map((d, i) => {
        const color = (d.pct ?? 0) > 60 ? T.burgundy : T.rose
        return (
          <div key={d.dim} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '3px 0' : '9px 0', borderBottom: i < data.length - 1 ? `1px dashed ${T.roseLight}` : 'none' }}>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: T.burgundy, width: 22, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, fontSize: compact ? 13 : 14.5, fontWeight: 500, minWidth: 0 }}>{d.dim}</span>
            <div style={{ width: 70, height: 6, background: T.paperDeep, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ width: `${d.pct ?? 0}%`, height: '100%', background: color, transition: 'width .5s' }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: d.pct === null ? T.ink40 : color, width: 28, textAlign: 'right', flexShrink: 0 }}>
              {d.pct ?? '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
