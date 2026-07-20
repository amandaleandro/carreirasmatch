"use client";

export type ExportContact = {
  name: string;
  email: string;
  phone: string;
  area: string;
  city: string;
  state: string;
  jobTitle: string;
};

function toCsv(contacts: ExportContact[]): string {
  const header = ["Nome", "E-mail", "Telefone", "Área", "Cidade", "UF", "Vaga"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = contacts.map((c) =>
    [c.name, c.email, c.phone, c.area, c.city, c.state, c.jobTitle].map(escape).join(",")
  );
  return [header.map(escape).join(","), ...rows].join("\n");
}

export function ExportContactsButton({ contacts }: { contacts: ExportContact[] }) {
  function exportCsv() {
    const blob = new Blob(["﻿" + toCsv(contacts)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contatos-liberados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (contacts.length === 0) return null;

  return (
    <button
      type="button"
      onClick={exportCsv}
      className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
    >
      Exportar CSV
    </button>
  );
}
