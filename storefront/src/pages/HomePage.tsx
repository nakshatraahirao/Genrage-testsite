import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { Product, Review } from '../types';
import { fetchApi } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export const HomePage: React.FC = () => {
  const [basics, setBasics] = useState<Product[]>([]);
  const [justDropped, setJustDropped] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Gift Card State
  const [selectedDenomination, setSelectedDenomination] = useState(2000);
  const [giftCardQuantity, setGiftCardQuantity] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [basicsData, droppedData, reviewsData] = await Promise.all([
          fetchApi<{ products: Product[] }>('/products?category=basics&limit=4'),
          fetchApi<{ products: Product[] }>('/products?isNewArrival=true&limit=16'),
          fetchApi<{ reviews: Review[] }>('/content/reviews')
        ]);
        setBasics(basicsData.products);
        setJustDropped(droppedData.products);
        setReviews(reviewsData.reviews);
      } catch (err) {
        console.error('Home data load failed', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleAddGiftCard = () => {
    // Find or pick any product to attach gift card or trigger cart
    const giftCardItem = basics[0];
    if (giftCardItem) {
      addToCart(giftCardItem.id, null, giftCardQuantity);
    }
  };

  const categoryShortcuts = [
    { name: 'new in', path: '/shop?filter=new', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400' },
    { name: 'pants', path: '/shop?category=bottoms', image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400' },
    { name: 'tank tops', path: '/shop?category=tops', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400' },
    { name: 'jackets', path: '/shop?category=jackets', image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400' },
    { name: 't-shirts', path: '/shop?category=tops', image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400' },
  ];

  return (
    <div className="space-y-0">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] sm:h-[90vh] bg-black overflow-hidden flex items-center justify-center">
        {/* Background Editorial Visual */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=1600&auto=format&fit=crop&q=85"
            alt="GENRAGE Gothic Streetwear Lookbook"
            fetchPriority="high"
            className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-90"
          />
        </div>

        {/* Ambient Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-rage-950 via-transparent to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-rage-950/60 via-transparent to-rage-950/60 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-3 animate-fadeIn">
            AUTUMN / WINTER 2026 DROP
          </span>
          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-widest leading-none drop-shadow-2xl">
            GENRAGE
          </h1>
          <p className="font-['Syne'] text-base sm:text-xl font-bold uppercase tracking-[0.25em] text-gray-300 mt-4 max-w-2xl">
            Avant-Garde Gothic Streetwear // Heavy 420 GSM Silhouettes
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link
              to="/shop"
              className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.25em] hover:bg-gray-200 transition duration-300 shadow-xl"
            >
              Explore Collection
            </Link>
            <Link
              to="/shop?category=basics"
              className="px-8 py-4 border border-white/60 text-white font-bold text-xs uppercase tracking-[0.25em] hover:bg-white hover:text-black transition duration-300 backdrop-blur-sm"
            >
              Shop Basics
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 z-20 flex flex-col items-center gap-2 text-[10px] tracking-widest text-gray-400 uppercase">
          <span>Scroll to explore</span>
          <div className="w-[1px] h-8 bg-gray-500 animate-pulse" />
        </div>
      </section>

      {/* 2. CATEGORY SHORTCUTS CAROUSEL / GRID */}
      <section className="bg-black py-8 border-y border-rage-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 gap-3 sm:gap-6 text-center">
            {categoryShortcuts.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="group flex flex-col items-center gap-2.5"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-rage-700 p-1 group-hover:border-white transition duration-300 bg-rage-900">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full filter grayscale contrast-125 group-hover:scale-110 transition duration-300"
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-300 group-hover:text-white transition">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GENRAGE BASICS SECTION (High-contrast light grey section matching schema) */}
      <section className="bg-[#D6D6D6] text-black py-16 sm:py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-['Cinzel'] text-2xl sm:text-4xl font-black uppercase tracking-[0.2em] text-black">
              GENRAGE BASICS
            </h2>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-600 mt-2">
              Heavyweight 420 GSM French Terry Daily Wear
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {basics.map((product) => (
              <ProductCard key={product.id} product={product} lightMode={true} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/shop?category=basics"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-neutral-800 transition"
            >
              View All Basics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. JUST DROPPED / NEW ARRIVALS (Dense dark grid matching schema) */}
      <section className="bg-rage-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-rage-400 block mb-1">
              NEW ARRIVALS
            </span>
            <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-black uppercase tracking-[0.2em] text-white">
              JUST DROPPED
            </h2>
            <div className="w-16 h-[2px] bg-rage-red mx-auto mt-4" />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {justDropped.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition"
            >
              Shop Full Collection ({justDropped.length}+ Pieces)
            </Link>
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL LOOKBOOK BANNER (Dark Monogram Aesthetic) */}
      <section className="relative py-28 bg-black overflow-hidden border-y border-rage-800">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1600"
            alt="Editorial"
            className="w-full h-full object-cover filter grayscale contrast-150"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-white/40 flex items-center justify-center font-['Cinzel'] text-5xl font-black text-white">
            G
          </div>
          <h3 className="font-['Cinzel'] text-2xl sm:text-4xl font-black uppercase tracking-[0.3em] text-white">
            AVANT-GARDE ARCHIVES
          </h3>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-3 max-w-md mx-auto">
            Limited batch run. No mass re-releases. Designed for the nonconformist.
          </p>
        </div>
      </section>

      {/* 6. GENRAGE GIFT CARD SECTION (Matching design schema) */}
      <section className="bg-[#E5E5E5] text-black py-20 border-b border-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual 3D Cards Representation */}
            <div className="lg:col-span-6 flex justify-center items-center py-6">
              <div className="relative w-72 sm:w-80 h-48 sm:h-52">
                <div className="absolute inset-0 bg-neutral-900 rounded-xl p-6 text-white shadow-2xl transform -rotate-6 border border-neutral-700">
                  <span className="font-['Cinzel'] text-xl font-bold tracking-widest">GENRAGE</span>
                  <p className="text-[10px] tracking-widest uppercase text-neutral-400 mt-12">Digital Gift Pass</p>
                  <p className="font-bold text-lg mt-1">₹{selectedDenomination.toLocaleString('en-IN')}</p>
                </div>
                <div className="absolute inset-0 bg-black rounded-xl p-6 text-white shadow-2xl transform rotate-3 border border-neutral-600 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="font-['Cinzel'] text-xl font-black tracking-widest">GENRAGE</span>
                    <span className="text-[9px] uppercase tracking-widest bg-rage-red px-2 py-0.5 font-bold">PASS</span>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-gray-400">Exclusive Value</p>
                    <p className="font-black text-2xl mt-0.5">₹{selectedDenomination.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Card Configurator */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
                  GENRAGE GIFT CARD
                </h3>
                <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider mt-1">
                  Denominations
                </p>
              </div>

              {/* Denomination Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {[1000, 2000, 5000, 10000, 20000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedDenomination(amount)}
                    className={`py-3 px-2 text-xs font-bold uppercase tracking-wider border transition ${
                      selectedDenomination === amount
                        ? 'bg-black text-white border-black shadow'
                        : 'bg-white text-black border-neutral-400 hover:border-black'
                    }`}
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-black bg-white">
                  <button
                    onClick={() => setGiftCardQuantity(Math.max(1, giftCardQuantity - 1))}
                    className="px-3 py-2 text-black hover:bg-neutral-200 transition"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold">{giftCardQuantity}</span>
                  <button
                    onClick={() => setGiftCardQuantity(giftCardQuantity + 1)}
                    className="px-3 py-2 text-black hover:bg-neutral-200 transition"
                  >
                    +
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span>I want to send this as a gift</span>
                </label>
              </div>

              {/* Add to Cart Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAddGiftCard}
                  className="w-full sm:w-auto px-12 py-4 bg-black text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-neutral-800 transition"
                >
                  ADD TO CART
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. STREET EDITORIAL FULL-WIDTH BANNER */}
      <section className="relative h-[65vh] bg-black overflow-hidden flex items-end">
        <img
          src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=1600"
          alt="Street Culture"
          className="absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 p-8 sm:p-16 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gray-300 font-bold">
              STREETWEAR ARCHIVE
            </span>
            <h3 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white tracking-widest mt-1">
              BORN IN THE STREETS
            </h3>
          </div>
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-[0.25em] hover:bg-gray-200 transition"
          >
            SHOP ALL
          </Link>
        </div>
      </section>

      {/* 8. PRESS & MEDIA SECTION (ABP, Mid-day, DNA matching schema) */}
      <section className="bg-[#D9D9D9] text-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-neutral-600 mb-12">
            PRESS & MEDIA
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* ABP */}
            <div className="p-6 bg-white/60 border border-neutral-300 space-y-4">
              <span className="text-3xl font-black text-red-600 font-serif tracking-tighter block">
                ▲ abp
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                "What makes GENRAGE unique is its approach to crafting every piece with care and purpose. The brand's designs aren't churned out of factories."
              </p>
            </div>

            {/* Mid-day */}
            <div className="p-6 bg-white/60 border border-neutral-300 space-y-4">
              <span className="text-2xl font-black text-blue-800 tracking-tight block">
                mid-day
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                "From the feel of the fabric to the thoughtfulness of each pattern, every item carries the love and effort of the people behind it."
              </p>
            </div>

            {/* DNA */}
            <div className="p-6 bg-white/60 border border-neutral-300 space-y-4">
              <span className="text-3xl font-black text-neutral-800 tracking-widest font-serif block">
                DNA
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                "At its core, GENRAGE embodies the spirit of 'Make in India. Grow in India.' The brand works with local artisans, uses India's finest raw materials, and contributes to the country's rich textile heritage."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. "Let RAGERS' speak for us" TESTIMONIALS SLIDER */}
      <section className="bg-black py-20 border-t border-rage-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="font-['Cinzel'] text-2xl sm:text-4xl font-black uppercase tracking-[0.2em] text-white">
            Let RAGERS' speak for us
          </h2>

          <div className="flex items-center justify-center gap-2 mt-3 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400" />
            ))}
            <span className="text-xs text-gray-400 ml-2 font-medium flex items-center gap-1">
              from 4,316 verified reviews <ShieldCheck className="w-4 h-4 text-green-400 inline" />
            </span>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12 text-left">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-rage-900 border border-rage-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-yellow-400 mb-2">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 italic line-clamp-3">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-rage-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                    {rev.reviewerName}
                  </p>
                  <p className="text-[9px] text-green-400 uppercase font-semibold">
                    Verified Buyer
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
