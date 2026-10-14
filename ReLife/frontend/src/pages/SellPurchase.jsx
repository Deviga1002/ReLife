import { useEffect, useState } from 'react';
import { getPurchaseRequests, updatePurchaseRequest } from '../services/api';
import toast from 'react-hot-toast';

const SellPurchase = () => {
  const [tab, setTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPurchaseRequests(tab)
      .then((res) => setRequests(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleStatus = async (id, status) => {
    try {
      await updatePurchaseRequest(id, status);
      toast.success(`Request ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Sell & Purchase Requests</h1>
        <p>Manage buy/sell requests. Complete transactions offline – no payment gateway integrated.</p>
      </div>
      <div className="flex gap-1 mb-3">
        <button className={`btn btn-sm ${tab === 'received' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('received')}>As Seller</button>
        <button className={`btn btn-sm ${tab === 'sent' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('sent')}>As Buyer</button>
      </div>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state"><p>No requests.</p></div>
      ) : (
        <div className="card">
          {requests.map((r) => (
            <div key={r._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div className="flex-between">
                <div>
                  <strong>{r.product?.name || 'Item'}</strong>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {tab === 'received' ? `Buyer: ${r.buyer?.name}` : `Seller: ${r.seller?.name}`}
                    {r.offeredPrice != null && ` · Offered: ₹${r.offeredPrice}`}
                  </p>
                  {r.message && <p style={{ fontSize: '0.9rem' }}>{r.message}</p>}
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

export default SellPurchase;
