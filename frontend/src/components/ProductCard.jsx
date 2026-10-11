import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = React.useState(false);

  const cartItem = cartItems.find((item) => item.id === product.id);
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = cartItem && cartItem.quantity >= product.stock;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock || isMaxInCart) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-img-link">
        <div className="product-card-img-wrap">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <span className="product-category-tag">{product.category}</span>
          {isOutOfStock ? (
            <span className="stock-badge out-of-stock">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="stock-badge low-stock">Only {product.stock} left</span>
          ) : null}
        </div>
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-card-title" title={product.name}>
          {product.name}
        </Link>
        <p className="product-card-desc">
          {product.description || 'Premium quality product crafted with attention to detail.'}
        </p>

        <div className="product-card-footer">
          <div className="product-price">
            <span className="currency">$</span>
            <span className="amount">{Number(product.price).toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxInCart}
            className={`btn-add-cart ${added ? 'btn-added' : ''}`}
            title={isOutOfStock ? 'Out of stock' : isMaxInCart ? 'Maximum stock added' : 'Add to Cart'}
          >
            {added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingCart size={16} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
