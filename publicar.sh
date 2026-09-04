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
         'favicon.svg','favicon-32.png','favicon-16.png','apple-touch-icon.png',
         # as imagens tambem: o host serve 7 dias e o logotipo do cabecalho esta
         # aqui — sem ?v=, corrigir a marca nao chega a quem ja visitou o site
         'zyon-assinatura.svg','zyon-nome.svg','zyon-simbolo-mancha.svg',
         'digitalizacao.jpg','armazem.jpg','ged.jpg',
         'qualidade.jpg','eficiencia.jpg','jornada.jpg','armazenamento.jpg',
         'thumb-institucional.jpg','thumb-processo.jpg']
# og-zyon.jpg fica FORA de proposito: versionar o og:image faz Facebook, LinkedIn
# e WhatsApp tratarem cada publicacao como card novo e reescrapearem tudo.
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
echo
echo "LEMBRETE — o envio por FTP NUNCA apaga. Todo arquivo renomeado ou removido"
echo "do repositório continua vivo no servidor até ser apagado à mão. O passo de"
echo "envio precisa comparar o servidor com um espelho gerado por rsync --delete"
echo "(sem o --delete o espelho fica velho junto e a comparação não acha nada)."
