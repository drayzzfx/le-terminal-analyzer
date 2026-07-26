/* global React */
// Le Terminal — Bubble Map : capital flows as animated bubbles on canvas.
// Size = flow magnitude, colour = direction (bull/bear). Gentle physics,
// hover highlight + tooltip, category filters.

const BUBBLE_ASSETS = [
  { s: 'BTC', cat: 'crypto', flow: 4.2, d: 2.18 }, { s: 'ETH', cat: 'crypto', flow: 2.6, d: 1.04 },
  { s: 'SOL', cat: 'crypto', flow: 1.4, d: -0.33 }, { s: 'XRP', cat: 'crypto', flow: 0.8, d: -1.2 },
  { s: 'DOGE', cat: 'crypto', flow: 0.5, d: 3.4 },
  { s: 'EUR/USD', cat: 'forex', flow: 3.4, d: -0.42 }, { s: 'GBP/USD', cat: 'forex', flow: 1.9, d: 0.18 },
  { s: 'USD/JPY', cat: 'forex', flow: 2.2, d: 0.65 }, { s: 'AUD/USD', cat: 'forex', flow: 0.9, d: -0.51 },
  { s: 'US500', cat: 'indices', flow: 3.8, d: 0.58 }, { s: 'US100', cat: 'indices', flow: 3.1, d: 0.91 },
  { s: 'DAX', cat: 'indices', flow: 1.6, d: -0.27 }, { s: 'NIKKEI', cat: 'indices', flow: 1.2, d: 1.12 },
  { s: 'GOLD', cat: 'matieres', flow: 2.9, d: 0.31 }, { s: 'WTI', cat: 'matieres', flow: 1.8, d: -1.12 },
  { s: 'SILVER', cat: 'matieres', flow: 0.9, d: 0.74 }, { s: 'COPPER', cat: 'matieres', flow: 0.7, d: 1.6 },
];

const BUBBLE_CATS = [
  { key: 'all', label: 'Tous' }, { key: 'crypto', label: 'Crypto' }, { key: 'forex', label: 'Forex' },
  { key: 'indices', label: 'Indices' }, { key: 'matieres', label: 'Mat. premières' },
];

