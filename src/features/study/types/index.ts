// Study Source Types
export interface StudySource {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  deadline_date: string | null;
  created_at: string;
  updated_at: string;
}

// Diagnostic Question Types
export interface DiagnosticQuestion {
  id: string;
  study_source_id: string;
  question: string;
  order_index: number;
  created_at: string;
}

// Diagnostic Answer Types
export interface DiagnosticAnswer {
  id: string;
  question_id: string;
  user_answer: string;
  ai_feedback: string;
  created_at: string;
}

// Study Plan Types
export interface StudyPlan {
  id: string;
  study_source_id: string;
  plan_json: {
    macro: MacroStep[];
    meso: MesoStep[];
    micro: MicroStep[];
  };
  created_at: string;
}

export interface MacroStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface MesoStep {
  id: string;
  macroId: string;
  title: string;
  description: string;
  order: number;
}

export interface MicroStep {
  id: string;
  mesoId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  order: number;
}

// Review Types
export interface Review {
  id: string;
  study_source_id: string;
  scheduled_at: string;
  completed: boolean;
  completed_at: string | null;
}
