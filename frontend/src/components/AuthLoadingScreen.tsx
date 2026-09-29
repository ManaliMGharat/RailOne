import React from 'react';
import { RailOneLogo } from './RailOneLogo';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="space-y-4 flex flex-col items-center">
        <RailOneLogo size="lg" />
        <div className="flex items-center gap-2.5 text-[#0868F7] font-semibold text-xs tracking-wide">
          <div className="w-4 h-4 rounded-full border-2 border-[#0868F7] border-t-transparent animate-spin" />
          <span>Connecting to RailOne Indian Railways...</span>
        </div>
      </div>
    </div>
  );
};
