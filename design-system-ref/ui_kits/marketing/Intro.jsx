/* global React */
// Le Terminal — cinematic boot intro. WOW opening sequence played ONCE per
// session. Safety model: the overlay's BASE state is invisible + non-blocking;
// it is shown ONLY when JS actively triggers it on a visible tab. So thumbnails,
// background tabs, reduced-motion and clone captures never see a black curtain.

function IntroSequence() {
  const [state, setState] = React.useState('idle'); // idle → play → done
  const ref = React.useRef(null);

  React.useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = sessionStorage.getItem('lt_intro_seen') === '1'; } catch (e) {}
    if (reduced || document.hidden || seen) { setState('done'); return; }
    try { sessionStorage.setItem('lt_intro_seen', '1'); } catch (e) {}
    setState('play');
    document.documentElement.style.overflow = 'hidden';
    const total = setTimeout(() => {
      setState('done');
      document.documentElement.style.overflow = '';
    }, 3000);
    return () => { clearTimeout(total); document.documentElement.style.overflow = ''; };
  }, []);

  if (state === 'done') return null;

  return (
    <div ref={ref} className={'lt-intro' + (state === 'play' ? ' is-playing' : '')} aria-hidden="true">
      <div className="lt-intro__grid" />
      <div className="lt-intro__halo" />
      <div className="lt-intro__scan" />
      <div className="lt-intro__core">
        <div className="lt-intro__wordmark">
          <span className="lt-intro__metal">Le Terminal</span>
          <span className="lt-intro__sheen" />
        </div>
        <div className="lt-intro__readout">
          <span className="lt-intro__tag">Initialisation du terminal</span>
          <span className="lt-intro__bar"><span className="lt-intro__fill" /></span>
        </div>
      </div>
      <div className="lt-intro__shutter lt-intro__shutter--top" />
      <div className="lt-intro__shutter lt-intro__shutter--bot" />
    </div>
  );
}

window.IntroSequence = IntroSequence;
