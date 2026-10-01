import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { fetchApi } from '../api/client';
import { useAuth } from './AuthContext';

interface WishlistItemData {
  id: string;
  productId: string;
  product: Product;
}

interface WishlistContextType {
  wishlist: WishlistItemData[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchApi<{ wishlist: WishlistItemData[] }>('/wishlist');
      setWishlist(data.wishlist);
    } catch (err) {
      console.error('Wishlist fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await fetchApi(`/wishlist/${productId}`, { method: 'POST' });
      await refreshWishlist();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
