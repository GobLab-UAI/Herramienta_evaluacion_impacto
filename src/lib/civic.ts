/**
 * Design tokens "Civic Rose" — derivados del proyecto de Claude Design
 * "EIA Home Redesign" (lib/shared.jsx). Fuente única de verdad para
 * la portada, el cuestionario y los resultados.
 */
export const T = {
  ink: '#0A0A0A',
  ink80: '#2A2622',
  ink60: '#5A534C',
  ink40: '#8F877F',
  ink20: '#D6D1CB',
  paper: '#FAF7F4',
  paperDeep: '#F2EDE6',
  line: '#E5DFD7',

  rose: '#C08A93',
  roseLight: '#E8D1D5',
  roseTint: '#F4E4E7',
  burgundy: '#7A3B48',
  rosePaper: '#FBF3F4',

  success: '#2F6B4F',
  warn: '#C9813B',
} as const

export const SERIF = 'var(--font-fraunces), Georgia, serif'
export const MONO = 'var(--font-mono), ui-monospace, monospace'

/** Estilo base compartido por todos los inputs del cuestionario. */
export const inputBase: React.CSSProperties = {
  width: '100%',
  border: `1.5px solid ${T.roseLight}`,
  borderRadius: 9,
  padding: '11px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  color: T.ink,
  transition: 'border-color .15s, box-shadow .15s',
}
