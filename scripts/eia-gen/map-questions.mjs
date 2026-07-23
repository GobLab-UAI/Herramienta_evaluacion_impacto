#!/usr/bin/env node
/**
 * Mapea las filas del libro "EIA Gen (Hito1)" a los ids de pregunta del código.
 *
 * Isidora numera las filas por POSICIÓN VISIBLE (1.1, 6.2, …) y esa numeración
 * se desplaza según qué condicionales estén colapsadas: el doc "6,2" es q27, la
 * cuarta pregunta de su dimensión. Por eso el cruce se hace por TEXTO del
 * enunciado, nunca por número.
 *
 *   node scripts/eia-gen/map-questions.mjs
 *
 * Salidas:
 *   docs/eia-gen/mapeo.csv    cruce fila-documento → id de pregunta
 *   docs/eia-gen/estado.csv   semilla del seguimiento (columna Estado del Sheet)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DOC = resolve(ROOT, 'docs/eia-gen/eia_gen_hito1.md')
const SRC = resolve(ROOT, 'src/components/evaluacion-impacto-mejorada.tsx')

/** Umbrales de aceptación automática. Por debajo, la fila se marca REVISAR. */
const MIN_SIM = 0.90
const MIN_MARGEN = 0.08

/** Orden de las tablas del libro. La 1 es la bifurcación; la 12 es la encuesta. */
const HOJAS = [
  'BIF',
  'General', 'Proporcionalidad', 'Normativa', 'Licencia Social', 'Gobernanza',
  'Protección de datos', 'Ciberseguridad', 'Equidad', 'Transparencia',
  'Rendición de cuentas', 'Sostenibilidad',
  'Encuesta',
]

const norm = s => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

/** Similitud por bigramas de caracteres (Sørensen–Dice). */
function similar(a, b) {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const grams = s => {
    const m = new Map()
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2)
      m.set(g, (m.get(g) || 0) + 1)
    }
    return m
  }
  const ga = grams(a), gb = grams(b)
  let hits = 0
  for (const [g, n] of ga) hits += Math.min(n, gb.get(g) || 0)
  return (2 * hits) / (a.length - 1 + b.length - 1)
}

