import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Film, Music, Radio, ExternalLink, Info } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const WavesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[480px] mx-auto py-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition active:scale-95"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[#172B63] leading-tight">
            WAVES Portal
          </h1>
          <p className="text-xs text-slate-400">
            World Audio Visual & Entertainment Summit & Onboard Media
          </p>
        </div>
      </div>

      {/* Official Information Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B1C54] via-[#4A154B] to-[#1E0E30] text-white p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>Indian Railways Digital Initiative</span>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Welcome to WAVES
          </h2>
          <p className="text-xs text-purple-200/90 leading-relaxed">
            WAVES connects passengers with onboard infotainment, cultural railway archives, audio-visual storytelling, and regional railway heritage broadcasts.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-amber-200 text-[11px] font-bold border border-white/10">
            Preview Mode • Digital Station Lounge
          </span>
        </div>
      </div>

      {/* Informational Disclaimer as required by Section 22 */}
      <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/70 text-purple-900 text-xs flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official Railway Notice:</strong> This is the dedicated RailOne WAVES landing section. Live railway streaming servers and regional summit feeds are activated automatically when connected to onboard train Wi-Fi gateways.
        </p>
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-xs text-[#172B63]">Cinema & Heritage</h3>
          <p className="text-[11px] text-slate-400">Archival documentaries and Indian railway history reels.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-xs text-[#172B63]">Station Radio</h3>
          <p className="text-[11px] text-slate-400">Curated soothing music and station public broadcasts.</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full py-3.5 rounded-2xl bg-[#0868F7] text-white font-bold text-xs hover:bg-blue-700 transition"
      >
        Return to Home
      </button>

    </div>
  );
};
