import { NextResponse } from "next/server";
import { insertarConRespaldo, resolveUserId, sinNulos, supabaseConfig } from "@/lib/supabase-server";

/**
 * Voto 👍/👎 de claridad por pregunta → tabla `tool_question_vote`.
 *
 * Complementa al evento de GA4: guarda cada voto para poder ver los conteos
 * por herramienta / sección / pregunta en el panel de feedback.
 *
 * El id del voto se genera aquí y se devuelve al cliente, para que el
 * comentario que la persona escriba después quede unido a este voto
 * (tool_feedback.vote_id).
 *
 * No guarda el correo: solo `user_id` (FK → tool_users) cuando la persona
 * aceptó recibir novedades al ingresar. Si la tabla o las columnas nuevas aún
 * no existen, responde success:false sin romper la experiencia: el voto es
 * fire-and-forget desde el cliente. Ver supabase/migrations/003 y 004.
 */

type Payload = {
  questionId?: string;
  helpful?: boolean;
  pregunta?: string;
  seccion?: string;
  /** Solo para resolver user_id; no se guarda en la tabla de votos. */
  email?: string;
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

    if (!supabaseConfig()) {
      return NextResponse.json(
        { success: false, error: "Configuración de base de datos incompleta" },
        { status: 500 }
      );
    }

    const voteId = crypto.randomUUID();
    const base = {
      id: voteId,
      tool: process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto",
      question_id: txt(body.questionId),
      pregunta: txt(body.pregunta),
      seccion: txt(body.seccion),
      helpful: body.helpful,
    };
    const userId = await resolveUserId(body.email);

    const res = await insertarConRespaldo("tool_question_vote", [
      sinNulos({ ...base, user_id: userId }),
      base,
    ]);

    if (res.ok) {
      return NextResponse.json({ success: true, voteId });
    }

    // La tabla aún no existe u otro error: no romper la UX del cuestionario.
    console.error("tool_question_vote insert falló:", res.status, await res.text());
    return NextResponse.json({ success: false, error: "No se pudo registrar el voto" });
  } catch (err: unknown) {
    console.error("vote route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
