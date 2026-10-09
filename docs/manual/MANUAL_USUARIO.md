# Manual de Usuario
## Herramienta de Evaluación de Impacto Algorítmico (EIA) — GobLab UAI

> Guía paso a paso para usar la herramienta: cómo iniciar la evaluación, responder
> el cuestionario, interpretar el puntaje y las recomendaciones, descargar el
> informe y dar tu opinión. Está pensada para equipos del sector público —
> técnicos y no técnicos — que van a diseñar, adquirir o poner en marcha un
> sistema de inteligencia artificial o ciencia de datos.

---

## Índice

1. [¿Qué es esta herramienta y para qué sirve?](#1-qué-es-esta-herramienta-y-para-qué-sirve)
2. [Conceptos clave (glosario)](#2-conceptos-clave-glosario)
3. [Antes de empezar](#3-antes-de-empezar)
4. [El flujo de trabajo de un vistazo](#4-el-flujo-de-trabajo-de-un-vistazo)
5. [Paso 1 — La portada: contexto y correo](#5-paso-1--la-portada-contexto-y-correo)
6. [Paso 2 — Responder el cuestionario](#6-paso-2--responder-el-cuestionario)
7. [Las 11 dimensiones](#7-las-11-dimensiones)
8. [Tipos de pregunta y ayudas](#8-tipos-de-pregunta-y-ayudas)
9. [La bifurcación de IA generativa](#9-la-bifurcación-de-ia-generativa)
10. [Contexto Chile vs. Internacional](#10-contexto-chile-vs-internacional)
11. [Guardar, cargar y autoguardado](#11-guardar-cargar-y-autoguardado)
12. [Paso 3 — Los resultados](#12-paso-3--los-resultados)
13. [Cómo se calcula e interpreta el puntaje](#13-cómo-se-calcula-e-interpreta-el-puntaje)
14. [Descargar el informe en PDF](#14-descargar-el-informe-en-pdf)
15. [Dar tu opinión: feedback y encuesta](#15-dar-tu-opinión-feedback-y-encuesta)
16. [Privacidad y datos](#16-privacidad-y-datos)
17. [Buenas prácticas y errores comunes](#17-buenas-prácticas-y-errores-comunes)
18. [Preguntas frecuentes](#18-preguntas-frecuentes)

---

## 1. ¿Qué es esta herramienta y para qué sirve?

La **Evaluación de Impacto Algorítmico (EIA)** es un cuestionario guiado que ayuda
a un equipo a **anticipar los riesgos éticos, legales, técnicos y de gestión** de
un sistema algorítmico *antes* de desplegarlo, y a recibir **recomendaciones de
mitigación** concretas para su proyecto.

No es una certificación ni una auditoría. Es una herramienta de **autoevaluación
reflexiva**: sus preguntas obligan a mirar el proyecto desde ángulos que muchas
veces quedan fuera del radar (proporcionalidad, protección de datos,
ciberseguridad, equidad, sostenibilidad ambiental, etc.).

**¿Para quién es?** Para equipos de servicios públicos que están iniciando o
revisando un proyecto de IA o ciencia de datos. Funciona mejor cuando la responden
**varias personas juntas**: alguien de tecnología, alguien de legal, alguien de
comunicaciones y alguien del área de servicio ciudadano.

**¿Qué entrega?** Al final obtienes:
- Un **puntaje de impacto** (0–100) con un **nivel** (Bajo, Moderado, Alto o Muy alto).
- Un **gráfico por dimensión** que muestra dónde se concentra el riesgo.
- Un conjunto de **recomendaciones** basadas en tus respuestas.
- Un **informe en PDF** descargable para compartir dentro de tu institución.

---

## 2. Conceptos clave (glosario)

| Término | Qué significa aquí |
|---|---|
| **Dimensión** | Cada una de las 11 áreas de riesgo en que se organiza el cuestionario (ver §7). |
| **Contexto** | El marco normativo con el que se responde: **Chile** (leyes chilenas) o **Internacional** (lenguaje neutro que remite a la normativa de tu país). |
| **IA generativa** | Sistemas que *crean* contenido nuevo (texto, imágenes, código). Responder que tu sistema la usa activa preguntas adicionales específicas. |
| **Pregunta condicional** | Pregunta que solo aparece si respondiste algo determinado en una pregunta anterior. |
| **Puntaje de impacto** | Número de 0 a 100 que resume el nivel de riesgo estimado según tus respuestas. |
| **Nivel de impacto** | La lectura cualitativa del puntaje: Bajo, Moderado, Alto o Muy alto. |
| **Recomendación** | Sugerencia de mitigación que la herramienta muestra cuando una respuesta señala un riesgo. |

---

## 3. Antes de empezar

- **Reúne al equipo.** La evaluación es más valiosa si participan distintos
  perfiles. No hace falta responder todo de una sola vez.
- **Ten a mano la información del proyecto**: qué problema resuelve, qué datos usa,
  quién lo desarrolla, en qué fase está (diseño, datos, o uso y monitoreo).
- **Navegador moderno** (Chrome, Edge, Firefox, Safari). No necesitas instalar nada.
- **Tus respuestas se guardan solas en tu navegador** (ver §11), así que puedes
  cerrar y retomar más tarde desde el mismo equipo.

---

## 4. El flujo de trabajo de un vistazo

```
Portada  ─▶  Cuestionario (11 secciones)  ─▶  Resultados
(contexto,    (responder, con              (puntaje, radar,
 correo)       autoguardado)                recomendaciones, PDF)
                                                   │
                                                   └─▶ Encuesta de satisfacción
```

1. **Portada** — eliges contexto (Chile / Internacional), ingresas tu correo e inicias.
2. **Cuestionario** — recorres las 11 dimensiones respondiendo cada pregunta.
3. **Resultados** — obtienes el puntaje, el gráfico, las recomendaciones y el PDF.
4. **Encuesta** — opcionalmente evalúas la propia herramienta.

---

## 5. Paso 1 — La portada: contexto y correo

En la portada encontrarás:

- **Selector de contexto**: dos opciones, **Chile** y **Internacional**.
  - Elige **Chile** si tu institución se rige por la normativa chilena (Ley de
    Protección de Datos, Ley Marco de Ciberseguridad, etc.). Las preguntas y
    recomendaciones citarán esas leyes.
  - Elige **Internacional** si estás fuera de Chile: el lenguaje se vuelve neutro
    y te remite a "la normativa vigente en su país" en lugar de a leyes chilenas.
- **Correo electrónico**: se usa para enviarte novedades y para asociar tu avance.
- **¿Desde dónde participas?**: origen/institución (opcional pero útil).
- **Casilla de novedades**: marca si quieres recibir información del proyecto.

Pulsa **Iniciar evaluación** para entrar al cuestionario. El contexto elegido se
mantiene durante toda la evaluación (verás una insignia **"Contexto chileno"** o
**"Contexto internacional"** en el encabezado).

---

## 6. Paso 2 — Responder el cuestionario

La pantalla del cuestionario tiene tres zonas:

- **Barra lateral izquierda**: las **11 secciones** (dimensiones), cada una con su
  porcentaje de avance. Puedes hacer clic en cualquiera para saltar a ella.
- **Centro**: las preguntas de la sección actual, numeradas (`1.1`, `1.2`, …).
- **Pie**: botones **Anterior / Siguiente**, el indicador *"Sección X de 11"* y
  **Ver resultados**.

En el encabezado están **Guardar** y **Cargar** (ver §11) y la insignia de contexto.

Puedes **navegar libremente**: no es obligatorio completar una sección para pasar a
otra, y el avance total se calcula solo sobre las preguntas que realmente
corresponden a tu caso.

---

## 7. Las 11 dimensiones

El cuestionario está organizado en 11 áreas, en este orden:

| # | Dimensión | Qué evalúa |
|---|---|---|
| 01 | **General** | Descripción del proyecto, fase, razones para automatizar, si usa IA generativa. |
| 02 | **Proporcionalidad** | Si el uso de un algoritmo se justifica frente a alternativas, y su afectación a derechos. |
| 03 | **Normativa** | Qué normas regulan directamente al sistema; propiedad intelectual. |
| 04 | **Licencia Social** | Participación, comunicación y aceptación por parte de las comunidades afectadas. |
| 05 | **Gobernanza** | Roles, responsabilidades y supervisión del proyecto. |
| 06 | **Protección de datos** | Datos personales, bases legales, derechos de los titulares, minimización. |
| 07 | **Ciberseguridad** | Riesgos de seguridad, continuidad operacional, proveedores, incidentes. |
| 08 | **Equidad** | Sesgos, discriminación y trato justo entre grupos. |
| 09 | **Transparencia** | Explicabilidad y comunicación del funcionamiento del sistema. |
| 10 | **Rendición de cuentas** | Auditorías, documentación, mecanismos de reclamo, deriva de datos. |
| 11 | **Sostenibilidad ambiental** | Consumo energético y huella asociada al modelo. |

> El número de preguntas por sección **varía según tu caso**: el contexto, la fase
> y si usas IA generativa activan u ocultan preguntas (ver §8 y §9).

---

## 8. Tipos de pregunta y ayudas

**Tipos de respuesta que verás:**
- **Texto libre** (por ejemplo, "Nombre del proyecto").
- **Sí / No**.
- **Selección única** (elige una opción de una lista).
- **Selección múltiple** (marca todas las que apliquen).

**Ayudas en cada pregunta:**
- **Ícono de información (ⓘ)**: abre un *tooltip* con la explicación del término o
  ejemplos. Úsalo siempre que dudes qué se te pregunta.
- **"¿Esta pregunta fue clara?" 👍 / 👎**: dinos si la pregunta se entendió. Si
  marcas 👎, puedes escribir el motivo. Este feedback ayuda a mejorar los textos.
- **"comentar"**: deja un comentario puntual sobre esa pregunta.
- **Botón flotante "Enviar feedback"**: comentario general en cualquier momento
  (te registra automáticamente en qué pantalla y sección estás).

**Preguntas condicionales:** algunas preguntas aparecen solo si una respuesta
previa lo amerita (por ejemplo, si dices que **subcontratas** el desarrollo,
aparecen preguntas sobre las cláusulas del contrato). Es normal que la cantidad de
preguntas cambie a medida que respondes.

---

## 9. La bifurcación de IA generativa

En la sección **General** hay una pregunta clave:

> **¿El sistema incorpora IA generativa?**

- Si respondes **No**, el cuestionario sigue con las preguntas "universales".
- Si respondes **Sí**, se **activan preguntas adicionales** específicas de IA
  generativa (repartidas en varias dimensiones), y la numeración se reordena para
  incluirlas sin saltos.

Responde con cuidado esta pregunta: define buena parte del recorrido.

---

## 10. Contexto Chile vs. Internacional

El contexto elegido en la portada cambia **el texto de algunas preguntas, los
tooltips y las recomendaciones**, no la estructura general:

- En **Chile**, las preguntas citan leyes chilenas (Ley N° 19.628 / 21.719 de
  protección de datos, Ley Marco de Ciberseguridad, ANCI, etc.).
- En **Internacional**, esos mismos textos se vuelven **neutros** y te piden
  revisar *"la normativa vigente en su país"*.

Además hay diferencias puntuales por contexto:
- En **Internacional**, la dimensión **Protección de datos** parte con una pregunta
  extra: *"¿Su país cuenta con una normativa vigente sobre Ley de Protección de
  Datos?"*. Si respondes **No**, el resto de esa dimensión se oculta (no aplica) y
  no afecta tu puntaje.
- En **Chile**, aparecen preguntas específicas de la legislación chilena que no se
  muestran en el contexto internacional (por ejemplo, la designación como
  "operador de importancia vital" por la ANCI).

---

## 11. Guardar, cargar y autoguardado

- **Autoguardado**: cada respuesta se guarda automáticamente **en tu navegador**
  (almacenamiento local), asociada a tu correo. Verás *"Guardado automáticamente"*
  en el pie. Puedes cerrar la pestaña y volver más tarde **desde el mismo equipo y
  navegador**.
- **Guardar**: genera una copia de respaldo de tu avance.
- **Cargar**: recupera un avance guardado.

> ⚠️ El autoguardado vive **solo en ese navegador**. Si cambias de computador o
> borras los datos del sitio, el avance no viaja contigo. Para trabajo en equipo,
> coordinen quién es la "computadora oficial" de la evaluación.

---

## 12. Paso 3 — Los resultados

Cuando pulses **Ver resultados**, verás:

- **Puntaje total** (0–100) en grande, con el **nivel de impacto** (Bajo, Moderado,
  Alto o Muy alto).
- **Perfil y puntaje por dimensión**: el radar y la lista muestran cómo se reparte el
  riesgo entre las 11 áreas. Las dimensiones con puntaje más alto son las que más
  conviene atender.
- **Barra de niveles**: muestra los cuatro tramos (Bajo, Moderado, Alto, Muy alto) y
  marca dónde cae tu proyecto ("Tu proyecto: N").
- **Recomendaciones**: agrupadas y basadas en tus respuestas. Cada una explica qué
  conviene revisar o mejorar.
- **Descargar informe (PDF)** — ver §14.
- **Pestaña "Evalúa esta herramienta"** — la encuesta de satisfacción (§15).

> **Importante sobre el puntaje:** todas las preguntas de sí/no del cuestionario,
> incluidas las de IA generativa, suman al puntaje. Solo cuentan las preguntas que
> efectivamente se te muestran, así que responder la rama de IA generativa o el
> contexto internacional no te penaliza.

---

## 13. Cómo se calcula e interpreta el puntaje

El puntaje resume el riesgo estimado en una escala de **0 a 100**, siempre en
números enteros. A partir de él, la herramienta asigna un **nivel**:

| Puntaje | Nivel de impacto | Lectura |
|---|---|---|
| **0 – 18** | **Bajo impacto** | Riesgo acotado; mantén buenas prácticas. |
| **19 – 45** | **Impacto moderado** | Hay puntos a reforzar; revisa las recomendaciones. |
| **46 – 72** | **Alto impacto** | Riesgos relevantes; conviene mitigar antes de avanzar. |
| **73 – 100** | **Impacto muy alto** | Riesgos críticos; revisa a fondo antes de desplegar. |

Cada dimensión obtiene un puntaje de 0 a 100: la proporción de sus preguntas
visibles que respondiste en el sentido que **señala un riesgo**. El puntaje total es
el promedio de las dimensiones (todas pesan igual), y el gráfico por dimensión
te dice **dónde** están concentrados. Úsalo para **priorizar**, no como una nota
final: dos proyectos con el mismo puntaje pueden tener perfiles de riesgo muy
distintos.

---

## 14. Descargar el informe en PDF

Pulsa **Descargar informe / PDF** en la pantalla de resultados. Se genera un
documento A4 con la misma estructura que la pantalla:
- **01 Resumen** (primera página): radar y puntaje por dimensión, la barra de niveles
  con tu puntaje total y la información general del proyecto.
- **02 Recomendaciones** (desde una página nueva): la tabla de recomendaciones por
  etapa, con las preguntas relacionadas y tus respuestas.

Es el material para **compartir dentro de tu institución** y respaldar decisiones.
El PDF se arma en tu navegador a partir de lo que ves en pantalla.

---

## 15. Dar tu opinión: feedback y encuesta

Tu retroalimentación mejora la herramienta. Hay tres vías:

1. **Por pregunta** — el 👍 / 👎 *"¿Esta pregunta fue clara?"* y el botón
   **comentar** bajo cada pregunta.
2. **Botón flotante "Enviar feedback"** — comentario general en cualquier pantalla.
3. **Encuesta de satisfacción** — en la pestaña *"Evalúa esta herramienta"* de los
   resultados. Son 11 preguntas cortas (escalas 1–7 y texto) sobre facilidad de
   uso, orientación, participación, adecuación, lenguaje y claridad de las
   recomendaciones, más si la recomendarías y qué faltó.

---

## 16. Privacidad y datos

- Tus **respuestas del cuestionario** se procesan **localmente en tu navegador** y
  no se almacenan en la plataforma.
- El **correo** y el **origen** se usan para enviarte los resultados/novedades y
  con fines estadísticos anonimizados.
- El **feedback** y la **encuesta** se guardan para mejorar la herramienta.
- Encontrarás el detalle en la página **Privacidad** (enlace en el encabezado).

---

## 17. Buenas prácticas y errores comunes

**Buenas prácticas**
- Respóndela **en equipo** y con distintos perfiles.
- Usa el **ícono ⓘ** cada vez que dudes de un término.
- Responde con **honestidad**: el valor está en detectar riesgos, no en "sacar buen puntaje".
- Al terminar, **descarga el PDF** y agenda revisar las recomendaciones.

**Errores comunes**
- **Cambiar de computador a mitad de camino**: el avance queda en el navegador
  original (§11).
- **Responder a la ligera "¿usa IA generativa?"**: define todo el recorrido (§9).
- **Esperar que el puntaje lo diga todo**: úsalo para priorizar, no como veredicto (§13).
- **Ignorar las recomendaciones**: son la parte accionable del informe.

---

## 18. Preguntas frecuentes

**¿Necesito instalar algo o crear una cuenta?**
No. Solo un navegador y tu correo.

**¿Puedo pausar y seguir después?**
Sí, desde el mismo navegador: el avance se guarda solo (§11).

**¿Por qué cambian las preguntas mientras respondo?**
Por las preguntas condicionales, la bifurcación de IA generativa y el contexto
(§8, §9, §10).

**Respondí muchas preguntas nuevas y el puntaje casi no se movió. ¿Está mal?**
No. Varias preguntas recientes no suman al número todavía; su aporte es la
reflexión y las recomendaciones (§12).

**¿Mis respuestas quedan guardadas en un servidor?**
No; el cuestionario se procesa en tu navegador. Solo se guardan correo, origen,
feedback y encuesta (§16).

**Estoy fuera de Chile. ¿Puedo usarla?**
Sí: elige **Contexto internacional** en la portada (§10).

---

*Herramienta desarrollada por **GobLab UAI** — Escuela de Gobierno, Universidad
Adolfo Ibáñez. Con el apoyo de ANID / Subdirección de Investigación Aplicada
(proyectos IT25I0161 e ID23I10357). El manual técnico está en
[`MANUAL_TECNICO.md`](MANUAL_TECNICO.md).*
