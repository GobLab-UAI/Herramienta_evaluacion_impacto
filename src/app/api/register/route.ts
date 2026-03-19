import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email es requerido" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const toolName = process.env.SUPABASE_TOOL_NAME || "herramienta evaluacion impacto";

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: "Configuración de base de datos incompleta" },
        { status: 500 }
      );
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/tool_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ email, tool_name: toolName }),
    });

    if (res.status === 201) {
      return NextResponse.json({ success: true });
    }

    if (res.status === 409) {
      return NextResponse.json({ success: true, existing: true });
    }

    const errorText = await res.text();
    console.error("Supabase error:", res.status, errorText);
    return NextResponse.json(
      { success: false, error: `Error al registrar: ${res.status}` },
      { status: 500 }
    );
  } catch (err: unknown) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
