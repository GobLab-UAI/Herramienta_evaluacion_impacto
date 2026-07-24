'use client'

/**
 * Encuesta de satisfacción (Fase 6). Reemplaza el formulario de la pestaña
 * "Evalúa esta herramienta". Escalas Likert 1-7, sí/no, texto abierto y campos
 * condicionales; se envía por sendFeedback serializando todo en `description`.
 */

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { T, MONO, inputBase } from '@/lib/civic'
import { I } from '@/components/civic-icons'
import { sendSurvey } from '@/lib/feedback'
import { trackFeedbackSubmit } from '@/lib/analytics'
import { SURVEY, type SurveyItem } from '@/data/survey'

type Answers = Record<string, string>

export function SatisfactionSurvey({ email, progreso, onSent, embedded = false }: {
  email?: string
  progreso: number
  /** Se dispara tras un envío exitoso (para marcarla como respondida). */
  onSent?: () => void
  /** true dentro del modal: omite el encabezado y el ancho máximo propios. */
  embedded?: boolean
}) {
  const [ans, setAns] = useState<Answers>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (id: string, v: string) => setAns(prev => ({ ...prev, [id]: v }))

  // Al menos una escala respondida para poder enviar.
  const puedeEnviar = SURVEY.some(q => q.kind === 'scale' && ans[q.id])

  const submit = async () => {
    if (!puedeEnviar) return
    setSending(true)
    try {
      // Serializa cada respuesta como "id. pregunta → valor" para que quede
      // legible en la tabla de feedback sin columnas nuevas.
      const lineas = SURVEY.flatMap(q => {
        const v = ans[q.id]
        if (q.kind === 'scale') return v ? [`P${q.id} [${v}/7] ${q.pregunta}`] : []
        if (q.kind === 'text') return v?.trim() ? [`P${q.id} ${q.pregunta}\n  ${v.trim()}`] : []
        if (q.kind === 'yesno') return v ? [`P${q.id} ${q.pregunta} → ${v}`] : []
        if (q.kind === 'yesno_text') {
          if (!v) return []
          const extra = ans[`${q.id}_text`]?.trim()
          return [`P${q.id} ${q.pregunta} → ${v}${extra ? `\n  ${extra}` : ''}`]
        }
        if (q.kind === 'yesno_contact') {
          if (!v) return []
          const c = [ans[`${q.id}_nombre`], ans[`${q.id}_apellido`], ans[`${q.id}_correo`]].filter(Boolean).join(' · ')
          return [`P${q.id} ${q.pregunta} → ${v}${c ? `\n  contacto: ${c}` : ''}`]
        }
        return []
      })
      await sendSurvey({
        respuestas: ans,
        texto: `ENCUESTA DE SATISFACCIÓN\n${lineas.join('\n')}`,
        email,
        progreso,
      })
      trackFeedbackSubmit('encuesta', 'resultados')
      setSent(true)
      onSent?.()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'No se pudo enviar',
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{ gridColumn: '1/-1', background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 16, padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🌸</div>
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: 32, letterSpacing: -0.8, margin: '0 0 12px', color: T.burgundy }}>¡Gracias por tu evaluación!</h2>
        <p style={{ fontSize: 15, color: T.ink60, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          Tus respuestas nos ayudan a mejorar la herramienta para todos los equipos del sector público.
        </p>
      </div>
    )
  }

  return (
    <div style={embedded ? undefined : { gridColumn: '1/-1', maxWidth: 720 }}>
      {!embedded && (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: T.burgundy, marginBottom: 12 }}>PASO 4 DE 4</div>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: 34, letterSpacing: -0.8, margin: '0 0 12px', lineHeight: 1.1 }}>
            Evalúa esta<br /><em style={{ color: T.burgundy }}>herramienta</em>.
          </h2>
          <p style={{ fontSize: 14, color: T.ink60, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 520 }}>
            Tu opinión es clave para mejorar la EIA. Toma menos de dos minutos.
          </p>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {SURVEY.map(q => <Question key={q.id} q={q} ans={ans} set={set} />)}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!puedeEnviar || sending}
        style={{ width: '100%', maxWidth: 360, marginTop: 28, background: puedeEnviar ? T.burgundy : T.ink20, color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, cursor: puedeEnviar && !sending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', transition: 'background .2s' }}
      >
        {sending ? 'Enviando…' : <>Enviar evaluación <I.arrow /></>}
      </button>
    </div>
  )
}

/* ── Una pregunta según su tipo ──────────────────────────────────── */
function Question({ q, ans, set }: { q: SurveyItem; ans: Record<string, string>; set: (id: string, v: string) => void }) {
  const val = ans[q.id]
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.45, marginBottom: q.tooltip ? 4 : 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.burgundy, marginRight: 6 }}>{q.id}</span>{q.pregunta}
      </div>
      {q.tooltip && <p style={{ fontSize: 12, color: T.ink60, lineHeight: 1.5, margin: '0 0 12px' }}>{q.tooltip}</p>}

      {q.kind === 'scale' && (
        <>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(n => {
              const on = val === String(n)
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => set(q.id, String(n))}
                  aria-label={`${n} de 7`}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: `1.5px solid ${on ? T.burgundy : T.roseLight}`, background: on ? T.burgundy : '#fff', color: on ? '#fff' : T.ink60, fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 18, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
                >{n}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: T.ink60, gap: 12 }}>
            <span>{q.min}</span>
            <span style={{ textAlign: 'right' }}>{q.max}</span>
          </div>
        </>
      )}

      {(q.kind === 'yesno' || q.kind === 'yesno_text' || q.kind === 'yesno_contact') && (
        <div style={{ display: 'flex', gap: 20 }}>
          {['Sí', 'No'].map(op => {
            const on = val === op
            return (
              <label key={op} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: T.ink }}>
                <input type="radio" name={`sv-${q.id}`} checked={on} onChange={() => set(q.id, op)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <span aria-hidden style={{ width: 18, height: 18, borderRadius: 99, flexShrink: 0, border: `1.5px solid ${on ? T.burgundy : T.ink40}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <span style={{ width: 8, height: 8, borderRadius: 99, background: T.burgundy }} />}
                </span>
                {op}
              </label>
            )
          })}
        </div>
      )}

      {q.kind === 'text' && (
        <textarea
          value={val || ''}
          onChange={e => set(q.id, e.target.value)}
          placeholder={q.placeholder}
          style={{ ...inputBase, minHeight: 84, resize: 'vertical', background: T.rosePaper }}
        />
      )}

      {q.kind === 'yesno_text' && val === 'Sí' && (
        <textarea
          value={ans[`${q.id}_text`] || ''}
          onChange={e => set(`${q.id}_text`, e.target.value)}
          placeholder={q.placeholder}
          style={{ ...inputBase, minHeight: 72, resize: 'vertical', background: T.rosePaper, marginTop: 12 }}
        />
      )}

      {q.kind === 'yesno_contact' && val === 'Sí' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <input value={ans[`${q.id}_nombre`] || ''} onChange={e => set(`${q.id}_nombre`, e.target.value)} placeholder="Nombre" style={inputBase} />
          <input value={ans[`${q.id}_apellido`] || ''} onChange={e => set(`${q.id}_apellido`, e.target.value)} placeholder="Apellido" style={inputBase} />
          <input type="email" value={ans[`${q.id}_correo`] || ''} onChange={e => set(`${q.id}_correo`, e.target.value)} placeholder="Correo electrónico" style={{ ...inputBase, gridColumn: '1/-1' }} />
        </div>
      )}
    </div>
  )
}
