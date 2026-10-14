import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminUsers, updateAdminUser, getAdminProducts, removeAdminProduct, exportUsers } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Package, AlertCircle, Download } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      getAdminUsers().then((res) => setUsers(res.data.data)).catch(() => {});
    } else if (tab === 'products') {
      getAdminProducts().then((res) => setProducts(res.data.data)).catch(() => {});
    }
  }, [tab]);

  const toggleUser = async (id, isActive) => {
    try {
      await updateAdminUser(id, { isActive: !isActive });
      toast.success('User updated');
      getAdminUsers().then((res) => setUsers(res.data.data));
    } catch (err) {
      toast.error('Failed');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await updateAdminUser(id, { role });
      toast.success('Role updated');
      getAdminUsers().then((res) => setUsers(res.data.data));
    } catch {
      toast.error('Failed to update role');
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await removeAdminProduct(id);
      toast.success('Product removed');
      getAdminProducts().then((res) => setProducts(res.data.data));
    } catch {
      toast.error('Failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportUsers();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relife-users.csv';
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform management</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>
          <Download size={16} /> Export Users CSV
        </button>
      </div>

      <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
        {['overview', 'users', 'products'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-4 mb-3">
            {[
              { label: 'Users', value: stats.totalUsers, icon: <Users size={22} /> },
              { label: 'Products', value: stats.totalProducts, icon: <Package size={22} /> },
              { label: 'Available', value: stats.availableProducts, icon: <Package size={22} /> },
              { label: 'Completed', value: stats.completedProducts, icon: <Package size={22} /> },
              { label: 'Pending Donations', value: stats.pendingDonations, icon: <AlertCircle size={22} /> },
              { label: 'Pending Purchases', value: stats.pendingPurchases, icon: <AlertCircle size={22} /> },
              { label: 'Pending Services', value: stats.pendingServices, icon: <AlertCircle size={22} /> },
              { label: 'Reports', value: stats.pendingReports, icon: <AlertCircle size={22} /> },
            ].map((c) => (
              <div key={c.label} className="card" style={{ padding: '1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{c.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{c.value}</p>
              </div>
            ))}
          </div>
          {stats.recentUsers?.length > 0 && (
            <div className="card mb-3">
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
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          {users.map((u) => (
            <div key={u._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong>{u.name}</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{u.email} · {u.role} · {u.location}</p>
              </div>
              <div className="flex gap-1" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                  value={u.role}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="ngo">NGO</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="delivery_partner">Delivery Partner</option>
                </select>
                <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                <button className="btn btn-sm btn-outline" onClick={() => toggleUser(u._id, u.isActive)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="card">
          {products.map((p) => (
            <div key={p._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong>{p.name}</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {p.category} · {p.action} · {p.status} · by {p.owner?.name}
                </p>
              </div>
              {p.status !== 'removed' && (
                <button className="btn btn-sm btn-danger" onClick={() => removeProduct(p._id)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
