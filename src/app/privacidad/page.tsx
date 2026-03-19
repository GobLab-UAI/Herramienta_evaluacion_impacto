import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad y Consentimiento Informado — EIA GobLab UAI",
  description:
    "Información sobre el tratamiento de datos personales en la Herramienta de Evaluación de Impacto Algorítmico de GobLab UAI.",
};

export default function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Política de Privacidad y Consentimiento Informado
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        Herramienta de Evaluación de Impacto Algorítmico (EIA) — GobLab UAI
        <br />
        Última actualización: marzo de 2026
      </p>

      {/* 1 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. ¿Quiénes somos?</h2>
        <p>
          Esta herramienta es desarrollada y mantenida por{" "}
          <strong>GobLab UAI</strong>, el laboratorio público de innovación de
          la Facultad de Gobierno de la Universidad Adolfo Ibáñez (UAI), con
          sede en Santiago de Chile. El proyecto cuenta con el financiamiento de
          ANID/SUBDIRECCIÓN DE INVESTIGACIÓN APLICADA/IT25I0161.
        </p>
        <p className="mt-2">
          Contacto:{" "}
          <a
            href="mailto:goblab.uai@gmail.com"
            className="text-blue-600 hover:underline"
          >
            goblab.uai@gmail.com
          </a>
        </p>
      </section>

      {/* 2 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. ¿Qué dato personal recopilamos?
        </h2>
        <p>
          El único dato personal que recopilamos es el{" "}
          <strong>correo electrónico</strong> que ingresas voluntariamente al
          comenzar una evaluación, y solo si marcas la casilla de autorización.
        </p>
        <p className="mt-2">
          No recopilamos nombre, RUT, organización ni ningún otro dato de
          identificación personal obligatorio.
        </p>
      </section>

      {/* 3 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          3. ¿Para qué usamos tu correo?
        </h2>
        <p>Tu correo se utiliza exclusivamente para:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Enviarte información sobre el{" "}
            <strong>Proyecto de Algoritmos Éticos</strong> de GobLab UAI.
          </li>
          <li>
            Comunicarte <strong>novedades y actualizaciones</strong> de las
            herramientas de IA responsable.
          </li>
          <li>
            Informarte sobre <strong>nuevas versiones</strong> de la
            Herramienta de Evaluación de Impacto Algorítmico y otras
            herramientas relacionadas.
          </li>
          <li>
            Llevar <strong>estadísticas de uso agregadas</strong> de la
            plataforma (número de evaluaciones iniciadas, distribución por
            organización, etc.).
          </li>
        </ul>
        <p className="mt-3">
          No utilizamos tu correo para fines comerciales, no lo cedemos a
          terceros ni lo usamos para publicidad.
        </p>
      </section>

      {/* 4 */}
      <section className="mb-8 bg-green-50 border border-green-200 rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-3 text-green-800">
          4. Los datos de tu proyecto no se almacenan en nuestros servidores
        </h2>
        <p className="text-green-900">
          Toda la información que ingresas durante el cuestionario —
          descripción del proyecto, respuestas, puntajes y recomendaciones —
          se <strong>procesa localmente en tu navegador</strong> y{" "}
          <strong>nunca es enviada ni almacenada en nuestros servidores</strong>.
        </p>
        <p className="mt-2 text-green-900">
          Para permitirte retomar la evaluación en otra sesión, el progreso se
          guarda temporalmente en el{" "}
          <strong>almacenamiento local de tu navegador</strong> (localStorage),
          asociado al correo que ingresaste. Esta información permanece en tu
          propio dispositivo y se elimina automáticamente tras{" "}
          <strong>7 días de inactividad</strong>. En ningún momento es
          transmitida a nuestros servidores.
        </p>
        <p className="mt-2 text-green-900">
          El informe PDF que puedes descargar al final de la evaluación es
          generado en tu propio dispositivo.
        </p>
      </section>

      {/* 5 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          5. Base legal del tratamiento
        </h2>
        <p>
          El tratamiento de tu correo electrónico se basa en el{" "}
          <strong>consentimiento explícito</strong> que otorgas al marcar la
          casilla <em>"Autorizo el uso de mi correo…"</em> antes de iniciar la
          evaluación. Si no marcas esa casilla, tu correo no es almacenado.
        </p>
      </section>

      {/* 6 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Tus derechos</h2>
        <p>Puedes ejercer en cualquier momento los siguientes derechos:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Acceso:</strong> saber qué datos tenemos sobre ti.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos incorrectos.
          </li>
          <li>
            <strong>Eliminación:</strong> solicitar que eliminemos tu correo de
            nuestra base de datos.
          </li>
          <li>
            <strong>Revocación del consentimiento:</strong> dejar de recibir
            comunicaciones en cualquier momento.
          </li>
        </ul>
        <p className="mt-3">
          Para ejercer estos derechos, escríbenos a{" "}
          <a
            href="mailto:goblab.uai@gmail.com"
            className="text-blue-600 hover:underline"
          >
            goblab.uai@gmail.com
          </a>{" "}
          con el asunto <em>"Datos personales EIA"</em>.
        </p>
      </section>

      {/* 7 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          7. Cambios a esta política
        </h2>
        <p>
          Si realizamos cambios relevantes en el tratamiento de datos, lo
          comunicaremos a través de los mismos correos registrados y
          actualizaremos la fecha de esta página. El uso continuado de la
          herramienta implica la aceptación de la versión vigente.
        </p>
      </section>

      <div className="border-t pt-6 mt-8 text-sm text-gray-500">
        <p>
          GobLab UAI — Facultad de Gobierno, Universidad Adolfo Ibáñez.
          Santiago, Chile.
        </p>
        <p className="mt-1">
          <a href="https://goblab.uai.cl" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            goblab.uai.cl
          </a>
        </p>
      </div>
    </main>
  );
}
