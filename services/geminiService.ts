import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
  const key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || "";
  
  if (!key) {
    console.error("❌ API Key não encontrada! Verifique suas variáveis de ambiente.");
  }
  
  return key;
};

const ai = new GoogleGenerativeAI(getApiKey());

// ✅ CORRIGIDO: Removido '-latest' do nome do modelo
const modelName = 'gemini-1.5-flash';

// ============================================
// SCHEMAS DE RESPOSTA
// ============================================

const questionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          criteria: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: { type: SchemaType.STRING },
                points: { type: SchemaType.NUMBER },
              },
              required: ['text', 'points'],
            },
          },
        },
        required: ['question', 'criteria'],
      },
    },
  },
  required: ['questions'],
};

const evaluationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    globalGrade: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
    strengths: { type: SchemaType.STRING },
    areasForImprovement: { type: SchemaType.STRING },
    questionGrades: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          grade: { type: SchemaType.NUMBER },
          justification: { type: SchemaType.STRING },
          criterionGrades: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                criterion: { type: SchemaType.STRING },
                grade: { type: SchemaType.NUMBER },
                justification: { type: SchemaType.STRING }
              },
              required: ['criterion', 'grade', 'justification']
            }
          }
        },
        required: ['question', 'grade', 'justification', 'criterionGrades']
      }
    }
  },
  required: ['globalGrade', 'summary', 'strengths', 'areasForImprovement', 'questionGrades']
};

const cvEvaluationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    matchScore: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
    strengths: { type: SchemaType.STRING },
    weaknesses: { type: SchemaType.STRING },
    followUpQuestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          criteria: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: { type: SchemaType.STRING },
                points: { type: SchemaType.NUMBER },
              },
              required: ['text', 'points'],
            },
          },
        },
        required: ['question', 'criteria'],
      }
    },
    analysisJustification: { type: SchemaType.STRING }
  },
  required: ['matchScore', 'summary', 'strengths', 'weaknesses', 'followUpQuestions']
};

const originalitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER },
    justification: { type: SchemaType.STRING }
  },
  required: ['score', 'justification']
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const generatePrompt = (
  template: string, 
  placeholders: Record<string, string | number>
): string => {
  return Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, template);
};

// ✅ MELHORADO: Tratamento de erro mais específico
const handleApiError = (error: any, context: string): never => {
  console.error(`❌ Erro em ${context}:`, error);
  
  if (error.message?.includes('404')) {
    throw new Error(`Erro 404: Modelo ou endpoint não encontrado. Verifique o nome do modelo.`);
  }
  
  if (error.message?.includes('API key')) {
    throw new Error(`Erro de autenticação: Verifique sua API Key.`);
  }
  
  throw new Error(`Erro ao ${context}: ${error.message || 'Erro desconhecido'}`);
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
    jobTitle: details.title
  });

  try {
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Erro ao extrair keywords:", error);
    return '';
  }
};

const generateBaselineAnswer = async (
  question: string, 
  jobDetails: JobDetails, 
  promptTemplate: string
): Promise<string> => {
  const prompt = generatePrompt(promptTemplate, {
    question,
    jobTitle: jobDetails.title,
    jobDescription: jobDetails.description
  });

  try {
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Erro ao gerar resposta base:", error);
    return "Não foi possível gerar resposta base.";
  }
};

export const generateQuestions = async (
  details: JobDetails, 
  questionPromptTemplate: string, 
  baselineAnswerPromptTemplate: string
): Promise<BehavioralQuestion[]> => {
  const biasMapping = [
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
    biasDescription: biasMapping[details.bias],
  });

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema as any
      }
    });

    const response = await model.generateContent(prompt);
    const result = JSON.parse(response.response.text());

    // ✅ MELHORADO: Geração paralela de respostas baseline
    return await Promise.all(
      result.questions.map(async (q: any) => {
        const baselineAnswer = await generateBaselineAnswer(
          q.question, 
          details, 
          baselineAnswerPromptTemplate
        );
        
        return {
          ...q,
          baselineAnswer,
          type: 'behavioral' as const
        };
      })
    );
  } catch (error: any) {
    handleApiError(error, 'gerar perguntas');
  }
};

const calculateOriginalityScore = async (
  candidateAnswer: string, 
  baselineAnswer: string, 
  promptTemplate: string
) => {
  const prompt = generatePrompt(promptTemplate, {
    candidateAnswer,
    baselineAnswer
  });

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: originalitySchema as any
      }
    });

    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("❌ Erro ao calcular originalidade:", error);
    return { 
      score: 0, 
      justification: "Falha na análise de originalidade." 
    };
  }
};

const generateCandidateFeedback = async (
  jobDetails: JobDetails, 
  answers: UserAnswer[], 
  evaluation: EvaluationResult, 
  promptTemplate: string
): Promise<string> => {
  const answersTranscript = answers
    .map(a => `- Pergunta: "${a.question}"\n  Resposta: "${a.answer}"`)
    .join('\n\n');

  const prompt = generatePrompt(promptTemplate, {
    jobTitle: jobDetails.title,
    summary: evaluation.summary,
    strengths: evaluation.strengths,
    areasForImprovement: evaluation.areasForImprovement,
    answersTranscript
  });

  try {
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Erro ao gerar feedback:", error);
    return "Não foi possível gerar feedback personalizado.";
  }
};

export const evaluateAnswers = async (
  jobDetails: JobDetails, 
  questions: InterviewQuestion[], 
  answers: UserAnswer[], 
  evaluationPromptTemplate: string, 
  originalityPromptTemplate: string, 
  feedbackPromptTemplate: string
): Promise<EvaluationResult> => {
  const behavioralQuestions = questions.filter(
    (q): q is BehavioralQuestion => q.type === 'behavioral'
  );

  const transcript = behavioralQuestions
    .map((q, i) => {
      const ans = answers.find(a => a.question === q.question);
      return `Q${i + 1}: ${q.question}\nAns: ${ans ? ans.answer : 'N/A'}\n`;
    })
    .join('\n');

  const prompt = generatePrompt(evaluationPromptTemplate, {
    jobTitle: jobDetails.title,
    jobLevel: jobDetails.level,
    jobDescription: jobDetails.description,
    interviewTranscript: transcript,
  });

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: evaluationSchema as any
      }
    });

    const response = await model.generateContent(prompt);
    const result: EvaluationResult = JSON.parse(response.response.text());

    // ✅ MELHORADO: Cálculo paralelo de originalidade
    result.questionGrades = await Promise.all(
      result.questionGrades.map(async (grade) => {
        const qData = behavioralQuestions.find(q => q.question === grade.question);
        const uAns = answers.find(a => a.question === grade.question);
        
        if (qData?.baselineAnswer && uAns?.answer) {
          const orig = await calculateOriginalityScore(
            uAns.answer, 
            qData.baselineAnswer, 
            originalityPromptTemplate
          );
          
          return {
            ...grade,
            originalityScore: orig.score,
            originalityJustification: orig.justification
          };
        }
        
        return grade;
      })
    );

    // Gera feedback personalizado
    result.candidateFeedback = await generateCandidateFeedback(
      jobDetails, 
      answers, 
      result, 
      feedbackPromptTemplate
    );

    return result;
  } catch (error: any) {
    handleApiError(error, 'avaliar respostas');
  }
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

  try {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: cvEvaluationSchema as any
      }
    });

    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text());
  } catch (error: any) {
    handleApiError(error, 'analisar CV');
  }
};

