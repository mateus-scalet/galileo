import { Vacancy, PromptSettings, CandidateResult, InterviewQuestion, JobDetails, BehavioralQuestion } from '../types';

// --- SIMULAÇÃO DE LATÊNCIA E ERROS ---
const API_LATENCY = 300; // ms
const simulateLatency = () => new Promise(resolve => setTimeout(resolve, API_LATENCY));

// --- CHAVES DO LOCALSTORAGE ---
const CURRENT_DATA_VERSION = 1;
const DATA_KEY = 'galileo-data';

// --- DADOS INICIAIS E DEFAULTS ---
import { getInitialVacancies } from '../initialData';

const defaultPrompts: PromptSettings = {
    questionGeneration: {
      id: 'questionGeneration',
      name: 'Geração de Perguntas',
      description: 'Usado para criar perguntas e critérios de avaliação com base na descrição da vaga.',
      template: `
##SEU PAPEL
Você é um gerente de RH com ampla experiência em recrutamento e condução de entrevistas.

##CONTEXTO
Voocê deve entrevistar candidatos para o cargo de {jobTitle}, de nível {jobLevel}.
Abaixo está a descrição completa da vaga, incluindo responsabilidades e requisitos:: 
"{jobDescription}".

##AÇÃO
Crie {numQuestions} perguntas de entrevista específicas para o cargo de {jobTitle}.
O foco da entrevista deve ser {biasDescription}.
As perguntas devem estar diretamente relacionadas às responsabilidades e requisitos do cargo.
Cada pergunta deve solicitar que o candidato descreva uma situação real em que demonstrou uma habilidade, conhecimento ou comportamento relevante.
Para cada pergunta, gere também:
3 critérios de avaliação claros, objetivos e mensuráveis.
A pontuação total dos critérios deve somar exatamente 10 pontos.
Cada critério deve especificar o que o candidato precisa demonstrar para atingir aquela pontuação.
 
##FORMATO DO OUTPUT
Retorne um JSON com uma chave "questions", contendo um array de objetos. Cada objeto deve ter "question" (a pergunta) e "criteria" (um array de objetos com "text" e "points").

##EXEMPLOS
Abaixo, como exemplo, seguem pergunta e critérios para o cargo de Associate Product Manager em um marketplace:
Pergunta 1: "Conte sobre uma situação em que você precisou identificar e priorizar melhorias em um sistema ou processo logístico para reduzir custos ou tempo de entrega. Como realizou o diagnóstico do problema, envolveu as equipes e tomou decisões sobre o que desenvolver primeiro?"
Critérios Pergunta 1: 
"Demonstra capacidade de analisar dados e feedbacks para identificar oportunidades de melhoria com base em métricas claras (ex.: tempo de entrega, custo operacional)." 4 pontos.
"Mostra raciocínio estruturado para definir prioridades entre diferentes iniciativas, considerando impacto no negócio, esforço técnico e necessidades dos usuários." 3 pontos
"Descreve como coordenou times de tecnologia, operações e produto para implementar as melhorias, garantindo alinhamento e entrega de resultados." 3 pontos.

Ainda como exemplo, seguem pergunta e critérios para o cargo de Data Scientist no setor financeiro:
Pergunta 2: "Conte sobre um projeto em que você desenvolveu ou aplicou um modelo de machine learning para resolver um problema de negócio no setor financeiro (como detecção de fraude, previsão de inadimplência ou personalização de ofertas). Como definiu o problema, estruturou os dados e avaliou os resultados do modelo?"
Critérios Pergunta 2: 
"Demonstra clareza sobre o contexto do problema, objetivos de negócio e métricas de sucesso relevantes para o setor financeiro." 4 pontos.
"Explica adequadamente as etapas de preparação dos dados, escolha de algoritmos, validação e uso de ferramentas (como Python, Spark, MLFlow ou AWS." 3 pontos
"Mostra como avaliou o desempenho do modelo e como apresentou os resultados para stakeholders, destacando impacto mensurável ou aprendizados" 3 pontos.
`,
    },
    answerEvaluation: {
      id: 'answerEvaluation',
      name: 'Avaliação de Respostas',
      description: 'Usado para avaliar as respostas de um candidato e gerar um feedback.',
      template: `Você é um avaliador de entrevistas sênior. Analise a transcrição da entrevista para o cargo de {jobTitle} ({jobLevel}). Descrição da vaga: "{jobDescription}". Avalie as respostas do candidato com base nos critérios fornecidos para cada pergunta. Seja crítico e justo. Forneça uma nota de 0 a 10 para cada critério, cada pergunta e uma nota global. Justifique suas notas. Destaque pontos fortes e áreas de melhoria em bullet points. Seja conciso. Transcrição: {interviewTranscript}. Retorne um JSON com "globalGrade", "summary", "strengths", "areasForImprovement" e "questionGrades" (um array com "question", "grade", "justification", e "criterionGrades" [array de "criterion", "grade", "justification"]).`,
    },
    keywordExtraction: {
        id: 'keywordExtraction',
        name: 'Extração de Palavras-chave',
        description: 'Usado para extrair palavras-chave da descrição da vaga para melhorar a precisão da transcrição de áudio.',
        template: `Extraia uma lista de 15 a 20 das palavras-chave técnicas e comportamentais mais importantes da descrição de vaga a seguir. A lista deve ser uma única string de texto, com as palavras separadas por vírgula. Inclua tecnologias, metodologias e habilidades. Descrição da vaga: "{jobDescription}" para o cargo de {jobTitle}.`,
    },
    baselineAnswerGeneration: {
        id: 'baselineAnswerGeneration',
        name: 'Geração de Resposta-Base (p/ Similaridade IA)',
        description: 'Usado para criar uma resposta "ideal" para cada pergunta, que servirá como base de comparação para o cálculo de similaridade.',
        template: `Você é um assistente de IA. Um candidato para a vaga de {jobTitle} pediu sua ajuda. A pergunta da entrevista é: "{question}". Gere uma resposta ideal, bem estruturada e profissional que um candidato poderia usar, como se estivesse tentando impressionar o recrutador. A descrição da vaga é: "{jobDescription}".`,
    },
    originalityEvaluation: {
        id: 'originalityEvaluation',
        name: 'Cálculo de Similaridade IA',
        description: 'Compara a resposta do candidato com a resposta-base gerada pela IA para calcular um score de similaridade.',
        template: `
## SEU PAPEL
Você é um especialista em análise de linguagem forense, treinado para diferenciar conteúdo gerado por humanos de conteúdo gerado por IA em um contexto de entrevista de emprego.

## CONTEXTO
- O candidato foi instruído a usar estruturas narrativas como o método STAR (Situação, Tarefa, Ação, Resultado).
- Portanto, a similaridade na ESTRUTURA da resposta é esperada e NÃO deve, por si só, aumentar o score de similaridade. Sua tarefa é ir além da estrutura.
- A 'Resposta Padrão de IA' é um exemplo de resposta ideal, muitas vezes genérica e sem detalhes específicos.
- A 'Resposta do Candidato' é o que deve ser analisado em busca de sinais de autenticidade.

## AÇÃO
Avalie a 'Resposta do Candidato' com base nos seguintes princípios de autenticidade humana, ignorando a similaridade estrutural:

1.  **Impressão Digital da Especificidade:** A resposta contém detalhes concretos e únicos que seriam difíceis para uma IA genérica inventar (nomes de projetos específicos, métricas precisas, nomes de tecnologias, desafios particulares, sentimentos pessoais)? A presença desses detalhes é um forte indicador de originalidade e deve REDUZIR drasticamente o score.
2.  **Princípio da Realidade Imperfeita:** A narrativa é perfeitamente linear e "limpa", ou reconhece complexidades, conflitos, desvios e resultados imperfeitos? Histórias que parecem um "exemplo de livro" sem os detalhes "confusos" do mundo real são mais suspeitas e devem AUMENTAR o score.
3.  **Assinatura da Emoção e Perspectiva:** A linguagem usada transmite emoção e perspectiva pessoal genuínas (ex: "foi frustrante", "fiquei orgulhoso") ou apenas descreve os eventos de forma factual e neutra? A presença de emoção genuína deve REDUZIR o score.

## OUTPUT
Com base nesta análise forense, forneça um score de 0 a 100, onde 100 significa 'altíssima probabilidade de ter sido gerado por IA devido à falta de autenticidade humana' e 0 significa 'altamente provável de ser uma experiência genuína'. Forneça também uma justificativa detalhada baseada nos princípios acima.

---
Resposta Padrão de IA: "{baselineAnswer}"
---
Resposta do Candidato: "{candidateAnswer}"
---`,
    },
    candidateFeedbackGeneration: {
        id: 'candidateFeedbackGeneration',
        name: 'Geração de Feedback para o Candidato',
        description: 'Cria um feedback personalizado e construtivo para o candidato com base nos resultados da avaliação.',
        template: `
        Você é um especialista em desenvolvimento de talentos e comunicação. Sua tarefa é redigir um feedback para um candidato para a vaga de {jobTitle}.
        O objetivo é fornecer um feedback que seja útil, construtivo, encorajador e específico, sem parecer um e-mail. O texto deve ser impessoal no formato, mas empático no tom.

        **Instruções:**
        1.  **Tom:** Use uma linguagem de apoio e focada em crescimento. Enquadre os pontos de melhoria como "sugestões para desenvolvimento" ou "oportunidades de crescimento". Evite termos que possam ser interpretados como ríspidos ou excessivamente críticos.
        2.  **Formato:** NÃO inclua saudações (como "Olá, [Nome]") nem despedidas (como "Atenciosamente"). O feedback deve ser um texto direto e coeso.
        3.  **Estrutura do Conteúdo:**
            - **Reconhecimento:** Inicie com uma breve frase que valide a performance e o esforço do candidato na entrevista.
            - **Destaques Positivos:** Apresente 2-3 pontos fortes claros, conectando-os diretamente com exemplos ou temas das respostas do candidato para tornar o feedback concreto e personalizado. Use frases como "Foi notável como você..." ou "Sua experiência em... ficou clara quando...".
            - **Sugestões para Desenvolvimento:** Ofereça 1-2 sugestões práticas de melhoria. Explique como o desenvolvimento nessas áreas pode impactar positivamente a carreira do candidato.
            - **Encerramento Encorajador:** Conclua com uma nota positiva, reforçando o potencial do candidato.

        **Contexto da Entrevista (Use para basear o feedback):**
        - **Resumo da Avaliação:** {summary}
        - **Pontos Fortes (Avaliador):** {strengths}
        - **Pontos a Melhorar (Avaliador):** {areasForImprovement}
        - **Transcrição das Respostas:**
        {answersTranscript}

        **Sua Tarefa:**
        Agora, gere o texto final do feedback para este candidato, seguindo todas as instruções acima.
    `,
    },
    cvAnalysis: {
        id: 'cvAnalysis',
        name: 'Análise de Currículo (CV)',
        description: 'Analisa o texto extraído de um CV e o compara com a descrição da vaga para gerar um score de compatibilidade e outros insights.',
        template: `Você é um recrutador sênior especialista em triagem de talentos. Sua tarefa é analisar o currículo de um candidato e compará-lo com a descrição de uma vaga.
        A data de hoje é {currentDate}. Considere esta data ao analisar as experiências.

        **Contexto:**
        - **Vaga:** {jobTitle} ({jobLevel})
        - **Descrição da Vaga:** "{jobDescription}"
        - **Texto do Currículo:** "{cvText}"

        **Sua Análise deve incluir:**
        1.  **Score de Compatibilidade (matchScore):** Uma nota de 0 a 10, com uma casa decimal, representando o quão bem o candidato se encaixa na vaga com base puramente nas informações do CV.
        2.  **Resumo (summary):** Um parágrafo conciso resumindo a adequação do candidato, destacando os principais pontos positivos e negativos.
        3.  **Pontos Fortes (strengths):** Uma lista (bullet points) das experiências, habilidades e qualificações do candidato que estão mais alinhadas com os requisitos da vaga.
        4.  **Pontos Fracos (weaknesses):** Uma lista (bullet points) de requisitos importantes da vaga que parecem estar ausentes ou pouco desenvolvidos no currículo do candidato.
        5.  **Perguntas de Aprofundamento (followUpQuestions):** Primeiro, avalie criticamente se há pontos no CV que genuinamente necessitam de aprofundamento ou esclarecimento. Se houver, gere ATÉ 3 perguntas de aprofundamento. Para CADA pergunta, você DEVE criar 3 critérios de avaliação objetivos, cuja soma dos pontos seja exatamente 10. Se não houver necessidade de perguntas, retorne um array vazio para 'followUpQuestions' e preencha o campo 'analysisJustification' com uma breve explicação (ex: 'O CV é claro e não necessita de esclarecimentos.').

        Seja objetivo e baseie sua análise estritamente nas informações fornecidas. Retorne um JSON.`,
    }
};

