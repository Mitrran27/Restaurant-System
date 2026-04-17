import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Send, ChefHat } from 'lucide-react';
import { menuAPI, branchAPI, orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function QROrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('menu'); // menu | cart | success
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  useEffect(() => {
    branchAPI.getAll().then(res => {
      setBranches(res.data.data);
      if (res.data.data.length > 0) setSelectedBranch(res.data.data[0].id);
    });
    menuAPI.getCategories().then(res => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    setLoading(true);
    menuAPI.getItems({ branchId: selectedBranch })
      .then(res => setMenu(res.data.data))
      .finally(() => setLoading(false));
  }, [selectedBranch]);

  const addToCart = (itemId) => setCart(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
  const removeFromCart = (itemId) => setCart(c => {
    const next = { ...c };
    if (next[itemId] <= 1) delete next[itemId];
    else next[itemId]--;
    return next;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menu.find(m => m.id === id);
    return item ? { ...item, quantity: qty } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  const placeOrder = async () => {
    if (!cartItems.length) return toast.error('Add items first');
    setSubmitting(true);
    try {
      const res = await orderAPI.create({
        branchId: selectedBranch,
        type: 'DINE_IN',
        tableNumber: tableId,
        notes,
        items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        paymentMethod: 'CASH',
      });
      setPlacedOrderNumber(res.data.data.orderNumber);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-foam flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso mb-2">Order Placed!</h1>
          <p className="text-brand-400 mb-2">Your order has been sent to the kitchen.</p>
          <div className="card p-4 my-6">
            <p className="text-brand-400 text-sm">Order Number</p>
            <p className="font-display text-3xl font-bold text-espresso">#{placedOrderNumber}</p>
            <p className="text-sm text-brand-400 mt-1">Table {tableId}</p>
          </div>
          <p className="text-sm text-brand-400">Sit back and relax — we'll bring your food to you! 🍽️</p>
          <button onClick={() => { setCart({}); setStep('menu'); }} className="btn-secondary mt-6 w-full">Order More</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foam">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <ChefHat size={15} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-espresso text-sm">Ember & Oak</span>
              <span className="text-xs text-brand-400 ml-2">Table {tableId}</span>
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setStep('cart')}
              className="relative flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <ShoppingCart size={16} />
              <span>{cartCount} items · ${total.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      {step === 'menu' && (
        <div className="max-w-xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-4 flex gap-4 animate-pulse">
                  <div className="w-20 h-20 bg-cream-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-cream-200 rounded w-3/4" /><div className="h-3 bg-cream-100 rounded" /></div>
                </div>
              ))}
            </div>
          ) : (
            categories.map(cat => {
              const catItems = menu.filter(m => m.category?.id === cat.id);
              if (!catItems.length) return null;
              return (
                <div key={cat.id} className="mb-8">
                  <h2 className="font-display text-xl font-bold text-espresso mb-4">{cat.name}</h2>
                  <div className="space-y-3">
                    {catItems.map(item => (
                      <div key={item.id} className={`card p-4 flex gap-4 ${!item.inStock ? 'opacity-50' : ''}`}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-espresso text-sm">{item.name}</h3>
                          {item.description && <p className="text-xs text-brand-400 mt-0.5 line-clamp-2">{item.description}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-brand-600">${parseFloat(item.price).toFixed(2)}</span>
                            {item.inStock ? (
                              <div className="flex items-center gap-2">
                                {cart[item.id] > 0 && (
                                  <>
                                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center">
                                      <Minus size={13} />
                                    </button>
                                    <span className="w-6 text-center font-semibold text-sm">{cart[item.id]}</span>
                                  </>
                                )}
                                <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                                  <Plus size={13} />
                                </button>
                              </div>
                            ) : (
                              <span className="badge bg-red-100 text-red-600 text-xs">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {step === 'cart' && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <button onClick={() => setStep('menu')} className="text-brand-500 text-sm mb-4">← Back to Menu</button>
          <h2 className="font-display text-2xl font-bold text-espresso mb-5">Your Order</h2>
          <div className="space-y-3 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-espresso">{item.name}</p>
                  <p className="text-sm text-brand-400">${parseFloat(item.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center">
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                    <Plus size={13} />
                  </button>
                </div>
                <p className="font-semibold text-brand-600 w-16 text-right">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div>
            <label className="label">Special Instructions</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Allergies, preferences..." className="input resize-none mb-4" />
          </div>
          <div className="card p-4 flex justify-between items-center mb-5 font-bold text-espresso text-lg">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <button onClick={placeOrder} disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><Send size={18} /> Place Order</>}
          </button>
        </div>
      )}
    </div>
  );
}
