import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Train, Search, Ticket, Activity, RotateCcw, CreditCard, 
  ShieldCheck, Clock, Zap, MapPin, ChevronRight, Award, Compass 
} from 'lucide-react';
import { SearchBox } from '../components/SearchBox';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [quickPnr, setQuickPnr] = useState('');

  const quickServices = [
    { title: 'PNR Status', desc: 'Realtime confirmation check', icon: Ticket, link: '/pnr', color: 'from-blue-500 to-rail-600' },
    { title: 'Train Schedule', desc: 'Full station halt list', icon: Clock, link: '/search', color: 'from-emerald-500 to-teal-600' },
    { title: 'Live Train Status', desc: 'Upcoming arrival tracking', icon: Activity, link: '/search', color: 'from-amber-500 to-orange-600' },
    { title: 'My Bookings', desc: 'View confirmed journeys', icon: Train, link: '/bookings', color: 'from-purple-500 to-indigo-600' },
    { title: 'Cancel Ticket', desc: 'Instant refund processing', icon: RotateCcw, link: '/bookings', color: 'from-rose-500 to-red-600' },
    { title: 'Refund Status', desc: 'Track returned charges', icon: CreditCard, link: '/bookings', color: 'from-cyan-500 to-blue-600' },
  ];

  const popularRoutes = [
    { from: 'Mumbai (BCT)', to: 'New Delhi (NDLS)', train: '12951 Mumbai Rajdhani', duration: '15h 32m', fare: '₹1,980' },
    { from: 'New Delhi (NDLS)', to: 'Varanasi (BSB)', train: '22436 Vande Bharat', duration: '08h 00m', fare: '₹1,750' },
    { from: 'New Delhi (NDLS)', to: 'Lucknow (LKO)', train: '12004 Shatabdi Express', duration: '06h 30m', fare: '₹1,165' },
    { from: 'Howrah (HWH)', to: 'New Delhi (NDLS)', train: '12301 Howrah Rajdhani', duration: '17h 15m', fare: '₹2,150' },
    { from: 'Mumbai (CSMT)', to: 'Pune (PUNE)', train: '12123 Deccan Queen', duration: '03h 15m', fare: '₹120' },
    { from: 'Bengaluru (SBC)', to: 'Delhi (NZM)', train: '22691 Bengaluru Rajdhani', duration: '33h 30m', fare: '₹2,420' },
  ];

  const handleQuickPnrSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPnr.trim()) {
      navigate(`/pnr?pnr=${encodeURIComponent(quickPnr.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-navy-950 via-slate-900 to-navy-900 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rail-500/20 border border-rail-400/30 text-rail-300 text-xs font-semibold backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-rail-400" />
            <span>Next-Generation Indian Railway Experience</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Your Journey Starts Here with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rail-400 to-blue-200">RailOne</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Effortless train reservations, live seat availability, lightning-fast PNR status, and instant refunds across all 24+ central routes.
          </p>
        </div>

        {/* Floating Search Container */}
        <div className="max-w-4xl mx-auto relative z-20">
          <SearchBox />
        </div>
      </section>

      {/* Quick Services Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.title}
                to={svc.link}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center hover:-translate-y-0.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white mb-2.5 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-rail-700 transition-colors">
                  {svc.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                  {svc.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick PNR Lookup Card Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rail-900 via-rail-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-rail-300">Fast Passenger Service</span>
            <h3 className="text-xl sm:text-2xl font-black">Check Your 10-Digit PNR Status</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Get current seat, coach, berth allocation, and chart preparation status in seconds.
            </p>
          </div>
          <form onSubmit={handleQuickPnrSearch} className="flex w-full md:w-auto items-center space-x-2">
            <input
              type="text"
              value={quickPnr}
              onChange={(e) => setQuickPnr(e.target.value)}
              placeholder="Enter 10-digit PNR"
              maxLength={10}
              className="px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:ring-2 focus:ring-rail-400 focus:outline-none w-full md:w-56"
              required
            />
            <button
              type="submit"
              className="px-5 py-3 bg-rail-500 hover:bg-rail-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              Get Status
            </button>
          </form>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Train Corridors</h2>
            <p className="text-xs text-slate-500 mt-0.5">High-speed Rajdhani, Shatabdi & Vande Bharat routes</p>
          </div>
          <Link to="/search" className="text-xs font-bold text-rail-600 hover:text-rail-800 flex items-center">
            <span>Explore all trains</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-rail-700">{route.train}</span>
                  <span className="flex items-center font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {route.duration}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-3">
                  <span>{route.from}</span>
                  <span className="text-slate-300">→</span>
                  <span>{route.to}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fares from</span>
                  <span className="text-base font-black text-slate-900">{route.fare}</span>
                </div>
                <Link
                  to="/search"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rail-50 text-slate-700 hover:text-rail-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Book Seat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-rail-50 text-rail-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Official Fare Accuracy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized distance-based fare matrices with transparent GST and reservation charges. Zero hidden fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Instant Seat Allocation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Realtime coach and berth allocation ensuring passenger preferences (Lower, Upper, Window) are respected.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Automated Refunds</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent cancellation deductions based on departure windows with instant mock refund credentials.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
