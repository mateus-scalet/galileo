import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI, Modality, LiveServerMessage, Blob } from '@google/generative-ai';
import { UserAnswer, BehavioralQuestion } from '../types';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import LoadingIcon from './icons/LoadingIcon';
import { useAppContext } from '../contexts/AppContext';
import ExclamationIcon from './icons/ExclamationIcon';

// Ajuste para o padrão do Vite: import.meta.env
const ai = new GoogleGenerativeAI(import.meta.env.API_KEY as string);

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

type InterviewPhase = 'preparing' | 'recording' | 'answered' | 'processing' | 'terminated';

const InterviewScreen: React.FC = () => {
  const { 
    handleInterviewComplete, 
    interviewKeywords, 
    goBackToVacancies,
    audioContext, 
    currentInterviewScript,
  } = useAppContext();
  
  const questions = currentInterviewScript.filter((q): q is BehavioralQuestion => q.type === 'behavioral') || [];

  const [phase, setPhase] = useState<InterviewPhase>('preparing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [timer, setTimer] = useState(PREP_TIME_SECONDS);

  const [focusWarnings, setFocusWarnings] = useState(0);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const remainingTimeRef = useRef(0);
  const pausedPhaseRef = useRef<InterviewPhase>('preparing');
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sessionPromiseRef = useRef<any | null>(null);
  
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
  
  useEffect(() => {
    return () => cleanupPerQuestionResources();
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
        setMicError("O ambiente de áudio não está pronto.");
        setPhase('terminated');
        return;
    }

    setMicError(null);
    currentTranscriptRef.current = '';
    setTranscript('');
    setPhase('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      if (audioContext.state === 'suspended') await audioContext.resume();
      
      sourceNodeRef.current = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
          const pcmBlob = createBlob(event.data);
          if (sessionPromiseRef.current?.sendRealtimeInput) {
              sessionPromiseRef.current.sendRealtimeInput({ media: pcmBlob });
          }
      };

      sourceNodeRef.current.connect(workletNode);
      workletNode.connect(audioContext.destination);

      const currentQuestion = questions[currentQuestionIndex];
      const systemInstruction = `Você é uma IA de transcrição. Transcreva a resposta do candidato. Vaga: ${interviewKeywords || 'Geral'}. Pergunta: "${currentQuestion.question}"`;

      // Nota: Certifique-se de que a biblioteca instalada suporte .live.connect 
      // ou use o método de chat streaming padrão se esta versão for específica.
      sessionPromiseRef.current = (ai as any).live.connect({
        model: 'gemini-2.0-flash-exp', // Versão estável recomendada
        callbacks: {
          onopen: () => startTimer(RECORD_TIME_SECONDS),
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentTranscriptRef.current += text;
              setTranscript(prev => prev + text);
            }
          },
          onerror: (e: any) => {
            cleanupPerQuestionResources();
            handleFinalizeAnswer();
          },
          onclose: () => {
            cleanupPerQuestionResources();
            handleFinalizeAnswer();
          },
        },
        config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, systemInstruction },
      });
    } catch (error) {
      setMicError("Erro ao acessar microfone.");
      cleanupPerQuestionResources();
      setPhase('answered');
    }
  }, [phase, audioContext, cleanupPerQuestionResources, handleFinalizeAnswer, interviewKeywords, startTimer, questions, currentQuestionIndex]);

  const stopRecording = useCallback(async () => {
    if (phase !== 'recording') return;
    setPhase('processing');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    sessionPromiseRef.current?.close?.();
  }, [phase]);

  useEffect(() => {
    if (timer === 0 && !isFocusModalOpen) {
      if (phase === 'preparing') startRecording();
      else if (phase === 'recording') stopRecording();
    }
  }, [timer, phase, isFocusModalOpen, startRecording, stopRecording]);

  useEffect(() => {
    if (isFocusModalOpen) return;
    if (phase === 'preparing') {
      const duration = remainingTimeRef.current > 0 ? remainingTimeRef.current : PREP_TIME_SECONDS;
      startTimer(duration);
      remainingTimeRef.current = 0;
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase, isFocusModalOpen, startTimer]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript('');
      setPhase('preparing');
    } else {
      handleInterviewComplete(answers);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg flex flex-col" style={{minHeight: '550px', userSelect: 'none'}}>
      {phase === 'preparing' && (
        <>
          <p className="text-cyan-400 font-semibold mb-2">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
          <h2 className="text-2xl font-bold mb-6 text-white">{questions[currentQuestionIndex]?.question}</h2>
          <div className="flex-grow flex flex-col items-center justify-center">
            <p className="text-slate-400 mb-2">Tempo de preparação:</p>
            <div className="text-7xl font-bold font-mono text-cyan-400">{formatTime(timer)}</div>
            <button onClick={startRecording} className="mt-8 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg">
              Começar Agora
            </button>
          </div>
        </>
      )}

      {(phase === 'recording' || phase === 'processing') && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-white">{questions[currentQuestionIndex]?.question}</h2>
          <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 flex-grow">
            <p className="text-slate-300">{transcript || "Ouvindo..."}</p>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <div className="text-3xl font-mono text-slate-300 mb-4">{formatTime(timer)}</div>
            <button onClick={stopRecording} disabled={phase === 'processing'} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <StopIcon className="w-8 h-8 text-white"/>
            </button>
          </div>
        </>
      )}

      {phase === 'answered' && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-white">Resposta Registrada</h2>
          <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 flex-grow">
            <p className="text-slate-300">{transcript || "(Sem áudio detectado)"}</p>
          </div>
          <button onClick={handleNext} className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Entrevista'}
            <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </>
      )}
    </div>
  );
};

export default InterviewScreen;

