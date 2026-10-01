import React, { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Clock
} from 'lucide-react';
import { adminFetch } from '../api/client';

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: any[];
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [lowStockVariants, setLowStockVariants] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<{ metrics: Metrics; lowStockVariants: any[]; recentOrders: RecentOrder[]; recentUsers: RecentUser[] }>('/admin/metrics')
      .then(data => {
        setMetrics(data.metrics);
        setLowStockVariants(data.lowStockVariants);
        setRecentOrders(data.recentOrders);
        setRecentUsers(data.recentUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-400 bg-green-950/50 border-green-800';
      case 'SHIPPED': return 'text-blue-400 bg-blue-950/50 border-blue-800';
      case 'PROCESSING': return 'text-yellow-400 bg-yellow-950/50 border-yellow-800';
      case 'CANCELLED': return 'text-red-400 bg-red-950/50 border-red-800';
      default: return 'text-gray-400 bg-[#1c1c1c] border-[#2a2a2a]';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Revenue', value: `₹${metrics?.totalRevenue?.toLocaleString('en-IN') ?? 0}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Total Orders', value: metrics?.totalOrders ?? 0, icon: Package, color: 'text-blue-400' },
    { label: 'Customers', value: metrics?.totalCustomers ?? 0, icon: Users, color: 'text-purple-400' },
    { label: 'Products', value: metrics?.totalProducts ?? 0, icon: ShoppingBag, color: 'text-orange-400' },
    { label: 'Pending Orders', value: metrics?.pendingOrders ?? 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Low Stock Items', value: metrics?.lowStockCount ?? 0, icon: AlertTriangle, color: 'text-red-400' },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Overview</p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mt-1">Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#111111] border border-[#1c1c1c] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-[#111111] border border-[#1c1c1c] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Recent Orders</h2>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No orders placed yet.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between text-xs py-2 border-b border-[#1c1c1c]/50">
                  <div>
                    <p className="font-bold text-white font-mono">#{order.orderNumber}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{order.user?.name} • {order.items?.length} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[#111111] border border-[#1c1c1c] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Low Stock Alerts</h2>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockVariants.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">All variants are well stocked.</p>
            ) : (
              lowStockVariants.map((v: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-[#1c1c1c]/50">
                  <div>
                    <p className="font-bold text-white text-[11px] truncate max-w-[160px]">{v.product?.name}</p>
                    <p className="text-gray-500 text-[10px]">{v.size} / {v.color}</p>
                  </div>
                  <span className={`font-black text-sm ${v.stockQuantity === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {v.stockQuantity === 0 ? 'OUT' : v.stockQuantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Customers */}
      <div className="bg-[#111111] border border-[#1c1c1c] p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white border-b border-[#1c1c1c] pb-3">
          New Customers
        </h2>
        <div className="divide-y divide-[#1c1c1c]">
          {recentUsers.map(user => (
            <div key={user.id} className="flex justify-between items-center py-3 text-xs">
              <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-gray-500 text-[10px]">{user.email}</p>
              </div>
              <p className="text-gray-500 text-[10px]">
                {new Date(user.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
