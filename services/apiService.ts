import {
  Vacancy,
  PromptSettings,
  CandidateResult,
  InterviewQuestion,
  JobDetails,
  BehavioralQuestion
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
   PROMPTS (sem alteração)
========================= */

const defaultPrompts: PromptSettings = { /* (todo o bloco exatamente como você enviou) */ };

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
      if (parsed.vacancies?.length) {
        return {
          ...parsed,
          prompts: { ...defaultPrompts, ...parsed.prompts }
        };
      }
    }
  } catch {}
  const initial = {
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

  async savePersonalQuestions(
    vacancyId: string,
    candidateId: string,
    questions: BehavioralQuestion[]
  ) {
    await simulateLatency();
    const data = loadData();

    const vacancies = data.vacancies.map(v => {
      if (v.id !== vacancyId) return v;
      return {
        ...v,
        candidates: v.candidates.map(c =>
          c.id === candidateId ? { ...c, personalQuestions: questions } : c
        )
      };
    });

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
      updatedVacancy: vacancies.find(v => v.id === vacancyId) || null,
      updatedCandidate
    };
  },

  /* ---------- PROMPTS ---------- */
  async savePrompts(prompts: PromptSettings) {
    await simulateLatency();
    const data = loadData();
    saveData({ ...data, prompts });
    return prompts;
  },

  async updateEvaluation(vacancyId: string, candidateId: string, newEvaluation: any) {
    await simulateLatency();
    const data = loadData();
    let updatedCandidate: CandidateResult | null = null;

    const vacancies = data.vacancies.map(v => {
      if (v.id !== vacancyId) return v;
      return {
        ...v,
        candidates: v.candidates.map(c => {
          if (c.id === candidateId) {
            updatedCandidate = { ...c, evaluation: newEvaluation };
            return updatedCandidate;
          }
          return c;
        })
      };
    });

    saveData({ ...data, vacancies });
    return { updatedVacancies: vacancies, updatedCandidate };
  },

  /* ======================================================
     🆕 NOVO — ENVIO DE ÁUDIO DA ENTREVISTA
  ====================================================== */
  async sendInterviewAudio(audio: Blob): Promise<{ transcript: string }> {
    const formData = new FormData();
    formData.append('audio', audio);

    const res = await fetch('/api/interview-session', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Erro ao enviar áudio da entrevista');
    }

    return res.json();
  }
};
