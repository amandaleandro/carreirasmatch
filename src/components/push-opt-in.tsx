"use client";

import { useEffect, useState } from "react";

type State = "loading" | "unsupported" | "disabled" | "denied" | "off" | "on" | "working";

// Converte a chave pública VAPID (base64url) para o Uint8Array que
// PushManager.subscribe espera em applicationServerKey.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushOptIn() {
  const [state, setState] = useState<State>("loading");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!supported) {
      queueMicrotask(() => setState("unsupported"));
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/push");
        const data = await res.json();
        if (!data.enabled || !data.publicKey) {
          setState("disabled");
          return;
        }
        setPublicKey(data.publicKey);
        if (Notification.permission === "denied") {
          setState("denied");
          return;
        }
        setState(data.subscribed ? "on" : "off");
      } catch {
        setState("disabled");
      }
    })();
  }, []);

  async function enable() {
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      setState(res.ok ? "on" : "off");
    } catch (err) {
      console.error("push opt-in falhou", err);
      setState("off");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = await reg?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("off");
    } catch {
      setState("off");
    }
  }

  if (state === "loading" || state === "disabled" || state === "unsupported") return null;

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Notificações no navegador</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {state === "denied"
              ? "As notificações estão bloqueadas nas configurações do navegador. Reative-as por lá para receber avisos de vaga."
              : "Receba um push assim que entrar uma vaga que combina com seus alertas."}
          </p>
        </div>
        {state === "on" ? (
          <button
            type="button"
            onClick={disable}
            className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold dark:border-neutral-700"
          >
            Desativar
          </button>
        ) : state === "denied" ? null : (
          <button
            type="button"
            onClick={enable}
            disabled={state === "working"}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {state === "working" ? "..." : "Ativar"}
          </button>
        )}
      </div>
    </div>
  );
}
