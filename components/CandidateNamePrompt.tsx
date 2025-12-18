import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import LoadingIcon from './icons/LoadingIcon';
import ClockIcon from './icons/ClockIcon';
import ExclamationIcon from './icons/ExclamationIcon';

const CandidateNamePrompt: React.FC = () => {
  // FIX: Replaced `handleNameSubmit` with `handleInstructionsComplete`, which exists in the context and performs the intended action of starting the interview flow.
  const { handleInstructionsComplete, goBackToVacancies, isLoading, currentVacancy, selectedCandidate } = useAppContext();
  const name = selectedCandidate?.candidateName || '';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      handleInstructionsComplete();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center">
        <ClockIcon className="w-12 h-12 text-cyan-400 mb-4 mx-auto"/>
        <h2 className="text-2xl font-bold text-white mb-2">Entrevista para {currentVacancy?.jobDetails.title}</h2>
        <p className="text-slate-400 mb-6">Leia as instruções atentamente antes de começar.</p>
        
        <div className="text-left space-y-3 bg-slate-900/50 p-6 rounded-lg border border-slate-700 max-w-md mx-auto mb-8">
            <h3 className="font-bold text-lg text-white text-center mb-3">Como funciona:</h3>
            <ul className="space-y-2">
                <li className="flex items-start gap-3">
                    <span className="font-bold text-cyan-400">1.</span>
                    <span className="text-slate-300">Para cada pergunta, você terá <strong className="text-white">45 segundos</strong> para ler e preparar sua resposta.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-cyan-400">2.</span>
                    <span className="text-slate-300">A gravação começará <strong className="text-white">automaticamente</strong> após o tempo de preparo.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-cyan-400">3.</span>
                    <span className="text-slate-300">Você terá até <strong className="text-white">3 minutos</strong> para gravar sua resposta.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-cyan-400">4.</span>
                    <span className="text-slate-300">O processo é sequencial, não será possível voltar a perguntas anteriores.</span>
                </li>
                <li className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-700/50">
                    <ExclamationIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"/>
                    <span className="text-slate-300 text-sm">Para garantir a integridade do processo, você deve se manter nesta tela durante toda a entrevista. A troca de abas ou janelas será monitorada. A reincidência resultará no <strong className="text-yellow-300">cancelamento automático</strong> da entrevista.</span>
                </li>
            </ul>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="candidateName" className="block text-sm font-medium text-slate-300 mb-1">Seu nome completo</label>
          <input
            id="candidateName"
            type="text"
            value={name}
            readOnly
            className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 opacity-70 cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col sm:flex-row-reverse gap-4">
            <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isLoading ? <><LoadingIcon className="w-5 h-5 mr-2" /> Preparando...</> : 'Estou pronto, começar a entrevista'}
            </button>
            <button
                type="button"
                onClick={goBackToVacancies}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
            >
              Voltar
            </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateNamePrompt;