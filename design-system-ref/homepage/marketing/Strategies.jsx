/* global React */
// Le Terminal — strategies as an editorial index list + signature features.

function StrategiesSection() {
  const strategies = [
    'ICT / Inner Circle Trader', 'Smart Money Concepts', 'Price Action classique',
    'Wyckoff', 'Supply & Demand', 'Fibonacci / OTE', 'Structure de marché', 'Orderflow & Footprint',
  ];
  const features = [
    { icon: <BlockIcon />, title: 'Order Blocks & FVG',
      desc: "Détection automatique des zones clés, Fair Value Gaps et liquidity pools sur ton graphique." },
    { icon: <StructIcon />, title: 'BOS / CHoCH / Structure',
      desc: "Analyse de la structure de marché du HTF vers le LTF, confirmation des changements de caractère." },
    { icon: <ClockIcon />, title: 'Killzones & Sessions',
      desc: "Prise en compte automatique des sessions London, NY, Asia et des killzones à haute probabilité." },
    { icon: <VerdictIcon />, title: 'Verdict GO / ATTENDRE / NO-GO',
      desc: "Verdict net et sans ambiguïté avec niveau de confiance, cibles et conseils actionnables." },
  ];
  return (
    <section className="lt-strat" id="strategies" data-reveal>
      <div className="lt-strat__grid">
        <div className="lt-strat__intro">
          <span className="lt-eyebrow"><span className="lt-dot" /> Compatibilité universelle</span>
          <h2 className="lt-strat__title">Toutes les stratégies,<br/>un seul outil.</h2>
          <p className="lt-strat__lede">
            Le Terminal adapte son analyse à ta méthode. L'IA détecte les confluences
            qui correspondent à ta façon de trader — pas à un modèle générique.
          </p>
          <ul className="lt-strat__index">
            {strategies.map((s, i) => (
              <li key={i}>
                <span className="lt-strat__idxnum">{String(i + 1).padStart(2, '0')}</span>
                <span className="lt-strat__idxname">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lt-strat__features">
          {features.map((f, i) => (
            <div className="lt-feature" key={i}>
              <span className="lt-feature__ic">{f.icon}</span>
              <div className="lt-feature__body">
                <h4 className="lt-feature__title">{f.title}</h4>
                <p className="lt-feature__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const fIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function BlockIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" {...fIc}><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/></svg>;}
function StructIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" {...fIc}><path d="M3 17l5-5 3 3 4-6 3 4 3-3"/><circle cx="8" cy="12" r="1"/><circle cx="11" cy="15" r="1"/><circle cx="15" cy="9" r="1"/></svg>;}
function ClockIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" {...fIc}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;}
function VerdictIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" {...fIc}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>;}

window.StrategiesSection = StrategiesSection;
