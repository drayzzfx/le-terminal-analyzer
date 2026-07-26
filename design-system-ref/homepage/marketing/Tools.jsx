/* global React */
// Le Terminal — "Tableau des départs" : the 5 tools as a departures-board
// list (editorial rows, giant type) instead of a card grid. Stats strip below.

function RowSpark({ tone }) {
  // EKG-style traveling pulse — pure SVG, animated via CSS dash.
  const stroke = tone === 'accent' ? 'var(--accent)' : 'var(--bull)';
  return (
    <svg className="lt-board__spark" viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true">
      <path className="lt-board__spark-base" d="M0,28 L60,28 70,12 82,32 92,22 110,22 120,30 150,16 170,24 220,20" fill="none" stroke={stroke} strokeWidth="1.4" />
      <path className="lt-board__spark-run" d="M0,28 L60,28 70,12 82,32 92,22 110,22 120,30 150,16 170,24 220,20" fill="none" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

function BoardRow({ n, title, desc, tags, status, statusTone, featured, delay }) {
  return (
    <a className={'lt-board__row' + (featured ? ' is-featured' : '')} href="#" style={{ '--d': delay }}>
      <span className="lt-board__num">{n}</span>
      <span className="lt-board__name">
        <span className="lt-board__nametxt" data-text={title}>{title}</span>
        <span className="lt-board__tags">
          {tags.map((t, i) => <span key={i}>{t}</span>)}
        </span>
      </span>
      <span className="lt-board__desc">{desc}</span>
      <span className="lt-board__status"><Badge tone={statusTone} dot={statusTone !== 'neutral'}>{status}</Badge></span>
      <span className="lt-board__go">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </span>
      <RowSpark tone={statusTone === 'accent' ? 'accent' : 'bull'} />
    </a>
  );
}

function ToolsSection() {
  const tools = [
    { n: '01', title: 'Setup Analyzer', featured: true, status: 'En ligne', statusTone: 'bull',
      desc: "Score IA de ton setup, toutes stratégies. Feedback instantané et annotations directement sur ton graphique.",
      tags: ['Score /100', 'Annotations IA', 'Rapport PDF'] },
    { n: '02', title: 'Journal de Trading', status: 'Nouveau', statusTone: 'accent',
      desc: "Calendrier de tes trades, suivi du P&L, screenshots et analyse IA de tes patterns de performance.",
      tags: ['Calendrier', 'P&L · Win Rate', 'IA Coach'] },
    { n: '03', title: 'Calendrier Éco', status: 'En ligne', statusTone: 'bull',
      desc: "Tous les événements macro clés — NFP, CPI, FOMC — par région et impact attendu.",
      tags: ['NFP · CPI · FOMC', 'Multi-régions'] },
    { n: '04', title: 'Bubble Map', status: 'En ligne', statusTone: 'bull',
      desc: "Les flux de capitaux entre actifs en temps réel — crypto, forex, indices, matières premières.",
      tags: ['Flux capitaux', 'Live'] },
    { n: '05', title: 'Calculateur de Pips', status: 'En ligne', statusTone: 'bull',
      desc: "Taille de position, valeur du pip, risque en devise et R:R optimal, validés automatiquement.",
      tags: ['Position size', 'Long / Short'] },
  ];
  return (
    <section className="lt-board" id="tools" data-reveal>
      <div className="lt-board__head">
        <div className="lt-board__headleft">
          <span className="lt-eyebrow"><span className="lt-dot" /> Arsenal complet</span>
          <h2 className="lt-board__title">Les outils<br/>du cockpit</h2>
        </div>
        <p className="lt-board__lede">Cinq outils, un seul abonnement. Chaque instrument est conçu pour un aspect précis de ton trading — ensemble, ils forment un écosystème complet.</p>
      </div>
      <div className="lt-board__legend" aria-hidden="true">
        <span>N°</span><span>Outil</span><span>Description</span><span>Statut</span><span></span>
      </div>
      <div className="lt-board__rows">
        <span className="lt-board__sweep" aria-hidden="true" />
        {tools.map((t, i) => <BoardRow key={t.n} {...t} delay={(i * 0.09) + 's'} />)}
      </div>
      <div className="lt-board__foot">
        <span className="lt-board__footnote">Un seul abonnement. Cinq outils. Zéro friction.</span>
        <Button variant="secondary" iconRight={<ArrowSm />}>Comparer les offres</Button>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { v: '5', l: 'Outils actifs' },
    { v: 'Propriétaire', l: "Moteur d'analyse IA" },
    { v: '∞', l: 'Stratégies supportées' },
    { v: '24/7', l: 'Disponible' },
  ];
  return (
    <section className="lt-statstrip" data-reveal data-stagger>
      {stats.map((s, i) => (
        <div className="lt-statstrip__cell" key={i}>
          <span className="lt-statstrip__v">{s.v}</span>
          <span className="lt-statstrip__l">{s.l}</span>
        </div>
      ))}
    </section>
  );
}

function MarqueeBand() {
  return null; // replaced by VerdictBand
}

function VerdictBand() {
  return <LiveChartBand />;
}

function LiveChartBand() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let raf, w, h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    const N = 180; const data = []; let v = 0.5;
    for (let i = 0; i < N; i++) { v += (Math.random() - 0.5) * 0.055; v = Math.max(0.14, Math.min(0.86, v)); data.push(v); }
    let t = 0;
    const draw = () => {
      t++;
      if (t % 4 === 0) { v += (Math.random() - 0.49) * 0.05; v = Math.max(0.14, Math.min(0.86, v)); data.push(v); data.shift(); }
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(59, 125, 255,0.07)'; ctx.lineWidth = 1;
      for (let y = 1; y < 4; y++) { ctx.beginPath(); ctx.moveTo(0, h * y / 4); ctx.lineTo(w, h * y / 4); ctx.stroke(); }
      const px = (i) => (i / (N - 1)) * w, py = (val) => h * (1 - val) * 0.86 + h * 0.07;
      ctx.beginPath();
      data.forEach((d, i) => { if (i) ctx.lineTo(px(i), py(d)); else ctx.moveTo(px(i), py(d)); });
      ctx.strokeStyle = 'rgba(59, 125, 255,0.9)'; ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(59, 125, 255,0.45)'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(59, 125, 255,0.13)'); g.addColorStop(1, 'rgba(59, 125, 255,0)');
      ctx.fillStyle = g; ctx.fill();
      const lx = px(N - 1), ly = py(data[N - 1]);
      ctx.beginPath(); ctx.arc(lx - 2, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#8FBAFF'; ctx.shadowColor = 'rgba(59, 125, 255,0.8)'; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <section className="lt-chartband" data-reveal>
      <canvas ref={ref} className="lt-chartband__canvas" />
      <div className="lt-chartband__overlay">
        <span className="lt-eyebrow"><span className="lt-dot" /> En continu</span>
        <h2 className="lt-chartband__title"><span className="lt-metal">Le marché ne dort jamais.</span></h2>
        <p className="lt-chartband__sub">Ton edge non plus. Analyses, alertes et suivi — 24/7.</p>
      </div>
      <span className="lt-chartband__tag">FLUX SIMULÉ · TEMPS RÉEL</span>
    </section>
  );
}

function ArrowSm(){return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;}

Object.assign(window, { ToolsSection, StatsSection, MarqueeBand, VerdictBand });
