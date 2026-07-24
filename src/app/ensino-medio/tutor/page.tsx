"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { TutorChatMessage } from "@/lib/ensino-medio-tools";
import {
  Bot,
  Sparkles,
  Send,
  User,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export default function VirtualTutorPage() {
  const [subject, setSubject] = useState("Geral (Todas as Matérias)");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou seu Tutor Virtual 24h alimentado pelo Gemini AI. Qual é a sua dúvida de matéria ou exercício de hoje? Pode perguntar!",
    },
  ]);
  const [followUps, setFollowUps] = useState<string[]>([
    "Como calcular probabilidade no ENEM?",
    "Me explique a Primeira Lei de Newton com exemplos.",
    "Quais as diferenças entre mitose e meiose?",
  ]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const newMessages: TutorChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ensino-medio/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          subject: subject === "Geral (Todas as Matérias)" ? undefined : subject,
        }),
      });

      if (!res.ok) throw new Error("Erro na API do tutor.");

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setMessages([
        ...newMessages,
        { role: "assistant", content: json.message },
      ]);
      if (Array.isArray(json.suggestedFollowUps)) {
        setFollowUps(json.suggestedFollowUps);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Desculpe, tive um problema para responder agora. Tente me enviar a pergunta novamente!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 space-y-6 flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Tutor Virtual 24h
              </h1>
              <p className="text-xs text-neutral-500">
                Monitoria escolar em tempo real para tirar dúvidas de Ensino Médio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200"
            >
              <option value="Geral (Todas as Matérias)">Geral (Todas)</option>
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biologia">Biologia</option>
              <option value="Português">Português</option>
              <option value="História">História</option>
            </select>

            <button
              onClick={() =>
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Chat reiniciado! Qual é sua dúvida?",
                  },
                ])
              }
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              title="Nova conversa"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Area do Chat */}
        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[450px] shadow-sm">
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 h-fit shrink-0 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-lg text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-bl-none font-medium"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 h-fit shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold p-2">
                <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
                Tutor Gemini pensando na resposta...
              </div>
            )}
          </div>

          {/* Perguntas Sugeridas & Form */}
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {followUps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {followUps.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(f)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold hover:bg-blue-100 transition-all"
                  >
                    💡 {f}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite sua dúvida ou cole o exercício de casa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs md:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
