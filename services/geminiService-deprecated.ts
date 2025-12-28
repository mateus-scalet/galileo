import {
  JobDetails,
  InterviewQuestion,
  UserAnswer,
  EvaluationResult,
  BehavioralQuestion,
  CvEvaluationResult,
} from "../types";

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const generatePrompt = (
  template: string,
  placeholders: Record<string, string | number>
): string => {
  return Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), String(value));
  }, template);
};

// ============================================
// CLIENTES DE API (BACKEND)
// ============================================

type GeminiTextResponse = { text: string; model?: string };
type GeminiJsonResponse =
  | { ok: true; data: any; model?: string }
  | { ok: false; error: any };

const callGeminiTextApi = async (prompt: string): Promise<GeminiTextResponse> => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro Gemini API: ${errorText}`);
  }

  return response.json();
};

const callGeminiJsonApi = async (prompt: string): Promise<any> => {
  const response = await fetch("/api/gemini-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Erro Gemini JSON API: ${text}`);
  }

  let parsed: GeminiJsonResponse;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida do /api/gemini-json: ${text}`);
  }

  if (!parsed.ok) {
    throw new Error(
      `Gemini JSON API retornou erro: ${JSON.stringify(parsed.error)}`
    );
  }

  return parsed.data;
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

export const extractKeywordsFromJobDescription = async (
  details: JobDetails,
  promptTemplate: string
): Promise<string> => {
  const prompt = generatePrompt(promptTemplate, {
    jobDescription: details.description,
    jobTitle: details.title,
  });

  const result = await callGeminiTextApi(prompt);
  return result.text.trim();
};

const generateBaselineAnswer = async (
  question: string,
  jobDetails: JobDetails,
  promptTemplate: string
): Promise<string> => {
  const prompt = generatePrompt(promptTemplate, {
    question,
    jobTitle: jobDetails.title,
    jobDescription: jobDetails.description,
  });

  const result = await callGeminiTextApi(prompt);
  return result.text.trim();
};

export const generateQuestions = async (
  details: JobDetails,
  questionPromptTemplate: string,
  baselineAnswerPromptTemplate: string
): Promise<BehavioralQuestion[]> => {
  const biasMapping = [
    "muito técnico",
    "técnico",
    "equilibrado",
    "comportamental",
    "muito comportamental",
  ];

  const prompt =
    generatePrompt(questionPromptTemplate, {
      jobTitle: details.title,
      jobLevel: details.level,
      numQuestions: details.numQuestions,
      jobDescription: details.description,
      biasDescription: biasMapping[details.bias],
    }) + "\n\nIMPORTANTE: Retorne APENAS JSON puro.";

  const parsed: any = await callGeminiJsonApi(prompt);

  return Promise.all(
    parsed.questions.map(async (q: any) => {
      const baselineAnswer = await generateBaselineAnswer(
        q.question,
        details,
        baselineAnswerPromptTemplate
      );
      return { ...q, baselineAnswer, type: "behavioral" as const };
    })
  );
};

export const evaluateAnswers = async (
  jobDetails: JobDetails,
  questions: InterviewQuestion[],
  answers: UserAnswer[],
  evaluationPromptTemplate: string,
  originalityPromptTemplate?: string,
  feedbackPromptTemplate?: string
): Promise<EvaluationResult> => {
  const behavioralQuestions = questions.filter(
    (q): q is BehavioralQuestion => q.type === "behavioral"
  );

  const transcript = behavioralQuestions
    .map((q, i) => {
      const ans = answers.find((a) => a.question === q.question);
      return `Q${i + 1}: ${q.question}\nResposta: ${
        ans ? ans.answer : "N/A"
      }\n`;
    })
    .join("\n");

  const prompt =
    generatePrompt(evaluationPromptTemplate, {
      jobTitle: jobDetails.title,
      jobLevel: jobDetails.level,
      jobDescription: jobDetails.description,
      interviewTranscript: transcript,
    }) + "\n\nIMPORTANTE: Retorne APENAS JSON puro.";

  const data = await callGeminiJsonApi(prompt);
  return data as EvaluationResult;
};

export const analyzeCv = async (
  jobDetails: JobDetails,
  cvText: string,
  promptTemplate: string,
  currentDate: string
): Promise<CvEvaluationResult> => {
  const prompt =
    generatePrompt(promptTemplate, {
      jobTitle: jobDetails.title,
      jobLevel: jobDetails.level,
      jobDescription: jobDetails.description,
      cvText,
      currentDate,
    }) + "\n\nIMPORTANTE: Retorne APENAS JSON puro.";

  const data = await callGeminiJsonApi(prompt);
  return data as CvEvaluationResult;
};
