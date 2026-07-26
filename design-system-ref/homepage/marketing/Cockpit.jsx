/* global React */
// Le Terminal — Live Cockpit. A floating, self-animating product mock placed
// right under the hero (tradersync-style "the product feels alive"):
//  · window tilts + parallaxes to the mouse
//  · equity curve draws itself on reveal
//  · KPIs count up on reveal
//  · watchlist prices tick live with a flash
// All motion gated on reduced-motion + document visibility.

function useReveal() {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || document.hidden) { setSeen(true); return; }
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setSeen(true); }), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function CountUp({ to, dur = 1500, decimals = 0, prefix = '', suffix = '', play }) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!play) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setV(to); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to, dur]);
  return <span>{prefix}{v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const CK_WATCH = [
  { sym: 'BTC/USD', px: 68412.5, dec: 2, dir: 'up', d: '+2.18%' },
  { sym: 'EUR/USD', px: 1.0847, dec: 4, dir: 'down', d: '−0.42%' },
  { sym: 'US100', px: 19847.0, dec: 1, dir: 'up', d: '+1.04%' },
  { sym: 'GOLD', px: 2384.6, dec: 1, dir: 'up', d: '+0.31%' },
];

function LiveCockpit() {
  const [ref, seen] = useReveal();
  const stageRef = React.useRef(null);
  const [prices, setPrices] = React.useState(() => CK_WATCH.map((w) => w.px));
  const [flash, setFlash] = React.useState(-1);

  // mouse parallax / tilt
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || window.innerWidth < 760) return;
    const stage = stageRef.current; if (!stage) return;
    let raf = 0, tx = 0, ty = 0;
    const apply = () => { stage.style.setProperty('--rx', (9 + ty * -9).toFixed(2) + 'deg'); stage.style.setProperty('--ry', (tx * 11).toFixed(2) + 'deg'); raf = 0; };
    const onMove = (e) => { const r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; if (!raf) raf = requestAnimationFrame(apply); };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
    stage.addEventListener('mousemove', onMove); stage.addEventListener('mouseleave', onLeave);
    return () => { stage.removeEventListener('mousemove', onMove); stage.removeEventListener('mouseleave', onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // live ticking watchlist
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      const i = Math.floor(Math.random() * CK_WATCH.length);
      setPrices((prev) => {
        const next = [...prev];
        const base = CK_WATCH[i].px;
        next[i] = base * (1 + (Math.random() - 0.48) * 0.0016);
        return next;
      });
      setFlash(i);
      setTimeout(() => setFlash(-1), 420);
    }, 1700);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="lt-ck-wrap" ref={ref} data-reveal>
      <div className="lt-ck-glow" />
      <div className={'lt-ck-stage' + (seen ? ' is-in' : '')} ref={stageRef}>
        <div className="lt-ck">
          {/* window bar */}
          <div className="lt-ck__bar">
            <span className="lt-ck__dots"><i style={{ background: '#F0647A' }} /><i style={{ background: '#E8C268' }} /><i style={{ background: '#4ADE9C' }} /></span>
            <span className="lt-ck__addr">le-terminal.app / cockpit</span>
            <span className="lt-ck__live"><span className="lt-dot" /> Live</span>
          </div>

          <div className="lt-ck__body">
            {/* main panel : KPIs + equity curve */}
            <div className="lt-ck__main">
              <div className="lt-ck__kpis">
                <div className="lt-ck__kpi">
                  <span className="lt-ck__kpi-l">P&L du jour</span>
                  <span className="lt-ck__kpi-v lt-up"><CountUp to={4280} prefix="+" suffix=" €" play={seen} /></span>
                </div>
                <div className="lt-ck__kpi">
                  <span className="lt-ck__kpi-l">Win rate</span>
                  <span className="lt-ck__kpi-v"><CountUp to={63} suffix=" %" play={seen} /></span>
                </div>
                <div className="lt-ck__kpi">
                  <span className="lt-ck__kpi-l">Score IA moyen</span>
                  <span className="lt-ck__kpi-v lt-acc"><CountUp to={87} suffix="/100" play={seen} /></span>
                </div>
              </div>

              <div className="lt-ck__chart">
                <svg viewBox="0 0 520 200" preserveAspectRatio="none" className="lt-ck__svg">
                  <defs>
                    <linearGradient id="ckFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="rgba(59, 125, 255,0.32)" />
                      <stop offset="1" stopColor="rgba(59, 125, 255,0)" />
                    </linearGradient>
                  </defs>
                  {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(58,65,76,0.3)" />)}
                  <path className={'lt-ck__area' + (seen ? ' is-in' : '')} d="M0,168 C70,158 100,130 150,128 C200,126 230,150 280,120 C330,92 350,70 400,60 C450,50 485,30 520,22 L520,200 L0,200 Z" fill="url(#ckFill)" />
                  <path className={'lt-ck__line' + (seen ? ' is-in' : '')} d="M0,168 C70,158 100,130 150,128 C200,126 230,150 280,120 C330,92 350,70 400,60 C450,50 485,30 520,22" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <circle className={'lt-ck__dot' + (seen ? ' is-in' : '')} cx="520" cy="22" r="4.5" fill="var(--accent-bright)" />
                </svg>
                <div className="lt-ck__signal">
                  <span className="lt-ck__sig-pulse" />
                  <b>LONG · BTC/USD</b>
                  <span className="lt-ck__sig-go">GO</span>
                  <span className="lt-ck__sig-sep">Score IA 87 · R:R 1:2.6</span>
                </div>
              </div>
            </div>

            {/* watchlist */}
            <aside className="lt-ck__watch">
              <span className="lt-ck__watch-h">Watchlist</span>
              {CK_WATCH.map((w, i) => (
                <div className={'lt-ck__row' + (flash === i ? ' is-flash' : '')} key={w.sym}>
                  <span className="lt-ck__sym">{w.sym}</span>
                  <span className="lt-ck__px">{prices[i].toLocaleString('fr-FR', { minimumFractionDigits: w.dec, maximumFractionDigits: w.dec })}</span>
                  <span className={'lt-ck__delta ' + (w.dir === 'up' ? 'lt-up' : 'lt-down')}>{w.dir === 'up' ? '▲' : '▼'} {w.d}</span>
                </div>
              ))}
              <div className="lt-ck__spark">
                {[10, 16, 12, 20, 17, 24, 19, 27, 22, 30, 26, 34].map((h, i) => (
                  <span key={i} style={{ height: h + 'px', animationDelay: (i * 0.08) + 's' }} />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

window.LiveCockpit = LiveCockpit;
