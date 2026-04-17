import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function LoginPage({ staff = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      const from = location.state?.from?.pathname;
      if (result.user.role === 'ADMIN') navigate(from || '/admin');
      else if (result.user.role === 'CASHIER') navigate(from || '/pos');
      else if (result.user.role === 'KITCHEN') navigate(from || '/kds');
      else navigate(from || '/');
    } else {
      toast.error(result.message);
    }
  };

  const quickLogins = staff ? [
    { label: 'Admin', email: 'admin@restaurant.com', password: 'admin123' },
    { label: 'Cashier', email: 'cashier@restaurant.com', password: 'cashier123' },
    { label: 'Kitchen', email: 'kitchen@restaurant.com', password: 'kitchen123' },
  ] : [
    { label: 'Customer', email: 'customer@example.com', password: 'customer123' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
            <ChefHat size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso">
            {staff ? 'Staff Login' : 'Welcome Back'}
          </h1>
          <p className="text-brand-400 text-sm mt-1">
            {staff ? 'Sign in with your staff credentials' : 'Sign in to your account'}
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input pr-10"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300 hover:text-brand-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
              {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-5 pt-5 border-t border-cream-200">
            <p className="text-xs text-brand-400 text-center mb-3">Quick demo login:</p>
            <div className="grid grid-cols-{quickLogins.length} gap-2">
              {quickLogins.map(q => (
                <button
                  key={q.label}
                  onClick={() => { setEmail(q.email); setPassword(q.password); }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {!staff && (
            <p className="text-center text-sm text-brand-400 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">Register</Link>
            </p>
          )}
          {!staff && (
            <p className="text-center text-xs text-brand-300 mt-3">
              Staff?{' '}
              <Link to="/staff/login" className="text-brand-400 hover:text-brand-600">Staff login →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
