// Qriativa · navegação, menu, vídeos, lightbox e fallback de animação (sem dependências).
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMotion = !!(window.gsap && window.ScrollTrigger) && !reduce;
  const lenis = () => window.__lenis;

  // ---------- Navegação: muda ao rolar, some descendo e volta subindo ----------
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('menu');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!nav.classList.contains('is-open')) {
      if (goingDown && y > 500) nav.classList.add('is-hidden');
      else if (goingUp || y < 500) nav.classList.remove('is-hidden');
    }
    lastY = y;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Menu mobile ----------
  const lockScroll = (lock) => {
    document.body.style.overflow = lock ? 'hidden' : '';
    if (lenis()) lock ? lenis().stop() : lenis().start();
  };
  const closeMenu = () => {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    lockScroll(false);
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    lockScroll(open);
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  // ---------- Link ativo conforme a seção visível ----------
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]:not(.btn)')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // ---------- Fallback de entrada (quando o GSAP não roda) ----------
  if (!hasMotion) {
    root.classList.add('js-ready');
    const items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduce) {
      items.forEach((el) => {
        const sib = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        const i = sib.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      items.forEach((el) => io.observe(el));
    } else {
      items.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ---------- Prévias: cada vídeo só carrega e toca quando entra na tela ----------
  const previews = document.querySelectorAll('.vid video[data-prev]');
  if ('IntersectionObserver' in window && !reduce) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.src) v.src = v.dataset.prev;
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '120px 0px', threshold: 0.25 });
    previews.forEach((v) => vio.observe(v));
  }
  if (reduce) document.querySelectorAll('.hphone video').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });

  // ---------- Lightbox: vídeo completo com som, ou foto ampliada ----------
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Visualização ampliada');
  box.innerHTML = '<button class="lightbox__close" aria-label="Fechar">×</button><div class="lightbox__stage"></div>';
  document.body.appendChild(box);
  const stage = box.querySelector('.lightbox__stage');
  const closeBtn = box.querySelector('.lightbox__close');
  let lastFocus = null;

  const open = (node) => {
    lastFocus = document.activeElement;
    stage.replaceChildren(node);
    box.classList.add('is-open');
    lockScroll(true);
    closeBtn.focus();
  };
  const close = () => {
    if (!box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    lockScroll(false);
    const v = stage.querySelector('video');
    if (v) v.pause();
    setTimeout(() => stage.replaceChildren(), 300);
    if (lastFocus) lastFocus.focus();
  };
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    close();
    closeMenu();
  });

  const activate = (fig) => {
    if (fig.dataset.full) {
      const v = document.createElement('video');
      v.src = fig.dataset.full;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      const prev = fig.querySelector('video');
      if (prev && prev.poster) v.poster = prev.poster;
      open(v);
    } else {
      const img = fig.querySelector('img');
      if (!img) return;
      const big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      open(big);
    }
  };
  document.querySelectorAll('.vid, .zoom').forEach((fig) => {
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.addEventListener('click', () => activate(fig));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(fig); }
    });
  });

  // ---------- Ano do rodapé ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
