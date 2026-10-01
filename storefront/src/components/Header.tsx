import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, Heart, ShoppingBag, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { summary, openCartDrawer } = useCart();
  const { wishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'NEW ARRIVALS', path: '/shop?filter=new' },
    { name: 'TOPS', path: '/shop?category=tops' },
    { name: 'BOTTOMS', path: '/shop?category=bottoms' },
    { name: 'BASICS', path: '/shop?category=basics' },
    { name: 'ACCESSORIES', path: '/shop?category=accessories' },
    { name: 'CLEARANCE', path: '/shop?category=clearance' },
  ];

  return (
    <>
      {/* Top Announcement Bar / Marquee */}
      <div className="bg-black text-gray-300 text-[11px] font-semibold tracking-widest uppercase border-b border-rage-800/60 overflow-hidden py-1.5 select-none">
        <div className="flex animate-marquee whitespace-nowrap justify-around items-center gap-8">
          <span className="flex items-center gap-2">
            LIMITED TIME OFFER: SHOP NOW <span className="text-white">→</span>
          </span>
          <span className="text-rage-500">•</span>
          <span>SHIPS UNDER 48 HOURS</span>
          <span className="text-rage-500">•</span>
          <span className="text-rage-red font-bold">LIMITED QUANTITIES</span>
          <span className="text-rage-500">•</span>
          <span>NO RESTOCKS</span>
          <span className="text-rage-500">•</span>
          <span>FREE SHIPPING ON ORDERS OVER ₹2,000</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-rage-950/95 backdrop-blur-md border-b border-rage-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Gothic Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex flex-col items-center">
              <span className="font-['Cinzel'] tracking-widest text-2xl sm:text-3xl font-black text-white group-hover:text-gray-300 transition duration-300">
                GENRAGE
              </span>
              <span className="text-[9px] tracking-[0.35em] text-rage-400 font-semibold uppercase -mt-1">
                AVANT-GARDE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-xs font-bold tracking-[0.2em] text-gray-300 hover:text-white transition-colors duration-200 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="text-gray-300 hover:text-white transition p-1"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    setShowUserDropdown(false);
                  }
                }}
                className="text-gray-300 hover:text-white transition p-1 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rage-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotificationsDropdown && user && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-rage-900 border border-rage-700 rounded shadow-2xl p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-rage-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-rage-400 hover:text-white underline uppercase"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-rage-800/50 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`py-2.5 px-2 cursor-pointer rounded transition ${
                            n.isRead ? 'opacity-60 hover:opacity-100' : 'bg-rage-800/40 hover:bg-rage-800/80'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">{n.title}</span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t border-rage-800 text-center">
                    <Link
                      to="/account?tab=notifications"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-[11px] text-gray-300 hover:text-white uppercase tracking-wider font-semibold block py-1"
                    >
                      View All Alerts →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="text-gray-300 hover:text-white transition p-1 relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Profile User Icon & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotificationsDropdown(false);
                  }
                }}
                className="text-gray-300 hover:text-white transition p-1"
                aria-label="User Profile"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {showUserDropdown && user && (
                <div className="absolute right-0 mt-3 w-56 bg-rage-900 border border-rage-700 rounded shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-rage-800">
                    <p className="text-xs font-bold text-white uppercase">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-rage-800 text-[9px] font-bold tracking-widest text-rage-300 uppercase rounded">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-rage-800 uppercase tracking-wider"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-rage-800 uppercase tracking-wider"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setShowUserDropdown(false)}
                    className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-rage-800 uppercase tracking-wider sm:hidden"
                  >
                    Wishlist ({wishlist.length})
                  </Link>
                  <div className="border-t border-rage-800 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rage-red hover:bg-rage-800 uppercase tracking-wider font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCartDrawer}
              className="text-gray-300 hover:text-white transition p-1 relative flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {summary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-rage-950 border-t border-rage-800 px-6 py-8 space-y-4 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-bold tracking-[0.2em] text-gray-200 hover:text-white py-2 border-b border-rage-800/40"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Log In / Sign Up
                </button>
              ) : (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 border border-white text-center text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition"
                >
                  My Profile
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
