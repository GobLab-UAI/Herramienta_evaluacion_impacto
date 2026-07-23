/**
 * Encuesta de satisfacción (Hito 1, hoja Encuesta del documento de Isidora).
 * La pregunta 1 del documento se omite: no trae enunciado.
 * Reemplaza la pestaña "Evalúa esta herramienta" de la pantalla de resultados.
 */

export type SurveyKind = 'scale' | 'yesno' | 'yesno_text' | 'text' | 'yesno_contact'

export type SurveyItem = {
  id: string
  kind: SurveyKind
  pregunta: string
  tooltip?: string
  min?: string
  max?: string
  placeholder?: string
}

export const SURVEY: SurveyItem[] = [
  {
    id: "2",
    kind: "scale",
    pregunta: "En general, ¿qué tan fácil le resultó usar esta herramienta de evaluación de impacto algorítmico?",
    tooltip: "Evalúe su experiencia global con la plataforma: qué tan intuitiva fue la navegación, si entendió qué se esperaba en cada paso y si pudo completar la evaluación sin mayor dificultad.",
    min: "Muy difícil de usar",
    max: "Muy fácil de usar",
  },
  {
    id: "3",
    kind: "scale",
    pregunta: "¿En qué medida la herramienta le indicó claramente qué debía hacer en cada etapa de la evaluación?",
    tooltip: "Evalúe si la plataforma le orientó en cada paso: si las instrucciones eran claras, si supo cómo avanzar y qué se esperaba de usted antes de pasar a la siguiente sección.",
    min: "Nunca supe qué se esperaba de mí",
    max: "Siempre tuve claro qué hacer",
  },
  {
    id: "4",
    kind: "scale",
    pregunta: "¿En qué medida la herramienta facilitó la participación de personas con distintos perfiles (técnicos y no técnicos) dentro de su equipo?",
    tooltip: "Considere si la herramienta permitió que tanto perfiles técnicos (analistas, informáticos) como no técnicos (jefes de servicio, profesionales de gestión) pudieran participar activamente en la evaluación del proyecto.",
    min: "No facilitó la participación en absoluto",
    max: "Facílito muy bien la colaboración",
  },
  {
    id: "5",
    kind: "scale",
    pregunta: "¿En qué medida las preguntas de la herramienta son adecuadas para evaluar el impacto algorítmico un proyecto de IA o ciencia de datos en el contexto de su institución?",
    tooltip: "Evalúe si las preguntas abordaron los temas correctos (problema institucional, datos disponibles, ética, etc.) y si le resultaron útiles para pensar en su proyecto específico. ¿Sintió que la herramienta le preguntó lo que realmente importaba?",
    min: "Muy inadecuadas",
    max: "muy adecuadas",
  },
  {
    id: "6",
    kind: "scale",
    pregunta: "¿Qué tan claro y comprensible le resultó el lenguaje utilizado en las preguntas de la herramienta?",
    tooltip: "Evalúe si las preguntas y sus descripciones estaban escritas en un lenguaje accesible para equipos mixtos (técnicos y no técnicos). ¿Necesitó buscar definiciones o pedir ayuda para entender qué se preguntaba?",
    min: "Muy confuso o técnico",
    max: "muy claro y comprensible",
  },
  {
    id: "7",
    kind: "scale",
    pregunta: "¿Qué tan claras y comprensibles le resultaron las recomendaciones entregadas en el documento de la evaluación?",
    tooltip: "Al finalizar la evaluación, la herramienta genera automáticamente un conjunto de recomendaciones basadas en sus respuestas. Evalúe si esas recomendaciones fueron fáciles de entender y si su equipo comprendió qué se le estaba sugiriendo mejorar o profundizar.",
    min: "Muy confusa o difíciles de entender",
    max: "Muy claras y comprensibles",
  },
  {
    id: "8",
    kind: "yesno",
    pregunta: "¿Recomendaría esta herramienta a otros equipos de servicios públicos que estén iniciando proyectos de IA o ciencia de datos?",
    tooltip: "Considere si la herramienta le aportó valor real en el proceso de formulación: ¿estructuró mejor el proyecto?, ¿facilitó el trabajo del equipo?, ¿lo usaría de nuevo?",
  },
  {
    id: "9",
    kind: "yesno_text",
    pregunta: "¿Considera que hay algún tema o pregunta importante que la herramienta no abordó?",
    tooltip: "Piense en los aspectos de su proyecto que no encontraron espacio en ninguna sección de la herramienta. ¿Hubo algo relevante que no pudo documentar?",
    placeholder: "Describa brevemente el tema o pregunta que faltó (ej.: \"No había espacio para describir el presupuesto estimado del proyecto\").",
  },
  {
    id: "10",
    kind: "text",
    pregunta: "Si desea agregar algún comentario, sugerencia o crítica sobre la herramienta, puede hacerlo aquí.",
    placeholder: "Este espacio es libre. Puede comentar sobre aspectos positivos, dificultades que encontró, ideas para mejorar la plataforma, o cualquier otra observación que no haya podido expresar en las preguntas anteriores.",
  },
  {
    id: "11",
    kind: "yesno_contact",
    pregunta: "¿Le interesa recibir información sobre servicios de acompañamiento para la revisión ética y técnica de su proyecto?",
    tooltip: "GobLab UAI ofrece servicios de consultoría para apoyar la mitigación de riesgos éticos en proyectos de IA en el sector público. Si marca \"Sí\", un profesional del equipo se pondrá en contacto con usted.",
  },
]
