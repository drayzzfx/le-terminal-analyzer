/* global React */
// Le Terminal — Tarifs : free vs PRO plans. PricingBand = compact homepage
// section; PricingPage = full standalone page (toggle, comparison, FAQ).

const LT_PLANS = {
  free: {
    name: 'Découverte',
    tag: 'Pour commencer',
    m: 0, y: 0,
    cta: 'Créer un compte',
    feats: [
      '3 analyses Setup Analyzer / mois',
      'Journal limité à 20 trades / mois',
      'Calendrier économique complet',
      'Calculateur de pips',
      'Bubble Map en temps réel',
      '1 compte de trading',
    ],
  },
  pro: {
    name: 'PRO',
    tag: 'Tous les outils, sans limite',
    m: 29, y: 19,
    cta: 'Passer en PRO',
    feats: [
      'Analyses Setup Analyzer illimitées',
      'Journal illimité + IA Coach',
      'Alertes macro (NFP · CPI · FOMC)',
      "Jusqu'à 5 comptes de trading",
      'Exports PDF & CSV',
      'Communauté privée Telegram',
      'Support prioritaire',
      'Accès anticipé aux nouveaux outils',
    ],
  },
};

function PlanCard({ plan, pro, annual, compact }) {
  const price = annual ? plan.y : plan.m;
  return (
    <div className={'pr-card' + (pro ? ' is-pro' : '')}>
      {pro && <span className="pr-card__flag">Recommandé</span>}
      <div className="pr-card__head">
        <span className="pr-card__name">{plan.name}</span>
        <span className="pr-card__tag">{plan.tag}</span>
      </div>
      <div className="pr-card__price">
        <span className="pr-card__amount">{price} €</span>
        <span className="pr-card__per">/ mois{pro && annual ? ' · facturé 228 € / an' : ''}</span>
      </div>
      {pro && annual && <span className="pr-card__save">Économise 34 % par rapport au mensuel</span>}
      {pro && !annual && <span className="pr-card__save pr-card__save--mute">Ou 19 € / mois en annuel</span>}
      <ul className="pr-card__feats">
        {plan.feats.slice(0, compact ? 5 : 99).map((f, i) => (
          <li key={i}><CheckIc pro={pro} /> {f}</li>
        ))}
      </ul>
      <div className="pr-card__cta">
        <Button variant={pro ? 'primary' : 'secondary'} size="lg" style={{ width: '100%' }}>{plan.cta}</Button>
      </div>
      {pro && <span className="pr-card__note">Garantie 14 jours satisfait ou remboursé</span>}
    </div>
  );
}

/* — Homepage compact band — */
function PricingBand() {
  return (
    <section className="pr-band" id="pricing" data-reveal>
      <div className="pr-band__head">
        <span className="lt-eyebrow"><span className="lt-dot" /> Tarifs</span>
        <h2 className="pr-band__title">Choisis ton plan</h2>
        <p className="pr-band__lede">Commence gratuitement. Passe en PRO quand tu veux toute la puissance.</p>
      </div>
      <div className="pr-grid pr-grid--band">
        <PlanCard plan={LT_PLANS.free} annual={true} compact />
        <PlanCard plan={LT_PLANS.pro} pro annual={true} compact />
      </div>
      <div className="pr-band__more">
        <a className="pr-band__link" href="pricing.html">Voir le détail des plans
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </section>
  );
}

/* — Full pricing page — */
const PR_COMPARE = [
  { group: 'Setup Analyzer', rows: [
    ['Analyses IA par mois', '3', 'Illimitées'],
    ['Annotations sur graphique', true, true],
    ['Verdict GO / ATTENDRE / NO-GO', true, true],
    ['Rapport PDF par analyse', false, true],
  ]},
  { group: 'Journal de Trading', rows: [
    ['Trades par mois', '20', 'Illimités'],
    ['Calendrier P&L & statistiques', true, true],
    ['IA Coach (analyse de tes patterns)', false, true],
    ['Comptes de trading', '1', '5'],
    ['Export PDF / CSV', false, true],
  ]},
  { group: 'Macro & Marchés', rows: [
    ['Calendrier économique', true, true],
    ['Alertes avant événements à fort impact', false, true],
    ['Bubble Map temps réel', true, true],
    ['Historique des flux (30 jours)', false, true],
  ]},
  { group: 'Services', rows: [
    ['Calculateur de pips', true, true],
    ['Communauté privée Telegram', false, true],
    ['Support', 'Standard', 'Prioritaire'],
    ['Accès anticipé aux nouveaux outils', false, true],
  ]},
];

