/* global React */
// Le Terminal — Showcase : deep-dive éditorial des 5 outils, en rangées
// alternées. Chaque outil a sa propre mini-visualisation (mock UI custom).

/* ---------- Mini-visuals (un design par outil) ---------- */

function VizAnalyzer() {
  const candles = [
    [34, 18, 1], [28, 24, 0], [40, 12, 1], [22, 30, 0], [46, 10, 1],
    [38, 20, 1], [26, 26, 0], [50, 8, 1], [42, 16, 1], [30, 22, 0], [54, 6, 1],
  ];
  return (
    <div className="shx-viz shx-viz--analyzer">
      <div className="shx-chart">
        {candles.map((c, i) => (
          <span className={'shx-candle' + (c[2] ? ' is-up' : ' is-down')} key={i}
            style={{ height: c[0] + '%', marginTop: c[1] + '%' }} />
        ))}
        <span className="shx-zone" />
        <span className="shx-annot">Order Block H4</span>
      </div>
      <div className="shx-score">
        <svg viewBox="0 0 80 80" className="shx-ring">
          <circle cx="40" cy="40" r="34" className="shx-ring__bg" />
          <circle cx="40" cy="40" r="34" className="shx-ring__val" />
        </svg>
        <span className="shx-score__n">87</span>
        <span className="shx-score__cap">/100</span>
        <span className="shx-score__go">GO</span>
      </div>
    </div>
  );
}

function VizJournal() {
  const days = [12, -4, 0, 8, 15, 0, 0, -6, 9, 4, 0, 18, -3, 0, 7, 11, 0, -8, 5, 0, 22];
  return (
    <div className="shx-viz shx-viz--journal">
      <div className="shx-jr__head">
        <span className="shx-jr__month">Juin 2026</span>
        <span className="shx-jr__pnl">+1 840 €</span>
      </div>
      <div className="shx-jr__grid">
        {days.map((v, i) => (
          <span key={i} className={'shx-jr__cell' + (v > 0 ? ' is-up' : v < 0 ? ' is-down' : '')} />
        ))}
      </div>
      <div className="shx-jr__foot">
        <span>Win rate <b>63 %</b></span>
        <span>14 trades</span>
      </div>
    </div>
  );
}

function VizCalendrier() {
  return (
    <div className="shx-viz shx-viz--eco">
      <div className="shx-eco__row">
        <span className="shx-eco__t">14:30</span><span className="shx-eco__cur">USD</span>
        <span className="shx-eco__ev">CPI a/a</span>
        <span className="shx-eco__imp"><i /><i /><i /></span>
      </div>
      <div className="shx-eco__row is-hot">
        <span className="shx-eco__t">20:00</span><span className="shx-eco__cur">USD</span>
        <span className="shx-eco__ev">Décision FOMC</span>
        <span className="shx-eco__imp"><i /><i /><i /></span>
      </div>
      <div className="shx-eco__row">
        <span className="shx-eco__t">14:15</span><span className="shx-eco__cur shx-eco__cur--eur">EUR</span>
        <span className="shx-eco__ev">Taux BCE</span>
        <span className="shx-eco__imp"><i /><i /><i className="off" /></span>
      </div>
      <span className="shx-eco__alert"><span className="lt-dot" /> Alerte 30 min avant</span>
    </div>
  );
}

function VizBubble() {
  const bubbles = [
    { s: 'BTC', d: 1, size: 84, x: 8, y: 16, dur: 9 },
    { s: 'GOLD', d: 1, size: 58, x: 46, y: 8, dur: 11 },
    { s: 'EUR', d: 0, size: 64, x: 70, y: 38, dur: 8 },
    { s: 'US100', d: 1, size: 72, x: 26, y: 48, dur: 10 },
    { s: 'WTI', d: 0, size: 46, x: 56, y: 62, dur: 12 },
  ];
  return (
    <div className="shx-viz shx-viz--bubble">
      {bubbles.map((b, i) => (
        <span key={i} className={'shx-bub' + (b.d ? ' is-up' : ' is-down')}
          style={{ width: b.size, height: b.size, left: b.x + '%', top: b.y + '%', animationDuration: b.dur + 's' }}>
          {b.s}
        </span>
      ))}
    </div>
  );
}

