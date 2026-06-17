/* global React, AppShell, Badge */
// Le Terminal — Calendrier Éco · Présentation. Same content as the client's
// draft, fully restyled in the brand's cinematic-luxury system.

const PR_FEATURES = [
  { icon: 'rss', title: 'Agrégation automatique', desc: 'Les flux RSS des médias et institutions sont récupérés, nettoyés, dédupliqués et triés par fraîcheur.' },
  { icon: 'bookmark', title: 'Sélection éditoriale', desc: 'Une rubrique « La sélection » met en avant les analyses choisies à la main pour la journée.' },
  { icon: 'layers', title: 'Classé par zones', desc: 'Europe, Amériques, France, Institutions, Asie… plus un fil Flash des dernières minutes.' },
  { icon: 'clock', title: 'Régénéré chaque matin', desc: "Édition publiée et archivée chaque jour : du plus chaud au plus utile, en une seule page." },
];

const PR_SELECTION = [
  { time: '14:34', title: 'Les médicaments antiobésité Wegovy et Mounjaro seront remboursés en France', excerpt: "Ils seront pris en charge à 65 % par l'Assurance-maladie pour les patients atteints d'obésité massive…" },
  { time: '14:30', title: '« Dans la nouvelle 2 CV E-Car, la dimension de lutte contre le déclin industriel »', excerpt: "L'économiste Christian Le Bas estime, dans une tribune au « Monde », que le projet annoncé par le groupe…" },
  { time: '11:00', title: 'Le salon de la défense Eurosatory attend une affluence record', excerpt: "L'événement, qui se tient du lundi 15 au vendredi 19 juin à Villepinte, accueille 2 600 exposants, 30 % de plus…" },
  { time: '06:30', title: "Branko Milanovic, économiste : « Il n'y aura pas de retour à l'idéologie dominante »", excerpt: 'Choc asiatique, déclin occidental et avènement du national-libéralisme : le spécialiste des inégalités…' },
  { time: '06:00', title: 'Bourse : pourquoi les marchés financiers résistent au choc de la guerre au Moyen-Orient', excerpt: "Si les marchés obligataires ont été chahutés, la Bourse affiche une résilience insolente depuis le début du…" },
  { time: '05:45', title: 'Entre Paris et Orléans, ces villages orphelins de l\u2019aérotrain', excerpt: 'Dans la Petite Beauce, le monorail sillonne 18 km de terres agricoles et nourrit la nostalgie de la splendeur…' },
];

const PR_BENEFITS = [
  { icon: 'clock', title: 'Vous gagnez du temps', desc: "Une seule page à ouvrir au lieu de courir entre dix sites. L'essentiel se lit en quelques minutes." },
  { icon: 'layers', title: "Vous voyez l'ensemble", desc: "Europe, Amériques, France, Asie… Les nouvelles sont rangées par zone pour saisir la tendance d'un coup d'œil." },
  { icon: 'target', title: "Vous allez à l'important", desc: 'Le fil « Flash » remonte les dernières minutes, et « La sélection » met en avant les analyses qui comptent.' },
  { icon: 'shield', title: 'Vous gardez confiance', desc: "Chaque annonce mène à l'article d'origine, toujours crédité. Vous lisez la vraie source, jamais une copie." },
];

const PR_STEPS = [
  { n: '01', title: 'On rassemble', desc: 'Le site récupère automatiquement les flux des médias et institutions suivis, puis nettoie chaque annonce.' },
  { n: '02', title: 'On trie', desc: 'Doublons écartés, annonces trop anciennes retirées, le reste classé par fraîcheur et par zone.' },
  { n: '03', title: 'Vous lisez', desc: "L'édition est publiée, mise en avant et archivée chaque jour. Vous parcourez, vous cliquez, vous lisez la source." },
];

const prIc = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function PrIcon({ name, size = 22 }) {
  const p = {
    rss: <><path d="M5 18a1 1 0 1 0 0 .01M4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15"/></>,
    bookmark: <><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></>,
    shield: <><path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  }[name];
  return <svg width={size} height={size} viewBox="0 0 24 24" {...prIc}>{p}</svg>;
}

