/* global React */
// Le Terminal — application shell: sidebar nav + topbar. Reused by every tool page.

const APP_NAV = [
  { key: 'journal', label: 'Journal', href: 'journal.html', icon: 'journal' },
  { key: 'calendrier', label: 'Calendrier Éco', href: 'presentation.html', icon: 'calendar', children: [
    { key: 'presentation', label: 'Présentation', href: 'presentation.html', icon: 'grid' },
    { key: 'flash', label: 'Flash Info', href: 'presentation.html#edition', icon: 'bolt' },
    { key: 'cal', label: 'Calendrier éco', href: 'calendrier.html', icon: 'calendar' },
    { key: 'crypto', label: 'Crypto', href: 'bubble.html', icon: 'crypto' },
  ] },
  { key: 'analyzer', label: 'Setup Analyzer', href: 'index.html', icon: 'scan' },
  { key: 'bubble', label: 'Bubble Map', href: 'bubble.html', icon: 'bubble' },
  { key: 'calculateur', label: 'Calculateur', href: 'calculateur.html', icon: 'calc' },
];

function Sidebar({ active, sub }) {
  return (
    <aside className="side">
      <span className="side__label">Outils</span>
      {APP_NAV.map((n) => {
        const open = n.key === active;
        return (
          <div className="side__group" key={n.key}>
            <a className={'side__item' + (open ? ' is-active' : '')} href={n.href}>
              <span className="side__ic"><Glyph name={n.icon} /></span>
              {n.label}
              {n.children
                ? <span className={'side__caret' + (open ? ' is-open' : '')}><Glyph name="caret" /></span>
                : n.tag && <span className="side__tag">{n.tag}</span>}
            </a>
            {n.children && open && (
              <div className="side__sub">
                {n.children.map((c) => (
                  <a key={c.key} className={'side__subitem' + (c.key === sub ? ' is-active' : '')} href={c.href}>
                    <span className="side__subic"><Glyph name={c.icon} /></span>
                    {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="side__spacer" />
      <div className="side__pro">
        <h4>Accès PRO</h4>
        <p>Analyses illimitées, journal complet et alertes macro en direct.</p>
        <Button variant="primary" size="sm" style={{ width: '100%' }}>Passer PRO</Button>
      </div>
    </aside>
  );
}

function AppShell({ active, sub, crumb, children }) {
  return (
    <React.Fragment>
      <GlobalHeader />
      <SideDock active={active} mobileOnly />
      <div className="app">
        <Sidebar active={active} sub={sub} />
        <div className="main">
          <div className="top">
            <div className="top__crumb">
              <span>Le Terminal</span>
              <span className="sep">/</span>
              <b>{crumb}</b>
            </div>
            <div className="top__right">
              <span className="top__status"><span className="lt-dot" /> Marché ouvert</span>
              <span className="top__avatar">TR</span>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </React.Fragment>
  );
}

const gIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
function Glyph({ name }) {
  const p = {
    mark: <><path d="M4 7h16M4 7v10a1 1 0 0 0 1 1h6"/><path d="m13 18 3-6 3 6"/><path d="M14.2 15.5h3.6"/></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 14l3-3 2 2 4-4"/></>,
    journal: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M13 8h3M13 12h3"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4M9 14h2"/></>,
    bubble: <><circle cx="8" cy="9" r="4"/><circle cx="17" cy="15" r="3"/><circle cx="16" cy="6" r="2"/></>,
    calc: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h6"/></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></>,
    bolt: <><polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/></>,
    crypto: <><circle cx="12" cy="12" r="9"/><path d="M9.5 8h3.2a2 2 0 0 1 0 4H9.5m0 0h3.6a2 2 0 0 1 0 4H9.5m0-8v10M11 6v2M11 16v2"/></>,
    caret: <><path d="m6 9 6 6 6-6"/></>,
    star: <><path d="m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z"/></>,
  }[name];
  return <svg width="18" height="18" viewBox="0 0 24 24" {...gIc}>{p}</svg>;
}

Object.assign(window, { AppShell, Sidebar });
