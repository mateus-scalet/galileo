import { GoogleGenerativeAI, SchemaType, GenerateContentResponse } from '@google/generative-ai';
import { JobDetails, InterviewQuestion, UserAnswer, EvaluationResult, QuestionGrade, BehavioralQuestion, CvEvaluationResult } from '../types';

// Ajuste para o padrão do Vite para ler variáveis de ambiente
const ai = new GoogleGenerativeAI(import.meta.env.API_KEY as string);

// Usando o modelo estável mais recente
const modelName = 'gemini-1.5-flash';

const questionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      description: 'A lista de perguntas da entrevista.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: {
            type: SchemaType.STRING,
            description: 'A pergunta a ser feita ao candidato.',
          },
          criteria: {
            type: SchemaType.ARRAY,
            description: 'Os critérios para avaliar a resposta. A soma dos pontos deve ser 10.',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: {
                  type: SchemaType.STRING,
                  description: 'A descrição do critério de avaliação.',
                },
                points: {
                  type: SchemaType.NUMBER,
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
    type: SchemaType.OBJECT,
    properties: {
        globalGrade: {
            type: SchemaType.NUMBER,
            description: 'Uma nota global de 0 a 10 para o candidato, com uma casa decimal.'
        },
        summary: {
            type: SchemaType.STRING,
            description: 'Um resumo conciso da performance do candidato na entrevista.'
        },
        strengths: {
            type: SchemaType.STRING,
            description: 'Os principais pontos fortes do candidato, listados em bullet points (usando "- ").'
        },
        areasForImprovement: {
            type: SchemaType.STRING,
            description: 'As principais áreas para melhoria do candidato, listadas em bullet points (usando "- ").'
        },
        questionGrades: {
            type: SchemaType.ARRAY,
            description: 'A avaliação detalhada para cada pergunta.',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: {
                        type: SchemaType.STRING,
                        description: 'A pergunta que foi avaliada.'
                    },
                    grade: {
                        type: SchemaType.NUMBER,
                        description: 'A nota de 0 a 10 para a resposta desta pergunta.'
                    },
                    justification: {
                        type: SchemaType.STRING,
                        description: 'A justificativa para a nota da pergunta.'
                    },
                    criterionGrades: {
                      type: SchemaType.ARRAY,
                      description: 'A avaliação detalhada para cada critério da pergunta.',
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          criterion: {
                            type: SchemaType.STRING,
                            description: 'O critério que foi avaliado.'
                          },
                          grade: {
                            type: SchemaType.NUMBER,
                            description: 'A nota de 0 a 10 para este critério específico.'
                          },
                          justification: {
                            type: SchemaType.STRING,
                            description: 'A justificativa para a nota do critério.'
                          }
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
        matchScore: {
            type: SchemaType.NUMBER,
            description: 'Uma nota de 0 a 10 indicando o alinhamento do CV com a vaga, com uma casa decimal.'
        },
        summary: {
            type: SchemaType.STRING,
            description: 'Um resumo conciso da adequação do candidato à vaga com base no CV.'
        },
        strengths: {
            type: SchemaType.STRING,
            description: 'Os principais pontos de alinhamento do CV com os requisitos da vaga, em bullet points (usando "- ").'
        },
        weaknesses: {
            type: SchemaType.STRING,
            description: 'Os principais pontos de desalinhamento ou requisitos importantes não encontrados no CV, em bullet points (usando "- ").'
        },
        followUpQuestions: {
            type: SchemaType.ARRAY,
            description: 'Uma lista de perguntas de aprofundamento para a entrevista. Se nenhuma pergunta for necessária, retorne um array vazio.',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: {
                        type: SchemaType.STRING,
                        description: 'A pergunta a ser feita ao candidato para esclarecer um ponto do CV.',
                    },
                    criteria: {
                        type: SchemaType.ARRAY,
                        description: 'Os 3 critérios para avaliar a resposta. A soma dos pontos deve ser exatamente 10.',
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                text: { type: SchemaType.STRING, description: 'A descrição do critério.' },
                                points: { type: SchemaType.NUMBER, description: 'O peso do critério.' },
                            },
                            required: ['text', 'points'],
                        },
                    },
                },
                required: ['question', 'criteria'],
            }
        },
        analysisJustification: {
          type: SchemaType.STRING,
          description: "Uma justificativa se nenhuma pergunta de aprofundamento for gerada."
        }
    },
    required: ['matchScore', 'summary', 'strengths', 'weaknesses', 'followUpQuestions']
};

const originalitySchema = {
    type: SchemaType.OBJECT,
    properties: {
        score: {
            type: SchemaType.NUMBER,
            description: 'O score de similaridade de 0 a 100.'
        },
        justification: {
            type: SchemaType.STRING,
            description: 'Uma breve justificativa.'
        }
    },
    required: ['score', 'justification']
};

const generatePrompt = (template: string, placeholders: Record<string, string | number>): string => {
  return Object.entries(placeholders).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, template);
};

