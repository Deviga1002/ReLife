import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../services/api';
import {
  Leaf,
  Menu,
  X,
  Home,
  Package,
  Heart,
  Recycle,
  Wrench,
  Lightbulb,
  LayoutDashboard,
  User,
  LogOut,
  Bell,
  Shield,
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <Leaf size={28} color="#16a34a" />
          <span>ReLife</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            <Home size={18} /> Home
          </NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            <Package size={18} /> Browse
          </NavLink>
          <NavLink to="/donations" onClick={() => setOpen(false)}>
            <Heart size={18} /> Donations
          </NavLink>
          <NavLink to="/recycling" onClick={() => setOpen(false)}>
            <Recycle size={18} /> Recycle
          </NavLink>
          <NavLink to="/repair" onClick={() => setOpen(false)}>
            <Wrench size={18} /> Repair
          </NavLink>
          <NavLink to="/upcycling" onClick={() => setOpen(false)}>
            <Lightbulb size={18} /> Upcycle
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to={getDashboardPath(user?.role)} onClick={() => setOpen(false)}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/pickups" onClick={() => setOpen(false)}>
                Pickups
              </NavLink>
              <NavLink to="/chat" onClick={() => setOpen(false)}>
                Chat
              </NavLink>
              <NavLink to="/rewards" onClick={() => setOpen(false)}>
                Rewards
              </NavLink>
              <NavLink to="/notifications" onClick={() => setOpen(false)}>
                <Bell size={18} /> Alerts
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>
                  <Shield size={18} /> Admin
                </NavLink>
              )}
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                <User size={18} /> {user?.name?.split(' ')[0]}
              </NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
