import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  lightMode?: boolean; // For light sections like GENRAGE BASICS
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, lightMode = false }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);

  const primaryImage = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  const secondaryImage = product.images?.[1]?.imageUrl || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants?.[0]?.id || null;
    addToCart(product.id, firstVariant, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col transition-all duration-300">
      
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className={`relative aspect-[3/4] w-full overflow-hidden ${
          lightMode ? 'bg-neutral-200' : 'bg-rage-900'
        }`}
      >
        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-rage-red text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-md">
            SAVE {product.discountPercent}%
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all duration-200 ${
            inWishlist
              ? 'bg-rage-red text-white'
              : 'bg-black/40 text-gray-300 hover:text-white hover:bg-black/70'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Image with hover transition */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick Add Overlay on desktop hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-black/90 hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 backdrop-blur-sm border border-white/20 hover:border-white transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="pt-3 pb-2 flex flex-col flex-grow">
        
        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider line-clamp-1 transition ${
            lightMode ? 'text-black hover:text-gray-700' : 'text-gray-100 hover:text-white'
          }`}>
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-bold tracking-wider ${
            product.discountPercent ? 'text-rage-red' : (lightMode ? 'text-black' : 'text-white')
          }`}>
            RS. {product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-gray-500 line-through tracking-wider">
              RS. {product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Available Color Swatches Preview */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from(new Set(product.variants.map(v => v.colorHex || '#222'))).slice(0, 4).map((hex, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-gray-600/50"
                style={{ backgroundColor: hex }}
              />
            ))}
            {product.variants.length > 4 && (
              <span className="text-[9px] text-gray-500 font-bold">+{product.variants.length - 4}</span>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
