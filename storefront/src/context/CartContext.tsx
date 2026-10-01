import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary } from '../types';
import { fetchApi } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [loading, setLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setSummary(defaultSummary);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchApi<{ items: CartItem[]; summary: CartSummary }>('/cart');
      setItems(data.items);
      setSummary(data.summary);
    } catch (err) {
      console.error('Cart fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string, variantId?: string | null, quantity = 1) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await fetchApi('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity })
      });
      await refreshCart();
      setIsCartDrawerOpen(true);
    } catch (err: any) {
      alert(err.message || 'Could not add product to cart');
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;
    try {
      await fetchApi(`/cart/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      await refreshCart();
    } catch (err: any) {
      alert(err.message || 'Could not update quantity');
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) return;
    try {
      await fetchApi(`/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      await refreshCart();
    } catch (err: any) {
      alert(err.message || 'Could not remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await fetchApi('/cart', { method: 'DELETE' });
      await refreshCart();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
