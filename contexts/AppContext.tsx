
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

import {
  JobDetails,
  InterviewQuestion,
  UserAnswer,
  Vacancy,
  CandidateResult,
  PromptSettings,
  View,
  CheckAnswer,
  AppContextType,
  BehavioralQuestion,
} from '../types';

import * as geminiService from '../services/geminiService';
import { api } from '../services/apiService';

// Informa ao TypeScript sobre a biblioteca pdf.js carregada globalmente
declare const pdfjsLib: any;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load
  const [loadingText, setLoadingText] = useState({ title: 'Carregando...', subtitle: 'Preparando a plataforma.' });
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [prompts, setPrompts] = useState<PromptSettings | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const [currentJobDetails, setCurrentJobDetails] = useState<JobDetails | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<InterviewQuestion[]>([]);
  const [currentVacancy, setCurrentVacancy] = useState<Vacancy | null>(null);
  const [currentCandidateName, setCurrentCandidateName] = useState<string>('');
  const [currentCheckAnswers, setCurrentCheckAnswers] = useState<CheckAnswer[]>([]);
  const [currentCandidateForCvAnalysis, setCurrentCandidateForCvAnalysis] = useState<CandidateResult | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [interviewKeywords, setInterviewKeywords] = useState('');
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [currentInterviewScript, setCurrentInterviewScript] = useState<InterviewQuestion[]>([]);

  // --- Refs to hold latest state for callbacks, preventing stale state issues ---
  const appStateRef = useRef({
    vacancies,
    selectedVacancy,
    selectedCandidate,
    currentVacancy,
    currentInterviewScript,
    currentCheckAnswers,
    prompts,
    audioContext,
  });

  useEffect(() => {
    appStateRef.current = {
      vacancies,
      selectedVacancy,
      selectedCandidate,
      currentVacancy,
      currentInterviewScript,
      currentCheckAnswers,
      prompts,
      audioContext,
    };
  }, [
    vacancies,
    selectedVacancy,
    selectedCandidate,
    currentVacancy,
    currentInterviewScript,
    currentCheckAnswers,
    prompts,
    audioContext,
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const { vacancies: initialVacancies, prompts: initialPrompts } = await api.getInitialData();
        setVacancies(initialVacancies);
        setPrompts(initialPrompts);
      } catch (e) {
        console.error('Failed to load initial data', e);
        setError('Ocorreu um erro crítico ao carregar os dados da aplicação.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const savePrompts = useCallback(async (updatedPrompts: PromptSettings) => {
    const savedPrompts = await api.savePrompts(updatedPrompts);
    setPrompts(savedPrompts);
  }, []);

  const handleLogin = useCallback(async (method: 'google' | 'credentials') => {
    setLoginError(null);
    setIsLoading(true);
    const result = await api.login(method);
    if (result.success) {
      setView('vacanciesList');
    } else {
      setLoginError(result.error || 'Falha no login.');
    }
    setIsLoading(false);
  }, []);

  const handleLogout = useCallback(() => setView('login'), []);

  const resetFlowState = useCallback((keepVacancy = false) => {
    setCurrentJobDetails(null);
    setCurrentQuestions([]);
    if (!keepVacancy) {
      setCurrentVacancy(null);
      setSelectedVacancy(null);
    }
    setCurrentCandidateName('');
    setCurrentCheckAnswers([]);
    setEditingVacancy(null);
    setInterviewKeywords('');
    setCurrentCandidateForCvAnalysis(null);
    setSelectedCandidate(null);
    setCurrentInterviewScript([]);

    appStateRef.current.audioContext?.close().catch(console.error);
    setAudioContext(null);
  }, []);

  const goBackToVacancies = useCallback(() => {
    setView('vacanciesList');
    resetFlowState();
  }, [resetFlowState]);

  // ✅ CORREÇÃO: geração de perguntas agora usa BACKEND via apiService
  const handleGenerateQuestions = useCallback(async (details: JobDetails) => {
    setLoadingText({
      title: 'A IA está calibrando as perguntas...',
      subtitle: 'Criando uma entrevista sob medida para encontrar o talento ideal.',
    });
    setIsLoading(true);
    setError(null);

    try {
      const existingCheckQuestions = currentQuestions.filter(q => q.type === 'check');

      const newBehavioralQuestions = await api.generateQuestions(details);

      const combinedQuestions = [...existingCheckQuestions, ...newBehavioralQuestions];

      setCurrentJobDetails(details);
      setCurrentQuestions(combinedQuestions);
      setView('questionReview');
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar perguntas.');
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestions]);

  const handleSaveVacancy = useCallback(async (questions: InterviewQuestion[]) => {
    if (currentJobDetails) {
      const updatedVacancies = await api.saveVacancy(currentJobDetails, questions, editingVacancy);
      setVacancies(updatedVacancies);
      goBackToVacancies();
    }
  }, [currentJobDetails, editingVacancy, goBackToVacancies]);

  const handleStartInterviewFlow = useCallback((vacancyId: string, candidateId: string) => {
    const freshVacancy = appStateRef.current.vacancies.find(v => v.id === vacancyId);
    const freshCandidate = freshVacancy?.candidates.find(c => c.id === candidateId);

    if (freshVacancy && freshCandidate) {
      setSelectedVacancy(freshVacancy);
      setSelectedCandidate(freshCandidate);
      setCurrentVacancy(freshVacancy);
      setView('instructionsScreen');
    } else {
      setError('Não foi possível encontrar os dados da vaga ou do candidato para iniciar a entrevista.');
      console.error(`Could not find vacancyId: ${vacancyId} or candidateId: ${candidateId}`);
    }
  }, []);

  const handleInstructionsComplete = useCallback(async () => {
    const vacancy = appStateRef.current.currentVacancy;
    const candidate = appStateRef.current.selectedCandidate;
    const prompts = appStateRef.current.prompts;
    let context = appStateRef.current.audioContext;

    if (!vacancy || !prompts || !candidate) {
      setError('Não foi possível iniciar a entrevista. O candidato selecionado é inválido.');
      return;
    }

    setCurrentCandidateName(candidate.candidateName);

    setLoadingText({
      title: 'Preparando a entrevista...',
      subtitle: 'Carregando sua oportunidade de brilhar. Boa sorte!',
    });
    setIsLoading(true);
    setError(null);

    try {
      if (context) await context.close();

      context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      // Mantém o comportamento original do app (worklet)
      const workletResponse = await fetch('/audioProcessor.js');
      if (!workletResponse.ok) throw new Error(`Failed to fetch audio processor script: ${workletResponse.statusText}`);
      const workletScript = await workletResponse.text();
      const workletBlob = new Blob([workletScript], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(workletBlob);
      await context.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      setAudioContext(context);

      const keywords = await geminiService.extractKeywordsFromJobDescription(vacancy.jobDetails, prompts.keywordExtraction.template);
      setInterviewKeywords(keywords);

      const checkQuestions = vacancy.questions.filter(q => q.type === 'check');
      const standardQuestions = vacancy.questions.filter(q => q.type === 'behavioral');
      const personalQuestions = candidate.personalQuestions || [];

      const interviewScript = [...checkQuestions, ...personalQuestions, ...standardQuestions];
      setCurrentInterviewScript(interviewScript);

      const hasCheckQuestions = interviewScript.some(q => q.type === 'check');
      setView(hasCheckQuestions ? 'check' : 'interview');
    } catch (e: any) {
      setError('Ocorreu um erro interno ao configurar o áudio. Tente recarregar a página.');
      console.error('Falha ao preparar o ambiente de áudio:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCheckComplete = useCallback((answers: CheckAnswer[]) => {
    setCurrentCheckAnswers(answers);
    setView('interview');
  }, []);

  const handleMicCheckComplete = useCallback(() => {
    const vacancy = appStateRef.current.currentVacancy;
    const candidate = appStateRef.current.selectedCandidate;

    if (!vacancy || !candidate) {
      goBackToVacancies();
      return;
    }

    const interviewScript = [...(vacancy.questions || []), ...(candidate.personalQuestions || [])];
    const hasCheckQuestions = interviewScript.some(q => q.type === 'check');
    setView(hasCheckQuestions ? 'check' : 'interview');
  }, [goBackToVacancies]);

  const handleInterviewComplete = useCallback(async (answers: UserAnswer[]) => {
    const vacancy = appStateRef.current.currentVacancy;
    const candidate = appStateRef.current.selectedCandidate;
    const prompts = appStateRef.current.prompts;
    const interviewScript = appStateRef.current.currentInterviewScript;
    const checkAnswers = appStateRef.current.currentCheckAnswers;

    if (!vacancy || !prompts || !candidate) return;

    setLoadingText({
      title: 'Avaliando suas respostas...',
      subtitle: 'Nossos algoritmos estão analisando cada detalhe. Isso pode levar alguns minutos.',
    });
    setIsLoading(true);
    setError(null);

    try {
      const evaluation = await geminiService.evaluateAnswers(
        vacancy.jobDetails,
        interviewScript,
        answers,
        prompts.answerEvaluation.template,
        prompts.originalityEvaluation.template,
        prompts.candidateFeedbackGeneration.template
      );

      const latestCandidateFromState = appStateRef.current.vacancies
        .find(v => v.id === vacancy.id)?.candidates
        .find(c => c.id === candidate.id);

      const candidateData: CandidateResult = {
        ...(latestCandidateFromState || candidate),
        answers,
        checkAnswers,
        evaluation,
      };

      const { updatedVacancies, updatedVacancy, updatedCandidate } = await api.saveCandidateResult(
        vacancy.id,
        candidateData,
        interviewScript
      );

      setVacancies(updatedVacancies);
      setSelectedVacancy(updatedVacancy);
      setSelectedCandidate(updatedCandidate);
      setView('evaluation');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReevaluate = useCallback(async () => {
    const vacancy = appStateRef.current.selectedVacancy;
    const candidate = appStateRef.current.selectedCandidate;
    const prompts = appStateRef.current.prompts;

    if (!vacancy || !candidate || !prompts) return;

    const reevaluationScript = candidate.interviewScript || [...(vacancy.questions || []), ...(candidate.personalQuestions || [])];

    setLoadingText({ title: 'Reavaliando com a IA...', subtitle: 'Um novo olhar sobre as respostas para garantir a máxima precisão.' });
    setIsLoading(true);
    setError(null);

    try {
      const newEvaluation = await geminiService.evaluateAnswers(
        vacancy.jobDetails,
        reevaluationScript,
        candidate.answers,
        prompts.answerEvaluation.template,
        prompts.originalityEvaluation.template,
        prompts.candidateFeedbackGeneration.template
      );

      const { updatedVacancies, updatedCandidate } = await api.updateEvaluation(vacancy.id, candidate.id, newEvaluation);
      setVacancies(updatedVacancies);
      setSelectedCandidate(updatedCandidate);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEditVacancy = useCallback((vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setCurrentJobDetails(vacancy.jobDetails);
    setCurrentQuestions(vacancy.questions);
    setView('questionEditor');
  }, []);

  const handleViewVacancyResults = useCallback((vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setView('vacancyResults');
  }, []);

  const handleStartCvAnalysisFlow = useCallback((vacancy: Vacancy, candidate?: CandidateResult) => {
    setSelectedVacancy(vacancy);
    if (!candidate) {
      setError('Candidato não encontrado para análise de CV.');
      return;
    }
    setCurrentCandidateForCvAnalysis(candidate);
    setView('cvUpload');
  }, []);

  const handleCvAnalysis = useCallback(async (cvFile: File, candidate: CandidateResult) => {
    const vacancy = appStateRef.current.selectedVacancy;
    const prompts = appStateRef.current.prompts;

    if (!vacancy || !prompts) return;

    if (!candidate.candidateName) {
      setError('O nome do candidato não foi definido. Por favor, reinicie o processo.');
      setIsLoading(false);
      return;
    }

    setLoadingText({ title: 'Lendo nas entrelinhas...', subtitle: 'Nossa IA está cruzando dados e decifrando talentos a partir da inteligência.' });
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await cvFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
      }

      const cvText = fullText.trim();
      if (!cvText) throw new Error('Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem ou estar vazio.');

      const currentDate = new Date().toLocaleDateString('pt-BR');
      const cvEvaluation = await geminiService.analyzeCv(vacancy.jobDetails, cvText, prompts.cvAnalysis.template, currentDate);

      const updatedCandidateData = { ...candidate, cvEvaluation };
      const { updatedVacancies, updatedVacancy, updatedCandidate } = await api.saveCandidateResult(
        vacancy.id,
        updatedCandidateData,
        updatedCandidateData.interviewScript || []
      );

      setVacancies(updatedVacancies);
      setSelectedVacancy(updatedVacancy);
      setSelectedCandidate(updatedCandidate);
      setView('cvEvaluationResults');
    } catch (e: any) {
      setError(e.message || 'Não foi possível analisar o CV. O arquivo pode estar corrompido ou em um formato inesperado.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddCandidates = useCallback(async (candidates: { name: string; cvFile?: File | null }[]) => {
    const vacancy = appStateRef.current.selectedVacancy;
    if (!vacancy) return;

    const candidateWithCv = candidates.find(c => c.cvFile);
    setLoadingText({ title: 'Processando...', subtitle: 'Aguarde um momento.' });
    setIsLoading(true);

    try {
      const candidatesToAdd = candidates.map(c => ({ name: c.name }));
      const updatedVacancies = await api.addCandidatesToVacancy(vacancy.id, candidatesToAdd);

      const updatedVacancy = updatedVacancies.find(v => v.id === vacancy.id);
      if (!updatedVacancy) throw new Error('A vaga não foi encontrada após a atualização.');

      setVacancies(updatedVacancies);
      setSelectedVacancy(updatedVacancy);

      if (candidateWithCv?.cvFile) {
        const newCandidate = updatedVacancy.candidates.find(c => c.candidateName === candidateWithCv.name && !c.cvEvaluation);
        if (newCandidate) {
          setIsAddCandidateModalOpen(false);
          await handleCvAnalysis(candidateWithCv.cvFile, newCandidate);
        } else {
          throw new Error('Não foi possível encontrar o candidato recém-criado para iniciar a análise.');
        }
      } else {
        setIsLoading(false);
        setIsAddCandidateModalOpen(false);
      }
    } catch (e: any) {
      setError(e.message || 'Falha ao adicionar candidatos.');
      setIsLoading(false);
      setIsAddCandidateModalOpen(false);
    }
  }, [handleCvAnalysis]);

  const handleSavePersonalQuestions = useCallback(async (candidateId: string, questions: BehavioralQuestion[]) => {
    const vacancy = appStateRef.current.selectedVacancy;
    if (!vacancy) return;

    const updatedVacancies = await api.savePersonalQuestions(vacancy.id, candidateId, questions);
    setVacancies(updatedVacancies);

    const updatedVacancy = updatedVacancies.find(v => v.id === vacancy.id);
    const updatedCandidate = updatedVacancy?.candidates.find(c => c.id === candidateId);

    if (updatedVacancy) setSelectedVacancy(updatedVacancy);
    if (updatedCandidate) setSelectedCandidate(updatedCandidate);
  }, []);

  const value: AppContextType = {
    // State
    view,
    isLoading,
    loadingText,
    error,
    loginError,
    vacancies,
    prompts,
    currentJobDetails,
    currentQuestions,
    currentVacancy,
    currentCandidateName,
    selectedVacancy,
    selectedCandidate,
    editingVacancy,
    interviewKeywords,
    currentCandidateForCvAnalysis,
    audioContext,
    isAddCandidateModalOpen,
    currentInterviewScript,

    // Setters
    setView,
    setError,
    setAudioContext,
    setIsAddCandidateModalOpen,

    // Actions
    handleLogin,
    handleLogout,
    handleGenerateQuestions,
    handleSaveVacancy,
    handleStartInterviewFlow,
    handleInstructionsComplete,
    handleCheckComplete,
    handleInterviewComplete,
    handleReevaluate,
    handleEditVacancy,
    handleViewVacancyResults,
    savePrompts,
    goBackToVacancies,
    setSelectedCandidate,
    resetFlowState,
    handleStartCvAnalysisFlow,
    handleCvAnalysis,
    handleAddCandidates,
    handleSavePersonalQuestions,
    handleMicCheckComplete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppContextProvider');
  }
  return context;
};
