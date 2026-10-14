import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Leaf size={24} color="#16a34a" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>ReLife</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              AI-Powered Circular Community Hub. Reduce waste, reuse items, and build a sustainable community.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link to="/products" style={{ color: '#94a3b8' }}>Browse Products</Link>
              <Link to="/donations" style={{ color: '#94a3b8' }}>Donations</Link>
              <Link to="/repair" style={{ color: '#94a3b8' }}>Repair Services</Link>
              <Link to="/recycling" style={{ color: '#94a3b8' }}>Recycling</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>About</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link to="/about" style={{ color: '#94a3b8' }}>About ReLife</Link>
              <Link to="/sustainability" style={{ color: '#94a3b8' }}>Sustainability</Link>
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}
        >
          © {new Date().getFullYear()} ReLife – Circular Community Hub. Built for a sustainable future.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
