import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import useCartStore from '../../context/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={36} className="text-brand-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso mb-3">Your cart is empty</h2>
        <p className="text-brand-400 mb-8">Looks like you haven't added anything yet. Browse our menu to get started.</p>
        <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
          Browse Menu <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const subtotal = getTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="page-title mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.menuItemId} className="card p-4 flex items-center gap-4">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-espresso truncate">{item.name}</h3>
                <p className="text-brand-500 font-medium">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-espresso">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold text-espresso">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="section-title mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-brand-500">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-500">
              <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-cream-200 pt-3 flex justify-between font-bold text-espresso">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
            Checkout <ArrowRight size={16} />
          </button>
          <Link to="/menu" className="btn-secondary w-full text-center mt-3 block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
