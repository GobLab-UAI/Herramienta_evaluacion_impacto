/**
 * Contexto normativo de la evaluación.
 *
 * La EIA nace ajustada a la normativa chilena. Para trabajar con servicios
 * públicos internacionales se agrega un segundo contexto: las preguntas,
 * tooltips y recomendaciones podrán tener textos distintos según el contexto
 * elegido. Por ahora ambos comparten el mismo contenido; la infraestructura de
 * overrides (ver `overrides` / `soloContexto` en el tipo Question, y
 * `resolverTextoRec`) queda lista para diferenciarlos más adelante.
 */

export type Contexto = 'chile' | 'internacional'

export const CONTEXTO_DEFAULT: Contexto = 'chile'

export const CONTEXTOS: Array<{ id: Contexto; label: string; short: string; icon: string }> = [
  { id: 'chile', label: 'Contexto chileno', short: 'Chile', icon: '🇨🇱' },
  { id: 'internacional', label: 'Contexto internacional', short: 'Internacional', icon: '🌐' },
]

export function esContexto(v: unknown): v is Contexto {
  return v === 'chile' || v === 'internacional'
}

export function normalizarContexto(v: unknown): Contexto {
  return esContexto(v) ? v : CONTEXTO_DEFAULT
}

export function labelContexto(c: Contexto): string {
  return CONTEXTOS.find(x => x.id === c)?.label ?? c
}

/** Texto que puede variar por contexto: una cadena, o un mapa por contexto. */
export type TextoPorContexto = string | Partial<Record<Contexto, string>>

/** Resuelve un TextoPorContexto al string del contexto activo, con respaldos. */
export function resolverTexto(t: TextoPorContexto, c: Contexto): string {
  if (typeof t === 'string') return t
  return t[c] ?? t[CONTEXTO_DEFAULT] ?? Object.values(t)[0] ?? ''
}
