const statusMap = {
  'Order Placed': 'placed',
  'Order Processing': 'processing',
  'Order Dispatched': 'dispatched',
  'Order Delivered': 'delivered',
};

export default function StatusBadge({ status, archived }) {
  if (archived) {
    return <span className="badge badge-archived">Archived</span>;
  }
  const cls = statusMap[status] || 'placed';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}
