import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getAll();
        const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (items.length > 0) {
          // Take first 4 items as featured
          setFeaturedProducts(items.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not load featured products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', count: 'Gadgets & Gear', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
    { name: 'Accessories', count: 'Bags & Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80' },
    { name: 'Clothing', count: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80' },
    { name: 'Home', count: 'Living & Decor', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} /> Curated Modern Lifestyle
            </div>
            <h1 className="hero-title">
              Engineered Quality for <span className="text-gradient">Everyday Living</span>.
            </h1>
            <p className="hero-subtitle">
              Discover carefully selected tech gear, minimalist everyday accessories, and modern design essentials delivered directly to your doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/shop?category=Electronics" className="btn btn-outline btn-lg">
                View Tech
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Verified Quality</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">Fast</span>
                <span className="stat-label">Express Delivery</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">Secure</span>
                <span className="stat-label">Direct Order Tracking</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-featured">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Featured Product"
                className="hero-main-img"
              />
              <div className="hero-floating-tag">
                <span className="floating-title">Noise-Canceling Tech</span>
                <span className="floating-price">$199.99</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container section-padding">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Selections</h2>
            <p className="section-subtitle">Handpicked essentials curated for reliability and style</p>
          </div>
          <Link to="/shop" className="view-all-link">
            See all products <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading featured collection...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={48} className="empty-icon" />
            <p>No featured products found yet. Seed products using the backend script!</p>
            <Link to="/shop" className="btn btn-primary">Browse All</Link>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="categories-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Shop By Category</h2>
            <p className="section-subtitle">Browse through our specialized product lines</p>
          </div>

          <div className="category-cards-grid">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <img src={cat.image} alt={cat.name} className="category-img" />
                <div className="category-overlay">
                  <h3>{cat.name}</h3>
                  <p>{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container section-padding">
        <div className="features-banner-grid">
          <div className="feature-box">
            <div className="feature-icon-wrap">
              <Truck size={28} />
            </div>
            <h3>Swift & Reliable Delivery</h3>
            <p>Orders are dispatched with end-to-end milestone tracking and guaranteed delivery windows.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <h3>Protected Payments</h3>
            <p>Demo & Cash-on-Delivery payment options engineered with secure transactional order logging.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <RotateCcw size={28} />
            </div>
            <h3>30-Day Hassle-Free Returns</h3>
            <p>Shop with confidence backed by our comprehensive exchange and refund guarantee.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <Headphones size={28} />
            </div>
            <h3>Dedicated Support</h3>
            <p>Our responsive customer care team is available to assist you throughout your journey.</p>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="cta-section">
        <div className="container cta-card">
          <h2>Ready to Elevate Your Everyday Setup?</h2>
          <p>Explore all categories and experience seamless e-commerce performance.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Start Shopping Now
          </Link>
        </div>
      </section>
    </div>
  );
};
