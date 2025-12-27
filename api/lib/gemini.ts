import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

// IMPORTANT: type-only imports somem no build (evita erro de module resolution no runtime)
import type {
  JobDetails,
  InterviewQuestion,
  UserAnswer,
  EvaluationResult,
  QuestionGrade,
  BehavioralQuestion,
  CvEvaluationResult,
} from '../../types';

const apiKey = process.env.GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error('Missing env var: GEMINI_API_KEY');
}

const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.5-flash';

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: 'A lista de perguntas da entrevista.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'A pergunta a ser feita ao candidato.',
          },
          criteria: {
            type: Type.ARRAY,
            description: 'Os critérios para avaliar a resposta. A soma dos pontos deve ser 10.',
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: 'A descrição do critério de avaliação.',
                },
                points: {
                  type: Type.NUMBER,
                  description: 'O peso do critério, de 1 a 10.',
                },
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
  type: Type.OBJECT,
  properties: {
    globalGrade: {
      type: Type.NUMBER,
      description: 'Uma nota global de 0 a 10 para o candidato, com uma casa decimal.',
    },
    summary: {
      type: Type.STRING,
      description: 'Um resumo conciso da performance do candidato na entrevista.',
    },
    strengths: {
      type: Type.STRING,
      description: 'Os principais pontos fortes do candidato, listados em bullet points (usando "- ").',
    },
    areasForImprovement: {
      type: Type.STRING,
      description: 'Os principais áreas para melhoria do candidato, listadas em bullet points (usando "- ").',
    },
    questionGrades: {
      type: Type.ARRAY,
      description: 'A avaliação detalhada para cada pergunta.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'A pergunta que foi avaliada.' },
          grade: { type: Type.NUMBER, description: 'A nota de 0 a 10 para a resposta desta pergunta.' },
          justification: { type: Type.STRING, description: 'A justificativa para a nota da pergunta.' },
          criterionGrades: {
            type: Type.ARRAY,
            description: 'A avaliação detalhada para cada critério da pergunta.',
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING, description: 'O critério que foi avaliado.' },
                grade: { type: Type.NUMBER, description: 'A nota de 0 a 10 para este critério específico.' },
                justification: { type: Type.STRING, description: 'A justificativa para a nota do critério.' },
              },
              required: ['criterion', 'grade', 'justification'],
            },
          },
        },
        required: ['question', 'grade', 'justification', 'criterionGrades'],
      },
    },
  },
  required: ['globalGrade', 'summary', 'strengths', 'areasForImprovement', 'questionGrades'],
};

const cvEvaluationSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
      description: 'Uma nota de 0 a 10 indicando o alinhamento do CV com a vaga, com uma casa decimal.',
    },
    summary: {
      type: Type.STRING,
      description: 'Um resumo conciso da adequação do candidato à vaga com base no CV.',
    },
    strengths: {
      type: Type.STRING,
      description: 'Os principais pontos de alinhamento do CV com os requisitos da vaga, em bullet points (usando "- ").',
    },
    weaknesses: {
      type: Type.STRING,
      description:
        'Os principais pontos de desalinhamento ou requisitos importantes não encontrados no CV, em bullet points (usando "- ").',
    },
    followUpQuestions: {
      type: Type.ARRAY,
      description:
        'Uma lista de perguntas de aprofundamento para a entrevista. Se nenhuma pergunta for necessária, retorne um array vazio.',
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'A pergunta a ser feita ao candidato para esclarecer um ponto do CV.' },
          criteria: {
            type: Type.ARRAY,
            description: 'Os 3 critérios para avaliar a resposta. A soma dos pontos deve ser exatamente 10.',
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: 'A descrição do critério.' },
                points: { type: Type.NUMBER, description: 'O peso do critério.' },
              },
              required: ['text', 'points'],
            },
          },
        },
        required: ['question', 'criteria'],
      },
    },
    analysisJustification: {
      type: Type.STRING,
      description:
        "Uma justificativa se nenhuma pergunta de aprofundamento for gerada. Ex: 'O CV é claro e não necessita de esclarecimentos.'",
    },
  },
  required: ['matchScore', 'summary', 'strengths', 'weaknesses', 'followUpQuestions'],
};

const originalitySchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: 'O score de similaridade de 0 (totalmente original) a 100 (provavelmente gerado por IA).',
    },
    justification: {
      type: Type.STRING,
      description: 'Uma breve justificativa para o score de similaridade.',
    },
  },
  required: ['score', 'justification'],
};

const generatePrompt = (template: string, placeholders: Record<string, string | number>): string => {
  return Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, template);
};

export const extractKeywordsFromJobDescription = async (details: JobDetails, promptTemplate: string): Promise<string> => {
  const prompt = generatePrompt(promptTemplate, {
    jobDescription: details.description,
    jobTitle: details.title,
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Erro ao extrair palavras-chave:', error);
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
    jobDescription: jobDetails.description,
  });

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error(`Erro ao gerar resposta base para a pergunta: "${question}"`, error);
    return 'Não foi possível gerar uma resposta base para comparação.';
  }
};

