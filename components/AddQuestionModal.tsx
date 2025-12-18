import React, { useState, useMemo } from 'react';
import { BehavioralQuestion, CheckQuestion, InterviewQuestion } from '../types';

interface AddQuestionModalProps {
    type: 'behavioral' | 'check';
    onAdd: (question: InterviewQuestion) => void;
    onClose: () => void;
}

const defaultBehavioralQuestion: BehavioralQuestion = {
    type: 'behavioral',
    question: '',
    criteria: [
        { text: '', points: 4 },
        { text: '', points: 3 },
        { text: '', points: 3 },
    ],
};
const defaultCheckQuestion: CheckQuestion = {
    type: 'check',
    question: '',
    expectedAnswer: 'yes',
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ type, onAdd, onClose }) => {
    const [questionData, setQuestionData] = useState<InterviewQuestion>(
        type === 'behavioral' ? { ...defaultBehavioralQuestion } : { ...defaultCheckQuestion }
    );

    const handleQuestionTextChange = (value: string) => {
        setQuestionData(prev => ({...prev, question: value}));
    };
    
    const handleExpectedAnswerChange = (value: 'yes' | 'no') => {
        if(questionData.type === 'check') {
            setQuestionData(prev => ({...prev, expectedAnswer: value}));
        }
    };

    const handleCriterionChange = (cIndex: number, field: 'text' | 'points', value: string | number) => {
        if (questionData.type === 'behavioral') {
            const newCriteria = [...questionData.criteria];
            let processedValue = value;
            if (field === 'points') {
                processedValue = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
                if (processedValue < 0) processedValue = 0;
                if (processedValue > 10) processedValue = 10;
            }
            (newCriteria[cIndex] as any)[field] = processedValue;
            setQuestionData(prev => ({...prev, criteria: newCriteria}));
        }
    };
    
    const pointsSum = useMemo(() => {
        if (questionData.type === 'behavioral') {
            return questionData.criteria.reduce((sum, c) => sum + c.points, 0);
        }
        return 0;
    }, [questionData]);

    const isBehavioralInvalid = useMemo(() => {
        if (questionData.type !== 'behavioral') return false;
        return !questionData.question.trim() || questionData.criteria.some(c => !c.text.trim()) || pointsSum !== 10;
    }, [questionData, pointsSum]);
    
    const isCheckInvalid = useMemo(() => {
        if (questionData.type !== 'check') return false;
        return !questionData.question.trim();
    }, [questionData]);
    
    const isInvalid = isBehavioralInvalid || isCheckInvalid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isInvalid) {
            onAdd(questionData);
        }
    };

    const title = type === 'behavioral' ? 'Adicionar Pergunta' : 'Adicionar Check';

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
                    
                    {questionData.type === 'behavioral' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Pergunta</label>
                                <textarea
                                    value={questionData.question}
                                    onChange={(e) => handleQuestionTextChange(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                    rows={3}
                                    placeholder="Ex: Conte sobre uma situação em que você..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-slate-300">Critérios de Avaliação</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${pointsSum === 10 ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                        Total: {pointsSum} / 10
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {questionData.criteria.map((c, cIndex) => (
                                        <div key={cIndex} className="flex gap-2 items-start">
                                            <textarea
                                                value={c.text}
                                                onChange={(e) => handleCriterionChange(cIndex, 'text', e.target.value)}
                                                className="flex-grow bg-slate-900 border border-slate-600 rounded-md py-1 px-2 text-sm text-white"
                                                rows={2}
                                                placeholder={`Critério ${cIndex + 1}`}
                                            />
                                            <input
                                                type="number"
                                                value={c.points}
                                                onChange={(e) => handleCriterionChange(cIndex, 'points', e.target.value)}
                                                className="w-20 bg-slate-900 border border-slate-600 rounded-md py-1 px-2 text-sm text-white text-center"
                                                min="0"
                                                max="10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Check de Pré-requisito</label>
                            <input
                                type="text"
                                value={questionData.question}
                                onChange={(e) => handleQuestionTextChange(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="Ex: Você possui mais de 5 anos de experiência com React?"
                                autoFocus
                            />
                            <div className="mt-4 flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-300">Resposta Esperada:</span>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => handleExpectedAnswerChange('yes')} className={`px-4 py-2 rounded-md text-sm font-semibold ${questionData.expectedAnswer === 'yes' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Sim</button>
                                    <button type="button" onClick={() => handleExpectedAnswerChange('no')} className={`px-4 py-2 rounded-md text-sm font-semibold ${questionData.expectedAnswer === 'no' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Não</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
                        <button type="button" onClick={onClose} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isInvalid}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                           Adicionar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestionModal;
