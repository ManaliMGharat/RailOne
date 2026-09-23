import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftRight, Calendar, Users, Briefcase, Search, MapPin, ChevronDown 
} from 'lucide-react';
import api from '../services/api';
import { Station } from '../types';

interface SearchBoxProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialClass?: string;
  initialPassengers?: number;
  compact?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  initialFrom = 'CSMT',
  initialTo = 'NDLS',
  initialDate = '',
  initialClass = 'ALL',
  initialPassengers = 1,
  compact = false,
}) => {
  const navigate = useNavigate();

  // Format default tomorrow date if empty
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [journeyDate, setJourneyDate] = useState(initialDate || getDefaultDate());
  const [travelClass, setTravelClass] = useState(initialClass);
  const [passengers, setPassengers] = useState(initialPassengers);

  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    if (initialFrom) setFromStation(initialFrom);
    if (initialTo) setToStation(initialTo);
    if (initialDate) setJourneyDate(initialDate);
    if (initialClass) setTravelClass(initialClass);
  }, [initialFrom, initialTo, initialDate, initialClass]);

  const fetchStations = async (query: string, isFrom: boolean) => {
    if (!query || query.length < 1) {
      if (isFrom) setFromSuggestions([]);
      else setToSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/stations/search?q=${encodeURIComponent(query)}&limit=6`);
      if (isFrom) {
        setFromSuggestions(res.data);
        setShowFromDropdown(true);
      } else {
        setToSuggestions(res.data);
        setShowToDropdown(true);
      }
    } catch {
      // Ignored
    }
  };

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const setRelativeDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setJourneyDate(d.toISOString().split('T')[0]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStation || !toStation) return;
    navigate(`/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${journeyDate}&class=${travelClass}&passengers=${passengers}`);
  };

  const classesList = [
    { code: 'ALL', label: 'All Classes' },
    { code: '1A', label: 'AC First Class (1A)' },
    { code: '2A', label: 'AC 2 Tier (2A)' },
    { code: '3A', label: 'AC 3 Tier (3A)' },
    { code: 'CC', label: 'AC Chair Car (CC)' },
    { code: 'SL', label: 'Sleeper (SL)' },
    { code: '2S', label: 'Second Sitting (2S)' },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-100 ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Stations Row */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* FROM */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              From Station
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5 text-rail-600" />
              </div>
              <input
                type="text"
                value={fromStation}
                onChange={(e) => {
                  setFromStation(e.target.value);
                  fetchStations(e.target.value, true);
                }}
                onFocus={() => fetchStations(fromStation, true)}
                placeholder="Station Code or City (e.g., CSMT, Mumbai)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-rail-500 focus:border-rail-500 transition-all uppercase"
                required
              />
            </div>

            {/* Suggestions Dropdown */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {fromSuggestions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setFromStation(s.code);
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-rail-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{s.code}</span>
                      <span className="text-xs text-slate-600 ml-2">{s.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{s.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex justify-center -my-1 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rail-100 text-slate-600 hover:text-rail-700 flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95 border border-slate-200"
              title="Reverse Journey Stations"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              To Station
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>
              <input
                type="text"
                value={toStation}
                onChange={(e) => {
                  setToStation(e.target.value);
                  fetchStations(e.target.value, false);
                }}
                onFocus={() => fetchStations(toStation, false)}
                placeholder="Station Code or City (e.g., NDLS, Delhi)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-rail-500 focus:border-rail-500 transition-all uppercase"
                required
              />
            </div>

            {/* Suggestions Dropdown */}
            {showToDropdown && toSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {toSuggestions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setToStation(s.code);
                      setShowToDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-rail-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{s.code}</span>
                      <span className="text-xs text-slate-600 ml-2">{s.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{s.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date, Class, Passengers Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Journey Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Journey Date
              </label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setRelativeDate(0)}
                  className="text-[10px] text-rail-600 hover:text-rail-800 font-bold bg-rail-50 px-1.5 py-0.5 rounded"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(1)}
                  className="text-[10px] text-rail-600 hover:text-rail-800 font-bold bg-rail-50 px-1.5 py-0.5 rounded"
                >
                  Tmrw
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4 text-rail-600" />
              </div>
              <input
                type="date"
                value={journeyDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-rail-500"
                required
              />
            </div>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Class
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4 text-rail-600" />
              </div>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-rail-500 appearance-none"
              >
                {classesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Passengers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4 text-rail-600" />
              </div>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-rail-500 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rail-600 to-rail-700 hover:from-rail-700 hover:to-rail-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm h-[42px]"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH TRAINS</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
