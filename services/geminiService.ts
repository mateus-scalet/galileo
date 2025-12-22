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

// Remove ```json / ``` e tenta extrair JSON válido mesmo com texto extra
const parseJsonFromGeminiText = (text: string) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 1) tenta parse direto
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2) tenta extrair objeto {...}
  const firstObj = cleaned.indexOf("{");
  const lastObj = cleaned.lastIndexOf("}");
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    const slice = cleaned.slice(firstObj, lastObj + 1);
    return JSON.parse(slice);
  }

  // 3) tenta extrair array [...]
  const firstArr = cleaned.indexOf("[");
  const lastArr = cleaned.lastIndexOf("]");
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const slice = cleaned.slice(firstArr, lastArr + 1);
    return JSON.parse(slice);
  }

  throw new Error("Resposta do Gemini não contém JSON válido.");
};

// ============================================
// CLIENTE DE API (BACKEND)
// ============================================

const callGeminiApi = async (prompt: string): Promise<{ text: string }> => {
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

  const result = await callGeminiApi(prompt);
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

  const result = await callGeminiApi(prompt);
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
    }) + "\n\nIMPORTANTE: Retorne APENAS o JSON puro, sem blocos ```.";

  const result = await callGeminiApi(prompt);
  const parsed: any = parseJsonFromGeminiText(result.text);

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
    }) + "\n\nRetorne APENAS JSON puro, sem blocos ```.";

  const result = await callGeminiApi(prompt);
  return parseJsonFromGeminiText(result.text) as EvaluationResult;
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
    }) + "\n\nRetorne APENAS JSON puro, sem blocos ```.";

  const result = await callGeminiApi(prompt);
  return parseJsonFromGeminiText(result.text) as CvEvaluationResult;
};
