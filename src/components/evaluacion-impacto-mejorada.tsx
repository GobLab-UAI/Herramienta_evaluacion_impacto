'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, HelpCircle, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import jsPDF from 'jspdf' 


type QuestionType = 'text' | 'select' | 'multiselect' | 'yesno' | 'yesnoNA'

type Option = {
  value: string
  label: string
}

type Question = {
  id: string
  text: string
  type: QuestionType
  dimension: string
  stage: 'Conceptualización y diseño' | 'Uso y monitoreo' | 'Recolección y procesamiento de datos'
  info?: string
  options?: Option[]
}

type Answer = string | string[] | boolean | null

type Condition = (answer: boolean | string | null) => boolean;

type Recommendation = {
  questionId: string;
  recommendations: Array<{
    text: string;
    condition: Condition;
    resource?: {
      text: string
      url: string
    }
  }>;

};

const dimensions = [
  "General", "Proporcionalidad", "Normativa", "Licencia Social", "Gobernanza",
  "Protección de datos", "Ciberseguridad", "Equidad", "Transparencia", "Rendición de cuentas"
]

const questions: Question[] = [
  { 
    id: "q1", 
    text: "Nombre del proyecto", 
    type: "text",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Escriba el nombre del proyecto que está evaluando."
  },
  { 
    id: "q2", 
    text: "Descripción del proyecto", 
    type: "text",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Describa brevemente el proyecto que está evaluando."
  },
  { 
    id: "q3", 
    text: "Fase Actual", 
    type: "select",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Elija una opción entre: conceptualización y diseño, uso y monitoreo, recolección y procesamiento de datos.",
    options: [
      { value: "conceptualizacion", label: "Conceptualización y diseño" },
      { value: "recoleccion", label: "Recolección y procesamiento de datos" },
      { value: "uso", label: "Uso y monitoreo" }
    ]
  },
  { 
    id: "q4", 
    text: "Indique las principales razones para la automatización de este proceso de toma de decisiones", 
    type: "multiselect",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "",
    options: [
      { value: "Utilizar enfoques innovadores", label: "Utilizar enfoques innovadores" },
      { value: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable", label: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable" },
      { value: "Reducción de los costos de un programa existente", label: "Reducción de los costos de un programa existente" },
      { value: "Mejorar la calidad general de las decisiones", label: "Mejorar la calidad general de las decisiones" }
    ]
  },
  { 
    id: "q5", 
    text: "¿Es este proyecto una ampliación o adaptación de algún proyecto existente?", 
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: ""
  },
  { 
    id: "q6", 
    text: "¿El sistema de IA, incluido el modelo central, se basa en un modelo ya existente?", 
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Por ejemplo, tu sistema usa o implementa BERT, ChatGPT, etc."
  },
  { 
    id: "q7", 
    text: "¿Ha documentado con claridad la descripción del problema que busca resolver?", 
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q8", 
    text: "¿Se ha considerado detenidamente las opciones no algorítmicas que pueden utilizarse para lograr el mismo objetivo?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q9", 
    text: "¿Por qué se favorece la opción que implica un sistema basado en algoritmos?", 
    type: "select",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: " ",
    options: [
      { value: "Utilizar enfoques innovadores", label: "Utilizar enfoques innovadores" },
      { value: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable", label: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable" },
      { value: "Reducción de los costos de un programa existente", label: "Reducción de los costos de un programa existente" },
      { value: "Mejorar la calidad general de las decisiones", label: "Mejorar la calidad general de las decisiones" }
    ]
  },
  { 
    id: "q10", 
    text: "¿Ha revisado casos similares y sus impactos?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q11", 
    text: "¿Son los impactos que ha identificado reversibles?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: " "

  },
  { 
    id: "q12", 
    text: "¿La aplicación del sistema tiene algún impacto en derechos humanos?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: "Por ejemplo, impácto en la privacidad, libertad de expresión o debido proceso"
  },
  { 
    id: "q13", 
    text: "¿Se implementa el algoritmo para la ejecución de una normativa específica?", 
    type: "yesno",
    dimension: "Normativa", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q14", 
    text: "¿Has identificado las normativas que pueden impactar en el sistema y el proyecto en el que se inserta?", 
    type: "yesno",
    dimension: "Normativa", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q15", 
    text: "¿El proyecto y/o sus objetivos están relacionados con temas de intenso debate público que podrían generar judicialización o peticiones administrativas?", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q16", 
    text: "¿Se han diseñado mecanismos de participación ciudadana para recibir retroalimentación del sistema?", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q17", 
    text: "¿Se han diseñado mecanismos de participación ciudadana para la difusión del sistema? ", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: " "
    
  },
  { 
    id: "q18", 
    text: "¿Existen recursos monetarios (presupuesto) del proyecto para ejecutar los mecanismos de participación?", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q19", 
    text: "¿Existe alguna unidad interna encargada de supervisar la gobernanza (operación, manejo, despliegue) de la solución desarrollada?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Uso y monitoreo",
    info: " "
  },
  { 
    id: "q20", 
    text: "¿El equipo de desarrollo interno estará compuesto por un grupo diverso de personas en términos de raza, género y orientación, entre otros criterios sociodemográficos?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Uso y monitoreo",
    info: " "
  },
  { 
    id: "q21", 
    text: "¿Está documentado el proceso de toma de decisiones del sistema?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Uso y monitoreo",
    info: " "
  },
  { 
    id: "q22", 
    text: "¿Están todas las contrapartes internas identificadas?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q23", 
    text: "¿Están todas las contrapartes internas involucradas en el proyecto?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q24", 
    text: "¿Utilizará el sistema datos personales como datos de entrada para la toma de decisiones automatizadas?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Conceptualización y diseño",
    info: " "
  },
  { 
    id: "q25", 
    text: "¿El sistema utilizará datos personales sensibles o especialmente protegidos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  { 
    id: "q26", 
    text: "¿El sistema utilizará los datos personales para tomar decisiones que afecten directamente a las mismas personas titulares de dichos datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  { 
    id: "q27", 
    text: "¿Los datos son recogidos por sensores automatizados?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  { 
    id: "q28", 
    text: "Si los datos provienen de entidades externas, ¿existen acuerdos escritos detallando las condiciones para el acceso a datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: ""
  },
  { 
    id: "q29", 
    text: "¿Se aplica el principio de minimización de datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "En otras palabras, ¿existe una evaluación ex ante en cuanto a la pertinencia y necesidad de incluir cada uno de los tipos de datos en el sistema?"
  },
  { 
    id: "q30", 
    text: "¿Se anonimizan o seudonimizan los datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  { 
    id: "q31", 
    text: "Se implementará el sistema para algunos de estos usos o casos:  a) Evaluación sistemática y exhaustiva de aspectos personales de los titulares de datos, basadas en tratamiento o decisiones automatizadas, como la elaboración de perfiles, y que produzcan en ellos efectos jurídicos significativos. b) Tratamiento masivo de datos o gran escala. c) Tratamiento que implique observación o monitoreo sistemático de una zona de acceso público. d) Tratamiento de datos sensibles y especialmente protegidos, en las hipótesis de excepción del consentimiento.", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q32",
    text: "Cuenta la entidad con procesos espablecidos para el ejercicio de los derechos vinculados a los datos: Acceso, Rectificación, Supresión, Opocisión, Portabilidad e Impugnación a las decisiones automatizadas?", 
    type: "select",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    options: [
      { value: "Si", label: "Sí" },
      { value: "Si, pero parcialmente", label: "SI, pero solo parcialmente ( Acceso, Rectificación, Supresión, Opocisión)" },
      { value: "No", label: "No" }
    ]
  },
  { 
    id: "q33",
    text: "Se enmarca la decisión automatizada en alguna de estas hipótesis: a) Es necesaria para la celebración o ejecución de un contrato entre el titular y el responsable; b) Existe consentimiento previo y expreso del titular en la forma prescrita en el artículo 12 de la presente ley, o c) La decisión automatizada la dispone la ley. ", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q34",
    text: "¿Se han diseñado medidas necesarias para asegurar  explicaciones adecuadas para ayudar a los usuarios y otras personas afectadas a comprender el proceso de toma de decisiones o el funcionamiento del sistema?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q35",
    text: "¿Forma parte su organización de la administración del Estado ( Ministerios, las Delegaciones Presidenciales Regionales y  Provinciales, los Gobiernos Regionales, las Municipalidades, las Fuerzas Armadas, las Fuerzas de Orden y Seguridad Pública, las empresas públicas creadas por ley, y los órganos y servicios públicos creados para el cumplimiento de la función administrativa) o empresa del Estado en que éste tenga participación accionaria superior al 50% o mayoría en el directorio?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q36",
    text: "¿Su organización depende de prestar servicios mediante redes y sistemas informáticos, y la afectación, interceptación, interrupción o destrucción de sus servicios tendría un impacto significativo en la seguridad y el orden público, en la provisión continua y regular de servicios esenciales, en el efectivo cumplimiento de las funciones del Estado o, en general, de los servicios que éste debe proveer o garantizar?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q37",
    text: "¿Posee su organización una política de seguridad de la información o ciberseguridad?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q38",
    text: "¿Ha implementado un sistema de gestión de seguridad de la información continuo con el fin de determinar aquellos riesgos que puedan afectar la seguridad de las redes, sistemas informáticos y datos, y la continuidad operacional del servicio?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q39",
    text: "¿El sistema o la politica de ciberseguridad tienen menciones especiales a alos sistemas de IA que gestiona la organización?",
    type: "yesno", 
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " "
  },
  {
    id: "q40",
    text: "¿Utiliza el sistema datos que representen algunas de estas  caracteristicas? : la raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el sexo, la maternidad, la lactancia materna, el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad. ", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q41",
    text: "¿La ley lo obliga a fundar sus decisiones en alguna de las características descritas anteriormente?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q42",
    text: "¿El sistema utilizará datos de varias bases de datos o fuentes diferentes?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q43",
    text: "¿El algoritmo fue desarrollado originalmente fuera de Chile o para un contexto distinto al propuesto?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q44",
    text: "¿Está planificado realizar un análisis exploratorio inicial de los datos para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q45",
    text: "¿El algoritmo participa de una decisión que forma parte de un proceso administrativo?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q46",
    text: "Se enmarca el sistema en alguna de estas finalidades:  las áreas de educación, empleo, servicios básicos, subsidios y ayuda económica, capacitación laboral,  salud, seguridad pública, vivienda, protección social, autorizaciones o permisos administrativos.", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q47",
    text: "¿Saben las personas que la decisión está mediada por un sistema de IA o algoritmos de IA o tomada sobre la base de los mismos?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q48",
    text: "Existe una  imposibilidad técnica real, conforme con el estado del arte, y derivada, por ejemplo, de sistemas de decisiones automatizadas o semiautomatizadas basados en sistemas de aprendizaje automático (cajas negras), de entregar información respecto del funcionamiento y resultados del algoritmo?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q49",
    text: "¿El algoritmo estará protegido por derechos de propiedad intelectual de terceros desarrolladores?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q50",
    text: "¿Será exigida la entrega de Código fuente al tercero desarrollador?", 
    type: "yesnoNA",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
   
  },
  {
    id: "q51",
    text: "¿Has considerado algún mecanismo para que las partes interesadas se comuniquen con la institución por los efectos o impactos que pueda producir el sistema? ", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
  },
  {
    id: "q52",
    text: "Indique las principales características del sistema a desarrollar", 
    type: "select",
    dimension: "Rendición de cuentas", 
    stage: "Uso y monitoreo",
    options: [
      { value: "Sistemas de reconocimiento y de detección de eventos", label: "Sistemas de reconocimiento y de detección de eventos" },
      { value: "Predicción", label: "Predicción" },
      { value: "Personalización", label: "Personalización" },
      { value: "Soporte de interacción", label: "Soporte de interacción" },
      { value: "Optimización", label: "Optimización" },
      { value: "Razonamiento con estructuras de conocimiento", label: "Razonamiento con estructuras de conocimiento" }
    ]
  },
  {
    id: "q53",
    text: "¿El sistema automatizado va a ser utilizado reemplazando la toma de decisiones?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q54",
    text: "¿El sistema está completamente automatizado? ",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q55",
    text: "¿Se proporciona un mecanismo para obtener retroalimentación de los usuarios durante la operación del sistema?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q56",
    text: "¿Están planificadas auditorías algorítmicas?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q57",
    text: "¿Existe presupuesto para la realización de dichas auditorias algorítmicas?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q58",
    text: "¿Existe algún diseño para atender requerimientos de información de usuarios externos respecto del sistema?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
  {
    id: "q59",
    text: "¿Se ha planificado  el resguardo de documentación tecnica, minutas de reuniones, actas y en general de la documentación que vaya justificando las decisiones que se adopten en el proyecto?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " "
  },
];

const recommendations: Recommendation[] = [
  /*
  { 
    questionId: "q1", 
    text: "Definición clara del problema que se busca resolver", 
    condition: (answer) => answer === false
  },
  { 
    questionId: "q2", 
    text: "Considerar las opciones no algorítmicas que pueden utilizarse para lograr el mismo objetivo", 
    condition: (answer) => answer === false
  },
  { 
    questionId: "q3", 
    text: "Justificar el uso de un sistema basado en algoritmos en lugar de opciones alternativas", 
    condition: (answer) => (answer as string[]).length === 0
  },*/
  { 
    questionId: "q4", 
    recommendations: [
      /*{
        text: " ",
        condition: (answer: string[]) => !answer.includes("Utilizar enfoques innovadores")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Reducción de los costos de un programa existente")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Mejorar la calidad general de las decisiones")
      }*/
    ]
  }, 
  {
    questionId: "q5",
    recommendations: [
      {
        text: "Como parte de garantizar la equidad y la no discriminación, las soluciones de IA deben implementarse verificando su adaptación al contexto local, y respetando el multilingüismo y la diversidad cultural.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q6",
    recommendations: [
      {
        text: "Como parte de garantizar la equidad y la no discriminación, las soluciones de IA deben implementarse verificando su adaptación al contexto local, y respetando el multilingüismo y la diversidad cultural.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q7",
    recommendations: [
      {
        text: "La definición del problema de política pública que se busca resolver es un paso clave, no solo en proyectos de IA si no en ciclo mismo de política pública. Identifique claramente un problema prioritario que la entidad se vea abocada a resolver y para el cual una herramienta basada en IA represente un valor agregado. Determine cual es el estado actual de respuesta de la institución, identificar sus limitantes y áreas de oportunidad, y luego indique  de qué manera el sistema de soporte o toma de decisiones basado en IA podría mejorar la situación actual. Delimitar las razones en términos de ahorro  de tiempo y aumento de eficiencia dentro de la institución, puede ser beneficioso, sin embargo la IA puede resultar una herramienta costosas en términos de los recursos y del tiempo que exige su desarrollo. En tal sentido, es clave identificar claramente un problema prioritario que la entidad se vea abocada a resolver y para el cual una herramienta basada en IA represente un valor agregado. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Uso responsable de IA para política pública: manual de formulación de proyectos",
          url: "https://publications.iadb.org/es/uso-responsable-de-ia-para-politica-publica-manual-de-formulacion-de-proyectos"
        }

      }
    ]
  },
  {
    questionId: "q8",
    recommendations: [
      {
        text: "La definición del problema de política pública que se busca resolver es un paso clave, no solo en proyectos  basados en algoritmos o  IA si no en ciclo mismo de política pública. Identifique claramente un problema prioritario que la entidad se vea abocada a resolver y para el cual una herramienta basada en IA represente un valor agregado. Determine cual es el estado actual de respuesta de la institución, identificar sus limitantes y áreas de oportunidad, y luego indique  de qué manera el sistema de soporte o toma de decisiones basado en IA podría mejorar la situación actual. Delimitar las razones en términos de ahorro  de tiempo y aumento de eficiencia dentro de la institución, puede ser beneficioso, sin embargo la IA puede resultar una herramienta costosas en términos de los recursos y del tiempo que exige su desarrollo. En tal sentido, es clave identificar claramente un problema prioritario que la entidad se vea abocada a resolver y para el cual una herramienta basada en IA represente un valor agregado. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Uso responsable de IA para política pública: manual de formulación de proyectos",
          url: "https://publications.iadb.org/es/uso-responsable-de-ia-para-politica-publica-manual-de-formulacion-de-proyectos"
        }
      }
    ]
  },
  {
    questionId: "q9",
    recommendations: [
      
      
    ]
  },
  {
    questionId: "q10",
    recommendations: [
      {
        text: "Una buena  práctica recomendada es estudiar experiencias comparadas de implementación de herramientas similares en otras instituciones o en otros países. De esta forma se tendrá información sobre los retos y desafíos que se debieron afrontar, lo cual también contribuirá a determinar la factibilidad del proyecto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Uso responsable de IA para política pública: manual de formulación de proyectos",
          url: "https://publications.iadb.org/es/uso-responsable-de-ia-para-politica-publica-manual-de-formulacion-de-proyectos"
        }
      },
    ]
  },
  {
    questionId: "q11",
    recommendations: [
      {
        text: " El sistema de IA elegido debería ser adecuado al contexto y basarse en fundamentos científicos rigurosos. En los casos en que se entienda que las decisiones tienen un impacto irreversible o difícil de revertir o que pueden implicar decisiones de vida o muerte, la decisión final debería ser adoptada por un ser humano. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Recomendación sobre la ética de la inteligencia artificial | UNESCO",
          url: "https://www.unesco.org/es/articles/recomendacion-sobre-la-etica-de-la-inteligencia-artificial"
        }
      },
    ]
  },
  {
    questionId: "q12",
    recommendations: [
      {
        text: "Los derechos de las personas pudieran verse en ciertos contextos impactados pot la implementación de la IA, por tanto el sistrema elegido   debería ser adecuado y proporcional para lograr un objetivo legítimo determinado; Debe realizarse una  evaluación del contexto para gestionar estas posibles tensiones. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true,
        resource: {
          text: "Evaluacion de impacto en DDHH",
          url: ""
        }
      },
    ]
  },
  {
    questionId: "q13",
    recommendations: [
      {
        text: "Si se tratan datos personales, el consentimiento no es la base de licitud si no la ley. Deben igualmente implemementarse las salvaguardas del  8 bis inciso final: Explicabilidad, Derecho a la información y transparencia, Intervención humana, expresar su punto de vista y solicitar una revisión de la decisión. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true,
        resource: {
          text: "Ley 19628, 8 bis y 20. ",
          url: "https://www.bcn.cl/leychile/navegar?idNorma=1195453"
        }
      },
    ]
  },
  {
    questionId: "q14",
    recommendations: [
      {
        text: "Si se tratan datos personales, el consentimiento no es la base de licitud si no la ley. Deben igualmente implemementarse las salvaguardas del  8 bis inciso final: Explicabilidad, Derecho",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Guía formulación ética de proyectos de ciencia de datos",
          url: "https://digital.gob.cl/transformacion-digital/estandares-y-guias/guia-formulacion-etica-de-proyectos-de-ciencia-de-datos/"
        }

      },
    ]  
  },
  {
    questionId: "q15",
    recommendations: [
      {
        text: "Las instituciones públicas deben actuar siempre bajo un marco legal acotado y definido. Es clave para la rendición de cuentas identificar no solo la normativa habilitante para el uso de datos si no sus condiciones particulares. Puede consultar una guia basada en la normativa chilena que ayude a identificar las principales normativas",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q16",
    recommendations: [
      {
        text: "Las instituciones públicas deben actuar siempre bajo un marco legal acotado y definido. Es clave para la rendición de cuentas identificar no solo la normativa habilitante para el uso de datos si no sus condiciones particulares. Puede consultar una guia basada en la normativa chilena que ayude a identificar las principales normativas",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q17",
    recommendations: [
      {
        text: "Las instituciones públicas deben actuar siempre bajo un marco legal acotado y definido. Es clave para la rendición de cuentas identificar no solo la normativa habilitante para el uso de datos si no sus condiciones particulares. Puede consultar una guia basada en la normativa chilena que ayude a identificar las principales normativas",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q18",
    recommendations: [
      {
        text: "Las instituciones públicas deben actuar siempre bajo un marco legal acotado y definido. Es clave para la rendición de cuentas identificar no solo la normativa habilitante para el uso de datos si no sus condiciones particulares. Puede consultar una guia basada en la normativa chilena que ayude a identificar las principales normativas",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q19",
    recommendations: [
      {
        text: "Considerar la posibilidad de añadir una función de responsable independiente de la ética de la IA o algún otro mecanismo para supervisar las actividades relacionadas con la evaluación del impacto ético, las auditorías y el seguimiento continuo, así como para garantizar la orientación ética de los sistemas de IA. También es útil verificar  formas de gobernanza “blanda”, por ejemplo, un mecanismos de certificación disponibles para los sistemas de IA en todo o parte a fin de garantizar rendición de cuentas sobre todo en ámbito de aplicación sensibles, como la salud, medio ambiente, infancia, servicios sociales, etc. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      },
      {
        text: "Considerar la posibilidad de añadir una función de responsable independiente de la ética de la IA o algún otro mecanismo para supervisar las actividades relacionadas con la evaluación del impacto ético, las auditorías y el seguimiento continuo, así como para garantizar la orientación ética de los sistemas de IA. También es útil verificar  formas de gobernanza “blanda”, por ejemplo, un mecanismos de certificación disponibles para los sistemas de IA en todo o parte a fin de garantizar rendición de cuentas sobre todo en ámbito de aplicación sensibles, como la salud, medio ambiente, infancia, servicios sociales, etc. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q20",
    recommendations: [
      {
        text: "Debe alentarse la participación y el compromiso de las mujeres en todas las etapas del ciclo de vida de los sistemas de IA, encaminado a lograr una participación equilibrada de hombres y mujeres ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q21",
    recommendations: [
      {
        text: "Obligaciones de transprencia si hay uso de datos personales.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q22",
    recommendations: [
      {
        text: "Los proyectos de inteligencia artificial exigen la vinculación de diversos profesionales de la misma entidad pública, aunque también de otras organizaciones relacionadas. Participan  los responsables de los datos, de la infraestructura de TI y del problema o proceso en cuestión, así  como expertos en analítica de datos, del área legal y de comunicaciones",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Los proyectos de inteligencia artificial exigen la vinculación de diversos profesionales de la misma entidad pública, aunque también de otras organizaciones relacionadas. Participan  los responsables de los datos, de la infraestructura de TI y del problema o proceso en cuestión, así  como expertos en analítica de datos, del área legal y de comunicaciones",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q23",
    recommendations: [
      {
        text: "Los proyectos de inteligencia artificial exigen la vinculación de diversos profesionales de la misma entidad pública, aunque también de otras organizaciones relacionadas. Participan  los responsables de los datos, de la infraestructura de TI y del problema o proceso en cuestión, así  como expertos en analítica de datos, del área legal y de comunicaciones",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Los proyectos de inteligencia artificial exigen la vinculación de diversos profesionales de la misma entidad pública, aunque también de otras organizaciones relacionadas. Participan  los responsables de los datos, de la infraestructura de TI y del problema o proceso en cuestión, así  como expertos en analítica de datos, del área legal y de comunicaciones",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]

  },
  {
    questionId: "q24",
    recommendations: [
      {
        text: "De acuerdo a sus respuesta aplica la normativa de protección de datos. Esto significa que deben verificarse las condiciones de licitud del tratamiento, transparencia e información a usuarios y procedimientos relativos al ejercicio de derechos vinculados a la protección de datos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q25",
    recommendations: [
      {
        text: "De acuerdo a sus respuesta, el proyecto aplica la normativa de protección de datos. Esto significa que deben verificarse las condiciones de licitud",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q26",
    recommendations: [
      {
        text: "Si su sistema utilizará datos personales verificar procedimiento de ejercicio de derechos ARCO",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q27",
    recommendations: [
      {
        text: "Fortalecer deberes de información y transparencia en la recogida",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q28",
    recommendations: [
      {
        text: "Verificar condiciones legales de la cesión de datos personales:a)consentimiento o ley habilitante b) contrato escrito c) finalidad de la cesión",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q29",
    recommendations: [
      {
        text: "Preparar analisis de proporcionalidad que garantice que los datos personales que se traten deben limitarse estrictamente a aquellos que resulten necesarios, adecuados y pertinentes en relación con los fines del tratamiento",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q30",
    recommendations: [
      {
        text: "Evaluar los procedimientos de seguridad y la necesidad de contar con datos personales identificados para el tratamiento. La ley exige al responsable y al encargado del tratamiento aplicar las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, que en su caso incluya, entre otros, la seudonimización y el cifrado de datos personales",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q31",
    recommendations: [
      {
        text: "Procede realizar una evaluación de impacto en protección de datos personales. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q32",
    recommendations: [
      {
        text: "Implemente procesos completos para el ejercicio de todos los derechos vinculados a los datos",
        condition: (answer: boolean | string | null) => answer === "Si, pero parcialmente" || answer === "No"
      },
      {
        text: "Asegúrese de incluir procesos para la portabilidad e impugnación de decisiones automatizadas",
        condition: (answer: boolean | string | null) => answer === "Si, pero parcialmente"
      },
      {
        text: "Desarrolle urgentemente procesos para el ejercicio de los derechos vinculados a los datos",
        condition: (answer: boolean | string | null) => answer === "No"
      }
    ]
  },
  {
    questionId: "q33",
    recommendations: [
      {
        text: "Aplica el derecho de opocisión al tratamiento de las decisiones automatizadas. Deben igualmente implemementarse las salvaguardas del  8 bis inciso final: Explicabilidad, Derecho a la información y transparencia, Intervención humana, expresar su punto de vista y solicitar una revisión de la decisión. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
      {
        text: "No aplica el derecho de opocisión al tratamiento de las decisiones automatizadas. Deben igualmente implemementarse las salvaguardas del  8 bis inciso final: Explicabilidad, Derecho a la información y transparencia, Intervención humana, expresar su punto de vista y solicitar una revisión de la decisión. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q34",
    recommendations: [
      {
        text: "Evaluar herramientas que permitan transparentar factores o elementos que tome en cuenta el algoritmo para llegar al resultado. El sector público está sujeto a normativas de transparencia en la función publica reforzadas por mandatos de la ley de datos personales frente a la toma de decisiones automatizadas. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q35",
    recommendations: [
      {
        text: "De acuerdo a sus respuestas la entidad está calificada como servicio escencial debiendo cumplir los estándares dictados por la ANCI para los servicios esenciales. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q36",
    recommendations: [
      {
        text: "De acuerdo a sus respuesta, la entidad podria estar calificada como operador de importancia vital lo que la obliga a cumplir los requisitos de ciberseguridad de la ley 21663 en particular el articulo 8°",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q37",
    recommendations: [
      {
        text: "Si se trata de un sistema que será desarrollado por un tercero subcontratado, deben incluirse clausulas que obliguen al tercero  a observar su politica. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "La ciberseguridad debe ser una consideración fundamental en el diseño, desarrollo, implementación y operación de todos los sistemas de IA. Al implementar medidas de ciberseguridad adecuadas, las organizaciones pueden ayudar a proteger sus sistemas de IA contra amenazas y reducir el riesgo de daños potenciales. las ciberamenazas a los sistemas de IA pueden tener graves consecuencias, como: Pérdida de datos confidenciales o sensibles, interrupción o inhabilitación de sistemas de IA críticos, manipulación de datos o algoritmos de IA para producir resultados incorrectos o dañinos. Si se trata de un sistema que será desarrollado por un tercero subcontratado, deben incluirse clausulas que obliguen al tercero a observar su politica. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q38",
    recommendations: [
      {
        text: "Si la respuesta de la 7.2 fue positiva, la organziación está en incumplimiento en este punto. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q39",
    recommendations: [
      {
        text: "Los sistemas de IA son activos cibernéticos dentro de una infraestructura de TIC. Cada uno de sus componentes fuentes de datos, datos, algoritmos, modelos de entrenamiento, procesos de implementación/gestión de datos/pruebas.Estos componentes  pertenecen a las capas de una infraestructura de TIC de la organización. Dado que los sistemas de IA son parte de la infraestructura de las TIC, no solo se deben aplicar prácticas de ciberseguridad específicas de la IA, sino también aquellas que protejan las TIC que abarcan los elementos de la IA. Un buen enfoque para abordar la especificidad de la ciberseguridad por 'capas' es la guia de ENISA, que ofrece un cuestionario de evaluación de preparación en este sentido. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q40",
    recommendations: [
      {
        text: "La ley 21609 prohíbe las discriminaciones arbitrarias basadas en raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el sexo, la maternidad, la lactancia materna, el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad. Si el sistema utilizará algunas de esas variables para decidir o están presentes en los datos, deben realizarse mediciones que permitan garantizar el cumplimiento legal a través de la protección de estos grupos vulnerables. Estas categorías protegidas que deberán entonces ser consideradas en las evaluaciones sobre sesgo algorítmico, las cuales deben permitir comparar los resultados del sistema respecto de distintos subgrupos de la población, considerando las categorías protegidas, buscando que los resultados no difieran entre ellos. Para realizar lo anterior el equipo deberá seleccionar  las dimensiones importantes en las cuales la muestra de datos pueda generar diferencias entre los distintos subgrupos. Se recomienda utilizar literatura relacionada con el tema y  consultar información de expertos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]

  },  
  {
    questionId: "q41",
    recommendations: [
      {
        text: "La ley 21609 prohíbe las discriminaciones arbitrarias basadas en raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el sexo, la maternidad, la lactancia materna, el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad. Si el sistema utilizará algunas de esas variables para decidir o están presentes en los datos, deben realizarse mediciones que permitan garantizar el cumplimiento legal a través de la protección de estos grupos vulnerables. Estas categorías protegidas que deberán entonces ser consideradas en las evaluaciones sobre sesgo algorítmico, las cuales deben permitir comparar los resultados del sistema respecto de distintos subgrupos de la población, considerando las categorías protegidas, buscando que los resultados no difieran entre ellos. Para realizar lo anterior el equipo deberá seleccionar  las dimensiones importantes en las cuales la muestra de datos pueda generar diferencias entre los distintos subgrupos. Se recomienda utilizar literatura relacionada con el tema y  consultar información de expertos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "La ley 21609 prohíbe las discriminaciones arbitrarias basadas en raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el sexo, la maternidad, la lactancia materna, el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad. Si el sistema utilizará algunas de esas variables para decidir o están presentes en los datos, deben realizarse mediciones que permitan garantizar el cumplimiento legal a través de la protección de estos grupos vulnerables. Estas categorías protegidas que deberán entonces ser consideradas en las evaluaciones sobre sesgo algorítmico, las cuales deben permitir comparar los resultados del sistema respecto de distintos subgrupos de la población, considerando las categorías protegidas, buscando que los resultados no difieran entre ellos. Para realizar lo anterior el equipo deberá seleccionar  las dimensiones importantes en las cuales la muestra de datos pueda generar diferencias entre los distintos subgrupos. Se recomienda utilizar literatura relacionada con el tema y  consultar información de expertos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q42",
    recommendations: [
      {
        text: "Conviene analizar los datos frente a dimensiones importantes en las cuales la muestra de datos puede ser diferente a la población donde se desempeñará, en particular la existencia de sesgos de selección no medidos. Es posible que sean necesarias pruebas a efectos de comprobar que cuando se aplique el sistema su desempeño sea el optimo, y que los valores predictivos sean diferentes dependiendo los grupos sobre los que se aplica. Se proponen dos analisis 1) Cualitativo) ¿Se han analizado las posibles diferencias entre la base de datos y la población para la que se está desarrollando el sistema de IA? y 2) Cuantitativo: Aunque los modelos pueden construirse con diversas fuentes de datos, diseñadas o naturales, lo ideal es que la validación se realice con una muestra que permita la inferencia estadística a la población. La muestra de validación debe cubrir adecuadamente la población objetivo y las subpoblaciones de interés.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q43",
    recommendations: [
      {
        text: "Conviene analizar los datos frente a dimensiones importantes en las cuales la muestra de datos puede ser diferente a la población donde se desempeñará, en particular la existencia de sesgos de selección no medidos. Es posible que sean necesarias pruebas a efectos de comprobar que cuando se aplique el sistema su desempeño sea el optimo, y que los valores predictivos sean diferentes dependiendo los grupos sobre los que se aplica. Se proponen dos analisis 1) Cualitativo) ¿Se han analizado las posibles diferencias entre la base de datos y la población para la que se está desarrollando el sistema de IA? y 2) Cuantitativo: Aunque los modelos pueden construirse con diversas fuentes de datos, diseñadas o naturales, lo ideal es que la validación se realice con una muestra que permita la inferencia estadística a la población. La muestra de validación debe cubrir adecuadamente la población objetivo y las subpoblaciones de interés.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q44",
    recommendations: [
      {
        text: "Utilice para el analisis exploratorio un Perfil de datos. Este perfil es un análisis exploratorio inicial durante la fase de Recolección y procesamiento de datos del ciclo de vida de IA. Brinda información para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso. En este analisis es posible que descubra que será necesario imputar valores faltantes en los datos. Es importante documentar el porqué no se tienen esa información, si los dataos faltantes están asociados a la variable a predecir.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Es recomendable realizar un analisis exploratorio de los datos para ayudar a evaluar los problemas con estos  y documentar las características de un sistema de IA, las suposiciones realizadas y las medidas de mitigación de riesgos aplicadas a lo largo del ciclo de vida. Puede elaborar un  Perfil de datos. Este perfil es un análisis exploratorio inicial durante la fase de Recolección y procesamiento de datos del ciclo de vida de IA. Brinda información para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },

  {
    questionId : "q45",
    recommendations: [
      {
        text: "Si un sistema algorítmico opera dentro de la administración del Estado, se sujetará a las normas administrativas y de derecho público correspondiente. Esto implica que siendo parte un proceso administrativo su despliegue y funcionamiento están sujetos a las normas administrativas de transparencia. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Si al algoritmo no opera dentro de algun proceso administrativo, aplican minimos de transparencia, relacionados con el hecho de estar interactuando con un sistema de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q46",
    recommendations: [
      {
        text: "Estos son los criterios considerados por la IGTA para su aplicación.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q47",
    recommendations: [
      {
        text: "Aplican minimos de transparencia, relacionados con el hecho de estar interactuando con un sistema de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q48",
    recommendations: [
      {
        text: "Evaluar herramientas que permitan transparentar factores o elementos que tome en cuenta el algoritmo para llegar al resultado. El sector público está sujeto a normativas de transparencia en la función publica reforzadas por mandatos de la ley de datos personales frente a la toma de decisiones automatizadas. Es recomendable hacer un perfil de datos, esto es un análisis exploratorio inicial durante la fase de Recolección y procesamiento de datos del ciclo de vida de IA. Brinda información para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q49",
    recommendations: [
      {
        text: "Los sistemas pueden estar protegidos por derechos de propiedad intelectual, sin embargo,  el Estado actua bajo una obligación de transparencia debiendo justificar el resultado de sus decisiones. Asegure la implementación de mecanismos que permitan comprender como un sistema llega a sus resultados, y que a lo menos pueda responder las solicitudes relacionadas con la normativa de datos personales, relacionadas con los deberes de transparencia contenidas en el articulo 8 bis, o solictudes de acceso a la información pública que podrian ser requeridas en este punto. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q50",
    recommendations: [
      {
        text: "Considere incluir la entrega del código fuente en los términos del contrato con el tercero desarrollador",
        condition: (answer: Answer | null) => typeof answer === 'boolean' && answer === false
      },
      {
        text: "Asegúrese de que el acuerdo de entrega del código fuente incluya documentación adecuada",
        condition: (answer: Answer | null) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Evalúe si la entrega del código fuente es aplicable o necesaria para este proyecto",
        condition: (answer: Answer | null) => answer === null
      }
    ]
  },
  {
    questionId: "q51",
    recommendations: [
      {
        text: "Debe garantizarse que  la ciudadanía tenga una oportunidad de réplica y, de ser necesario, de impugnar el uso de un determinado sistema o los lineamientos empleados para su desarrollo por parte de un organismo público. El uso incorrecto de los sistemas podría conllevar desde un aprovechamiento no óptimo de los recursos, hasta el desencadenamiento de casos de vulneración de derechos de los ciudadanos. Los riesgos y daños potenciales son variados y a menudo difíciles de anticipar. Los hay fundamentalmente de dos tipos: riesgos de inclusión (por ej. asignación de recursos o beneficios a quienes no corresponde) y de exclusión (por ej privación de recursos o beneficios a personas que sí los necesitan).",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q52",
    recommendations: [
      /*{
        text: " ",
        condition: (answer: string[]) => !answer.includes("Sistemas de reconocimiento y de detección de eventos")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Predicción")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Personalización")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Soporte de interacción")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Optimización")
      },
      {
        text: " ",
        condition: (answer: string[]) => !answer.includes("Razonamiento con estructuras de conocimiento")
      }*/
    ]
  },
  {
    questionId: "q53",
    recommendations: [
      {
        text: "Será importante comunicar claramente cómo se toman las decisiones y si el modelo es un sistema de toma o de soporte de decisión. Hacer monitoreos periódicos de la herramienta. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q54",
    recommendations: [
      {
        text: "Será importante comunicar claramente cómo se toman las decisiones y si el modelo es un sistema de toma o de soporte de decisión. Hacer monitoreos periódicos de la herramienta. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q55",
    recommendations: [
      {
        text: "Dentro del ambito de la comunicación clara sobre el despliegue de un sistema algoritmico, será importante comunicar claramente cómo se toman las decisiones y si el modelo es un sistema de toma o de soporte de decisión. Es relevante también contar con sistemas de información directa hacia aquellas personas o instituciones que se podrían ver afectadas por la implementación del modelo. Existen obligaciones legales en la administración pública como la transparencia y publicidad administrativa y participación ciudadana en la gestión pública, a los que están sujetos los sistemas de decisión automatizadas, por lo que corresponde que las instituciones comuniquen las implicancias de la nueva herramienta a la ciudadanía, que reciban retroalimentación y hagan las modificaciones necesarias para entregar mayor transparencia en la herramienta. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q56",
    recommendations: [
      /*{
        text: "",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }*/
    ]
  },
  {
    questionId: "q57",
    recommendations: [
      {
        text: "Una auditoría algorítmica es un estudio que busca evaluar el funcionamiento de un sistema algorítmico, durante su despliegue, considerando aspectos de diseño, datos, impactos en materia de precisión, privacidad y seguridad, entre otros. Estas pueden realizarse a manera de medición frente a ciertos estándares (auditorías de rendimiento), o bien como un análisis de cumplimiento de normas particulares (auditorías de cumplimiento). Su importancia radica en que los sistemas  pueden precisar fallas o riesgos que no se detectan a primera vista o cuya relevancia se descuida debido a la frecuencia con que se realizan ciertos procesos. Mientras más complejos sean los sistemas, existen mayores probabilidades de que se presenten errores. La auditoría es un mecanismo de control y revisión que poder realizado por un profesional  interno como externo y su importancia es que permite verificar que se cumplan  los siguientes propósitos : 1) rendir cuenta sobre el uso de los sistemas algorítmicos 2) Fortalecer la capacidad interna de los organismos públicos de evaluar los sistemas que construyen o adquieren, y facilitar que obtengan una mayor experiencia anticipándose a impactos indeseados. 3) son un mecanismo de responsabilidad en el uso de algoritmos, mediante un mecanismo útil y continuo para que terceros revisen y evalúen estos sistemas, de modo que sea posible identificar problemas y resolverlos o mitigarlos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q58",
    recommendations: [
      {
        text: "Debe garantizarse que  la ciudadanía tenga una oportunidad de réplica y, de ser necesario, de impugnar el uso de un determinado sistema o los lineamientos empleados para su desarrollo por parte de un organismo público",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q59",
    recommendations: [
      {
        text: "Es recomendable que el director del proyecto, sea responsable de  documentar, junto con el equipo técnico, todo el proceso de desarrollo para poder justificar frente a la ciudadanía y otras partes interesadas las decisiones tomadas a lo largo de todo el ciclo de vida de la IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Es recomendable que el director del proyecto, sea responsable de  documentar, junto con el equipo técnico, todo el proceso de desarrollo para poder justificar frente a la ciudadanía y otras partes interesadas las decisiones tomadas a lo largo de todo el ciclo de vida de la IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  }
]

type EvaluacionImpactoProps = {
  initialEmail?: string
}

export default function EvaluacionImpacto({ initialEmail }: EvaluacionImpactoProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [showResults, setShowResults] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDimension, setCurrentDimension] = useState(dimensions[0])
  const [userEmail] = useState<string | null>(initialEmail ?? null)
  const router = useRouter()

  useEffect(() => {
    if (!userEmail) {
      router.push('/')
    }
  }, [userEmail, router])

  useEffect(() => {
    const answeredQuestions = Object.keys(answers).length
    const totalQuestions = questions.length
    setProgress((answeredQuestions / totalQuestions) * 100)
  }, [answers])

  const handleAnswer = (questionId: string, value: Answer) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    if (userEmail) {
      const dataToSave = {
        answers: newAnswers,
        timestamp: new Date().getTime()
      }
      localStorage.setItem(`evaluationData_${userEmail}`, JSON.stringify(dataToSave))
    }
  }

  const generateRecommendations = (questionId: string, answer: Answer): Array<{ text: string; resource?: { text: string; url: string } }> => {
    const questionRecommendations = recommendations.find(r => r.questionId === questionId);
    if (!questionRecommendations) return [];
  
    return questionRecommendations.recommendations
      .filter(rec => {
        if (Array.isArray(answer)) {
          // Si 'answer' es un arreglo, puedes aplicar la condición a cada elemento si es necesario
          return answer.some(ans => rec.condition(ans)); // Cambia la lógica según lo que necesites
        }
        return rec.condition(answer); // Si no es un arreglo, aplica la condición normalmente
      })
      .map(rec => ({ text: rec.text, resource: rec.resource }));
  };

  const getRecommendations = () => {
    return Object.entries(answers).flatMap(([questionId, answer]) => 
      generateRecommendations(questionId, answer).map(rec => ({ questionId, ...rec }))
    )
  }

  const groupRecommendationsByStage = (recs: Array<{ questionId: string; text: string; resource?: { text: string; url: string } }>) => {
    const stages = ['Conceptualización y diseño', 'Uso y monitoreo', 'Recolección y procesamiento de datos']
    return stages.reduce((acc, stage) => {
      acc[stage] = recs.filter(rec => 
        questions.find(q => q.id === rec.questionId)?.stage === stage
      )
      return acc
    }, {} as Record<string, typeof recs>)
  }

  const isDimensionComplete = (dim: string) => {
    return questions.filter(q => q.dimension === dim).every(q => answers[q.id] !== undefined)
  }

  const getDimensionScore = (dim: string) => {
    const dimQuestions = questions.filter(q => q.dimension === dim)
    const answeredQuestions = dimQuestions.filter(q => answers[q.id] !== undefined).length
    return (answeredQuestions / dimQuestions.length) * 100
  }

  const saveEvaluation = () => {
    localStorage.setItem('evaluationAnswers', JSON.stringify(answers))
    alert('Evaluación guardada correctamente')
  }

  const loadEvaluation = () => {
    const savedAnswers = localStorage.getItem('evaluationAnswers')
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers))
      alert('Evaluación cargada correctamente')
    } else {
      alert('No se encontró ninguna evaluación guardada')
    }
  }

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            id={question.id}
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        )
      case 'select':
        return (
          <Select onValueChange={(value) => handleAnswer(question.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={(answers[question.id] as string[] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answers[question.id] as string[] || []
                    const newAnswers = checked
                      ? [...currentAnswers, option.value]
                      : currentAnswers.filter(v => v !== option.value)
                    handleAnswer(question.id, newAnswers)
                  }}
                />
                <Label className='text-sm font-normal' htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )
      case 'yesno':
      case 'yesnoNA':
        return (
          <RadioGroup
            onValueChange={(value) => handleAnswer(question.id, value === 'yes')}
            className="flex space-x-4 mt-2 text-sm font-normal"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`}>Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>No</Label>
            </div>
            {question.type === 'yesnoNA' && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="na" id={`${question.id}-na`} />
                <Label htmlFor={`${question.id}-na`}>No aplica</Label>
              </div>
            )}
          </RadioGroup>
        )
      default:
        return null
    }
  }

  const handleNextDimension = () => {
    const currentIndex = dimensions.indexOf(currentDimension)
    if (currentIndex < dimensions.length - 1) {
      setCurrentDimension(dimensions[currentIndex + 1])
    }
  }

  const handlePreviousDimension = () => {
    const currentIndex = dimensions.indexOf(currentDimension)
    if (currentIndex > 0) {
      setCurrentDimension(dimensions[currentIndex - 1])
    }
  }

  if (!userEmail) {
    return <div>Loading...</div>
  }

  const exportResults = () => {
    const results = dimensions.map(dim => ({
      dimension: dim,
      score: getDimensionScore(dim),
      recommendations: getRecommendations()
        .filter(rec => questions.find(q => q.id === rec.questionId)?.dimension === dim)
    }))

    const pdf = new jsPDF()
    let yOffset = 20

    // Add title
    pdf.setFontSize(18)
    pdf.text('Evaluación de Impacto Algorítmico - Resultados', 10, yOffset)
    yOffset += 10

    results.forEach((result) => {
      if (yOffset > 280) {
        pdf.addPage()
        yOffset = 10
      }

      // Add dimension title and score
      pdf.setFontSize(14)
      pdf.text(`${result.dimension} - Puntuación: ${Math.round(result.score)}%`, 10, yOffset)
      yOffset += 10

      // Add recommendations
      pdf.setFontSize(12)
      result.recommendations.forEach(rec => {
        if (yOffset > 280) {
          pdf.addPage()
          yOffset = 10
        }

        const lines = pdf.splitTextToSize(rec.text, 180)
        pdf.text(lines, 10, yOffset)
        yOffset += 5 * lines.length

        if (rec.resource) {
          pdf.setTextColor(0, 0, 255)
          pdf.text(`Recurso extra: ${rec.resource.text}`, 15, yOffset)
          pdf.link(15, yOffset - 5, 180, 5, { url: rec.resource.url })
          pdf.setTextColor(0, 0, 0)
          yOffset += 5
        }

        yOffset += 5
      })

      yOffset += 10
    })

    pdf.save('evaluacion_impacto_algoritmico.pdf')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between space-y-1 p-4 rounded-lg backdrop-blur-sm items-center">
        <Image src="/images/Logo_herramientas_algoritmos.png" alt="HERRAMIENTAS ALGORITMOS ÉTICOS" width={300} height={5} />
        <h1 className="text-2xl font-bold mb-4 text-center">Evaluación de Impacto Algorítmico</h1>
        <Image src="/images/Goblab.png" alt="Gob_Lab UAI" width={220} height={5} />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-col md:flex-row items-center  gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center text-xl font-bold">
            {Math.round(progress)}%
          </div>
          <Progress value={progress} className="w-full md:w-64" />
        </div>
        <div className="flex gap-2">
          <Button onClick={saveEvaluation}>Guardar</Button>
          <Button onClick={loadEvaluation} variant="outline">Cargar</Button>
        </div>
      </div>
      {!showResults ? (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Dimensiones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dimensions.map((dim, index) => (
                    <li
                      key={dim}
                      className={`cursor-pointer p-2 rounded ${
                        currentDimension === dim ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                      onClick={() => setCurrentDimension(dim)}
                    >
                      {`${index + 1}. ${dim}`}
                      {isDimensionComplete(dim) && (
                        <CheckCircle className="inline-block w-4 h-4 ml-2 text-green-500" />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="md:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>{currentDimension}</span>
                  {/*<span className="text-sm font-normal">
                    Puntuación: {Math.round(getDimensionScore(currentDimension))}%
                  </span>*/}
                </CardTitle>
                <CardDescription>Responda las siguientes preguntas</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  {questions.filter(q => q.dimension === currentDimension).map((question, qIndex) => (
                    <div key={question.id} className="mb-6">
                      <div className="flex items-start mb-2">
                        <Label className="text-sm mr-2 flex-grow font-normal" htmlFor={question.id}>
                          {`${dimensions.indexOf(currentDimension) + 1}.${qIndex + 1}. ${question.text}`}
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{question.info}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {renderQuestionInput(question)}
                    </div>
                  ))}
                </form>
              </CardContent>
              <div className="flex justify-between p-4">
                <Button onClick={handlePreviousDimension} disabled={currentDimension === dimensions[0]}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => setShowResults(true)} variant="outline">
                    Ver Resultados
                  </Button>
                  <Button onClick={handleNextDimension} disabled={currentDimension === dimensions[dimensions.length - 1]}>
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>Recomendaciones por Etapa del Proyecto</span>
              <Button onClick={exportResults} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF  {/* Changed from "Exportar" to "Exportar PDF" */}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {Object.entries(groupRecommendationsByStage(getRecommendations())).map(([stage, recs]) => (
                <div key={stage} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{stage}</h3>
                  <ul className="list-disc pl-5">
                    {recs.map((rec, index) => (
                      <li key={index} className="mb-2">
                        <p>{rec.text}</p>
                        {rec.resource && (
                          <p className="mt-1 text-sm">
                            <a href={rec.resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                              {rec.resource.text}
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ScrollArea>
            <Button onClick={() => setShowResults(false)} className="mt-4">Volver a la Evaluación</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}