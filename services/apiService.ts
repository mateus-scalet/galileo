import {
  Vacancy,
  PromptSettings,
  CandidateResult,
  InterviewQuestion,
  JobDetails,
  BehavioralQuestion,
  UserAnswer,
  EvaluationResult
} from '../types';

// --- SIMULAÇÃO DE LATÊNCIA ---
const API_LATENCY = 300;
const simulateLatency = () => new Promise(resolve => setTimeout(resolve, API_LATENCY));

// --- LOCALSTORAGE ---
const CURRENT_DATA_VERSION = 1;
const DATA_KEY = 'galileo-data';

// --- DADOS INICIAIS ---
import { getInitialVacancies } from '../initialData';

/* =========================
   PROMPTS DEFAULT
========================= */

const defaultPrompts: PromptSettings = {
  questionGeneration: {
    id: 'questionGeneration',
    name: 'Geração de Perguntas',
    description: 'Gera perguntas e critérios (soma 10 pontos).',
    template: `Você é um especialista em entrevistas...`
  },
  answerEvaluation: {
    id: 'answerEvaluation',
    name: 'Avaliação de Respostas',
    description: 'Avalia a entrevista com base em critérios.',
    template: `Você é um avaliador de entrevistas...`
  },
  keywordExtraction: {
    id: 'keywordExtraction',
    name: 'Extração de Keywords',
    description: '',
    template: ``
  },
  baselineAnswerGeneration: {
    id: 'baselineAnswerGeneration',
    name: 'Resposta Base',
    description: '',
    template: ``
  },
  originalityEvaluation: {
    id: 'originalityEvaluation',
    name: 'Originalidade',
    description: '',
    template: ``
  },
  candidateFeedbackGeneration: {
    id: 'candidateFeedbackGeneration',
    name: 'Feedback',
    description: '',
    template: ``
  },
  cvAnalysis: {
    id: 'cvAnalysis',
    name: 'Análise de CV',
    description: '',
    template: ``
  }
};

/* =========================
   STORAGE HELPERS
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

    const data = loadData();
    const prompts = data.prompts;

    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: details,
        questionPromptTemplate: prompts.questionGeneration.template,
        baselineAnswerPromptTemplate: prompts.baselineAnswerGeneration.template
      })
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao gerar perguntas');
    }

    return json.questions;
  },

  /* ======================================================
     🧠 IA — AVALIAR ENTREVISTA (NOVO)
  ====================================================== */
  async evaluateInterview(params: {
    jobDetails: JobDetails;
    interviewScript: InterviewQuestion[];
    answers: UserAnswer[];
  }): Promise<EvaluationResult> {
    await simulateLatency();

    const data = loadData();
    const prompts = data.prompts;

    const res = await fetch('/api/evaluate-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: params.jobDetails,
        interviewScript: params.interviewScript,
        answers: params.answers,
        evaluationPromptTemplate: prompts.answerEvaluation.template,
        originalityPromptTemplate: prompts.originalityEvaluation.template,
        feedbackPromptTemplate: prompts.candidateFeedbackGeneration.template
      })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao avaliar entrevista');
    }

    if (!json?.evaluation) {
      throw new Error('Resposta inválida do backend: evaluation ausente.');
    }

    return json.evaluation;
  },

  /* ---------- VAGAS ---------- */
  async saveVacancy(
    jobDetails: JobDetails,
    questions: InterviewQuestion[],
    editingVacancy: Vacancy | null
  ) {
    await simulateLatency();
    const data = loadData();

    const vacancies = editingVacancy
      ? data.vacancies.map(v =>
          v.id === editingVacancy.id ? { ...v, jobDetails, questions } : v
        )
      : [
          ...data.vacancies,
          {
            id: `vac_${Date.now()}`,
            jobDetails,
            questions,
            candidates: [],
            status: 'Entrevistando',
            createdAt: new Date().toISOString()
          }
        ];

    saveData({ ...data, vacancies });
    return vacancies;
  },

  /* ---------- CANDIDATOS ---------- */
  async addCandidatesToVacancy(vacancyId: string, candidates: { name: string }[]) {
    await simulateLatency();
    const data = loadData();

    const newCandidates: CandidateResult[] = candidates.map(c => ({
      id: `cand_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      candidateName: c.name,
      interviewDate: new Date().toISOString(),
      answers: [],
      checkAnswers: []
    }));

    const vacancies = data.vacancies.map(v =>
      v.id === vacancyId
        ? { ...v, candidates: [...v.candidates, ...newCandidates] }
        : v
    );

    saveData({ ...data, vacancies });
    return vacancies;
  },

  /* ---------- RESULTADOS ---------- */
  async saveCandidateResult(
    vacancyId: string,
    candidateResult: CandidateResult,
    interviewScript: InterviewQuestion[]
  ) {
    await simulateLatency();
    const data = loadData();
    let updatedCandidate: CandidateResult | null = null;

    const vacancies = data.vacancies.map(v => {
      if (v.id !== vacancyId) return v;

      const candidates = v.candidates.map(c => {
        if (c.id === candidateResult.id) {
          updatedCandidate = { ...c, ...candidateResult, interviewScript };
          return updatedCandidate;
        }
        return c;
      });

      return { ...v, candidates };
    });

    saveData({ ...data, vacancies });

    return {
      updatedVacancies: vacancies,
      updatedCandidate
    };
  },

  /* ======================================================
     🎧 ÁUDIO
  ====================================================== */
  async sendInterviewAudio(audio: Blob) {
    const formData = new FormData();
    formData.append('audio', audio);

    const res = await fetch('/api/interview-session', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Erro ao enviar áudio');
    }

    return res.json();
  }
};
