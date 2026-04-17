import { useState, useEffect } from 'react';
import { RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { inventoryAPI, branchAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [iRes, bRes] = await Promise.all([
        inventoryAPI.getAll(branchId ? { branchId } : {}),
        branchAPI.getAll(),
      ]);
      setInventory(iRes.data.data);
      setBranches(bRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [branchId]);

  const handleToggle = async (menuItemId, currentStatus) => {
    setTogglingId(menuItemId);
    try {
      await inventoryAPI.toggle(menuItemId);
      toast.success(`Marked as ${currentStatus === 'IN_STOCK' ? 'Out of Stock' : 'In Stock'}`);
      load();
    } catch {
      toast.error('Failed to update');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = search
    ? inventory.filter(i => i.menuItem.name.toLowerCase().includes(search.toLowerCase()))
    : inventory;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Inventory</h1>
        <button onClick={load} className="btn-secondary p-2.5"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="input max-w-xs text-sm" />
        {branches.length > 1 && (
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className="input w-auto text-sm">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {['Item', 'Category', 'Price', 'Stock Status', 'Quantity', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.menuItemId} className="border-b border-cream-100 hover:bg-cream-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {inv.menuItem.imageUrl && <img src={inv.menuItem.imageUrl} alt={inv.menuItem.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        <span className="font-medium text-espresso text-sm">{inv.menuItem.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-500">{inv.menuItem.category?.name}</td>
                    <td className="px-4 py-3 font-semibold text-espresso text-sm">${parseFloat(inv.menuItem.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${inv.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {inv.status === 'IN_STOCK' ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-500">{inv.quantity}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(inv.menuItemId, inv.status)}
                        disabled={togglingId === inv.menuItemId}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          inv.status === 'IN_STOCK' ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {togglingId === inv.menuItemId ? (
                          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : inv.status === 'IN_STOCK' ? (
                          <><ToggleRight size={18} /> Mark Out of Stock</>
                        ) : (
                          <><ToggleLeft size={18} /> Mark In Stock</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
