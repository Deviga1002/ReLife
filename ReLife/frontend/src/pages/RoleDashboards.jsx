import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDashboard,
  getAdminStats,
  getDonationRequests,
  getServiceRequests,
  getMyProducts,
  getFavorites,
  getNotifications,
} from '../services/api';
import {
  Heart, Wrench, Truck, Package, Users, Leaf, Award, ShoppingBag,
  Plus, Bell, LogOut, LayoutDashboard, Recycle, MapPin, Shield,
} from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Administrator',
  user: 'User',
  ngo: 'NGO',
  service_provider: 'Service Provider',
  delivery_partner: 'Delivery Partner',
};

const DashHeader = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1>{title}</h1>
        <p>
          {subtitle || `Welcome, ${user?.name}`}{' '}
          <span className="badge badge-green">{ROLE_LABELS[user?.role] || user?.role}</span>
        </p>
      </div>
      <div className="flex gap-1">
        <Link to="/profile" className="btn btn-outline btn-sm">Profile</Link>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => { logout(); navigate('/login'); }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = '#16a34a' }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div className="flex-between">
      <div>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value ?? 0}</p>
      </div>
      <div style={{ color, opacity: 0.85 }}>{icon}</div>
    </div>
  </div>
);

const QuickLink = ({ to, icon, title, desc }) => (
  <Link to={to} className="card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
    <div style={{ marginBottom: 8 }}>{icon}</div>
    <strong>{title}</strong>
    {desc && <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>{desc}</p>}
  </Link>
);

/* ========== USER DASHBOARD ========== */
export const UserDashboard = () => {
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

  return (
    <div className="container">
      <DashHeader title="User Dashboard" />
      <div className="grid grid-3 mb-4">
        <StatCard label="Total Listed" value={stats?.totalListed} icon={<Package size={24} />} />
        <StatCard label="Donated" value={stats?.itemsDonated} icon={<Heart size={24} />} color="#dc2626" />
        <StatCard label="Sold" value={stats?.itemsSold} icon={<ShoppingBag size={24} />} color="#0f766e" />
        <StatCard label="Repair Requests" value={stats?.repairRequests} icon={<Wrench size={24} />} color="#d97706" />
        <StatCard label="Recycle Requests" value={stats?.recycleRequests} icon={<Recycle size={24} />} color="#64748b" />
        <StatCard label="Reward Points" value={stats?.rewardPoints ?? user?.rewardPoints} icon={<Award size={24} />} color="#f59e0b" />
      </div>

      <div className="card mb-4" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)' }}>
        <div className="flex gap-2 mb-2" style={{ alignItems: 'center' }}>
          <Leaf size={22} color="#16a34a" />
          <h2 style={{ fontSize: '1.15rem' }}>Sustainability Impact</h2>
        </div>
        <div className="grid grid-3">
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.wasteDivertedKg || 0} kg</p>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Waste diverted (est.)</p>
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.co2AvoidedKg || 0} kg</p>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>CO₂ avoided (est.)</p>
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{stats?.moneyEarned || 0}</p>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>From sales</p>
          </div>
        </div>
        <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>{stats?.impactNote}</p>
      </div>

      <div className="grid grid-4 mb-3">
        <QuickLink to="/products/add" icon={<Plus size={24} color="#16a34a" />} title="Add Product" desc="List a new item" />
        <QuickLink to="/my-listings" icon={<Package size={24} color="#0f766e" />} title="My Listings" desc="Manage your products" />
        <QuickLink to="/donations" icon={<Heart size={24} color="#dc2626" />} title="Browse Donations" />
        <QuickLink to="/donation-requests" icon={<Heart size={24} color="#16a34a" />} title="Donation Requests" />
        <QuickLink to="/sell-purchase" icon={<ShoppingBag size={24} color="#0f766e" />} title="Sell & Purchase" />
        <QuickLink to="/repair" icon={<Wrench size={24} color="#d97706" />} title="Repair Requests" />
        <QuickLink to="/favorites" icon={<Award size={24} color="#f59e0b" />} title="Favorites" />
        <QuickLink to="/notifications" icon={<Bell size={24} color="#64748b" />} title="Notifications" />
      </div>
    </div>
  );
};

