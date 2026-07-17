"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/**
 * Novidades e Tour guiado eram botões `fixed` no rodapé da tela e viviam
 * cobrindo o menu e os botões das páginas. Agora os gatilhos moram na sidebar
 * (e no menu mobile), longe dos painéis que eles abrem - então o estado precisa
 * ser compartilhado por aqui, em vez de viver dentro de cada componente.
 */
type UiPanels = {
  newsOpen: boolean;
  openNews: () => void;
  closeNews: () => void;
  /**
   * O GuidedTour registra aqui a própria função de iniciar; a sidebar/menu
   * chamam `openTour()`, que a dispara. Registrar uma ref (em vez de um nonce
   * observado por effect) evita setState síncrono dentro de useEffect.
   */
  openTour: () => void;
  registerTourStart: (fn: () => void) => void;
};

const UiPanelsContext = createContext<UiPanels | null>(null);

export function UiPanelsProvider({ children }: { children: React.ReactNode }) {
  const [newsOpen, setNewsOpen] = useState(false);
  const tourStartRef = useRef<(() => void) | null>(null);

  const openNews = useCallback(() => setNewsOpen(true), []);
  const closeNews = useCallback(() => setNewsOpen(false), []);
  const registerTourStart = useCallback((fn: () => void) => {
    tourStartRef.current = fn;
  }, []);
  const openTour = useCallback(() => tourStartRef.current?.(), []);

  const value = useMemo(
    () => ({ newsOpen, openNews, closeNews, openTour, registerTourStart }),
    [newsOpen, openNews, closeNews, openTour, registerTourStart]
  );

  return <UiPanelsContext.Provider value={value}>{children}</UiPanelsContext.Provider>;
}

export function useUiPanels(): UiPanels {
  const context = useContext(UiPanelsContext);
  if (!context) {
    throw new Error("useUiPanels precisa estar dentro de <UiPanelsProvider>.");
  }
  return context;
}
