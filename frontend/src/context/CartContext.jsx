import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { orderService } from '../services/orderService';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      // Check if already in cart
      if (prev.some(item => item.id === product.id)) {
        addToast(`${product.name} is already in your cart.`, 'info');
        return prev;
      }
      addToast(`${product.name} added to cart!`, 'success');
      return [...prev, product];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    let successfulOrders = 0;
    let failedItems = [];

    try {
      // Create orders sequentially to avoid SQLite lock errors
      for (const item of cartItems) {
        try {
          await orderService.createOrder(item.id);
          successfulOrders++;
        } catch (itemError) {
          console.error(`Failed to purchase item ${item.name}:`, itemError);
          failedItems.push(item);
        }
      }

      if (successfulOrders > 0) {
        addToast(`Successfully purchased ${successfulOrders} items!`, 'success');
      }

      if (failedItems.length > 0) {
        addToast(`${failedItems.length} items could not be processed (they might have been deleted). They remain in your cart.`, 'error');
        setCartItems(failedItems); // Keep only failed items
      } else {
        clearCart(); // All succeeded
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      addToast("A critical error occurred during checkout.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      checkout,
      isCheckingOut,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
