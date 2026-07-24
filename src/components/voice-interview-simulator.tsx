"use client";

import React, { useState, useEffect } from "react";

interface VoiceInterviewSimulatorProps {
  question: string;
  onAnswerComplete: (spokenText: string) => void;
}

export function VoiceInterviewSimulator({ question, onAnswerComplete }: VoiceInterviewSimulatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "pt-BR";

        rec.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        rec.onerror = (err: any) => {
          console.error("Erro no reconhecimento de voz:", err);
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (transcript.trim()) {
        onAnswerComplete(transcript);
      }
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  if (!speechSupported) {
    return (
      <div className="p-3 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
        ℹ️ Reconhecimento de voz não suportado neste navegador. Utilize o teclado.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
          🎙️ Modo Entrevista por Voz (Web Speech)
        </span>
        <button
          type="button"
          onClick={toggleListening}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            isListening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {isListening ? "⏹️ Parar Gravação" : "🎤 Responder Falando"}
        </button>
      </div>

      {isListening && (
        <p className="text-xs text-purple-700 dark:text-purple-300 animate-pulse font-medium">
          Gravando áudio... Fale sua resposta naturalmente.
        </p>
      )}

      {transcript && (
        <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-purple-100 dark:border-purple-900 text-xs text-neutral-800 dark:text-neutral-200">
          <strong className="text-purple-600 dark:text-purple-400">Transcrição em tempo real:</strong> "{transcript}"
        </div>
      )}
    </div>
  );
}
