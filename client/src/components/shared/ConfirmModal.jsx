import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = 'btn-danger', loading = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-espresso mb-1">{title}</h3>
            <p className="text-sm text-brand-400">{message}</p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onConfirm} disabled={loading} className={`${confirmClass} flex-1 py-2.5`}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}
