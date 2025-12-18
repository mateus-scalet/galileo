import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CheckQuestion, CheckAnswer } from '../types';

const CheckScreen: React.FC = () => {
  const { currentInterviewScript, handleCheckComplete, goBackToVacancies } = useAppContext();
  const checkQuestions = currentInterviewScript.filter((q): q is CheckQuestion => q.type === 'check') || [];

  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>({});

  const handleAnswer = (question: string, answer: 'yes' | 'no') => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };
  
  const allAnswered = checkQuestions.length === Object.keys(answers).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;

    const formattedAnswers: CheckAnswer[] = checkQuestions.map(q => ({
      question: q.question,
      answer: answers[q.question],
    }));
    handleCheckComplete(formattedAnswers);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Verificação de Pré-requisitos</h2>
        <p className="text-slate-400 mb-8">Por favor, responda às perguntas abaixo para continuarmos.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {checkQuestions.map((q, index) => (
          <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-lg text-white mb-4">{q.question}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleAnswer(q.question, 'yes')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${answers[q.question] === 'yes' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(q.question, 'no')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${answers[q.question] === 'no' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Não
              </button>
            </div>
          </div>
        ))}
        
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4 border-t border-slate-700">
          <button
            type="submit"
            disabled={!allAnswered}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Continuar para a Entrevista
          </button>
          <button
            type="button"
            onClick={goBackToVacancies}
            className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckScreen;