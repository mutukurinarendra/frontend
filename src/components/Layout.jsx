import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const navItems = [
  { path: '/dashboard', icon: '◈', label: 'Dashboard' },
  { path: '/intake', icon: '✦', label: 'New Order' },
  { path: '/orders', icon: '▦', label: 'Orders' },
];

const ownerItems = [
  { path: '/users', icon: '◉', label: 'Team' },
];

export default function Layout({ children }) {
  const { user, isOwner, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>📷</span>
            Rama Studio
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Management Pro
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px 4px', fontWeight: '600' }}>
            Main
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'var(--transition)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}
            >
              <span style={{ fontSize: '16px', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isOwner && (
            <>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 12px 4px', fontWeight: '600' }}>
                Owner
              </div>
              {ownerItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'var(--transition)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  })}
                >
                  <span style={{ fontSize: '16px', opacity: 0.8 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User profile */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            marginBottom: '10px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--accent)',
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'capitalize' }}>
                {user?.role === 'owner' ? '👑 Owner' : '👨‍💼 Staff'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
            <span>→</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        padding: '32px',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        {children}
      </main>
    </div>
  );
}
