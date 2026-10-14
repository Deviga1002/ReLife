import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi, googleAuth, getDashboardPath } from '../services/api';
import GoogleButton from '../components/GoogleButton';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await googleAuth(credential);
      loginUser(res.data.token, res.data.user);
      toast.success('Account ready via Google');
      navigate(getDashboardPath(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await registerApi(data);
      loginUser(res.data.token, res.data.user);
      toast.success('Account created! Welcome to ReLife');
      navigate(getDashboardPath(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: '1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div className="text-center mb-3">
          <Leaf size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <h1 style={{ fontSize: '1.5rem' }}>Join ReLife</h1>
          <p className="text-muted">Start making a difference today</p>
        </div>

        <div className="mb-3">
          <GoogleButton
            text="Continue with Google"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => toast.error(msg)}
            disabled={googleLoading || loading}
          />
          {googleLoading && (
            <p className="text-muted text-center mt-1" style={{ fontSize: '0.85rem' }}>
              Creating account with Google...
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location (City)</label>
            <input
              id="location"
              className="form-control"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Delhi, Mumbai"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
