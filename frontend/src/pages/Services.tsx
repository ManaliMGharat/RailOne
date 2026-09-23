import React from 'react';
import { 
  Utensils, Coffee, Bed, Accessibility, ShieldCheck, 
  MapPin, Clock, Train, PhoneCall, ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Services: React.FC = () => {
  const serviceCards = [
    {
      title: 'E-Catering Seat Delivery',
      desc: 'Order hot, hygienic meals from FSSAI-certified restaurants directly to your berth at upcoming stations.',
      icon: Utensils,
      badge: 'Available 24x7',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Station Executive Lounges',
      desc: 'Relax in air-conditioned comfort with complimentary high-speed Wi-Fi, refreshments, and business centers.',
      icon: Coffee,
      badge: 'Over 40 Terminals',
      color: 'from-blue-500 to-rail-600',
    },
    {
      title: 'Retiring Rooms & Dormitories',
      desc: 'Book secure hourly or overnight station accommodations directly attached to major railway platforms.',
      icon: Bed,
      badge: 'Online Booking',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Divyangjan & Accessibility Assist',
      desc: 'Free dedicated wheelchair assistance and battery-operated car transport for senior citizens and disabled passengers.',
      icon: Accessibility,
      badge: 'Priority Support',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-rail-600 uppercase tracking-widest bg-rail-50 px-3 py-1 rounded-full">
          Passenger Amenities
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Comprehensive Railway Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need for a comfortable, safe, and punctual journey across the RailOne national network.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceCards.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full">
                    {svc.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{svc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">{svc.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Integrated with RailOne App</span>
                <Link
                  to="/help"
                  className="text-xs font-bold text-rail-600 hover:text-rail-800 flex items-center space-x-1"
                >
                  <span>Learn more</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Assistance Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-rail-950 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-rail-400 text-xs font-bold">
            <PhoneCall className="w-4 h-4" />
            <span>24x7 PASSENGER ASSISTANCE</span>
          </div>
          <h2 className="text-2xl font-black">Need In-Journey Support or Medical Aid?</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Dial toll-free <strong className="text-white">139</strong> from any mobile or landline across India for immediate medical assistance, on-board housekeeping, or security alerts.
          </p>
        </div>

        <div className="text-center bg-slate-800/80 px-6 py-4 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Toll Free</span>
          <span className="text-3xl font-black text-white tracking-widest">139</span>
          <span className="text-[11px] text-rail-400 block font-semibold mt-0.5">RailOne Helpline</span>
        </div>
      </div>
    </div>
  );
};
