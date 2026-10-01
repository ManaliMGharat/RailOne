import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Language } from '../types';
import { RailOneLogo } from './RailOneLogo';

export const Header: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await apiClient<{ unread_count: number }>('/notifications/unread-count');
      setUnreadCount(res.unread_count);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Listen for custom notifications update events
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('notifications:updated', handleUpdate);
    return () => window.removeEventListener('notifications:updated', handleUpdate);
  }, [token]);

  // Handle outside click and Escape key to close language dropdown (BUG_001)
  useEffect(() => {
    if (!showLangMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLangMenu]);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-[480px] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEFT: Circular Language Button (A / अ) */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label="Switch Language"
            aria-expanded={showLangMenu}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[#172B63] transition active:scale-95 shadow-xs"
          >
            <div className="flex flex-col items-center leading-none select-none">
              <span className="text-[11px] font-extrabold text-[#172B63]">A</span>
              <span className="text-[10px] font-bold text-[#172B63]">अ</span>
            </div>
          </button>

          {showLangMenu && (
            <div className="absolute left-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    language === l.code ? 'font-bold text-[#0868F7] bg-blue-50/50' : 'text-[#172B63]'
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[10px] text-slate-400">({l.label})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CENTER: RailOne Logo with accent dot above 'i' */}
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer select-none active:scale-98 transition flex items-center justify-center py-1"
        >
          <RailOneLogo size="md" />
        </div>

        {/* RIGHT: Circular Notification Button with dynamic red badge */}
        <div className="relative">
          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[#172B63] transition active:scale-95 shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#172B63]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
