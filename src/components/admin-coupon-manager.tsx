"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  influencerName: string;
  active: boolean;
  oneOffDiscountCents: number;
  subscriptionDiscountCents: number;
  usageCount: number;
  createdAt: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [code, setCode] = useState("");
  const [influencerName, setInfluencerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons ?? []))
      .catch(() => setMessage("Não foi possível carregar os cupons."));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, influencerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar cupom.");
      setCode("");
      setInfluencerName("");
      setMessage(`Cupom ${data.coupon.code} criado.`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao atualizar cupom.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Código (ex: MARIA10)"
          required
          className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm uppercase"
        />
        <input
          type="text"
          value={influencerName}
          onChange={(e) => setInfluencerName(e.target.value)}
          placeholder="Nome do influenciador"
          required
          className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 text-white font-medium px-4 py-2 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          Criar cupom
        </button>
      </form>
      <p className="text-xs text-neutral-500">
        Desconto padrão: R$2,00 na primeira análise/diagnóstico e R$4,00 na assinatura.
      </p>
      {message && <p className="text-xs text-neutral-600 dark:text-neutral-400">{message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">Código</th>
              <th className="py-2 pr-4 font-medium">Influenciador</th>
              <th className="py-2 pr-4 font-medium">Descontos</th>
              <th className="py-2 pr-4 font-medium">Usos</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {(coupons ?? []).map((coupon) => (
              <tr key={coupon.id}>
                <td className="py-3 pr-4 font-mono font-semibold">{coupon.code}</td>
                <td className="py-3 pr-4">{coupon.influencerName}</td>
                <td className="py-3 pr-4 text-xs text-neutral-500">
                  {formatCurrency(coupon.oneOffDiscountCents)} / {formatCurrency(coupon.subscriptionDiscountCents)}
                </td>
                <td className="py-3 pr-4">{coupon.usageCount}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                      coupon.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
                    }`}
                  >
                    {coupon.active ? "ativo" : "inativo"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleActive(coupon)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {coupon.active ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
            {coupons && coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
