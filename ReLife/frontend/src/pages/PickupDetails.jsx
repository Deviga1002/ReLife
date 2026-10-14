import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getPickup, verifyPickup, reschedulePickup, getAvailableSlots, confirmPickup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const PickupDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualToken, setManualToken] = useState('');
  const [showReschedule, setShowReschedule] = useState(searchParams.get('reschedule') === '1');
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [slots, setSlots] = useState({ available: [] });

  const load = () => {
    getPickup(id)
      .then((res) => setPickup(res.data.data))
      .catch(() => toast.error('Pickup not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (newDate) {
      getAvailableSlots({ date: newDate }).then((res) => setSlots(res.data.data)).catch(() => {});
    }
  }, [newDate]);

  const handleVerify = async (token) => {
    try {
      await verifyPickup(token);
      toast.success('Pickup verified & completed!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleReschedule = async () => {
    try {
      await reschedulePickup(id, { date: newDate, timeSlot: newSlot });
      toast.success('Rescheduled');
      setShowReschedule(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!pickup) return <div className="container empty-state"><p>Not found</p></div>;

  const canAct = ['Scheduled', 'Confirmed', 'Rescheduled'].includes(pickup.status);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <Link to="/pickups" className="flex gap-1 mb-2" style={{ alignItems: 'center', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to pickups
      </Link>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex-between mb-2">
          <h1 style={{ fontSize: '1.35rem' }}>{pickup.product?.name}</h1>
          <span className={`badge ${pickup.status === 'Completed' ? 'badge-green' : pickup.status === 'Cancelled' ? 'badge-red' : 'badge-yellow'}`}>
            {pickup.status}
          </span>
        </div>
        <p className="text-muted mb-1">Date: {new Date(pickup.date).toLocaleDateString()} · {pickup.timeSlot}</p>
        <p className="text-muted mb-1">Location: {pickup.location}</p>
        {pickup.instructions && <p className="mb-2">Notes: {pickup.instructions}</p>}
        <p className="mb-1"><strong>Owner:</strong> {pickup.owner?.name}</p>
        <p className="mb-2"><strong>Recipient:</strong> {pickup.recipient?.name}</p>

        {canAct && pickup.verificationToken && !pickup.verificationToken.endsWith('_used') && (
          <div className="card mb-3" style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc' }}>
            <h3 className="mb-2">Verification QR Code</h3>
            <QRCodeSVG value={pickup.verificationToken} size={180} level="M" />
            <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
              Scan or enter token to complete pickup. Do not share publicly.
            </p>
            <p style={{ fontSize: '0.7rem', wordBreak: 'break-all', marginTop: 8, color: '#94a3b8' }}>
              Token: {pickup.verificationToken.slice(0, 16)}…
            </p>
          </div>
        )}

        {canAct && (
          <div className="mb-3">
            <h3 className="mb-1" style={{ fontSize: '1rem' }}>Manual verification</h3>
            <div className="flex gap-1">
              <input
                className="form-control"
                placeholder="Paste verification token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => handleVerify(manualToken.trim())}>Verify</button>
            </div>
          </div>
        )}

        {canAct && (
          <div className="flex gap-1 mb-2">
            {pickup.status === 'Scheduled' && (
              <button className="btn btn-outline btn-sm" onClick={async () => {
                try { await confirmPickup(id); toast.success('Confirmed'); load(); }
                catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
              }}>Confirm</button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => setShowReschedule(!showReschedule)}>Reschedule</button>
          </div>
        )}

        {showReschedule && canAct && (
          <div className="card" style={{ padding: '1rem', marginTop: 8 }}>
            <div className="form-group">
              <label>New Date</label>
              <input type="date" className="form-control" value={newDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Slot</label>
              <select className="form-control" value={newSlot} onChange={(e) => setNewSlot(e.target.value)}>
                <option value="">Select</option>
                {(slots.available || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleReschedule}>Save Reschedule</button>
          </div>
        )}

        {pickup.verifiedAt && (
          <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
            Verified at {new Date(pickup.verifiedAt).toLocaleString()}
            {pickup.verifiedBy && ` by ${pickup.verifiedBy.name}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default PickupDetails;
