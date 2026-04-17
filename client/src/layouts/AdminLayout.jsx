import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Package,
  BarChart3, GitBranch, Users, LogOut, ChefHat, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../context/authStore';

const navItems = [
  { to: '/admin',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/orders',    label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/menu',      label: 'Menu',       icon: UtensilsCrossed },
  { to: '/admin/inventory', label: 'Inventory',  icon: Package },
  { to: '/admin/analytics', label: 'Analytics',  icon: BarChart3 },
  { to: '/admin/branches',  label: 'Branches',   icon: GitBranch },
  { to: '/admin/staff',     label: 'Staff',      icon: Users },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/staff/login'); };

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-espresso flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="ml-3 font-display text-white text-lg font-bold truncate">Ember & Oak</span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-cream-300 hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-cream-400 text-xs">Signed in as</p>
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span className="badge bg-brand-500/30 text-brand-200 text-xs mt-1">{user?.role}</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-cream-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-cream-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
