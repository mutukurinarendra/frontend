import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}/invoice`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch(() => addToast('Failed to load invoice', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Layout><div className="loading-container"><div className="loading-spinner" /><span>Loading invoice...</span></div></Layout>;
  }

  if (!invoice) {
    return <Layout><div className="empty-state"><p>Invoice not found.</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice</h1>
          <p className="page-subtitle">Order #{invoice.orderId}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="card" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <center><h2> Rama Studio </h2></center>
        <p>Order ID: {invoice.orderId}</p>
        <p>Customer: {invoice.customerName} ({invoice.mobileNumber})</p>
        <p>Item: {invoice.itemType}</p>
        {invoice.description && <p>Description: {invoice.description}</p>}
        <p>Delivery Date: {new Date(invoice.deliveryDate).toLocaleDateString('en-IN')}</p>
        <hr />
        <p>Price: ₹{invoice.price?.toLocaleString()}</p>
        <p>Total: ₹{invoice.totalPayment?.toLocaleString()}</p>
        <p>Advance Paid: ₹{invoice.advancePayment?.toLocaleString()}</p>
        <p>Remaining: ₹{invoice.remainingPayment?.toLocaleString()}</p>
        <p>Status: {invoice.status}</p>
        <p>Taken By: {invoice.orderTakenBy}</p>
        <p>Created: {new Date(invoice.createdAt).toLocaleString('en-IN')}</p>
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p>__________________________</p>
          <p>Signature</p>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.print()}>Print / Save</button>
      </div>
    </Layout>
  );
}
