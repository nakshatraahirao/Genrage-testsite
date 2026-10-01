import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer, items, summary, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCartDrawer();
    };
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, (summary.subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-rage-950 border-l border-rage-800 text-white flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-rage-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                Your Bag ({summary.itemCount})
              </h2>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 text-gray-400 hover:text-white transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-rage-900 px-6 py-3 border-b border-rage-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
              {remainingForFreeShipping > 0
                ? `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for FREE EXPRESS SHIPPING`
                : '🎉 You have qualified for FREE SHIPPING!'}
            </p>
            <div className="w-full bg-rage-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-rage-800/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-rage-600 mb-4 stroke-1" />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-300">Your bag is empty</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Browse our catalog and discover the latest avant-garde drop pieces.
                </p>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="mt-6 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeCartDrawer}
                    className="w-20 h-24 flex-shrink-0 bg-rage-900 overflow-hidden border border-rage-800"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCartDrawer}
                          className="text-xs font-bold uppercase tracking-wider text-white hover:text-gray-300 line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-rage-red transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Info */}
                      {(item.size || item.color) && (
                        <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">
                          {item.color} {item.size ? `/ Size: ${item.size}` : ''}
                        </p>
                      )}

                      <p className="text-xs font-bold text-gray-200 mt-1">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-rage-700 bg-rage-900">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-white">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-rage-800 bg-rage-900/60 space-y-4">
              <div className="space-y-1.5 text-xs uppercase tracking-wider text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-bold">
                    {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-rage-800">
                  <span>Total</span>
                  <span>₹{summary.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
