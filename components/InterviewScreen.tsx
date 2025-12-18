import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/generative-ai';
import { UserAnswer, BehavioralQuestion } from '../types';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import LoadingIcon from './icons/LoadingIcon';
import { useAppContext } from '../contexts/AppContext';
import ExclamationIcon from './icons/ExclamationIcon';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const PREP_TIME_SECONDS = 45;
const RECORD_TIME_SECONDS = 180; // 3 minutes

// --- Funções de áudio ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- ---

type InterviewPhase = 'preparing' | 'recording' | 'answered' | 'processing' | 'terminated';

const InterviewScreen: React.FC = () => {
  const { 
    handleInterviewComplete, 
    interviewKeywords, 
    goBackToVacancies,
    audioContext, // Consumir o AudioContext compartilhado
    currentInterviewScript,
  } = useAppContext();
  const questions = currentInterviewScript.filter((q): q is BehavioralQuestion => q.type === 'behavioral') || [];

  const [phase, setPhase] = useState<InterviewPhase>('preparing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [timer, setTimer] = useState(PREP_TIME_SECONDS);

  // Anti-cheating state
  const [focusWarnings, setFocusWarnings] = useState(0);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const remainingTimeRef = useRef(0);
  const pausedPhaseRef = useRef<InterviewPhase>('preparing');
  
  // --- Refs de Áudio ---
  // Recursos por pergunta, são criados e destruídos a cada gravação
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Refs de controle
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTranscriptRef = useRef('');

  const cleanupPerQuestionResources = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.onmessage = null;
        audioWorkletNodeRef.current.disconnect();
    }
    sourceNodeRef.current?.disconnect();

    mediaStreamRef.current = null;
    sourceNodeRef.current = null;
    audioWorkletNodeRef.current = null;
  }, []);
  
  // Efeito de Cleanup no unmount: Garante que os recursos de áudio sejam liberados.
  useEffect(() => {
    return () => {
      cleanupPerQuestionResources();
    };
  }, [cleanupPerQuestionResources]);

  const handleFinalizeAnswer = useCallback(() => {
    const finalAnswer: UserAnswer = {
      question: questions[currentQuestionIndex].question,
      answer: currentTranscriptRef.current.trim() || "(O candidato não respondeu)",
    };
    setAnswers(prev => [...prev, finalAnswer]);
    
    setTranscript(currentTranscriptRef.current.trim());
    currentTranscriptRef.current = '';
    
    setPhase('answered');
  }, [questions, currentQuestionIndex]);

  const startTimer = useCallback((duration: number) => {
    setTimer(duration);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
            if (prev <= 1) {
                clearInterval(timerIntervalRef.current!);
                timerIntervalRef.current = null;
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  }, []);

  const startRecording = useCallback(async () => {
    if (phase !== 'preparing') return;
    
    if (!audioContext) {
        setMicError("O ambiente de áudio não está pronto. Tente recarregar a página.");
        setPhase('terminated');
        return;
    }
    const context = audioContext;

    setMicError(null);
    currentTranscriptRef.current = '';
    setTranscript('');
    setPhase('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      if (context.state === 'suspended') await context.resume();
      
      sourceNodeRef.current = context.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(context, 'audio-processor');
      audioWorkletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
          const pcmBlob = createBlob(event.data);
          sessionPromiseRef.current?.then((session) => {
              if(session) session.sendRealtimeInput({ media: pcmBlob });
          }).catch((e) => console.error("Erro ao enviar dados de áudio na sessão:", e));
      };

      sourceNodeRef.current.connect(workletNode);
      workletNode.connect(context.destination);

      const currentQuestion = questions[currentQuestionIndex];
      const systemInstruction = `Você é uma IA conduzindo uma entrevista. Apenas escute e transcreva a resposta do candidato. Para melhorar a precisão da transcrição de áudio, aqui está uma lista de termos técnicos, conceitos e palavras-chave relevantes para esta vaga. Preste atenção especial a estas palavras durante a transcrição. Palavras-chave de contexto: ${interviewKeywords || 'geral'}. A pergunta atual é: "${currentQuestion.question}"`;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Sessão aberta.');
            startTimer(RECORD_TIME_SECONDS);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentTranscriptRef.current += text;
              setTranscript(prev => prev + text);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Erro na sessão:', e);
            setMicError("Ocorreu um erro de conexão. A gravação foi interrompida.");
            cleanupPerQuestionResources();
            handleFinalizeAnswer();
          },
          onclose: () => {
            console.log('Sessão fechada.');
            cleanupPerQuestionResources();
            handleFinalizeAnswer();
          },
        },
        config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, systemInstruction },
      });
    } catch (error) {
      console.error("Erro ao iniciar a gravação:", error);
      setMicError(error instanceof DOMException && error.name === 'NotAllowedError' ? "Permissão para o microfone foi negada." : "Não foi possível acessar o microfone.");
      cleanupPerQuestionResources();
      setPhase('answered');
    }
  }, [phase, audioContext, cleanupPerQuestionResources, handleFinalizeAnswer, interviewKeywords, startTimer, questions, currentQuestionIndex]);

  const stopRecording = useCallback(async () => {
    if (phase !== 'recording') return;
    
    setPhase('processing');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    
    // Apenas fecha a sessão. O callback onclose cuidará da limpeza e finalização.
    sessionPromiseRef.current?.then(session => session?.close()).catch(e => {
        console.error("Erro ao fechar sessão, limpando manualmente:", e);
        cleanupPerQuestionResources();
        handleFinalizeAnswer();
    });
  }, [phase, cleanupPerQuestionResources, handleFinalizeAnswer]);

  // Efeito 1: Lida com as consequências de o cronômetro chegar a zero.
  useEffect(() => {
    if (timer > 0 || isFocusModalOpen) {
      return; // Só age quando o cronômetro zera e a entrevista não está pausada.
    }

    if (phase === 'preparing') {
      startRecording();
    } else if (phase === 'recording') {
      stopRecording();
    }
  }, [timer, phase, isFocusModalOpen, startRecording, stopRecording]);

  // Efeito 2: Inicia e gerencia o intervalo do cronômetro com base nas mudanças de fase ou ao retomar.
  useEffect(() => {
    // Se o modal de foco estiver aberto, os cronômetros são pausados e gerenciados pela lógica do modal.
    if (isFocusModalOpen) {
      return;
    }

    if (phase === 'preparing') {
      // Se estivermos retomando de uma pausa, usa o tempo restante. Caso contrário, usa o tempo completo.
      const duration = remainingTimeRef.current > 0 ? remainingTimeRef.current : PREP_TIME_SECONDS;
      startTimer(duration);
      // Reseta o tempo restante após o uso para evitar reutilizar um tempo obsoleto.
      remainingTimeRef.current = 0;
    } else if (phase === 'recording' && remainingTimeRef.current > 0) {
      // Caso específico para retomar o cronômetro de gravação após uma pausa.
      const duration = remainingTimeRef.current;
      startTimer(duration);
      remainingTimeRef.current = 0;
    }
    // O cronômetro de gravação é iniciado normalmente dentro do callback `onopen` da função `startRecording`.

    // Função de limpeza para limpar qualquer cronômetro em execução quando a fase muda ou o componente é desmontado.
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [phase, isFocusModalOpen, startTimer]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            if (phase === 'terminated' || isFocusModalOpen) return;

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            remainingTimeRef.current = timer;
            pausedPhaseRef.current = phase;

            if (focusWarnings === 0) {
                setFocusWarnings(1);
                setIsFocusModalOpen(true);
            } else {
                setPhase('terminated');
                cleanupPerQuestionResources();
            }
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timer, focusWarnings, phase, cleanupPerQuestionResources, isFocusModalOpen]);


  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript('');
      setPhase('preparing');
    } else {
      handleInterviewComplete(answers);
    }
  };

  const handleResumeAfterWarning = () => {
    setIsFocusModalOpen(false);
    // O useEffect [phase, isFocusModalOpen] agora cuidará de reiniciar o cronômetro
    // usando o valor armazenado em remainingTimeRef.
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isFocusModalOpen) {
    const isRecordingPaused = pausedPhaseRef.current === 'recording';
    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center" style={{minHeight: '550px'}}>
            <ExclamationIcon className="w-16 h-16 text-yellow-400 mb-4"/>
            <h2 className="text-2xl font-bold text-white mb-4">Atenção: Foco na Entrevista</h2>
            <div className="text-slate-300 max-w-md mb-8 space-y-4">
              <p>Detectamos que você trocou de janela. Sua entrevista foi pausada para garantir a integridade da avaliação.</p>
              
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                  <p>
                      {isRecordingPaused 
                          ? "Sua gravação será retomada. Você ainda tem" 
                          : "O tempo de preparação será retomado. Você ainda tem"}
                      <strong className="text-white mx-1.5 text-lg">{formatTime(remainingTimeRef.current)}</strong>
                      restantes.
                  </p>
              </div>

              <p className="font-bold text-yellow-300 text-sm">
                Esta é sua primeira advertência. Se você sair da tela novamente, a entrevista será cancelada.
              </p>
            </div>
            <button onClick={handleResumeAfterWarning} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                Entendi, voltar à entrevista
            </button>
        </div>
    );
  }

  if (phase === 'terminated') {
      return (
          <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center" style={{minHeight: '550px'}}>
              <ExclamationIcon className="w-16 h-16 text-red-500 mb-4"/>
              <h2 className="text-2xl font-bold text-white mb-4">Entrevista Cancelada</h2>
              <p className="text-slate-300 max-w-md mb-8">{micError || "Esta sessão foi encerrada porque a janela da entrevista perdeu o foco múltiplas vezes. Entre em contato com o recrutador para mais informações."}</p>
              <button onClick={goBackToVacancies} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all">
                  Voltar à Lista de Vagas
              </button>
          </div>
      );
  }

  const renderContent = () => {
    switch(phase) {
        case 'preparing':
            return (
                <>
                  <p className="text-cyan-400 font-semibold mb-2">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
                  <h2 className="text-2xl font-bold mb-6">{questions[currentQuestionIndex]?.question}</h2>
                  <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 mb-2">Tempo para preparar:</p>
                    <div className="text-7xl font-bold font-mono text-cyan-400">{formatTime(timer)}</div>
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-4">
                     <button onClick={startRecording} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                        Começar a Gravar Agora
                     </button>
                  </div>
                </>
            );

        case 'recording':
        case 'processing':
            return (
                <>
                  <p className="text-cyan-400 font-semibold mb-2">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
                  <h2 className="text-2xl font-bold mb-6">{questions[currentQuestionIndex]?.question}</h2>
                  <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 relative flex-grow">
                     <p className="text-slate-300 whitespace-pre-wrap">{transcript || "Gravando sua resposta..."}</p>
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="text-3xl font-mono text-slate-300 w-full text-center h-10 flex items-center justify-center">
                       {formatTime(timer)}
                    </div>
                    <button
                        onClick={() => stopRecording()}
                        disabled={phase === 'processing'}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${phase === 'recording' ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-slate-600 cursor-not-allowed'}`}
                    >
                        {phase === 'processing' ? <LoadingIcon className="w-8 h-8"/> : <StopIcon className="w-8 h-8"/>}
                    </button>
                  </div>
                </>
            );

        case 'answered':
            return (
                <>
                  <p className="text-cyan-400 font-semibold mb-2">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
                  <h2 className="text-2xl font-bold mb-6">{questions[currentQuestionIndex]?.question}</h2>
                  <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 relative flex-grow">
                     <h3 className="text-sm font-semibold text-slate-400 mb-2">Sua resposta gravada:</h3>
                     <p className="text-slate-300 whitespace-pre-wrap">{transcript || "(Não houve resposta)"}</p>

                  </div>
                  {micError && <p className="text-red-400 text-center mt-4">{micError}</p>}
                  <div className="mt-6 flex flex-col items-center gap-4">
                     <button onClick={handleNext} className="w-full max-w-xs flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all">
                       <span>{currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar e Avaliar'}</span>
                       <ArrowRightIcon className="w-5 h-5"/>
                     </button>
                  </div>
                </>
            );
        default: return null;
    }
  };
  
  return (
    <div 
        className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg flex flex-col" 
        style={{minHeight: '550px', userSelect: 'none'}}
    >
      {renderContent()}
    </div>
  );
};

export default InterviewScreen;
