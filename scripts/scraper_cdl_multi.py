import urllib.request
import ssl
import json
import re
import sys
import sqlite3
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DB_FILE = "cdl_dados.db"

CDL_CONFIGS = [
    {
        "id": "cdl-uberlandia",
        "nome": "Uberlândia",
        "uf": "MG",
        "quickin_slug": "cdludi",
        "url_cursos": "https://loja.cdludi.org.br/compras/cursos",
        "url_eventos": "https://loja.cdludi.org.br/compras/eventos"
    },
    {
        "id": "cdl-uberaba",
        "nome": "Uberaba",
        "uf": "MG",
        "url_base": "https://cdluberaba.com.br"
    },
    {
        "id": "cdl-araguari",
        "nome": "Araguari",
        "uf": "MG",
        "url_base": "https://cdlaraguari.com.br"
    }
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cdl_oportunidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cdl_cidade TEXT,
            uf TEXT,
            tipo TEXT,
            titulo TEXT,
            link TEXT UNIQUE,
            detalhes TEXT,
            criado_em TEXT
        )
    ''')
    conn.commit()
    conn.close()

def fetch_url(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return resp.read().decode('utf-8', errors='ignore')

def raspar_cdl(cdl):
    print(f"[+] Raspando CDL {cdl['nome']} ({cdl['uf']})...")
    resultados = []
    
    # 1. Raspar Vagas (Plataforma Quickin / CDL Talentos)
    if cdl.get("quickin_slug"):
        quickin_url = f"https://jobs.quickin.io/{cdl['quickin_slug']}/jobs?page=1"
        try:
            html = fetch_url(quickin_url)
            # Match links de jobs no Quickin
            matches = re.findall(r'href=["\'](/cdludi/jobs/[^"\']+|/jobs/[^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL)
            for href, text_raw in matches:
                clean_text = re.sub(r'<[^>]+>', '', text_raw).strip()
                clean_text = re.sub(r'\s+', ' ', clean_text)
                if len(clean_text) > 3:
                    full_link = f"https://jobs.quickin.io{href}"
                    resultados.append({
                        "cdl_cidade": cdl['nome'],
                        "uf": cdl['uf'],
                        "tipo": "vaga",
                        "titulo": clean_text,
                        "link": full_link,
                        "detalhes": f"Vaga divulgada pela CDL {cdl['nome']} (CDL Talentos / Estágios)"
                    })
        except Exception as e:
            print(f"  [!] Aviso vagas ({cdl['nome']}): {e}")
            
    # 2. Raspar Cursos e Eventos da Loja CDL
    if cdl.get("url_cursos"):
        try:
            html = fetch_url(cdl['url_cursos'])
            matches = re.findall(r'href=["\']([^"\']*Produto[^"\']*)["\'][^>]*>(.*?)</a>', html, re.DOTALL)
            for href, text_raw in matches:
                clean_text = re.sub(r'<[^>]+>', '', text_raw).strip()
                clean_text = re.sub(r'\s+', ' ', clean_text)
                if len(clean_text) > 8:
                    full_link = href if href.startswith('http') else f"https://loja.cdludi.org.br{href}"
                    resultados.append({
                        "cdl_cidade": cdl['nome'],
                        "uf": cdl['uf'],
                        "tipo": "curso",
                        "titulo": clean_text,
                        "link": full_link,
                        "detalhes": f"Curso cadastrado na CDL {cdl['nome']}"
                    })
        except Exception as e:
            print(f"  [!] Aviso cursos ({cdl['nome']}): {e}")

    return resultados

def salvar_banco(itens):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    agora = datetime.now().isoformat()
    
    for item in itens:
        try:
            cursor.execute('''
                INSERT INTO cdl_oportunidades (cdl_cidade, uf, tipo, titulo, link, detalhes, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(link) DO UPDATE SET
                    titulo=excluded.titulo,
                    detalhes=excluded.detalhes
            ''', (item['cdl_cidade'], item['uf'], item['tipo'], item['titulo'], item['link'], item['detalhes'], agora))
        except Exception:
            pass
            
    conn.commit()
    conn.close()

def main():
    init_db()
    total = 0
    
    for cdl in CDL_CONFIGS:
        itens = raspar_cdl(cdl)
        salvar_banco(itens)
        total += len(itens)
        print(f"  [OK] {len(itens)} itens processados na CDL {cdl['nome']}")
        
    print(f"\n[OK] Scraping das CDLs concluído com sucesso!")
    print(f"  - Total de itens processados: {total}")
    print(f"  - Banco de dados: '{DB_FILE}'")

if __name__ == "__main__":
    main()
