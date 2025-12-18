// FIX: Define all necessary types for the application.
import type { Dispatch, SetStateAction } from 'react';

export interface Criterion {
  text: string;
  points: number;
}

export interface BehavioralQuestion {
  type: 'behavioral';
  question: string;
  criteria: Criterion[];
  baselineAnswer?: string;
}

export interface CheckQuestion {
  type: 'check';
  question: string;
  expectedAnswer: 'yes' | 'no';
}

export type InterviewQuestion = BehavioralQuestion | CheckQuestion;


export interface JobDetails {
  title: string;
  level: string;
  description: string;
  numQuestions: number;
  bias: number; // 0-4 scale: technical -> balanced -> behavioral
}

export interface UserAnswer {
  question: string;
  answer: string;
}

export interface CheckAnswer {
  question: string;
  answer: 'yes' | 'no';
}

export interface QuestionGrade {
  question: string;
  grade: number;
  justification: string;
  criterionGrades: {
    criterion: string;
    grade: number;
    justification: string;
  }[];
  originalityScore?: number;
  originalityJustification?: string;
}

export interface EvaluationResult {
  globalGrade: number;
  summary: string;
  strengths: string;
  areasForImprovement: string;
  questionGrades: QuestionGrade[];
  candidateFeedback?: string;
}

export interface CvEvaluationResult {
    matchScore: number;
    summary: string;
    strengths: string;
    weaknesses: string;
    followUpQuestions: BehavioralQuestion[];
    analysisJustification?: string;
}

export interface CandidateResult {
  id: string;
  candidateName: string;
  interviewDate: string;
  answers: UserAnswer[];
  checkAnswers: CheckAnswer[];
  evaluation?: EvaluationResult;
  cvEvaluation?: CvEvaluationResult;
  personalQuestions?: BehavioralQuestion[];
  interviewScript?: InterviewQuestion[];
}

export interface Vacancy {
  id: string;
  jobDetails: JobDetails;
  questions: InterviewQuestion[];
  candidates: CandidateResult[];
  status: 'Entrevistando' | 'Pausado' | 'Fechado';
  createdAt: string;
}

export interface Prompt {
  id: 'questionGeneration' | 'answerEvaluation' | 'keywordExtraction' | 'baselineAnswerGeneration' | 'originalityEvaluation' | 'candidateFeedbackGeneration' | 'cvAnalysis';
  name: string;
  description: string;
  template: string;
}

export interface PromptSettings {
  questionGeneration: Prompt;
  answerEvaluation: Prompt;
  keywordExtraction: Prompt;
  baselineAnswerGeneration: Prompt;
  originalityEvaluation: Prompt;
  candidateFeedbackGeneration: Prompt;
  cvAnalysis: Prompt;
}

export type View = 
  | 'landingPage'
  | 'login'
  | 'vacanciesList'
  | 'jobDetailsForm'
  | 'questionReview' // Nova view para a curadoria da IA
  | 'questionEditor'
  | 'instructionsScreen'
  | 'check'
  | 'interview'
  | 'evaluation'
  | 'vacancyResults'
  | 'settings'
  | 'account'
  | 'cvUpload'
  | 'cvEvaluationResults';

export interface AppContextType {
  // State
  view: View;
  isLoading: boolean;
  loadingText: { title: string; subtitle: string };
  error: string | null;
  loginError: string | null;
  vacancies: Vacancy[];
  prompts: PromptSettings | null;
  currentJobDetails: JobDetails | null;
  currentQuestions: InterviewQuestion[];
  currentVacancy: Vacancy | null;
  currentCandidateName: string;
  selectedVacancy: Vacancy | null;
  selectedCandidate: CandidateResult | null;
  editingVacancy: Vacancy | null;
  interviewKeywords: string;
  currentCandidateForCvAnalysis: CandidateResult | null;
  audioContext: AudioContext | null;
  isAddCandidateModalOpen: boolean;
  currentInterviewScript: InterviewQuestion[];

  // Actions
  setView: Dispatch<SetStateAction<View>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setAudioContext: Dispatch<SetStateAction<AudioContext | null>>;
  setIsAddCandidateModalOpen: Dispatch<SetStateAction<boolean>>;
  handleLogin: (method: 'google' | 'credentials') => Promise<void>;
  handleLogout: () => void;
  handleGenerateQuestions: (details: JobDetails) => Promise<void>;
  handleSaveVacancy: (questions: InterviewQuestion[]) => Promise<void>;
  handleStartInterviewFlow: (vacancyId: string, candidateId: string) => void;
  handleInstructionsComplete: () => Promise<void>;
  handleCheckComplete: (answers: CheckAnswer[]) => void;
  handleInterviewComplete: (answers: UserAnswer[]) => Promise<void>;
  handleReevaluate: () => Promise<void>;
  handleEditVacancy: (vacancy: Vacancy) => void;
  handleViewVacancyResults: (vacancy: Vacancy) => void;
  savePrompts: (updatedPrompts: PromptSettings) => Promise<void>;
  goBackToVacancies: () => void;
  setSelectedCandidate: (candidate: CandidateResult | null) => void;
  resetFlowState: (keepVacancy?: boolean) => void;
  handleStartCvAnalysisFlow: (vacancy: Vacancy, candidate?: CandidateResult) => void;
  handleCvAnalysis: (cvFile: File, candidate: CandidateResult) => Promise<void>;
  handleAddCandidates: (candidates: { name: string, cvFile?: File | null }[]) => Promise<void>;
  handleSavePersonalQuestions: (candidateId: string, questions: BehavioralQuestion[]) => Promise<void>;
  // FIX: Added handleMicCheckComplete to satisfy the MicCheckScreen component.
  handleMicCheckComplete: () => void;
}