export const generateQuestions = async (
  details: JobDetails,
  questionPromptTemplate: string,
  baselineAnswerPromptTemplate: string
): Promise<BehavioralQuestion[]> => {
  const biasMapping = ['muito técnico', 'técnico', 'equilibrado', 'comportamental', 'muito comportamental'];
  const promptPlaceholders = {
    jobTitle: details.title,
    jobLevel: details.level,
    numQuestions: details.numQuestions,
    jobDescription: details.description,
    biasDescription: biasMapping[details.bias],
  };

  const prompt = generatePrompt(questionPromptTemplate, promptPlaceholders);

  let response: GenerateContentResponse | undefined;

  try {
    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: questionSchema },
    });

    const result = JSON.parse(response.text.trim());
    if (!result?.questions) {
      throw new Error('A resposta da IA não continha a estrutura de "perguntas" esperada.');
    }

    const questionsWithBaselines = await Promise.all(
      result.questions.map(async (q: Omit<BehavioralQuestion, 'type' | 'baselineAnswer'>) => {
        const baselineAnswer = await generateBaselineAnswer(q.question, details, baselineAnswerPromptTemplate);
        return { ...q, baselineAnswer, type: 'behavioral' as const };
      })
    );

    return questionsWithBaselines;
  } catch (error: any) {
    console.error('Erro ao gerar perguntas:', error);
    if (response?.text) {
      throw new Error(`Resposta inesperada da IA: ${response.text}`);
    }
    throw new Error(error?.message || 'Não foi possível gerar as perguntas. Tente novamente.');
  }
};

const calculateOriginalityScore = async (
  candidateAnswer: string,
  baselineAnswer: string,
  promptTemplate: string
): Promise<{ score: number; justification: string }> => {
  const prompt = generatePrompt(promptTemplate, { candidateAnswer, baselineAnswer });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: originalitySchema },
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error('Erro ao calcular score de originalidade:', error);
    return { score: 0, justification: 'Falha na análise de originalidade.' };
  }
};

const generateCandidateFeedback = async (
  jobDetails: JobDetails,
  answers: UserAnswer[],
  evaluation: EvaluationResult,
  promptTemplate: string
): Promise<string> => {
  const answersTranscript = answers
    .map(a => `  - Pergunta: "${a.question}"\n    Resposta: "${a.answer}"`)
    .join('\n\n');

  const prompt = generatePrompt(promptTemplate, {
    jobTitle: jobDetails.title,
    summary: evaluation.summary,
    strengths: evaluation.strengths,
    areasForImprovement: evaluation.areasForImprovement,
    answersTranscript,
  });

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('Erro ao gerar feedback do candidato:', error);
    return 'Não foi possível gerar o feedback para o candidato neste momento.';
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
  const behavioralQuestions = questions.filter((q): q is BehavioralQuestion => q.type === 'behavioral');

  const interviewTranscript = behavioralQuestions
    .map((q, index) => {
      const userAnswer = answers.find(a => a.question === q.question);
      const criteriaText = q.criteria.map(c => `- ${c.text} (${c.points} pontos)`).join('\n');
      return `--- PERGUNTA ${index + 1} ---\nPergunta: ${q.question}\nCritérios de Avaliação:\n${criteriaText}\nResposta do Candidato: ${
        userAnswer ? userAnswer.answer : 'Sem resposta.'
      }\n`;
    })
    .join('\n');

  const prompt = generatePrompt(evaluationPromptTemplate, {
    jobTitle: jobDetails.title,
    jobLevel: jobDetails.level,
    jobDescription: jobDetails.description,
    interviewTranscript,
  });

  let response: GenerateContentResponse | undefined;

  try {
    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: evaluationSchema },
    });

    const evaluationResult: EvaluationResult = JSON.parse(response.text.trim());
    if (!evaluationResult || typeof evaluationResult.globalGrade === 'undefined') {
      throw new Error('A resposta da IA não continha a estrutura de avaliação esperada.');
    }

    const updatedQuestionGrades = await Promise.all(
      evaluationResult.questionGrades.map(async (grade: QuestionGrade) => {
        const questionData = behavioralQuestions.find(q => q.question === grade.question);
        const userAnswer = answers.find(a => a.question === grade.question);

        if (questionData?.baselineAnswer && userAnswer?.answer) {
          const originality = await calculateOriginalityScore(
            userAnswer.answer,
            questionData.baselineAnswer,
            originalityPromptTemplate
          );
          return {
            ...grade,
            originalityScore: originality.score,
            originalityJustification: originality.justification,
          };
        }
        return grade;
      })
    );

    evaluationResult.questionGrades = updatedQuestionGrades;
    evaluationResult.candidateFeedback = await generateCandidateFeedback(jobDetails, answers, evaluationResult, feedbackPromptTemplate);

    return evaluationResult;
  } catch (error: any) {
    console.error('Erro ao avaliar respostas:', error);
    if (response?.text) {
      throw new Error(`Resposta inesperada da IA: ${response.text}`);
    }
    throw new Error(error?.message || 'Não foi possível avaliar a entrevista. Tente novamente.');
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
    currentDate,
  });

  let response: GenerateContentResponse | undefined;

  try {
    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: cvEvaluationSchema },
    });

    const cvEvaluationResult: CvEvaluationResult = JSON.parse(response.text.trim());
    if (!cvEvaluationResult || typeof cvEvaluationResult.matchScore === 'undefined') {
      throw new Error('A resposta da IA não continha a estrutura de avaliação de CV esperada.');
    }
    return cvEvaluationResult;
  } catch (error: any) {
    console.error('Erro ao analisar CV:', error);
    if (response?.text) {
      throw new Error(`Resposta inesperada da IA: ${response.text}`);
    }
    throw new Error(error?.message || 'Não foi possível analisar o CV. Tente novamente.');
  }
};
