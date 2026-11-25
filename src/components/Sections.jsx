import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Check, Plus, MapPin, Star } from 'lucide-react';
import { BUSINESS, REVIEWS, FAQS, GOOGLE_RATING, GOOGLE_PROFILE_URL } from '../config/business.js';
import { PACKAGES, ADDON } from '../config/services.js';
import { SERVICE_PAGES, CITY_PAGES, HOME_CITY } from '../lib/pages.js';

// Sections shared by the home page and the SEO landing pages.

const OPTIONS = [...PACKAGES, { ...ADDON, isAddon: true }];

/* ─── Link chips to the landing pages ─── */
export function ServiceChips({ exclude, home = false }) {
  return (
    <ul className="chips link-chips">
      {home && (
        <li className="is-home"><Link to="/">Mobile car detailing in {HOME_CITY}</Link></li>
      )}
      {SERVICE_PAGES.filter((p) => p.path !== exclude).map((p) => (
        <li key={p.path}><Link to={p.path}>{p.nav}</Link></li>
      ))}
    </ul>
  );
}

export function AreaChips({ exclude, home = false }) {
  return (
    <ul className="chips link-chips">
      {home && (
        <li className="is-home"><Link to="/#area"><MapPin size={13} /> {HOME_CITY}</Link></li>
      )}
      {CITY_PAGES.filter((p) => p.path !== exclude).map((p) => (
        <li key={p.path}><Link to={p.path}><MapPin size={13} /> {p.city}</Link></li>
      ))}
    </ul>
  );
}

/* ─── Packages: selector + detail panel ─── */
export function Packages({ title = 'Pick your coat.', showLinks = true }) {
  const [activePkg, setActivePkg] = useState('premium');
  const active = OPTIONS.find((o) => o.id === activePkg);
  const bookHref = active.isAddon ? '/book' : `/book?package=${active.id}`;

  return (
    <section id="packages" className="packages">
      <div className="container">
        <div className="section-head section-head--split wipe">
          <div>
            <p className="eyebrow">Packages &amp; pricing</p>
            <h2 className="h2">{title}</h2>
          </div>
          <p className="muted">Flat pricing for sedans, SUVs, trucks and minivans alike. Add the exterior wash to either interior package.</p>
        </div>

        <div className="pkg">
          <div className="pkg__list" role="tablist" aria-label="Packages">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={activePkg === o.id}
                className={`pkg__tab ${activePkg === o.id ? 'is-active' : ''}`}
                onClick={() => setActivePkg(o.id)}
              >
                <span className="pkg__tab-name">
                  {o.name}
                  {o.popular && <em className="pill">Most complete</em>}
                  {o.isAddon && <em className="pill pill--ghost">Add-on</em>}
                </span>
                <span className="pkg__tab-sub">{o.tagline}{o.duration ? ` About ${o.duration}.` : ''}</span>
                <span className="pkg__tab-price">{o.isAddon ? `+$${o.price}` : `$${o.price}`}</span>
              </button>
            ))}
          </div>

          <div className="pkg__panel" role="tabpanel" key={active.id}>
            <div className="pkg__media">
              <img src={active.image} alt={`${active.name} by Dark Coat Car Detailing`} loading="lazy" />
              <div className="pkg__media-label">
                <span>{active.isAddon ? 'Add to either package' : 'Interior package'}</span>
                <strong>{active.name}</strong>
              </div>
              <div className="pkg__price">
                <small>{active.isAddon ? 'add' : 'flat'}</small>
                {active.isAddon ? '+' : ''}${active.price}
              </div>
            </div>
            <div className="pkg__body">
              <p className="pkg__count">{active.features.length} steps included</p>
              <ul className="checklist">
                {active.features.map((f) => (
                  <li key={f}>
                    <span className="checklist__tick"><Check size={14} strokeWidth={3} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              {active.isAddon && (
                <p className="pkg__note">
                  <Plus size={15} /> Choose Basic or Premium first, then add the Exterior Wash in step 2 of booking.
                </p>
              )}
            </div>
          </div>
        </div>

        {showLinks && (
          <div className="pkg-links wipe">
            <p className="eyebrow eyebrow--sm">Compare in detail</p>
            <ServiceChips />
          </div>
        )}

        <div className="pkg__cta">
          <Link to={bookHref} className="btn btn-red btn-lg">
            Book now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews (hidden while REVIEWS is empty) ─── */
export function Reviews() {
  if (!REVIEWS.length) return null;
  return (
    <section id="reviews" className="reviews">
      <div className="container">
        <div className="section-head wipe">
          <p className="eyebrow">Reviews</p>
          <h2 className="h2">What customers say.</h2>
          {GOOGLE_RATING && (
            <p className="muted rev-rating">
              Rated {GOOGLE_RATING.value} out of 5 from {GOOGLE_RATING.count} reviews on{' '}
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">Google</a>.
            </p>
          )}
        </div>
        <div className="rev-grid">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rev rise">
              <span className="stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
              </span>
              <blockquote>{r.text}</blockquote>
              <figcaption>{r.name} · Google review</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ (light) ─── */
export function Faq({ faqs = FAQS, title = 'Good questions.' }) {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <section id="faq" className="faq section--light">
      <div className="container faq__grid">
        <div className="faq__side">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">{title}</h2>
          <div className="faq__card">
            <p>Still wondering about something?</p>
            <a href={BUSINESS.phoneHref} className="btn btn-dark">
              <Phone size={17} /> {BUSINESS.phone}
            </a>
          </div>
        </div>
        <div className="faq__list">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className={`faq__item ${open ? 'is-open' : ''}`}>
                <button type="button" className="faq__q" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}>
                  <span>{f.q}</span>
                  <Plus size={20} className="faq__icon" />
                </button>
                <div className="faq__a">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA: angled red band ─── */
export function Cta({ place }) {
  return (
    <section className="cta">
      <div className="cta__band">
        <div className="container cta__inner">
          <div>
            <p className="eyebrow eyebrow--light">Ready when you are</p>
            <h2 className="cta__title">Give it the Dark Coat treatment{place ? ` in ${place}` : ''}.</h2>
          </div>
          <div className="cta__btns">
            <Link to="/book" className="btn btn-white btn-lg">
              Book Online <ArrowRight size={18} />
            </Link>
            <a href={BUSINESS.phoneHref} className="btn btn-outline-light btn-lg">
              <Phone size={17} /> Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
