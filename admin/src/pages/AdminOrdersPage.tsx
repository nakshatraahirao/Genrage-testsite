import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { adminFetch } from '../api/client';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; slug: string };
  variant: { size: string; color: string };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string | null;
  shippingAddress: any;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

const STATUSES = ['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await adminFetch<{ orders: Order[] }>('/admin/orders');
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-400 bg-green-950/40 border-green-800';
      case 'SHIPPED':
        return 'text-blue-400 bg-blue-950/40 border-blue-800';
      case 'PROCESSING':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-800';
      case 'CANCELLED':
        return 'text-red-400 bg-red-950/40 border-red-800';
      default:
        return 'text-gray-300 bg-[#1c1c1c] border-[#2a2a2a]';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="border-b border-[#1c1c1c] pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manage</p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mt-1">Orders</h1>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition ${
                statusFilter === s
                  ? 'bg-white text-black border-white'
                  : 'bg-[#111111] text-gray-400 border-[#2a2a2a] hover:border-gray-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order or customer..."
            className="w-full bg-[#111111] border border-[#2a2a2a] text-white pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-xs text-gray-500 animate-pulse">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#111111] border border-[#1c1c1c] p-12 text-center text-gray-500 text-xs">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-[#111111] border border-[#1c1c1c] p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#1c1c1c] pb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-white">#{order.orderNumber}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Customer: <span className="text-white font-bold">{order.user?.name}</span> ({order.user?.email}) •{' '}
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  
                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="bg-[#1c1c1c] border border-[#3a3a3a] text-white text-xs px-2.5 py-1.5 focus:outline-none font-bold uppercase cursor-pointer"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Purchased Items</p>
                  <div className="space-y-1">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-300">
                        <span>
                          {item.product?.name} ({item.variant?.size}/{item.variant?.color}) × {item.quantity}
                        </span>
                        <span className="font-mono">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Shipping & Payment</p>
                  <p className="text-gray-400">
                    Method: <span className="text-white uppercase">{order.paymentMethod}</span> ({order.paymentStatus})
                  </p>
                  {order.shippingAddress && (
                    <p className="text-gray-400 truncate">
                      Address: {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
