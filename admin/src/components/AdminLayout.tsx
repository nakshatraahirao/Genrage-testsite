import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, LogOut, ExternalLink, ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLayout: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/categories', label: 'Categories', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] border-r border-[#1c1c1c] flex flex-col flex-shrink-0 sticky top-0 h-screen">

        {/* Brand Logo */}
        <div className="px-6 py-6 border-b border-[#1c1c1c]">
          <p className="text-lg font-black tracking-widest text-white uppercase">GENRAGE</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Portal</p>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-[#1c1c1c]">
          <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
          <p className="text-[10px] text-gray-500 truncate">{admin?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-[#2a2a2a] text-[9px] font-black tracking-widest text-gray-300 uppercase">
            ADMIN
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition rounded-sm ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-[#1c1c1c]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="px-4 py-4 border-t border-[#1c1c1c] space-y-2">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-[11px] text-gray-500 hover:text-white transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Storefront
          </a>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-red-500 hover:text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
};
