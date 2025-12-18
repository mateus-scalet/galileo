import React, { useState, useMemo } from 'react';
import { Vacancy } from '../types';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';
import UserIcon from './icons/UserIcon';
import { useAppContext } from '../contexts/AppContext';

const VacanciesList: React.FC = () => {
    const { 
        vacancies, 
        handleEditVacancy, 
        handleViewVacancyResults, 
        setView,
        resetFlowState,
        handleLogout 
    } = useAppContext();
    
    const [searchQuery, setSearchQuery] = useState('');

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    const handleNewVacancy = () => {
      resetFlowState();
      setView('jobDetailsForm');
    }

    const filteredVacancies = useMemo(() => {
        if (!searchQuery.trim()) {
            return vacancies;
        }
        return vacancies.filter(vacancy =>
            vacancy.jobDetails.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
    }, [vacancies, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
        <header className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-white">Painel de Vagas</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView('account')}
                    title="Minha Conta"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="Acessar minha conta"
                >
                    <UserIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setView('settings')}
                    title="Configurações"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="Acessar configurações"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleLogout}
                    title="Sair"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="Fazer logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
        </header>

        <div className="mb-6">
            <p className="text-slate-400">Bem-vindo(a) de volta!</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar vaga pelo título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            aria-label="Buscar vagas"
          />
        </div>

        {vacancies.length === 0 ? (
            <div className="text-center bg-slate-800 p-10 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Nenhuma vaga criada ainda.</h2>
                <p className="text-slate-400 mt-2">Clique no botão abaixo para criar sua primeira entrevista com IA.</p>
            </div>
        ) : filteredVacancies.length === 0 ? (
            <div className="text-center bg-slate-800 p-10 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Nenhuma vaga encontrada.</h2>
                <p className="text-slate-400 mt-2">Tente ajustar os termos da sua busca.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {filteredVacancies.slice().reverse().map((vacancy) => (
                    <div key={vacancy.id} className="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-white">{vacancy.jobDetails.title}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-x-3 whitespace-nowrap mt-1">
                                <span>Criada em: {formatDate(vacancy.createdAt)}</span>
                                <span className="hidden sm:inline">|</span>
                                <span>Nível: {vacancy.jobDetails.level}</span>
                                <span className="hidden sm:inline">|</span>
                                <span>Candidatos: {vacancy.candidates?.length || 0}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end shrink-0 w-full sm:w-auto">
                           <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                               vacancy.status === 'Entrevistando' ? 'bg-green-800 text-green-200' : 
                               vacancy.status === 'Pausado' ? 'bg-yellow-800 text-yellow-200' :
                               'bg-red-800 text-red-200'
                           }`}>
                                {vacancy.status}
                            </span>
                            <button
                             onClick={() => handleEditVacancy(vacancy)}
                             className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                           >
                             Editar
                           </button>
                           <button
                             onClick={() => handleViewVacancyResults(vacancy)}
                             className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                           >
                             Painel
                           </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className="mt-8 flex justify-center">
            <button
                onClick={handleNewVacancy}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
            >
                <span>Nova Vaga</span>
                <span className="text-xl">+</span>
            </button>
        </div>
        <div className="mt-6 text-center">
            <button 
                onClick={() => setView('landingPage')}
                className="text-sm text-slate-500 hover:text-cyan-400 transition-colors underline"
            >
                Visualizar Página de Marketing
            </button>
        </div>
    </div>
  );
};

export default VacanciesList;