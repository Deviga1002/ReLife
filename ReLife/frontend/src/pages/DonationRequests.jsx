import { useEffect, useState } from 'react';
import { getDonationRequests, updateDonationRequest } from '../services/api';
import toast from 'react-hot-toast';

const DonationRequests = () => {
  const [tab, setTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDonationRequests(tab)
      .then((res) => setRequests(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleStatus = async (id, status) => {
    try {
      await updateDonationRequest(id, status);
      toast.success(`Request ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Donation Requests</h1>
      </div>
      <div className="flex gap-1 mb-3">
        <button className={`btn btn-sm ${tab === 'received' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('received')}>Received</button>
        <button className={`btn btn-sm ${tab === 'sent' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('sent')}>Sent</button>
      </div>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state"><p>No {tab} requests.</p></div>
      ) : (
        <div className="card">
          {requests.map((r) => (
            <div key={r._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div className="flex-between">
                <div>
                  <strong>{r.product?.name || 'Item'}</strong>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {tab === 'received' ? `From: ${r.requester?.name}` : `To: ${r.owner?.name}`}
                    {' · '}{new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.message && <p style={{ fontSize: '0.9rem', marginTop: 4 }}>{r.message}</p>}
                </div>
                <span className={`badge ${r.status === 'Accepted' ? 'badge-green' : r.status === 'Rejected' ? 'badge-red' : r.status === 'Completed' ? 'badge-blue' : 'badge-yellow'}`}>
                  {r.status}
                </span>
              </div>
              {tab === 'received' && r.status === 'Pending' && (
                <div className="flex gap-1 mt-2">
                  <button className="btn btn-sm btn-primary" onClick={() => handleStatus(r._id, 'Accepted')}>Accept</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleStatus(r._id, 'Rejected')}>Reject</button>
                </div>
              )}
              {tab === 'received' && r.status === 'Accepted' && (
                <button className="btn btn-sm btn-primary mt-2" onClick={() => handleStatus(r._id, 'Completed')}>Mark Completed</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationRequests;
