import React, { useState, useEffect } from 'react';
import { Search, Train, AlertCircle, Info } from 'lucide-react';
import { CoachPositionResponse, CoachItem } from '../types';
import { apiClient } from '../api/client';

export const CoachPositionPage: React.FC = () => {
  const [trainInput, setTrainInput] = useState<string>('12124');
  const [coachData, setCoachData] = useState<CoachPositionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachPosition = (tNum: string) => {
    setLoading(true);
    setError(null);

    apiClient<CoachPositionResponse>(`/coaches/${tNum.trim()}`)
      .then((data) => {
        setCoachData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve coach position.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoachPosition('12124');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainInput.trim()) return;
    fetchCoachPosition(trainInput.trim());
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Engine':
        return 'bg-slate-900 text-white border-slate-700';
      case 'AC':
        return 'bg-blue-600 text-white border-blue-500';
      case 'Sleeper':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'General':
        return 'bg-amber-600 text-white border-amber-500';
      case 'Pantry':
        return 'bg-rose-600 text-white border-rose-500';
      default:
        return 'bg-slate-600 text-white border-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Platform Rake Composition
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Coach Position & Rake Layout
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Train className="w-5 h-5" />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trainInput}
            onChange={(e) => setTrainInput(e.target.value)}
            placeholder="Enter Train Number (e.g. 12124, 12951, 12123)"
            className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#1B254B] focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3.5 px-8 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Show Formation</span>
          </button>
        </form>

        <div className="flex gap-2 pt-3 text-xs text-slate-400">
          <span>Quick Rakes:</span>
          {['12124', '12951', '12009', '11019'].map((tn) => (
            <button
              key={tn}
              type="button"
              onClick={() => {
                setTrainInput(tn);
                fetchCoachPosition(tn);
              }}
              className="text-emerald-700 font-bold hover:underline"
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

      {coachData && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400">Train Formation:</span>
              <h2 className="text-lg font-black text-[#1B254B]">
                {coachData.train_name} (#{coachData.train_number})
              </h2>
            </div>
            <div className="inline-block px-3 py-1.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs self-start sm:self-auto">
              Arrival Platform: #{coachData.platform_number}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white">
              <span className="w-2 h-2 rounded-full bg-white"></span> Locomotive
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white">
              <span className="w-2 h-2 rounded-full bg-blue-200"></span> AC Coaches
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-200"></span> Sleeper Class
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 text-white">
              <span className="w-2 h-2 rounded-full bg-amber-200"></span> General Unreserved
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white">
              <span className="w-2 h-2 rounded-full bg-rose-200"></span> Pantry / Dining Car
            </span>
          </div>

          {/* Horizontal Coach Formation Scroll Container */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 overflow-x-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between min-w-[700px]">
              <span>◄ ENGINE DIRECTION (FRONT)</span>
              <span>PLATFORM 1</span>
              <span>GUARD / REAR ►</span>
            </div>

            <div className="flex items-center gap-2 pb-2 min-w-[700px]">
              {coachData.coaches.map((c) => (
                <div
                  key={c.position}
                  className={`w-20 sm:w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center shadow-xs border transition-transform hover:-translate-y-1 ${getCategoryColor(
                    c.category
                  )}`}
                >
                  <span className="text-[10px] opacity-75 font-mono">#{c.position}</span>
                  <span className="text-base font-black tracking-tight my-0.5">{c.code}</span>
                  <span className="text-[9px] font-medium leading-none opacity-90 truncate max-w-full">
                    {c.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coach List Detailed Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {coachData.coaches.map((c) => (
              <div
                key={c.position}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{c.code}</span>
                  <span className="text-slate-400 block text-[10px]">{c.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Pos #{c.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
