"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";

export function CompanySubscriptionCheckout({
  priceCents,
  payerEmail,
}: {
  priceCents: number;
  payerEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        Plano ativado! Vagas e triagens agora são ilimitadas.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
      >
        Assinar o Plano Ilimitado
      </button>
    );
  }

  return (
    <div className="max-w-sm">
      <MercadoPagoSubscriptionBrick
        amount={priceCents / 100}
        payerEmail={payerEmail}
        endpoint="/api/empresa/billing/assinatura"
        onSuccess={() => {
          setSuccess(true);
          router.refresh();
        }}
      />
    </div>
  );
}
