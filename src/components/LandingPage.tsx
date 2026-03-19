'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Send} from 'lucide-react'
import Image from 'next/image'
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"


export function LandingPage() {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [organization, setOrganization] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])
  const [category, setCategory] = useState("Comentario general")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [starting, setStarting] = useState(false)
  const [subscribe, setSubscribe] = useState(true)
  const VERSION = process.env.NEXT_PUBLIC_VERSION || "1.0.0"

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setStarting(true)
    if (subscribe) {
      try {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
      } catch {
        toast({
          variant: "default",
          title: "Advertencia",
          description: "No se pudo registrar el correo, pero puedes continuar con la evaluación.",
        })
      }
    }
    setStarting(false)
    router.push(`/evaluacion?email=${encodeURIComponent(email)}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();                // ← evita navegación
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_type: category,
          description: feedback,
          email: feedbackEmail || email || "anonimo@goblab.cl",
          organization,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast({
              title: "Feedback enviado",
              description: "¡Gracias por tu feedback!",
            });
      setSent(true);
      /* limpiar */
      setFeedback("");
      setOrganization("");
      setFeedbackEmail("");
      setCategory("Comentario general");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="flex h-screen bg-white ">
        {/* Sidebar */}
        <div
          className={`bg-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-96' : 'w-0'
          }`}
        >
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Información</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              <Separator />
              {/* -------- FORMULARIO que llama /api/feedback ---------- */}
              {sent && (
                <Alert
                  variant="default"
                  className="mb-2 flex items-start gap-2 bg-green-50 text-green-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                  <AlertDescription>¡Gracias por tu feedback! Lo hemos recibido.</AlertDescription>
                </Alert>
              )}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-gray-50 p-4 rounded-lg"
              >
                <h3 className="font-semibold flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Feedback
                </h3>

                {/* Email */}
                <Input
                  name="feedbackEmail"
                  type="email"
                  placeholder="Correo electrónico (opcional)"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  maxLength={150}
                />

                {/* Organización */}
                <Input
                  name="organization"
                  placeholder="Organización (opcional)"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  maxLength={150}
                />

                {/* Categoría */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoría</label>
                  {/* se envía en “category” */}
                  <Select value={category} onValueChange={setCategory} name="category">
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comentario general">Comentario general</SelectItem>
                      <SelectItem value="Reporte de error">Reporte de error</SelectItem>
                      <SelectItem value="Sugerencia de mejora">Sugerencia de mejora</SelectItem>
                      <SelectItem value="Pregunta">Pregunta</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensaje */}
                <Textarea
                  name="message"
                  placeholder="Comparte tus comentarios aquí"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />

                {/* asunto opcional */}
                <input type="hidden" name="subject" value={`Feedback ${category}`} />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando…" : <><Send className="mr-2 h-4 w-4" /> Enviar Feedback</>}
                </Button>
              </form>
              <Separator />
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold">Agradecimientos</h3>
                <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
                  <Image
                    src="/images/ANID.png"
                    alt="Agencia Nacional de Investigación y Desarrollo"
                    width={150}
                    height={50}
                  />
                  <p className="break-words overflow-wrap">Esta investigación ha sido realizada por GobLab UAI, el laboratorio público de innovación de la Facultad de Gobierno de la Universidad Adolfo Ibáñez de Chile. Cuenta con el apoyo de la siguiente subvención: ANID/SUBDIRECCIÓN DE INVESTIGACIÓN APLICADA/IT25I0161</p>
                </div>

                <h3 className="font-semibold">Exención de responsabilidad</h3>
                <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
                  <p className="break-words overflow-wrap">
                    La evaluación de impacto algorítmico es una herramienta desarrollada para dimensionar los
                    riesgos asociados al uso de sistemas algorítmicos de ciencia de datos e inteligencia artificial
                    (IA) en el sector público. La evaluación está diseñada únicamente como un soporte para quienes buscan
                    dimensionar las consideraciones sobre el desarrollo de sus modelos, con el
                    fin de fomentar el cumplimiento de las regulaciones para los modelos  que utilizan IA o ciencia de datos.
                  </p>
                  <p className="break-words overflow-wrap">
                    La Universidad Adolfo Ibáñez (UAI) no ofrece garantías sobre el funcionamiento o el desempeño de
                    los sistemas de ciencia de datos e IA que utilicen esta herramienta. La Universidad no es responsable de
                    ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de
                    beneficios que puedan surgir directa o indirectamente de la aplicación de la herramienta.
                  </p>
                  <p className="break-words overflow-wrap">
                    El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello
                    ni certificado de aprobación por parte de la Universidad Adolfo Ibáñez respecto al cumplimiento
                    legal, ético o funcional de un algoritmo de inteligencia artificial.
                  </p>
                  <p className="break-words overflow-wrap">
                    Aquellos interesados en ser considerados como un caso de éxito mediante el uso de estas herramientas
                    de IA responsable deben inscribirse en los pilotos a través del formulario
                    https://algoritmospublicos.cl/quiero_participar.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto ">
          <div className="max-w-3xl mx-auto p-8" >
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mb-4"> 
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <div className="flex justify-between space-y-4 p-4 rounded-lg backdrop-blur-sm">
              <Image src="/images/logo-goblab-uai.png" alt="Gob_Lab UAI" width={300} height={10} />
              <Image src="/images/herramientas.png" alt="HERRAMIENTAS ALGORITMOS ÉTICOS" width={200} height={10} />
            </div>
            <p className="text-sm text-gray-600">V.{VERSION}</p>
            <h1 className="text-4xl font-bold mb-6">Evaluación de impacto algorítmico (EIA)</h1>
            <div className="space-y-6 mb-8 text-gray-700">
             
              <p>
                Esta herramienta guía a los equipos de desarrollo en la identificación de posibles riesgos, como sesgos en los datos, falta de equidad, problemas de
               privacidad o ciberseguridad, y permite diseñar estrategias de mitigación antes de que los sistemas entren en funcionamiento. Además, la EIA asegura 
               que los procesos algorítmicos se ajusten a los principios de transparencia y rendición de cuentas, esenciales en la gestión pública.
              </p>

              <p>
              La evaluación se realiza a través de un cuestionario estructurado en 11 áreas clave, que abarcan desde la proporcionalidad del uso del algoritmo hasta
              la gobernanza del sistema y su impacto en la equidad y los derechos humanos. El resultado de esta evaluación proporciona un marco claro y accionable 
              para mejorar la implementación del sistema algorítmico, permitiendo tomar decisiones informadas sobre su desarrollo y despliegue.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Para obtener los mejores resultados, recomendamos que un equipo multidisciplinario participe 
                      en el proceso de completar esta ficha.
                    </p>
                  </div>
                </div>
              </div>
              <p>
                Al finalizar, podrás descargar las recomendaciones y el informe de evaluación en formato PDF.
              </p>
            </div>
  
            <form onSubmit={handleStart} className="bg-gray shadow-2xl shadow-inner rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Comienza tu evaluación</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="subscribe"
                    type="checkbox"
                    checked={subscribe}
                    onChange={(e) => setSubscribe(e.target.checked)}
                    className="mt-1 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="subscribe" className="text-sm text-gray-600 cursor-pointer">
                    Autorizo el uso de mi correo para recibir información sobre el proyecto y novedades de la herramienta.
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={starting}>
                  {starting ? "Iniciando..." : "Iniciar Evaluación"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="font-semibold mb-2 text-gray-700">Aviso de Privacidad</h3>
              <p>
                Tu correo electrónico será utilizado para enviarte información sobre el proyecto de algoritmos éticos de GobLab UAI. La información del cuestionario es procesada localmente en tu navegador y no es almacenada por la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}