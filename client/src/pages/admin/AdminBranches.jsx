import { useState, useEffect } from 'react';
import { Plus, Edit2, X } from 'lucide-react';
import { branchAPI } from '../../services/api';
import toast from 'react-hot-toast';

function BranchModal({ branch, onClose, onSave }) {
  const [form, setForm] = useState(branch || { name: '', address: '', phone: '', isActive: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (branch?.id) await branchAPI.update(branch.id, form);
      else await branchAPI.create(form);
      toast.success(branch?.id ? 'Branch updated!' : 'Branch created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <h2 className="section-title">{branch?.id ? 'Edit Branch' : 'Add Branch'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { key: 'name', label: 'Branch Name', placeholder: 'Main Street Branch' },
            { key: 'address', label: 'Address', placeholder: '123 Main St, City' },
            { key: 'phone', label: 'Phone', placeholder: '+1 555 0100' },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required className="input" placeholder={f.placeholder} />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
            <span className="text-sm text-brand-600">Active</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);

  const load = () => branchAPI.getAll().then(res => setBranches(res.data.data));
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Branches</h1>
        <button onClick={() => { setEditBranch(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map(b => (
          <div key={b.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-xl">🏪</div>
              <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} text-xs`}>
                {b.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="font-display font-semibold text-espresso mb-1">{b.name}</h3>
            <p className="text-sm text-brand-400 mb-1">{b.address}</p>
            <p className="text-sm text-brand-400 mb-4">{b.phone}</p>
            <button onClick={() => { setEditBranch(b); setShowModal(true); }} className="btn-secondary text-sm flex items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <BranchModal branch={editBranch} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
