import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { Search, Eye, Filter, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadOrders = async () => {
      try {
        const params = {};
        if (statusFilter !== 'All') {
          params.status = statusFilter;
        }
        const res = await orderService.getAll(params);
        if (ignore) return;
        const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setOrders(items);
      } catch (err) {
        if (ignore) return;
        console.error('Failed to load orders for admin:', err);
        setError('Could not retrieve orders list.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      if (res.success) {
        setSuccessMsg(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}.`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.shipping_name.toLowerCase().includes(q) ||
      o.shipping_email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container admin-orders-page section-padding">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Customer Order Management</h1>
          <p className="page-subheading">
            Review incoming orders, filter fulfillment stages, and update shipment status.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="success-alert" style={{ marginBottom: '20px' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="error-alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="admin-toolbar card">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status Workflow</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                      No orders found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <code>#{ord.id.slice(0, 8)}</code>
                      </td>
                      <td>
                        <div>
                          <strong>{ord.shipping_name}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {ord.shipping_email}
                          </div>
                        </div>
                      </td>
                      <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td>{ord.order_items?.length || 0} items</td>
                      <td>
                        <strong>${Number(ord.total_amount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className="payment-tag">{ord.payment_method}</span>
                      </td>
                      <td>
                        <select
                          className="status-dropdown-select"
                          value={ord.status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <Link
                          to={`/orders/${ord.id}`}
                          className="btn-icon"
                          title="View Order Details & Tracking"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
