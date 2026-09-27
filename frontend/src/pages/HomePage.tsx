import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Train,
  Ticket,
  MapPin,
  Search,
  RotateCw,
  Utensils,
  Headphones,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { HorizontalFactCarousel } from '../components/HorizontalFactCarousel';
import { SocialMediaBanner } from '../components/SocialMediaBanner';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic user greeting name
  const greetingName = user?.full_name || 'Manali Manish Gharat';

  // 1. Journey Planner: 3 Large Cards in One Horizontal Row
  const journeyCards = [
    {
      id: 'reserved',
      title: 'Reserved',
      subtitle: 'Book Train',
      path: '/reserved',
      color: 'bg-white hover:bg-slate-50 border-slate-100',
      badge: 'Intercity',
      badgeBg: 'bg-blue-50 text-[#0868F7]',
      icon: (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-[#0868F7] flex items-center justify-center shadow-xs">
          <Train className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>
      ),
    },
    {
      id: 'unreserved',
      title: 'Unreserved',
      subtitle: 'UTS Ticket',
      path: '/unreserved',
      color: 'bg-white hover:bg-slate-50 border-slate-100',
      badge: 'Suburban',
      badgeBg: 'bg-sky-50 text-sky-600',
      icon: (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
          <Ticket className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>
      ),
    },
    {
      id: 'platform',
      title: 'Platform',
      subtitle: 'Station Pass',
      path: '/platform',
      color: 'bg-white hover:bg-slate-50 border-slate-100',
      badge: '2-Hr Pass',
      badgeBg: 'bg-emerald-50 text-emerald-600',
      icon: (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <MapPin className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>
      ),
    },
  ];

  // 2. More Offerings: 8 Pastel Responsive Tiles
  const offerings = [
    {
      id: 'search-trains',
      title: t('searchTrains'),
      desc: 'Schedules & fares',
      icon: Search,
      bg: 'bg-[#FCE7F3]',
      text: 'text-[#BE185D]',
      iconColor: 'text-[#BE185D]',
      path: '/trains',
    },
    {
      id: 'pnr-status',
      title: t('pnrStatus'),
      desc: '10-digit status',
      icon: Ticket,
      bg: 'bg-[#D1FAE5]',
      text: 'text-[#047857]',
      iconColor: 'text-[#047857]',
      path: '/pnr',
    },
    {
      id: 'coach-position',
      title: t('coachPosition'),
      desc: 'Rake formation',
      icon: Layers,
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#0369A1]',
      iconColor: 'text-[#0369A1]',
      path: '/coach-position',
    },
    {
      id: 'track-train',
      title: t('trackTrain'),
      desc: 'Live station GPS',
      icon: Compass,
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      iconColor: 'text-[#B45309]',
      path: '/track',
    },
    {
      id: 'order-food',
      title: t('orderFood'),
      desc: 'Onboard e-catering',
      icon: Utensils,
      bg: 'bg-[#EDE9FE]',
      text: 'text-[#6D28D9]',
      iconColor: 'text-[#6D28D9]',
      path: '/food',
    },
    {
      id: 'file-refund',
      title: t('fileRefund'),
      desc: 'Instant refund claim',
      icon: RotateCw,
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#475569]',
      iconColor: 'text-[#475569]',
      path: '/refunds',
    },
    {
      id: 'rail-madad',
      title: t('railMadad'),
      desc: '24x7 Grievance & FAQ',
      icon: Headphones,
      bg: 'bg-[#FFE4E6]',
      text: 'text-[#BE123C]',
      iconColor: 'text-[#BE123C]',
      path: '/support',
    },
    {
      id: 'waves',
      title: t('goToWaves'),
      desc: 'Onboard infotainment',
      icon: Sparkles,
      bg: 'bg-[#3B1C54]',
      text: 'text-white',
      iconColor: 'text-amber-300',
      path: '/waves',
    },
  ];

  return (
    <div className="w-full max-w-[480px] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 2. Personalized Greeting Header */}
      <section className="pt-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0868F7] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Railway Application</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172B63] tracking-tight">
          Hi, {greetingName}!
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
          {t('headerSubtitle')}
        </p>
      </section>

      {/* 3. JOURNEY PLANNER — 3 LARGE CARDS IN ONE HORIZONTAL ROW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172B63]">
            {t('journeyPlanner')}
          </h2>
          <span className="text-[11px] font-bold text-[#0868F7] cursor-pointer hover:underline" onClick={() => navigate('/reserved')}>
            All Modes
          </span>
        </div>

        {/* 3 Large Cards in One Horizontal Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {journeyCards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-pointer p-3 sm:p-5 flex flex-col items-center text-center justify-between min-h-[140px] sm:min-h-[160px] active:scale-97 select-none"
            >
              <div className="transition-transform duration-200 group-hover:scale-105">
                {card.icon}
              </div>

              <div className="w-full mt-2">
                <h3 className="font-black text-xs sm:text-sm text-[#172B63] leading-tight">
                  {card.title}
                </h3>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${card.badgeBg}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MORE OFFERINGS (8 PASTEL ROUNDED SQUIRCLE CARDS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172B63]">
            {t('moreOfferings')}
          </h2>
          <span className="text-[11px] font-bold text-slate-400">
            8 Offerings
          </span>
        </div>

        {/* 8-Tile Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group p-4 sm:p-5 rounded-3xl ${item.bg} border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[120px] active:scale-97 select-none`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-xs flex items-center justify-center ${item.iconColor} shadow-2xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${item.text}`} />
                </div>

                <div className="pt-2">
                  <h4 className={`font-extrabold text-xs sm:text-sm leading-tight ${item.text}`}>
                    {item.title}
                  </h4>
                  <p className={`text-[10px] sm:text-[11px] font-semibold opacity-75 mt-0.5 line-clamp-1 ${item.text}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DO YOU KNOW? (HORIZONTAL FACT CARDS) */}
      <HorizontalFactCarousel />

      {/* 6. FOLLOW US ON SOCIAL MEDIA PLATFORMS */}
      <SocialMediaBanner />

      {/* Subtle safety padding at bottom so content is never covered by bottom nav */}
      <div className="h-6" />

    </div>
  );
};
