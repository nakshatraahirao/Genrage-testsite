import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-gray-400 border-t border-rage-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-rage-800">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-['Cinzel'] text-3xl font-black text-white tracking-widest">GENRAGE</h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Avant-garde gothic streetwear engineered with heavy GSM fabrics, custom silhouettes, and industrial cyber-sigilism aesthetics.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-rage-500 font-bold block mb-2">
                JOIN THE CULT // GET 10% OFF FIRST DROP
              </span>
              <form onSubmit={handleSubscribe} className="flex max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL"
                  required
                  className="bg-rage-900 border border-rage-700 text-white placeholder-gray-500 text-xs px-4 py-3 flex-grow focus:outline-none focus:border-white uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-green-400 mt-2">You are on the drop list. Welcome to the legion.</p>
              )}
            </div>
          </div>

          {/* Footer Quick Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Storefront</h4>
              <ul className="space-y-2.5 text-xs font-medium uppercase tracking-wider">
                <li><Link to="/track-order" className="hover:text-white transition">Track My Order</Link></li>
                <li><Link to="/exchange-portal" className="hover:text-white transition">Exchange Portal</Link></li>
                <li><Link to="/reviews" className="hover:text-white transition">GENRAGE Reviews</Link></li>
                <li><Link to="/policies" className="hover:text-white transition">Exchange Policy</Link></li>
                <li><Link to="/policies" className="hover:text-white transition">Privacy & Policies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs font-medium uppercase tracking-wider">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Partner with us</Link></li>
                <li><a href="http://localhost:5174" target="_blank" rel="noreferrer" className="text-rage-red hover:text-red-400 transition font-bold">Admin Portal ↗</a></li>
              </ul>
            </div>
          </div>

          {/* Social & Provenance */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Origin</h4>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Proudly Homegrown in India
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Crafted in Mumbai & Tirupur using ethical domestic manufacturing and combed 420 GSM Indian cotton.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-rage-900 border border-rage-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-rage-900 border border-rage-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 uppercase tracking-widest gap-4">
          <p>© 2026 GENRAGE. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>AVANT-GARDE CLOTHING</span>
            <span>•</span>
            <span>SECURE CHECKOUT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
