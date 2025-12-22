import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
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

  const [addedQuestions, setAddedQuestions] = useState(candidate?.personalQuestions || []);

  if (!candidate || !vacancy || !candidate.cvEvaluation) {
    return null; // você pode trocar por um estado de loading depois
  }

  const { cvEvaluation } = candidate;

  const isQuestionAdded = (question: BehavioralQuestion) => {
    return addedQuestions.some(aq => aq.question === question.question);
  };

  const handleToggleQuestion = (question: BehavioralQuestion) => {
    setAddedQuestions(prev => {
      if (isQuestionAdded(question)) {
        return prev.filter(q => q.question !== question.question);
      }
      return [...prev, question];
    });
  };

  const handleConfirmPersonalization = async () => {
    await handleSavePersonalQuestions(candidate.id, addedQuestions);
    setView('vacancyResults');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  // ✅ aceita string OU array vindo do Gemini
  const renderBulletPoints = (value: unknown) => {
    let items: string[] = [];

    if (Array.isArray(value)) {
      items = value.map(v => (typeof v === 'string' ? v : String(v)));
    } else if (typeof value === 'string') {
      items = value.split('\n');
    } else if (value == null) {
      items = [];
    } else {
      // fallback: tenta renderizar o que veio
      items = [String(value)];
    }

    return (
      <ul className="space-y-2">
        {items
          .map(item => item.replace(/^- /, '').trim())
          .filter(Boolean)
          .map((cleanItem, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-300">
              <span className="text-cyan-400 mt-1">•</span>
              <span>{cleanItem}</span>
            </li>
          ))}
      </ul>
    );
  };

  const onBack = () => {
    if (vacancy) {
      handleViewVacancyResults(vacancy);
    }
  };

  // ✅ matchScore pode vir como string dependendo do modelo/prompt
  const matchScoreNumber =
    typeof (cvEvaluation as any).matchScore === 'number'
      ? (cvEvaluation as any).matchScore
      : Number((cvEvaluation as any).matchScore);

  const safeMatchScore = Number.isFinite(matchScoreNumber) ? matchScoreNumber : 0;

  const followUpQuestions: BehavioralQuestion[] = Array.isArray((cvEvaluation as any).followUpQuestions)
    ? (cvEvaluation as any).followUpQuestions
    : [];

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-400">
            {vacancy.jobDetails.title} - {vacancy.jobDetails.level}
          </p>
          <h1 className="text-3xl font-bold text-white">{candidate.candidateName}</h1>
          <p className="text-slate-400 mt-1">
            Análise de CV realizada em: {new Date(candidate.interviewDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
        >
          Voltar para Painel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm mb-2">Score de Alinhamento</p>
          <p className={`text-5xl font-bold ${getScoreColor(safeMatchScore)}`}>
            {safeMatchScore.toFixed(1)}
          </p>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm mb-2">Resumo da Análise</p>
          <p className="text-slate-200 leading-relaxed">{(cvEvaluation as any).summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white mb-3">Pontos Fortes (Alinhamento)</h2>
          {renderBulletPoints((cvEvaluation as any).strengths)}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white mb-3">Pontos Fracos (Gaps)</h2>
          {renderBulletPoints((cvEvaluation as any).weaknesses)}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Perguntas de Aprofundamento Sugeridas</h2>

        {followUpQuestions.length > 0 ? (
          <div className="space-y-4">
            {followUpQuestions.map((question, index) => {
              const added = isQuestionAdded(question);

              return (
                <div key={index} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{question.question}</p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-slate-300 flex items-center gap-2">
                          <InfoIcon className="w-4 h-4" />
                          Ver Critérios
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {(question.criteria || []).map((c, i) => (
                            <li key={i} className="text-slate-300">
                              • {c.text} ({c.points} pts)
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>

                    <button
                      onClick={() => handleToggleQuestion(question)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors shrink-0 ${
                        added ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {added ? 'Adicionada' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-300">
            <p className="mb-2">
              Justificativa da IA:{' '}
              {(cvEvaluation as any).analysisJustification ||
                'Não foram identificados pontos que necessitem de aprofundamento.'}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Voltar
          </button>

          <button
            onClick={handleConfirmPersonalization}
            className="flex-1 px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default CvEvaluationResults;
