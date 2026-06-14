/* global React */
// Le Terminal — "Plan de vol" (4-step method as a route with waypoints) +
// "Carte d'embarquement" (Telegram community as a boarding pass) + footer.

function MethodSection() {
  const steps = [
    { n: '01', code: 'UPLOAD', title: 'Upload ton chart',
      desc: "Capture d'écran depuis TradingView ou ta plateforme. Glisse-dépose ou colle directement." },
    { n: '02', code: 'SCAN', title: "L'IA analyse",
      desc: "Le moteur IA propriétaire scanne la structure, les zones clés, le contexte macro et tes confluences." },
    { n: '03', code: 'SCORE', title: 'Score & feedback',
      desc: "Score /100, forces, faiblesses, niveaux de prix précis et verdict GO / ATTENDRE / NO-GO." },
    { n: '04', code: 'SUIVI', title: 'Sauvegarde & suivi',
      desc: "Chaque analyse est archivée. Enregistre le résultat et analyse tes stats dans le journal." },
  ];
  return (
    <section className="lt-flight" id="method" data-reveal>
      <div className="lt-flight__head">
        <span className="lt-eyebrow"><span className="lt-dot" /> Comment ça marche</span>
        <h2 className="lt-flight__title">La méthode</h2>
        <span className="lt-flight__route">CHART → VERDICT · 4 étapes · ~30 s</span>
      </div>
      <div className="lt-flight__route-line" aria-hidden="true"><span className="lt-flight__plane"><PlaneIcon /></span></div>
      <div className="lt-flight__steps">
        {steps.map((s, i) => (
          <div className="lt-flight__step" key={s.n} style={{ '--d': (i * 0.12) + 's' }}>
            <span className="lt-flight__node" aria-hidden="true" />
            <span className="lt-flight__code">{s.code}</span>
            <h4 className="lt-flight__steptitle">{s.title}</h4>
            <p className="lt-flight__stepdesc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommunityBand() {
  return (
    <section className="lt-pass" id="community" data-reveal>
      <div className="lt-pass__card">
        <div className="lt-pass__main">
          <span className="lt-pass__label">Accès privé</span>
          <h2 className="lt-pass__title">Rejoins la communauté</h2>
          <p className="lt-pass__lede">Analyses quotidiennes, setups en live et entraide entre traders, sur Telegram.</p>
          <div className="lt-pass__cta">
            <Button variant="primary" size="lg" iconRight={<ArrowMd />}>Rejoindre le canal</Button>
          </div>
        </div>
        <div className="lt-pass__stub">
          <div className="lt-pass__row"><span>Canal</span><b>Telegram</b></div>
          <div className="lt-pass__row"><span>Accès</span><b>Privé</b></div>
          <div className="lt-pass__row"><span>Setups</span><b>Quotidiens</b></div>
          <div className="lt-pass__row"><span>Alertes</span><b>Macro</b></div>
          <div className="lt-pass__barcode" aria-hidden="true" />
          <span className="lt-pass__serial">LT-2026 · TELEGRAM</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lt-footer">
      <div className="lt-footer__top">
        <div className="lt-footer__brand">
          <span className="lt-nav__mark"><FootMark /></span>
          <span className="lt-nav__word">LE&nbsp;TERMINAL</span>
        </div>
        <nav className="lt-footer__links">
          <a href="index.html#tools">Outils</a>
          <a href="index.html#strategies">Stratégies</a>
          <a href="pricing.html">Tarifs</a>
          <a href="index.html#method">Méthode</a>
          <a href="index.html#community">Communauté</a>
        </nav>
      </div>
      <div className="lt-footer__bottom">
        <span className="lt-footer__copy">© 2026 Le Terminal — Hub trading propulsé par l'IA</span>
        <span className="lt-footer__note">Outils éducatifs. Le trading comporte des risques de perte en capital.</span>
      </div>
    </footer>
  );
}

const mIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function PlaneIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21.5 15.5 13.5 11V4.5a1.5 1.5 0 0 0-3 0V11l-8 4.5V18l8-2.5V20l-2 1.5V23l3.5-1 3.5 1v-1.5L13.5 20v-4.5l8 2.5z"/></svg>;}
function ArrowMd(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;}
function FootMark(){return <svg width="20" height="20" viewBox="0 0 24 24" {...mIc} strokeWidth="1.6"><path d="M4 7h16M4 7v10a1 1 0 0 0 1 1h6"/><path d="m13 18 3-6 3 6"/><path d="M14.2 15.5h3.6"/></svg>;}

Object.assign(window, { MethodSection, CommunityBand, Footer });
