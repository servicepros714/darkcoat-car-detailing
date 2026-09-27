import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, CalendarCheck, Clock, MapPin } from 'lucide-react';
import { BUSINESS } from '../config/business.js';

const LEFT_LINKS = [
  { to: '/#packages', label: 'Packages' },
  { to: '/#gallery', label: 'Gallery' },
  { to: '/#reviews', label: 'Reviews' },
];
const RIGHT_LINKS = [
  { to: '/#area', label: 'Service Area' },
  { to: '/#faq', label: 'FAQ' },
];
const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

export default function Header({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  return (
    <>
      {!compact && (
        <div className="utility">
          <div className="container utility__inner">
            <span>
              <MapPin size={14} /> Mobile detailing · {BUSINESS.city} &amp; South OC
            </span>
            <span className="utility__right">
              <span>
                <Clock size={14} /> {BUSINESS.hours}
              </span>
              <a href={BUSINESS.phoneHref}>
                <Phone size={14} /> {BUSINESS.phone}
              </a>
            </span>
          </div>
        </div>
      )}

      <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${compact ? 'nav--compact' : ''}`}>
        <div className="container nav__inner">
          <nav className="nav__side nav__side--left" aria-label="Primary">
            {LEFT_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="nav__link">
                {l.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="nav__logo" aria-label={`${BUSINESS.name} home`}>
            <img src="/images/logo.webp" alt={BUSINESS.name} width="720" height="305" />
          </Link>

          <div className="nav__side nav__side--right">
            {RIGHT_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="nav__link">
                {l.label}
              </Link>
            ))}
            <Link to="/book" className="btn btn-red btn-sm">
              Book Online
            </Link>
          </div>

          <div className="nav__mobile-tools">
            <a href={BUSINESS.phoneHref} className="icon-btn" aria-label="Call now">
              <Phone size={19} />
            </a>
            <button
              type="button"
              className="icon-btn icon-btn--menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer ${open ? 'drawer--open' : ''}`} aria-hidden={!open}>
        <div className="drawer__body">
          <p className="eyebrow">Menu</p>
          <ul className="drawer__links">
            <li>
              <Link to="/" tabIndex={open ? 0 : -1}>
                <span>01</span>Home
              </Link>
            </li>
            {ALL_LINKS.map((l, i) => (
              <li key={l.to}>
                <Link to={l.to} tabIndex={open ? 0 : -1}>
                  <span>{String(i + 2).padStart(2, '0')}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="drawer__meta">
            <p>
              <Clock size={15} /> {BUSINESS.hours}
            </p>
            <p>
              <MapPin size={15} /> {BUSINESS.address}
            </p>
          </div>
        </div>
        <div className="action-bar action-bar--drawer">
          <a href={BUSINESS.phoneHref} className="action-bar__btn action-bar__btn--call" tabIndex={open ? 0 : -1}>
            <Phone size={18} /> Call Now
          </a>
          <Link to="/book" className="action-bar__btn action-bar__btn--book" tabIndex={open ? 0 : -1}>
            <CalendarCheck size={18} /> Book Online
          </Link>
        </div>
      </div>
    </>
  );
}
