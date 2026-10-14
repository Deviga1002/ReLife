import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getProduct,
  createDonationRequest,
  createPurchaseRequest,
  toggleFavorite,
  deleteProduct,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Eye, Heart, Edit, Trash2, ArrowLeft, MessageCircle } from 'lucide-react';

const PLACEHOLDER = 'https://via.placeholder.com/600x400?text=ReLife+Item';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && product?.owner?._id === user._id;

  const handleRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      if (product.action === 'Donate') {
        await createDonationRequest({ productId: id, message });
        toast.success('Donation request sent!');
      } else if (product.action === 'Sell') {
        await createPurchaseRequest({ productId: id, message });
        toast.success('Purchase request sent!');
      }
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await toggleFavorite(id);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await deleteProduct(id);
      toast.success('Listing removed');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!product) return <div className="container empty-state"><p>Product not found</p><Link to="/products">Back</Link></div>;

  const img = product.images?.[0]?.url || PLACEHOLDER;

  return (
    <div className="container">
      <Link to="/products" className="flex gap-1 mb-2" style={{ alignItems: 'center', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <img
            src={img}
            alt={product.name}
            style={{ width: '100%', borderRadius: 12, aspectRatio: '4/3', objectFit: 'cover', background: '#f1f5f9' }}
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          {product.images?.length > 1 && (
            <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
              {product.images.slice(1).map((im, i) => (
                <img key={i} src={im.url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-1 mb-2">
            <span className="badge badge-green">{product.action}</span>
            <span className="badge badge-gray">{product.condition}</span>
            <span className="badge badge-blue">{product.status}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>{product.name}</h1>
          <p className="text-muted mb-2">{product.category}</p>

          {product.action === 'Sell' && (
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
              ₹{product.price}
            </p>
          )}
          {product.action === 'Donate' && (
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>Free Donation</p>
          )}

          <p style={{ marginBottom: 16, lineHeight: 1.7 }}>{product.description}</p>

          <div className="flex gap-2 mb-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span className="flex gap-1" style={{ alignItems: 'center' }}><MapPin size={16} /> {product.location}</span>
            <span className="flex gap-1" style={{ alignItems: 'center' }}><Eye size={16} /> {product.views} views</span>
          </div>

          {product.owner && (
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Listed by <strong>{product.owner.name}</strong>
            </p>
          )}

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {isOwner ? (
              <>
                <Link to={`/products/edit/${id}`} className="btn btn-outline"><Edit size={16} /> Edit</Link>
                <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16} /> Delete</button>
              </>
            ) : product.status === 'available' && (product.action === 'Donate' || product.action === 'Sell') ? (
              <>
                <div style={{ width: '100%' }}>
                  <textarea
                    className="form-control mb-2"
                    placeholder="Optional message to owner..."
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleRequest} disabled={submitting}>
                    {submitting ? 'Sending...' : product.action === 'Donate' ? 'Request Donation' : 'Request to Buy'}
                  </button>
                </div>
              </>
            ) : null}
            <button className="btn btn-outline" onClick={handleFavorite}>
              <Heart size={16} /> Favorite
            </button>
            {!isOwner && product.owner && (
              <Link
                to={`/chat?productId=${id}&otherUserId=${product.owner._id || product.owner}`}
                className="btn btn-outline"
              >
                <MessageCircle size={16} /> Message
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
