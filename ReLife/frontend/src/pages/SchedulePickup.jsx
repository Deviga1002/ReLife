import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMyProducts, getAvailableSlots, createPickup, getProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SchedulePickup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: params.get('productId') || '',
    recipientId: params.get('recipientId') || '',
    date: '',
    timeSlot: '',
    location: user?.location || '',
    instructions: '',
  });
  const [slots, setSlots] = useState({ available: [], taken: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    getMyProducts().then((res) => setProducts(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.date) {
      getAvailableSlots({ date: form.date })
        .then((res) => setSlots(res.data.data))
        .catch(() => setSlots({ available: [], taken: [] }));
    }
  }, [form.date]);

  const selectedProduct = products.find((p) => p._id === form.productId);

  const handleSubmit = async () => {
    if (!form.productId || !form.recipientId || !form.date || !form.timeSlot || !form.location) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await createPickup(form);
      toast.success('Pickup scheduled!');
      navigate(`/pickups/${res.data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule';
      toast.error(msg);
      if (err.response?.data?.alternatives) {
        toast(`Try: ${err.response.data.alternatives.join(', ')}`, { icon: '💡' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1>Schedule Pickup</h1>
        <p>Coordinate collection with the recipient</p>
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Select Your Listing *</label>
              <select className="form-control" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                <option value="">Choose product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.action})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Recipient User ID *</label>
              <input className="form-control" value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })} placeholder="MongoDB user id of recipient" />
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>From donation/purchase request – recipient&apos;s account ID</p>
            </div>
            <div className="form-group">
              <label>Pickup Location *</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Instructions (optional)</label>
              <textarea className="form-control" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={() => {
              if (!form.productId || !form.recipientId || !form.location) { toast.error('Fill required fields'); return; }
              setStep(2);
            }}>Next: Choose Slot</button>
          </>
        )}

        {step === 2 && (
          <>
            {selectedProduct && (
              <p className="mb-2"><strong>{selectedProduct.name}</strong></p>
            )}
            <div className="form-group">
              <label>Pickup Date *</label>
              <input type="date" className="form-control" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })} />
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(slots.available || []).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`btn btn-sm ${form.timeSlot === s ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setForm({ ...form, timeSlot: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.date && slots.available?.length === 0 && (
                <p className="text-muted mt-1">No slots available this day. Try another date.</p>
              )}
              {slots.taken?.length > 0 && (
                <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Taken: {slots.taken.join(', ')}</p>
              )}
            </div>
            <div className="flex gap-1">
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.date || !form.timeSlot) { toast.error('Select date and slot'); return; }
                setStep(3);
              }}>Review</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="mb-2">Confirmation</h3>
            <p><strong>Product:</strong> {selectedProduct?.name}</p>
            <p><strong>Date:</strong> {form.date}</p>
            <p><strong>Slot:</strong> {form.timeSlot}</p>
            <p><strong>Location:</strong> {form.location}</p>
            {form.instructions && <p><strong>Notes:</strong> {form.instructions}</p>}
            <div className="flex gap-1 mt-3">
              <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchedulePickup;
