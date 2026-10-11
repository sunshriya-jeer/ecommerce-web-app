import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { orderService } from '../services/api';
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderPlacedSuccess = location.state?.orderPlaced;

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getById(id);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError('Order details could not be retrieved.');
        }
      } catch (err) {
        console.error('Failed to get order details:', err);
        setError(err.response?.data?.message || 'Error loading order tracking.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container section-padding loading-container">
        <div className="spinner"></div>
        <p>Loading order details & milestone tracking...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container section-padding">
        <div className="error-alert">
          <AlertTriangle size={24} />
          <div>
            <h3>Order Not Found</h3>
            <p>{error || 'The requested order does not exist or you lack permission to view it.'}</p>
            <Link to="/my-orders" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Milestones tracking logic: Placed -> Processing -> Shipped -> Delivered
  const statusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
  const isCancelled = order.status === 'Cancelled';
  const currentStepIdx = statusSteps.indexOf(order.status);

  return (
    <div className="container order-details-page section-padding">
      <Link to="/my-orders" className="back-link">
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      {orderPlacedSuccess && (
        <div className="success-banner card" style={{ marginBottom: '24px', borderColor: '#22c55e', backgroundColor: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <div>
              <h3 style={{ color: '#166534', margin: 0 }}>Order Confirmed Successfully!</h3>
              <p style={{ color: '#15803d', margin: '4px 0 0 0' }}>
                Thank you for your purchase. We are preparing your shipment now.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="order-details-header card">
        <div className="header-meta">
          <h1>Order #{order.id}</h1>
          <p className="order-date-text">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="header-status">
          <span className={`order-status-badge badge-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Visual Tracking Progress Bar */}
      <div className="tracking-card card">
        <h2 className="tracking-title">Shipment Progress</h2>

        {isCancelled ? (
          <div className="cancelled-tracking-alert">
            <XCircle size={24} color="#ef4444" />
            <span>This order was marked as Cancelled.</span>
          </div>
        ) : (
          <div className="tracking-timeline">
            {statusSteps.map((step, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div
                  key={step}
                  className={`timeline-step ${isPassed ? 'step-completed' : ''} ${isCurrent ? 'step-active' : ''}`}
                >
                  <div className="step-marker">
                    {isPassed ? <CheckCircle2 size={18} /> : <div className="step-circle" />}
                  </div>
                  <div className="step-label">
                    <span className="step-name">{step}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Order Summary Grid */}
      <div className="order-summary-grid">
        {/* Purchased Items List */}
        <div className="order-items-detail-card card">
          <h2>Items in this Order ({order.order_items?.length || 0})</h2>

          <div className="order-items-table">
            {order.order_items?.map((item) => (
              <div key={item.id} className="order-item-detail-row">
                <img
                  src={item.products?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                  alt={item.products?.name}
                  className="item-preview-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="item-detail-info">
                  <Link to={`/products/${item.product_id}`} className="item-title-link">
                    {item.products?.name || 'Product Item'}
                  </Link>
                  <span className="item-qty-tag">
                    Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                <div className="item-line-total">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-breakdown">
            <div className="breakdown-row">
              <span>Items Total</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Shipping</span>
              <span>Free Delivery</span>
            </div>
            <div className="breakdown-row total-row">
              <span>Total Paid / Due</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="order-meta-column">
          <div className="card order-meta-card">
            <h3><MapPin size={18} /> Shipping Address</h3>
            <div className="meta-info-box">
              <p className="shipping-recipient">{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
              <p className="shipping-contact">
                <strong>Phone:</strong> {order.shipping_phone}
              </p>
              <p className="shipping-contact">
                <strong>Email:</strong> {order.shipping_email}
              </p>
            </div>
          </div>

          <div className="card order-meta-card" style={{ marginTop: '20px' }}>
            <h3><CreditCard size={18} /> Payment Information</h3>
            <div className="meta-info-box">
              <p>
                <strong>Method:</strong> {order.payment_method}
              </p>
              <p>
                <strong>Payment Status:</strong>{' '}
                {order.status === 'Delivered'
                  ? 'Completed'
                  : order.payment_method === 'Demo Payment'
                  ? 'Paid (Simulated)'
                  : 'Pending on Delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
