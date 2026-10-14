import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyPickups, cancelPickup } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Plus } from 'lucide-react';

const PLACEHOLDER = 'https://via.placeholder.com/80x80?text=Item';

const Pickups = () => {
  const [tab, setTab] = useState('upcoming');
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyPickups(tab)
      .then((res) => setPickups(res.data.data || []))
      .catch(() => setPickups([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pickup?')) return;
    try {
      await cancelPickup(id);
      toast.success('Pickup cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>Pickups</h1>
          <p>Manage scheduled item collections</p>
        </div>
        <Link to="/pickups/schedule" className="btn btn-primary"><Plus size={18} /> Schedule Pickup</Link>
      </div>

      <div className="flex gap-1 mb-3">
        {['upcoming', 'past', 'cancelled'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : pickups.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2rem' }}>
          <p>No {tab} pickups.</p>
          {tab === 'upcoming' && <Link to="/pickups/schedule" className="btn btn-primary mt-2">Schedule one</Link>}
        </div>
      ) : (
        <div className="grid grid-2">
          {pickups.map((p) => (
            <div key={p._id} className="card" style={{ padding: '1rem' }}>
              <div className="flex gap-2">
                <img
                  src={p.product?.images?.[0]?.url || PLACEHOLDER}
                  alt=""
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{p.product?.name || 'Item'}</strong>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {new Date(p.date).toLocaleDateString()} · {p.timeSlot}
                  </p>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {p.location}
                  </p>
                  <span className={`badge ${p.status === 'Completed' ? 'badge-green' : p.status === 'Cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                <Link to={`/pickups/${p._id}`} className="btn btn-sm btn-outline">View Details</Link>
                {['Scheduled', 'Confirmed', 'Rescheduled'].includes(p.status) && (
                  <>
                    <Link to={`/pickups/${p._id}?reschedule=1`} className="btn btn-sm btn-outline">Reschedule</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(p._id)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pickups;
