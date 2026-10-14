import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Heart, ShoppingBag, Wrench, Recycle, Award, Leaf, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const cards = [
    { label: 'Total Listed', value: stats?.totalListed || 0, icon: <Package size={24} />, color: '#16a34a' },
    { label: 'Donated', value: stats?.itemsDonated || 0, icon: <Heart size={24} />, color: '#dc2626' },
    { label: 'Sold', value: stats?.itemsSold || 0, icon: <ShoppingBag size={24} />, color: '#0f766e' },
    { label: 'Repair Requests', value: stats?.repairRequests || 0, icon: <Wrench size={24} />, color: '#d97706' },
    { label: 'Recycle Requests', value: stats?.recycleRequests || 0, icon: <Recycle size={24} />, color: '#64748b' },
    { label: 'Reward Points', value: stats?.rewardPoints || user?.rewardPoints || 0, icon: <Award size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p>Your circular community dashboard</p>
        </div>
        <Link to="/products/add" className="btn btn-primary"><Plus size={18} /> List Item</Link>
      </div>

      <div className="grid grid-3 mb-4">
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: '1.25rem' }}>
            <div className="flex-between">
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{c.label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{c.value}</p>
              </div>
              <div style={{ color: c.color, opacity: 0.8 }}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Impact */}
      <div className="card mb-4" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)' }}>
        <div className="flex gap-2 mb-2" style={{ alignItems: 'center' }}>
          <Leaf size={24} color="#16a34a" />
          <h2 style={{ fontSize: '1.25rem' }}>Your Environmental Impact</h2>
        </div>
        <div className="grid grid-3">
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.wasteDivertedKg || 0} kg</p>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Waste diverted (est.)</p>
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.co2AvoidedKg || 0} kg</p>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>CO₂ avoided (est.)</p>
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{stats?.moneyEarned || 0}</p>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>From sales</p>
          </div>
        </div>
        <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>{stats?.impactNote}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-4">
        <Link to="/my-listings" className="card" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Package size={28} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <strong>My Listings</strong>
        </Link>
        <Link to="/donation-requests" className="card" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Heart size={28} color="#dc2626" style={{ margin: '0 auto 8px' }} />
          <strong>Donation Requests</strong>
        </Link>
        <Link to="/sell-purchase" className="card" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
          <ShoppingBag size={28} color="#0f766e" style={{ margin: '0 auto 8px' }} />
          <strong>Sell & Purchase</strong>
        </Link>
        <Link to="/favorites" className="card" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Award size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
          <strong>Favorites</strong>
        </Link>
      </div>

      {/* Reward history */}
      {stats?.rewardHistory?.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>Recent Rewards</h2>
          <div className="card">
            {stats.rewardHistory.map((r) => (
              <div key={r._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{r.description}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>+{r.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
