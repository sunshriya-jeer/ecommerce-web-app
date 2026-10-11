import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import {
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingData, setShippingData] = useState({
    shipping_name: user?.full_name || '',
    shipping_email: user?.email || '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user?.id && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setShippingData((prev) => ({
      ...prev,
      shipping_name: prev.shipping_name || user.full_name || '',
      shipping_email: prev.shipping_email || user.email || '',
    }));
  }

  if (cartItems.length === 0) {
    return (
      <div className="container section-padding text-center">
        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px' }}>
          <h2>Cart is Empty</h2>
          <p style={{ margin: '16px 0', color: '#64748b' }}>
            You need items in your cart before proceeding to checkout.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const finalTotal = subtotal + shippingCost;

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const {
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
    } = shippingData;

    if (
      !shipping_name.trim() ||
      !shipping_email.trim() ||
      !shipping_phone.trim() ||
      !shipping_address.trim() ||
      !shipping_city.trim() ||
      !shipping_state.trim() ||
      !shipping_pincode.trim()
    ) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        shipping_name: shipping_name.trim(),
        shipping_email: shipping_email.trim(),
        shipping_phone: shipping_phone.trim(),
        shipping_address: shipping_address.trim(),
        shipping_city: shipping_city.trim(),
        shipping_state: shipping_state.trim(),
        shipping_pincode: shipping_pincode.trim(),
      };

      const res = await orderService.create(orderPayload);

      if (res?.success && res?.data?.order_id) {
        clearCart();
        // Redirect directly to the placed order's tracking/details page
        navigate(`/orders/${res.data.order_id}`, {
          state: { orderPlaced: true },
        });
      } else {
        const errorMsg = res?.message || 'Failed to place order. Please try again.';
        setError(errorMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Error processing your order. Please check stock and try again.';
      setError(errMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-page section-padding">
      <Link to="/cart" className="back-link">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="page-heading">Checkout & Finalize Order</h1>
      <p className="page-subheading">
        Provide delivery details and choose your simulated payment method.
      </p>

      {error && (
        <div className="error-alert" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        {/* Shipping Information Column */}
        <div className="checkout-form-column">
          <div className="card checkout-card">
            <h2 className="checkout-section-title">
              <Truck size={20} /> 1. Shipping Information
            </h2>

            <div className="form-group-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="shipping_name"
                  value={shippingData.shipping_name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="shipping_email"
                  value={shippingData.shipping_email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="shipping_phone"
                value={shippingData.shipping_phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="shipping_address"
                value={shippingData.shipping_address}
                onChange={handleChange}
                placeholder="123 Innovation Way, Suite 4B"
                required
              />
            </div>

            <div className="form-group-row-3">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="shipping_city"
                  value={shippingData.shipping_city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  required
                />
              </div>

              <div className="form-group">
                <label>State / Region *</label>
                <input
                  type="text"
                  name="shipping_state"
                  value={shippingData.shipping_state}
                  onChange={handleChange}
                  placeholder="California"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode / ZIP *</label>
                <input
                  type="text"
                  name="shipping_pincode"
                  value={shippingData.shipping_pincode}
                  onChange={handleChange}
                  placeholder="94105"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card checkout-card" style={{ marginTop: '24px' }}>
            <h2 className="checkout-section-title">
              <CreditCard size={20} /> 2. Payment Method
            </h2>
            <p className="payment-disclaimer">
              No real credit card is charged. Select an active payment demonstration mode.
            </p>

            <div className="payment-options">
              <label
                className={`payment-option-card ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay upon delivery at your doorsteps in cash or UPI.</p>
                </div>
              </label>

              <label
                className={`payment-option-card ${paymentMethod === 'Demo Payment' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Demo Payment"
                  checked={paymentMethod === 'Demo Payment'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Demo Digital Payment (Simulated)</strong>
                  <p>Instant simulated transaction without external card gateway.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Items & Totals Summary Column */}
        <div className="checkout-summary-column">
          <div className="card summary-card">
            <h3 className="summary-title">Order Review</h3>

            <div className="checkout-items-preview">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-line">
                  <img src={item.image_url} alt={item.name} className="checkout-item-thumb" />
                  <div className="checkout-item-details">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="checkout-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Delivery</span>
              <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-line">
              <span>Grand Total</span>
              <span className="total-amount">${finalTotal.toFixed(2)}</span>
            </div>

            {error && (
              <div className="error-alert" style={{ margin: '16px 0', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg checkout-btn"
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span> Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Confirm & Place Order (${finalTotal.toFixed(2)})
                </>
              )}
            </button>

            <div className="cart-guarantee">
              <ShieldCheck size={18} />
              <span>Orders are recorded securely to Supabase DB.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