function VizCalc() {
  return (
    <div className="shx-viz shx-viz--calc">
      <div className="shx-calc__row"><span>Capital</span><b>10 000 €</b></div>
      <div className="shx-calc__row"><span>Risque</span><b>1 %</b></div>
      <div className="shx-calc__row"><span>Stop loss</span><b>25 pips</b></div>
      <div className="shx-calc__sep" />
      <div className="shx-calc__out">
        <span className="shx-calc__lbl">Taille de position</span>
        <span className="shx-calc__val">0.40 lot</span>
        <span className="shx-calc__rr">R:R 1:2.5 · risque 100 €</span>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

const SHX_TOOLS = [
  { n: 'T-01', title: 'Setup Analyzer', viz: <VizAnalyzer />, href: '../app/index.html',
    lede: "Upload ton graphique, l'IA fait le reste.",
    desc: "Le moteur scanne ta capture comme un mentor : structure de marché, zones clés, confluences propres à TA stratégie. En retour : un score /100, des annotations directement sur le chart et un verdict net — GO, ATTENDRE ou NO-GO.",
    points: ['Verdict en ~30 secondes', 'Annotations sur ton graphique', 'Adapté ICT · SMC · Price Action'] },
  { n: 'T-02', title: 'Journal de Trading', viz: <VizJournal />, href: '../app/journal.html',
    lede: 'Ton mois entier, en un coup d\u2019œil.',
    desc: "Chaque trade enregistré nourrit ton calendrier P&L, ta courbe d'équité et tes statistiques. L'IA Coach repère les patterns que tu ne vois pas : les sessions où tu perds, les setups qui paient, les jours à éviter.",
    points: ['Calendrier P&L vert / rouge', 'IA Coach sur tes patterns', 'Win rate, R moyen, drawdown'] },
  { n: 'T-03', title: 'Calendrier Éco', viz: <VizCalendrier />, href: '../app/calendrier.html',
    lede: 'Ne te fais plus surprendre par une annonce.',
    desc: "NFP, CPI, FOMC, BCE — tous les événements macro classés par jour, devise et niveau d'impact, à l'heure de Paris. En PRO, une alerte te prévient avant chaque annonce à fort impact pour ajuster ton exposition.",
    points: ['Impact visualisé ● ● ●', 'Filtres par devise', 'Alertes avant les annonces (PRO)'] },
  { n: 'T-04', title: 'Bubble Map', viz: <VizBubble />, href: '../app/bubble.html',
    lede: 'Vois où va l\u2019argent, en direct.',
    desc: "Chaque actif est une bulle : sa taille suit le volume des flux, sa couleur la direction des dernières 24 h. En un regard tu vois si le capital fuit le risque ou le recherche — crypto, forex, indices et matières premières.",
    points: ['Physique temps réel', 'Filtres par classe d\u2019actifs', 'Rotation des capitaux visible'] },
  { n: 'T-05', title: 'Calculateur de Pips', viz: <VizCalc />, href: '../app/calculateur.html',
    lede: 'La bonne taille de position, à chaque fois.',
    desc: "Capital, pourcentage de risque, stop loss : le calculateur te donne instantanément la taille de lot exacte, la valeur du pip et ton R:R. Fini les positions surdimensionnées qui ruinent un mois de discipline.",
    points: ['Lot exact en un clic', 'Valeur du pip par paire', 'R:R validé avant l\u2019entrée'] },
];

function ShowcaseSection() {
  return (
    <section className="shx" id="showcase">
      <div className="shx__head" data-reveal>
        <span className="lt-eyebrow"><span className="lt-dot" /> Visite guidée</span>
        <h2 className="shx__title">À quoi sert chaque outil</h2>
        <p className="shx__lede">Cinq instruments, cinq problèmes de trader résolus. Voilà ce que chacun fait, concrètement.</p>
      </div>
      <div className="shx__rows">
        {SHX_TOOLS.map((t, i) => (
          <article className={'shx-row' + (i % 2 ? ' is-flip' : '')} key={t.n} data-reveal>
            <div className="shx-row__txt">
              <span className="shx-row__n">{t.n}</span>
              <h3 className="shx-row__title">{t.title}</h3>
              <p className="shx-row__lede">{t.lede}</p>
              <p className="shx-row__desc">{t.desc}</p>
              <ul className="shx-row__points">
                {t.points.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
              <a className="shx-row__link" href={t.href}>Ouvrir l'outil
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
            <div className="shx-row__viz">{t.viz}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

window.ShowcaseSection = ShowcaseSection;
