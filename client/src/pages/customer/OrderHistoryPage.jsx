import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { format } from 'date-fns';

const statusBadgeMap = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing',
  READY: 'badge-ready', OUT_FOR_DELIVERY: 'badge-delivery',
  DELIVERED: 'badge-delivered', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMy()
      .then(res => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="page-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-brand-200 mx-auto mb-4" />
          <p className="text-brand-400 text-lg mb-6">No orders yet</p>
          <Link to="/menu" className="btn-primary">Start Ordering</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 flex items-center gap-4 hover:shadow-warm-lg transition-shadow">
              <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-espresso">#{order.orderNumber}</span>
                  <span className={`badge ${statusBadgeMap[order.status] || 'badge-pending'} text-xs`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-brand-400 truncate">
                  {order.items.map(i => i.menuItem.name).join(', ')}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-brand-300">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                  </span>
                  <span>{order.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-espresso">${parseFloat(order.totalAmount).toFixed(2)}</p>
                <ChevronRight size={16} className="text-brand-300 ml-auto mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
