import urllib.request
import ssl

urls = [
    "https://www.uberlandia.mg.gov.br/prefeitura/secretarias/desenvolvimento-social/",
    "https://www.uberlandia.mg.gov.br/category/noticias/",
    "https://www.uberlandia.mg.gov.br/?s=vagas",
    "https://www.uberlandia.mg.gov.br/?s=cursos"
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            print(f"URL: {url} -> Status: {resp.status}, Len: {len(resp.read())}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")
