import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ChefHat, Monitor } from 'lucide-react';
import useAuthStore from '../context/authStore';

export default function POSLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/staff/login'); };

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* POS Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <ChefHat size={15} className="text-white" />
          </div>
          <span className="font-display text-white font-bold">Ember & Oak</span>
          <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <Monitor size={12} /> POS Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name} · {user?.role}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
