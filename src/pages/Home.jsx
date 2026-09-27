import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Clock,
  BadgePercent,
  Star,
  MapPin,
  Plus,
  Quote,
} from 'lucide-react';
import { BUSINESS, REVIEWS, FAQS } from '../config/business.js';
import { PACKAGES, ADDON } from '../config/services.js';
import useReveal from '../lib/useReveal.js';

const GALLERY = [
  { src: '/images/blue-gt.webp', caption: 'Snow foam pre-soak', tag: 'Exterior' },
  { src: '/images/red-headlight.webp', caption: 'Foam dwell on paint & lights', tag: 'Exterior' },
  { src: '/images/black-rinse.webp', caption: 'Pressure rinse & wheel clean', tag: 'Wheels' },
  { src: '/images/red-side-garage.webp', caption: 'Panel-by-panel hand wash', tag: 'Exterior' },
  { src: '/images/engine-foam.webp', caption: 'Brush work in tight areas', tag: 'Detail' },
  { src: '/images/rear-foam.webp', caption: 'Soft mitt, no swirls', tag: 'Paint care' },
  { src: '/images/red-hood-foam.webp', caption: 'Full-coverage foam coat', tag: 'Exterior' },
];

const LAYERS = [
  {
    n: '01',
    title: 'Lift',
    text: 'Triple-stage vacuuming, extraction and degreasing pull out the sand, crumbs and grime that live deep in your car.',
  },
  {
    n: '02',
    title: 'Restore',
    text: 'Shampoo, surface wipe-downs and streak-free glass bring every panel, mat and seat back to a clean, even finish.',
  },
  {
    n: '03',
    title: 'Protect',
    text: 'A UV-protectant coating and premium tire shine seal the work in so the clean lasts past the first beach day.',
  },
];

const OPTIONS = [...PACKAGES, { ...ADDON, isAddon: true }];

