import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Train,
  Ticket,
  MapPin,
  Utensils,
  Wallet as WalletIcon,
  RotateCw,
  Headphones,
  Compass,
  Calendar,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Journey & Booking',
      items: [
        { label: t('reserved'), path: '/reserved', icon: Train, badge: 'Intercity' },
        { label: t('unreserved'), path: '/unreserved', icon: Ticket, badge: 'UTS Local' },
        { label: t('platform'), path: '/platform', icon: MapPin },
        { label: t('seasonTicket'), path: '/season', icon: Calendar },
        { label: t('searchTrains'), path: '/trains', icon: Search },
      ],
    },
    {
      title: 'Status & Tracking',
      items: [
        { label: t('pnrStatus'), path: '/pnr', icon: Ticket },
        { label: t('coachPosition'), path: '/coach-position', icon: Layers },
        { label: t('trackTrain'), path: '/track', icon: Compass },
      ],
    },
    {
      title: 'Services & Support',
      items: [
        { label: t('orderFood'), path: '/food', icon: Utensils },
        { label: t('wallet'), path: '/wallet', icon: WalletIcon },
        { label: t('fileRefund'), path: '/refunds', icon: RotateCw },
        { label: t('railMadad'), path: '/support', icon: Headphones },
        { label: t('goToWaves'), path: '/waves', icon: Sparkles },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-[28px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#0868F7] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#172B63] leading-tight">
                {user?.full_name || 'RailOne Passenger'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {user?.email || 'Your journey, simplified.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                {section.title}
              </h4>
              <div className="bg-slate-50/70 rounded-2xl p-1 border border-slate-100 divide-y divide-slate-100/80">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-white rounded-xl transition text-left text-xs font-semibold text-[#172B63] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-blue-50 text-[#0868F7] flex items-center justify-center border border-slate-100 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0868F7]">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin link if user is admin */}
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavigate('/admin')}
              className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-between hover:bg-amber-100 transition"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Railway Admin Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </button>
          )}

          {/* Logout button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="w-full py-3 rounded-2xl bg-[#0868F7] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <span>Login to RailOne</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
