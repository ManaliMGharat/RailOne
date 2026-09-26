import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Language } from '../types';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(15); // Default 15 as requested in Section 5

  useEffect(() => {
    // Only fetch dynamic count if authenticated (Section 34 requirement: "Do not poll notification API when user has no authentication token.")
    if (token) {
      apiClient<{ unread_count: number }>('/notifications/unread-count')
        .then((res) => {
          setUnreadCount(res.unread_count);
        })
        .catch(() => {
          // keep fallback 15 on error
        });
    }
  }, [token]);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Circular Language Switcher (A / अ) */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label="Switch Language"
            className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1B254B] font-semibold text-xs transition active:scale-95 shadow-xs"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
              A/अ
            </span>
            <span className="hidden sm:inline font-medium uppercase text-[11px]">
              {language}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showLangMenu && (
            <div className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                    language === l.code ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-[#1B254B]'
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-xs text-slate-400">({l.label})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CENTER: RailOne Geometric Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-98 transition"
        >
          {/* Geometric Diamond & Rail Track SVG Logo */}
          <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 rounded-xl shadow-md shadow-blue-500/20 text-white">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="16" rx="2" />
              <path d="M4 11h16" />
              <path d="M12 3v8" />
              <path d="m8 19-2 3" />
              <path d="m16 19 2 3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1B254B] leading-none">
              Rail<span className="text-blue-600">One</span>
            </span>
            <span className="text-[9px] font-medium text-slate-400 tracking-wider hidden sm:block uppercase">
              Simplified
            </span>
          </div>
        </div>

        {/* RIGHT: Dynamic Notification Bell */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-[#1B254B] transition active:scale-95"
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[19px] h-[19px] px-1 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Quick User Avatar if logged in */}
          {user ? (
            <div
              onClick={() => navigate('/profile')}
              className="cursor-pointer w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 hover:ring-2 hover:ring-blue-300 transition"
              title={user.full_name}
            >
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
