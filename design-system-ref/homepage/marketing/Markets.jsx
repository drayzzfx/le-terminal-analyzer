/* global React */
// Le Terminal — "Tous les marchés" : dual-row marquee of glowing asset tiles
// drifting over a living particle field. Inspired by the reference reels
// (gaming/app carousels over a galaxy), restyled in glacial brand.

function ParticleField() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, w, h, parts = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const build = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = w < 760 ? 36 : 80;
      parts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.5 + 0.15,
        bright: Math.random() > 0.85,
      }));
    };
    build(); window.addEventListener('resize', build);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.bright) {
          ctx.fillStyle = `rgba(191,220,245,${p.a})`;
          ctx.shadowColor = 'rgba(127,184,232,0.8)'; ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(127,184,232,${p.a * 0.6})`; ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    if (!reduced) draw(); else { build(); ctx.clearRect(0,0,w,h); }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', build); };
  }, []);
  return <canvas ref={ref} className="lt-mk__field" aria-hidden="true" />;
}

function Spark({ up }) {
  const pts = up ? '0,14 8,11 16,12 24,7 32,8 40,3 48,2' : '0,3 8,6 16,5 24,9 32,8 40,12 48,13';
  const col = up ? 'var(--bull)' : 'var(--bear)';
  return (
    <svg className="lt-mk__spark" viewBox="0 0 48 16" fill="none" preserveAspectRatio="none">
      <polyline points={pts} stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tile({ sym, px, d, up, kind }) {
  return (
    <div className={'lt-mk__tile lt-mk__tile--' + kind}>
      <span className="lt-mk__dot" data-up={up ? '1' : '0'} />
      <span className="lt-mk__sym">{sym}</span>
      <span className="lt-mk__px">{px}</span>
      <Spark up={up} />
      <span className={'lt-mk__d ' + (up ? 'lt-up' : 'lt-down')}>{up ? '▲' : '▼'} {d}</span>
    </div>
  );
}

const ROW1 = [
  { sym: 'BTC/USD', px: '68 412', d: '2.18%', up: true, kind: 'crypto' },
  { sym: 'ETH/USD', px: '3 642', d: '1.04%', up: true, kind: 'crypto' },
  { sym: 'SOL/USD', px: '168.8', d: '0.24%', up: true, kind: 'crypto' },
  { sym: 'EUR/USD', px: '1.0847', d: '0.42%', up: false, kind: 'fx' },
  { sym: 'GBP/USD', px: '1.2751', d: '0.13%', up: false, kind: 'fx' },
  { sym: 'USD/JPY', px: '157.21', d: '0.36%', up: true, kind: 'fx' },
  { sym: 'GOLD', px: '2 384', d: '0.31%', up: true, kind: 'comm' },
];
const ROW2 = [
  { sym: 'US100', px: '19 847', d: '1.04%', up: true, kind: 'idx' },
  { sym: 'US500', px: '5 487', d: '0.58%', up: true, kind: 'idx' },
  { sym: 'GER40', px: '18 412', d: '0.22%', up: false, kind: 'idx' },
  { sym: 'WTI', px: '78.42', d: '1.12%', up: false, kind: 'comm' },
  { sym: 'AAPL', px: '214.1', d: '0.07%', up: true, kind: 'eq' },
  { sym: 'NVDA', px: '1 204', d: '3.77%', up: true, kind: 'eq' },
  { sym: 'TSLA', px: '178.1', d: '0.15%', up: false, kind: 'eq' },
];

function MarketsSection() {
  const dup = (a) => [...a, ...a];
  return (
    <section className="lt-mk" data-reveal>
      <ParticleField />
      <div className="lt-mk__head">
        <span className="lt-eyebrow"><span className="lt-dot" /> Couverture mondiale</span>
        <h2 className="lt-mk__title">Tous les marchés,<br /><span className="lt-metal">un seul terminal.</span></h2>
        <p className="lt-mk__lede">Forex, crypto, indices, actions et matières premières — suivis, analysés et reliés à tes outils. Le marché entier, sous un même toit.</p>
      </div>

      <div className="lt-mk__rails">
        <div className="lt-mk__rail">
          <div className="lt-mk__track lt-mk__track--l">
            {dup(ROW1).map((t, i) => <Tile key={i} {...t} />)}
          </div>
        </div>
        <div className="lt-mk__rail">
          <div className="lt-mk__track lt-mk__track--r">
            {dup(ROW2).map((t, i) => <Tile key={i} {...t} />)}
          </div>
        </div>
        <div className="lt-mk__fade lt-mk__fade--l" />
        <div className="lt-mk__fade lt-mk__fade--r" />
      </div>
    </section>
  );
}

window.MarketsSection = MarketsSection;
