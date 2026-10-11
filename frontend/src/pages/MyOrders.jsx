import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setOrders(items);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Could not retrieve orders. Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      Placed: 'badge-placed',
      Processing: 'badge-processing',
      Shipped: 'badge-shipped',
      Delivered: 'badge-delivered',
      Cancelled: 'badge-cancelled',
    };
    return <span className={`order-status-badge ${statusMap[status] || ''}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="container section-padding loading-container">
        <div className="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="container my-orders-page section-padding">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">My Orders</h1>
          <p className="page-subheading">Track status and review records for all purchases.</p>
        </div>
        <Link to="/shop" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state card">
          <Package size={52} className="empty-icon" />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders with us yet. Start browsing our catalog!</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={order.id} className="card order-card-item">
                <div className="order-item-header">
                  <div>
                    <span className="order-id-label">Order #{order.id.slice(0, 8)}...</span>
                    <div className="order-date-label">
                      <Clock size={14} /> {formattedDate}
                    </div>
                  </div>

                  <div className="order-header-right">
                    {getStatusBadge(order.status)}
                    <span className="order-total-price">${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-item-body">
                  <div className="order-thumbs-preview">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="thumb-wrapper" title={`${item.products?.name || 'Item'} (${item.quantity}x)`}>
                        <img
                          src={item.products?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                          alt={item.products?.name}
                          className="thumb-img"
                        />
                        <span className="thumb-qty">{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View Details & Tracking <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
