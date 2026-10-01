import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, MapPin } from 'lucide-react';
import { adminFetch } from '../api/client';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
  }[];
  addresses: {
    city: string;
    state: string;
  }[];
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminFetch<{ customers: Customer[] }>('/admin/customers')
      .then(d => setCustomers(d.customers))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1c1c1c] pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manage</p>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mt-1">Customers</h1>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-[#111111] border border-[#2a2a2a] text-white pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500 animate-pulse">Loading customers...</p>
      ) : (
        <div className="bg-[#111111] border border-[#1c1c1c] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1c1c1c] bg-[#0d0d0d]">
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-gray-400">Contact</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-gray-400">Location</th>
                <th className="text-center px-4 py-3 font-black uppercase tracking-widest text-gray-400">Orders</th>
                <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-gray-400">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {filtered.map(c => {
                const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
                const location = c.addresses?.[0] ? `${c.addresses[0].city}, ${c.addresses[0].state}` : '—';
                return (
                  <tr key={c.id} className="hover:bg-[#1a1a1a] transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{c.name}</p>
                      <span className="text-[9px] text-gray-500 uppercase">Joined {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-500" /> {c.email}</p>
                      {c.phone && <p className="text-gray-500 text-[10px] mt-0.5">{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-600" /> {location}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-white">
                      {c.orders.length}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-white">
                      ₹{totalSpent.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
