import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';

function StatCard({ label, value, icon, accent, sub, onClick }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'var(--transition)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      onClick={onClick}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px',
        background: `radial-gradient(circle at top right, ${accent}20, transparent)`,
      }} />
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: '800', color: accent }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        fontSize: '13px',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: '600' }}>{payload[0].value} Orders</p>
        {payload[1] && <p style={{ color: 'var(--status-delivered)', fontWeight: '600' }}>₹{payload[1].value?.toLocaleString()}</p>}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { isOwner, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCardClick = (statusQuery) => {
    if (statusQuery) {
      navigate(`/orders?status=${encodeURIComponent(statusQuery)}`);
    } else {
      navigate('/orders');
    }
  };

  useEffect(() => {
    api.get('/orders/stats').then(({ data }) => {
      setStats(data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Layout><div className="loading-container"><div className="loading-spinner" /><span>Loading dashboard...</span></div></Layout>;
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} — here's what's happening today.</p>
        </div>
        <div style={{
          background: 'var(--accent-glow)',
          border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          fontSize: '13px',
          color: 'var(--accent)',
        }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          icon="📋"
          accent="var(--accent)"
          onClick={() => handleCardClick()}
        />
        <StatCard
          label="Order Placed"
          value={stats?.orderPlaced || 0}
          icon="🆕"
          accent="var(--status-placed)"
          onClick={() => handleCardClick('placed')}
        />
        <StatCard
          label="Processing"
          value={stats?.orderProcessing || 0}
          icon="⚙️"
          accent="var(--status-processing)"
          onClick={() => handleCardClick('processing')}
        />
        <StatCard
          label="Dispatched"
          value={stats?.orderDispatched || 0}
          icon="🚚"
          accent="var(--status-dispatched)"
          onClick={() => handleCardClick('dispatched')}
        />
        <StatCard
          label="Delivered"
          value={stats?.orderDelivered || 0}
          icon="✅"
          accent="var(--status-delivered)"
          onClick={() => handleCardClick('delivered')}
        />
        <StatCard label="Due This Week" value={stats?.upcomingDeliveries || 0} icon="📅" accent="#f472b6" sub="Pending deliveries" />
      </div>

      {/* Owner-only financial stats */}
      {isOwner && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <StatCard
            label="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon="💰"
            accent="var(--status-delivered)"
            sub="All orders combined"
          />
          <StatCard
            label="Advance Collected"
            value={`₹${(stats?.totalAdvance || 0).toLocaleString()}`}
            icon="💳"
            accent="var(--accent)"
            sub="Payments received"
          />
          <StatCard
            label="Pending Payments"
            value={`₹${(stats?.pendingPayments || 0).toLocaleString()}`}
            icon="⏳"
            accent="var(--status-processing)"
            sub="Yet to be collected"
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1fr 360px' : '1fr', gap: '20px' }}>
        {/* Monthly Chart - Owner only */}
        {isOwner && stats?.monthlyOrders?.length > 0 && (
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Monthly Performance
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthlyOrders} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,169,110,0.05)' }} />
                <Bar dataKey="orders" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Top staff performers */}
        {isOwner && stats?.topStaff?.length > 0 && (
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Top Staff (by revenue)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topStaff.map((s) => (
                <div key={s.user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{s.user.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
                      ₹{s.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {isOwner && stats?.recentOrders?.length > 0 && (
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              Recent Orders
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentOrders.map((order) => (
                <div key={order._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{order.customerName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.itemType}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
                      ₹{order.totalPayment?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff view - order status summary */}
        {!isOwner && (
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              Order Status Overview
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Order Placed', value: stats?.orderPlaced || 0, color: 'var(--status-placed)' },
                { label: 'Processing', value: stats?.orderProcessing || 0, color: 'var(--status-processing)' },
                { label: 'Dispatched', value: stats?.orderDispatched || 0, color: 'var(--status-dispatched)' },
                { label: 'Delivered', value: stats?.orderDelivered || 0, color: 'var(--status-delivered)' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '120px',
                      height: '6px',
                      background: 'var(--border)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${stats?.totalOrders ? (s.value / stats.totalOrders) * 100 : 0}%`,
                        height: '100%',
                        background: s.color,
                        borderRadius: '3px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: s.color, minWidth: '24px', textAlign: 'right' }}>
                      {s.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