export const extractKeywordsFromJobDescription = async (details: JobDetails, promptTemplate: string): Promise<string> => {
    const prompt = generatePrompt(promptTemplate, { 
      jobDescription: details.description,
      jobTitle: details.title
    });

    try {
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Erro ao extrair palavras-chave:", error);
        return '';
    }
}

const generateBaselineAnswer = async (question: string, jobDetails: JobDetails, promptTemplate: string): Promise<string> => {
    const prompt = generatePrompt(promptTemplate, {
      question: question,
      jobTitle: jobDetails.title,
      jobDescription: jobDetails.description
    });
    try {
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error(`Erro ao gerar resposta base`, error);
        return "Não foi possível gerar uma resposta base.";
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
  
  try {
    const model = ai.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', responseSchema: questionSchema as any }
    });
    
    const response = await model.generateContent(prompt);
    const result = JSON.parse(response.response.text().trim());
    
    if (!result || !result.questions) {
      throw new Error('Estrutura de "perguntas" não encontrada.');
    }
    
    const questionsWithBaselines = await Promise.all(
        result.questions.map(async (q: any) => {
            const baselineAnswer = await generateBaselineAnswer(q.question, details, baselineAnswerPromptTemplate);
            return { ...q, baselineAnswer, type: 'behavioral' as const };
        })
    );
    
    return questionsWithBaselines;
  } catch (error: any) {
    console.error("Erro ao gerar perguntas:", error);
    throw new Error(error.message || "Não foi possível gerar as perguntas.");
  }
};

const calculateOriginalityScore = async (candidateAnswer: string, baselineAnswer: string, promptTemplate: string): Promise<{ score: number, justification: string }> => {
    const prompt = generatePrompt(promptTemplate, { candidateAnswer, baselineAnswer });
    try {
        const model = ai.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: 'application/json', responseSchema: originalitySchema as any }
        });
        const response = await model.generateContent(prompt);
        return JSON.parse(response.response.text().trim());
    } catch (error) {
        console.error("Erro originalidade:", error);
        return { score: 0, justification: "Falha na análise." };
    }
};

const generateCandidateFeedback = async (
    jobDetails: JobDetails,
    answers: UserAnswer[],
    evaluation: EvaluationResult,
    promptTemplate: string
): Promise<string> => {
    const answersTranscript = answers.map(a => ` - Pergunta: "${a.question}"\n Resposta: "${a.answer}"`).join('\n\n');
    const prompt = generatePrompt(promptTemplate, {
      jobTitle: jobDetails.title,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      areasForImprovement: evaluation.areasForImprovement,
      answersTranscript: answersTranscript
    });

    try {
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "Não foi possível gerar feedback.";
    }
};

export const evaluateAnswers = async (
  jobDetails: JobDetails,
  questions: InterviewQuestion[],
  answers: UserAnswer[],
  evaluationPromptTemplate: string,
  originalityPromptTemplate: string,
  feedbackPromptTemplate: string,
): Promise<EvaluationResult> => {
    
  const behavioralQuestions = questions.filter((q): q is BehavioralQuestion => q.type === 'behavioral');
  const interviewTranscript = behavioralQuestions.map((q, index) => {
    const userAnswer = answers.find(a => a.question === q.question);
    const criteriaText = q.criteria.map(c => `- ${c.text} (${c.points} pts)`).join('\n');
    return `--- PERGUNTA ${index + 1} ---\nPergunta: ${q.question}\nCritérios:\n${criteriaText}\nResposta: ${userAnswer ? userAnswer.answer : 'Sem resposta.'}\n`
  }).join('\n');

  const prompt = generatePrompt(evaluationPromptTemplate, {
    jobTitle: jobDetails.title,
    jobLevel: jobDetails.level,
    jobDescription: jobDetails.description,
    interviewTranscript: interviewTranscript,
  });

  try {
    const model = ai.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', responseSchema: evaluationSchema as any }
    });
    const response = await model.generateContent(prompt);
    const evaluationResult: EvaluationResult = JSON.parse(response.response.text().trim());

    const updatedQuestionGrades = await Promise.all(
        evaluationResult.questionGrades.map(async (grade: QuestionGrade) => {
            const questionData = behavioralQuestions.find(q => q.question === grade.question);
            const userAnswer = answers.find(a => a.question === grade.question);

            if (questionData?.baselineAnswer && userAnswer?.answer) {
                const originality = await calculateOriginalityScore(userAnswer.answer, questionData.baselineAnswer, originalityPromptTemplate);
                return { ...grade, originalityScore: originality.score, originalityJustification: originality.justification };
            }
            return grade;
        })
    );
    
    evaluationResult.questionGrades = updatedQuestionGrades;
    evaluationResult.candidateFeedback = await generateCandidateFeedback(jobDetails, answers, evaluationResult, feedbackPromptTemplate);
    return evaluationResult;
  } catch (error: any) {
    throw new Error("Erro na avaliação.");
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
    cvText: cvText,
    currentDate: currentDate,
  });

  try {
    const model = ai.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', responseSchema: cvEvaluationSchema as any }
    });
    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text().trim());
  } catch (error: any) {
    throw new Error("Erro ao analisar CV.");
  }
};


