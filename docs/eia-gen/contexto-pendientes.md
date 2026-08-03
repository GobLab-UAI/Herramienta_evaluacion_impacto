# Contexto normativo (Chile / Internacional) — pendientes

Estado: la infraestructura y la UI están listas y desplegadas. Ambos
contextos comparten hoy el mismo contenido. Lo que falta:

## 1. Contenido diferenciado para el contexto internacional
Cuando lleguen los textos, se cargan sin tocar la lógica:
- **Preguntas / tooltips / opciones**: agregar `overrides` a la pregunta en
  `src/components/evaluacion-impacto-mejorada.tsx`, p. ej.
  ```ts
  overrides: { internacional: { text: "…", info: "…" } }
  ```
- **Preguntas exclusivas de un contexto** (p. ej. una específica de la ley
  chilena): marcar `soloContexto: 'chile'` — ya la oculta en el otro contexto.
- **Recomendaciones**: el campo `text` acepta string o mapa por contexto:
  ```ts
  text: { chile: "…", internacional: "…" }
  ```
Helpers ya disponibles en `src/lib/contexto.ts`: `resolverTexto`, y en el
componente `forContexto(question)`.

## 2. Persistir el contexto en Supabase
Hoy el contexto se ve en el PDF y en la UI, pero NO se guarda en la base.
Para analizar con qué contexto se respondió cada encuesta/feedback:
- Añadir columna `contexto` a `tool_survey` y a `tool_feedback` (migración).
- Pasar `contexto` en el payload de `sendSurvey` / `sendFeedback`
  (`src/lib/feedback.ts`) y guardarlo en las rutas `/api/survey` y
  `/api/feedback`.
Mismo patrón que el contexto de feedback (pantalla/sección/pregunta), con
degradación si la columna aún no existe.

## 3. Posible ajuste de UI
El selector quedó como segmentado compacto a la derecha del encabezado
"Comienza tu evaluación". Si se quiere más prominente (dos tarjetas grandes
antes del correo), es solo reacomodar el bloque en `src/components/LandingPage.tsx`.

## 4. Placeholder del correo
Sigue siendo `nombre@ejemplo.cl`. Para el contexto internacional podría
convenir `nombre@ejemplo.org` o neutro. Menor.
