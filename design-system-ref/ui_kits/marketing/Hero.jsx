/* global React */
// Le Terminal — Hero. Cinematic: drifting cold aurora, vignette, film grain,
// descending spotlight halo, dust particles, mouse-follow spotlight.
// Entrance is CSS-driven (see .lt-anim in page.css) so the visible end-state is
// the BASE style — content always shows for thumbnails / reduced-motion / print.

function Hero() {
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const reduced = React.useRef(
    typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const isMobile = React.useRef(typeof window !== 'undefined' && window.innerWidth < 760);

  // Mouse-follow spotlight + 3D parallax (desktop)
  React.useEffect(() => {
    if (reduced.current || isMobile.current) return;
    const stage = stageRef.current; if (!stage) return;
    let raf = 0, tx = 0, ty = 0;
    const apply = () => {
      stage.style.setProperty('--px', tx.toFixed(3));
      stage.style.setProperty('--py', ty.toFixed(3));
      raf = 0;
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      stage.style.setProperty('--mx', nx * 100 + '%');
      stage.style.setProperty('--my', ny * 100 + '%');
      tx = nx - 0.5; ty = ny - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply);
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => { stage.removeEventListener('mousemove', onMove); stage.removeEventListener('mouseleave', onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Dust particles in the beam
  React.useEffect(() => {
    if (reduced.current || isMobile.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, w, h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);
    const dust = Array.from({ length: 50 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3, vy: Math.random() * 0.25 + 0.05,
      vx: (Math.random() - 0.5) * 0.15, a: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of dust) {
        p.y += p.vy; p.x += p.vx;
        if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
        const beam = 1 - Math.min(1, Math.abs(p.x - w / 2) / (w * 0.4)) * (p.y / h);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191,220,245,${p.a * beam * 0.6})`; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const chips = [
    { icon: <GridIcon />, label: '5 outils intégrés', sub: 'Un seul cockpit' },
    { icon: <SparkIcon />, label: "Propulsé par l'IA", sub: 'Analyse & coaching' },
    { icon: <GlobeIcon />, label: 'Tous les marchés', sub: 'Forex · crypto · indices' },
    { icon: <UsersIcon />, label: 'Communauté privée', sub: 'Traders actifs 24/7' },
  ];

  const edgeLights = [0, 1, 2, 3, 4].map((i) => <i key={i} />);

  return (
    <section ref={stageRef} className="lt-hero" style={{ '--mx': '50%', '--my': '0%', '--px': 0, '--py': 0 }}>
      <div className="lt-aurora" />
      <div className="lt-runway" aria-hidden="true">
        <div className="lt-runway__horizon" />
        <div className="lt-runway__floor" />
        <div className="lt-runway__edge lt-runway__edge--l">{edgeLights}</div>
        <div className="lt-runway__edge lt-runway__edge--r">{edgeLights}</div>
      </div>
      <div className="lt-hero__spotlight" />
      <canvas ref={canvasRef} className="lt-hero__dust" />
      <div className="lt-hero__grain" />

      <div className="lt-hero__inner">
        <div className="lt-hero__eyebrow lt-anim lt-anim--1">
          <span className="lt-dot" /> Plateforme active · Mis à jour quotidiennement
        </div>

        <div className="lt-hero__titlewrap">
          <h1 className="lt-hero__title">
            <span className="lt-metal lt-anim lt-anim--2">Le</span>
            <span className="lt-metal lt-anim lt-anim--3">Terminal</span>
          </h1>
        </div>

        <p className="lt-hero__subhead lt-anim lt-anim--4">
          Ton hub trading, <span className="lt-accent-text">propulsé par l'IA.</span>
        </p>

        <p className="lt-hero__lede lt-anim lt-anim--5">
          Analyse tes setups en quelques secondes, tiens ton journal, consulte le
          calendrier éco et maîtrise ta gestion du risque. Tout au même endroit.
        </p>

        <div className="lt-hero__cta lt-anim lt-anim--6">
          <Button variant="primary" size="lg" iconRight={<ArrowIcon />}>Voir les outils</Button>
          <Button variant="ghost" size="lg" icon={<PlayIcon />}>Voir la démo</Button>
        </div>

        <div className="lt-hero__chips lt-anim lt-anim--7">
          {chips.map((c, i) => (
            <div className="lt-chip" key={i}>
              <span className="lt-chip__ic">{c.icon}</span>
              <span className="lt-chip__txt">
                <span className="lt-chip__label">{c.label}</span>
                <span className="lt-chip__sub">{c.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="lt-hero__vignette" />
      <a className="lt-hero__scroll" href="#tools" aria-label="Défiler"><ChevronDown /></a>
    </section>
  );
}

const sIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function ArrowIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" {...sIc} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;}
function PlayIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" {...sIc} strokeWidth="2"><polygon points="6 4 20 12 6 20 6 4"/></svg>;}
function SparkIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>;}
function TargetIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></svg>;}
function GaugeIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><path d="M4 17a8 8 0 0 1 16 0"/><path d="m12 13 4-3"/><circle cx="12" cy="17" r="1"/></svg>;}
function LockIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;}
function GridIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><path d="M16.5 13.5v6M13.5 16.5h6"/></svg>;}
function GlobeIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>;}
function UsersIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" {...sIc}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5S13.8 16 14.5 19"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.7c2.2.2 3.9 1.5 4.5 3.8"/></svg>;}
function ChevronDown(){return <svg width="22" height="22" viewBox="0 0 24 24" {...sIc}><polyline points="6 9 12 15 18 9"/></svg>;}

window.Hero = Hero;
