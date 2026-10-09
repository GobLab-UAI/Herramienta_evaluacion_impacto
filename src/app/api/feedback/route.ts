import { NextResponse } from "next/server";
import { insertarConRespaldo, resolveUserId, sinNulos } from "@/lib/supabase-server";

/**
 * Feedback → tabla `tool_feedback`.
 *
 * El contexto (pantalla, sección, pregunta, progreso) se guarda en columnas
 * propias para poder consultarlo, y además se conserva incrustado en
 * `description` para no romper lo ya guardado ni los reportes existentes.
 *
 * Vínculos (migración 004):
 * - `user_id` → tool_users, solo si la persona aceptó recibir novedades.
 * - `vote_id` → tool_question_vote, cuando el comentario se escribe desde el
 *   👍/👎 de una pregunta.
 *
 * Si esas columnas todavía no existen (migración sin correr), reintenta el
 * insert con menos columnas, de modo que nunca se pierda un envío.
 * Ver supabase/migrations/001_tool_survey.sql y 004_vinculos_usuario.sql
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const body: Record<string, any> = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { feedback_type, description, email, organization, context, vote_id } = body;
    if (!feedback_type || !description) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes" },
        { status: 400 }
      );
    }

    const tool = process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto";

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

    const vinculos = sinNulos({
      user_id: await resolveUserId(email),
      vote_id: typeof vote_id === "string" && UUID.test(vote_id) ? vote_id : null,
    });

    const res = await insertarConRespaldo("tool_feedback", [
      { ...conContexto, ...vinculos },
      conContexto,
      base,
    ]);

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
