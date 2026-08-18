import { NextResponse } from "next/server";

/**
 * Voto 👍/👎 de claridad por pregunta → tabla `tool_question_vote`.
 *
 * Complementa al evento de GA4: guarda cada voto para poder ver los conteos
 * por herramienta / sección / pregunta en el panel de feedback.
 *
 * No persiste datos personales (sin correo). Si la tabla todavía no existe
 * (migración sin correr), responde success:false sin romper la experiencia:
 * el voto es fire-and-forget desde el cliente. Ver
 * supabase/migrations/003_question_votes.sql
 */

type Payload = {
  questionId?: string;
  helpful?: boolean;
  pregunta?: string;
  seccion?: string;
};

const txt = (v?: string) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function POST(req: Request) {
  try {
    const body: Payload = await req.json();

    if (typeof body.helpful !== "boolean" || !txt(body.questionId)) {
      return NextResponse.json(
        { success: false, error: "Voto inválido" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const tool = process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Configuración de base de datos incompleta" },
        { status: 500 }
      );
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/tool_question_vote`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        tool,
        question_id: txt(body.questionId),
        pregunta: txt(body.pregunta),
        seccion: txt(body.seccion),
        helpful: body.helpful,
      }),
    });

    if (res.status === 201) {
      return NextResponse.json({ success: true });
    }

    // La tabla aún no existe u otro error: no romper la UX del cuestionario.
    const detalle = await res.text();
    console.error("tool_question_vote insert falló:", res.status, detalle);
    return NextResponse.json({ success: false, error: "No se pudo registrar el voto" });
  } catch (err: unknown) {
    console.error("vote route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
