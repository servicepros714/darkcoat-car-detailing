import { Link } from 'react-router-dom';
import { Phone, ArrowRight, Check, MapPin } from 'lucide-react';
import { BUSINESS } from '../config/business.js';
import { PACKAGES, ADDON } from '../config/services.js';
import { Packages, Faq, Cta, ServiceChips, AreaChips } from '../components/Sections.jsx';
import useReveal from '../lib/useReveal.js';

// One template for every SEO landing page in src/lib/pages.js.

const basic = PACKAGES.find((p) => p.id === 'basic');
const premium = PACKAGES.find((p) => p.id === 'premium');

// Hero price card: the Premium Detail, or 'combo' = Premium + Exterior Wash.
// The Exterior Wash is never shown as a product on its own.
function PriceCard({ page }) {
  const combo = page.card === 'combo';
  const name = combo ? `${premium.name} + ${ADDON.name}` : premium.name;
  const price = combo ? premium.price + ADDON.price : premium.price;
  const items = combo
    ? ['Everything in the Premium Detail', 'Full Interior Shampooing', 'Cloth & Carpet Extraction', 'Hand-Washed Exterior', 'Detailed Rim Cleaning', 'Spot-Free Hand Drying']
    : premium.features;
  return (
    <aside className="lp-card" aria-label={name}>
      <span className="pill">{combo ? 'Inside & out' : 'Most complete'}</span>
      <h2 className="lp-card__name">{name}</h2>
      <p className="lp-card__sub">Same price for any vehicle. About {premium.duration}.</p>
      <div className="lp-card__price"><small>$</small>{price}</div>
      <ul className="checklist">
        {items.map((f) => (
          <li key={f}>
            <span className="checklist__tick"><Check size={14} strokeWidth={3} /></span>
            {f}
          </li>
        ))}
      </ul>
      <Link className="btn btn-red btn-lg lp-card__btn" to="/book?package=premium">
        Book this detail <ArrowRight size={18} />
      </Link>
      <p className="lp-card__note">
        {combo
          ? `Or the ${basic.name} + wash for $${basic.price + ADDON.price}, or a detail alone from $${basic.price}.`
          : `Or the ${basic.name} for $${basic.price}. Prepay with code PREPAY to save $15.`}
      </p>
    </aside>
  );
}

// Place pages: local areas + map.
function Local({ page }) {
  return (
    <section className="area">
      <div className="container area__grid">
        <div className="area__copy wipe">
          <p className="eyebrow">Service area</p>
          <h2 className="h2">Where we work in {page.city}.</h2>
          <p className="muted">
            We come to homes and workplaces across {page.city}. Not sure about your address? Call{' '}
            <a href={BUSINESS.phoneHref} className="lp-inline">{BUSINESS.phone}</a>.
          </p>
          <ul className="chips">
            {page.areas.map((a) => <li key={a}><MapPin size={13} /> {a.replace(/^the /, '')}</li>)}
          </ul>
        </div>
        <div className="area__map">
          <iframe
            title={`Map of ${page.mapQuery}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(page.mapQuery)}&z=13&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export default function Landing({ page }) {
  useReveal([page.path]);
  const { intro } = page;
  return (
    <div className="home lp">
      <section className="hero lp-hero">
        <div className="container lp-grid">
          <div className="hero__copy">
            <nav className="lp-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.nav}</span>
            </nav>
            <p className="eyebrow eyebrow--line">{page.eyebrow}</p>
            <h1 className="hero__title lp-title">
              {page.h1[0]}{' '}
              <span>{page.h1[1]}</span>
            </h1>
            <p className="hero__lede">{page.lede}</p>
            <div className="hero__ctas">
              <Link to={`/book?package=${page.pkg}`} className="btn btn-red btn-lg">Book Online <ArrowRight size={18} /></Link>
              <a href={BUSINESS.phoneHref} className="btn btn-chrome btn-lg"><Phone size={17} /> {BUSINESS.phone}</a>
            </div>
            <ul className="hero__trust">
              {page.facts.map((f) => <li key={f}><Check size={15} /> {f}</li>)}
            </ul>
          </div>
          <PriceCard page={page} />
        </div>
        <div className="coat-line" aria-hidden="true"><span /></div>
      </section>

      <section className="lp-intro section--light">
        <div className="container lp-intro__grid">
          <div className="wipe">
            <h2 className="h2">{intro.h2}</h2>
            {intro.paras.map((p) => <p key={p} className="lp-p">{p}</p>)}
          </div>
          <figure className="lp-photo rise">
            <img src={page.photo.src} alt={page.photo.alt} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="lp-points">
        <div className="container">
          <div className="section-head wipe">
            <h2 className="h2">{page.pointsTitle}</h2>
          </div>
          <div className="lp-points__grid">
            {page.points.map((pt, i) => (
              <div key={pt.title} className="lp-point rise" style={{ '--i': i }}>
                <h3>{pt.title}</h3>
                <p>{pt.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Packages title="Every price, posted." showLinks={false} />

      {page.isCity && <Local page={page} />}

      <Faq faqs={page.faqs} title={page.isCity ? `${page.city} questions.` : 'Questions, answered.'} />

      <section className="lp-related" aria-label="More from Dark Coat Car Detailing">
        <div className="container">
          <h2 className="lp-related__title">More detailing services</h2>
          <ServiceChips exclude={page.path} home />
          <h2 className="lp-related__title">Areas we serve</h2>
          <AreaChips exclude={page.path} home />
        </div>
      </section>

      <Cta place={page.city} />
    </div>
  );
}
