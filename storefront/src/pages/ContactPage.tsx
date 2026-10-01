import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../api/client';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetchApi('/content/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, message })
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rage-950 text-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-rage-400">
            Direct Communication
          </span>
          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl font-black uppercase tracking-widest text-white">
            Contact Us
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            For sizing consultations, custom orders, or collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Information & Hours */}
          <div className="lg:col-span-5 space-y-8 bg-rage-900/50 border border-rage-800 p-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
                Direct Channels
              </h3>
              <div className="space-y-6 text-xs text-gray-300">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-white flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white uppercase">Client Concierge</p>
                    <p className="text-gray-400 mt-0.5">concierge@genrage.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-white flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white uppercase">Phone & WhatsApp</p>
                    <p className="text-gray-400 mt-0.5">+91 98765 43210 (Mon-Sat 10am - 7pm IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-white flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white uppercase">Design Atelier</p>
                    <p className="text-gray-400 mt-0.5">Plot 18, Industrial Estate, Lower Parel, Mumbai, Maharashtra 400013</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-rage-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rage-400 mb-2">
                Express Response Guarantee
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our support team guarantees an initial response within 6 business hours.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-rage-900/50 border border-rage-800 p-8">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                <h3 className="text-lg font-black uppercase tracking-widest text-white">
                  Transmission Received
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Thank you for reaching out. A GENRAGE atelier representative will contact you shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setMessage(''); }}
                  className="mt-4 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">
                  Send Transmission
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs focus:outline-none focus:border-white uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-rage-950 border border-rage-800 text-white px-3 py-2.5 text-xs focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details regarding your inquiry..."
                    className="w-full bg-rage-950 border border-rage-800 text-white p-3 text-xs focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Sending...' : 'Transmit Message'}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
