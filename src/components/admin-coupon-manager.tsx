"use client";

import { useCallback, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  influencerName: string;
  active: boolean;
  discountType: "fixed" | "percent";
  oneOffDiscountCents: number;
  subscriptionDiscountCents: number;
  oneOffDiscountPercent: number;
  subscriptionDiscountPercent: number;
  commissionPercent: number;
  expiresAt: string | null;
  maxRedemptions: number | null;
  usageCount: number;
  createdAt: string;
};

type ReportRow = {
  couponId: string;
  code: string;
  influencerName: string;
  commissionPercent: number;
  paidCount: number;
  netRevenueCents: number;
  discountCents: number;
  grossRevenueCents: number;
  commissionCents: number;
};

type FormState = {
  code: string;
  influencerName: string;
  discountType: "fixed" | "percent";
  oneOffDiscount: string;
  subscriptionDiscount: string;
  oneOffDiscountPercent: string;
  subscriptionDiscountPercent: string;
  commissionPercent: string;
  expiresAt: string;
  maxRedemptions: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  influencerName: "",
  discountType: "fixed",
  oneOffDiscount: "2,00",
  subscriptionDiscount: "4,00",
  oneOffDiscountPercent: "10",
  subscriptionDiscountPercent: "10",
  commissionPercent: "0",
  expiresAt: "",
  maxRedemptions: "",
};

const inputClass =
  "rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function reaisToCents(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function centsToReais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function toIntString(value: string): number {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

