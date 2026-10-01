import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, MapPin, Bell, Package, LogOut, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { fetchApi } from '../api/client';
import { Address } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout, refreshUser, openAuthModal } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await fetchApi<{ addresses: Address[] }>('/auth/addresses');
      setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-rage-950 text-white flex flex-col items-center justify-center p-6">
        <User className="w-16 h-16 text-rage-600 mb-4" />
        <h2 className="font-['Cinzel'] text-2xl font-black uppercase tracking-widest">Sign In Required</h2>
        <p className="text-xs text-gray-400 mt-2">Sign in or use 1-click Demo Login to manage your account details.</p>
        <button
          onClick={openAuthModal}
          className="mt-6 px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone })
      });
      await refreshUser();
      setProfileMessage('Profile details updated.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newName || user.name,
          phone: newPhone || user.phone,
          street: newStreet,
          city: newCity,
          state: newState,
          postalCode: newPostal,
          isDefault: addresses.length === 0
        })
      });
      setShowAddAddress(false);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPostal('');
      loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetchApi(`/auth/addresses/${id}`, { method: 'DELETE' });
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-rage-800 pb-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rage-400">
              Account Control
            </span>
            <h1 className="font-['Cinzel'] text-3xl font-black uppercase tracking-widest text-white mt-1">
              {user.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1">{user.email} • Role: {user.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rage-red hover:underline"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-rage-800 mb-8 space-x-8">
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: MapPin },
            { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`pb-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition ${
                  isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-rage-900/50 border border-rage-800 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Personal Information
            </h2>

            {profileMessage && (
              <div className="p-3 bg-green-950/80 border border-green-700 text-green-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-rage-950/50 border border-rage-800 text-gray-500 px-3 py-2.5 text-xs tracking-wider cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs tracking-wider focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Delivery Book
              </h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-4 py-2 bg-rage-900 border border-rage-700 text-xs font-bold uppercase tracking-wider hover:border-white transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> {showAddAddress ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {/* Add Address Form Modal / Box */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="bg-rage-900/60 border border-rage-700 p-6 space-y-4 max-w-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">New Shipping Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Receiver Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Contact Phone"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Street, Building, Flat"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                    className="bg-rage-950 border border-rage-800 text-white px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-rage-900/40 border border-rage-800 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase text-white">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-widest bg-white text-black font-bold px-2 py-0.5">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{addr.street}</p>
                    <p className="text-xs text-gray-400">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rage-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-gray-500 hover:text-rage-red transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl bg-rage-900/40 border border-rage-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-rage-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                All Alerts & Tracking Updates
              </h2>
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-gray-400 hover:text-white underline uppercase font-bold"
              >
                Mark all read
              </button>
            </div>

            <div className="divide-y divide-rage-800">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">No notifications in your inbox.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`py-4 cursor-pointer transition ${n.isRead ? 'opacity-60' : 'opacity-100 font-semibold'}`}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-white">{n.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 font-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
