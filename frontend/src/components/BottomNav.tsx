import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, Wallet as WalletIcon, User as UserIcon } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/bookings', label: t('bookings'), icon: Ticket },
    { path: '/wallet', label: t('wallet'), icon: WalletIcon },
    { path: '/profile', label: t('profile'), icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 py-1.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] sm:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
