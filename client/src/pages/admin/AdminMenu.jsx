import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { menuAPI, branchAPI } from '../../services/api';
import toast from 'react-hot-toast';

function MenuItemModal({ item, categories, branches, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', description: '', price: '', categoryId: '', branchId: '', imageUrl: '', isActive: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item?.id) await menuAPI.update(item.id, form);
      else await menuAPI.create(form);
      toast.success(item?.id ? 'Item updated!' : 'Item created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <h2 className="section-title">{item?.id ? 'Edit Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input" placeholder="Item name" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input resize-none" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required className="input">
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Branch</label>
            <select value={form.branchId} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))} className="input">
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="input" placeholder="https://..." />
          </div>
          {item?.id && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
              <span className="text-sm text-brand-600">Active (visible on menu)</span>
            </label>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Item</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    setLoading(true);
    const [iRes, cRes, bRes] = await Promise.all([
      menuAPI.getItems({ includeOutOfStock: true }),
      menuAPI.getCategories(),
      branchAPI.getAll(),
    ]);
    setItems(iRes.data.data);
    setCategories(cRes.data.data);
    setBranches(bRes.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this item?')) return;
    await menuAPI.delete(id);
    toast.success('Item deactivated');
    load();
  };

  const filtered = filterCat ? items.filter(i => i.category?.id === filterCat) : items;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Menu Management</h1>
        <button onClick={() => { setModalItem(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilterCat('')} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!filterCat ? 'bg-brand-500 text-white' : 'bg-white text-brand-600 border border-cream-300 hover:bg-cream-100'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id === filterCat ? '' : c.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCat === c.id ? 'bg-brand-500 text-white' : 'bg-white text-brand-600 border border-cream-300 hover:bg-cream-100'}`}>{c.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <div key={i} className="card h-52 animate-pulse bg-cream-100" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => (
            <div key={item.id} className={`card overflow-hidden ${!item.isActive ? 'opacity-60' : ''}`}>
              <div className="relative h-36 bg-cream-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!item.isActive && <span className="badge bg-red-500 text-white text-xs">Inactive</span>}
                  {item.inventory?.status === 'OUT_OF_STOCK' && <span className="badge bg-orange-500 text-white text-xs">Out of Stock</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-espresso text-sm mb-1 truncate">{item.name}</h3>
                <p className="text-xs text-brand-400 mb-2 truncate">{item.category?.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-600">${parseFloat(item.price).toFixed(2)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setModalItem(item); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-cream-100 text-brand-500">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <MenuItemModal
          item={modalItem}
          categories={categories}
          branches={branches}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
