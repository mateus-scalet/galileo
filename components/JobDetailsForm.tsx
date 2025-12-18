import React, { useState } from 'react';
import { JobDetails } from '../types';
import LoadingIcon from './icons/LoadingIcon';
import { useAppContext } from '../contexts/AppContext';

const JobDetailsForm: React.FC = () => {
  const { handleGenerateQuestions, isLoading, goBackToVacancies } = useAppContext();
  const [details, setDetails] = useState<JobDetails>({
    title: '',
    level: 'Analista',
    description: '',
    numQuestions: 5,
    bias: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: name === 'numQuestions' || name === 'bias' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerateQuestions(details);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Criar Nova Vaga</h1>
      <p className="text-slate-400 mb-8 text-center">Descreva a vaga para gerar uma entrevista técnica e comportamental personalizada.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Cargo</label>
          <input type="text" name="title" id="title" value={details.title} onChange={handleChange} placeholder="Ex: Engenheiro de Software Sênior" className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-1">Nível</label>
          <select name="level" id="level" value={details.level} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
            <option>Estagiário</option>
            <option>Analista</option>
            <option>Especialista</option>
            <option>Coordenador</option>
            <option>Gerente</option>
            <option>Diretor</option>
            <option>C-Level</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Descrição da Vaga</label>
          <textarea name="description" id="description" rows={4} value={details.description} onChange={handleChange} placeholder="Cole aqui a descrição detalhada da vaga..." className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-300 mb-1">Número de Perguntas ({details.numQuestions})</label>
          <input type="range" min="3" max="10" name="numQuestions" id="numQuestions" value={details.numQuestions} onChange={handleChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
            <label htmlFor="bias" className="block text-sm font-medium text-slate-300 mb-1">Foco da Entrevista</label>
            <input type="range" min="0" max="4" step="1" name="bias" id="bias" value={details.bias} onChange={handleChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Técnica</span>
                <span>Equilibrada</span>
                <span>Comportamental</span>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button type="button" onClick={goBackToVacancies} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              Voltar
            </button>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isLoading ? <><LoadingIcon className="w-5 h-5 mr-2" /> Gerando...</> : 'Gerar Perguntas da Entrevista'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default JobDetailsForm;