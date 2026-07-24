import { NextResponse } from "next/server";

/**
 * Encuesta de satisfacción → tabla `tool_survey` (una columna por pregunta).
 *
 * Si la tabla todavía no existe (migración sin correr), cae de vuelta a
 * `tool_feedback` guardando la encuesta como texto, para no perder respuestas.
 * Ver supabase/migrations/001_tool_survey.sql
 */

type Payload = {
  email?: string;
  progreso?: number;
  respuestas?: Record<string, string>;
  /** Versión en texto, usada si hay que caer a tool_feedback. */
  texto?: string;
};

const num = (v?: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null;
};
const txt = (v?: string) => (v && v.trim() ? v.trim() : null);

export async function POST(req: Request) {
  try {
    const body: Payload = await req.json();
    const r = body.respuestas ?? {};

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const tool = process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Configuración de base de datos incompleta" },
        { status: 500 }
      );
    }

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    const fila = {
      tool,
      email: txt(body.email),
      progreso: typeof body.progreso === "number" ? Math.round(body.progreso) : null,
      p2_facilidad_uso: num(r["2"]),
      p3_orientacion: num(r["3"]),
      p4_participacion: num(r["4"]),
      p5_adecuacion: num(r["5"]),
      p6_lenguaje: num(r["6"]),
      p7_recomendaciones: num(r["7"]),
      p8_recomendaria: txt(r["8"]),
      p9_falta_tema: txt(r["9"]),
      p9_detalle: txt(r["9_text"]),
      p10_comentario: txt(r["10"]),
      p11_acompanamiento: txt(r["11"]),
      p11_nombre: txt(r["11_nombre"]),
      p11_apellido: txt(r["11_apellido"]),
      p11_correo: txt(r["11_correo"]),
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/tool_survey`, {
      method: "POST",
      headers,
      body: JSON.stringify(fila),
    });

    if (res.status === 201) {
      return NextResponse.json({ success: true, structured: true });
    }

    // La tabla no existe todavía: no perder la respuesta.
    const detalle = await res.text();
    console.error("tool_survey insert falló:", res.status, detalle);

    const fbRes = await fetch(`${supabaseUrl}/rest/v1/tool_feedback`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tool,
        feedback_type: "Comentario general",
        description: body.texto || JSON.stringify(fila),
        ...(txt(body.email) ? { email: body.email } : {}),
      }),
    });

    if (fbRes.status === 201) {
      return NextResponse.json({ success: true, structured: false });
    }

    throw new Error(await fbRes.text());
  } catch (err: unknown) {
    console.error("survey route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
