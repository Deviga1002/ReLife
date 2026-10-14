import { useEffect, useState } from 'react';
import { getSustainability } from '../services/api';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Sustainability = () => {
  const [data, setData] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      getSustainability()
        .then((res) => setData(res.data.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="page-header text-center">
        <Leaf size={40} color="#16a34a" style={{ margin: '0 auto 8px' }} />
        <h1>Sustainability Dashboard</h1>
        <p>Platform-wide environmental impact estimates</p>
      </div>
      {!isAuthenticated ? (
        <div className="empty-state">
          <p>Please <Link to="/login">login</Link> to view sustainability stats.</p>
        </div>
      ) : !data ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <div className="grid grid-3 mb-3">
            <div className="text-center">
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{data.totalItemsReused}</p>
              <p className="text-muted">Items Reused</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{data.wasteDivertedKg} kg</p>
              <p className="text-muted">Waste Diverted</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{data.co2AvoidedKg} kg</p>
              <p className="text-muted">CO₂ Avoided</p>
            </div>
          </div>
          {data.byCategory && Object.keys(data.byCategory).length > 0 && (
            <>
              <h3 className="mb-2">By Category (kg)</h3>
              {Object.entries(data.byCategory).map(([cat, kg]) => (
                <div key={cat} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{cat}</span>
                  <strong>{Math.round(kg * 10) / 10} kg</strong>
                </div>
              ))}
            </>
          )}
          <p className="text-muted mt-3" style={{ fontSize: '0.85rem' }}>{data.note}</p>
        </div>
      )}
    </div>
  );
};

export default Sustainability;
