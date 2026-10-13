import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { T, SERIF, MONO } from "@/lib/civic";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos — EIA GobLab UAI",
  description:
    "Cómo trata los datos personales la Herramienta de Evaluación de Impacto Algorítmico de GobLab UAI.",
};

const CONTACTO = "goblab@uai.cl";

const link: CSSProperties = { color: T.burgundy, fontWeight: 600 };
const tarjeta: CSSProperties = {
  background: "#fff",
  border: `1px solid ${T.roseLight}`,
  borderRadius: 14,
  padding: "18px 20px",
};
const th: CSSProperties = {
  textAlign: "left",
  padding: "9px 12px",
  background: T.rosePaper,
  color: T.burgundy,
  fontSize: 12.5,
  borderBottom: `1.5px solid ${T.rose}`,
};
const td: CSSProperties = {
  padding: "10px 12px",
  borderBottom: `1px solid ${T.roseLight}`,
  verticalAlign: "top",
  fontSize: 13.5,
  lineHeight: 1.55,
};

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 22, color: T.burgundy, margin: "0 0 12px", display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.rose }}>{String(n).padStart(2, "0")}</span>
        {titulo}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: T.ink80 }}>{children}</div>
    </section>
  );
}

function Resumen({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={tarjeta}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.5, color: T.burgundy, textTransform: "uppercase", marginBottom: 8 }}>{titulo}</div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: T.ink80 }}>{children}</div>
    </div>
  );
}

const DATOS: Array<[string, string, string]> = [
  [
    "Correo y tipo de organización",
    "Al iniciar la evaluación, solo si marcas «Acepto recibir novedades del proyecto y de la herramienta».",
    "Enviarte novedades del proyecto y saber desde qué tipo de instituciones se usa la herramienta.",
  ],
  [
    "Valoración de claridad (👍/👎) de cada pregunta",
    "Cuando la marcas.",
    "Detectar preguntas poco claras. Se guarda sin tu correo; solo queda asociada a tu registro si marcaste la casilla.",
  ],
  [
    "Comentarios por pregunta y botón «Enviar feedback»",
    "Cuando los envías.",
    "Entender y resolver los problemas reportados. Se guardan con la sección o pregunta desde la que escribiste y, solo si marcaste la casilla, con tu correo.",
  ],
  [
    "Encuesta «Evalúa esta herramienta»",
    "Si la respondes.",
    "Medir la satisfacción y mejorar la herramienta. Si pides acompañamiento, también el nombre y el correo de contacto que nos indiques.",
  ],
  [
    "Datos de uso anónimos",
    "Mientras navegas.",
    "Estadísticas agregadas: evaluaciones iniciadas y completadas, secciones visitadas y descargas del informe.",
  ],
];

