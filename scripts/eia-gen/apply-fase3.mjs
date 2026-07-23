#!/usr/bin/env node
/**
 * Fase 3 — inserta las preguntas nuevas de docs/eia-gen/fase3-nuevas.json en el
 * array `questions`, cada una al final de su dimensión (en el documento van
 * numeradas después de las existentes).
 *
 * Enfoque robusto: parsea el array en bloques de pregunta {…}, inserta los
 * nuevos tras el último bloque de cada dimensión y reensambla. Así no depende
 * de offsets ni de si el último elemento lleva coma. Todas entran con
 * scoreContribution: false. Idempotente (omite ids ya presentes).
 *
 *   node scripts/eia-gen/apply-fase3.mjs [--dry]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = resolve(ROOT, 'src/components/evaluacion-impacto-mejorada.tsx')
const DATA = resolve(ROOT, 'docs/eia-gen/fase3-nuevas.json')
const DRY = process.argv.includes('--dry')

const esc = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

let src = readFileSync(SRC, 'utf8')
const nuevas = JSON.parse(readFileSync(DATA, 'utf8'))

// ── Aislar el literal del array questions ────────────────────────────
const marker = 'const questions: Question[] = ['
const open = src.indexOf(marker) + marker.length - 1  // índice del '['
// Encontrar el ']' que cierra el array balanceando corchetes, ignorando strings.
function matchBracket(text, from) {
  let depth = 0, inStr = false, q = ''
  for (let i = from; i < text.length; i++) {
    const c = text[i]
    if (inStr) {
      if (c === '\\') { i++; continue }
      if (c === q) inStr = false
      continue
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue }
    if (c === '[') depth++
    else if (c === ']') { depth--; if (depth === 0) return i }
  }
  return -1
}
const close = matchBracket(src, open)
if (close < 0) { console.error('No se cerró el array questions'); process.exit(1) }

const head = src.slice(0, open + 1)   // incluye '['
const body = src.slice(open + 1, close)
const tail = src.slice(close)         // incluye ']'

// ── Partir el body en bloques de objeto {…} de primer nivel ──────────
function splitObjects(text) {
  const blocks = []
  let depth = 0, inStr = false, q = '', start = -1
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inStr) {
      if (c === '\\') { i++; continue }
      if (c === q) inStr = false
      continue
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue }
    if (c === '{') { if (depth === 0) start = i; depth++ }
    else if (c === '}') { depth--; if (depth === 0) blocks.push(text.slice(start, i + 1)) }
  }
  return blocks
}
const blocks = splitObjects(body)

const idOf = b => (b.match(/id:\s*"(q[\d.]+)"/) || [])[1]
const dimOf = b => (b.match(/dimension:\s*"([^"]+)"/) || [])[1]
const existentes = new Set(blocks.map(idOf))

// ── Generar bloque TS para una pregunta nueva ────────────────────────
function render(q) {
  const L = ['{']
  if (q.fase_inferida) L.push('    // FASE INFERIDA (sin dato en el documento) — revisar con Isidora')
  L.push(`    id: "${q.id}",`)
  L.push(`    text: "${esc(q.text)}",`)
  L.push(`    type: "${q.type}",`)
  L.push(`    dimension: "${q.dim}",`)
  L.push(`    stage: "${q.stage}",`)
  L.push(`    info: "${esc(q.info)}",`)
  if (q.track === 'iagen') L.push('    track: "iagen",')
  if (q.dependsOn) {
    L.push('    dependsOn: {')
    L.push(`      questionId: "${q.dependsOn.questionId}",`)
    L.push(`      value: ${JSON.stringify(q.dependsOn.value)}`)
    L.push('    },')
  }
  L.push('    scoreContribution: false')
  L.push('  }')
  return L.join('\n  ')
}

// ── Agrupar nuevas por dimensión ─────────────────────────────────────
const porDim = new Map()
let added = 0
for (const q of nuevas) {
  if (existentes.has(q.id)) continue
  if (!porDim.has(q.dim)) porDim.set(q.dim, [])
  porDim.get(q.dim).push(q)
  added++
}

// ── Insertar tras el último bloque de cada dimensión ─────────────────
const result = []
for (let i = 0; i < blocks.length; i++) {
  result.push(blocks[i])
  const dim = dimOf(blocks[i])
  const nextDim = i + 1 < blocks.length ? dimOf(blocks[i + 1]) : null
  if (porDim.has(dim) && dim !== nextDim) {
    for (const q of porDim.get(dim)) result.push(render(q))
    porDim.delete(dim)
  }
}
// Cualquier dimensión no anclada (no debería ocurrir) va al final.
for (const [dim, qs] of porDim) {
  console.error(`Aviso: dimensión "${dim}" sin ancla previa; añadida al final`)
  for (const q of qs) result.push(render(q))
}

const newBody = '\n  ' + result.join(',\n  ') + '\n'
src = head + newBody + tail

console.log(`preguntas nuevas: ${nuevas.length} | insertadas: ${added} | ya presentes: ${nuevas.length - added}`)
if (DRY) console.log('(--dry: no se escribió nada)')
else { writeFileSync(SRC, src); console.log('escrito:', SRC) }
