import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import LoadingIcon from './icons/LoadingIcon';
import UploadCloudIcon from './icons/UploadCloudIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const CvUploadScreen: React.FC = () => {
  const { 
    handleCvAnalysis, 
    selectedVacancy, 
    handleViewVacancyResults, 
    isLoading,
    currentCandidateForCvAnalysis 
  } = useAppContext();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cvFile && currentCandidateForCvAnalysis) {
      handleCvAnalysis(cvFile, currentCandidateForCvAnalysis);
    }
  };
  
  const handleBack = () => {
    if (selectedVacancy) {
        handleViewVacancyResults(selectedVacancy);
    }
  }

  const handleRemoveFile = () => {
    setCvFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }
  
  const candidateName = currentCandidateForCvAnalysis?.candidateName || 'Candidato';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Analisar Currículo</h1>
      <p className="text-slate-400 mb-8 text-center">
        Análise para o candidato <strong className="text-white">{candidateName}</strong> na vaga de <strong className="text-cyan-400">{selectedVacancy?.jobDetails.title}</strong>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {cvFile ? (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border-2 border-green-500/50 rounded-lg text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Arquivo Carregado:</p>
              <p className="text-base text-slate-300 truncate max-w-full">{cvFile.name}</p>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="mt-4 text-sm font-semibold text-cyan-500 hover:text-cyan-400"
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
              <UploadCloudIcon className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-sm text-slate-400 mb-2">
                <span 
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-cyan-500 hover:text-cyan-400 cursor-pointer"
                >
                  Clique para carregar
                </span> ou arraste e solte o arquivo aqui
              </p>
              <p className="text-xs text-slate-500">PDF (máx. 10MB)</p>
              <input 
                id="cvFile" 
                name="cvFile" 
                type="file" 
                className="sr-only" 
                onChange={handleFileChange} 
                accept="application/pdf" 
                ref={fileInputRef} 
                required
              />
            </div>
          )}
          {fileError && <p className="mt-2 text-sm text-red-400 text-center">{fileError}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button type="button" onClick={handleBack} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              Voltar
            </button>
            <button type="submit" disabled={isLoading || !cvFile} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isLoading ? <><LoadingIcon className="w-5 h-5 mr-2" /> Analisando...</> : 'Analisar com IA'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CvUploadScreen;