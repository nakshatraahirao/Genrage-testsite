import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchApi } from '../api/client';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await fetchApi<{ products: Product[] }>(`/products?search=${encodeURIComponent(query.trim())}&limit=8`);
        setResults(data.products);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-12 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Search Input */}
        <div className="flex items-center justify-between pb-6 border-b border-rage-800">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH BY NAME, CATEGORY OR STYLE..."
              className="w-full bg-rage-900 border border-rage-700 pl-11 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-gray-500 uppercase tracking-widest focus:outline-none focus:border-white transition"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick suggestions if empty */}
        {!query && (
          <div className="py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {['Baggy Pants', 'Boxy Jacket', 'Ringer Tee', 'Basics', 'Sleeveless Hoodie', 'Leather Backpack'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-2 bg-rage-900 border border-rage-800 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gray-500 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="py-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                {loading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
              </span>
              {results.length > 0 && (
                <button
                  onClick={handleViewAll}
                  className="text-xs font-bold uppercase tracking-widest text-white hover:underline flex items-center gap-1"
                >
                  View All in Shop <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {results.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-300">
                  No matching garments found
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Try checking for spelling errors or searching for broader terms like "pants" or "jacket".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="group cursor-pointer bg-rage-900 border border-rage-800 p-2 hover:border-gray-500 transition"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-black mb-2">
                      <img
                        src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-rage-red mt-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
