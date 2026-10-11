import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Check,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RefreshCw,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getById(id);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err.response?.data?.message || 'Error fetching product information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container loading-container section-padding">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container section-padding">
        <div className="error-alert">
          <AlertTriangle size={24} />
          <div>
            <h3>Product Unavailable</h3>
            <p>{error || 'The requested product could not be found.'}</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartItem = cartItems.find((i) => i.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - inCartQty);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (quantity > remainingStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container product-details-page section-padding">
      <Link to="/shop" className="back-link">
        <ArrowLeft size={18} /> Back to Products
      </Link>

      <div className="product-details-grid">
        {/* Product Image Section */}
        <div className="product-image-container">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="product-main-view-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Product Details Section */}
        <div className="product-info-container">
          <div className="product-category-crumb">{product.category}</div>
          <h1 className="product-main-title">{product.name}</h1>

          <div className="product-price-section">
            <span className="product-price-large">${Number(product.price).toFixed(2)}</span>
            {isOutOfStock ? (
              <span className="stock-tag tag-out">Sold Out</span>
            ) : product.stock < 5 ? (
              <span className="stock-tag tag-low">Only {product.stock} units left!</span>
            ) : (
              <span className="stock-tag tag-in"><PackageCheck size={16} /> In Stock ({product.stock} units)</span>
            )}
          </div>

          <div className="product-description-wrap">
            <h3>Description</h3>
            <p>{product.description || 'No detailed description provided.'}</p>
          </div>

          {/* Cart Quantity & Action */}
          {!isOutOfStock && (
            <div className="purchase-controls">
              <div className="quantity-selector-wrap">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-val">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                    disabled={quantity >= remainingStock}
                  >
                    +
                  </button>
                </div>
                {inCartQty > 0 && (
                  <span className="incart-note">({inCartQty} currently in your cart)</span>
                )}
              </div>

              <div className="action-buttons-wrap">
                <button
                  onClick={handleAddToCart}
                  disabled={remainingStock <= 0}
                  className={`btn btn-primary btn-lg ${added ? 'btn-success' : ''}`}
                >
                  {added ? (
                    <>
                      <Check size={20} /> Added to Cart!
                    </>
                  ) : remainingStock <= 0 ? (
                    'Max Quantity in Cart'
                  ) : (
                    <>
                      <ShoppingCart size={20} /> Add to Cart (${(product.price * quantity).toFixed(2)})
                    </>
                  )}
                </button>
                <Link to="/cart" className="btn btn-outline btn-lg">
                  View Cart
                </Link>
              </div>
            </div>
          )}

          {/* Value Propositions */}
          <div className="details-features-list">
            <div className="details-feat">
              <Truck size={20} />
              <div>
                <strong>Express Delivery</strong>
                <p>Standard delivery in 2-4 business days.</p>
              </div>
            </div>
            <div className="details-feat">
              <ShieldCheck size={20} />
              <div>
                <strong>Authenticity Guarantee</strong>
                <p>100% genuine merchandise backed by warranty.</p>
              </div>
            </div>
            <div className="details-feat">
              <RefreshCw size={20} />
              <div>
                <strong>Easy Returns</strong>
                <p>30 days return and exchange policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
