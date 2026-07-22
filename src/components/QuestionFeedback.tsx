'use client'

/**
 * Patrón 03 del proyecto de Design: micro-widget de feedback bajo cada
 * pregunta. Un click para levantar la mano, sin interrumpir el flujo.
 *
 * 👍 se registra sólo como evento GA4 — crear una fila en Supabase por cada
 * pulgar arriba llenaría la tabla de filas sin texto accionable. 👎 abre el
 * panel de motivos y sí persiste cuando se envía.
 */

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { T, MONO, inputBase } from '@/lib/civic'
import { I } from '@/components/civic-icons'
import { sendFeedback, FEEDBACK_TYPES, type FeedbackContext } from '@/lib/feedback'
import { trackQuestionFeedback, trackFeedbackSubmit } from '@/lib/analytics'

export type FlagState = 'up' | 'down'

/** Motivo → categoría con la que se guarda en la tabla. */
const REASONS: Array<{ label: string; category: string }> = [
  { label: 'No entiendo un término', category: FEEDBACK_TYPES.pregunta },
  { label: 'Faltan opciones', category: FEEDBACK_TYPES.sugerencia },
  { label: 'No aplica a mi caso', category: FEEDBACK_TYPES.comentario },
  { label: 'Hay un error', category: FEEDBACK_TYPES.error },
  { label: 'Otro', category: FEEDBACK_TYPES.otro },
]

export function QuestionFeedback({ questionId, context, flag, onFlag, email }: {
  questionId: string
  context: FeedbackContext
  flag?: FlagState
  onFlag: (state: FlagState | undefined) => void
  email?: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0].label)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const thumb = (up: boolean) => {
    const next: FlagState = up ? 'up' : 'down'
    const cleared = flag === next
    onFlag(cleared ? undefined : next)
    if (!cleared) {
      trackQuestionFeedback(questionId, up)
      if (!up) setOpen(true)
    } else if (!up) {
      setOpen(false)
    }
  }

  const submit = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      const category = REASONS.find(r => r.label === reason)?.category || FEEDBACK_TYPES.comentario
      await sendFeedback({
        category,
        text: `${reason}: ${text.trim()}`,
        email,
        context,
      })
      trackFeedbackSubmit(category, 'cuestionario/pregunta')
      toast({ title: 'Comentario enviado', description: 'Gracias, nos ayuda a mejorar esta pregunta.' })
      setOpen(false)
      setText('')
      onFlag('down')
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

  const thumbBtn = (up: boolean) => {
    const active = flag === (up ? 'up' : 'down')
    return (
      <button
        type="button"
        onClick={() => thumb(up)}
        aria-label={up ? 'La pregunta fue clara' : 'La pregunta no fue clara'}
        aria-pressed={active}
        style={{
          width: 30, height: 26, borderRadius: 6, cursor: 'pointer',
          border: `1px solid ${active ? T.burgundy : T.roseLight}`,
          background: active ? T.burgundy : '#fff',
          color: active ? '#fff' : T.ink60,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
        }}
      >
        <span style={{ display: 'inline-flex', transform: up ? undefined : 'rotate(180deg)' }}>
          <I.thumb />
        </span>
      </button>
    )
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, background: T.paperDeep, fontSize: 12, color: T.ink60, flexWrap: 'wrap' }}>
        <span>¿Esta pregunta fue clara?</span>
        <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
          {thumbBtn(true)}
          {thumbBtn(false)}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{ padding: '0 10px', height: 26, borderRadius: 6, border: `1px solid ${T.roseLight}`, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: T.ink80, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <I.chat /> comentar
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '16px 18px', marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ color: T.burgundy, display: 'inline-flex' }}><I.flag /></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.burgundy }}>¿Qué no funcionó?</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink60, border: `1px solid ${T.roseLight}`, cursor: 'pointer' }}
            >
              <I.close width={11} height={11} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {REASONS.map(r => {
              const on = reason === r.label
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setReason(r.label)}
                  style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${on ? T.burgundy : T.roseLight}`,
                    background: on ? T.burgundy : '#fff',
                    color: on ? '#fff' : T.ink80,
                    transition: 'all .15s',
                  }}
                >{r.label}</button>
              )
            })}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Cuéntanos qué pasó con esta pregunta…"
            style={{ ...inputBase, background: '#fff', minHeight: 66, resize: 'vertical', marginBottom: 10, fontSize: 13 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: T.ink60, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <I.lock width={11} height={11} /> Se guarda con el ID de la pregunta, sin tus respuestas.
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim() || sending}
              style={{
                background: text.trim() ? T.burgundy : T.ink20, color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
              }}
            >
              {sending ? 'Enviando…' : <>Enviar <I.arrow /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Rótulo que acompaña al número de una pregunta marcada. */
export function FlaggedLabel() {
  return (
    <span style={{ color: T.warn, marginLeft: 8, fontFamily: MONO, fontSize: 10, letterSpacing: 0.5 }}>
      · MARCADA POR TI
    </span>
  )
}