// ── Preguntas del código ────────────────────────────────────────────
// Los ids NO son todos correlativos: hay sub-ids decimales (q28.1, q37.1,
// q39.1) para condicionales insertadas después. De ahí el `q[\d.]+`.
function leerPreguntas() {
  const src = readFileSync(SRC, 'utf8')
  const bloque = src.slice(
    src.indexOf('const questions: Question[] = ['),
    src.indexOf('const recommendations'),
  )
  const re = /id:\s*"(q[\d.]+)",\s*\n\s*text:\s*"((?:[^"\\]|\\.)*)",[\s\S]{0,140}?dimension:\s*"([^"]+)"/g
  const out = []
  for (const m of bloque.matchAll(re)) {
    out.push({ id: m[1], text: m[2], dim: m[3], n: norm(m[2]) })
  }
  return out
}

// ── Filas del documento ─────────────────────────────────────────────
function leerFilas() {
  const lineas = readFileSync(DOC, 'utf8').split('\n')
  const heads = []
  lineas.forEach((l, i) => { if (l.startsWith('| ID | Tipo |')) heads.push(i) })
  const lim = [...heads, lineas.length]

  const filas = []
  heads.forEach((h, k) => {
    const H = lineas[h].split('|').slice(1, -1).map(c => c.replace(/\\/g, '').trim())
    const idx = {
      tipo: H.indexOf('Tipo'),
      actual: H.indexOf('Contenido actual'),
      nuevo: H.findIndex(c => c.startsWith('Contenido nuevo')),
      accion: H.indexOf('Acción desarrollo'),
      cond: H.findIndex(c => c.startsWith('Condición')),
      fase: H.findIndex(c => c.includes('Fase')),
    }
    for (const l of lineas.slice(h + 2, lim[k + 1])) {
      const cs = l.split('|').slice(1, -1).map(c => c.replace(/\\/g, '').trim())
      if (cs.length < H.length) continue
      const id = cs[0]
      if (!id || id === ':-:') continue
      filas.push({
        hoja: HOJAS[k] ?? `tabla${k}`,
        docId: id,
        tipo: cs[idx.tipo] ?? '',
        actual: idx.actual >= 0 ? cs[idx.actual] : '',
        nuevo: idx.nuevo >= 0 ? cs[idx.nuevo] : '',
        accion: idx.accion >= 0 ? cs[idx.accion] : '',
        cond: idx.cond >= 0 ? cs[idx.cond] : '',
        fase: idx.fase >= 0 ? cs[idx.fase] : '',
      })
    }
  })
  return filas
}

const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`

// ── Cruce ───────────────────────────────────────────────────────────
const preguntas = leerPreguntas()
const filas = leerFilas()

const VACIO = new Set(['', '-', '--', 'No aplica'])
const mapeables = filas.filter(f =>
  f.tipo.startsWith('Label') && !/Agregar/i.test(f.accion) && !VACIO.has(f.actual))

const resultado = []
let ok = 0, revisar = 0
for (const f of mapeables) {
  const pool = preguntas.filter(q => q.dim === f.hoja)
  const cands = (pool.length ? pool : preguntas)
    .map(q => ({ q, s: similar(norm(f.actual), q.n) }))
    .sort((a, b) => b.s - a.s)

  const best = cands[0] ?? { q: null, s: 0 }
  const margen = best.s - (cands[1]?.s ?? 0)
  const auto = best.s >= MIN_SIM && margen >= MIN_MARGEN
  auto ? ok++ : revisar++

  resultado.push({
    ...f,
    qid: best.q?.id ?? '',
    sim: best.s.toFixed(3),
    margen: margen.toFixed(3),
    estado: auto ? 'OK' : 'REVISAR',
    textoCodigo: best.q?.text ?? '',
  })
}

writeFileSync(resolve(ROOT, 'docs/eia-gen/mapeo.csv'),
  ['hoja,doc_id,accion,qid,similitud,margen,revision,texto_doc,texto_codigo']
    .concat(resultado.map(r => [
      r.hoja, r.docId, r.accion, r.qid, r.sim, r.margen, r.estado, r.actual, r.textoCodigo,
    ].map(csv).join(',')))
    .join('\n') + '\n')

// Semilla del seguimiento: TODAS las filas del libro, en su orden original,
// para poder pegar la columna "Estado" de vuelta en el Sheet.
writeFileSync(resolve(ROOT, 'docs/eia-gen/estado.csv'),
  ['hoja,doc_id,tipo,accion,condicion,qid,estado,commit']
    .concat(filas.map(f => {
      const m = resultado.find(r => r.docId === f.docId && r.hoja === f.hoja && r.tipo === f.tipo)
      return [f.hoja, f.docId, f.tipo, f.accion, f.cond, m?.qid ?? '', 'pendiente', '']
        .map(csv).join(',')
    }))
    .join('\n') + '\n')

console.log(`preguntas en el código : ${preguntas.length}`)
console.log(`filas del libro        : ${filas.length}`)
console.log(`filas a mapear         : ${mapeables.length}`)
console.log(`  automáticas (OK)     : ${ok}`)
console.log(`  requieren revisión   : ${revisar}`)
if (revisar) {
  console.log('\nRevisar a mano:')
  for (const r of resultado.filter(x => x.estado === 'REVISAR')) {
    console.log(`  ${r.hoja} ${r.docId} -> ${r.qid || '(ninguna)'} sim=${r.sim} margen=${r.margen}`)
    console.log(`      doc:    ${r.actual.slice(0, 96)}`)
    console.log(`      código: ${r.textoCodigo.slice(0, 96)}`)
  }
}
console.log('\nescritos: docs/eia-gen/mapeo.csv, docs/eia-gen/estado.csv')
