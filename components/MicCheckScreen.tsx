import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import LoadingIcon from './icons/LoadingIcon';
import AudioWaveIcon from './icons/AudioWaveIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const MicCheckScreen: React.FC = () => {
  const { handleMicCheckComplete, goBackToVacancies, isLoading, audioContext, setAudioContext } = useAppContext();
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicReady, setIsMicReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [statusText, setStatusText] = useState("Aguardando som do microfone...");

  const isDetectionTriggeredRef = useRef(false);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualizerBarsRef = useRef<HTMLDivElement[]>([]);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    // O AudioContext compartilhado não é fechado aqui.
  }, []);

  const setupMic = useCallback(async () => {
    setMicError(null);
    setIsChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Cria ou reutiliza o AudioContext compartilhado com a taxa de amostragem correta.
      const context = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!audioContext) {
        setAudioContext(context);
      }
      
      if (context.state === 'suspended') await context.resume();

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      source.connect(analyser);
      
      setIsChecking(false);
      
      const draw = () => {
          if (!analyserRef.current || !visualizerBarsRef.current.length) {
            animationFrameRef.current = requestAnimationFrame(draw);
            return;
          }

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
          }
          const average = sum / bufferLength;

          if (average > 10 && !isDetectionTriggeredRef.current) {
              isDetectionTriggeredRef.current = true;
              setStatusText("Detectando som...");

              detectionTimeoutRef.current = setTimeout(() => {
                  setIsMicReady(true);
                  setStatusText('Ótimo! Microfone detectado com sucesso.');
              }, 1000);
          }
          
          visualizerBarsRef.current.forEach((bar, index) => {
            const barHeight = (dataArray[index * 2] / 255) * 100;
            if (bar) bar.style.height = `${barHeight}%`;
          });

          animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();

    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setMicError("Permissão para o microfone foi negada. Por favor, habilite o acesso nas configurações do seu navegador e recarregue a página.");
      } else {
        setMicError("Não foi possível acessar o microfone. Verifique se ele está conectado e funcionando corretamente.");
      }
      setIsChecking(false);
    }
  }, [audioContext, setAudioContext]);
  
  useEffect(() => {
    setupMic();
    return () => cleanup();
  }, [setupMic, cleanup]);


  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg">
      <div className="text-center">
        <AudioWaveIcon className="w-12 h-12 text-cyan-400 mb-4 mx-auto"/>
        <h2 className="text-2xl font-bold text-white mb-2">Verificação de Microfone</h2>
        <p className="text-slate-400 mb-8">Diga "Olá" ou fale algumas palavras para que possamos calibrar seu microfone.</p>
      </div>

      <div className="flex justify-center items-center bg-slate-900/50 h-32 rounded-lg p-4 mt-6 mb-4">
        {isChecking && <LoadingIcon className="w-8 h-8 text-cyan-500" />}
        {micError && <p className="text-red-400 text-center text-sm max-w-md">{micError}</p>}
        {!isChecking && !micError && (
          <div className="flex justify-center items-end h-full w-full gap-1">
            {Array.from({ length: 32 }).map((_, i) => (
              <div 
                key={i} 
                ref={el => { if (el) visualizerBarsRef.current[i] = el; }}
                className="w-full bg-cyan-500 rounded-t-full"
                style={{ height: '1%', transition: 'height 0.1s ease-out' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center h-6 mb-6">
        {!isChecking && !micError && (
          <div className={`flex items-center justify-center gap-2 transition-all duration-300 ${isMicReady ? 'text-green-400' : 'text-slate-400'}`}>
            {isMicReady && <CheckCircleIcon className="w-5 h-5" />}
            <p className={`${isMicReady ? 'font-semibold' : (statusText === 'Aguardando som do microfone...' ? 'animate-pulse' : '')}`}>
              {statusText}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row-reverse gap-4 pt-6 border-t border-slate-700">
        <button
          onClick={handleMicCheckComplete}
          disabled={isLoading || !isMicReady}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Aguarde...' : 'Continuar para a Entrevista'}
        </button>
        <button
          type="button"
          onClick={goBackToVacancies}
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default MicCheckScreen;
