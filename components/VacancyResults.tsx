import React from 'react';
import { CandidateResult, CheckQuestion } from '../types';
import { useAppContext } from '../contexts/AppContext';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationIcon from './icons/ExclamationIcon';
import OriginalityIndicator from './OriginalityIndicator';
import UserPlusIcon from './icons/UserPlusIcon';

const VacancyResults: React.FC = () => {
  const { 
    selectedVacancy: vacancy, 
    goBackToVacancies, 
    setSelectedCandidate, 
    setView,
    handleStartCvAnalysisFlow,
    setIsAddCandidateModalOpen,
    handleStartInterviewFlow
  } = useAppContext();
  
  if (!vacancy) {
    return null; // Or some fallback UI
  }

  const sortedCandidates = [...(vacancy.candidates || [])].sort((a, b) => {
    const scoreA = a.evaluation?.globalGrade ?? a.cvEvaluation?.matchScore ?? -1;
    const scoreB = b.evaluation?.globalGrade ?? b.cvEvaluation?.matchScore ?? -1;
    if (scoreB === scoreA) {
      return new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime();
    }
    return scoreB - scoreA;
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-400';
    if (grade >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
  }

  const handleViewCvDetails = (candidate: CandidateResult) => {
    setSelectedCandidate(candidate);
    setView('cvEvaluationResults');
  };

  const handleViewInterviewDetails = (candidate: CandidateResult) => {
    setSelectedCandidate(candidate);
    setView('evaluation');
  };

  const checkQuestions = vacancy.questions.filter((q): q is CheckQuestion => q.type === 'check');

  const getCheckStatus = (candidate: CandidateResult) => {
    if (checkQuestions.length === 0 || !candidate.checkAnswers || candidate.checkAnswers.length === 0) {
      return null;
    }
    const allPassed = checkQuestions.every(q => {
      const answer = candidate.checkAnswers.find(a => a.question === q.question);
      return answer?.answer === q.expectedAnswer;
    });
    return allPassed;
  }
  
  const getAverageOriginality = (candidate: CandidateResult): number | null => {
      if (!candidate.evaluation?.questionGrades || candidate.evaluation.questionGrades.length === 0) {
          return null;
      }
      const scores = candidate.evaluation.questionGrades
          .map(q => q.originalityScore)
          .filter((s): s is number => typeof s === 'number');
          
      if (scores.length === 0) return null;

      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return Math.round(avg);
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel da Vaga</h1>
          <p className="text-cyan-400 text-lg font-semibold">
            {vacancy.jobDetails.title} - {vacancy.jobDetails.level}
          </p>
        </div>
      </div>
       <p className="text-slate-400 mb-8 text-left">
        Acompanhe o ranking dos candidatos e analise o desempenho detalhado de cada um.
      </p>
      
      {sortedCandidates.length === 0 ? (
        <div className="text-center bg-slate-900/50 p-10 rounded-lg">
          <h2 className="text-xl font-semibold text-white">Nenhum candidato adicionado.</h2>
          <p className="text-slate-400 mt-2">Clique em "Novo Candidato" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 px-4 py-2 uppercase tracking-wider border-b border-slate-700">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Candidato</div>
            <div className="col-span-2 text-center">Análise CV</div>
            <div className="col-span-2 text-center">Entrevista</div>
            <div className="col-span-3 text-center">Ações</div>
          </div>
          
          {sortedCandidates.map((candidate, index) => {
            const checkStatus = getCheckStatus(candidate);
            const avgOriginality = getAverageOriginality(candidate);
            return (
              <div 
                key={candidate.id} 
                className="grid grid-cols-12 gap-4 items-center bg-slate-900/50 p-4 rounded-lg"
              >
                {/* Rank */}
                <div className="col-span-1 text-center font-bold text-2xl text-slate-400">{index + 1}</div>
                
                {/* Candidate Info */}
                <div className="col-span-11 md:col-span-4 flex flex-col">
                  <div className="font-semibold text-white truncate flex items-center gap-2">
                    <span>{candidate.candidateName}</span>
                    {checkStatus === true && (
                      <div className="group relative">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <div className="absolute bottom-full mb-2 -ml-16 w-max p-2 bg-slate-950 text-slate-300 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Pré-requisitos atendidos
                        </div>
                      </div>
                    )}
                    {checkStatus === false && (
                       <div className="group relative">
                        <ExclamationIcon className="w-5 h-5 text-yellow-500" />
                         <div className="absolute bottom-full mb-2 -ml-24 w-max p-2 bg-slate-950 text-slate-300 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Atenção: Pré-requisitos não atendidos
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(candidate.interviewDate)}</span>
                </div>

                {/* CV Grade */}
                <div className="col-span-6 md:col-span-2 flex items-center justify-center">
                    {candidate.cvEvaluation ? (
                        <div className={`text-3xl font-bold ${getGradeColor(candidate.cvEvaluation.matchScore)}`}>
                            {candidate.cvEvaluation.matchScore.toFixed(1)}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-500">-</span>
                    )}
                </div>

                {/* Interview Grade */}
                <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-3">
                     {candidate.evaluation ? (
                         <>
                            <div className={`text-3xl font-bold ${getGradeColor(candidate.evaluation.globalGrade)}`}>
                                {candidate.evaluation.globalGrade.toFixed(1)}
                            </div>
                            {typeof avgOriginality === 'number' && (
                                <OriginalityIndicator score={avgOriginality} justification="Média da similaridade com respostas geradas por IA em todas as perguntas." size="small" />
                            )}
                         </>
                    ) : <span className="text-sm text-slate-500">-</span>}
                </div>
                
                {/* Actions */}
                <div className="col-span-12 md:col-span-3 flex items-center justify-center gap-2 flex-wrap">
                    {candidate.cvEvaluation ? (
                      <button onClick={() => handleViewCvDetails(candidate)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md transition-all text-xs">
                        Ver Análise CV
                      </button>
                    ) : (
                      <button onClick={() => handleStartCvAnalysisFlow(vacancy, candidate)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md transition-all text-xs">
                        Analisar CV
                      </button>
                    )}

                    {candidate.evaluation ? (
                        <button onClick={() => handleViewInterviewDetails(candidate)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md transition-all text-xs">
                          Ver Entrevista
                        </button>
                    ) : (
                        <button onClick={() => handleStartInterviewFlow(vacancy.id, candidate.id)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-3 rounded-md transition-all text-xs">
                          Iniciar Entrevista
                        </button>
                    )}
                </div>

              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
         <button
          onClick={goBackToVacancies}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          Voltar para Lista de Vagas
        </button>
        <button
          onClick={() => setIsAddCandidateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          <UserPlusIcon className="w-5 h-5" />
          Novo Candidato
        </button>
      </div>
    </div>
  );
};

export default VacancyResults;