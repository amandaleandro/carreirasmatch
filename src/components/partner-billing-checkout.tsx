"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

type Pack = { kind: string; label: string; credits: number; priceCents: number };
type PixResult = { qrCode: string; qrCodeBase64: string } | null;

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada.");
  initMercadoPago(publicKey, { locale: "pt-BR" });
  initialized = true;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PartnerBillingCheckout({ packs, payerEmail }: { packs: Pack[]; payerEmail: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Pack>(packs[0]);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixResult>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    ensureInitialized();
  }, []);

  if (pix) {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 text-sm shadow-sm">
        <p className="font-semibold">Escaneie o QR Code ou copie o código para pagar via PIX:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${pix.qrCodeBase64}`}
          alt="QR Code PIX"
          className="w-48 h-48 border border-neutral-200 dark:border-neutral-800 rounded-md mx-auto"
        />
        <textarea
          readOnly
          value={pix.qrCode}
          className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 outline-none focus:border-blue-500"
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Após o pagamento, os {selected.credits} créditos entram automaticamente na sua conta em alguns instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {packs.map((pack) => {
          const active = pack.kind === selected.kind;
          return (
            <button
              type="button"
              key={pack.kind}
              onClick={() => setSelected(pack)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-800"
              }`}
            >
              <p className="font-semibold text-neutral-900 dark:text-white">{pack.label}</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">{formatBRL(pack.priceCents)}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {formatBRL(Math.round(pack.priceCents / pack.credits))} por destaque
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Payment
          key={selected.kind}
          initialization={{ amount: selected.priceCents / 100, payer: payerEmail ? { email: payerEmail } : undefined }}
          customization={{ paymentMethods: { creditCard: "all", bankTransfer: "all" } }}
          onSubmit={async (formData) => {
            setError(null);
            try {
              const res = await fetch("/api/partner/billing/comprar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind: selected.kind, formData }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Erro ao processar pagamento.");

              if (data.pix) {
                setPix(data.pix);
              } else if (data.status === "approved") {
                setSuccess(`Pagamento aprovado! ${selected.credits} créditos de destaque adicionados.`);
                router.refresh();
              } else if (data.status === "rejected") {
                setError("Pagamento recusado. Tente outro cartão.");
              } else {
                setError("Pagamento em análise. Os créditos entram quando for confirmado.");
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro inesperado.");
              throw err;
            }
          }}
          onError={(err) => setError(err.message ?? "Erro ao carregar o formulário de pagamento.")}
        />
        {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
        {success && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{success}</p>}
      </div>
    </div>
  );
}
