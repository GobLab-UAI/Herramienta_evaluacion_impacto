#!/usr/bin/env node
/**
 * Verifica la persistencia en Supabase de la encuesta y del feedback,
 * usando la misma conexión que la app (SUPABASE_URL / SUPABASE_ANON_KEY
 * de .env.local, vía la REST API de PostgREST).
 *
 *   node scripts/eia-gen/check-supabase.mjs            # solo lee
 *   node scripts/eia-gen/check-supabase.mjs --write    # además inserta pruebas
 *
 * Con --write escribe filas de prueba marcadas con el correo
 * verificacion@goblab.test, fáciles de borrar después.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const WRITE = process.argv.includes('--write')
const APP = process.env.APP_URL || 'http://localhost:3000'
const MARCA = 'verificacion@goblab.test'

// ── Cargar credenciales igual que la app (.env.local) ────────────────
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trimStart().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const URL_ = env.SUPABASE_URL
const KEY = env.SUPABASE_ANON_KEY
if (!URL_ || !KEY) { console.error('Faltan SUPABASE_URL / SUPABASE_ANON_KEY'); process.exit(1) }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const ok = s => `\x1b[32m${s}\x1b[0m`
const bad = s => `\x1b[31m${s}\x1b[0m`

async function existeTabla(tabla) {
  const r = await fetch(`${URL_}/rest/v1/${tabla}?select=*&limit=1`, { headers: H })
  return { existe: r.ok, status: r.status, detalle: r.ok ? null : await r.text() }
}

async function columnas(tabla) {
  const r = await fetch(`${URL_}/rest/v1/${tabla}?select=*&limit=1`, { headers: H })
  if (!r.ok) return []
  const filas = await r.json()
  return filas.length ? Object.keys(filas[0]) : []
}

/**
 * Devuelve el número de filas, o null si RLS bloquea el SELECT para anon
 * (PostgREST responde content-range "*&#47;0" cuando no hay política de lectura).
 */
async function contar(tabla, filtro = '') {
  const r = await fetch(`${URL_}/rest/v1/${tabla}?select=id${filtro}`, {
    headers: { ...H, Prefer: 'count=exact', Range: '0-0' },
  })
  const cr = r.headers.get('content-range') || '*/0'
  if (cr.startsWith('*/')) return null      // lectura bloqueada por RLS
  return Number(cr.split('/')[1] || 0)
}

/**
 * Prueba que la tabla acepta inserciones y valida el esquema, sin depender
 * de poder leer: usa un valor fuera del CHECK (debe rechazarlo) y uno válido
 * (debe aceptarlo). Es la forma de verificar cuando RLS impide el SELECT.
 */
async function probarEscritura(tabla, filaValida, filaInvalida) {
  const post = (fila, prefer = 'return=minimal') =>
    fetch(`${URL_}/rest/v1/${tabla}`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: prefer },
      body: JSON.stringify(fila),
    })
  const mala = await post(filaInvalida)
  const buena = await post(filaValida)
  return {
    rechazaInvalida: !mala.ok,
    aceptaValida: buena.status === 201,
    detalleMala: mala.ok ? null : (await mala.json().catch(() => ({}))).code,
  }
}

console.log(`\nSupabase: ${URL_}`)
console.log(`App:      ${APP}\n`)

// ── 1. ¿Existe la migración? ─────────────────────────────────────────
console.log('1) Estructura')
const survey = await existeTabla('tool_survey')
console.log(`   tool_survey            ${survey.existe ? ok('existe') : bad('NO existe')}`)
if (!survey.existe) {
  console.log(`      ${survey.detalle?.slice(0, 120)}`)
  console.log('      → falta correr supabase/migrations/001_tool_survey.sql')
}

const colsFb = await columnas('tool_feedback')
const nuevas = ['pantalla', 'seccion', 'pregunta', 'question_id', 'progreso']
const faltan = nuevas.filter(c => !colsFb.includes(c))
console.log(`   tool_feedback contexto ${faltan.length === 0 ? ok('completo') : bad('faltan: ' + faltan.join(', '))}`)

const antesSurvey = survey.existe ? await contar('tool_survey') : 0
const antesFb = await contar('tool_feedback')
const fmt = n => (n === null ? 'lectura bloqueada por RLS (solo escritura)' : n)
console.log(`\n2) Filas actuales`)
console.log(`   tool_survey    ${fmt(antesSurvey)}`)
console.log(`   tool_feedback  ${fmt(antesFb)}`)

if (!WRITE) {
  console.log('\n(sin --write: no se insertó nada)\n')
  process.exit(0)
}

// ── 3. Insertar por las rutas de la app ──────────────────────────────
console.log(`\n3) Envíos de prueba por las rutas de la app`)

