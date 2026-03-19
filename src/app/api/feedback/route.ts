import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const body: Record<string, any> = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    const { feedback_type, description, email, organization } = body;
    if (!feedback_type || !description) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    const tool = process.env.SUPABASE_TOOL_NAME || "evaluacion de impacto";

    const res = await fetch(`${supabaseUrl}/rest/v1/tool_feedback`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        tool,
        feedback_type,
        description,
        ...(email ? { email } : {}),
        ...(organization ? { organization } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}