export default function PrivacidadPage() {
  return (
    <main style={{ background: T.paper, minHeight: "100vh", color: T.ink }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 56px" }}>
        <Link href="/" style={{ ...link, fontSize: 13, textDecoration: "none" }}>
          ← Volver al inicio
        </Link>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, color: T.ink60, textTransform: "uppercase", margin: "28px 0 8px" }}>
          Evaluación de Impacto Algorítmico · GobLab UAI
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 40, letterSpacing: -1, lineHeight: 1.1, margin: "0 0 10px" }}>
          Política de Privacidad y <em style={{ color: T.burgundy }}>Protección de Datos</em>
        </h1>
        <p style={{ fontSize: 13, color: T.ink60, margin: "0 0 30px" }}>Última actualización: octubre de 2026</p>

        {/* Resumen */}
        <div className="priv-resumen" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40 }}>
          <Resumen titulo="Se queda en tu dispositivo">
            La descripción de tu proyecto, tus respuestas, tu puntaje, tus recomendaciones y el informe PDF. Nada de eso se envía a nuestros servidores.
          </Resumen>
          <Resumen titulo="Lo que guardamos">
            Tu correo y tipo de organización, solo si marcas la casilla de novedades. También los comentarios y valoraciones que nos envías, y la encuesta si la respondes.
          </Resumen>
          <Resumen titulo="Lo que nunca hacemos">
            Vender tus datos, cederlos a terceros, usarlos con fines comerciales o publicitarios, ni usarlos para algo distinto de lo descrito aquí.
          </Resumen>
        </div>

        <Seccion n={1} titulo="¿Quiénes somos?">
          <p style={{ margin: 0 }}>
            Esta herramienta es desarrollada y mantenida por <strong>GobLab UAI</strong>, laboratorio de innovación de la Escuela de Gobierno de la Universidad Adolfo Ibáñez (Santiago, Chile), responsable del tratamiento de los datos descritos en esta política. Contacto: <a href={`mailto:${CONTACTO}`} style={link}>{CONTACTO}</a>.
          </p>
        </Seccion>

        <Seccion n={2} titulo="Lo que se queda en tu dispositivo">
          <p style={{ margin: "0 0 10px" }}>
            Todo lo que respondes en la evaluación (descripción del proyecto, respuestas, puntajes y recomendaciones) se procesa <strong>en tu navegador</strong>. Para que puedas retomar la evaluación, el avance se guarda en el almacenamiento local de tu navegador, asociado al correo que ingresaste.
          </p>
          <p style={{ margin: 0 }}>
            Esa información <strong>no se transmite a nuestros servidores</strong>: permanece en tu dispositivo hasta que la borres desde la configuración de tu navegador. El informe PDF también se genera en tu equipo.
          </p>
        </Seccion>

        <Seccion n={3} titulo="Lo que guardamos y para qué">
          <div style={{ overflowX: "auto", border: `1px solid ${T.roseLight}`, borderRadius: 12, background: "#fff", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: "26%" }}>Dato</th>
                  <th style={{ ...th, width: "30%" }}>Cuándo lo capturamos</th>
                  <th style={th}>Para qué lo usamos</th>
                </tr>
              </thead>
              <tbody>
                {DATOS.map(([dato, cuando, para]) => (
                  <tr key={dato}>
                    <td style={{ ...td, fontWeight: 600, color: T.ink }}>{dato}</td>
                    <td style={td}>{cuando}</td>
                    <td style={td}>{para}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ margin: "0 0 10px" }}>
            <strong>Tu correo solo se guarda si marcas la casilla de novedades.</strong> Si no la marcas, tus comentarios, valoraciones y encuesta se guardan de forma anónima.
          </p>
          <p style={{ margin: 0 }}>
            Usamos esta información <strong>solo</strong> para métricas y estadísticas del proyecto, para mejorar la herramienta y para enviarte novedades si lo autorizaste. Los resultados que publiquemos o reportemos a nuestros financiadores son siempre <strong>agregados y anónimos</strong>.
          </p>
        </Seccion>

        <Seccion n={4} titulo="¿Con quién se comparte?">
          <p style={{ margin: 0 }}>
            <strong>Con nadie.</strong> No vendemos, cedemos ni compartimos tus datos con terceros. La herramienta funciona sobre los servicios de <strong>Vercel</strong>, <strong>Supabase</strong> y <strong>Google Analytics</strong>.
          </p>
        </Seccion>

        <Seccion n={5} titulo="Base legal">
          <p style={{ margin: 0 }}>
            Tratamos tus datos sobre la base de tu <strong>consentimiento</strong>: al marcar la casilla de novedades, al enviar un comentario o al responder la encuesta. Puedes retirarlo en cualquier momento.
          </p>
        </Seccion>

        <Seccion n={6} titulo="¿Cuánto tiempo los conservamos?">
          <p style={{ margin: 0 }}>
            Mientras dure el proyecto o hasta que nos pidas eliminarlos.
          </p>
        </Seccion>

        <Seccion n={7} titulo="Tus derechos">
          <p style={{ margin: 0 }}>
            Puedes pedir <strong>acceso, rectificación, eliminación u oposición</strong> al tratamiento de tus datos, y <strong>retirar tu consentimiento</strong> para dejar de recibir comunicaciones. Escríbenos a <a href={`mailto:${CONTACTO}`} style={link}>{CONTACTO}</a> con el asunto <em>«Datos personales EIA»</em>.
          </p>
        </Seccion>

        <Seccion n={8} titulo="Cambios a esta política">
          <p style={{ margin: 0 }}>
            Si cambiamos la forma en que tratamos los datos, actualizaremos esta página y su fecha, y lo informaremos a quienes autorizaron recibir novedades.
          </p>
        </Seccion>

        <footer style={{ borderTop: `1px solid ${T.roseLight}`, paddingTop: 18, fontSize: 13, color: T.ink60, lineHeight: 1.7 }}>
          GobLab UAI — Escuela de Gobierno, Universidad Adolfo Ibáñez. Santiago, Chile.
          <br />
          Nosotros: <a href="https://www.uai.cl/goblab" target="_blank" rel="noopener noreferrer" style={link}>www.uai.cl/goblab</a>
          {" · "}
          Contacto: <a href={`mailto:${CONTACTO}`} style={link}>{CONTACTO}</a>
        </footer>
      </div>

      <style>{`@media (max-width: 720px) { .priv-resumen { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
