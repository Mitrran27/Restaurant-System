const STATUS_MAP = {
  PENDING:          { label: 'Pending',          cls: 'badge-pending'   },
  CONFIRMED:        { label: 'Confirmed',         cls: 'badge-confirmed' },
  PREPARING:        { label: 'Preparing',         cls: 'badge-preparing' },
  READY:            { label: 'Ready',             cls: 'badge-ready'     },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  cls: 'badge-delivery'  },
  DELIVERED:        { label: 'Delivered',         cls: 'badge-delivered' },
  COMPLETED:        { label: 'Completed',         cls: 'badge-completed' },
  CANCELLED:        { label: 'Cancelled',         cls: 'badge-cancelled' },
};

export default function StatusBadge({ status, className = '' }) {
  const info = STATUS_MAP[status] || { label: status, cls: 'badge-pending' };
  return (
    <span className={`badge ${info.cls} ${className}`}>
      {info.label}
    </span>
  );
}
