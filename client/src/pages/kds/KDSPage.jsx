import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Clock, CheckCircle, AlertTriangle, RefreshCw, LogOut, Bell } from 'lucide-react';
import { orderAPI, branchAPI } from '../../services/api';
import { initSocket } from '../../services/socket';
import useAuthStore from '../../context/authStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDING:   { border: 'border-amber-500',  bg: 'bg-amber-950/20',  dot: 'bg-amber-400'  },
  CONFIRMED: { border: 'border-blue-500',   bg: 'bg-blue-950/20',   dot: 'bg-blue-400'   },
  PREPARING: { border: 'border-orange-400', bg: 'bg-orange-950/20', dot: 'bg-orange-400' },
};

const NEXT_STATUS = { PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY' };
const NEXT_LABEL  = { PENDING: 'Confirm Order', CONFIRMED: 'Start Cooking', PREPARING: '✓ Mark Ready' };
const NEXT_BTN    = {
  PENDING:   'bg-blue-600 hover:bg-blue-500',
  CONFIRMED: 'bg-orange-600 hover:bg-orange-500',
  PREPARING: 'bg-green-600 hover:bg-green-500',
};

function OrderTimer({ createdAt }) {
  const [mins, setMins] = useState(differenceInMinutes(new Date(), new Date(createdAt)));

  useEffect(() => {
    const iv = setInterval(() => setMins(differenceInMinutes(new Date(), new Date(createdAt))), 30000);
    return () => clearInterval(iv);
  }, [createdAt]);

  const isDelayed = mins >= 15;
  const isWarning = mins >= 10;

  return (
    <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
      isDelayed ? 'bg-red-900/50 text-red-300' :
      isWarning ? 'bg-amber-900/50 text-amber-300' :
      'bg-gray-800 text-gray-400'
    }`}>
      <Clock size={11} />
      {mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`}
    </span>
  );
}

