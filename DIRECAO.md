# Zyon Tech — Redesign imersivo

Conceito construído com a skill `sites-matadores` a partir do conteúdo real de
zyontecnologia.com.br (capturado 2026-08-23).

## Direção

- **Sentir:** "meu acervo estaria num cofre — e a lei está do meu lado."
- **Entender:** a Zyon cobre o ciclo de vida inteiro do documento (papel → digital
  → guarda → descarte legal) com validade jurídica.
- **Fazer:** chamar o especialista no WhatsApp.

**Formato:** single-page narrativa (1 empresa, 1 história, 1 conversão).
**Mundo visual:** "cofre meia-noite" — navy profundo `#0D1321` (frio,
institucional/segurança) × papel `#F5EEE1` (quente) × âmbar da marca `#E45D16`
como única ação (complementar do navy — vibra). Carimbo sobre papel em
vermelho-lacre `#B5330F` (sinete). Hairlines, grão de papel (feTurbulence).
Racional da troca (2026-08-23): a paleta v1 "cofre âmbar" (marrom `#171009`) era
100% quente-análoga — sem polo frio o âmbar não vibrava e o dark lia "rústico".
**Tipografia:** Fraunces (display, opsz) · Archivo (texto) · IBM Plex Mono
(rótulos/números). Self-hosted em `assets/fonts/`.
**Gesto assinatura:** o carimbo (overshoot `cubic-bezier(.34,1.56,.64,1)`).

## Set pieces

1. **O Scanner** (hero pinado, fator 2.6): o scroll digitaliza um documento —
   feixe âmbar varre a folha, papel vira camada digital (OCR, PDF/A, SHA-256),
   chips de conformidade carimbam por threshold de progresso.
2. **O Ciclo** (jornada pinada, fator 5.5): 6 etapas reais do processo, rail com
   descrição expandida da etapa ativa, teatro de ícones, contador `CICLO ▸ NNN%`.
3. **Amparo Legal**: leis carimbam com overshoot — 8.159/91, 12.682/2012,
   10.278/2020, LGPD + CONARQ/temporalidade.

## Stack

Vanilla HTML/CSS/JS. Motor de pin sticky+spacer+lerp (0.12) com IO-gating;
CSS scroll-driven na barra de progresso (`animation-timeline: scroll(root)`);
reduced-motion como modo projetado (pins colapsam para estados estáveis, marquees
param); facade de YouTube com thumbs locais. JS 2,5KB gz · CSS 6,9KB gz.

## QA

`python3 -m http.server 8873` na raiz e abrir `http://localhost:8873`.

Hooks de verificação por query string (só QA, inertes em produção):
- `?rm=1` força reduced-motion; `?freeze=0.5` congela pins num progresso;
- `?vh=900` fixa o svh dos pin-screens; `?shift=N` desloca o layout (captura
  headless não rasteriza fora do viewport inicial); `?probe=1` grava medidas no
  `<title>` (ler com `--dump-dom`).
- Headless=new tem largura mínima de janela de 500px — capturas "390" saem
  cortadas; medir mobile real pelo probe/pane.

Verificado: 390/844 e 390/667 sem corte nem overflow-x; rm íntegro; console
limpo; grids 3×2 (segmentos) e 2×2 (leis).
