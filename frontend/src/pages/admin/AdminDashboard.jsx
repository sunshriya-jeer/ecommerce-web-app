import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, orderService, userService } from '../../services/api';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  PlusCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [prodRes, ordRes, usrRes] = await Promise.all([
          productService.getAll(),
          orderService.getAll(),
          userService.getAll(),
        ]);

        const products = prodRes.data || [];
        const orders = ordRes.data || [];
        const users = usrRes.data || [];

        const revenue = orders.reduce((sum, ord) => {
          if (ord.status !== 'Cancelled') {
            return sum + Number(ord.total_amount);
          }
          return sum;
        }, 0);

        setStats({
          productsCount: products.length,
          ordersCount: orders.length,
          usersCount: users.length,
          totalRevenue: revenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Failed to fetch dashboard metrics. Please check admin permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="container section-padding loading-container">
        <div className="spinner"></div>
        <p>Calculating system metrics...</p>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard-page section-padding">
      <div className="admin-header-row">
        <div>
          <h1 className="page-heading">Admin Management Center</h1>
          <p className="page-subheading">
            Live overview of sales, inventory volume, and customer fulfillment.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/products/new" className="btn btn-primary">
            <PlusCircle size={18} /> Add New Product
          </Link>
          <Link to="/admin/products" className="btn btn-outline">
            <Package size={18} /> Manage Inventory
          </Link>
          <Link to="/admin/orders" className="btn btn-outline">
            <ShoppingBag size={18} /> Review Orders
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="stats-kpi-grid">
        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-green">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Realized Revenue</span>
            <h2 className="kpi-value">${stats.totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-blue">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Orders Placed</span>
            <h2 className="kpi-value">{stats.ordersCount}</h2>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-purple">
            <Package size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active Catalog Products</span>
            <h2 className="kpi-value">{stats.productsCount}</h2>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-amber">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Registered Accounts</span>
            <h2 className="kpi-value">{stats.usersCount}</h2>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="recent-orders-section card">
        <div className="table-header-bar">
          <h3>Recent Customer Orders</h3>
          <Link to="/admin/orders" className="view-more-link">
            View all orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="no-data-text">No orders recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td><code>#{ord.id.slice(0, 8)}</code></td>
                    <td>{ord.shipping_name}</td>
                    <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                    <td><strong>${Number(ord.total_amount).toFixed(2)}</strong></td>
                    <td>
                      <span className={`order-status-badge badge-${ord.status.toLowerCase()}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${ord.id}`} className="btn-icon" title="View Details">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
