import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import UploadCloudIcon from './icons/UploadCloudIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const AddCandidateModal: React.FC = () => {
    const { setIsAddCandidateModalOpen, handleAddCandidates, selectedVacancy, isLoading } = useAppContext();
    const [name, setName] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File | null) => {
        if (file) {
            if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB limit
                setCvFile(file);
                setFileError(null);
            } else {
                const error = file.type !== 'application/pdf' ? 'Por favor, selecione um arquivo PDF.' : 'O arquivo não pode ser maior que 10MB.';
                setFileError(error);
                setCvFile(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files?.[0] || null);
    };
  
    const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);
  
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files?.[0] || null);
    }, []);

    const handleRemoveFile = () => {
        setCvFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
    
    const handleAddWithoutCv = () => {
        if (name.trim()) {
            handleAddCandidates([{ name: name.trim() }]);
        }
    };

    const handleSubmitWithCv = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && cvFile) {
            handleAddCandidates([{ name: name.trim(), cvFile }]);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
            onClick={() => setIsAddCandidateModalOpen(false)}
        >
            <div 
                className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmitWithCv} className="flex flex-col gap-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Adicionar Candidato</h2>
                        <p className="text-slate-400 mt-1">Para a vaga de <strong className="text-cyan-400">{selectedVacancy?.jobDetails.title}</strong></p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="candidate-name" className="block text-sm font-medium text-slate-300 mb-1">
                                Nome do Candidato
                            </label>
                            <input
                                id="candidate-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nome completo do candidato"
                                className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Currículo
                            </label>
                            {cvFile ? (
                                <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-2 border-green-500/50 rounded-lg text-center">
                                    <CheckCircleIcon className="w-8 h-8 text-green-400 mb-2" />
                                    <p className="text-sm font-semibold text-white truncate max-w-full">{cvFile.name}</p>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="mt-2 text-xs font-semibold text-cyan-500 hover:text-cyan-400"
                                    >
                                        Trocar Arquivo
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onDragEnter={handleDragEvents}
                                    onDragOver={handleDragEvents}
                                    onDragLeave={handleDragEvents}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-cyan-500 bg-slate-900/50' : 'border-slate-600'}`}
                                >
                                    <UploadCloudIcon className="w-10 h-10 text-slate-500 mb-2" />
                                    <p className="text-sm text-slate-400">
                                        <span 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="font-semibold text-cyan-500 hover:text-cyan-400 cursor-pointer"
                                        >
                                            Clique para carregar
                                        </span> ou arraste e solte
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">PDF (máx. 10MB)</p>
                                    <input 
                                        id="candidate-cv" 
                                        name="candidate-cv" 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange} 
                                        accept="application/pdf" 
                                        ref={fileInputRef}
                                    />
                                </div>
                            )}
                            {fileError && <p className="text-red-400 text-xs mt-1 text-center">{fileError}</p>}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700 space-y-3">
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                             <button type="button" onClick={() => setIsAddCandidateModalOpen(false)} className="w-full flex justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim() || !cvFile || isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                               Adicionar e Analisar CV
                            </button>
                        </div>
                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={handleAddWithoutCv}
                                disabled={!name.trim() || isLoading}
                                className="text-sm text-slate-400 underline hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Adicionar candidato sem currículo
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCandidateModal;
