"use client";

import { FormEvent, useState } from "react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  careerSegment: string | null;
};

type Subscription = {
  status: string;
  segment: string;
  currentPeriodEnd: string | null;
} | null;

type Payment = {
  id: string;
  kind: string;
  segment: string;
  amount: number;
  status: string;
  analysisId: string | null;
  createdAt: string;
};

type AnalysisRow = {
  id: string;
  jobTitle: string;
  createdAt: string;
  unlocked: boolean;
};

type LookupResult = {
  user: AdminUser;
  subscription: Subscription;
  payments: Payment[];
  analyses: AnalysisRow[];
};

function formatAmount(cents: number) {
  return cents === 0 ? "grátis" : `R$${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function AdminUserLookup() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function search(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/user?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao buscar usuário.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!email.trim()) return;
    const res = await fetch(`/api/admin/user?email=${encodeURIComponent(email.trim())}`);
    const data = await res.json();
    if (res.ok) setResult(data);
  }

  async function grantAnalysisCredit() {
    if (!result || actionLoading !== null) return;
    setActionLoading("credit");
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/grant-analysis-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: result.user.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await refresh();
      setSuccess("Crédito de primeira análise concedido.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setActionLoading(null);
    }
  }

  async function grantDiagnostic(analysisId: string) {
    if (actionLoading !== null) return;
    setActionLoading(`diagnostic-${analysisId}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/grant-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await refresh();
      setSuccess("Diagnóstico liberado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setActionLoading(null);
    }
  }

  async function grantSubscription(days: number) {
    if (!result || actionLoading !== null) return;
    setActionLoading(`subscription-${days}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/grant-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: result.user.id, days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refresh();
      const until = data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        : null;
      setSuccess(`Assinatura concedida por ${days} dias${until ? `, ativa até ${until}` : ""}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@usuario.com"
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 text-white font-medium px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <p className="rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          ✓ {success}
        </p>
      )}

      {result && (
        <div className="space-y-6">
          <div>
            <p className="font-semibold">{result.user.name ?? "(sem nome)"}</p>
            <p className="text-sm text-neutral-500">{result.user.email}</p>
            <p className="text-xs text-neutral-400">Segmento: {result.user.careerSegment ?? "não definido"}</p>
          </div>

          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="font-semibold text-sm">Assinatura</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {result.subscription?.status === "active"
                ? `Ativa até ${result.subscription.currentPeriodEnd ? new Date(result.subscription.currentPeriodEnd).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "-"}`
                : "Sem assinatura ativa"}
            </p>
            <div className="flex gap-2 flex-wrap">
              {[30, 90, 365].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => grantSubscription(days)}
                  disabled={actionLoading !== null}
                  className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
                >
                  {actionLoading === `subscription-${days}` ? "Concedendo..." : `Conceder ${days} dias`}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="font-semibold text-sm">Crédito de primeira análise</h3>
            <button
              type="button"
              onClick={grantAnalysisCredit}
              disabled={actionLoading !== null}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
            >
              {actionLoading === "credit" ? "Concedendo..." : "Conceder 1 crédito"}
            </button>
          </div>

          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="font-semibold text-sm">Análises</h3>
            {result.analyses.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhuma análise ainda.</p>
            ) : (
              <ul className="space-y-2">
                {result.analyses.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.jobTitle}</p>
                      <p className="text-xs text-neutral-400">{new Date(a.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
                    </div>
                    {a.unlocked ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                        Diagnóstico liberado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => grantDiagnostic(a.id)}
                        disabled={actionLoading !== null}
                        className="shrink-0 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
                      >
                        {actionLoading === `diagnostic-${a.id}` ? "Liberando..." : "Liberar diagnóstico"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
            <h3 className="font-semibold text-sm">Histórico de pagamentos</h3>
            {result.payments.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum pagamento ainda.</p>
            ) : (
              <ul className="space-y-1 text-xs text-neutral-500">
                {result.payments.map((p) => (
                  <li key={p.id}>
                    {new Date(p.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} · {p.kind} · {formatAmount(p.amount)} ·{" "}
                    {p.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