function HeroChart() {
  // area path + line over a 480x200 viewbox
  const line = 'M0,150 C60,140 90,120 140,118 C190,116 210,96 260,86 C310,76 330,52 380,46 C420,41 450,30 480,24';
  const area = line + ' L480,200 L0,200 Z';
  const candles = [
    { x: 132, y: 100, h: 30, up: 1 }, { x: 252, y: 74, h: 26, up: 0 },
    { x: 372, y: 40, h: 24, up: 1 }, { x: 446, y: 22, h: 20, up: 1 },
  ];
  return (
    <div className="pr-chart">
      <svg className="pr-chart__svg" viewBox="0 0 480 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="prFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(127,184,232,0.35)" />
            <stop offset="1" stopColor="rgba(127,184,232,0)" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="rgba(58,65,76,0.35)" strokeWidth="1" />)}
        <path d={area} fill="url(#prFill)" />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px var(--accent-glow))' }} />
        {candles.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width="7" height={c.h} rx="1"
            fill={c.up ? 'rgba(74,222,156,0.85)' : 'rgba(240,100,122,0.8)'} />
        ))}
        <circle cx="480" cy="24" r="4" fill="var(--accent-bright)" />
      </svg>
      <div className="pr-chart__tags">
        <span className="pr-chart__tag is-up"><PrIcon name="arrow" size={12} /> Marchés</span>
        <span className="pr-chart__tag">EUR · USD</span>
        <span className="pr-chart__tag is-live"><span className="lt-dot" /> Live</span>
      </div>
    </div>
  );
}

