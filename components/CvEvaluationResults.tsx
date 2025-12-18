import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import AddIcon from './icons/AddIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InfoIcon from './icons/InfoIcon';
import { BehavioralQuestion } from '../types';

const CvEvaluationResults: React.FC = () => {
  const { 
    selectedCandidate: candidate, 
    selectedVacancy: vacancy, 
    handleViewVacancyResults,
    handleSavePersonalQuestions,
    setView,
  } = useAppContext();

  const [addedQuestions, setAddedQuestions] = useState<BehavioralQuestion[]>(candidate?.personalQuestions || []);

  if (!candidate || !vacancy || !candidate.cvEvaluation) {
    return null; // Or a loading/error state
  }

  const { cvEvaluation } = candidate;

  const isQuestionAdded = (question: BehavioralQuestion) => {
    return addedQuestions.some(aq => aq.question === question.question);
  }

  const handleToggleQuestion = (question: BehavioralQuestion) => {
    setAddedQuestions(prev => {
      if (isQuestionAdded(question)) {
        return prev.filter(q => q.question !== question.question);
      } else {
        return [...prev, question];
      }
    });
  };
  
  const handleConfirmPersonalization = async () => {
    await handleSavePersonalQuestions(candidate.id, addedQuestions);
    setView('vacancyResults');
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
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

  const onBack = () => {
    if (vacancy) {
        handleViewVacancyResults(vacancy);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <p className="text-cyan-400 font-semibold">{vacancy.jobDetails.title} - {vacancy.jobDetails.level}</p>
        <h1 className="text-2xl font-bold text-white mt-1">{candidate.candidateName}</h1>
        <p className="text-slate-400 text-sm mt-2">
            Análise de CV realizada em: {new Date(candidate.interviewDate).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-lg flex flex-col items-center justify-center">
          <p className="text-slate-300 text-lg">Score de Alinhamento</p>
          <p className={`text-6xl font-bold ${getScoreColor(cvEvaluation.matchScore)}`}>
            {cvEvaluation.matchScore.toFixed(1)}
          </p>
        </div>
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-3">Resumo da Análise</h2>
          <p className="text-slate-300">{cvEvaluation.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold text-white mb-3">Pontos Fortes (Alinhamento)</h2>
           <div className="text-slate-300 space-y-2">{renderBulletPoints(cvEvaluation.strengths)}</div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold text-white mb-3">Pontos Fracos (Gaps)</h2>
           <div className="text-slate-300 space-y-2">{renderBulletPoints(cvEvaluation.weaknesses)}</div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Perguntas de Aprofundamento Sugeridas</h2>
        <div className="space-y-3">
          {cvEvaluation.followUpQuestions.length > 0 ? (
            cvEvaluation.followUpQuestions.map((question, index) => {
              const added = isQuestionAdded(question);
              return (
              <div key={index} className="bg-slate-900/50 p-4 rounded-lg flex items-start justify-between gap-4 border border-slate-700">
                <div className="flex-grow">
                    <p className="text-slate-300">{question.question}</p>
                    <details className="mt-2 text-xs text-slate-500">
                        <summary className="cursor-pointer font-semibold">Ver Critérios</summary>
                        <ul className="list-disc pl-5 mt-1">
                            {question.criteria.map((c, i) => <li key={i}>{c.text} ({c.points} pts)</li>)}
                        </ul>
                    </details>
                </div>
                <button
                  onClick={() => handleToggleQuestion(question)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors shrink-0 ${
                    added 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {added ? <CheckCircleIcon className="w-3 h-3" /> : <AddIcon className="w-3 h-3" />}
                  {added ? 'Adicionada' : 'Adicionar'}
                </button>
              </div>
            )})
          ) : (
            <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-3 border border-slate-700">
                <InfoIcon className="w-5 h-5 text-cyan-400 shrink-0"/>
                <p className="text-slate-300 text-sm">
                    <span className="font-semibold">Justificativa da IA:</span> {cvEvaluation.analysisJustification || "Não foram identificados pontos que necessitem de aprofundamento."}
                </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          Voltar para Painel
        </button>
        <button
          onClick={handleConfirmPersonalization}
          className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          Concluir
        </button>
      </div>
    </div>
  );
};

export default CvEvaluationResults;