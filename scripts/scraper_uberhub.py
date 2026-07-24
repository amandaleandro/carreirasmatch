import urllib.request
import json
import re
import sys
from html.parser import HTMLParser

# Configuração de encoding para o terminal Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

URL_VAGAS = "https://app.uberhub.com.br/vagas/"
URL_EVENTOS = "https://app.uberhub.com.br/eventos/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

class SimpleParagraphParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_p = False
        self.in_a = False
        self.current_paragraph = {"text": [], "links": []}
        self.paragraphs = []
        self.current_link_href = None
        self.current_link_text = ""

    def handle_starttag(self, tag, attrs):
        if tag == 'p':
            self.in_p = True
            self.current_paragraph = {"text": [], "links": []}
        elif tag == 'a' and self.in_p:
            self.in_a = True
            attr_dict = dict(attrs)
            self.current_link_href = attr_dict.get('href')
            self.current_link_text = ""
        elif tag == 'br' and self.in_p:
            self.current_paragraph["text"].append("\n")

    def handle_endtag(self, tag):
        if tag == 'p':
            self.in_p = False
            full_text = "".join(self.current_paragraph["text"]).strip()
            if full_text:
                self.paragraphs.append({
                    "text": full_text,
                    "links": self.current_paragraph["links"]
                })
        elif tag == 'a' and self.in_p:
            self.in_a = False
            if self.current_link_href:
                self.current_paragraph["links"].append({
                    "href": self.current_link_href,
                    "text": self.current_link_text.strip()
                })

    def handle_data(self, data):
        if self.in_p:
            self.current_paragraph["text"].append(data)
            if self.in_a:
                self.current_link_text += data

def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        return response.read().decode('utf-8', errors='ignore')

def clean_text(text):
    return re.sub(r'[ \t]+', ' ', text).strip()

def scrape_vagas_e_cursos():
    print(f"[+] Obtendo dados de {URL_VAGAS}...")
    html = fetch_html(URL_VAGAS)
    parser = SimpleParagraphParser()
    parser.feed(html)
    
    vagas = []
    cursos = []
    
    keywords_curso = ['curso', 'bootcamp', 'oficina', 'bolsas', 'treinamento', 'formação', 'aprenda']
    
    for item in parser.paragraphs:
        raw_text = item["text"]
        links = item["links"]
        
        if not links or "VAGAS DE TECNOLOGIA" in raw_text or "Programação - QA" in raw_text:
            continue
            
        lines = [clean_text(l) for l in raw_text.split('\n') if clean_text(l)]
        if not lines:
            continue
            
        titulo = lines[0]
        empresa = lines[1] if len(lines) > 1 and not lines[1].startswith('http') and 'Match' not in lines[1] else "Não informada"
        
        titulo_limpo = re.sub(r'^[🦜🎓📊⚡📱🔥]\s*', '', titulo)
        empresa_limpa = re.sub(r'^[🏦📍]\s*', '', empresa)
        
        link = links[0]["href"] if links else None
        
        dado = {
            "titulo": titulo_limpo,
            "empresa_organizacao": empresa_limpa,
            "link": link,
            "detalhes": " | ".join(lines)
        }
        
        if any(kw in titulo.lower() for kw in keywords_curso) or any(kw in empresa.lower() for kw in keywords_curso):
            cursos.append(dado)
        else:
            vagas.append(dado)
            
    return vagas, cursos

def scrape_eventos():
    print(f"[+] Obtendo dados de {URL_EVENTOS}...")
    html = fetch_html(URL_EVENTOS)
    parser = SimpleParagraphParser()
    parser.feed(html)
    
    eventos = []
    cursos_eventos = []
    
    keywords_curso = ['curso', 'bootcamp', 'oficina', 'mini curso', 'treinamento', 'imersão', 'workshop']
    
    for item in parser.paragraphs:
        raw_text = item["text"]
        links = item["links"]
        
        if not links or "eventos em destaques" in raw_text or "agenda completa" in raw_text:
            continue
            
        lines = [clean_text(l) for l in raw_text.split('\n') if clean_text(l)]
        if not lines:
            continue
            
        titulo = lines[0]
        data_hora = lines[1] if len(lines) > 1 else ""
        local = lines[2] if len(lines) > 2 and not lines[2].startswith('http') else ""
        
        titulo_limpo = re.sub(r'^[🔥🗓️]\s*', '', titulo)
        local_limpo = re.sub(r'^[🚩]\s*', '', local)
        link = links[0]["href"] if links else None
        
        dado = {
            "titulo": titulo_limpo,
            "data_horario": data_hora,
            "local": local_limpo,
            "link": link,
            "detalhes": " | ".join(lines)
        }
        
        if any(kw in titulo.lower() for kw in keywords_curso):
            cursos_eventos.append(dado)
        else:
            eventos.append(dado)
            
    return eventos, cursos_eventos

def main():
    vagas, cursos_vagas = scrape_vagas_e_cursos()
    eventos, cursos_eventos = scrape_eventos()
    
    todos_cursos = cursos_vagas + cursos_eventos
    
    resultado = {
        "vagas": vagas,
        "cursos": todos_cursos,
        "eventos": eventos
    }
    
    print("\n[OK] Scraping concluído com sucesso!")
    print(f"  - Vagas encontradas: {len(vagas)}")
    print(f"  - Cursos encontrados: {len(todos_cursos)}")
    print(f"  - Eventos encontrados: {len(eventos)}")
    
    arquivo_saida = "uberhub_dados.json"
    with open(arquivo_saida, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
        
    print(f"\n[OK] Dados gravados no arquivo: {arquivo_saida}")

if __name__ == "__main__":
    main()
