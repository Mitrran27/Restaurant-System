import { useState, useEffect } from 'react';
import { Plus, X, User } from 'lucide-react';
import { authAPI, branchAPI } from '../../services/api';
import toast from 'react-hot-toast';

function StaffModal({ onClose, onSave, branches }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CASHIER', branchId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.createStaff(form);
      toast.success('Staff member created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <h2 className="section-title">Add Staff Member</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input" /></div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="input" /></div>
          <div><label className="label">Password</label><input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required className="input" /></div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input">
              <option value="CASHIER">Cashier</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Branch</label>
            <select value={form.branchId} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))} className="input">
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Create Staff</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const roleColors = { ADMIN: 'bg-purple-100 text-purple-700', CASHIER: 'bg-blue-100 text-blue-700', KITCHEN: 'bg-orange-100 text-orange-700' };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [sRes, bRes] = await Promise.all([authAPI.getStaff(), branchAPI.getAll()]);
    setStaff(sRes.data.data);
    setBranches(bRes.data.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Staff Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Staff</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream-50 border-b border-cream-200">
            <tr>
              {['Name', 'Email', 'Role', 'Branch', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-cream-100 hover:bg-cream-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-brand-500" />
                    </div>
                    <span className="font-medium text-espresso text-sm">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-brand-500">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${roleColors[s.role] || 'bg-gray-100 text-gray-600'}`}>{s.role}</span>
                </td>
                <td className="px-4 py-3 text-sm text-brand-500">{s.branch?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <StaffModal branches={branches} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
