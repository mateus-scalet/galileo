import React, { useState, useRef, useEffect, useCallback } from "react";
import { UserAnswer, BehavioralQuestion } from "../types";
import StopIcon from "./icons/StopIcon";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import { useAppContext } from "../contexts/AppContext";

const PREP_TIME_SECONDS = 45;
const RECORD_TIME_SECONDS = 180;

type InterviewPhase =
  | "preparing"
  | "recording"
  | "answered"
  | "processing"
  | "terminated";

const InterviewScreen: React.FC = () => {
  const {
    handleInterviewComplete,
    currentInterviewScript,
    audioContext,
  } = useAppContext();

  const questions =
    currentInterviewScript.filter(
      (q): q is BehavioralQuestion => q.type === "behavioral"
    ) || [];

  const [phase, setPhase] = useState<InterviewPhase>("preparing");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(PREP_TIME_SECONDS);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTranscriptRef = useRef("");

  const startTimer = useCallback((duration: number) => {
    setTimer(duration);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimer((p) => {
        if (p <= 1) {
          clearInterval(timerIntervalRef.current!);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, []);

  const handleFinalize = useCallback(() => {
    const ans: UserAnswer = {
      question: questions[currentQuestionIndex].question,
      answer: currentTranscriptRef.current.trim() || "(Resposta não registrada)",
    };
    setAnswers((prev) => [...prev, ans]);
    setTranscript(currentTranscriptRef.current.trim());
    currentTranscriptRef.current = "";
    setPhase("answered");
  }, [questions, currentQuestionIndex]);

  const startRecording = useCallback(() => {
    if (phase !== "preparing") return;
    setTranscript("");
    currentTranscriptRef.current = "";
    setPhase("recording");
    startTimer(RECORD_TIME_SECONDS);
  }, [phase, startTimer]);

  const stopRecording = useCallback(() => {
    if (phase !== "recording") return;
    setPhase("processing");
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    handleFinalize();
  }, [phase, handleFinalize]);

  useEffect(() => {
    if (timer === 0) {
      if (phase === "preparing") startRecording();
      else if (phase === "recording") stopRecording();
    }
  }, [timer, phase, startRecording, stopRecording]);

  useEffect(() => {
    if (phase === "preparing") startTimer(PREP_TIME_SECONDS);
  }, [phase, startTimer]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setTranscript("");
      setPhase("preparing");
    } else {
      handleInterviewComplete(answers);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg flex flex-col min-h-[550px]">
      {phase === "preparing" && (
        <div className="flex flex-col h-full">
          <p className="text-cyan-400 font-semibold mb-2">
            Pergunta {currentQuestionIndex + 1}
          </p>
          <h2 className="text-2xl font-bold mb-6 text-white">
            {questions[currentQuestionIndex]?.question}
          </h2>
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="text-7xl font-bold font-mono text-cyan-400">
              {formatTime(timer)}
            </div>
            <button
              onClick={startRecording}
              className="mt-8 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Começar Agora
            </button>
          </div>
        </div>
      )}

      {(phase === "recording" || phase === "processing") && (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {questions[currentQuestionIndex]?.question}
          </h2>
          <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 flex-grow">
            <p className="text-slate-300">
              {transcript || "Gravação em andamento…"}
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <div className="text-3xl font-mono text-slate-300 mb-4">
              {formatTime(timer)}
            </div>
            <button
              onClick={stopRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                phase === "recording"
                  ? "bg-red-600 animate-pulse"
                  : "bg-slate-600"
              }`}
            >
              <StopIcon className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      )}

      {phase === "answered" && (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Resposta Registrada
          </h2>
          <div className="bg-slate-900 rounded-lg p-4 min-h-[150px] border border-slate-700 flex-grow">
            <p className="text-slate-300">{transcript}</p>
          </div>
          <button
            onClick={handleNext}
            className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {currentQuestionIndex < questions.length - 1
              ? "Próxima"
              : "Finalizar"}{" "}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewScreen;
