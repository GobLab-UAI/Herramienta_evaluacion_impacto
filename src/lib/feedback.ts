/**
 * Envío de feedback con contexto.
 *
 * La tabla `tool_feedback` de Supabase solo tiene las columnas
 * tool / feedback_type / description / email / organization, y
 * `src/app/api/feedback/route.ts` reconstruye el body a mano descartando
 * cualquier campo extra. Por eso el contexto (sección, pregunta, progreso)
 * se empotra como una primera línea del propio `description`, en un formato
 * estable para poder parsearlo después.
 */

export type FeedbackContext = {
  /** 'portada' | 'cuestionario' | 'resultados' */
  pantalla?: string
  /** Ej. '06 Protección de datos' */
  seccion?: string
  /** Numeración visible, ej. '6.2' */
  pregunta?: string
  /** Id interno, ej. 'q31' */
  questionId?: string
  /** Porcentaje 0–100 */
  progreso?: number
}

/** Categorías que ya acepta la tabla. La UI puede rotularlas distinto. */
export const FEEDBACK_TYPES = {
  comentario: 'Comentario general',
  error: 'Reporte de error',
  sugerencia: 'Sugerencia de mejora',
  pregunta: 'Pregunta',
  otro: 'Otro',
} as const

/**
 * Antepone una línea de contexto al texto. Omite las claves ausentes y
 * devuelve el texto tal cual si no hay nada que anteponer.
 */
export function buildDescription(text: string, ctx?: FeedbackContext): string {
  if (!ctx) return text

  const parts: string[] = []
  if (ctx.pantalla) parts.push(`pantalla: ${ctx.pantalla}`)
  if (ctx.seccion) parts.push(`sección: ${ctx.seccion}`)
  if (ctx.pregunta) {
    parts.push(`pregunta: ${ctx.pregunta}${ctx.questionId ? ` (${ctx.questionId})` : ''}`)
  } else if (ctx.questionId) {
    parts.push(`pregunta: ${ctx.questionId}`)
  }
  if (typeof ctx.progreso === 'number') parts.push(`progreso: ${Math.round(ctx.progreso)}%`)

  if (!parts.length) return text
  return `[${parts.join(' · ')}]\n${text}`
}

/**
 * Publica el feedback. Lanza si la API responde error, para que cada
 * llamador decida cómo avisar (toast, estado inline, etc.).
 */
export async function sendFeedback(opts: {
  category: string
  text: string
  email?: string
  organization?: string
  context?: FeedbackContext
}): Promise<void> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedback_type: opts.category,
      // El contexto va incrustado en el texto (legible en la tabla) y además
      // como objeto, para que la API lo guarde en columnas consultables.
      description: buildDescription(opts.text, opts.context),
      email: opts.email || 'anonimo@goblab.cl',
      organization: opts.organization || '',
      context: opts.context ?? null,
    }),
  })

  const data = await res.json().catch(() => ({ success: false, error: 'Respuesta inválida' }))
  if (!data.success) throw new Error(data.error || 'No se pudo enviar el feedback')
}

/**
 * Envía la encuesta de satisfacción a `tool_survey`, con una columna por
 * pregunta. `texto` es la versión legible que la API usa como respaldo si la
 * tabla todavía no existe.
 */
export async function sendSurvey(opts: {
  respuestas: Record<string, string>
  texto: string
  email?: string
  progreso?: number
}): Promise<void> {
  const res = await fetch('/api/survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      respuestas: opts.respuestas,
      texto: opts.texto,
      email: opts.email || null,
      progreso: opts.progreso,
    }),
  })

  const data = await res.json().catch(() => ({ success: false, error: 'Respuesta inválida' }))
  if (!data.success) throw new Error(data.error || 'No se pudo enviar la encuesta')
}
