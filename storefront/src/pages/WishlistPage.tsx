import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-rage-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <Heart className="w-14 h-14 text-rage-600 mb-4" />
        <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest">Sign In to Save Pieces</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm">
          Keep track of your favorite avant-garde drops across all your devices.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rage-950 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-rage-800 pb-6 mb-10 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
              Personal Archive
            </span>
            <h1 className="font-['Cinzel'] text-3xl font-black uppercase tracking-widest text-white mt-1">
              Your Wishlist ({wishlist.length})
            </h1>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest text-white hover:underline flex items-center gap-1 font-bold"
          >
            Explore More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-rage-900/40 border border-rage-800 p-8">
            <Heart className="w-12 h-12 text-rage-600 mx-auto mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">Your wishlist is empty</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Save your favorite garments by clicking the heart icon on any product card.
            </p>
            <Link
              to="/shop"
              className="inline-block mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              const firstVariant = product.variants?.[0]?.id || null;
              return (
                <div key={item.id} className="bg-rage-900 border border-rage-800 flex flex-col group">
                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                    <img
                      src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-rage-red hover:bg-black transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white hover:text-gray-300 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs font-black text-white mt-1">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(product.id, firstVariant, 1);
                        toggleWishlist(product.id);
                      }}
                      className="w-full py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
