import { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { orderAPI, branchAPI } from '../../services/api';
import { format } from 'date-fns';
import { initSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const TYPES = ['', 'DINE_IN', 'PICKUP', 'DELIVERY'];
const NEXT_STATUS = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY',
  READY: 'COMPLETED', OUT_FOR_DELIVERY: 'DELIVERED',
};
const badgeMap = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing',
  READY: 'badge-ready', OUT_FOR_DELIVERY: 'badge-delivery', DELIVERED: 'badge-delivered',
  COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (status) params.status = status;
      if (type) params.type = type;
      if (branchId) params.branchId = branchId;
      const res = await orderAPI.getAll(params);
      setOrders(res.data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    branchAPI.getAll().then(res => setBranches(res.data.data));
  }, []);

  useEffect(() => { fetchOrders(); }, [status, type, branchId]);

  useEffect(() => {
    const socket = initSocket();
    socket.emit('join:role', 'ADMIN');
    socket.on('order:new', () => { fetchOrders(); toast.success('New order!'); });
    socket.on('order:statusChanged', () => fetchOrders());
    return () => { socket.off('order:new'); socket.off('order:statusChanged'); };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Order ${newStatus.replace('_', ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Orders</h1>
        <button onClick={fetchOrders} className="btn-secondary p-2.5"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-auto text-sm">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="input w-auto text-sm">
          {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
        {branches.length > 1 && (
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className="input w-auto text-sm">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-brand-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {['Order #', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Time', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <>
                    <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-espresso text-sm">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-espresso">{order.user?.name || 'Guest'}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-cream-100 text-brand-600 text-xs">{order.type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-semibold text-espresso text-sm">${parseFloat(order.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${badgeMap[order.status] || 'badge-pending'} text-xs`}>{order.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-400">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {NEXT_STATUS[order.status] && (
                            <button
                              onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                              disabled={updatingId === order.id}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              {updatingId === order.id ? '...' : `→ ${NEXT_STATUS[order.status]}`}
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(order.status) && (
                            <button
                              onClick={() => updateStatus(order.id, 'CANCELLED')}
                              className="btn-danger text-xs py-1 px-2"
                            >Cancel</button>
                          )}
                          <button
                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            {expandedId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-expanded`} className="bg-cream-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-espresso mb-2">Order Items:</p>
                              {order.items.map(item => (
                                <div key={item.id} className="flex justify-between text-brand-500 py-1 border-b border-cream-200 last:border-0">
                                  <span>{item.menuItem.name} × {item.quantity}</span>
                                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1 text-brand-500">
                              {order.tableNumber && <p>Table: <span className="text-espresso font-medium">{order.tableNumber}</span></p>}
                              {order.deliveryAddress && <p>Address: <span className="text-espresso font-medium">{order.deliveryAddress}</span></p>}
                              {order.notes && <p>Notes: <span className="text-espresso font-medium">{order.notes}</span></p>}
                              <p>Payment: <span className={`badge ${order.payment?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'badge-pending'} text-xs`}>{order.payment?.method} · {order.payment?.status}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
