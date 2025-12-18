import React, { useState } from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ZapIcon from './icons/ZapIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import GiftIcon from './icons/GiftIcon';
import { useAppContext } from '../contexts/AppContext';

const LandingPage: React.FC = () => {
  const { setView } = useAppContext();
  const [lead, setLead] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLead({ ...lead, [e.target.name]: e.target.value });
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead captured:', lead);
    setSubmitted(true);
  };
  
  const onNavigateToApp = () => setView('login');

  return (
    <div className="w-full bg-slate-50 text-slate-800 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-600 font-serif">Gallileo</h1>
          <button
            onClick={onNavigateToApp}
            className="hidden sm:inline-block bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            Acessar a Plataforma
          </button>
        </header>

        <main>
          {/* Hero Section v2 */}
          <section className="py-20 grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                    Contrate 3x mais rápido, com 90% menos viés.
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                    Galileo é a plataforma de IA que automatiza a triagem de candidatos, permitindo que você foque apenas nos talentos mais qualificados.
                </p>
                <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-cyan-600 shrink-0"/>
                        <span className="text-slate-700"><strong>Avaliações de Qualidade:</strong> Critérios objetivos para cada candidato.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <ZapIcon className="w-6 h-6 text-cyan-600 shrink-0"/>
                        <span className="text-slate-700"><strong>Eficiência Máxima:</strong> Reduza o tempo de triagem em até 80%.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <DollarSignIcon className="w-6 h-6 text-cyan-600 shrink-0"/>
                        <span className="text-slate-700"><strong>Custos Reduzidos:</strong> Libere seu time para focar em decisões estratégicas.</span>
                    </li>
                </ul>
                
                {/* Lead Capture Form */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                  {submitted ? (
                    <p className="text-green-600 font-semibold text-lg p-4 bg-green-50 rounded-md border border-green-200 text-center">Obrigado! Entraremos em contato em breve.</p>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        name="email"
                        value={lead.email}
                        onChange={handleLeadChange}
                        placeholder="seu.melhor@email.com"
                        required
                        className="flex-grow bg-slate-100 border border-slate-300 rounded-md shadow-sm py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md shadow-cyan-500/30"
                      >
                        Solicitar Acesso
                      </button>
                    </form>
                  )}
                </div>
            </div>

            {/* Visual Artifact */}
            <div className="relative h-96 hidden lg:flex items-center justify-center">
                <div className="absolute w-full h-full flex items-center justify-center">
                    {/* Background Glow */}
                    <div className="absolute w-72 h-72 bg-cyan-200/50 rounded-full blur-3xl"></div>

                    {/* Chaotic Cards */}
                    <div className="card-chaos card-1">Candidato A</div>
                    <div className="card-chaos card-2">Candidato B</div>
                    <div className="card-chaos card-3">Candidato C</div>
                    <div className="card-chaos card-4">Candidato D</div>

                    {/* Ranked List */}
                    <div className="w-64 h-80 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-4 flex flex-col gap-3">
                        <h4 className="font-bold text-center text-slate-700">Top Candidatos</h4>
                        <div className="ranked-card rank-1"><span>1º</span> Candidato C <span className="grade">9.2</span></div>
                        <div className="ranked-card rank-2"><span>2º</span> Candidato A <span className="grade">8.5</span></div>
                        <div className="ranked-card rank-3"><span>3º</span> Candidato D <span className="grade">7.8</span></div>
                    </div>
                </div>
            </div>
          </section>

          {/* How it Works */}
          <section className="py-20 bg-white -mx-8 px-8 rounded-3xl">
              <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Simples, rápido e poderoso</h2>
                  <p className="text-slate-600 mb-12">Transforme seu recrutamento em 4 passos simples.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
                  <div>
                      <h4 className="text-6xl font-bold text-cyan-200 mb-2">1</h4>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Descreva a Vaga</h3>
                      <p className="text-slate-600">Cole a descrição e defina os detalhes. Nossa IA gera um roteiro de entrevista completo em segundos.</p>
                  </div>
                  <div>
                      <h4 className="text-6xl font-bold text-cyan-200 mb-2">2</h4>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Envie o Convite</h3>
                      <p className="text-slate-600">Envie um link para os candidatos. Eles respondem por áudio, no tempo deles, de qualquer lugar.</p>
                  </div>
                  <div>
                      <h4 className="text-6xl font-bold text-cyan-200 mb-2">3</h4>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">A IA Avalia e Ranqueia</h3>
                      <p className="text-slate-600">Nossa IA analisa cada resposta, atribui notas e cria um ranking objetivo dos melhores talentos para você.</p>
                  </div>
                   <div>
                      <h4 className="text-6xl font-bold text-cyan-200 mb-2">4</h4>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Feedback que Encanta</h3>
                      <p className="text-slate-600">Todos os candidatos recebem um feedback completo e personalizado, fortalecendo sua marca empregadora.</p>
                  </div>
              </div>
          </section>
          
          {/* Social Proof */}
          <section className="py-28">
              <div className="max-w-3xl mx-auto text-center">
                  <p className="text-2xl text-slate-900 leading-relaxed">"O Galileo transformou nosso processo. Reduzimos o tempo de triagem em 80% e a qualidade dos candidatos que chegam à fase final é incomparavelmente maior."</p>
                  <div className="mt-6">
                      <p className="font-bold text-slate-900">Mariana Costa</p>
                      <p className="text-slate-500">Gerente de RH, InovaTech Soluções</p>
                  </div>
              </div>
          </section>

        </main>
      </div>

      <footer className="bg-slate-100 border-t border-slate-200">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Galileo AI. Todos os direitos reservados.</p>
         </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
        }

        .card-chaos {
            position: absolute;
            padding: 0.5rem 1rem;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            border: 1px solid #e2e8f0;
            font-size: 0.875rem;
            color: #475569;
            animation: float 8s ease-in-out infinite, fadeIn 1s ease-out;
        }
        .card-1 { transform: translate(-12rem, -6rem) rotate(-15deg); animation-delay: 0s; }
        .card-2 { transform: translate(11rem, -3rem) rotate(10deg); animation-delay: -2s; }
        .card-3 { transform: translate(-10rem, 7rem) rotate(5deg); animation-delay: -4s; }
        .card-4 { transform: translate(12rem, 5rem) rotate(-8deg); animation-delay: -6s; }
        
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
            50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
        .card-1 { --tw-rotate: -15deg; }
        .card-2 { --tw-rotate: 10deg; }
        .card-3 { --tw-rotate: 5deg; }
        .card-4 { --tw-rotate: -8deg; }

        .ranked-card {
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid;
            opacity: 0;
            transform: scale(0.95);
            animation: popIn 0.5s ease-out forwards;
        }
        .rank-1 { 
            background-color: #cffafe;
            color: #0891b2;
            border-color: #a5f3fc;
            animation-delay: 0.5s;
        }
        .rank-2 { 
            background-color: #f0f9ff;
            color: #0369a1;
            border-color: #e0f2fe;
            animation-delay: 0.8s;
        }
        .rank-3 { 
            background-color: #f8fafc;
            color: #475569;
            border-color: #e2e8f0;
            animation-delay: 1.1s;
        }
        .ranked-card .grade {
            font-size: 0.875rem;
            font-weight: bold;
            background-color: white;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
        }

        @keyframes popIn {
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

      `}</style>
    </div>
  );
};

export default LandingPage;