'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
//import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Thermometer } from '@/components/Thermometer'
import { CheckCircle, HelpCircle, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
//import jsPDF from 'jspdf'
//import * as XLSX from 'xlsx'
//import html2pdf from 'html2pdf.js'

type QuestionType = 'text' | 'textArea' | 'select' | 'multiselect' | 'yesno' | 'yesnoNA'

type Option = {
  value: string
  label: string
  score?: number
}

export type Question = {
  id: string
  text: string
  type: QuestionType
  dimension: string
  stage: 'Conceptualización y diseño' | 'Recolección y procesamiento de datos'| 'Uso y monitoreo'
  info?: string
  options?: Option[]
  scoreContribution?: boolean
  score?: (answer: string | string[] | boolean | null) => number
  dependsOn?: {
    questionId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: string | boolean | null | string[] | ((val: any) => boolean)
  }
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
    info: "Escriba el nombre del proyecto que está evaluando.",
    scoreContribution: false
  },
  { 
    id: "q2", 
    text: "Descripción del proyecto", 
    type: "textArea",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Describa brevemente el proyecto que está evaluando.",
    scoreContribution: false
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
    ],
    scoreContribution: false
  },
  { 
    id: "q4", 
    text: "Razones para la automatización de este proceso.", 
    type: "multiselect",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Indique las principales razones para la automatización de este proceso de toma de decisiones",
    options: [
      { value: "Utilizar enfoques innovadores", label: "Utilizar enfoques innovadores" },
      { value: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable", label: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable" },
      { value: "Reducción de los costos de un programa existente", label: "Reducción de los costos de un programa existente" },
      { value: "Mejorar la calidad general de las decisiones", label: "Mejorar la calidad general de las decisiones" }
    ],
    scoreContribution: false
  },
  { 
    id: "q5", 
    text: "¿El proyecto es una ampliación o adaptación de algún proyecto existente dentro de la organización?",
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.3 : 0
  },
  { 
    id: "q6", 
    text: "¿El sistema de IA, incluido el modelo central, se basa en un modelo ya existente?", 
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "¿El modelo existente es un modelo general tipo \"chatGPT\" o es un modelo diseñado/por diseñar de manera específica para el proyecto?",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.3 : 0
  },
  { 
    id: "q7", 
    text: "¿Ha documentado con claridad la descripción del problema que busca resolver?", 
    type: "yesno",
    dimension: "General", 
    stage: "Conceptualización y diseño",
    info: "Documentar el problema es un paso previo al desarrollo del sistema. Permite entender el contexto y los objetivos del proyecto, más allá de la decisión de usar o no inteligencia artificial.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.3 : 0
  },
  { 
    id: "q8", 
    text: "¿Se ha considerado detenidamente las opciones no algorítmicas que pueden utilizarse para lograr el mismo objetivo?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: "Esta pregunta apunta a considerar si existen alternativas no algorítmicas para resolver el problema ya que a veces se recurre a IA sin evaluar otras soluciones más simples, eficaces o apropiadas. Por ejemplo: rediseño de procesos, restructuración de equipos, opciones no automáticas.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.3 : 0
  },
  { 
    id: "q9", 
    text: "¿Por qué se eligió un sistema basado en algoritmos en lugar de otras alternativas?",
    type: "select",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: " ",
    scoreContribution: true,
    options: [
      { value: "Utilizar enfoques innovadores", label: "Utilizar enfoques innovadores", score: 1.3 },
      { value: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable", label: "El sistema realiza tareas que los humanos no podrían realizar en un periodo de tiempo razonable", score: 1.3 },
      { value: "Reducción de los costos de un programa existente", label: "Reducción de los costos de un programa existente", score: 1.3 },
      { value: "Mejorar la calidad general de las decisiones", label: "Mejorar la calidad general de las decisiones", score: 1.3 }
    ]
  },
  { 
    id: "q10", 
    text: "¿Ha revisado casos similares y sus impactos?", 
    type: "yesno",
    dimension: "Proporcionalidad", 
    stage: "Conceptualización y diseño",
    info: "Puedes revisar casos similares en algorítmicospublicos.cl ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.3 : 0
  },
  {
    id: "q11",
    text: "¿La aplicación del sistema tiene algún impacto en derechos humanos según la constitución?",
    type: "yesno",
    dimension: "Proporcionalidad",
    stage: "Conceptualización y diseño",
    info: "Considera si el sistema puede afectar derechos protegidos por la Constitución, como la privacidad, la igualdad ante la ley, la no discriminación, la libertad de expresión o el debido proceso. El impacto puede ser directo o indirecto.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.3 : 0
  },
  {
    id: "q12",
    text: "¿Son los impactos que ha identificado reversibles?",
    type: "yesno",
    dimension: "Proporcionalidad",
    stage: "Conceptualización y diseño",
    info: "Un impacto es irreversible cuando no puede deshacerse o corregirse una vez que ocurre. Esta pregunta invita a reflexionar si las consecuencias del sistema pueden ser revertidas en caso de error o daño.",
    scoreContribution: true,
    dependsOn: {
      questionId: "q11",
      value: true
    },
    score: (answer) => answer === false ? 1.3 : 0
  },
  { 
    id: "q13", 
    text: "¿Se implementa el algoritmo para la ejecución de una normativa específica?", 
    type: "yesno",
    dimension: "Normativa", 
    stage: "Conceptualización y diseño",
    info: "Esta pregunta no se refiere a si la ley obliga a utilizar un algoritmo, sino a si el sistema se emplea para aplicar o ejecutar una norma vigente (por ejemplo: una ley, un reglamento, un acto administrativo, o normativas emitidas por organismos como el Ministerio del Trabajo, el Ministerio de Salud, el Ministerio de Economía, etc.). Es decir, normas que puedan afectar tanto a trabajadores como a clientes.",
    scoreContribution: true,
    score: (answer) => answer === true ? 5.55 : 0
  },
  { 
    id: "q14", 
    text: "¿Has identificado las normativas que pueden impactar en el sistema y el proyecto en el que se inserta?", 
    type: "yesno",
    dimension: "Normativa", 
    stage: "Conceptualización y diseño",
    info: "Se refiere a normativas con impacto directo sobre el sistema, como la Ley de Protección de Datos, la Ley Marco de Ciberseguridad o la Ley de Propiedad Intelectual. No incluye políticas públicas generales ni lineamientos estratégicos.",
    scoreContribution: true,
    score: (answer) => answer === false ? 5.55 : 0
  },
  { 
    id: "q15", 
    text: "¿El proyecto y/o sus objetivos están relacionados con temas de intenso debate público que podrían generar judicialización o peticiones administrativas?", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: "Se refiere a una situación en la que un tema genera gran atención, controversia o discusión dentro de la opinión pública, involucrando a distintos actores sociales —como ciudadanía, medios de comunicación, autoridades, expertos, organizaciones civiles— que expresan posturas encontradas o fuertes reacciones.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.77 : 0
  },
  { 
    id: "q16", 
    text: "¿Existen mecanismos para que personas usuarias u otros actores entreguen retroalimentación sobre el funcionamiento del sistema?",
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: "Por ejemplo: campañas informativas, sitios web, documentos explicativos, instancias de presentación pública, comunicaciones internas, materiales educativos u otros medios para dar a conocer el sistema, sus objetivos y funcionamiento.",
    scoreContribution: true,
    score: (answer) => answer === false ? 2.77 : 0

  },
  { 
    id: "q17", 
    text: "¿Se diseñaron mecanismos para la difusión del sistema hacia las comunidades involucradas o afectadas?",
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 2.77 : 0
    
  },
  { 
    id: "q18", 
    text: "¿Existen recursos monetarios (presupuesto) del proyecto para ejecutar los mecanismos de participación?", 
    type: "yesno",
    dimension: "Licencia Social", 
    stage: "Conceptualización y diseño",
    info: "Evalúa si el proyecto considera presupuesto específico para implementar mecanismos de participación, como talleres, consultas, encuestas u otras instancias con actores clave o comunidades afectadas",
    scoreContribution: true,
    dependsOn: {
      questionId: "q16",
      value: true
    },
    score: (answer) => answer === false ? 2.77 : 0
  },
  { 
    id: "q19",
    text: "¿Existe alguna unidad interna encargada de supervisar la gobernanza (operación, manejo, despliegue) de la solución desarrollada?",
    type: "yesno",
    dimension: "Gobernanza",
    stage: "Uso y monitoreo",
    info: "Se refiere a cualquier área, equipo, comité o rol dentro de la organización que tenga responsabilidad sobre la supervisión del funcionamiento del sistema, incluyendo su operación, uso, actualización, cumplimiento de normas, gestión de riesgos o toma de decisiones relevantes. Puede ser una unidad formal o una función asignada dentro de un área existente (por ejemplo: TI, cumplimiento, legal, datos, ética, innovación u otra similar).",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 2.22
  },
  { 
    id: "q20", 
    text: "¿El equipo de desarrollo interno estará compuesto por un grupo diverso de personas en términos de raza, género, profesiones, edades  y otros criterios sociodemográficos?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Uso y monitoreo",
    info: "En lo que respecta a la diversidad de los equipos, las categorías mencionadas deben entenderse como ejemplos orientativos y no como requisitos taxativos. No es necesario cumplir con todas ellas, sino considerar cómo distintas perspectivas pueden enriquecer el análisis y reducir sesgos.",
    scoreContribution: true,
    score: (answer) => answer === false ? 2.22 : 0
  },
  { 
    id: "q21", 
    text: "¿Está documentado el proceso de toma de decisiones del sistema?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Uso y monitoreo",
    info: "Documentar cómo el sistema toma decisiones es clave para una IA responsable. Esto permite trazabilidad, transparencia y facilita la rendición de cuentas ante posibles impactos o errores.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 0
  },
  { 
    id: "q22", 
    text: "¿Están todas las contrapartes internas identificadas?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Conceptualización y diseño",
    info: "Se refiere persona o equipo dentro de la organización que actúa como enlace o responsable del seguimiento del proyecto, representando los intereses de la entidad frente a los equipos técnicos, consultores o entidades externas involucradas.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 0
  },
  { 
    id: "q23", 
    text: "¿Están todas las contrapartes internas involucradas en el proyecto?", 
    type: "yesno",
    dimension: "Gobernanza", 
    stage: "Conceptualización y diseño",
    info: "Se debe garantizar que todos los equipos, departamentos y personas clave de la organización participen y estén alineados con las actividades del proyecto, integrando sus intereses, conocimientos y necesidades en cada fase.",
    scoreContribution: true,
    dependsOn: {
      questionId: "q22",
      value: true
    },
    score: (answer) => answer === true ? 2.22 : 0
  },
  { 
    id: "q24", 
    text: "¿El sistema utiliza o ha utilizado datos personales en alguna etapa de su ciclo de vida?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Conceptualización y diseño",
    info: "Incluye cualquier forma de tratamiento de datos personales en el sistema, ya sea durante el entrenamiento, el ajuste fino (finetuning) o el uso en producción. Por ejemplo, si un modelo predictivo se entrenó con información de personas, o si un modelo generativo permite que el usuario proporcione datos personales en sus prompts o consultas. En Chile, la protección de datos personales se rige principalmente por la Ley N° 19.628, conocida como la Ley sobre Protección de la Vida Privada, y por la reciente Ley 21.719, que introduce modificaciones importantes y establece la Agencia de Protección de Datos Personales. La ley define los datos personales como cualquier información concerniente a personas naturales, identificadas o identificables, y establece principios y normas para su tratamiento.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.01 : 0
  },
  { 
    id: "q25", 
    text: "¿El sistema utilizará datos personales sensibles o especialmente protegidos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "En Chile, la Ley N° 19.628, sobre Protección de la Vida Privada, define los datos sensibles como  aquellos que se refieren a las características físicas o morales de las personas o a hechos o circunstancias de su vida privada o intimidad, tales como los hábitos personales, el origen racial, las ideologías y opiniones políticas, las creencias o convicciones religiosas, los estados de salud físicos o psíquicos y la vida sexual, etc. Estos datos, por su naturaleza, requieren de una protección especial y no pueden ser tratados sin consentimiento del titular, salvo en casos excepcionales autorizados por la ley.",
    scoreContribution: true,
    dependsOn: {
      questionId: "q24",
      value: true
    },
    score: (answer) => answer === true ? 1.01 : 0
  },
  { 
    id: "q26", 
    text: "¿El sistema utilizará los datos personales para tomar decisiones que afecten directamente a las mismas personas titulares de dichos datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe determinar si el sistema emplea datos personales para respaldar, orientar o sustituir decisiones que impacten de forma directa a los titulares de dichos datos.",
    scoreContribution: true,
    dependsOn: {
      questionId: "q24",
      value: true
    },
    score: (answer) => answer === true ? 1.01 : 0
  },
  { 
    id: "q27", 
    text: "¿Los datos son recogidos por sensores automatizados?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe determinar si los datos provienen de sensores que, sin intervención humana, detectan variaciones en el entorno físico (luz, temperatura, movimiento, presión, sonido, humedad, etc.) y registran o activan acciones de forma automática.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.01 : 0
  },
  { 
    id: "q28", 
    text: "¿Los datos utilizados vienen de entidades externas?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "dispositivo que detecta cambios en el entorno físico (como luz, temperatura, movimiento, presión, sonido, humedad, etc.) y responde sin intervención humana, generalmente activando una acción o registrando datos de forma automatizada",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.01 : 0
  },
  { 
    id: "q28.1", 
    text: "¿existen acuerdos escritos detallando las condiciones para el acceso a datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "",
    dependsOn: {
      questionId: "q28",
      value: true
    },
    scoreContribution: true,
    score: (answer) => answer === true ? 0 : 0
  },
  { 
    id: "q29", 
    text: "¿Se aplica el principio de minimización de datos?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "La minimización de datos se refiere a que se debe verificar que únicamente se recopilen y procesen los datos estrictamente necesarios para los fines definidos, limitando su volumen, variedad, periodo de retención y acceso.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.01 : 0
  },
  { 
    id: "q30", 
    text: "¿Se anonimizan o seudonimizan los datos para el entrenamiento y prueba del sistema de IA?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "Determinar si los datos utilizados para el entrenamiento y las pruebas se someten a anonimización (eliminación irreversible de identificadores) o a seudonimización (sustitución de identificadores por seudónimos), de modo que no permitan la reidentificación de los titulares.",
    scoreContribution: true,
    dependsOn: {
      questionId: "q24",
      value: true
    },
    score: (answer) => answer === false ? 1.01 : 0
  },
  { 
    id: "q31", 
    text: "Se implementará el sistema para algunos de estos usos o casos:",
    type: "yesno",
    dimension: "Protección de datos",
    stage: "Recolección y procesamiento de datos",
    info: "a) Evaluación sistemática y exhaustiva de aspectos personales de los titulares de datos, basadas en tratamiento o decisiones automatizadas, como la elaboración de perfiles, y que produzcan en ellos efectos jurídicos significativos.\nb) Tratamiento masivo de datos o gran escala.\nc) Tratamiento que implique observación o monitoreo sistemático de una zona de acceso público.\nd) Tratamiento de datos sensibles y especialmente protegidos, en las hipótesis de excepción del consentimiento.\n\nEstos cuatro supuestos (perfilado con efectos jurídicos, tratamiento masivo, monitoreo sistemático de zonas públicas y datos sensibles según Art. 9) obligan a realizar una Evaluación de Impacto según el Reglamento General de Protección de Datos de la Unión Europea (Art. 35.3 y Art. 9), por lo que se relacionan a casos críticos en relación a riesgos éticos y es importante abordarlos como tal. Marcar 'Sí' si el sistema responde a al menos uno de ellos para advertir sobre riesgos éticos y de implementación.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.01 : 0
  },
  {
    id: "q32",
    text: "Cuenta la entidad con procesos establecidos para el ejercicio de los derechos vinculados a los datos: Acceso, Rectificación, Supresión, Oposición, Portabilidad e Impugnación a las decisiones automatizadas?", 
    type: "select",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe comprobar si la organización cuenta con procesos formales para que los titulares ejerzan sus derechos de Acceso, Rectificación, Supresión, Oposición, Portabilidad e Impugnación de decisiones automatizadas. Si ya existen, aplican al proyecto.",
    scoreContribution: true,
    options: [
      { value: "Si", label: "Sí", score: 0 },
      { value: "Si, pero parcialmente", label: "SI, pero solo parcialmente ( Acceso, Rectificación, Supresión, Oposición)", score: 0.5 },
      { value: "No", label: "No", score: 1.01 }
    ]
  },
  { 
    id: "q33",
    text: "¿El sistema implica toma de decisiones automatizadas, incluida la elaboración de perfiles, que afecten significativamente a los titulares de datos?",
    type: "yesno",
    dimension: "Protección de datos",
    stage: "Recolección y procesamiento de datos",
    info: "Se debe identificar si el sistema ejecuta decisiones automatizadas o realiza elaboración de perfiles que afecten significativamente a los titulares de datos, por ejemplo al denegar un beneficio, gestionar atenciones o servicios, evaluar prestaciones, autorizar accesos, resolver controversias, o intervenir en procesos como la interacción con personas usuarias, la selección de personal, la gestión laboral, la seguridad en el trabajo u otros ámbitos en los que dichas decisiones puedan tener un impacto relevante.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.01 : 0
  },
  {
    id: "q34",
    text: "¿Se han diseñado medidas necesarias para asegurar  explicaciones adecuadas para ayudar a los usuarios y otras personas afectadas a comprender el proceso de toma de decisiones o el funcionamiento del sistema?", 
    type: "yesno",
    dimension: "Protección de datos", 
    stage: "Recolección y procesamiento de datos",
    info: "Determinar si se han implementado mecanismos que proporcionen explicaciones claras y comprensibles del proceso de toma de decisiones y del funcionamiento del sistema, dirigidas a usuarios y personas afectadas.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.01 : 0
  },
  {
    id: "q35",
    text: "¿Forma parte su organización de la administración del Estado ( Ministerios, las Delegaciones Presidenciales Regionales y  Provinciales, los Gobiernos Regionales, las Municipalidades, las Fuerzas Armadas, las Fuerzas de Orden y Seguridad Pública, las empresas públicas creadas por ley, y los órganos y servicios públicos creados para el cumplimiento de la función administrativa) o empresa del Estado en que éste tenga participación accionaria superior al 50% o mayoría en el directorio?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
  },
  {
    id: "q36",
    text: "¿Su organización presta servicios mediante redes y sistemas informáticos, y su afectación, interceptación, interrupción o destrucción tendría un impacto significativo en la seguridad y el orden público, en la provisión continua y regular de sus servicios, en el efectivo cumplimiento de las funciones del Estado o, en general, de los servicios que éste debe proveer o garantizar?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe verificar si la institución presta sus servicios mediante redes y sistemas informáticos, de modo que cualquier afectación, interceptación, interrupción o destrucción impactaría significativamente la provisión continua de dichos servicios. Esto identifica si corresponde a un “Servicio Esencial” según la ley marco de ciberseguridad (todos los servicios públicos lo son).",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
  },
  {
    id: "q37",
    text: "¿Posee su organización una política de seguridad de la información o ciberseguridad?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q37.1",
    text: "¿El sistema está siendo o será subcontratado a un tercero para su desarrollo o implementación?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
  },
  {
    id: "q38",
    text: "¿Ha implementado un sistema de gestión de seguridad de la información continuo con el fin de determinar aquellos riesgos que puedan afectar la seguridad de las redes, sistemas informáticos y datos, y la continuidad operacional del servicio?", 
    type: "yesno",
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q39",
    text: "¿Ha evaluado los riesgos de ciberseguridad particulares que afectan a los sistemas de IA que gestiona la organización?",
    type: "yesno", 
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q39.1",
    text: " ¿Ha evaluado los riesgos específicos de ciberseguridad que pueda afectar el funcionamiento del sistema algorítmico?",
    type: "yesno", 
    dimension: "Ciberseguridad", 
    stage: "Recolección y procesamiento de datos",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q40",
    text: "¿Utiliza el sistema datos que representen algunas de estas características: la raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el estado civil, la edad, la filiación o información sobre  la enfermedades o discapacidades?. ", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
    info: "La ley chilena prohíbe la discriminación arbitraria, esto toda distinción, exclusión o restricción que carezca de justificación razonable, efectuada por agentes del Estado o particulares, en particular cuando se funden en motivos tales como la raza o etnia, la nacionalidad, la situación socioeconómica, el idioma, la ideología u opinión política, la religión o creencia, la sindicación o participación en organizaciones gremiales o la falta de ellas, el sexo, género, la maternidad, la lactancia materna, el amamantamiento, la orientación sexual, la identidad y expresión de género, el estado civil, la edad, la filiación, la apariencia personal y la enfermedad o discapacidad.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 0
  },
  {
    id: "q41",
    text: "¿La ley considera principios éticos que funden decisiones en alguna de las características descritas anteriormente?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 2.22
  },
  {
    id: "q42",
    text: "¿El sistema utilizará datos de varias bases de datos o fuentes diferentes?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
    info: "Diferentes bases de datos o fuentes de datos se refiere a la existencia de múltiples orígenes desde los cuales se obtienen o almacenan datos, que pueden ser utilizados en un mismo sistema, aplicación o proceso de análisis.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 0
  },
  {
    id: "q43",
    text: "¿El algoritmo fue desarrollado originalmente fuera de Chile o para un contexto distinto al propuesto?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
    info: "Se refiere a si el algoritmo ha sido desarrollado en un país distinto de Chile, lo que puede implicar desafíos adicionales en cuanto a su adecuación normativa, contexto sociocultural y condiciones de aplicación local.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 0
  },
  {
    id: "q44",
    text: "¿Está planificado realizar un análisis exploratorio inicial de los datos para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso?", 
    type: "yesno",
    dimension: "Equidad", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe verificar si se ha planificado un análisis exploratorio inicial de los datos para evaluar calidad, integridad, temporalidad y consistencia, así como para identificar desde el comienzo posibles sesgos, daños potenciales e implicaciones de su uso, y no solo en etapas posteriores.",
    scoreContribution: true,
    score: (answer) => answer === true ? 2.22 : 2.22
  },
  {
    id: "q45",
    text: "¿Se enmarca el sistema en alguna de las siguientes finalidades: educación, empleo, recursos humanos, servicios básicos, subsidios y ayuda económica, capacitación laboral, salud, seguridad pública, vivienda, protección social, autorizaciones o permisos administrativos?",
    type: "yesno",
    dimension: "Transparencia",
    stage: "Recolección y procesamiento de datos",
    info: "Se debe determinar si el algoritmo interviene en decisiones incluidas en procedimientos formales de la administración (solicitudes, revisiones, resoluciones y notificaciones) que siguen etapas normadas y afectan derechos u obligaciones de los ciudadanos.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
  },
  {
    id: "q47",
    text: "¿Sabrán los titulares que la decisión será mediada por un sistema de IA o tomada con base en algoritmos de IA?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
    info:"Se debe comprobar si los titulares son informados de que la decisión está mediada por IA o algoritmos, información obligatoria según la ley de protección de datos personales.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q48",
    text: "¿Existe una limitación técnica insalvable, acorde con el estado del arte —por ejemplo, derivada de modelos de aprendizaje automático ‘caja negra’ en sistemas de decisiones automatizadas o semiautomatizadas— que impida entregar información sobre el funcionamiento y los resultados del algoritmo?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
    info: "Se debe evaluar si la opacidad inherente a modelos de ‘caja negra’ de aprendizaje automático genera una limitación técnica insalvable que impida explicar su funcionamiento interno y justificar las decisiones o resultados del algoritmo.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
  },
  {
    id: "q49",
    text: "¿El algoritmo estará protegido por derechos de propiedad intelectual de terceros desarrolladores?", 
    type: "select",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
    info:"Se debe determinar si el algoritmo o modelo está sujeto a licencias, patentes o derechos de autor de terceros, lo que implica restricciones legales para su uso, modificación o distribución.",
    options: [
      { value: "Si", label: "Sí", score: 1.58 },
      { value: "No", label: "No", score: 0.0 },
      { value: "No Aplica", label: "No Aplica", score: 1.58 }
    ],
    scoreContribution: true,
    score: (answer) => answer === "Si" ? 1.58 : (answer === "No" ? 0 : 1.58)
  },
  {
    id: "q50",
    text: "¿Será exigida la entrega de Código fuente al tercero desarrollador?", 
    type: "yesnoNA",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.58 : 0
   
  },
  {
    id: "q51",
    text: "¿Se ha considerado algún mecanismo para que los usuarios internos o externos se comuniquen con la institución por los efectos o impactos que pueda producir el sistema?", 
    type: "yesno",
    dimension: "Transparencia", 
    stage: "Recolección y procesamiento de datos",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.58 : 0
  },
  {
    id: "q52",
    text: "Indique las principales características del sistema", 
    type: "multiselect",
    dimension: "Rendición de cuentas", 
    stage: "Uso y monitoreo",
    options: [
      { value: "Reconocimiento y detección de eventos", label: "Reconocimiento y detección de eventos", score: 0 },
      { value: "Predicción", label: "Predicción", score: 0 },
      { value: "Personalización", label: "Personalización", score: 0 },
      { value: "Soporte de interacción", label: "Soporte de interacción", score: 0 },
      { value: "Optimización", label: "Optimización", score: 0 },
      { value: "Razonamiento con estructuras de conocimiento", label: "Razonamiento con estructuras de conocimiento", score: 0 },
    ],
    scoreContribution: false,
    info: "Seleccione todas las funciones que describen el sistema:\n**Reconocimiento y detección de eventos**: Identifica patrones o sucesos en datos (imágenes, audio, señales) y notifica o actúa en consecuencia.\n**Predicción**: Anticipa valores o comportamientos futuros a partir de patrones históricos.\n**Personalización**: Ajusta la experiencia o la interfaz según las preferencias individuales.\n**Soporte de interacción**: Facilita la comunicación entre usuario y sistema (p. ej., chatbots, asistentes).\n**Optimización**: Mejora automáticamente procesos o recursos para cumplir objetivos específicos.\n**Razonamiento con estructuras de conocimiento**: Utiliza ontologías, grafos o reglas formales para inferir conclusiones y relaciones."
  },
  {
    id: "q53",
    text: "¿El sistema automatizado va a ser utilizado reemplazando la toma de decisiones?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "Debe seleccionarse ‘Sí’ si el sistema automatizado reemplazará decisiones que habitualmente toma una persona. En caso de que aún no se haya decidido este aspecto, marque también ‘Sí’ para que la herramienta proporcione la recomendación correspondiente.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.38 : 0
  },
  {
    id: "q54",
    text: "¿El sistema para la toma de decisiones estará completamente automatizado?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "Se considera completamente automatizado el sistema que, una vez entrenado y desplegado, ejecuta todas sus funciones —incluida la toma de decisiones— sin intervención humana directa en ninguna etapa operativa.",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.38 : 1.38
  },
  {
    id: "q55",
    text: " ¿Se proporcionará un mecanismo para obtener retroalimentación de los usuarios durante la operación del sistema?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: " ",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.38 : 0
  },
  {
    id: "q56",
    text: "¿Están planificadas auditorías algorítmicas?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "Por auditorías algorítmicas se entiende procesos planificados de revisión de sistemas basados en algoritmos para evaluar su funcionamiento, decisiones e impactos, con el fin de identificar riesgos como errores, sesgos, discriminación o incumplimientos normativos. Estas auditorías pueden ser internas o externas y realizarse antes o después del despliegue del sistema.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.38 : 0
  },
  {
    id: "q57",
    text: "¿Existe presupuesto para la realización de dichas auditorias algorítmicas?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "Se debe verificar si la organización dispone o habitualmente destina recursos financieros específicos para cubrir los costos de auditorías algorítmicas, incluyendo honorarios de auditores, herramientas de evaluación y otros gastos asociados.",
    dependsOn: {
      questionId: "q56",
      value: true
    },
    scoreContribution: true,
    score: (answer) => answer === false ? 1.38 : 0
  },
  {
    id: "q58",
    text: "¿Existe algún diseño para atender requerimientos de información de usuarios externos respecto del sistema?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "Se debe verificar si existe un proceso o mecanismo diseñado para atender solicitudes de información de usuarios externos —es decir, personas o entidades que no participaron en el desarrollo del sistema— sobre su funcionamiento, datos o decisiones.",
    scoreContribution: true,
    score: (answer) => answer === false ? 1.38 : 0
  },
  {
    id: "q59",
    text: "¿Se ha planificado  el resguardo de documentación tecnica, minutas de reuniones, actas y en general de la documentación que vaya justificando las decisiones que se adopten en el proyecto?",
    type: "yesno",
    dimension: "Rendición de cuentas",
    stage: "Uso y monitoreo",
    info: "",
    scoreContribution: true,
    score: (answer) => answer === true ? 1.38 : 1.38
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
        text: "Si el proyecto implica la adaptación o ampliación de una iniciativa existente, es fundamental garantizar el principio de equidad y prevenir cualquier forma de discriminación. Para lograrlo, las soluciones basadas en algoritmos o inteligencia artificial (IA) deben diseñarse y aplicarse teniendo en cuenta el contexto local. Esto implica realizar ajustes específicos que consideren las particularidades sociales, económicas y culturales de la región. Además, es esencial respetar y promover el multilingüismo y la diversidad cultural, asegurando que las herramientas sean inclusivas y accesibles para todas las personas, independientemente de su idioma o identidad cultural. Así debe verificarse la adaptación al contexto local, puesto si un modelo entrenado en datos de un país con características demográficas y culturales específicas puede no ser efectivo o incluso ser perjudicial si se utiliza en un contexto diferente.  La falta de sensibilidad cultural o lingüística en soluciones tecnológicas puede conducir a exclusiones involuntarias. Por ejemplo, un sistema que no soporte idiomas locales o dialectos puede marginar a comunidades enteras, limitando su acceso a servicios.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q6",
    recommendations: [
      {
        text: "Si el proyecto implica la adaptación o ampliación de una iniciativa existente, es fundamental garantizar el principio de equidad y prevenir cualquier forma de discriminación. Para lograrlo, las soluciones basadas en algoritmos o inteligencia artificial (IA) deben diseñarse y aplicarse teniendo en cuenta el contexto local. Esto implica realizar ajustes específicos que consideren las particularidades sociales, económicas y culturales de la región. Además, es esencial respetar y promover el multilingüismo y la diversidad cultural, asegurando que las herramientas sean inclusivas y accesibles para todas las personas, independientemente de su idioma o identidad cultural. Así debe verificarse la adaptación al contexto local, puesto si un modelo entrenado en datos de un país con características demográficas y culturales específicas puede no ser efectivo o incluso ser perjudicial si se utiliza en un contexto diferente.  La falta de sensibilidad cultural o lingüística en soluciones tecnológicas puede conducir a exclusiones involuntarias. Por ejemplo, un sistema que no soporte idiomas locales o dialectos puede marginar a comunidades enteras, limitando su acceso a servicios.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
    ]
  },
  {
    questionId: "q7",
    recommendations: [
      {
        text: "La definición del problema de política pública que se busca resolver es un paso crucial, no solo en proyectos de inteligencia artificial (IA), sino en el ciclo completo de diseño y ejecución de políticas públicas. Es fundamental identificar un problema prioritario al que la entidad debe responder y evaluar cómo una herramienta basada en IA puede aportar un valor agregado significativo.",
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
        text: "La definición del problema de política pública que se busca resolver es un paso crucial, no solo en proyectos de inteligencia artificial (IA), sino en el ciclo completo de diseño y ejecución de políticas públicas. Es fundamental identificar un problema prioritario al que la entidad debe responder y evaluar cómo una herramienta basada en IA puede aportar un valor agregado significativo.",
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
        text: "Una práctica altamente recomendada es analizar experiencias comparables de implementación de herramientas similares en otras instituciones o países. Este enfoque proporciona valiosa información sobre los retos y desafíos enfrentados, lo que no solo permite anticipar posibles obstáculos, sino también identificar estrategias exitosas que puedan ser adaptadas al nuevo contexto. Además, este análisis contribuye de manera significativa a evaluar la factibilidad del proyecto, al ofrecer perspectivas reales sobre los recursos, tiempos y capacidades necesarias para su ejecución.",
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
        text: "Si el uso de algoritmos o IA el proyecto, puede tener un impacto en los derechos de las personas, es fundamental garantizar que su implementación sea adecuada al contexto y proporcional al objetivo legítimo que se busca alcanzar. El sistema elegido debe ser cuidadosamente diseñado y evaluado para evitar vulneraciones o tensiones innecesarias con los derechos fundamentales. Para ello, es esencial realizar una evaluación contextual previa que permita identificar y gestionar posibles riesgos, asegurando que las soluciones tecnológicas respeten y se alineen con los derechos de las personas maximizando asi los beneficios.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true,
        resource: {
          text: "Evaluacion de impacto en DDHH",
          url: "https://www.humanrights.dk/tools/human-rights-impact-assessment-guidance-toolbox/guia-de-evaluacion-de-impacto-en-los-derechos"
        }
      },
    ]
  },
  {
    questionId: "q12",
    recommendations: [
      {
        text: "El sistema de IA seleccionado debe ser adecuado al contexto específico y fundamentarse en principios científicos rigurosos. En aquellos casos donde las decisiones puedan tener un impacto irreversible, sean difíciles de revertir o involucren aspectos críticos como decisiones de vida o muerte, es imprescindible que la decisión final sea adoptada, o al menos revisada, por un ser humano. Este enfoque garantiza  que ciertas decisiones o funciones críticas permanezcan bajo el control humano, incluso cuando se utilizan sistemas de IA avanzados. Este concepto está estrechamente relacionado con la necesidad de preservar la supervisión humana en situaciones donde las decisiones pueden tener un impacto significativo o irreversible en la vida de las personas.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Recomendación sobre la ética de la inteligencia artificial | UNESCO",
          url: "https://www.unesco.org/es/articles/recomendacion-sobre-la-etica-de-la-inteligencia-artificial"
        }
      },
    ]
  },
  {
    questionId: "q13",
    recommendations: [
      {
        text: "En la implementación de sistemas de IA o algoritmos destinados a responder o ejecutar un mandato legal o reglamentario que implique el tratamiento de datos personales, la base de licitud no es el consentimiento, sino la ley o normativa que sustenta dicho tratamiento. Sin embargo, esto no exime a los responsables de garantizar el cumplimiento de las salvaguardas necesarias para proteger los derechos de las personas. Deben implementarse medidas que aseguren la transparencia en las decisiones automatizadas, el acceso a los datos relevantes por parte de los interesados y el cumplimiento estricto de los requisitos establecidos en las normativas de protección de datos. La ejecución de un mandato legal no elimina las obligaciones relacionadas con la protección de la privacidad y la seguridad de los datos personales, que deben ser tratadas con el máximo rigor ético y legal.",
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
        text: "Las instituciones públicas deben operar siempre dentro de un marco legal claramente definido, en cumplimiento del principio de competencias y legalidad. Esto implica no solo actuar en el ámbito de las facultades conferidas por la ley, sino también garantizar que cualquier uso de datos personales o sensibles esté respaldado por una normativa habilitante específica. Para una adecuada rendición de cuentas, es fundamental identificar no solo la normativa que autoriza el uso de datos, sino también las condiciones particulares establecidas, ya sea en la legislación orgánica de la institución o en las normativas específicas que regulen la actividad en cuestión. Este enfoque asegura que las instituciones actúen de manera transparente y responsable.",
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
        text: "Sin una gestión adecuada de los stakeholders (actores clave incluida las comunidades), diversos temas de intenso debate pueden surgir y amenazar la viabilidad del proyecto, pudiendo generarse resistencia y desconfianza. Como mitigación, asegurar la participación de ciudadanos que pudieran verse impactados es clave para obtener y ,mantener un intangible denominado licencia social. La Licencia social es la aceptación, por parte de las personas de la introducción y el uso de herramientas de IA en sistemas de toma de decisiones o de soporte a la decisión. Cumplir únicamente con los marcos legales no es suficiente; es necesario dar un paso adicional para obtener la aceptación social, especialmente en lo que respecta a los posibles efectos adversos que la IA pueda tener en las personas. Esto incluye preocupaciones sobre la opacidad en la toma de decisiones, la falta de intervención humana y otros factores que puedan generar desconfianza, incluso cuando la institución pública tiene las facultades legales indiscutibles para actuar sobre un problema.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q16",
    recommendations: [
      {
        text: "Sin una gestión adecuada de los stakeholders (actores clave incluida las comunidades), diversos temas de intenso debate pueden surgir y amenazar la viabilidad del proyecto, pudiendo generarse resistencia y desconfianza. Como mitigación, asegurar la participación de ciudadanos que pudieran verse impactados es clave para obtener y ,mantener un intangible denominado licencia social. La Licencia social es la aceptación, por parte de las personas de la introducción y el uso de herramientas de IA en sistemas de toma de decisiones o de soporte a la decisión. Cumplir únicamente con los marcos legales no es suficiente; es necesario dar un paso adicional para obtener la aceptación social, especialmente en lo que respecta a los posibles efectos adversos que la IA pueda tener en las personas. Esto incluye preocupaciones sobre la opacidad en la toma de decisiones, la falta de intervención humana y otros factores que puedan generar desconfianza, incluso cuando la institución pública tiene las facultades legales indiscutibles para actuar sobre un problema.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q17",
    recommendations: [
      {
        text: "Sin una gestión adecuada de los stakeholders (actores clave incluida las comunidades), diversos temas de intenso debate pueden surgir y amenazar la viabilidad del proyecto, pudiendo generarse resistencia y desconfianza. Como mitigación, asegurar la participación de ciudadanos que pudieran verse impactados es clave para obtener y ,mantener un intangible denominado licencia social. La Licencia social es la aceptación, por parte de las personas de la introducción y el uso de herramientas de IA en sistemas de toma de decisiones o de soporte a la decisión. Cumplir únicamente con los marcos legales no es suficiente; es necesario dar un paso adicional para obtener la aceptación social, especialmente en lo que respecta a los posibles efectos adversos que la IA pueda tener en las personas. Esto incluye preocupaciones sobre la opacidad en la toma de decisiones, la falta de intervención humana y otros factores que puedan generar desconfianza, incluso cuando la institución pública tiene las facultades legales indiscutibles para actuar sobre un problema.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q18",
    recommendations: [
      {
        text: "Sin una gestión adecuada de los stakeholders (actores clave incluida las comunidades), diversos temas de intenso debate pueden surgir y amenazar la viabilidad del proyecto, pudiendo generarse resistencia y desconfianza. Como mitigación, asegurar la participación de ciudadanos que pudieran verse impactados es clave para obtener y ,mantener un intangible denominado licencia social. La Licencia social es la aceptación, por parte de las personas de la introducción y el uso de herramientas de IA en sistemas de toma de decisiones o de soporte a la decisión. Cumplir únicamente con los marcos legales no es suficiente; es necesario dar un paso adicional para obtener la aceptación social, especialmente en lo que respecta a los posibles efectos adversos que la IA pueda tener en las personas. Esto incluye preocupaciones sobre la opacidad en la toma de decisiones, la falta de intervención humana y otros factores que puedan generar desconfianza, incluso cuando la institución pública tiene las facultades legales indiscutibles para actuar sobre un problema.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q19",
    recommendations: [
      {
        text: "Es recomendable considerar la incorporación de una figura de responsable independiente de ética de la IA o algún otro mecanismo especializado que supervise las actividades relacionadas con la evaluación del impacto ético, las auditorías y el seguimiento continuo de los sistemas de IA. Esta función garantizaría que los sistemas de IA operen bajo los principios éticos establecidos y que se mantenga un enfoque coherente con los valores fundamentales, como la transparencia, la equidad y la justicia. La supervisión ética también debe incluir la capacidad de intervenir en caso de detectar sesgos, fallos o impactos negativos en los derechos de las personas.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      },
      {
        text: "Es recomendable considerar la incorporación de una figura de responsable independiente de ética de la IA o algún otro mecanismo especializado que supervise las actividades relacionadas con la evaluación del impacto ético, las auditorías y el seguimiento continuo de los sistemas de IA. Esta función garantizaría que los sistemas de IA operen bajo los principios éticos establecidos y que se mantenga un enfoque coherente con los valores fundamentales, como la transparencia, la equidad y la justicia. La supervisión ética también debe incluir la capacidad de intervenir en caso de detectar sesgos, fallos o impactos negativos en los derechos de las personas.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q20",
    recommendations: [
      {
        text: "Se debe fomentar activamente la participación y el compromiso de audiencias diversas en todas las etapas del ciclo de vida de los sistemas de IA, con el objetivo de lograr una representación equilibrada y equitativa de géneros y comunidades. Esto no solo contribuye a la inclusión y la diversidad, sino que también garantiza que los sistemas de IA sean diseñados y evaluados con una perspectiva amplia, reflejando las necesidades y realidades de todos los grupos sociales. La diversidad en los equipos de desarrollo es clave para mitigar sesgos y promover soluciones tecnológicas justas, éticas y accesibles para todas las personas.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q21",
    recommendations: [
      {
        text: "Es fundamental que se documente adecuadamente cada una de las decisiones tomadas durante el desarrollo de los sistemas de IA, especialmente cuando se procesan datos personales. Esta documentación debe ser clara y accesible para garantizar el cumplimiento de las obligaciones de transparencia establecidas por las normativas de protección de datos. La transparencia implica no solo informar sobre los criterios y procesos que guían las decisiones automatizadas, sino también permitir a los usuarios entender cómo se recopilan, procesan y utilizan sus datos. Además, se recomienda implementar fichas de transparencia. La ficha de transparencia es un documento que proporciona información relevante sobre la naturaleza, aspectos técnicos, funcionales y del proyecto del sistema de decisiones automatizadas. Desempeña un papel fundamental en la promoción de la transparencia, la rendición de cuentas y el uso ético de los algoritmos. La herramienta facilita la creación de esta ficha: ayuda a la identificación de la información relevante sobre el sistema de decisiones automatizadas que se debe transparentar y la presenta de manera clara, visible y comprensible tanto para los involucrados en el proceso institucional como para cualquier persona interesada.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q22",
    recommendations: [
      {
        text: "Los proyectos de inteligencia artificial requieren ser desarrollados no solo por profesionales técnicos capacitados,  si no además en colaboración de diversos profesionales dentro de la misma entidad pública. Es crucial la participación de los responsables de la gestión de los datos, los involucrados en el proceso de negocio donde se inserta la solución, los encargados de  infraestructura tecnológica (TI), los expertos en análisis de datos, asesores legales, y profesionales del área de comunicaciones. Esta colaboración interdisciplinaria no solo asegura una implementación efectiva de la IA, sino que también fortalece la capacidad de la institución para abordar los desafíos éticos, legales y sociales que pueden surgir a lo largo del proyecto. Es importante destacar que los sistemas de IA son inherentemente sociotécnicos, lo que significa que no solo involucran aspectos tecnológicos, sino también dinámicas sociales, organizacionales y culturales. Por lo tanto, la implementación de IA debe tener en cuenta las interacciones entre las personas, las instituciones y las tecnologías, asegurando que las soluciones no solo sean técnicamente viables, sino también socialmente responsables y adaptadas al contexto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Los proyectos de inteligencia artificial requieren ser desarrollados no solo por profesionales técnicos capacitados,  si no además en colaboración de diversos profesionales dentro de la misma entidad pública. Es crucial la participación de los responsables de la gestión de los datos, los involucrados en el proceso de negocio donde se inserta la solución, los encargados de  infraestructura tecnológica (TI), los expertos en análisis de datos, asesores legales, y profesionales del área de comunicaciones. Esta colaboración interdisciplinaria no solo asegura una implementación efectiva de la IA, sino que también fortalece la capacidad de la institución para abordar los desafíos éticos, legales y sociales que pueden surgir a lo largo del proyecto. Es importante destacar que los sistemas de IA son inherentemente sociotécnicos, lo que significa que no solo involucran aspectos tecnológicos, sino también dinámicas sociales, organizacionales y culturales. Por lo tanto, la implementación de IA debe tener en cuenta las interacciones entre las personas, las instituciones y las tecnologías, asegurando que las soluciones no solo sean técnicamente viables, sino también socialmente responsables y adaptadas al contexto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q23",
    recommendations: [
      {
        text: "Los proyectos de inteligencia artificial requieren ser desarrollados no solo por profesionales técnicos capacitados,  si no además en colaboración de diversos profesionales dentro de la misma entidad pública. Es crucial la participación de los responsables de la gestión de los datos, los involucrados en el proceso de negocio donde se inserta la solución, los encargados de  infraestructura tecnológica (TI), los expertos en análisis de datos, asesores legales, y profesionales del área de comunicaciones. Esta colaboración interdisciplinaria no solo asegura una implementación efectiva de la IA, sino que también fortalece la capacidad de la institución para abordar los desafíos éticos, legales y sociales que pueden surgir a lo largo del proyecto. Es importante destacar que los sistemas de IA son inherentemente sociotécnicos, lo que significa que no solo involucran aspectos tecnológicos, sino también dinámicas sociales, organizacionales y culturales. Por lo tanto, la implementación de IA debe tener en cuenta las interacciones entre las personas, las instituciones y las tecnologías, asegurando que las soluciones no solo sean técnicamente viables, sino también socialmente responsables y adaptadas al contexto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Los proyectos de inteligencia artificial requieren ser desarrollados no solo por profesionales técnicos capacitados,  si no además en colaboración de diversos profesionales dentro de la misma entidad pública. Es crucial la participación de los responsables de la gestión de los datos, los involucrados en el proceso de negocio donde se inserta la solución, los encargados de  infraestructura tecnológica (TI), los expertos en análisis de datos, asesores legales, y profesionales del área de comunicaciones. Esta colaboración interdisciplinaria no solo asegura una implementación efectiva de la IA, sino que también fortalece la capacidad de la institución para abordar los desafíos éticos, legales y sociales que pueden surgir a lo largo del proyecto. Es importante destacar que los sistemas de IA son inherentemente sociotécnicos, lo que significa que no solo involucran aspectos tecnológicos, sino también dinámicas sociales, organizacionales y culturales. Por lo tanto, la implementación de IA debe tener en cuenta las interacciones entre las personas, las instituciones y las tecnologías, asegurando que las soluciones no solo sean técnicamente viables, sino también socialmente responsables y adaptadas al contexto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]

  },
  {
    questionId: "q24",
    recommendations: [
      {
        text: "De acuerdo a lo indicado en su respuesta, existiendo uso de datos personales aplica la normativa de protección de datos general o particular que rija la actividad. Esto implica verificar que se cumplan las condiciones de licitud del tratamiento de los datos, los deberes de transparencia proporcionando información adecuada a los usuarios sobre cómo se utilizan sus datos. Además, es fundamental establecer procedimientos claros y accesibles para el ejercicio de los derechos relacionados con la protección de datos, como el derecho de acceso, rectificación, cancelación y oposición. Estas medidas aseguran que el tratamiento de datos se realice de manera conforme a la legislación vigente, protegiendo los derechos fundamentales de los usuarios y promoviendo la confianza en los sistemas de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q25",
    recommendations: [
      {
        text: "De acuerdo a lo indicado en su respuesta, existiendo uso de datos personales aplica la normativa de protección de datos general o particular que rija la actividad. Esto implica verificar que se cumplan las condiciones de licitud del tratamiento de los datos, los deberes de transparencia proporcionando información adecuada a los usuarios sobre cómo se utilizan sus datos. Además, es fundamental establecer procedimientos claros y accesibles para el ejercicio de los derechos relacionados con la protección de datos, como el derecho de acceso, rectificación, cancelación y oposición. Estas medidas aseguran que el tratamiento de datos se realice de manera conforme a la legislación vigente, protegiendo los derechos fundamentales de los usuarios y promoviendo la confianza en los sistemas de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q26",
    recommendations: [
      {
        text: "Si su sistema va a utilizar datos personales, es fundamental verificar y establecer un procedimiento claro para el ejercicio de los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición). Esto significa implementar mecanismos accesibles y permanentemente disponibles para que los usuarios puedan ejercer estos derechos de manera efectiva. El procedimiento debe incluir detalles sobre cómo los usuarios pueden solicitar acceso a sus datos, corregir información inexacta, solicitar la eliminación de datos o expresar oposición al tratamiento de sus datos personales.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q27",
    recommendations: [
      {
        text: "En la hipótesis de recogida de datos por sensores automatizados, fortalecer los deberes de información y transparencia se vuelve una cuestión critica. Diseñe mecanismos para disponibilizar  información clara y accesible sobre el tipo de datos que se están recopilando, el propósito de la recopilación, la base legal que justifica el tratamiento y los posibles destinatarios de los datos. Si no es posible entregar esta información en el momento de la recolección, asegure que esta información esté disponible en algún sitio web que informe sobre el proyecto o sistema implementado. Además, se deben establecer mecanismos para que los usuarios puedan ejercer sus derechos de forma sencilla, como el acceso, la rectificación o la eliminación de sus datos si fuera procedente.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q28",
    recommendations: [
      {
        text: "Cuando los datos personales provengan de entidades externas para enriquecer los datos de la entidad, es fundamental verificar las condiciones legales de la cesión o transferencia de éstos, asegurando que se cumplan a lo menos los siguientes requisitos: \n a) Consentimiento o ley habilitante: Confirmar que la cesión de datos se basa en el consentimiento explícito del titular o en una base legal válida que habilite el tratamiento, como una obligación legal o cualquiera de las habilitantes reconocida en la ley, inclusive el interés legítimo.\n b) Contrato escrito: Asegurarse de que exista un contrato escrito que regule la cesión de los datos personales, especificando claramente las responsabilidades y obligaciones de las partes involucradas en cuanto al tratamiento y uso de los datos.\n c) Finalidad de la cesión: Verificar que la cesión de los datos esté claramente justificada por una finalidad específica y legítima, de acuerdo con la normativa de protección de datos, y que dicha finalidad sea compatible con el propósito original para el cual se recogieron los datos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q29",
    recommendations: [
      {
        text: "En cumplimiento de la normativa de protección de datos, debe realizar una evaluación ex ante sobre la idoneidad de los datos a tratar, mediante un análisis de proporcionalidad que garantice que los datos personales recopilados y procesados se limiten estrictamente a aquellos que sean necesarios, adecuados y pertinentes para los fines específicos del tratamiento. Este análisis se realiza en cumplimiento del principio de minimización de datos, que exige que no se utilicen más datos de los imprescindibles para alcanzar el propósito establecido. Además, debe justificarse que la cantidad, la naturaleza y la duración del tratamiento de los datos estén alineadas con el objetivo legítimo perseguido, minimizando así los riesgos para la privacidad y los derechos de los individuos. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q30",
    recommendations: [
      {
        text: "Recomendamos evaluar la necesidad de contar con datos personales identificados para el entrenamiento y prueba. La ley exige al responsable y al encargado del tratamiento aplicar las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, que en su caso incluya, entre otros, la seudonimización y el cifrado de datos personales; Recomendamos evaluar si es posible tratar los datos de forma agregada o anonimizada, limitando el uso de datos identificables solo a lo estrictamente necesario para cumplir con los fines legítimos del tratamiento. Estas medidas son esenciales para prevenir accesos no autorizados, pérdida de datos o cualquier otro riesgo que pueda comprometer la privacidad de los individuos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q31",
    recommendations: [
      {
        text: "De acuerdo al caso de uso señalado, procede realizar una evaluación de impacto en protección de datos personales (EIPD).  La EIPD es una metodologia para evaluar, identificar y mitigar los riesgos potenciales asociados al tratamiento de los datos, asegurando que se respeten los derechos de los individuos y se cumpla con las normativas de protección de datos vigentes. La EIPD debe analizar la naturaleza, el alcance, el contexto y los fines del tratamiento, así como las posibles consecuencias sobre la privacidad y la seguridad de los datos personales. Además, debe incluir medidas de mitigación de riesgos, como la implementación de técnicas de seudonimización, cifrado, y otras medidas de seguridad apropiadas, con el fin de garantizar que los datos sean tratados de manera legal y segura.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true

      }
    ]
  },
  {
    questionId: "q32",
    recommendations: [
      {
        text: "La normativa de protección de datos exige establecer procedimientos claros y accesibles para el ejercicio de los derechos relacionados con la protección de datos, como el derecho de acceso, rectificación, cancelación y oposición. Verifique la procedencia de cada uno de ellos.",
        condition: (answer: boolean | string | null) => answer === "Si, pero parcialmente" || answer === "No"
      },
      {
        text: "La normativa de protección de datos exige establecer procedimientos claros y accesibles para el ejercicio de los derechos relacionados con la protección de datos, como el derecho de acceso, rectificación, cancelación y oposición. Verifique la procedencia de cada uno de ellos.",
        condition: (answer: boolean | string | null) => answer === "Si, pero parcialmente"
      }
    ]
  },
  {
    questionId: "q33",
    recommendations: [
      
      {
        text: "En estos casos deben garantizarse niveles de información suficientes relacionados con la existencia de decisiones automatizadas, información significativa sobre la lógica aplicada al tratamiento, así como las consecuencias previstas de dicho tratamiento para el titular, garantizando niveles de explicación suficientes respectos de la consecuencias probables del tratamiento de datos",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q34",
    recommendations: [
      {
        text: "Evaluar el uso de herramientas que permitan transparentar factores o elementos que tome en cuenta el algoritmo para llegar al resultado. El sector público está sujeto a normativas de transparencia en la función publica reforzadas por mandatos de la ley de datos personales frente a la toma de decisiones automatizadas. Una herramienta adecuada es la a ficha de transparencia es un documento que proporciona información relevante sobre la naturaleza, aspectos técnicos, funcionales y del proyecto del sistema de decisiones automatizadas. Desempeña un papel fundamental en la promoción de la transparencia, la rendición de cuentas y el uso ético de los algoritmos. La herramienta facilita la creación de esta ficha: ayuda a la identificación de la información relevante sobre el sistema de decisiones automatizadas que se debe transparentar y la presenta de manera clara, visible y comprensible tanto para los involucrados en el proceso institucional como para cualquier persona interesada.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false

      }
    ]
  },
  {
    questionId: "q35",
    recommendations: [
      {
        text: "De acuerdo a sus respuestas la entidad está calificada como servicio esencial debiendo cumplir los estándares dictados por la ANCI para los servicios esenciales. ",
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
    questionId: "q37.1",
    recommendations: [
      {
        text: "Si el sistema será desarrollado por un tercero subcontratado, es fundamental incluir cláusulas contractuales que obliguen al proveedor a cumplir con las políticas de seguridad establecidas por la entidad responsable del tratamiento de los datos. Estas cláusulas deben especificar claramente las obligaciones del tercero en cuanto a la protección de datos personales, incluyendo la implementación de medidas de seguridad adecuadas, la notificación inmediata de cualquier incidente de seguridad, y la obligación de garantizar la confidencialidad y el acceso restringido a la información. Además, se deben prever auditorías regulares y revisiones de cumplimiento para asegurar que el tercero mantenga un nivel de seguridad adecuado durante todo el ciclo de vida del proyecto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q38",
    recommendations: [
      {
        text: "La implementación de un Sistema de Gestión de Seguridad de la Información (SGSI) permite hacer un monitoreo adecuado de los riesgos de seguridad en la organización, incluido en el uso de los sistemas de IA. Dado que estos manejan grandes volúmenes de datos y pueden ser utilizados en la toma decisiones automatizadas con un impacto significativo, es esencial contar con un marco sólido que asegure la confidencialidad, integridad,  disponibilidad y resiliencia de la información, así como la protección de los derechos de los usuarios. \nUn SGSI bien estructurado ayuda a identificar y mitigar riesgos de seguridad, garantizando que los algoritmos de IA no solo sean robustos, sino también seguros frente a amenazas cibernéticas. Asimismo, un SGSI proporciona un enfoque sistemático para la gestión de incidentes de seguridad, asegurando que cualquier vulnerabilidad o brecha en la seguridad sea identificada rápidamente y abordada de manera eficaz. Esto es fundamental en proyectos de IA, donde la rapidez en la detección y respuesta a incidentes puede prevenir daños mayores y proteger tanto a las organizaciones como a los usuarios. \nPor lo tanto, integrar un SGSI en el ciclo de vida del desarrollo de proyectos de IA es una práctica recomendada para garantizar la seguridad, fiabilidad y sostenibilidad a largo plazo de estas tecnologías innovadoras.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      },
    ]
  },
  {
    questionId: "q39",
    recommendations: [
      {
        text: "Los sistemas de IA son activos cibernéticos dentro de una infraestructura de TIC. Cada uno de sus componentes fuentes de datos, datos, algoritmos, modelos de entrenamiento, procesos de implementación/gestión de datos/pruebas.Estos componentes  pertenecen a las capas de una infraestructura de TIC de la organización. Dado que los sistemas de IA son parte de la infraestructura de las TIC, no solo se deben aplicar prácticas de ciberseguridad específicas de la IA, sino también aquellas que protejan las TIC que abarcan los elementos de la IA. Un buen enfoque para abordar la especificidad de la ciberseguridad por 'capas' es la guia de ENISA (Agencia europea de ciberseguridad), que ofrece un cuestionario de evaluación de preparación en este sentido.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false,
        resource: {
          text: "Guía de agencia europea de ciberseguridad (ENISA)",
          url: "https://www.enisa.europa.eu/publications/cybersecurity-of-ai-and-standardisation"
        }
      },

    ]
  },
  {
    questionId: "q39.1",
    recommendations: [
      {
        text: "Los sistemas algorítmicos y de IA presentan riesgos específicos de ciberseguridad que debieran abordarse, más allá de los controles tradicionales. Recomendamos revisar está tipología de riesgos y verificar que el análisis, la política y los planes de acción incorporen mecanismos de prevención de estas acciones de acuerdo al proyecto específico.",
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
        text: "Utilice para el analisis exploratorio un perfil de datos. Este perfil es un análisis exploratorio inicial durante la fase de recolección y procesamiento de datos del ciclo de vida de IA. Brinda información para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso. En este analisis es posible que descubra que será necesario imputar valores faltantes en los datos. Es importante documentar el porqué no se tienen esa información, si los datos faltantes están asociados a la variable a predecir.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Es recomendable realizar un analisis exploratorio de los datos para ayudar a evaluar los problemas con estos  y documentar las características de un sistema de IA, las suposiciones realizadas y las medidas de mitigación de riesgos aplicadas a lo largo del ciclo de vida. Puede elaborar un  perfil de datos. Este perfil es un análisis exploratorio inicial durante la fase de recolección y procesamiento de datos del ciclo de vida de IA. Brinda información para evaluar la calidad, integridad, temporalidad, consistencia y posibles sesgos, daños potenciales e implicaciones de su uso. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },

  {
    questionId: "q45",
    recommendations: [
      {
        text: "Si un sistema algorítmico opera dentro de la administración del Estado, se sujetará a las normas administrativas y de derecho público correspondiente. Esto implica que siendo parte un proceso administrativo su despliegue y funcionamiento están sujetos a las normas administrativas de transparencia. ",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Es fundamental que los algoritmos utilizados en áreas de alto impacto como la educación, el empleo, los servicios básicos, los subsidios y la ayuda económica, la capacitación laboral, la salud, la seguridad pública, la vivienda, la protección social, y los procesos administrativos como autorizaciones o permisos, sean transparentes y comprensibles. La opacidad de estos algoritmos puede generar desconfianza, reforzar sesgos injustos y perpetuar desigualdades, afectando de manera directa la vida de las personas. La transparencia en el diseño y la toma de decisiones algorítmica permite que los ciudadanos comprendan cómo se les asignan recursos, beneficios o servicios, y asegura que los sistemas sean justos, éticos y responsables. Además, garantiza que los procesos sean auditables y que se puedan corregir posibles errores o sesgos, promoviendo una mayor equidad y evitando la discriminación en áreas clave para el bienestar social. La Recomendación de Transparencia Algoritmica del Consejo para la Transprencia señala vias para fomentar la información en este caso de algoritmos.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Si al algoritmo no opera dentro de algun proceso administrativo, aplican minimos de transparencia, relacionados con el hecho de estar interactuando con un sistema de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q47",
    recommendations: [
      {
        text: "Se recomienda aplicar minimos de transparencia e información relacionados con el hecho de estar interactuando con un sistema de IA.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q48",
    recommendations: [
      {
        text: "Evaluar herramientas que permitan transparentar factores o elementos que tome en cuenta el algoritmo para llegar al resultado. El sector público está sujeto a normativas de transparencia en la función publica reforzadas por mandatos de la ley de datos personales frente a la toma de decisiones automatizadas. Es recomendable desarrollar una ficha de transparencia, documento que proporciona información relevante sobre la naturaleza, aspectos técnicos, funcionales y del proyecto del sistema de decisiones automatizadas. Desempeña un papel fundamental en la promoción de la transparencia, la rendición de cuentas y el uso ético de los algoritmos. La herramienta facilita la creación de esta ficha: ayuda a la identificación de la información relevante sobre el sistema de decisiones automatizadas que se debe transparentar y la presenta de manera clara, visible y comprensible tanto para los involucrados en el proceso institucional como para cualquier persona interesada.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q49",
    recommendations: [
      {
        text: "Los sistemas pueden estar protegidos por derechos de propiedad intelectual, sin embargo,  el Estado actua bajo una obligación de transparencia debiendo justificar el resultado de sus decisiones. Asegure la implementación de mecanismos que permitan comprender como un sistema llega a sus resultados, y que a lo menos pueda responder las solicitudes relacionadas con la normativa de datos personales, relacionadas con los deberes de transparencia contenidas en el articulo 14 ter, o solictudes de acceso a la información pública que podrian ser requeridas en este punto.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Si fuera procedente por disposiciones contractuales, debe garantizarse  la entrega adecuada y transparente del código fuente del sistema. Se aconseja especialmente acordar su entrega cuando el sistema impacte áreas sensibles como la salud, la seguridad pública o los servicios financieros. La entrega del código fuente no solo facilita la auditoría y revisión externa de los algoritmos, sino que también promueve la transparencia, la reproducibilidad de resultados y la posibilidad de detectar y corregir posibles sesgos o vulnerabilidades. Al entregar el código fuente, se debe asegurar que esté debidamente documentado. En el caso que no sea posible exigirlo, la entidad deberá exigir al proveedor niveles adecuados de transparencia que le permita cumplir sus obligaciones legales.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
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
      }
    ]
  },
  {
    questionId: "q51",
    recommendations: [
      {
        text: "Se recomienda establecer mecanismos que permitan que la ciudadanía tenga una oportunidad de réplica y, de ser necesario, de impugnar el uso de un determinado sistema o los lineamientos empleados para su desarrollo por parte de un organismo público. El uso incorrecto de los sistemas podría conllevar desde un aprovechamiento no óptimo de los recursos, hasta el desencadenamiento de casos de vulneración de derechos de los ciudadanos. Los riesgos y daños potenciales son variados y a menudo difíciles de anticipar. Los hay fundamentalmente de dos tipos: riesgos de inclusión (por ej. asignación de recursos o beneficios a quienes no corresponde) y de exclusión (por ej privación de recursos o beneficios a personas que sí los necesitan).",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q52",
    recommendations: [
      /*{
        text: " ",
        condition: (answer: string[]) => !answer.includes("Reconocimiento y detección de eventos")
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
        text: "Se recomienda comunicar de manera clara y transparente cómo se toman las decisiones en el sistema, especificando si el modelo actúa como un sistema autónomo de toma de decisiones o como una herramienta de apoyo para la toma de decisiones humanas. Además, es imprescindible realizar monitoreos periódicos de la herramienta para evaluar su desempeño, identificar posibles sesgos o errores, y garantizar que continúa cumpliendo con los objetivos establecidos, los estándares éticos y las normativas aplicables.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      }
    ]
  },
  {
    questionId: "q54",
    recommendations: [
      {
        text: "Se recomienda comunicar de manera clara y transparente cómo se toman las decisiones en el sistema, especificando si el modelo actúa como un sistema autónomo de toma de decisiones o como una herramienta de apoyo para la toma de decisiones humanas. Además, es imprescindible realizar monitoreos periódicos de la herramienta para evaluar su desempeño, identificar posibles sesgos o errores, y garantizar que continúa cumpliendo con los objetivos establecidos, los estándares éticos y las normativas aplicables.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === true
      },
      {
        text: "Se recomienda comunicar de manera clara y transparente cómo se toman las decisiones en el sistema, especificando si el modelo actúa como un sistema autónomo de toma de decisiones o como una herramienta de apoyo para la toma de decisiones humanas. Además, es imprescindible realizar monitoreos periódicos de la herramienta para evaluar su desempeño, identificar posibles sesgos o errores, y garantizar que continúa cumpliendo con los objetivos establecidos, los estándares éticos y las normativas aplicables.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
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
      {
        text: "Una auditoría algorítmica es un estudio que busca evaluar el funcionamiento de un sistema algorítmico, durante su despliegue, considerando aspectos de diseño, datos, impactos en materia de precisión, privacidad y seguridad, entre otros. Estas pueden realizarse a manera de medición frente a ciertos estándares (auditorías de rendimiento), o bien como un análisis de cumplimiento de normas particulares (auditorías de cumplimiento). Su importancia radica en que los sistemas  pueden precisar fallas o riesgos que no se detectan a primera vista o cuya relevancia se descuida debido a la frecuencia con que se realizan ciertos procesos. Mientras más complejos sean los sistemas, existen mayores probabilidades de que se presenten errores. La auditoría es un mecanismo de control y revisión que poder realizado por un profesional  interno como externo y su importancia es que permite verificar que se cumplan  los siguientes propósitos : 1) rendir cuenta sobre el uso de los sistemas algorítmicos 2) Fortalecer la capacidad interna de los organismos públicos de evaluar los sistemas que construyen o adquieren, y facilitar que obtengan una mayor experiencia anticipándose a impactos indeseados. 3) son un mecanismo de responsabilidad en el uso de algoritmos, mediante un mecanismo útil y continuo para que terceros revisen y evalúen estos sistemas, de modo que sea posible identificar problemas y resolverlos o mitigarlos.  Planificar auditorías algorítmicas es esencial para garantizar el cumplimiento de estándares, regulaciones o de lo planificado o esperable del sistema. Las auditorias permiten revisar la fiabilidad de los sistemas de inteligencia artificial (IA), identificar sesgos en los datos, errores en los modelos y posibles impactos negativos en los usuarios, asegurando que las decisiones tomadas por los algoritmos sean éticas y justas. También son una herramienta clave para evaluar la sostenibilidad del modelo a largo plazo, facilitando su mejora continua y minimizando riesgos legales, reputacionales o de seguridad. Incorporar auditorías algorítmicas regulares desde la planificación inicial de un proyecto garantiza un enfoque preventivo, en lugar de reactivo, lo que resulta en sistemas más responsables y alineados con los valores organizacionales y sociales.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q57",
    recommendations: [
      {
        text: "Destinar un presupuesto específico para auditorías algorítmicas es esencial para su ejecución. Estas auditorías requieren recursos especializados, como equipos multidisciplinarios, herramientas de análisis y tiempo para evaluar exhaustivamente los modelos, los datos utilizados y los resultados generados. Sin un presupuesto adecuado, las auditorías pueden ser superficiales o postergadas, lo que aumenta el riesgo de que los sistemas presenten sesgos, errores o vulnerabilidades que impacten negativamente a los usuarios y la organización. Además, invertir en auditorías reduce significativamente los riesgos legales, financieros y reputacionales. La planificación presupuestaria para auditorías debe considerarse una inversión estratégica.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q58",
    recommendations: [
      {
        text: "No contemplar un diseño adecuado para atender los requerimientos de información de usuarios externos en sistemas de servicios públicos puede generar múltiples falencias. Entre ellas, destacan la falta de transparencia, que puede provocar desconfianza en el sistema de IA o el uso de algoritmos, y la dificultad para que los usuarios comprendan cómo se toman decisiones que afectan sus vidas, como la asignación de recursos o la priorización de servicios. Además, la ausencia de un mecanismo claro y accesible para responder a estas solicitudes puede resultar en una mayor cantidad de reclamaciones, saturación de otros canales de atención y una percepción negativa sobre la gestión del servicio. También puede representar incumplimientos normativos en casos donde la legislación exige accesibilidad y rendición de cuentas en el manejo de sistemas automatizados.",
        condition: (answer: Answer) => typeof answer === 'boolean' && answer === false
      }
    ]
  },
  {
    questionId: "q59",
    recommendations: [
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
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDimension, setCurrentDimension] = useState(dimensions[0])
  const [userEmail] = useState<string | null>(initialEmail ?? null)
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, boolean>>({})
  const [totalScore, setTotalScore] = useState(0)
  const [scoreByDimension, setScoreByDimension] = useState<Record<string, number>>({});
  const router = useRouter()
  const tableRef = useRef<HTMLTableElement>(null)
  const VERSION = process.env.NEXT_PUBLIC_VERSION || "1.0.0"
  const MIN_SCORE = 18.32


  const calculateTotalScore = (answers: Record<string, string | string[] | boolean | null>): number => {
    const rawScore = questions.reduce((total, question) => {
      if (question.scoreContribution && question.score) {
        return total + question.score(answers[question.id]);
      }
      return total;
    }, 0);
    
    return Math.max(rawScore, MIN_SCORE);
  }

  const shouldShowQuestion = (question: Question, answers: Record<string, Answer>): boolean => {
    if (!question.dependsOn) return true;

    const parentAnswer = answers[question.dependsOn.questionId];
    const condition = question.dependsOn.value;

    if (typeof condition === 'function') {
      return condition(parentAnswer);
    }

    if (Array.isArray(condition)) {
      return Array.isArray(parentAnswer) && condition.every(c => parentAnswer.includes(c));
    }

    return parentAnswer === condition;
  };

  const getImpactLevel = (score: number): string => {
    if (score <= 18.32) return "Bajo impacto";
    if (score <= 45.54) return "Impacto moderado";
    if (score <= 72.77) return "Alto impacto";
    return "Impacto muy alto";
  }

  const getScoreByDimension = (answers: Record<string, string | string[] | boolean | null>): Record<string, number> => {
    return dimensions.reduce((acc, dimension) => {
      const dimensionQuestions = questions.filter(q => q.dimension === dimension);
      const dimensionScore = dimensionQuestions.reduce((total, question) => {
        if (question.scoreContribution && question.score) {
          return total + question.score(answers[question.id]);
        }
        return total;
      }, 0);
      acc[dimension] = dimensionScore;
      return acc;
    }, {} as Record<string, number>);
  }

  useEffect(() => {
    if (!userEmail) {
      router.push('/')
    } else {
      // Cargar respuestas guardadas cuando el componente se monta
      const savedData = localStorage.getItem(`evaluationData_${userEmail}`)
      if (savedData) {
        const { answers: savedAnswers } = JSON.parse(savedData)
        setAnswers(savedAnswers)
        const newTotalScore = calculateTotalScore(savedAnswers);
        const newScoreByDimension = getScoreByDimension(savedAnswers);
        setTotalScore(newTotalScore);
        setScoreByDimension(newScoreByDimension);
      }
    }
  }, [userEmail, router])

  useEffect(() => {
    const visibleQuestions = questions.filter(q => shouldShowQuestion(q, answers))
    const answeredQuestions = visibleQuestions.filter(q => {
      const ans = answers[q.id]
      return ans !== undefined && ans !== null && ans !== ''
    }).length
    const totalQuestions = visibleQuestions.length
    setProgress(totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0)
  }, [answers])

  const handleAnswer = (questionId: string, value: Answer) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers, [questionId]: value }
      if (userEmail) {
        const dataToSave = {
          answers: newAnswers,
          timestamp: new Date().getTime()
        }
        localStorage.setItem(`evaluationData_${userEmail}`, JSON.stringify(dataToSave))
      }
      const newTotalScore = calculateTotalScore(newAnswers);
      setTotalScore(newTotalScore);
      return newAnswers;
    })
  }

  const formatAnswer = (answer: Answer): string => {
    if (typeof answer === 'boolean') {
      return answer ? 'Sí' : 'No'
    } else if (answer === null) {
      return 'No aplica'
    } else if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    return String(answer)
  }

  const getGeneralInfo = () => {
    const generalQuestions = questions.filter(q => q.dimension === 'General').slice(0, 4)
    return generalQuestions.map(q => ({
      question: q.text,
      answer: formatAnswer(answers[q.id] || '')
    }))
  }

  const getGroupedRecommendations = () => {
    const allRecommendations = questions.flatMap((question) => {
      const answer = answers[question.id]
      if (answer === undefined) return []

      const questionRecommendations = recommendations.find(r => r.questionId === question.id)
      if (!questionRecommendations) return []

      const dimensionIndex = dimensions.indexOf(question.dimension) + 1
      const questionIndex = questions.filter(q => q.dimension === question.dimension).indexOf(question) + 1
      const questionNumber = `${dimensionIndex}.${questionIndex}`

      return questionRecommendations.recommendations
        .filter(rec => {
          if (Array.isArray(answer)) {
            return answer.some(ans => rec.condition(ans))
          }
          return rec.condition(answer)
        })
        .map(rec => ({
          text: rec.text,
          resource: rec.resource,
          question: question.text,
          questionNumber: questionNumber,
          answer: formatAnswer(answer),
          stage: question.stage
        }))
    })

    const groupedRecommendations = allRecommendations.reduce((acc, curr) => {
      const existingRec = acc.find(r => r.text === curr.text && r.resource?.url === curr.resource?.url)
      if (existingRec) {
        existingRec.questions.push({ text: curr.question, number: curr.questionNumber, answer: curr.answer })
      } else {
        acc.push({
          text: curr.text,
          resource: curr.resource,
          questions: [{ text: curr.question, number: curr.questionNumber, answer: curr.answer }],
          stage: curr.stage
        })
      }
      return acc
    }, [] as Array<{
      text: string,
      resource?: { text: string, url: string },
      questions: Array<{ text: string, number: string, answer: string }>,
      stage: string
    }>)

    // Group by stage
    const groupedByStage = groupedRecommendations.reduce((acc, curr) => {
      if (!acc[curr.stage]) {
        acc[curr.stage] = []
      }
      acc[curr.stage].push(curr)
      return acc
    }, {} as Record<string, typeof groupedRecommendations>)

    return groupedByStage
  }

  const handleCheckboxChange = (stageIndex: string) => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [stageIndex]: !prev[stageIndex]
    }))
  }

  

  const isDimensionComplete = (dim: string) => {
    return questions.filter(q => q.dimension === dim).every(q => answers[q.id] !== undefined)
  }

  const saveEvaluation = () => {
    if (userEmail) {
      const dataToSave = {
        answers,
        timestamp: new Date().getTime()
      }
      localStorage.setItem(`evaluationData_${userEmail}`, JSON.stringify(dataToSave))
      alert('Evaluación guardada correctamente')
    }
  }

  const loadEvaluation = () => {
    if (userEmail) {
      const savedData = localStorage.getItem(`evaluationData_${userEmail}`)
      if (savedData) {
        const { answers: savedAnswers } = JSON.parse(savedData)
        setAnswers(savedAnswers)
        const newTotalScore = calculateTotalScore(savedAnswers);
        setTotalScore(newTotalScore);
        alert('Evaluación cargada correctamente')
      } else {
        alert('No se encontró ninguna evaluación guardada')
      }
    }
  }

  const isLastDimension = currentDimension === dimensions[dimensions.length - 1]
  
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
        case 'textArea':
          return (
            <Textarea
            id={question.id}
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="min-h-[100px] text-base leading-relaxed"
            placeholder="Ingrese su respuesta aquí..."
          />
          )
      case 'select':
        return (
          <Select 
            value={answers[question.id] as string} 
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
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
        const answerValue = answers[question.id]
        let radioValue = ''
        if (answerValue === true) radioValue = 'yes'
        else if (answerValue === false) radioValue = 'no'
        else if (answerValue === null && question.type === 'yesnoNA') radioValue = 'na'
        
        return (
          <RadioGroup
            value={radioValue}
            onValueChange={(value) => {
              let newValue: boolean | null = null
              if (value === 'yes') newValue = true
              else if (value === 'no') newValue = false
              else if (value === 'na' && question.type === 'yesnoNA') newValue = null
              handleAnswer(question.id, newValue)
            }}
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
  
  const exportToPDF = () => {
    if (tableRef.current) {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const html2pdf = require('html2pdf.js');
      /* eslint-enable @typescript-eslint/no-require-imports */
      const element = tableRef.current;
      const opt = {
        margin: 7,
        filename: 'evaluacion_impacto_algoritmico.pdf',
        image: { type: 'jpeg', quality: 0.70 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'A4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        autoPaging: true,
        fontFaces: [
          { family: 'Arial', style: 'normal' },
          { family: 'Arial', style: 'bold' }
        ]
      };

      // Contenido con encabezado
      const headerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 0; border-bottom: 1px solid #ddd;">
        <img src="/images/logo-goblab-uai.png" alt="Logo Derecho" style="height: 40px; margin-right: 10px;" />
        <div style="flex-grow: 1; text-align: center; font-size: 14px; font-weight: bold;">
          Evaluación de Impacto Algorítmico
        </div>
        <img src="/images/herramientas.png" alt="Logo Izquierdo" style="height: 40px; margin-left: 10px;" />
        
      </div>
    `;

    // Agregar encabezado en cada página
    const pdfContent = `
      <div>
        ${headerHTML}
        <div id="pdf-content" style="margin-top: 40px;">${element.innerHTML}</div>
      </div>
    `;

  
      html2pdf().set(opt).from(pdfContent).save();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between space-y-1 p-4 rounded-lg backdrop-blur-sm items-center">
        <Image src="/images/logo-goblab-uai.png" alt="Gob_Lab UAI" width={220} height={5} />
        <h1 className="text-2xl font-bold mb-4 text-center">Evaluación de Impacto Algorítmico</h1>
        <Image src="/images/herramientas.png" alt="HERRAMIENTAS ALGORITMOS ÉTICOS" width={300} height={5} />
        
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
                </CardTitle>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Cada pregunta incluye un ícono de ayuda con información adicional
                    </p>
                  </div>
                </div>
              </div>
                <CardDescription>Responda las siguientes preguntas</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  {questions
                    .filter(q => q.dimension === currentDimension)
                    .filter(q => shouldShowQuestion(q, answers)) 
                    .map((question, qIndex) => (
                    <div key={question.id} className="mb-6">
                      <div className="flex items-start mb-2">
                        <Label className="text-sm mr-2 flex-grow font-normal" htmlFor={question.id}>
                          {`${dimensions.indexOf(currentDimension) + 1}.${qIndex + 1}. ${question.text}`}
                        </Label>
                        {/* Sistema de información emergente con estado controlado */}
                        {question.info?.trim() && <div className="relative">
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full cursor-help touch-manipulation"
                            type="button"
                            aria-label="Mostrar información adicional"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenTooltipId((prev) => (prev === question.id ? null : question.id));
                              
                            }}
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                          
                          {/* Contenido del tooltip */}
                          {openTooltipId === question.id && (
                            <div 
                              className="absolute right-0 top-8 z-50 w-[90vw] sm:w-80 p-4 rounded-md border border-slate-200 bg-white shadow-md max-h-[50vh] overflow-y-auto"
                              style={{ minWidth: '250px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-sm whitespace-normal">
                                {question.info?.split('\n').map((paragraph, i) => {
                                  const parts = paragraph.split(/(\*\*[^*]+\*\*)/)
                                  return (
                                    <p key={i} className="mb-2 text-justify">
                                      {parts.map((part, j) =>
                                        part.startsWith('**') && part.endsWith('**')
                                          ? <strong key={j}>{part.slice(2, -2)}</strong>
                                          : part
                                      )}
                                    </p>
                                  )
                                })}
                              </div>
                              <div className="absolute right-2 top-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 rounded-full"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenTooltipId(null);
                                  }}
                                >
                                  <span className="sr-only">Cerrar</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>}
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
                  <Button 
                    onClick={() => setShowResults(true)} 
                    variant={isLastDimension ? "default" : "outline"}
                    className={isLastDimension ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                  >
                    Ver Resultados
                  </Button>
                  <Button 
                    onClick={handleNextDimension} 
                    disabled={isLastDimension}
                  >
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
            <CardTitle className="flex justify-between items-center">
              <span>Resultados de la Evaluación de Impacto Algorítmico</span>
              <Button onClick={exportToPDF} className="bg-green-500 hover:bg-green-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar a PDF
              </Button>
              
            </CardTitle>
            
            
            <h3 className="text-sm font-normal text-gray-500">En este documento se presentan los resultados 
              de tu evaluación de impacto algorítmica. Las recomendaciones incluidas han sido elaboradas con 
              base en tus respuestas a cada pregunta de la evaluación. En muchas de ellas, encontrarás recursos
              adicionales que te permitirán profundizar en cómo aplicar las sugerencias proporcionadas. Para 
              facilitar su uso, las recomendaciones están organizadas según la etapa del proyecto en la que se deben 
              implementar. Esperamos que este material te ayude a planificar, organizar y considerar todos los aspectos 
              éticos relevantes al diseñar, desarrollar e implementar tu proyecto de ciencia de datos e IA.
            </h3>
            
            <strong className="text-sm">Bajo impacto (0% - 18.32%)</strong>
            <h3 className="text-sm font-normal text-gray-500">
              El proyecto presenta un bajo impacto en términos éticos y sociales. Esto sugiere que la mayoría de los factores 
              críticos han sido considerados de manera adecuada. Continúa monitoreando el proyecto para asegurar que las condiciones 
              actuales se mantengan a lo largo de su ciclo de vida.
            </h3>
            <strong className="text-sm">Impacto moderado (18.33% - 45.54%)</strong>
            <h3 className="text-sm font-normal text-gray-500">
              El proyecto presenta un impacto moderado. Aunque se han considerado varios aspectos, aún existen áreas que podrían 
              fortalecerse. Evalúa las recomendaciones sugeridas y realiza ajustes puntuales para reducir los posibles riesgos identificados
            </h3>
            <strong className="text-sm">Alto impacto (45.55% - 72.77%)</strong>
            <h3 className="text-sm font-normal text-gray-500">
              El proyecto presenta un alto impacto. Esto no significa que el proyecto sea inviable, sino que existen varios aspectos críticos 
              que necesitan ser considerados. Revisar las recomendaciones en detalle te permitirá abordar estos puntos y construir un proyecto más sólido y responsable.
            </h3>
            <strong className="text-sm">Impacto muy alto (72.78% - 100%)</strong>
            <h3 className="text-sm font-normal text-gray-500">
              El proyecto presenta un impacto muy alto. Esto indica que muchos factores críticos no están siendo abordados aún. Este resultado es una oportunidad para 
              fortalecer tu proyecto desde la base, identificando los riesgos clave y tomando acciones correctivas que garanticen su éxito y minimicen efectos negativos.
            </h3>

          </CardHeader>

          <CardContent>
          <div ref={tableRef}>
            
            <Card className="mb-6"> 
              {/* Información General */}
              <div className="flex-grow">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        {getGeneralInfo().map((info, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{info.question}</TableCell>
                            <TableCell>{info.answer}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>              
            </Card>

            <Card className="mb-6 p-4"> 
              <CardHeader className=" mb-2">
                <CardTitle>Descripciones para cada nivel de impacto</CardTitle>
              </CardHeader>
              <div className="flex items-center gap-4"> {/* Contenedor Flexbox */}

              

                {/* Columna 1: Termómetro */}
                <div className="flex flex-col items-center">
                  <Thermometer
                    score={totalScore}
                    minScore={18.32}
                    maxScore={100}
                    dimensions={scoreByDimension}
                  />
                  <CardDescription className="text-center text-sm mt-2">
                    Puntuación total: <strong>{totalScore.toFixed(2)} %</strong>
                  </CardDescription>
                </div>

                {/* Columna 2: Descripción de impacto */}
                <div className="flex-grow">
                  

                  <CardContent>
                    {/* Nivel de Impacto */}
                    <CardDescription className="text-center text-lg font-semibold mb-4 text-gray-700">
                      {getImpactLevel(totalScore)}
                    </CardDescription>

                    {/* Descripción principal */}
                    <CardDescription className="text-sm leading-relaxed text-gray-600">
                      Un nivel de impacto alto o muy alto <strong>NO</strong> implica que el proyecto deba descartarse, sino que es importante analizar con mayor <strong>profundidad</strong> las áreas identificadas. La evaluación señala aspectos que aún no están suficientemente considerados, lo que representa oportunidades para <strong>fortalecer tu proyecto</strong> y minimizar posibles riesgos.
                    </CardDescription>

                    {/* Mensaje específico del nivel de impacto */}
                    <CardDescription className="text-center text-xs mt-4 text-gray-600">
                      <strong>
                        {(() => {
                          switch (getImpactLevel(totalScore)) {
                            case "Bajo impacto":
                              return "El proyecto presenta un bajo impacto en términos éticos y sociales. Continúa monitoreando para asegurar que se mantenga.";
                            case "Impacto moderado":
                              return "El proyecto presenta un impacto moderado. Aún existen áreas que podrían fortalecerse. Revisa las recomendaciones.";
                            case "Alto impacto":
                              return "El proyecto presenta un alto impacto. Hay varios aspectos críticos por considerar. Revisa las recomendaciones detalladamente.";
                            case "Impacto muy alto":
                              return "El proyecto presenta un impacto muy alto. Es importante abordar los factores críticos identificados para fortalecer tu proyecto.";
                            default:
                              return "";
                          }
                        })()}
                      </strong>
                    </CardDescription>
                  </CardContent>
                </div>
              </div>    
            </Card>



            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center align-middle py-3">¿Revisada?</TableHead>                  
                  <TableHead className="text-center align-middle py-3">Preguntas Relacionadas</TableHead>
                  <TableHead className="text-center align-middle py-3">Recomendación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["Conceptualización y diseño", "Recolección y procesamiento de datos", "Uso y monitoreo"].map((stage) =>
                  getGroupedRecommendations()[stage]?.length ? (
                    <React.Fragment key={stage}>
                      <TableRow className="page-break">
                        <TableCell colSpan={3} className="bg-muted font-semibold text-center align-middle py-3">
                          {stage}
                        </TableCell>
                      </TableRow>
                      {getGroupedRecommendations()[stage].map((item, index) => (
                        <TableRow key={`${stage}-${index}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecommendations[`${stage}-${index}`] || false}
                              onCheckedChange={() => handleCheckboxChange(`${stage}-${index}`)}
                              aria-label={`Seleccionar recomendación ${index + 1} de ${stage}`}
                            />
                          </TableCell>
                          <TableCell>
                            <ul className="list-disc pl-5">
                              {item.questions.map((q, qIndex) => (
                                <li key={qIndex} className="mb-2">
                                  <p><strong>Pregunta {q.number}:</strong> {q.text}</p>
                                  <p><strong>Respuesta:</strong> {q.answer}</p>
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <p className='text-justify'>{item.text}</p>
                            {item.resource && (
                              <p className="mt-1 text-sm">
                                <a href={item.resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                  {item.resource.text}
                                  <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ) : null
                )}
              </TableBody>
            </Table>
            <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm text-justify">
              <h3 className="font-semibold text-center">Exención de responsabilidad</h3>
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
              

            </div>
            <br />
            <footer className="p-4 rounded-lg backdrop-blur-sm">
              <p className="break-words overflow-wrap text-center text-sm">
                Herramienta del GobLab UAI versión V.{VERSION} - Licencia MPL-2.0.
              </p>
              <p className="break-words overflow-wrap text-center text-sm">
                Genera tu evaluación en: https://algoritmospublicos.cl/herramientas
              </p>
              <p className="break-words overflow-wrap text-center text-sm">
                © {new Date().getFullYear()} Evaluación de impacto algorítmico elaborada en {new Date().toLocaleDateString()}.
              </p>

            </footer>

            </div>
            <Button onClick={() => setShowResults(false)} className="mt-4">Volver a la Evaluación</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}