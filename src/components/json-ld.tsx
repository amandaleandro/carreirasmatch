/**
 * Injeta dados estruturados (JSON-LD) no HTML. O Google lê o conteúdo do
 * <script type="application/ld+json">; ele não é executado como script.
 */
export function JsonLd({ id, data }: { id?: string; data: object }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      // O conteúdo é gerado no servidor a partir de dados nossos, não de input do usuário.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
