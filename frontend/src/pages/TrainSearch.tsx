import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Train as TrainIcon, Filter, AlertCircle, RefreshCw, Calendar, 
  MapPin, Clock, ArrowRight, ShieldCheck 
} from 'lucide-react';
import api from '../services/api';
import { TrainSearchResult } from '../types';
import { TrainCard } from '../components/TrainCard';
import { SearchBox } from '../components/SearchBox';

export const TrainSearch: React.FC = () => {
  const [searchParams] = useSearchParams();

  const fromParam = searchParams.get('from') || 'CSMT';
  const toParam = searchParams.get('to') || 'NDLS';
  const dateParam = searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const classParam = searchParams.get('class') || 'ALL';
  const passengersParam = Number(searchParams.get('passengers')) || 1;

  const [trains, setTrains] = useState<TrainSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(classParam);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'departure' | 'duration' | 'fare'>('departure');

  useEffect(() => {
    fetchTrains();
  }, [fromParam, toParam, dateParam, classParam]);

  const fetchTrains = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/trains/search', {
        params: {
          from_station: fromParam,
          to_station: toParam,
          journey_date: dateParam,
          travel_class: classParam !== 'ALL' ? classParam : undefined,
        },
      });
      setTrains(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search trains. Please verify station names.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort trains
  const filteredTrains = trains
    .filter((t) => {
      if (selectedClassFilter !== 'ALL') {
        const hasClass = t.classes.some((c) => c.class_code === selectedClassFilter);
        if (!hasClass) return false;
      }
      if (selectedTypeFilter !== 'ALL') {
        if (!t.train_type.toLowerCase().includes(selectedTypeFilter.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'departure') {
        return a.departure_time.localeCompare(b.departure_time);
      }
      if (sortBy === 'duration') {
        return a.duration.localeCompare(b.duration);
      }
      if (sortBy === 'fare') {
        return a.min_fare - b.min_fare;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search Refinement Panel */}
      <div className="no-print">
        <SearchBox
          initialFrom={fromParam}
          initialTo={toParam}
          initialDate={dateParam}
          initialClass={classParam}
          initialPassengers={passengersParam}
          compact={true}
        />
      </div>

      {/* Main Results & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-rail-600" />
                Filter Results
              </span>
              <button
                onClick={() => {
                  setSelectedClassFilter('ALL');
                  setSelectedTypeFilter('ALL');
                  setSortBy('departure');
                }}
                className="text-xs text-rail-600 hover:text-rail-800 font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'departure', label: 'Departure Time (Earliest)' },
                  { id: 'duration', label: 'Travel Duration (Shortest)' },
                  { id: 'fare', label: 'Fare (Lowest first)' },
                ].map((s) => (
                  <label key={s.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={sortBy === s.id}
                      onChange={() => setSortBy(s.id as any)}
                      className="text-rail-600 focus:ring-rail-500"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter by Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Travel Class
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['ALL', '1A', '2A', '3A', 'CC', 'SL', '2S'].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedClassFilter(c)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                      selectedClassFilter === c
                        ? 'bg-rail-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'ALL' ? 'All Classes' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Train Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Train Type
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'ALL', label: 'All Train Types' },
                  { id: 'Rajdhani', label: 'Rajdhani Express' },
                  { id: 'Vande Bharat', label: 'Vande Bharat' },
                  { id: 'Shatabdi', label: 'Shatabdi Express' },
                  { id: 'Superfast', label: 'Superfast Express' },
                ].map((t) => (
                  <label key={t.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="trainType"
                      checked={selectedTypeFilter === t.id}
                      onChange={() => setSelectedTypeFilter(t.id)}
                      className="text-rail-600 focus:ring-rail-500"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Train Results List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Summary */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
            <div>
              <div className="flex items-center space-x-2 text-sm font-black text-slate-900">
                <span>{fromParam}</span>
                <span className="text-slate-400">→</span>
                <span>{toParam}</span>
                <span className="text-xs font-medium text-slate-500 ml-2">
                  • {new Date(dateParam).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredTrains.length} {filteredTrains.length === 1 ? 'train' : 'trains'} available for this route
              </p>
            </div>
            <button
              onClick={fetchTrains}
              className="flex items-center space-x-1 text-xs text-rail-600 hover:text-rail-800 font-semibold self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Search Error</h4>
                <p className="text-xs mt-1 text-rose-700">{error}</p>
                <button
                  onClick={fetchTrains}
                  className="mt-3 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTrains.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <TrainIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Trains Found for This Selection</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't find any direct or intermediate trains between <span className="font-bold text-slate-700">{fromParam}</span> and <span className="font-bold text-slate-700">{toParam}</span> on the selected date.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedClassFilter('ALL');
                    setSelectedTypeFilter('ALL');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => {
                    const nextDay = new Date(dateParam);
                    nextDay.setDate(nextDay.getDate() + 1);
                    const nextDayStr = nextDay.toISOString().split('T')[0];
                    window.location.search = `?from=${fromParam}&to=${toParam}&date=${nextDayStr}&class=${classParam}&passengers=${passengersParam}`;
                  }}
                  className="px-4 py-2 bg-rail-600 hover:bg-rail-700 text-white text-xs font-semibold rounded-xl"
                >
                  Check Next Day
                </button>
              </div>
            </div>
          )}

          {/* Train Cards List */}
          {!loading && !error && filteredTrains.length > 0 && (
            <div className="space-y-4">
              {filteredTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  journeyDate={dateParam}
                  passengersCount={passengersParam}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
