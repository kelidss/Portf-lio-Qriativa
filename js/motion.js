// Qriativa · animações de entrada e de scroll (GSAP + ScrollTrigger + Lenis).
// Se o GSAP não carregar ou a pessoa preferir menos movimento, o main.js assume com um fallback simples.
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('has-motion', 'js-ready');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = window.matchMedia('(pointer: fine)').matches;

  // As animações abaixo substituem o "reveal" simples do CSS nesses elementos
  const unreveal = (el) => { el.classList.remove('reveal'); el.classList.add('is-visible'); };
  $$('.reveal').forEach(unreveal);

  // ---------- Rolagem suave ----------
  if (window.Lenis && fine) {
    const lenis = new window.Lenis({ duration: 1.15, anchors: { offset: -96 }, autoRaf: false });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Barra de progresso ----------
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // ---------- Utilitário: quebra títulos em palavras mascaradas ----------
  const splitWords = (el) => {
    if (el.dataset.split) return $$('.split-word', el);
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const mask = document.createElement('span');
            mask.className = 'split-mask';
            const word = document.createElement('span');
            word.className = 'split-word';
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && child.tagName !== 'svg') {
          walk(child);
        }
      });
    };
    walk(el);
    el.dataset.split = '1';
    return $$('.split-word', el);
  };

  // Números que contam ao aparecer
  const countUp = (el, delay = 0) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    return gsap.to(obj, {
      v: end, duration: 1.6, delay, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
    });
  };

  // =========================================================
  // HERO · entrada e saída com o scroll
  // =========================================================
  const txt = $('.wordmark__txt');
  if (txt) {
    txt.innerHTML = [...txt.textContent].map((c) => `<span class="split-mask"><span class="split-word">${c}</span></span>`).join('');
  }
  const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
  intro
    .from('.hero__flower--a', { scale: 0.85, rotation: -30, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0)
    .from('.hero__kicker', { y: 16, opacity: 0 }, 0.1)
    .from('.wordmark .q', { scale: 0.4, rotation: -45, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.2)
    .from('.wordmark__txt .split-word', { yPercent: 110, stagger: 0.04, duration: 1, ease: 'power4.out' }, 0.3)
    .from('.wordmark .dot', { scale: 0, duration: 0.6, ease: 'back.out(2.5)' }, 0.85)
    .from('.hero__tagline', { y: 20, opacity: 0 }, 0.7)
    .from('.hero__actions > *', { y: 16, opacity: 0, stagger: 0.08 }, 0.85)
    .from('.hero__stats', { opacity: 0, duration: 1.2 }, 1);
  $$('.hero__stats [data-count]').forEach((el, i) => intro.add(countUp(el), 1 + i * 0.1));

  // Saída suave com o scroll (montada depois da entrada para não disputar as mesmas propriedades)
  intro.eventCallback('onComplete', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
      .to('.hero__inner', { y: -90, opacity: 0.2, ease: 'none' }, 0)
      .to('.hero__flower--a', { rotation: 40, ease: 'none' }, 0)
      .to('.hero__flower--b', { rotation: -60, y: -60, ease: 'none' }, 0);
    ScrollTrigger.refresh();
  });

  // =========================================================
  // FAIXA DE MARCAS · acelera e entorta com a velocidade do scroll
  // =========================================================
  const track = $('.marquee__track');
  if (track) {
    track.style.animation = 'none';
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
    let settle;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        const boost = 1 + Math.min(Math.abs(v) / 250, 6);
        gsap.to(loop, { timeScale: boost, duration: 0.25, overwrite: true });
        skew(gsap.utils.clamp(-12, 12, v / -150));
        clearTimeout(settle);
        settle = setTimeout(() => { gsap.to(loop, { timeScale: 1, duration: 1.2 }); skew(0); }, 140);
      },
    });
  }

  // =========================================================
  // TÍTULOS · palavras sobem de dentro de uma máscara
  // =========================================================
  $$('.title, .cta__title').filter((t) => !t.closest('.portfolio')).forEach((title) => {
    const words = splitWords(title);
    gsap.from(words, {
      yPercent: 115, rotation: 8, duration: 1.05, ease: 'power4.out', stagger: 0.07,
      scrollTrigger: { trigger: title, start: 'top 88%' },
    });
  });
  $$('.eyebrow, .servicos__intro').forEach((el) => {
    gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // =========================================================
  // SOBRE · foto se abre girando, selos pulam, números contam
  // =========================================================
  if ($('.sobre')) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.sobre', start: 'top 65%' } });
    tl.from('.sobre__photo', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' })
      .from('.chip', { scale: 0.6, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'back.out(2)', clearProps: 'transform' }, 0.5)
      .from('.sobre__text > p:not(.eyebrow)', { y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.1)
      .from('.stats li', { y: 30, opacity: 0, stagger: 0.1, duration: 0.7 }, 0.5);
    $$('.stats [data-count]').forEach((el, i) => tl.add(countUp(el), 0.6 + i * 0.1));
  }

  // =========================================================
  // VALORES · flores entram girando, uma de cada vez
  // =========================================================
  if ($('.valores__grid')) {
    gsap.timeline({ scrollTrigger: { trigger: '.valores__grid', start: 'top 80%' } })
      .from('.badge-wrap', { scale: 0, rotation: -150, stagger: 0.14, duration: 1, ease: 'back.out(1.6)' })
      .from('.valores__grid p', { y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, 0.35);
    gsap.from('.q--mark', { rotation: -360, scale: 0, duration: 1.2, ease: 'back.out(2)', scrollTrigger: { trigger: '.q--mark', start: 'top 92%' } });
  }

  // =========================================================
  // SERVIÇOS · linhas deslizam da esquerda
  // =========================================================
  $$('.svc-list > li').forEach((li, i) => {
    gsap.from(li, {
      x: -90, opacity: 0, duration: 1, ease: 'power4.out', delay: (i % 3) * 0.05,
      scrollTrigger: { trigger: li, start: 'top 92%' },
    });
  });

  // PORTFÓLIO: fica fixo — nenhum elemento se move com o scroll.

  // =========================================================
  // CONTATO · círculo gira com o scroll
  // =========================================================
  if ($('.cta')) {
    gsap.fromTo('.cta__circle', { rotation: -40, scale: 0.8 }, {
      rotation: 40, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
    gsap.from('.cta__sub, .cta__actions > *, .cta__contacts li', {
      y: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta', start: 'top 60%' },
    });
    gsap.from('.cta__q', { rotation: -360, scale: 0, duration: 1.4, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.cta', start: 'top 50%' } });
  }

  // =========================================================
  // CURSOR "ASSISTIR / VER" (só com mouse)
  // =========================================================
  if (fine) {
    root.classList.add('has-cursor');
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    const show = (label) => { cursor.textContent = label; cursor.classList.add('is-on'); };
    const hide = () => cursor.classList.remove('is-on');
    $$('.vid').forEach((el) => { el.addEventListener('mouseenter', () => show('▶ Play')); el.addEventListener('mouseleave', hide); });
    $$('.zoom').forEach((el) => { el.addEventListener('mouseenter', () => show('Ver')); el.addEventListener('mouseleave', hide); });
  }

  // Recalcula posições quando as imagens terminam de carregar
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
