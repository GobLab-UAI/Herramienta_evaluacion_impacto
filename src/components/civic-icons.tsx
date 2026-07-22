/**
 * Iconos de trazo "Civic Rose" (lib/shared.jsx del proyecto de Design).
 * Heredan el color vía `currentColor`.
 */
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export type IconProps = React.SVGProps<SVGSVGElement>

export const I = {
  arrow: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.6" {...base} {...p}><path d="M3 7h8M8 4l3 3-3 3" /></svg>,
  check: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.8" {...base} {...p}><path d="M3 7.5l3 3 5-6" /></svg>,
  plus: (p: IconProps = {}) => <svg width="12" height="12" viewBox="0 0 12 12" strokeWidth="1.6" {...base} {...p}><path d="M6 2v8M2 6h8" /></svg>,
  chat: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.6" {...base} {...p}><path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6l-3 2v-2a2 2 0 0 1-1-2V4z" /></svg>,
  users: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><circle cx="5" cy="5" r="2" /><path d="M1.5 12c0-2 1.5-3.5 3.5-3.5S8.5 10 8.5 12M9.5 3.5a2 2 0 1 1 0 4M12.5 12c0-1.5-1-2.8-2.5-3.3" /></svg>,
  doc: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><path d="M3 1.5h5l3 3V12a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 3 12V2a.5.5 0 0 1 .5-.5z" /><path d="M8 1.5v3h3" /></svg>,
  flag: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><path d="M3 12V2M3 2h7l-1.5 2.5L10 7H3" /></svg>,
  thumb: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><path d="M5 6V3a1 1 0 0 1 2 0c0 2 1 3 2 3h2.5a1 1 0 0 1 1 1.2l-1 4a1 1 0 0 1-1 .8H5V6zM5 6H2.5v6H5" /></svg>,
  target: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><circle cx="7" cy="7" r="5.5" /><circle cx="7" cy="7" r="2.5" /></svg>,
  lock: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><rect x="3" y="6.5" width="8" height="6" rx="1" /><path d="M5 6.5V4.5a2 2 0 1 1 4 0v2" /></svg>,
  globe: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><circle cx="7" cy="7" r="5.5" /><path d="M1.5 7h11M7 1.5C8.8 3.5 9.5 5.2 9.5 7S8.8 10.5 7 12.5C5.2 10.5 4.5 8.8 4.5 7S5.2 3.5 7 1.5z" /></svg>,
  help: (p: IconProps = {}) => <svg width="12" height="12" viewBox="0 0 12 12" strokeWidth="1.6" {...base} {...p}><circle cx="6" cy="6" r="5" /><path d="M6 5.5v3M6 3.5v.5" /></svg>,
  chevron: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.8" {...base} {...p}><path d="M3 5l4 4 4-4" /></svg>,
  close: (p: IconProps = {}) => <svg width="16" height="16" viewBox="0 0 16 16" strokeWidth="1.6" {...base} {...p}><path d="M4 4l8 8M12 4l-8 8" /></svg>,
  download: (p: IconProps = {}) => <svg width="14" height="14" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><path d="M7 1.5v8M4 6.5l3 3 3-3M2 11.5h10" /></svg>,
  external: (p: IconProps = {}) => <svg width="12" height="12" viewBox="0 0 14 14" strokeWidth="1.5" {...base} {...p}><path d="M5.5 2.5H2.5v9h9v-3M8.5 2.5h3v3M11.5 2.5L6 8" /></svg>,
}

/** Bloque de logos UAI + GobLab en dos cajas contiguas. */
export function LogoUAIGobLab({ height = 36, rose = '#C08A93', ink = '#0A0A0A', mono = 'var(--font-mono), monospace' }: {
  height?: number; rose?: string; ink?: string; mono?: string
}) {
  return (
    // `nowrap` en los subtítulos: si envuelven, desbordan la altura fija
    // del bloque y el logo se ve cortado en pantallas angostas.
    <div style={{ display: 'flex', alignItems: 'stretch', height, color: '#fff', flexShrink: 0 }}>
      <div style={{ background: ink, padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        <div style={{ fontWeight: 800, fontSize: height * 0.32, letterSpacing: 2, fontFamily: mono, lineHeight: 1 }}>UAI</div>
        <div style={{ fontSize: height * 0.16, letterSpacing: 1.5, opacity: 0.9, whiteSpace: 'nowrap', lineHeight: 1 }}>UNIVERSIDAD ADOLFO IBÁÑEZ</div>
      </div>
      <div style={{ background: rose, padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        <div style={{ fontWeight: 600, fontSize: height * 0.36, lineHeight: 1 }}>GobLab</div>
        <div style={{ fontSize: height * 0.16, letterSpacing: 1.5, borderTop: '1px solid rgba(255,255,255,.6)', paddingTop: 2, whiteSpace: 'nowrap', lineHeight: 1 }}>ESCUELA DE GOBIERNO</div>
      </div>
    </div>
  )
}
