import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Shield, Truck, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { fetchApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Accordion state
  const [openSection, setOpenSection] = useState<'fabric' | 'shipping' | 'sizing' | null>('fabric');

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await fetchApi<{ product: Product; relatedProducts: Product[] }>(`/products/${slug}`);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts);

        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0].imageUrl);
        }

        if (data.product.variants && data.product.variants.length > 0) {
          // Select first in-stock variant
          const inStock = data.product.variants.find(v => v.stockQuantity > 0) || data.product.variants[0];
          setSelectedVariant(inStock);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rage-950 flex items-center justify-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Garment Specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-rage-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest">Garment Not Found</h2>
        <p className="text-xs text-gray-400 mt-2">The piece you are looking for has been archived or removed.</p>
        <Link to="/shop" className="mt-6 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest">
          Browse Archive
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;

  const handleAddToCart = () => {
    if (selectedVariant && isOutOfStock) return;
    addToCart(product.id, selectedVariant?.id || null, quantity);
  };

  const handleBuyNow = () => {
    if (selectedVariant && isOutOfStock) return;
    addToCart(product.id, selectedVariant?.id || null, quantity);
    navigate('/checkout');
  };

  // Group variants by color
  const availableColors = Array.from(new Set(product.variants.map(v => v.color)));
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size)));

  const handleSelectColor = (color: string) => {
    const matching = product.variants.find(v => v.color === color && (selectedVariant ? v.size === selectedVariant.size : true))
      || product.variants.find(v => v.color === color);
    if (matching) setSelectedVariant(matching);
  };

  const handleSelectSize = (size: string) => {
    const matching = product.variants.find(v => v.size === size && (selectedVariant ? v.color === selectedVariant.color : true))
      || product.variants.find(v => v.size === size);
    if (matching) setSelectedVariant(matching);
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition">Shop</Link>
          <span>/</span>
          <span className="text-white truncate">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Gallery Column (Images) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Featured Image */}
            <div className="relative aspect-[3/4] w-full bg-rage-900 overflow-hidden border border-rage-800">
              {product.discountPercent && product.discountPercent > 0 ? (
                <div className="absolute top-4 left-4 z-10 bg-rage-red text-white text-xs font-black uppercase px-3 py-1 tracking-widest">
                  SAVE {product.discountPercent}%
                </div>
              ) : null}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full transition ${
                  inWishlist ? 'bg-rage-red text-white' : 'bg-black/50 text-gray-300 hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>

              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail switcher */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`aspect-[3/4] bg-rage-900 overflow-hidden border-2 transition ${
                      selectedImage === img.imageUrl ? 'border-white' : 'border-rage-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Purchase Column */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* Header / Title */}
            <div className="border-b border-rage-800 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
                {product.category?.name || 'Gothic Streetwear'}
              </span>
              <h1 className="font-['Cinzel'] text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white mt-1">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-black text-white tracking-wider">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through tracking-wider">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                  (Incl. of all taxes)
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xs text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Color:</span>
                  <span className="text-white">{selectedVariant?.color}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const variantForColor = product.variants.find(v => v.color === color);
                    const isSelected = selectedVariant?.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleSelectColor(color)}
                        className={`flex items-center gap-2 px-3.5 py-2 border text-xs uppercase font-bold tracking-wider transition ${
                          isSelected
                            ? 'border-white bg-white text-black'
                            : 'border-rage-800 bg-rage-900 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {variantForColor?.colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-gray-500"
                            style={{ backgroundColor: variantForColor.colorHex }}
                          />
                        )}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Select Size:</span>
                  {selectedVariant && (
                    <span className={selectedVariant.stockQuantity <= 5 ? 'text-rage-red' : 'text-green-400'}>
                      {selectedVariant.stockQuantity <= 0
                        ? 'Out of Stock'
                        : selectedVariant.stockQuantity <= 5
                        ? `Only ${selectedVariant.stockQuantity} remaining!`
                        : 'In Stock'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((size) => {
                    const variant = product.variants.find(v => v.size === size && (selectedVariant ? v.color === selectedVariant.color : true));
                    const isSelected = selectedVariant?.size === size;
                    const isSizeOOS = !variant || variant.stockQuantity <= 0;

                    return (
                      <button
                        key={size}
                        disabled={isSizeOOS}
                        onClick={() => handleSelectSize(size)}
                        className={`py-3 text-xs font-black uppercase tracking-wider border transition ${
                          isSelected
                            ? 'bg-white text-black border-white'
                            : isSizeOOS
                            ? 'bg-rage-950/40 text-gray-600 border-rage-800/40 line-through cursor-not-allowed'
                            : 'bg-rage-900 text-white border-rage-800 hover:border-gray-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-rage-700 bg-rage-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-gray-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-3 text-gray-300 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-4 bg-rage-900 border border-white text-white hover:bg-white hover:text-black text-xs font-black uppercase tracking-[0.2em] transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-40"
              >
                {isOutOfStock ? 'Out of Stock' : 'Buy It Now'}
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-rage-800 text-center text-[10px] uppercase tracking-wider text-gray-400">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-white" />
                <span>Ships &lt; 48 Hrs</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-white" />
                <span>7-Day Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Shield className="w-4 h-4 text-white" />
                <span>100% Genuine</span>
              </div>
            </div>

            {/* Expandable Accordions */}
            <div className="border-b border-rage-800 divide-y divide-rage-800">
              {/* Fabric Specs */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'fabric' ? null : 'fabric')}
                  className="w-full py-3.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white"
                >
                  <span>Fabric & Silhouette Specs</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'fabric' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'fabric' && (
                  <div className="pb-4 text-xs text-gray-300 leading-relaxed animate-fadeIn">
                    <p>{product.details || 'Crafted with premium high-density combed cotton with reinforced dual-needle seams and custom gothic hardware.'}</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400 text-[11px]">
                      <li>420 GSM heavy French Terry</li>
                      <li>Hand-distressed washed treatment</li>
                      <li>Cold machine wash inside out. Line dry recommended.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                  className="w-full py-3.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white"
                >
                  <span>Shipping & Hassle-Free Returns</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'shipping' && (
                  <div className="pb-4 text-xs text-gray-400 leading-relaxed animate-fadeIn">
                    <p>All domestic orders ship via premium express air couriers. Expect delivery within 2-4 business days. Free shipping on all orders over ₹2,000.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-rage-800">
            <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest text-center text-white mb-8">
              Complete The Look
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
