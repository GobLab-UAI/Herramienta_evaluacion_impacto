'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { trackSectionComplete, trackToolComplete, trackToolExport } from '@/lib/analytics'
import { Checkbox } from "@/components/ui/checkbox"
// Card/Table sólo se usan en el marcado oculto que alimenta el PDF.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Thermometer } from '@/components/Thermometer'
import { ExternalLink } from 'lucide-react'
import { T, SERIF, MONO, inputBase } from '@/lib/civic'
import { I, LogoUAIGobLab } from '@/components/civic-icons'
import { toast } from '@/hooks/use-toast'
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

/**
 * Puntaje máximo alcanzable por dimensión. Se obtiene evaluando la función
 * `score` de cada pregunta sobre todas sus respuestas posibles y quedándose
 * con la mayor. Sirve de denominador para normalizar a 0–100 en el radar y
 * en la tabla de resultados.
 */
const maxScoreByDimension: Record<string, number> = (() => {
  const acc: Record<string, number> = {}
  for (const dim of dimensions) {
    acc[dim] = questions
      .filter(q => q.dimension === dim && q.scoreContribution && q.score)
      .reduce((total, q) => {
        const candidates: Answer[] = [true, false, null]
        if (q.options) {
          for (const o of q.options) candidates.push(o.value)
          candidates.push(q.options.map(o => o.value))
        }
        let best = 0
        for (const c of candidates) {
          try {
            const v = q.score!(c)
            if (Number.isFinite(v) && v > best) best = v
          } catch {
            // Una combinación no soportada por esta pregunta: se ignora.
          }
        }
        return total + best
      }, 0)
  }
  return acc
})()

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
  const [activeTab, setActiveTab] = useState<'resumen' | 'recomendaciones' | 'feedback'>('resumen')
  const [fbRating, setFbRating] = useState(0)
  const [fbCategory, setFbCategory] = useState('')
  const [fbNote, setFbNote] = useState('')
  const [fbSending, setFbSending] = useState(false)
  const [fbSent, setFbSent] = useState(false)
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
      setTotalScore(calculateTotalScore(newAnswers));
      // También por dimensión: alimenta el termómetro, el radar y la tabla
      // de resultados, que antes quedaban vacíos en una sesión nueva.
      setScoreByDimension(getScoreByDimension(newAnswers));
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

  

  // Solo cuentan las preguntas visibles: una condicional oculta nunca se
  // responde y dejaría la dimensión marcada como incompleta para siempre.
  const isDimensionComplete = (dim: string) => {
    const visible = questions.filter(q => q.dimension === dim && shouldShowQuestion(q, answers))
    return visible.length > 0 && visible.every(q => answers[q.id] !== undefined)
  }

  const dimensionProgress = (dim: string) => {
    const visible = questions.filter(q => q.dimension === dim && shouldShowQuestion(q, answers))
    if (!visible.length) return 0
    const done = visible.filter(q => {
      const a = answers[q.id]
      return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0)
    }).length
    return Math.round((done / visible.length) * 100)
  }

  const saveEvaluation = () => {
    if (userEmail) {
      const dataToSave = {
        answers,
        timestamp: new Date().getTime()
      }
      localStorage.setItem(`evaluationData_${userEmail}`, JSON.stringify(dataToSave))
      toast({ title: 'Evaluación guardada', description: 'Tu progreso quedó guardado en este navegador.' })
    }
  }

  const sendToolFeedback = async () => {
    if (!fbNote.trim()) return
    setFbSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: fbCategory || 'Comentario general',
          description: fbRating ? `[${fbRating}/5] ${fbNote}` : fbNote,
          email: userEmail || 'anonimo@goblab.cl',
          organization: '',
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setFbSent(true)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'No se pudo enviar',
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setFbSending(false)
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
        toast({ title: 'Evaluación cargada', description: 'Recuperamos tus respuestas guardadas.' })
      } else {
        toast({ variant: 'destructive', title: 'Sin datos', description: 'No se encontró ninguna evaluación guardada.' })
      }
    }
  }

  const isLastDimension = currentDimension === dimensions[dimensions.length - 1]
  
  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = T.burgundy
    e.target.style.boxShadow = '0 0 0 3px rgba(122,59,72,.1)'
  }
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = T.roseLight
    e.target.style.boxShadow = 'none'
  }

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            id={question.id}
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Ingrese su respuesta aquí…"
            style={inputBase}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        )
      case 'textArea':
        return (
          <textarea
            id={question.id}
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            rows={4}
            placeholder="Ingrese su respuesta aquí…"
            style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6, minHeight: 100 }}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        )
      case 'select': {
        const val = (answers[question.id] as string) ?? ''
        return (
          <div style={{ position: 'relative' }}>
            <select
              id={question.id}
              value={val}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              style={{
                ...inputBase,
                appearance: 'none', WebkitAppearance: 'none', paddingRight: 38, cursor: 'pointer',
                color: val ? T.ink : T.ink60,
                borderColor: val ? T.burgundy : T.roseLight,
                background: val ? T.rosePaper : '#fff',
              }}
            >
              <option value="" disabled>Seleccione una opción</option>
              {question.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.burgundy }}>
              <I.chevron />
            </div>
          </div>
        )
      }
      case 'multiselect': {
        const current = (answers[question.id] as string[]) || []
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.options?.map((option) => {
              const checked = current.includes(option.value)
              return (
                <label
                  key={option.value}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                    padding: '9px 12px', borderRadius: 9,
                    border: `1.5px solid ${checked ? T.burgundy : T.roseLight}`,
                    background: checked ? T.rosePaper : '#fff', transition: 'all .15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleAnswer(
                      question.id,
                      e.target.checked ? [...current, option.value] : current.filter(v => v !== option.value)
                    )}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span aria-hidden style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1, color: '#fff',
                    border: `1.5px solid ${checked ? T.burgundy : T.ink40}`,
                    background: checked ? T.burgundy : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                  }}>
                    {checked && <I.check width={10} height={10} />}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: checked ? T.ink : T.ink80 }}>{option.label}</span>
                </label>
              )
            })}
          </div>
        )
      }
      case 'yesno':
      case 'yesnoNA': {
        const answerValue = answers[question.id]
        const opts: Array<{ key: string; label: string; value: boolean | null }> = [
          { key: 'yes', label: 'Sí', value: true },
          { key: 'no', label: 'No', value: false },
        ]
        if (question.type === 'yesnoNA') opts.push({ key: 'na', label: 'No aplica', value: null })

        return (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {opts.map(opt => {
              // `null` es una respuesta válida en yesnoNA, así que distinguimos
              // "sin responder" (undefined) de "No aplica" (null).
              const selected = question.id in answers && answerValue === opt.value
              return (
                <label key={opt.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: T.ink }}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => handleAnswer(question.id, opt.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span aria-hidden style={{
                    width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                    border: `1.5px solid ${selected ? T.burgundy : T.ink40}`,
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {selected && <span style={{ width: 8, height: 8, borderRadius: 99, background: T.burgundy }} />}
                  </span>
                  {opt.label}
                </label>
              )
            })}
          </div>
        )
      }
      default:
        return null
    }
  }

  const handleNextDimension = () => {
    const currentIndex = dimensions.indexOf(currentDimension)
    if (currentIndex < dimensions.length - 1) {
      trackSectionComplete(currentDimension, currentIndex, dimensions.length)
      setCurrentDimension(dimensions[currentIndex + 1])
    } else {
      trackToolComplete()
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
    trackToolExport('pdf')
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

  const dimIndex = dimensions.indexOf(currentDimension)
  const visibleInDim = questions
    .filter(q => q.dimension === currentDimension)
    .filter(q => shouldShowQuestion(q, answers))

  const projectName = (answers['q1'] as string) || 'Sistema sin nombre'
  const answeredCount = questions
    .filter(q => shouldShowQuestion(q, answers))
    .filter(q => {
      const a = answers[q.id]
      return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0)
    }).length

  const impactLevel = getImpactLevel(totalScore)
  const impactColor =
    impactLevel === 'Bajo impacto' ? T.success
      : impactLevel === 'Impacto moderado' ? T.warn
        : impactLevel === 'Alto impacto' ? T.rose
          : T.burgundy

  // Puntaje normalizado 0–100 por dimensión, para el radar y la tabla.
  const normalized = dimensions.map(dim => {
    const max = maxScoreByDimension[dim] || 0
    const raw = scoreByDimension[dim] || 0
    return { dim, pct: max > 0 ? Math.min(100, Math.round((raw / max) * 100)) : 0 }
  })

  const ghostBtn: React.CSSProperties = {
    padding: '8px 14px', border: `1px solid ${T.roseLight}`, borderRadius: 9,
    fontSize: 13, color: T.ink80, background: '#fff', cursor: 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
  }
  const solidBtn: React.CSSProperties = {
    padding: '10px 20px', background: T.burgundy, color: '#fff', border: 'none',
    borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
  }

  const Tab = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '11px 20px', border: 'none', background: 'transparent', fontFamily: 'inherit',
        fontSize: 13, fontWeight: activeTab === id ? 600 : 400, cursor: 'pointer',
        color: activeTab === id ? T.burgundy : T.ink60,
        borderBottom: `2px solid ${activeTab === id ? T.burgundy : 'transparent'}`,
        transition: 'all .15s',
      }}
    >{label}</button>
  )

  return (
    <div style={{ background: T.paper, minHeight: '100vh', color: T.ink, display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ background: '#fff', borderBottom: `1px solid ${T.roseLight}`, padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
          <LogoUAIGobLab height={34} rose={T.rose} ink={T.ink} mono={MONO} />
          <div className="eia-logo-sep" style={{ width: 1, height: 22, background: T.roseLight }} />
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: T.ink60 }}>HERRAMIENTA</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 1 }}>Evaluación de Impacto Algorítmico</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: T.ink60 }}>{Math.round(progress)}% completo</div>
          <div style={{ width: 110, height: 5, background: T.paperDeep, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${T.rose},${T.burgundy})`, transition: 'width .4s cubic-bezier(.16,1,.3,1)' }} />
          </div>
          <button onClick={saveEvaluation} style={ghostBtn}>Guardar</button>
          <button onClick={loadEvaluation} style={ghostBtn}>Cargar</button>
        </div>
      </header>

      {!showResults ? (
        /* ══════════════ CUESTIONARIO ══════════════ */
        <div className="eia-shell" style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', alignItems: 'start' }}>

          {/* Sidebar de dimensiones */}
          <aside className="eia-aside" style={{ background: '#fff', borderRight: `1px solid ${T.roseLight}`, position: 'sticky', top: 0, alignSelf: 'start', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${T.roseLight}` }}>
              <div style={{ fontSize: 10, fontFamily: MONO, letterSpacing: 1, color: T.ink60, marginBottom: 4 }}>SISTEMA EN EVALUACIÓN</div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{projectName}</div>
            </div>
            <nav style={{ flex: 1, overflow: 'auto', padding: 8 }}>
              {dimensions.map((dim, i) => {
                const active = currentDimension === dim
                const done = isDimensionComplete(dim)
                return (
                  <button
                    key={dim}
                    onClick={() => setCurrentDimension(dim)}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                      border: 'none', fontFamily: 'inherit', transition: 'background .15s',
                      background: active ? T.burgundy : 'transparent',
                      color: active ? '#fff' : done ? T.ink80 : T.ink60,
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: 99, flexShrink: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700,
                      fontFamily: MONO, transition: 'all .15s',
                      background: active || done ? T.rose : 'transparent',
                      color: active || done ? '#fff' : T.ink40,
                      border: !active && !done ? `1.5px solid ${T.ink20}` : 'none',
                    }}>{done ? <I.check width={11} height={11} /> : String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: active ? 600 : 400, lineHeight: 1.3 }}>{dim}</span>
                    <span style={{ fontSize: 10, fontFamily: MONO, color: active ? T.roseLight : T.ink40 }}>
                      {dimensionProgress(dim)}%
                    </span>
                  </button>
                )
              })}
            </nav>
            <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.roseLight}`, fontSize: 11, color: T.ink60, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: T.burgundy, display: 'inline-flex' }}><I.lock /></span> Auto-guardado local
            </div>
          </aside>

          {/* Preguntas de la dimensión */}
          <main style={{ padding: '28px 36px 0', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 99, background: T.rose, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {String(dimIndex + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 26, letterSpacing: -0.6, margin: 0, lineHeight: 1.1 }}>{currentDimension}</h2>
                <div style={{ fontSize: 12, color: T.ink60, marginTop: 2 }}>
                  {visibleInDim.length} {visibleInDim.length === 1 ? 'pregunta' : 'preguntas'} · Sección {dimIndex + 1} de {dimensions.length}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: T.ink60, letterSpacing: 1 }}>AVANCE</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, color: T.burgundy, lineHeight: 1 }}>
                  {dimensionProgress(currentDimension)}<span style={{ color: T.ink40, fontSize: 14 }}>%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(192,138,147,.08)', borderLeft: `3px solid ${T.rose}`, borderRadius: '0 8px 8px 0', marginBottom: 22, fontSize: 13, color: T.ink80 }}>
              <span style={{ color: T.rose, display: 'inline-flex', flexShrink: 0 }}><I.help width={14} height={14} /></span>
              Cada pregunta incluye un ícono de ayuda con información adicional.
            </div>

            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {visibleInDim.map((question, qIndex) => (
                <div key={question.id} style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                    <label htmlFor={question.id} style={{ fontSize: 14, fontWeight: 500, color: T.ink, lineHeight: 1.45 }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: T.burgundy, marginRight: 6 }}>
                        {dimIndex + 1}.{qIndex + 1}
                      </span>
                      {question.text}
                    </label>

                    {question.info?.trim() && (
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                          type="button"
                          aria-label="Mostrar información adicional"
                          onClick={() => setOpenTooltipId(prev => prev === question.id ? null : question.id)}
                          style={{ width: 24, height: 24, borderRadius: 99, border: `1.5px solid ${T.roseLight}`, background: openTooltipId === question.id ? T.rosePaper : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: openTooltipId === question.id ? T.burgundy : T.ink60 }}
                        >
                          <I.help />
                        </button>

                        {openTooltipId === question.id && (
                          <div
                            style={{ position: 'absolute', right: 0, top: 30, zIndex: 50, width: 'min(90vw, 340px)', padding: '16px 18px', borderRadius: 12, border: `1px solid ${T.roseLight}`, background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,.14)', maxHeight: '50vh', overflowY: 'auto' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenTooltipId(null)}
                              style={{ position: 'absolute', right: 10, top: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: T.ink60, padding: 2 }}
                            >
                              <span className="sr-only">Cerrar</span>
                              <I.close width={14} height={14} />
                            </button>
                            <div style={{ fontSize: 13, color: T.ink80, lineHeight: 1.6, paddingRight: 14 }}>
                              {question.info?.split('\n').map((paragraph, i) => {
                                const parts = paragraph.split(/(\*\*[^*]+\*\*)/)
                                return (
                                  <p key={i} style={{ margin: '0 0 8px', textAlign: 'justify' }}>
                                    {parts.map((part, j) =>
                                      part.startsWith('**') && part.endsWith('**')
                                        ? <strong key={j} style={{ color: T.burgundy }}>{part.slice(2, -2)}</strong>
                                        : part
                                    )}
                                  </p>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {renderQuestionInput(question)}
                </div>
              ))}
            </form>

            {/* Barra de navegación inferior */}
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: `1px solid ${T.roseLight}`, padding: '14px 0', marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 -4px 20px rgba(0,0,0,.06)' }}>
              <button onClick={handlePreviousDimension} disabled={dimIndex === 0} style={{ ...ghostBtn, opacity: dimIndex === 0 ? 0.4 : 1, cursor: dimIndex === 0 ? 'not-allowed' : 'pointer' }}>
                <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><I.arrow /></span> Anterior
              </button>
              <div style={{ fontSize: 12, color: T.ink60, fontFamily: MONO, letterSpacing: 0.5 }}>
                Sección {dimIndex + 1} de {dimensions.length} · <span style={{ color: T.burgundy, fontWeight: 600 }}>Guardado automáticamente</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { trackToolComplete(); setShowResults(true); }} style={ghostBtn}>Ver resultados</button>
                <button onClick={handleNextDimension} disabled={isLastDimension} style={{ ...solidBtn, opacity: isLastDimension ? 0.4 : 1, cursor: isLastDimension ? 'not-allowed' : 'pointer' }}>
                  Siguiente <I.arrow />
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* ══════════════ RESULTADOS ══════════════ */
        <div style={{ flex: 1 }}>

          {/* Banner de puntaje */}
          <div className="eia-banner" style={{ background: T.burgundy, padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
            <div style={{ color: '#fff', minWidth: 0 }}>
              <div style={{ fontSize: 11, fontFamily: MONO, letterSpacing: 1.5, opacity: .7, marginBottom: 8 }}>
                EVALUACIÓN COMPLETADA · {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 36, letterSpacing: -1, margin: '0 0 6px', lineHeight: 1.1 }}>{projectName}</h1>
              <div style={{ fontSize: 13, opacity: .75 }}>{userEmail}</div>
              <div style={{ display: 'flex', gap: 22, marginTop: 20, flexWrap: 'wrap' }}>
                {([
                  [String(dimensions.length), 'dimensiones evaluadas'],
                  [String(answeredCount), 'preguntas respondidas'],
                  ['PDF', 'listo para descargar'],
                ] as const).map(([k, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: T.rose }}>{k}</span>
                    <span style={{ fontSize: 11, opacity: .7 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', color: '#fff' }}>
              <div style={{ fontSize: 11, fontFamily: MONO, letterSpacing: 1.5, opacity: .6 }}>NIVEL DE IMPACTO</div>
              <div style={{ fontFamily: SERIF, fontSize: 76, fontWeight: 500, lineHeight: 1 }}>{totalScore.toFixed(0)}</div>
              <div style={{ fontSize: 11, opacity: .6, marginBottom: 8 }}>de 100 puntos</div>
              <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 99, background: impactColor, fontSize: 13, fontWeight: 700 }}>{impactLevel}</div>
            </div>
          </div>

          {/* Pestañas */}
          <div style={{ background: '#fff', borderBottom: `1px solid ${T.roseLight}`, padding: '0 40px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Tab id="resumen" label="Resumen" />
            <Tab id="recomendaciones" label="Recomendaciones" />
            <Tab id="feedback" label="Evalúa esta herramienta" />
          </div>

          {/* ── Pestaña: Resumen ── */}
          {activeTab === 'resumen' && (
            <div className="eia-two-col" style={{ padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignContent: 'start' }}>

              <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Perfil por dimensión</div>
                <svg viewBox="0 0 380 340" style={{ width: '100%', height: 260 }}>
                  {(() => {
                    const CX = 190, CY = 165, R = 118, n = dimensions.length
                    const at = (pct: number, i: number) => {
                      const a = (i / n) * Math.PI * 2 - Math.PI / 2
                      const r = (pct / 100) * R
                      return `${(CX + Math.cos(a) * r).toFixed(1)},${(CY + Math.sin(a) * r).toFixed(1)}`
                    }
                    return (
                      <>
                        {[25, 50, 75, 100].map((sc, i) => (
                          <polygon key={i} points={dimensions.map((_, j) => at(sc, j)).join(' ')} fill={i === 3 ? T.rosePaper : 'none'} stroke={T.roseLight} strokeWidth="1" />
                        ))}
                        {dimensions.map((_, i) => {
                          const a = (i / n) * Math.PI * 2 - Math.PI / 2
                          return <line key={i} x1={CX} y1={CY} x2={CX + Math.cos(a) * R} y2={CY + Math.sin(a) * R} stroke={T.roseLight} strokeWidth="1" />
                        })}
                        <polygon points={normalized.map((d, i) => at(d.pct, i)).join(' ')} fill={T.rose} fillOpacity="0.32" stroke={T.burgundy} strokeWidth="2" />
                        {normalized.map((d, i) => {
                          const [x, y] = at(d.pct, i).split(',')
                          return <circle key={i} cx={x} cy={y} r="4" fill={T.burgundy} />
                        })}
                        {dimensions.map((_, i) => {
                          const a = (i / n) * Math.PI * 2 - Math.PI / 2
                          const r = R + 22
                          return (
                            <text key={i} x={CX + Math.cos(a) * r} y={CY + Math.sin(a) * r} textAnchor="middle" dominantBaseline="middle" fill={T.ink60} fontFamily={MONO} fontSize="9" fontWeight="600">
                              {String(i + 1).padStart(2, '0')}
                            </text>
                          )
                        })}
                      </>
                    )
                  })()}
                </svg>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Puntaje por dimensión</div>
                {normalized.map((d, i) => (
                  <div key={d.dim} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < normalized.length - 1 ? `1px dashed ${T.roseLight}` : 'none' }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: T.burgundy, width: 20, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0 }}>{d.dim}</span>
                    <div style={{ width: 70, height: 5, background: T.paperDeep, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${d.pct}%`, height: '100%', background: d.pct > 60 ? T.burgundy : T.rose, transition: 'width .5s' }} />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: d.pct > 60 ? T.burgundy : T.rose, width: 26, textAlign: 'right', flexShrink: 0 }}>{d.pct}</span>
                  </div>
                ))}
              </div>

              {/* Termómetro + interpretación */}
              <div style={{ gridColumn: '1/-1', background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '22px 26px', display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <Thermometer score={totalScore} minScore={18.32} maxScore={100} dimensions={scoreByDimension} />
                  <div style={{ fontSize: 13, marginTop: 8, color: T.ink60 }}>
                    Puntuación total: <strong style={{ color: T.burgundy }}>{totalScore.toFixed(2)}%</strong>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 22, color: impactColor, marginBottom: 10 }}>{impactLevel}</div>
                  <p style={{ fontSize: 13, color: T.ink80, lineHeight: 1.65, margin: '0 0 12px' }}>
                    Un nivel de impacto alto o muy alto <strong>NO</strong> implica que el proyecto deba descartarse, sino que es importante analizar con mayor <strong>profundidad</strong> las áreas identificadas. La evaluación señala aspectos que aún no están suficientemente considerados, lo que representa oportunidades para <strong>fortalecer tu proyecto</strong> y minimizar posibles riesgos.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {([
                      ['Bajo impacto', '0 – 18,32%', T.success],
                      ['Impacto moderado', '18,33 – 45,54%', T.warn],
                      ['Alto impacto', '45,55 – 72,77%', T.rose],
                      ['Impacto muy alto', '72,78 – 100%', T.burgundy],
                    ] as const).map(([label, range, color]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: label === impactLevel ? T.ink : T.ink60, fontWeight: label === impactLevel ? 600 : 400 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 99, background: color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{label}</span>
                        <span style={{ fontFamily: MONO, fontSize: 11 }}>{range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Información general */}
              <div style={{ gridColumn: '1/-1', background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Información general</div>
                {getGeneralInfo().map((info, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: i < 3 ? `1px dashed ${T.roseLight}` : 'none', fontSize: 13 }}>
                    <span style={{ width: '38%', color: T.ink60, flexShrink: 0 }}>{info.question}</span>
                    <span style={{ flex: 1, color: T.ink }}>{info.answer || '—'}</span>
                  </div>
                ))}
              </div>

              {/* CTA descarga */}
              <div style={{ gridColumn: '1/-1', background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Tu informe está listo</div>
                  <div style={{ fontSize: 13, color: T.ink60 }}>PDF con diagnóstico completo, nivel de impacto y recomendaciones por etapa.</div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={exportToPDF} style={{ ...solidBtn, padding: '12px 26px', fontSize: 14 }}>
                    <I.download /> Descargar informe PDF
                  </button>
                  <button onClick={() => setShowResults(false)} style={{ ...ghostBtn, padding: '12px 20px', fontSize: 14 }}>
                    Volver a la evaluación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Pestaña: Recomendaciones ── */}
          {activeTab === 'recomendaciones' && (
            <div style={{ padding: '28px 40px' }}>
              <div style={{ fontSize: 13, color: T.ink60, marginBottom: 18, maxWidth: 780, lineHeight: 1.65 }}>
                Las recomendaciones se elaboran a partir de tus respuestas y están organizadas según la etapa del proyecto en la que conviene implementarlas. Marca cada una a medida que la revises.
              </div>

              {["Conceptualización y diseño", "Recolección y procesamiento de datos", "Uso y monitoreo"].map((stage) => {
                const items = getGroupedRecommendations()[stage]
                if (!items?.length) return null
                return (
                  <section key={stage} style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: '#fff', background: T.burgundy, padding: '4px 12px', borderRadius: 99 }}>ETAPA</span>
                      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, margin: 0 }}>{stage}</h3>
                      <span style={{ fontSize: 12, color: T.ink60 }}>{items.length} {items.length === 1 ? 'recomendación' : 'recomendaciones'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {items.map((item, index) => {
                        const key = `${stage}-${index}`
                        const checked = selectedRecommendations[key] || false
                        return (
                          <div key={key} style={{ background: '#fff', border: `1px solid ${checked ? T.rose : T.roseLight}`, borderRadius: 12, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'start', opacity: checked ? 0.72 : 1, transition: 'all .15s' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingTop: 2 }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleCheckboxChange(key)}
                                aria-label={`Marcar recomendación ${index + 1} de ${stage} como revisada`}
                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                              />
                              <span aria-hidden style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? T.burgundy : T.ink40}`, background: checked ? T.burgundy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                                {checked && <I.check width={11} height={11} />}
                              </span>
                            </label>

                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 14, color: T.ink, lineHeight: 1.65, margin: '0 0 12px', textAlign: 'justify', textDecoration: checked ? 'line-through' : 'none' }}>
                                {item.text}
                              </p>

                              {item.resource && (
                                <a href={item.resource.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: T.burgundy, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', marginBottom: 12 }}>
                                  {item.resource.text} <ExternalLink className="w-3 h-3" />
                                </a>
                              )}

                              <details style={{ marginTop: 4 }}>
                                <summary style={{ fontSize: 12, color: T.ink60, cursor: 'pointer', fontFamily: MONO, letterSpacing: 0.5 }}>
                                  {item.questions.length} {item.questions.length === 1 ? 'PREGUNTA RELACIONADA' : 'PREGUNTAS RELACIONADAS'}
                                </summary>
                                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {item.questions.map((q, qi) => (
                                    <div key={qi} style={{ background: T.rosePaper, borderRadius: 9, padding: '10px 13px', fontSize: 12.5, lineHeight: 1.55 }}>
                                      <div style={{ color: T.ink80 }}>
                                        <span style={{ fontFamily: MONO, color: T.burgundy, marginRight: 6 }}>{q.number}</span>{q.text}
                                      </div>
                                      <div style={{ color: T.ink60, marginTop: 4 }}>Respuesta: <strong style={{ color: T.burgundy }}>{q.answer}</strong></div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4, paddingBottom: 16 }}>
                <button onClick={exportToPDF} style={{ ...solidBtn, padding: '13px 30px', fontSize: 14 }}>
                  <I.download /> Descargar informe PDF completo
                </button>
              </div>
            </div>
          )}

          {/* ── Pestaña: Evalúa esta herramienta ── */}
          {activeTab === 'feedback' && (
            <div className="eia-two-col" style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignContent: 'start' }}>
              {fbSent ? (
                <div style={{ gridColumn: '1/-1', background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 16, padding: '48px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 16 }}>🌸</div>
                  <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, letterSpacing: -0.8, margin: '0 0 12px', color: T.burgundy }}>¡Gracias por tu feedback!</h2>
                  <p style={{ fontSize: 15, color: T.ink60, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                    Tu opinión nos ayuda a mejorar la herramienta para todos los equipos del sector público.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: T.burgundy, marginBottom: 12 }}>PASO 4 DE 4</div>
                    <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 34, letterSpacing: -0.8, margin: '0 0 12px', lineHeight: 1.1 }}>
                      Evalúa esta<br /><em style={{ color: T.burgundy }}>herramienta</em>.
                    </h2>
                    <p style={{ fontSize: 14, color: T.ink60, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 440 }}>
                      Tu opinión es clave para mejorar la EIA. Cuéntanos cómo fue tu experiencia completando la evaluación.
                    </p>

                    <div style={{ marginBottom: 20 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 10 }}>¿Qué tan útil fue la herramienta?</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setFbRating(n)}
                            aria-label={`${n} de 5`}
                            style={{ width: 46, height: 46, borderRadius: 12, border: `1.5px solid ${fbRating >= n ? T.burgundy : T.roseLight}`, background: fbRating >= n ? T.burgundy : '#fff', color: fbRating >= n ? '#fff' : T.ink60, fontSize: 19, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
                          >★</button>
                        ))}
                        {fbRating > 0 && (
                          <span style={{ fontSize: 13, color: T.burgundy, fontWeight: 600, marginLeft: 4 }}>
                            {['', 'Poco útil', 'Algo útil', 'Útil', 'Muy útil', 'Excelente'][fbRating]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label htmlFor="fb-cat" style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 6 }}>Categoría</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="fb-cat"
                          value={fbCategory}
                          onChange={e => setFbCategory(e.target.value)}
                          style={{ ...inputBase, appearance: 'none', WebkitAppearance: 'none', paddingRight: 38, cursor: 'pointer', borderColor: fbCategory ? T.burgundy : T.roseLight, background: fbCategory ? T.rosePaper : '#fff', color: fbCategory ? T.ink : T.ink60 }}
                        >
                          <option value="" disabled>Selecciona una categoría…</option>
                          {['Comentario general', 'Sugerencia de mejora', 'Reporte de error', 'Pregunta', 'Otro'].map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.burgundy }}>
                          <I.chevron />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label htmlFor="fb-note" style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 6 }}>
                        Comentario <span style={{ fontWeight: 400, color: T.ink60 }}>(requerido)</span>
                      </label>
                      <textarea
                        id="fb-note"
                        value={fbNote}
                        onChange={e => setFbNote(e.target.value)}
                        placeholder="Cuéntanos tu experiencia, qué mejorarías o qué encontraste confuso…"
                        style={{ ...inputBase, minHeight: 100, resize: 'vertical', background: T.rosePaper, borderColor: fbNote ? T.burgundy : T.roseLight }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={sendToolFeedback}
                      disabled={!fbNote.trim() || fbSending}
                      style={{ width: '100%', background: fbNote.trim() ? T.burgundy : T.ink20, color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, cursor: fbNote.trim() && !fbSending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', transition: 'background .2s' }}
                    >
                      {fbSending ? 'Enviando…' : <>Enviar feedback <I.arrow /></>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '20px 22px' }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: T.burgundy, marginBottom: 12 }}>POR QUÉ IMPORTA</div>
                      <p style={{ fontSize: 13, color: T.ink80, margin: 0, lineHeight: 1.65 }}>
                        La EIA es una herramienta en constante mejora. Cada comentario se analiza para ajustar preguntas, ejemplos y recomendaciones. Tu experiencia construye una mejor herramienta para todos los equipos del sector público.
                      </p>
                    </div>
                    <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '20px 22px' }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: T.burgundy, marginBottom: 10 }}>¿QUIERES MÁS?</div>
                      <p style={{ fontSize: 13, color: T.ink80, margin: '0 0 12px', lineHeight: 1.6 }}>
                        Si quieres presentar tu caso como <strong>Experiencia Destacada</strong> de uso de IA responsable en el sector público, inscríbete en el piloto.
                      </p>
                      <a href="https://algoritmospublicos.cl/quiero_participar" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.burgundy, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                        algoritmospublicos.cl <I.arrow />
                      </a>
                    </div>
                    <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 22px' }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: T.burgundy, marginBottom: 8 }}>FINANCIAMIENTO</div>
                      <p style={{ fontSize: 12, color: T.ink60, margin: 0, lineHeight: 1.6 }}>
                        Esta investigación es realizada por GobLab UAI con el apoyo de ANID/Subdirección de Investigación Aplicada IT25I0161.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contenido del PDF — oculto en pantalla, se serializa vía innerHTML.
              Se mantiene el marcado original para no alterar el informe generado. */}
          <div ref={tableRef} style={{ display: 'none' }}>
            <Card className="mb-6">
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
              <div className="flex items-center gap-4">
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
                <div className="flex-grow">
                  <CardContent>
                    <CardDescription className="text-center text-lg font-semibold mb-4 text-gray-700">
                      {getImpactLevel(totalScore)}
                    </CardDescription>
                    <CardDescription className="text-sm leading-relaxed text-gray-600">
                      Un nivel de impacto alto o muy alto <strong>NO</strong> implica que el proyecto deba descartarse, sino que es importante analizar con mayor <strong>profundidad</strong> las áreas identificadas. La evaluación señala aspectos que aún no están suficientemente considerados, lo que representa oportunidades para <strong>fortalecer tu proyecto</strong> y minimizar posibles riesgos.
                    </CardDescription>
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
        </div>
      )}

      <style jsx>{`
        @media (max-width: 560px) {
          .eia-logo-sep { display: none; }
        }
        @media (max-width: 900px) {
          .eia-shell { grid-template-columns: 1fr !important; }
          .eia-aside { position: static !important; max-height: none !important; border-right: none !important; border-bottom: 1px solid ${T.roseLight}; }
          .eia-two-col { grid-template-columns: 1fr !important; }
          .eia-banner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
