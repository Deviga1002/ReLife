import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Clothes and Fashion', 'Books and Stationery', 'Food and Groceries',
  'Electronics', 'Furniture', 'Home Appliances', 'Toys and Accessories', 'Other Items',
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];
const ACTIONS = ['Donate', 'Sell', 'Repair', 'Recycle', 'Upcycle'];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((res) => {
        const p = res.data.data;
        setForm({
          name: p.name,
          description: p.description,
          category: p.category,
          condition: p.condition,
          action: p.action,
          price: p.price,
          location: p.location,
        });
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append('images', f));
      await updateProduct(id, fd);
      toast.success('Product updated');
      navigate(`/products/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>Edit Product</h1>
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select className="form-control" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Action</label>
              <select className="form-control" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {form.action === 'Sell' && (
              <div className="form-group">
                <label>Price</label>
                <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Add more images</label>
            <input type="file" accept="image/*" multiple className="form-control" onChange={(e) => setImages(Array.from(e.target.files))} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
