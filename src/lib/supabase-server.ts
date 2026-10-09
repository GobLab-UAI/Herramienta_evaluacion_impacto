/**
 * Utilidades de servidor para las rutas /api que escriben en Supabase.
 * Solo se importan desde route handlers: la anon key nunca llega al navegador.
 */

/** Nombre con el que /api/register guarda a la persona en tool_users. */
export const REGISTRO_TOOL_NAME = process.env.SUPABASE_TOOL_NAME || 'herramienta evaluacion impacto'

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  }
}

/**
 * Id del usuario en tool_users para ese correo, o null si no está registrado.
 * Solo existe fila si la persona aceptó recibir novedades al ingresar, así que
 * el vínculo (FK user_id) respeta ese consentimiento. Usa la función
 * eia_user_id (migración 004); si aún no existe, devuelve null y el registro se
 * guarda igual, sin vínculo.
 */
export async function resolveUserId(email: unknown): Promise<string | null> {
  const cfg = supabaseConfig()
  if (!cfg || typeof email !== 'string' || !email.includes('@')) return null
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/eia_user_id`, {
      method: 'POST',
      headers: { ...cfg.headers, Prefer: 'return=representation' },
      body: JSON.stringify({ p_email: email, p_tool: REGISTRO_TOOL_NAME }),
    })
    if (!res.ok) return null
    const id: unknown = await res.json()
    return typeof id === 'string' && id ? id : null
  } catch {
    return null
  }
}

/**
 * Inserta probando primero con las columnas nuevas y, si fallan (migración sin
 * correr), con las siguientes variantes más simples. Nunca se pierde un envío
 * por una columna que todavía no existe.
 */
export async function insertarConRespaldo(tabla: string, variantes: object[]): Promise<Response> {
  const cfg = supabaseConfig()
  if (!cfg) throw new Error('Configuración de base de datos incompleta')
  let res: Response | null = null
  for (let i = 0; i < variantes.length; i++) {
    const fila = variantes[i]
    res = await fetch(`${cfg.url}/rest/v1/${tabla}`, {
      method: 'POST',
      headers: cfg.headers,
      body: JSON.stringify(fila),
    })
    if (res.ok || i === variantes.length - 1) break
    console.error(`insert en ${tabla} falló (variante ${i + 1}), reintentando:`, res.status, await res.text())
  }
  return res!
}

/** Quita las claves con valor null/undefined para no enviar columnas vacías. */
export function sinNulos<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>
}
