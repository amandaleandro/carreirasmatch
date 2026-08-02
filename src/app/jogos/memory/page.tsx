import { redirect } from "next/navigation";

/** Compatibilidade com links antigos que usavam o slug em ingles. */
export default function MemoryAliasPage() {
  redirect("/jogos/memoria");
}
