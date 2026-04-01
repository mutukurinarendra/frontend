import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/users', form);
      addToast('Staff account created!', 'success');
      onCreated(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Staff Member</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} style={{ fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Staff name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-input" placeholder="staff@ramastudio.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users)).catch(() => addToast('Failed to load users', 'error')).finally(() => setLoading(false));
  }, []);

  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
    try {
      const { data } = await api.put(`/users/${user._id}/block`);
      setUsers((prev) => prev.map((u) => u._id === user._id ? data.user : u));
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      addToast('User deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">{users.length} staff member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Staff</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '300px' }}>
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">No staff members yet</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>Add First Staff</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {users.map((user) => (
            <div key={user._id} className="card" style={{
              borderLeft: `3px solid ${user.isBlocked ? 'var(--danger)' : 'var(--status-delivered)'}`,
              opacity: user.isBlocked ? 0.75 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '50%',
                    background: user.isBlocked ? 'rgba(239,68,68,0.1)' : 'var(--accent-glow)',
                    border: `1px solid ${user.isBlocked ? 'var(--danger)' : 'var(--accent)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '700',
                    color: user.isBlocked ? 'var(--danger)' : 'var(--accent)',
                  }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
                {user.isBlocked && (
                  <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '3px 8px', borderRadius: '100px', fontWeight: '600' }}>
                    BLOCKED
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{user.orderCount || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Orders Taken</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--status-delivered)' }}>₹{(user.revenue||0).toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Revenue</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--status-delivered)' }}>{user.completedOrders || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Completed</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--status-processing)' }}>{user.pendingOrders || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Pending</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`btn btn-sm ${user.isBlocked ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleToggleBlock(user)}
                >
                  {user.isBlocked ? '🔓 Unblock' : '🔒 Block'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => setUsers((prev) => [u, ...prev])}
        />
      )}
    </Layout>
  );
}
