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
Você é um gerente de RH com ampla experiência em recrutamento e condução de entrevistas.

CONTEXTO
Você deve entrevistar candidatos para o cargo de {jobTitle}, de nível {jobLevel}.
Descrição da vaga:
{jobDescription}

TAREFA
Crie {numQuestions} perguntas de entrevista específicas para o cargo de {jobTitle}.
O foco da entrevista deve ser {biasDescription}.
As perguntas devem estar diretamente relacionadas às responsabilidades e requisitos do cargo.
Cada pergunta deve solicitar que o candidato descreva uma situação real em que demonstrou uma habilidade, conhecimento ou comportamento relevante.

Para cada pergunta, gere também:
- 3 critérios de avaliação claros, objetivos e mensuráveis.
- A pontuação total dos critérios deve somar exatamente 10 pontos.
- Cada critério deve especificar o que o candidato precisa demonstrar.

REGRAS DE SAÍDA (OBRIGATÓRIO)
1) Retorne APENAS JSON válido (um único objeto). Nada antes e nada depois.
2) NÃO use markdown. NÃO use blocos \`\`\` (nem \`\`\`json).
3) Siga exatamente o schema abaixo (sem campos extras).

SCHEMA
{
  "questions": [
    {
      "question": string,
      "criteria": [
        { "text": string, "points": number }
      ]
    }
  ]
}

VALIDAÇÕES
- "questions" deve ter exatamente {numQuestions} itens.
- Cada "criteria" deve ter exatamente 3 itens.
- A soma de "points" dos 3 critérios deve ser exatamente 10.

Responda somente com o JSON.`
  },

  answerEvaluation: {
    id: 'answerEvaluation',
    name: 'Avaliação de Respostas',
    description: 'Usado para avaliar as respostas de um candidato e gerar um feedback.',
    template: `
Você é um avaliador de entrevistas sênior.

CONTEXTO
Cargo: {jobTitle} ({jobLevel})
Descrição da vaga: {jobDescription}

TRANSCRIÇÃO (perguntas, critérios e respostas do candidato):
{interviewTranscript}

TAREFA
Avalie as respostas do candidato com base nos critérios fornecidos para cada pergunta. Seja crítico e justo.
Forneça:
- Nota global (0 a 10) com 1 casa decimal
- Resumo curto (2–4 frases)
- Pontos fortes e áreas de melhoria como LISTAS (arrays)
- Para cada pergunta: nota (0 a 10) e justificativa
- Para cada critério: nota (0 a 10) e justificativa

REGRAS DE SAÍDA (OBRIGATÓRIO)
1) Retorne APENAS JSON válido (um único objeto). Nada antes e nada depois.
2) NÃO use markdown. NÃO use \`\`\` (nem \`\`\`json).
3) "strengths" e "areasForImprovement" DEVEM ser arrays de strings (não texto com bullets).
4) Siga exatamente o schema abaixo (sem campos extras).

SCHEMA
{
  "globalGrade": number,
  "summary": string,
  "strengths": string[],
  "areasForImprovement": string[],
  "questionGrades": [
    {
      "question": string,
      "grade": number,
      "justification": string,
      "criterionGrades": [
        { "criterion": string, "grade": number, "justification": string }
      ]
    }
  ]
}

Responda somente com o JSON.`
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
    template: `
Você é um recrutador sênior especialista em triagem de talentos.

Contexto da vaga:
- Cargo: {jobTitle}
- Nível: {jobLevel}
- Descrição da vaga: {jobDescription}
- Data atual: {currentDate}

Currículo (texto extraído):
{cvText}

REGRAS DE SAÍDA (OBRIGATÓRIO)
1) Retorne APENAS um JSON válido (um único objeto). Nada antes e nada depois.
2) NÃO use markdown. NÃO use blocos \`\`\` (nem \`\`\`json).
3) Use EXATAMENTE o schema abaixo. NÃO adicione campos extras.
4) "strengths" e "weaknesses" DEVEM ser ARRAYS de strings (não texto com bullets).
5) Cada string em strengths/weaknesses deve ser uma frase curta, sem quebras de linha.

SCHEMA (campos obrigatórios)
{
  "matchScore": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "analysisJustification": string,
  "followUpQuestions": [
    {
      "question": string,
      "criteria": [
        { "text": string, "points": number }
      ]
    }
  ]
}

REGRAS DE CONTEÚDO
- matchScore: 0.0 a 10.0 (pode ter decimal).
- summary: 2 a 5 frases em PT-BR.
- strengths: 3 a 6 itens, específicos (skills, tecnologias, escopo).
- weaknesses: 3 a 6 itens, específicos (gaps vs requisitos).
- followUpQuestions:
  - Gere ATÉ 3 perguntas SOMENTE se houver lacunas críticas ou ambiguidade relevante.
  - Para cada pergunta: exatamente 3 critérios; soma de points = 10.
  - Se não houver necessidade de perguntas, retorne [] e explique o motivo em analysisJustification.

CHECKLIST FINAL
- JSON parseável?
- Sem markdown e sem \`\`\`?
- strengths/weaknesses são arrays?
- followUpQuestions segue schema?

Responda SOMENTE com o JSON.`
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

  async saveCandidateResult(
    vacancyId: string,
    candidateResult: CandidateResult,
    interviewScript: InterviewQuestion[]
  ): Promise<{ updatedVacancies: Vacancy[], updatedVacancy: Vacancy | null, updatedCandidate: CandidateResult | null }> {
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
  async updateEvaluation(
    vacancyId: string,
    candidateId: string,
    newEvaluation: any
  ): Promise<{ updatedVacancies: Vacancy[], updatedCandidate: CandidateResult | null }> {
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
