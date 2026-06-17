/* global React */
// Le Terminal — Setup Analyzer view (flagship). Upload a chart, get an AI
// score /100, a GO / ATTENDRE / NO-GO verdict, strengths, weaknesses, key
// levels and detected confluences.

function ScoreGauge({ value }) {
  const angle = (value / 100) * 360;
  const color = value >= 70 ? 'var(--bull)' : value >= 45 ? 'var(--neutral)' : 'var(--bear)';
  return (
    <div className="sa-gauge" style={{ background: `conic-gradient(${color} ${angle}deg, var(--border-subtle) ${angle}deg)` }}>
      <div className="sa-gauge__inner">
        <span className="sa-gauge__val" style={{ color }}>{value}</span>
        <span className="sa-gauge__max">/ 100</span>
      </div>
    </div>
  );
}

function SetupAnalyzer() {
  const confluences = ['Order Block H4', 'Fair Value Gap', 'Liquidity sweep', 'Killzone NY', 'BOS confirmé', 'OTE 0.62'];
  const strengths = [
    "Prise de liquidité claire sous l'ancien plus-bas avant le retournement.",
    "Entrée alignée sur un Order Block H4 non mitigé.",
    "Structure HTF haussière, CHoCH confirmé en M15.",
  ];
  const weaknesses = [
    "Le FVG n'est rempli qu'à 50 %, momentum encore fragile.",
    "DXY en zone de décision — risque de contre-mouvement macro.",
  ];
  const levels = [
    { k: 'Entrée', v: '1.0842', t: 'accent' },
    { k: 'Stop loss', v: '1.0818', t: 'bear' },
    { k: 'TP 1', v: '1.0879', t: 'bull' },
    { k: 'TP 2', v: '1.0912', t: 'bull' },
  ];

  return (
    <AppShell active="analyzer" crumb="Setup Analyzer">
      <div className="page-head">
        <span className="eyebrow"><span className="lt-dot" /> Setup Analyzer</span>
        <h1>Analyse de setup</h1>
        <p>Glisse la capture de ton setup. Le moteur IA propriétaire évalue la structure, les zones clés et les confluences de ta stratégie, puis rend un verdict net.</p>
      </div>

      <div className="sa-grid">
        <div className="sa-chart panel">
          <div className="sa-chart__bar">
            <span className="panel__title" style={{ margin: 0 }}>Ton graphique</span>
            <div className="sa-chart__meta"><Badge tone="mute">EUR/USD</Badge><Badge tone="mute">M15</Badge></div>
          </div>
          <div className="sa-chart__stage">
            <image-slot id="sa-chart" style={{ width: '100%', height: '340px', display: 'block' }} shape="rounded" radius="8" placeholder="Glisse ta capture TradingView ici"></image-slot>
            <span className="sa-annot sa-annot--ob" style={{ top: '26%', left: '12%' }}>Order Block H4</span>
            <span className="sa-annot sa-annot--fvg" style={{ top: '54%', left: '46%' }}>FVG</span>
            <span className="sa-annot sa-annot--liq" style={{ top: '74%', left: '24%' }}>Liquidity sweep</span>
          </div>
          <div className="sa-chart__foot">
            <Button variant="secondary" size="sm" icon={<Upload />}>Nouvelle capture</Button>
            <Button variant="primary" size="sm" iconRight={<Spark />}>Relancer l'analyse</Button>
          </div>
        </div>

        <div className="sa-verdict panel">
          <span className="panel__title">Verdict</span>
          <div className="sa-verdict__top">
            <ScoreGauge value={78} />
            <div className="sa-verdict__call">
              <Badge tone="bull" dot>GO</Badge>
              <span className="sa-verdict__conf">Confiance élevée</span>
              <div className="sa-conf"><span className="sa-conf__fill" style={{ width: '78%' }} /></div>
              <span className="sa-verdict__note">Long · risque 1.0 % · R:R 2.9</span>
            </div>
          </div>
          <div className="sa-levels">
            {levels.map((l) => (
              <div className="sa-level" key={l.k}>
                <span className="sa-level__k">{l.k}</span>
                <span className="sa-level__v" style={{ color: `var(--${l.t === 'accent' ? 'accent-bright' : l.t})` }}>{l.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sa-analysis">
        <div className="panel">
          <span className="panel__title" style={{ color: 'var(--bull)' }}>Forces</span>
          <ul className="sa-list sa-list--up">{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="panel">
          <span className="panel__title" style={{ color: 'var(--bear)' }}>Points de vigilance</span>
          <ul className="sa-list sa-list--down">{weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="panel">
          <span className="panel__title">Confluences détectées</span>
          <div className="sa-chips">{confluences.map((c, i) => <span className="sa-chip" key={i}><Check />{c}</span>)}</div>
        </div>
      </div>
    </AppShell>
  );
}

const aIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
function Upload(){return <svg width="15" height="15" viewBox="0 0 24 24" {...aIc}><path d="M12 16V6M8 10l4-4 4 4M5 18h14"/></svg>;}
function Spark(){return <svg width="15" height="15" viewBox="0 0 24 24" {...aIc}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>;}
function Check(){return <svg width="13" height="13" viewBox="0 0 24 24" {...aIc} stroke="var(--accent)"><polyline points="20 6 9 17 4 12"/></svg>;}

window.SetupAnalyzer = SetupAnalyzer;
