import { useEffect, useState } from 'react';
import { createServiceRequest, getServiceRequests } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ServicePage = ({ type, title, description }) => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    if (!isAuthenticated) { setLoading(false); return; }
    getServiceRequests({ type })
      .then((res) => setRequests(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('location', form.location);
      await createServiceRequest(fd);
      toast.success('Request submitted!');
      setShowForm(false);
      setForm({ title: '', description: '', location: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : `Submit ${type} Request`}
        </button>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <h2 className="mb-2" style={{ fontSize: '1.15rem' }}>Your {type} Requests</h2>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : !isAuthenticated ? (
        <div className="empty-state"><p>Please log in to view and submit requests.</p></div>
      ) : requests.length === 0 ? (
        <div className="empty-state"><p>No requests yet.</p></div>
      ) : (
        <div className="card">
          {requests.map((r) => (
            <div key={r._id} className="flex-between" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong>{r.title}</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{r.location} · {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`badge ${r.status === 'Completed' ? 'badge-green' : r.status === 'In Progress' ? 'badge-blue' : 'badge-yellow'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Repair = () => (
  <ServicePage type="Repair" title="Repair Services" description="Request help repairing damaged items from the community." />
);
export const Recycling = () => (
  <ServicePage type="Recycle" title="Recycling" description="Identify items for responsible recycling." />
);
export const Upcycling = () => (
  <ServicePage type="Upcycle" title="Upcycling Community" description="Share upcycling ideas and request creative reuse help." />
);

export default ServicePage;
