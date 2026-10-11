import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Package, LogOut } from 'lucide-react';

export const Profile = () => {
  const { user, isAdmin, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="container profile-page section-padding">
      <div className="profile-container">
        <div className="card profile-card">
          <div className="profile-avatar-banner">
            <div className="profile-avatar-circle">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2>{user.full_name}</h2>
            <span className={`role-badge ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>
              {user.role === 'admin' ? 'Administrator' : 'Standard Customer'}
            </span>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field">
              <div className="field-icon">
                <User size={18} />
              </div>
              <div>
                <label>Full Name</label>
                <p>{user.full_name}</p>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Mail size={18} />
              </div>
              <div>
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Shield size={18} />
              </div>
              <div>
                <label>Account Role</label>
                <p style={{ textTransform: 'capitalize' }}>{user.role}</p>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Calendar size={18} />
              </div>
              <div>
                <label>Account Status</label>
                <p>Active Verified Session</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <Link to="/my-orders" className="btn btn-primary">
              <Package size={18} /> View My Orders
            </Link>
            {isAdmin && (
              <Link to="/admin" className="btn btn-outline" style={{ borderColor: '#6366f1', color: '#6366f1' }}>
                Open Admin Dashboard
              </Link>
            )}
            <button onClick={logout} className="btn btn-ghost-danger">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
