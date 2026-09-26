import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Train as TrainIcon, Clock, ArrowRight, MapPin } from 'lucide-react';
import { Train } from '../types';
import { apiClient } from '../api/client';

export const TrainSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [trains, setTrains] = useState<Train[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient<Train[]>('/trains/all')
      .then((data) => {
        setTrains(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load trains');
        setLoading(false);
      });
  }, []);

  const filteredTrains = trains.filter(
    (t) =>
      t.train_number.toLowerCase().includes(query.toLowerCase()) ||
      t.train_name.toLowerCase().includes(query.toLowerCase()) ||
      t.source.toLowerCase().includes(query.toLowerCase()) ||
      t.destination.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            All Express & Suburban Schedules
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Search Trains & Timetables
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <TrainIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Input */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by train number, name or station (e.g. 12124, Deccan Queen, Nerul, MMCT)"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1B254B]"
          />
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading trains directory...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-semibold px-1">
            Showing {filteredTrains.length} trains
          </div>

          {filteredTrains.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/trains/${t.train_number}`)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-blue-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group active:scale-99"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                    #{t.train_number}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#1B254B] group-hover:text-blue-600 transition-colors">
                    {t.train_name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {t.train_type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>
                    Dep: <strong className="text-slate-800">{t.departure_time}</strong> ({t.source})
                  </span>
                  <span>→</span>
                  <span>
                    Arr: <strong className="text-slate-800">{t.arrival_time}</strong> ({t.destination})
                  </span>
                  <span>•</span>
                  <span>{t.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-bold text-blue-600">
                <span>View Route</span>
                <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
