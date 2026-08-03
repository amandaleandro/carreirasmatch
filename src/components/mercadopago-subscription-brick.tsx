"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
  initMercadoPago,
} from "@mercadopago/sdk-react";
import { track, ANALYTICS_EVENTS, getStoredAttribution } from "@/lib/analytics";

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada.");
  initMercadoPago(publicKey, { locale: "pt-BR" });
  initialized = true;
}

const secureFieldStyle = {
  color: "#171717",
  fontSize: "14px",
  fontFamily: "Arial, sans-serif",
  padding: "10px 12px",
  placeholderColor: "#737373",
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="h-11 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
        {children}
      </div>
    </label>
  );
}

export function MercadoPagoSubscriptionBrick({
  amount,
  payerEmail,
  segment,
  couponCode,
  endpoint = "/api/billing/subscription",
  extraBody,
  onSuccess,
}: {
  amount: number;
  payerEmail: string;
  segment?: string;
  couponCode?: string;
  /** Rota que processa a assinatura. Default: assinatura de candidato. */
  endpoint?: string;
  /** Campos extras enviados junto no corpo da requisição (ex.: planKind). */
  extraBody?: Record<string, string>;
  onSuccess: (registerUrl?: string) => void;
}) {
  const [cardholderName, setCardholderName] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureInitialized();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { kind: "subscription", segment: segment ?? "unknown" });

    try {
      if (!cardholderName.trim()) {
        throw new Error("Informe o nome como aparece no cartão.");
      }

      const cpfDigits = digitsOnly(cpf);
      if (cpfDigits.length !== 11) {
        throw new Error("Informe um CPF válido para o titular do cartão.");
      }

      const cardToken = await createCardToken({
        cardholderName: cardholderName.trim(),
        identificationType: "CPF",
        identificationNumber: cpfDigits,
      });

      if (!cardToken?.id) {
        throw new Error("Não foi possível validar os dados do cartão.");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cardToken.id,
          payerEmail,
          segment,
          couponCode,
          attribution: getStoredAttribution(),
          ...extraBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar assinatura.");

      if (data.status === "authorized") {
        track(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, { segment: segment ?? "unknown" });
        onSuccess(data.registerUrl);
      } else {
        setError("Assinatura pendente de confirmação. Você será avisado quando for ativada.");
      }
    } catch (err) {
      track(ANALYTICS_EVENTS.CHECKOUT_FAILED, { kind: "subscription" });
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome no cartão</label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          autoComplete="cc-name"
          required
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <FieldShell label="Número do cartão">
        <CardNumber placeholder="0000 0000 0000 0000" style={secureFieldStyle} />
      </FieldShell>

      <div className="grid grid-cols-2 gap-3">
        <FieldShell label="Validade">
          <ExpirationDate placeholder="MM/AA" mode="short" style={secureFieldStyle} />
        </FieldShell>
        <FieldShell label="CVV">
          <SecurityCode placeholder="123" style={secureFieldStyle} />
        </FieldShell>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">CPF do titular</label>
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          inputMode="numeric"
          autoComplete="off"
          required
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          placeholder="000.000.000-00"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 text-white font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Processando..." : `Assinar agora - R$ ${amount.toFixed(2).replace(".", ",")}`}
      </button>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Dados do cartão são protegidos pelos campos seguros do Mercado Pago.
      </p>
    </form>
  );
}
