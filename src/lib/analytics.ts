declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const TOOL_NAME = "evaluacion de impacto";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackToolStart() {
  gtag("event", "tool_start", {
    tool_name: TOOL_NAME,
  });
}

export function trackSectionComplete(sectionName: string, sectionIndex: number, totalSections: number) {
  gtag("event", "section_complete", {
    tool_name: TOOL_NAME,
    section_name: sectionName,
    section_index: sectionIndex,
    progress_pct: Math.round(((sectionIndex + 1) / totalSections) * 100),
  });
}

export function trackToolComplete() {
  gtag("event", "tool_complete", {
    tool_name: TOOL_NAME,
  });
}

/**
 * Señal de claridad por pregunta hacia GA4. El voto 👍/👎 además se persiste
 * en Supabase (tool_question_vote) vía sendVote(), para poder ver los conteos
 * por herramienta/sección/pregunta en el panel sin depender de GA4.
 */
export function trackQuestionFeedback(questionId: string, helpful: boolean) {
  gtag("event", "question_feedback", {
    tool_name: TOOL_NAME,
    question_id: questionId,
    helpful,
  });
}

export function trackFeedbackSubmit(category: string, screen: string) {
  gtag("event", "feedback_submit", {
    tool_name: TOOL_NAME,
    feedback_category: category,
    screen,
  });
}

export function trackToolExport(format: string = "pdf") {
  gtag("event", "tool_export", {
    tool_name: TOOL_NAME,
    format,
  });
}
