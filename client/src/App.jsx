import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Customer pages
import CustomerLayout from './layouts/CustomerLayout';
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';

// QR ordering
import QROrderPage from './pages/customer/QROrderPage';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminBranches from './pages/admin/AdminBranches';
import AdminStaff from './pages/admin/AdminStaff';

// POS pages
import POSLayout from './layouts/POSLayout';
import POSPage from './pages/pos/POSPage';

// KDS pages
import KDSPage from './pages/kds/KDSPage';

// Auth guard
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: '"DM Sans", sans-serif', borderRadius: '12px' },
          success: { style: { background: '#f5e6cc', color: '#2C1810', border: '1px solid #d4a853' } },
          error:   { style: { background: '#fff1f1', color: '#dc2626', border: '1px solid #fca5a5' } },
        }}
      />
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="orders/:id" element={<OrderTrackingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* QR table ordering */}
        <Route path="/qr/:tableId" element={<QROrderPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="branches" element={<AdminBranches />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>

        {/* POS routes */}
        <Route path="/pos" element={<ProtectedRoute allowedRoles={['CASHIER', 'ADMIN']}><POSLayout /></ProtectedRoute>}>
          <Route index element={<POSPage />} />
        </Route>

        {/* KDS routes */}
        <Route path="/kds" element={<ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN', 'CASHIER']}><KDSPage /></ProtectedRoute>} />

        {/* Staff login */}
        <Route path="/staff/login" element={<LoginPage staff />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
