import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, googleAuth, getDashboardPath, ROLE_OPTIONS } from '../services/api';
import GoogleButton from '../components/GoogleButton';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', selectedRole: 'user' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await googleAuth(credential, form.selectedRole);
      loginUser(res.data.token, res.data.user);
      toast.success('Signed in with Google');
      navigate(from || getDashboardPath(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.selectedRole) {
      toast.error('Please select a role');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({
        email: form.email,
        password: form.password,
        selectedRole: form.selectedRole,
      });
      loginUser(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(from || getDashboardPath(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div className="text-center mb-3">
          <Leaf size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <h1 style={{ fontSize: '1.5rem' }}>Login to ReLife</h1>
          <p className="text-muted">Welcome back to the circular community</p>
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
              Signing in with Google...
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="you@example.com"
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
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label htmlFor="selectedRole">Select Role</label>
            <select
              id="selectedRole"
              className="form-control"
              value={form.selectedRole}
              onChange={(e) => setForm({ ...form, selectedRole: e.target.value })}
              required
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              Choose the role assigned to your account. Wrong role will be rejected.
            </p>
          </div>
          <div className="mb-2" style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
