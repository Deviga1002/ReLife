import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMyProducts()
      .then((res) => setProducts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="page-header flex-between">
        <div>
          <h1>My Listings</h1>
          <p>{products.length} items</p>
        </div>
        <Link to="/products/add" className="btn btn-primary"><Plus size={18} /> Add New</Link>
      </div>
      {products.length === 0 ? (
        <div className="empty-state">
          <p>You haven't listed any items yet.</p>
          <Link to="/products/add" className="btn btn-primary mt-2">List your first item</Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
