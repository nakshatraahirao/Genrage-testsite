import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../api/client';

export const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const data = await fetchApi<{ order: any }>(`/orders/track/${encodeURIComponent(orderNumber.trim())}`);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'No tracking information found for this order number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
            Logistics & Delivery
          </span>
          <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black uppercase tracking-widest text-white mt-1">
            Track Your Parcel
          </h1>
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto uppercase tracking-wider">
            Enter your GENRAGE order number (e.g. GR-889021) to check live status.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSearch} className="flex max-w-md mx-auto">
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="GR-XXXXXX"
            className="w-full bg-rage-900 border border-rage-700 text-white px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-white font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-950/80 border border-rage-red text-red-300 text-xs font-medium max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Tracking Details Card */}
        {order && (
          <div className="bg-rage-900 border border-rage-700 p-6 sm:p-8 text-left space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-rage-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-white">Order #{order.orderNumber}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Airway Bill: {order.trackingNumber || 'Processing'}</p>
              </div>
              <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest">
                {order.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-green-400">
              <Truck className="w-5 h-5" />
              <span>Dispatched via Express Air Delivery</span>
            </div>

            <div className="divide-y divide-rage-800 border-t border-rage-800 pt-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="py-2.5 flex justify-between text-xs">
                  <span className="text-white uppercase font-bold">{item.productName} ({item.size})</span>
                  <span className="text-gray-400 font-mono">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
