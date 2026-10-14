import { useEffect, useState } from 'react';
import { getFavorites } from '../services/api';
import ProductCard from '../components/ProductCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Favorites</h1>
        <p>Items you saved</p>
      </div>
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : favorites.length === 0 ? (
        <div className="empty-state"><p>No favorites yet. Browse products and save items you like.</p></div>
      ) : (
        <div className="grid grid-3">
          {favorites.map((f) => f.product && <ProductCard key={f._id} product={f.product} />)}
        </div>
      )}
    </div>
  );
};

export default Favorites;
