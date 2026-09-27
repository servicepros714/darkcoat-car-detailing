import { useEffect } from 'react';

// "Squeegee wipe" reveal: elements with .wipe / .rise get .in when they enter the viewport.
export default function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.wipe:not(.in), .rise:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
