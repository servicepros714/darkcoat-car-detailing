import { Link } from 'react-router-dom';
import { ServiceChips } from '../components/Sections.jsx';

// Prerendered as dist/404.html, which Cloudflare Pages serves (with a 404 status) for unknown URLs.
export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="h2">This page drove off.</h1>
        <p className="muted">See our detailing services or book online.</p>
        <ServiceChips home />
        <Link to="/book" className="btn btn-red">Book online</Link>
      </div>
    </section>
  );
}
