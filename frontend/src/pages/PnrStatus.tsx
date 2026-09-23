import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Ticket, Search, CheckCircle2, Clock, AlertCircle, ArrowRight, 
  MapPin, ShieldCheck, Printer, RefreshCw 
} from 'lucide-react';
import api from '../services/api';
import { PnrStatus } from '../types';

export const PnrStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPnr = searchParams.get('pnr') || '';

  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [pnrData, setPnrData] = useState<PnrStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPnr) {
      lookupPnr(initialPnr);
    }
  }, [initialPnr]);

  const lookupPnr = async (numberToQuery: string) => {
    const clean = numberToQuery.replace(/-/g, '').trim();
    if (!clean || clean.length < 10) {
      setError('Please enter a valid 10-digit PNR number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/pnr/${clean}`);
      setPnrData(res.data);
      setSearchParams({ pnr: clean });
    } catch (err: any) {
      setPnrData(null);
      setError(err.response?.data?.detail || 'PNR record not found. Please verify the 10-digit number.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupPnr(pnrInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-4 no-print">
        <div className="w-12 h-12 rounded-xl bg-rail-50 text-rail-600 flex items-center justify-center mx-auto">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Check PNR Status</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Track current confirmation, coach allotment, seat and berth allocation for your RailOne journey.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit PNR Number"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-rail-500 tracking-widest text-center"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-rail-600 hover:bg-rail-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 h-[46px]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Check</span>
          </button>
        </form>

        {/* Demo PNR Quick Link */}
        <div className="text-[11px] text-slate-400">
          Try demo PNR: <button type="button" onClick={() => { setPnrInput('2104598124'); lookupPnr('2104598124'); }} className="text-rail-600 font-bold hover:underline">2104598124</button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PNR Details Card */}
      {pnrData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PNR NUMBER</span>
              <div className="text-2xl font-black font-mono tracking-widest text-rail-700">
                {pnrData.pnr_number}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                {pnrData.booking_status}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                {pnrData.chart_status}
              </span>
            </div>
          </div>

          {/* Train & Journey Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-rail-600 text-white font-mono text-xs font-bold rounded">
                  #{pnrData.train_number}
                </span>
                <span className="font-bold text-sm text-slate-900">{pnrData.train_name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date: <span className="font-semibold text-slate-800">{new Date(pnrData.journey_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span> • Class: <span className="font-semibold text-slate-800">{pnrData.class_code} ({pnrData.class_name})</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-medium text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">From</span>
                <span className="font-bold text-slate-900">{pnrData.from_station_name} ({pnrData.from_station_code})</span>
                <span className="text-slate-500 block">{pnrData.departure_time}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div>
                <span className="text-slate-400 block text-[10px]">To</span>
                <span className="font-bold text-slate-900">{pnrData.to_station_name} ({pnrData.to_station_code})</span>
                <span className="text-slate-500 block">{pnrData.arrival_time}</span>
              </div>
            </div>
          </div>

          {/* Passenger Status Table */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">Passenger & Berth Details</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">#</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Passenger</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Booking Status</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Current Status</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Coach</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Seat / Berth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pnrData.passengers.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {p.passenger_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.age} yrs • {p.gender}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {p.booking_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {p.current_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-slate-800">
                        {p.coach_number || '--'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {p.seat_number ? `${p.seat_number} (${p.berth_type || 'BERTH'})` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center no-print">
            <span className="text-xs text-slate-400">
              Booking Ref: <span className="font-mono text-slate-700 font-bold">{pnrData.booking_reference}</span>
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Status</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
