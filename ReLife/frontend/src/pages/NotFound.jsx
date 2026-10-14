import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container text-center" style={{ paddingTop: '4rem' }}>
    <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
    <p className="mb-3" style={{ fontSize: '1.25rem' }}>Page not found</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

export default NotFound;
