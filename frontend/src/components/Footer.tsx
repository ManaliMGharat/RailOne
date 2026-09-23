import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ShieldCheck, Headphones, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rail-600 flex items-center justify-center text-white shadow-md">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rail<span className="text-rail-400">One</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier digital railway reservation and passenger assistance network. Fast, reliable, and secure train ticket booking across all railway zones.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Quick Booking */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Passenger Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="hover:text-rail-400 transition-colors">Book Train Tickets</Link>
              </li>
              <li>
                <Link to="/pnr" className="hover:text-rail-400 transition-colors">Check PNR Status</Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-rail-400 transition-colors">My Bookings & History</Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-rail-400 transition-colors">Cancel Ticket & Refund</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-rail-400 transition-colors">Station Amenities</Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & Policies */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Policies & Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-rail-400 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-rail-400 transition-colors">Tatkal & General Quota Rules</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-rail-400 transition-colors">Cancellation & Refund Rules</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-rail-400 transition-colors">Luggage Allowance Guidelines</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-rail-400 transition-colors">Grievance Redressal</Link>
              </li>
            </ul>
          </div>

          {/* Support Helpline */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">24x7 Support</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center space-x-2 text-rail-400 font-semibold mb-1">
                  <Headphones className="w-4 h-4" />
                  <span>National Railway Helpline</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-wider">139</div>
                <div className="text-xs text-slate-400 mt-1">Toll-free 24x7 Interactive Voice & SMS</div>
              </div>
              <p className="text-xs text-slate-400">
                Email inquiries: <span className="text-slate-200">support@railone.local</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 RailOne Passenger Services. Built for development and simulation.</p>
          <div className="flex space-x-6 mt-3 sm:mt-0">
            <Link to="/help" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/help" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/help" className="hover:text-slate-400">Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
