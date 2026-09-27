import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, CalendarCheck } from 'lucide-react';
import { BUSINESS } from '../config/business.js';

// Mobile-only bottom bar. Slides in once the visitor scrolls past the hero.
export default function MobileActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('hero');
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 80 : 400;
      setShow(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`action-bar action-bar--fixed ${show ? 'is-visible' : ''}`} aria-hidden={!show}>
      <a href={BUSINESS.phoneHref} className="action-bar__btn action-bar__btn--call" tabIndex={show ? 0 : -1}>
        <Phone size={18} /> Call Now
      </a>
      <Link to="/book" className="action-bar__btn action-bar__btn--book" tabIndex={show ? 0 : -1}>
        <CalendarCheck size={18} /> Book Online
      </Link>
    </div>
  );
}
