export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-5">{icon}</div>
      <h3 className="font-display text-xl font-semibold text-espresso mb-2">{title}</h3>
      {message && <p className="text-brand-400 text-sm max-w-xs mb-6">{message}</p>}
      {action}
    </div>
  );
}
