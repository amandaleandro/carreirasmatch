"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, TrendingUp } from "lucide-react";

type CouponSignupUser = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  subscription: { status: string; currentPeriodEnd: string | null } | null;
  payments: Array<{ amount: number; kind: string }>;
};

type Coupon = {
  id: string;
  code: string;
  influencerName: string;
  ownerEmail: string | null;
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
  signups?: CouponSignupUser[];
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
  ownerEmail: string;
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
  ownerEmail: "",
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
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
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
    ownerEmail: coupon.ownerEmail ?? "",
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
    ownerEmail: form.ownerEmail.trim(),
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
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">E-mail do influencer</span>
        <input
          type="email"
          value={form.ownerEmail}
          onChange={(e) => update({ ownerEmail: e.target.value })}
          placeholder="maria@email.com"
          className={inputClass}
        />
        <span className="text-[11px] text-neutral-500">Dá acesso total + painel. A conta precisa já existir.</span>
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

  const [signupSearch, setSignupSearch] = useState("");
  const [selectedCouponFilter, setSelectedCouponFilter] = useState<string | "all">("all");
  const [signupStatusFilter, setSignupStatusFilter] = useState<"all" | "subscribers" | "payers">("all");

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

  const allSignups = (coupons ?? []).flatMap((c) =>
    (c.signups ?? []).map((signup) => ({
      ...signup,
      couponCode: c.code,
      influencerName: c.influencerName,
      couponId: c.id,
    }))
  );

  const filteredSignups = allSignups.filter((item) => {
    if (selectedCouponFilter !== "all" && item.couponId !== selectedCouponFilter) return false;

    if (signupStatusFilter === "subscribers") {
      if (item.subscription?.status !== "active") return false;
    } else if (signupStatusFilter === "payers") {
      if (!item.payments || item.payments.length === 0) return false;
    }

    if (!signupSearch.trim()) return true;
    const q = signupSearch.toLowerCase();
    const name = item.name?.toLowerCase() ?? "";
    const email = item.email?.toLowerCase() ?? "";
    const code = item.couponCode.toLowerCase();
    const influencer = item.influencerName.toLowerCase();

    return name.includes(q) || email.includes(q) || code.includes(q) || influencer.includes(q);
  });

  function exportSignupsCSV() {
    if (filteredSignups.length === 0) return;

    const headers = ["Influenciadora", "Cupom", "Nome Usuario", "Email Usuario", "Data Cadastro", "Status Assinatura", "Total Pago (R$)"];
    const rows = filteredSignups.map((item) => {
      const totalPaid = (item.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0) / 100;
      const isSub = item.subscription?.status === "active" ? "Assinante Ativo" : "Conta Gratuita";
      return [
        `"${(item.influencerName || "").replace(/"/g, '""')}"`,
        `"${(item.couponCode || "").replace(/"/g, '""')}"`,
        `"${(item.name || "Sem nome").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        `"${formatDate(item.createdAt)}"`,
        `"${isSub}"`,
        totalPaid.toFixed(2),
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cadastrados_cupons_influenciadoras_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
              <th className="py-2 pr-4 font-medium">Cadastrados</th>
              <th className="py-2 pr-4 font-medium">Usos</th>
              <th className="py-2 pr-4 font-medium">Expira</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {(coupons ?? []).map((coupon) => {
              const status = statusOf(coupon);
              const signupsCount = coupon.signups?.length ?? 0;
              return (
                <tr key={coupon.id} className="align-top">
                  <td className="py-3 pr-4 font-mono font-semibold">{coupon.code}</td>
                  <td className="py-3 pr-4">
                    {coupon.influencerName}
                    <span className="block text-[11px] text-neutral-500">
                      {coupon.ownerEmail ? `👤 ${coupon.ownerEmail}` : "sem login vinculado"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-neutral-500">{describeDiscount(coupon)}</td>
                  <td className="py-3 pr-4 text-xs text-neutral-500">{coupon.commissionPercent}%</td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCouponFilter(coupon.id);
                        const el = document.getElementById("signups-table-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {signupsCount} cadastros
                    </button>
                  </td>
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
                <td colSpan={9} className="py-4">
                  <form onSubmit={handleEditSubmit} className="space-y-3 rounded-md bg-neutral-50 dark:bg-neutral-900/50 p-4">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Editando {editForm.code} - o código não pode ser alterado.
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
                <td colSpan={9} className="py-6 text-center text-neutral-500">
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

      <div id="signups-table-section" className="border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-base">Usuários Cadastrados por Cupom de Influenciadora</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Lista de pessoas que criaram conta utilizando a indicação ou cupom de cada influenciadora.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold px-3 py-1.5">
                Total: {allSignups.length} cadastrados
              </span>
              <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold px-3 py-1.5">
                {allSignups.filter((s) => s.subscription?.status === "active").length} assinantes
              </span>
              <button
                type="button"
                onClick={exportSignupsCSV}
                disabled={filteredSignups.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV ({filteredSignups.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filtros dinâmicos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, cupom ou influenciadora..."
            value={signupSearch}
            onChange={(e) => setSignupSearch(e.target.value)}
            className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          />

          <select
            value={selectedCouponFilter}
            onChange={(e) => setSelectedCouponFilter(e.target.value)}
            className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          >
            <option value="all">Todas as Influenciadoras</option>
            {(coupons ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.influencerName} ({c.code}) - {c.signups?.length ?? 0} cadastros
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-100 dark:bg-neutral-900 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setSignupStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                signupStatusFilter === "all"
                  ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSignupStatusFilter("subscribers")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                signupStatusFilter === "subscribers"
                  ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Assinantes
            </button>
            <button
              type="button"
              onClick={() => setSignupStatusFilter("payers")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                signupStatusFilter === "payers"
                  ? "bg-white dark:bg-neutral-800 shadow-xs font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Com pagamentos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2.5 px-4 font-medium">Influenciadora / Cupom</th>
                <th className="py-2.5 px-4 font-medium">Usuário Cadastrado</th>
                <th className="py-2.5 px-4 font-medium">Data do Cadastro</th>
                <th className="py-2.5 px-4 font-medium">Status Assinatura</th>
                <th className="py-2.5 px-4 font-medium text-right">Pagamentos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {filteredSignups.map((signup) => {
                const totalPaidCents = signup.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
                const isSub = signup.subscription?.status === "active";
                return (
                  <tr key={signup.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900 dark:text-white">{signup.influencerName}</span>
                      <span className="block font-mono text-xs text-blue-600 dark:text-blue-400">{signup.couponCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-900 dark:text-white">{signup.name ?? "Sem nome"}</p>
                      <p className="text-xs text-neutral-500">{signup.email ?? "-"}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      {formatDate(signup.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          isSub
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                        }`}
                      >
                        {isSub ? "Assinante Ativo" : "Conta Gratuita"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {totalPaidCents > 0 ? formatCurrency(totalPaidCents) : "R$ 0,00"}
                      </p>
                      <span className="text-xs text-neutral-500">
                        {signup.payments?.length ?? 0} pagamento(s)
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredSignups.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    {signupSearch.trim() || selectedCouponFilter !== "all" || signupStatusFilter !== "all"
                      ? "Nenhum usuário encontrado com os filtros selecionados."
                      : "Nenhum cadastro vinculado a cupons de influenciadoras até o momento."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