interface AppData {
  version: number;
  vacancies: Vacancy[];
  prompts: PromptSettings;
}

// --- FUNÇÕES AUXILIARES DE DADOS ---
const loadData = (): AppData => {
  try {
    const savedDataString = localStorage.getItem(DATA_KEY);
    if (savedDataString) {
      const savedData: AppData = JSON.parse(savedDataString);
      if (savedData.vacancies && savedData.vacancies.length > 0) {
        return {
          ...savedData,
          prompts: { ...defaultPrompts, ...savedData.prompts }
        };
      }
    }
  } catch (e) {
    console.error("Erro ao carregar dados, restaurando para o padrão.", e);
  }
  // Se não houver dados, inicialize com os dados de exemplo
  const initialData = {
    version: CURRENT_DATA_VERSION,
    vacancies: getInitialVacancies(),
    prompts: defaultPrompts,
  };
  localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
  return initialData;
};

const saveData = (data: AppData) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Não foi possível salvar os dados no localStorage", e);
    // Em uma app real, poderíamos mostrar um erro para o usuário aqui.
  }
};


// --- MOCK API ---

export const api = {
  // --- Autenticação ---
  async login(method: 'google' | 'credentials'): Promise<{ success: boolean; error?: string }> {
    await simulateLatency();
    if (method === 'google') {
      return { success: true };
    }
    // Simula falha para login com credenciais
    return { success: false, error: 'Email ou senha inválidos. Tente novamente ou use o login com Google.' };
  },

  // --- Carregamento Inicial ---
  async getInitialData(): Promise<{ vacancies: Vacancy[], prompts: PromptSettings }> {
    await simulateLatency();
    const data = loadData();
    return { vacancies: data.vacancies, prompts: data.prompts };
  },

  // --- Vagas ---
  async saveVacancy(jobDetails: JobDetails, questions: InterviewQuestion[], editingVacancy: Vacancy | null): Promise<Vacancy[]> {
    await simulateLatency();
    const data = loadData();
    let updatedVacancies: Vacancy[];

    if (editingVacancy) {
      updatedVacancies = data.vacancies.map(v =>
        v.id === editingVacancy.id
          ? { ...v, jobDetails, questions }
          : v
      );
    } else {
      const newVacancy: Vacancy = {
        id: `vac_${Date.now()}`,
        jobDetails,
        questions,
        candidates: [],
        status: 'Entrevistando',
        createdAt: new Date().toISOString(),
      };
      updatedVacancies = [...data.vacancies, newVacancy];
    }
    
    saveData({ ...data, vacancies: updatedVacancies });
    return updatedVacancies;
  },
  
  // --- Candidatos ---
  async addCandidatesToVacancy(vacancyId: string, candidates: { name: string }[]): Promise<Vacancy[]> {
    await simulateLatency();
    const data = loadData();
    
    const newCandidates: CandidateResult[] = candidates.map(c => ({
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      candidateName: c.name,
      interviewDate: new Date().toISOString(),
      answers: [],
      checkAnswers: [],
    }));

    const updatedVacancies = data.vacancies.map(v => {
      if (v.id === vacancyId) {
        return {
          ...v,
          candidates: [...v.candidates, ...newCandidates],
        };
      }
      return v;
    });

    saveData({ ...data, vacancies: updatedVacancies });
    return updatedVacancies;
  },
  
  async savePersonalQuestions(vacancyId: string, candidateId: string, questions: BehavioralQuestion[]): Promise<Vacancy[]> {
    await simulateLatency();
    const data = loadData();
    const updatedVacancies = data.vacancies.map(v => {
      if (v.id === vacancyId) {
        const updatedCandidates = v.candidates.map(c => {
          if (c.id === candidateId) {
            return { ...c, personalQuestions: questions };
          }
          return c;
        });
        return { ...v, candidates: updatedCandidates };
      }
      return v;
    });
    saveData({ ...data, vacancies: updatedVacancies });
    return updatedVacancies;
  },

  async saveCandidateResult(vacancyId: string, candidateResult: CandidateResult, interviewScript: InterviewQuestion[]): Promise<{ updatedVacancies: Vacancy[], updatedVacancy: Vacancy | null, updatedCandidate: CandidateResult | null }> {
      await simulateLatency();
      const data = loadData();
      let finalCandidate: CandidateResult | null = null;
      const fullCandidateResult = { ...candidateResult, interviewScript };

      const updatedVacancies = data.vacancies.map(v => {
        if (v.id === vacancyId) {
            const existingCandidateIndex = v.candidates.findIndex(c => c.id === fullCandidateResult.id);
            let newCandidates: CandidateResult[];

            if (existingCandidateIndex > -1) {
                // Atualiza o candidato existente
                newCandidates = [...v.candidates];
                // FIX: Corrected typo from `existingCandidate-index` to `existingCandidateIndex`.
                const updatedCandidate = { ...newCandidates[existingCandidateIndex], ...fullCandidateResult };
                newCandidates[existingCandidateIndex] = updatedCandidate;
                finalCandidate = updatedCandidate;
            } else {
                // Adiciona um novo candidato
                newCandidates = [...(v.candidates || []), fullCandidateResult];
                finalCandidate = fullCandidateResult;
            }
            return { ...v, candidates: newCandidates };
        }
        return v;
      });

      saveData({ ...data, vacancies: updatedVacancies });
      return {
          updatedVacancies,
          updatedVacancy: updatedVacancies.find(v => v.id === vacancyId) || null,
          updatedCandidate: finalCandidate
      };
  },

  // --- Prompts ---
  async savePrompts(prompts: PromptSettings): Promise<PromptSettings> {
    await simulateLatency();
    const data = loadData();
    const updatedData = { ...data, prompts };
    saveData(updatedData);
    return prompts;
  },

  // --- Reavaliação ---
  async updateEvaluation(vacancyId: string, candidateId: string, newEvaluation: any): Promise<{ updatedVacancies: Vacancy[], updatedCandidate: CandidateResult | null }> {
      await simulateLatency();
      const data = loadData();
      let updatedCandidate: CandidateResult | null = null;
      const updatedVacancies = data.vacancies.map(v => {
          if (v.id === vacancyId) {
              const newCandidates = v.candidates.map(c => {
                  if (c.id === candidateId) {
                      updatedCandidate = { ...c, evaluation: newEvaluation };
                      return updatedCandidate;
                  }
                  return c;
              });
              return { ...v, candidates: newCandidates };
          }
          return v;
      });
      saveData({ ...data, vacancies: updatedVacancies });
      return { updatedVacancies, updatedCandidate };
  }
};