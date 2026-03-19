# Evaluación de Impacto Algorítmico (EIA)

Herramienta desarrollada por **GobLab UAI** para guiar a equipos del sector público en la identificación y mitigación de riesgos asociados al uso de sistemas de inteligencia artificial y ciencia de datos.

El cuestionario está estructurado en **11 áreas clave**: proporcionalidad, normativa, protección de datos, equidad, transparencia, gobernanza, ciberseguridad, entre otras. Al finalizar, la herramienta genera un informe con recomendaciones descargable en PDF.

> Esta investigación cuenta con el apoyo de ANID/SUBDIRECCIÓN DE INVESTIGACIÓN APLICADA/IT25I0161

---

## Stack tecnológico

- [Next.js 14](https://nextjs.org/) — framework React con App Router
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — estilos y componentes
- [Supabase](https://supabase.com/) — base de datos para registros de usuarios y feedback
- [Vercel](https://vercel.com/) — plataforma de despliegue

---

## Correr localmente

### Requisitos previos

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 1. Clonar el repositorio

```bash
git clone https://github.com/johanpina/Herramienta_evaluacion_impacto.git
cd Herramienta_evaluacion_impacto
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_TOOL_NAME=evaluacion de impacto
NEXT_PUBLIC_VERSION=4.1.1
```

> Obtén `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde **Project Settings → API** en tu dashboard de Supabase.

### 4. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── feedback/       # Guarda feedback en Supabase (tabla tool_feedback)
│   │   └── register/       # Registra correos de usuarios (tabla tool_users)
│   ├── evaluacion/         # Página del cuestionario
│   └── page.tsx            # Landing page
└── components/
    ├── LandingPage.tsx                    # Portada y formulario de inicio
    └── evaluacion-impacto-mejorada.tsx    # Lógica del cuestionario y resultados
```

---

## Base de datos (Supabase)

La herramienta utiliza dos tablas:

**`tool_users`** — registra los correos de quienes inician una evaluación.

**`tool_feedback`** — almacena el feedback enviado desde la sidebar.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tool` | enum | `evaluacion de impacto` |
| `feedback_type` | enum | `Comentario general`, `Reporte de error`, `Sugerencia de mejora`, `Pregunta`, `Otro` |
| `description` | text | Mensaje del usuario |
| `email` | text | Correo del usuario |
| `organization` | text | Organización (opcional) |

---

## Despliegue en Vercel

### 1. Importar el repositorio

En [vercel.com/new](https://vercel.com/new), importa el repositorio desde GitHub. Vercel detecta automáticamente Next.js.

### 2. Configurar variables de entorno

En **Settings → Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de tu proyecto Supabase |
| `SUPABASE_TOOL_NAME` | `evaluacion de impacto` |
| `NEXT_PUBLIC_VERSION` | versión actual (ej. `4.1.1`) |

### 3. Deploy

Cada push a la rama `main` desencadena un nuevo despliegue automático.

---

## Licencia

Desarrollado por [GobLab UAI](https://goblab.uai.cl) — Laboratorio público de innovación de la Facultad de Gobierno de la Universidad Adolfo Ibáñez.
