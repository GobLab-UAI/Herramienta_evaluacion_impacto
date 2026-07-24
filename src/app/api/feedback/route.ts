import { NextResponse } from "next/server";

/**
 * Feedback → tabla `tool_feedback`.
 *
 * El contexto (pantalla, sección, pregunta, progreso) se guarda en columnas
 * propias para poder consultarlo, y además se conserva incrustado en
 * `description` para no romper lo ya guardado ni los reportes existentes.
 *
 * Si esas columnas todavía no existen (migración sin correr), reintenta el
 * insert solo con los campos originales, de modo que nunca se pierda un envío.
 * Ver supabase/migrations/001_tool_survey.sql
 */

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const body: Record<string, any> = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { feedback_type, description, email, organization, context } = body;
    if (!feedback_type || !description) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    const tool = process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto";

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    const base = {
      tool,
      feedback_type,
      description,
      ...(email ? { email } : {}),
      ...(organization ? { organization } : {}),
    };

    const txt = (v: unknown) =>
      typeof v === "string" && v.trim() ? v.trim() : null;

    const conContexto = context
      ? {
          ...base,
          pantalla: txt(context.pantalla),
          seccion: txt(context.seccion),
          pregunta: txt(context.pregunta),
          question_id: txt(context.questionId),
          progreso:
            typeof context.progreso === "number"
              ? Math.round(context.progreso)
              : null,
        }
      : base;

    const insertar = (fila: object) =>
      fetch(`${supabaseUrl}/rest/v1/tool_feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify(fila),
      });

    let res = await insertar(conContexto);

    // Las columnas de contexto aún no existen: reintentar sin ellas.
    if (!res.ok && conContexto !== base) {
      const detalle = await res.text();
      console.error("insert con contexto falló, reintentando:", res.status, detalle);
      res = await insertar(base);
    }

    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
