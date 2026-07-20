import { PDFParse } from "pdf-parse";

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_FILES = 30;

export type ParsedResume = { fileName: string; rawText: string };

export type ParseResult =
  | { ok: true; parsed: ParsedResume[] }
  | { ok: false; error: string; status: number };

/**
 * Extrai texto dos PDFs enviados. Ignora arquivos que falharem ou vierem vazios;
 * retorna erro só quando algum passa do tamanho ou nada pôde ser extraído.
 */
export async function parseResumeFiles(files: File[]): Promise<ParseResult> {
  if (files.length === 0) {
    return { ok: false, error: "Envie ao menos um currículo em PDF.", status: 400 };
  }
  if (files.length > MAX_RESUME_FILES) {
    return { ok: false, error: `Envie no máximo ${MAX_RESUME_FILES} currículos por vez.`, status: 400 };
  }

  const parsed: ParsedResume[] = [];
  for (const file of files) {
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      return { ok: false, error: `"${file.name}" passa de 5MB.`, status: 413 };
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text.trim();
      if (text) parsed.push({ fileName: file.name, rawText: text });
    } catch (error) {
      console.error(`Falha ao ler PDF "${file.name}":`, error);
    }
  }

  if (parsed.length === 0) {
    return { ok: false, error: "Não foi possível extrair texto de nenhum dos PDFs enviados.", status: 422 };
  }
  return { ok: true, parsed };
}
