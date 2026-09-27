import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="h2">This page drove off.</h1>
        <Link to="/" className="btn btn-red">Back to home</Link>
      </div>
    </section>
  );
}
