"use client";

import { useCallback, useEffect, useState } from "react";

interface Settings {
  enabled: boolean;
  action?: "activate" | "deactivate";
  minMatchScore: number;
  autoTailorResume: boolean;
  dailyLimit: number;
  externalAutomationEnabled: boolean;
  applicationProfile: ApplicationProfile;
  consentedAt?: string | null;
  lastRunAt?: string | null;
}

interface ApplicationProfile {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  linkedinUrl: string;
  salaryExpectation: string;
  availability: string;
  workAuthorization: "" | "yes" | "no";
  willingToRelocate: "" | "yes" | "no";
  coverLetter: string;
  customAnswers: Record<string, string>;
}

interface QueueItem {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
  fitScore: number;
  status: string;
  failureReason?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  queued: "Na fila",
  processing: "Processando",
  applied: "Enviada",
  failed: "Falhou",
  unsupported_external: "Integração indisponível",
  blocked_external: "Precisa de informação",
};

export function AutoApplySettingsCard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/auto-apply/settings", { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível carregar o piloto automático.");
    const data = await response.json();
    setSettings(data.settings);
    setQueue(data.queue ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/auto-apply/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o piloto automático.");
        return response.json();
      })
      .then((data) => {
        setSettings(data.settings);
        setQueue(data.queue ?? []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Falha ao carregar."))
      .finally(() => setLoading(false));
  }, []);

  async function save(patch: Partial<Settings>) {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/auto-apply/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar.");
      setSettings(data.settings);
      if (data.run?.applied) {
        setMessage(`${data.run.applied} candidatura(s) enviada(s) automaticamente.`);
      } else {
        setMessage(data.settings.enabled ? "Piloto automático atualizado." : "Piloto automático pausado.");
      }
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePilot() {
    await save({ action: settings?.enabled ? "deactivate" : "activate" } as Partial<Settings>);
  }

  async function runNow() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/auto-apply/run", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível executar.");
      const result = data.run;
      setMessage(
        result.applied
          ? `${result.applied} candidatura(s) enviada(s) agora.`
          : "Nenhuma nova vaga interna elegível neste momento.",
      );
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível executar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-neutral-900/40">
        <div className="mb-4 h-6 w-48 rounded bg-slate-200 dark:bg-neutral-800" />
        <div className="h-4 w-64 rounded bg-slate-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  return (
    <section id="piloto-automatico" className="scroll-mt-6 space-y-6 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 shadow-lg shadow-blue-500/5 dark:from-blue-950/20 dark:via-neutral-900/40 dark:to-indigo-950/10">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <span className="mb-1.5 inline-flex rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            Candidatura autônoma
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Piloto Automático
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-600 dark:text-slate-400">
            Com uma única autorização, encontra vagas compatíveis e envia sua candidatura sem pedir confirmação a cada vaga.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void togglePilot()}
          disabled={saving || !settings}
          className={`shrink-0 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-60 ${
            settings?.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {settings?.enabled ? "Desativar piloto" : "Ativar piloto"}
        </button>
      </div>

      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
          settings?.enabled
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            settings?.enabled ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
          }`}
        />
        {settings?.enabled ? "Piloto ligado" : "Piloto desligado"}
      </div>

      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
          settings?.externalAutomationEnabled
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
            : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            settings?.externalAutomationEnabled ? "bg-indigo-500" : "bg-slate-400 dark:bg-slate-500"
          }`}
        />
        {settings?.externalAutomationEnabled ? "Automação externa ligada" : "Automação externa desligada"}
      </div>

      {settings && (
        <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-white/70 p-4.5 dark:border-neutral-800 dark:bg-neutral-900/70">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Regras da automação
            </h3>

            <label className="block space-y-2">
              <span className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                Match mínimo
                <strong className="text-blue-600">{settings.minMatchScore}%</strong>
              </span>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={settings.minMatchScore}
                onChange={(event) =>
                  setSettings((current) =>
                    current ? { ...current, minMatchScore: Number(event.target.value) } : current,
                  )
                }
                onPointerUp={() => void save({ minMatchScore: settings.minMatchScore })}
                onBlur={() => void save({ minMatchScore: settings.minMatchScore })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-neutral-800"
              />
            </label>

            <label className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-bold dark:border-neutral-800">
              Limite diário
              <input
                type="number"
                min="1"
                max="50"
                value={settings.dailyLimit}
                onChange={(event) =>
                  setSettings((current) =>
                    current ? { ...current, dailyLimit: Number(event.target.value) } : current,
                  )
                }
                onBlur={() => void save({ dailyLimit: Math.min(50, Math.max(1, settings.dailyLimit)) })}
                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>

            <p className="text-[10px] leading-relaxed text-slate-500">
              O envio totalmente automático funciona nas vagas publicadas por empresas dentro do CarreirasMatch. Origens externas são sinalizadas até possuírem uma integração autorizada.
            </p>

            {settings.enabled && (
              <button
                type="button"
                onClick={runNow}
                disabled={saving}
                className="w-full rounded-xl border border-blue-600 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-60 dark:hover:bg-blue-950/30"
              >
                Procurar e aplicar agora
              </button>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white/70 p-4.5 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Histórico de processamento
              </h3>
              {queue.length === 0 ? (
                <div className="py-6 text-center text-xs italic text-slate-500">
                  Nenhuma vaga processada ainda.
                </div>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {queue.map((item) => {
                    const needsManualAction = item.status === "blocked_external" || item.status === "unsupported_external";
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-bold text-slate-900 dark:text-white">{item.jobTitle}</p>
                            <p className="truncate text-[10px] text-slate-500">{item.company}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-black text-blue-600">{item.fitScore}% match</p>
                            <p
                              className={`text-[10px] font-bold ${
                                needsManualAction ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {STATUS_LABELS[item.status] ?? item.status}
                            </p>
                          </div>
                        </div>
                        {needsManualAction && (
                          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2 dark:border-neutral-700">
                            <p className="min-w-0 truncate text-[10px] text-slate-500" title={item.failureReason ?? undefined}>
                              {item.failureReason || "O robô não conseguiu concluir sozinho."}
                            </p>
                            <a
                              href={item.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-600"
                            >
                              Candidatar-se manualmente
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-indigo-200/70 bg-white/70 p-4.5 dark:border-indigo-900/60 dark:bg-neutral-900/70">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Formulários externos
              </h3>
              <p className="mt-1 max-w-2xl text-[11px] text-slate-500">
                Autorize o navegador a preencher e enviar formulários públicos usando os dados abaixo. Login, senha e CAPTCHA nunca são contornados.
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void save({ externalAutomationEnabled: !settings.externalAutomationEnabled })
              }
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold ${
                settings.externalAutomationEnabled
                  ? "bg-indigo-600 text-white"
                  : "border border-indigo-600 text-indigo-600"
              }`}
            >
              {settings.externalAutomationEnabled ? "Automação externa ativa" : "Autorizar automação externa"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["fullName", "Nome completo", "text"],
              ["email", "E-mail", "email"],
              ["phone", "Telefone", "tel"],
              ["city", "Cidade", "text"],
              ["state", "Estado/UF", "text"],
              ["linkedinUrl", "URL do LinkedIn", "url"],
              ["salaryExpectation", "Pretensão salarial", "text"],
              ["availability", "Disponibilidade para início", "text"],
            ].map(([key, label, type]) => (
              <label key={key} className="space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {label}
                <input
                  type={type}
                  value={String(settings.applicationProfile[key as keyof ApplicationProfile] ?? "")}
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            applicationProfile: {
                              ...current.applicationProfile,
                              [key]: event.target.value,
                            },
                          }
                        : current,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>
            ))}

            <label className="space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Autorização para trabalhar no Brasil
              <select
                value={settings.applicationProfile.workAuthorization}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          applicationProfile: {
                            ...current.applicationProfile,
                            workAuthorization: event.target.value as "" | "yes" | "no",
                          },
                        }
                      : current,
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="">Não informado</option>
                <option value="yes">Sim</option>
                <option value="no">Não</option>
              </select>
            </label>

            <label className="space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Aceita mudança de cidade
              <select
                value={settings.applicationProfile.willingToRelocate}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          applicationProfile: {
                            ...current.applicationProfile,
                            willingToRelocate: event.target.value as "" | "yes" | "no",
                          },
                        }
                      : current,
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="">Não informado</option>
                <option value="yes">Sim</option>
                <option value="no">Não</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Carta/mensagem padrão ao recrutador
            <textarea
              rows={3}
              value={settings.applicationProfile.coverLetter}
              onChange={(event) =>
                setSettings((current) =>
                  current
                    ? {
                        ...current,
                        applicationProfile: {
                          ...current.applicationProfile,
                          coverLetter: event.target.value,
                        },
                      }
                    : current,
                )
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>

          <label className="block space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Respostas adicionais — uma por linha no formato “pergunta = resposta”
            <textarea
              rows={4}
              value={Object.entries(settings.applicationProfile.customAnswers)
                .map(([question, answer]) => `${question} = ${answer}`)
                .join("\n")}
              onChange={(event) => {
                const customAnswers = Object.fromEntries(
                  event.target.value
                    .split("\n")
                    .map((line) => line.split("="))
                    .filter((parts) => parts.length >= 2 && parts[0].trim())
                    .map(([question, ...answer]) => [question.trim(), answer.join("=").trim()]),
                );
                setSettings((current) =>
                  current
                    ? {
                        ...current,
                        applicationProfile: { ...current.applicationProfile, customAnswers },
                      }
                    : current,
                );
              }}
              placeholder={"Possui CNH? = Sim\nQuantos anos de experiência? = 3 anos"}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={() => void save({ applicationProfile: settings.applicationProfile })}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            Salvar dados para formulários
          </button>
        </div>
        </>
      )}

      {message && (
        <p role="status" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
          {message}
        </p>
      )}
    </section>
  );
}
