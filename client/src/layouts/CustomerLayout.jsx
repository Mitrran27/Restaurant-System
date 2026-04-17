import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Bell, LogOut, ChefHat } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../context/authStore';
import useCartStore from '../context/cartStore';

export default function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
  ];

  return (
    <div className="min-h-screen bg-foam flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-cream-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <ChefHat size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-espresso">Ember & Oak</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === l.to
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-espresso hover:bg-cream-100'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-xl hover:bg-cream-100 transition-colors">
                <ShoppingCart size={22} className="text-espresso" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/orders" className="btn-ghost text-sm flex items-center gap-2">
                    <User size={16} /> Orders
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-2 text-red-500 hover:bg-red-50">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex btn-primary text-sm py-2 px-4">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-xl hover:bg-cream-100"
                onClick={() => setMobileOpen(o => !o)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-cream-200 bg-white px-4 py-3 flex flex-col gap-1 animate-slide-down">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-espresso hover:bg-cream-100"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-espresso hover:bg-cream-100">My Orders</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center mt-2">Sign In</Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-espresso text-cream-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat size={18} className="text-latte" />
            <span className="font-display text-lg text-white">Ember & Oak</span>
          </div>
          <p className="text-sm text-cream-300">© {new Date().getFullYear()} Ember & Oak Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
