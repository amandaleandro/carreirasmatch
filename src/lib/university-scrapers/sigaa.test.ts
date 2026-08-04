import { describe, expect, it } from "vitest";
import { parseSigaaCurriculum } from "./sigaa";

describe("parseSigaaCurriculum", () => {
  it("aceita os formatos de carga horária usados por versões diferentes do SIGAA", () => {
    const html = `
      <table class="subFormulario"><caption>1º Semestre</caption><tbody>
        <tr><td>ABC001 - Introdução à Administração - 64h</td></tr>
        <tr><td>ABC002 – Economia - CH: 60 horas</td></tr>
      </tbody></table>`;

    expect(parseSigaaCurriculum(html)).toEqual([
      { name: "Introdução à Administração", semester: 1 },
      { name: "Economia", semester: 1 },
    ]);
  });

  it("não duplica disciplinas quando a página contém mais de uma tabela da mesma grade", () => {
    const html = `
      <tr class="tituloRelatorio"><td>2º Período</td></tr>
      <tr class="componentes"><td>MAT001: Matemática Aplicada - 80h</td></tr>
      <table class="subFormulario"><caption>2º Nível</caption><tbody>
        <tr><td>MAT001: Matemática Aplicada - 80h</td></tr>
      </tbody></table>`;

    expect(parseSigaaCurriculum(html)).toEqual([{ name: "Matemática Aplicada", semester: 2 }]);
  });
});
