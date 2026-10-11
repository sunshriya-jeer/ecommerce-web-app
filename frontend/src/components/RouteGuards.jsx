import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking admin privileges...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            You do not have administrative privileges to access this area.
          </p>
          <a href="/" className="btn btn-primary">Return to Homepage</a>
        </div>
      </div>
    );
  }

  return children;
};
