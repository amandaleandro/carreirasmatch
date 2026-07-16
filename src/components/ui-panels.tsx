"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Novidades e Tour guiado eram botões `fixed` no rodapé da tela e viviam
 * cobrindo o menu e os botões das páginas. Agora os gatilhos moram na sidebar
 * (e no menu mobile), longe dos painéis que eles abrem — então o estado precisa
 * ser compartilhado por aqui, em vez de viver dentro de cada componente.
 */
type UiPanels = {
  newsOpen: boolean;
  openNews: () => void;
  closeNews: () => void;
  /** Muda a cada pedido de tour; o GuidedTour observa e reinicia a partir disso. */
  tourNonce: number;
  openTour: () => void;
};

const UiPanelsContext = createContext<UiPanels | null>(null);

export function UiPanelsProvider({ children }: { children: React.ReactNode }) {
  const [newsOpen, setNewsOpen] = useState(false);
  const [tourNonce, setTourNonce] = useState(0);

  const openNews = useCallback(() => setNewsOpen(true), []);
  const closeNews = useCallback(() => setNewsOpen(false), []);
  const openTour = useCallback(() => setTourNonce((nonce) => nonce + 1), []);

  const value = useMemo(
    () => ({ newsOpen, openNews, closeNews, tourNonce, openTour }),
    [newsOpen, openNews, closeNews, tourNonce, openTour]
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
