import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-brand">
            <ShoppingBag className="footer-icon" size={24} />
            <span>Apex<span className="brand-accent">Store</span></span>
          </div>
          <p className="footer-desc">
            A production-ready full-stack e-commerce experience built with React, Node.js, Express, and Supabase PostgreSQL.
          </p>
          <div className="footer-features">
            <div className="footer-feat-item"><Truck size={16} /> Fast Dispatch</div>
            <div className="footer-feat-item"><ShieldCheck size={16} /> Secure Checkout</div>
            <div className="footer-feat-item"><RefreshCw size={16} /> 30-Day Returns</div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul className="footer-links">
            <li><Link to="/shop">Shop All Products</Link></li>
            <li><Link to="/shop?category=Electronics">Electronics & Gear</Link></li>
            <li><Link to="/shop?category=Accessories">Fashion Accessories</Link></li>
            <li><Link to="/shop?category=Clothing">Apparel & Wear</Link></li>
            <li><Link to="/shop?category=Home">Living & Home</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/my-orders">Track Orders</Link></li>
            <li><Link to="/cart">Review Cart</Link></li>
            <li><Link to="/profile">My Account</Link></li>
            <li><a href="#help" onClick={(e) => e.preventDefault()}>Shipping Policy</a></li>
            <li><a href="#help" onClick={(e) => e.preventDefault()}>Terms & Privacy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Project Architecture</h4>
          <p className="footer-note">
            Built as an internship-ready engineering project showcasing RESTful APIs, JWT verification, and Postgres RLS.
          </p>
          <div className="tech-badges">
            <span className="badge">React 19</span>
            <span className="badge">Express</span>
            <span className="badge">Supabase</span>
            <span className="badge">PostgreSQL</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {CURRENT_YEAR} ApexStore. Full-Stack E-Commerce Project.</p>
          <p className="footer-credit">
            Developed with modern web best practices.
          </p>
        </div>
      </div>
    </footer>
  );
};
