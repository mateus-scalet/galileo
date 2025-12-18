import React, { useState } from 'react';
import { CandidateResult, Vacancy, QuestionGrade, CheckQuestion } from '../types';
import RefreshIcon from './icons/RefreshIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { useAppContext } from '../contexts/AppContext';
import OriginalityIndicator from './OriginalityIndicator';


const EvaluationResults: React.FC = () => {
  const { 
    selectedCandidate: candidate, 
    selectedVacancy: vacancy, 
    handleViewVacancyResults, 
    handleReevaluate, 
    isLoading: isReevaluating
  } = useAppContext();

  const [isCopied, setIsCopied] = useState(false);

  if (!candidate || !vacancy) {
    return null; // Or a loading/error state
  }

  const { evaluation } = candidate;
  const checkQuestions = vacancy.questions.filter((q): q is CheckQuestion => q.type === 'check');


  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-400 border-green-400';
    if (grade >= 5) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const renderBulletPoints = (text: string) => {
    return (
      <ul className="list-disc list-inside space-y-1">
        {text.split('\n').map((item, index) => {
          const cleanItem = item.replace(/^- /, '').trim();
          if (cleanItem) {
            return <li key={index}>{cleanItem}</li>;
          }
          return null;
        })}
      </ul>
    );
  };
  
  const getCriterionGradeColor = (grade: number) => {
    if (grade >= 8) return 'bg-green-800/50 text-green-300';
    if (grade >= 5) return 'bg-yellow-800/50 text-yellow-300';
    return 'bg-red-800/50 text-red-300';
  }

  const onBack = () => {
    handleViewVacancyResults(vacancy);
  }

  const handleCopyFeedback = () => {
    if (evaluation.candidateFeedback) {
      navigator.clipboard.writeText(evaluation.candidateFeedback);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <p className="text-cyan-400 font-semibold">{vacancy.jobDetails.title} - {vacancy.jobDetails.level}</p>
        <h1 className="text-2xl font-bold text-white mt-1">{candidate.candidateName}</h1>
        <p className="text-slate-400 text-sm mt-2">
            Entrevistado em: {new Date(candidate.interviewDate).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-lg flex flex-col items-center justify-center">
          <p className="text-slate-300 text-lg">Nota Global</p>
          <p className={`text-6xl font-bold ${getGradeColor(evaluation.globalGrade)}`}>
            {evaluation.globalGrade.toFixed(1)}
          </p>
        </div>
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-3">Resumo da Avaliação</h2>
          <p className="text-slate-300">{evaluation.summary}</p>
        </div>
      </div>
      
      {checkQuestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Verificação de Pré-requisitos</h2>
          <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
            {checkQuestions.map((q, index) => {
              const answer = candidate.checkAnswers.find(a => a.question === q.question);
              const isCorrect = answer?.answer === q.expectedAnswer;
              return (
                <div key={index} className="flex justify-between items-center bg-slate-800 p-3 rounded-md">
                  <p className="text-slate-300 flex-grow">{q.question}</p>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`font-bold text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {answer ? (answer.answer === 'yes' ? 'Sim' : 'Não') : 'Não respondeu'}
                    </span>
                    {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold text-white mb-3">Pontos Fortes</h2>
           <div className="text-slate-300 space-y-2">{renderBulletPoints(evaluation.strengths)}</div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold text-white mb-3">Pontos a Melhorar</h2>
           <div className="text-slate-300 space-y-2">{renderBulletPoints(evaluation.areasForImprovement)}</div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Análise por Pergunta
            <div className="group relative">
                <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500"/>
                <div className="absolute bottom-full mb-2 w-72 p-3 bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2">
                    O <strong>Índice de Similaridade IA</strong> avalia a probabilidade de uma resposta ter sido gerada por IA, focando em sinais de autenticidade humana (detalhes específicos, emoções, imperfeições da realidade) em vez de apenas similaridade de texto. Scores altos indicam respostas genéricas que merecem revisão.
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 transform rotate-45"></div>
                </div>
            </div>
        </h2>
        <div className="space-y-4">
          {evaluation.questionGrades.map((qGrade: QuestionGrade, index: number) => {
            const answer = candidate.answers.find(a => a.question === qGrade.question)?.answer || "Não respondeu.";
            return (
              <details key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 open:ring-1 open:ring-cyan-500 transition-all">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-4">
                  <span className="font-semibold text-white flex-grow">{qGrade.question}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    {typeof qGrade.originalityScore === 'number' && typeof qGrade.originalityJustification === 'string' && (
                        <OriginalityIndicator score={qGrade.originalityScore} justification={qGrade.originalityJustification} />
                    )}
                    <div className={`text-xl font-bold px-3 py-1 rounded-md border ${getGradeColor(qGrade.grade)}`}>
                        {qGrade.grade.toFixed(1)}
                    </div>
                  </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Resposta do Candidato:</h4>
                    <p className="text-slate-400 bg-slate-800 p-3 rounded-md whitespace-pre-wrap">{answer}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Justificativa da Nota:</h4>
                    <p className="text-slate-400">{qGrade.justification}</p>
                  </div>
                  <div>
                     <h4 className="font-semibold text-slate-300 mb-2">Avaliação por Critério:</h4>
                     <div className="space-y-2">
                        {qGrade.criterionGrades.map((cGrade, cIndex) => (
                           <div key={cIndex} className="bg-slate-800 p-3 rounded-md">
                             <div className="flex justify-between items-start gap-2">
                               <p className="text-slate-400 flex-grow"><span className="font-semibold text-slate-300">Critério: </span>{cGrade.criterion}</p>
                               <span className={`text-sm font-bold px-2 py-0.5 rounded ${getCriterionGradeColor(cGrade.grade)}`}>{cGrade.grade.toFixed(1)}</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-1">{cGrade.justification}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </div>

      {evaluation.candidateFeedback && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Feedback para o Candidato</h2>
          <details open className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 open:ring-1 open:ring-cyan-500 transition-all">
            <summary className="font-semibold text-white cursor-pointer list-none">Ocultar / Mostrar</summary>
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
              <div className="text-slate-300 bg-slate-800 p-4 rounded-md whitespace-pre-wrap">
                {evaluation.candidateFeedback}
              </div>
              <button 
                onClick={handleCopyFeedback}
                className="flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <ClipboardIcon className="w-4 h-4" />
                {isCopied ? 'Copiado!' : 'Copiar Feedback'}
              </button>
            </div>
          </details>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          Voltar para Resultados
        </button>
        <button
          onClick={handleReevaluate}
          disabled={isReevaluating}
          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isReevaluating ? 'Reavaliando...' : <><RefreshIcon className="w-5 h-5"/> Reavaliar com IA</>}
        </button>
      </div>
    </div>
  );
};

export default EvaluationResults;