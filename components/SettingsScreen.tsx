import React, { useState } from 'react';
import { Prompt, PromptSettings } from '../types';
import { useAppContext } from '../contexts/AppContext';

const placeholders: Record<Prompt['id'], {name: string, description: string}[]> = {
    questionGeneration: [
        { name: '{jobTitle}', description: 'O cargo da vaga.' },
        { name: '{jobLevel}', description: 'O nível de senioridade.' },
        { name: '{numQuestions}', description: 'O número de perguntas a serem geradas.' },
        { name: '{jobDescription}', description: 'A descrição completa da vaga.' },
        { name: '{biasDescription}', description: 'A descrição do foco (técnico vs. comportamental).' },
    ],
    answerEvaluation: [
        { name: '{jobTitle}', description: 'O cargo da vaga.' },
        { name: '{jobLevel}', description: 'O nível de senioridade.' },
        { name: '{jobDescription}', description: 'A descrição completa da vaga.' },
        { name: '{interviewTranscript}', description: 'A transcrição completa da entrevista, contendo cada pergunta, seus critérios e a resposta do candidato.' },
    ],
    keywordExtraction: [
        { name: '{jobTitle}', description: 'O cargo da vaga.' },
        { name: '{jobDescription}', description: 'A descrição completa da vaga.' },
    ],
    baselineAnswerGeneration: [
      { name: '{question}', description: 'A pergunta da entrevista para a qual a resposta ideal será gerada.' },
      { name: '{jobTitle}', description: 'O cargo da vaga.' },
      { name: '{jobDescription}', description: 'A descrição completa da vaga.' },
    ],
    originalityEvaluation: [
      { name: '{candidateAnswer}', description: 'A resposta fornecida pelo candidato.' },
      { name: '  {baselineAnswer}', description: 'A resposta ideal gerada pela IA para comparação.' },
    ],
    candidateFeedbackGeneration: [
      { name: '{jobTitle}', description: 'O cargo da vaga.' },
      { name: '{summary}', description: 'O resumo da avaliação geral do candidato.' },
      { name: '{strengths}', description: 'Os pontos fortes do candidato, listados em bullet points.' },
      { name: '{areasForImprovement}', description: 'As áreas de melhoria, listadas em bullet points.' },
      { name: '{answersTranscript}', description: 'A transcrição das perguntas e respostas do candidato.' },
    ],
    cvAnalysis: [
        { name: '{jobTitle}', description: 'O cargo da vaga.' },
        { name: '{jobLevel}', description: 'O nível de senioridade.' },
        { name: '{jobDescription}', description: 'A descrição completa da vaga.' },
        { name: '{cvText}', description: 'O texto extraído do currículo do candidato.' },
        { name: '{currentDate}', description: 'A data atual, para fornecer contexto temporal à IA.' },
    ],
}

const SettingsScreen: React.FC = () => {
  const { prompts: initialPrompts, savePrompts, goBackToVacancies } = useAppContext();
  const [prompts, setPrompts] = useState(initialPrompts);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  const handlePromptChange = (promptId: Prompt['id'], newTemplate: string) => {
    if (!prompts) return;
    setPrompts(prev => ({
      ...prev!,
      [promptId]: {
        ...prev![promptId],
        template: newTemplate
      }
    }));
    setSaveStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompts) {
      savePrompts(prompts);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleCopyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    setCopiedPlaceholder(placeholder);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  if (!prompts) {
    return null; // or a loading state
  }

  const generationPrompts: Prompt[] = [
    prompts.questionGeneration,
    prompts.keywordExtraction,
    prompts.baselineAnswerGeneration,
  ];

  const evaluationPrompts: Prompt[] = [
    prompts.answerEvaluation,
    prompts.originalityEvaluation,
    prompts.candidateFeedbackGeneration,
  ];
  
  const cvPrompts: Prompt[] = [
    prompts.cvAnalysis
  ];

  const renderPromptEditor = (prompt: Prompt) => (
    <div key={prompt.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-xl font-bold text-cyan-400">{prompt.name}</h3>
      <p className="text-sm text-slate-400 mb-4">{prompt.description}</p>
      
      <div>
        <label htmlFor={prompt.id} className="block text-sm font-medium text-slate-300 mb-1">Template do Prompt:</label>
        <textarea
          id={prompt.id}
          value={prompt.template}
          onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"
          rows={15}
        />
      </div>

      <div className="mt-4">
          <p className="text-sm font-medium text-slate-300 mb-2">Campos Dinâmicos Disponíveis:</p>
          <div className="flex flex-wrap gap-2">
              {placeholders[prompt.id]?.map(p => (
                  <button
                      type="button"
                      key={p.name}
                      onClick={() => handleCopyPlaceholder(p.name)}
                      title={p.description}
                      className={`transition-colors duration-200 px-2 py-1 rounded-md text-xs font-mono ${copiedPlaceholder === p.name ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-cyan-300'}`}
                  >
                      {copiedPlaceholder === p.name ? 'Copiado!' : p.name}
                  </button>
              ))}
          </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Configurações da IA</h1>
      <p className="text-slate-400 mb-8 text-center">Ajuste os prompts que a inteligência artificial usa para gerar e avaliar entrevistas.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <fieldset className="space-y-6 rounded-lg border border-slate-700 p-4">
          <legend className="px-2 text-lg font-semibold text-white">Geração da Vaga</legend>
          {generationPrompts.map(renderPromptEditor)}
        </fieldset>
        
        <fieldset className="space-y-6 rounded-lg border border-slate-700 p-4">
          <legend className="px-2 text-lg font-semibold text-white">Avaliação do Candidato</legend>
          {evaluationPrompts.map(renderPromptEditor)}
        </fieldset>
        
        <fieldset className="space-y-6 rounded-lg border border-slate-700 p-4">
          <legend className="px-2 text-lg font-semibold text-white">Análise de Currículo</legend>
          {cvPrompts.map(renderPromptEditor)}
        </fieldset>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
          <button type="button" onClick={goBackToVacancies} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
            Voltar
          </button>
          <button 
            type="submit"
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${saveStatus === 'saved' ? 'bg-green-600 cursor-default' : 'bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500'}`}
          >
            {saveStatus === 'saved' ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsScreen;