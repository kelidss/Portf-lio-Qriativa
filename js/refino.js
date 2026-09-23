// Qriativa · stagger das animações, link ativo, parallax, vídeos e lightbox
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger: irmãos .reveal dentro do mesmo pai entram em sequência
  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
  });

  // Link ativo conforme a seção visível
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

  // Parallax suave das flores do hero (só com mouse e sem reduced-motion)
  const hero = document.querySelector('.hero');
  const flowers = document.querySelectorAll('.hero__flower');
  if (hero && !reduce && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      flowers.forEach((f, i) => {
        const k = i === 0 ? 24 : -16;
        f.style.transform = 'translate(' + x * k + 'px, ' + y * k + 'px)';
      });
    });
    hero.addEventListener('mouseleave', () => flowers.forEach((f) => { f.style.transform = ''; }));
  }

  // Prévias: cada vídeo só carrega e toca quando entra na tela
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

  // Lightbox: vídeo completo com som, ou foto ampliada
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
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = () => {
    if (!box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    const v = stage.querySelector('video');
    if (v) v.pause();
    setTimeout(() => stage.replaceChildren(), 300);
    if (lastFocus) lastFocus.focus();
  };
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const activate = (fig) => {
    if (fig.dataset.full) {
      const v = document.createElement('video');
      v.src = fig.dataset.full;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      const poster = fig.querySelector('video');
      if (poster && poster.poster) v.poster = poster.poster;
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
})();