function Stars({ size = 16 }) {
  return (
    <span className="stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export default function Home() {
  useReveal([]);

  // Package selector
  const [activePkg, setActivePkg] = useState('premium');
  const active = OPTIONS.find((o) => o.id === activePkg);
  const bookHref = active.isAddon ? '/book' : `/book?package=${active.id}`;

  // Gallery film strip
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const thumbsRef = useRef(null);
  const go = (dir) => setSlide((s) => (s + dir + GALLERY.length) % GALLERY.length);

  useEffect(() => {
    if (paused) return undefined;
    const t = setTimeout(() => go(1), 5000);
    return () => clearTimeout(t);
  }, [slide, paused]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[slide];
    if (strip && thumb) {
      strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: 'smooth' });
    }
  }, [slide]);

  // Reviews
  const [review, setReview] = useState(0);
  const nextReview = (dir) => setReview((r) => (r + dir + REVIEWS.length) % REVIEWS.length);

  // FAQ
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="home">
      {/* ───────────── HERO: copy + triptych slats ───────────── */}
      <section id="hero" className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--line">Mobile detailing · {BUSINESS.city}</p>
            <h1 className="hero__title">
              Showroom depth.
              <span>Driveway convenience.</span>
            </h1>
            <p className="hero__lede">
              Dark Coat brings deep interior detailing and hand exterior washes to your home or office — booked online in about a minute.
            </p>
            <div className="hero__ctas">
              <Link to="/book" className="btn btn-red btn-lg">
                Book Online <ArrowRight size={18} />
              </Link>
              <a href={BUSINESS.phoneHref} className="btn btn-chrome btn-lg">
                <Phone size={17} /> {BUSINESS.phone}
              </a>
            </div>
            <ul className="hero__trust">
              <li><Check size={15} /> Fully mobile</li>
              <li><Check size={15} /> Pay online or later</li>
              <li><Check size={15} /> 7 days a week</li>
            </ul>
          </div>

          <div className="hero__slats" aria-hidden="true">
            <div className="slat slat--1"><img src="/images/red-headlight.webp" alt="" /></div>
            <div className="slat slat--2"><img src="/images/blue-gt.webp" alt="" /></div>
            <div className="slat slat--3"><img src="/images/black-rinse.webp" alt="" /></div>
            <div className="hero__chip">
              <span>Interior details from</span>
              <strong>$150</strong>
            </div>
          </div>
        </div>
        <div className="coat-line" aria-hidden="true"><span /></div>
      </section>

      {/* ───────────── LAYERS (light) ───────────── */}
      <section className="layers section--light">
        <div className="container layers__grid">
          <div className="layers__head wipe">
            <p className="eyebrow">The Dark Coat method</p>
            <h2 className="h2">Every detail is built in three layers.</h2>
            <p className="muted-dark">
              No shortcuts and no spray-and-wipe. Each package works through the same order so nothing gets skipped — from the seat rails to the tire walls.
            </p>
          </div>
          <div className="layers__stack">
            {LAYERS.map((l, i) => (
              <article key={l.n} className="plate rise" style={{ '--i': i }}>
                <span className="plate__n">{l.n}</span>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PACKAGES: selector + detail panel ───────────── */}
      <section id="packages" className="packages">
        <div className="container">
          <div className="section-head section-head--split wipe">
            <div>
              <p className="eyebrow">Packages &amp; pricing</p>
              <h2 className="h2">Pick your coat.</h2>
            </div>
            <p className="muted">Flat, upfront pricing for sedans, SUVs and trucks. Add the exterior wash to any interior package.</p>
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
                    {o.popular && <em className="pill">Most booked</em>}
                    {o.isAddon && <em className="pill pill--ghost">Add-on</em>}
                  </span>
                  <span className="pkg__tab-sub">{o.tagline}</span>
                  <span className="pkg__tab-price">{o.isAddon ? `+$${o.price}` : `$${o.price}`}</span>
                </button>
              ))}
            </div>

            <div className="pkg__panel" role="tabpanel" key={active.id}>
              <div className="pkg__media">
                <img src={active.image} alt={`${active.name} — Dark Coat Car Detailing`} loading="lazy" />
                <div className="pkg__media-label">
                  <span>{active.isAddon ? 'Add to any package' : 'Interior package'}</span>
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

          <div className="pkg__cta">
            <Link to={bookHref} className="btn btn-red btn-lg">
              Book now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── GALLERY: film strip ───────────── */}
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="section-head section-head--center wipe">
            <p className="eyebrow">Gallery</p>
            <h2 className="h2">Foam, rinse, repeat.</h2>
          </div>

          <div
            className="film"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="film__stage">
              {GALLERY.map((g, i) => (
                <img
                  key={g.src}
                  src={g.src}
                  alt={g.caption}
                  className={i === slide ? 'is-active' : ''}
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              ))}
              <div className="film__caption">
                <span className="pill">{GALLERY[slide].tag}</span>
                <p>{GALLERY[slide].caption}</p>
              </div>
              <div className="film__count">
                <strong>{String(slide + 1).padStart(2, '0')}</strong> / {String(GALLERY.length).padStart(2, '0')}
              </div>
              <div className="film__nav">
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft size={22} /></button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo"><ChevronRight size={22} /></button>
              </div>
              <div className="film__progress" key={`${slide}-${paused}`}>
                <span className={paused ? 'is-paused' : ''} />
              </div>
            </div>
            <div className="film__thumbs" ref={thumbsRef}>
              {GALLERY.map((g, i) => (
                <button
                  key={g.src}
                  type="button"
                  className={i === slide ? 'is-active' : ''}
                  onClick={() => setSlide(i)}
                  aria-label={`Show photo ${i + 1}: ${g.caption}`}
                >
                  <img src={g.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── WHY: image + feature grid ───────────── */}
      <section className="why section--light">
        <div className="container why__grid">
          <div className="why__media rise">
            <img src="/images/engine-foam.webp" alt="Detailer brushing foam through an engine bay" loading="lazy" />
            <div className="why__badge">
              <Truck size={22} />
              <span>We come<br />to you</span>
            </div>
          </div>
          <div className="why__copy">
            <p className="eyebrow">Why Dark Coat</p>
            <h2 className="h2">The shop pulls up to your driveway.</h2>
            <div className="why__features">
              <div className="feat rise" style={{ '--i': 0 }}>
                <Truck size={22} />
                <h3>Fully mobile</h3>
                <p>Home, office or condo lot anywhere in {BUSINESS.city} and nearby.</p>
              </div>
              <div className="feat rise" style={{ '--i': 1 }}>
                <ShieldCheck size={22} />
                <h3>Paint-safe process</h3>
                <p>Soft mitts, pH-balanced foam and spot-free hand drying.</p>
              </div>
              <div className="feat rise" style={{ '--i': 2 }}>
                <Clock size={22} />
                <h3>7 AM – 7 PM daily</h3>
                <p>Pick a time that fits — weekends included.</p>
              </div>
              <div className="feat rise" style={{ '--i': 3 }}>
                <BadgePercent size={22} />
                <h3>Prepay &amp; save $15</h3>
                <p>Use code PREPAY at checkout, or choose to pay later.</p>
              </div>
            </div>
            <ol className="steps-inline">
              <li><span>1</span>Pick a package</li>
              <li><span>2</span>Choose a time</li>
              <li><span>3</span>We pull up</li>
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── REVIEWS: rating + quote slider ───────────── */}
      <section id="reviews" className="reviews">
        <div className="container reviews__grid">
          <div className="reviews__score wipe">
            <p className="eyebrow">Reviews</p>
            <div className="reviews__big">5.0</div>
            <Stars size={22} />
            <p className="muted">What South OC drivers say after their Dark Coat detail.</p>
          </div>
          <div className="reviews__slider">
            <Quote className="reviews__mark" size={64} strokeWidth={1.2} />
            <blockquote key={review} className="reviews__quote">
              <p>{REVIEWS[review].text}</p>
              <footer>
                <strong>{REVIEWS[review].name}</strong>
                <span>{REVIEWS[review].area}</span>
              </footer>
            </blockquote>
            <div className="reviews__controls">
              <div className="dots">
                {REVIEWS.map((r, i) => (
                  <button
                    key={r.name}
                    type="button"
                    className={i === review ? 'is-active' : ''}
                    onClick={() => setReview(i)}
                    aria-label={`Show review ${i + 1}`}
                  />
                ))}
              </div>
              <div className="round-nav">
                <button type="button" onClick={() => nextReview(-1)} aria-label="Previous review"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => nextReview(1)} aria-label="Next review"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── SERVICE AREA ───────────── */}
      <section id="area" className="area">
        <div className="container area__grid">
          <div className="area__copy wipe">
            <p className="eyebrow">Service area</p>
            <h2 className="h2">Based in {BUSINESS.city}. Rolling all over South OC.</h2>
            <p className="muted">
              If you’re in or near one of these cities, we’ll come to you. Not sure if you’re covered? Give us a call.
            </p>
            <ul className="chips">
              {BUSINESS.serviceAreas.map((c) => (
                <li key={c}><MapPin size={13} /> {c}</li>
              ))}
            </ul>
            <a href={BUSINESS.phoneHref} className="link-arrow">
              Ask about your area <ArrowRight size={16} />
            </a>
          </div>
          <div className="area__map">
            <iframe
              title={`Map of ${BUSINESS.city}, CA`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.mapQuery)}&z=12&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="area__pin">
              <MapPin size={18} />
              <div>
                <strong>{BUSINESS.name}</strong>
                <span>{BUSINESS.hoursDetail}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FAQ (light) ───────────── */}
      <section id="faq" className="faq section--light">
        <div className="container faq__grid">
          <div className="faq__side">
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">Good questions.</h2>
            <div className="faq__card">
              <p>Still wondering about something?</p>
              <a href={BUSINESS.phoneHref} className="btn btn-dark">
                <Phone size={17} /> {BUSINESS.phone}
              </a>
            </div>
          </div>
          <div className="faq__list">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className={`faq__item ${open ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq__q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                  >
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

      {/* ───────────── CTA: angled red band ───────────── */}
      <section className="cta">
        <div className="cta__band">
          <div className="container cta__inner">
            <div>
              <p className="eyebrow eyebrow--light">Ready when you are</p>
              <h2 className="cta__title">Give it the Dark Coat treatment.</h2>
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
    </div>
  );
}
