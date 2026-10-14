import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Clothes and Fashion', 'Books and Stationery', 'Food and Groceries',
  'Electronics', 'Furniture', 'Home Appliances', 'Toys and Accessories', 'Other Items',
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];
const ACTIONS = ['Donate', 'Sell', 'Repair', 'Recycle', 'Upcycle'];

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '', description: '', category: '', condition: '', action: 'Donate',
    price: 0, location: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.condition || !form.location) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((file) => fd.append('images', file));
      const res = await createProduct(fd);
      toast.success('Product listed successfully!');
      navigate(`/products/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>List a New Item</h1>
        <p>Share items you no longer need with the community</p>
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Condition *</label>
              <select className="form-control" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} required>
                <option value="">Select</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Action *</label>
              <select className="form-control" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {form.action === 'Sell' && (
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" min="0" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="City" />
          </div>
          <div className="form-group">
            <label>Images (max 5, each ≤ 5MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="form-control"
              onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            />
            {images.length > 0 && <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>{images.length} file(s) selected</p>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Uploading...' : 'List Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
