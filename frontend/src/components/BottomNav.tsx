import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, User as UserIcon, Menu } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { MenuDrawer } from './MenuDrawer';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { id: 'home', path: '/', label: t('home'), icon: Home },
    { id: 'bookings', path: '/bookings', label: t('myBookings'), icon: Ticket },
    { id: 'you', path: '/profile', label: t('you'), icon: UserIcon },
    { id: 'menu', action: () => setShowMenu(true), label: t('menu'), icon: Menu },
  ];

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0868F7] text-white shadow-[0_-4px_24px_rgba(8,104,247,0.3)] transition-all"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="max-w-[480px] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.path 
              ? (item.path === '/' ? location.pathname === '/' || location.pathname === '/home' : location.pathname.startsWith(item.path))
              : false;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 group ${
                  isActive ? 'text-white font-bold' : 'text-blue-100/80 hover:text-white'
                }`}
                aria-label={item.label}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-white/20 text-white shadow-2xs' : 'text-blue-100/90 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-extrabold text-white' : 'font-medium text-blue-100'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
};
