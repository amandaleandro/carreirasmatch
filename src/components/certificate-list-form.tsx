"use client";

import { useTransition } from "react";
import { addCertificado, deleteCertificado } from "@/app/settings/actions";

type CertificadoItem = {
  id: string;
  title: string;
  issuer: string;
  credentialUrl: string;
  issuedAt: Date | null;
};

export function CertificateListForm({ certificados }: { certificados: CertificadoItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(() => {
      addCertificado(formData);
    });
  }

  function handleDelete(certificadoId: string) {
    startTransition(() => {
      deleteCertificado(certificadoId);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Seus certificados</h3>
        {certificados.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum certificado cadastrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {certificados.map((certificado) => (
              <li
                key={certificado.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{certificado.title}</p>
                  {certificado.issuer && (
                    <p className="text-neutral-500">
                      {certificado.issuer}
                      {certificado.issuedAt
                        ? ` · ${new Date(certificado.issuedAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                  )}
                  {certificado.credentialUrl && (
                    <a
                      href={certificado.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver certificado
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(certificado.id)}
                  className="text-red-500 hover:underline disabled:opacity-50 self-start sm:self-auto shrink-0"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={handleAdd} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do certificado</label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Instituição emissora</label>
            <input
              type="text"
              name="issuer"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de emissão (opcional)</label>
            <input
              type="date"
              name="issuedAt"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link do certificado (opcional)</label>
          <input
            type="url"
            name="credentialUrl"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          Adicionar certificado
        </button>
      </form>
    </div>
  );
}
