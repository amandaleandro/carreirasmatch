"use client";

import { useState } from "react";
import Link from "next/link";

const GROUPS = {
  geral: {
    label: "Geral",
    questions: [
      ["Fale sobre você.", "Resuma seu momento profissional, principais forças e o motivo de buscar a vaga."],
      ["Por que quer trabalhar aqui?", "Conecte algo real da empresa com o que você busca e pode entregar."],
      ["Qual foi seu maior desafio?", "Use Situação, Tarefa, Ação e Resultado para contar um caso concreto."],
      ["Qual ponto você precisa desenvolver?", "Escolha algo verdadeiro e explique o que já está fazendo para melhorar."],
    ],
  },
  primeiro: {
    label: "Primeiro emprego",
    questions: [
      ["Como você demonstra responsabilidade sem experiência formal?", "Use exemplos da escola, cursos, projetos, família ou voluntariado."],
      ["O que você aprendeu trabalhando em grupo?", "Conte um conflito, sua atitude e o resultado do grupo."],
      ["Por que deveríamos contratar você?", "Mostre disposição para aprender, organização e aderência ao que a vaga pede."],
    ],
  },
  vendas: {
    label: "Vendas e atendimento",
    questions: [
      ["Como você lidaria com um cliente insatisfeito?", "Demonstre escuta, calma, investigação e proposta de solução."],
      ["Como reage quando não bate uma meta?", "Fale de análise dos números, ajuste da abordagem e plano de recuperação."],
      ["Conte uma situação em que precisou convencer alguém.", "Explique como entendeu a necessidade e apresentou valor."],
    ],
  },
  administrativo: {
    label: "Administrativo",
    questions: [
      ["Como organiza tarefas com prazos diferentes?", "Mostre seu método de prioridade, agenda e acompanhamento."],
      ["Conte um erro que você identificou antes de causar problema.", "Destaque atenção, comunicação e prevenção."],
      ["Quais ferramentas de escritório você domina?", "Seja específico sobre planilhas, documentos e atividades que já realizou."],
    ],
  },
} as const;

type Group = keyof typeof GROUPS;

export function InterviewQuestions() {
  const [group, setGroup] = useState<Group>("geral");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/gratuito" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Voltar para recursos gratuitos</Link>
      <header className="mb-8 mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Cadastro grátis</span>
        <h1 className="mt-2 text-3xl font-bold">Perguntas de entrevista por cargo</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Escolha um perfil, responda em voz alta e use a orientação para estruturar sua resposta.</p>
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(GROUPS) as Group[]).map((key) => <button key={key} onClick={() => setGroup(key)} className={`rounded-full border px-4 py-2 text-xs font-bold ${group === key ? "border-blue-600 bg-blue-600 text-white" : "border-neutral-200 dark:border-neutral-800"}`}>{GROUPS[key].label}</button>)}
      </div>
      <div className="space-y-4">
        {GROUPS[group].questions.map(([question, tip], index) => <article key={question} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"><span className="text-xs font-bold text-blue-600">Pergunta {index + 1}</span><h2 className="mt-2 font-bold">{question}</h2><p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400"><strong>Como responder: </strong>{tip}</p></article>)}
      </div>
      <Link href="/register" className="mt-8 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Criar conta e fazer uma simulação</Link>
    </main>
  );
}
