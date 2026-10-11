import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  ShieldAlert,
  Search,
  Menu,
  X,
  Package,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <ShoppingBag className="brand-icon" size={26} />
          <span>Apex<span className="brand-accent">Store</span></span>
        </Link>

        {/* Search Bar - Desktop */}
        <form className="nav-search-form" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products, brands, gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>

          {/* Cart Icon */}
          <Link to="/cart" className="cart-nav-btn" title="View Cart">
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {/* Auth State */}
          {user ? (
            <div className="nav-user-menu">
              {isAdmin && (
                <Link to="/admin" className="admin-badge-btn" title="Admin Dashboard">
                  <ShieldAlert size={16} />
                  <span>Admin</span>
                </Link>
              )}

              <Link to="/my-orders" className="nav-link orders-link" title="My Orders">
                <Package size={18} />
                <span>Orders</span>
              </Link>

              <Link to="/profile" className="nav-link profile-link" title="My Profile">
                <User size={18} />
                <span>{user.full_name?.split(' ')[0] || 'Profile'}</span>
              </Link>

              <button onClick={handleLogout} className="logout-btn" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-guest-btns">
              <Link to="/login" className="btn btn-outline-sm">Login</Link>
              <Link to="/register" className="btn btn-primary-sm">Register</Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary-sm">Search</button>
          </form>

          <div className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
              Cart ({totalItems})
            </Link>

            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile ({user.full_name})</Link>
                <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#6366f1', fontWeight: 600 }}>
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
