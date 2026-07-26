"""Coleta prefeituras da TI-IDEAL e oportunidades publicadas nos sites.

Uso:
    python scripts/scraper_prefeituras_multi.py --exportar prefeituras.csv
    python scripts/scraper_prefeituras_multi.py --coletar --limite 20

Por padrão, o script apenas importa a lista de prefeituras. A coleta dos
sites é opt-in porque a página contém muitos links e cada domínio tem uma
estrutura diferente.
"""

from __future__ import annotations

import argparse
import csv
import html as html_lib
import re
import sqlite3
import ssl
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen


SOURCE_URL = "https://www.idealsoftwares.com.br/prefeituras/"
DB_FILE = "prefeituras_dados.db"
USER_AGENT = "UberHub-Prefeituras/1.0 (+coleta-respeitosa)"

UF_BY_PANEL = {
    1: "AC", 2: "AL", 3: "AP", 4: "AM", 5: "BA", 6: "CE",
    7: "DF", 8: "ES", 9: "GO", 10: "MA", 11: "MT", 12: "MS",
    13: "MG", 14: "PA", 15: "PB", 16: "PR", 17: "PE", 18: "PI",
    19: "RJ", 20: "RN", 21: "RS", 22: "RO", 23: "RR", 24: "SC",
    25: "SP", 28: "SE", 29: "TO",
}

KEYWORDS = {
    "vaga": "vaga",
    "vagas": "vaga",
    "emprego": "vaga",
    "sine": "vaga",
    "processo seletivo": "vaga",
    "concurso": "concurso",
    "curso": "curso",
    "cursos": "curso",
    "capacitação": "curso",
    "qualificação": "curso",
}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        attributes = dict(attrs)
        self._href = attributes.get("href")
        self._text = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._href:
            text = " ".join("".join(self._text).split())
            self.links.append((self._href, text))
            self._href = None
            self._text = []


def clean_url(url: str) -> str:
    parsed = urlparse(url.strip())
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path or "/", "", parsed.query, ""))


def domain(url: str) -> str:
    return urlparse(url).netloc.lower().removeprefix("www.")


def fetch(url: str, timeout: int = 20) -> tuple[str, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "pt-BR,pt;q=0.9"})
    context = ssl.create_default_context()
    with urlopen(request, timeout=timeout, context=context) as response:
        body = response.read()
        charset = response.headers.get_content_charset() or "utf-8"
        return body.decode(charset, errors="replace"), response.geturl()


