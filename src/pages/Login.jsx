import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%', right: '10%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>📷</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}>
            Rama Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Management Pro — Sign in to continue
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '36px',
          boxShadow: 'var(--shadow)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@ramastudio.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '13px', fontSize: '15px', marginTop: '4px' }} disabled={loading}>
              {loading ? <><div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
