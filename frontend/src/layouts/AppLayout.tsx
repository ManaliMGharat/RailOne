import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#0868F7] selection:text-white text-[#172B63]">
      {/* Top Header */}
      <Header />

      {/* Main Content Area: Responsive container matching mobile-first specifications */}
      <main className="flex-1 w-full max-w-[480px] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-24 sm:pb-28">
        <Outlet />
      </main>

      {/* Mobile-first Blue Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
