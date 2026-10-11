import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container not-found-page section-padding text-center">
      <div className="card not-found-card">
        <AlertTriangle size={64} className="not-found-icon" />
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <p className="not-found-desc">
          The requested page could not be located. It might have been moved, removed, or the link is incorrect.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} /> Return to Home
          </Link>
          <Link to="/shop" className="btn btn-outline">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};
