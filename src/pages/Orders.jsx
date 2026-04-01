import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const STATUSES = ['All', 'Order Placed', 'Order Processing', 'Order Dispatched', 'Order Delivered'];

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { isOwner } = useAuth();

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;

    // if marking delivered and there is pending amount, ask about collection
    let collect = false;
    if (newStatus === 'Order Delivered' && order.remainingPayment > 0) {
      collect = window.confirm('Order is marked delivered and there is pending amount.\nHave you collected the remaining payment? Click OK for yes, Cancel for no.');
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { status: newStatus, note });
      addToast('Status updated successfully!', 'success');
      let updated = data.order;
      if (collect) {
        const { data: payResp } = await api.put(`/orders/${order._id}/collect-payment`);
        updated = payResp.order;
        addToast('Payment recorded as collected.', 'success');
      }
      onStatusUpdate(updated);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(order.isDeleted ? 'Permanently delete this archived order? This cannot be undone.' : 'Archive this order? You can restore it later.')) return;
    try {
      if (order.isDeleted) {
        await api.delete(`/orders/${order._id}`); // still remove permanently
      } else {
        await api.delete(`/orders/${order._id}`); // soft delete
      }
      addToast(order.isDeleted ? 'Order permanently deleted' : 'Order archived', 'success');
      onStatusUpdate(null); // signals deletion/archive
      onClose();
    } catch (err) {
      addToast('Failed to perform action', 'error');
    }
  };

  const handleRestore = async () => {
    try {
      const { data } = await api.put(`/orders/${order._id}/restore`);
      addToast('Order restored', 'success');
      onStatusUpdate(data.order);
      onClose();
    } catch (err) {
      addToast('Failed to restore order', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{order.customerName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              📱 {order.mobileNumber} &nbsp;•&nbsp; {order.itemType}
            </p>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose} style={{ fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Order Date', value: new Date(order.createdAt).toLocaleDateString('en-IN') },
            { label: 'Delivery Date', value: new Date(order.deliveryDate).toLocaleDateString('en-IN') },
            { label: 'Total Payment', value: `₹${order.totalPayment?.toLocaleString()}`, accent: true },
            { label: 'Advance Paid', value: `₹${order.advancePayment?.toLocaleString()}`, green: true },
            { label: 'Remaining', value: `₹${order.remainingPayment?.toLocaleString()}`, warn: order.remainingPayment > 0 },
            { label: 'Order By', value: order.orderTakenBy?.name || 'N/A' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: item.accent ? 'var(--accent)' : item.green ? 'var(--status-delivered)' : item.warn ? 'var(--status-processing)' : 'var(--text-primary)',
              }}>{item.value}</div>
            </div>
          ))}
        </div>

        {order.description && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{order.description}</p>
          </div>
        )}

        {/* Update Status */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Update Status</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {STATUSES.filter(s => s !== 'All').map((s) => (
              <button
                key={s}
                onClick={() => setNewStatus(s)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '100px',
                  border: `1px solid ${newStatus === s ? 'var(--accent)' : 'var(--border)'}`,
                  background: newStatus === s ? 'var(--accent-glow)' : 'var(--bg-input)',
                  color: newStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'var(--transition)',
                }}
              >{s}</button>
            ))}
          </div>
          <textarea
            className="form-textarea"
            placeholder="Optional note about this status change..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={loading || newStatus === order.status} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <a href={`/orders/${order._id}/invoice`} className="btn btn-secondary" target="_blank" rel="noreferrer">
              🧾 Invoice
            </a>
            {isOwner && !order.isDeleted && (
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑 Archive
              </button>
            )}
            {isOwner && order.isDeleted && (
              <button className="btn btn-success" onClick={handleRestore}>
                ↶ Restore
              </button>
            )}
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory?.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activity Log</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{h.status}</span>
                    {h.note && <span style={{ color: 'var(--text-muted)' }}> — {h.note}</span>}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      by {h.changedBy?.name || 'Unknown'} • {new Date(h.changedAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const { isOwner } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({});

  // helper to convert a query string value into one of the full status text values
  const normalizeStatus = (raw) => {
    if (!raw) return 'All';
    const lower = raw.toLowerCase();
    if (lower === 'all') return 'All';
    if (lower.includes('placed')) return 'Order Placed';
    if (lower.includes('processing')) return 'Order Processing';
    if (lower.includes('dispatched')) return 'Order Dispatched';
    if (lower.includes('delivered')) return 'Order Delivered';
    // if someone already passed the full text, just return it
    return raw;
  };

  // initialise filters taking the status from query params if provided
  const getInitialStatus = () => {
    const params = new URLSearchParams(location.search);
    const s = params.get('status');
    return normalizeStatus(s);
  };

  const [filters, setFilters] = useState({
    page: 1, limit: 10, status: getInitialStatus(), search: '',
    deliveryDateFrom: '', deliveryDateTo: '',
    orderTakenBy: '', itemType: 'All', paymentStatus: '',
    includeArchived: false,
  });

  const [staffList, setStaffList] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.status === 'All') delete params.status;
      if (!params.search) delete params.search;
      if (!params.deliveryDateFrom) delete params.deliveryDateFrom;
      if (!params.deliveryDateTo) delete params.deliveryDateTo;
      if (!params.orderTakenBy) delete params.orderTakenBy;
      if (params.itemType === 'All') delete params.itemType;
      if (!params.paymentStatus) delete params.paymentStatus;
      if (!params.includeArchived) delete params.includeArchived;

      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // if location.search changes (e.g. user navigated via link), update filters accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = normalizeStatus(params.get('status'));
    if (status !== filters.status) {
      setFilters((prev) => ({ ...prev, status, page: 1 }));
    }
    // we only care about status for now; other filters are in-page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // load staff list for filter
  useEffect(() => {
    api.get('/users').then(({ data }) => setStaffList(data.users)).catch(() => {});
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // keep the url query string in sync when status filter changes (useful for sharing/bookmarks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (filters.status && filters.status !== 'All') {
      params.set('status', filters.status);
    } else {
      params.delete('status');
    }
    const newSearch = params.toString();
    // avoid unnecessary history entries
    if (newSearch !== location.search.replace(/^\?/, '')) {
      navigate({ pathname: '/orders', search: newSearch }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  const handleStatusUpdate = (updatedOrder) => {
    if (!updatedOrder) {
      fetchOrders(); // re-fetch after delete
      return;
    }
    setOrders((prev) => prev.map((o) => o._id === updatedOrder._id ? updatedOrder : o));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const isOverdue = (order) => {
    return new Date(order.deliveryDate) < new Date() && order.status !== 'Order Delivered';
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {pagination.totalCount || 0} total orders {filters.status !== 'All' ? `• Filtered by: ${filters.status}` : ''}
          </p>
        </div>
        <div>
        <a href="/intake" className="btn btn-primary" style={{ marginRight: '10px' }}>✦ New Order</a>
        <button className="btn btn-secondary" onClick={() => {
          // build params same as current filters
          const params = { ...filters };
          if (params.status === 'All') delete params.status;
          if (!params.search) delete params.search;
          if (!params.deliveryDateFrom) delete params.deliveryDateFrom;
          if (!params.deliveryDateTo) delete params.deliveryDateTo;
          if (!params.orderTakenBy) delete params.orderTakenBy;
          if (params.itemType === 'All') delete params.itemType;
          if (!params.paymentStatus) delete params.paymentStatus;
          if (!params.includeArchived) delete params.includeArchived;
          api.get('/orders/export', { params, responseType: 'blob' })
            .then((resp) => {
              const url = window.URL.createObjectURL(new Blob([resp.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `orders_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            })
            .catch(() => addToast('Export failed', 'error'));
        }}>📤 Export CSV</button>
      </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search by mobile number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select className="form-select" style={{ minWidth: '140px' }} value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ minWidth: '140px' }} value={filters.orderTakenBy} onChange={(e) => handleFilterChange('orderTakenBy', e.target.value)}>
            <option value="">Staff (all)</option>
            {staffList.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select className="form-select" style={{ minWidth: '140px' }} value={filters.itemType} onChange={(e) => handleFilterChange('itemType', e.target.value)}>
            {['All','Album','Video','Photo Frame','Customized Product','Wedding','Event'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select" style={{ minWidth: '140px' }} value={filters.paymentStatus} onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}>
            <option value="">Payment</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <input type="date" className="form-input" style={{ width: '140px' }} value={filters.deliveryDateFrom} onChange={(e) => handleFilterChange('deliveryDateFrom', e.target.value)} title="Delivery from" />
          <input type="date" className="form-input" style={{ width: '140px' }} value={filters.deliveryDateTo} onChange={(e) => handleFilterChange('deliveryDateTo', e.target.value)} title="Delivery to" />
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="checkbox" checked={filters.includeArchived} onChange={(e) => handleFilterChange('includeArchived', e.target.checked)} />
            <span style={{ fontSize: '12px' }}>Show archived</span>
          </label>
          {(filters.search || filters.status !== 'All' || filters.deliveryDateFrom || filters.deliveryDateTo || filters.orderTakenBy || filters.itemType !== 'All' || filters.paymentStatus || filters.includeArchived) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ page: 1, limit: 10, status: 'All', search: '', deliveryDateFrom: '', deliveryDateTo: '', orderTakenBy: '', itemType: 'All', paymentStatus: '', includeArchived: false })}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">No orders found</p>
            <a href="/intake" className="btn btn-primary btn-sm">Create First Order</a>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Item Type</th>
                <th>Delivery Date</th>
                <th>Total (₹)</th>
                <th>Remaining (₹)</th>
                <th>Status</th>
                <th>Taken By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id} style={{ opacity: order.isDeleted ? 0.5 : 1 }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {((filters.page - 1) * filters.limit) + idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {order.customerName} {order.isDeleted && <span style={{ fontSize: '11px', color: 'var(--danger)', marginLeft: '6px' }}>📦 Archived</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📱 {order.mobileNumber}</div>
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--bg-secondary)',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}>{order.itemType}</span>
                  </td>
                  <td>
                    <div style={{ color: isOverdue(order) ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '13px' }}>
                      {formatDate(order.deliveryDate)}
                      {isOverdue(order) && <div style={{ fontSize: '11px', color: 'var(--danger)' }}>⚠ Overdue</div>}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--accent)' }}>₹{order.totalPayment?.toLocaleString()}</td>
                  <td style={{ color: order.remainingPayment > 0 ? 'var(--status-processing)' : 'var(--status-delivered)', fontWeight: '600' }}>
                    ₹{order.remainingPayment?.toLocaleString()}
                  </td>
                  <td><StatusBadge status={order.status} archived={order.isDeleted} /></td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.orderTakenBy?.name || '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(order)}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={!pagination.hasPrev} onClick={() => handleFilterChange('page', filters.page - 1)}>‹ Prev</button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4)) + i;
            return (
              <button key={p} className={`pagination-btn ${p === filters.page ? 'active' : ''}`} onClick={() => handleFilterChange('page', p)}>
                {p}
              </button>
            );
          })}
          <button className="pagination-btn" disabled={!pagination.hasNext} onClick={() => handleFilterChange('page', filters.page + 1)}>Next ›</button>
          <span className="pagination-info">{pagination.totalCount} total</span>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </Layout>
  );
}
