import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container section-padding empty-cart-container">
        <div className="empty-cart-card">
          <ShoppingBag size={64} className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any products to your shopping cart yet.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Explore Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const shippingEstimate = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const estimatedTotal = subtotal + shippingEstimate;

  return (
    <div className="container cart-page section-padding">
      <div className="cart-header">
        <h1 className="page-heading">Your Shopping Cart</h1>
        <p className="page-subheading">
          Review your items ({totalItems} items) before proceeding to checkout.
        </p>
      </div>

      <div className="cart-grid">
        {/* Cart Item List */}
        <div className="cart-items-column">
          <div className="cart-table-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Action</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="item-info">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="item-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <Link to={`/products/${item.id}`} className="item-name">
                      {item.name}
                    </Link>
                    <span className="item-category">{item.category}</span>
                  </div>
                </div>

                <div className="item-price">${item.price.toFixed(2)}</div>

                <div className="item-quantity">
                  <div className="quantity-controls-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock && item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  {item.stock && item.quantity >= item.stock && (
                    <span className="max-stock-warn">Max stock</span>
                  )}
                </div>

                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <div className="item-remove">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-bottom">
            <Link to="/shop" className="btn btn-outline">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <button onClick={clearCart} className="btn btn-ghost-danger">
              Clear All Items
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary-column">
          <div className="card summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-line">
              <span>Items Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping Fee</span>
              <span>
                {shippingEstimate === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  `$${shippingEstimate.toFixed(2)}`
                )}
              </span>
            </div>

            {shippingEstimate > 0 && (
              <p className="free-shipping-note">
                Add ${(100 - subtotal).toFixed(2)} more to qualify for FREE delivery!
              </p>
            )}

            <div className="summary-divider"></div>

            <div className="summary-total-line">
              <span>Estimated Total</span>
              <span className="total-amount">${estimatedTotal.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-block btn-lg checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <div className="cart-guarantee">
              <ShieldCheck size={18} />
              <span>Safe & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
