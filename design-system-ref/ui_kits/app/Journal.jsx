/* global React */
// Le Terminal — Journal de Trading : monthly P&L calendar, stats, equity
// curve and recent trades. Sample data for June 2026 (June 1st = Monday).

const JR_DAYS = {
  1: { pnl: 320, n: 2 }, 2: { pnl: -140, n: 1 }, 3: { pnl: 510, n: 3 }, 4: { pnl: 0, n: 0 }, 5: { pnl: 880, n: 2 },
  8: { pnl: -260, n: 2 }, 9: { pnl: 415, n: 1 }, 10: { pnl: 190, n: 2 }, 11: { pnl: -75, n: 1 },
};

const JR_TRADES = [
  { d: '11 juin', pair: 'EUR/USD', side: 'Short', r: '−0.5R', pnl: -75, strat: 'SMC' },
  { d: '10 juin', pair: 'XAU/USD', side: 'Long', r: '+1.2R', pnl: 190, strat: 'ICT' },
  { d: '09 juin', pair: 'US100', side: 'Long', r: '+2.1R', pnl: 415, strat: 'Price Action' },
  { d: '08 juin', pair: 'GBP/USD', side: 'Short', r: '−1.0R', pnl: -260, strat: 'SMC' },
  { d: '05 juin', pair: 'BTC/USD', side: 'Long', r: '+2.9R', pnl: 880, strat: 'ICT' },
];

function Journal() {
  const eqRef = React.useRef(null);

  // equity curve from daily pnl
  React.useEffect(() => {
    const c = eqRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.offsetWidth, h = c.offsetHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const series = [0];
    for (let d = 1; d <= 11; d++) series.push(series[series.length - 1] + (JR_DAYS[d] ? JR_DAYS[d].pnl : 0));
    const min = Math.min(...series), max = Math.max(...series);
    const px = (i) => (i / (series.length - 1)) * (w - 16) + 8;
    const py = (v) => h - 14 - ((v - min) / Math.max(1, max - min)) * (h - 28);
    ctx.strokeStyle = 'rgba(59, 125, 255,0.08)';
    for (let y = 1; y < 3; y++) { ctx.beginPath(); ctx.moveTo(0, h * y / 3); ctx.lineTo(w, h * y / 3); ctx.stroke(); }
    ctx.beginPath();
    series.forEach((v, i) => { if (i) ctx.lineTo(px(i), py(v)); else ctx.moveTo(px(i), py(v)); });
    ctx.strokeStyle = 'rgba(74,222,156,0.9)'; ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(74,222,156,0.4)'; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.lineTo(px(series.length - 1), h); ctx.lineTo(8, h); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(74,222,156,0.14)'); g.addColorStop(1, 'rgba(74,222,156,0)');
    ctx.fillStyle = g; ctx.fill();
  }, []);

  const total = Object.values(JR_DAYS).reduce((s, d) => s + d.pnl, 0);
  const trades = Object.values(JR_DAYS).reduce((s, d) => s + d.n, 0);
  const wins = Object.values(JR_DAYS).filter((d) => d.pnl > 0).length;
  const traded = Object.values(JR_DAYS).filter((d) => d.n > 0).length;

  const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toLocaleString('fr-FR') + ' €';

  // June 2026 : 30 days, starts on Monday
  const cells = [];
  for (let d = 1; d <= 30; d++) cells.push(d);

  return (
    <AppShell active="journal" crumb="Journal de Trading">
      <div className="page-head">
        <span className="eyebrow"><span className="lt-dot" /> Suivi de performance</span>
        <h1>Journal de Trading</h1>
        <p>Ton mois en un coup d'œil : P&L par jour, win rate, et l'analyse IA de tes patterns de performance.</p>
      </div>

      <div className="jr-stats">
        <div className="jr-stat"><span className="jr-stat__l">P&L · Juin</span><span className="jr-stat__v" style={{ color: total >= 0 ? 'var(--bull)' : 'var(--bear)' }}>{fmt(total)}</span></div>
        <div className="jr-stat"><span className="jr-stat__l">Win rate (jours)</span><span className="jr-stat__v">{Math.round((wins / traded) * 100)}%</span></div>
        <div className="jr-stat"><span className="jr-stat__l">Trades</span><span className="jr-stat__v">{trades}</span></div>
        <div className="jr-stat"><span className="jr-stat__l">Meilleur jour</span><span className="jr-stat__v" style={{ color: 'var(--bull)' }}>+880 €</span></div>
      </div>

      <div className="jr-grid">
        <div className="panel jr-cal">
          <div className="jr-cal__head">
            <span className="panel__title" style={{ margin: 0 }}>Juin 2026</span>
            <div className="jr-cal__nav"><button aria-label="Mois précédent">‹</button><button aria-label="Mois suivant">›</button></div>
          </div>
          <div className="jr-cal__week">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="jr-cal__days">
            {cells.map((d) => {
              const day = JR_DAYS[d];
              const wk = (d - 1) % 7 >= 5;
              const cls = day && day.n > 0 ? (day.pnl > 0 ? ' is-up' : day.pnl < 0 ? ' is-down' : ' is-flat') : (wk ? ' is-we' : '');
              return (
                <div key={d} className={'jr-day' + cls + (d === 11 ? ' is-today' : '')}>
                  <span className="jr-day__n">{d}</span>
                  {day && day.n > 0 && (
                    <React.Fragment>
                      <span className="jr-day__pnl">{fmt(day.pnl)}</span>
                      <span className="jr-day__t">{day.n} trade{day.n > 1 ? 's' : ''}</span>
                    </React.Fragment>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="jr-side">
          <div className="panel">
            <span className="panel__title">Courbe d'équité</span>
            <canvas ref={eqRef} className="jr-eq" />
          </div>
          <div className="panel">
            <span className="panel__title">IA Coach</span>
            <p className="jr-coach">Tes shorts EUR/USD en session Asie ont un win rate de 31 % — l'essentiel de ton edge vient des longs en killzone New York. Concentre ton risque là où il paie.</p>
            <Badge tone="accent" dot>Insight de la semaine</Badge>
          </div>
        </div>
      </div>

      <div className="panel">
        <span className="panel__title">Derniers trades</span>
        <div className="jr-table">
          <div className="jr-row jr-row--head">
            <span>Date</span><span>Paire</span><span>Sens</span><span>Stratégie</span><span>R</span><span>P&L</span>
          </div>
          {JR_TRADES.map((t, i) => (
            <div className="jr-row" key={i}>
              <span className="jr-cell--mono">{t.d}</span>
              <span className="jr-cell--pair">{t.pair}</span>
              <span><Badge tone={t.side === 'Long' ? 'bull' : 'bear'}>{t.side}</Badge></span>
              <span className="jr-cell--mono">{t.strat}</span>
              <span className="jr-cell--mono">{t.r}</span>
              <span className="jr-cell--mono" style={{ color: t.pnl >= 0 ? 'var(--bull)' : 'var(--bear)' }}>{fmt(t.pnl)}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

window.Journal = Journal;