/* ========== ADMIN DASHBOARD ========== */
export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="container">
      <DashHeader title="Admin Dashboard" subtitle="Platform management overview" />
      <div className="grid grid-4 mb-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={<Users size={22} />} />
        <StatCard label="Total Products" value={stats?.totalProducts} icon={<Package size={22} />} />
        <StatCard label="Available" value={stats?.availableProducts} icon={<Package size={22} />} color="#0f766e" />
        <StatCard label="Completed" value={stats?.completedProducts} icon={<Package size={22} />} color="#64748b" />
        <StatCard label="Pending Donations" value={stats?.pendingDonations} icon={<Heart size={22} />} color="#dc2626" />
        <StatCard label="Pending Purchases" value={stats?.pendingPurchases} icon={<ShoppingBag size={22} />} color="#0f766e" />
        <StatCard label="Pending Services" value={stats?.pendingServices} icon={<Wrench size={22} />} color="#d97706" />
        <StatCard label="Reports" value={stats?.pendingReports} icon={<Shield size={22} />} color="#64748b" />
      </div>
      <div className="grid grid-3 mb-3">
        <QuickLink to="/admin" icon={<Users size={24} color="#16a34a" />} title="Manage Users & Roles" desc="Assign roles, activate/deactivate" />
        <QuickLink to="/admin" icon={<Package size={24} color="#0f766e" />} title="Manage Products" desc="Moderate listings" />
        <QuickLink to="/products" icon={<LayoutDashboard size={24} color="#64748b" />} title="Browse Platform" desc="View all products" />
      </div>
      {stats?.recentUsers?.length > 0 && (
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <strong>Recent Users</strong>
          </div>
          {stats.recentUsers.map((u) => (
            <div key={u._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <span>{u.name} ({u.email})</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ========== NGO DASHBOARD ========== */
export const NgoDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonationRequests('sent')
      .then((res) => setRequests(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => r.status === 'Pending').length;
  const accepted = requests.filter((r) => r.status === 'Accepted').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="container">
      <DashHeader title="NGO Dashboard" subtitle="Coordinate donations for communities in need" />
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <>
          <div className="grid grid-3 mb-4">
            <StatCard label="Pending Requests" value={pending} icon={<Heart size={24} />} color="#d97706" />
            <StatCard label="Accepted" value={accepted} icon={<Heart size={24} />} color="#16a34a" />
            <StatCard label="Completed" value={completed} icon={<Heart size={24} />} color="#0f766e" />
          </div>
          <div className="grid grid-3 mb-3">
            <QuickLink to="/donations" icon={<Heart size={24} color="#16a34a" />} title="Browse Donations" desc="Discover free items" />
            <QuickLink to="/donation-requests" icon={<Package size={24} color="#0f766e" />} title="My Donation Requests" desc="Track request status" />
            <QuickLink to="/profile" icon={<Users size={24} color="#64748b" />} title="NGO Profile" desc="Update organization details" />
          </div>
          {requests.length === 0 && (
            <div className="empty-state card" style={{ padding: '2rem' }}>
              <p>No donation requests yet. Browse available donations to get started.</p>
              <Link to="/donations" className="btn btn-primary mt-2">Browse Donations</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ========== SERVICE PROVIDER DASHBOARD ========== */
export const ProviderDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceRequests()
      .then((res) => setRequests(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const repair = requests.filter((r) => r.type === 'Repair').length;
  const recycle = requests.filter((r) => r.type === 'Recycle').length;
  const upcycle = requests.filter((r) => r.type === 'Upcycle').length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="container">
      <DashHeader title="Service Provider Dashboard" subtitle="Manage repair, recycle & upcycle services" />
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <>
          <div className="grid grid-3 mb-4">
            <StatCard label="Repair" value={repair} icon={<Wrench size={24} />} color="#d97706" />
            <StatCard label="Recycle" value={recycle} icon={<Recycle size={24} />} color="#64748b" />
            <StatCard label="Upcycle" value={upcycle} icon={<Leaf size={24} />} color="#16a34a" />
            <StatCard label="Pending" value={pending} icon={<Package size={24} />} color="#d97706" />
            <StatCard label="Completed" value={completed} icon={<Award size={24} />} color="#16a34a" />
          </div>
          <div className="grid grid-3 mb-3">
            <QuickLink to="/repair" icon={<Wrench size={24} color="#d97706" />} title="Repair Services" desc="View & manage repair requests" />
            <QuickLink to="/recycling" icon={<Recycle size={24} color="#64748b" />} title="Recycling" desc="Handle recycle requests" />
            <QuickLink to="/upcycling" icon={<Leaf size={24} color="#16a34a" />} title="Upcycling" desc="Creative reuse requests" />
          </div>
          {requests.length === 0 && (
            <div className="empty-state card" style={{ padding: '2rem' }}>
              <p>No service requests yet. Users can submit repair, recycle, or upcycle requests from the platform.</p>
            </div>
          )}
          {requests.length > 0 && (
            <div className="card">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <strong>Recent Service Requests</strong>
              </div>
              {requests.slice(0, 10).map((r) => (
                <div key={r._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong>{r.title}</strong>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>{r.type} · {r.location}</p>
                  </div>
                  <span className={`badge ${r.status === 'Completed' ? 'badge-green' : r.status === 'In Progress' ? 'badge-blue' : 'badge-yellow'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ========== DELIVERY PARTNER DASHBOARD ========== */
export const DeliveryDashboard = () => {
  // Delivery assignments can be extended; for now show scaffold with real profile data
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  // Placeholder list – empty until delivery assignment model is populated by admin/NGO
  const deliveries = [];

  const statuses = ['Assigned', 'Picked Up', 'In Transit', 'Delivered'];

  return (
    <div className="container">
      <DashHeader title="Delivery Partner Dashboard" subtitle="Manage assigned pickups and deliveries" />
      <div className="grid grid-4 mb-4">
        {statuses.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={deliveries.filter((d) => d.status === s).length}
            icon={<Truck size={22} />}
            color={s === 'Delivered' ? '#16a34a' : '#0f766e'}
          />
        ))}
      </div>
      <div className="card mb-3" style={{ padding: '1.5rem' }}>
        <div className="flex gap-2 mb-2" style={{ alignItems: 'center' }}>
          <Truck size={28} color="#0f766e" />
          <h2 style={{ fontSize: '1.15rem' }}>Assigned Deliveries</h2>
        </div>
        <p className="text-muted mb-2">
          When admins or NGOs assign pickup/drop-off tasks, they appear here.
          Update status as you progress: Assigned → Picked Up → In Transit → Delivered.
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Delivery address is shown only for assignments assigned to you.
        </p>
        {deliveries.length === 0 && (
          <div className="empty-state" style={{ padding: '1.5rem 0' }}>
            <MapPin size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p>No deliveries assigned yet.</p>
          </div>
        )}
      </div>
      <div className="grid grid-2">
        <QuickLink to="/profile" icon={<Users size={24} color="#64748b" />} title="Update Profile" desc="Keep phone & location current" />
        <QuickLink to="/notifications" icon={<Bell size={24} color="#16a34a" />} title="Notifications" desc="Delivery assignment alerts" />
      </div>
    </div>
  );
};
