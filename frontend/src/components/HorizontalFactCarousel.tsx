import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Sparkles, Train, Mountain, Globe2 } from 'lucide-react';

export const HorizontalFactCarousel: React.FC = () => {
  const { t } = useTranslation();

  const facts = [
    {
      id: 1,
      title: 'First Indian Passenger Train',
      text: 'First ever passenger train was run between Bori Bandar to Thane on April 16, 1853.',
      badge: 'Historical Heritage',
      icon: Train,
      gradient: 'from-amber-700 via-orange-800 to-amber-950',
      accent: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
      illustration: (
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full opacity-25">
          <rect x="20" y="45" width="85" height="35" rx="6" fill="currentColor" />
          <rect x="105" y="55" width="40" height="25" rx="4" fill="currentColor" />
          <circle cx="45" cy="82" r="10" stroke="currentColor" strokeWidth="4" />
          <circle cx="85" cy="82" r="10" stroke="currentColor" strokeWidth="4" />
          <circle cx="125" cy="82" r="8" stroke="currentColor" strokeWidth="4" />
          <path d="M40 45 L50 25 L65 25 L60 45 Z" fill="currentColor" />
          <circle cx="55" cy="18" r="4" fill="currentColor" />
          <circle cx="68" cy="12" r="6" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'World’s Highest Railway Bridge',
      text: "Chenab Railway Bridge in Dharot, Jammu & Kashmir is the World's highest Railway Bridge.",
      badge: 'Engineering Marvel',
      icon: Mountain,
      gradient: 'from-blue-900 via-indigo-900 to-slate-950',
      accent: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
      illustration: (
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full opacity-25">
          <path d="M10 80 Q80 20 150 80" stroke="currentColor" strokeWidth="6" />
          <line x1="10" y1="40" x2="150" y2="40" stroke="currentColor" strokeWidth="4" />
          <line x1="45" y1="40" x2="45" y2="55" stroke="currentColor" strokeWidth="2.5" />
          <line x1="80" y1="40" x2="80" y2="30" stroke="currentColor" strokeWidth="2.5" />
          <line x1="115" y1="40" x2="115" y2="55" stroke="currentColor" strokeWidth="2.5" />
          <path d="M0 100 L40 60 L80 100" fill="currentColor" />
          <path d="M80 100 L120 55 L160 100" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Global Railway Network',
      text: 'Indian Railways is the 4th largest railway network in the world, with over 68,000 route kilometers.',
      badge: 'Lifeline of the Nation',
      icon: Globe2,
      gradient: 'from-emerald-900 via-teal-950 to-slate-950',
      accent: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
      illustration: (
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full opacity-25">
          <circle cx="80" cy="50" r="35" stroke="currentColor" strokeWidth="4" />
          <path d="M50 50 C50 30 110 30 110 50 C110 70 50 70 50 50" stroke="currentColor" strokeWidth="2" />
          <line x1="45" y1="50" x2="115" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="80" y1="15" x2="80" y2="85" stroke="currentColor" strokeWidth="3" />
        </svg>
      )
    }
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold text-[#172B63] flex items-center gap-1.5">
          <span>{t('doYouKnow')}</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h2>
        <span className="text-[11px] font-semibold text-slate-400">
          Swipe left / right
        </span>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div
              key={fact.id}
              className={`snap-center shrink-0 w-[280px] sm:w-[320px] rounded-3xl p-5 text-white bg-gradient-to-br ${fact.gradient} relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[160px] border border-white/10`}
            >
              <div className="absolute right-0 bottom-0 w-36 h-28 pointer-events-none text-white">
                {fact.illustration}
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fact.accent}`}>
                    {fact.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-white/95 pr-6">
                  "{fact.text}"
                </p>
              </div>

              <div className="relative z-10 pt-2 flex items-center gap-2 text-[10px] font-bold text-white/70">
                <Icon className="w-3.5 h-3.5" />
                <span>Indian Railways Archives</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