/** ISO -> "YYYY-MM-DD" no fuso local, formato aceito pelo <input type="date">. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> ISO no fim daquele dia, para o cupom valer durante toda a data escolhida. */
function fromDateInput(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T23:59:59`).toISOString();
}

function couponToForm(coupon: Coupon): FormState {
  return {
    code: coupon.code,
    influencerName: coupon.influencerName,
    discountType: coupon.discountType,
    oneOffDiscount: centsToReais(coupon.oneOffDiscountCents),
    subscriptionDiscount: centsToReais(coupon.subscriptionDiscountCents),
    oneOffDiscountPercent: String(coupon.oneOffDiscountPercent),
    subscriptionDiscountPercent: String(coupon.subscriptionDiscountPercent),
    commissionPercent: String(coupon.commissionPercent),
    expiresAt: toDateInput(coupon.expiresAt),
    maxRedemptions: coupon.maxRedemptions === null ? "" : String(coupon.maxRedemptions),
  };
}

function formToPayload(form: FormState, options: { includeCode: boolean }) {
  return {
    ...(options.includeCode ? { code: form.code } : {}),
    influencerName: form.influencerName,
    discountType: form.discountType,
    oneOffDiscountCents: reaisToCents(form.oneOffDiscount),
    subscriptionDiscountCents: reaisToCents(form.subscriptionDiscount),
    oneOffDiscountPercent: toIntString(form.oneOffDiscountPercent),
    subscriptionDiscountPercent: toIntString(form.subscriptionDiscountPercent),
    commissionPercent: toIntString(form.commissionPercent),
    expiresAt: fromDateInput(form.expiresAt),
    maxRedemptions: form.maxRedemptions.trim() === "" ? null : toIntString(form.maxRedemptions),
  };
}

function describeDiscount(coupon: Coupon) {
  if (coupon.discountType === "percent") {
    return `${coupon.oneOffDiscountPercent}% / ${coupon.subscriptionDiscountPercent}%`;
  }
  return `${formatCurrency(coupon.oneOffDiscountCents)} / ${formatCurrency(coupon.subscriptionDiscountCents)}`;
}

function isExpired(coupon: Coupon) {
  return coupon.expiresAt !== null && new Date(coupon.expiresAt).getTime() <= Date.now();
}

function isExhausted(coupon: Coupon) {
  return coupon.maxRedemptions !== null && coupon.usageCount >= coupon.maxRedemptions;
}

function statusOf(coupon: Coupon): { label: string; className: string } {
  const neutral =
    "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800";
  if (!coupon.active) return { label: "inativo", className: neutral };
  if (isExpired(coupon)) return { label: "expirado", className: neutral };
  if (isExhausted(coupon)) return { label: "esgotado", className: neutral };
  return {
    label: "ativo",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  };
}

function CouponFields({
  form,
  setForm,
  showCode,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  showCode: boolean;
}) {
  const isPercent = form.discountType === "percent";
  const update = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {showCode && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Código</span>
          <input
            type="text"
            value={form.code}
            onChange={(e) => update({ code: e.target.value.toUpperCase() })}
            placeholder="MARIA10"
            required
            className={`${inputClass} uppercase`}
          />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Influenciador</span>
        <input
          type="text"
          value={form.influencerName}
          onChange={(e) => update({ influencerName: e.target.value })}
          placeholder="Maria Silva"
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Tipo de desconto</span>
        <select
          value={form.discountType}
          onChange={(e) => update({ discountType: e.target.value as "fixed" | "percent" })}
          className={inputClass}
        >
          <option value="fixed">Valor fixo (R$)</option>
          <option value="percent">Percentual (%)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Desconto avulso {isPercent ? "(%)" : "(R$)"}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={isPercent ? form.oneOffDiscountPercent : form.oneOffDiscount}
          onChange={(e) =>
            update(isPercent ? { oneOffDiscountPercent: e.target.value } : { oneOffDiscount: e.target.value })
          }
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Desconto assinatura {isPercent ? "(%)" : "(R$)"}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={isPercent ? form.subscriptionDiscountPercent : form.subscriptionDiscount}
          onChange={(e) =>
            update(
              isPercent ? { subscriptionDiscountPercent: e.target.value } : { subscriptionDiscount: e.target.value }
            )
          }
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Comissão (%)</span>
        <input
          type="text"
          inputMode="numeric"
          value={form.commissionPercent}
          onChange={(e) => update({ commissionPercent: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Expira em</span>
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => update({ expiresAt: e.target.value })}
          className={inputClass}
        />
        <span className="text-[11px] text-neutral-500">Vazio = sem expiração</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Limite de usos</span>
        <input
          type="text"
          inputMode="numeric"
          value={form.maxRedemptions}
          onChange={(e) => update({ maxRedemptions: e.target.value })}
          placeholder="Ilimitado"
          className={inputClass}
        />
        <span className="text-[11px] text-neutral-500">Conta só vendas confirmadas</span>
      </label>
    </div>
  );
}

export function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [report, setReport] = useState<ReportRow[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data.coupons ?? []);
        setReport(data.report ?? []);
      })
      .catch(() => setMessage("Não foi possível carregar os cupons."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form, { includeCode: true })),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar cupom.");
      setForm(EMPTY_FORM);
      setMessage(`Cupom ${data.coupon.code} criado.`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  async function patchCoupon(id: string, body: unknown, successMessage?: string) {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao atualizar cupom.");
      if (successMessage) setMessage(successMessage);
      load();
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
      return false;
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    const ok = await patchCoupon(editingId, formToPayload(editForm, { includeCode: false }), "Cupom atualizado.");
    if (ok) setEditingId(null);
    setSaving(false);
  }

  function startEditing(coupon: Coupon) {
    setEditingId(coupon.id);
    setEditForm(couponToForm(coupon));
    setMessage(null);
  }

  const totalCommission = report.reduce((sum, row) => sum + row.commissionCents, 0);
  const totalNet = report.reduce((sum, row) => sum + row.netRevenueCents, 0);
  const totalGross = report.reduce((sum, row) => sum + row.grossRevenueCents, 0);

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-3">
        <CouponFields form={form} setForm={setForm} showCode />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 text-white font-medium px-4 py-2 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            Criar cupom
          </button>
          {message && <p className="text-xs text-neutral-600 dark:text-neutral-400">{message}</p>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">Código</th>
              <th className="py-2 pr-4 font-medium">Influenciador</th>
              <th className="py-2 pr-4 font-medium">Desconto</th>
              <th className="py-2 pr-4 font-medium">Comissão</th>
              <th className="py-2 pr-4 font-medium">Usos</th>
              <th className="py-2 pr-4 font-medium">Expira</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {(coupons ?? []).map((coupon) => {
              const status = statusOf(coupon);
              return (
                <tr key={coupon.id} className="align-top">
                  <td className="py-3 pr-4 font-mono font-semibold">{coupon.code}</td>
                  <td className="py-3 pr-4">{coupon.influencerName}</td>
                  <td className="py-3 pr-4 text-xs text-neutral-500">{describeDiscount(coupon)}</td>
                  <td className="py-3 pr-4 text-xs text-neutral-500">{coupon.commissionPercent}%</td>
                  <td className="py-3 pr-4">
                    {coupon.usageCount}
                    {coupon.maxRedemptions !== null && (
                      <span className="text-neutral-500">/{coupon.maxRedemptions}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-neutral-500 whitespace-nowrap">{formatDate(coupon.expiresAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => (editingId === coupon.id ? setEditingId(null) : startEditing(coupon))}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {editingId === coupon.id ? "Cancelar" : "Editar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => patchCoupon(coupon.id, { active: !coupon.active })}
                      className="ml-3 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {coupon.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {editingId && (
              <tr>
                <td colSpan={8} className="py-4">
                  <form onSubmit={handleEditSubmit} className="space-y-3 rounded-md bg-neutral-50 dark:bg-neutral-900/50 p-4">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Editando {editForm.code} — o código não pode ser alterado.
                    </p>
                    <CouponFields form={editForm} setForm={setEditForm} showCode={false} />
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-md bg-blue-600 text-white font-medium px-4 py-2 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      Salvar alterações
                    </button>
                  </form>
                </td>
              </tr>
            )}
            {coupons && coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-neutral-500">
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <h3 className="font-semibold">Comissão por influenciador</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Apenas pagamentos confirmados. A comissão incide sobre a receita bruta (valor cheio, antes do desconto do
          cupom).
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Influenciador</th>
                <th className="py-2 pr-4 font-medium">Código</th>
                <th className="py-2 pr-4 font-medium">Vendas</th>
                <th className="py-2 pr-4 font-medium">Receita bruta</th>
                <th className="py-2 pr-4 font-medium">Receita líquida</th>
                <th className="py-2 pr-4 font-medium">Desconto dado</th>
                <th className="py-2 pr-4 font-medium">%</th>
                <th className="py-2 font-medium">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {report.map((row) => (
                <tr key={row.couponId}>
                  <td className="py-3 pr-4">{row.influencerName}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.code}</td>
                  <td className="py-3 pr-4">{row.paidCount}</td>
                  <td className="py-3 pr-4 font-medium">{formatCurrency(row.grossRevenueCents)}</td>
                  <td className="py-3 pr-4 text-neutral-500">{formatCurrency(row.netRevenueCents)}</td>
                  <td className="py-3 pr-4 text-neutral-500">{formatCurrency(row.discountCents)}</td>
                  <td className="py-3 pr-4 text-neutral-500">{row.commissionPercent}%</td>
                  <td className="py-3 font-semibold">{formatCurrency(row.commissionCents)}</td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-500">
                    Nenhuma venda com cupom ainda.
                  </td>
                </tr>
              )}
            </tbody>
            {report.length > 0 && (
              <tfoot>
                <tr className="border-t border-neutral-200 dark:border-neutral-800 font-semibold">
                  <td className="py-3 pr-4" colSpan={3}>
                    Total
                  </td>
                  <td className="py-3 pr-4">{formatCurrency(totalGross)}</td>
                  <td className="py-3 pr-4">{formatCurrency(totalNet)}</td>
                  <td className="py-3 pr-4" colSpan={2} />
                  <td className="py-3">{formatCurrency(totalCommission)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
