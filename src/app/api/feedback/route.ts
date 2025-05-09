import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    /* 1 · Parsear cuerpo */
    const contentType = req.headers.get("content-type") || "";
    const body: Record<string, any> = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    /* 2 · Extraer & validar */
    const { category, subject, message, organization, tool } = body;
    if (!category || !message) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes" },
        { status: 400 }
      );
    }

    /* 3 · Variables */
    const recipient = process.env.MAIL_TO_SEND || "ejemplo@gmail.com";
    const toolName = process.env.TOOL || "HERRAMIENTA"; // valor por defecto

    /* 4 · HTML */
    const html = `
      <h2>Nuevo feedback</h2>
      <p><strong>Herramienta:</strong> ${toolName}</p>
      <p><strong>Organización:</strong> ${organization || "-"}</p>
      <p><strong>Categoría:</strong> ${category}</p>
      <p><strong>Mensaje:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>
    `;

    /* 5 · Enviar */
    const { error } = await resend.emails.send({
      from: "Feedback GobLab <onboarding@resend.dev>",
      to: [recipient],
      subject: `[Feedback][${toolName}] ${subject || category}`,
      html,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}