const PR_FAQ = [
  { q: 'Puis-je vraiment utiliser Le Terminal gratuitement ?',
    a: "Oui. Le plan Découverte est gratuit pour toujours — pas de carte bancaire demandée. Tu as accès aux cinq outils avec des limites mensuelles, de quoi te faire un avis réel avant de passer en PRO." },
  { q: 'Comment fonctionne la garantie 14 jours ?',
    a: "Si PRO ne te convient pas, écris-nous dans les 14 jours suivant ton paiement : remboursement intégral, sans question. La plupart des plateformes équivalentes ne remboursent pas — nous, si." },
  { q: 'Puis-je changer de plan ou annuler à tout moment ?',
    a: "Oui. Le passage Découverte → PRO est immédiat. L'annulation se fait en deux clics depuis ton compte : tu gardes l'accès PRO jusqu'à la fin de la période payée, puis tu repasses automatiquement en Découverte. Tes données sont conservées." },
  { q: 'Quels moyens de paiement acceptez-vous ?',
    a: "Carte bancaire (Visa, Mastercard, Amex) et PayPal. Le paiement est sécurisé et la facturation s'arrête dès l'annulation." },
  { q: "L'abonnement PRO est-il adapté aux traders prop firm ?",
    a: "Oui — c'est même notre cœur d'utilisateurs. Multi-comptes (jusqu'à 5 challenges en parallèle), journal illimité et alertes macro avant les annonces à fort impact : tout est pensé pour la gestion de challenges." },
];

function PricingPage() {
  const [annual, setAnnual] = React.useState(true);
  const [openFaq, setOpenFaq] = React.useState(0);

  return (
    <React.Fragment>
      <GlobalHeader />
      <SideDock active="home" />

      <section className="pr-hero">
        <div className="pr-hero__halo" aria-hidden="true" />
        <span className="lt-eyebrow"><span className="lt-dot" /> Tarifs simples, sans surprise</span>
        <h1 className="pr-hero__title"><span className="lt-metal">Passe en PRO</span></h1>
        <p className="pr-hero__lede">
          Commence gratuitement, sans carte bancaire. Quand tes analyses deviennent
          quotidiennes, PRO enlève toutes les limites — pour le prix d'un seul mauvais trade évité.
        </p>
        <div className="pr-toggle" role="group" aria-label="Période de facturation">
          <button className={'pr-toggle__opt' + (!annual ? ' is-on' : '')} onClick={() => setAnnual(false)}>Mensuel</button>
          <button className={'pr-toggle__opt' + (annual ? ' is-on' : '')} onClick={() => setAnnual(true)}>Annuel <em>−34 %</em></button>
        </div>
      </section>

      <section className="pr-plans">
        <div className="pr-grid">
          <PlanCard plan={LT_PLANS.free} annual={annual} />
          <PlanCard plan={LT_PLANS.pro} pro annual={annual} />
        </div>
      </section>

      <section className="pr-why" data-reveal>
        <div className="pr-why__item">
          <span className="pr-why__n">01</span>
          <h3>Un seul abonnement, cinq outils</h3>
          <p>Analyse de setups, journal, calendrier macro, flux de capitaux et calculateur — ailleurs, c'est trois abonnements séparés. Ici, un seul cockpit.</p>
        </div>
        <div className="pr-why__item">
          <span className="pr-why__n">02</span>
          <h3>L'IA qui connaît ta stratégie</h3>
          <p>ICT, SMC, price action — le moteur s'adapte à ta méthode et apprend de ton historique. Le plan PRO débloque l'analyse comportementale complète.</p>
        </div>
        <div className="pr-why__item">
          <span className="pr-why__n">03</span>
          <h3>Sans engagement, vraiment</h3>
          <p>Plan gratuit à vie, annulation en deux clics et garantie 14 jours remboursé. Tu ne paies que tant que ça te fait progresser.</p>
        </div>
      </section>

      <section className="pr-compare" data-reveal>
        <h2 className="pr-compare__title">Comparer en détail</h2>
        <div className="pr-table">
          <div className="pr-table__row pr-table__row--head">
            <span></span><span>Découverte</span><span className="pr-table__pro">PRO</span>
          </div>
          {PR_COMPARE.map((g) => (
            <React.Fragment key={g.group}>
              <div className="pr-table__group">{g.group}</div>
              {g.rows.map((r, i) => (
                <div className="pr-table__row" key={i}>
                  <span className="pr-table__feat">{r[0]}</span>
                  <span className="pr-table__cell">{r[1] === true ? <CheckIc /> : r[1] === false ? <DashIc /> : r[1]}</span>
                  <span className="pr-table__cell pr-table__pro">{r[2] === true ? <CheckIc pro /> : r[2] === false ? <DashIc /> : r[2]}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="pr-faq" data-reveal>
        <h2 className="pr-faq__title">Questions fréquentes</h2>
        <div className="pr-faq__list">
          {PR_FAQ.map((f, i) => (
            <div className={'pr-faq__item' + (openFaq === i ? ' is-open' : '')} key={i}>
              <button className="pr-faq__q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                {f.q}
                <span className="pr-faq__chev">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              <div className="pr-faq__a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="pr-final" data-reveal>
        <h2 className="pr-final__title"><span className="lt-metal">Prêt à décoller ?</span></h2>
        <p className="pr-final__lede">Crée ton compte gratuit en 30 secondes. Aucun engagement.</p>
        <div className="pr-final__cta">
          <Button variant="primary" size="lg">Créer un compte gratuit</Button>
          <Button variant="ghost" size="lg">Passer en PRO</Button>
        </div>
      </section>

      <Footer />
    </React.Fragment>
  );
}

function CheckIc({ pro }) {
  return (
    <svg className="pr-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={pro ? 'var(--accent)' : 'var(--bull)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
}
function DashIc() {
  return <span className="pr-dash">—</span>;
}

Object.assign(window, { PricingBand, PricingPage });
