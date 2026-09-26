/* =========================================================
   DC WOODBALL — main.js
   No dependencies. Vanilla JS.
   ========================================================= */
(function () {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------------------------------------------------
     0. no-js guard
  --------------------------------------------------------- */
  root.classList.remove('no-js');

  /* ---------------------------------------------------------
     1. LOADER
  --------------------------------------------------------- */
  const loader = doc.getElementById('loader');
  const loaderBar = doc.getElementById('loaderBar');
  const loaderPct = doc.getElementById('loaderPct');

  function runLoader() {
    if (!loader) { documentReady(); return; }
    if (prefersReduced) {
      loader.classList.add('is-done');
      documentReady();
      return;
    }
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.random() * 14 + 5;
      if (pct >= 100) pct = 100;
      if (loaderBar) loaderBar.style.width = pct + '%';
      if (loaderPct) loaderPct.textContent = Math.floor(pct);
      if (pct === 100) {
        clearInterval(tick);
        setTimeout(() => {
          loader.classList.add('is-done');
          documentReady();
        }, 260);
      }
    }, 110);
  }

  /* things that can start as soon as DOM is parsed */
  function documentReady() {
    setNav();
    setYear();
    setCursor();
    setReveal();
    setTimeline();
    setCounters();
    setSkills();
    setTilt();
    setMagnetic();
    setFilter();
    setLightbox();
    setToTop();
    setActiveLink();
    if (!prefersReduced) {
      initHeroCanvas();
      initParallax();
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', runLoader, { once: true });
  } else {
    runLoader();
  }

  /* never let the loader trap the page */
  window.addEventListener('load', () => {
    setTimeout(() => { if (loader) loader.classList.add('is-done'); }, 2200);
  });

  /* ---------------------------------------------------------
     2. NAV
  --------------------------------------------------------- */
  function setNav() {
    const nav = doc.getElementById('nav');
    const toggle = doc.getElementById('navToggle');
    const links = doc.getElementById('navLinks');
    if (!nav) return;

    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !links) return;
    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('is-open');
      doc.body.classList.remove('nav-open');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
      doc.body.classList.toggle('nav-open', !open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) close(); });
  }

  function setYear() {
    const y = doc.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     3. CUSTOM CURSOR
  --------------------------------------------------------- */
  function setCursor() {
    if (isTouch || prefersReduced) return;
    const cur = doc.getElementById('cursor');
    const ring = doc.getElementById('cursorRing');
    if (!cur || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cur.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hoverables = 'a, button, [data-zoom], .pillar, .rc, .gal__item, .card';
    doc.addEventListener('mouseover', e => {
      if (e.target.closest && e.target.closest(hoverables)) doc.body.classList.add('cur-hover');
    });
    doc.addEventListener('mouseout', e => {
      if (e.target.closest && e.target.closest(hoverables)) doc.body.classList.remove('cur-hover');
    });
  }

  /* ---------------------------------------------------------
     4. SCROLL REVEAL
  --------------------------------------------------------- */
  function setReveal() {
    const items = Array.from(doc.querySelectorAll('[data-anim]'));
    if (!items.length) return;

    const activate = (el) => {
      el.classList.add('is-in');
      // elements that grow to fill their parent (e.g. timeline rail)
      if (el.dataset.anim === 'grow') {
        const p = el.parentElement;
        if (p) el.style.height = p.offsetHeight + 'px';
      }
    };

    if (!('IntersectionObserver' in window) || prefersReduced) {
      items.forEach(activate);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = animFor.get(e.target);
        if (!el) return;
        const d = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => activate(el), d);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    // map: observed node -> animation node
    const animFor = new Map();
    items.forEach(el => {
      // a zero-height/zero-width element can never satisfy the threshold,
      // so watch the closest sized ancestor instead.
      const empty = el.offsetHeight === 0 && el.offsetWidth === 0;
      const watch = empty ? (el.closest('section, .tl, .wrap, body') || el) : el;
      animFor.set(watch, el);
      io.observe(watch);
    });
  }

  /* ---------------------------------------------------------
     4b. TIMELINE RAIL — grows with scroll
  --------------------------------------------------------- */
  function setTimeline() {
    const line = doc.querySelector('.tl__line');
    const fill = doc.querySelector('.tl__fill');
    if (!line || !fill) return;
    if (prefersReduced) { fill.style.height = line.offsetHeight + 'px'; return; }

    let cur = 0, target = 0, raf = null;
    function measure() {
      const r = line.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0% when the top of the rail reaches 80% of the viewport,
      // 100% when the bottom of the rail reaches 35%.
      const start = vh * 0.8, end = vh * 0.35;
      const p = (start - r.top) / (start - end);
      target = Math.max(0, Math.min(1, p));
    }
    function loop() {
      measure();
      cur += (target - cur) * 0.12;
      fill.style.height = (cur * line.offsetHeight).toFixed(1) + 'px';
      raf = Math.abs(target - cur) > 0.001 ? requestAnimationFrame(loop) : null;
      if (!raf) fill.style.height = (target * line.offsetHeight).toFixed(1) + 'px';
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(loop); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    loop();
  }

  /* ---------------------------------------------------------
     5. COUNTERS
  --------------------------------------------------------- */
  function animateCount(el, to, dur) {
    const start = performance.now();
    const from = 0;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setCounters() {
    const els = Array.from(doc.querySelectorAll('[data-count]'));
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(e => (e.textContent = e.dataset.count)); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const to = parseInt(e.target.dataset.count, 10) || 0;
        if (prefersReduced) e.target.textContent = String(to);
        else animateCount(e.target, to, 1400);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* ---------------------------------------------------------
     6. SKILL BARS
  --------------------------------------------------------- */
  function setSkills() {
    const bars = Array.from(doc.querySelectorAll('[data-bar]'));
    if (!bars.length) return;
    const fill = (el) => { el.style.width = el.dataset.bar + '%'; };

    if (!('IntersectionObserver' in window) || prefersReduced) { bars.forEach(fill); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
  }

  /* ---------------------------------------------------------
     7. TILT CARD
  --------------------------------------------------------- */
  function setTilt() {
    const cards = Array.from(doc.querySelectorAll('[data-tilt]'));
    if (isTouch || prefersReduced) return;
    cards.forEach(card => {
      card.style.transition = card.style.transition || '';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     8. MAGNETIC BUTTON
  --------------------------------------------------------- */
  function setMagnetic() {
    const els = Array.from(doc.querySelectorAll('[data-magnetic]'));
    if (isTouch || prefersReduced) return;
    els.forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     9. RECORD FILTER
  --------------------------------------------------------- */
  function setFilter() {
    const btns = Array.from(doc.querySelectorAll('.filter__btn'));
    const rows = Array.from(doc.querySelectorAll('#recTable tbody tr'));
    const empty = doc.getElementById('tblEmpty');
    if (!btns.length || !rows.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        btns.forEach(b => {
          const on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', String(on));
        });
        let shown = 0;
        rows.forEach(r => {
          const ok = f === 'all' || r.dataset.cat === f;
          r.classList.toggle('is-hide', !ok);
          if (ok) shown++;
        });
        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  /* ---------------------------------------------------------
     10. LIGHTBOX
  --------------------------------------------------------- */
  function setLightbox() {
    const lb = doc.getElementById('lightbox');
    const img = doc.getElementById('lbImg');
    const cap = doc.getElementById('lbCap');
    const closeBtn = doc.getElementById('lbClose');
    const prev = doc.getElementById('lbPrev');
    const next = doc.getElementById('lbNext');
    const items = Array.from(doc.querySelectorAll('[data-zoom]'));
    if (!lb || !img || !items.length) return;

    const shots = items.map(fig => {
      const i = fig.querySelector('img');
      const c = fig.querySelector('figcaption');
      return {
        src: i ? i.getAttribute('src') : '',
        alt: i ? i.alt : '',
        cap: c ? c.textContent.trim() : '',
        capB: c && c.querySelector('b') ? c.querySelector('b').textContent : '',
        capS: c && c.querySelector('span') ? c.querySelector('span').textContent : ''
      };
    });
    let idx = 0;
    let lastFocus = null;

    function show(i) {
      idx = (i + shots.length) % shots.length;
      const s = shots[idx];
      img.src = s.src;
      img.alt = s.alt;
      cap.innerHTML = '<b>' + (s.capB || '') + '</b>' + (s.capS || '');
    }
    function open(i) {
      lastFocus = doc.activeElement;
      show(i);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      doc.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function hide() {
      lb.classList.remove('is-open');
      doc.body.style.overflow = '';
      setTimeout(() => { lb.hidden = true; }, 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    items.forEach((fig, i) => {
      fig.addEventListener('click', () => open(i));
      fig.setAttribute('tabindex', '0');
      fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });

    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (prev) prev.addEventListener('click', () => show(idx - 1));
    if (next) next.addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) hide(); });
    doc.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------------------------------------------------------
     11. TO TOP + PROGRESS
  --------------------------------------------------------- */
  function setToTop() {
    const btn = doc.getElementById('toTop');
    const navProg = doc.getElementById('navProgress');

    // single shared progress line driven from here
    const line = doc.createElement('div');
    line.id = 'scrollLineTop';
    Object.assign(line.style, {
      position: 'fixed', top: '0', left: '0', height: '2px', zIndex: '1500',
      pointerEvents: 'none', width: '0',
      background: 'linear-gradient(90deg,#ffd75e,#c9a227,transparent)'
    });
    doc.body.appendChild(line);

    let raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = doc.body.scrollHeight - window.innerHeight;
        const p = h > 0 ? Math.min(y / h, 1) : 0;
        if (btn) btn.classList.toggle('is-on', y > 600);
        if (navProg) navProg.style.width = (p * 100) + '%';
        line.style.width = (p * 100) + '%';
        raf = null;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------------------------------------------------
     12. ACTIVE NAV LINK
  --------------------------------------------------------- */
  function setActiveLink() {
    const links = Array.from(doc.querySelectorAll('.nav__links a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map();
    links.forEach(a => {
      const id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      const sec = doc.querySelector(id);
      if (sec) map.set(sec, a);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.remove('is-active'));
        const a = map.get(e.target);
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => io.observe(sec));
  }

  /* ---------------------------------------------------------
     13. PARALLAX
  --------------------------------------------------------- */
  function initParallax() {
    const targets = Array.from(doc.querySelectorAll('[data-par]'));
    if (!targets.length) return;
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        targets.forEach(el => {
          const sp = parseFloat(el.dataset.par) || 0.12;
          el.style.transform = `translate3d(0, ${(y * sp).toFixed(1)}px, 0)`;
        });
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     14. HERO CANVAS — woodball field / floating pins & balls
  --------------------------------------------------------- */
  function initHeroCanvas() {
    const cv = doc.getElementById('heroCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: true });
    let W = 0, H = 0, DPR = 1;
    let mx = 0, my = 0, tmx = 0, tmy = 0;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.max(1, Math.floor(W * DPR));
      cv.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // field: perspective wedge lines
    function drawField(time) {
      const cx = W * 0.5 + mx * 26;
      const horizon = H * 0.16 + my * 12;
      ctx.save();
      ctx.strokeStyle = 'rgba(201,162,39,0.13)';
      ctx.lineWidth = 1;
      // radiating lines
      for (let i = -7; i <= 7; i++) {
        const spread = i * (W * 0.11);
        ctx.beginPath();
        ctx.moveTo(cx + spread * 0.06, horizon);
        ctx.lineTo(cx + spread * 2.6, H + 40);
        ctx.stroke();
      }
      // horizontal depth lines with perspective spacing
      for (let i = 1; i <= 12; i++) {
        const p = i / 12;
        const y = horizon + (H - horizon) * Math.pow(p, 2.15);
        ctx.strokeStyle = `rgba(201,162,39,${(0.03 + p * 0.09).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // centre line
      ctx.strokeStyle = 'rgba(255,215,94,0.28)';
      ctx.setLineDash([12, 14]);
      ctx.lineDashOffset = -time * 0.02;
      ctx.beginPath();
      ctx.moveTo(cx, horizon);
      ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // floating woodball balls
    const balls = [];
    const COUNT = window.innerWidth < 720 ? 9 : 16;
    for (let i = 0; i < COUNT; i++) {
      balls.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 5 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -(0.14 + Math.random() * 0.4),
        a: 0.06 + Math.random() * 0.2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.01
      });
    }

    function drawBall(b) {
      ctx.save();
      ctx.globalAlpha = b.a;
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.35, b.r * 0.1, 0, 0, b.r);
      g.addColorStop(0, 'rgba(255,215,94,0.9)');
      g.addColorStop(1, 'rgba(140,110,20,0.55)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,215,94,0.55)';
      ctx.stroke();
      // the two-band "X" mark of a woodball
      ctx.beginPath();
      ctx.moveTo(-b.r * 0.62, -b.r * 0.62);
      ctx.lineTo(b.r * 0.62, b.r * 0.62);
      ctx.moveTo(b.r * 0.62, -b.r * 0.62);
      ctx.lineTo(-b.r * 0.62, b.r * 0.62);
      ctx.lineWidth = Math.max(1, b.r * 0.13);
      ctx.strokeStyle = 'rgba(10,10,11,0.55)';
      ctx.stroke();
      ctx.restore();
    }

    let raf;
    function frame(time) {
      ctx.clearRect(0, 0, W, H);
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      drawField(time);

      balls.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        if (b.y < -b.r * 2) { b.y = H + b.r * 2; b.x = Math.random() * W; }
        if (b.x < -b.r * 2) b.x = W + b.r;
        if (b.x > W + b.r * 2) b.x = -b.r;
        drawBall(b);
      });

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // pause when hero is offscreen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(cv);
    }
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------------------------------------------------------
     15. Keyboard focus visibility
  --------------------------------------------------------- */
  doc.addEventListener('keydown', e => {
    if (e.key === 'Tab') doc.body.classList.add('kb');
  });

})();
