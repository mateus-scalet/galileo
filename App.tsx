// FIX: Implemented the main App component to handle view routing, loading, and error states.
import React from 'react';
import { useAppContext } from './contexts/AppContext';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import VacanciesList from './components/VacanciesList';
import JobDetailsForm from './components/JobDetailsForm';
import QuestionReviewScreen from './components/QuestionReviewScreen';
import QuestionEditor from './components/QuestionEditor';
import InstructionsScreen from './components/InstructionsScreen';
import CheckScreen from './components/CheckScreen';
import InterviewScreen from './components/InterviewScreen';
import EvaluationResults from './components/EvaluationResults';
import VacancyResults from './components/VacancyResults';
import SettingsScreen from './components/SettingsScreen';
import AccountScreen from './components/AccountScreen';
import LoadingIcon from './components/icons/LoadingIcon';
import CvUploadScreen from './components/CvUploadScreen';
import CvEvaluationResults from './components/CvEvaluationResults';
import AddCandidateModal from './components/AddCandidateModal';

const App: React.FC = () => {
  const { 
    view, 
    isLoading, 
    loadingText, 
    error, 
    setError,
    currentQuestions,
    currentJobDetails,
    editingVacancy,
    isAddCandidateModalOpen
  } = useAppContext();

  const renderView = () => {
    switch (view) {
      case 'landingPage':
        return <LandingPage />;
      case 'login':
        return <LoginScreen />;
      case 'vacanciesList':
        return <VacanciesList />;
      case 'jobDetailsForm':
        return <JobDetailsForm />;
      case 'questionReview':
        if (currentJobDetails && currentQuestions.length > 0) {
          return <QuestionReviewScreen initialQuestions={currentQuestions} jobDetails={currentJobDetails} />;
        }
        // Fallback to prevent crash if state is inconsistent
        return <VacanciesList />;
      case 'questionEditor':
        if (editingVacancy) {
          return <QuestionEditor initialQuestions={editingVacancy.questions} jobDetails={editingVacancy.jobDetails} isEditing={true} />;
        }
        // Fallback to prevent crash
        return <VacanciesList />;
      case 'instructionsScreen':
        return <InstructionsScreen />;
      case 'check':
        return <CheckScreen />;
      case 'interview':
        return <InterviewScreen />;
      case 'evaluation':
        return <EvaluationResults />;
      case 'cvUpload':
        return <CvUploadScreen />;
      case 'cvEvaluationResults':
        return <CvEvaluationResults />;
      case 'vacancyResults':
        return <VacancyResults />;
      case 'settings':
        return <SettingsScreen />;
      case 'account':
        return <AccountScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fadeIn">
          <LoadingIcon className="w-16 h-16 text-cyan-400" />
          <h2 className="text-2xl font-bold mt-4">{loadingText.title}</h2>
          <p className="text-slate-400 mt-2 max-w-sm text-center">{loadingText.subtitle}</p>
        </div>
      )}
      {error && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setError(null)}>
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md text-center border border-red-500/50" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-red-400 mb-4">Ocorreu um Erro</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      <div className="w-full">
        {renderView()}
      </div>
      {isAddCandidateModalOpen && <AddCandidateModal />}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;