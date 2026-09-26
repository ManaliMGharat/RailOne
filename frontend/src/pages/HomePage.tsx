import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Train,
  Ticket,
  MapPin,
  Search,
  RotateCw,
  Utensils,
  Calendar,
  Headphones,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Station } from '../types';
import { StationAutocomplete, StationSwapButton } from '../components/StationAutocomplete';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick journey planner state
  const [fromStation, setFromStation] = useState<Station | null>({
    id: 5,
    station_code: 'MMCT',
    station_name: 'Mumbai Central',
    city: 'Mumbai',
    state: 'Maharashtra',
    railway_zone: 'WR',
    active: true,
  });

  const [toStation, setToStation] = useState<Station | null>({
    id: 101,
    station_code: 'PUNE',
    station_name: 'Pune Junction',
    city: 'Pune',
    state: 'Maharashtra',
    railway_zone: 'CR',
    active: true,
  });

  const [journeyDate, setJourneyDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });

  const [classType, setClassType] = useState<string>('ALL');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    setValidationError(null);
  };

  const handleSearchTrains = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStation || !toStation) {
      setValidationError('Please select both origin and destination stations.');
      return;
    }
    if (fromStation.station_code === toStation.station_code) {
      setValidationError('Origin and destination cannot be the same station.');
      return;
    }
    setValidationError(null);
    navigate(`/reserved?from=${fromStation.station_code}&to=${toStation.station_code}&date=${journeyDate}&class=${classType}`);
  };

  // 8 Pastel More Offerings
  const offerings = [
    {
      id: 'search-trains',
      title: t('searchTrains'),
      desc: 'All express & local schedules',
      icon: Search,
      bg: 'bg-pastel-blue text-blue-700',
      path: '/trains',
    },
    {
      id: 'pnr-status',
      title: t('pnrStatus'),
      desc: 'Live 10-digit reservation status',
      icon: Ticket,
      bg: 'bg-pastel-purple text-purple-700',
      path: '/pnr',
    },
    {
      id: 'coach-position',
      title: t('coachPosition'),
      desc: 'Platform rake composition',
      icon: Train,
      bg: 'bg-pastel-emerald text-emerald-700',
      path: '/coach-position',
    },
    {
      id: 'track-train',
      title: t('trackTrain'),
      desc: 'Live GPS delay & next stops',
      icon: Compass,
      bg: 'bg-pastel-amber text-amber-700',
      path: '/track',
    },
    {
      id: 'order-food',
      title: t('orderFood'),
      desc: 'Seat delivery from IRCTC kitchen',
      icon: Utensils,
      bg: 'bg-pastel-orange text-orange-700',
      path: '/food',
    },
    {
      id: 'file-refund',
      title: t('fileRefund'),
      desc: 'Instant wallet cancellation refund',
      icon: RotateCw,
      bg: 'bg-pastel-rose text-rose-700',
      path: '/refunds',
    },
    {
      id: 'season-ticket',
      title: t('seasonTicket'),
      desc: 'Monthly & quarterly digital pass',
      icon: Calendar,
      bg: 'bg-pastel-indigo text-indigo-700',
      path: '/season',
    },
    {
      id: 'railway-support',
      title: t('railwaySupport'),
      desc: '24x7 RailMadad assistance & FAQ',
      icon: Headphones,
      bg: 'bg-pastel-teal text-teal-700',
      path: '/support',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Personalized Greeting Header */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Official Indian Railways Companion
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B254B] tracking-tight">
            {user ? `Hi, ${user.full_name}!` : 'Hi, Manali Manish Gharat!'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('headerSubtitle')}
          </p>
        </div>

        {/* Quick status pill / Nerul-Uran spotlight */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-blue-50/80 border border-blue-200/70 px-3.5 py-2 rounded-2xl text-xs font-semibold text-blue-900 shadow-2xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span>Mumbai Suburban & Nerul-Uran Corridor Live</span>
        </div>
      </section>

      {/* QUICK JOURNEY PLANNER SEARCH FORM */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSearchTrains} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 relative">
            <StationAutocomplete
              label={t('from')}
              station={fromStation}
              onSelect={setFromStation}
              excludeCode={toStation?.station_code}
              placeholder="Source Station (e.g. MMCT)"
            />

            <StationSwapButton onSwap={handleSwapStations} />

            <StationAutocomplete
              label={t('to')}
              station={toStation}
              onSelect={setToStation}
              excludeCode={fromStation?.station_code}
              placeholder="Destination Station (e.g. PUNE)"
            />
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
              {validationError}
            </div>
          )}

          {/* Date & Class Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={journeyDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50/70 border border-slate-200 text-sm font-semibold text-[#1B254B] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t('class')}
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50/70 border border-slate-200 text-sm font-semibold text-[#1B254B] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="ALL">All Classes (ALL)</option>
                <option value="1A">AC First Class (1A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="3E">AC 3 Economy (3E)</option>
                <option value="CC">AC Chair Car (CC)</option>
                <option value="EC">Executive Chair Car (EC)</option>
                <option value="SL">Sleeper Class (SL)</option>
                <option value="2S">Second Sitting (2S)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{t('search')} Trains</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* SECTION 6: JOURNEY PLANNER — 3 LARGE CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
            {t('journeyPlanner')}
          </h2>
          <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
            View All Modes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. RESERVED CARD */}
          <div
            onClick={() => navigate('/reserved')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] active:scale-99 border border-blue-900/40"
          >
            {/* Background SVG Motif representing modern coach interior with mountains & tea table */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full object-cover">
                {/* Mountain Silhouette in window */}
                <path d="M40 130 L90 50 L140 130 Z" fill="currentColor" />
                <path d="M100 130 L150 70 L200 130 Z" fill="currentColor" />
                {/* Train Window Frame */}
                <rect x="20" y="30" width="160" height="110" rx="16" stroke="currentColor" strokeWidth="6" />
                {/* Tea Table with cup */}
                <rect x="40" y="150" width="120" height="12" rx="4" fill="currentColor" />
                <rect x="85" y="138" width="16" height="12" rx="3" fill="currentColor" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold tracking-wider uppercase mb-3 border border-blue-400/20">
                Premium Intercity
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
                {t('reserved')}
              </h3>
              <p className="text-xs text-blue-200/80 leading-relaxed max-w-[240px]">
                {t('reservedDesc')}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-white transition">
              <span>Book Confirmed Berths</span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 flex items-center justify-center transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. UNRESERVED / UTS CARD */}
          <div
            onClick={() => navigate('/unreserved')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-sky-950 to-slate-900 text-white p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] active:scale-99 border border-indigo-800/40"
          >
            {/* Background SVG Motif representing commuter/suburban coach */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full object-cover">
                <rect x="20" y="40" width="160" height="120" rx="12" stroke="currentColor" strokeWidth="6" />
                <circle cx="70" cy="90" r="14" fill="currentColor" />
                <circle cx="130" cy="90" r="14" fill="currentColor" />
                <path d="M50 140 C50 115 90 115 90 140" fill="currentColor" />
                <path d="M110 140 C110 115 150 115 150 140" fill="currentColor" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold tracking-wider uppercase mb-3 border border-sky-400/20">
                Suburban & Local
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
                {t('unreserved')}
              </h3>
              <p className="text-xs text-sky-200/80 leading-relaxed max-w-[240px]">
                {t('unreservedDesc')}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-white transition">
              <span>Quick Paperless UTS</span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-sky-500 flex items-center justify-center transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. PLATFORM CARD */}
          <div
            onClick={() => navigate('/platform')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] active:scale-99 border border-emerald-800/40"
          >
            {/* Background SVG Motif representing railway platform & overhead canopy */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full object-cover">
                <path d="M20 50 L180 30 L180 50 L20 70 Z" fill="currentColor" />
                <line x1="60" y1="65" x2="60" y2="160" stroke="currentColor" strokeWidth="6" />
                <line x1="140" y1="55" x2="140" y2="160" stroke="currentColor" strokeWidth="6" />
                <rect x="20" y="160" width="160" height="20" rx="4" fill="currentColor" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase mb-3 border border-emerald-400/20">
                Station Access
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
                {t('platform')}
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed max-w-[240px]">
                {t('platformDesc')}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-white transition">
              <span>Get 2-Hour QR Pass</span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-emerald-600 flex items-center justify-center transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: MORE OFFERINGS (8 PASTEL ROUNDED/SQUIRCLE CARDS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
            {t('moreOfferings')}
          </h2>
          <span className="text-xs font-semibold text-slate-400">8 Services</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group p-4 sm:p-5 rounded-3xl bg-white border border-slate-100/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-97"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${item.bg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B254B] group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MUMBAI SUBURBAN NETWORK DIRECTORY BANNER */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold tracking-wider uppercase mb-2">
            Local Railway Hub
          </span>
          <h3 className="text-xl font-extrabold">Mumbai Suburban & Nerul–Uran Route</h3>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            Access 210+ stations across Western, Central, Harbour, and the complete Nerul–Uran line (Kharkopar, Nhava Sheva, Dronagiri, Uran).
          </p>
        </div>
        <button
          onClick={() => navigate('/unreserved')}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold text-xs hover:bg-blue-50 active:scale-95 transition shrink-0 shadow-xs"
        >
          Open Suburban UTS
        </button>
      </section>

    </div>
  );
};
