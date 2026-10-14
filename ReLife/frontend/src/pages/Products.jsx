import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Clothes and Fashion',
  'Books and Stationery',
  'Food and Groceries',
  'Electronics',
  'Furniture',
  'Home Appliances',
  'Toys and Accessories',
  'Other Items',
];
const ACTIONS = ['Donate', 'Sell', 'Repair', 'Recycle', 'Upcycle'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    action: searchParams.get('action') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: searchParams.get('page') || '1',
  };

  useEffect(() => {
    setLoading(true);
    getProducts({ ...filters, status: 'available', limit: 12 })
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>Browse Products</h1>
          <p>{total} items available</p>
        </div>
        {isAuthenticated && (
          <Link to="/products/add" className="btn btn-primary">
            <Plus size={18} /> List Item
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-3" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 32 }}
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          <select className="form-control" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="form-control" value={filters.action} onChange={(e) => updateFilter('action', e.target.value)}>
            <option value="">All Actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="form-control" value={filters.condition} onChange={(e) => updateFilter('condition', e.target.value)}>
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            className="form-control"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
          <select className="form-control" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found. Try adjusting filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex-center gap-2 mt-3">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${filters.page === String(p) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateFilter('page', String(p))}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
