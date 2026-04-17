import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { analyticsAPI, orderAPI, branchAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { initSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#8B5E3C', '#C4956A', '#E8C98A', '#F5E9CC'];

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-100`}>
          <Icon size={20} className={`text-${color}-600`} />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-espresso">{value}</p>
      <p className="text-sm text-brand-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-600 mt-1 font-medium">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { period, ...(branchId ? { branchId } : {}) };
      const [statsRes, revRes, bsRes, otRes, ordRes, brRes] = await Promise.all([
        analyticsAPI.getStats(params),
        analyticsAPI.getRevenue({ days: period === '1d' ? 1 : period === '7d' ? 7 : 30, branchId }),
        analyticsAPI.getBestSellers({ limit: 5, branchId }),
        analyticsAPI.getOrderTypes({ branchId }),
        orderAPI.getAll({ limit: 5, branchId }),
        branchAPI.getAll(),
      ]);
      setStats(statsRes.data.data);
      setRevenue(revRes.data.data);
      setBestSellers(bsRes.data.data);
      setOrderTypes(otRes.data.data);
      setRecentOrders(ordRes.data.data);
      setBranches(brRes.data.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [period, branchId]);

  useEffect(() => {
    const socket = initSocket();
    socket.emit('join:role', 'ADMIN');
    socket.on('order:new', () => { loadData(); toast.success('New order received!'); });
    return () => socket.off('order:new');
  }, []);

  const statusBadge = (s) => {
    const map = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing', READY: 'badge-ready', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled', OUT_FOR_DELIVERY: 'badge-delivery' };
    return <span className={`badge ${map[s] || 'badge-pending'} text-xs`}>{s.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-brand-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3">
          {branches.length > 1 && (
            <select value={branchId} onChange={e => setBranchId(e.target.value)} className="input text-sm w-auto">
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm w-auto">
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button onClick={loadData} className="btn-secondary p-2.5 flex-shrink-0">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-cream-100" />)}
        </div>
      ) : stats && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="blue" />
            <StatCard icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} color="green" />
            <StatCard icon={TrendingUp} label="Completion Rate" value={`${stats.completionRate}%`} color="brand" />
            <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} color="amber" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 card p-5">
              <h2 className="section-title mb-4">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E9CC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#C4956A' }}
                    tickFormatter={d => format(new Date(d), 'MMM d')} />
                  <YAxis tick={{ fontSize: 11, fill: '#C4956A' }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']}
                    labelFormatter={l => format(new Date(l), 'MMM d, yyyy')}
                    contentStyle={{ fontFamily: '"DM Sans"', borderRadius: 12, border: '1px solid #E8C98A' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#8B5E3C" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5E3C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Order Types Pie */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Order Types</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={orderTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                    {orderTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Best Sellers</h2>
              <div className="space-y-3">
                {bestSellers.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center text-xs font-bold text-brand-500">{i + 1}</span>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-espresso text-sm truncate">{item.name}</p>
                      <p className="text-xs text-brand-400">{item.category?.name}</p>
                    </div>
                    <span className="badge bg-brand-50 text-brand-600 font-semibold">{item.totalSold} sold</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Recent Orders</h2>
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-espresso text-sm">#{order.orderNumber}</span>
                        {statusBadge(order.status)}
                      </div>
                      <p className="text-xs text-brand-400 mt-0.5">{order.type.replace('_', ' ')} · {format(new Date(order.createdAt), 'h:mm a')}</p>
                    </div>
                    <span className="font-semibold text-espresso text-sm">${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
