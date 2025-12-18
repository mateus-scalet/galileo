import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import { useAppContext } from '../contexts/AppContext';

const AccountScreen: React.FC = () => {
  const { goBackToVacancies } = useAppContext();
  // Mock user data with new fields
  const [user, setUser] = useState({
    name: '', // Empty to show placeholder
    email: 'recrutador@empresa.com',
    role: 'Recrutador Sênior',
    company: 'InovaTech Soluções',
    phone: '', // Empty to show placeholder
    billingEmail: 'recursoshumanos@empresa.com',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    setSaveStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this data to a backend.
    console.log('Saving user data:', user);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Minha Conta</h1>
      
      <form onSubmit={handleSubmit} className="space-y-10">

        {/* --- Profile Information Section --- */}
        <fieldset>
          <legend className="text-xl font-semibold text-cyan-400 mb-4">Informações do Perfil</legend>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-slate-400"/>
                </div>
                <button type="button" className="text-sm font-semibold text-cyan-500 opacity-50 cursor-not-allowed">Alterar foto</button>
            </div>
             <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">Empresa</label>
              <input
                type="text"
                name="company"
                id="company"
                value={user.company}
                className="w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-400 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
              <input
                type="text"
                name="name"
                id="name"
                value={user.name}
                onChange={handleChange}
                placeholder="Mateus Scalet"
                className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={user.email}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={user.phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-8888"
                        className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            </div>
             <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">Cargo</label>
              <input
                type="text"
                name="role"
                id="role"
                value={user.role}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
        </fieldset>

        {/* --- Financial Section --- */}
        <fieldset>
          <legend className="text-xl font-semibold text-cyan-400 mb-4">Financeiro</legend>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-md">
                <span className="text-sm font-medium text-slate-300">Plano Atual</span>
                <div>
                    <span className="text-white font-semibold mr-4">Pro Anual</span>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-cyan-500 opacity-50 cursor-not-allowed">Mudar Plano</a>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Pagamento</label>
                    <input value="Anual" className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-400 cursor-not-allowed" disabled />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Forma de Pagamento</label>
                    <input value="Cartão de Crédito" className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-400 cursor-not-allowed" disabled />
                </div>
            </div>
            <div>
              <label htmlFor="billingEmail" className="block text-sm font-medium text-slate-300 mb-1">Email de Cobrança</label>
              <input
                type="email"
                name="billingEmail"
                id="billingEmail"
                value={user.billingEmail}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
        </fieldset>
        
        {/* --- Security Section (Suggested) --- */}
        <fieldset>
          <legend className="text-xl font-semibold text-cyan-400 mb-4">Segurança</legend>
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-md">
            <span className="text-sm font-medium text-slate-300">Senha</span>
            <button type="button" className="text-sm font-semibold text-cyan-500 opacity-50 cursor-not-allowed">Alterar Senha</button>
          </div>
        </fieldset>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
          <button
            type="button"
            onClick={goBackToVacancies}
            className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Voltar
          </button>
          <button
            type="submit"
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${saveStatus === 'saved' ? 'bg-green-600 cursor-default' : 'bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500'}`}
          >
            {saveStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountScreen;