import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { fetchApi } from '../api/client';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State
  const activeCategory = searchParams.get('category') || '';
  const activeFilter = searchParams.get('filter') || '';
  const searchQuery = searchParams.get('search') || '';
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [priceMax, setPriceMax] = useState<number>(3000);

  const categories = [
    { name: 'All Pieces', slug: '' },
    { name: 'Tops', slug: 'tops' },
    { name: 'Bottoms', slug: 'bottoms' },
    { name: 'Basics', slug: 'basics' },
    { name: 'Jackets', slug: 'jackets' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Clearance', slug: 'clearance' },
  ];

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'One Size'];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory) params.append('category', activeCategory);
      if (activeFilter === 'new') params.append('isNewArrival', 'true');
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSize) params.append('size', selectedSize);
      if (priceMax) params.append('maxPrice', priceMax.toString());

      if (selectedSort === 'price_asc') params.append('sort', 'price_asc');
      if (selectedSort === 'price_desc') params.append('sort', 'price_desc');
      if (selectedSort === 'name_asc') params.append('sort', 'name_asc');

      const data = await fetchApi<{ products: Product[] }>(`/products?${params.toString()}`);
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load shop products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeCategory, activeFilter, searchQuery, selectedSize, selectedSort, priceMax]);

  const handleCategoryChange = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug) {
      nextParams.set('category', slug);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSelectedSize('');
    setPriceMax(3000);
    setSelectedSort('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="border-b border-rage-800 pb-6 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
            GENRAGE ARCHIVE // CATALOG
          </span>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-2 gap-4">
            <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black uppercase tracking-widest text-white">
              {activeCategory ? activeCategory.toUpperCase() : (activeFilter === 'new' ? 'NEW ARRIVALS' : 'COMPLETE COLLECTION')}
            </h1>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              {products.length} Garments Available
            </span>
          </div>
        </div>

        {/* Action Toolbar (Sort & Filter toggle for mobile) */}
        <div className="flex justify-between items-center pb-6 gap-4">
          {/* Category Chips (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeCategory === cat.slug
                    ? 'bg-white text-black'
                    : 'bg-rage-900 text-gray-400 hover:text-white border border-rage-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-rage-900 border border-rage-800 text-xs font-bold uppercase tracking-widest"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold hidden sm:inline">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-rage-900 border border-rage-800 text-white text-xs uppercase tracking-wider px-3 py-2 focus:outline-none focus:border-white"
            >
              <option value="newest">Newest Drops</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Layout with Sidebar Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filters Sidebar */}
          <aside className={`lg:col-span-3 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-rage-900/60 border border-rage-800 p-6 space-y-6">
              
              <div className="flex justify-between items-center border-b border-rage-800 pb-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Filter Criteria</h3>
                {(activeCategory || selectedSize || priceMax < 3000) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] text-rage-red uppercase font-bold hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Mobile Category List */}
              <div className="md:hidden space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`px-3 py-1.5 text-xs uppercase font-bold ${
                        activeCategory === cat.slug ? 'bg-white text-black' : 'bg-rage-800 text-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sizes</p>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                      className={`py-2 text-xs font-bold uppercase tracking-wider border transition ${
                        selectedSize === s
                          ? 'bg-white text-black border-white'
                          : 'bg-rage-900 text-gray-400 border-rage-800 hover:border-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Max Price</span>
                  <span className="text-white font-bold">₹{priceMax.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer bg-rage-800"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>₹800</span>
                  <span>₹3,000+</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-rage-900/30 border border-rage-800 p-8">
                <p className="text-base font-bold uppercase tracking-widest text-white">No products match your criteria</p>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
                  Try adjusting your price filter or selecting another category to see available streetwear items.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};
