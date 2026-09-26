import React, { useState } from 'react';
import { Search, Ticket, Train, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PNRResponse } from '../types';
import { apiClient } from '../api/client';

export const PNRStatusPage: React.FC = () => {
  const [pnrInput, setPnrInput] = useState<string>('8421095812');
  const [pnrData, setPnrData] = useState<PNRResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pnrInput.trim();
    if (!clean || clean.length !== 10 || !clean.match(/^\d+$/)) {
      setError('Please enter a valid 10-digit numeric PNR number.');
      return;
    }

    setLoading(true);
    setError(null);

    apiClient<PNRResponse>(`/pnr/${clean}`)
      .then((data) => {
        setPnrData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'PNR details not found');
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Railway Passenger Reservation Status
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            PNR Enquiry & Charting Status
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Ticket className="w-5 h-5" />
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Enter 10-Digit PNR Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 8421095812"
              className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-mono font-bold tracking-widest text-[#1B254B] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-8 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Get Status</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
            <span>Quick Test:</span>
            <button
              type="button"
              onClick={() => {
                setPnrInput('8421095812');
                setTimeout(() => handleSearch(), 50);
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              8421095812 (Seeded Demo PNR)
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Retrieving reservation charting status...</p>
        </div>
      )}

      {pnrData && !loading && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5 animate-in zoom-in-95">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">PNR:</span>
                <span className="text-lg font-black font-mono text-blue-700">{pnrData.pnr_number}</span>
                {pnrData.is_demo ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    DEMO SIMULATION
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    OFFICIAL RAILWAY CONFIRMED
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-[#1B254B] mt-1">
                {pnrData.train_name} (#{pnrData.train_number})
              </h2>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {pnrData.chart_status}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">Date: {pnrData.journey_date}</div>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Boarding Station:</span>
              <span className="font-bold text-[#1B254B]">{pnrData.source}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Destination:</span>
              <span className="font-bold text-[#1B254B]">{pnrData.destination}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Booked Class:</span>
              <span className="font-bold text-blue-700">{pnrData.class_type}</span>
            </div>
          </div>

          {/* Passenger Status Table */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Passenger Booking & Current Status
            </h3>
            <div className="space-y-2">
              {pnrData.passengers.map((p) => (
                <div
                  key={p.serial_no}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                      {p.serial_no}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.berth_type}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {p.current_status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Coach: {p.coach} • Berth: {p.berth}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pnrData.is_demo && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Demonstration status generated safely via RailOne mock abstraction. Clearly labelled as required by IRCTC guidelines.
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
