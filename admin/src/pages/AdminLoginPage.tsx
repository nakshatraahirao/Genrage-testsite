import React, { useState } from 'react';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('admin@genrage.com', 'admin123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-widest text-white uppercase">GENRAGE</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Control Centre</p>
        </div>

        <div className="bg-[#121212] border border-[#2a2a2a] p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white text-center">
            Administrator Sign In
          </h2>

          {/* 1-Click Demo */}
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Quick Demo Access
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-xs font-bold uppercase tracking-wider text-white border border-[#404040] transition disabled:opacity-50"
            >
              Login as Demo Admin
            </button>
            <p className="text-[10px] text-gray-500 mt-1.5">admin@genrage.com / admin123</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@genrage.com"
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
          Customer storefront →{' '}
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition underline">
            localhost:5173
          </a>
        </p>
      </div>
    </div>
  );
};
