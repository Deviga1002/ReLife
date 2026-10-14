import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Recycle, ShoppingBag, Wrench, Lightbulb, ArrowRight } from 'lucide-react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const categories = [
  { name: 'Clothes and Fashion', icon: '👕' },
  { name: 'Books and Stationery', icon: '📚' },
  { name: 'Food and Groceries', icon: '🍎' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Furniture', icon: '🪑' },
  { name: 'Home Appliances', icon: '🔌' },
  { name: 'Toys and Accessories', icon: '🧸' },
  { name: 'Other Items', icon: '📦' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    getProducts({ limit: 4, status: 'available' })
      .then((res) => setFeatured(res.data.data))
      .catch(() => {});
    getProducts({ action: 'Donate', limit: 4, status: 'available' })
      .then((res) => setDonations(res.data.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #ecfdf5 100%)',
          padding: '4rem 0',
          marginTop: '-1.5rem',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 14px', borderRadius: 999, marginBottom: 16, boxShadow: 'var(--shadow)' }}>
            <Leaf size={18} color="#16a34a" />
            <span style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.9rem' }}>Circular Economy Platform</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Give Items a <span style={{ color: 'var(--primary)' }}>Second Life</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7 }}>
            Donate, sell, repair, recycle, or upcycle unused products. Connect with your community,
            reduce waste, and earn reward points for sustainable actions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse Items <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Join ReLife
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mt-4">
        <h2 className="text-center mb-3" style={{ fontSize: '1.5rem' }}>How ReLife Works</h2>
        <div className="grid grid-4">
          {[
            { icon: <Heart size={28} color="#16a34a" />, title: 'Donate', desc: 'List free items for people in need' },
            { icon: <ShoppingBag size={28} color="#0f766e" />, title: 'Sell', desc: 'Sell unused items at fair prices' },
            { icon: <Wrench size={28} color="#d97706" />, title: 'Repair', desc: 'Request community repair help' },
            { icon: <Recycle size={28} color="#64748b" />, title: 'Recycle', desc: 'Send items for responsible recycling' },
          ].map((item) => (
            <div key={item.title} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{item.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mt-4">
        <h2 className="mb-3" style={{ fontSize: '1.5rem' }}>Browse by Category</h2>
        <div className="grid grid-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="card"
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{cat.icon}</div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mt-4">
          <div className="flex-between mb-3">
            <h2 style={{ fontSize: '1.5rem' }}>Featured Items</h2>
            <Link to="/products">View all →</Link>
          </div>
          <div className="grid grid-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Donations */}
      {donations.length > 0 && (
        <section className="container mt-4 mb-4">
          <div className="flex-between mb-3">
            <h2 style={{ fontSize: '1.5rem' }}>Free Donations</h2>
            <Link to="/donations">View all →</Link>
          </div>
          <div className="grid grid-4">
            {donations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
