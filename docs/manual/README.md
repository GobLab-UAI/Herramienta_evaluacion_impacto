# Documentación — Herramienta de Evaluación de Impacto Algorítmico (GobLab UAI)

Esta carpeta contiene los manuales de la herramienta EIA.

| Documento | Para quién | Contenido |
|---|---|---|
| **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** | Equipos del sector público (técnicos y no técnicos) | Guía paso a paso: cómo iniciar, responder el cuestionario, interpretar el puntaje y las recomendaciones, descargar el informe y dar feedback. Incluye glosario y preguntas frecuentes. |
| **[MANUAL_TECNICO.md](MANUAL_TECNICO.md)** | Desarrolladores / mantenedores | Arquitectura Next.js + Supabase, modelo de datos del cuestionario, lógica de visibilidad y scoring, endpoints, persistencia, feedback/analítica, ejecución local, despliegue y cómo extender. |

## Contexto

La EIA es una herramienta de **autoevaluación guiada** (Next.js 14 + Supabase) que
ayuda a equipos del sector público a anticipar los riesgos éticos, legales,
técnicos y de gestión de un sistema de IA o ciencia de datos, y a recibir
recomendaciones de mitigación. Cubre **11 dimensiones**, se adapta al **contexto**
(Chile / Internacional) y a si el sistema usa **IA generativa**, y genera un
**informe en PDF**.

## Referencias en el repositorio

- Núcleo del cuestionario: `src/components/evaluacion-impacto-mejorada.tsx`
- Sistema de contexto: `src/lib/contexto.ts`
- Feedback / encuesta / votos: `src/lib/feedback.ts`, `src/data/survey.ts`
- API: `src/app/api/{register,survey,feedback,vote}/route.ts`
- Base de datos: `supabase/migrations/`

---

*GobLab UAI — Escuela de Gobierno, Universidad Adolfo Ibáñez. Con el apoyo de ANID
(proyectos IT25I0161 e ID23I10357).*
