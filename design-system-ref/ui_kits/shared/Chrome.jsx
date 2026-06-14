/* global React */
// Le Terminal — global chrome: live price ticker strip (very top) + main nav.
// Shared by the marketing site and every app page. Requires window.Button.

const LT_TOOLS_MENU = [
  { label: 'Journal de Trading', desc: 'Calendrier · P&L · IA coach', href: '../app/journal.html' },
  { label: 'Calendrier Éco', desc: 'NFP · CPI · FOMC', href: '../app/calendrier.html' },
  { label: 'Setup Analyzer', desc: 'Score IA de ton setup', href: '../app/index.html' },
  { label: 'Bubble Map', desc: 'Flux de capitaux en direct', href: '../app/bubble.html' },
  { label: 'Calculateur de Pips', desc: 'Position · risque · R:R', href: '../app/calculateur.html' },
];

function GlobalHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={'lt-chrome' + (scrolled ? ' is-scrolled' : '')}>
      <header className="lt-nav">
        <a className="lt-nav__brand" href="../marketing/index.html">
          <span className="lt-nav__mark"><LtMark /></span>
          <span className="lt-nav__word">LE&nbsp;TERMINAL</span>
        </a>
        <nav className="lt-nav__links">
          <div className="lt-nav__drop" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className="lt-nav__droptrigger" aria-expanded={open}>
              Outils <span className={'lt-nav__caret' + (open ? ' is-open' : '')}><LtCaret /></span>
            </button>
            <div className={'lt-nav__menu' + (open ? ' is-open' : '')}>
              {LT_TOOLS_MENU.map((t, i) => (
                <a className="lt-nav__menuitem" href={t.href} key={i}>
                  <span className="lt-nav__menutop">
                    <span className="lt-nav__menulabel">{t.label}</span>
                    <span className="lt-dot" />
                  </span>
                  <span className="lt-nav__menudesc">{t.desc}</span>
                </a>
              ))}
            </div>
          </div>
          <a href="../marketing/pricing.html">Tarifs</a>
          <a href="../marketing/index.html#method">Méthode</a>
          <a href="../marketing/index.html#community">Communauté</a>
        </nav>
        <div className="lt-nav__actions">
          <span className="lt-nav__pill" title="Langue">FR</span>
          <Button variant="ghost" size="sm">Connexion</Button>
          <Button variant="primary" size="sm">Accès PRO</Button>
        </div>
      </header>
    </div>
  );
}

function LiveTicker() {
  const seed = [
    { s: 'BTC/USD', p: 67841.2 }, { s: 'ETH/USD', p: 3514.8 },
    { s: 'SOL/USD', p: 168.42 }, { s: 'EUR/USD', p: 1.0847 },
    { s: 'GBP/USD', p: 1.2724 }, { s: 'XAU/USD', p: 2384.6 },
    { s: 'WTI', p: 78.42 }, { s: 'US500', p: 5487.0 },
    { s: 'US100', p: 19420.5 }, { s: 'NVDA', p: 1204.9 },
    { s: 'AAPL', p: 214.09 }, { s: 'TSLA', p: 178.34 },
  ];
  const baseRef = React.useRef(seed.map((x) => x.p));
  const [rows, setRows] = React.useState(() => seed.map((x) => ({ ...x, d: 0, dir: 0 })));

  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = setInterval(() => {
      setRows((prev) => prev.map((r, i) => {
        const vol = r.p > 1000 ? r.p * 0.0006 : r.p > 50 ? r.p * 0.0009 : r.p * 0.0012;
        const np = r.p + (Math.random() - 0.5) * vol * 2;
        const base = baseRef.current[i];
        return { ...r, p: np, d: ((np - base) / base) * 100, dir: np >= r.p ? 1 : -1 };
      }));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const fmt = (p) => p >= 1000 ? p.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : p.toLocaleString('fr-FR', { minimumFractionDigits: p < 10 ? 4 : 2, maximumFractionDigits: p < 10 ? 4 : 2 });

  const Item = ({ r }) => {
    const up = r.d >= 0;
    return (
      <span className="lt-live__item">
        <span className="lt-live__sym">{r.s}</span>
        <span className={'lt-live__px' + (r.dir > 0 ? ' is-up' : r.dir < 0 ? ' is-down' : '')}>{fmt(r.p)}</span>
        <span className="lt-live__dl" style={{ color: up ? 'var(--bull)' : 'var(--bear)' }}>
          {up ? '▲' : '▼'} {Math.abs(r.d).toFixed(2)}%
        </span>
      </span>
    );
  };

  const set = [...rows, ...rows];
  return (
    <div className="lt-live" aria-label="Prix en direct">
      <span className="lt-live__badge"><span className="lt-dot" /> LIVE</span>
      <div className="lt-live__viewport">
        <div className="lt-live__rail">
          {set.map((r, i) => <Item r={r} key={i} />)}
        </div>
      </div>
    </div>
  );
}

function SideDock({ active, mobileOnly }) {
  const items = [
    { key: 'home', label: 'Accueil', short: 'Accueil', href: '../marketing/index.html', icon: 'home' },
    { key: 'journal', label: 'Journal de Trading', short: 'Journal', href: '../app/journal.html', icon: 'journal' },
    { key: 'calendrier', label: 'Calendrier Éco', short: 'Éco', href: '../app/calendrier.html', icon: 'calendar' },
    { key: 'analyzer', label: 'Setup Analyzer', short: 'Analyzer', href: '../app/index.html', icon: 'scan' },
    { key: 'bubble', label: 'Bubble Map', short: 'Bubble', href: '../app/bubble.html', icon: 'bubble' },
    { key: 'calculateur', label: 'Calculateur de Pips', short: 'Pips', href: '../app/calculateur.html', icon: 'calc' },
  ];
  return (
    <nav className={'lt-dock' + (mobileOnly ? ' lt-dock--mobile-only' : '')} aria-label="Pages">
      {items.map((it) => (
        <a key={it.key} className={'lt-dock__item' + (it.key === active ? ' is-active' : '')} href={it.href}>
          <DockGlyph name={it.icon} />
          <span className="lt-dock__lbl">{it.short}</span>
          <span className="lt-dock__tip">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

const dockIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
function DockGlyph({ name }) {
  const p = {
    home: <><path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 14l3-3 2 2 4-4"/></>,
    journal: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M13 8h3M13 12h3"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4M9 14h2"/></>,
    bubble: <><circle cx="8" cy="9" r="4"/><circle cx="17" cy="15" r="3"/><circle cx="16" cy="6" r="2"/></>,
    calc: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h6"/></>,
    star: <><path d="m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z"/></>,
  }[name];
  return <svg width="19" height="19" viewBox="0 0 24 24" {...dockIc}>{p}</svg>;
}

function LtMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 7v10a1 1 0 0 0 1 1h6"/><path d="m13 18 3-6 3 6"/><path d="M14.2 15.5h3.6"/>
    </svg>
  );
}
function LtCaret() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}

Object.assign(window, { GlobalHeader, LiveTicker, SideDock });
