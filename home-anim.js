/* home-anim.js — homepage animations (converted from the React handoff prototype).
   Concatenation of section init modules A (chrome/hero/cockpit/intro), B (tools/stats/markets/levelups/screens), C (reveal/parallax/verdict/showcase/pricing).
   Global chrome (progress bar, .is-scrolled, nav dropdown, lang pill, OAuth) lives inline in index.html. */
/* ===== MODULE A ===== */
/* Le Terminal — vanilla JS init functions for the homepage partials produced
   in /tmp/home_parts/A (GlobalHeader, SideDock, IntroSequence, Hero, LiveCockpit).
   Converted faithfully from the React useEffect/refs/canvas logic. No framework.

   Call on DOMContentLoaded (SideDock needs none — pure CSS):
     initIntro();          // intro overlay (once/session) + base safety
     initGlobalHeader();   // scrolled state + Outils dropdown (keyboard/touch)
     initHero();           // mouse spotlight/parallax + dust particles
     initCockpit();        // reveal, tilt, live watchlist, KPI count-up

   Everything honors prefers-reduced-motion and document visibility.            */

(function () {
  'use strict';

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ------------------------------------------------------------------ INTRO */
  // marketing/Intro.jsx → IntroSequence. Base markup is invisible + non-blocking;
  // we only add .is-playing on a visible tab, once per session, then remove it.
  function initIntro() {
    var el = document.querySelector('.lt-intro');
    if (!el) return;
    var reduced = prefersReduced();
    var seen = false;
    try { seen = sessionStorage.getItem('lt_intro_seen') === '1'; } catch (e) {}
    if (reduced || document.hidden || seen) {
      // never show; drop the node so it can't ever curtain the page
      if (el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    try { sessionStorage.setItem('lt_intro_seen', '1'); } catch (e) {}
    el.classList.add('is-playing');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      document.documentElement.style.overflow = '';
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  /* ----------------------------------------------------------- GLOBALHEADER */
  // shared/Chrome.jsx → GlobalHeader. Scroll toggles .is-scrolled (>24px).
  // Dropdown hover is CSS-driven; here we add keyboard + touch support and keep
  // aria-expanded / .is-open / caret in sync.
  function initGlobalHeader() {
    var chrome = document.querySelector('.lt-chrome');
    if (chrome) {
      var onScroll = function () {
        if (window.scrollY > 24) chrome.classList.add('is-scrolled');
        else chrome.classList.remove('is-scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var drop = document.querySelector('.lt-nav__drop');
    if (drop) {
      var trigger = drop.querySelector('.lt-nav__droptrigger');
      var menu = drop.querySelector('.lt-nav__menu');
      var caret = drop.querySelector('.lt-nav__caret');
      var setOpen = function (open) {
        if (menu) menu.classList.toggle('is-open', open);
        if (caret) caret.classList.toggle('is-open', open);
        if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      // hover (mirrors CSS but keeps aria/caret correct on pointer devices)
      drop.addEventListener('mouseenter', function () { setOpen(true); });
      drop.addEventListener('mouseleave', function () { setOpen(false); });
      // click / touch toggle
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          setOpen(!(menu && menu.classList.contains('is-open')));
        });
      }
      // close on outside click + Escape (keyboard accessibility)
      document.addEventListener('click', function (e) {
        if (!drop.contains(e.target)) setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
      });
    }
  }

  /* -------------------------------------------------------------------- HERO */
  // marketing/Hero.jsx → Hero. Mouse-follow spotlight + 3D parallax (sets CSS
  // custom props) and dust particles in the beam. Desktop only, gated on
  // reduced-motion. Entrance itself is pure CSS (.lt-anim).
  function initHero() {
    var stage = document.querySelector('.lt-hero');
    if (!stage) return;
    var reduced = prefersReduced();
    var isMobile = window.innerWidth < 760;
    if (reduced || isMobile) return;

    // --- mouse spotlight + parallax ---
    (function () {
      var raf = 0, tx = 0, ty = 0;
      var apply = function () {
        stage.style.setProperty('--px', tx.toFixed(3));
        stage.style.setProperty('--py', ty.toFixed(3));
        raf = 0;
      };
      var onMove = function (e) {
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width;
        var ny = (e.clientY - r.top) / r.height;
        stage.style.setProperty('--mx', nx * 100 + '%');
        stage.style.setProperty('--my', ny * 100 + '%');
        tx = nx - 0.5; ty = ny - 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      var onLeave = function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
      stage.addEventListener('mousemove', onMove);
      stage.addEventListener('mouseleave', onLeave);
    })();

    // --- dust particles in the beam ---
    (function () {
      var canvas = stage.querySelector('.lt-hero__dust');
      if (!canvas || !canvas.getContext) return;
      var ctx = canvas.getContext('2d');
      var raf, w, h;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var resize = function () {
        w = canvas.offsetWidth; h = canvas.offsetHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);
      var dust = [];
      for (var i = 0; i < 50; i++) {
        dust.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3, vy: Math.random() * 0.25 + 0.05,
          vx: (Math.random() - 0.5) * 0.15, a: Math.random() * 0.4 + 0.1
        });
      }
      var draw = function () {
        ctx.clearRect(0, 0, w, h);
        for (var j = 0; j < dust.length; j++) {
          var p = dust[j];
          p.y += p.vy; p.x += p.vx;
          if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
          var beam = 1 - Math.min(1, Math.abs(p.x - w / 2) / (w * 0.4)) * (p.y / h);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(191,220,245,' + (p.a * beam * 0.6) + ')';
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      draw();
    })();
  }

  /* ----------------------------------------------------------------- COCKPIT */
  // marketing/Cockpit.jsx → LiveCockpit. Reveal (draw curve + count up KPIs),
  // mouse tilt, and a live-ticking watchlist with row flashes.
  var CK_WATCH = [
    { base: 68412.5, dec: 2 },
    { base: 1.0847, dec: 4 },
    { base: 19847.0, dec: 1 },
    { base: 2384.6, dec: 1 }
  ];

  function fmtFR(v, dec) {
    return v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function initCockpit() {
    var wrap = document.querySelector('.lt-ck-wrap');
    if (!wrap) return;
    var stage = wrap.querySelector('.lt-ck-stage');
    var reduced = prefersReduced();

    // --- reveal: add .is-in to stage + svg paths/dot, and run count-ups ---
    var revealParts = [];
    if (stage) revealParts.push(stage);
    var line = wrap.querySelector('.lt-ck__line');
    var area = wrap.querySelector('.lt-ck__area');
    var dot = wrap.querySelector('.lt-ck__dot');
    [line, area, dot].forEach(function (n) { if (n) revealParts.push(n); });

    var revealed = false;
    var doReveal = function () {
      if (revealed) return;
      revealed = true;
      revealParts.forEach(function (n) { n.classList.add('is-in'); });
      runCountUps(wrap, reduced);
    };

    if (reduced || document.hidden) {
      doReveal();
    } else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { doReveal(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(wrap);
    } else {
      doReveal();
    }

    // --- mouse parallax / tilt (desktop) ---
    if (!reduced && window.innerWidth >= 760 && stage) {
      var raf = 0, tx = 0, ty = 0;
      var apply = function () {
        stage.style.setProperty('--rx', (9 + ty * -9).toFixed(2) + 'deg');
        stage.style.setProperty('--ry', (tx * 11).toFixed(2) + 'deg');
        raf = 0;
      };
      var onMove = function (e) {
        var r = stage.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      var onLeave = function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
      stage.addEventListener('mousemove', onMove);
      stage.addEventListener('mouseleave', onLeave);
    }

    // --- live ticking watchlist ---
    if (!reduced) {
      var rows = wrap.querySelectorAll('.lt-ck__row');
      setInterval(function () {
        if (document.hidden || !rows.length) return;
        var i = Math.floor(Math.random() * CK_WATCH.length);
        var row = rows[i];
        if (!row) return;
        var base = CK_WATCH[i].base;
        var dec = CK_WATCH[i].dec;
        var next = base * (1 + (Math.random() - 0.48) * 0.0016);
        var px = row.querySelector('.lt-ck__px');
        if (px) px.textContent = fmtFR(next, dec);
        row.classList.add('is-flash');
        setTimeout(function () { row.classList.remove('is-flash'); }, 420);
      }, 1700);
    }
  }

  // CountUp: animate every [data-countup] inside root from 0 → target.
  function runCountUps(root, reduced) {
    var nodes = root.querySelectorAll('[data-countup]');
    nodes.forEach(function (node) {
      var to = parseFloat(node.getAttribute('data-countup')) || 0;
      var decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
      var prefix = node.getAttribute('data-prefix') || '';
      var suffix = node.getAttribute('data-suffix') || '';
      var render = function (v) {
        node.textContent = prefix + fmtFR(v, decimals) + suffix;
      };
      if (reduced) { render(to); return; }
      var dur = 1500, t0 = 0, raf;
      var tick = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        render(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }

  // expose
  window.initIntro = initIntro;
  window.initGlobalHeader = initGlobalHeader;
  window.initHero = initHero;
  window.initCockpit = initCockpit;
})();
/* ===== MODULE B (self-runs on DOMContentLoaded) ===== */
/* Le Terminal — homepage section B interactivity (vanilla JS, no framework).
 *
 * Init functions (call each once after the partials are in the DOM, e.g. on
 * DOMContentLoaded; initHomeSectionsB() runs them all):
 *
 *   initStatsCounters()      — StatsSection: count-up of numeric [data-count-to] cells on reveal
 *   initMarketsParticles()   — MarketsSection: drifting particle field on canvas.lt-mk__field
 *                              (the two rails scroll via CSS keyframes; pause-on-hover is CSS)
 *   initLevelUpReveal()      — LevelUpsSection: add .is-in to .lu__grid on viewport entry (cascade)
 *   initLevelUpCounters()    — LevelUpsSection: count-up of .lu__big / .lu__n [data-count-to]
 *   initScreensReveal()      — ScreensSection: add .is-in to .lt-scr__stage (fly-in from depth)
 *   initScreensParallax()    — ScreensSection: mouse tilt -> --mrx/--mry on the stage (desktop only)
 *   initHomeSectionsB()      — convenience: runs all of the above
 *
 * The ToolsSection sweep + sparklines are entirely CSS-driven (page.css) and
 * need no JS. All functions honor prefers-reduced-motion.
 */

(function () {
  'use strict';

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Format a number the French way (space thousands separator), with optional decimals.
  function frNumber(value, decimals) {
    try {
      return value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } catch (e) {
      return String(value);
    }
  }

  // Animate a single [data-count-to] element from 0 to its target.
  function runCounter(el) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    var to = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(to)) return;
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var dur = parseInt(el.getAttribute('data-count-dur') || '1400', 10);

    if (prefersReducedMotion()) {
      el.textContent = prefix + frNumber(to, decimals) + suffix;
      return;
    }
    var t0 = 0;
    function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3); // ease-out cubic
      el.textContent = prefix + frNumber(to * eased, decimals) + suffix;
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + frNumber(to, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  // Observe a container; when it enters the viewport, run every [data-count-to] inside it.
  function countersOnReveal(container, threshold) {
    if (!container) return;
    var targets = container.querySelectorAll('[data-count-to]');
    if (!targets.length) return;
    if (prefersReducedMotion() || document.hidden || !('IntersectionObserver' in window)) {
      targets.forEach(runCounter);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          targets.forEach(runCounter);
          io.disconnect();
        }
      });
    }, { threshold: threshold || 0.3 });
    io.observe(container);
  }

  // ---- StatsSection ---------------------------------------------------------
  function initStatsCounters() {
    document.querySelectorAll('.lt-statstrip').forEach(function (strip) {
      countersOnReveal(strip, 0.3);
    });
  }

  // ---- MarketsSection : particle field --------------------------------------
  function initMarketsParticles() {
    var canvas = document.querySelector('.lt-mk__field');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var raf = 0, w = 0, h = 0, parts = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var N = w < 760 ? 36 : 80;
      parts = [];
      for (var i = 0; i < N; i++) {
        parts.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.18,
          a: Math.random() * 0.5 + 0.15,
          bright: Math.random() > 0.85
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.bright) {
          ctx.fillStyle = 'rgba(191,220,245,' + p.a + ')';
          ctx.shadowColor = 'rgba(127,184,232,0.8)'; ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = 'rgba(127,184,232,' + (p.a * 0.6) + ')'; ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }

    build();
    window.addEventListener('resize', build);
    if (prefersReducedMotion()) { ctx.clearRect(0, 0, w, h); return; }
    draw();
  }

  // ---- LevelUpsSection ------------------------------------------------------
  function initLevelUpReveal() {
    var grid = document.querySelector('.lu__grid');
    if (!grid) return;
    if (prefersReducedMotion() || document.hidden || !('IntersectionObserver' in window)) {
      grid.classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { grid.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(grid);
  }

  function initLevelUpCounters() {
    var section = document.querySelector('.lu');
    if (section) countersOnReveal(section, 0.35);
  }

  // ---- ScreensSection -------------------------------------------------------
  function initScreensReveal() {
    var stage = document.querySelector('.lt-scr__stage');
    if (!stage) return;
    if (prefersReducedMotion() || document.hidden || !('IntersectionObserver' in window)) {
      stage.classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { stage.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(stage);
  }

  function initScreensParallax() {
    var stage = document.querySelector('.lt-scr__stage');
    if (!stage) return;
    if (prefersReducedMotion() || window.innerWidth < 760) return;
    var raf = 0, tx = 0, ty = 0;
    function apply() {
      stage.style.setProperty('--mrx', (ty * -6).toFixed(2) + 'deg');
      stage.style.setProperty('--mry', (tx * 9).toFixed(2) + 'deg');
      raf = 0;
    }
    function onMove(e) {
      var r = stage.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function onLeave() {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
  }

  // ---- Convenience ----------------------------------------------------------
  function initHomeSectionsB() {
    initStatsCounters();
    initMarketsParticles();
    initLevelUpReveal();
    initLevelUpCounters();
    initScreensReveal();
    initScreensParallax();
  }

  // Expose on window for the host page to call.
  window.initStatsCounters = initStatsCounters;
  window.initMarketsParticles = initMarketsParticles;
  window.initLevelUpReveal = initLevelUpReveal;
  window.initLevelUpCounters = initLevelUpCounters;
  window.initScreensReveal = initScreensReveal;
  window.initScreensParallax = initScreensParallax;
  window.initHomeSectionsB = initHomeSectionsB;

  // Auto-run when the DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeSectionsB);
  } else {
    initHomeSectionsB();
  }
})();
/* ===== MODULE C ===== */
/* Le Terminal — vanilla JS init functions for page-order block C
 * (ShowcaseSection, VerdictBand, StrategiesSection, MethodSection,
 *  PricingBand, CommunityBand, Footer).
 *
 * Exposed init functions (call after the partials are in the DOM):
 *   initReveal(root)         — IntersectionObserver adds .is-in to [data-reveal]/[data-stagger]
 *   initParallax(root)       — scroll-driven translate for [data-parallax]
 *   initVerdictBand(root)    — animated "flux simulé" canvas in .lt-chartband (reduced-motion safe)
 *   initShowcase(root)       — showcase rows: ensures reveal visuals trigger (delegates to initReveal)
 *   initPricingButtons(root) — hover styling for the design-system .lt-btn CTAs (pricing + community)
 *   initBlockC(root)         — convenience: runs all of the above once
 *
 * All animations honor prefers-reduced-motion.
 */
(function (global) {
  'use strict';

  function prefersReduced() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---- Reveal: IntersectionObserver cascade (mirrors index.html scroll engine) ---- */
  function initReveal(root) {
    var scope = root || document;
    var els = scope.querySelectorAll('[data-reveal],[data-stagger]');
    if (!els.length) return;
    if (!('IntersectionObserver' in global)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target); // reveal once only
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Generic parallax for [data-parallax] ---- */
  function initParallax(root) {
    var scope = root || document;
    if (prefersReduced()) return;
    var plx = [].slice.call(scope.querySelectorAll('[data-parallax]')).map(function (el) {
      return { el: el, s: parseFloat(el.getAttribute('data-parallax')) || 0.15 };
    });
    if (!plx.length) return;
    var raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var vh = document.documentElement.clientHeight;
        for (var i = 0; i < plx.length; i++) {
          var p = plx[i];
          var r = p.el.getBoundingClientRect();
          var mid = r.top + r.height / 2 - vh / 2;
          p.el.style.transform = 'translate3d(0,' + (-mid * p.s).toFixed(1) + 'px,0)';
        }
      });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- VerdictBand : live simulated-flux line chart on canvas ---- */
  function initVerdictBand(root) {
    var scope = root || document;
    var c = scope.querySelector('.lt-chartband__canvas');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var reduced = prefersReduced();
    var raf, w, h;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);

    function resize() {
      w = c.offsetWidth; h = c.offsetHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    global.addEventListener('resize', resize);

    var N = 180, data = [], v = 0.5, i;
    for (i = 0; i < N; i++) {
      v += (Math.random() - 0.5) * 0.055;
      v = Math.max(0.14, Math.min(0.86, v));
      data.push(v);
    }
    var t = 0;
    function draw() {
      t++;
      if (t % 4 === 0) {
        v += (Math.random() - 0.49) * 0.05;
        v = Math.max(0.14, Math.min(0.86, v));
        data.push(v); data.shift();
      }
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(127,184,232,0.07)';
      ctx.lineWidth = 1;
      for (var y = 1; y < 4; y++) {
        ctx.beginPath(); ctx.moveTo(0, h * y / 4); ctx.lineTo(w, h * y / 4); ctx.stroke();
      }
      var px = function (i) { return (i / (N - 1)) * w; };
      var py = function (val) { return h * (1 - val) * 0.86 + h * 0.07; };
      ctx.beginPath();
      data.forEach(function (d, i) {
        if (i) ctx.lineTo(px(i), py(d)); else ctx.moveTo(px(i), py(d));
      });
      ctx.strokeStyle = 'rgba(127,184,232,0.9)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(127,184,232,0.45)';
      ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(127,184,232,0.13)');
      g.addColorStop(1, 'rgba(127,184,232,0)');
      ctx.fillStyle = g; ctx.fill();
      var lx = px(N - 1), ly = py(data[N - 1]);
      ctx.beginPath(); ctx.arc(lx - 2, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#BFDCF5';
      ctx.shadowColor = 'rgba(127,184,232,0.8)';
      ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      if (!reduced) raf = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Showcase rows: visuals reveal with the section (delegates to initReveal) ---- */
  function initShowcase(root) {
    initReveal(root);
  }

  /* ---- Pricing + Community CTAs: hover styling for design-system .lt-btn ---- */
  function initPricingButtons(root) {
    var scope = root || document;
    var btns = scope.querySelectorAll('.lt-btn[data-variant]');
    btns.forEach(function (btn) {
      var variant = btn.getAttribute('data-variant') || 'primary';
      // capture resting state from inline styles
      var rest = {
        background: btn.style.background,
        color: btn.style.color,
        borderColor: btn.style.borderColor || 'transparent',
        transform: 'none'
      };
      btn.addEventListener('mouseenter', function () {
        if (btn.disabled) return;
        if (variant === 'primary') {
          btn.style.background = 'var(--accent-bright)';
          btn.style.transform = 'translateY(-1px)';
        } else if (variant === 'secondary') {
          btn.style.borderColor = 'var(--accent)';
          btn.style.color = 'var(--accent-bright)';
        } else {
          btn.style.borderColor = 'var(--border)';
          btn.style.color = 'var(--text-title)';
        }
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.background = rest.background;
        btn.style.color = rest.color;
        btn.style.borderColor = rest.borderColor;
        btn.style.transform = rest.transform;
      });
    });
  }

  /* ---- Convenience aggregate ---- */
  function initBlockC(root) {
    initReveal(root);
    initParallax(root);
    initVerdictBand(root);
    initPricingButtons(root);
  }

  global.initReveal = initReveal;
  global.initParallax = initParallax;
  global.initVerdictBand = initVerdictBand;
  global.initShowcase = initShowcase;
  global.initPricingButtons = initPricingButtons;
  global.initBlockC = initBlockC;
})(typeof window !== 'undefined' ? window : this);
/* ===== MASTER INIT (host page) ===== */
(function () {
  function run() {
    var calls = ['initIntro','initHero','initCockpit','initBlockC','initShowcase'];
    calls.forEach(function (fn) { try { if (typeof window[fn] === 'function') window[fn](); } catch (e) {} });
    // Module B auto-runs itself; initGlobalHeader is intentionally skipped
    // (chrome scroll-state + dropdown + lang pill are handled inline in index.html).
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
