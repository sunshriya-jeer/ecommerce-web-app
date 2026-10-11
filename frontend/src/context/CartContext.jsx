import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      const addQty = Math.max(1, parseInt(quantity, 10));

      if (existing) {
        // Enforce stock ceiling if known
        const updatedQty = Math.min(existing.quantity + addQty, product.stock || 999);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: updatedQty } : item
        );
      } else {
        const itemQty = Math.min(addQty, product.stock || 999);
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            category: product.category,
            stock: product.stock,
            quantity: itemQty,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const validQty = Math.min(newQuantity, item.stock || 999);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
