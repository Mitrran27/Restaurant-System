import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    const loginPath = allowedRoles.includes('CUSTOMER') ? '/login' : '/staff/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'CASHIER') return <Navigate to="/pos" replace />;
    if (user.role === 'KITCHEN') return <Navigate to="/kds" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
