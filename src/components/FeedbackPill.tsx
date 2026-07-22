'use client'

/**
 * Patrón 01 del proyecto de Design: pill flotante + modal contextual.
 * Al abrirse muestra el contexto capturado (pantalla, sección, pregunta,
 * progreso) para que el comentario llegue situado.
 */

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { T, MONO, inputBase } from '@/lib/civic'
import { I } from '@/components/civic-icons'
import { sendFeedback, FEEDBACK_TYPES, type FeedbackContext } from '@/lib/feedback'
import { trackFeedbackSubmit } from '@/lib/analytics'

const CHIPS: Array<{ label: string; value: string }> = [
  { label: '💬 Comentario', value: FEEDBACK_TYPES.comentario },
  { label: '🐛 Error', value: FEEDBACK_TYPES.error },
  { label: '💡 Sugerencia', value: FEEDBACK_TYPES.sugerencia },
  { label: '❓ Pregunta', value: FEEDBACK_TYPES.pregunta },
]

export function FeedbackPill({ context, defaultEmail = '', bottom = 20 }: {
  context: FeedbackContext
  defaultEmail?: string
  /** Separación desde el borde inferior. Súbela para no tapar una barra fija. */
  bottom?: number
}) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>(FEEDBACK_TYPES.comentario)
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [sending, setSending] = useState(false)

  // Sólo `pantalla` no amerita mostrar el bloque: no le dice nada al usuario.
  const contextRows: Array<[string, string]> = []
  if (context.seccion) contextRows.push(['Sección', context.seccion])
  if (context.pregunta) contextRows.push(['Pregunta', context.pregunta])
  if (typeof context.progreso === 'number') contextRows.push(['Progreso', `${Math.round(context.progreso)}%`])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await sendFeedback({
        category,
        text: text.trim(),
        email: email.trim() || defaultEmail,
        organization: organization.trim(),
        context,
      })
      trackFeedbackSubmit(category, context.pantalla || 'desconocida')
      toast({ title: 'Feedback enviado', description: '¡Gracias! Lo revisaremos.' })
      setOpen(false)
      setText('')
      setEmail('')
      setOrganization('')
      setCategory(FEEDBACK_TYPES.comentario)
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom, right: 20, zIndex: 90,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff', color: T.burgundy, padding: '10px 16px',
          borderRadius: 99, boxShadow: '0 8px 28px rgba(0,0,0,.14)',
          fontSize: 13, fontWeight: 600, border: `1px solid ${T.roseLight}`,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <I.chat /> Enviar feedback
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={submit}
            style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: MONO, letterSpacing: 1.5, color: T.burgundy }}>COMENTAR</div>
                <div style={{ fontSize: 19, fontWeight: 600, marginTop: 4 }}>Tu opinión mejora la herramienta</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{ width: 26, height: 26, border: `1px solid ${T.roseLight}`, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink60, background: '#fff', cursor: 'pointer', flexShrink: 0 }}
              >
                <I.close width={13} height={13} />
              </button>
            </div>

            {contextRows.length > 0 && (
              <div style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 8, padding: '10px 12px', fontSize: 11, marginBottom: 16 }}>
                <div style={{ fontFamily: MONO, letterSpacing: 1, color: T.burgundy, marginBottom: 4 }}>CONTEXTO CAPTURADO</div>
                <div style={{ color: T.ink80, lineHeight: 1.7 }}>
                  {contextRows.map(([k, v]) => (
                    <div key={k}>{k}: <strong>{v}</strong></div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Tipo de feedback</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {CHIPS.map(chip => {
                const on = category === chip.value
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setCategory(chip.value)}
                    style={{
                      padding: '6px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1px solid ${on ? T.burgundy : T.roseLight}`,
                      background: on ? T.burgundy : 'transparent',
                      color: on ? '#fff' : T.ink80,
                      transition: 'all .15s',
                    }}
                  >{chip.label}</button>
                )
              })}
            </div>

            <label htmlFor="fbp-text" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>¿Qué pasó?</label>
            <textarea
              id="fbp-text"
              value={text}
              onChange={e => setText(e.target.value)}
              required
              placeholder="Cuéntanos qué no quedó claro o qué mejorarías…"
              style={{ ...inputBase, minHeight: 88, resize: 'vertical', marginBottom: 14 }}
            />

            <div style={{ fontSize: 11, color: T.ink60, marginBottom: 10, lineHeight: 1.5 }}>
              Opcional: <strong>correo</strong> si quieres que te respondamos. No lo usaremos para otro fin.
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={defaultEmail || 'correo@ejemplo.cl'}
              maxLength={150}
              style={{ ...inputBase, marginBottom: 10 }}
            />
            <input
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="Organización (opcional)"
              maxLength={150}
              style={{ ...inputBase, marginBottom: 16 }}
            />

            <button
              type="submit"
              disabled={!text.trim() || sending}
              style={{
                width: '100%', background: text.trim() ? T.burgundy : T.ink20, color: '#fff',
                border: 'none', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700,
                cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'background .2s',
              }}
            >
              {sending ? 'Enviando…' : <>Enviar <I.arrow /></>}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
