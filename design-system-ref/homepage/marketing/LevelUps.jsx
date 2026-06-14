/* global React */
// Le Terminal — "Level Ups" bento grid. Big count-up numbers + feature cards
// with live mini-visuals (ripple, orbit, calendar pulse, shield). Reference-reel
// inspired ("All the Level Ups"), restyled glacial.

function useLuReveal() {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.hidden) { setSeen(true); return; }
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setSeen(true); }), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function LuCount({ to, dur = 1400, decimals = 0, prefix = '', suffix = '', play }) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!play) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return; }
    let raf, t0;
    const tick = (t) => { if (!t0) t0 = t; const k = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to, dur]);
  return <span>{prefix}{v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

// mini visuals
function VizRipple() { return <div className="lu-viz lu-viz--ripple"><span /><span /><span /><span /></div>; }
function VizOrbit() { return (
  <div className="lu-viz lu-viz--orbit">
    <span className="lu-orbit__core" />
    <span className="lu-orbit__ring lu-orbit__ring--1"><i /></span>
    <span className="lu-orbit__ring lu-orbit__ring--2"><i /></span>
  </div>
); }
function VizCal() { return (
  <div className="lu-viz lu-viz--cal">
    {Array.from({ length: 28 }).map((_, i) => <span key={i} className={[4,9,10,15,21,22,26].includes(i) ? 'is-up' : ([6,17].includes(i) ? 'is-down' : '')} style={{ animationDelay: (i * 0.04) + 's' }} />)}
  </div>
); }
function VizShield() { return (
  <div className="lu-viz lu-viz--shield">
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 4 40 11v11c0 10-7 16-16 19-9-3-16-9-16-19V11z" stroke="var(--accent)" strokeWidth="1.5"/><path className="lu-shield__check" d="m17 24 5 5 9-9" stroke="var(--accent-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
); }

function LevelUpsSection() {
  const [ref, seen] = useLuReveal();
  return (
    <section className="lu" ref={ref}>
      <div className="lu__glow" data-parallax="0.06" />
      <div className="lu__head" data-reveal>
        <span className="lt-eyebrow"><span className="lt-dot" /> Le level up</span>
        <h2 className="lu__title">Tout ce qui<br/><span className="lt-metal">change la donne.</span></h2>
        <p className="lu__lede">Moins de bruit, plus de décision. Voilà ce que le cockpit apporte concrètement à ton trading.</p>
      </div>

      <div className={'lu__grid' + (seen ? ' is-in' : '')}>
        {/* hero stat — big */}
        <article className="lu__cell lu__cell--hero">
          <span className="lu__kicker">Analyse de setup</span>
          <span className="lu__big"><LuCount to={30} suffix=" s" play={seen} /></span>
          <span className="lu__sub">Un verdict IA — score, annotations et niveaux — le temps d'un café.</span>
          <div className="lu__scan"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </article>

        {/* 3 numeric tiles */}
        <article className="lu__cell lu__cell--num">
          <span className="lu__n"><LuCount to={87} suffix="/100" play={seen} /></span>
          <span className="lu__nl">Score IA moyen des setups validés</span>
        </article>
        <article className="lu__cell lu__cell--num">
          <span className="lu__n"><LuCount to={5} play={seen} /></span>
          <span className="lu__nl">Outils dans un seul abonnement</span>
        </article>
        <article className="lu__cell lu__cell--num">
          <span className="lu__n">24/7</span>
          <span className="lu__nl">Marchés suivis sans interruption</span>
        </article>

        {/* feature cards with mini-visuals */}
        <article className="lu__cell lu__cell--feat">
          <VizRipple />
          <div><h3>Sans le bruit</h3><p>Des signaux nets, classés et scorés. Fini le scroll infini de Twitter.</p></div>
        </article>
        <article className="lu__cell lu__cell--feat">
          <VizOrbit />
          <div><h3>Tous les marchés</h3><p>Forex, crypto, indices et matières premières — au même endroit.</p></div>
        </article>
        <article className="lu__cell lu__cell--feat">
          <VizCal />
          <div><h3>Journal automatique</h3><p>Chaque trade enregistré, ton P&amp;L et tes patterns analysés.</p></div>
        </article>
        <article className="lu__cell lu__cell--feat">
          <VizShield />
          <div><h3>100% privé</h3><p>Tes données et tes setups restent les tiens. Accès sur invitation.</p></div>
        </article>
      </div>
    </section>
  );
}

window.LevelUpsSection = LevelUpsSection;
