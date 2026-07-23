'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackToolStart } from '@/lib/analytics'
import Link from 'next/link'
import { T, SERIF, MONO } from '@/lib/civic'
import { I, LogoUAIGobLab } from '@/components/civic-icons'
import { FeedbackPill } from '@/components/FeedbackPill'

/* ── 9 dimensiones ─────────────────────────────────────────────── */
const DIMS = [
  { n: '01', title: 'Proporcionalidad' },
  { n: '02', title: 'Normativa' },
  { n: '03', title: 'Protección · de datos' },
  { n: '04', title: 'Licencia · social' },
  { n: '05', title: 'Gobernanza' },
  { n: '06', title: 'Rendición · de cuentas' },
  { n: '07', title: 'Transparencia' },
  { n: '08', title: 'Ciberseguridad' },
  { n: '09', title: 'No discriminación · equidad' },
]

function LogoHerramientas({ scale = 0.7 }: { scale?: number }) {
  return (
    <div style={{ fontWeight: 800, lineHeight: 0.95, textAlign: 'right', letterSpacing: -0.3 }}>
      <div style={{ fontSize: 18 * scale, color: T.rose }}>HERRAMIENTAS</div>
      <div style={{ fontSize: 22 * scale, color: T.ink }}>ALGORITMOS<br />ÉTICOS</div>
    </div>
  )
}

