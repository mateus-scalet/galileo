import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import {
  JobDetails,
  InterviewQuestion,
  UserAnswer,
  EvaluationResult,
  QuestionGrade,
  BehavioralQuestion,
  CvEvaluationResult
} from '../../types';

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY as string
});

const model = 'gemini-2.5-flash';

/* =========================
   SCHEMAS
========================= */

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                points: { type: Type.NUMBER }
              },
              required: ['text', 'points']
            }
          }
        },
        required: ['question', 'criteria']
      }
    }
  },
  required: ['questions']
};

const cvEvaluationSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    analysisJustification: { type: Type.STRING },
    followUpQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                points: { type: Type.NUMBER }
              },
              required: ['text', 'points']
            }
          }
        }
      }
    }
  },
  required: ['matchScore', 'summary', 'strengths', 'weaknesses', 'followUpQuestions']
};

/* =========================
   HELPERS
========================= */

const generatePrompt = (
  template: string,
  placeholders: Record<string, string | number>
) =>
  Object.entries(placeholders).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    template
  );

/* =========================
   FUNÇÕES EXPORTADAS
========================= */

export const generateQuestions = async (
  details: JobDetails,
  questionPromptTemplate: string,
  baselineAnswerPromptTemplate: string
): Promise<BehavioralQuestion[]> => {

  const biasMap = [
    'muito técnico',
    'técnico',
    'equilibrado',
    'comportamental',
    'muito comportamental'
  ];

  const prompt = generatePrompt(questionPromptTemplate, {
    jobTitle: details.title,
    jobLevel: details.level,
    numQuestions: details.numQuestions,
    jobDescription: details.description,
    biasDescription: biasMap[details.bias]
  });

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: questionSchema
    }
  });

  const parsed = JSON.parse(response.text.trim());

  return parsed.questions.map((q: any) => ({
    ...q,
    type: 'behavioral'
  }));
};

export const analyzeCv = async (
  jobDetails: JobDetails,
  cvText: string,
  promptTemplate: string,
  currentDate: string
): Promise<CvEvaluationResult> => {

  const prompt = generatePrompt(promptTemplate, {
    jobTitle: jobDetails.title,
    jobLevel: jobDetails.level,
    jobDescription: jobDetails.description,
    cvText,
    currentDate
  });

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: cvEvaluationSchema
    }
  });

  return JSON.parse(response.text.trim());
};
