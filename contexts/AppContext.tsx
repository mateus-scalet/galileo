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
  EvaluationResult
} from '../types';

import { api } from '../services/apiService';

// pdf.js global
declare const pdfjsLib: any;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState({ title: '', subtitle: '' });
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [prompts, setPrompts] = useState<PromptSettings | null>(null);

  const [currentVacancy, setCurrentVacancy] = useState<Vacancy | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [currentInterviewScript, setCurrentInterviewScript] = useState<InterviewQuestion[]>([]);
  const [currentCheckAnswers, setCurrentCheckAnswers] = useState<CheckAnswer[]>([]);

  const appRef = useRef<any>({});

  useEffect(() => {
    appRef.current = {
      vacancies,
      currentVacancy,
      selectedCandidate,
      currentInterviewScript,
      currentCheckAnswers,
    };
  }, [
    vacancies,
    currentVacancy,
    selectedCandidate,
    currentInterviewScript,
    currentCheckAnswers,
  ]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  /* ======================================================
     🧠 AVALIAÇÃO DA ENTREVISTA (BACKEND)
  ====================================================== */
  const handleInterviewComplete = useCallback(
    async (answers: UserAnswer[]) => {
      const vacancy: Vacancy | null = appRef.current.currentVacancy;
      const candidate: CandidateResult | null = appRef.current.selectedCandidate;
      const interviewScript: InterviewQuestion[] =
        appRef.current.currentInterviewScript;

      if (!vacancy || !candidate) {
        console.warn('handleInterviewComplete chamado sem vacancy ou candidate');
        return;
      }

      setLoadingText({
        title: 'Avaliando respostas...',
        subtitle: 'A IA está analisando a entrevista.',
      });
      setIsLoading(true);
      setError(null);

      try {
        // 👉 100% BACKEND
        const evaluation: EvaluationResult = await api.evaluateInterview({
          jobDetails: vacancy.jobDetails,
          interviewScript,
          answers,
        });

        const { updatedVacancies, updatedCandidate } =
          await api.saveCandidateResult(
            vacancy.id,
            {
              ...candidate,
              answers,
              checkAnswers: appRef.current.currentCheckAnswers,
              evaluation,
            },
            interviewScript
          );

        setVacancies(updatedVacancies);
        setSelectedCandidate(updatedCandidate);
        setView('evaluation');
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Erro ao avaliar entrevista.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const value: AppContextType = {
    view,
    isLoading,
    loadingText,
    error,
    loginError,
    vacancies,
    prompts,
    currentVacancy,
    selectedVacancy,
    selectedCandidate,
    currentInterviewScript,

    setView,
    setError,
    setSelectedCandidate,

    handleInterviewComplete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext fora do provider');
  return ctx;
};
