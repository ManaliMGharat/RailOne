import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Clock, Flame, Train, AlertCircle } from 'lucide-react';
import { Station } from '../types';
import { apiClient } from '../api/client';

interface StationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (station: Station) => void;
  title: string;
  excludeCode?: string; // For same-station validation
}

export const StationSearchModal: React.FC<StationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  excludeCode,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [popularStations, setPopularStations] = useState<Station[]>([]);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load popular and recent on initial open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);

      // Fetch popular and recent
      apiClient<Station[]>('/stations/popular')
        .then(setPopularStations)
        .catch(() => {});

      apiClient<Station[]>('/stations/recent')
        .then(setRecentStations)
        .catch(() => {});
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      apiClient<Station[]>(`/stations/search?q=${encodeURIComponent(query.trim())}`)
        .then((data) => {
          setResults(data);
          setSelectedIndex(0);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Error searching railway stations');
          setLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const listToUse = query.trim() ? results : popularStations;
    if (!listToUse.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % listToUse.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listToUse.length) % listToUse.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (listToUse[selectedIndex]) {
        handleSelectStation(listToUse[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectStation = (station: Station) => {
    // Immediate Frontend Same-Station Validation
    if (excludeCode && station.station_code.toUpperCase() === excludeCode.toUpperCase()) {
      setError(`Cannot select ${station.station_name} (${station.station_code}) for both origin and destination.`);
      return;
    }
    onSelect(station);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 border border-slate-100"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Train className="w-5 h-5 text-blue-200" />
              {title}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">Search 152+ railway stations across India</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search station code, name, or city (e.g. MMCT, Pune, Nerul)"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-[#1B254B] font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results / Suggestions Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Searching Indian Railway station database...</span>
            </div>
          )}

          {/* Search Results */}
          {!loading && query.trim() !== '' && results.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Matching Stations ({results.length})
              </div>
              <div className="space-y-1">
                {results.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(st)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                      idx === selectedIndex
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs'
                        : 'hover:bg-slate-50 text-[#1B254B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {st.station_code}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{st.station_name}</div>
                        <div className="text-xs text-slate-500">
                          {st.city}, {st.state} • Zone: {st.railway_zone}
                          {st.suburban_line && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[10px]">
                              {st.suburban_line} Line
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <MapPin className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && query.trim() !== '' && results.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-600">No railway stations found</div>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by city (e.g. Mumbai, Pune) or official station code (e.g. MMCT, CSMT, NEU)
              </p>
            </div>
          )}

          {/* Default Popular and Recent Stations when query is empty */}
          {!loading && !query.trim() && (
            <div className="space-y-4">
              {recentStations.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent & Suburban Hubs
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recentStations.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStation(st)}
                        className="text-left p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition flex items-center gap-2 text-xs font-semibold text-[#1B254B]"
                      >
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-bold text-[10px]">
                          {st.station_code}
                        </span>
                        <span className="truncate">{st.station_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {popularStations.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Major Railway Terminals & Junctions
                  </div>
                  <div className="space-y-1">
                    {popularStations.map((st, idx) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStation(st)}
                        className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition ${
                          idx === selectedIndex ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'text-[#1B254B]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.station_code}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{st.station_name}</div>
                            <div className="text-xs text-slate-400">{st.city}, {st.state}</div>
                          </div>
                        </div>
                        {st.suburban_line && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {st.suburban_line}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
