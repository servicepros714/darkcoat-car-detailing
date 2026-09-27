import { Link } from 'react-router-dom';
import { Phone, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { BUSINESS } from '../config/business.js';
import { PACKAGES, ADDON } from '../config/services.js';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__call">
          <img src="/images/logo.webp" alt={BUSINESS.name} className="footer__logo" loading="lazy" width="720" height="305" />
          <p className="footer__lede">Mobile interior detailing and hand exterior washes, delivered to your driveway in {BUSINESS.city}.</p>
          <a href={BUSINESS.phoneHref} className="footer__phone">
            <span>Call or text</span>
            {BUSINESS.phone}
          </a>
          <Link to="/book" className="btn btn-red">
            Book Online <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="footer__cols">
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/#packages">Packages</Link></li>
              <li><Link to="/#gallery">Gallery</Link></li>
              <li><Link to="/#reviews">Reviews</Link></li>
              <li><Link to="/#area">Service Area</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {PACKAGES.map((p) => (
                <li key={p.id}>
                  <Link to={`/book?package=${p.id}`}>
                    {p.name} <em>${p.price}</em>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/book">
                  {ADDON.name} <em>+${ADDON.price}</em>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Visit</h4>
            <ul className="footer__contact">
              <li><MapPin size={15} /> {BUSINESS.address}</li>
              <li><Clock size={15} /> {BUSINESS.hours}</li>
              <li><Phone size={15} /> <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bar">
        <div className="container footer__bar-inner">
          <span>© {year} {BUSINESS.name}. All rights reserved.</span>
          <span>Mobile car detailing · {BUSINESS.address}</span>
        </div>
      </div>
    </footer>
  );
}
