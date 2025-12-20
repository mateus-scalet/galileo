import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  JobDetails, 
  InterviewQuestion, 
  UserAnswer, 
  EvaluationResult, 
  QuestionGrade, 
  BehavioralQuestion, 
  CvEvaluationResult 
} from '../types';

// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const getApiKey = (): string => {
  return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || "";
};

const genAI = new GoogleGenerativeAI(getApiKey());

// Mudança para o modelo Pro estável
const MODEL_NAME = "gemini-pro"; 

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const generatePrompt = (template: string, placeholders: Record<string, string | number>): string => {
  return Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, template);
};

// Função para limpar a resposta da IA (remove blocos de código markdown se houver)
const parseJsonResponse = (text: string) => {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

export const extractKeywordsFromJobDescription = async (details: JobDetails, promptTemplate: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = generatePrompt(promptTemplate, { jobDescription: details.description, jobTitle: details.title });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Erro keywords:", error);
    return '';
  }
};

const generateBaselineAnswer = async (question: string, jobDetails: JobDetails, promptTemplate: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = generatePrompt(promptTemplate, { question, jobTitle: jobDetails.title, jobDescription: jobDetails.description });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return "Resposta base não disponível.";
  }
};

export const generateQuestions = async (details: JobDetails, questionPromptTemplate: string, baselineAnswerPromptTemplate: string): Promise<BehavioralQuestion[]> => {
  const biasMapping = ['muito técnico', 'técnico', 'equilibrado', 'comportamental', 'muito comportamental'];
  const prompt = generatePrompt(questionPromptTemplate, {
    jobTitle: details.title,
    jobLevel: details.level,
    numQuestions: details.numQuestions,
    jobDescription: details.description,
    biasDescription: biasMapping[details.bias],
  }) + "\n\nIMPORTANTE: Retorne APENAS o JSON puro, sem explicações.";

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse(text);

    return await Promise.all(
      parsed.questions.map(async (q: any) => {
        const baselineAnswer = await generateBaselineAnswer(q.question, details, baselineAnswerPromptTemplate);
        return { ...q, baselineAnswer, type: 'behavioral' as const };
      })
    );
  } catch (error: any) {
    console.error("Erro Gemini Pro:", error);
    throw new Error("Falha ao gerar perguntas com Gemini Pro.");
  }
};

export const evaluateAnswers = async (jobDetails: JobDetails, questions: InterviewQuestion[], answers: UserAnswer[], evaluationPromptTemplate: string, originalityPromptTemplate: string, feedbackPromptTemplate: string): Promise<EvaluationResult> => {
  const behavioralQuestions = questions.filter((q): q is BehavioralQuestion => q.type === 'behavioral');
  const transcript = behavioralQuestions.map((q, i) => {
    const ans = answers.find(a => a.question === q.question);
    return `Q${i + 1}: ${q.question}\nResposta: ${ans ? ans.answer : 'N/A'}\n`;
  }).join('\n');

  const prompt = generatePrompt(evaluationPromptTemplate, {
    jobTitle: jobDetails.title,
    jobLevel: jobDetails.level,
    jobDescription: jobDetails.description,
    interviewTranscript: transcript,
  }) + "\n\nRetorne o resultado em formato JSON conforme solicitado anteriormente.";

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const evaluation: EvaluationResult = parseJsonResponse(result.response.text());

    // Originalidade e Feedback simplificados para o Pro
    evaluation.candidateFeedback = "Avaliação concluída com sucesso.";
    return evaluation;
  } catch (error) {
    console.error("Erro avaliação:", error);
    throw new Error("Erro na avaliação com Gemini Pro.");
  }
};

export const analyzeCv = async (jobDetails: JobDetails, cvText: string, promptTemplate: string, currentDate: string): Promise<CvEvaluationResult> => {
  const prompt = generatePrompt(promptTemplate, { jobTitle: jobDetails.title, jobLevel: jobDetails.level, jobDescription: jobDetails.description, cvText, currentDate });
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text());
  } catch (error) {
    throw new Error("Erro na análise de CV.");
  }
};
