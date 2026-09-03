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
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      btn.replaceChildren(f);
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

  /* ---------- cena 1: o scanner ---------- */
  const doc = document.getElementById("doc");
  const chips = [...document.querySelectorAll(".chip")];
  registrar(document.querySelector(".hero"), (p, estatico) => {
    if (doc) {
      const scan = 8 + p * 84;
      doc.style.setProperty("--scan", `${scan}%`);
      doc.querySelector(".doc-beam").style.opacity = (p > 0.02 && p < 0.98) ? 1 : 0;
    }
    for (const c of chips) c.classList.toggle("on", p >= +c.dataset.at);
    if (estatico) chips.forEach(c => c.classList.add("on"));
  });

  /* ---------- cena 2: o ciclo ---------- */
  const rail = document.getElementById("cicloRail");
  const teatro = document.getElementById("cicloTeatro");
  const prot = document.getElementById("cicloProt");
  const barra = document.getElementById("cicloBarra");
  const itens = rail ? [...rail.children] : [];
  const icones = teatro ? [...teatro.children] : [];
  registrar(document.querySelector(".ciclo"), (p, estatico) => {
    if (estatico) {
      itens.forEach(li => li.classList.add("on"));
      if (prot) prot.textContent = "CICLO ▸ 06 ETAPAS";
      return;
    }
    const i = Math.min(5, Math.floor(p * 6));
    itens.forEach((li, k) => li.classList.toggle("on", k === i));
    icones.forEach((ic, k) => ic.classList.toggle("on", k === i));
    if (prot) prot.textContent = `CICLO ▸ ${String(Math.round(p * 100)).padStart(3, "0")}%`;
    if (barra) barra.style.width = `${p * 100}%`;
  });

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
