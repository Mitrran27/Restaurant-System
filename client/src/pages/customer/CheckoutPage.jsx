import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
import useCartStore from '../../context/cartStore';
import useAuthStore from '../../context/authStore';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, orderType, setOrderType, deliveryAddress, setDeliveryAddress, branchId, notes, setNotes } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getTotal();
  const tax = subtotal * 0.08;
  const deliveryFee = orderType === 'DELIVERY' ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) return toast.error('Enter delivery address');
    if (!branchId) return toast.error('Please select a branch from the menu page');

    setSubmitting(true);
    try {
      const res = await orderAPI.create({
        branchId,
        type: orderType,
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
        notes,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        paymentMethod,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-brand-500 hover:text-brand-700 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <h1 className="page-title mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Order Type */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Order Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'DELIVERY', label: '🚚 Delivery', desc: 'To your door' },
                { value: 'PICKUP',   label: '🛍️ Pickup',   desc: 'Come get it' },
                { value: 'DINE_IN',  label: '🍽️ Dine In',  desc: 'Eat here' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setOrderType(t.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    orderType === t.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-cream-200 hover:border-brand-300'
                  }`}
                >
                  <div className="text-lg mb-1">{t.label}</div>
                  <div className="text-xs text-brand-400">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          {orderType === 'DELIVERY' && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <MapPin size={18} /> Delivery Address
              </h2>
              <textarea
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows={3}
                className="input resize-none"
              />
            </div>
          )}

          {/* Contact */}
          {!user && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Phone size={18} /> Contact (Optional)
              </h2>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
                className="input"
              />
            </div>
          )}

          {/* Notes */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Special Instructions</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any allergies or special requests?"
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <CreditCard size={18} /> Payment Method
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'CASH', label: '💵 Cash', desc: 'Pay on arrival' },
                { value: 'CARD', label: '💳 Card', desc: 'Debit/Credit' },
                { value: 'ONLINE', label: '📱 Online', desc: 'Digital wallet' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setPaymentMethod(p.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === p.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-cream-200 hover:border-brand-300'
                  }`}
                >
                  <div className="text-lg mb-1">{p.label}</div>
                  <div className="text-xs text-brand-400">{p.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-400 mt-3">* Online payment is simulated. No real charges.</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-4">
            <h2 className="section-title mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span className="text-espresso">{item.name} × {item.quantity}</span>
                  <span className="text-brand-600 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-brand-500">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-500">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-brand-500">
                  <span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-cream-200 pt-2 flex justify-between font-bold text-espresso text-lg">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2 text-base py-3"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing Order...</>
              ) : (
                `Place Order · $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
