import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, Package, Truck, MapPin, Star } from 'lucide-react';
import { orderAPI, reviewAPI } from '../../services/api';
import { initSocket } from '../../services/socket';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_STEPS = [
  { status: 'PENDING',          label: 'Order Placed',    icon: Clock,        color: 'text-amber-500' },
  { status: 'CONFIRMED',        label: 'Confirmed',       icon: CheckCircle2, color: 'text-blue-500'  },
  { status: 'PREPARING',        label: 'Being Prepared',  icon: ChefHat,      color: 'text-orange-500'},
  { status: 'READY',            label: 'Ready',           icon: Package,      color: 'text-green-500' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',icon: Truck,        color: 'text-purple-500'},
  { status: 'DELIVERED',        label: 'Delivered',       icon: MapPin,       color: 'text-teal-500'  },
  { status: 'COMPLETED',        label: 'Completed',       icon: CheckCircle2, color: 'text-gray-500'  },
];

const DELIVERY_STATUS_STEPS = STATUS_STEPS;
const PICKUP_STEPS = STATUS_STEPS.filter(s => !['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status));
const DINE_IN_STEPS = STATUS_STEPS.filter(s => !['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status));

// Mock delivery locations
const MOCK_LOCATIONS = [
  'Order picked up from restaurant',
  'Heading down Main Street',
  '2.3 km away from your location',
  '1.1 km away — almost there!',
  'Arrived at your location',
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState(0);
  const { user } = useAuthStore();

  const fetchOrder = useCallback(async () => {
    try {
      const res = await orderAPI.getOne(id);
      setOrder(res.data.data);
      setReviewed(!!res.data.data.review);
    } catch {
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const socket = initSocket();
    socket.emit('join:order', id);
    socket.on('order:statusChanged', (updatedOrder) => {
      if (updatedOrder.id === id) {
        setOrder(updatedOrder);
        toast.success(`Order status: ${updatedOrder.status.replace('_', ' ')}`);
      }
    });
    return () => { socket.off('order:statusChanged'); };
  }, [id, fetchOrder]);

  // Mock delivery tracking simulation
  useEffect(() => {
    if (!order || order.type !== 'DELIVERY' || order.status !== 'OUT_FOR_DELIVERY') return;
    const interval = setInterval(() => {
      setDeliveryStep(s => s < MOCK_LOCATIONS.length - 1 ? s + 1 : s);
    }, 4000);
    return () => clearInterval(interval);
  }, [order?.status]);

  const handleReview = async () => {
    if (!reviewRating) return toast.error('Please select a rating');
    setReviewing(true);
    try {
      await reviewAPI.create({ orderId: id, rating: reviewRating, comment: reviewComment });
      setReviewed(true);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-400 text-lg">Order not found</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const steps = order.type === 'DELIVERY' ? DELIVERY_STATUS_STEPS
    : order.type === 'PICKUP' ? PICKUP_STEPS : DINE_IN_STEPS;

  const currentStepIdx = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = ['COMPLETED', 'DELIVERED'].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-brand-400 text-sm">Order Number</p>
            <h1 className="font-display text-3xl font-bold text-espresso">#{order.orderNumber}</h1>
          </div>
          <span className={`badge ${
            isCancelled ? 'badge-cancelled' :
            order.status === 'PENDING' ? 'badge-pending' :
            order.status === 'CONFIRMED' ? 'badge-confirmed' :
            order.status === 'PREPARING' ? 'badge-preparing' :
            order.status === 'READY' ? 'badge-ready' :
            order.status === 'OUT_FOR_DELIVERY' ? 'badge-delivery' :
            'badge-completed'
          } text-sm px-3 py-1.5`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-brand-400">Type</span>
            <p className="font-medium text-espresso">{order.type.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-brand-400">Total</span>
            <p className="font-medium text-espresso">${parseFloat(order.totalAmount).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-brand-400">Branch</span>
            <p className="font-medium text-espresso">{order.branch?.name}</p>
          </div>
          <div>
            <span className="text-brand-400">Placed</span>
            <p className="font-medium text-espresso">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</p>
          </div>
          {order.tableNumber && (
            <div>
              <span className="text-brand-400">Table</span>
              <p className="font-medium text-espresso">#{order.tableNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="section-title mb-6">Order Progress</h2>
          <div className="relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.status} className="flex items-start gap-4 mb-5 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-brand-500' : 'bg-cream-200'
                    } ${isCurrent ? 'ring-4 ring-brand-200' : ''}`}>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-brand-300'} />
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${isActive && idx < currentStepIdx ? 'bg-brand-500' : 'bg-cream-200'}`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-medium text-sm ${isActive ? 'text-espresso' : 'text-brand-300'}`}>{step.label}</p>
                    {isCurrent && (
                      <p className="text-xs text-brand-400 mt-0.5 animate-pulse-slow">Currently here</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mock Delivery Tracking */}
      {order.type === 'DELIVERY' && order.status === 'OUT_FOR_DELIVERY' && (
        <div className="card p-5 mb-6 border-2 border-purple-200 bg-purple-50">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Truck size={18} className="text-purple-600" /> Live Tracking
          </h2>
          <div className="bg-white rounded-xl p-4 mb-3 h-32 flex items-center justify-center text-4xl border border-cream-200">
            🗺️
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-purple-700">{MOCK_LOCATIONS[deliveryStep]}</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="card p-6 mb-6">
        <h2 className="section-title mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              {item.menuItem.imageUrl && (
                <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-espresso text-sm">{item.menuItem.name}</p>
                <p className="text-xs text-brand-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-brand-600 text-sm">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review section */}
      {isCompleted && user && !reviewed && (
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-500" /> Rate Your Experience
          </h2>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setReviewRating(n)}
                className="transition-transform hover:scale-110"
              >
                <Star size={28} fill={n <= reviewRating ? '#f59e0b' : 'none'} className={n <= reviewRating ? 'text-amber-500' : 'text-cream-300'} />
              </button>
            ))}
          </div>
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder="Tell us about your experience..."
            rows={3}
            className="input resize-none mb-4"
          />
          <button onClick={handleReview} disabled={reviewing} className="btn-primary">
            {reviewing ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {reviewed && (
        <div className="card p-5 bg-green-50 border border-green-200 text-center">
          <p className="text-green-700 font-medium">✓ Thanks for your review!</p>
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/menu" className="btn-ghost">Order Again</Link>
      </div>
    </div>
  );
}
