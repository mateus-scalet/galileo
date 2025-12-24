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

import { api } from '../services/apiService';

declare const pdfjsLib: any;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState({
    title: 'Carregando...',
    subtitle: 'Preparando a plataforma.',
  });
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [prompts, setPrompts] = useState<PromptSettings | null>(null);

  const [currentJobDetails, setCurrentJobDetails] = useState<JobDetails | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<InterviewQuestion[]>([]);
  const [currentVacancy, setCurrentVacancy] = useState<Vacancy | null>(null);
  const [currentCandidateName, setCurrentCandidateName] = useState('');
  const [currentCheckAnswers, setCurrentCheckAnswers] = useState<CheckAnswer[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [currentInterviewScript, setCurrentInterviewScript] = useState<InterviewQuestion[]>([]);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [currentCandidateForCvAnalysis, setCurrentCandidateForCvAnalysis] =
    useState<CandidateResult | null>(null);

  const appStateRef = useRef({
    vacancies,
    selectedVacancy,
    selectedCandidate,
    currentVacancy,
    currentInterviewScript,
    currentCheckAnswers,
  });

  useEffect(() => {
    appStateRef.current = {
      vacancies,
      selectedVacancy,
      selectedCandidate,
      currentVacancy,
      currentInterviewScript,
      currentCheckAnswers,
    };
  }, [
    vacancies,
    selectedVacancy,
    selectedCandidate,
    currentVacancy,
    currentInterviewScript,
    currentCheckAnswers,
  ]);

  // 🔹 Load inicial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { vacancies, prompts } = await api.getInitialData();
        setVacancies(vacancies);
        setPrompts(prompts);
      } catch {
        setError('Erro ao carregar dados iniciais.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // 🔹 Auth
  const handleLogin = useCallback(async (method: 'google' | 'credentials') => {
    setIsLoading(true);
    const result = await api.login(method);
    if (result.success) setView('vacanciesList');
    else setLoginError(result.error || 'Falha no login');
    setIsLoading(false);
  }, []);

  const handleLogout = useCallback(() => setView('login'), []);

  // 🔹 Vagas
  const handleGenerateQuestions = useCallback(async (details: JobDetails) => {
    setIsLoading(true);
    try {
      const questions = await api.generateQuestions(details);
      setCurrentJobDetails(details);
      setCurrentQuestions(questions);
      setView('questionReview');
    } catch {
      setError('Erro ao gerar perguntas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveVacancy = useCallback(
    async (questions: InterviewQuestion[]) => {
      if (!currentJobDetails) return;
      const updated = await api.saveVacancy(currentJobDetails, questions, editingVacancy);
      setVacancies(updated);
      setView('vacanciesList');
    },
    [currentJobDetails, editingVacancy]
  );

  // 🔹 Entrevista
  const handleStartInterviewFlow = useCallback((vacancyId: string, candidateId: string) => {
    const vacancy = vacancies.find(v => v.id === vacancyId);
    const candidate = vacancy?.candidates.find(c => c.id === candidateId);
    if (!vacancy || !candidate) {
      setError('Vaga ou candidato não encontrado.');
      return;
    }
    setSelectedVacancy(vacancy);
    setSelectedCandidate(candidate);
    setCurrentVacancy(vacancy);
    setView('instructionsScreen');
  }, [vacancies]);

  const handleInterviewComplete = useCallback(async (answers: UserAnswer[]) => {
    const vacancy = appStateRef.current.currentVacancy;
    const candidate = appStateRef.current.selectedCandidate;
    if (!vacancy || !candidate) return;

    setIsLoading(true);
    try {
      const evaluation = await api.evaluateInterview({
        vacancy,
        candidate,
        answers,
      });

      const { updatedVacancies, updatedCandidate } =
        await api.saveCandidateResult(
          vacancy.id,
          { ...candidate, answers, evaluation },
          appStateRef.current.currentInterviewScript
        );

      setVacancies(updatedVacancies);
      setSelectedCandidate(updatedCandidate);
      setView('evaluation');
    } catch {
      setError('Erro ao avaliar entrevista.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 CV
  const handleCvAnalysis = useCallback(async (cvFile: File, candidate: CandidateResult) => {
    const vacancy = selectedVacancy;
    if (!vacancy) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await cvFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((i: any) => i.str).join(' ');
      }

      const cvEvaluation = await api.analyzeCv({
        vacancy,
        candidate,
        cvText: text,
      });

      const { updatedVacancies, updatedCandidate } =
        await api.saveCandidateResult(
          vacancy.id,
          { ...candidate, cvEvaluation },
          []
        );

      setVacancies(updatedVacancies);
      setSelectedCandidate(updatedCandidate);
      setView('cvEvaluationResults');
    } catch {
      setError('Erro ao analisar CV.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedVacancy]);

  const value: AppContextType = {
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
    selectedVacancy,
    selectedCandidate,
    editingVacancy,
    currentInterviewScript,
    currentCandidateForCvAnalysis,
    isAddCandidateModalOpen,
    setView,
    setError,
    handleLogin,
    handleLogout,
    handleGenerateQuestions,
    handleSaveVacancy,
    handleStartInterviewFlow,
    handleInterviewComplete,
    handleCvAnalysis,
    setIsAddCandidateModalOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext fora do provider');
  return ctx;
};
