import {
  Vacancy,
  PromptSettings,
  CandidateResult,
  InterviewQuestion,
  JobDetails,
  BehavioralQuestion,
  UserAnswer,
  EvaluationResult,
  CvEvaluationResult,
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
   PROMPTS DEFAULT (COM TEMPLATE)
========================= */

const defaultPrompts: PromptSettings = {
  questionGeneration: {
    id: 'questionGeneration',
    name: 'Geração de Perguntas',
    description: 'Gera perguntas e critérios (soma 10 pontos).',
    template: `
Você é um especialista em entrevistas.
Gere {numQuestions} perguntas para uma entrevista do cargo "{jobTitle}" (nível {jobLevel}).
A descrição da vaga é:

{jobDescription}

O foco deve ser: {biasDescription}.

Regras:
- Retorne APENAS JSON válido.
- A chave raiz deve ser "questions".
- Cada item deve ter: "question" (string) e "criteria" (array).
- "criteria" deve ter exatamente 3 itens.
- Cada critério: { "text": string, "points": number }.
- A soma dos points de cada pergunta deve ser exatamente 10.

Exemplo do formato:
{
  "questions": [
    {
      "question": "...",
      "criteria": [
        { "text": "...", "points": 4 },
        { "text": "...", "points": 3 },
        { "text": "...", "points": 3 }
      ]
    }
  ]
}
`.trim()
  },

  answerEvaluation: {
    id: 'answerEvaluation',
    name: 'Avaliação de Respostas',
    description: 'Avalia a entrevista com base em critérios.',
    template: `
Você é um avaliador de entrevistas.
Cargo: {jobTitle} (nível {jobLevel})

Descrição da vaga:
{jobDescription}

Transcrição da entrevista:
{interviewTranscript}

Retorne APENAS JSON válido no formato:
{
  "globalGrade": number (0 a 10, 1 casa decimal),
  "summary": string,
  "strengths": string (bullet points com "- "),
  "areasForImprovement": string (bullet points com "- "),
  "questionGrades": [
    {
      "question": string,
      "grade": number (0 a 10),
      "justification": string,
      "criterionGrades": [
        { "criterion": string, "grade": number (0 a 10), "justification": string }
      ]
    }
  ]
}
`.trim()
  },

  keywordExtraction: {
    id: 'keywordExtraction',
    name: 'Extração de Keywords',
    description: 'Extrai palavras-chave relevantes da vaga.',
    template: `
Extraia as principais palavras-chave (hard e soft skills) para o cargo "{jobTitle}" a partir do texto:
{jobDescription}

Retorne em uma única linha, separando por vírgula.
`.trim()
  },

  baselineAnswerGeneration: {
    id: 'baselineAnswerGeneration',
    name: 'Resposta Base',
    description: 'Gera uma resposta ideal para comparar originalidade.',
    template: `
Crie uma resposta ideal (bem estruturada e objetiva) para a pergunta abaixo,
considerando o cargo "{jobTitle}" e a vaga:

Pergunta: {question}

Descrição:
{jobDescription}

Retorne apenas o texto da resposta.
`.trim()
  },

  originalityEvaluation: {
    id: 'originalityEvaluation',
    name: 'Originalidade',
    description: 'Estima similaridade com resposta base.',
    template: `
Compare a resposta do candidato com a resposta base.
Responda APENAS JSON válido:

{
  "score": number (0 a 100),
  "justification": string
}

Resposta do candidato:
{candidateAnswer}

Resposta base:
{baselineAnswer}

Interpretação do score:
- 0-20: muito original
- 21-60: algum padrão
- 61-100: alta probabilidade de texto "modelado"/IA
`.trim()
  },

  candidateFeedbackGeneration: {
    id: 'candidateFeedbackGeneration',
    name: 'Feedback',
    description: 'Gera feedback final ao candidato.',
    template: `
Gere um feedback ao candidato para o cargo "{jobTitle}".
Use tom construtivo e objetivo.

Resumo:
{summary}

Pontos fortes:
{strengths}

Melhorias:
{areasForImprovement}

Transcrição (perguntas e respostas):
{answersTranscript}

Retorne apenas o texto do feedback (sem JSON).
`.trim()
  },

  cvAnalysis: {
    id: 'cvAnalysis',
    name: 'Análise de CV',
    description: 'Avalia CV vs vaga e sugere perguntas de follow-up.',
    template: `
Você é um avaliador de currículo.
Cargo: {jobTitle} (nível {jobLevel})
Data de referência: {currentDate}

Descrição da vaga:
{jobDescription}

Texto do currículo:
{cvText}

Retorne APENAS JSON válido no formato:
{
  "matchScore": number (0 a 10, 1 casa decimal),
  "summary": string,
  "strengths": string (bullet points com "- "),
  "weaknesses": string (bullet points com "- "),
  "followUpQuestions": [
    {
      "question": string,
      "criteria": [
        { "text": string, "points": number },
        { "text": string, "points": number },
        { "text": string, "points": number }
      ]
    }
  ],
  "analysisJustification": string (se followUpQuestions for [])
}

Regras:
- followUpQuestions pode ser [].
- Se houver followUpQuestions, cada pergunta deve ter 3 critérios somando 10.
`.trim()
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
     🧠 IA — GERAR PERGUNTAS (BACKEND)
  ====================================================== */
  async generateQuestions(details: JobDetails): Promise<InterviewQuestion[]> {
    await simulateLatency();

    const data = loadData();
    const prompts = data.prompts;

    if (!prompts?.questionGeneration?.template?.trim()) {
      throw new Error('Prompt "Geração de Perguntas" está vazio. Vá em Configurações e salve os prompts.');
    }
    if (!prompts?.baselineAnswerGeneration?.template?.trim()) {
      throw new Error('Prompt "Resposta Base" está vazio. Vá em Configurações e salve os prompts.');
    }

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

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao gerar perguntas da vaga');
    }

    const questions = json?.questions;
    if (!Array.isArray(questions)) {
      throw new Error('Resposta inválida do backend: "questions" não é um array.');
    }

    return questions;
  },

  /* ======================================================
     🧠 IA — EXTRAIR KEYWORDS (BACKEND)
  ====================================================== */
  async extractKeywords(details: JobDetails): Promise<string> {
    await simulateLatency();

    const data = loadData();
    const prompts = data.prompts;

    if (!prompts?.keywordExtraction?.template?.trim()) {
      throw new Error('Prompt "Extração de Keywords" está vazio. Vá em Configurações e salve os prompts.');
    }

    const res = await fetch('/api/extract-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: details,
        keywordPromptTemplate: prompts.keywordExtraction.template
      })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao extrair keywords');
    }

    const keywords = json?.keywords;
    if (typeof keywords !== 'string') {
      throw new Error('Resposta inválida do backend: "keywords" não é string.');
    }

    return keywords.trim();
  },

  /* ======================================================
     🧠 IA — AVALIAR ENTREVISTA (BACKEND)
     Endpoint: /api/evaluate-interview
  ====================================================== */
  async evaluateInterview(payload: {
    jobDetails: JobDetails;
    interviewScript: InterviewQuestion[];
    answers: UserAnswer[];
  }): Promise<EvaluationResult> {
    await simulateLatency();

    const { prompts } = loadData();

    if (!prompts?.answerEvaluation?.template?.trim()) {
      throw new Error('Prompt "Avaliação de Respostas" está vazio. Vá em Configurações e salve os prompts.');
    }
    if (!prompts?.originalityEvaluation?.template?.trim()) {
      throw new Error('Prompt "Originalidade" está vazio. Vá em Configurações e salve os prompts.');
    }
    if (!prompts?.candidateFeedbackGeneration?.template?.trim()) {
      throw new Error('Prompt "Feedback" está vazio. Vá em Configurações e salve os prompts.');
    }

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
      // prioriza "details" do backend quando existir (fica muito mais debugável)
      throw new Error(json?.details || json?.error || 'Erro ao avaliar entrevista');
    }

    const evaluation = json?.evaluation;
    if (!evaluation || typeof evaluation !== 'object') {
      throw new Error('Resposta inválida do backend: "evaluation" não é um objeto.');
    }

    return evaluation as EvaluationResult;
  },

  /* ======================================================
     🧠 IA — ANALISAR CV (BACKEND)
     Endpoint: /api/analyze-cv
     (mantém a qualidade: frontend extrai texto do PDF, backend só avalia)
  ====================================================== */
  async analyzeCv(details: JobDetails, cvText: string): Promise<CvEvaluationResult> {
    await simulateLatency();

    const { prompts } = loadData();

    if (!prompts?.cvAnalysis?.template?.trim()) {
      throw new Error('Prompt "Análise de CV" está vazio.');
    }

    const currentDate = new Date().toLocaleDateString('pt-BR');

    const res = await fetch('/api/analyze-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDetails: details,
        cvText,
        cvPromptTemplate: prompts.cvAnalysis.template,
        currentDate,
      })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.details || json?.error || 'Erro ao analisar CV');
    }

    // compatível com variações: { result }, { cvEvaluation }, { evaluation }
    const result = json?.result ?? json?.cvEvaluation ?? json?.evaluation;
    if (!result || typeof result !== 'object') {
      throw new Error('Resposta inválida do backend: resultado da análise de CV não é um objeto.');
    }

    return result as CvEvaluationResult;
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

  /* ======================================================
     ✅ UPDATE EVALUATION (local) — usado no Reevaluate
     (não chama IA; só substitui evaluation salvo no storage)
  ====================================================== */
  async updateEvaluation(vacancyId: string, candidateId: string, evaluation: EvaluationResult) {
    await simulateLatency();

    const data = loadData();
    let updatedCandidate: CandidateResult | null = null;

    const vacancies = data.vacancies.map(v => {
      if (v.id !== vacancyId) return v;

      const candidates = v.candidates.map(c => {
        if (c.id !== candidateId) return c;
        updatedCandidate = { ...c, evaluation };
        return updatedCandidate;
      });

      return { ...v, candidates };
    });

    saveData({ ...data, vacancies });

    return {
      updatedVacancies: vacancies,
      updatedCandidate,
    };
  },

  /* ---------- PROMPTS ---------- */
  async savePrompts(prompts: PromptSettings) {
    await simulateLatency();
    const data = loadData();
    saveData({ ...data, prompts });
    return prompts;
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