function OrderCard({ order, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const ageMinutes = differenceInMinutes(new Date(), new Date(order.createdAt));
  const isDelayed = ageMinutes >= 15;
  const style = STATUS_STYLES[order.status] || { border: 'border-gray-700', bg: 'bg-gray-900', dot: 'bg-gray-500' };
  const nextStatus = NEXT_STATUS[order.status];

  const handleNext = async () => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(order.id, { status: nextStatus });
      if (nextStatus === 'READY') toast.success(`🎉 Order #${order.orderNumber} is READY!`);
      else toast.success(`Order #${order.orderNumber} → ${nextStatus.replace('_', ' ')}`);
      onUpdate();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`border-2 ${style.border} ${style.bg} rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isDelayed ? 'kds-card-delayed' : ''}`}>
      {/* Card Header */}
      <div className="px-4 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot} ${order.status === 'PREPARING' ? 'animate-pulse' : ''}`} />
          <span className="font-mono font-bold text-white text-base">#{order.orderNumber}</span>
          {order.tableNumber && (
            <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
              Table {order.tableNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDelayed && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <AlertTriangle size={12} className="animate-pulse" /> DELAYED
            </span>
          )}
          <OrderTimer createdAt={order.createdAt} />
        </div>
      </div>

      {/* Order meta */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          order.type === 'DINE_IN'  ? 'bg-purple-900/50 text-purple-300' :
          order.type === 'PICKUP'   ? 'bg-cyan-900/50 text-cyan-300' :
          'bg-indigo-900/50 text-indigo-300'
        }`}>
          {order.type === 'DINE_IN' ? '🍽️ Dine In' : order.type === 'PICKUP' ? '🛍️ Pickup' : '🚚 Delivery'}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          order.status === 'PENDING'   ? 'bg-amber-900/50 text-amber-300' :
          order.status === 'CONFIRMED' ? 'bg-blue-900/50 text-blue-300' :
          'bg-orange-900/50 text-orange-300'
        }`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm">
              {item.quantity}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm leading-snug">{item.menuItem.name}</p>
              {item.notes && (
                <p className="text-xs text-yellow-400 mt-0.5 bg-yellow-900/20 rounded px-1.5 py-0.5 border border-yellow-800/30">
                  ⚠ {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}

        {order.notes && (
          <div className="mt-2 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-2.5">
            <p className="text-xs text-yellow-300 flex items-start gap-1.5">
              <span className="text-sm flex-shrink-0">📋</span>
              <span>{order.notes}</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {nextStatus && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleNext}
            disabled={updating}
            className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 ${NEXT_BTN[order.status]}`}
          >
            {updating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle size={15} />
            )}
            {NEXT_LABEL[order.status]}
          </button>
        </div>
      )}
    </div>
  );
}

export default function KDSPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      const res = await orderAPI.getKitchen(params);
      setOrders(res.data.data);
      setLastRefresh(new Date());
    } catch {
      // silent fail on auto-refresh
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    branchAPI.getAll().then((res) => {
      setBranches(res.data.data);
      const userBranch = res.data.data.find((b) => b.id === user?.branchId) || res.data.data[0];
      if (userBranch) setBranchId(userBranch.id);
    });
  }, [user]);

  useEffect(() => {
    if (!branchId) return;
    fetchOrders();
    // Auto-refresh every 20 seconds
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [fetchOrders, branchId]);

  useEffect(() => {
    const socket = initSocket();
    socket.emit('join:role', 'KITCHEN');
    if (branchId) socket.emit('join:branch', branchId);

    socket.on('order:new', (newOrder) => {
      fetchOrders();
      setNewOrderFlash(true);
      setTimeout(() => setNewOrderFlash(false), 2000);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">New Order #{newOrder.orderNumber}!</p>
              <p className="text-xs text-gray-500">{newOrder.type?.replace('_', ' ')} · {newOrder.items?.length} item(s)</p>
            </div>
          </div>
        ),
        { duration: 5000, style: { background: '#1f2937', color: 'white', border: '1px solid #374151' } }
      );
    });

    socket.on('order:statusChanged', fetchOrders);

    return () => {
      socket.off('order:new');
      socket.off('order:statusChanged');
    };
  }, [branchId, fetchOrders]);

  const counts = {
    all:       orders.length,
    PENDING:   orders.filter((o) => o.status === 'PENDING').length,
    CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
  };

  const displayed = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  const filterTabs = [
    { value: '', label: 'All', count: counts.all, color: 'bg-gray-600' },
    { value: 'PENDING',   label: 'Pending',   count: counts.PENDING,   color: 'bg-amber-600'  },
    { value: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED, color: 'bg-blue-600'   },
    { value: 'PREPARING', label: 'Preparing', count: counts.PREPARING, color: 'bg-orange-600' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans">
      {/* KDS Header */}
      <header className={`border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors duration-500 ${newOrderFlash ? 'bg-amber-900/40' : 'bg-gray-900'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <ChefHat size={17} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-base">Kitchen Display</span>
            {branches.length > 1 && (
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="ml-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
              >
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Filter tabs (center) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterStatus === tab.value
                  ? `${tab.color} text-white shadow-lg`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === tab.value ? 'bg-black/30 text-white' : 'bg-gray-700 text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:block text-xs text-gray-500">
            Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </span>
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors text-sm rounded-lg px-2 py-1.5 hover:bg-red-950/30"
          >
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile filter tabs */}
      <div className="sm:hidden flex gap-1.5 px-4 py-2 bg-gray-900 border-b border-gray-800 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === tab.value ? `${tab.color} text-white` : 'text-gray-400 bg-gray-800'
            }`}
          >
            {tab.label} <span className="bg-black/30 rounded-full px-1">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="bg-gray-900/50 border-b border-gray-800/50 px-4 sm:px-6 py-2 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-gray-400">{counts.PENDING} pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs text-gray-400">{counts.CONFIRMED} confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs text-gray-400">{counts.PREPARING} cooking</span>
        </div>
        <div className="ml-auto text-xs text-gray-600">
          {orders.filter(o => differenceInMinutes(new Date(), new Date(o.createdAt)) >= 15).length > 0 && (
            <span className="text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle size={11} />
              {orders.filter(o => differenceInMinutes(new Date(), new Date(o.createdAt)) >= 15).length} delayed
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading kitchen queue...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-400 mb-1">All caught up!</h2>
            <p className="text-gray-600 text-sm">
              {filterStatus ? `No orders with status "${filterStatus}"` : 'No active orders in the queue'}
            </p>
            <p className="text-gray-700 text-xs mt-2">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {displayed.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom ticker for delayed orders */}
      {orders.filter(o => differenceInMinutes(new Date(), new Date(o.createdAt)) >= 15).length > 0 && (
        <div className="bg-red-950/40 border-t border-red-800/50 px-4 py-2 flex items-center gap-3">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0 animate-pulse" />
          <p className="text-xs text-red-400 font-medium">
            {orders.filter(o => differenceInMinutes(new Date(), new Date(o.createdAt)) >= 15).length} order(s) have been waiting over 15 minutes —{' '}
            {orders.filter(o => differenceInMinutes(new Date(), new Date(o.createdAt)) >= 15).map(o => `#${o.orderNumber}`).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
