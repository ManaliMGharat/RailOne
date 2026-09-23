import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Train, Printer, ArrowLeft, ShieldCheck, CheckCircle2, 
  MapPin, Calendar, QrCode, AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import { PnrStatus } from '../types';

export const TicketView: React.FC = () => {
  const { pnr } = useParams<{ pnr: string }>();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

  const [ticketData, setTicketData] = useState<PnrStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pnr) {
      fetchTicket();
    }
  }, [pnr]);

  useEffect(() => {
    if (ticketData && shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [ticketData, shouldPrint]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pnr/${pnr}`);
      setTicketData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-rail-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Generating digital e-ticket...</p>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-bold text-base">Ticket Unavailable</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
        <Link to="/bookings" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Nav Action Strip (Hidden on Print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/bookings"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-rail-600 hover:bg-rail-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Official Railway Electronic Reservation Slip (ERS) */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md print:shadow-none print:border-black print:p-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Rail<span className="text-rail-700">One</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block -mt-1">
                Electronic Reservation Slip (ERS)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">PNR NUMBER</span>
            <span className="text-xl font-black font-mono tracking-widest text-slate-900">
              {ticketData.pnr_number}
            </span>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end mt-0.5">
              <ShieldCheck className="w-3 h-3 mr-0.5" />
              <span>CONFIRMED E-TICKET</span>
            </div>
          </div>
        </div>

        {/* Journey Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Train Number & Name</span>
            <span className="font-bold text-slate-900">#{ticketData.train_number}</span>
            <span className="block text-slate-600 truncate">{ticketData.train_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Journey Date</span>
            <span className="font-bold text-slate-900">
              {new Date(ticketData.journey_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="block text-slate-500 font-mono text-[11px]">{ticketData.journey_date}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Travel Class</span>
            <span className="font-bold text-slate-900">{ticketData.class_code}</span>
            <span className="block text-slate-500 text-[11px]">{ticketData.class_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Booking Reference</span>
            <span className="font-bold font-mono text-slate-900">{ticketData.booking_reference}</span>
            <span className="block text-slate-500 text-[10px]">Quota: GENERAL</span>
          </div>
        </div>

        {/* Origin & Destination Bar */}
        <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 text-xs">
          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Boarding Station</span>
            <div className="text-base font-black text-slate-900">{ticketData.from_station_name}</div>
            <div className="text-slate-500 font-semibold">{ticketData.from_station_code} • Dep: {ticketData.departure_time}</div>
          </div>
          <div className="pl-2">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Destination Station</span>
            <div className="text-base font-black text-slate-900">{ticketData.to_station_name}</div>
            <div className="text-slate-500 font-semibold">{ticketData.to_station_code} • Arr: {ticketData.arrival_time}</div>
          </div>
        </div>

        {/* Passenger Information Table */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
            Passenger Details & Seat Allocation
          </h4>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-300 text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">#</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Passenger Name</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Age / Gender</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Coach</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Berth</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Type</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {ticketData.passengers.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{p.passenger_name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{p.age} / {p.gender}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{p.coach_number || '--'}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{p.seat_number || '--'}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-semibold">{p.berth_type || '--'}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {p.current_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Verification Box & Instructions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="font-bold text-slate-800 uppercase text-[10px]">Important Passenger Instructions</div>
            <p>1. Valid original Photo Identity Proof is mandatory during journey.</p>
            <p>2. Please arrive at the station at least 20 minutes prior to scheduled departure.</p>
            <p>3. In case of cancellation, refunds are credited automatically as per RailOne rules.</p>
          </div>

          <div className="p-3 bg-white border border-slate-300 rounded-xl text-center shadow-sm flex-shrink-0">
            <div className="w-24 h-24 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center font-mono text-[9px] p-2 leading-tight">
              <QrCode className="w-12 h-12 text-white mb-1" />
              <span>{ticketData.pnr_number}</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1 font-bold">DIGITAL VERIFIED</span>
          </div>
        </div>

        {/* Slip Footer */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
          <span>RailOne Passenger Services Platform</span>
          <span>Helpline: 139 (24x7) • support@railone.local</span>
        </div>
      </div>
    </div>
  );
};
