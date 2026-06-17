/* global React */
// Le Terminal — "Tes outils, partout" : floating tool panels in 3D perspective
// that drift, tilt to the mouse, and fly in from depth on reveal. Reference-reel
// inspired ("Multiple Screens Supported").

function ScreensSection() {
  const stageRef = React.useRef(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    if ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.hidden) { setSeen(true); return; }
    const el = stageRef.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setSeen(true); }), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || window.innerWidth < 760) return;
    const el = stageRef.current; if (!el) return;
    let raf = 0, tx = 0, ty = 0;
    const apply = () => { el.style.setProperty('--mrx', (ty * -6).toFixed(2) + 'deg'); el.style.setProperty('--mry', (tx * 9).toFixed(2) + 'deg'); raf = 0; };
    const onMove = (e) => { const r = el.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; if (!raf) raf = requestAnimationFrame(apply); };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
    el.addEventListener('mousemove', onMove); el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="lt-scr">
      <div className="lt-scr__head" data-reveal>
        <span className="lt-eyebrow"><span className="lt-dot" /> Un seul cockpit</span>
        <h2 className="lt-scr__title">Tes outils,<br/><span className="lt-metal">au même endroit.</span></h2>
        <p className="lt-scr__lede">Analyse, journal et flux de marché tournent ensemble — passe de l'un à l'autre sans jamais quitter le terminal.</p>
      </div>

      <div className={'lt-scr__stage' + (seen ? ' is-in' : '')} ref={stageRef}>
        <div className="lt-scr__glow" />

        {/* LEFT — Journal */}
        <div className="lt-scr__panel lt-scr__panel--l">
          <div className="lt-scr__bar"><i /><i /><i /><span>Journal</span></div>
          <div className="lt-scr__pbody">
            <div className="lt-scr__cal">
              {Array.from({ length: 21 }).map((_, i) => <span key={i} className={[2,5,6,11,14,18].includes(i) ? 'up' : ([8,16].includes(i) ? 'down' : '')} />)}
            </div>
            <div className="lt-scr__pnl">P&amp;L <b>+1 840 €</b></div>
          </div>
        </div>

        {/* CENTER — Analyzer (front) */}
        <div className="lt-scr__panel lt-scr__panel--c">
          <div className="lt-scr__bar"><i /><i /><i /><span>Setup Analyzer</span><em>87/100</em></div>
          <div className="lt-scr__pbody">
            <svg className="lt-scr__chart" viewBox="0 0 260 110" preserveAspectRatio="none">
              <defs><linearGradient id="scrFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(127,184,232,0.3)"/><stop offset="1" stopColor="rgba(127,184,232,0)"/></linearGradient></defs>
              {[28,56,84].map((y)=><line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(58,65,76,0.3)"/>)}
              <path d="M0,86 C40,80 60,64 95,66 C130,68 145,40 185,34 C220,29 240,16 260,12 L260,110 L0,110 Z" fill="url(#scrFill)"/>
              <path d="M0,86 C40,80 60,64 95,66 C130,68 145,40 185,34 C220,29 240,16 260,12" fill="none" stroke="var(--accent)" strokeWidth="2"/>
              <rect x="92" y="40" width="46" height="26" fill="none" stroke="rgba(127,184,232,0.5)" strokeDasharray="3 3"/>
            </svg>
            <div className="lt-scr__verdict"><span className="lt-scr__go">GO</span> Order Block H4 · R:R 1:2.6</div>
          </div>
        </div>

        {/* RIGHT — Bubble Map */}
        <div className="lt-scr__panel lt-scr__panel--r">
          <div className="lt-scr__bar"><i /><i /><i /><span>Bubble Map</span></div>
          <div className="lt-scr__pbody lt-scr__bubbles">
            <span className="up" style={{ width: 42, height: 42, left: '8%', top: '14%' }}>BTC</span>
            <span className="up" style={{ width: 30, height: 30, left: '52%', top: '8%' }}>SOL</span>
            <span className="down" style={{ width: 34, height: 34, left: '60%', top: '46%' }}>EUR</span>
            <span className="up" style={{ width: 26, height: 26, left: '24%', top: '52%' }}>NQ</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.ScreensSection = ScreensSection;