function CalendrierPresentation() {
  return (
    <AppShell active="calendrier" sub="presentation" crumb="Calendrier Éco · Présentation">
      <div className="pr">

        {/* HERO */}
        <section className="pr-hero">
          <div className="pr-hero__halo" />
          <div className="pr-hero__txt">
            <span className="pr-eyebrow"><span className="lt-dot" /> Revue de presse économique · Quotidienne</span>
            <h1 className="pr-hero__title">Toute l'éco du jour,<br /><span className="pr-metal">en un coup d'œil.</span></h1>
            <p className="pr-hero__lede"><b>Le Terminal Économies</b> rassemble chaque matin l'essentiel de l'actualité économique : les flux des grands médias et institutions sont agrégés automatiquement, triés et datés, puis complétés par une sélection éditoriale. Un seul écran, du plus chaud au plus utile.</p>
            <div className="pr-chips">
              <span className="pr-chip"><PrIcon name="rss" size={15} /> Agrégation RSS</span>
              <span className="pr-chip"><PrIcon name="globe" size={15} /> Couverture mondiale</span>
              <span className="pr-chip"><PrIcon name="target" size={15} /> Fil Flash en direct</span>
              <span className="pr-chip"><PrIcon name="shield" size={15} /> Sources créditées</span>
            </div>
            <div className="pr-hero__cta">
              <Button variant="primary" iconRight={<PrIcon name="arrow" size={16} />}>Lire la une</Button>
              <Button variant="secondary">Fil Flash</Button>
            </div>
            <div className="pr-hero__stats">
              <div className="pr-hero__stat"><b>26</b><span>sources</span></div>
              <div className="pr-hero__stat"><b>6</b><span>zones</span></div>
              <div className="pr-hero__stat"><b>24</b><span>annonces</span></div>
            </div>
          </div>
          <HeroChart />
        </section>

        {/* FEATURES */}
        <section>
          <div className="pr-feats">
            {PR_FEATURES.map((f) => (
              <article className="pr-feat" key={f.title}>
                <span className="pr-feat__ic"><PrIcon name={f.icon} /></span>
                <h3 className="pr-feat__title">{f.title}</h3>
                <p className="pr-feat__desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ÉDITION — featured à la une */}
        <section className="pr-edition" id="edition">
          <div className="pr-edition__bar">
            <span className="pr-edition__dots"><i style={{ background: '#F0647A' }} /><i style={{ background: '#E8C268' }} /><i style={{ background: '#4ADE9C' }} /></span>
            <span className="pr-edition__name">Éco · Édition</span>
            <span className="pr-edition__live"><Badge tone="accent" dot>Live</Badge></span>
          </div>
          <div className="pr-edition__body">
            <div>
              <div className="pr-edition__meta">
                <span className="pr-edition__kicker">À la une</span>
                <span className="pr-edition__src">Le Monde Économie</span>
                <Badge tone="neutral">Neutre</Badge>
                <span className="pr-edition__time">17:00</span>
              </div>
              <h2 className="pr-edition__title">Marché du timbre : la cote s'envole pour les pièces rares</h2>
              <p className="pr-edition__excerpt">Porté par une demande de collectionneurs en quête de valeurs refuges, le segment haut de gamme affiche des records en salle des ventes — un signal discret de la fuite vers les actifs tangibles.</p>
            </div>
            <Button variant="primary" iconRight={<PrIcon name="arrow" size={16} />}>Lire le résumé</Button>
          </div>
        </section>

        {/* LA SÉLECTION */}
        <section className="pr-sel">
          <div className="pr-head">
            <span className="pr-eyebrow"><span className="lt-dot" /> La sélection · 6 annonces · sélection automatique</span>
            <h2 className="pr-head__title">Ce qui mérite votre attention</h2>
          </div>
          <div className="pr-sel__grid">
            {PR_SELECTION.map((a) => (
              <article className="pr-art" key={a.time}>
                <div className="pr-art__top">
                  <span className="pr-art__cat">ÉCO</span>
                  <span className="pr-art__src">Le Monde Économie</span>
                  <span className="pr-art__time">{a.time}</span>
                </div>
                <h3 className="pr-art__title">{a.title}</h3>
                <p className="pr-art__excerpt">{a.excerpt}</p>
                <a className="pr-art__link" href="#">Lire le résumé <PrIcon name="arrow" size={13} /></a>
              </article>
            ))}
          </div>
        </section>

        {/* MISSION */}
        <section className="pr-mission">
          <div>
            <div className="pr-head">
              <span className="pr-eyebrow"><span className="lt-dot" /> À propos · Notre mission</span>
              <h2 className="pr-head__title">Remettre de l'ordre dans le flot de l'info éco</h2>
            </div>
            <div className="pr-mission__prose">
              <p className="pr-lead">On a tous vécu ça : on veut juste savoir « ce qui se passe » en économie, et on se retrouve avec quinze onglets ouverts, des titres alarmistes, des articles qui se répètent et d'autres qu'on a déjà lus la veille. L'information est partout… mais le temps, lui, manque toujours.</p>
              <p>Le Terminal Économies part d'une idée simple : <b>vous n'avez pas besoin de plus d'articles, vous avez besoin d'une vue d'ensemble.</b> Le site va chercher les publications là où elles paraissent (les flux officiels des médias et institutions), retire les doublons, garde les plus récentes, et les range par grandes zones du monde. Au-dessus, une courte sélection éditoriale pointe ce qui mérite vraiment votre attention.</p>
              <p>Résultat : une page unique, sobre et rapide, que l'on parcourt le matin avec son café. Pas de compte à créer, pas de publicité, pas de mur payant — juste l'essentiel, daté et toujours relié à sa source d'origine.</p>
            </div>
          </div>
          <div className="pr-benefits">
            {PR_BENEFITS.map((b) => (
              <div className="pr-benefit" key={b.title}>
                <span className="pr-benefit__ic"><PrIcon name={b.icon} size={18} /></span>
                <div>
                  <h4>{b.title}</h4>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EN PRATIQUE */}
        <section className="pr-steps">
          <div className="pr-head">
            <span className="pr-eyebrow"><span className="lt-dot" /> En pratique</span>
            <h2 className="pr-head__title">Comment l'édition du jour est fabriquée</h2>
          </div>
          <div className="pr-steps__grid">
            {PR_STEPS.map((s) => (
              <article className="pr-step" key={s.n}>
                <span className="pr-step__n">{s.n}</span>
                <span className="pr-step__line" />
                <h3 className="pr-step__title">{s.title}</h3>
                <p className="pr-step__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* QUOTE */}
        <section className="pr-quote">
          <span className="pr-quote__mark">“</span>
          <p className="pr-quote__txt pr-metal">Être bien informé, ce n'est pas tout lire. C'est lire ce qu'il faut, au bon moment, et savoir d'où ça vient.</p>
          <span className="pr-quote__by">— L'esprit du Terminal Économies</span>
        </section>

      </div>
    </AppShell>
  );
}

window.CalendrierPresentation = CalendrierPresentation;
