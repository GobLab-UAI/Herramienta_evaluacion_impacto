#!/usr/bin/env node
/**
 * Fase 2 — aplica sobre el código los cambios de texto (label) e info (tooltip)
 * de las preguntas existentes, según docs/eia-gen/fase2-mods.json.
 *
 * Opera bloque por bloque: localiza cada pregunta por su `id:` y reemplaza solo
 * su `text:` y/o `info:`, sin tocar el resto. Es idempotente (aplicar dos veces
 * deja el mismo resultado).
 *
 *   node scripts/eia-gen/apply-fase2.mjs          # aplica
 *   node scripts/eia-gen/apply-fase2.mjs --dry     # solo reporta
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = resolve(ROOT, 'src/components/evaluacion-impacto-mejorada.tsx')
const MODS = resolve(ROOT, 'docs/eia-gen/fase2-mods.json')
const DRY = process.argv.includes('--dry')

const esc = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

let src = readFileSync(SRC, 'utf8')
const mods = JSON.parse(readFileSync(MODS, 'utf8'))

// Solo el array `questions` — nunca las recomendaciones ni el render.
const start = src.indexOf('const questions: Question[] = [')
const end = src.indexOf('const recommendations')

/** Reemplaza `field: "..."` dentro de [from, to) del bloque de la pregunta. */
function replaceField(block, field, value) {
  const re = new RegExp(`(${field}:\\s*")(?:[^"\\\\]|\\\\.)*(")`)
  if (!re.test(block)) return { block, ok: false }
  return { block: block.replace(re, `$1${esc(value)}$2`), ok: true }
}

// Índice de posiciones de cada `id: "qN"` en el array de preguntas.
const ids = []
const idRe = /id:\s*"(q[\d.]+)"/g
let m
while ((m = idRe.exec(src)) !== null) {
  if (m.index < start || m.index > end) continue
  ids.push({ id: m[1], at: m.index })
}

const report = []
// Recorrer de atrás hacia adelante para que los índices no se corran al editar.
for (let i = ids.length - 1; i >= 0; i--) {
  const { id, at } = ids[i]
  const mod = mods[id]
  if (!mod) continue
  const blockEnd = i + 1 < ids.length ? ids[i + 1].at : end
  let block = src.slice(at, blockEnd)

  const done = []
  for (const field of ['text', 'info']) {
    if (!(field in mod)) continue
    const r = replaceField(block, field, mod[field])
    if (r.ok) { block = r.block; done.push(field) }
    else report.push(`  ⚠ ${id}: no se encontró campo ${field}`)
  }
  if (done.length) {
    src = src.slice(0, at) + block + src.slice(blockEnd)
    report.push(`  ${id}: ${done.join(', ')}`)
  }
}

report.reverse()
console.log(`preguntas a modificar: ${Object.keys(mods).length}`)
console.log(report.join('\n'))

if (DRY) {
  console.log('\n(--dry: no se escribió nada)')
} else {
  writeFileSync(SRC, src)
  console.log('\nescrito:', SRC)
}