function BubbleMap() {
  const canvasRef = React.useRef(null);
  const [cat, setCat] = React.useState('all');
  const catRef = React.useRef('all');
  catRef.current = cat;

  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    let raf, w, h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);

    const maxFlow = Math.max(...BUBBLE_ASSETS.map((a) => a.flow));
    const bubbles = BUBBLE_ASSETS.map((a) => ({
      ...a,
      r: 26 + (a.flow / maxFlow) * 52,
      x: Math.random() * 600 + 100, y: Math.random() * 300 + 100,
      vx: 0, vy: 0, k: 1, // k = visibility scale (filter)
    }));

    let mouse = { x: -999, y: -999 };
    const onMove = (e) => { const r = c.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onLeave = () => { mouse = { x: -999, y: -999 }; };
    c.addEventListener('mousemove', onMove);
    c.addEventListener('mouseleave', onLeave);

    const step = () => {
      const active = catRef.current;
      for (const b of bubbles) {
        const on = active === 'all' || b.cat === active;
        b.k += ((on ? 1 : 0.12) - b.k) * 0.08;
        // pull to center
        b.vx += (w / 2 - b.x) * 0.0004;
        b.vy += (h / 2 - b.y) * 0.0006;
        // gentle wander
        b.vx += (Math.random() - 0.5) * 0.02;
        b.vy += (Math.random() - 0.5) * 0.02;
      }
      // pairwise repulsion
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i], b = bubbles[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const min = a.r * a.k + b.r * b.k + 6;
          if (dist < min) {
            const f = (min - dist) / dist * 0.04;
            a.vx -= dx * f; a.vy -= dy * f;
            b.vx += dx * f; b.vy += dy * f;
          }
        }
      }
      for (const b of bubbles) {
        b.vx *= 0.92; b.vy *= 0.92;
        b.x += b.vx; b.y += b.vy;
        const m = b.r * b.k + 4;
        b.x = Math.max(m, Math.min(w - m, b.x));
        b.y = Math.max(m, Math.min(h - m, b.y));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // faint grid
      ctx.strokeStyle = 'rgba(59, 125, 255,0.05)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      let hovered = null;
      for (const b of bubbles) {
        const r = b.r * b.k;
        if (r < 2) continue;
        const up = b.d >= 0;
        const isHover = Math.hypot(mouse.x - b.x, mouse.y - b.y) < r;
        if (isHover && b.k > 0.7) hovered = b;
        const col = up ? '74,222,156' : '240,100,122';
        const grad = ctx.createRadialGradient(b.x, b.y, r * 0.2, b.x, b.y, r);
        grad.addColorStop(0, `rgba(${col},${0.16 * b.k})`);
        grad.addColorStop(1, `rgba(${col},${0.04 * b.k})`);
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.lineWidth = isHover ? 2 : 1.2;
        ctx.strokeStyle = `rgba(${col},${(isHover ? 0.95 : 0.55) * b.k})`;
        if (isHover) { ctx.shadowColor = `rgba(${col},0.6)`; ctx.shadowBlur = 18; }
        ctx.stroke(); ctx.shadowBlur = 0;
        if (b.k > 0.5) {
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(242,244,247,${0.95 * b.k})`;
          ctx.font = `600 ${Math.max(10, r * 0.3)}px Inter, sans-serif`;
          ctx.fillText(b.s, b.x, b.y - 2);
          ctx.fillStyle = `rgba(${col},${0.95 * b.k})`;
          ctx.font = `500 ${Math.max(9, r * 0.22)}px "JetBrains Mono", monospace`;
          ctx.fillText(`${up ? '▲' : '▼'} ${Math.abs(b.d).toFixed(2)}%`, b.x, b.y + r * 0.3);
        }
      }
      // hover tooltip
      if (hovered) {
        const label = `${hovered.s} · flux ${hovered.flow.toFixed(1)} Md$ · ${hovered.d >= 0 ? '+' : '−'}${Math.abs(hovered.d).toFixed(2)}% 24h`;
        ctx.font = '500 12px "JetBrains Mono", monospace';
        const tw = ctx.measureText(label).width + 24;
        const tx = Math.min(Math.max(hovered.x - tw / 2, 10), w - tw - 10);
        const ty = Math.max(12, hovered.y - hovered.r - 44);
        ctx.fillStyle = 'rgba(10,13,18,0.95)';
        ctx.strokeStyle = 'rgba(58,65,76,1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(tx, ty, tw, 30, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#F2F4F7'; ctx.textAlign = 'left';
        ctx.fillText(label, tx + 12, ty + 19);
      }
    };

    if (reduced) {
      for (let i = 0; i < 260; i++) step();
      draw();
    } else {
      const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };
      loop();
    }
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', resize); c.removeEventListener('mousemove', onMove); c.removeEventListener('mouseleave', onLeave); };
  }, []);

  const inflow = BUBBLE_ASSETS.filter((a) => a.d >= 0).reduce((s, a) => s + a.flow, 0);
  const outflow = BUBBLE_ASSETS.filter((a) => a.d < 0).reduce((s, a) => s + a.flow, 0);

  return (
    <AppShell active="bubble" crumb="Bubble Map">
      <div className="page-head">
        <span className="eyebrow"><span className="lt-dot" /> Flux de capitaux</span>
        <h1>Bubble Map</h1>
        <p>Les flux de capitaux entre actifs en temps réel. Taille = volume du flux, couleur = direction sur 24 h. Survole une bulle pour le détail.</p>
      </div>

      <div className="bm-bar">
        <div className="bm-filters">
          {BUBBLE_CATS.map((cc) => (
            <button key={cc.key} className={'bm-filter' + (cat === cc.key ? ' is-on' : '')} onClick={() => setCat(cc.key)}>{cc.label}</button>
          ))}
        </div>
        <div className="bm-legend">
          <span className="bm-legend__item"><i style={{ background: 'var(--bull)' }} /> Entrées {inflow.toFixed(1)} Md$</span>
          <span className="bm-legend__item"><i style={{ background: 'var(--bear)' }} /> Sorties {outflow.toFixed(1)} Md$</span>
        </div>
      </div>

      <div className="bm-stage panel">
        <canvas ref={canvasRef} className="bm-canvas" />
        <span className="bm-tag">DONNÉES SIMULÉES · MISE À JOUR CONTINUE</span>
      </div>
    </AppShell>
  );
}

window.BubbleMap = BubbleMap;
