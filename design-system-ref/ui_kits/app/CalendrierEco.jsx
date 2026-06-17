/* global React */
// Le Terminal — Calendrier Éco : macro events grouped by day, filterable by
// currency, with impact level and forecast/previous/actual values.

const ECO_EVENTS = [
  { day: "Aujourd'hui · Mer 11 juin", items: [
    { t: '14:30', cur: 'USD', ev: 'CPI (IPC) — Inflation a/a', imp: 3, prev: '3,1 %', fc: '2,9 %', act: '3,0 %' },
    { t: '14:30', cur: 'USD', ev: 'CPI core m/m', imp: 3, prev: '0,3 %', fc: '0,2 %', act: '0,3 %' },
    { t: '16:30', cur: 'USD', ev: 'Stocks de pétrole brut (EIA)', imp: 2, prev: '−1,2 M', fc: '−0,8 M', act: '—' },
    { t: '20:00', cur: 'USD', ev: 'Décision de taux FOMC', imp: 3, prev: '4,50 %', fc: '4,50 %', act: '—' },
    { t: '20:30', cur: 'USD', ev: 'Conférence de presse de la Fed', imp: 3, prev: '—', fc: '—', act: '—' },
  ]},
  { day: 'Demain · Jeu 12 juin', items: [
    { t: '08:00', cur: 'GBP', ev: 'PIB m/m', imp: 2, prev: '0,2 %', fc: '0,1 %', act: '—' },
    { t: '14:15', cur: 'EUR', ev: 'Décision de taux BCE', imp: 3, prev: '3,25 %', fc: '3,00 %', act: '—' },
    { t: '14:30', cur: 'USD', ev: 'Inscriptions au chômage', imp: 2, prev: '229 K', fc: '235 K', act: '—' },
    { t: '14:45', cur: 'EUR', ev: 'Conférence de presse BCE', imp: 3, prev: '—', fc: '—', act: '—' },
  ]},
  { day: 'Ven 13 juin', items: [
    { t: '01:50', cur: 'JPY', ev: 'Décision de taux BoJ', imp: 3, prev: '0,25 %', fc: '0,25 %', act: '—' },
    { t: '11:00', cur: 'EUR', ev: 'Production industrielle m/m', imp: 1, prev: '−0,4 %', fc: '0,2 %', act: '—' },
    { t: '16:00', cur: 'USD', ev: 'Confiance conso. Michigan', imp: 2, prev: '69,1', fc: '70,0', act: '—' },
  ]},
  { day: 'Ven 4 juillet', items: [
    { t: '14:30', cur: 'USD', ev: 'NFP — Emplois non agricoles', imp: 3, prev: '+185 K', fc: '+170 K', act: '—' },
    { t: '14:30', cur: 'USD', ev: 'Taux de chômage', imp: 3, prev: '4,1 %', fc: '4,1 %', act: '—' },
  ]},
];

const ECO_CURS = ['Toutes', 'USD', 'EUR', 'GBP', 'JPY'];

function ImpactDots({ n }) {
  const color = n === 3 ? 'var(--bear)' : n === 2 ? 'var(--neutral)' : 'var(--text-muted)';
  return (
    <span className="eco-imp" title={n === 3 ? 'Impact fort' : n === 2 ? 'Impact moyen' : 'Impact faible'}>
      {[1, 2, 3].map((i) => <i key={i} style={{ background: i <= n ? color : 'var(--border)', boxShadow: i <= n && n === 3 ? '0 0 6px ' + color : 'none' }} />)}
    </span>
  );
}

function CalendrierEco() {
  const [cur, setCur] = React.useState('Toutes');
  const [impOnly, setImpOnly] = React.useState(false);

  const groups = ECO_EVENTS.map((g) => ({
    ...g,
    items: g.items.filter((e) => (cur === 'Toutes' || e.cur === cur) && (!impOnly || e.imp === 3)),
  })).filter((g) => g.items.length > 0);

  return (
    <AppShell active="calendrier" sub="cal" crumb="Calendrier Éco">
      <div className="page-head">
        <span className="eyebrow"><span className="lt-dot" /> Macro</span>
        <h1>Calendrier Éco</h1>
        <p>Les événements macroéconomiques clés — NFP, CPI, FOMC — organisés par région et impact attendu. Heures de Paris.</p>
      </div>

      <div className="bm-bar">
        <div className="bm-filters">
          {ECO_CURS.map((c) => (
            <button key={c} className={'bm-filter' + (cur === c ? ' is-on' : '')} onClick={() => setCur(c)}>{c}</button>
          ))}
        </div>
        <button className={'eco-imptoggle' + (impOnly ? ' is-on' : '')} onClick={() => setImpOnly(!impOnly)}>
          <span className="eco-imptoggle__dot" /> Impact fort uniquement
        </button>
      </div>

      {groups.map((g) => (
        <div className="panel eco-group" key={g.day}>
          <div className="eco-group__day">{g.day}</div>
          <div className="eco-rows">
            {g.items.map((e, i) => (
              <div className={'eco-row' + (e.imp === 3 ? ' is-hot' : '')} key={i}>
                <span className="eco-row__t">{e.t}</span>
                <span className={'eco-row__cur eco-row__cur--' + e.cur.toLowerCase()}>{e.cur}</span>
                <span className="eco-row__ev">{e.ev}</span>
                <ImpactDots n={e.imp} />
                <span className="eco-row__val"><b>Préc.</b>{e.prev}</span>
                <span className="eco-row__val"><b>Prév.</b>{e.fc}</span>
                <span className="eco-row__val eco-row__val--act"><b>Réel</b>{e.act}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="eco-note">
        <Badge tone="accent" dot>Flash Info</Badge>
        <p>FOMC ce soir 20:00 — volatilité attendue sur USD, indices et or. Réduis ta taille de position autour de l'annonce.</p>
      </div>
    </AppShell>
  );
}

window.CalendrierEco = CalendrierEco;
