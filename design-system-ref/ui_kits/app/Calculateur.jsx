/* global React */
// Le Terminal — Calculateur de Pips. Position size, pip value, risk in
// currency and R:R, computed live from the inputs.

const PAIRS = {
  'EUR/USD': { pip: 0.0001, valPerLot: 10, dec: 5 },
  'GBP/USD': { pip: 0.0001, valPerLot: 10, dec: 5 },
  'USD/JPY': { pip: 0.01, valPerLot: 9.1, dec: 3 },
  'XAU/USD': { pip: 0.1, valPerLot: 10, dec: 2 },
  'BTC/USD': { pip: 1, valPerLot: 1, dec: 1 },
};

function Field({ label, children, suffix }) {
  return (
    <label className="calc-field">
      <span className="calc-field__label">{label}</span>
      <div className="calc-field__wrap">
        {children}
        {suffix && <span className="calc-field__suffix">{suffix}</span>}
      </div>
    </label>
  );
}

function Calculateur() {
  const [capital, setCapital] = React.useState(10000);
  const [risk, setRisk] = React.useState(1);
  const [pair, setPair] = React.useState('EUR/USD');
  const [side, setSide] = React.useState('long');
  const [entry, setEntry] = React.useState(1.0842);
  const [sl, setSl] = React.useState(1.0818);
  const [tp, setTp] = React.useState(1.0912);

  const cfg = PAIRS[pair];
  const riskAmount = capital * (risk / 100);
  const slPips = Math.abs(entry - sl) / cfg.pip;
  const tpPips = Math.abs(tp - entry) / cfg.pip;
  const pipValuePerLot = cfg.valPerLot;
  const lots = slPips > 0 ? riskAmount / (slPips * pipValuePerLot) : 0;
  const units = lots * 100000;
  const rr = slPips > 0 ? tpPips / slPips : 0;
  const reward = riskAmount * rr;

  const num = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  const valid = slPips > 0 && (side === 'long' ? sl < entry && tp > entry : sl > entry && tp < entry);

  const results = [
    { k: 'Risque', v: num(riskAmount) + ' €', tone: 'bear' },
    { k: 'Distance SL', v: num(slPips) + ' pips', tone: 'muted' },
    { k: 'Valeur du pip', v: num(pipValuePerLot * lots) + ' €', tone: 'muted' },
    { k: 'Gain potentiel', v: num(reward) + ' €', tone: 'bull' },
  ];

  return (
    <AppShell active="calculateur" crumb="Calculateur de Pips">
      <div className="page-head">
        <span className="eyebrow"><span className="lt-dot" /> Gestion du risque</span>
        <h1>Calculateur de Pips</h1>
        <p>Taille de position, valeur du pip, risque en devise et R:R optimal. Validation automatique du sens, du stop et de la cible.</p>
      </div>

      <div className="calc-grid">
        <div className="panel calc-form">
          <span className="panel__title">Paramètres</span>
          <div className="calc-row">
            <Field label="Capital" suffix="€">
              <input className="calc-input" type="number" value={capital} onChange={(e) => setCapital(+e.target.value || 0)} />
            </Field>
            <Field label="Risque" suffix="%">
              <input className="calc-input" type="number" step="0.1" value={risk} onChange={(e) => setRisk(+e.target.value || 0)} />
            </Field>
          </div>
          <div className="calc-row">
            <Field label="Paire">
              <select className="calc-input" value={pair} onChange={(e) => { setPair(e.target.value); }}>
                {Object.keys(PAIRS).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Sens">
              <div className="calc-seg">
                <button className={side === 'long' ? 'is-on is-long' : ''} onClick={() => setSide('long')}>Long</button>
                <button className={side === 'short' ? 'is-on is-short' : ''} onClick={() => setSide('short')}>Short</button>
              </div>
            </Field>
          </div>
          <div className="calc-row">
            <Field label="Entrée">
              <input className="calc-input" type="number" step={cfg.pip} value={entry} onChange={(e) => setEntry(+e.target.value || 0)} />
            </Field>
            <Field label="Stop loss">
              <input className="calc-input" type="number" step={cfg.pip} value={sl} onChange={(e) => setSl(+e.target.value || 0)} />
            </Field>
            <Field label="Take profit">
              <input className="calc-input" type="number" step={cfg.pip} value={tp} onChange={(e) => setTp(+e.target.value || 0)} />
            </Field>
          </div>
          {!valid && <div className="calc-warn"><Warn /> Vérifie le sens : pour un {side === 'long' ? 'long, SL sous l’entrée et TP au-dessus' : 'short, SL au-dessus de l’entrée et TP en dessous'}.</div>}
        </div>

        <div className="panel calc-out">
          <span className="panel__title">Position recommandée</span>
          <div className="calc-lots">
            <span className="calc-lots__val">{num(lots)}</span>
            <span className="calc-lots__unit">lots</span>
          </div>
          <span className="calc-lots__sub">≈ {num(units)} unités · {pair}</span>
          <div className="calc-rr">
            <span className="calc-rr__label">Ratio R:R</span>
            <span className="calc-rr__val" style={{ color: rr >= 2 ? 'var(--bull)' : rr >= 1 ? 'var(--neutral)' : 'var(--bear)' }}>{num(rr)}</span>
          </div>
          <div className="calc-results">
            {results.map((r) => (
              <div className="calc-result" key={r.k}>
                <span className="calc-result__k">{r.k}</span>
                <span className="calc-result__v" style={{ color: r.tone === 'muted' ? 'var(--text-title)' : `var(--${r.tone})` }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Warn(){return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>;}

window.Calculateur = Calculateur;
