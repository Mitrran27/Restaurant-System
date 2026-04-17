import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Star, Filter } from 'lucide-react';
import { menuAPI, branchAPI } from '../../services/api';
import useCartStore from '../../context/cartStore';
import toast from 'react-hot-toast';

function MenuItemCard({ item, onAdd }) {
  return (
    <div className={`card group transition-all duration-200 hover:-translate-y-0.5 ${!item.inStock ? 'opacity-60' : ''}`}>
      <div className="relative h-44 overflow-hidden bg-cream-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge bg-red-500 text-white text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-espresso leading-tight">{item.name}</h3>
          {item.averageRating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium flex-shrink-0">
              <Star size={11} fill="currentColor" /> {item.averageRating}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-brand-400 mb-3 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-600">${parseFloat(item.price).toFixed(2)}</span>
          <button
            onClick={() => onAdd(item)}
            disabled={!item.inStock}
            className="w-8 h-8 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const { addItem, setBranchId } = useCartStore();

  useEffect(() => {
    Promise.all([branchAPI.getAll(), menuAPI.getCategories()]).then(([bRes, cRes]) => {
      setBranches(bRes.data.data);
      setCategories(cRes.data.data);
      if (bRes.data.data.length > 0 && !selectedBranch) {
        const firstBranch = bRes.data.data[0].id;
        setSelectedBranch(firstBranch);
        setBranchId(firstBranch);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    setLoading(true);
    menuAPI.getItems({ branchId: selectedBranch, categoryId: selectedCategory, search })
      .then(res => setItems(res.data.data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [selectedBranch, selectedCategory, search]);

  const handleAdd = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const grouped = categories
    .filter(c => !selectedCategory || c.id === selectedCategory)
    .map(cat => ({
      ...cat,
      items: items.filter(i => i.category?.id === cat.id),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-400 text-sm uppercase tracking-widest mb-1">Our Menu</p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-espresso">What are you craving?</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Branch */}
        {branches.length > 1 && (
          <select
            value={selectedBranch}
            onChange={e => { setSelectedBranch(e.target.value); setBranchId(e.target.value); }}
            className="input w-auto"
          >
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedCategory ? 'bg-brand-500 text-white shadow-warm' : 'bg-white text-brand-600 border border-cream-300 hover:bg-cream-100'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id ? 'bg-brand-500 text-white shadow-warm' : 'bg-white text-brand-600 border border-cream-300 hover:bg-cream-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-44 bg-cream-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-100 rounded w-full" />
                <div className="h-3 bg-cream-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-brand-400 text-lg">No items found</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(group => (
            <section key={group.id}>
              <h2 className="font-display text-2xl font-bold text-espresso mb-5 flex items-center gap-3">
                {group.name}
                <span className="text-sm font-sans font-normal text-brand-400">({group.items.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {group.items.map(item => (
                  <MenuItemCard key={item.id} item={item} onAdd={handleAdd} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
