"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STORAGE_KEY = "cm_analysis_tour_completed";

/**
 * Tour de primeiro uso da tela de análise. Roda uma vez por navegador
 * (localStorage) e só se todos os elementos-alvo existirem na página.
 */
export function AnalysisTour() {
  useEffect(() => {
    if (localStorage.getItem(TOUR_STORAGE_KEY) === "true") return;

    const targets = ["#curriculo-upload", "#vaga-input", "#analisar-button"];
    if (targets.some((selector) => !document.querySelector(selector))) return;

    const timeout = window.setTimeout(() => {
      driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "Próximo",
        prevBtnText: "Voltar",
        doneBtnText: "Entendi",
        progressText: "{{current}} de {{total}}",
        onDestroyed: () => localStorage.setItem(TOUR_STORAGE_KEY, "true"),
        steps: [
          {
            element: "#curriculo-upload",
            popover: {
              title: "Envie seu currículo",
              description: "PDF ou Word, é comparado com a vaga que você colar ao lado.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#vaga-input",
            popover: {
              title: "Cole a vaga",
              description: "Requisitos e atribuições da vaga anunciada. Quanto mais completo, mais preciso o Match.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#analisar-button",
            popover: {
              title: "Calcule seu Match",
              description: "Mostra sua aderência real, os pontos fortes e o que ajustar antes de se candidatar.",
              side: "top",
              align: "center",
            },
          },
        ],
      }).drive();
    }, 600);

    return () => window.clearTimeout(timeout);
  }, []);

  return null;
}
