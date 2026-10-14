import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const Donations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ action: 'Donate', status: 'available', limit: 24 })
      .then((res) => setProducts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Free Donations</h1>
        <p>Items offered free by the community</p>
      </div>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state"><p>No donation items available right now.</p></div>
      ) : (
        <div className="grid grid-3">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Donations;
