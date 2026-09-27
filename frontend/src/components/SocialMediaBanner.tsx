import React from 'react';
import { useTranslation } from '../context/LanguageContext';

export const SocialMediaBanner: React.FC = () => {
  const { t } = useTranslation();

  const socialLinks = [
    {
      name: 'X (Twitter)',
      url: 'https://twitter.com/RailMinIndia',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: 'hover:bg-black',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/RailMinIndia',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: 'hover:bg-[#1877F2]',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/railminindia',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      bg: 'hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@RailMinIndia',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      bg: 'hover:bg-[#FF0000]',
    },
  ];

  return (
    <section className="space-y-3 pt-1">
      <h2 className="text-sm font-extrabold text-[#172B63] px-1">
        {t('followUs')}
      </h2>

      {/* Large rounded railway banner with overlay */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-md border border-slate-100 flex flex-col justify-between min-h-[170px]">
        {/* Background Stylized Railway SVG Track & Horizon */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg viewBox="0 0 400 200" fill="none" className="w-full h-full object-cover">
            <line x1="200" y1="20" x2="60" y2="200" stroke="currentColor" strokeWidth="4" />
            <line x1="200" y1="20" x2="340" y2="200" stroke="currentColor" strokeWidth="4" />
            <line x1="170" y1="60" x2="230" y2="60" stroke="currentColor" strokeWidth="3" />
            <line x1="140" y1="100" x2="260" y2="100" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="150" x2="300" y2="150" stroke="currentColor" strokeWidth="6" />
          </svg>
        </div>

        <div className="relative z-10 space-y-1">
          <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-sky-200 text-[10px] font-bold uppercase tracking-wider border border-white/10">
            Connect With Indian Railways
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Stay Connected On The Go
          </h3>
          <p className="text-xs text-blue-200/80 max-w-sm">
            Follow official updates, new train announcements, schedule revisions, and passenger safety tips.
          </p>
        </div>

        {/* Social Icons row */}
        <div className="relative z-10 pt-4 flex items-center gap-3">
          {socialLinks.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 active:scale-95 border border-white/20 shadow-xs ${item.bg}`}
              title={item.name}
              aria-label={item.name}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