/* ── Radial dimension graph ────────────────────────────────────── */
function DimensionGraph() {
  const CX = 400, CY = 400, R = 180
  const nodes = DIMS.map((d, i) => {
    const angle = (i / DIMS.length) * Math.PI * 2 - Math.PI / 2
    return { ...d, x: CX + Math.cos(angle) * R, y: CY + Math.sin(angle) * R }
  })

  return (
    <svg viewBox="0 0 800 800" style={{ width: '100%', maxWidth: 680 }}>
      <defs>
        <radialGradient id="cr4-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={T.rose} stopOpacity="0.15" />
          <stop offset="70%" stopColor={T.rose} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="220" fill="url(#cr4-glow)" />

      {[220, 170, 120, 70].map((rr, i) => (
        <circle key={i} cx={CX} cy={CY} r={rr} fill="none" stroke={T.roseLight} strokeWidth="1" strokeDasharray={i % 2 ? '2 5' : '0'} />
      ))}

      {nodes.map((n, i) => (
        <line key={'sp' + i} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={T.roseLight} strokeWidth="1" />
      ))}

      <polygon points={nodes.map(n => `${n.x},${n.y}`).join(' ')} fill={T.rose} fillOpacity="0.09" stroke={T.rose} strokeWidth="1.5" />

      {([[0, 4], [1, 5], [2, 6], [3, 7], [4, 8], [0, 6]] as const).map(([a, b], i) => (
        <line key={'x' + i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={T.rose} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="1 3" />
      ))}

      {nodes.map(n => (
        <g key={n.n}>
          <circle cx={n.x} cy={n.y} r="22" fill="#fff" stroke={T.rose} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="13" fill={T.rose} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily={MONO} fontWeight="700" fontSize="11">{n.n}</text>
        </g>
      ))}

      <g transform={`translate(${CX},${CY})`}>
        <circle r="62" fill="#fff" stroke={T.rose} strokeWidth="1.5" />
        <circle r="52" fill={T.rosePaper} />
        <text y="-7" textAnchor="middle" fill={T.burgundy} fontFamily={SERIF} fontStyle="italic" fontSize="26" fontWeight="500">EIA</text>
        <text y="14" textAnchor="middle" fill={T.ink60} fontFamily={MONO} fontSize="8" letterSpacing="1.5">9 DIMENSIONES</text>
      </g>

      {nodes.map((n, i) => {
        const dx = n.x - CX, dy = n.y - CY
        const len = Math.sqrt(dx * dx + dy * dy)
        const LABEL_R = 248
        const lx = CX + (dx / len) * LABEL_R, ly = CY + (dy / len) * LABEL_R
        const anchor = dx > 15 ? 'start' : dx < -15 ? 'end' : 'middle'
        const parts = n.title.split('·')
        const lineH = 15
        const totalH = parts.length * lineH
        const maxLen = Math.max(...parts.map(p => p.trim().length))
        const estW = maxLen * 7.5 + 8
        const bx = anchor === 'start' ? lx - 4 : anchor === 'end' ? lx - estW + 4 : lx - estW / 2
        const by = ly - totalH / 2 - 4
        return (
          <g key={'lb' + i}>
            <rect x={bx} y={by} width={estW} height={totalH + 8} rx="5" fill="white" opacity="0.92" />
            <text textAnchor={anchor} fill={T.ink} fontSize="12" fontWeight="600">
              {parts.map((p, pi) => (
                <tspan key={pi} x={lx} y={ly + (pi - (parts.length - 1) / 2) * lineH}>{p.trim()}</tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Hero content cards ────────────────────────────────────────── */
const WHY_CARDS = [
  {
    icon: I.target,
    q: '¿Por qué utilizarla?',
    items: [
      'Anticipa riesgos y dimensiona el grado de impacto antes de desplegar un sistema de IA.',
      'Identifica responsables de implementación y operación, asegurando un uso ético y transparente.',
      'Fomenta la confianza pública y previene sesgos, discriminación, infracciones de datos y opacidad.',
    ],
  },
  {
    icon: I.doc,
    q: '¿En qué consiste?',
    items: [
      'Análisis detallado de riesgos éticos, sociales y técnicos, con medidas concretas para evitarlos o mitigarlos.',
      'Guías y recomendaciones para tomar acción sobre los riesgos éticos del proyecto.',
    ],
  },
  {
    icon: I.flag,
    q: '¿Qué obtienes?',
    items: [
      'Informe con nivel de impacto del sistema y recomendaciones personalizadas para 9 dimensiones.',
    ],
  },
]

const ORIGIN_OPTIONS = [
  'Organismo público',
  'Empresa privada',
  'Institución académica',
  'Organización de la sociedad civil',
  'Persona independiente',
]

const STEPS: [string, string][] = [
  ['01', 'Ingresa tu correo'],
  ['02', 'Responde el cuestionario'],
  ['03', 'Descarga tu informe'],
  ['04', 'Evalúa la herramienta'],
]

/* ── Page ──────────────────────────────────────────────────────── */
export function LandingPage() {
  const [email, setEmail] = useState('')
  const [origin, setOrigin] = useState('')
  const [subscribe, setSubscribe] = useState(false)
  const [starting, setStarting] = useState(false)

  const router = useRouter()
  const VERSION = process.env.NEXT_PUBLIC_VERSION || '5.0.0'

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setStarting(true)
    if (subscribe) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch {
        // Registro falló o tardó demasiado — no bloquear el acceso
      }
    }
    trackToolStart()
    setStarting(false)
    router.push(`/evaluacion?email=${encodeURIComponent(email)}`)
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${T.roseLight}`, background: T.rosePaper,
    borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ background: '#fff', color: T.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <header style={{ padding: '14px 40px', background: '#fff', borderBottom: `1px solid ${T.roseLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', minWidth: 0 }}>
          <LogoUAIGobLab height={36} rose={T.rose} ink={T.ink} mono={MONO} />
          <div className="eia-logo-sep" style={{ width: 1, height: 24, background: T.roseLight }} />
          <LogoHerramientas scale={0.7} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 13, color: T.ink80 }}>
          <Link href="/privacidad" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</Link>
          <span style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 99, padding: '5px 12px', fontSize: 12, color: T.burgundy, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <I.globe /> ES
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="eia-hero" style={{ background: T.rosePaper, borderBottom: `1px solid ${T.roseLight}` }}>
        <div className="eia-hero-copy" style={{ padding: '48px 44px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: `1px solid ${T.roseLight}` }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 99, background: '#fff', color: T.burgundy, fontSize: 11, fontWeight: 600, letterSpacing: 0.4, marginBottom: 18, border: `1px solid ${T.roseLight}` }}>
            <span style={{ width: 6, height: 6, background: T.rose, borderRadius: 99 }} /> Herramienta · v{VERSION} · 9 dimensiones
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 1.02, margin: '0 0 16px', letterSpacing: -1.5, color: T.ink }}>
            Evaluación de<br /><em style={{ color: T.burgundy }}>impacto</em> algorítmico.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: T.ink60, margin: '0 0 32px', maxWidth: 460 }}>
            Identifica riesgos éticos desde una mirada técnica, legal y de gestión, y recibe recomendaciones de mitigación personalizadas para tu proyecto de IA.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            {WHY_CARDS.map((card, ci) => (
              <div key={ci} style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: T.rosePaper, color: T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <card.icon />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{card.q}</div>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {card.items.map((item, ii) => (
                    <li key={ii} style={{ fontSize: 12.5, color: T.ink60, lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 10px', background: `radial-gradient(circle at 50% 50%, ${T.rosePaper} 0%, #fff 75%)` }}>
          <DimensionGraph />
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ padding: '28px 40px', background: '#fff', borderBottom: `1px solid ${T.roseLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 860, flexWrap: 'wrap', gap: '10px 0' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: i === 0 ? T.burgundy : T.rosePaper, color: i === 0 ? '#fff' : T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.ink80, whiteSpace: 'nowrap' }}>{s[1]}</div>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: T.roseLight, margin: '0 14px', minWidth: 20 }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + notices ── */}
      <section className="eia-form-grid" style={{ padding: '32px 40px', background: T.rosePaper, flex: 1 }}>

        <form onSubmit={handleStart} style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 16, padding: '26px 28px', alignSelf: 'start' }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Comienza tu evaluación</div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="email" style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 5 }}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              placeholder="nombre@ejemplo.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 8 }}>¿Desde dónde participas?</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ORIGIN_OPTIONS.map(op => (
                <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${origin === op ? T.burgundy : T.roseLight}`, background: origin === op ? T.rosePaper : '#fff', cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="origin"
                    value={op}
                    checked={origin === op}
                    onChange={() => setOrigin(op)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span aria-hidden style={{ width: 16, height: 16, borderRadius: 99, border: `1.5px solid ${origin === op ? T.burgundy : T.ink40}`, background: origin === op ? T.burgundy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {origin === op && <span style={{ width: 6, height: 6, borderRadius: 99, background: '#fff' }} />}
                  </span>
                  {op}
                </label>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, cursor: 'pointer', fontSize: 12.5, color: T.ink60, lineHeight: 1.5 }}>
            <input
              type="checkbox"
              checked={subscribe}
              onChange={e => setSubscribe(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <span aria-hidden style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${subscribe ? T.burgundy : T.ink40}`, background: subscribe ? T.burgundy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, color: '#fff' }}>
              {subscribe && <I.check width={10} height={10} />}
            </span>
            Acepto recibir novedades del proyecto y de la herramienta.
          </label>

          <button
            type="submit"
            disabled={starting}
            style={{ width: '100%', background: T.burgundy, color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: starting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', letterSpacing: 0.5, opacity: starting ? 0.7 : 1 }}
          >
            {starting ? 'INICIANDO…' : <>INICIAR EVALUACIÓN <I.arrow /></>}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: T.rosePaper, color: T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.users /></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.burgundy }}>Mejor en equipo</div>
            </div>
            <p style={{ fontSize: 13, color: T.ink80, margin: 0, lineHeight: 1.6 }}>
              Recomendamos completarla con personas de <strong>tecnología, legal, comunicaciones</strong> y <strong>servicio ciudadano</strong> relacionadas con el proyecto.
            </p>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: T.burgundy }}>
              <I.lock />
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Privacidad</div>
            </div>
            <p style={{ fontSize: 12.5, color: T.ink60, margin: 0, lineHeight: 1.6 }}>
              Tus respuestas se procesan localmente en tu navegador y no se almacenan en la plataforma. La información del formulario se usa únicamente para enviarte los resultados y novedades del proyecto, y con fines estadísticos anonimizados. Tu información nunca se divulga ni se comparte con terceros.
            </p>
            <Link href="/privacidad" style={{ marginTop: 10, fontSize: 12, color: T.burgundy, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              Leer política completa <I.arrow />
            </Link>
          </div>

          <div style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontFamily: MONO, letterSpacing: 1, color: T.ink60, marginBottom: 6 }}>EXENCIÓN DE RESPONSABILIDAD</div>
            <p style={{ fontSize: 12, color: T.ink60, margin: 0, lineHeight: 1.6 }}>
              Esta herramienta es un apoyo para dimensionar riesgos algorítmicos en el sector público. No constituye una certificación ni garantía de cumplimiento legal o ético por parte de la Universidad Adolfo Ibáñez. Para participar como Experiencia Destacada, visita{' '}
              <a href="https://algoritmospublicos.cl/quiero_participar" target="_blank" rel="noopener noreferrer" style={{ color: T.burgundy, fontWeight: 600, textDecoration: 'none' }}>algoritmospublicos.cl/quiero_participar</a>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '14px 40px', background: T.ink, color: 'rgba(255,255,255,.75)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span>Desarrollado por <strong style={{ color: '#fff' }}>GobLab UAI</strong> · Escuela de Gobierno UAI</span>
        <span style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>ANID IT25I0161</span>
      </footer>

      <FeedbackPill context={{ pantalla: 'portada' }} defaultEmail={email} />

      <style jsx>{`
        .eia-hero {
          display: grid;
          grid-template-columns: minmax(360px, 1fr) minmax(560px, 1.2fr);
        }
        .eia-form-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 28px;
        }
        @media (max-width: 1100px) {
          .eia-hero { grid-template-columns: 1fr; }
          .eia-hero-copy { border-right: none !important; }
          .eia-form-grid { grid-template-columns: 1fr; }
        }
        /* Con el logo institucional envuelto, el separador vertical sobra. */
        @media (max-width: 560px) {
          .eia-logo-sep { display: none; }
        }
      `}</style>
    </div>
  )
}
