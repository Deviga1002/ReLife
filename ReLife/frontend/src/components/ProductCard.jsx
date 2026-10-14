import { Link } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';

const PLACEHOLDER = 'https://via.placeholder.com/400x300?text=ReLife+Item';

const actionColors = {
  Donate: 'badge-green',
  Sell: 'badge-blue',
  Repair: 'badge-yellow',
  Recycle: 'badge-gray',
  Upcycle: 'badge-green',
};

const ProductCard = ({ product }) => {
  const img =
    product.images?.[0]?.url ||
    PLACEHOLDER;

  return (
    <Link to={`/products/${product._id}`} className="card product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }}>
        <img
          src={img}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <span className={`badge ${actionColors[product.action] || 'badge-gray'}`} style={{ position: 'absolute', top: 10, left: 10 }}>
          {product.action}
        </span>
      </div>
      <div className="card-body">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem', lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {product.category}
        </p>
        <div className="flex-between" style={{ fontSize: '0.875rem' }}>
          <span className="flex gap-1" style={{ alignItems: 'center', color: 'var(--text-muted)' }}>
            <MapPin size={14} /> {product.location}
          </span>
          {product.action === 'Sell' && product.price > 0 ? (
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{product.price}</span>
          ) : product.action === 'Donate' ? (
            <span className="badge badge-green">Free</span>
          ) : null}
        </div>
        <div className="mt-1">
          <span className="badge badge-gray">{product.condition}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
