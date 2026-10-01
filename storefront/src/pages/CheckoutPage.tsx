import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, QrCode, Building, Banknote, CheckCircle, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api/client';
import { Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, summary, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Address inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment placeholder method
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('rager@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');

  // Submission & Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      // Load saved addresses
      fetchApi<{ addresses: Address[] }>('/auth/addresses')
        .then((res) => {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch(console.error);
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-rage-950 text-white flex flex-col items-center justify-center p-6">
        <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest">Your Cart Is Empty</h2>
        <p className="text-xs text-gray-400 mt-2">Add pieces from the collection before proceeding to checkout.</p>
        <Link to="/shop" className="mt-6 px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest">
          Return to Store
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      openAuthModal();
      return;
    }

    let shippingData: any = null;
    if (isAddingNewAddress || !selectedAddressId) {
      if (!fullName || !phone || !street || !city || !stateName || !postalCode) {
        setError('Please fill in all shipping address fields.');
        return;
      }
      shippingData = {
        fullName,
        phone,
        street,
        city,
        state: stateName,
        postalCode,
        country: 'India'
      };
    }

    try {
      setLoading(true);
      const res = await fetchApi<{ message: string; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId: isAddingNewAddress ? undefined : selectedAddressId,
          shippingAddress: shippingData,
          paymentMethod
        })
      });

      setConfirmedOrder(res.order);
      await clearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Order Confirmation Modal / Overlay */}
        {confirmedOrder && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-rage-900 border border-rage-700 p-8 text-center text-white shadow-2xl">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">Order Confirmed</span>
              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-black uppercase tracking-widest mt-1">
                Welcome to the Legion
              </h2>
              <p className="text-xs text-gray-300 mt-2">
                Thank you for your order. We have received your payment via {confirmedOrder.paymentMethod}.
              </p>

              <div className="bg-rage-950 border border-rage-800 p-4 my-6 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase">Order ID:</span>
                  <span className="font-black text-white">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase">Tracking Number:</span>
                  <span className="font-mono text-rage-300">{confirmedOrder.trackingNumber || 'Pending Courier Scan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase">Total Amount:</span>
                  <span className="font-black text-white">₹{confirmedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase">Estimated Delivery:</span>
                  <span className="text-green-400 font-semibold">Under 48 Hours Express</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3.5 border border-white text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Header */}
        <div className="border-b border-rage-800 pb-6 mb-8 flex items-center justify-between">
          <div>
            <Link to="/shop" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Shop
            </Link>
            <h1 className="font-['Cinzel'] text-3xl font-black uppercase tracking-widest text-white">
              Secure Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/80 border border-rage-red text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Columns: Customer Info, Shipping Address, Payment Method */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Customer Details */}
            <div className="bg-rage-900/60 border border-rage-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  1. Contact Information
                </h2>
                {!user && (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="text-[11px] text-white underline uppercase font-bold"
                  >
                    Log In for faster checkout
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-rage-900/60 border border-rage-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  2. Delivery Address
                </h2>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-[10px] uppercase font-bold text-gray-400 hover:text-white underline"
                  >
                    {isAddingNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {!isAddingNewAddress && savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-white bg-rage-800/80'
                          : 'border-rage-800 bg-rage-950 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="accent-white"
                        />
                        <div className="text-xs">
                          <p className="font-bold uppercase text-white">{addr.fullName} ({addr.phone})</p>
                          <p className="text-gray-400 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                /* New Address Inputs */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Street Address & Apt / Flat
                    </label>
                    <input
                      type="text"
                      required={isAddingNewAddress}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 402 Gothic Tower, Bandra West"
                      className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required={isAddingNewAddress}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required={isAddingNewAddress}
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        required={isAddingNewAddress}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="400050"
                        className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Method Placeholder Selector */}
            <div className="bg-rage-900/60 border border-rage-800 p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                3. Payment Selection (Base Holder)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'Netbanking', icon: Building },
                  { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-4 border text-center flex flex-col items-center gap-2 transition ${
                        isSelected
                          ? 'border-white bg-white text-black'
                          : 'border-rage-800 bg-rage-950 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Base Holder Fields */}
              <div className="p-4 bg-rage-950 border border-rage-800 text-xs space-y-3">
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      UPI VPA / Handle
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-rage-900 border border-rage-800 text-white px-3 py-2 text-xs font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      ✓ Mock payment simulation enabled. Order will confirm immediately without OTP.
                    </p>
                  </div>
                )}
                {paymentMethod === 'CARD' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-rage-900 border border-rage-800 text-white px-3 py-2 text-xs font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      ✓ Simulated sandbox gateway. No live credit card charge.
                    </p>
                  </div>
                )}
                {paymentMethod === 'NETBANKING' && (
                  <p className="text-gray-400 text-xs">
                    Supports HDFC, ICICI, SBI, Axis, Kotak. Immediate simulated callback.
                  </p>
                )}
                {paymentMethod === 'COD' && (
                  <p className="text-gray-400 text-xs">
                    Pay via cash or UPI to the courier agent upon parcel delivery.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-rage-900/60 border border-rage-800 p-6 sticky top-28 space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-rage-800 pb-3">
                Order Review ({summary.itemCount} Items)
              </h2>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-rage-800/60 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-14 h-16 object-cover bg-rage-900 border border-rage-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase text-white truncate">{item.productName}</p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        Qty: {item.quantity} {item.size ? `• Size ${item.size}` : ''}
                      </p>
                      <p className="text-xs font-bold text-gray-300 mt-0.5">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculation */}
              <div className="border-t border-rage-800 pt-4 space-y-2 text-xs uppercase tracking-wider text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (Express)</span>
                  <span className="text-white font-bold">
                    {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (12% Apparel)</span>
                  <span className="text-white font-bold">Included</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-rage-800">
                  <span>Payable Total</span>
                  <span>₹{summary.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-50 shadow-xl"
              >
                {loading ? 'Processing Order...' : `Place Order • ₹${summary.total.toLocaleString('en-IN')}`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 text-center">
                <Truck className="w-3.5 h-3.5" /> Dispatched within 48 business hours
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
