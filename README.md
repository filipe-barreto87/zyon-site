# Site Zyon Tecnologia — homologação

Site institucional estático (HTML/CSS/JS puro, sem build, sem dependências).

- **Homologação:** https://filipe-barreto87.github.io/zyon-site/
- **Produção atual:** https://zyontecnologia.com.br (WordPress — a ser substituído)

## Estrutura
```
index.html          página única com âncoras
css/style.css       sistema visual "cofre âmbar"
js/main.js          motor de pin/scroll (~2,5 KB gz)
assets/fonts/       Fraunces, Archivo, IBM Plex Mono (self-hosted)
```

## Ao promover para produção
1. Remover a meta `robots noindex` do `index.html` (marcada com `HOMOLOGACAO-NOINDEX`)
2. Substituir o `robots.txt` pela versão de produção + `Sitemap:`
3. Configurar os redirects 301 dos posts antigos do WordPress
