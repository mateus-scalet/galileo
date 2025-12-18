import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import { useAppContext } from '../contexts/AppContext';

const LoginScreen: React.FC = () => {
  const { handleLogin, loginError } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin('credentials');
  };

  const handleGoogleLogin = () => {
    handleLogin('google');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4 font-serif">Gallileo</h1>
        <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
        <p className="text-slate-400 mt-2">Acesse sua conta para gerenciar as entrevistas.</p>
      </div>
      
      <form onSubmit={handleCredentialsLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password"className="block text-sm font-medium text-slate-300">Senha</label>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-cyan-500 hover:underline">Esqueceu a senha?</a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>

        {loginError && (
            <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-center text-sm">
                {loginError}
            </div>
        )}

        <div>
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
                Entrar
            </button>
        </div>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
            <span className="bg-slate-800 px-2 text-slate-500">OU</span>
        </div>
      </div>
      
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          <GoogleIcon className="w-5 h-5" />
          <span>Entrar com Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;