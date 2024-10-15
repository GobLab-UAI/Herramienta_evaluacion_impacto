'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, HelpCircle, Send} from 'lucide-react'
import Image from 'next/image'

export function LandingPage() {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [organization, setOrganization] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/evaluacion?email=${encodeURIComponent(email)}`)
  }

  return (
      <div className="flex h-screen bg-white ">
        {/* Sidebar */}
        <div className={`bg-gray-100 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Información</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator />
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
                
                <h3 className="font-semibold flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Feedback</h3>
                <Input
                  placeholder="Organización"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  maxLength={150}
                />
                <Textarea
                  placeholder="Comparte tus comentarios o sugerencias aquí"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Enviar Feedback
                </Button>
              </div>
              <Separator/>
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold">Agradecimientos</h3>
                <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
                  <Image src="/images/ANID.png" alt="Agencia Nacional de Investigación y Desarrollo" width={150} height={50} />
                  <p>Subdirección de Investigación Aplicada/Concurso IDeA I+D 2023 proyecto ID23I10357</p>
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
              <Image src="/images/Logo_herramientas_algoritmos.png" alt="HERRAMIENTAS ALGORITMOS ÉTICOS" width={300} height={10} />
              <Image src="/images/Goblab.png" alt="Gob_Lab UAI" width={250} height={10} />
              
            </div>
            <p className="text-sm text-gray-600">V.0.0.2</p>
            <h1 className="text-4xl font-bold mb-6">Evaluación de impacto algorítmico (EIA)</h1>
            <div className="space-y-6 mb-8 text-gray-700">
              <p>
              La herramienta de Evaluación de Impacto Algorítmico (EIA) es un recurso diseñado para analizar y gestionar los riesgos asociados al uso de sistemas 
              algorítmicos y de inteligencia artificial en el sector público. Su objetivo principal es garantizar que dichos sistemas sean implementados de manera 
              ética, segura y transparente, cumpliendo con las normativas locales e internacionales y protegiendo los derechos de las personas afectadas por sus 
              decisiones.
              </p>
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
                Al finalizar, podrás descargar las recomendaciones y el informe de evaluación en formato PDF para compartir con tu equipo y otras partes interesadas.
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
                <Button type="submit" className="w-full">Iniciar Evaluación</Button>
              </div>
            </form>
  
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="font-semibold mb-2 text-gray-700">Aviso de Privacidad</h3>
              <p>
                La información ingresada en esta herramienta no es almacenada por la plataforma. 
                Todos los datos son procesados localmente en tu navegador para garantizar tu privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}