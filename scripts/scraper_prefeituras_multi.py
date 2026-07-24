import urllib.request
import ssl
import json
import re
import sys
import sqlite3
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DB_FILE = "prefeituras_dados.db"

CIDADES_CONFIG = [
    {
        "id": "uberlandia",
        "nome": "Uberlândia",
        "uf": "MG",
        "url_base": "https://www.uberlandia.mg.gov.br"
    },
    {
        "id": "uberaba",
        "nome": "Uberaba",
        "uf": "MG",
        "url_base": "https://www.uberaba.mg.gov.br"
    },
    {
        "id": "araguari",
        "nome": "Araguari",
        "uf": "MG",
        "url_base": "https://araguari.mg.gov.br"
    }
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Cache-Control": "max-age=0"
}

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
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
        )
    ''')
    conn.commit()
    conn.close()

def fetch_html(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
        return response.read().decode('utf-8', errors='ignore')

def raspar_cidade_wordpress(cidade):
    print(f"[+] Raspando Prefeitura de {cidade['nome']} ({cidade['uf']})...")
    resultados = []
    
    termos = [
        ("vagas+sine", "vaga"),
        ("cursos+gratuitos", "curso"),
        ("eventos", "evento")
    ]
    
    for query, tipo in termos:
        search_url = f"{cidade['url_base']}/?s={query}"
        try:
            html = fetch_html(search_url)
            matches = re.findall(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', html)
            for href, text_raw in matches:
                clean_text = re.sub(r'<[^>]+>', '', text_raw).strip()
                if len(clean_text) > 12 and ('vaga' in clean_text.lower() or 'sine' in clean_text.lower() or 'curso' in clean_text.lower() or 'evento' in clean_text.lower()):
                    resultados.append({
                        "cidade": cidade['nome'],
                        "uf": cidade['uf'],
                        "tipo": tipo,
                        "titulo": clean_text,
                        "orgao_empresa": f"Prefeitura de {cidade['nome']}",
                        "link": href,
                        "detalhes": f"Publicação oficial da Prefeitura de {cidade['nome']}"
                    })
        except Exception as e:
            print(f"  [!] Aviso ({cidade['nome']}): erro na busca '{query}': {e}")
            
    return resultados

def salvar_banco(oportunidades):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    agora = datetime.now().isoformat()
    
    novos = 0
    for op in oportunidades:
        try:
            cursor.execute('''
                INSERT INTO oportunidades_municipais (cidade, uf, tipo, titulo, orgao_empresa, link, detalhes, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(link) DO UPDATE SET
                    titulo=excluded.titulo,
                    detalhes=excluded.detalhes
            ''', (op['cidade'], op['uf'], op['tipo'], op['titulo'], op['orgao_empresa'], op['link'], op['detalhes'], agora))
            novos += 1
        except Exception:
            pass
            
    conn.commit()
    conn.close()
    return novos

def main():
    init_db()
    total_coletados = 0
    
    for cidade in CIDADES_CONFIG:
        ops = raspar_cidade_wordpress(cidade)
        salvar_banco(ops)
        total_coletados += len(ops)
        print(f"  [OK] {len(ops)} itens processados para {cidade['nome']}")
        
    print(f"\n[OK] Scraping multi-cidades concluído!")
    print(f"  - Total de registros processados: {total_coletados}")
    print(f"  - Banco de dados: '{DB_FILE}'")

if __name__ == "__main__":
    main()
