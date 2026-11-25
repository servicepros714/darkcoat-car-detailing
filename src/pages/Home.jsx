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
  MapPin,
} from 'lucide-react';
import { BUSINESS } from '../config/business.js';
import { Packages, Reviews, Faq, Cta, AreaChips } from '../components/Sections.jsx';
import useReveal from '../lib/useReveal.js';

const GALLERY = [
  { src: '/images/blue-gt.webp', caption: 'Snow foam pre-soak', tag: 'Exterior', alt: 'Blue sports car under a snow foam pre-soak' },
  { src: '/images/red-headlight.webp', caption: 'Foam dwell on paint & lights', tag: 'Exterior', alt: 'Foam on the paint and headlight of a red car' },
  { src: '/images/black-rinse.webp', caption: 'Pressure rinse & wheel clean', tag: 'Wheels', alt: 'Black car being rinsed during a hand wash' },
  { src: '/images/red-side-garage.webp', caption: 'Panel-by-panel hand wash', tag: 'Exterior', alt: 'Red car being hand washed panel by panel' },
  { src: '/images/rear-foam.webp', caption: 'Mitt hand wash', tag: 'Exterior', alt: 'Foamed car being washed by hand with a wash mitt' },
  { src: '/images/red-hood-foam.webp', caption: 'Full-coverage foam coat', tag: 'Exterior', alt: 'Red car covered in foam during an exterior wash' },
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


export default function Home() {
  useReveal([]);

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

  return (
    <div className="home">
      {/* ───────────── HERO: copy + triptych slats ───────────── */}
      <section id="hero" className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 className="eyebrow eyebrow--line">Mobile car detailing in {BUSINESS.city}, CA</h1>
            <p className="hero__title">
              Showroom depth.
              <span>Driveway convenience.</span>
            </p>
            <p className="hero__lede">
              Dark Coat brings deep interior detailing, plus an optional hand exterior wash, to your home or office with our own water and power.
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
              <li><Check size={15} /> Own water &amp; power</li>
              <li><Check size={15} /> Every day 8–5</li>
            </ul>
          </div>

          <div className="hero__slats" aria-hidden="true">
            <div className="slat slat--1"><img src="/images/red-headlight-hero.webp" alt="" width="560" height="796" /></div>
            <div className="slat slat--2"><img src="/images/blue-gt-hero.webp" alt="" width="560" height="995" fetchpriority="high" /></div>
            <div className="slat slat--3"><img src="/images/black-rinse-hero.webp" alt="" width="560" height="746" /></div>
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

      <Packages />

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
                  alt={g.alt}
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
      <section id="why" className="why section--light">
        <div className="container why__grid">
          <div className="why__media rise">
            <img src="/images/rear-foam.webp" alt="Foamed car being hand washed in a driveway" loading="lazy" />
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
                <p>Home, office or condo lot in {BUSINESS.city} and nearby, with our own water and power.</p>
              </div>
              <div className="feat rise" style={{ '--i': 1 }}>
                <ShieldCheck size={22} />
                <h3>Eco-friendly, guaranteed</h3>
                <p>Eco-friendly products, and every detail is backed by our satisfaction guarantee.</p>
              </div>
              <div className="feat rise" style={{ '--i': 2 }}>
                <Clock size={22} />
                <h3>Every day, 8 AM – 5 PM</h3>
                <p>Pick a start time that fits, weekends included.</p>
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

      {/* ───────────── SERVICE AREA ───────────── */}
      <section id="area" className="area">
        <div className="container area__grid">
          <div className="area__copy wipe">
            <p className="eyebrow">Service area</p>
            <h2 className="h2">Based in {BUSINESS.city}. Rolling all over South OC.</h2>
            <p className="muted">
              We detail cars all over San Clemente, from {BUSINESS.homeAreas.slice(0, 3).join(', ')} to {BUSINESS.homeAreas.slice(3, 5).join(' and ')}, and in these nearby places at the same prices:
            </p>
            <AreaChips />
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

      <Reviews />
      <Faq />
      <Cta />
    </div>
  );
}
