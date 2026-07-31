"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type FeedbackTone = "success" | "error" | "info";

type FeedbackItem = {
  id: number;
  tone: FeedbackTone;
  message: string;
};

type FeedbackContextValue = {
  notify: (tone: FeedbackTone, message: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((tone: FeedbackTone, message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="feedback-viewport" aria-live="polite" aria-relevant="additions text">
        {items.map((item) => {
          const Icon = icons[item.tone];
          return (
            <div key={item.id} className={`feedback-toast feedback-toast-${item.tone}`} role={item.tone === "error" ? "alert" : "status"}>
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <p>{item.message}</p>
              <button type="button" className="feedback-toast-close" onClick={() => dismiss(item.id)} aria-label="Fechar aviso">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback precisa estar dentro de FeedbackProvider.");
  return context;
}
