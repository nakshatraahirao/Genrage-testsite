import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen bg-rage-950 text-white selection:bg-white selection:text-black">
                
                {/* Global Header */}
                <Header onOpenSearch={() => setIsSearchOpen(true)} />

                {/* Main Views */}
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/track-order" element={<TrackOrderPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Fallback 404 */}
                    <Route
                      path="*"
                      element={
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                          <h1 className="font-['Cinzel'] text-5xl font-black text-white">404</h1>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">
                            This sector does not exist in the archive.
                          </p>
                          <Link
                            to="/"
                            className="mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
                          >
                            Return to Storefront
                          </Link>
                        </div>
                      }
                    />
                  </Routes>
                </main>

                {/* Global Footer */}
                <Footer />

                {/* Overlays & Drawers */}
                <CartDrawer />
                <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                <AuthModal />

              </div>
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
