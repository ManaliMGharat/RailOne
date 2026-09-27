import React, { useState, useEffect } from 'react';
import { Search, Compass, Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { TrainTrackingResponse } from '../types';
import { apiClient } from '../api/client';

export const TrackTrainPage: React.FC = () => {
  const [trainQuery, setTrainQuery] = useState<string>('12124');
  const [trackData, setTrackData] = useState<TrainTrackingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = (query: string) => {
    setLoading(true);
    setError(null);

    apiClient<TrainTrackingResponse>(`/tracking/${encodeURIComponent(query.trim())}`)
      .then((data) => {
        setTrackData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Tracking information unavailable');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTracking('12124');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainQuery.trim()) return;
    fetchTracking(trainQuery.trim());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Live GPS Satellite Tracking
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Track Your Train Live
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <Compass className="w-5 h-5" />
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trainQuery}
            onChange={(e) => setTrainQuery(e.target.value)}
            placeholder="Enter Train Number or Name (e.g. 12124, Deccan Queen, 12951)"
            className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#1B254B] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3.5 px-8 rounded-2xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Track Train</span>
          </button>
        </form>

        <div className="flex gap-2 pt-3 text-xs text-slate-400">
          <span>Live Demonstrations:</span>
          {['12124', '12951', '99701', '22223'].map((tn) => (
            <button
              key={tn}
              type="button"
              onClick={() => {
                setTrainQuery(tn);
                fetchTracking(tn);
              }}
              className="text-amber-700 font-bold hover:underline"
            >
              #{tn}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Triangulating train location...</p>
        </div>
      )}

      {trackData && !loading && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          {/* Status Highlight Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">
                  Current Location
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Demo Simulation
                </span>
              </div>
              <h2 className="text-xl font-extrabold flex items-center gap-2 mt-0.5">
                <MapPin className="w-5 h-5 text-amber-200" />
                {trackData.current_station}
              </h2>
              <p className="text-xs text-amber-100 mt-1">
                {trackData.train_name} (#{trackData.train_number})
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-xs">
                {trackData.current_status}
              </span>
              <p className="text-[10px] text-amber-100 mt-1">Updated {trackData.last_updated}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Notice:</strong> This live train route timeline uses timetable calculation simulation. Real-time satellite CRIS/IRCTC GPS telemetry is restricted to official Indian Railways control desks.
            </span>
          </div>

          {/* Timeline of Stations */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Route & Stoppage Progress
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackData.stations.map((st, idx) => {
                const isDeparted = st.status === 'Departed';
                const isCurrent = st.status === 'Current';
                return (
                  <div key={idx} className="relative flex items-center justify-between text-xs">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                        isCurrent
                          ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
                          : isDeparted
                          ? 'bg-blue-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      {isDeparted && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-[#1B254B]">
                        {st.station_name} ({st.station_code})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Arr: {st.actual_arrival} • Dep: {st.actual_departure}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isCurrent
                            ? 'bg-amber-100 text-amber-800'
                            : isDeparted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.status}
                      </span>
                      {st.delay_minutes > 0 && (
                        <div className="text-[10px] text-red-500 font-semibold mt-0.5">
                          +{st.delay_minutes}m delay
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
