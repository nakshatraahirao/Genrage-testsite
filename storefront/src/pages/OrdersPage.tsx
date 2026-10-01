import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { fetchApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<{ orders: Order[] }>('/orders');
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-rage-950 text-white flex flex-col items-center justify-center p-6">
        <Package className="w-16 h-16 text-rage-600 mb-4" />
        <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest">Sign In to View Orders</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm text-center">
          Access your order timeline, invoice breakdowns, and real-time courier tracking.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
        >
          Sign In / Demo Login
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-green-950/80 border border-green-700 text-green-400 text-[10px] font-bold uppercase tracking-wider">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 bg-blue-950/80 border border-blue-700 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 bg-yellow-950/80 border border-yellow-700 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Processing</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-950/80 border border-red-700 text-red-400 text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-rage-800 border border-rage-700 text-gray-300 text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-rage-800 pb-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
              Customer Portal
            </span>
            <h1 className="font-['Cinzel'] text-3xl font-black uppercase tracking-widest text-white mt-1">
              Order History ({orders.length})
            </h1>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest text-white hover:underline flex items-center gap-1 font-bold"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-rage-900/40 border border-rage-800 p-8">
            <Package className="w-12 h-12 text-rage-600 mx-auto mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">No Orders Placed Yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Your garments and tracking updates will show up here once you make your first purchase.
            </p>
            <Link
              to="/shop"
              className="inline-block mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest"
            >
              Explore Dropped Items
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const stages = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
              const currentStageIndex = stages.indexOf(order.status);

              return (
                <div key={order.id} className="bg-rage-900/60 border border-rage-800 p-6 sm:p-8 space-y-6">
                  
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rage-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">#{order.orderNumber}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Payment: {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-base font-black text-white">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Tracking Timeline Bar */}
                  {order.status !== 'CANCELLED' && (
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {stages.map((stage, idx) => {
                          const isDone = currentStageIndex >= idx;
                          const isCurrent = currentStageIndex === idx;
                          return (
                            <div key={stage} className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                                isDone
                                  ? 'bg-white text-black border-white'
                                  : 'bg-rage-950 text-gray-500 border-rage-700'
                              } ${isCurrent ? 'ring-2 ring-white/50' : ''}`}>
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider mt-2 font-bold ${
                                isDone ? 'text-white' : 'text-gray-500'
                              }`}>
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="relative mt-2 mx-8 hidden sm:block">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-rage-800 -translate-y-6" />
                      </div>
                      {order.trackingNumber && (
                        <p className="text-center text-[11px] text-rage-400 uppercase font-mono mt-3">
                          Airway Bill: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="divide-y divide-rage-800/60 pt-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-12 h-14 object-cover bg-rage-950 border border-rage-800"
                            />
                          )}
                          <div>
                            <p className="text-xs font-bold uppercase text-white">{item.productName}</p>
                            <p className="text-[10px] text-gray-400 uppercase">
                              {item.size ? `Size: ${item.size}` : ''} {item.color ? `• ${item.color}` : ''} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-200">
                          ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
