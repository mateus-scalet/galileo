import React, { useState, useRef } from 'react';
import { api } from '../services/apiService';

const InterviewScreen: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setLog(l => [...l, '🎤 Solicitando microfone...']);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstart = () => {
      setLog(l => [...l, '▶️ Gravação iniciada']);
      setRecording(true);
    };

    mediaRecorder.onstop = async () => {
      setLog(l => [...l, '⏹️ Gravação finalizada']);
      setRecording(false);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setLog(l => [...l, `📦 Áudio gerado (${audioBlob.size} bytes)`]);

      await api.sendInterviewAudio(audioBlob);
      setLog(l => [...l, '✅ Áudio enviado para o backend']);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Teste de Entrevista (Microfone)</h2>

      {!recording && (
        <button onClick={startRecording}>🎙️ Começar gravação</button>
      )}

      {recording && (
        <button onClick={stopRecording}>⏹️ Parar gravação</button>
      )}

      <pre style={{ marginTop: 20, background: '#111', color: '#0f0', padding: 12 }}>
        {log.join('\n')}
      </pre>
    </div>
  );
};

export default InterviewScreen;
