import { describe, expect, it } from "vitest";
import { extractSubjectsFromHtml } from "./ufu";

describe("extractSubjectsFromHtml", () => {
  it("extrai disciplinas de uma tabela de grade curricular", () => {
    const html = `
      <table>
        <tr><th>Código</th><th>Disciplina</th><th>Carga Horária</th></tr>
        <tr><td>GBC001</td><td>Algoritmos e Programação</td><td>60</td></tr>
        <tr><td>GBC002</td><td>Estruturas de Dados</td><td>60</td></tr>
      </table>
    `;
    expect(extractSubjectsFromHtml(html)).toEqual([
      { name: "Algoritmos e Programação" },
      { name: "Estruturas de Dados" },
    ]);
  });

  it("extrai disciplinas de links no formato código - nome", () => {
    const html = `
      <ul>
        <li><a href="/disciplina/1">GBC003 - Banco de Dados</a></li>
        <li><a href="/disciplina/2">GBC004 - Redes de Computadores</a></li>
      </ul>
    `;
    expect(extractSubjectsFromHtml(html)).toEqual([
      { name: "Banco de Dados" },
      { name: "Redes de Computadores" },
    ]);
  });

  it("ignora cabeçalhos e valores numéricos que não são nomes de disciplina", () => {
    const html = `
      <table>
        <tr><th>Período</th><th>Componente</th><th>Total</th></tr>
        <tr><td>1</td><td>Cálculo I</td><td>60</td></tr>
      </table>
    `;
    expect(extractSubjectsFromHtml(html)).toEqual([{ name: "Cálculo I" }]);
  });

  it("remove duplicatas por nome, ignorando maiúsculas/minúsculas", () => {
    const html = `
      <table>
        <tr><td>GBC005</td><td>Introdução à Computação</td></tr>
      </table>
      <a href="/x">GBC005 - introdução à computação</a>
    `;
    expect(extractSubjectsFromHtml(html)).toHaveLength(1);
  });
});
