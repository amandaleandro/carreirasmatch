"use client";

import { useActionState, useRef } from "react";
import { CheckCircle2, Paperclip, Send } from "lucide-react";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_DESCRIPTIONS,
  SUPPORT_CATEGORY_LABELS,
  type SupportActionState,
} from "@/lib/support";
import { createSupportTicket, replySupportTicket } from "@/app/suporte/actions";
import { adminReplySupportTicket } from "@/app/admin/suporte/actions";
import { SupportSubmitButton } from "@/components/support-submit-button";

const INITIAL_STATE: SupportActionState = {};
const INPUT_CLASS = "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]";
const ATTACHMENT = (
  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-500 hover:text-blue-600">
    <Paperclip className="h-4 w-4" />
    Anexar PDF, PNG ou JPEG (até 2 MB)
    <input className="sr-only" type="file" name="attachment" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
  </label>
);

function Feedback({ state }: { state: SupportActionState }) {
  if (!state.error && !state.success) return null;
  return <p role="status" aria-live="polite" className={`rounded-xl px-3 py-2 text-sm ${state.error ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>{state.error ?? state.success}</p>;
}

export function NewSupportTicketForm({ defaultCategory = "other", defaultSubject = "" }: { defaultCategory?: string; defaultSubject?: string }) {
  const [state, action] = useActionState(createSupportTicket, INITIAL_STATE);
  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <div><label htmlFor="category" className="mb-1 block text-sm font-medium">Sobre o que você precisa de ajuda?</label><select id="category" name="category" defaultValue={SUPPORT_CATEGORIES.includes(defaultCategory as never) ? defaultCategory : "other"} className={INPUT_CLASS}>{SUPPORT_CATEGORIES.map((category) => <option key={category} value={category}>{SUPPORT_CATEGORY_LABELS[category]}: {SUPPORT_CATEGORY_DESCRIPTIONS[category]}</option>)}</select></div>
      <div><label htmlFor="subject" className="mb-1 block text-sm font-medium">Assunto</label><input id="subject" name="subject" type="text" required maxLength={120} defaultValue={defaultSubject} placeholder="Ex: Paguei no Pix e a assinatura não liberou" className={INPUT_CLASS} /></div>
      <div><label htmlFor="body" className="mb-1 block text-sm font-medium">O que aconteceu?</label><textarea id="body" name="body" required rows={5} maxLength={4000} placeholder="Conte com detalhes. Se for sobre pagamento, o horário e o valor ajudam a localizar a transação." className={INPUT_CLASS} /></div>
      {ATTACHMENT}
      <Feedback state={state} />
      <SupportSubmitButton pendingLabel="Abrindo chamado..." className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">Enviar chamado</SupportSubmitButton>
      <p className="flex items-center gap-1.5 text-xs text-neutral-500"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Você poderá continuar a conversa após o envio.</p>
    </form>
  );
}

export function SupportReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(replySupportTicket.bind(null, ticketId), INITIAL_STATE);
  return (
    <form action={action} className="mt-6 space-y-3" encType="multipart/form-data">
      <label htmlFor="body" className="block text-sm font-medium">Responder</label>
      <textarea id="body" name="body" rows={4} maxLength={4000} placeholder="Escreva sua resposta..." className={INPUT_CLASS} />
      {ATTACHMENT}<Feedback state={state} />
      <SupportSubmitButton pendingLabel="Enviando..." className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"><Send className="h-4 w-4" /> Enviar resposta</SupportSubmitButton>
    </form>
  );
}

export function AdminSupportReplyForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(adminReplySupportTicket.bind(null, ticketId), INITIAL_STATE);
  return (
    <form ref={formRef} action={action} className="mt-6 space-y-3">
      <label htmlFor="admin-body" className="block text-sm font-medium">Responder ao usuário</label>
      <textarea id="admin-body" name="body" required rows={5} maxLength={4000} placeholder="Sua resposta aparece na página de suporte do usuário." className={INPUT_CLASS} />
      <div className="flex flex-wrap gap-2" aria-label="Respostas rápidas">
        {["Olá! Estamos verificando seu caso e retornaremos em breve.", "Seu acesso foi atualizado. Tente sair e entrar novamente.", "Pode enviar uma captura de tela do erro para continuarmos?"].map((text) => <button key={text} type="button" onClick={() => { const field = formRef.current?.elements.namedItem("body") as HTMLTextAreaElement | null; if (field) { field.value = text; field.focus(); } }} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:border-blue-300 hover:text-blue-600 dark:border-neutral-800">{text}</button>)}
      </div>
      <Feedback state={state} />
      <SupportSubmitButton pendingLabel="Enviando resposta..." className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"><Send className="h-4 w-4" /> Enviar resposta</SupportSubmitButton>
    </form>
  );
}

export function ConfirmResolveButton({ formAction }: { formAction: (formData: FormData) => void | Promise<void> }) {
  return <button type="submit" formAction={formAction} formNoValidate onClick={(event) => { if (!window.confirm("Tem certeza de que este chamado foi resolvido?")) event.preventDefault(); }} className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">Marcar como resolvido</button>;
}
