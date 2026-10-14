import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateDetails, updatePassword } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateDetails(form);
      updateUser({ ...user, ...res.data.data });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(passwords);
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>{user?.email}</p>
        <p className="mt-1"><span className="badge badge-green">{({
          admin: 'Administrator',
          user: 'User',
          ngo: 'NGO',
          service_provider: 'Service Provider',
          delivery_partner: 'Delivery Partner',
        })[user?.role] || user?.role}</span></p>
      </div>
      <div className="card mb-3" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Personal Details</h2>
        <form onSubmit={handleDetails}>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button>
        </form>
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Change Password</h2>
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" className="form-control" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
