import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Trash2, Search, Printer, RotateCcw, ChevronRight } from 'lucide-react';
import { menuAPI, orderAPI, branchAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import { initSocket } from '../../services/socket';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ORDER_TYPES = [
  { value: 'DINE_IN', label: 'Dine In', emoji: '🍽️' },
  { value: 'PICKUP', label: 'Pickup', emoji: '🛍️' },
  { value: 'DELIVERY', label: 'Delivery', emoji: '🚚' },
];

function Receipt({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-80 animate-slide-up font-mono">
        <div className="p-5 text-center border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-espresso">Ember & Oak</h2>
          <p className="text-xs text-gray-500 mt-1">{format(new Date(), 'PPP p')}</p>
          <p className="text-2xl font-bold mt-2">#{order.orderNumber}</p>
        </div>
        <div className="p-4 text-sm">
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Type:</span><span className="font-medium text-gray-800">{order.type.replace('_', ' ')}</span>
          </div>
          {order.tableNumber && (
            <div className="flex justify-between mb-2 text-gray-500">
              <span>Table:</span><span className="font-medium text-gray-800">{order.tableNumber}</span>
            </div>
          )}
          <div className="border-t border-dashed border-gray-200 my-3" />
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-1 text-gray-700">
              <span>{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-200 my-3" />
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (8%)</span><span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base mt-1 pt-1 border-t border-gray-200">
            <span>TOTAL</span><span>${order.total.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-500">
            <span>Payment</span><span className="font-medium text-gray-800">{order.paymentMethod}</span>
          </div>
        </div>
        <div className="p-4 flex gap-2 border-t border-gray-100">
          <button onClick={() => window.print()} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
            <Printer size={15} /> Print
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const { user } = useAuthStore();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    branchAPI.getAll().then(res => {
      setBranches(res.data.data);
      const userBranch = res.data.data.find(b => b.id === user?.branchId) || res.data.data[0];
      if (userBranch) setBranchId(userBranch.id);
    });
    menuAPI.getCategories().then(res => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    menuAPI.getItems({ branchId }).then(res => setMenu(res.data.data));
    loadRecentOrders();
  }, [branchId]);

  useEffect(() => {
    const socket = initSocket();
    socket.emit('join:branch', branchId);
    return () => {};
  }, [branchId]);

  const loadRecentOrders = async () => {
    if (!branchId) return;
    const res = await orderAPI.getAll({ branchId, limit: 8 });
    setRecentOrders(res.data.data);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: item.id, name: item.name, price: parseFloat(item.price), quantity: 1 }];
    });
  };

  const updateQty = (menuItemId, qty) => {
    if (qty <= 0) setCart(c => c.filter(i => i.menuItemId !== menuItemId));
    else setCart(c => c.map(i => i.menuItemId === menuItemId ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!cart.length) return toast.error('Add items first');
    setSubmitting(true);
    try {
      const res = await orderAPI.create({
        branchId, type: orderType, tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        notes, paymentMethod: 'CASH',
        items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });

      const order = res.data.data;
      setReceipt({ ...order, items: cart, subtotal, tax, total, paymentMethod: 'CASH' });
      setCart([]); setNotes(''); setTableNumber(''); setDeliveryAddress('');
      loadRecentOrders();
      toast.success(`Order #${order.orderNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || item.category?.id === filterCat;
    return matchSearch && matchCat;
  });

  const statusBadge = (s) => {
    const map = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PREPARING: 'badge-preparing', READY: 'badge-ready', COMPLETED: 'badge-completed' };
    return <span className={`badge ${map[s] || 'badge-pending'} text-xs`}>{s}</span>;
  };

  return (
    <div className="flex h-full bg-gray-950 text-white">
      {/* Menu panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search menu..." className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          {branches.length > 1 && (
            <select value={branchId} onChange={e => setBranchId(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800 overflow-x-auto">
          <button onClick={() => setFilterCat('')} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterCat ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id === filterCat ? '' : c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCat === c.id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => item.inStock && addToCart(item)}
                disabled={!item.inStock}
                className={`bg-gray-900 border rounded-xl overflow-hidden text-left transition-all duration-200 ${
                  item.inStock ? 'border-gray-800 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-900/30 active:scale-95' : 'border-gray-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="h-24 bg-gray-800 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-white text-xs font-medium line-clamp-2 mb-1 leading-tight">{item.name}</p>
                  <p className="text-brand-400 font-bold text-sm">${parseFloat(item.price).toFixed(2)}</p>
                  {!item.inStock && <p className="text-red-500 text-xs">Out of stock</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent orders strip */}
        {recentOrders.length > 0 && (
          <div className="border-t border-gray-800 bg-gray-900 px-4 py-2">
            <p className="text-gray-500 text-xs mb-1.5">Recent Orders</p>
            <div className="flex gap-2 overflow-x-auto">
              {recentOrders.map(o => (
                <div key={o.id} className="flex-shrink-0 bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-white text-xs font-mono font-bold">#{o.orderNumber}</span>
                  {statusBadge(o.status)}
                  <span className="text-gray-400 text-xs">${parseFloat(o.totalAmount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart / Order panel */}
      <div className="w-80 xl:w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
        {/* Order type */}
        <div className="p-4 border-b border-gray-800">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Order Type</p>
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map(t => (
              <button key={t.value} onClick={() => setOrderType(t.value)}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${orderType === t.value ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                <div>{t.emoji}</div>
                <div>{t.label}</div>
              </button>
            ))}
          </div>
          {orderType === 'DINE_IN' && (
            <input value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              placeholder="Table number" className="mt-2 w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
          )}
          {orderType === 'DELIVERY' && (
            <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="Delivery address" className="mt-2 w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-sm">Tap menu items to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.menuItemId} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-brand-400 text-xs">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                    className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600">
                    <Minus size={11} />
                  </button>
                  <span className="w-6 text-center text-white text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                    className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="text-white text-sm font-semibold w-14 text-right flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* Notes */}
        {cart.length > 0 && (
          <div className="px-4 pb-3">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Order notes..." className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
          </div>
        )}

        {/* Totals & checkout */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg pt-1 border-t border-gray-700">
            <span>TOTAL</span><span>${total.toFixed(2)}</span>
          </div>
          <button onClick={handleSubmit} disabled={submitting || !cart.length}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
            {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            💵 Charge Cash · ${total.toFixed(2)}
          </button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="w-full text-gray-500 hover:text-red-400 text-sm py-1 flex items-center justify-center gap-1 transition-colors">
              <RotateCcw size={13} /> Clear Order
            </button>
          )}
        </div>
      </div>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