def text_keyword(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", html_lib.unescape(text).strip().lower())
    for keyword, kind in KEYWORDS.items():
        if keyword in normalized:
            return kind
    return None


def extract_prefeituras(page: str) -> list[dict[str, str]]:
    soup = LinkParser()
    soup.feed(page)
    records: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for panel_id, uf in UF_BY_PANEL.items():
        marker_start = page.find(f'id="panel{panel_id}"')
        next_panel = page.find('<tr valign="top" id="panel', marker_start + 1)
        marker_end = next_panel if next_panel >= 0 else len(page)
        panel_html = page[marker_start:marker_end] if marker_start >= 0 else ""
        panel_parser = LinkParser()
        panel_parser.feed(panel_html)

        for href, name in panel_parser.links:
            url = clean_url(urljoin(SOURCE_URL, href))
            if not name or urlparse(url).scheme not in {"http", "https"}:
                continue
            key = (uf, url.lower())
            if key in seen:
                continue
            seen.add(key)
            records.append({"uf": uf, "municipio": name, "url": url, "dominio": domain(url)})

    return records


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS prefeituras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uf TEXT NOT NULL,
            municipio TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            dominio TEXT NOT NULL,
            atualizado_em TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS oportunidades_municipais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cidade TEXT,
            uf TEXT,
            tipo TEXT,
            titulo TEXT,
            orgao_empresa TEXT,
            link TEXT UNIQUE,
            detalhes TEXT,
            criado_em TEXT
        );
    """)


def save_prefeituras(conn: sqlite3.Connection, records: list[dict[str, str]]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn.executemany("""
        INSERT INTO prefeituras (uf, municipio, url, dominio, atualizado_em)
        VALUES (:uf, :municipio, :url, :dominio, :atualizado_em)
        ON CONFLICT(url) DO UPDATE SET
            uf=excluded.uf, municipio=excluded.municipio,
            dominio=excluded.dominio, atualizado_em=excluded.atualizado_em
    """, [{**record, "atualizado_em": now} for record in records])
    conn.commit()


def search_urls(base_url: str) -> list[str]:
    """Gera buscas comuns de WordPress sem assumir que todo site as suporta."""
    parsed = urlparse(base_url)
    urls = [base_url]
    for term in ("vagas", "cursos", "processo seletivo", "capacitação", "concurso"):
        query = urlencode({"s": term})
        urls.append(urlunparse((parsed.scheme, parsed.netloc, "/", "", query, "")))
    return list(dict.fromkeys(urls))


def collect_site(prefeitura: dict[str, str], delay: float, timeout: int) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    seen_links: set[str] = set()
    root_domain = domain(prefeitura["url"])

    for candidate in search_urls(prefeitura["url"]):
        try:
            page, final_url = fetch(candidate, timeout=timeout)
        except (HTTPError, URLError, TimeoutError, ValueError):
            continue

        parser = LinkParser()
        parser.feed(page)
        for href, title in parser.links:
            kind = text_keyword(f"{title} {href}")
            link = clean_url(urljoin(final_url, href))
            if not kind or not title or domain(link) != root_domain or link in seen_links:
                continue
            seen_links.add(link)
            results.append({
                "cidade": prefeitura["municipio"],
                "uf": prefeitura["uf"],
                "tipo": kind,
                "titulo": title,
                "orgao_empresa": f"Prefeitura de {prefeitura['municipio']}",
                "link": link,
                "detalhes": f"Encontrado em {candidate}",
            })
        time.sleep(delay)

    return results


def save_opportunities(conn: sqlite3.Connection, records: list[dict[str, str]]) -> int:
    now = datetime.now(timezone.utc).isoformat()
    for record in records:
        conn.execute("""
            INSERT INTO oportunidades_municipais
                (cidade, uf, tipo, titulo, orgao_empresa, link, detalhes, criado_em)
            VALUES (:cidade, :uf, :tipo, :titulo, :orgao_empresa, :link, :detalhes, :criado_em)
            ON CONFLICT(link) DO UPDATE SET
                cidade=excluded.cidade, uf=excluded.uf, tipo=excluded.tipo,
                titulo=excluded.titulo, detalhes=excluded.detalhes
        """, {**record, "criado_em": now})
    conn.commit()
    return len(records)


def export_csv(path: str, records: list[dict[str, str]]) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as output:
        writer = csv.DictWriter(output, fieldnames=["uf", "municipio", "url", "dominio"])
        writer.writeheader()
        writer.writerows(records)


def main() -> None:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("--db", default=DB_FILE)
    argument_parser.add_argument("--exportar", default="prefeituras.csv")
    argument_parser.add_argument("--coletar", action="store_true")
    argument_parser.add_argument("--limite", type=int, default=0, help="0 = todas; use um número para teste")
    argument_parser.add_argument("--delay", type=float, default=1.5, help="segundos entre requisições ao mesmo site")
    argument_parser.add_argument("--timeout", type=int, default=8, help="segundos de espera por requisição")
    args = argument_parser.parse_args()

    page, _ = fetch(SOURCE_URL)
    prefeituras = extract_prefeituras(page)
    export_csv(args.exportar, prefeituras)

    with sqlite3.connect(args.db) as conn:
        init_db(conn)
        save_prefeituras(conn, prefeituras)

        print(f"[OK] {len(prefeituras)} prefeituras importadas")
        print(f"[OK] CSV: {args.exportar}")
        print(f"[OK] Banco: {args.db}")

        if args.coletar:
            alvo = prefeituras[:args.limite] if args.limite else prefeituras
            total = 0
            for index, prefeitura in enumerate(alvo, start=1):
                opportunities = collect_site(prefeitura, args.delay, args.timeout)
                total += save_opportunities(conn, opportunities)
                print(f"[{index}/{len(alvo)}] {prefeitura['municipio']}/{prefeitura['uf']}: {len(opportunities)} encontrados")
            print(f"[OK] {total} oportunidades processadas")


if __name__ == "__main__":
    main()
