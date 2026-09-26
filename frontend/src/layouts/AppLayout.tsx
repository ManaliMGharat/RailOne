import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area: Responsive container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-12">
        <Outlet />
      </main>

      {/* Mobile-first Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
