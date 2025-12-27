import {
  Vacancy,
  PromptSettings,
  CandidateResult,
  InterviewQuestion,
  JobDetails,
  BehavioralQuestion,
  EvaluationResult
} from '../types';

const API_LATENCY = 300;
const simulateLatency = () => new Promise(resolve => setTimeout(resolve, API_LATENCY));

const CURRENT_DATA_VERSION = 1;
const DATA_KEY = 'galileo-data';

import { getInitialVacancies } from '../initialData';

/* =========================
   PROMPTS DEFAULT
========================= */

const defaultPrompts: PromptSettings = {
  /* EXATAMENTE como está no seu arquivo atual */
};

/* =========================
   STORAGE
========================= */

interface AppData {
  version: number;
  vacancies: Vacancy[];
  prompts: PromptSettings;
}

const loadData = (): AppData => {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const parsed: AppData = JSON.parse(saved);
      return {
        ...parsed,
        prompts: { ...defaultPrompts, ...parsed.prompts }
      };
    }
  } catch {}

  const initial: AppData = {
    version: CURRENT_DATA_VERSION,
    vacancies: getInitialVacancies(),
    prompts: defaultPrompts
  };

  localStorage.setItem(DATA_KEY, JSON.stringify(initial));
  return initial;
};

const saveData = (data: AppData) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

/* =========================
   API
========================= */

export const api = {
  /* ---------- AUTH ---------- */
  async login(method: 'google' | 'credentials') {
    await simulateLatency();
    return method === 'google'
      ? { success: true }
      : { success: false, error: 'Email ou senha inválidos.' };
  },

  /* ---------- INIT ---------- */
  async getInitialData() {
    await simulateLatency();
    const data = loadData();
    return { vacancies: data.vacancies, prompts: data.prompts };
  },

  /* ======================================================
     🧠 IA — GERAR PERGUNTAS
  ====================================================== */
  async generateQuestions(details: JobDetails): Promise<InterviewQuestion[]> {
    await simulateLatency();

    const { prompts } = loadData();

    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: details,
        questionPromptTemplate: prompts.questionGeneration.template,
        baselineAnswerPromptTemplate: prompts.baselineAnswerGeneration.template
      })
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Erro ao gerar perguntas');

    if (!Array.isArray(json.questions)) {
      throw new Error('Resposta inválida do backend (questions)');
    }

    return json.questions;
  },

  /* ======================================================
     🧠 IA — AVALIAR ENTREVISTA
  ====================================================== */
  async evaluateInterview(payload: {
    jobDetails: JobDetails;
    interviewScript: InterviewQuestion[];
    answers: any[];
  }): Promise<EvaluationResult> {
    await simulateLatency();

    const { prompts } = loadData();

    const res = await fetch('/api/evaluate-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: payload.jobDetails,
        interviewScript: payload.interviewScript,
        answers: payload.answers,
        evaluationPromptTemplate: prompts.answerEvaluation.template,
        originalityPromptTemplate: prompts.originalityEvaluation.template,
        feedbackPromptTemplate: prompts.candidateFeedbackGeneration.template,
      })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao avaliar entrevista');
    }

    if (!json.evaluation) {
      throw new Error('Resposta inválida do backend (evaluation)');
    }

    return json.evaluation;
  },

  /* ======================================================
     🧠 IA — ANALISAR CV (MANTIDA QUALIDADE)
  ====================================================== */
  async analyzeCv(details: JobDetails, cvText: string) {
    await simulateLatency();

    const { prompts } = loadData();

    if (!prompts?.cvAnalysis?.template?.trim()) {
      throw new Error('Prompt "Análise de CV" está vazio.');
    }

    const res = await fetch('/api/analyze-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: details,
        cvText,
        cvPromptTemplate: prompts.cvAnalysis.template,
        currentDate: new Date().toISOString().slice(0, 10),
      })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao analisar CV');
    }

    return json.result;
  },

  /* ---- resto do arquivo segue IGUAL ao seu atual ---- */
};
