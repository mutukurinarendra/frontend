import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const ITEM_TYPES = ['Album', 'Video', 'Photo Frame', 'Customized Product', 'Wedding', 'Event'];

const initialForm = {
  customerName: '',
  mobileNumber: '',
  itemType: '',
  description: '',
  price: '',
  totalPayment: '',
  advancePayment: '',
  deliveryDate: '',
};

export default function IntakeOrder() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();
  const navigate = useNavigate();

  const remainingPayment = Number(form.totalPayment || 0) - Number(form.advancePayment || 0);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    if (!/^\d{10}$/.test(form.mobileNumber.trim())) e.mobileNumber = 'Enter valid 10-digit mobile number';
    if (!form.itemType) e.itemType = 'Please select an item type';
    if (!form.price || Number(form.price) < 0) e.price = 'Enter valid price';
    if (!form.totalPayment || Number(form.totalPayment) < 0) e.totalPayment = 'Enter total payment';
    if (Number(form.advancePayment) > Number(form.totalPayment)) e.advancePayment = 'Advance cannot exceed total payment';
    if (!form.deliveryDate) e.deliveryDate = 'Delivery date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form,
        price: Number(form.price),
        totalPayment: Number(form.totalPayment),
        advancePayment: Number(form.advancePayment),
      });
      addToast('Order created successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Order</h1>
          <p className="page-subtitle">Fill in the details to register a new customer order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
          {/* Main form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Customer Info */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--accent)' }}>
                Customer Information
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input name="customerName" className="form-input" placeholder="Full name" value={form.customerName} onChange={handleChange} />
                  {errors.customerName && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.customerName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input name="mobileNumber" className="form-input" placeholder="10-digit number" value={form.mobileNumber} onChange={handleChange} maxLength={10} />
                  {errors.mobileNumber && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.mobileNumber}</span>}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--accent)' }}>
                Order Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Item Type *</label>
                    <select name="itemType" className="form-select" value={form.itemType} onChange={handleChange}>
                      <option value="">Select type...</option>
                      {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.itemType && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.itemType}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Date *</label>
                    <input type="date" name="deliveryDate" className="form-input" value={form.deliveryDate} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]} />
                    {errors.deliveryDate && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.deliveryDate}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea" placeholder="Describe the order in detail (size, pages, special requirements...)" value={form.description} onChange={handleChange} rows={3} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--accent)' }}>
                Payment Details
              </h2>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" name="price" className="form-input" placeholder="0" value={form.price} onChange={handleChange} min={0} />
                  {errors.price && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Total Payment (₹) *</label>
                  <input type="number" name="totalPayment" className="form-input" placeholder="0" value={form.totalPayment} onChange={handleChange} min={0} />
                  {errors.totalPayment && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.totalPayment}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Advance Payment (₹)</label>
                  <input type="number" name="advancePayment" className="form-input" placeholder="0" value={form.advancePayment} onChange={handleChange} min={0} max={form.totalPayment || undefined} />
                  {errors.advancePayment && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.advancePayment}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div style={{ position: 'sticky', top: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
                Order Summary
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Customer', value: form.customerName || '—' },
                  { label: 'Mobile', value: form.mobileNumber || '—' },
                  { label: 'Item Type', value: form.itemType || '—' },
                  { label: 'Delivery', value: form.deliveryDate ? new Date(form.deliveryDate).toLocaleDateString('en-IN') : '—' },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</span>
                  </div>
                ))}

                <div style={{ paddingTop: '8px' }}>
                  {[
                    { label: 'Total', value: `₹${Number(form.totalPayment || 0).toLocaleString()}`, color: 'var(--text-primary)', bold: true },
                    { label: 'Advance', value: `₹${Number(form.advancePayment || 0).toLocaleString()}`, color: 'var(--status-delivered)' },
                    { label: 'Remaining', value: `₹${remainingPayment.toLocaleString()}`, color: remainingPayment > 0 ? 'var(--status-processing)' : 'var(--status-delivered)', bold: true },
                  ].map((r) => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: r.bold ? '700' : '500', color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Payment bar */}
                {Number(form.totalPayment) > 0 && (
                  <div>
                    <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min((Number(form.advancePayment) / Number(form.totalPayment)) * 100, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent), var(--status-delivered))',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {Math.round((Number(form.advancePayment) / Number(form.totalPayment)) * 100)}% paid upfront
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '13px' }} disabled={loading}>
                {loading ? 'Creating...' : '✦ Create Order'}
              </button>
              <button type="button" className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={handleReset}>
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}
