import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to top on every route change, or to the #section when a hash is present.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (tries++ < 20) {
          setTimeout(tick, 50);
        }
      };
      tick();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash, key]);

  return null;
}
