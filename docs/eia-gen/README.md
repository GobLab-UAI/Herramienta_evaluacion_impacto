# EIA Gen — Hito 1

Refactor del cuestionario para cubrir proyectos con **IA generativa**, a partir
del libro *EIA Gen (Hito1)* preparado por Isidora.

## Archivos

| Archivo | Qué es |
|---|---|
| `eia_gen_hito1.md` | Volcado literal del Google Sheet. Fuente de verdad; no editar a mano. |
| `mapeo.csv` | Cruce de cada fila del documento con el `id` de pregunta del código. |
| `estado.csv` | Seguimiento fila por fila (columna "Estado (Modificar Johan)" del Sheet). |
| `estado-para-pegar.txt` | Se genera al cerrar cada fase: columna Estado lista para pegar en el Sheet. |

## Por qué el mapeo va por texto, no por número

El documento numera las filas por **posición visible** (`1.2`, `6.2`, …). Esa
numeración se desplaza según qué condicionales estén colapsadas: el doc `6,2`
corresponde a `q27`, la cuarta pregunta de su dimensión, porque `q25` y `q26`
son condicionales de `q24` que el doc cuenta colapsadas.

Por eso `scripts/eia-gen/map-questions.mjs` cruza por **texto normalizado** del
enunciado (`Contenido actual` ↔ `text`), dentro de la misma dimensión. En el
Hito 1 las 44 filas con texto actual coinciden exactas (similitud 1.000). El
script conserva el umbral (< 0,90) para avisar si un enunciado futuro deja de
coincidir, en vez de mapear mal en silencio.

Regenerar:

```bash
node scripts/eia-gen/map-questions.mjs
```

## Estado

El conector de Google Drive disponible es de solo lectura para hojas de cálculo,
así que la columna "Estado (Modificar Johan)" se lleva aquí en `estado.csv` y se
exporta a `estado-para-pegar.txt` para pegarla de vuelta en el Sheet al cerrar
cada fase.

## Ids con decimales

Los ids de pregunta **no** son todos `qN` correlativos: hay `q28.1`, `q37.1`,
`q39.1` (condicionales insertadas después). Cualquier script debe usar
`q[\d.]+`, no `q\d+`.
