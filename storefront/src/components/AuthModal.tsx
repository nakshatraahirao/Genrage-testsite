import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'customer' | 'admin') => {
    setError('');
    setLoading(true);
    try {
      if (type === 'customer') {
        await login('customer@genrage.com', 'customer123');
      } else {
        await login('admin@genrage.com', 'admin123');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-rage-950 border border-rage-700 p-8 text-white shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
          aria-label="Close auth modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Heading */}
        <div className="text-center mb-6">
          <h2 className="font-['Cinzel'] text-2xl font-black tracking-widest uppercase">
            {isRegister ? 'Join GenRage' : 'Access Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            {isRegister ? 'Unlock early drop access and order tracking' : 'Enter your credentials to continue'}
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="bg-rage-900 border border-rage-800 p-3 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2 px-3 bg-rage-800 hover:bg-rage-700 text-[11px] font-bold uppercase tracking-wider text-white border border-rage-700 transition text-center"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 bg-rage-800 hover:bg-rage-700 text-[11px] font-bold uppercase tracking-wider text-white border border-rage-700 transition text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-rage-red text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rager Karan"
                  className="w-full bg-rage-900 border border-rage-800 text-white pl-10 pr-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-rage-900 border border-rage-800 text-white pl-10 pr-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-rage-900 border border-rage-800 text-white pl-10 pr-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-rage-900 border border-rage-800 text-white pl-10 pr-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-white font-bold underline ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-white font-bold underline ml-1"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
