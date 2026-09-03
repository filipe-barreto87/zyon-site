/* ZYON — motor vanilla: pins (sticky+spacer+lerp), reveals, contadores, facade */
(() => {
  "use strict";

  const qs = new URLSearchParams(location.search);
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches || qs.has("rm");
  const freeze = qs.has("freeze") ? Math.min(1, Math.max(0, +qs.get("freeze"))) : null; // QA: congela pins num progresso fixo
  document.documentElement.classList.toggle("rm", rm);
  if (rm || freeze !== null) {                     // QA/acessibilidade: âncoras sem smooth
    document.documentElement.style.scrollBehavior = "auto";
    if (location.hash) queueMicrotask(() => document.querySelector(location.hash)?.scrollIntoView());
  }
  if (qs.has("scroll")) addEventListener("load", () =>  // QA headless: posição determinística
    scrollTo({ top: +qs.get("scroll"), behavior: "instant" }));
  if (qs.has("vh")) document.documentElement.style.setProperty("--vhpx", `${+qs.get("vh")}px`); // QA: svh fixo
  if (qs.has("shift")) document.body.style.marginTop = `-${+qs.get("shift")}px`; // QA headless: viewport deslocada
  if (qs.has("probe2")) addEventListener("load", () => setTimeout(() => {
    const c = document.querySelector(".ciclo");
    const ativa = [...document.querySelectorAll("#cicloRail li")].findIndex(li => li.classList.contains("on"));
    const r = c.getBoundingClientRect();
    document.title = `PROBE2 topoCiclo=${Math.round(r.top+scrollY)} scrollY=${Math.round(scrollY)} visivel=${r.top < innerHeight && r.bottom > 0} etapaAtiva=${ativa+1} rotulo="${document.getElementById("cicloProt").textContent}"`;
  }, +(qs.get("probe2")||0)));
  if (qs.has("probe")) addEventListener("load", () => {   // QA: medição legível via --dump-dom
    const de = document.documentElement;
    const h1 = document.querySelector(".hero-h1").getBoundingClientRect();
    const sub = document.querySelector(".hero-sub").getBoundingClientRect();
    document.title = `PROBE iw=${innerWidth} cw=${de.clientWidth} sw=${de.scrollWidth} h1r=${Math.round(h1.right)} subr=${Math.round(sub.right)} fs=${getComputedStyle(document.querySelector(".hero-h1")).fontSize}`;
  });

  /* ---------- header ---------- */
  const header = document.getElementById("header");
  addEventListener("scroll", () => {
    header.classList.toggle("rolou", scrollY > 40);
  }, { passive: true });

  /* ---------- reveals (IO) ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));

  /* ---------- contadores ---------- */
  const fmt = new Intl.NumberFormat("pt-BR");
  const tween = (el) => {
    const alvo = +el.dataset.count, t0 = performance.now(), dur = 1100;
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt.format(Math.round(alvo * e));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  const ioNum = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      rm ? e.target.textContent = fmt.format(+e.target.dataset.count) : tween(e.target);
      ioNum.unobserve(e.target);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => ioNum.observe(el));

  /* ---------- facade YouTube ---------- */
  document.querySelectorAll(".yt").forEach(btn => {
    btn.addEventListener("click", () => {
      // o clique é o consentimento (avisado no figcaption ao lado)
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      f.title = btn.getAttribute("aria-label") || "Vídeo";
      f.className = "yt-frame";
      btn.replaceWith(f);                       // substitui o botão — iframe nunca dentro de <button>
      const aviso = f.parentElement?.querySelector(".yt-aviso");
      if (aviso) aviso.textContent = "Vídeo carregado do YouTube (Google).";
    }, { once: true });
  });

  document.getElementById("ano").textContent = new Date().getFullYear();

  /* ============================================================
     MOTOR DE PIN — progresso 0..1 com lerp; sem sequestro de scroll
     ============================================================ */
  const pins = [];
  const registrar = (wrap, cb) => {
    if (!wrap) return;
    if (rm) { cb(0.55, true); return; }            // estado estável projetado
    wrap.style.height = `${(+wrap.dataset.factor || 3) * 100}svh`;
    if (freeze !== null) { cb(freeze, false); return; } // QA headless: sem rAF
    pins.push({ wrap, cb, p: 0, alvo: 0, vivo: false });
  };

  const calcAlvo = (pin) => {
    const r = pin.wrap.getBoundingClientRect();
    const curso = pin.wrap.offsetHeight - innerHeight;
    return Math.min(1, Math.max(0, -r.top / (curso || 1)));
  };

  if (!rm) {
    const ioPin = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const pin = pins.find(p => p.wrap === e.target);
        if (pin) pin.vivo = e.isIntersecting;
      }
    }, { rootMargin: "12% 0px" });

    const loop = () => {
      for (const pin of pins) {
        if (!pin.vivo) continue;
        pin.alvo = calcAlvo(pin);
        // salto grande (aba restaurada / âncora): iguala direto
        if (Math.abs(pin.alvo - pin.p) > 0.2) pin.p = pin.alvo;
        else pin.p += (pin.alvo - pin.p) * 0.12;
        pin.cb(pin.p, false);
      }
      requestAnimationFrame(loop);
    };
    queueMicrotask(() => {
      pins.forEach(p => ioPin.observe(p.wrap));
      requestAnimationFrame(loop);
    });
  }

  /* ---------- cena 1: o scanner (scroll + demonstração automática) ---------- */
  const doc = document.getElementById("doc");
  const chips = [...document.querySelectorAll(".chip")];
  let demoP = null;                      // quando != null, sobrepõe o scroll

  const pintarHero = (p, estatico) => {
    if (doc) {
      doc.style.setProperty("--scan", `${8 + p * 84}%`);
      const feixe = doc.querySelector(".doc-beam");
      if (feixe) feixe.style.opacity = (p > 0.02 && p < 0.98) ? 1 : 0;
    }
    for (const c of chips) c.classList.toggle("on", p >= +c.dataset.at);
    if (estatico) chips.forEach(c => c.classList.add("on"));
  };
  registrar(document.querySelector(".hero"), (p, estatico) => pintarHero(demoP !== null ? demoP : p, estatico));

  // demonstração: varre o documento sozinho e volta ao início, liberando o scroll.
  // Cancela ao primeiro gesto do usuário — quem rola manda.
  if (!rm && doc) {
    let demoViva = false;
    const cancelar = () => { demoViva = false; demoP = null; };
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(ev =>
      addEventListener(ev, cancelar, { passive: true, once: true }));
    addEventListener("scroll", () => { if (scrollY > 12) cancelar(); }, { passive: true });

    setTimeout(() => {
      if (scrollY > 12) return;
      demoViva = true;
      const t0 = performance.now(), IDA = 2400, ESPERA = 900, VOLTA = 800;
      const suave = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const quadro = (t) => {
        if (!demoViva) return;
        const dt = t - t0;
        if (dt < IDA) demoP = 0.92 * suave(dt / IDA);
        else if (dt < IDA + ESPERA) demoP = 0.92;
        else if (dt < IDA + ESPERA + VOLTA) demoP = 0.92 * (1 - suave((dt - IDA - ESPERA) / VOLTA));
        else return cancelar();          // volta a 0 = estado do scroll, sem salto
        requestAnimationFrame(quadro);
      };
      requestAnimationFrame(quadro);
    }, 900);
  }

  /* ---------- cena 2: o ciclo — AUTOPLAY (não depende mais de scroll) ---------- */
  const rail = document.getElementById("cicloRail");
  const teatro = document.getElementById("cicloTeatro");
  const prot = document.getElementById("cicloProt");
  const barra = document.getElementById("cicloBarra");
  const itens = rail ? [...rail.children] : [];
  const icones = teatro ? [...teatro.children] : [];
  const secaoCiclo = document.querySelector(".ciclo");

  if (itens.length && secaoCiclo) {
    const TOTAL = itens.length, DUR = 3200;
    let atual = -1, timer = null, tocado = false;

    const mostrar = (i, animarBarra = true) => {
      atual = i;
      itens.forEach((li, k) => li.classList.toggle("on", k === i));
      icones.forEach((ic, k) => ic.classList.toggle("on", k === i));
      if (prot) prot.textContent = `ETAPA ${String(i + 1).padStart(2, "0")} DE ${String(TOTAL).padStart(2, "0")}`;
      if (barra) {
        barra.style.transition = "none";
        barra.style.width = `${(i / TOTAL) * 100}%`;
        void barra.offsetWidth;                       // reflow: garante o ponto de partida
        if (animarBarra) {
          barra.style.transition = `width ${DUR}ms linear`;
          barra.style.width = `${((i + 1) / TOTAL) * 100}%`;
        }
      }
    };

    const parar = () => { clearInterval(timer); timer = null; };
    const tocar = () => {
      if (timer || rm) return;
      if (atual < 0) mostrar(0);
      timer = setInterval(() => mostrar((atual + 1) % TOTAL), DUR);
    };

    // roda só enquanto a seção está à vista (não gasta CPU nem "passa" escondido)
    new IntersectionObserver((es) => {
      es.forEach(e => e.isIntersecting ? tocar() : parar());
    }, { threshold: 0.3 }).observe(secaoCiclo);

    // cada etapa é clicável: vai direto e o ciclo segue dali
    itens.forEach((li, k) => {
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `Ver etapa ${k + 1} de ${TOTAL}`);
      const ir = () => { tocado = true; parar(); mostrar(k); tocar(); };
      li.addEventListener("click", ir);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); }
      });
    });

    if (rm) {                                          // reduced-motion: tudo visível, sem timer
      itens.forEach(li => li.classList.add("on"));
      icones.forEach((ic, k) => ic.classList.toggle("on", k === 0));
      if (prot) prot.textContent = `CICLO ▸ ${TOTAL} ETAPAS`;
      if (barra) barra.style.width = "100%";
    }
  }

  /* ---------- tilt de ponteiro no documento (fino + sem rm) ---------- */
  if (!rm && matchMedia("(hover: hover) and (pointer: fine)").matches && doc) {
    const palco = document.querySelector(".hero-stage");
    let rx = 0, ry = 0, ax = 0, ay = 0;
    palco.addEventListener("pointermove", (ev) => {
      const r = palco.getBoundingClientRect();
      ax = ((ev.clientX - r.left) / r.width - 0.5) * 10;
      ay = ((ev.clientY - r.top) / r.height - 0.5) * -8;
    });
    palco.addEventListener("pointerleave", () => { ax = 0; ay = 0; });
    const tilt = () => {
      rx += (ax - rx) * 0.08; ry += (ay - ry) * 0.08;
      doc.style.transform = `rotate(2deg) perspective(900px) rotateY(${rx}deg) rotateX(${ry}deg)`;
      requestAnimationFrame(tilt);
    };
    requestAnimationFrame(tilt);
  }
})();