const rSurvey = await fetch(`${APP}/api/survey`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: MARCA, progreso: 87,
    respuestas: {
      '2': '7', '3': '6', '4': '5', '5': '7', '6': '6', '7': '5',
      '8': 'Sí', '9': 'Sí', '9_text': 'Faltó el presupuesto del proyecto',
      '10': 'Muy buena herramienta', '11': 'Sí',
      '11_nombre': 'Ana', '11_apellido': 'Pérez', '11_correo': 'ana@ejemplo.cl',
    },
    texto: 'ENCUESTA DE SATISFACCIÓN (verificación)',
  }),
}).then(r => r.json()).catch(e => ({ success: false, error: String(e) }))
console.log(`   POST /api/survey   ${rSurvey.success ? ok('success') : bad('FALLÓ')}` +
  (rSurvey.success ? `  structured=${rSurvey.structured ? ok('true') : bad('false')}` : `  ${rSurvey.error}`))

const rFb = await fetch(`${APP}/api/feedback`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedback_type: 'Reporte de error',
    description: '[pantalla: cuestionario · sección: 06 Protección de datos · pregunta: 6.2 (q27) · progreso: 42%]\nverificación de contexto',
    email: MARCA,
    context: { pantalla: 'cuestionario', seccion: '06 Protección de datos', pregunta: '6.2', questionId: 'q27', progreso: 42 },
  }),
}).then(r => r.json()).catch(e => ({ success: false, error: String(e) }))
console.log(`   POST /api/feedback ${rFb.success ? ok('success') : bad('FALLÓ ' + rFb.error)}`)

// ── 4. Leer de vuelta lo insertado ───────────────────────────────────
console.log(`\n4) Lectura de verificación`)

if (survey.existe) {
  const r = await fetch(
    `${URL_}/rest/v1/tool_survey?email=eq.${encodeURIComponent(MARCA)}&order=created_at.desc&limit=1`,
    { headers: H })
  const [fila] = await r.json()
  if (fila) {
    console.log(`   tool_survey ${ok('fila encontrada')}`)
    const escalas = ['p2_facilidad_uso', 'p3_orientacion', 'p4_participacion', 'p5_adecuacion', 'p6_lenguaje', 'p7_recomendaciones']
    console.log(`      escalas: ${escalas.map(c => `${c.split('_')[0]}=${fila[c]}`).join(' ')}`)
    console.log(`      p8=${fila.p8_recomendaria}  p9=${fila.p9_falta_tema}  progreso=${fila.progreso}`)
    console.log(`      contacto:   ${fila.p11_nombre} ${fila.p11_apellido} <${fila.p11_correo}>`)
  } else if (antesSurvey === null) {
    // RLS impide leer (la tabla es solo de escritura para anon). Verificamos
    // por comportamiento: el CHECK debe rechazar una escala fuera de rango.
    const p = await probarEscritura('tool_survey',
      { tool: 'evaluacion de impacto', email: MARCA, p2_facilidad_uso: 7 },
      { tool: 'evaluacion de impacto', email: MARCA, p2_facilidad_uso: 9 })
    console.log(`   tool_survey ${ok('escribe correctamente')} (lectura bloqueada por RLS, esperado)`)
    console.log(`      ${p.rechazaInvalida ? ok('rechaza escala fuera de rango 1-7') : bad('NO valida el rango')} (${p.detalleMala})`)
    console.log(`      ${p.aceptaValida ? ok('acepta fila válida (201)') : bad('rechaza fila válida')}`)
    console.log(`      → para leer los datos usa el panel de Supabase (service role)`)
  } else console.log(`   tool_survey ${bad('no se encontró la fila')}`)
}

const rf = await fetch(
  `${URL_}/rest/v1/tool_feedback?email=eq.${encodeURIComponent(MARCA)}&order=created_at.desc&limit=1`,
  { headers: H })
const [ffila] = await rf.json()
if (ffila) {
  console.log(`   tool_feedback ${ok('fila encontrada')}`)
  if (faltan.length === 0) {
    const okCtx = ffila.question_id === 'q27' && ffila.progreso === 42
    console.log(`      pantalla=${ffila.pantalla} seccion="${ffila.seccion}" pregunta=${ffila.pregunta} question_id=${ffila.question_id} progreso=${ffila.progreso}`)
    console.log(`      ${okCtx ? ok('contexto guardado en columnas') : bad('contexto NO coincide')}`)
  }
} else console.log(`   tool_feedback ${bad('no se encontró la fila')}`)

// ── 5. Conteo final ──────────────────────────────────────────────────
const despuesSurvey = survey.existe ? await contar('tool_survey') : 0
const despuesFb = await contar('tool_feedback')
const delta = (a, b) => (a === null || b === null ? '' : `  (+${b - a})`)
console.log(`\n5) Conteo`)
console.log(`   tool_survey    ${fmt(antesSurvey)} → ${fmt(despuesSurvey)}${delta(antesSurvey, despuesSurvey)}`)
console.log(`   tool_feedback  ${fmt(antesFb)} → ${fmt(despuesFb)}${delta(antesFb, despuesFb)}`)
console.log(`\nLimpieza: borra las filas con email = ${MARCA}\n`)
