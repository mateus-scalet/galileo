import React, { useState, useMemo } from 'react';
import { InterviewQuestion, JobDetails, BehavioralQuestion, CheckQuestion } from '../types';
import LoadingIcon from './icons/LoadingIcon';
import AddQuestionModal from './AddQuestionModal';
import TrashIcon from './icons/TrashIcon';
import { useAppContext } from '../contexts/AppContext';

interface QuestionEditorProps {
  initialQuestions: InterviewQuestion[];
  jobDetails: JobDetails;
  isEditing: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ initialQuestions, jobDetails, isEditing }) => {
  const { 
    handleSaveVacancy, 
    handleGenerateQuestions, 
    isLoading, 
    goBackToVacancies,
    editingVacancy,
    setView
  } = useAppContext();
  
  const [questions, setQuestions] = useState<InterviewQuestion[]>(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'behavioral' | 'check' | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);


  const handleQuestionChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question = value;
    setQuestions(newQuestions);
  };

  const handleExpectedAnswerChange = (qIndex: number, value: 'yes' | 'no') => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question.type === 'check') {
      question.expectedAnswer = value;
      setQuestions(newQuestions);
    }
  };

  const handleCriterionChange = (qIndex: number, cIndex: number, field: 'text' | 'points', value: string | number) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question.type === 'behavioral') {
      let processedValue = value;
      if (field === 'points') {
        processedValue = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
        if (processedValue < 0) processedValue = 0;
        if (processedValue > 10) processedValue = 10;
      }
      (question.criteria[cIndex] as any)[field] = processedValue;
      setQuestions(newQuestions);
    }
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    setQuestions(prev => prev.filter((_, index) => index !== indexToDelete));
    setDeletingIndex(null);
  };

  const handleOpenModal = (type: 'behavioral' | 'check') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalType(null);
  };
  
  const handleAddQuestionFromModal = (newQuestion: InterviewQuestion) => {
    if (newQuestion.type === 'check') {
      const lastCheckIndex = questions.reduce((acc, q, index) => (q.type === 'check' ? index : acc), -1);
      const newQuestions = [...questions];
      newQuestions.splice(lastCheckIndex + 1, 0, newQuestion);
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    handleCloseModal();
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyPointsSumInvalid) return;
    handleSaveVacancy(questions);
  }

  const handleRegenerate = () => {
    if (jobDetails) {
        handleGenerateQuestions(jobDetails);
    }
  }

  const handleBack = () => {
    if (editingVacancy) {
        goBackToVacancies();
    } else {
        setView('jobDetailsForm');
    }
  }

  const pointsSums = useMemo(() => {
    return questions.map(q => {
        if (q.type === 'behavioral') {
            return q.criteria.reduce((sum, c) => sum + c.points, 0);
        }
        return null;
    });
  }, [questions]);
  
  const isAnyPointsSumInvalid = useMemo(() => {
    return pointsSums.some(sum => sum !== null && sum !== 10);
  }, [pointsSums]);

  const checkQuestionsWithOriginalIndex = useMemo(() => 
    questions
      .map((q, index) => ({ ...q, originalIndex: index }))
      .filter((q): q is CheckQuestion & { originalIndex: number } => q.type === 'check'),
    [questions]
  );
  
  const behavioralQuestionsWithOriginalIndex = useMemo(() => 
    questions
      .map((q, index) => ({ ...q, originalIndex: index }))
      .filter((q): q is BehavioralQuestion & { originalIndex: number } => q.type === 'behavioral'),
    [questions]
  );


  return (
    <>
      {isModalOpen && modalType && (
          <AddQuestionModal 
              type={modalType}
              onAdd={handleAddQuestionFromModal}
              onClose={handleCloseModal}
          />
      )}
      <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">{isEditing ? 'Editar Vaga' : 'Revisar Perguntas'}</h1>
        <p className="text-slate-400 mb-8 text-center">
          {isEditing ? 'Ajuste, adicione ou remova perguntas do roteiro desta vaga.' : 'Ajuste as perguntas e os critérios de avaliação gerados pela IA.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Checks Section */}
          {checkQuestionsWithOriginalIndex.length > 0 && isEditing && (
            <div className="space-y-3">
              {checkQuestionsWithOriginalIndex.map((q, index) => (
                <div 
                  key={q.originalIndex} 
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-slate-900/50 transition-colors"
                  style={{ opacity: deletingIndex === q.originalIndex ? 0.5 : 1 }}
                >
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 shrink-0">
                    Check {index + 1}
                  </span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(q.originalIndex, e.target.value)}
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder='Digite a pergunta de Sim/Não...'
                  />
                  <div className="shrink-0 flex items-center gap-2">
                    <button type="button" onClick={() => handleExpectedAnswerChange(q.originalIndex, 'yes')} className={`px-4 py-2 rounded-md text-sm font-semibold ${q.expectedAnswer === 'yes' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Sim</button>
                    <button type="button" onClick={() => handleExpectedAnswerChange(q.originalIndex, 'no')} className={`px-4 py-2 rounded-md text-sm font-semibold ${q.expectedAnswer === 'no' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Não</button>
                  </div>
                  <div className="shrink-0">
                    {deletingIndex === q.originalIndex ? (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <button type="button" onClick={() => setDeletingIndex(null)} className="text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                        <button type="button" onClick={() => handleDeleteQuestion(q.originalIndex)} className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-900/50 px-3 py-1 rounded">Confirmar</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeletingIndex(q.originalIndex)} className="text-slate-500 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Behavioral Questions Section */}
          {behavioralQuestionsWithOriginalIndex.length > 0 && (
             <div className="space-y-6">
                {behavioralQuestionsWithOriginalIndex.map((q, index) => (
                    <div 
                      key={q.originalIndex} 
                      className={`bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative transition-opacity duration-300 ${isEditing ? 'pb-14' : ''}`} 
                      style={{ opacity: deletingIndex === q.originalIndex ? 0.5 : 1 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold px-3 py-1 rounded-full bg-cyan-800 text-cyan-200">
                          Pergunta {index + 1}
                        </span>
                      </div>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleQuestionChange(q.originalIndex, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        rows={3}
                        placeholder='Digite a pergunta padrão...'
                      />
                      <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-semibold text-slate-300">Critérios de Avaliação</h4>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${pointsSums[q.originalIndex] === 10 ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                  Total: {pointsSums[q.originalIndex]} / 10
                              </span>
                          </div>
                          <div className="space-y-2">
                              {q.criteria.map((c, cIndex) => (
                                  <div key={cIndex} className="flex gap-2 items-start">
                                      <textarea
                                          value={c.text}
                                          onChange={(e) => handleCriterionChange(q.originalIndex, cIndex, 'text', e.target.value)}
                                          className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-sm text-white"
                                          rows={2}
                                      />
                                      <input
                                          type="number"
                                          value={c.points}
                                          onChange={(e) => handleCriterionChange(q.originalIndex, cIndex, 'points', e.target.value)}
                                          className="w-20 bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-sm text-white text-center"
                                          min="0"
                                          max="10"
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                      {isEditing && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            {deletingIndex === q.originalIndex ? (
                              <div className="flex items-center gap-2 animate-fadeIn">
                                <button type="button" onClick={() => setDeletingIndex(null)} className="text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                                <button type="button" onClick={() => handleDeleteQuestion(q.originalIndex)} className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-900/50 px-3 py-1 rounded">Confirmar</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setDeletingIndex(q.originalIndex)} className="text-slate-500 hover:text-red-500 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                      )}
                    </div>
                ))}
            </div>
          )}

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
                <div className="w-full">
                    <button type="button" onClick={() => handleOpenModal('behavioral')} className="w-full text-center py-2 px-4 border border-slate-600 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-medium text-slate-300">
                        Adicionar Pergunta
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-1">Pergunta padrão com critérios.</p>
                </div>
                <div className="w-full">
                    <button type="button" onClick={() => handleOpenModal('check')} className="w-full text-center py-2 px-4 border border-slate-600 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-medium text-slate-300">
                      Adicionar Check
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-1">Pergunta de Sim/Não para pré-requisitos.</p>
                </div>
            </div>
          )}
          
          {isAnyPointsSumInvalid && (
              <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">
                  A soma dos pontos de todos os critérios para cada pergunta padrão deve ser exatamente 10.
              </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
            <button type="button" onClick={handleBack} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              Voltar
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingIcon className="w-5 h-5 mr-2" /> : null}
                {isLoading ? 'Regerando...' : 'Regerar Perguntas Padrão'}
              </button>
            )}
            <button 
              type="submit" 
              disabled={isAnyPointsSumInvalid}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Salvar Alterações' : 'Concluir e Salvar Vaga'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default QuestionEditor;