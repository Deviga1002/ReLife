import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import MyListings from './pages/MyListings';
import Donations from './pages/Donations';
import DonationRequests from './pages/DonationRequests';
import SellPurchase from './pages/SellPurchase';
import { Repair, Recycling, Upcycling } from './pages/ServicePage';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Sustainability from './pages/Sustainability';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import {
  UserDashboard,
  AdminDashboardPage,
  NgoDashboard,
  ProviderDashboard,
  DeliveryDashboard,
} from './pages/RoleDashboards';
import Pickups from './pages/Pickups';
import SchedulePickup from './pages/SchedulePickup';
import PickupDetails from './pages/PickupDetails';
import Chat from './pages/Chat';
import Rewards from './pages/Rewards';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/repair" element={<Repair />} />
            <Route path="/recycling" element={<Recycling />} />
            <Route path="/upcycling" element={<Upcycling />} />
            <Route path="/sustainability" element={<Sustainability />} />

            {/* Shared authenticated pages */}
            <Route path="/pickups" element={<ProtectedRoute><Pickups /></ProtectedRoute>} />
            <Route path="/pickups/schedule" element={<ProtectedRoute><SchedulePickup /></ProtectedRoute>} />
            <Route path="/pickups/:id" element={<ProtectedRoute><PickupDetails /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />

            <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/donation-requests" element={<ProtectedRoute><DonationRequests /></ProtectedRoute>} />
            <Route path="/sell-purchase" element={<ProtectedRoute><SellPurchase /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Role dashboards – protected by role */}
            <Route
              path="/user/dashboard"
              element={<ProtectedRoute roles={['user', 'admin']}><UserDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/ngo/dashboard"
              element={<ProtectedRoute roles={['ngo', 'admin']}><NgoDashboard /></ProtectedRoute>}
            />
            <Route
              path="/service-provider/dashboard"
              element={<ProtectedRoute roles={['service_provider', 'admin']}><ProviderDashboard /></ProtectedRoute>}
            />
            <Route
              path="/delivery/dashboard"
              element={<ProtectedRoute roles={['delivery_partner', 'admin']}><DeliveryDashboard /></ProtectedRoute>}
            />

            {/* Admin management panel */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/ngo-dashboard" element={<Navigate to="/ngo/dashboard" replace />} />
            <Route path="/provider-dashboard" element={<Navigate to="/service-provider/dashboard" replace />} />
            <Route path="/delivery-dashboard" element={<Navigate to="/delivery/dashboard" replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
