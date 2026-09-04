#!/bin/bash
# Publica o site em produção. Gira o cache-buster SOZINHO — foi esquecer de girar
# a mão que fez o visitante ficar preso 7 dias no CSS antigo (o host serve
# Cache-Control: max-age=604800 e as páginas pediam sempre o mesmo ?v=).
set -euo pipefail
cd "$(dirname "$0")"

VER=$(date +%Y%m%d%H%M%S)
python3 - "$VER" <<'PY'
import re, sys, glob
v = sys.argv[1]
alvos = ['css/style.css','css/pagina.css','js/main.js','assets/fonts/fonts.css',
         'favicon.svg','favicon-32.png','favicon-16.png','apple-touch-icon.png']
n = 0
for p in glob.glob('*.html') + glob.glob('*/index.html'):
    s = open(p, encoding='utf-8').read(); o = s
    for a in alvos:
        nome = re.escape(a.split('/')[-1])
        # casa o arquivo com ou sem ?v= anterior, em caminho relativo ou absoluto
        s = re.sub(r'(' + nome + r')(\?v=\d+)?(?=")', r'\1?v=' + v, s)
    if s != o:
        open(p, 'w', encoding='utf-8').write(s); n += 1
print(f'versão {v} aplicada em {n} páginas')
PY
echo "$VER" > .versao
echo "Agora rode o envio por FTP com esta versão."
